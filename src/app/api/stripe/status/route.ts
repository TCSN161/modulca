import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUserId } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";
import { computeBillingStatus, type BillingProfile } from "../billing";

export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/status — the caller's billing status computed on the server
 * (beta promo from the DB `beta_invited_at`, not the browser clock; select("*") so it
 * keeps working before migration 013 adds the column).
 * Auth: `Authorization: Bearer` (use authHeaders()).
 * Returns BillingStatus: tier, effectiveTier, betaPromoActive, betaPromoDaysLeft,
 * comp, hasSubscription, subscriptionStatus. Read-only, no Stripe call.
 */
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    Sentry.captureException(error, { tags: { source: "stripe-status" } });
    return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
  }
  return NextResponse.json(computeBillingStatus((data as BillingProfile | null) ?? null), {
    headers: { "Cache-Control": "no-store" },
  });
}
