#!/usr/bin/env node
/**
 * Sentry smoke test — sends a test exception via the @sentry/node SDK.
 * Uses SENTRY_DSN from .env.local.
 */
import { readFileSync } from "node:fs";
import * as Sentry from "@sentry/node";

// Load .env.local manually (no dotenv dependency)
const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    })
);

const DSN = env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN;
if (!DSN) {
  console.error("No SENTRY_DSN found in .env.local");
  process.exit(1);
}

Sentry.init({
  dsn: DSN,
  environment: "smoke-test",
  tracesSampleRate: 0,
});

console.log("→ Sending test exception to Sentry...");

const eventId = Sentry.captureException(
  new Error(`ModulCA production smoke test — ${new Date().toISOString()}`),
  { tags: { source: "smoke-test", target: "production" } }
);

console.log(`✓ Event captured with ID: ${eventId}`);

await Sentry.flush(5000);
console.log("✓ Sentry flushed. Check https://modulca.sentry.io/ for the event.");
process.exit(0);
