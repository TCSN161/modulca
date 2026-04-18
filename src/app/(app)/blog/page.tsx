import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getLocalizedArticles, LANGUAGE_BADGE } from "@/features/blog/locale";
import type { Locale } from "@/i18n/config";
import { AuthNav } from "@/features/auth/components/AuthNav";

export const metadata: Metadata = {
  title: "Blog — ModulCA",
  description:
    "Insights on modular construction, AI architecture, building regulations, costs, and sustainable design in Romania and Europe.",
  openGraph: {
    title: "ModulCA Blog",
    description:
      "Modular construction insights, building regulations, and AI-powered architecture.",
    type: "website",
    images: [
      {
        url: "/og?title=Blog&subtitle=Modular+construction+insights",
        width: 1200,
        height: 630,
        alt: "ModulCA Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ModulCA Blog",
    description:
      "Modular construction insights, building regulations, and AI-powered architecture.",
    images: [
      "/og?title=Blog&subtitle=Modular+construction+insights",
    ],
  },
};

export default async function BlogPage() {
  // Server-side locale detection via next-intl (cookie → domain → Accept-Language).
  // Listing is RO-first when the user is on the RO locale, EN-first otherwise;
  // articles without a version in the active locale still appear (with a badge)
  // so users never lose access to content.
  const locale = (await getLocale()) as Locale;
  const sortedArticles = getLocalizedArticles(locale);
  const dateLocale = locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-US";
  const allTags = Array.from(new Set(sortedArticles.flatMap((a) => a.tags))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-teal-800 mb-3">ModulCA Blog</h1>
          <p className="text-gray-500">
            Insights on modular construction, AI-powered design, and building in Romania &amp; Europe.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {sortedArticles.length} articles · Updated weekly
          </p>
        </div>

        {/* Tag cloud */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {allTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-6">
          {sortedArticles.map((article) => {
            const badge = LANGUAGE_BADGE[article.language];
            return (
              <Link
                key={`${article.language}:${article.slug}`}
                href={`/blog/${article.slug}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(article.date).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-gray-300">&middot;</span>
                  <span className="text-xs text-gray-400">{article.readMinutes} min read</span>
                  <span
                    className="ml-auto inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500"
                    title={badge.title}
                    aria-label={`Language: ${badge.title}`}
                  >
                    <span aria-hidden="true">{badge.flag}</span>
                    <span>{badge.label}</span>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-brand-teal-800 mb-2">{article.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-teal-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-teal-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Cross-links */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/library"
            className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📚</span>
            <h3 className="mt-2 text-sm font-bold text-gray-800">Knowledge Library</h3>
            <p className="mt-1 text-xs text-gray-500">200+ articles on architecture, regulations &amp; standards</p>
          </Link>
          <Link
            href="/library/guides"
            className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">🗺️</span>
            <h3 className="mt-2 text-sm font-bold text-gray-800">Practical Guides</h3>
            <p className="mt-1 text-xs text-gray-500">Step-by-step guides with checklists &amp; real costs</p>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl bg-brand-teal-800 p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Design Your Modular Home?</h2>
          <p className="text-brand-teal-200 text-sm mb-5">
            Start with our free demo — no account needed.
          </p>
          <Link
            href="/project/demo/land"
            className="inline-flex rounded-lg bg-brand-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </div>
  );
}
