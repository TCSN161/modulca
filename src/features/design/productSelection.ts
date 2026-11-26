/**
 * Product selection — public API for step 11 (Products).
 * ─────────────────────────────────────────────────────
 * Fixes BUG-X03 (MCA-SPEC-EXPRESS-MODE-v1 §8): the selection used to be
 * private to ProductsPage and never reached projects.data.
 *
 * Stored shape is FIXED: `{ productId, quantity }[]` in
 * localStorage["modulca-selected-products"] and projects.data.selectedProducts.
 * Presentation / PDF (Chat 3, BUG-X01) read this exact shape.
 */

export interface SelectedProduct {
  productId: string;
  quantity: number;
}

export const SELECTED_PRODUCTS_KEY = "modulca-selected-products";

/** Validate unknown input (storage / projects.data); invalid items are dropped. */
export function parseSelectedProducts(raw: unknown): SelectedProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is SelectedProduct =>
        !!s &&
        typeof s === "object" &&
        typeof (s as SelectedProduct).productId === "string" &&
        (s as SelectedProduct).productId.length > 0 &&
        Number.isFinite((s as SelectedProduct).quantity) &&
        (s as SelectedProduct).quantity > 0,
    )
    .map((s) => ({ productId: s.productId, quantity: Math.floor(s.quantity) }))
    .filter((s) => s.quantity > 0);
}

export function getSelectedProducts(): SelectedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SELECTED_PRODUCTS_KEY);
    return raw ? parseSelectedProducts(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function setSelectedProducts(items: SelectedProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify(parseSelectedProducts(items)));
  } catch {
    /* quota / private mode — non-fatal */
  }
}
