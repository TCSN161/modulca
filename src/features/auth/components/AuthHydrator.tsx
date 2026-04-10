"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store";

/**
 * Invisible component that ensures auth session is hydrated on every page.
 * Place in root layout so it runs regardless of which page loads.
 */
export function AuthHydrator() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return null;
}
