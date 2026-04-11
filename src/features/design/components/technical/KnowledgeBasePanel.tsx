"use client";

import { useState, useMemo } from "react";
import { ARTICLES, CATEGORIES, REGIONS } from "@/knowledge/_index";
import { CATEGORY_DEFINITIONS } from "@/knowledge/_taxonomy";
import type { KBDocumentMeta } from "@/knowledge/_types";

/**
 * KnowledgeBasePanel — browsable reference library powered by the
 * auto-generated knowledge index (76+ articles across 15 domains).
 * Categories, regions, and articles are all auto-discovered at build time.
 */

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
/*  Article Detail View                                                */
/* ------------------------------------------------------------------ */

function ArticleView({ article, onBack }: { article: KBDocumentMeta; onBack: () => void }) {
  const region = article.region
    ? REGIONS.find((r) => r.code === article.region)
    : null;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1 text-xs text-brand-teal-800 hover:underline"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h4 className="mb-2 text-sm font-bold text-gray-800">{article.title}</h4>

      {/* Metadata badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficultyColor(article.difficulty)}`}>
          {article.difficulty}
        </span>
        {region && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            {region.flag} {region.name}
          </span>
        )}
        {article.proOnly && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
            Pro
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {article.tags.map((tag) => (
          <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Sources */}
      {article.sources.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Sources</div>
          {article.sources.map((src, i) => (
            <div key={i} className="text-[11px] text-gray-600">{src}</div>
          ))}
        </div>
      )}

      {/* Related articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Related</div>
          <div className="flex flex-wrap gap-1">
            {article.relatedArticles.map((relId) => {
              const rel = ARTICLES.find((a) => a.id === relId);
              return rel ? (
                <span key={relId} className="rounded bg-brand-teal-50 px-1.5 py-0.5 text-[10px] text-brand-teal-800">
                  {rel.title}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-[11px] text-gray-500 leading-relaxed">
        Full article content available in the Neufert AI consultant — ask a question about this topic for detailed, personalized guidance.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Article List                                              */
/* ------------------------------------------------------------------ */

function CategoryView({
  articles,
  onSelectArticle,
  regionFilter,
  onRegionFilter,
  showRegionFilter,
}: {
  articles: KBDocumentMeta[];
  onSelectArticle: (article: KBDocumentMeta) => void;
  regionFilter: string | null;
  onRegionFilter: (r: string | null) => void;
  showRegionFilter: boolean;
}) {
  const filtered = regionFilter
    ? articles.filter((a) => a.region === regionFilter || (!a.region && regionFilter === "EU"))
    : articles;

  return (
    <div>
      {/* Region filter tabs for regulations */}
      {showRegionFilter && (
        <div className="mb-3 flex gap-1.5 flex-wrap">
          <button
            onClick={() => onRegionFilter(null)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              !regionFilter ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({articles.length})
          </button>
          {REGIONS.filter((r) => r.articleCount && r.articleCount > 0).map((r) => (
            <button
              key={r.code}
              onClick={() => onRegionFilter(r.code)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                regionFilter === r.code ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.flag} {r.code} ({r.articleCount})
            </button>
          ))}
          <button
            onClick={() => onRegionFilter("EU")}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              regionFilter === "EU" ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🇪🇺 EU ({articles.filter((a) => !a.region).length})
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {filtered.map((article) => {
          const region = article.region ? REGIONS.find((r) => r.code === article.region) : null;
          return (
            <button
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="w-full rounded-lg bg-gray-50 p-3 text-left hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 group-hover:text-brand-teal-800">
                    {region && <span className="mr-1">{region.flag}</span>}
                    {article.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`rounded-full px-1.5 py-0 text-[9px] font-medium ${difficultyColor(article.difficulty)}`}>
                      {article.difficulty}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {article.tags.slice(0, 3).join(" · ")}
                    </span>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-gray-400 group-hover:text-brand-teal-800 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-4 text-center text-xs text-gray-400">
            No articles in this filter
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */

export default function KnowledgeBasePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<KBDocumentMeta | null>(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  // Build category list with article counts, only showing non-empty categories
  const categories = useMemo(() => {
    return CATEGORIES
      .filter((c) => c.articleCount > 0)
      .map((c) => {
        const meta = getCategoryMeta(c.id);
        return {
          ...c,
          label: meta?.label || c.id,
          icon: meta?.icon || "📄",
        };
      })
      .sort((a, b) => a.order - b.order);
  }, []);

  // Get articles for the active category
  const categoryArticles = useMemo(() => {
    if (!activeCategoryId) return [];
    return ARTICLES.filter((a) => a.category === activeCategoryId);
  }, [activeCategoryId]);

  // Search across all articles
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

  if (!open) return null;

  const activeCategory = activeCategoryId ? categories.find((c) => c.id === activeCategoryId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Knowledge Library
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {ARTICLES.length} articles · {REGIONS.filter((r) => (r.articleCount ?? 0) > 0).length} regions · {categories.length} categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
              placeholder="Search standards, dimensions, regulations..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-teal-800 focus:outline-none focus:ring-1 focus:ring-brand-teal-800"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeArticle ? (
            <ArticleView
              article={activeArticle}
              onBack={() => setActiveArticle(null)}
            />
          ) : activeCategoryId && activeCategory ? (
            <div>
              <button
                onClick={() => { setActiveCategoryId(null); setRegionFilter(null); }}
                className="mb-3 flex items-center gap-1 text-xs text-brand-teal-800 hover:underline"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All categories
              </button>
              <h3 className="mb-3 text-sm font-bold text-gray-800">
                {activeCategory.icon} {activeCategory.label}
              </h3>
              <CategoryView
                articles={categoryArticles}
                onSelectArticle={setActiveArticle}
                regionFilter={regionFilter}
                onRegionFilter={setRegionFilter}
                showRegionFilter={activeCategory.hasRegions}
              />
            </div>
          ) : search.trim() ? (
            <div>
              <div className="mb-3 text-xs text-gray-500">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </div>
              <CategoryView
                articles={searchResults}
                onSelectArticle={setActiveArticle}
                regionFilter={null}
                onRegionFilter={() => {}}
                showRegionFilter={false}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="w-full rounded-lg border border-gray-100 bg-white p-3 text-left hover:border-brand-teal-200 hover:bg-brand-teal-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-teal-800">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {cat.articleCount} article{cat.articleCount !== 1 ? "s" : ""}
                        {cat.hasRegions && (
                          <span className="ml-1">
                            · {REGIONS.filter((r) => (r.articleCount ?? 0) > 0).map((r) => r.flag).join(" ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className="h-4 w-4 text-gray-400 group-hover:text-brand-teal-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="text-[10px] text-gray-400 text-center">
            ModulCA Knowledge Library v2.0 — {ARTICLES.length} articles across {REGIONS.filter((r) => (r.articleCount ?? 0) > 0).length} country codes + EU standards
          </div>
        </div>
      </div>
    </div>
  );
}
