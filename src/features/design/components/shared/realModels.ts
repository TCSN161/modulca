import * as THREE from "three";

/**
 * 3.11: real-size PBR furniture rebuilt in Blender (docs/research/blender-3d/3.11/).
 * These GLBs are modelled in metres at the bedroom/rest slot sizes, so they render at
 * uniform scale 1 instead of being stretched per axis like the ~½-size kit models.
 *
 * On by default since Costin OKed the before/after (28 Nov). `?real3d=0` turns it off
 * (remembered in localStorage), `?real3d=1` turns it back on. Exact labels only, so e.g. "Hall Wardrobe"
 * keeps its old path.
 * 3.11b: + fridge, washer, bookshelf (two widths). A label can have several sizes;
 * the one whose footprint fits the slot (±5 %) wins, else the old path / primitive.
 */
const R = "/models/real/";
/** label → real models, footprint in the model frame (w = x, d = z) */
const REAL_MODELS: Record<string, { path: string; w: number; d: number }[]> = {
  "double bed": [{ path: R + "bed-double-140.glb", w: 1.4, d: 2.0 }],
  nightstand: [{ path: R + "nightstand-45.glb", w: 0.45, d: 0.4 }],
  wardrobe: [{ path: R + "wardrobe-80.glb", w: 0.8, d: 0.51 }],
  fridge: [{ path: R + "fridge-60.glb", w: 0.6, d: 0.625 }],
  washer: [{ path: R + "washer-60.glb", w: 0.6, d: 0.615 }],
  bookshelf: [
    { path: R + "bookshelf-100.glb", w: 1.0, d: 0.35 },
    { path: R + "bookshelf-160.glb", w: 1.6, d: 0.4 },
  ],
};

const near = (a: number, b: number, tol = 0.05) => b > 0 && Math.abs(a - b) <= tol * b;

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

/**
 * Real-size GLB for this label that fits a modelW × modelD slot, or null (opted
 * out / no real model / no size fits). Without a size the first model is used.
 */
export function realGlbPath(label: string, w?: number, d?: number): string | null {
  const list = REAL_MODELS[label.toLowerCase()];
  if (!list || !realModelsEnabled()) return null;
  if (w == null || d == null) return list[0].path;
  return list.find((m) => near(m.w, w) && near(m.d, d))?.path ?? null;
}

/**
 * Scale for a model of bbox `size` placed in a w × h × d slot (model frame).
 * When the footprint is within ±tol of the slot the model is real size: keep
 * uniform scale 1 (its own height, e.g. a headboard above the mattress slot).
 * Otherwise the old per-axis fit.
 */
export function fitScale(size: THREE.Vector3, w: number, h: number, d: number, tol = 0.05): [number, number, number] {
  if (near(size.x, w, tol) && near(size.z, d, tol)) return [1, 1, 1];
  return [size.x > 0.001 ? w / size.x : 1, size.y > 0.001 ? h / size.y : 1, size.z > 0.001 ? d / size.z : 1];
}

/** Real models carry their own PBR materials: no preset colour tint. */
export function isRealModelPath(path: string): boolean {
  return path.startsWith("/models/real/");
}
