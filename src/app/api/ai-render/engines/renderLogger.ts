/**
 * Render Logger — logs every render attempt to Supabase for analytics.
 * Fails silently (non-blocking) so renders still work without Supabase.
 */

import { getSupabaseServer } from "@/shared/lib/supabase-server";

export interface RenderLogEntry {
  user_id?: string;
  prompt: string;
  width: number;
  height: number;
  seed?: string;
  mode: "text2img" | "img2img";
  tier: string;
  engine_id: string;
  engine_label?: string;
  status: "success" | "failed" | "error";
  error_message?: string;
  cost_usd: number;
  latency_ms?: number;
  image_size_bytes?: number;
  content_type?: string;
  cache_hit: boolean;
  cache_key?: string;
}

export async function logRender(entry: RenderLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("render_logs") as any).insert(entry);
  } catch (err) {
    console.warn("[renderLogger] Failed to log render:", err);
  }
}
