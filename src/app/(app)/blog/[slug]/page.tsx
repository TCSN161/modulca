import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getAllSlugs } from "@/features/blog/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-brand-teal-800">
            &larr; All Articles
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12">
        {/* Meta */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-400">
              {new Date(article.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-400">{article.readMinutes} min read</span>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-400">{article.author}</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-teal-800 leading-tight mb-3">
            {article.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">{article.excerpt}</p>
        </div>

        <hr className="mb-8 border-gray-100" />

        {/* Body */}
        <div className="space-y-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="text-xl font-bold text-brand-teal-800 mb-3">
                  {section.heading}
                </h2>
              )}
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-gray-600 leading-relaxed mb-3">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-10 pt-6 border-t border-gray-100">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-teal-50 px-3 py-1 text-xs font-medium text-brand-teal-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
          <h3 className="text-lg font-bold text-brand-teal-800 mb-2">
            Design Your Modular Home Today
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Try ModulCA&apos;s free demo — place modules, visualize in 3D, get AI renders.
          </p>
          <Link
            href="/project/demo/land"
            className="inline-flex rounded-lg bg-brand-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
          >
            Start Free Demo
          </Link>
        </div>
      </article>
    </div>
  );
}
