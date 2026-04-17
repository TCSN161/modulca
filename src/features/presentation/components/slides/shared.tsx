/**
 * Shared slide primitives — SlideCard wrapper, SlideHeader, and row helpers.
 * Kept small and dependency-free so any slide file can import them cheaply.
 */

import type { ReactNode } from "react";

/** Two-column label:value row used on site/detail slides */
export function DetailRow({
  label,
  value,
  text,
}: {
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: text, opacity: 0.5 }}>{label}</span>
      <span className="font-medium" style={{ color: text }}>
        {value}
      </span>
    </div>
  );
}

/** Cost line item; pass `green` for discounts */
export function CostRow({
  label,
  value,
  text,
  green,
}: {
  label: string;
  value: string;
  text: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: text, opacity: 0.6 }}>{label}</span>
      <span
        className={`font-medium ${green ? "text-green-600" : ""}`}
        style={green ? {} : { color: text }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * SlideCard — the themed container every slide renders into.
 * Enforces consistent padding, border-radius, and background.
 */
export function SlideCard({
  bg,
  text,
  children,
}: {
  bg: string;
  text: string;
  /** Accent kept in signature for future use (e.g., borders) */
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl shadow-2xl p-12 print:p-8 print:shadow-none break-after-page"
      style={{ backgroundColor: bg, color: text, minHeight: 600 }}
    >
      {children}
    </div>
  );
}

/**
 * SlideHeader — numbered section title with accent rule.
 * Use at the top of content-heavy slides for consistent typography.
 */
export function SlideHeader({
  accent,
  text,
  number,
  title,
}: {
  accent: string;
  text: string;
  number: number;
  title: string;
}) {
  return (
    <div className="mb-8 flex items-baseline gap-4">
      <div
        className="text-sm font-bold uppercase tracking-[0.2em]"
        style={{ color: accent }}
      >
        {String(number).padStart(2, "0")}
      </div>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: accent, opacity: 0.3 }}
      />
      <h2 className="text-2xl font-bold" style={{ color: text }}>
        {title}
      </h2>
    </div>
  );
}
