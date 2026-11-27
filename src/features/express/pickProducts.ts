/**
 * Deterministic product pick (spec v1 §1.4: Claude never picks IDs).
 * For each room type in the house: products matching style ∩ room, one per
 * subcategory; basic = cheapest, premium = most expensive, standard = median.
 */
import type { FinishLevelId } from "@/features/design/store";
import type { SelectedProduct } from "@/features/design/productSelection";

export interface PickableProduct {
  id: string;
  price: number;
  subcategory: string;
  styles?: string[];
  roomTypes?: string[];
}

export function pickProducts(
  catalog: PickableProduct[],
  styleId: string,
  roomTypes: string[],
  finish: FinishLevelId,
): SelectedProduct[] {
  const rooms = [...new Set(roomTypes)];
  const chosen = new Map<string, string>(); // subcategory → product id
  for (const room of rooms) {
    const fits = catalog.filter(
      (p) => p.styles?.includes(styleId) && p.roomTypes?.includes(room),
    );
    const bySub = new Map<string, PickableProduct[]>();
    for (const p of fits) bySub.set(p.subcategory, [...(bySub.get(p.subcategory) ?? []), p]);
    for (const [sub, list] of bySub) {
      if (chosen.has(sub)) continue;
      const sorted = [...list].sort((x, y) => x.price - y.price || x.id.localeCompare(y.id));
      const idx = finish === "basic" ? 0 : finish === "premium" ? sorted.length - 1 : Math.floor((sorted.length - 1) / 2);
      chosen.set(sub, sorted[idx].id);
    }
  }
  return [...chosen.values()].sort().map((productId) => ({ productId, quantity: 1 }));
}
