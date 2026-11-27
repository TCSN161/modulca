"use client";

import { useTranslations } from "next-intl";

/**
 * Beta promo shown at sign-up (BUG-ST19): new accounts get 3 months of
 * Premium (see getEffectiveTier in features/auth/types.ts).
 */
export function BetaPromoNotice() {
  const t = useTranslations("pricing.beta");
  return (
    <div
      role="note"
      className="mb-4 rounded-lg border border-brand-amber-200 bg-gradient-to-r from-brand-amber-50 to-amber-50 px-3 py-2"
    >
      <p className="text-xs font-bold text-brand-amber-700">{t("banner")}</p>
      <p className="mt-0.5 text-[11px] text-brand-amber-600">{t("registerNote")}</p>
    </div>
  );
}
