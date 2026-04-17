"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";

/**
 * Language Switcher — dropdown, works anywhere (header, footer, settings).
 *
 * Principle: modular — reads locales from i18n/config.ts. Adding a new locale
 * (e.g. "es") automatically appears here with zero code changes.
 *
 * Strategy: POST to /api/locale (sets cookie), then reload page so server
 * re-detects locale. Cookie wins over domain + Accept-Language.
 */

type Variant = "dropdown" | "inline";

export default function LanguageSwitcher({ variant = "dropdown" }: { variant?: Variant }) {
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("language.switcher");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function changeLocale(locale: Locale) {
    if (locale === currentLocale || pending) return;
    setOpen(false);
    startTransition(async () => {
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        // Reload so server picks up new cookie
        window.location.reload();
      } catch (err) {
        console.error("[LanguageSwitcher] Failed to change locale:", err);
      }
    });
  }

  const currentLabel = LOCALE_LABELS[currentLocale];

  if (variant === "inline") {
    // Inline: 3 buttons side by side (for footers or settings pages)
    return (
      <div className="flex items-center gap-1 text-xs">
        {LOCALES.map((l) => {
          const label = LOCALE_LABELS[l];
          const active = l === currentLocale;
          return (
            <button
              key={l}
              onClick={() => changeLocale(l)}
              disabled={pending || active}
              className={`px-2 py-1 rounded transition-colors ${
                active
                  ? "bg-brand-olive-700 text-white font-semibold"
                  : "text-brand-gray hover:text-brand-charcoal hover:bg-brand-bone-200"
              }`}
              aria-label={`${t("label")}: ${label.english}`}
              title={label.english}
            >
              <span className="mr-1">{label.flag}</span>
              {label.native}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown (default): compact button, expands on click
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-brand-gray hover:text-brand-charcoal hover:bg-brand-bone-200 rounded transition-colors"
        aria-label={t("tooltip")}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{currentLabel.flag}</span>
        <span className="hidden sm:inline">{currentLabel.native}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true">
          <path d="M5 6L0 0h10L5 6z" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Menu */}
          <ul
            role="menu"
            className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-white border border-brand-bone-300/60 rounded-lg shadow-lg overflow-hidden"
          >
            {LOCALES.map((l) => {
              const label = LOCALE_LABELS[l];
              const active = l === currentLocale;
              return (
                <li key={l} role="none">
                  <button
                    role="menuitem"
                    onClick={() => changeLocale(l)}
                    disabled={pending || active}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      active
                        ? "bg-brand-olive-50 text-brand-olive-700 font-semibold"
                        : "text-brand-charcoal hover:bg-brand-bone-100"
                    }`}
                  >
                    <span>{label.flag}</span>
                    <span>{label.native}</span>
                    {active && (
                      <svg
                        className="ml-auto"
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M4.5 7.5L1.5 4.5l-1 1L4.5 9.5l7-7-1-1-6 6z" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
