/**
 * Design Inspiration images (BUG-ST35).
 * ────────────────────────────────────
 * The pins in renderConstants.ts have no photos (generic Unsplash URLs were
 * removed because they did not match the labels). We now show the closest
 * product photo from the asset registry, only when that photo is hosted by us
 * (`/public/images/products`, source "local"). No reliable match → the card
 * shows a clear placeholder with the pin name instead of a bare colour block.
 */

import { getProduct } from "@/assets";
import type { StylePin } from "./renderConstants";

/**
 * First matching rule wins; tested against the pin LABEL only (lower case),
 * word-bounded, so "Textile" is not a tile and "Floor Lamp" is not flooring.
 * Only close matches: a wrong photo is worse than the placeholder.
 */
const RULES: { re: RegExp; productId: string }[] = [
  { re: /\b(wood|oak|parquet|plank)\b.*\bfloor(ing)?\b/, productId: "fin-01" },
  { re: /\b(lamp|pendant|bulbs?|chandelier|sconce|light)\b/, productId: "fur-06" },
  { re: /\b(bathtub|bath tub|bath)\b/, productId: "plm-01" },
  { re: /\bshower\b/, productId: "plm-05" },
  { re: /\b(faucet|tap|mixer)\b/, productId: "plm-02" },
  { re: /\b(sink|basin)\b/, productId: "plm-03" },
  { re: /\btoilet\b/, productId: "plm-04" },
  { re: /\bsubway\b|\bwall tiles?\b/, productId: "fin-10" },
  { re: /\b(tiles?|porcelain|terrazzo)\b/, productId: "fin-08" },
  { re: /\b(countertop|worktop|kitchen)\b/, productId: "fin-12" },
  { re: /\b(sofa|couch|living room)\b/, productId: "fur-01" },
  { re: /\b(rug|carpet|kilim)\b/, productId: "fur-02" },
  { re: /\b(shelf|shelves|bookshelf|bookcase|shelving|rack)\b/, productId: "fur-05" },
  { re: /\bmirror\b/, productId: "fur-07" },
  { re: /\b(dining chair|dining room|stool)\b/, productId: "fur-08" },
  { re: /\bwindow\b/, productId: "fin-04" },
  { re: /\bdoor\b/, productId: "fin-05" },
];

export interface PinImage {
  url: string;
  /** Name of the product in the photo (used as alt text) */
  productName: string;
}

export function pinImage(pin: Pick<StylePin, "label" | "cat" | "img">): PinImage | null {
  if (pin.img) return { url: pin.img, productName: pin.label };
  const text = pin.label.toLowerCase();
  for (const r of RULES) {
    if (!r.re.test(text)) continue;
    const p = getProduct(r.productId);
    if (p && p.image.source === "local" && p.image.url.startsWith("/")) {
      return { url: p.image.url, productName: p.name };
    }
  }
  return null;
}
