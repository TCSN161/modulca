import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Footer — fully i18n-ready.
 * Labels come from next-intl messages (locale-aware).
 * Hrefs are locale-agnostic (same URL structure).
 *
 * To translate: edit src/i18n/messages/<locale>.json → footer.*
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-brand-bone-300/60 bg-brand-bone-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Links grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-sm font-bold tracking-heading text-brand-charcoal">
              Modul<span className="text-brand-amber-500">CA</span>
            </Link>
            <p className="mt-2 text-xs text-brand-gray leading-relaxed">
              {t("tagline")}
            </p>
            <p className="mt-1 text-[10px] text-brand-gray/80">
              {t("companyInfo")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-label text-brand-gray mb-3">
              {t("product.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/project/new" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("product.features")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("product.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/library" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("product.library")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("product.portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("product.blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-label text-brand-gray mb-3">
              {t("company.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/press" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("company.press")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {tNav("faq")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@modulca.eu"
                  className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors"
                >
                  {t("company.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-label text-brand-gray mb-3">
              {t("legal.title")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("legal.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("legal.terms")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("legal.cookies")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/account" className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors">
                  {t("legal.gdpr")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-brand-bone-300/40 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs text-brand-gray">
              &copy; {new Date().getFullYear()} ModulCA. {t("allRights")}.
            </p>
            <p className="text-[10px] text-brand-gray/60 mt-1">
              {t("madeIn")} &mdash; {t("network")}
            </p>
          </div>
          <LanguageSwitcher variant="inline" />
        </div>
      </div>
    </footer>
  );
}
