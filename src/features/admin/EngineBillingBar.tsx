"use client";

/**
 * EngineBillingBar — strip of metadata shown under every engine card on
 * the /admin/engines comparison grid.
 *
 * Shows: role chip, next renewal, top-up cost, and notes.
 * Designed to be compact (single 32px row) so it doesn't overshadow the
 * render preview.
 */

import {
  getBilling,
  nextRenewalIso,
  formatRelativeDate,
  roleColor,
  type BillingEntry,
} from "./engine-billing-registry";

interface Props {
  engineId: string;
}

export default function EngineBillingBar({ engineId }: Props) {
  const entry = getBilling(engineId);
  if (!entry) return null;

  const role = roleColor(entry.role);
  const nextRenewal = nextRenewalIso(entry.renewalCadence);
  const expiresLabel = entry.freeExpiresAt
    ? `expires ${formatRelativeDate(entry.freeExpiresAt)}`
    : nextRenewal
      ? `resets ${formatRelativeDate(nextRenewal)}`
      : null;

  const topUpLabel =
    entry.minTopUpUsd > 0
      ? `$${entry.minTopUpUsd}${entry.imagesPerTopUp ? ` → ~${formatImageCount(entry.imagesPerTopUp)} img` : ""}`
      : "No top-up";

  return (
    <div
      style={{
        borderTop: "1px solid #222",
        padding: "8px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "#0d0d0d",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: 600,
            borderRadius: "4px",
            background: role.bg,
            color: role.fg,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {role.label}
        </span>

        {expiresLabel && (
          <Chip
            label={expiresLabel}
            color={isWarning(entry) ? "#fbbf24" : "#9ca3af"}
            title={`Renewal / expiry: ${entry.renewalCadence}`}
          />
        )}

        <Chip
          label={topUpLabel}
          color="#c084fc"
          title={`Min top-up to extend quota: ${entry.billingUrl}`}
        />

        <Chip
          label={`$${entry.pricePerImageUsd.toFixed(4)}/img`}
          color={entry.pricePerImageUsd === 0 ? "#22c55e" : "#fbbf24"}
          title={`Cost per image after free quota`}
        />

        <a
          href={entry.billingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "#60a5fa",
            textDecoration: "none",
          }}
          title="Open provider billing dashboard"
        >
          manage ↗
        </a>
      </div>

      {entry.notes && (
        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            lineHeight: 1.3,
          }}
        >
          {entry.notes}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  color,
  title,
}: {
  label: string;
  color: string;
  title: string;
}) {
  return (
    <span
      title={title}
      style={{
        padding: "2px 7px",
        fontSize: "10px",
        borderRadius: "4px",
        background: "#1a1a1a",
        color,
        border: "1px solid #262626",
      }}
    >
      {label}
    </span>
  );
}

/** Flag if expiry is within 30 days — bubble yellow on the chip */
function isWarning(entry: BillingEntry): boolean {
  if (!entry.freeExpiresAt) return false;
  const days = (new Date(entry.freeExpiresAt).getTime() - Date.now()) / 86_400_000;
  return days < 30 && days >= 0;
}

function formatImageCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
