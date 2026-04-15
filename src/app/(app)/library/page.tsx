"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ARTICLES, CATEGORIES, REGIONS } from "@/knowledge/_index";
import { CATEGORY_DEFINITIONS } from "@/knowledge/_taxonomy";
import type { KBDocumentMeta } from "@/knowledge/_types";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig, type AccountTier } from "@/features/auth/types";

/* ------------------------------------------------------------------ */
/*  Bookmarks (localStorage)                                           */
/* ------------------------------------------------------------------ */

const BOOKMARKS_KEY = "modulca-library-bookmarks";

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveBookmarks(ids: Set<string>) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...ids])); } catch { /* */ }
}

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

    // List items (unordered)
    if (line.startsWith("- ")) {
      elements.push(<div key={i} className="ml-4 text-sm text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: "&#8226; " + formatInline(line.slice(2)) }} />);
      i++; continue;
    }

    // List items (ordered: "1. ", "2. ", etc.)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      elements.push(<div key={i} className="ml-4 text-sm text-gray-700 mb-1" dangerouslySetInnerHTML={{ __html: `<span class="font-medium text-gray-500 mr-1">${orderedMatch[1]}.</span> ` + formatInline(orderedMatch[2]) }} />);
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
  bookmarked,
  onToggleBookmark,
}: {
  article: KBDocumentMeta;
  onBack: () => void;
  onSelectArticle: (a: KBDocumentMeta) => void;
  tier: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}) {
  const region = article.region
    ? REGIONS.find((r) => r.code === article.region)
    : null;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [truncated, setTruncated] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    setLoading(true);
    setContent(null);
    fetch(`/api/knowledge?id=${encodeURIComponent(article.id)}&tier=${tier}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content);
          setTruncated(!!data.truncated);
          setReadingTime(data.readingTime || 0);
        } else if (data.error === "Premium required") {
          setContent(null);
        } else {
          setContent(null);
        }
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [article.id, tier]);

  const tierConfig = getTierConfig(tier as AccountTier);
  const isLocked = article.proOnly && !tierConfig.features.knowledgeProArticles;

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

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={bookmarked ? "Remove bookmark" : "Save article"}
          >
            <svg className={`h-5 w-5 ${bookmarked ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        )}
      </div>

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
        {readingTime > 0 && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            {readingTime} min read
          </span>
        )}
        {article.lastUpdated && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            Updated {article.lastUpdated}
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
            <Link
              href={`/project/demo/consultant?q=${encodeURIComponent(`Tell me more about ${article.title}`)}`}
              className="flex items-center gap-2 text-xs font-semibold text-brand-teal-800 hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Ask AI Consultant about &ldquo;{article.title}&rdquo;
            </Link>
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
  bookmarked,
  onToggleBookmark,
}: {
  article: KBDocumentMeta;
  onClick: () => void;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
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
        <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="p-0.5 rounded hover:bg-gray-100 transition-colors"
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg className={`h-4 w-4 ${bookmarked ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          )}
          <svg
            className="h-4 w-4 text-gray-300 group-hover:text-brand-teal-800"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Library Page                                                  */
/* ------------------------------------------------------------------ */

export default function LibraryPage() {
  const effectiveTier = useAuthStore((s) => {
    const { getEffectiveTier } = s;
    return getEffectiveTier();
  });
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<KBDocumentMeta | null>(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => { setBookmarks(loadBookmarks()); }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveBookmarks(next);
      return next;
    });
  };

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

  // Tier-based region access: knowledgeRegions = number of country regs available (-1 = all)
  const tierConfig = getTierConfig(effectiveTier as AccountTier);
  const maxRegions = tierConfig.features.knowledgeRegions;
  // Priority order for region access: RO first (primary market), then NL, then others
  const regionPriority = ["RO", "NL"];
  const allowedRegionCodes = useMemo(() => {
    if (maxRegions === -1) return null; // null = all allowed
    const ordered = [...regionPriority, ...regionsWithArticles.map((r) => r.code).filter((c) => !regionPriority.includes(c))];
    return new Set(ordered.slice(0, maxRegions));
  }, [maxRegions, regionsWithArticles]);
  const isRegionLocked = (code: string) => allowedRegionCodes !== null && !allowedRegionCodes.has(code);

  // Keyboard: Escape to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeArticle) setActiveArticle(null);
        else if (activeCategoryId) { setActiveCategoryId(null); setRegionFilter(null); }
        else if (search) setSearch("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeArticle, activeCategoryId, search]);

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

          {/* Search + Bookmarks */}
          <div className="mt-4 flex items-center gap-3 max-w-xl">
            {bookmarks.size > 0 && (
              <button
                onClick={() => { setShowBookmarks(!showBookmarks); setActiveCategoryId(null); setActiveArticle(null); setSearch(""); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  showBookmarks ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                {bookmarks.size} saved
              </button>
            )}
          </div>
          <div className="mt-2 max-w-xl">
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal-800"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search (Esc)"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {showBookmarks && !activeArticle ? (
          /* Bookmarked articles */
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Saved Articles ({bookmarks.size})</h3>
              <button
                onClick={() => setShowBookmarks(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to library
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ARTICLES.filter((a) => bookmarks.has(a.id)).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setActiveArticle(article)}
                  bookmarked={true}
                  onToggleBookmark={() => toggleBookmark(article.id)}
                />
              ))}
            </div>
            {bookmarks.size === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">No saved articles yet</div>
            )}
          </div>
        ) : activeArticle ? (
          /* Article detail view */
          <ArticleDetail
            article={activeArticle}
            onBack={() => setActiveArticle(null)}
            onSelectArticle={(a) => setActiveArticle(a)}
            tier={effectiveTier}
            bookmarked={bookmarks.has(activeArticle.id)}
            onToggleBookmark={() => toggleBookmark(activeArticle.id)}
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
                {regionsWithArticles.map((r) => {
                  const locked = isRegionLocked(r.code);
                  return (
                    <button
                      key={r.code}
                      onClick={() => locked ? undefined : setRegionFilter(r.code)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        locked
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                          : regionFilter === r.code
                          ? "bg-brand-teal-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={locked ? `Upgrade to access ${r.name} regulations` : undefined}
                    >
                      {r.flag} {r.name} ({r.articleCount}){locked && " 🔒"}
                    </button>
                  );
                })}
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
                  bookmarked={bookmarks.has(article.id)}
                  onToggleBookmark={() => toggleBookmark(article.id)}
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
                  bookmarked={bookmarks.has(article.id)}
                  onToggleBookmark={() => toggleBookmark(article.id)}
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
