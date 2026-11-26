import { describe, it, expect, beforeEach } from "vitest";
import {
  SELECTED_PRODUCTS_KEY,
  getSelectedProducts,
  setSelectedProducts,
  parseSelectedProducts,
} from "./productSelection";

describe("productSelection (BUG-X03)", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips the {productId, quantity} shape", () => {
    setSelectedProducts([{ productId: "oak-floor", quantity: 3 }]);
    expect(JSON.parse(localStorage.getItem(SELECTED_PRODUCTS_KEY)!)).toEqual([
      { productId: "oak-floor", quantity: 3 },
    ]);
    expect(getSelectedProducts()).toEqual([{ productId: "oak-floor", quantity: 3 }]);
  });

  it("reads what the old ProductsPage wrote", () => {
    localStorage.setItem(SELECTED_PRODUCTS_KEY, JSON.stringify([{ productId: "a", quantity: 2 }]));
    expect(getSelectedProducts()).toEqual([{ productId: "a", quantity: 2 }]);
  });

  it("returns [] for missing or corrupt storage", () => {
    expect(getSelectedProducts()).toEqual([]);
    localStorage.setItem(SELECTED_PRODUCTS_KEY, "nope{");
    expect(getSelectedProducts()).toEqual([]);
  });

  it("drops invalid items and strips extra keys", () => {
    expect(
      parseSelectedProducts([
        { productId: "ok", quantity: 2.7, extra: 1 },
        { id: "legacy", quantity: 1 },
        { productId: "", quantity: 1 },
        { productId: "zero", quantity: 0 },
        null,
      ]),
    ).toEqual([{ productId: "ok", quantity: 2 }]);
    expect(parseSelectedProducts("x")).toEqual([]);
  });
});
