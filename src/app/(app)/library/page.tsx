"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ARTICLES, CATEGORIES, REGIONS } from "@/knowledge/_index";
import { CATEGORY_DEFINITIONS } from "@/knowledge/_taxonomy";
import type { KBDocumentMeta } from "@/knowledge/_types";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { useAuthStore } from "@/features/auth/store";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryMeta(id: string) {
  return CATEGORY_DEFINITIONS.find((c) => c.id === id);
}

function difficultyColor(d: string) {
  switch (d) {
    case "beginner": return "bg-green-100 text-green-700";
    case "intermediate": return "bg-yellow-100 text-yellow-700";
    case "advanced": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

/* ------------------------------------------------------------------ */
/*  Markdown Renderer                                                  */
/* ------------------------------------------------------------------ */

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">$1</code>');
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table: collect consecutive | lines
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Parse table: first line = header, second = separator (skip), rest = body
      if (tableLines.length >= 2) {
        const parseRow = (row: string) =>
          row.split("|").slice(1, -1).map((c) => c.trim());
        const headers = parseRow(tableLines[0]);
        const isSeparator = (row: string) => /^\|[\s\-:|]+\|$/.test(row);
        const bodyStart = isSeparator(tableLines[1]) ? 2 : 1;
        const bodyRows = tableLines.slice(bodyStart).map(parseRow);

        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200" dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-600 border-b border-gray-100" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
      // Fallback: not a real table
      for (const tl of tableLines) {
        elements.push(<pre key={`pre-${i}-${elements.length}`} className="text-xs text-gray-600 overflow-x-auto">{tl}</pre>);
      }
      continue;
    }

    // Headers
    if (line.startsWith("# ")) { elements.push(<h2 key={i} className="mt-6 mb-3 text-lg font-bold text-gray-900">{line.slice(2)}</h2>); i++; continue; }
    if (line.startsWith("## ")) { elements.push(<h3 key={i} className="mt-5 mb-2 text-base font-bold text-gray-800">{line.slice(3)}</h3>); i++; continue; }
    if (line.startsWith("### ")) { elements.push(<h4 key={i} className="mt-4 mb-2 text-sm font-bold text-gray-700">{line.slice(4)}</h4>); i++; continue; }

    // List items
    if (line.startsWith("- ")) {
      elements.push(<div key={i} className="ml-4 text-sm text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: "&#8226; " + formatInline(line.slice(2)) }} />);
      i++; continue;
    }

    // Italic paragraph
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      elements.push(<p key={i} className="text-xs text-gray-500 italic">{line.slice(1, -1)}</p>);
      i++; continue;
    }

    // Horizontal rule
    if (line === "---") { elements.push(<hr key={i} className="my-4 border-gray-200" />); i++; continue; }

    // Empty line
    if (line.trim() === "") { elements.push(<div key={i} className="h-2" />); i++; continue; }

    // Regular paragraph
    elements.push(<p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    i++;
  }

  return <div className="space-y-0">{elements}</div>;
}

/* ------------------------------------------------------------------ */
/*  Article Detail                                                     */
/* ------------------------------------------------------------------ */

function ArticleDetail({
  article,
  onBack,
  onSelectArticle,
  tier,
}: {
  article: KBDocumentMeta;
  onBack: () => void;
  onSelectArticle: (a: KBDocumentMeta) => void;
  tier: string;
}) {
  const region = article.region
    ? REGIONS.find((r) => r.code === article.region)
    : null;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    setLoading(true);
    setContent(null);
    fetch(`/api/knowledge?id=${encodeURIComponent(article.id)}&tier=${tier}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content);
          setTruncated(!!data.truncated);
        } else if (data.error === "Premium required") {
          setContent(null);
        } else {
          setContent(null);
        }
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [article.id, tier]);

  const isLocked = article.proOnly && tier === "free";

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-brand-teal-800 hover:underline"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h2 className="mb-3 text-xl font-bold text-gray-900">{article.title}</h2>

      {/* Metadata badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor(article.difficulty)}`}>
          {article.difficulty}
        </span>
        {region && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {region.flag} {region.name}
          </span>
        )}
        {article.proOnly && (
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
            Pro
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {article.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Sources */}
      {article.sources.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-1 text-xs font-bold uppercase text-gray-400">Sources</h4>
          {article.sources.map((src, i) => (
            <div key={i} className="text-sm text-gray-600">{src}</div>
          ))}
        </div>
      )}

      {/* Article content */}
      {loading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
          <span className="ml-2 text-sm text-gray-500">Loading article...</span>
        </div>
      ) : isLocked || !content ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-8 text-center">
          <div className="mb-2 text-3xl">🔒</div>
          <h3 className="mb-2 text-base font-semibold text-purple-800">Premium Content</h3>
          <p className="mb-4 text-sm text-purple-600">
            Full article content is available for Premium and Architect subscribers.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Upgrade to Premium
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <MarkdownContent content={content} />
          {truncated && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-800">
                Article truncated on free tier.{" "}
                <Link href="/pricing" className="font-semibold underline hover:text-amber-900">
                  Upgrade to Premium
                </Link>{" "}
                for the full content.
              </p>
            </div>
          )}
          <div className="mt-4 rounded-xl bg-brand-teal-50/30 border border-brand-teal-100 p-4">
            <p className="text-xs text-gray-600">
              Need personalized guidance? Ask the{" "}
              <Link href="/project/demo/consultant" className="font-semibold text-brand-teal-800 hover:underline">
                Neufert AI Consultant
              </Link>{" "}
              about this topic.
            </p>
          </div>
        </div>
      )}

      {/* Related articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-xs font-bold uppercase text-gray-400">Related Articles</h4>
          <div className="flex flex-wrap gap-2">
            {article.relatedArticles.map((relId) => {
              const rel = ARTICLES.find((a) => a.id === relId);
              return rel ? (
                <button
                  key={relId}
                  onClick={() => onSelectArticle(rel)}
                  className="rounded-lg bg-brand-teal-50 px-3 py-1.5 text-xs font-medium text-brand-teal-800 hover:bg-brand-teal-100 transition-colors"
                >
                  {rel.title}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Article Card                                                       */
/* ------------------------------------------------------------------ */

function ArticleCard({
  article,
  onClick,
}: {
  article: KBDocumentMeta;
  onClick: () => void;
}) {
  const region = article.region ? REGIONS.find((r) => r.code === article.region) : null;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm hover:border-brand-teal-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-teal-800">
            {region && <span className="mr-1">{region.flag}</span>}
            {article.title}
            {article.proOnly && (
              <span className="ml-2 inline-block rounded-full bg-purple-100 px-1.5 py-0 text-[9px] font-bold text-purple-700 align-middle">
                PRO
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`rounded-full px-1.5 py-0 text-[10px] font-medium ${difficultyColor(article.difficulty)}`}>
              {article.difficulty}
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              {article.tags.slice(0, 4).join(" · ")}
            </span>
          </div>
        </div>
        <svg
          className="h-4 w-4 text-gray-300 group-hover:text-brand-teal-800 flex-shrink-0 mt-1"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Library Page                                                  */
/* ------------------------------------------------------------------ */

export default function LibraryPage() {
  const userTier = useAuthStore((s) => s.userTier);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<KBDocumentMeta | null>(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  // Non-empty categories sorted by taxonomy order
  const categories = useMemo(() => {
    return CATEGORIES
      .filter((c) => c.articleCount > 0)
      .map((c) => {
        const meta = getCategoryMeta(c.id);
        return { ...c, label: meta?.label || c.id, icon: meta?.icon || "📄", hasRegions: meta?.hasRegions ?? false };
      })
      .sort((a, b) => a.order - b.order);
  }, []);

  const categoryArticles = useMemo(() => {
    if (!activeCategoryId) return [];
    let arts = ARTICLES.filter((a) => a.category === activeCategoryId);
    if (regionFilter) {
      arts = arts.filter((a) => a.region === regionFilter || (!a.region && regionFilter === "EU"));
    }
    return arts;
  }, [activeCategoryId, regionFilter]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)) ||
        (a.sources && a.sources.some((s) => s.toLowerCase().includes(q)))
    );
  }, [search]);

  const activeCategory = activeCategoryId ? categories.find((c) => c.id === activeCategoryId) : null;
  const regionsWithArticles = REGIONS.filter((r) => (r.articleCount ?? 0) > 0);

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-brand-charcoal">
              ModulCA
            </Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">|</span>
            <h1 className="hidden sm:inline-block text-sm font-semibold text-gray-700">
              Knowledge Library
            </h1>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Hero / Stats bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Architecture Knowledge Library</h2>
              <p className="mt-1 text-sm text-gray-500">
                {ARTICLES.length} articles across {categories.length} domains and{" "}
                {regionsWithArticles.length} country regulations
              </p>
            </div>
            <div className="flex items-center gap-3">
              {regionsWithArticles.map((r) => (
                <span key={r.code} className="text-lg" title={r.name}>{r.flag}</span>
              ))}
              <span className="text-lg" title="EU shared standards">🇪🇺</span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 max-w-xl">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveCategoryId(null);
                  setActiveArticle(null);
                  setRegionFilter(null);
                }}
                placeholder="Search standards, regulations, dimensions, styles..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {activeArticle ? (
          /* Article detail view */
          <ArticleDetail
            article={activeArticle}
            onBack={() => setActiveArticle(null)}
            onSelectArticle={(a) => setActiveArticle(a)}
            tier={userTier}
          />
        ) : activeCategoryId && activeCategory ? (
          /* Category article list */
          <div>
            <button
              onClick={() => { setActiveCategoryId(null); setRegionFilter(null); }}
              className="mb-4 flex items-center gap-1.5 text-sm text-brand-teal-800 hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All categories
            </button>

            <h3 className="mb-1 text-lg font-bold text-gray-900">
              {activeCategory.icon} {activeCategory.label}
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              {ARTICLES.filter((a) => a.category === activeCategoryId).length} articles
            </p>

            {/* Region filter for regulations */}
            {activeCategory.hasRegions && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setRegionFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    !regionFilter ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {regionsWithArticles.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => setRegionFilter(r.code)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      regionFilter === r.code ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r.flag} {r.name} ({r.articleCount})
                  </button>
                ))}
                <button
                  onClick={() => setRegionFilter("EU")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    regionFilter === "EU" ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🇪🇺 EU Shared ({ARTICLES.filter((a) => a.category === activeCategoryId && !a.region).length})
                </button>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {categoryArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setActiveArticle(article)}
                />
              ))}
              {categoryArticles.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-gray-400">
                  No articles match this filter
                </div>
              )}
            </div>
          </div>
        ) : search.trim() ? (
          /* Search results */
          <div>
            <p className="mb-4 text-sm text-gray-500">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {searchResults.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setActiveArticle(article)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Category grid */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className="rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-brand-teal-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800 group-hover:text-brand-teal-800">
                      {cat.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {cat.articleCount} article{cat.articleCount !== 1 ? "s" : ""}
                      {cat.hasRegions && (
                        <span className="ml-1.5">
                          · {regionsWithArticles.map((r) => r.flag).join(" ")} 🇪🇺
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-300 group-hover:text-brand-teal-800 flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">
          ModulCA Knowledge Library v2.0 — {ARTICLES.length} articles across Neufert standards, EU regulations, and {regionsWithArticles.length} country codes
        </p>
        <p className="mt-1 text-xs text-gray-400">
          <Link href="/pricing" className="hover:text-brand-teal-800 hover:underline">
            Upgrade to Premium
          </Link>{" "}
          for full article access and deep AI consultation
        </p>
      </footer>
    </div>
  );
}
