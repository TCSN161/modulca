import { describe, it, expect, beforeEach } from "vitest";
import {
  LAND_STORAGE_KEY,
  parseLandSnapshot,
  isLandEmpty,
  landToProjectData,
  landFromProjectData,
  readLandFromStorage,
  writeLandToStorage,
  type LandSnapshot,
} from "./persistence";

const SNAP: LandSnapshot = {
  polygon: [
    { lat: 44.1, lng: 26.1 },
    { lat: 44.2, lng: 26.2 },
    { lat: 44.3, lng: 26.1 },
  ],
  gridCells: [
    { row: 0, col: 0, moduleType: "living" },
    { row: 0, col: 1, moduleType: null },
  ],
  gridOrigin: { lat: 44.1, lng: 26.1 },
  gridRotation: 15,
  mapCenter: { lat: 45, lng: 25 },
  mapZoom: 18,
  mapLayer: "streets",
  phase: "modules",
};

describe("land persistence (BUG-X02)", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through localStorage", () => {
    writeLandToStorage(SNAP);
    expect(JSON.parse(localStorage.getItem(LAND_STORAGE_KEY)!)._v).toBe(1);
    expect(readLandFromStorage()).toEqual(SNAP);
  });

  it("returns {} for missing or corrupt storage", () => {
    expect(readLandFromStorage()).toEqual({});
    localStorage.setItem(LAND_STORAGE_KEY, "{not json");
    expect(readLandFromStorage()).toEqual({});
  });

  it("drops invalid fields instead of throwing", () => {
    const parsed = parseLandSnapshot({
      polygon: [{ lat: 1, lng: 2 }, { lat: "x" }],
      gridCells: [{ row: 1, col: 2, moduleType: "bedroom" }, { row: 1.5, col: 0, moduleType: null }],
      mapLayer: "terrain",
      phase: "bogus",
      mapZoom: Number.NaN,
    });
    expect(parsed).toEqual({
      polygon: [{ lat: 1, lng: 2 }],
      gridCells: [{ row: 1, col: 2, moduleType: "bedroom" }],
    });
    expect(parseLandSnapshot(null)).toEqual({});
  });

  it("isLandEmpty", () => {
    expect(isLandEmpty({ polygon: [], gridCells: [] })).toBe(true);
    expect(isLandEmpty(SNAP)).toBe(false);
  });

  it("maps to projects.data keeping top-level gridCells/gridRotation", () => {
    const d = landToProjectData(SNAP);
    expect(d.gridCells).toBe(SNAP.gridCells);
    expect(d.gridRotation).toBe(15);
    expect(d.land.polygon).toBe(SNAP.polygon);
    expect(d.land).not.toHaveProperty("gridCells");
    expect(landFromProjectData(d as unknown as Record<string, unknown>)).toEqual(SNAP);
  });

  it("reads old projects (no `land` key) and never wipes the grid with []", () => {
    expect(landFromProjectData({ gridCells: [{ row: 0, col: 0, moduleType: "kitchen" }], gridRotation: 0 })).toEqual({
      gridCells: [{ row: 0, col: 0, moduleType: "kitchen" }],
      gridRotation: 0,
    });
    expect(landFromProjectData({ gridCells: [] })).toEqual({});
  });
});
