"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase, isDemoMode } from "@/shared/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isDemoMode) {
      // Demo mode — just show success
      setSent(true);
      setLoading(false);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setError("Auth service not available");
      setLoading(false);
      return;
    }

    const { error: resetError } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold text-brand-teal-800">
        Reset your password
      </h1>

      {sent ? (
        <div>
          <div className="mt-4 mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            Check your email for a password reset link. It may take a minute to arrive.
          </div>
          <Link
            href="/login"
            className="block w-full rounded-lg bg-brand-teal-800 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-teal-700"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-gray-500">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {isDemoMode && (
            <div className="mb-4 rounded-lg bg-brand-amber-50 border border-brand-amber-200 px-3 py-2 text-xs text-brand-amber-700">
              Demo mode — password reset is simulated.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
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
              disabled={loading}
              className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-amber-600 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-brand-teal-800 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
