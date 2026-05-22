"""
Volumetric 3D reconstruction from 2D lung scan images.

Generates TWO vertex-coloured meshes embedded in one GLB:
  - Mesh 0 "base":    solid Cobalt Blue  (#1A4F9E) — clean anatomical view
  - Mesh 1 "heatmap": Cobalt-Blue → Crimson gradient driven by Grad-CAM intensity

The front-end toggles visibility of each mesh for the Grad-CAM ON/OFF button.
"""

import os
import numpy as np
import cv2
from scipy.ndimage import gaussian_filter
from skimage import measure
from skimage.filters import threshold_otsu
import trimesh
from PIL import Image as PILImage
import pydicom


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _extract_mask(original_img: np.ndarray, segmented_path: str,
                  gh: int, gw: int) -> np.ndarray:
    mask = None
    if os.path.exists(segmented_path):
        seg = cv2.imread(segmented_path)
        if seg is not None:
            b, g, r = cv2.split(seg)
            crimson = (r > 130) & (g < 90) & (b < 110)
            if np.any(crimson):
                mask = crimson.astype(np.uint8) * 255

    if mask is None or np.sum(mask > 0) < 100:
        gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        corners = [gray[0,0], gray[0,w-1], gray[h-1,0], gray[h-1,w-1]]
        t_img = cv2.bitwise_not(gray) if np.mean(corners) > 127 else gray
        try:
            t = threshold_otsu(t_img)
            binary = (t_img > t).astype(np.uint8) * 255
        except Exception:
            _, binary = cv2.threshold(t_img, 127, 255, cv2.THRESH_BINARY)
        k = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(binary, cv2.MORPH_OPEN, k)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k)

    return cv2.resize(mask, (gw, gh), interpolation=cv2.INTER_NEAREST)


def _build_volume(mask: np.ndarray, depth: int, height: int, width: int) -> np.ndarray:
    zc, yc, xc = depth/2, height/2, width/2
    zr, yr, xr = depth/2*0.95, height/2*0.95, width/2*0.95
    Z, Y, X = np.ogrid[:depth, :height, :width]
    ellipsoid = ((Z-zc)/zr)**2 + ((Y-yc)/yr)**2 + ((X-xc)/xr)**2 <= 1.0
    depth_factor = np.sin(np.pi * Z / max(depth - 1, 1))
    extruded = mask[np.newaxis, :, :] > 0
    vol = np.where(extruded & ellipsoid, 255.0 * depth_factor, 0.0)
    return gaussian_filter(vol, sigma=1.2)


def _vertex_colors_base(n: int) -> np.ndarray:
    """Solid Cobalt Blue for every vertex."""
    cols = np.zeros((n, 4), dtype=np.uint8)
    cols[:, 0] = 26; cols[:, 1] = 79; cols[:, 2] = 158; cols[:, 3] = 255
    return cols


def _vertex_colors_gradcam(vertices: np.ndarray, height: int, width: int,
                            gradcam_path: str) -> np.ndarray:
    """
    Interpolate each vertex colour between Cobalt Blue (healthy) and
    Crimson (diseased) by sampling Grad-CAM red-channel warmth.
    """
    n = len(vertices)
    cols = np.zeros((n, 4), dtype=np.uint8)

    gc_img = cv2.imread(gradcam_path) if os.path.exists(gradcam_path) else None
    gh, gw = (gc_img.shape[:2] if gc_img is not None else (height, width))

    for i in range(n):
        vy = int(np.clip(vertices[i, 1], 0, height - 1))
        vx = int(np.clip(vertices[i, 2], 0, width  - 1))

        # Default: Cobalt Blue
        r, g, b = 26, 79, 158

        if gc_img is not None:
            gy = int(np.clip(vy / height * gh, 0, gh - 1))
            gx = int(np.clip(vx / width  * gw, 0, gw - 1))
            bgr = gc_img[gy, gx]
            b_v, g_v, r_v = float(bgr[0]), float(bgr[1]), float(bgr[2])

            # Warmth: how strongly red dominates
            warmth = np.clip((r_v - b_v) / 255.0 * 1.8, 0.0, 1.0)

            # Lerp Cobalt → Crimson (#C0212C = 192, 33, 44)
            r = int((1 - warmth) * 26  + warmth * 192)
            g = int((1 - warmth) * 79  + warmth * 33)
            b = int((1 - warmth) * 158 + warmth * 44)

        cols[i] = [r, g, b, 255]
    return cols


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def generate_3d_mesh_from_images(scan_id: str) -> str:
    """
    Build a GLB containing two named meshes:
      • "LungBase"    – solid Cobalt Blue (clean anatomy)
      • "LungHeatmap" – Cobalt→Crimson Grad-CAM shading

    The front-end shows/hides each mesh via the Grad-CAM toggle.
    Returns the path to the generated GLB.
    """
    static_dir    = os.path.join("static", "results", scan_id)
    original_path = os.path.join(static_dir, "original.jpg")
    segmented_path= os.path.join(static_dir, "segmented.jpg")
    gradcam_path  = os.path.join(static_dir, "gradcam.jpg")
    output_path   = os.path.join(static_dir, "mesh.glb")

    # Return cached mesh
    if os.path.exists(output_path):
        return output_path

    if not os.path.exists(original_path):
        raise ValueError(f"Original scan not found for: {scan_id}")

    original_img = cv2.imread(original_path)
    if original_img is None:
        raise ValueError(f"Cannot read original image for: {scan_id}")

    # ── 1. Mask + volume ─────────────────────────────────────────────────────
    GH, GW, DEPTH = 128, 128, 48
    mask    = _extract_mask(original_img, segmented_path, GH, GW)
    volume  = _build_volume(mask, DEPTH, GH, GW)

    try:
        verts, faces, normals, _ = measure.marching_cubes(volume, level=50.0)
    except ValueError:
        verts, faces, normals, _ = measure.marching_cubes(volume)

    if len(verts) == 0:
        raise ValueError("Marching Cubes produced an empty mesh.")

    # ── 2. Centre & scale ────────────────────────────────────────────────────
    verts_c = verts - verts.mean(axis=0)
    md = np.max(np.abs(verts_c))
    if md > 0:
        verts_c = (verts_c / md) * 1.1

    # ── 3. Build two vertex-colour arrays ────────────────────────────────────
    cols_base    = _vertex_colors_base(len(verts))
    cols_heatmap = _vertex_colors_gradcam(verts, GH, GW, gradcam_path)

    # ── 4. Assemble scene with two named meshes ───────────────────────────────
    mesh_base = trimesh.Trimesh(
        vertices=verts_c.copy(), faces=faces, vertex_normals=normals,
        process=False,
    )
    mesh_base.visual.vertex_colors = cols_base

    mesh_heat = trimesh.Trimesh(
        vertices=verts_c.copy(), faces=faces, vertex_normals=normals,
        process=False,
    )
    mesh_heat.visual.vertex_colors = cols_heatmap

    scene = trimesh.scene.scene.Scene()
    scene.add_geometry(mesh_base, node_name="LungBase",    geom_name="LungBase")
    scene.add_geometry(mesh_heat, node_name="LungHeatmap", geom_name="LungHeatmap")

    # ── 5. Export GLB ────────────────────────────────────────────────────────
    scene.export(output_path, file_type="glb")
    return output_path


# ──────────────────────────────────────────────────────────────────────────────
# Legacy
# ──────────────────────────────────────────────────────────────────────────────

def parse_dicom_slice(dicom_path: str) -> np.ndarray:
    ds  = pydicom.dcmread(dicom_path)
    arr = ds.pixel_array.astype(float)
    lo, hi = arr.min(), arr.max()
    arr = (arr - lo) / (hi - lo) if hi > lo else np.zeros_like(arr)
    if arr.ndim == 3 and arr.shape[0] > 1:
        arr = arr[arr.shape[0] // 2]
    return arr


def generate_3d_mesh(slice_paths: list[str], scan_id: str) -> str:
    if not slice_paths:
        raise ValueError("No DICOM slice paths provided.")
    slices = [parse_dicom_slice(p) for p in slice_paths]
    target = slices[0].shape
    resized = []
    for s in slices:
        if s.shape != target:
            p = PILImage.fromarray(s).resize((target[1], target[0]), PILImage.Resampling.BILINEAR)
            resized.append(np.array(p))
        else:
            resized.append(s)
    vol = gaussian_filter(np.stack(resized, axis=0), sigma=1.0)
    v, f, n, _ = measure.marching_cubes(vol, level=0.45)
    m = trimesh.Trimesh(vertices=v, faces=f, vertex_normals=n)
    cols = np.zeros((len(v), 4), dtype=np.uint8)
    cols[:, 0]=26; cols[:, 1]=79; cols[:, 2]=158; cols[:, 3]=255
    m.visual.vertex_colors = cols
    out = os.path.join("static", "results", scan_id, "mesh.glb")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    m.export(out, file_type="glb"); return out


def build_ct_mesh(scan_id: str, slice_paths: list[str]) -> str:
    return generate_3d_mesh(slice_paths, scan_id)
