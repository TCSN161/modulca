import { getPreset, getPresetsForType, INTERIOR_MIN, INTERIOR_MAX } from "../../layouts";
import type { ModuleConfig } from "../../store";

const MODULE_SIZE = 3;
/** Clearance between the eye/body and any furniture footprint (m). */
const CLEAR = 0.3;
/** Items mounted higher than this (shelves, TVs above head) do not block standing. */
const HEAD = 1.7;

/**
 * 3.11: free standing spot in a module (local metres from its NW corner).
 * The walkthrough used to spawn/teleport/tour at the module centre, which in
 * bedroom/rest is inside the bed. Picks the free grid point closest to the centre;
 * falls back to the centre if the room is full.
 */
export function freeSpot(mod: Pick<ModuleConfig, "moduleType" | "layoutPreset" | "furnitureOverrides">): [number, number] {
  const preset = getPreset(mod.moduleType, mod.layoutPreset) || getPresetsForType(mod.moduleType)[0];
  const overrides = mod.furnitureOverrides?.[mod.layoutPreset] ?? {};
  const boxes = (preset?.furniture ?? [])
    .filter((f) => (f.mountY ?? 0) < HEAD && f.height >= 0.05) // rugs/runners do not block
    .map((f) => {
      const o = overrides[f.id] ?? {};
      const x = Number.isFinite(o.x) ? o.x! : f.x;
      const z = Number.isFinite(o.z) ? o.z! : f.z;
      return { x0: x - CLEAR, x1: x + f.width + CLEAR, z0: z - CLEAR, z1: z + f.depth + CLEAR };
    });
  const c = MODULE_SIZE / 2;
  let best: [number, number] = [c, c];
  let bestD = Infinity;
  const lo = INTERIOR_MIN + CLEAR, hi = INTERIOR_MAX - CLEAR;
  for (let x = lo; x <= hi + 1e-6; x += 0.1) {
    for (let z = lo; z <= hi + 1e-6; z += 0.1) {
      if (boxes.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) continue;
      const d = (x - c) ** 2 + (z - c) ** 2;
      if (d < bestD) { bestD = d; best = [x, z]; }
    }
  }
  return best;
}

/** World XZ of the free spot of a module. */
export function freeSpotWorld(mod: ModuleConfig): [number, number] {
  const [x, z] = freeSpot(mod);
  return [mod.col * MODULE_SIZE + x, mod.row * MODULE_SIZE + z];
}
