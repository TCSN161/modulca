import { describe, it, expect, beforeEach } from "vitest";
import { useDesignStore } from "./store";
import { useLandStore } from "@/features/land/store";
import { applyTemplate, findPreset } from "./projectTemplate";
import { applyProjectSnapshot } from "./projectSnapshot";

const designInitial = useDesignStore.getState();
const landInitial = useLandStore.getState();

describe("applyTemplate (BUG-ST10)", () => {
  beforeEach(() => {
    useDesignStore.setState(designInitial, true);
    useLandStore.setState(landInitial, true);
    localStorage.clear();
  });

  it("Compact House → 4 modules in projects.data, grid and design store", () => {
    const data = applyTemplate("house-compact");
    expect(data.preset).toBe("house-compact");
    expect(data.gridCells).toHaveLength(4);
    expect((data.modules as unknown[]).length).toBe(4);
    expect(useDesignStore.getState().modules.map((m) => m.moduleType).sort()).toEqual(
      ["bathroom", "bedroom", "kitchen", "living"],
    );
    expect(useLandStore.getState().gridCells).toHaveLength(4);
  });

  it("the saved data restores the template on the next cloud load", () => {
    const data = JSON.parse(JSON.stringify(applyTemplate("house-compact")));
    useDesignStore.setState(designInitial, true);
    useLandStore.setState(landInitial, true);
    applyProjectSnapshot(data, { projectId: "new" });
    expect(useDesignStore.getState().modules).toHaveLength(4);
    expect(useLandStore.getState().gridCells).toHaveLength(4);
  });

  it("no or unknown preset → nothing applied", () => {
    expect(applyTemplate(null)).toEqual({});
    expect(applyTemplate("nope")).toEqual({});
    expect(useDesignStore.getState().modules).toHaveLength(0);
    expect(findPreset("house-lshape")?.label).toBe("L-Shape Villa");
  });
});
