"use client";

/**
 * Per-article language switcher shown on the blog detail page when a
 * translation of the same slug exists in another language.
 *
 * Sets the locale cookie via /api/locale (the same endpoint used by the
 * global LanguageSwitcher) and reloads the current URL, so the server
 * re-resolves /blog/[slug] in the newly selected language. The URL stays
 * the same — only the rendered content changes.
 */

import { useTransition } from "react";
import { LANGUAGE_BADGE, type ArticleLocale } from "./locale";

interface Props {
  available: ArticleLocale[];
}

export function ArticleLanguageSwitcher({ available }: Props) {
  const [pending, startTransition] = useTransition();

  function switchTo(locale: ArticleLocale) {
    if (pending) return;
    startTransition(async () => {
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        window.location.reload();
      } catch (err) {
        console.error("[ArticleLanguageSwitcher] Failed to switch locale:", err);
      }
    });
  }

  if (available.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
      <span>Also available in:</span>
      {available.map((lang) => {
        const badge = LANGUAGE_BADGE[lang];
        return (
          <button
            key={lang}
            type="button"
            onClick={() => switchTo(lang)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 font-semibold uppercase text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title={`Read in ${badge.title}`}
          >
            <span aria-hidden="true">{badge.flag}</span>
            <span>{badge.label}</span>
          </button>
        );
      })}
    </div>
  );
}
