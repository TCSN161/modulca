import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CloudSaveButton from "./CloudSaveButton";
import { useAuthStore } from "@/features/auth/store";

describe("CloudSaveButton (BUG-ST11)", () => {
  beforeEach(() => localStorage.clear());

  it("shows nothing while the session is loading", () => {
    useAuthStore.setState({ isAuthenticated: false, userId: null, sessionChecked: false });
    const { container } = render(<CloudSaveButton />);
    expect(container.textContent).toBe("");
  });

  it("shows 'Sign in to save' once the session is known to be signed out", () => {
    useAuthStore.setState({ isAuthenticated: false, userId: null, sessionChecked: true });
    render(<CloudSaveButton />);
    expect(screen.getByText("Sign in to save")).toBeTruthy();
  });
});
