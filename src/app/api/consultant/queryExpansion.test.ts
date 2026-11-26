import { describe, it, expect } from "vitest";
import { expandQuery, normalizeQuery } from "./queryExpansion";

describe("consultant query expansion", () => {
  it("strips Romanian diacritics", () => {
    expect(normalizeQuery("Autorizație de construire, înșurubați, ţară")).toBe("autorizatie de construire, insurubati, tara");
  });

  it("expands CATUC to permit/urbanism tag vocabulary", () => {
    const q = expandQuery("Ce prevede CATUC despre certificatul de urbanism?");
    expect(q).toContain("certificat-urbanism");
    expect(q).toContain("autorizatie");
    expect(q).toContain("romania");
  });

  it("leaves unrelated questions unchanged except normalisation", () => {
    expect(expandQuery("Minimum Bedroom size?")).toBe("minimum bedroom size?");
  });
});
