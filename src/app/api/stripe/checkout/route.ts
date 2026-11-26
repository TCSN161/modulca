import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUser } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";
import { decideCheckout, type BillingProfile } from "../billing";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
}

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for subscription upgrade.
 *
 * Auth (BUG-ST15): the user is resolved from `Authorization: Bearer <token>`
 * (or the sb cookie). `userId` / `userEmail` in the body are IGNORED, so a
 * subscription can never be attached to another account.
 *
 * Body: { priceId: string }
 * Returns: { url: string } — the Checkout Session URL
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "auth_required" },
        { status: 401 }
      );
    }

    const { priceId } = (await req.json().catch(() => ({}))) as { priceId?: string };

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    // BUG-ST16: no checkout for the same or a lower tier, and no second
    // subscription for someone who already pays (that goes via the portal).
    const sb = getSupabaseServer();
    if (!sb) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }
    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("tier, created_at, stripe_subscription_id, subscription_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) {
      Sentry.captureException(profileErr, { tags: { source: "stripe-checkout" } });
      return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
    }
    const decision = decideCheckout((profile as BillingProfile | null) ?? null, priceId);
    if (!decision.ok) {
      return NextResponse.json({ error: decision.error, code: decision.code }, { status: decision.status });
    }

    const origin = req.headers.get("origin") || "https://www.modulca.eu";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        source: "modulca-pricing",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe Checkout]", err);
    Sentry.captureException(err, { tags: { source: "stripe-checkout" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
