/**
 * Locale-aware blog helpers.
 *
 * Merges EN (src/features/blog/articles.ts) and RO (src/features/blog/articles-ro.ts)
 * sources, tagging each article with its language and computing cross-language
 * availability by slug. Pages consume these helpers instead of the raw
 * BLOG_ARTICLES arrays so that RO users see RO-first, fallback-to-EN listings,
 * and the detail page can surface a language-switcher when a translation is
 * available.
 *
 * NOTE: Today we only have two sources (EN + RO). The shape supports a future
 * NL source (just add a BLOG_ARTICLES_NL array and extend the map). No URL
 * changes — routing remains /blog + /blog/[slug]. Locale is read from the
 * next-intl cookie/domain chain on the server.
 */

import type { BlogArticle } from "./articles";
import { BLOG_ARTICLES } from "./articles";
import { BLOG_ARTICLES_RO } from "./articles-ro";
import type { Locale } from "@/i18n/config";

/** Per-article language tag. Derived, not stored on BlogArticle. */
export type ArticleLocale = "en" | "ro" | "nl";

export interface LocalizedBlogArticle extends BlogArticle {
  /** Which source language this article was authored in. */
  language: ArticleLocale;
  /** Other locales in which an article with this slug exists (excluding `language`). */
  availableIn: ArticleLocale[];
}

/** Registry of article sources keyed by language. Extend here to add NL, etc. */
const SOURCES: Record<ArticleLocale, BlogArticle[]> = {
  en: BLOG_ARTICLES,
  ro: BLOG_ARTICLES_RO,
  nl: [],
};

/** Build a slug → set-of-languages map once, for fast availability lookups. */
function buildSlugIndex(): Map<string, Set<ArticleLocale>> {
  const index = new Map<string, Set<ArticleLocale>>();
  for (const lang of Object.keys(SOURCES) as ArticleLocale[]) {
    for (const article of SOURCES[lang]) {
      const set = index.get(article.slug) ?? new Set<ArticleLocale>();
      set.add(lang);
      index.set(article.slug, set);
    }
  }
  return index;
}

const SLUG_INDEX = buildSlugIndex();

function tag(article: BlogArticle, language: ArticleLocale): LocalizedBlogArticle {
  const langs = SLUG_INDEX.get(article.slug) ?? new Set<ArticleLocale>([language]);
  const availableIn = [...langs].filter((l) => l !== language);
  return { ...article, language, availableIn };
}

/**
 * Get articles for the listing page, locale-aware.
 *
 * Behavior:
 *   - For each slug, prefer the version in the requested locale.
 *   - Fall back to EN if the requested locale has no version.
 *   - Always include the union of slugs across all sources (no 404 for EN-only
 *     articles when the user is on the RO locale — user intent is "show me
 *     the blog," not "hide English content").
 *   - Sorted newest-first.
 */
export function getLocalizedArticles(locale: Locale): LocalizedBlogArticle[] {
  const byLang = (lang: ArticleLocale) => new Map(SOURCES[lang].map((a) => [a.slug, a]));
  const enMap = byLang("en");
  const roMap = byLang("ro");
  const nlMap = byLang("nl");

  // Priority chain per locale. First hit wins.
  const chain: ArticleLocale[] =
    locale === "ro"
      ? ["ro", "en", "nl"]
      : locale === "nl"
        ? ["nl", "en", "ro"]
        : ["en", "ro", "nl"];

  const maps: Record<ArticleLocale, Map<string, BlogArticle>> = {
    en: enMap,
    ro: roMap,
    nl: nlMap,
  };

  const allSlugs = new Set<string>(SLUG_INDEX.keys());
  const out: LocalizedBlogArticle[] = [];

  for (const slug of allSlugs) {
    for (const lang of chain) {
      const hit = maps[lang].get(slug);
      if (hit) {
        out.push(tag(hit, lang));
        break;
      }
    }
  }

  return out.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/**
 * Look up a single article by slug, locale-aware.
 *
 * Behavior:
 *   - Prefer the requested locale's version.
 *   - Fall back to EN → any other language.
 *   - Returns undefined only if no source has this slug (true 404).
 */
export function getLocalizedArticle(
  slug: string,
  locale: Locale,
): LocalizedBlogArticle | undefined {
  const chain: ArticleLocale[] =
    locale === "ro"
      ? ["ro", "en", "nl"]
      : locale === "nl"
        ? ["nl", "en", "ro"]
        : ["en", "ro", "nl"];

  for (const lang of chain) {
    const hit = SOURCES[lang].find((a) => a.slug === slug);
    if (hit) return tag(hit, lang);
  }
  return undefined;
}

/** Union of all slugs across all languages — for generateStaticParams. */
export function getAllLocalizedSlugs(): string[] {
  return [...SLUG_INDEX.keys()];
}

/** Visual metadata per language tag. Keep in sync with i18n/config.ts labels. */
export const LANGUAGE_BADGE: Record<ArticleLocale, { label: string; flag: string; title: string }> =
  {
    en: { label: "EN", flag: "🇬🇧", title: "English" },
    ro: { label: "RO", flag: "🇷🇴", title: "Română" },
    nl: { label: "NL", flag: "🇳🇱", title: "Nederlands" },
  };
