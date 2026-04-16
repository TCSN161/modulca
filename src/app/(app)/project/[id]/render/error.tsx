"use client";

import StepErrorBoundary from "@/features/design/components/shared/StepErrorBoundary";

export default function RenderError({
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
      stepName="Render"
      hint="The render engine may have timed out. Try again or reduce image quality."
    />
  );
}
