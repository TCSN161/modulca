"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ModulCA Auth Error]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <Link href="/" className="inline-block mb-6">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <h1 className="text-lg font-bold text-brand-teal-800 mb-2">Authentication Error</h1>
        <p className="text-sm text-gray-500 mb-6">Something went wrong. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="rounded-lg bg-brand-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-amber-600">
            Try Again
          </button>
          <Link href="/login" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-gray-50">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
