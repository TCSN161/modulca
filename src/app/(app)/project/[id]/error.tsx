"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

/**
 * Catch-all error boundary for the project route.
 * Individual steps (visualize, render, walkthrough, technical, presentation)
 * have their own error.tsx with step-specific hints.
 * This catches anything that falls through.
 */
export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StepErrorBoundary
      error={error}
      reset={reset}
      stepName="Design"
    />
  );
}
