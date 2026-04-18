import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Footer from "@/features/shared/components/Footer";
import { AuthNav } from "@/features/auth/components/AuthNav";
import MobileNav from "@/app/MobileNav";
import {
  breadcrumbListSchema,
  jsonLdScript,
  SITE_URL,
} from "@/shared/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("press");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${SITE_URL}/press` },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${SITE_URL}/press`,
      images: [
        {
          url: "/og?title=Press+%26+Investors&subtitle=Modular+Construction+Platform",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Structural keys — actual labels/values pulled from i18n            */
/* ------------------------------------------------------------------ */

const COMPANY_FACTS = [
  { labelKey: "launchedLabel", valueKey: "launchedValue" },
  { labelKey: "marketsLabel", valueKey: "marketsValue" },
  { labelKey: "moduleLabel", valueKey: "moduleValue" },
  { labelKey: "knowledgeLabel", valueKey: "knowledgeValue" },
  { labelKey: "aiLabel", valueKey: "aiValue" },
  { labelKey: "tiersLabel", valueKey: "tiersValue" },
] as const;

const MARKET_FACTS = [
  { id: "romania", points: ["p1", "p2", "p3", "p4"] },
  { id: "netherlands", points: ["p1", "p2", "p3", "p4"] },
  { id: "moat", points: ["p1", "p2", "p3", "p4"] },
] as const;

const MEDIA_KIT = [
  { labelKey: "pressReleaseEn", statusKey: "statusComing" },
  { labelKey: "pressReleaseRo", statusKey: "statusComing" },
  { labelKey: "logoPack", statusKey: "statusOnRequest" },
  { labelKey: "screenshots", statusKey: "statusOnRequest" },
  { labelKey: "founderPhoto", statusKey: "statusOnRequest" },
  { labelKey: "pitchDeck", statusKey: "statusInvestors" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function PressPage() {
  const t = useTranslations("press");
  const tNav = useTranslations("nav");

  const breadcrumbs = breadcrumbListSchema([
    { name: tNav("home"), url: SITE_URL },
    { name: t("breadcrumbCurrent"), url: `${SITE_URL}/press` },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      {/* ---- Navigation ---- */}
      <nav className="sticky top-0 z-50 border-b border-brand-bone-300/60 bg-brand-bone-100/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-heading text-brand-charcoal">
            ModulCA
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">{tNav("features")}</Link>
            <Link href="/pricing" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">{tNav("pricing")}</Link>
            <Link href="/portfolio" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">{tNav("portfolio")}</Link>
            <Link href="/blog" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">{tNav("blog")}</Link>
            <Link href="/faq" className="text-sm font-medium text-brand-gray hover:text-brand-charcoal">{tNav("faq")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <AuthNav />
            <MobileNav />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* ---- Hero ---- */}
        <section className="border-b border-brand-bone-300/60 bg-gradient-to-b from-brand-bone-100 to-brand-bone-200/40 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-xs text-brand-gray" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-charcoal">{tNav("home")}</Link>
              <span className="mx-2">/</span>
              <span>{t("breadcrumbCurrent")}</span>
            </nav>
            <h1 className="mb-4 text-4xl font-bold tracking-heading text-brand-charcoal md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-3xl text-lg text-brand-gray">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* ---- Quick facts ---- */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold tracking-heading text-brand-charcoal">
            {t("glance.title")}
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_FACTS.map((fact) => (
              <div
                key={fact.labelKey}
                className="rounded-xl border border-brand-bone-300/60 bg-white p-5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                  {t(`glance.${fact.labelKey}`)}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-charcoal">
                  {t(`glance.${fact.valueKey}`)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- The thesis ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/30 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold tracking-heading text-brand-charcoal">
              {t("thesis.title")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {MARKET_FACTS.map((block) => (
                <div
                  key={block.id}
                  className="rounded-xl border border-brand-bone-300/60 bg-white p-6"
                >
                  <h3 className="mb-4 text-base font-bold tracking-heading text-brand-charcoal">
                    {t(`thesis.${block.id}.title`)}
                  </h3>
                  <ul className="space-y-2 text-sm leading-relaxed text-brand-gray">
                    {block.points.map((pk) => (
                      <li key={pk} className="flex gap-2">
                        <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-brand-amber-600" />
                        <span>{t(`thesis.${block.id}.${pk}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Founder note ---- */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold tracking-heading text-brand-charcoal">
            {t("founder.title")}
          </h2>
          <div className="prose prose-lg max-w-none text-brand-gray">
            <p>{t("founder.p1")}</p>
            <p>{t("founder.p2")}</p>
            <p className="text-sm text-brand-gray">
              {t("founder.signature")}
            </p>
          </div>
        </section>

        {/* ---- Media kit ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/30 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-2 text-2xl font-bold tracking-heading text-brand-charcoal">
              {t("mediaKit.title")}
            </h2>
            <p className="mb-8 text-sm text-brand-gray">
              {t("mediaKit.description")}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {MEDIA_KIT.map((item) => (
                <div
                  key={item.labelKey}
                  className="flex items-center justify-between rounded-lg border border-brand-bone-300/60 bg-white px-5 py-4"
                >
                  <span className="text-sm font-medium text-brand-charcoal">{t(`mediaKit.${item.labelKey}`)}</span>
                  <span className="text-xs text-brand-gray">{t(`mediaKit.${item.statusKey}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold tracking-heading text-brand-charcoal">
            {t("contact.title")}
          </h2>
          <p className="mb-6 text-brand-gray">
            {t("contact.description")}
          </p>
          <a
            href="mailto:press@modulca.eu"
            className="inline-block rounded-lg bg-brand-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-charcoal/90"
          >
            press@modulca.eu
          </a>
          <p className="mt-8 text-xs text-brand-gray">
            {t("contact.responseTime")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
