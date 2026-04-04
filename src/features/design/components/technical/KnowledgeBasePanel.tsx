"use client";

import { useState } from "react";
import { KNOWLEDGE_BASE, type KBCategory, type KBArticle } from "./knowledgeBase";

/**
 * KnowledgeBasePanel — collapsible reference library sidebar/modal
 * for the Technical step. Provides Neufert-style reference data
 * curated for modular wooden house construction.
 */

function ArticleView({ article, onBack }: { article: KBArticle; onBack: () => void }) {
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
      <h4 className="mb-1 text-sm font-bold text-gray-800">
        {article.icon} {article.title}
      </h4>
      <p className="mb-3 text-[11px] text-gray-500 leading-relaxed">{article.summary}</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-1.5 text-left font-semibold text-gray-500">Item</th>
            <th className="py-1.5 text-right font-semibold text-gray-500">Value</th>
          </tr>
        </thead>
        <tbody>
          {article.entries.map((entry, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="py-1.5 text-gray-700 pr-2">{entry.label}</td>
              <td className="py-1.5 text-right font-medium text-gray-900 whitespace-nowrap">
                {entry.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Notes section */}
      {article.entries.some((e) => e.note) && (
        <div className="mt-3 space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase">Notes</div>
          {article.entries
            .filter((e) => e.note)
            .map((entry, i) => (
              <div key={i} className="text-[11px] text-gray-500">
                <span className="font-medium text-gray-600">{entry.label}:</span>{" "}
                {entry.note}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function CategoryView({
  category,
  onSelectArticle,
}: {
  category: KBCategory;
  onSelectArticle: (article: KBArticle) => void;
}) {
  return (
    <div className="space-y-1.5">
      {category.articles.map((article) => (
        <button
          key={article.id}
          onClick={() => onSelectArticle(article)}
          className="w-full rounded-lg bg-gray-50 p-3 text-left hover:bg-gray-100 transition-colors group"
        >
          <div className="flex items-start gap-2">
            <span className="text-base">{article.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 group-hover:text-brand-teal-800">
                {article.title}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                {article.summary}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {article.entries.length} entries
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
      ))}
    </div>
  );
}

export default function KnowledgeBasePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<KBCategory | null>(null);
  const [activeArticle, setActiveArticle] = useState<KBArticle | null>(null);
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filteredCategories = search.trim()
    ? KNOWLEDGE_BASE.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.summary.toLowerCase().includes(search.toLowerCase()) ||
            a.entries.some(
              (e) =>
                e.label.toLowerCase().includes(search.toLowerCase()) ||
                e.value.toLowerCase().includes(search.toLowerCase())
            )
        ),
      })).filter((cat) => cat.articles.length > 0)
    : KNOWLEDGE_BASE;

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
              Construction Manual
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              ModulCA Reference Library — Modular Wooden Houses
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
                setActiveCategory(null);
                setActiveArticle(null);
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
          ) : activeCategory ? (
            <div>
              <button
                onClick={() => setActiveCategory(null)}
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
                category={activeCategory}
                onSelectArticle={setActiveArticle}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className="w-full rounded-lg border border-gray-100 bg-white p-3 text-left hover:border-brand-teal-200 hover:bg-brand-teal-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-teal-800">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {cat.articles.length} article{cat.articles.length !== 1 ? "s" : ""}
                        {" · "}
                        {cat.articles.reduce((sum, a) => sum + a.entries.length, 0)} entries
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
              {filteredCategories.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">
                  No results for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="text-[10px] text-gray-400 text-center">
            ModulCA Construction Manual v1.0 — Based on Neufert, Romanian Building Codes (P100, C107), and EU nZEB standards
          </div>
        </div>
      </div>
    </div>
  );
}
