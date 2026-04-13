/**
 * Render Cache — content-addressable cache for AI renders.
 *
 * Cache key = hash(prompt + width + height + engine).
 * On cache hit, returns the stored image from Supabase Storage.
 * On miss, the caller renders normally and calls cacheResult() to store.
 *
 * Falls back gracefully: if Supabase is unavailable, caching is skipped.
 */

import { createHash } from "crypto";
import { getSupabaseServer } from "@/shared/lib/supabase-server";

const BUCKET = "renders";

/** Generate a deterministic cache key from render params */
export function makeCacheKey(prompt: string, width: number, height: number, engineId: string): string {
  const input = `${prompt}|${width}|${height}|${engineId}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

/** Check if a cached render exists and return it */
export async function getCachedRender(
  cacheKey: string
): Promise<{ buffer: Buffer; contentType: string; engineId: string } | null> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    // Look up cache entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entry } = await (supabase.from("render_cache") as any)
      .select("storage_path, content_type, engine_id")
      .eq("cache_key", cacheKey)
      .single();

    if (!entry) return null;
    const cacheEntry = entry as { storage_path: string; content_type: string; engine_id: string };

    // Download from storage
    const { data: blob, error } = await supabase.storage
      .from(BUCKET)
      .download(cacheEntry.storage_path);

    if (error || !blob) return null;

    // Update access stats (fire and forget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("render_cache") as any)
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("cache_key", cacheKey)
      .then(() => {});

    const arrayBuffer = await blob.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: cacheEntry.content_type,
      engineId: cacheEntry.engine_id,
    };
  } catch (err) {
    console.warn("[renderCache] Cache lookup failed:", err);
    return null;
  }
}

/** Store a render result in the cache */
export async function cacheResult(
  cacheKey: string,
  engineId: string,
  buffer: Buffer,
  contentType: string,
  width: number,
  height: number,
): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) return;

    const ext = contentType.includes("webp") ? "webp" : contentType.includes("jpeg") ? "jpg" : "png";
    const storagePath = `cache/${cacheKey}.${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn("[renderCache] Upload failed:", uploadError.message);
      return;
    }

    // Insert cache entry (upsert)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("render_cache") as any).upsert(
      {
        cache_key: cacheKey,
        storage_path: storagePath,
        engine_id: engineId,
        content_type: contentType,
        image_size_bytes: buffer.length,
        width,
        height,
      },
      { onConflict: "cache_key" }
    );
  } catch (err) {
    console.warn("[renderCache] Cache store failed:", err);
  }
}
