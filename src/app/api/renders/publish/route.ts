/**
 * POST /api/renders/publish
 *
 * Publishes a just-generated render to the public gallery.
 * Input: JSON body with image (base64 data URL) + metadata.
 * Output: { slug, imageUrl, thumbUrl }
 *
 * Flow:
 *   1. Validate + decode input image
 *   2. Process via sharp → WebP full (~400 KB) + WebP thumbnail (~30 KB)
 *   3. Embed QR code watermark linking to /g/{slug}
 *   4. Upload both to Supabase Storage bucket 'renders-public'
 *   5. Insert row in public_renders table
 *   6. Trigger FIFO cleanup (service-side RPC)
 *
 * Auth: callers must be logged in OR mark isAdmin=true with service role.
 * Rate limit: single render per minute per user (basic anti-abuse).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processRenderImage, generateRenderSlug } from "@/features/gallery/processor";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.modulca.eu";
const BUCKET = "renders-public";

interface PublishBody {
  imageDataUrl: string;                // "data:image/png;base64,..."
  engineId: string;
  userId?: string;
  isAdmin?: boolean;                    // true if published from /admin tester
  promptExcerpt?: string;
  roomType?: string;
  styleDirection?: string;
  finishLevel?: string;
  moduleCount?: number;
  areaSqm?: number;
  estimatedCostEur?: number;
  showPrice?: boolean;
  latencyMs?: number;
  userTier?: string;
  country?: string;
  seed?: string;
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.imageDataUrl?.startsWith("data:image/")) {
    return NextResponse.json({ error: "imageDataUrl must be a data URL" }, { status: 400 });
  }
  if (!body.engineId) {
    return NextResponse.json({ error: "engineId required" }, { status: 400 });
  }
  if (!body.userId && !body.isAdmin) {
    return NextResponse.json({ error: "User ID or admin flag required" }, { status: 401 });
  }

  // Decode base64
  const match = body.imageDataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Malformed data URL" }, { status: 400 });
  }
  const rawBuffer = Buffer.from(match[1], "base64");
  if (rawBuffer.length < 5000) {
    return NextResponse.json({ error: "Image too small" }, { status: 400 });
  }
  if (rawBuffer.length > 10_000_000) {
    return NextResponse.json({ error: "Image too large (>10MB)" }, { status: 413 });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Rate limit check — max 1 publish/min per user
  if (body.userId) {
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await sb
      .from("public_renders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", body.userId)
      .gte("created_at", since);
    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Rate limit: 1 publish per minute" },
        { status: 429 }
      );
    }
  }

  const slug = generateRenderSlug(body.engineId, body.seed);
  const landingUrl = `${APP_URL}/g/${slug}`;

  // Process image (resize, WebP, QR watermark)
  let processed;
  try {
    processed = await processRenderImage(rawBuffer, {
      watermarkUrl: landingUrl,
      watermarkOpacity: 0.6,
    });
  } catch (err) {
    console.error("[publish] image processing failed:", err);
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }

  // Upload to Supabase Storage
  const fullPath = `${slug}/full.webp`;
  const thumbPath = `${slug}/thumb.webp`;

  const [fullUp, thumbUp] = await Promise.all([
    sb.storage.from(BUCKET).upload(fullPath, processed.fullBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    }),
    sb.storage.from(BUCKET).upload(thumbPath, processed.thumbBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    }),
  ]);

  if (fullUp.error || thumbUp.error) {
    console.error("[publish] upload failed:", fullUp.error || thumbUp.error);
    return NextResponse.json(
      { error: "Upload failed", details: (fullUp.error || thumbUp.error)?.message },
      { status: 500 }
    );
  }

  const { data: fullUrl } = sb.storage.from(BUCKET).getPublicUrl(fullPath);
  const { data: thumbUrl } = sb.storage.from(BUCKET).getPublicUrl(thumbPath);

  // Insert DB row
  const { data: inserted, error: insertErr } = await sb
    .from("public_renders")
    .insert({
      slug,
      image_url: fullUrl.publicUrl,
      thumb_url: thumbUrl.publicUrl,
      file_size_kb: Math.round(processed.originalBytes / 1024),
      engine_id: body.engineId,
      prompt_excerpt: body.promptExcerpt?.slice(0, 200) ?? null,
      latency_ms: body.latencyMs ?? null,
      room_type: body.roomType ?? null,
      style_direction: body.styleDirection ?? null,
      finish_level: body.finishLevel ?? null,
      module_count: body.moduleCount ?? null,
      area_sqm: body.areaSqm ?? null,
      estimated_cost_eur: body.estimatedCostEur ?? null,
      show_price: body.showPrice ?? true,
      user_id: body.userId ?? null,
      is_admin: body.isAdmin ?? false,
      user_tier: body.userTier ?? null,
      country: body.country ?? null,
      status: "active",
    })
    .select("id, slug")
    .single();

  if (insertErr || !inserted) {
    console.error("[publish] DB insert failed:", insertErr);
    // Roll back storage upload
    await sb.storage.from(BUCKET).remove([fullPath, thumbPath]).catch(() => {});
    return NextResponse.json(
      { error: "Database insert failed" },
      { status: 500 }
    );
  }

  // Fire-and-forget FIFO cleanup (Supabase PromiseLike — awaits then swallow)
  try {
    await Promise.resolve(sb.rpc("evict_old_renders"));
  } catch {
    /* cleanup failures shouldn't block publish success */
  }

  return NextResponse.json({
    ok: true,
    slug: inserted.slug,
    id: inserted.id,
    imageUrl: fullUrl.publicUrl,
    thumbUrl: thumbUrl.publicUrl,
    landingUrl,
  });
}
