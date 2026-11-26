"use client";

/** Neutral spinner shown while the auth session is still loading (BUG-ST09 / ST11). */
export default function AuthLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="auth-loading"
      className="flex min-h-[240px] items-center justify-center"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-200 border-t-brand-teal-700" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
