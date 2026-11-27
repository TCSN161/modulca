import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({
  listProjectsSettled: (...a: unknown[]) => mockList(...a),
  saveProject: vi.fn(),
}));
vi.mock("@/shared/hooks/useProjectId", () => ({ useProjectId: () => "p1" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/project/p1/finalize",
  useParams: () => ({ id: "p1" }),
}));

import FinalizePage from "./FinalizePage";
import { useAuthStore } from "@/features/auth/store";
import { useDesignStore } from "../../store";
import { setSelectedProducts } from "../../productSelection";
import { computeProjectCost } from "../../projectCost";

describe("FinalizePage (BUG-ST08 + ST12)", () => {
  beforeEach(() => {
    localStorage.clear();
    mockList.mockReset().mockResolvedValue([{ id: "a" }, { id: "b" }, { id: "c" }]);
    useAuthStore.setState({ isAuthenticated: true, userId: "u1", sessionChecked: true, userTier: "constructor" });
    useDesignStore.getState().setModulesFromGrid(
      [
        { row: 0, col: 0, moduleType: "living" },
        { row: 0, col: 1, moduleType: "bedroom" },
      ] as never,
      0,
    );
    setSelectedProducts([{ productId: "fin-02", quantity: 2 }], { projectId: "p1" });
  });

  it("lists the selected products, adds them to the total, and counts projects like the dashboard", async () => {
    await act(async () => {
      render(<FinalizePage />);
    });
    const section = screen.getByTestId("finalize-products");
    expect(section.textContent).toContain("Gypsum Wall Panels");
    expect(screen.getByText(/3 projects saved/)).toBeTruthy();

    const s = useDesignStore.getState();
    const expected = computeProjectCost({
      modules: s.modules,
      finishLevel: s.finishLevel,
      selectedProducts: [{ productId: "fin-02", quantity: 2 }],
    });
    expect(document.body.textContent).toContain(`€${Math.round(expected.grandTotal).toLocaleString()}`);
  });
});
