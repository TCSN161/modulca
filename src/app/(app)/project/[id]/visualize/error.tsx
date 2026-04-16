"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

export default function VisualizeError({
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
      stepName="Visualize"
      hint="The 3D viewer may have encountered a WebGL issue. Try reloading."
    />
  );
}
