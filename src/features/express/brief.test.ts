import { describe, it, expect } from "vitest";
import { normalizeBrief, plotModuleCap, type NormalizeContext } from "./normalize";
import { briefToWizardInput } from "./briefToWizardInput";
import { pickProducts } from "./pickProducts";
import { squarePlot, COUNTY_CENTROIDS } from "./countyCentroids";
import { generateDesign } from "@/features/wizard/generator";
import { PRODUCT_CATALOG } from "@/assets";

const premium: NormalizeContext = { locale: "ro", maxModules: 12, rendersPerDay: 5 };
const free: NormalizeContext = { locale: "en", maxModules: 6, rendersPerDay: 3 };
const guest: NormalizeContext = { locale: "nl", maxModules: 4, rendersPerDay: 2 };

describe("normalizeBrief", () => {
  it("applies the defaults when everything is 'you choose'", () => {
    const b = normalizeBrief({}, free);
    expect(b).toMatchObject({
      householdSize: 3, bedrooms: 2, budgetBand: "moderate", finishLevel: "standard",
      styleId: "warm-contemporary", terrace: true, county: "CJ", plotAreaSqm: 600,
      targetModuleCount: null, moduleCap: 6, renderViews: ["exterior", "overview", "interior"],
    });
    expect(b.warnings).toEqual([]);
  });

  it("G1 Familie Cluj on premium: 110 m² → 12 modules, scandinavian, standard", () => {
    const b = normalizeBrief({
      county: "cj", plotAreaSqm: 600, householdSize: 4, wantsOffice: false, targetAreaSqm: 110,
      budgetBand: "moderate", styleId: "scandinavian", terrace: true, finishLevel: "standard", bedrooms: 3,
    }, premium);
    expect(b.county).toBe("CJ");
    expect(b.targetModuleCount).toBe(12);
    expect(b.warnings).toEqual([]);
  });

  it("clamps the wanted area to the tier cap with a warning", () => {
    const b = normalizeBrief({ targetAreaSqm: 110 }, free);
    expect(b.targetModuleCount).toBe(6);
    expect(b.warnings).toContain("modules-clamped-tier");
  });

  it("clamps to the plot footprint (40%) before the tier", () => {
    expect(plotModuleCap(150)).toBe(6);
    const b = normalizeBrief({ plotAreaSqm: 150, targetAreaSqm: 90 }, premium);
    expect(b.moduleCap).toBe(6);
    expect(b.targetModuleCount).toBe(6);
    expect(b.warnings).toContain("modules-clamped-plot");
  });

  it("derives the budget band from euros and the finish from the band", () => {
    expect(normalizeBrief({ budgetEur: 60_000 }, free)).toMatchObject({ budgetBand: "tight", finishLevel: "basic" });
    expect(normalizeBrief({ budgetEur: 200_000 }, free)).toMatchObject({ budgetBand: "generous", finishLevel: "premium" });
    expect(normalizeBrief({ budgetBand: "generous", finishLevel: "basic" }, free).finishLevel).toBe("basic");
  });

  it("caps renders to the tier's daily render quota", () => {
    const b = normalizeBrief({}, guest);
    expect(b.renderViews).toEqual(["exterior", "overview"]);
    expect(b.warnings).toContain("renders-clamped-tier");
    expect(normalizeBrief({}, { ...premium, rendersPerDay: -1 }).renderViews).toHaveLength(3);
  });

  it("falls back on unknown county, clamps bedrooms, trims notes", () => {
    const b = normalizeBrief({ county: "XX", bedrooms: 9, notes: "  " + "a".repeat(600) }, premium);
    expect(b.county).toBe("CJ");
    expect(b.bedrooms).toBe(6);
    expect(b.warnings).toEqual(expect.arrayContaining(["county-unknown", "bedrooms-clamped"]));
    expect(b.notes).toHaveLength(500);
  });

  it("household follows the bedrooms when only bedrooms are given", () => {
    expect(normalizeBrief({ bedrooms: 3 }, premium)).toMatchObject({ bedrooms: 3, householdSize: 4, wantsOffice: false });
  });
});

describe("briefToWizardInput", () => {
  it("maps every field and passes the target module count", () => {
    const b = normalizeBrief({ bedrooms: 3, targetAreaSqm: 110, styleId: "scandinavian" }, premium);
    expect(briefToWizardInput(b)).toEqual({
      householdSize: 4, budgetLevel: "moderate", stylePreference: "scandinavian", floors: 1,
      wantsTerrace: true, wantsOffice: false, bedroomsRequested: 3, targetModuleCount: 12,
    });
  });

  it("G1 generates 12 modules with ≥3 bedrooms, bathroom, kitchen, living, terrace", () => {
    const b = normalizeBrief({ bedrooms: 3, householdSize: 4, targetAreaSqm: 110, styleId: "scandinavian" }, premium);
    const d = generateDesign(briefToWizardInput(b));
    const types = d.modules.map((m) => m.moduleType);
    expect(d.modules).toHaveLength(12);
    expect(types.filter((t) => t === "bedroom").length).toBeGreaterThanOrEqual(3);
    for (const t of ["bathroom", "kitchen", "living", "terrace"]) expect(types).toContain(t);
    expect(d.styleDirection).toBe("scandinavian");
  });

  it("caps the household-sized house to the tier when no area is given", () => {
    const b = normalizeBrief({ householdSize: 6 }, guest);
    const input = briefToWizardInput(b);
    expect(input.targetModuleCount).toBe(4);
    expect(generateDesign(input).modules).toHaveLength(4);
  });

  it("leaves the generator's size alone when it fits", () => {
    const input = briefToWizardInput(normalizeBrief({ householdSize: 1, terrace: false }, premium));
    expect(input.targetModuleCount).toBeUndefined();
  });
});

describe("pickProducts", () => {
  const cat = [
    { id: "a", price: 10, subcategory: "flooring", styles: ["s"], roomTypes: ["living"] },
    { id: "b", price: 30, subcategory: "flooring", styles: ["s"], roomTypes: ["living"] },
    { id: "c", price: 20, subcategory: "flooring", styles: ["s"], roomTypes: ["living"] },
    { id: "d", price: 5, subcategory: "sofa", styles: ["x"], roomTypes: ["living"] },
  ];
  it("one per subcategory, by finish level, style-matched", () => {
    expect(pickProducts(cat, "s", ["living"], "basic")).toEqual([{ productId: "a", quantity: 1 }]);
    expect(pickProducts(cat, "s", ["living"], "standard")).toEqual([{ productId: "c", quantity: 1 }]);
    expect(pickProducts(cat, "s", ["living", "living"], "premium")).toEqual([{ productId: "b", quantity: 1 }]);
  });
  it("picks real catalog products for a scandinavian house", () => {
    const picked = pickProducts(PRODUCT_CATALOG, "scandinavian", ["living", "kitchen", "bedroom", "bathroom"], "standard");
    expect(picked.length).toBeGreaterThan(0);
    const ids = new Set(PRODUCT_CATALOG.map((p) => p.id));
    for (const p of picked) expect(ids.has(p.productId)).toBe(true);
  });
});

describe("squarePlot", () => {
  it("draws a ~square of the asked area around the centre", () => {
    const c = COUNTY_CENTROIDS.CJ.center;
    const pts = squarePlot(c, 900);
    expect(pts).toHaveLength(4);
    const hM = (pts[0].lat - pts[3].lat) * 111_320;
    expect(hM).toBeCloseTo(30, 1);
    expect(Object.keys(COUNTY_CENTROIDS)).toHaveLength(42);
  });
});
