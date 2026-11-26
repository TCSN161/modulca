import { describe, it, expect } from "vitest";
import { computeRoomAllocation, generateDesign } from "./generator";
import type { WizardInput } from "./types";

const base: WizardInput = {
  householdSize: 4,
  budgetLevel: "moderate",
  stylePreference: "scandinavian",
  floors: 1,
};

describe("WizardInput.targetModuleCount / bedroomsRequested (Express)", () => {
  it("unchanged behaviour when neither is set", () => {
    const r = computeRoomAllocation(base);
    expect(r).toMatchObject({ bedrooms: 3, bathrooms: 2, hallway: 1, terrace: 1 });
    expect(r.totalModules).toBe(9);
  });

  it("honours bedroomsRequested", () => {
    expect(computeRoomAllocation({ ...base, bedroomsRequested: 1 }).bedrooms).toBe(1);
    const r = computeRoomAllocation({ ...base, householdSize: 2, bedroomsRequested: 4 });
    expect(r.bedrooms).toBe(4);
    expect(r.bathrooms).toBeGreaterThanOrEqual(2);
    expect(computeRoomAllocation({ ...base, bedroomsRequested: 99 }).bedrooms).toBe(6);
  });

  it.each([4, 6, 9, 12, 15, 20])("hits targetModuleCount=%i exactly", (n) => {
    const d = generateDesign({ ...base, targetModuleCount: n });
    expect(d.rooms.totalModules).toBe(n);
    expect(d.modules).toHaveLength(n);
    const types = d.modules.map((m) => m.moduleType);
    expect(types).toContain("living");
    expect(types).toContain("kitchen");
    expect(types).toContain("bedroom");
    expect(types).toContain("bathroom");
  });

  it("clamps targetModuleCount to [4, 20]", () => {
    expect(computeRoomAllocation({ ...base, targetModuleCount: 1 }).totalModules).toBe(4);
    expect(computeRoomAllocation({ ...base, targetModuleCount: 50 }).totalModules).toBe(20);
  });

  it("keeps requested bedrooms while fitting the module count", () => {
    const r = computeRoomAllocation({ ...base, bedroomsRequested: 2, targetModuleCount: 10 });
    expect(r.totalModules).toBe(10);
    expect(r.bedrooms).toBe(2);
    const small = computeRoomAllocation({ ...base, bedroomsRequested: 3, targetModuleCount: 6 });
    expect(small).toMatchObject({ totalModules: 6, bedrooms: 3, bathrooms: 1 });
  });
});
