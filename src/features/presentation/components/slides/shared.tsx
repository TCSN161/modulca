/**
 * Shared slide primitives — SlideCard wrapper and SlideHeader.
 * Kept small and dependency-free so any slide file can import them cheaply.
 */

import type { ReactNode } from "react";

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
