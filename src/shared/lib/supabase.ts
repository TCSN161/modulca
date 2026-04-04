"use client";

import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/shared/config";

/**
 * Singleton Supabase browser client.
 * Works with static export (no server routes needed).
 *
 * If SUPABASE_URL is not configured, returns a "demo" client
 * that gracefully degrades — auth operations return null,
 * DB operations fall back to localStorage.
 */

const url = appConfig.supabase.url;
const key = appConfig.supabase.anonKey;

export const isDemoMode = !url || !key;

export const supabase = isDemoMode
  ? (null as unknown as ReturnType<typeof createClient>)
  : createClient(url, key);

/**
 * Helper: safely call supabase. Returns null in demo mode.
 */
export function getSupabase() {
  if (isDemoMode) return null;
  return supabase;
}
