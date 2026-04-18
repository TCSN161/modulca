import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Footer from "@/features/shared/components/Footer";
import { AuthNav } from "@/features/auth/components/AuthNav";
import MobileNav from "@/app/MobileNav";
import {
  faqPageSchema,
  breadcrumbListSchema,
  jsonLdScript,
  SITE_URL,
  type FAQEntry,
} from "@/shared/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${SITE_URL}/faq` },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${SITE_URL}/faq`,
      images: [
        {
          url: "/og?title=Frequently+Asked+Questions&subtitle=Everything+about+ModulCA",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  FAQ group structure — content pulled from i18n at render time     */
/* ------------------------------------------------------------------ */

const FAQ_GROUPS: { id: string; questionKeys: string[] }[] = [
  { id: "platform", questionKeys: ["q1", "q2", "q3", "q4"] },
  { id: "modules", questionKeys: ["q1", "q2", "q3", "q4"] },
  { id: "pricing", questionKeys: ["q1", "q2", "q3", "q4"] },
  { id: "permits", questionKeys: ["q1", "q2", "q3", "q4"] },
  { id: "timeline", questionKeys: ["q1", "q2", "q3"] },
  { id: "ai", questionKeys: ["q1", "q2", "q3"] },
];

export default function FAQPage() {
  const t = useTranslations("faq");
  const tNav = useTranslations("nav");

  // Build the entries the schema helper expects, translated
  const allFaqs: FAQEntry[] = FAQ_GROUPS.flatMap((g) =>
    g.questionKeys.map((qk) => ({
      question: t(`groups.${g.id}.${qk}.question`),
      answer: t(`groups.${g.id}.${qk}.answer`),
    })),
  );
  const faqLd = faqPageSchema(allFaqs);
  const breadcrumbs = breadcrumbListSchema([
    { name: t("breadcrumbHome"), url: SITE_URL },
    { name: t("breadcrumbCurrent"), url: `${SITE_URL}/faq` },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
      />
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
            <Link href="/faq" className="text-sm font-medium text-brand-charcoal">{tNav("faq")}</Link>
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
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-xs text-brand-gray" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-charcoal">{t("breadcrumbHome")}</Link>
              <span className="mx-2">/</span>
              <span>{t("breadcrumbCurrent")}</span>
            </nav>
            <h1 className="mb-4 text-4xl font-bold tracking-heading text-brand-charcoal md:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-lg text-brand-gray">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* ---- FAQ Groups ---- */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.id} className="mb-14 last:mb-0">
              <h2 className="mb-6 border-b border-brand-bone-300/60 pb-3 text-2xl font-bold tracking-heading text-brand-charcoal">
                {t(`groups.${group.id}.title`)}
              </h2>
              <div className="divide-y divide-brand-bone-300/40">
                {group.questionKeys.map((qk) => {
                  const question = t(`groups.${group.id}.${qk}.question`);
                  const answer = t(`groups.${group.id}.${qk}.answer`);
                  return (
                    <details
                      key={`${group.id}-${qk}`}
                      className="group py-5 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                        <h3 className="text-base font-semibold text-brand-charcoal md:text-lg">
                          {question}
                        </h3>
                        <span
                          className="mt-1 flex-shrink-0 text-brand-amber-600 transition-transform group-open:rotate-45"
                          aria-hidden
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                      </summary>
                      <p className="mt-3 text-base leading-relaxed text-brand-gray">
                        {answer}
                      </p>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ---- CTA ---- */}
        <section className="border-t border-brand-bone-300/60 bg-brand-bone-200/40">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="mb-3 text-2xl font-bold tracking-heading text-brand-charcoal md:text-3xl">
              {t("cta.title")}
            </h2>
            <p className="mb-8 text-brand-gray">
              {t("cta.description")}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-lg bg-brand-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-charcoal/90"
              >
                {t("cta.startFree")}
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-brand-bone-300 bg-white px-6 py-3 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-bone-100"
              >
                {t("cta.comparePlans")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
