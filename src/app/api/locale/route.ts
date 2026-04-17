/**
 * POST /api/locale
 * Sets the user's locale preference via HTTP-only cookie.
 * Body: { locale: "en" | "ro" | "nl" }
 *
 * After setting the cookie, the client should reload the page to pick up
 * the new translations (next-intl resolves locale at request time).
 */

import { NextRequest, NextResponse } from "next/server";
import { LOCALES, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { locale?: string };

  if (!body.locale || !(LOCALES as readonly string[]).includes(body.locale)) {
    return NextResponse.json(
      { error: `Invalid locale. Valid: ${LOCALES.join(", ")}` },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true, locale: body.locale });
  res.cookies.set(LOCALE_COOKIE, body.locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // Client can read for UI state
  });
  return res;
}
