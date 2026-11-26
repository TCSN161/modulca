"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store";
import { ACCOUNT_TIERS, FEATURE_COMPARISON_ROWS, type AccountTier, type FeatureAccess } from "@/features/auth/types";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { STRIPE_PRICES, redirectToCheckout, openCustomerPortal, isStripeConfigured } from "@/shared/lib/stripe";

/** Tier order — a checkout is only offered for a tier above the effective one (BUG-ST16). */
const TIER_ORDER: AccountTier[] = ["guest_free", "free", "premium", "architect", "constructor"];
const rank = (t: AccountTier) => TIER_ORDER.indexOf(t);

/** Tiers visible on the pricing page (skip guest) */
const VISIBLE_TIERS = ACCOUNT_TIERS.filter((t) => t.id !== "guest_free");

/** Maps FEATURE_COMPARISON_ROWS category strings → translation keys under pricing.compare.category.* */
const CATEGORY_KEYS: Record<string, string> = {
  Design: "design",
  Visualization: "visualization",
  Technical: "technical",
  "Knowledge & AI": "knowledgeAi",
  Presentation: "presentation",
  Professional: "professional",
};

/** Tier IDs visible on pricing page — narrower than AccountTier (excludes guest_free) */
type VisibleTierId = Exclude<AccountTier, "guest_free">;

export default function PricingPage() {
  const { userTier, isAuthenticated, stripeCustomerId, betaPromoActive, betaPromoDaysLeft, setTier, getEffectiveTier } = useAuthStore();
  const effectiveTier = getEffectiveTier();
  const [yearly, setYearly] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = useTranslations("pricing");

  /** BUG-ST14: portal with a clear message for comp / no-subscription accounts. */
  const handlePortal = async () => {
    const result = await openCustomerPortal(null, { notify: false });
    if (result === "redirected") return;
    const key = { comp: "comp", no_subscription: "noSubscription", auth_required: "authRequired", error: "error" }[result];
    setNotice(t(`portal.${key}` as "portal.comp"));
  };

  const handleUpgrade = async (tierId: AccountTier) => {
    if (tierId === "free" || tierId === "guest_free") return;
    if (rank(tierId) <= rank(effectiveTier)) return; // never checkout same/lower (BUG-ST16)
    setUpgrading(tierId);
    setNotice(null);

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

    const result = await redirectToCheckout(priceId);
    if (result === "use_portal") {
      // Already a paying subscriber: plan changes go through the Stripe portal.
      setNotice(t("notice.usePortal"));
      await handlePortal();
    } else if (result === "not_an_upgrade") {
      setNotice(t("notice.notAnUpgrade"));
    }
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
            {t("title")}
          </h1>
          <p className="text-gray-500 mb-6">
            {t("subtitle")}
          </p>

          {/* Beta promo banner */}
          {betaPromoActive && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-amber-100 to-amber-50 border border-brand-amber-200 px-4 py-2">
              <span className="text-sm font-bold text-brand-amber-700">
                {t("beta.active")}
              </span>
              <span className="text-xs text-brand-amber-600">
                {t("beta.daysLeft", { days: betaPromoDaysLeft })}
              </span>
            </div>
          )}

          {notice && (
            <div role="status" className="mb-6 mx-auto max-w-lg rounded-lg border border-brand-teal-200 bg-brand-teal-50 px-4 py-2 text-sm text-brand-teal-800">
              {notice}
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
              {t("billing.monthly")}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                yearly ? "bg-white text-brand-teal-800 shadow-sm" : "text-gray-500"
              }`}
            >
              {t("billing.yearly")} <span className="text-brand-amber-500 text-xs font-bold">{t("billing.saveBadge")}</span>
            </button>
          </div>
        </div>

        {/* Plans grid — 4 visible tiers */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VISIBLE_TIERS.map((tier) => {
            const tierId = tier.id as VisibleTierId;
            const price = yearly ? tier.priceYearly : tier.priceMonthly;
            const monthlyEquiv = yearly && tier.priceYearly ? Math.round(tier.priceYearly / 12) : price;
            const isBetaCurrent = betaPromoActive && tier.id === "premium" && userTier === "free";
            const isCurrent = !isBetaCurrent && tier.id === effectiveTier;
            // BUG-ST16: tiers below the user's effective tier are already included.
            const isIncluded = isAuthenticated && rank(tierId) < rank(effectiveTier);
            const isUpgrade = !isCurrent && !isIncluded && tier.id !== "free";
            const isPremiumHighlight = tier.id === "premium";
            const isConstructor = tier.id === "constructor";
            const tierLabel = t(`tier.${tierId}.label`);
            const tierDescription = t(`tier.${tierId}.description`);

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
                    {t("badge.mostPopular")}
                  </div>
                )}
                {isConstructor && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
                    {t("badge.enterprise")}
                  </div>
                )}
                {isBetaCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber-400 px-3 py-0.5 text-xs font-bold text-white">
                    {t("badge.betaActive")}
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-base font-bold" style={{ color: tier.color }}>
                    {tierLabel}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">{tierDescription}</p>
                </div>

                <div className="mb-4">
                  {price ? (
                    <>
                      <span className="text-2xl font-bold text-brand-teal-800">
                        &euro;{monthlyEquiv}
                      </span>
                      <span className="text-xs text-gray-400">{t("billing.perMonth")}</span>
                      {yearly && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {t("billing.billedYearly", { price })}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-brand-teal-800">{t("billing.free")}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-5 space-y-1.5">
                  {getFeatureIndexes(tierId).map((idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                      <span className="mt-0.5 text-brand-teal-600 shrink-0">&#10003;</span>
                      {t(`features.${tierId}.${idx}`)}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent || isBetaCurrent ? (
                  <div className="w-full rounded-lg border-2 border-brand-teal-800 px-3 py-2 text-center text-xs font-semibold text-brand-teal-800">
                    {isBetaCurrent ? t("cta.activeBeta") : t("cta.current")}
                  </div>
                ) : isIncluded ? (
                  <div className="space-y-1.5">
                    <div className="w-full rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500">
                      {t("cta.included")}
                    </div>
                    {tier.id !== "free" && (
                      stripeCustomerId ? (
                        <button
                          onClick={handlePortal}
                          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {t("cta.manageSubscription")}
                        </button>
                      ) : (
                        <a
                          href="mailto:contact@modulca.eu?subject=ModulCA%20plan"
                          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {t("cta.contactUs")}
                        </a>
                      )
                    )}
                  </div>
                ) : tier.id === "free" ? (
                  <Link
                    href="/project/new"
                    className="block w-full rounded-lg bg-gray-100 px-3 py-2 text-center text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {t("cta.startFree")}
                  </Link>
                ) : isConstructor ? (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={upgrading === tier.id}
                      className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-60"
                    >
                      {upgrading === tier.id ? t("cta.redirecting") : t("cta.getConstructor")}
                    </button>
                    <a
                      href="mailto:contact@modulca.eu?subject=Constructor%20Plan%20-%20Custom%20Pricing"
                      className="block w-full rounded-lg border border-purple-200 px-3 py-2 text-center text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {t("cta.contactCustom")}
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
                    {upgrading === tier.id
                      ? t("cta.redirecting")
                      : isUpgrade
                      ? t("cta.upgradeTo", { tier: tierLabel })
                      : t("cta.getTier", { tier: tierLabel })}
                  </button>
                )}

                {!isStripeConfigured && isUpgrade && !isConstructor && (
                  <p className="mt-1.5 text-center text-[9px] text-gray-400">
                    {t("cta.demoMode")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Beta promo info */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-brand-amber-50 to-amber-50 border border-brand-amber-100 p-6 text-center">
          <h3 className="text-sm font-bold text-brand-amber-700 mb-1">
            {t("beta.bonusTitle")}
          </h3>
          <p className="text-xs text-brand-amber-600 max-w-lg mx-auto">
            {t("beta.bonusDescription")}
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="mt-14">
          <h2 className="text-lg font-bold text-brand-teal-800 text-center mb-6">
            {t("compare.title")}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 w-[200px]">{t("compare.feature")}</th>
                  {VISIBLE_TIERS.map((tier) => (
                    <th key={tier.id} className="py-3 px-3 text-center font-semibold" style={{ color: tier.color }}>
                      {t(`tier.${tier.id as VisibleTierId}.label`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON_ROWS.map((group) => {
                  const categoryKey = CATEGORY_KEYS[group.category];
                  const categoryLabel = categoryKey ? t(`compare.category.${categoryKey}`) : group.category;
                  return (
                    <>
                      <tr key={`cat-${group.category}`} className="border-t border-gray-100 bg-gray-50/50">
                        <td colSpan={VISIBLE_TIERS.length + 1} className="py-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {categoryLabel}
                        </td>
                      </tr>
                      {group.features.map((feat) => (
                        <tr key={feat.key} className="border-t border-gray-50 hover:bg-gray-50/40">
                          <td className="py-2 px-4 text-gray-600">{t(`compare.row.${feat.key as keyof FeatureAccess}`)}</td>
                          {VISIBLE_TIERS.map((tier) => {
                            const val = tier.features[feat.key];
                            let display: string;
                            if (typeof val === "boolean") {
                              display = val ? "\u2713" : "\u2014";
                            } else if (typeof val === "number") {
                              display = val === -1 ? t("compare.unlimited") : String(val);
                            } else {
                              display = String(val);
                            }
                            return (
                              <td key={tier.id} className={`py-2 px-3 text-center ${
                                typeof val === "boolean" ? (val ? "text-brand-teal-600 font-bold" : "text-gray-300") : "text-gray-700"
                              }`}>
                                {display}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <h2 className="text-lg font-bold text-brand-teal-800 mb-4">{t("faq.title")}</h2>
          <div className="mx-auto max-w-lg text-left space-y-4">
            {(["q1", "q2", "q3", "q4"] as const).map((qKey) => (
              <div key={qKey} className="rounded-lg bg-white border border-gray-100 p-4">
                <div className="text-sm font-semibold text-gray-700">{t(`faq.${qKey}.question`)}</div>
                <div className="text-xs text-gray-500 mt-1">{t(`faq.${qKey}.answer`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Feature list indexes per tier — counts must match translation keys in pricing.features.<tier>.N */
function getFeatureIndexes(tier: VisibleTierId): number[] {
  switch (tier) {
    case "free":
      return [0, 1, 2, 3, 4, 5, 6, 7];
    case "premium":
      return [0, 1, 2, 3, 4, 5, 6, 7, 8];
    case "architect":
      return [0, 1, 2, 3, 4, 5, 6, 7, 8];
    case "constructor":
      return [0, 1, 2, 3, 4, 5, 6, 7];
    default:
      return [];
  }
}
