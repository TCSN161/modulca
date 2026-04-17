import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://www.modulca.eu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      /* ── Default: allow most public content ─────────────────── */
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/portfolio",
          "/pricing",
          "/library",
          "/faq",
          "/press",
          "/quiz",
          "/wizard",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/_internal/", // Dev-only routes (Sentry test, debug pages)
          "/dashboard/",
          "/project/*", // Private user projects; /project/demo is public via allow below
          "/update-password", // Token-protected, not indexable
          "/reset-password",
          "/auth/callback",
          "/login?*", // Query-string variants (with returnTo)
          "/*?*", // Generic query-string pages (search params create duplicates)
        ],
      },
      /* ── Re-allow /project/demo since it's the public showcase ─ */
      {
        userAgent: "*",
        allow: ["/project/demo", "/project/demo/"],
      },
      /* ── Slow down aggressive / low-value crawlers ─────────── */
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "dataforseobot",
        ],
        crawlDelay: 10,
      },
      /* ── Block training-data scrapers (opt-out) ────────────── */
      {
        userAgent: [
          "GPTBot",
          "CCBot",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "Google-Extended",
          "FacebookBot",
          "Bytespider",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
