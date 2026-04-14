"use client";

import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe client singleton.
 * Uses server-side Checkout Sessions via /api/stripe/checkout.
 *
 * Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local to activate.
 * In demo mode (no key), upgrade happens locally without payment.
 */

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export const isStripeConfigured = !!STRIPE_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
}

/**
 * Stripe Price IDs — set in env after creating products in Stripe Dashboard.
 * Products: "ModulCA Premium" and "ModulCA Architect"
 * Each with monthly + yearly prices.
 */
export const STRIPE_PRICES = {
  premium_monthly:     process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY     || "",
  premium_yearly:      process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY      || "",
  architect_monthly:   process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY   || "",
  architect_yearly:    process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY    || "",
  constructor_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY || "",
  constructor_yearly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_YEARLY  || "",
} as const;

/**
 * Redirect to Stripe Checkout via server-side session.
 * Creates a Checkout Session on /api/stripe/checkout, then redirects to Stripe.
 * In demo mode, simulates upgrade locally.
 */
export async function redirectToCheckout(
  priceId: string,
  userId?: string | null,
  userEmail?: string | null
): Promise<void> {
  if (!isStripeConfigured || !priceId) {
    // Demo mode — simulate upgrade
    console.log("[Stripe Demo] Would redirect to checkout for:", priceId);
    return;
  }

  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userId, userEmail }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("[Stripe]", data.error);
      alert(`Payment error: ${data.error}`);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("[Stripe] Checkout error:", err);
    alert("Could not connect to payment service. Please try again.");
  }
}

/**
 * Open Stripe Customer Portal for subscription management.
 */
export async function openCustomerPortal(customerId: string): Promise<void> {
  try {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("[Stripe] Portal error:", err);
  }
}
