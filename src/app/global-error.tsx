"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error boundary — catches unhandled errors in the root layout.
 * Reports to Sentry and shows a friendly fallback UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#FAF8F5", color: "#1B3A4B" }}>
        <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: "0 24px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: 24, lineHeight: 1.6 }}>
            An unexpected error occurred. Our team has been notified and is looking into it.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#4A6741",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 32px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <p style={{ marginTop: 16, fontSize: 12, color: "#999" }}>
            If this keeps happening, email{" "}
            <a href="mailto:support@modulca.eu" style={{ color: "#4A6741" }}>
              support@modulca.eu
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
