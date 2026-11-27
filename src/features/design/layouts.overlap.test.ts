/**
 * Bake-off B2: furniture presets must not overlap and must stay inside the
 * 3×3 m module footprint (layout coordinates, 0–3 m on both axes).
 *
 * Flat items (rugs, height ≤ 5 cm) lie under furniture and are exempt from the
 * pairwise check. Overlaps up to TOLERANCE (2 cm) are allowed for touching edges.
 */
import { describe, it, expect } from "vitest";
import { ROOM_LAYOUTS, type FurnitureItem } from "./layouts";

const MODULE = 3;
const TOLERANCE = 0.02;
const FLAT_HEIGHT = 0.05;

function overlapArea(a: FurnitureItem, b: FurnitureItem): { dx: number; dz: number } {
  const dx = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const dz = Math.min(a.z + a.depth, b.z + b.depth) - Math.max(a.z, b.z);
  return { dx, dz };
}

const cases = ROOM_LAYOUTS.flatMap((r) =>
  r.presets.map((p) => ({ name: `${r.moduleType}/${p.id}`, furniture: p.furniture })),
);

describe("furniture presets (bake-off B2)", () => {
  it("has presets to check", () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it.each(cases)("$name: every item is inside the module", ({ furniture }) => {
    const outside = furniture
      .filter((f) => f.x < -1e-9 || f.z < -1e-9 || f.x + f.width > MODULE + 1e-9 || f.z + f.depth > MODULE + 1e-9)
      .map((f) => f.id);
    expect(outside).toEqual([]);
  });

  it.each(cases)("$name: no two items overlap", ({ furniture }) => {
    const solid = furniture.filter((f) => f.height > FLAT_HEIGHT);
    const clashes: string[] = [];
    for (let i = 0; i < solid.length; i++) {
      for (let j = i + 1; j < solid.length; j++) {
        const { dx, dz } = overlapArea(solid[i], solid[j]);
        if (dx > TOLERANCE && dz > TOLERANCE) {
          clashes.push(`${solid[i].id}×${solid[j].id} (${dx.toFixed(2)}×${dz.toFixed(2)} m)`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });
});
