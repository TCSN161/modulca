import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@supabase/supabase-js";
import {
  sendUpgradeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
} from "@/shared/lib/email";
import { resolveCheckoutTier, tierForPriceId, toDbSubscriptionStatus, type PaidTier } from "../billing";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
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
        const failedEmail = invoice.customer_email;
        if (failedEmail) {
          await sendPaymentFailedEmail(failedEmail);
        }
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    Sentry.captureException(err, { tags: { source: "stripe-webhook" } });
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
  const purchased = mapPriceToTier(priceId);

  // BUG-ST16: never lower a comp account (paid tier, no subscription id).
  const { data: current, error: currentErr } = await supabase
    .from("profiles")
    .select("tier, stripe_subscription_id")
    .eq("id", userId)
    .maybeSingle();
  if (currentErr) throw currentErr; // → 500, Stripe retries later
  const { tier, keepTier } = resolveCheckoutTier(
    (current as { tier: string | null; stripe_subscription_id: string | null } | null) ?? null,
    purchased,
  );

  console.log("[Stripe Webhook] Checkout complete:", { userId, tier, purchased, keepTier, subscriptionId });

  if (keepTier) {
    // The checkout guard should make this impossible. If it happens, keep the
    // comp tier, do NOT bind the subscription (it stays orphaned, so its later
    // events are ignored) and alert so the payment can be refunded by hand.
    Sentry.captureMessage("Comp account bought a lower plan; tier kept, refund needed", {
      level: "warning",
      tags: { source: "stripe-webhook", action: "comp-lower-checkout" },
      extra: { userId, compTier: tier, purchased, subscriptionId },
    });
    return;
  }

  const { error: updErr } = await supabase.from("profiles").update({
    tier,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    subscription_status: toDbSubscriptionStatus(subscription.status),
  }).eq("id", userId);
  if (updErr) throw updErr; // → 500, Stripe retries (BUG-DB-01: no silent failure)

  // Send upgrade confirmation email
  const email = session.customer_email || session.customer_details?.email;
  if (email) {
    await sendUpgradeEmail(email, tier);
  }
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId || !supabase) return;

  const priceId = sub.items.data[0]?.price?.id;
  const tier = mapPriceToTier(priceId);
  const status = sub.status; // active, past_due, canceled, etc.

  if (!(await isCurrentSubscription(userId, sub.id))) return;

  console.log("[Stripe Webhook] Subscription updated:", { userId, tier, status });

  // BUG-DB-01: map statuses the CHECK rejects, and surface a failed update
  // (it used to fail silently and leave the tier unchanged).
  const { error: updErr } = await supabase.from("profiles").update({
    tier: PAID_STATUSES.has(status) ? tier : "free",
    subscription_status: toDbSubscriptionStatus(status),
  }).eq("id", userId);
  if (updErr) throw updErr; // → 500, Stripe retries
}

async function handleSubscriptionCancel(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId || !supabase) return;

  if (!(await isCurrentSubscription(userId, sub.id))) return;

  console.log("[Stripe Webhook] Subscription cancelled:", { userId });

  // Get user email before downgrading
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  await supabase.from("profiles").update({
    tier: "free",
    subscription_status: "canceled",
    stripe_subscription_id: null,
  }).eq("id", userId);

  // Get email from Stripe customer
  try {
    const customerId = sub.customer as string;
    if (customerId) {
      const customer = await getStripe().customers.retrieve(customerId);
      if (!customer.deleted && customer.email) {
        await sendSubscriptionCancelledEmail(
          customer.email,
          (profile?.display_name as string) || undefined
        );
      }
    }
  } catch (e) {
    console.error("[Stripe Webhook] Could not send cancel email:", e);
    Sentry.captureException(e, { tags: { source: "stripe-webhook", action: "cancel-email" } });
  }
}

/** Stripe statuses that keep the paid tier. `trialing` = paid plan in trial. */
const PAID_STATUSES = new Set<string>(["active", "trialing"]);

/**
 * Comp-account guard (B1, 2026-11-26): only the subscription currently stored
 * on the profile may change its tier. Events for an older/replaced subscription,
 * or for a profile with no subscription at all (comp accounts granted with
 * `scripts/stripe-comp-account.mjs`, see docs/MCA-DOC-PRICING-COMP-ACCOUNTS.md),
 * are ignored, so they can never downgrade a manually granted tier.
 */
async function isCurrentSubscription(userId: string, subscriptionId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error; // → 500, Stripe retries later
  const current = (profile as { stripe_subscription_id?: string | null } | null)?.stripe_subscription_id ?? null;
  if (current !== subscriptionId) {
    console.warn("[Stripe Webhook] Ignoring event for non-current subscription:", {
      userId,
      subscriptionId,
      current,
    });
    return false;
  }
  return true;
}

function mapPriceToTier(priceId: string | undefined): PaidTier | "free" {
  return tierForPriceId(priceId) ?? "free";
}
