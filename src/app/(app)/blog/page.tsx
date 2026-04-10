import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_ARTICLES } from "@/features/blog/articles";
import { AuthNav } from "@/features/auth/components/AuthNav";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on modular construction, AI architecture, costs, and building in Romania.",
};

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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand-teal-800 mb-3">ModulCA Blog</h1>
          <p className="text-gray-500">
            Insights on modular construction, AI-powered design, and building in Romania.
          </p>
        </div>

        <div className="space-y-6">
          {BLOG_ARTICLES.map((article) => (
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
              <div className="flex gap-2 mt-3">
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

        {/* CTA */}
        <div className="mt-16 rounded-xl bg-brand-teal-800 p-8 text-center text-white">
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
