/**
 * Project cost — the ONE cost function (BUG-ST12 + BUG-ST31).
 * ─────────────────────────────────────────────────────────
 * Before: Design/Finalize used getStats() (finish level, shared walls, fee),
 * the dashboard card used `modules × 9 m² × €1,200`, and products were added
 * only on the Products page, at quantity 1 even for per-m² items.
 *
 * Now every screen calls computeProjectCost():
 *   design cost  = computeDesignStats(modules, finishLevel)   (same as getStats)
 *   product cost = Σ lines, where a per-m² product covers the usable floor area
 *                  (stored quantity = number of coverages, normally 1)
 *   grandTotal   = design totalEstimate + product cost
 *
 * The stored selection shape `{ productId, quantity }` is unchanged
 * (presentation / PDF read it); the unit is derived from the catalog.
 */

import { PRODUCT_CATALOG } from "@/assets";
import { computeDesignStats, type DesignStats } from "./store";
import { parseSelectedProducts, type SelectedProduct } from "./productSelection";
import type { ModuleConfig } from "./store";

export type ProductUnit = "pcs" | "m2";

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
}

/** "per m²" / "per m2" / "sqm" → m2; everything else (unit, pack, set, panel…) → pcs */
export function productUnit(p: Pick<CatalogProduct, "unit">): ProductUnit {
  return /m²|m2\b|sqm|sq\.?\s*m/i.test(p.unit) ? "m2" : "pcs";
}

export interface ProductLine {
  productId: string;
  name: string;
  unit: ProductUnit;
  /** What the user picked (pieces, or number of coverages for m²) */
  selectedQuantity: number;
  /** Priced quantity: pieces, or m² */
  quantity: number;
  unitPrice: number;
  total: number;
}

export function productLines(
  selected: SelectedProduct[],
  usableArea: number,
  catalog: CatalogProduct[] = PRODUCT_CATALOG,
): ProductLine[] {
  const lines: ProductLine[] = [];
  for (const s of selected) {
    const p = catalog.find((c) => c.id === s.productId);
    if (!p) continue;
    const unit = productUnit(p);
    // No modules yet → no area to cover: price the picked quantity as m²
    const quantity = unit === "m2" && usableArea > 0 ? s.quantity * usableArea : s.quantity;
    lines.push({
      productId: p.id,
      name: p.name,
      unit,
      selectedQuantity: s.quantity,
      quantity,
      unitPrice: p.price,
      total: Math.round(p.price * quantity * 100) / 100,
    });
  }
  return lines;
}

export interface ProjectCost extends DesignStats {
  productLines: ProductLine[];
  productCost: number;
  /** design totalEstimate + products */
  grandTotal: number;
}

export function computeProjectCost(input: {
  modules: ModuleConfig[];
  finishLevel: string;
  selectedProducts?: SelectedProduct[];
  catalog?: CatalogProduct[];
}): ProjectCost {
  const design = computeDesignStats(input.modules, input.finishLevel);
  const lines = productLines(input.selectedProducts ?? [], design.usableArea, input.catalog);
  const productCost = lines.reduce((sum, l) => sum + l.total, 0);
  return { ...design, productLines: lines, productCost, grandTotal: design.totalEstimate + productCost };
}

/** Cost of a saved project row (`projects.data`), e.g. for the dashboard card. */
export function computeProjectCostFromData(data: Record<string, unknown>): ProjectCost {
  return computeProjectCost({
    modules: Array.isArray(data.modules) ? (data.modules as ModuleConfig[]) : [],
    finishLevel: typeof data.finishLevel === "string" ? data.finishLevel : "standard",
    selectedProducts: parseSelectedProducts(data.selectedProducts),
  });
}
