import { describe, it, expect } from "vitest";
import { CATUC_FACTS, isCatucAware, isCatucQuestion, isPreCatucContent } from "./catucFacts";

describe("CATUC facts block (BUG-ST13)", () => {
  it("states in-force date, repeal and the key articles", () => {
    for (const s of ["25.08.2026", "Legea 50/1991", "Legea 350/2001", "art. 294(2)(a)(ii)", "art. 296(1)(a)", "art. 298(3)", "art. 299", "art. 309(1)", "PAC", "DTAC"]) {
      expect(CATUC_FACTS).toContain(s);
    }
    expect(CATUC_FACTS).toContain("Informativ, nu consultanță juridică");
  });

  it("detects CATUC / permit questions with or without diacritics", () => {
    expect(isCatucQuestion("Ce spune CATUC (Legea 169/2026) despre o casă modulară?")).toBe(true);
    expect(isCatucQuestion("Am nevoie de autorizație de construire?")).toBe(true);
    expect(isCatucQuestion("Pot face doar notificare la primărie?")).toBe(true);
    expect(isCatucQuestion("Do I need a building permit in Romania?")).toBe(true);
    expect(isCatucQuestion("Minimum bedroom size?")).toBe(false);
  });

  it("treats catuc-tagged articles as CATUC-aware and flags old-law text", () => {
    expect(isCatucAware({ tags: ["catuc", "romania"] })).toBe(true);
    expect(isCatucAware({ tags: ["permit", "romania"] })).toBe(false);
    expect(isPreCatucContent({ tags: ["permit"] }, "Conform Legea 50/1991, DTAC ...")).toBe(true);
    expect(isPreCatucContent({ tags: ["catuc"] }, "PAC (fostul DTAC)")).toBe(false);
    expect(isPreCatucContent({ tags: ["permit"] }, "Room sizes per Neufert")).toBe(false);
  });
});
