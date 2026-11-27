/** BUG-ST39: the architect header shows the project name, never the raw id. */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const ID = "5895a485-1111-2222-3333-444455556666";
const { mockLoad } = vi.hoisted(() => ({ mockLoad: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({ loadProject: (...a: unknown[]) => mockLoad(...a) }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: ID }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => `/project/${ID}/architect`,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/features/architect/components/ArchitectWorkspace", () => ({ default: () => null }));
vi.mock("@/features/auth/components/AuthNav", () => ({ AuthNav: () => null }));

import ArchitectPage from "./page";
import { useArchitectStore } from "@/features/architect/store";
import { useAuthStore } from "@/features/auth/store";

describe("Architect header project name (BUG-ST39)", () => {
  beforeEach(() => {
    localStorage.clear();
    useArchitectStore.setState({ project: null });
    useAuthStore.setState({ userId: "u1", isAuthenticated: true, sessionChecked: true });
    mockLoad.mockReset().mockResolvedValue({ ok: true, value: { id: ID, name: "Casa Muraru" } });
  });

  it("loads the saved project's name instead of the id", async () => {
    await act(async () => {
      render(<ArchitectPage />);
    });
    expect(screen.getByTestId("architect-project-name").textContent).toBe("Casa Muraru");
    expect(document.body.textContent).not.toContain(ID);
    expect(useArchitectStore.getState().project?.projectName).toBe("Casa Muraru");
  });

  it("uses the active project name without a network call", async () => {
    localStorage.setItem("modulca-active-project", JSON.stringify({ id: ID, name: "Vila Snagov" }));
    await act(async () => {
      render(<ArchitectPage />);
    });
    expect(screen.getByTestId("architect-project-name").textContent).toBe("Vila Snagov");
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("repairs an old stored 'Project <id>' name", async () => {
    useArchitectStore.setState({ project: null });
    useArchitectStore.getState().initProject(ID, `Project ${ID}`);
    useArchitectStore.getState().saveToStorage();
    useArchitectStore.setState({ project: null });
    await act(async () => {
      render(<ArchitectPage />);
    });
    expect(useArchitectStore.getState().project?.projectName).toBe("Casa Muraru");
  });
});
