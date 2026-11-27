/** BUG-ST38: no "Log in" / "Guest" / "--/1" flash before the session is known. */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("@/features/auth/projectService", () => ({
  listProjectsSettled: vi.fn().mockResolvedValue([]),
  deleteProject: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard",
}));

import DashboardPage from "./page";
import { useAuthStore } from "@/features/auth/store";

describe("Dashboard header before the session loads (BUG-ST38)", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, sessionChecked: false, userTier: "guest_free", userId: null });
  });

  it("shows a neutral skeleton, not Log in / Guest / a project limit", async () => {
    await act(async () => {
      render(<DashboardPage />);
    });
    expect(screen.getByTestId("dashboard-auth-skeleton")).toBeTruthy();
    expect(screen.queryByText("Log in")).toBeNull();
    expect(screen.queryByText("/1")).toBeNull();
    expect(document.body.textContent).not.toMatch(/Guest/);
  });

  it("shows the real header once the session is checked", async () => {
    useAuthStore.setState({ isAuthenticated: false, sessionChecked: true });
    await act(async () => {
      render(<DashboardPage />);
    });
    expect(screen.queryByTestId("dashboard-auth-skeleton")).toBeNull();
    expect(screen.getByText("Log in")).toBeTruthy();
  });
});
