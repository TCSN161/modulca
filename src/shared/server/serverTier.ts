/**
 * Server-side tier resolution (BUG-SEC-02).
 *
 * API routes must NEVER trust a `tier` sent by the browser (body, query, header).
 * Call `getServerTier(req)` instead: it verifies the Supabase session
 * (Authorization: Bearer <access_token>, or the sb-*-auth-token cookie),
 * loads `profiles.tier` + `beta_invited_at` (the promo anchor, BUG-B2-02) with the service role, and applies the
 * same beta-promo logic as the client (`getEffectiveTier` in features/auth/types).
 *
 * Not logged in → guest (`guest_free`), with a hashed IP (or cookie id) as the
 * quota subject so guests can be rate-limited without storing raw IPs.
 */

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";
import { getEffectiveTier, type AccountTier } from "@/features/auth/types";

export interface ServerTierContext {
  /** Verified Supabase user id, or null for guests. */
  userId: string | null;
  /** Raw tier stored in profiles.tier (guest_free for guests). */
  tier: AccountTier;
  /** Tier after the beta promo (free + invited <3 months ago → premium). Use this for limits. */
  effectiveTier: AccountTier;
  /** Stable key for quota counters: "user:<uuid>" | "ip:<hash>" | "gid:<hash>" | "anon". */
  quotaSubject: string;
}

export const GUEST_COOKIE = "mca_gid";

const VALID_TIERS: readonly AccountTier[] = ["guest_free", "free", "premium", "architect", "constructor"];

export function normalizeTier(raw: unknown): AccountTier {
  return VALID_TIERS.includes(raw as AccountTier) ? (raw as AccountTier) : "free";
}

interface ProfileRow {
  tier: string | null;
  created_at?: string | null;
  /** Migration 013; absent before it is applied → no promo. */
  beta_invited_at?: string | null;
}

export interface ServerTierDeps {
  getUserId: (req: Request) => Promise<string | null>;
  loadProfile: (userId: string) => Promise<ProfileRow | null>;
}

const defaultDeps: ServerTierDeps = {
  getUserId: async (req) => (await getAuthenticatedUser(req as NextRequest))?.id ?? null,
  loadProfile: async (userId) => {
    const sb = getSupabaseServer();
    if (!sb) return null;
    const { data, error } = await sb
      .from("profiles")
      .select("*") // "*" so a missing beta_invited_at column (pre-013) is not an error
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[serverTier] profile load failed:", error.message);
      return null;
    }
    return (data as ProfileRow | null) ?? null;
  },
};

function hashKey(value: string): string {
  const salt = process.env.QUOTA_HASH_SALT || "modulca-quota-v1";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

/** Best-effort client IP (Vercel sets x-forwarded-for; first entry is the client). */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || null;
}

function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name && v.length) return decodeURIComponent(v.join("="));
  }
  return null;
}

/**
 * Guest quota subject. IP first: a cookie is client-controlled and can be
 * cleared to reset the quota, an IP cannot (cheaply). Cookie id only when no IP
 * is available (local dev). Both are hashed — no raw IP is stored.
 */
export function getGuestSubject(req: Request): string {
  const ip = getClientIp(req);
  if (ip) return `ip:${hashKey(ip)}`;
  const gid = getCookie(req, GUEST_COOKIE);
  if (gid) return `gid:${hashKey(gid)}`;
  return "anon";
}

/**
 * Resolve the caller's tier on the server. Never throws.
 * - No/invalid session → guest_free.
 * - Valid session but profile unreadable (Supabase down / not configured) → free
 *   (the safe floor for a logged-in user, no promo).
 */
export async function getServerTier(
  req: Request,
  deps: ServerTierDeps = defaultDeps,
): Promise<ServerTierContext> {
  let userId: string | null = null;
  try {
    userId = await deps.getUserId(req);
  } catch (err) {
    console.warn("[serverTier] session check failed:", err);
  }

  if (!userId) {
    return {
      userId: null,
      tier: "guest_free",
      effectiveTier: "guest_free",
      quotaSubject: getGuestSubject(req),
    };
  }

  let profile: ProfileRow | null = null;
  try {
    profile = await deps.loadProfile(userId);
  } catch (err) {
    console.warn("[serverTier] profile load threw:", err);
  }

  if (!profile) {
    return { userId, tier: "free", effectiveTier: "free", quotaSubject: `user:${userId}` };
  }

  const tier = normalizeTier(profile.tier);
  // A logged-in user can never be a guest, whatever the row says.
  const safeTier: AccountTier = tier === "guest_free" ? "free" : tier;
  return {
    userId,
    tier: safeTier,
    effectiveTier: getEffectiveTier(safeTier, profile.beta_invited_at ?? null),
    quotaSubject: `user:${userId}`,
  };
}
