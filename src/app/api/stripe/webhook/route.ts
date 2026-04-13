import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Use service role key for webhook — bypasses RLS
const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription lifecycle.
 */
export async function POST(req: NextRequest) {
  try {
    if (!webhookSecret) {
      console.warn("[Stripe Webhook] No webhook secret configured");
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("[Stripe Webhook] Event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancel(sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[Stripe Webhook] Payment failed for customer:", invoice.customer);
        // TODO: send email notification to user
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

/* ── Helpers ── */

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId || !supabase) return;

  // Determine tier from the subscription
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = mapPriceToTier(priceId);

  console.log("[Stripe Webhook] Checkout complete:", { userId, tier, subscriptionId });

  await supabase.from("profiles").update({
    tier,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    subscription_status: "active",
  }).eq("id", userId);
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId || !supabase) return;

  const priceId = sub.items.data[0]?.price?.id;
  const tier = mapPriceToTier(priceId);
  const status = sub.status; // active, past_due, canceled, etc.

  console.log("[Stripe Webhook] Subscription updated:", { userId, tier, status });

  await supabase.from("profiles").update({
    tier: status === "active" ? tier : "free",
    subscription_status: status,
  }).eq("id", userId);
}

async function handleSubscriptionCancel(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId || !supabase) return;

  console.log("[Stripe Webhook] Subscription cancelled:", { userId });

  await supabase.from("profiles").update({
    tier: "free",
    subscription_status: "canceled",
    stripe_subscription_id: null,
  }).eq("id", userId);
}

function mapPriceToTier(priceId: string | undefined): string {
  if (!priceId) return "free";

  const premiumMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY;
  const premiumYearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY;
  const architectMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY;
  const architectYearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY;

  if (priceId === premiumMonthly || priceId === premiumYearly) return "premium";
  if (priceId === architectMonthly || priceId === architectYearly) return "architect";

  return "free";
}
