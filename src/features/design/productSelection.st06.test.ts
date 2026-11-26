import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSaveProject } = vi.hoisted(() => ({ mockSaveProject: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({
  saveProject: (...args: unknown[]) => mockSaveProject(...args),
}));

import {
  setSelectedProducts,
  getSelectedProducts,
  hasPendingSelectedProducts,
  clearPendingSelectedProducts,
  subscribeSelectedProducts,
} from "./productSelection";
import { applyProjectSnapshot, saveActiveProject } from "./projectSnapshot";

beforeEach(() => {
  localStorage.clear();
  mockSaveProject.mockReset();
});

describe("BUG-ST06: products survive a full page load", () => {
  it("a user edit is pending and announced; a no-op write is not", () => {
    const seen: string[] = [];
    const off = subscribeSelectedProducts((src) => seen.push(src));
    expect(setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" })).toBe(true);
    expect(setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" })).toBe(false);
    off();
    expect(seen).toEqual(["user"]);
    expect(hasPendingSelectedProducts("p1")).toBe(true);
    expect(hasPendingSelectedProducts("other")).toBe(false);
  });

  it("the cloud load does not overwrite unsaved local products of the same project", () => {
    setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" });
    applyProjectSnapshot({ selectedProducts: [] }, { projectId: "p1" });
    expect(getSelectedProducts()).toEqual([{ productId: "a", quantity: 2 }]);
  });

  it("another project's cloud copy still replaces the selection", () => {
    setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" });
    applyProjectSnapshot({ selectedProducts: [{ productId: "b", quantity: 1 }] }, { projectId: "p2" });
    expect(getSelectedProducts()).toEqual([{ productId: "b", quantity: 1 }]);
  });

  it("a cloud write is announced as 'cloud' and is not pending", () => {
    const seen: string[] = [];
    const off = subscribeSelectedProducts((src) => seen.push(src));
    applyProjectSnapshot({ selectedProducts: [{ productId: "b", quantity: 1 }] }, { projectId: "p2" });
    off();
    expect(seen).toEqual(["cloud"]);
    expect(hasPendingSelectedProducts("p2")).toBe(false);
  });

  it("a successful save clears the pending marker, so the cloud wins again", async () => {
    setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" });
    mockSaveProject.mockResolvedValue({ ok: true, value: { id: "p1", name: "X" } });
    await saveActiveProject("u1", "X", "p1");
    expect(mockSaveProject.mock.calls[0][1].data.selectedProducts).toEqual([{ productId: "a", quantity: 2 }]);
    expect(hasPendingSelectedProducts("p1")).toBe(false);
  });

  it("an edit made after the save started stays pending", () => {
    const before = Date.now() - 1000;
    setSelectedProducts([{ productId: "a", quantity: 1 }], { projectId: "p1" });
    clearPendingSelectedProducts(before);
    expect(hasPendingSelectedProducts("p1")).toBe(true);
  });

  it("a failed save keeps the edit pending", async () => {
    setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" });
    mockSaveProject.mockResolvedValue({ ok: false, error: "offline" });
    await saveActiveProject("u1", "X", "p1");
    expect(hasPendingSelectedProducts("p1")).toBe(true);
  });
});
