import { describe, it, expect, beforeEach } from "vitest";
import { resolveSelectedProducts } from "./selectedProducts";
import { getProduct } from "@/assets";

describe("resolveSelectedProducts (BUG-X01)", () => {
  beforeEach(() => localStorage.clear());

  it("resolves the stored {productId, quantity} shape via @/assets", () => {
    localStorage.setItem(
      "modulca-selected-products",
      JSON.stringify([{ productId: "fin-01", quantity: 3 }, { productId: "nope", quantity: 1 }])
    );
    const out = resolveSelectedProducts();
    const p = getProduct("fin-01")!;
    expect(out).toEqual([{ id: "fin-01", name: p.name, quantity: 3, price: p.price }]);
  });

  it("returns [] for the legacy {id} shape and empty storage", () => {
    expect(resolveSelectedProducts()).toEqual([]);
    localStorage.setItem("modulca-selected-products", JSON.stringify([{ id: "fin-01", quantity: 1 }]));
    expect(resolveSelectedProducts()).toEqual([]);
  });

  it("covers products that the old hardcoded catalog missed", () => {
    const out = resolveSelectedProducts([{ productId: "fin-12", quantity: 1 }]);
    expect(out[0]?.id).toBe(getProduct("fin-12") ? "fin-12" : undefined);
  });
});
