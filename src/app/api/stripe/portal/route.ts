import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUserId } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing subscriptions.
 *
 * Auth: requires authenticated Supabase session.
 * Ownership: verifies the `customerId` belongs to the authenticated user
 *            via profiles.stripe_customer_id, preventing cross-account access.
 *
 * Body (optional): { customerId?: string } — ignored unless it matches user's actual Stripe ID
 * Returns: { url: string } — the Portal URL
 */
export async function POST(req: NextRequest) {
  // Authenticate
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Look up the user's Stripe customer ID from their profile — never trust client-supplied
    const sb = getSupabaseServer();
    if (!sb) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr) {
      Sentry.captureException(profileErr, { tags: { source: "stripe-portal" } });
      return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
    }

    const customerId = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: "No Stripe customer record — upgrade to a paid plan first" },
        { status: 404 }
      );
    }

    const origin = req.headers.get("origin") || "https://www.modulca.eu";

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Portal]", err);
    Sentry.captureException(err, { tags: { source: "stripe-portal" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
