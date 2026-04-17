/**
 * API Route Auth Helper
 *
 * Validates the Supabase session from the request's Authorization header
 * or cookies. Used by API routes that need to know the authenticated user.
 *
 * Returns the authenticated user ID, or null if unauthenticated.
 * Never trust user IDs from request bodies — always use this helper.
 */

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

/**
 * Extracts and verifies the Supabase session from the request.
 * Accepts `Authorization: Bearer <token>` header OR Supabase cookies.
 * Returns null if not authenticated or if Supabase is not configured.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;

  // Try Authorization header first (API clients, fetch with auth token)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  // Fallback: parse Supabase cookie (cookies set by @supabase/ssr client)
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        // Cookie value is a JSON array; first element is the access token
        const parsed = JSON.parse(decoded) as [string, ...unknown[]];
        if (Array.isArray(parsed) && typeof parsed[0] === "string") {
          token = parsed[0];
        }
      } catch {
        // Fall through; token stays null
      }
    }
  }

  if (!token) return null;

  // Verify token via Supabase using anon key + token
  const sb = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Convenience: return the user ID or null. Use when you only need the ID.
 */
export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const user = await getAuthenticatedUser(req);
  return user?.id ?? null;
}
