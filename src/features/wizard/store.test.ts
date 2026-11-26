import { describe, it, expect, beforeEach } from "vitest";
import { useWizardStore } from "./store";
import { useLandStore } from "@/features/land/store";
import { useDesignStore } from "@/features/design/store";

const landInitial = useLandStore.getState();

describe("useWizardStore.applyToProject({ syncLand })", () => {
  beforeEach(() => {
    useLandStore.setState(landInitial, true);
    useWizardStore.getState().reset();
    useWizardStore.getState().setInput({
      householdSize: 2,
      budgetLevel: "moderate",
      stylePreference: "scandinavian",
      floors: 1,
      targetModuleCount: 6,
    });
    useWizardStore.getState().generate();
  });

  it("default: fills the design store, leaves the land store alone", () => {
    useWizardStore.getState().applyToProject();
    expect(useDesignStore.getState().modules).toHaveLength(6);
    expect(useLandStore.getState().gridCells).toEqual([]);
  });

  it("syncLand: mirrors modules into land gridCells", () => {
    useLandStore.getState().setGridRotation(30);
    useWizardStore.getState().applyToProject({ syncLand: true });
    const cells = useLandStore.getState().gridCells;
    expect(cells).toHaveLength(6);
    expect(cells.every((c) => c.moduleType)).toBe(true);
    expect(useLandStore.getState().gridRotation).toBe(0);
  });
});

describe("useLandStore.setPolygon", () => {
  it("replaces the polygon and drops invalid points", () => {
    useLandStore.getState().addPolygonPoint({ lat: 9, lng: 9 });
    useLandStore.getState().setPolygon([
      { lat: 1, lng: 2 },
      { lat: Number.NaN, lng: 0 },
      { lat: 3, lng: 4 },
    ]);
    expect(useLandStore.getState().polygon).toEqual([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ]);
  });
});
