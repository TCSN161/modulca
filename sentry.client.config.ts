import * as Sentry from "@sentry/nextjs";

/**
 * Regexes for redacting PII from URLs before Sentry ingests them.
 * Replaces UUIDs and project IDs with [REDACTED] so user-specific paths
 * don't leak through transaction/breadcrumb URLs.
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

  // Only enable in production with a valid DSN
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance: sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay: capture 1% normally, 100% on error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // Mask all text + inputs in session replays — prevents PII leakage through recordings
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error exception captured",
    "Loading chunk",
    "ChunkLoadError",
    "Network request failed",
  ],

  /**
   * GDPR PII scrubbing before send:
   * - Remove user email from user context (keep id only for correlation)
   * - Redact sensitive URL segments (project IDs, tokens, emails in query params)
   * - Strip request cookies and Authorization headers if present
   */
  beforeSend(event) {
    // User context: keep id, remove email + ip
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Request URL redaction
    if (event.request?.url) {
      event.request.url = redactUrl(event.request.url) || event.request.url;
    }
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["Authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["Cookie"];
    }

    // Breadcrumb URL redaction
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => {
        if (b.data && typeof b.data === "object") {
          const data = b.data as Record<string, unknown>;
          if (typeof data.url === "string") data.url = redactUrl(data.url);
          if (typeof data.to === "string") data.to = redactUrl(data.to);
          if (typeof data.from === "string") data.from = redactUrl(data.from);
        }
        return b;
      });
    }

    return event;
  },

  // Same scrubbing for transactions (perf spans)
  beforeSendTransaction(event) {
    if (event.request?.url) {
      event.request.url = redactUrl(event.request.url) || event.request.url;
    }
    return event;
  },

  // Tag environment
  environment: process.env.NODE_ENV || "development",
});
