/**
 * i18n configuration — modular, extensible.
 *
 * Adding a new locale is a 3-step process:
 *   1. Add code here (e.g. "es", "de", "fr")
 *   2. Create src/i18n/messages/<code>.json with translated strings
 *      (fallback chain: <requested> → en → raw key, so partial files are OK)
 *   3. Optionally add a flag/label in LanguageSwitcher
 *
 * No other code changes needed.
 *
 * Principle: RO + EN + NL active from day 1 (per ECOSYSTEM_ARCHITECTURE.md).
 * Other languages added incrementally as markets expand.
 */

export const LOCALES = ["en", "ro", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Display labels per locale (for switcher UI) */
export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "🇬🇧" },
  ro: { native: "Română", english: "Romanian", flag: "🇷🇴" },
  nl: { native: "Nederlands", english: "Dutch", flag: "🇳🇱" },
};

/** Cookie name where user's locale preference is stored */
export const LOCALE_COOKIE = "modulca-locale";

/** Cookie max age (1 year) */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Domain-based locale mapping.
 * When a request arrives on modulca.ro, default to "ro" unless cookie overrides.
 * When on modulca.nl, default to "nl". Otherwise default to "en".
 */
export const DOMAIN_LOCALE_MAP: Record<string, Locale> = {
  "modulca.ro": "ro",
  "www.modulca.ro": "ro",
  "modulca.nl": "nl",
  "www.modulca.nl": "nl",
  // modulca.eu + localhost + Vercel preview → default (en), can be overridden by cookie/header
};

/**
 * Detect locale from cookie → Accept-Language header → domain → default.
 * Used in middleware and server components.
 */
export function detectLocale(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  host?: string | null;
}): Locale {
  // 1. Explicit user choice (cookie) wins
  if (input.cookie && (LOCALES as readonly string[]).includes(input.cookie)) {
    return input.cookie as Locale;
  }

  // 2. Domain-based default
  if (input.host) {
    const domain = input.host.toLowerCase().split(":")[0];
    if (DOMAIN_LOCALE_MAP[domain]) return DOMAIN_LOCALE_MAP[domain];
  }

  // 3. Accept-Language header (first preferred match)
  if (input.acceptLanguage) {
    const prefs = input.acceptLanguage
      .split(",")
      .map((s) => s.split(";")[0].trim().toLowerCase().split("-")[0]);
    for (const p of prefs) {
      if ((LOCALES as readonly string[]).includes(p)) return p as Locale;
    }
  }

  return DEFAULT_LOCALE;
}
