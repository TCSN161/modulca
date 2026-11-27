import { describe, it, expect, beforeEach } from "vitest";
import { useDesignStore, computeDesignStats } from "./store";
import {
  productUnit,
  productLines,
  computeProjectCost,
  computeProjectCostFromData,
} from "./projectCost";

const designInitial = useDesignStore.getState();

function twoModules() {
  const cells = [
    { row: 0, col: 0, moduleType: "living" },
    { row: 0, col: 1, moduleType: "bedroom" },
  ];
  useDesignStore.getState().setModulesFromGrid(cells as never, 0);
  return useDesignStore.getState().modules;
}

describe("projectCost (BUG-ST12 + ST31)", () => {
  beforeEach(() => useDesignStore.setState(designInitial, true));

  it("productUnit: per m² → m2, everything else → pcs", () => {
    expect(productUnit({ unit: "per m²" })).toBe("m2");
    expect(productUnit({ unit: "per m2" })).toBe("m2");
    expect(productUnit({ unit: "per unit" })).toBe("pcs");
    expect(productUnit({ unit: "per panel" })).toBe("pcs");
    expect(productUnit({ unit: "per running m" })).toBe("pcs");
  });

  it("getStats() and computeDesignStats() agree (one design cost)", () => {
    const modules = twoModules();
    expect(useDesignStore.getState().getStats()).toEqual(computeDesignStats(modules, "standard"));
  });

  it("per-m² products cover the usable area; pieces stay pieces", () => {
    const lines = productLines(
      [
        { productId: "fin-03", quantity: 1 }, // XPS €12 / m²
        { productId: "fin-02", quantity: 3 }, // gypsum €18 / panel
      ],
      14,
    );
    expect(lines[0]).toMatchObject({ unit: "m2", quantity: 14, total: 168 });
    expect(lines[1]).toMatchObject({ unit: "pcs", quantity: 3, total: 54 });
  });

  it("grand total = design estimate + products", () => {
    const modules = twoModules();
    const c = computeProjectCost({
      modules,
      finishLevel: "standard",
      selectedProducts: [{ productId: "fin-02", quantity: 1 }],
    });
    expect(c.productCost).toBe(18);
    expect(c.grandTotal).toBeCloseTo(c.totalEstimate + 18);
    expect(c.totalEstimate).toBe(useDesignStore.getState().getStats().totalEstimate);
  });

  it("dashboard card (saved data) equals the in-app total", () => {
    const modules = twoModules();
    const selectedProducts = [{ productId: "fin-03", quantity: 1 }];
    const live = computeProjectCost({ modules, finishLevel: "premium", selectedProducts });
    const card = computeProjectCostFromData(
      JSON.parse(JSON.stringify({ modules, finishLevel: "premium", selectedProducts })),
    );
    expect(card.grandTotal).toBe(live.grandTotal);
    expect(card.grandTotal).not.toBe(modules.length * 9 * 1200);
  });

  it("tolerates old rows (modules without wall configs, junk products)", () => {
    const c = computeProjectCostFromData({
      modules: [{ id: "m", row: 0, col: 0, moduleType: "living" }],
      selectedProducts: [{ productId: "nope", quantity: 1 }, "x"],
    });
    expect(Number.isFinite(c.grandTotal)).toBe(true);
    expect(c.totalModules).toBe(1);
    expect(c.productLines).toEqual([]);
  });
});
