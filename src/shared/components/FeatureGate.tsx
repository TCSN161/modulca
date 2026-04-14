"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store";
import type { FeatureAccess } from "@/features/auth/types";
import { getTierConfig } from "@/features/auth/types";

/**
 * Wraps any feature with a tier-based access check.
 *
 * Usage:
 *   <FeatureGate requires="permitTracker">
 *     <PermitTracker ... />
 *   </FeatureGate>
 *
 * If the user's tier doesn't have access, shows an upgrade prompt instead.
 */

interface FeatureGateProps {
  /** The feature key from FeatureAccess to check */
  requires: keyof FeatureAccess;
  /** Content to render when feature is available */
  children: ReactNode;
  /** Optional: hide entirely instead of showing upgrade prompt */
  hideIfLocked?: boolean;
  /** Optional: custom fallback instead of default upgrade prompt */
  fallback?: ReactNode;
}

export default function FeatureGate({
  requires,
  children,
  hideIfLocked = false,
  fallback,
}: FeatureGateProps) {
  const canAccess = useAuthStore((s) => s.canAccess);
  if (canAccess(requires)) {
    return <>{children}</>;
  }

  if (hideIfLocked) return null;

  if (fallback) return <>{fallback}</>;

  // Find which tier unlocks this feature
  const tiers = (["free", "premium", "architect", "constructor"] as const);
  const requiredTier = tiers.find((t) => {
    const config = getTierConfig(t);
    const val = (config.features as unknown as Record<string, unknown>)[requires];
    return typeof val === "boolean" ? val : typeof val === "number" ? (val > 0 || val === -1) : true;
  });

  const tierConfig = requiredTier ? getTierConfig(requiredTier) : null;

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-amber-100">
        <svg
          className="h-5 w-5 text-brand-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700">
        {tierConfig ? `${tierConfig.label} Feature` : "Premium Feature"}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Upgrade to {tierConfig?.label || "Premium"} to unlock this feature.
      </p>
      {tierConfig?.priceMonthly && (
        <p className="mt-2 text-xs font-bold text-brand-amber-600">
          Starting at €{tierConfig.priceMonthly}/month
        </p>
      )}
    </div>
  );
}
