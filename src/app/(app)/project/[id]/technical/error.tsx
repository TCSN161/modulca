"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

export default function TechnicalError({
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
      stepName="Technical"
      hint="Technical drawing generation may have failed. Try again."
    />
  );
}
