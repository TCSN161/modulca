/**
 * Furniture presets (5.05 bake-off B2, tightened in 5.06).
 *
 * Every item is checked with the box the 3D renderer actually draws:
 * modelFrame() gives the model's own width/depth + rotation + mount height;
 * the GLB is scaled to fill exactly modelW × height × modelD, so rotating that
 * box back gives the world footprint. Checks:
 *   - inside the real interior (walls 0.25 m → 0.25–2.75 m), no wall intrusion;
 *   - no two solid items overlap > 2 cm in 3D (wall-mounted mirror above a
 *     vanity is fine, two floor items side by side are not);
 *   - the default south door swing zone stays free (terrace excepted).
 * Flat items (rugs, roll-in shower tray, height ≤ 5 cm on the floor) are exempt
 * from the overlap and door checks.
 */
import { describe, it, expect } from "vitest";
import {
  ROOM_LAYOUTS, modelFrame, INTERIOR_MIN, INTERIOR_MAX, DOOR_ZONE, NO_DOOR_TYPES,
  type FurnitureItem,
} from "./layouts";

const TOLERANCE = 0.02;
const FLAT_HEIGHT = 0.05;
const WALL_HEIGHT = 2.7;

interface Box { id: string; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }

/** World AABB of the rendered model (size after per-axis scale, then rotation). */
function renderedBox(f: FurnitureItem): Box {
  const { rotationY, modelW, modelD, baseY } = modelFrame(f);
  const c = Math.abs(Math.cos(rotationY));
  const s = Math.abs(Math.sin(rotationY));
  const w = modelW * c + modelD * s;
  const d = modelW * s + modelD * c;
  const cx = f.x + f.width / 2;
  const cz = f.z + f.depth / 2;
  return { id: f.id, x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, y0: baseY, y1: baseY + f.height };
}

const isFlat = (f: FurnitureItem) => (f.mountY ?? 0) === 0 && f.height <= FLAT_HEIGHT;
const ov = (a0: number, a1: number, b0: number, b1: number) => Math.min(a1, b1) - Math.max(a0, b0);

const cases = ROOM_LAYOUTS.flatMap((r) =>
  r.presets.map((p) => ({ name: `${r.moduleType}/${p.id}`, type: r.moduleType, furniture: p.furniture })),
);

describe("furniture presets (5.06: rendered size, wall bounds, door zone)", () => {
  it("has all 24 presets", () => {
    expect(cases.length).toBe(24);
  });

  it.each(cases)("$name: rendered footprint equals the authored footprint", ({ furniture }) => {
    const bad = furniture.filter((f) => {
      const b = renderedBox(f);
      return Math.abs(b.x1 - b.x0 - f.width) > 1e-6 || Math.abs(b.z1 - b.z0 - f.depth) > 1e-6;
    }).map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it.each(cases)("$name: nothing inside the walls (interior 0.25–2.75 m)", ({ furniture }) => {
    const e = 1e-9;
    const intrusions = furniture.map(renderedBox)
      .filter((b) => b.x0 < INTERIOR_MIN - e || b.z0 < INTERIOR_MIN - e || b.x1 > INTERIOR_MAX + e || b.z1 > INTERIOR_MAX + e || b.y1 > WALL_HEIGHT)
      .map((b) => `${b.id} (x ${b.x0.toFixed(2)}–${b.x1.toFixed(2)}, z ${b.z0.toFixed(2)}–${b.z1.toFixed(2)})`);
    expect(intrusions).toEqual([]);
  });

  it.each(cases)("$name: no two items overlap > 2 cm", ({ furniture }) => {
    const solid = furniture.filter((f) => !isFlat(f)).map(renderedBox);
    const clashes: string[] = [];
    for (let i = 0; i < solid.length; i++) {
      for (let j = i + 1; j < solid.length; j++) {
        const a = solid[i], b = solid[j];
        const dx = ov(a.x0, a.x1, b.x0, b.x1);
        const dz = ov(a.z0, a.z1, b.z0, b.z1);
        const dy = ov(a.y0, a.y1, b.y0, b.y1);
        if (dx > TOLERANCE && dz > TOLERANCE && dy > TOLERANCE) {
          clashes.push(`${a.id}×${b.id} (${dx.toFixed(2)}×${dz.toFixed(2)}×${dy.toFixed(2)} m)`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });

  it.each(cases.filter((c) => !NO_DOOR_TYPES.includes(c.type)))("$name: door swing zone is free", ({ furniture }) => {
    const blocking = furniture.filter((f) => !isFlat(f)).map(renderedBox)
      .filter((b) => b.y0 < 2.1 && ov(b.x0, b.x1, DOOR_ZONE.x0, DOOR_ZONE.x1) > TOLERANCE && ov(b.z0, b.z1, DOOR_ZONE.z0, DOOR_ZONE.z1) > TOLERANCE)
      .map((b) => b.id);
    expect(blocking).toEqual([]);
  });
});
