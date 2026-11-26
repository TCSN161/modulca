"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store";

/** After this long we stop waiting and let the page decide on what it has. */
export const AUTH_READY_TIMEOUT_MS = 10_000;

/**
 * True once the auth session is known (BUG-ST09 / BUG-ST11).
 *
 * On a full page load the auth store starts as `guest_free` and `loadSession()`
 * resolves a moment later. Tier gates and "no projects / sign in" states must
 * not render before that, or a Constructor sees an upgrade prompt.
 */
export function isAuthReady(s: { sessionChecked: boolean; isAuthenticated: boolean }): boolean {
  return s.sessionChecked || s.isAuthenticated;
}

export function useAuthReady(timeoutMs: number = AUTH_READY_TIMEOUT_MS): boolean {
  const ready = useAuthStore(isAuthReady);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(t);
  }, [ready, timeoutMs]);

  return ready || timedOut;
}
