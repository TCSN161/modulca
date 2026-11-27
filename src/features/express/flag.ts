/**
 * EXPRESS_ENABLED feature flag — Express ships dark.
 * Client + server: NEXT_PUBLIC_EXPRESS_ENABLED=1 (inlined at build time).
 * Server only: EXPRESS_ENABLED=1 also turns it on.
 */
const on = (v: string | undefined) => v === "1" || v === "true";

export function isExpressEnabled(): boolean {
  return on(process.env.NEXT_PUBLIC_EXPRESS_ENABLED) || on(process.env.EXPRESS_ENABLED);
}
