import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using service role key.
 * Use ONLY in API routes / server actions — never expose to browser.
 */
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  _client = createClient(url, key);
  return _client;
}
