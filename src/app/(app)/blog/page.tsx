import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_ARTICLES } from "@/features/blog/articles";
import { AuthNav } from "@/features/auth/components/AuthNav";

export const metadata: Metadata = {
  title: "Blog — ModulCA",
  description:
    "Insights on modular construction, AI architecture, building regulations, costs, and sustainable design in Romania and Europe.",
  openGraph: {
    title: "ModulCA Blog",
    description: "Modular construction insights, building regulations, and AI-powered architecture.",
    type: "website",
  },
};

/** Sorted newest-first */
const sortedArticles = [...BLOG_ARTICLES].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

/** All unique tags across articles */
const allTags = Array.from(
  new Set(BLOG_ARTICLES.flatMap((a) => a.tags))
).sort();

export default function BlogPage() {
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
            {BLOG_ARTICLES.length} articles · Updated weekly
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
          {sortedArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs text-gray-300">&middot;</span>
                <span className="text-xs text-gray-400">{article.readMinutes} min read</span>
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
          ))}
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
