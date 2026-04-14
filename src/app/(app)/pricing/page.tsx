"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { ACCOUNT_TIERS, FEATURE_COMPARISON_ROWS, type AccountTier } from "@/features/auth/types";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { STRIPE_PRICES, redirectToCheckout, isStripeConfigured } from "@/shared/lib/stripe";

/** Tiers visible on the pricing page (skip guest) */
const VISIBLE_TIERS = ACCOUNT_TIERS.filter((t) => t.id !== "guest_free");

export default function PricingPage() {
  const { userTier, userId, userEmail, betaPromoActive, betaPromoDaysLeft, setTier } = useAuthStore();
  const [yearly, setYearly] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (tierId: AccountTier) => {
    if (tierId === "free" || tierId === "guest_free") return;
    setUpgrading(tierId);

    if (!isStripeConfigured) {
      // Demo mode — instant upgrade
      setTier(tierId);
      setUpgrading(null);
      return;
    }

    const priceKey = `${tierId}_${yearly ? "yearly" : "monthly"}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey] || "";

    if (tierId === "constructor" && !priceId) {
      // Constructor has no self-service price yet — redirect to contact
      window.location.href = "mailto:contact@modulca.eu?subject=Constructor%20Plan%20Inquiry";
      setUpgrading(null);
      return;
    }

    await redirectToCheckout(priceId, userId, userEmail);
    setUpgrading(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand-teal-800 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mb-6">
            Start free. Upgrade when you need more power.
          </p>

          {/* Beta promo banner */}
          {betaPromoActive && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-amber-100 to-amber-50 border border-brand-amber-200 px-4 py-2">
              <span className="text-sm font-bold text-brand-amber-700">
                Beta Bonus Active
              </span>
              <span className="text-xs text-brand-amber-600">
                You have Premium features free for {betaPromoDaysLeft} more days!
              </span>
            </div>
          )}

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

        {/* Plans grid — 4 visible tiers */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VISIBLE_TIERS.map((tier) => {
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const monthlyEquiv = yearly && tier.priceYearly ? Math.round(tier.priceYearly / 12) : price;
            const isCurrent = tier.id === userTier;
            const isBetaCurrent = betaPromoActive && tier.id === "premium" && userTier === "free";
            const isUpgrade = !isCurrent && tier.id !== "free";
            const isPremiumHighlight = tier.id === "premium";
            const isConstructor = tier.id === "constructor";

            return (
              <div
                key={tier.id}
                className={`relative rounded-xl border-2 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                  isPremiumHighlight
                    ? "border-brand-amber-500"
                    : isConstructor
                    ? "border-purple-400"
                    : isBetaCurrent
                    ? "border-brand-amber-300"
                    : "border-gray-100"
                }`}
              >
                {isPremiumHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber-500 px-3 py-0.5 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                {isConstructor && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
                    Enterprise
                  </div>
                )}
                {isBetaCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber-400 px-3 py-0.5 text-xs font-bold text-white">
                    Beta Active
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-base font-bold" style={{ color: tier.color }}>
                    {tier.label}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">{tier.description}</p>
                </div>

                <div className="mb-4">
                  {price ? (
                    <>
                      <span className="text-2xl font-bold text-brand-teal-800">
                        &euro;{monthlyEquiv}
                      </span>
                      <span className="text-xs text-gray-400">/month</span>
                      {yearly && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Billed &euro;{price}/year
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-brand-teal-800">Free</span>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-5 space-y-1.5">
                  {getFeatureList(tier.id).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                      <span className="mt-0.5 text-brand-teal-600 shrink-0">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent || isBetaCurrent ? (
                  <div className="w-full rounded-lg border-2 border-brand-teal-800 px-3 py-2 text-center text-xs font-semibold text-brand-teal-800">
                    {isBetaCurrent ? "Active (Beta)" : "Current Plan"}
                  </div>
                ) : tier.id === "free" ? (
                  <Link
                    href="/project/demo/land"
                    className="block w-full rounded-lg bg-gray-100 px-3 py-2 text-center text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Start Free
                  </Link>
                ) : isConstructor ? (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading === tier.id}
                      className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-60"
                    >
                      {upgrading === tier.id ? "Redirecting..." : "Get Constructor"}
                    </button>
                    <a
                      href="mailto:contact@modulca.eu?subject=Constructor%20Plan%20-%20Custom%20Pricing"
                      className="block w-full rounded-lg border border-purple-200 px-3 py-2 text-center text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      Contact for Custom Pricing
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={upgrading === tier.id}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-bold text-white transition-colors disabled:opacity-60 ${
                      isPremiumHighlight
                        ? "bg-brand-amber-500 hover:bg-brand-amber-600"
                        : "bg-brand-teal-800 hover:bg-brand-teal-700"
                    }`}
                  >
                    {upgrading === tier.id ? "Redirecting..." : isUpgrade ? `Upgrade to ${tier.label}` : `Get ${tier.label}`}
                  </button>
                )}

                {!isStripeConfigured && isUpgrade && !isConstructor && (
                  <p className="mt-1.5 text-center text-[9px] text-gray-400">
                    Demo mode — instant upgrade, no payment
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Beta promo info */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-brand-amber-50 to-amber-50 border border-brand-amber-100 p-6 text-center">
          <h3 className="text-sm font-bold text-brand-amber-700 mb-1">
            Beta Bonus — 3 Months Free Premium
          </h3>
          <p className="text-xs text-brand-amber-600 max-w-lg mx-auto">
            All new free accounts get Premium-level features for 3 months during our beta phase.
            Design with HD renders, all drawings, PDF export, and more — completely free.
            After 3 months, choose to upgrade or continue with the Explorer plan.
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="mt-14">
          <h2 className="text-lg font-bold text-brand-teal-800 text-center mb-6">
            Detailed Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 w-[200px]">Feature</th>
                  {VISIBLE_TIERS.map((t) => (
                    <th key={t.id} className="py-3 px-3 text-center font-semibold" style={{ color: t.color }}>
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON_ROWS.map((group) => (
                  <>
                    <tr key={`cat-${group.category}`} className="border-t border-gray-100 bg-gray-50/50">
                      <td colSpan={VISIBLE_TIERS.length + 1} className="py-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {group.category}
                      </td>
                    </tr>
                    {group.features.map((feat) => (
                      <tr key={feat.key} className="border-t border-gray-50 hover:bg-gray-50/40">
                        <td className="py-2 px-4 text-gray-600">{feat.label}</td>
                        {VISIBLE_TIERS.map((t) => {
                          const val = t.features[feat.key];
                          let display: string;
                          if (typeof val === "boolean") {
                            display = val ? "\u2713" : "\u2014";
                          } else if (typeof val === "number") {
                            display = val === -1 ? "Unlimited" : String(val);
                          } else {
                            display = String(val);
                          }
                          return (
                            <td key={t.id} className={`py-2 px-3 text-center ${
                              typeof val === "boolean" ? (val ? "text-brand-teal-600 font-bold" : "text-gray-300") : "text-gray-700"
                            }`}>
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <h2 className="text-lg font-bold text-brand-teal-800 mb-4">Questions?</h2>
          <div className="mx-auto max-w-lg text-left space-y-4">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade or downgrade at any time. Changes take effect immediately.",
              },
              {
                q: "What's the Beta Bonus?",
                a: "New free accounts get 3 months of Premium features during our beta phase. No credit card needed. After 3 months, you can upgrade or continue with Explorer.",
              },
              {
                q: "What payment methods do you accept?",
                a: "Credit/debit cards via Stripe. Invoicing available for Architect and Constructor tiers.",
              },
              {
                q: "What's the Constructor plan?",
                a: "Enterprise solution for construction companies. Unlimited projects, white-label branding, dedicated support. Custom pricing available for larger teams.",
              },
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
        "Up to 6 modules per project",
        "5 AI renders/month (SD)",
        "Floor plan + section drawings",
        "3D walkthrough",
        "Knowledge base (123 free articles)",
        "AI consultant (basic, 1 country)",
        "2 saved projects",
        "3-month Premium beta bonus",
      ];
    case "premium":
      return [
        "Up to 12 modules per project",
        "50 AI renders/month (HD)",
        "All 6 drawing types + PDF export",
        "Auto-tour + permit tracker",
        "Full knowledge library (180 articles)",
        "AI consultant (GPT-4o, 3 countries)",
        "Product catalog with real pricing",
        "10 projects + sharable links",
        "Email support",
      ];
    case "architect":
      return [
        "Up to 50 modules, custom sizes",
        "200 AI renders/month (4K)",
        "DWG/DXF export for CAD",
        "Full library + all country regulations",
        "AI consultant (Claude, deep context)",
        "Team collaboration (5 members)",
        "Client dashboard + analytics",
        "Unlimited projects",
        "VR mode + priority support",
      ];
    case "constructor":
      return [
        "Up to 200 modules per project",
        "Unlimited AI renders (4K)",
        "Full library + unlimited AI context",
        "White-label branding",
        "Unlimited team members",
        "Advanced analytics + API",
        "Unlimited projects",
        "Dedicated account manager",
      ];
    default:
      return [];
  }
}
