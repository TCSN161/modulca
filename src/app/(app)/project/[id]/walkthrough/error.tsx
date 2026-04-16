"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

export default function WalkthroughError({
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
      stepName="Walkthrough"
      hint="The 3D walkthrough may have run into a canvas or memory issue."
    />
  );
}
