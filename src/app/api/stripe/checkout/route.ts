import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for subscription upgrade.
 *
 * Body: { priceId: string, userId: string, userEmail: string }
 * Returns: { url: string } — the Checkout Session URL
 */
export async function POST(req: NextRequest) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://www.modulca.eu";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?upgrade=cancelled`,
      metadata: {
        userId: userId || "",
        source: "modulca-pricing",
      },
      subscription_data: {
        metadata: {
          userId: userId || "",
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
