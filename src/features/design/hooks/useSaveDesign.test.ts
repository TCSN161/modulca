import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSaveDesign } from "./useSaveDesign";

/* ═══════════════════════════════════════════════════════════
   Hoisted mocks (available inside vi.mock factories)
   ═══════════════════════════════════════════════════════════ */

const { mockSaveToLocalStorage, mockSaveProject, mockAuthState } = vi.hoisted(() => ({
  mockSaveToLocalStorage: vi.fn(),
  mockSaveProject: vi.fn(),
  mockAuthState: { userId: null as string | null, isAuthenticated: false },
}));

/* ═══════════════════════════════════════════════════════════
   Module Mocks
   ═══════════════════════════════════════════════════════════ */

vi.mock("@/shared/hooks/useProjectId", () => ({
  useProjectId: () => "test-project-id",
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-project-id" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../store", () => {
  const storeState = {
    modules: [{ type: "living" }],
    finishLevel: "standard",
    gridRotation: 0,
    styleDirection: "modern",
    styleDescription: "",
    stylePhoto: null,
    moodboardPins: [],
    savedRenders: [],
    moduleFixtures: {},
    saveToLocalStorage: mockSaveToLocalStorage,
    loadFromLocalStorage: vi.fn(),
  };
  const useDesignStore = Object.assign(
    (selector: (s: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState, setState: vi.fn(), subscribe: vi.fn() },
  );
  return { useDesignStore };
});

vi.mock("@/features/auth/projectService", () => ({
  saveProject: (...args: unknown[]) => mockSaveProject(...args),
  loadProject: vi.fn(),
}));

vi.mock("@/features/auth/store", () => ({
  useAuthStore: Object.assign(
    (selector: (s: typeof mockAuthState) => unknown) => selector(mockAuthState),
    {
      getState: () => mockAuthState,
      setState: (partial: Partial<typeof mockAuthState>) => Object.assign(mockAuthState, partial),
      subscribe: vi.fn(),
    },
  ),
}));

/* ═══════════════════════════════════════════════════════════
   Tests
   ═══════════════════════════════════════════════════════════ */

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  Object.assign(mockAuthState, { userId: null, isAuthenticated: false });
});

describe("useSaveDesign", () => {
  it("returns initial state with saved=false, saving=false, cloudSynced=false", () => {
    const { result } = renderHook(() => useSaveDesign());
    expect(result.current.saved).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.cloudSynced).toBe(false);
  });

  it("handleSave calls saveToLocalStorage", async () => {
    const { result } = renderHook(() => useSaveDesign());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveToLocalStorage).toHaveBeenCalledOnce();
  });

  it("sets saved=true after handleSave then resets after timeout", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSaveDesign());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.saved).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.saved).toBe(false);
    vi.useRealTimers();
  });

  it("does NOT attempt cloud save when user is not authenticated", async () => {
    const { result } = renderHook(() => useSaveDesign());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveProject).not.toHaveBeenCalled();
    expect(result.current.cloudSynced).toBe(false);
  });

  it("attempts cloud save when user is authenticated", async () => {
    Object.assign(mockAuthState, { userId: "user-1", isAuthenticated: true });
    mockSaveProject.mockResolvedValue({ ok: true, value: { id: "cloud-proj-1", name: "Test", data: {}, thumbnail: null, deleted_at: null, created_at: "", updated_at: "" } });

    const { result } = renderHook(() => useSaveDesign());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveProject).toHaveBeenCalledOnce();
    expect(mockSaveProject).toHaveBeenCalledWith("user-1", expect.objectContaining({
      name: expect.any(String),
      data: expect.any(Object),
    }));
    expect(result.current.cloudSynced).toBe(true);
  });

  it("sets cloudSynced=false when cloud save fails", async () => {
    Object.assign(mockAuthState, { userId: "user-1", isAuthenticated: true });
    mockSaveProject.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSaveDesign());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.cloudSynced).toBe(false);
  });
});
