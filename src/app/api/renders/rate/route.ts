/**
 * POST /api/renders/rate
 *
 * Records a 1-5 star rating. Requires authenticated user.
 * User ID is extracted from the verified Supabase session — NEVER trusted from
 * the request body (prevents rating spoofing).
 *
 * Body: { slug: string, stars: 1-5 }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/shared/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Authenticate — extract user ID from verified session, never from body
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    stars?: number;
  };

  if (!body.slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const stars = Math.round(Number(body.stars) || 0);
  if (stars < 1 || stars > 5) {
    return NextResponse.json({ error: "stars must be 1-5" }, { status: 400 });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Look up render
  const { data: render } = await sb
    .from("public_renders")
    .select("id, user_id, rating_sum, rating_count")
    .eq("slug", body.slug)
    .maybeSingle();

  if (!render) {
    return NextResponse.json({ error: "Render not found" }, { status: 404 });
  }

  // Self-rating counts at 0.5 weight (user can rate own but score diluted)
  const isOwner = render.user_id === userId;
  const weight = isOwner ? 0.5 : 1.0;

  // Upsert the rating (unique index on render_id + user_id prevents duplicates)
  const { data: existing } = await sb
    .from("render_ratings")
    .select("id, stars, weight")
    .eq("render_id", render.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    // Update existing rating — adjust the render's rating totals by the delta
    const oldContribution = (existing.stars as number) * (existing.weight as number);
    const newContribution = stars * weight;
    const delta = newContribution - oldContribution;

    await sb
      .from("render_ratings")
      .update({ stars, weight })
      .eq("id", existing.id);

    await sb
      .from("public_renders")
      .update({
        rating_sum: (render.rating_sum as number) + delta,
      })
      .eq("id", render.id);
  } else {
    // New rating
    await sb.from("render_ratings").insert({
      render_id: render.id,
      user_id: userId,
      stars,
      weight,
    });

    await sb
      .from("public_renders")
      .update({
        rating_sum: (render.rating_sum as number) + stars * weight,
        rating_count: (render.rating_count as number) + 1,
      })
      .eq("id", render.id);
  }

  // Re-fetch for the response
  const { data: updated } = await sb
    .from("public_renders")
    .select("rating_sum, rating_count")
    .eq("id", render.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    stars,
    weight,
    isOwner,
    ratingSum: updated?.rating_sum ?? 0,
    ratingCount: updated?.rating_count ?? 0,
    ratingAvg:
      (updated?.rating_count ?? 0) > 0
        ? (updated!.rating_sum as number) / (updated!.rating_count as number)
        : 0,
  });
}
