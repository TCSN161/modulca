"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase, isDemoMode } from "@/shared/lib/supabase";
import { Lock, CheckCircle } from "lucide-react";

/**
 * Update Password Page — user lands here after clicking the reset link in email.
 * Supabase automatically sets the session from the URL hash (recovery token).
 * We then call supabase.auth.updateUser({ password }) to set the new password.
 */

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Wait for Supabase to pick up the recovery session from URL hash
  useEffect(() => {
    if (isDemoMode) {
      setSessionReady(true);
      return;
    }

    const sb = getSupabase();
    if (!sb) return;

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    // Also check if session already exists (user came via /auth/callback)
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (isDemoMode) {
      // Demo mode — simulate success
      setSuccess(true);
      setLoading(false);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setError("Auth service not available.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await sb.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);

      // Send password-updated confirmation email (fire-and-forget)
      sb.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "password_reset_confirm", to: data.user.email }),
          }).catch(() => { /* non-blocking */ });
        }
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push("/dashboard"), 2000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
        <h1 className="mb-2 text-2xl font-bold text-brand-teal-800">
          Password Updated
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          Your password has been successfully changed. Redirecting to your dashboard...
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-brand-teal-800 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-teal-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal-50">
          <Lock className="h-5 w-5 text-brand-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-teal-800">
            Set New Password
          </h1>
          <p className="text-sm text-gray-500">
            Choose a strong password for your account.
          </p>
        </div>
      </div>

      {!sessionReady && !isDemoMode && (
        <div className="mb-4 rounded-lg bg-brand-amber-50 border border-brand-amber-200 px-3 py-2 text-xs text-brand-amber-700">
          Verifying your reset link... If this takes too long,{" "}
          <Link href="/reset-password" className="font-medium underline">
            request a new one
          </Link>.
        </div>
      )}

      {isDemoMode && (
        <div className="mb-4 rounded-lg bg-brand-amber-50 border border-brand-amber-200 px-3 py-2 text-xs text-brand-amber-700">
          Demo mode — password update is simulated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-xs font-medium text-gray-600">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Type it again"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-teal-500 focus:ring-1 focus:ring-brand-teal-500"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!sessionReady && !isDemoMode)}
          className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-amber-600 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-500">
        <Link href="/login" className="font-medium text-brand-teal-800 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
