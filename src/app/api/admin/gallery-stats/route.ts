/**
 * GET /api/admin/gallery-stats
 *
 * Aggregated analytics from public_renders — used by /admin/gallery.
 * Reads the whole table (cheap — it's bounded by max_active + max_hall + archives),
 * returns summary blocks + time series data.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await sb
    .from("public_renders")
    .select(
      "id, engine_id, room_type, style_direction, finish_level, file_size_kb, " +
        "rating_sum, rating_count, view_count, status, country, user_tier, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as unknown as Array<Record<string, unknown>>;

  // ── Summary
  const total = rows.length;
  const activeCount = rows.filter((r) => r.status === "active").length;
  const hallCount = rows.filter((r) => r.status === "hall-of-fame").length;
  const archivedCount = rows.filter((r) => r.status === "archived").length;
  const totalVotes = rows.reduce((acc, r) => acc + ((r.rating_count as number) || 0), 0);
  const totalViews = rows.reduce((acc, r) => acc + ((r.view_count as number) || 0), 0);
  const totalSizeKb = rows.reduce((acc, r) => acc + ((r.file_size_kb as number) || 0), 0);

  // ── Distribution helpers
  const count = (field: string): Record<string, number> => {
    const acc: Record<string, number> = {};
    for (const r of rows) {
      const v = (r[field] as string) || "unknown";
      acc[v] = (acc[v] ?? 0) + 1;
    }
    return acc;
  };

  const avgRating = (field: string): Record<string, { avg: number; count: number }> => {
    const groups: Record<string, { sum: number; count: number; voters: number }> = {};
    for (const r of rows) {
      if ((r.rating_count as number) === 0) continue;
      const v = (r[field] as string) || "unknown";
      if (!groups[v]) groups[v] = { sum: 0, count: 0, voters: 0 };
      groups[v].sum += (r.rating_sum as number);
      groups[v].voters += (r.rating_count as number);
      groups[v].count += 1;
    }
    const out: Record<string, { avg: number; count: number }> = {};
    for (const [k, g] of Object.entries(groups)) {
      out[k] = { avg: g.voters > 0 ? g.sum / g.voters : 0, count: g.count };
    }
    return out;
  };

  return NextResponse.json({
    summary: {
      totalRenders: total,
      activeCount,
      hallOfFameCount: hallCount,
      archivedCount,
      totalVotes,
      totalViews,
      totalSizeMb: Math.round(totalSizeKb / 1024),
    },
    byEngine: count("engine_id"),
    byRoomType: count("room_type"),
    byStyle: count("style_direction"),
    byFinish: count("finish_level"),
    byTier: count("user_tier"),
    byCountry: count("country"),
    ratingByEngine: avgRating("engine_id"),
    ratingByStyle: avgRating("style_direction"),
    ratingByRoom: avgRating("room_type"),
    topRenders: rows
      .filter((r) => r.rating_count && (r.rating_count as number) > 0)
      .map((r) => ({
        id: r.id,
        engine: r.engine_id,
        room: r.room_type,
        style: r.style_direction,
        avg: (r.rating_sum as number) / (r.rating_count as number),
        votes: r.rating_count,
        views: r.view_count,
      }))
      .sort((a, b) => (b.avg as number) - (a.avg as number))
      .slice(0, 20),
    generatedAt: new Date().toISOString(),
  });
}
