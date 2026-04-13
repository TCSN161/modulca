"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/shared/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * Auth Callback Page — handles Supabase redirects for:
 * - Google OAuth callback (token in URL hash)
 * - Password reset callback (token in URL hash)
 * - Email confirmation callback
 *
 * Key insight: Supabase sets the session client-side, but our middleware
 * checks cookies server-side. We must set the `modulca-auth-active` cookie
 * BEFORE redirecting, so middleware allows access to /dashboard.
 *
 * We use window.location.href (full page navigation) instead of router.replace
 * so the middleware sees the cookie on the next server request.
 */

function setAuthCookie() {
  document.cookie =
    "modulca-auth-active=1; path=/; max-age=2592000; SameSite=Lax";
}

function redirectTo(path: string) {
  // Use full navigation (not Next.js router) so middleware runs fresh
  // and picks up the newly set cookie
  window.location.href = path;
}

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const sb = getSupabase();
      if (!sb) {
        // Demo mode — set cookie and go to dashboard
        setAuthCookie();
        redirectTo("/dashboard");
        return;
      }

      // Check the URL hash for the type of callback
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const type = params.get("type");

      try {
        // Listen for auth state change FIRST (before getSession)
        // This catches the token exchange as it happens
        const { data: { subscription } } = sb.auth.onAuthStateChange(
          (event, session) => {
            console.log("[ModulCA] Auth callback event:", event);

            if (event === "PASSWORD_RECOVERY") {
              subscription.unsubscribe();
              setAuthCookie();
              redirectTo("/update-password");
              return;
            }

            if (
              event === "SIGNED_IN" ||
              event === "TOKEN_REFRESHED" ||
              event === "INITIAL_SESSION"
            ) {
              if (session) {
                subscription.unsubscribe();
                setAuthCookie();
                redirectTo("/dashboard");
                return;
              }
            }
          }
        );

        // Also check if type=recovery in hash (Supabase sometimes uses this)
        if (type === "recovery") {
          // Wait a moment for Supabase to process the recovery token
          setTimeout(() => {
            setAuthCookie();
            redirectTo("/update-password");
          }, 1500);
          return;
        }

        // Timeout after 10 seconds — if nothing happened, show error
        setTimeout(() => {
          subscription.unsubscribe();
          setError(
            "Authentication timed out. Please try signing in again."
          );
        }, 10000);
      } catch (err) {
        console.error("[ModulCA] Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
        <a
          href="/login"
          className="inline-block rounded-lg bg-brand-teal-800 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-teal-700"
        >
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-teal-600 mb-4" />
      <p className="text-sm text-gray-500">Completing authentication...</p>
      <p className="mt-2 text-xs text-gray-400">
        You&apos;ll be redirected automatically.
      </p>
    </div>
  );
}
