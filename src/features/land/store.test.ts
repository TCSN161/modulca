import { describe, it, expect, beforeEach } from "vitest";
import { useLandStore } from "./store";
import { LAND_STORAGE_KEY } from "./persistence";

const initial = useLandStore.getState();

describe("useLandStore persistence (BUG-X02)", () => {
  beforeEach(() => {
    useLandStore.setState(initial, true);
    localStorage.clear();
  });

  it("writes modulca-land when the polygon changes", () => {
    useLandStore.getState().addPolygonPoint({ lat: 44, lng: 26 });
    const stored = JSON.parse(localStorage.getItem(LAND_STORAGE_KEY)!);
    expect(stored.polygon).toEqual([{ lat: 44, lng: 26 }]);
    expect(stored.mapCenter).toEqual(initial.mapCenter);
  });

  it("does not persist UI-only flags", () => {
    useLandStore.getState().setIsDrawing(true);
    expect(localStorage.getItem(LAND_STORAGE_KEY)).toBeNull();
  });

  it("getSnapshot / hydrate round-trip", () => {
    const s = useLandStore.getState();
    s.setGridCells([{ row: 0, col: 0, moduleType: "living" }]);
    s.setMapCenter({ lat: 46, lng: 23 });
    const snap = useLandStore.getState().getSnapshot();
    useLandStore.setState(initial, true);
    useLandStore.getState().hydrate(snap);
    expect(useLandStore.getState().getSnapshot()).toEqual(snap);
  });
});
