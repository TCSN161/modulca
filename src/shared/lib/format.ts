/**
 * Hydration-safe number formatting (BUG-ST20).
 *
 * `n.toLocaleString()` with no locale uses the *runtime* locale: en-US on the
 * Vercel server ("12,500") but e.g. ro-RO in a Romanian browser ("12.500").
 * When such a value is in server-rendered HTML, React throws #418 on hydration.
 * These helpers pin the locale so server and client always print the same text.
 */
const FORMATTERS = new Map<string, Intl.NumberFormat>();

function nf(locale: string, maxFractionDigits: number): Intl.NumberFormat {
  const key = `${locale}|${maxFractionDigits}`;
  let f = FORMATTERS.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits });
    FORMATTERS.set(key, f);
  }
  return f;
}

/** 12500 → "12,500" (fixed en-US grouping, same on server and client). */
export function formatNumber(n: number, locale = "en-US", maxFractionDigits = 2): string {
  return nf(locale, maxFractionDigits).format(Number.isFinite(n) ? n : 0);
}

/** Rounded whole euros without the symbol: 12499.6 → "12,500". */
export function formatEurInt(n: number, locale = "en-US"): string {
  return formatNumber(Math.round(n), locale, 0);
}
