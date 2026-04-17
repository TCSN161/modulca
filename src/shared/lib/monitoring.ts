/**
 * Error Monitoring — thin wrapper over @sentry/nextjs.
 *
 * The Sentry SDK is configured via sentry.client.config.ts / sentry.server.config.ts /
 * sentry.edge.config.ts and only initializes when NEXT_PUBLIC_SENTRY_DSN is set.
 * When the DSN is not set, captureException/captureMessage become no-ops at the
 * SDK level, so these helpers are always safe to call.
 */

import * as Sentry from "@sentry/nextjs";

type ErrorContext = Record<string, unknown>;
type LogLevel = "info" | "warning" | "error" | "fatal";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
const isSentryConfigured = Boolean(SENTRY_DSN);

/**
 * Capture and report an exception.
 * Forwards to Sentry when configured, otherwise logs to console.
 */
export function captureException(
  error: unknown,
  context?: ErrorContext,
): void {
  if (isSentryConfigured) {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  } else {
    console.error("[monitoring] Exception:", error, context ?? "");
  }
}

/**
 * Capture and report a plain-text message at a given severity level.
 * Forwards to Sentry when configured, otherwise logs to console.
 */
export function captureMessage(
  message: string,
  level: LogLevel = "info",
): void {
  if (isSentryConfigured) {
    Sentry.captureMessage(message, level);
  } else {
    const log =
      level === "error" || level === "fatal"
        ? console.error
        : level === "warning"
          ? console.warn
          : console.log;
    log(`[monitoring] ${level}: ${message}`);
  }
}

/**
 * Set user context for error reports.
 * GDPR: we only send `id` to Sentry (for correlation).
 * Email is explicitly stripped via beforeSend hook in sentry.client.config.ts,
 * but we also avoid sending it here to minimize PII in transit.
 *
 * Pass null to clear.
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (!isSentryConfigured) return;
  if (user === null) {
    Sentry.setUser(null);
    return;
  }
  // Intentionally omit email — id is sufficient for correlation
  Sentry.setUser({ id: user.id });
}
