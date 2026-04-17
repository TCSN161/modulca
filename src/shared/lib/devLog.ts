/**
 * Dev-only logging helpers.
 *
 * Use these instead of `console.log` / `console.info` in server-side code
 * so production Vercel logs stay clean and debug output doesn't drive up
 * log costs. `console.error` and `console.warn` should still be used
 * directly — they indicate real problems that should always surface.
 *
 * Usage:
 *   import { devLog, devWarn } from "@/shared/lib/devLog";
 *   devLog("[engine] trying", engineId);     // silent in prod
 *   console.error("[engine] failed", err);   // always logs
 */

const IS_DEV =
  typeof process !== "undefined" &&
  process.env.NODE_ENV !== "production";

export function devLog(...args: unknown[]): void {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function devInfo(...args: unknown[]): void {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
}

export function devWarn(...args: unknown[]): void {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}
