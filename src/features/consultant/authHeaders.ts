import { getSupabase } from "@/shared/lib/supabase";

/**
 * Bearer header for calls to tier-gated API routes (BUG-SEC-02).
 * The Supabase session lives in localStorage, so the server only sees the user
 * if we send the access token; without it the caller is treated as a guest.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  try {
    const sb = getSupabase();
    const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
