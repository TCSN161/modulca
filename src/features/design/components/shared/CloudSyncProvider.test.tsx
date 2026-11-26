import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

const { mockLoad, mockSave, mockList } = vi.hoisted(() => ({
  mockLoad: vi.fn(),
  mockSave: vi.fn(),
  mockList: vi.fn(),
}));
vi.mock("@/features/auth/projectService", () => ({
  loadProject: (...a: unknown[]) => mockLoad(...a),
  saveProject: (...a: unknown[]) => mockSave(...a),
  listProjects: (...a: unknown[]) => mockList(...a),
}));
vi.mock("@/shared/hooks/useProjectId", () => ({ useProjectId: () => "p1" }));

import CloudSyncProvider from "./CloudSyncProvider";
import { useAuthStore } from "@/features/auth/store";
import { useDesignStore } from "../../store";
import { getSelectedProducts, setSelectedProducts } from "../../productSelection";

describe("CloudSyncProvider products (BUG-ST06)", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("modulca-cloud-migrated", "1");
    mockLoad.mockReset();
    mockSave.mockReset().mockResolvedValue({ ok: true, value: { id: "p1", name: "P" } });
    mockList.mockReset().mockResolvedValue([]);
    useAuthStore.setState({ isAuthenticated: true, userId: "u1", sessionChecked: true });
    useDesignStore.setState({
      modules: [{ id: "m1", row: 0, col: 0, moduleType: "living" }] as never,
    });
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("keeps unsaved local products over the cloud copy, then saves them", async () => {
    setSelectedProducts([{ productId: "a", quantity: 2 }], { projectId: "p1" });
    mockLoad.mockResolvedValue({ ok: true, value: { id: "p1", data: { selectedProducts: [] } } });

    render(<CloudSyncProvider>x</CloudSyncProvider>);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getSelectedProducts()).toEqual([{ productId: "a", quantity: 2 }]);

    await act(async () => {
      vi.advanceTimersByTime(5100);
      await Promise.resolve();
    });
    const saved = mockSave.mock.calls.at(-1)?.[1] as { data: { selectedProducts: unknown } };
    expect(saved.data.selectedProducts).toEqual([{ productId: "a", quantity: 2 }]);
  });

  it("a product change after load triggers the auto-save", async () => {
    mockLoad.mockResolvedValue({ ok: true, value: { id: "p1", data: {} } });
    render(<CloudSyncProvider>x</CloudSyncProvider>);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(5100);
      await Promise.resolve();
    });
    mockSave.mockClear();

    act(() => {
      setSelectedProducts([{ productId: "z", quantity: 1 }], { projectId: "p1" });
    });
    await act(async () => {
      vi.advanceTimersByTime(5100);
      await Promise.resolve();
    });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect((mockSave.mock.calls[0][1] as { data: { selectedProducts: unknown } }).data.selectedProducts).toEqual([
      { productId: "z", quantity: 1 },
    ]);
  });
});
