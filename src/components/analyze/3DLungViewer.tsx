"use client";

/**
 * 3D Lung Viewer — Image-based displacement approach
 *
 * Renders the ACTUAL uploaded scan as a 3D height-map:
 *  - The X-ray / CT image is the texture (it looks exactly like the scan)
 *  - Image brightness drives vertex displacement (lung tissue pops forward)
 *  - Full OrbitControls — drag, scroll, preset views
 *  - Grad-CAM overlay blended on demand
 *  - Auto-spin with pause-on-interaction
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

export interface LungViewerProps {
  imageUrl: string;
  modality: "xray" | "ct";
  scanId?: string;
  heatmapUrl?: string;
  onLoaded?: () => void;
  onError?: (msg: string) => void;
  className?: string;
  matRef?: React.RefObject<THREE.ShaderMaterial | null>;
  style?: React.CSSProperties;
}

type ViewPreset = "frontal" | "lao" | "rao" | "superior" | "inferior" | "iso";

const PRESET_POS: Record<ViewPreset, [number, number, number]> = {
  frontal:   [ 0,    0,   2.4],
  lao:       [-1.1,  0.2, 2.1], // Left Anterior Oblique (radiological oblique)
  rao:       [ 1.1,  0.2, 2.1], // Right Anterior Oblique (radiological oblique)
  superior:  [ 0,    1.0, 2.1], // Superior tilt view
  inferior:  [ 0,   -1.0, 2.1], // Inferior tilt view
  iso:       [ 0.9,  0.8, 1.9], // Three-quarter isometric perspective
};

const PRESET_BTNS: { label: string; preset: ViewPreset; icon: string }[] = [
  { label: "Frontal",   preset: "frontal",   icon: "☉" },
  { label: "L. Oblique", preset: "lao",       icon: "◸" },
  { label: "R. Oblique", preset: "rao",       icon: "◹" },
  { label: "Superior",  preset: "superior",  icon: "⌃" },
  { label: "Inferior",  preset: "inferior",  icon: "⌄" },
  { label: "3D Iso",    preset: "iso",       icon: "☖" },
];

/** Sample image pixels into a Float32Array of brightness values [0,1] */
function sampleBrightness(img: HTMLImageElement, res: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = res;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, res, res);
  const data = ctx.getImageData(0, 0, res, res).data;
  const out = new Float32Array(res * res);
  for (let i = 0; i < res * res; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    // Perceived luminance
    out[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return out;
}

/** Displace a PlaneGeometry's Z by a brightness map */
function applyDisplacement(
  geo: THREE.PlaneGeometry,
  brightness: Float32Array,
  res: number,
  strength: number,
): void {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    // PlaneGeometry UVs: x ∈ [-1,1], y ∈ [-1,1]
    const u = (pos.getX(i) + 1) / 2;           // [0,1]
    const v = 1 - (pos.getY(i) + 1) / 2;       // [0,1] top→bottom
    const px = Math.min(Math.floor(u * res), res - 1);
    const py = Math.min(Math.floor(v * res), res - 1);
    const lum = brightness[py * res + px];
    pos.setZ(i, lum * strength);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

export const ThreeDLungViewer: React.FC<LungViewerProps> = ({
  imageUrl, modality, scanId, heatmapUrl,
  onLoaded, onError, className, matRef, style,
}) => {
  const mountRef  = useRef<HTMLDivElement>(null);
  const rendRef   = useRef<THREE.WebGLRenderer | null>(null);
  const camRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const ctrlRef   = useRef<OrbitControls | null>(null);
  const matRef2   = useRef<THREE.MeshStandardMaterial | null>(null);
  const rafRef    = useRef<number | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sceneRef  = useRef<THREE.Scene | null>(null);
  const groupRef  = useRef<THREE.Group | null>(null);
  const laserRef  = useRef<THREE.Mesh | null>(null);

  const [loading,  setLoading]  = useState(true);
  const [progress, setProgress] = useState(0);
  const [heatOn,   setHeatOn]   = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [verts,    setVerts]    = useState<number | null>(null);

  const autoSpinRef = useRef(true);
  const heatRequestedRef = useRef(false);

  // Textures stored so we can swap them in/out
  const baseTex = useRef<THREE.Texture | null>(null);
  const heatTex = useRef<THREE.Texture | null>(null);

  /* ── Toggle Grad-CAM overlay ─────────────────────────────────────────── */
  const toggleHeat = useCallback(() => {
    setHeatOn(prev => {
      const next = !prev;
      heatRequestedRef.current = next;
      const mat = matRef2.current;
      if (mat) {
        if (next) {
          if (heatTex.current) {
            mat.map = heatTex.current;
            mat.emissive = new THREE.Color(0xffffff);
            mat.emissiveMap = heatTex.current;
            mat.emissiveIntensity = 0.7; // Vibrant bio-luminescent diagnostic glow!
            mat.roughness = 0.25;
            mat.metalness = 0.25;
          } else {
            console.log("[3D Lung Viewer] Grad-CAM requested, but texture is still loading...");
          }
        } else {
          mat.map = baseTex.current;
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveMap = null;
          mat.emissiveIntensity = 0.0;
          mat.roughness = 0.65;
          mat.metalness = 0.05;
        }
        mat.needsUpdate = true;
      }
      return next;
    });
  }, []);

  /* ── Toggle auto-spin ────────────────────────────────────────────────── */
  const toggleSpin = useCallback(() => {
    setAutoSpin(prev => {
      const next = !prev;
      autoSpinRef.current = next;
      return next;
    });
  }, []);

  /* ── Smooth fly-to preset ────────────────────────────────────────────── */
  const flyTo = useCallback((preset: ViewPreset) => {
    const cam  = camRef.current;
    const ctrl = ctrlRef.current;
    if (!cam || !ctrl) return;
    const [tx, ty, tz] = PRESET_POS[preset];
    const target = new THREE.Vector3(tx, ty, tz);
    const start  = cam.position.clone();
    let t = 0;
    const step = () => {
      t = Math.min(t + 0.05, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      cam.position.lerpVectors(start, target, ease);
      ctrl.update();
      if (t < 1) requestAnimationFrame(step);
    };
    step();
  }, []);

  /* ── Main Three.js setup ─────────────────────────────────────────────── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 520;

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040408);
    sceneRef.current = scene;

    /* Camera */
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100);
    camera.position.set(0, 0, 2.4);
    camRef.current = camera;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendRef.current = renderer;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xfdfbf7, 1.0);
    key.position.set(1, 2, 3); scene.add(key);
    const fill = new THREE.DirectionalLight(0x8bb8ff, 0.35);
    fill.position.set(-2, -1, -2); scene.add(fill);

    /* Subtle clinical grid backdrop for spatial reference */
    const gridHelper = new THREE.GridHelper(8, 40, 0x1A4F9E, 0x0c1c38);
    gridHelper.position.z = -0.55;
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    /* Model Group - holds mesh, backplate, laser and outlines */
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    groupRef.current = modelGroup;

    /* OrbitControls — clamped for clinical terminal view */
    const controls = new OrbitControls(camera, renderer.domElement);
    ctrlRef.current = controls;
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.minDistance     = 0.5;
    controls.maxDistance     = 5;
    controls.autoRotate      = false; // Handled manually by sinusoidal swinging

    // Holographic clamps to prevent showing the empty back/thin edges
    controls.minAzimuthAngle = -Math.PI / 2.7; // ~-66 degrees
    controls.maxAzimuthAngle = Math.PI / 2.7;  // ~+66 degrees
    controls.minPolarAngle = Math.PI / 3;      // 60 degrees (prevents looking from exact top)
    controls.maxPolarAngle = 2 * Math.PI / 3;  // 120 degrees (prevents looking from exact bottom)

    /* Pause spin on interaction, resume after 3 s */
    const pauseSpin = () => {
      autoSpinRef.current = false;
      setAutoSpin(false);
      if (resumeRef.current) clearTimeout(resumeRef.current);
      resumeRef.current = setTimeout(() => {
        autoSpinRef.current = true;
        setAutoSpin(true);
      }, 3000);
    };
    container.addEventListener("pointerdown", pauseSpin);
    container.addEventListener("wheel",       pauseSpin, { passive: true });

    /* ── Build 3D displacement mesh from the actual scan image ─────────── */
    const RES      = 256;   // sampling resolution
    const SEGMENTS = 200;   // geometry subdivisions — higher = smoother depth
    const STRENGTH = 0.28;  // depth extrusion (lung peaks 0.28 units forward)

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    let loaded = 0;
    const tryFinish = () => {
      loaded++;
      if (loaded >= 1) { // need at least base image
        setProgress(100);
        setTimeout(() => { setLoading(false); onLoaded?.(); }, 300);
      }
    };

    setProgress(15);

    const cacheBusterImageUrl = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}webgl=3d` : "";
    loader.load(
      cacheBusterImageUrl,
      (texture) => {
        texture.colorSpace    = THREE.SRGBColorSpace;
        texture.minFilter     = THREE.LinearFilter;
        texture.generateMipmaps = false;
        baseTex.current = texture;
        setProgress(50);

        /* Sample brightness for displacement */
        const brightness = sampleBrightness(
          texture.image as HTMLImageElement, RES
        );
        setProgress(70);

        /* Build subdivided plane */
        const geo = new THREE.PlaneGeometry(2, 2, SEGMENTS, SEGMENTS);
        applyDisplacement(geo, brightness, RES, STRENGTH);
        setVerts(geo.attributes.position.count);
        setProgress(88);

        /* Material — show the actual scan image */
        const mat = new THREE.MeshStandardMaterial({
          map:      texture,
          side:     THREE.DoubleSide,
          roughness: 0.65,
          metalness: 0.05,
        });
        matRef2.current = mat;

        const mesh = new THREE.Mesh(geo, mat);
        modelGroup.add(mesh);

        /* Add Solid Clinical Backplate Slab */
        const backplateGeo = new THREE.BoxGeometry(2.04, 2.04, 0.15);
        const backplateMat = new THREE.MeshStandardMaterial({
          color: 0x051124,         // Dark cobalt blue clinical tone
          roughness: 0.15,
          metalness: 0.9,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        const backplate = new THREE.Mesh(backplateGeo, backplateMat);
        backplate.position.set(0, 0, -0.076);
        modelGroup.add(backplate);

        /* Add Glowing Bounding Wireframe Frame Box */
        const edges = new THREE.EdgesGeometry(backplateGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x1A4F9E,        // Medical cyan/blue
          transparent: true,
          opacity: 0.6
        });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.position.copy(backplate.position);
        modelGroup.add(wireframe);

        /* Add Animated Glowing Laser Scan Bar */
        const laserGeo = new THREE.BoxGeometry(2.05, 0.015, 0.35);
        const laserMat = new THREE.MeshBasicMaterial({
          color: 0x00d6ff,        // Cyan laser glow
          transparent: true,
          opacity: 0.75,
        });
        const laser = new THREE.Mesh(laserGeo, laserMat);
        laser.position.set(0, 0, 0.14); // slightly in front of the base plane
        modelGroup.add(laser);
        laserRef.current = laser;

        setProgress(98);
        tryFinish();
      },
      undefined,
      (err) => {
        setLoading(false);
        onError?.(`Failed to load scan image: ${err}`);
      },
    );

    /* Load heatmap (optional) */
    if (heatmapUrl) {
      const cacheBusterHeatmapUrl = `${heatmapUrl}${heatmapUrl.includes('?') ? '&' : '?'}webgl=3d`;
      loader.load(
        cacheBusterHeatmapUrl,
        (texture) => {
          texture.colorSpace      = THREE.SRGBColorSpace;
          texture.minFilter       = THREE.LinearFilter;
          texture.generateMipmaps = false;
          heatTex.current = texture;
          
          // Apply immediately if already requested while downloading
          if (heatRequestedRef.current) {
            const mat = matRef2.current;
            if (mat) {
              mat.map = texture;
              mat.emissive = new THREE.Color(0xffffff);
              mat.emissiveMap = texture;
              mat.emissiveIntensity = 0.7;
              mat.roughness = 0.25;
              mat.metalness = 0.25;
              mat.needsUpdate = true;
            }
          }
        },
        undefined,
        (err) => {
          console.warn("[3D Lung Viewer] Heatmap failed to load. This can occur if the file is missing, the scan was normal (no heat zones generated), or due to CORS restrictions on WebGL textures:", err);
        },
      );
    }

    const clock = new THREE.Clock();

    /* Animation loop */
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();

      // Animate laser scanning
      if (laserRef.current) {
        laserRef.current.position.y = Math.sin(time * 1.5) * 1.0;
      }

      // Animate model group swing / tilt
      if (modelGroup) {
        if (autoSpinRef.current) {
          modelGroup.rotation.y = Math.sin(time * 0.7) * 0.45; // Swing back and forth
          modelGroup.rotation.x = Math.sin(time * 0.35) * 0.08; // Subtle breathing tilt
        } else {
          // Smoothly ease rotation back to center (0,0,0) so mouse dragging feels stable
          modelGroup.rotation.y += (0 - modelGroup.rotation.y) * 0.1;
          modelGroup.rotation.x += (0 - modelGroup.rotation.x) * 0.1;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /* Resize */
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width: nw, height: nh } = e.contentRect;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
    ro.observe(container);

    /* Cleanup */
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (resumeRef.current) clearTimeout(resumeRef.current);
      ro.disconnect();
      container.removeEventListener("pointerdown", pauseSpin);
      container.removeEventListener("wheel", pauseSpin);
      controls.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      baseTex.current?.dispose();
      heatTex.current?.dispose();
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.geometry?.dispose();
          (Array.isArray(o.material) ? o.material : [o.material])
            .forEach(m => m.dispose());
        }
      });
      renderer.dispose();
      rendRef.current = null; camRef.current = null;
      ctrlRef.current = null; matRef2.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, heatmapUrl, scanId]);

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", position: "relative", ...style }}
      className={className}
    >
      {/* ── Top-left HUD ──────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap">
        {/* Mode badge */}
        <div
          style={{
            ...mono,
            backgroundColor: "rgba(4,4,10,0.80)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(26,79,158,0.4)",
          }}
          className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest flex items-center gap-1.5"
        >
          <span className="size-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: modality === "ct" ? "#1A4F9E" : "#C0212C" }} />
          <span style={{ color: "#7ab3ff" }}>3D · Clinical Slice</span>
        </div>

        {/* Grad-CAM toggle */}
        {heatmapUrl && (
          <button
            onClick={toggleHeat}
            style={{
              ...mono,
              backgroundColor: heatOn ? "rgba(192,33,44,0.85)" : "rgba(4,4,10,0.80)",
              backdropFilter: "blur(14px)",
              border: `1px solid ${heatOn ? "rgba(192,33,44,0.6)" : "rgba(26,79,158,0.4)"}`,
              color: heatOn ? "#fff" : "#7ab3ff",
            }}
            className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-all cursor-pointer animate-pulse"
          >
            Grad-CAM {heatOn ? "GLOW" : "OFF"}
          </button>
        )}

        {/* Auto-spin toggle */}
        <button
          onClick={toggleSpin}
          style={{
            ...mono,
            backgroundColor: autoSpin ? "rgba(26,79,158,0.75)" : "rgba(4,4,10,0.80)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${autoSpin ? "rgba(26,79,158,0.6)" : "rgba(255,255,255,0.08)"}`,
            color: autoSpin ? "#fff" : "rgba(255,255,255,0.35)",
          }}
          className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-all cursor-pointer"
        >
          {autoSpin ? "⟳ Scan Active" : "⟳ Paused"}
        </button>
      </div>

      {/* ── View Preset Buttons (right side) ──────────────────────────────── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
        {PRESET_BTNS.map(({ label, preset, icon }) => (
          <button
            key={preset}
            onClick={() => flyTo(preset)}
            title={`View from ${label}`}
            style={{
              ...mono,
              backgroundColor: "rgba(4,4,10,0.80)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(26,79,158,0.3)",
              color: "#7ab3ff",
            }}
            className="w-10 h-10 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0 hover:bg-[#1A4F9E]/50 transition-all cursor-pointer leading-none"
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="text-[6.5px] opacity-60 leading-none mt-1 uppercase">{label.replace(" ", "")}</span>
          </button>
        ))}
      </div>

      {/* ── Loading overlay ────────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{ backgroundColor: "rgba(4,4,10,0.92)", backdropFilter: "blur(16px)", zIndex: 30 }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center max-w-xs w-full px-8">
            <svg className="size-20 mb-6" viewBox="0 0 100 100" fill="none">
              <path d="M46 15C32 15 22 28 22 48C22 68 34 85 46 85C47.5 85 48 84 48 82V18C48 16 47.5 15 46 15Z" fill="#C0212C">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
              </path>
              <path d="M54 15C68 15 78 28 78 48C78 68 66 85 54 85C52.5 85 52 84 52 82V18C52 16 52.5 15 54 15Z" fill="#1A4F9E">
                <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
              </path>
            </svg>
            <h4 style={{ ...mono, color: "#7ab3ff" }}
              className="font-bold text-sm mb-1 uppercase tracking-widest text-center">
              Building 3D Depth Map
            </h4>
            <p style={{ ...mono, color: "rgba(122,179,255,0.45)" }}
              className="text-[9px] uppercase tracking-widest text-center mb-5">
              LUMINANCE → VERTEX DISPLACEMENT
            </p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg,#1A4F9E,#C0212C)" }}
              />
            </div>
            <span style={{ ...mono, color: "#7ab3ff" }}
              className="text-[9px] tracking-[0.2em] uppercase font-black">
              {progress}%
            </span>
          </div>
        </div>
      )}

      {/* ── Bottom-left telemetry ──────────────────────────────────────────── */}
      {!loading && verts !== null && (
        <div
          style={{
            ...mono,
            backgroundColor: "rgba(4,4,10,0.80)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(26,79,158,0.2)",
            color: "#7ab3ff",
          }}
          className="absolute bottom-4 left-4 p-4 rounded-2xl pointer-events-none flex flex-col gap-1.5 z-20"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">TELEMETRY</span>
            <span className="size-1.5 rounded-full bg-[#1A4F9E] animate-pulse" />
          </div>
          {[
            ["VERTICES", verts.toLocaleString()],
            ["RENDERER", "WebGL 2.0"],
            ["DEPTH",    "3D Relief Block"],
            ["VIEWPORT", "PA / Oblique Clamped"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 text-[9px]">
              <span className="opacity-40 uppercase tracking-wider">{k}:</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Drag hint ─────────────────────────────────────────────────────── */}
      {!loading && (
        <div
          style={{ ...mono, color: "rgba(122,179,255,0.3)", zIndex: 10 }}
          className="absolute bottom-4 right-16 text-[8px] uppercase tracking-widest pointer-events-none text-right leading-relaxed"
        >
          Drag to scan block<br />Scroll to zoom
        </div>
      )}
    </div>
  );
};

export { ThreeDLungViewer as LungViewer3D };
export default ThreeDLungViewer;
