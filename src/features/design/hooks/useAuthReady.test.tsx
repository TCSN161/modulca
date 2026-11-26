import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useAuthStore } from "@/features/auth/store";
import { isAuthReady, useAuthReady } from "./useAuthReady";

function Probe({ timeoutMs }: { timeoutMs?: number }) {
  const ready = useAuthReady(timeoutMs);
  return <span data-testid="probe">{ready ? "ready" : "waiting"}</span>;
}

describe("useAuthReady (BUG-ST09 / ST11)", () => {
  beforeEach(() => {
    useAuthStore.setState({ sessionChecked: false, isAuthenticated: false, userTier: "guest_free" });
  });
  afterEach(() => vi.useRealTimers());

  it("isAuthReady: waits until the session was checked or the user is signed in", () => {
    expect(isAuthReady({ sessionChecked: false, isAuthenticated: false })).toBe(false);
    expect(isAuthReady({ sessionChecked: true, isAuthenticated: false })).toBe(true);
    expect(isAuthReady({ sessionChecked: false, isAuthenticated: true })).toBe(true);
  });

  it("flips to ready when loadSession finishes", async () => {
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe("waiting");
    await act(async () => {
      await useAuthStore.getState().loadSession();
    });
    expect(useAuthStore.getState().sessionChecked).toBe(true);
    expect(screen.getByTestId("probe").textContent).toBe("ready");
  });

  it("stops waiting after the timeout", () => {
    vi.useFakeTimers();
    render(<Probe timeoutMs={50} />);
    expect(screen.getByTestId("probe").textContent).toBe("waiting");
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(screen.getByTestId("probe").textContent).toBe("ready");
  });
});
