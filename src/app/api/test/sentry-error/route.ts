import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/**
 * GET /api/test/sentry-error
 * Triggers a captureMessage + a captureException in Sentry for verification.
 * Safe to hit — returns 200. Not indexed.
 *
 * Remove this endpoint after go-live.
 */
export async function GET() {
  Sentry.captureMessage("ModulCA Sentry wiring test — info", "info");

  try {
    throw new Error("ModulCA Sentry wiring test — simulated exception");
  } catch (err) {
    Sentry.captureException(err, {
      tags: { source: "sentry-wiring-test" },
      extra: { note: "Triggered from /api/test/sentry-error" },
    });
  }

  return NextResponse.json({
    ok: true,
    sent: ["captureMessage (info)", "captureException (error)"],
    note: "Check Sentry Issues feed in ~30s",
  });
}
