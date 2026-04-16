"use client";

import Link from "next/link";
import { useEffect } from "react";

interface StepErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Human-readable step name, e.g. "Visualize" */
  stepName: string;
  /** Optional hint shown below the main message */
  hint?: string;
}

/**
 * Reusable error boundary UI for individual design steps.
 * Used by per-step error.tsx files so a crash in one step
 * (e.g. 3D canvas, PDF gen) doesn't take down the whole app.
 */
export default function StepErrorBoundary({
  error,
  reset,
  stepName,
  hint,
}: StepErrorBoundaryProps) {
  useEffect(() => {
    console.error(`[ModulCA ${stepName} Error]`, error);
  }, [error, stepName]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-5">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-200">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-brand-charcoal mb-2">
          {stepName} Step Error
        </h1>
        <p className="text-sm text-gray-500 mb-1">
          Something went wrong in the <strong>{stepName}</strong> step.
          Your design data is saved locally and won&apos;t be lost.
        </p>
        {hint && (
          <p className="text-xs text-gray-400 mb-1">{hint}</p>
        )}
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-5">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
