import * as Sentry from "@sentry/nextjs";

/**
 * Server-side PII redaction mirrors client config (sentry.client.config.ts).
 * Uses simpler URL-only redaction since server doesn't have breadcrumbs by default.
 */
const PII_URL_PATTERNS: [RegExp, string][] = [
  [/\/project\/[^/?#]+/g, "/project/[REDACTED]"],
  [/\/user\/[^/?#]+/g, "/user/[REDACTED]"],
  [/\/account\/[^/?#]+/g, "/account/[REDACTED]"],
  [/[?&]email=[^&]+/gi, "&email=[REDACTED]"],
  [/[?&]token=[^&]+/gi, "&token=[REDACTED]"],
];

function redactUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  let out = url;
  for (const [pattern, replacement] of PII_URL_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance: sample 10% of server transactions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  /**
   * Server-side PII scrubbing:
   * - Remove user email + IP from user context
   * - Redact project IDs and secrets from URLs
   * - Strip sensitive headers (Authorization, Cookie)
   */
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    if (event.request?.url) {
      event.request.url = redactUrl(event.request.url) || event.request.url;
    }
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["Authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["Cookie"];
    }
    if (event.request?.env?.REMOTE_ADDR) {
      event.request.env.REMOTE_ADDR = "[REDACTED]";
    }

    return event;
  },

  beforeSendTransaction(event) {
    if (event.request?.url) {
      event.request.url = redactUrl(event.request.url) || event.request.url;
    }
    return event;
  },

  environment: process.env.NODE_ENV || "development",
});
