import * as THREE from "three";

/**
 * 3.11: real-size PBR furniture rebuilt in Blender (docs/research/blender-3d/3.11/).
 * These GLBs are modelled in metres at the bedroom/rest slot sizes, so they render at
 * uniform scale 1 instead of being stretched per axis like the ~½-size kit models.
 *
 * On by default since Costin OKed the before/after (28 Nov). `?real3d=0` turns it off
 * (remembered in localStorage), `?real3d=1` turns it back on. Exact labels only, so e.g. "Hall Wardrobe"
 * keeps its old path.
 */
const REAL_MODELS: Record<string, string> = {
  "double bed": "/models/real/bed-double-140.glb",
  nightstand: "/models/real/nightstand-45.glb",
  wardrobe: "/models/real/wardrobe-80.glb",
};

const STORAGE_KEY = "mca-real3d";

export function realModelsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const q = new URLSearchParams(window.location.search).get("real3d");
    if (q === "0") localStorage.setItem(STORAGE_KEY, "0");
    if (q === "1") localStorage.removeItem(STORAGE_KEY);
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

/** Real-size GLB for this label, or null (opted out / no real model). */
export function realGlbPath(label: string): string | null {
  const path = REAL_MODELS[label.toLowerCase()];
  return path && realModelsEnabled() ? path : null;
}

/**
 * Scale for a model of bbox `size` placed in a w × h × d slot (model frame).
 * When the footprint is within ±tol of the slot the model is real size: keep
 * uniform scale 1 (its own height, e.g. a headboard above the mattress slot).
 * Otherwise the old per-axis fit.
 */
export function fitScale(size: THREE.Vector3, w: number, h: number, d: number, tol = 0.05): [number, number, number] {
  const near = (a: number, b: number) => b > 0 && Math.abs(a - b) <= tol * b;
  if (near(size.x, w) && near(size.z, d)) return [1, 1, 1];
  return [size.x > 0.001 ? w / size.x : 1, size.y > 0.001 ? h / size.y : 1, size.z > 0.001 ? d / size.z : 1];
}

/** Real models carry their own PBR materials: no preset colour tint. */
export function isRealModelPath(path: string): boolean {
  return path.startsWith("/models/real/");
}
