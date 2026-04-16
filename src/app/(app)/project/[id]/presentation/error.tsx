"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

export default function PresentationError({
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
      stepName="Presentation"
      hint="PDF or slide generation may have encountered an issue."
    />
  );
}
