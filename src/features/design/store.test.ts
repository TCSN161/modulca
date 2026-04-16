import { describe, it, expect } from "vitest";
import {
  defaultThicknessForWallType,
  computeWallThicknessDefaults,
  getEffectiveThickness,
  WALL_THICKNESS_SPECS,
  type ModuleConfig,
  type WallConfigs,
} from "./store";

/* ═══════════════════════════════════════════════════════════
   Wall Thickness Specs
   ═══════════════════════════════════════════════════════════ */

describe("WALL_THICKNESS_SPECS", () => {
  it("should define exactly 3 thickness options", () => {
    const keys = Object.keys(WALL_THICKNESS_SPECS);
    expect(keys).toHaveLength(3);
    expect(keys.map(Number).sort()).toEqual([15, 25, 30]);
  });

  it("only 30cm should have a cost premium", () => {
    expect(WALL_THICKNESS_SPECS[15].costPerWall).toBe(0);
    expect(WALL_THICKNESS_SPECS[25].costPerWall).toBe(0);
    expect(WALL_THICKNESS_SPECS[30].costPerWall).toBeGreaterThan(0);
  });

  it("should have decreasing U-value (better insulation) with thickness", () => {
    expect(WALL_THICKNESS_SPECS[15].uValue).toBeGreaterThan(
      WALL_THICKNESS_SPECS[25].uValue
    );
    expect(WALL_THICKNESS_SPECS[25].uValue).toBeGreaterThan(
      WALL_THICKNESS_SPECS[30].uValue
    );
  });

  it("15cm interior should have 0 cost (included in base)", () => {
    expect(WALL_THICKNESS_SPECS[15].costPerWall).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════
   defaultThicknessForWallType
   ═══════════════════════════════════════════════════════════ */

describe("defaultThicknessForWallType", () => {
  it("shared walls get 15cm (interior)", () => {
    expect(defaultThicknessForWallType("shared")).toBe(15);
  });

  it("none walls get 15cm (placeholder)", () => {
    expect(defaultThicknessForWallType("none")).toBe(15);
  });

  it("solid exterior walls get 25cm", () => {
    expect(defaultThicknessForWallType("solid")).toBe(25);
  });

  it("window walls get 25cm", () => {
    expect(defaultThicknessForWallType("window")).toBe(25);
  });

  it("door walls get 25cm", () => {
    expect(defaultThicknessForWallType("door")).toBe(25);
  });
});

/* ═══════════════════════════════════════════════════════════
   computeWallThicknessDefaults
   ═══════════════════════════════════════════════════════════ */

describe("computeWallThicknessDefaults", () => {
  it("all solid walls → all 25cm", () => {
    const wallConfigs: WallConfigs = {
      north: "solid",
      south: "solid",
      east: "solid",
      west: "solid",
    };
    const result = computeWallThicknessDefaults(wallConfigs);
    expect(result).toEqual({ north: 25, south: 25, east: 25, west: 25 });
  });

  it("mixed shared + exterior walls → 15cm shared, 25cm exterior", () => {
    const wallConfigs: WallConfigs = {
      north: "shared",
      south: "door",
      east: "window",
      west: "shared",
    };
    const result = computeWallThicknessDefaults(wallConfigs);
    expect(result).toEqual({ north: 15, south: 25, east: 25, west: 15 });
  });

  it("terrace-like module (all none) → all 15cm", () => {
    const wallConfigs: WallConfigs = {
      north: "none",
      south: "none",
      east: "none",
      west: "none",
    };
    const result = computeWallThicknessDefaults(wallConfigs);
    expect(result).toEqual({ north: 15, south: 15, east: 15, west: 15 });
  });
});

/* ═══════════════════════════════════════════════════════════
   getEffectiveThickness
   ═══════════════════════════════════════════════════════════ */

describe("getEffectiveThickness", () => {
  const baseModule: ModuleConfig = {
    row: 0,
    col: 0,
    moduleType: "living",
    label: "LIVING",
    layoutPreset: "default",
    floorFinish: "oak",
    wallColor: "alabaster",
    furnitureOverrides: {},
    wallConfigs: {
      north: "solid",
      south: "door",
      east: "shared",
      west: "window",
    },
  };

  it("returns user-set thickness when present", () => {
    const mod: ModuleConfig = {
      ...baseModule,
      wallThicknessConfigs: { north: 30, south: 30, east: 15, west: 30 },
    };
    const result = getEffectiveThickness(mod);
    expect(result).toEqual({ north: 30, south: 30, east: 15, west: 30 });
  });

  it("auto-computes from wall types when no user-set thickness", () => {
    const mod: ModuleConfig = { ...baseModule };
    // No wallThicknessConfigs set
    const result = getEffectiveThickness(mod);
    expect(result).toEqual({ north: 25, south: 25, east: 15, west: 25 });
  });
});
