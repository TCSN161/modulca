"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";

/**
 * Lightweight auth guard. Wraps protected pages.
 * In demo mode (no Supabase), allows access after brief check.
 * With Supabase, redirects unauthenticated users to /login.
 *
 * Usage in layout.tsx:
 *   <AuthGuard>{children}</AuthGuard>
 *
 * Set `softGuard` to show content even if not logged in (just loads session).
 */

export default function AuthGuard({
  children,
  softGuard = false,
}: {
  children: React.ReactNode;
  softGuard?: boolean;
}) {
  const { isAuthenticated, loading } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Give loadSession a tick to hydrate
    const timer = setTimeout(() => setChecked(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Still loading
  if (!checked || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
      </div>
    );
  }

  // Soft guard: always show content (just triggers session load)
  if (softGuard) return <>{children}</>;

  // Hard guard: redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login");
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
