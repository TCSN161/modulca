import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { fitScale, isRealModelPath, realGlbPath } from "./realModels";
import { ROOM_LAYOUTS, modelFrame } from "../../layouts";

// 3.11 real-size models, bbox in model frame (x = width, y = height, z = depth)
const REAL = {
  "Double Bed": new THREE.Vector3(1.4, 0.95, 2.0),
  Nightstand: new THREE.Vector3(0.45, 0.5, 0.4),
  Wardrobe: new THREE.Vector3(0.8, 2.2, 0.51),
};

describe("3.11 realModels", () => {
  it("bedroom/rest slots take the real models at uniform scale 1", () => {
    const rest = ROOM_LAYOUTS.find((r) => r.moduleType === "bedroom")!.presets.find((p) => p.id === "rest")!;
    for (const [label, size] of Object.entries(REAL)) {
      const item = rest.furniture.find((f) => f.label === label)!;
      const f = modelFrame(item);
      expect(fitScale(size, f.modelW, item.height, f.modelD)).toEqual([1, 1, 1]);
    }
  });

  it("kit-sized models keep the per-axis fit", () => {
    expect(fitScale(new THREE.Vector3(0.96, 0.38, 1.13), 1.4, 0.5, 2.0)).toEqual([1.4 / 0.96, 0.5 / 0.38, 2.0 / 1.13]);
  });

  it("is opt-in and exact-label only", () => {
    expect(realGlbPath("Double Bed")).toBeNull(); // flag off by default
    expect(isRealModelPath("/models/real/wardrobe-80.glb")).toBe(true);
    expect(isRealModelPath("/models/bedDouble.glb")).toBe(false);
  });
});
