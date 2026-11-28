import { describe, it, expect } from "vitest";
import { freeSpot } from "./spawn";
import { ROOM_LAYOUTS } from "../../layouts";

describe("3.11 walkthrough freeSpot", () => {
  it("never puts the eye inside a floor item, for every preset", () => {
    for (const room of ROOM_LAYOUTS) for (const p of room.presets) {
      const [x, z] = freeSpot({ moduleType: room.moduleType, layoutPreset: p.id, furnitureOverrides: {} });
      for (const f of p.furniture) {
        if ((f.mountY ?? 0) >= 1.7 || f.height < 0.05) continue; // high wall items, rugs
        const inside = x > f.x && x < f.x + f.width && z > f.z && z < f.z + f.depth;
        expect(inside, `${room.moduleType}/${p.id} spot (${x.toFixed(2)},${z.toFixed(2)}) in ${f.id}`).toBe(false);
      }
    }
  });

  it("bedroom/rest no longer spawns in the bed", () => {
    const [x, z] = freeSpot({ moduleType: "bedroom", layoutPreset: "rest", furnitureOverrides: {} });
    const inBed = x > 0.25 && x < 2.25 && z > 0.25 && z < 1.65;
    expect(inBed).toBe(false);
  });
});
