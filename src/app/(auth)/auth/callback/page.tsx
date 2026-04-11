"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/shared/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * Auth Callback Page — handles Supabase redirects for:
 * - Google OAuth callback (token in URL hash)
 * - Password reset callback (token in URL hash)
 * - Email confirmation callback
 *
 * Supabase client's `detectSessionInUrl: true` picks up the hash tokens
 * automatically. We just need to wait for it, then redirect.
 */

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const sb = getSupabase();
      if (!sb) {
        // Demo mode — just go to dashboard
        router.replace("/dashboard");
        return;
      }

      // Check the URL hash for the type of callback
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const type = params.get("type");

      try {
        // Wait for Supabase to process the session from URL hash
        const { data: { session }, error: sessionError } = await sb.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        // If this is a password recovery callback, redirect to update-password page
        if (type === "recovery") {
          router.replace("/update-password");
          return;
        }

        // For OAuth or email confirmation — redirect to dashboard
        if (session) {
          router.replace("/dashboard");
        } else {
          // No session yet — Supabase might still be processing
          // Listen for auth state change
          const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
              subscription.unsubscribe();
              if (event === "PASSWORD_RECOVERY") {
                router.replace("/update-password");
              } else {
                router.replace("/dashboard");
              }
            }
          });

          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            setError("Authentication timed out. Please try again.");
          }, 10000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [router]);

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
      <p className="mt-2 text-xs text-gray-400">You&apos;ll be redirected automatically.</p>
    </div>
  );
}
