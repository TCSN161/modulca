"use client";

import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe client singleton.
 * Uses Stripe Checkout (hosted page) — no server routes needed.
 * Works with static export.
 *
 * Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local to activate.
 * In demo mode (no key), redirects to a mock success page.
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
 * Stripe Price IDs — set these in env or hardcode after creating products in Stripe Dashboard.
 * Create 2 products: "ModulCA Premium" and "ModulCA Architect"
 * Each with monthly + yearly prices.
 */
export const STRIPE_PRICES = {
  premium_monthly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY  || "price_demo_premium_monthly",
  premium_yearly:   process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY   || "price_demo_premium_yearly",
  architect_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY || "price_demo_architect_monthly",
  architect_yearly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY  || "price_demo_architect_yearly",
} as const;

/**
 * Redirect to Stripe Checkout.
 * In demo mode, simulates upgrade locally.
 */
/**
 * Redirect to Stripe Checkout.
 * Stripe.js v9+ removed `stripe.redirectToCheckout`.
 * For client-only static export we build the Payment Links URL manually.
 * When a real Stripe backend exists, replace with server-created Session URL.
 */
export async function redirectToCheckout(priceId: string, _userEmail?: string | null): Promise<void> {
  if (!isStripeConfigured) {
    // Demo mode — simulate upgrade
    console.log("[Stripe Demo] Would redirect to checkout for:", priceId);
    return;
  }

  // Build Stripe Payment Link URL (configure in Stripe Dashboard → Payment Links)
  // For production, create a server endpoint that returns a Checkout Session URL.
  const paymentLinkBase = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BASE;
  if (paymentLinkBase) {
    window.location.href = `${paymentLinkBase}?prefilled_promo_code=&client_reference_id=${priceId}`;
    return;
  }

  // Fallback: log warning — server-side session creation needed
  console.warn("[Stripe] No payment link configured. Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BASE or implement server-side Checkout Sessions.");
}
