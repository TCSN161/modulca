"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ModulCA Project Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-200">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-brand-teal-800 mb-2">Design Step Error</h1>
        <p className="text-sm text-gray-500 mb-1">
          Something went wrong in this step. Your design data is saved locally and won&apos;t be lost.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">ID: {error.digest}</p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
