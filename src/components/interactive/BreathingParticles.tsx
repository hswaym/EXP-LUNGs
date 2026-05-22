"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface BreathingParticlesProps {
    className?: string;
    active?: boolean;
}

export default function BreathingParticles({ className, active = true }: BreathingParticlesProps) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || !active) return;

        // 1. Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 200;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // 2. Geometry & Particles (2000 points, cyan/white)
        const PARTICLE_COUNT = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);

        // Store original bases for spring-back after mouse interaction
        const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
        const randomOffsets = new Float32Array(PARTICLE_COUNT);

        const colorCyan = new THREE.Color("#00D6FF");
        const colorWhite = new THREE.Color("#ffffff");

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            // Spread across a wide, tall volume
            positions[i3] = (Math.random() - 0.5) * 800; // x
            positions[i3 + 1] = (Math.random() - 0.5) * 600; // y
            positions[i3 + 2] = (Math.random() - 0.5) * 400; // z

            originalPositions[i3] = positions[i3];
            originalPositions[i3 + 1] = positions[i3 + 1];
            originalPositions[i3 + 2] = positions[i3 + 2];

            randomOffsets[i] = Math.random() * Math.PI * 2;

            // 80% cyan, 20% white
            const mixedColor = Math.random() > 0.8 ? colorWhite : colorCyan;
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        // Glowy additive blending material
        const material = new THREE.PointsMaterial({
            size: 2.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // 3. Mouse Interaction Mappings
        const mouse = new THREE.Vector2(-1000, -1000);
        const targetMouseWorld = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Z=0 interaction plane

        const onMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", onMouseMove, { passive: true });

        // 4. Animation Loop
        let animationId: number;
        let time = 0;

        const animate = () => {
            time += 0.01;

            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;

            // Project mouse to world coordinates on Z=0
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, targetMouseWorld);

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;

                // Base upward drift simulating subtle breathing
                originalPositions[i3 + 1] += 0.15;

                // Horizontal sine wave drift
                originalPositions[i3] += Math.sin(time + randomOffsets[i]) * 0.05;

                // Wrap around vertically
                if (originalPositions[i3 + 1] > 300) {
                    originalPositions[i3 + 1] = -300;
                    originalPositions[i3] = (Math.random() - 0.5) * 800;
                }

                // --- Mouse Forcefield Logic ---
                const dx = originalPositions[i3] - targetMouseWorld.x;
                const dy = originalPositions[i3 + 1] - targetMouseWorld.y;
                const distSq = dx * dx + dy * dy;

                const REPEL_RADIUS = 80;
                const radiusSq = REPEL_RADIUS * REPEL_RADIUS;

                if (distSq < radiusSq) {
                    // Inside radius: push away
                    const force = (radiusSq - distSq) / radiusSq;
                    posArray[i3] += (originalPositions[i3] + dx * force * 1.5 - posArray[i3]) * 0.1;
                    posArray[i3 + 1] += (originalPositions[i3 + 1] + dy * force * 1.5 - posArray[i3 + 1]) * 0.1;
                } else {
                    // Outside radius: gently spring back to original drifting path
                    posArray[i3] += (originalPositions[i3] - posArray[i3]) * 0.05;
                    posArray[i3 + 1] += (originalPositions[i3 + 1] - posArray[i3 + 1]) * 0.05;
                }
            }

            posAttr.needsUpdate = true;
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // 5. Cleanup & Resize
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", onResize);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [active]);

    return <div ref={mountRef} className={`absolute inset-0 z-0 pointer-events-auto ${className || ""}`} />;
}
