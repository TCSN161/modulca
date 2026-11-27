import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { mockSave, mockPush } = vi.hoisted(() => ({ mockSave: vi.fn(), mockPush: vi.fn() }));
vi.mock("@/features/auth/projectService", () => ({ saveProject: (...a: unknown[]) => mockSave(...a) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(""),
}));

import NewProjectPage from "./page";
import { useAuthStore } from "@/features/auth/store";

describe("/project/new (BUG-ST10)", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSave.mockReset().mockResolvedValue({ ok: true, value: { id: "p9", name: "Casa" } });
    useAuthStore.setState({ userId: "u1", isAuthenticated: true, userTier: "constructor" });
  });

  it("template buttons have accessible names and the choice is saved", async () => {
    render(<NewProjectPage />);
    const btn = screen.getByRole("button", { name: "Compact House, 4 modules" });
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: "Casa" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    });
    const data = mockSave.mock.calls[0][1].data;
    expect(data.preset).toBe("house-compact");
    expect(data.modules).toHaveLength(4);
    expect(mockPush).toHaveBeenCalledWith("/project/p9/land");
  });
});
