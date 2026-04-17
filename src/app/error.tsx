"use client";

import * as Sentry from "@sentry/nextjs";
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
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bone-100 px-4 py-16">
      <div className="max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-block">
          <span className="text-2xl font-bold tracking-heading text-brand-charcoal">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>

        {/* Error illustration */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-red-200 bg-red-50">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-gray">
            Something went wrong
          </p>
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-heading text-brand-charcoal md:text-3xl">
          Construction Error
        </h1>
        <p className="mb-2 text-sm text-brand-gray md:text-base">
          Something unexpected happened. Don&apos;t worry — your design data is
          saved locally, and our engineers have been notified.
        </p>
        {error.digest && (
          <p className="mb-6 font-mono text-xs text-brand-gray">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-amber-600"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-brand-bone-300 bg-white px-6 py-3 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-bone-100"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-8 text-xs text-brand-gray">
          If this persists, contact{" "}
          <a
            href="mailto:support@modulca.eu"
            className="underline hover:text-brand-charcoal"
          >
            support@modulca.eu
          </a>
          .
        </p>
      </div>
    </div>
  );
}
