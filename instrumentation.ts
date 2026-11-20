/**
 * Next.js 16 instrumentation hook.
 *
 * This file is auto-loaded by Next.js at server startup and routes
 * Sentry initialization to the correct runtime (nodejs or edge).
 *
 * Next 16 convention replaces the legacy sentry.server.config.ts /
 * sentry.edge.config.ts auto-loading. Those files are still imported
 * from here, so their PII scrubbing logic continues to apply unchanged.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Captures uncaught errors from React Server Components and passes
 * them to Sentry's request-error handler.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
