import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSaveProject } = vi.hoisted(() => ({ mockSaveProject: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({
  saveProject: (...args: unknown[]) => mockSaveProject(...args),
}));

import { useDesignStore } from "./store";
import { useLandStore } from "@/features/land/store";
import { setSelectedProducts, getSelectedProducts } from "./productSelection";
import {
  ACTIVE_PROJECT_KEY,
  getProjectSnapshot,
  applyProjectSnapshot,
  getActiveProject,
  saveActiveProject,
} from "./projectSnapshot";

const designInitial = useDesignStore.getState();
const landInitial = useLandStore.getState();

beforeEach(() => {
  useDesignStore.setState(designInitial, true);
  useLandStore.setState(landInitial, true);
  localStorage.clear();
  mockSaveProject.mockReset();
});

describe("getProjectSnapshot", () => {
  it("includes design, land (BUG-X02) and products (BUG-X03)", () => {
    useDesignStore.setState({ finishLevel: "premium" } as never);
    useLandStore.getState().setPolygon([{ lat: 44, lng: 26 }]);
    useLandStore.getState().setGridCells([{ row: 0, col: 0, moduleType: "living" }]);
    setSelectedProducts([{ productId: "p1", quantity: 2 }]);

    const s = getProjectSnapshot();
    expect(s.finishLevel).toBe("premium");
    expect(s.gridCells).toEqual([{ row: 0, col: 0, moduleType: "living" }]);
    expect((s.land as { polygon: unknown }).polygon).toEqual([{ lat: 44, lng: 26 }]);
    expect(s.selectedProducts).toEqual([{ productId: "p1", quantity: 2 }]);
  });
});

describe("applyProjectSnapshot", () => {
  it("restores design, land and products", () => {
    applyProjectSnapshot({
      finishLevel: "basic",
      gridCells: [{ row: 1, col: 1, moduleType: "bedroom" }],
      gridRotation: 0,
      land: { polygon: [{ lat: 1, lng: 2 }], mapCenter: { lat: 3, lng: 4 } },
      selectedProducts: [{ productId: "p9", quantity: 1 }],
    });
    expect(useDesignStore.getState().finishLevel).toBe("basic");
    expect(useLandStore.getState().polygon).toEqual([{ lat: 1, lng: 2 }]);
    expect(useLandStore.getState().mapCenter).toEqual({ lat: 3, lng: 4 });
    expect(useLandStore.getState().gridCells).toHaveLength(1);
    expect(getSelectedProducts()).toEqual([{ productId: "p9", quantity: 1 }]);
  });

  it("leaves products untouched for old projects without selectedProducts", () => {
    setSelectedProducts([{ productId: "keep", quantity: 1 }]);
    applyProjectSnapshot({ finishLevel: "basic" });
    expect(getSelectedProducts()).toEqual([{ productId: "keep", quantity: 1 }]);
  });
});

describe("saveActiveProject", () => {
  const record = (id: string, name: string) => ({
    ok: true,
    value: { id, name, data: {}, thumbnail: null, deleted_at: null, created_at: "", updated_at: "" },
  });

  it("inserts when there is no active project and binds the result", async () => {
    mockSaveProject.mockResolvedValue(record("new-1", "Casa"));
    const r = await saveActiveProject("u1", "Casa");
    expect(r.ok).toBe(true);
    expect(mockSaveProject).toHaveBeenCalledWith("u1", expect.objectContaining({ id: undefined, name: "Casa" }));
    expect(mockSaveProject.mock.calls[0][1].data).toHaveProperty("selectedProducts");
    expect(getActiveProject()).toEqual({ id: "new-1", name: "Casa" });
  });

  it("updates the active project by default; explicit id wins", async () => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify({ id: "act-1", name: "A" }));
    mockSaveProject.mockResolvedValue(record("act-1", "A"));
    await saveActiveProject("u1", "A");
    expect(mockSaveProject.mock.calls[0][1].id).toBe("act-1");
    await saveActiveProject("u1", "A", "other");
    expect(mockSaveProject.mock.calls[1][1].id).toBe("other");
  });

  it("does not touch the active project on failure", async () => {
    mockSaveProject.mockResolvedValue({ ok: false, error: { code: "SUPABASE_ERROR", message: "x" } });
    await saveActiveProject("u1", "X");
    expect(localStorage.getItem(ACTIVE_PROJECT_KEY)).toBeNull();
  });
});
