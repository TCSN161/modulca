/**
 * Gallery service — Supabase fetch for the public gallery and per-render pages.
 *
 * All functions run on the server. If Supabase is unreachable they return
 * empty arrays so the gallery pages render a friendly "no renders yet"
 * state instead of erroring.
 */

import { createClient } from "@supabase/supabase-js";
import { rowToRender, type GallerySettings, type PublicRender } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getReadClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Fetch the most recent active renders (homepage grid) */
export async function listRecentRenders(limit = 100): Promise<PublicRender[]> {
  const sb = getReadClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("public_renders")
      .select("*")
      .in("status", ["active", "hall-of-fame"])
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("[gallery] recent renders fetch failed:", error.message);
      return [];
    }
    return (data || []).map((r) => rowToRender(r as Record<string, unknown>));
  } catch (err) {
    console.warn("[gallery] recent renders threw:", err);
    return [];
  }
}

/** Hall of fame: top-rated renders that were promoted from the FIFO queue */
export async function listHallOfFame(limit = 30): Promise<PublicRender[]> {
  const sb = getReadClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("public_renders")
      .select("*")
      .eq("status", "hall-of-fame")
      .not("image_url", "is", null)
      .order("score_weighted", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []).map((r) => rowToRender(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Single render by slug (for /g/[slug] landing page) */
export async function getRenderBySlug(slug: string): Promise<PublicRender | null> {
  const sb = getReadClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("public_renders")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return rowToRender(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** Similar renders for detail-page related section (same engine or room) */
export async function listRelatedRenders(
  render: PublicRender,
  limit = 4
): Promise<PublicRender[]> {
  const sb = getReadClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("public_renders")
      .select("*")
      .in("status", ["active", "hall-of-fame"])
      .neq("id", render.id)
      .not("image_url", "is", null)
      .or(`engine_id.eq.${render.engineId},room_type.eq.${render.roomType || ""}`)
      .order("score_weighted", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []).map((r) => rowToRender(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getGallerySettings(): Promise<GallerySettings> {
  const sb = getReadClient();
  const defaults: GallerySettings = {
    showPricesGlobally: true,
    showEstimatedCost: true,
    showRatingCounts: true,
    maxActiveRenders: 100,
    maxHallOfFame: 30,
    moderationMode: "off",
    hallScoreThreshold: 3.0,
  };
  if (!sb) return defaults;
  try {
    const { data, error } = await sb
      .from("gallery_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return defaults;
    return {
      showPricesGlobally: (data.show_prices_globally as boolean) ?? true,
      showEstimatedCost: (data.show_estimated_cost as boolean) ?? true,
      showRatingCounts: (data.show_rating_counts as boolean) ?? true,
      maxActiveRenders: (data.max_active_renders as number) ?? 100,
      maxHallOfFame: (data.max_hall_of_fame as number) ?? 30,
      moderationMode: ((data.moderation_mode as "off" | "auto" | "manual") ?? "off"),
      hallScoreThreshold: Number(data.hall_score_threshold ?? 3.0),
    };
  } catch {
    return defaults;
  }
}

/** Increment view counter when a user opens a render detail page */
export async function incrementViewCount(slug: string): Promise<void> {
  const sb = getReadClient();
  if (!sb) return;
  try {
    // Best-effort — we don't want a view counter failure to break the page
    await Promise.resolve(sb.rpc("increment_view_count", { render_slug: slug }));
  } catch {
    /* swallow */
  }
}
