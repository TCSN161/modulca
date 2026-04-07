"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ModulCA Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <span className="text-2xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>

        {/* Error illustration */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-20 w-20 rounded-lg bg-red-50 border-2 border-red-200 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest">Something went wrong</p>
        </div>

        <h1 className="text-2xl font-bold text-brand-teal-800 mb-2">
          Construction Error
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          Something unexpected happened. Don&apos;t worry — your design data is saved locally.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-brand-teal-800 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
