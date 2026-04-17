/**
 * next-intl request config (server-side).
 *
 * Called on every request to load the appropriate messages JSON for the
 * detected locale. Locale is determined from cookie / Accept-Language /
 * domain via detectLocale() in ./config.ts.
 *
 * Fallback chain: requested locale → en (default) → raw key.
 * If `nl.json` is missing a key, next-intl auto-falls back to en.
 */

import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, detectLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale: Locale = detectLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
    host: headerStore.get("host"),
  });

  // Dynamic import so we only ship the locale's JSON that's needed
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
