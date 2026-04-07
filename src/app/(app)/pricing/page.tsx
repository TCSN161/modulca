"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { ACCOUNT_TIERS } from "@/features/auth/types";
import { STRIPE_PRICES, redirectToCheckout, isStripeConfigured } from "@/shared/lib/stripe";

export default function PricingPage() {
  const { userTier, userEmail, setTier, isAuthenticated } = useAuthStore();
  const [yearly, setYearly] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (tierId: "premium" | "architect") => {
    setUpgrading(tierId);

    if (!isStripeConfigured) {
      // Demo mode — instant upgrade
      setTier(tierId);
      setUpgrading(null);
      return;
    }

    const priceId = yearly
      ? tierId === "premium" ? STRIPE_PRICES.premium_yearly : STRIPE_PRICES.architect_yearly
      : tierId === "premium" ? STRIPE_PRICES.premium_monthly : STRIPE_PRICES.architect_monthly;

    await redirectToCheckout(priceId, userEmail);
    setUpgrading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-brand-teal-800">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-gray-500 hover:text-brand-teal-800">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-teal-800 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mb-6">
            Start free. Upgrade when you need more power.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !yearly ? "bg-white text-brand-teal-800 shadow-sm" : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                yearly ? "bg-white text-brand-teal-800 shadow-sm" : "text-gray-500"
              }`}
            >
              Yearly <span className="text-brand-amber-500 text-xs font-bold">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {ACCOUNT_TIERS.map((tier) => {
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const monthlyEquiv = yearly && tier.priceYearly ? Math.round(tier.priceYearly / 12) : price;
            const isCurrent = tier.id === userTier;
            const isUpgrade = tier.id !== "free" && tier.id !== userTier;
            const isPremiumHighlight = tier.id === "premium";

            return (
              <div
                key={tier.id}
                className={`relative rounded-xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  isPremiumHighlight ? "border-brand-amber-500" : "border-gray-100"
                }`}
              >
                {isPremiumHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber-500 px-3 py-0.5 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-brand-teal-800">{tier.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                </div>

                <div className="mb-5">
                  {price ? (
                    <>
                      <span className="text-3xl font-bold text-brand-teal-800">
                        &euro;{monthlyEquiv}
                      </span>
                      <span className="text-sm text-gray-400">/month</span>
                      {yearly && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Billed &euro;{price}/year
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-brand-teal-800">Free</span>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 space-y-2">
                  {getFeatureList(tier.id).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-0.5 text-brand-teal-600 shrink-0">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full rounded-lg border-2 border-brand-teal-800 px-4 py-2.5 text-center text-sm font-semibold text-brand-teal-800">
                    Current Plan
                  </div>
                ) : tier.id === "free" ? (
                  <Link
                    href="/project/demo/land"
                    className="block w-full rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Start Free
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier.id as "premium" | "architect")}
                    disabled={upgrading === tier.id}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                      isPremiumHighlight
                        ? "bg-brand-amber-500 hover:bg-brand-amber-600"
                        : "bg-brand-teal-800 hover:bg-brand-teal-700"
                    }`}
                  >
                    {upgrading === tier.id ? "Redirecting..." : isUpgrade ? `Upgrade to ${tier.label}` : `Get ${tier.label}`}
                  </button>
                )}

                {!isStripeConfigured && isUpgrade && (
                  <p className="mt-2 text-center text-[10px] text-gray-400">
                    Demo mode — instant upgrade, no payment
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-lg font-bold text-brand-teal-800 mb-4">Questions?</h2>
          <div className="mx-auto max-w-lg text-left space-y-4">
            {[
              { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately." },
              { q: "Is there a free trial?", a: "The Explorer plan is free forever. Premium features can be tested in the demo." },
              { q: "What payment methods do you accept?", a: "Credit/debit cards via Stripe. Invoicing available for Architect tier." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg bg-white border border-gray-100 p-4">
                <div className="text-sm font-semibold text-gray-700">{faq.q}</div>
                <div className="text-xs text-gray-500 mt-1">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Feature lists per tier for the pricing cards */
function getFeatureList(tier: string): string[] {
  switch (tier) {
    case "free":
      return [
        "Up to 4 modules per project",
        "5 AI renders per month",
        "Floor plan + section drawings",
        "3D walkthrough",
        "Knowledge base access",
        "1 saved project",
      ];
    case "premium":
      return [
        "Up to 12 modules per project",
        "30 AI renders per month (HD)",
        "All 6 drawing types + PDF export",
        "Auto-tour + building permits",
        "Product catalog with real pricing",
        "5 projects + sharable links",
        "Email support",
      ];
    case "architect":
      return [
        "Up to 50 modules, custom sizes",
        "100 AI renders per month (4K)",
        "DWG/DXF export for CAD",
        "Team collaboration + client dashboard",
        "White-label branding",
        "Unlimited projects",
        "Priority support",
      ];
    default:
      return [];
  }
}
