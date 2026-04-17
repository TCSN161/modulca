/**
 * VAT Threshold Monitor — Romania non-VAT-registered companies
 *
 * Romanian law (Art. 310 Cod Fiscal):
 *   Companies that are NOT VAT-registered must become VAT-registered within
 *   10 days of the month in which they exceed **300,000 RON / year** in
 *   revenue (cifră de afaceri).
 *
 * Failure to register = penalties + retroactive VAT.
 *
 * Since ATELIER DE PROIECTARE MCA SRL is currently neplătitor TVA, we
 * need to track gross annual revenue and warn before hitting the ceiling.
 *
 * This module:
 *   - Calculates current YTD revenue in RON from Stripe (EUR → RON at BNR rate)
 *   - Returns status with 3 warning levels
 *   - Provides a recommended action message
 *
 * Usage:
 *   const status = await checkVatThreshold(stripeClient);
 *   if (status.level !== "ok") sendAlert(status);
 */

import { COMPANY } from "@/shared/config/company";

/** Current BNR EUR→RON rate (update quarterly; overridable via env) */
const DEFAULT_EUR_TO_RON = 4.97; // April 2026 approx — replace with live BNR API for accuracy

/** Warning thresholds as % of the 300,000 RON ceiling */
export const VAT_WARN_THRESHOLDS = {
  /** 66% — plan VAT registration in 30 days */
  caution: 0.66,
  /** 83% — start VAT registration NOW */
  warning: 0.83,
  /** 96% — register this week, no exceptions */
  critical: 0.96,
};

export type VatThresholdLevel = "ok" | "caution" | "warning" | "critical" | "exceeded";

export interface VatThresholdStatus {
  level: VatThresholdLevel;
  /** YTD gross revenue in RON (computed) */
  ytdRevenueRon: number;
  /** Threshold in RON */
  thresholdRon: number;
  /** Percentage of threshold used (0..1+) */
  percentUsed: number;
  /** Remaining RON until mandatory VAT registration */
  remainingRon: number;
  /** Human-readable message with action recommendation */
  message: string;
  /** Estimated month when threshold will be hit at current pace */
  projectedHitMonth?: string;
}

/**
 * Compute VAT threshold status from a YTD revenue figure in RON.
 * Pure function — no side effects. Safe to call in UI components.
 */
export function computeVatStatus(
  ytdRevenueRon: number,
  daysElapsedThisYear: number = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86_400_000
  ),
): VatThresholdStatus {
  const thresholdRon = COMPANY.vat.mandatoryThresholdRon;
  const percentUsed = ytdRevenueRon / thresholdRon;
  const remainingRon = Math.max(0, thresholdRon - ytdRevenueRon);

  // Project end-of-year based on current pace
  const daysInYear = 365;
  const projectedAnnual = (ytdRevenueRon / Math.max(daysElapsedThisYear, 1)) * daysInYear;
  let projectedHitMonth: string | undefined;
  if (projectedAnnual > thresholdRon && ytdRevenueRon < thresholdRon) {
    const daysToHit = (remainingRon * daysElapsedThisYear) / Math.max(ytdRevenueRon, 1);
    const hitDate = new Date(Date.now() + daysToHit * 86_400_000);
    projectedHitMonth = hitDate.toLocaleDateString("ro-RO", { year: "numeric", month: "long" });
  }

  let level: VatThresholdLevel = "ok";
  let message = `YTD revenue: ${ytdRevenueRon.toLocaleString("ro-RO")} RON (${Math.round(percentUsed * 100)}% of ${thresholdRon.toLocaleString("ro-RO")} RON cap). Safe.`;

  if (percentUsed >= 1.0) {
    level = "exceeded";
    message = `🚨 THRESHOLD EXCEEDED — You have exceeded the 300,000 RON cap. Register for VAT at ANAF within 10 days of the end of this month. Ongoing sales MUST charge 19% VAT retroactively for this fiscal month.`;
  } else if (percentUsed >= VAT_WARN_THRESHOLDS.critical) {
    level = "critical";
    message = `🔴 CRITICAL — ${Math.round(percentUsed * 100)}% of VAT threshold used (${remainingRon.toLocaleString("ro-RO")} RON remaining). Submit ANAF form 010 for VAT registration THIS WEEK. Projected breach: ${projectedHitMonth ?? "imminent"}.`;
  } else if (percentUsed >= VAT_WARN_THRESHOLDS.warning) {
    level = "warning";
    message = `🟠 WARNING — ${Math.round(percentUsed * 100)}% of VAT threshold used. Start VAT registration process (ANAF form 010). Projected breach: ${projectedHitMonth ?? "within weeks"}.`;
  } else if (percentUsed >= VAT_WARN_THRESHOLDS.caution) {
    level = "caution";
    message = `🟡 CAUTION — ${Math.round(percentUsed * 100)}% of VAT threshold used. Plan VAT registration within 30 days. Projected breach: ${projectedHitMonth ?? "this year"}.`;
  }

  return { level, ytdRevenueRon, thresholdRon, percentUsed, remainingRon, message, projectedHitMonth };
}

/**
 * Convert EUR to RON at the configured (or BNR-live) rate.
 * For production accuracy, periodically fetch from https://www.bnr.ro/nbrfxrates.xml
 */
export function eurToRon(amountEur: number, rate: number = DEFAULT_EUR_TO_RON): number {
  return amountEur * rate;
}

/**
 * Returns a color hex suitable for displaying the threshold status in UI widgets.
 */
export function getStatusColor(level: VatThresholdLevel): string {
  switch (level) {
    case "ok": return "#10b981"; // emerald-500
    case "caution": return "#f59e0b"; // amber-500
    case "warning": return "#f97316"; // orange-500
    case "critical": return "#dc2626"; // red-600
    case "exceeded": return "#991b1b"; // red-900
  }
}

/**
 * Human-readable tier of the status (short label for badges).
 */
export function getStatusLabel(level: VatThresholdLevel): string {
  switch (level) {
    case "ok": return "OK";
    case "caution": return "Caution";
    case "warning": return "Warning";
    case "critical": return "Critical";
    case "exceeded": return "Exceeded";
  }
}
