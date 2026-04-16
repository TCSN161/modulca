import { NextResponse } from "next/server";
import { getPopularArticles } from "../route";

export const dynamic = "force-dynamic";

/**
 * Returns the top N most-viewed articles (in-memory tracking).
 * Used by the library page to highlight trending content.
 */
export async function GET() {
  try {
    const popular = getPopularArticles(10);
    return NextResponse.json({ popular });
  } catch (err) {
    console.error("[knowledge/popular] Unhandled error:", err);
    return NextResponse.json(
      { error: "Could not fetch popular articles.", popular: [] },
      { status: 500 }
    );
  }
}
