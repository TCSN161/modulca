/**
 * Selected products for the presentation + PDF (fixes BUG-X01).
 *
 * Reads Chat 5's public API (`{ productId, quantity }[]`, see
 * `features/design/productSelection.ts`) and resolves name + price from the
 * single product registry in `@/assets` (replaces 3 hardcoded catalog copies
 * that were keyed on `{id}` and so always came out empty).
 */
import { getProduct } from "@/assets";
import { getSelectedProducts, type SelectedProduct } from "@/features/design/productSelection";

export interface ResolvedProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export function resolveSelectedProducts(
  items: SelectedProduct[] = getSelectedProducts()
): ResolvedProduct[] {
  const out: ResolvedProduct[] = [];
  for (const item of items) {
    const p = getProduct(item.productId);
    if (p) out.push({ id: p.id, name: p.name, quantity: item.quantity, price: p.price });
  }
  return out;
}
