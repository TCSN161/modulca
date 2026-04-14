import { NextResponse } from "next/server";
import { getBudgetSummary } from "../engines/creditManager";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai-render/budget
 *
 * Returns current credit/budget status for all engines.
 * Used by admin dashboard to monitor spending and remaining credits.
 */
export async function GET() {
  try {
    const summary = getBudgetSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[api/ai-render/budget] GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve budget summary" },
      { status: 500 },
    );
  }
}
