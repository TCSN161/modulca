"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { ARTICLES } from "@/knowledge/_index";

/* ------------------------------------------------------------------ */
/*  Guide metadata                                                      */
/* ------------------------------------------------------------------ */

interface GuideInfo {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  icon: string;
  readTime: string;
}

/** Derive guide cards from the knowledge index (category = "guides") */
function getGuides(): GuideInfo[] {
  return ARTICLES.filter((a) => a.category === "guides").map((a) => ({
    id: a.id,
    title: a.title,
    difficulty: a.difficulty || "beginner",
    tags: a.tags || [],
    icon: getGuideIcon(a.tags || []),
    readTime: estimateReadTime(a.difficulty),
  }));
}

function getGuideIcon(tags: string[]): string {
  if (tags.some((t) => ["permit", "legal", "autorizatie"].includes(t))) return "📋";
  if (tags.some((t) => ["land", "site-selection", "plot"].includes(t))) return "🏞️";
  if (tags.some((t) => ["comparison", "traditional"].includes(t))) return "⚖️";
  if (tags.some((t) => ["checklist", "first-home", "planning"].includes(t))) return "✅";
  if (tags.some((t) => ["energy", "nZEB", "passive-house", "insulation"].includes(t))) return "⚡";
  if (tags.some((t) => ["budget", "costs"].includes(t))) return "💰";
  return "🗺️";
}

function estimateReadTime(difficulty?: string): string {
  switch (difficulty) {
    case "advanced": return "15-20 min";
    case "intermediate": return "10-15 min";
    default: return "8-12 min";
  }
}

/* ------------------------------------------------------------------ */
/*  Hardcoded fallback guides (shown when index not yet rebuilt)         */
/* ------------------------------------------------------------------ */

const FALLBACK_GUIDES: GuideInfo[] = [
  { id: "guide-building-permit-romania", title: "How to Get a Building Permit in Romania (Step-by-Step)", difficulty: "intermediate", tags: ["permit", "romania", "legal"], icon: "📋", readTime: "12 min" },
  { id: "guide-choosing-land", title: "How to Choose Land for a Modular Home", difficulty: "beginner", tags: ["land", "site-selection", "modular"], icon: "🏞️", readTime: "10 min" },
  { id: "guide-modular-vs-traditional", title: "Modular vs Traditional Construction: Complete Comparison", difficulty: "beginner", tags: ["comparison", "modular", "traditional"], icon: "⚖️", readTime: "10 min" },
  { id: "guide-first-time-builder", title: "First-Time Home Builder Checklist: Everything You Need", difficulty: "beginner", tags: ["checklist", "first-home", "planning"], icon: "✅", readTime: "12 min" },
  { id: "guide-energy-efficient-home", title: "How to Build an Energy-Efficient Home in 2026", difficulty: "intermediate", tags: ["energy", "nZEB", "passive-house"], icon: "⚡", readTime: "15 min" },
];

/* ------------------------------------------------------------------ */
/*  Difficulty badge                                                     */
/* ------------------------------------------------------------------ */

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: "bg-green-50 text-green-700",
    intermediate: "bg-amber-50 text-amber-700",
    advanced: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${colors[level] || colors.beginner}`}>
      {level}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function GuidesPage() {
  const [search, setSearch] = useState("");

  const guides = useMemo(() => {
    const fromIndex = getGuides();
    const list = fromIndex.length > 0 ? fromIndex : FALLBACK_GUIDES;

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-brand-charcoal">ModulCA</Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">|</span>
            <Link href="/library" className="hidden sm:inline-block text-sm text-gray-500 hover:text-brand-teal-800">Library</Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">›</span>
            <h1 className="hidden sm:inline-block text-sm font-semibold text-gray-700">Practical Guides</h1>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900">🗺️ Practical Guides</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Step-by-step guides with checklists, timelines, and real costs.
            Everything you need to go from idea to move-in — no architecture degree required.
          </p>

          {/* Search */}
          <div className="mt-4 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guides..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Info banner */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="text-sm font-bold text-blue-800">Actionable, Not Academic</h3>
              <p className="mt-1 text-xs text-blue-700">
                Each guide includes checklists you can print, real cost estimates for 2026,
                and links to official sources. Written for first-time builders and experienced architects alike.
              </p>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 text-xs text-gray-500">
          {guides.length} guide{guides.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </p>

        {/* Guide cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/library/${guide.id}`}
              className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-brand-teal-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{guide.icon}</span>
                <DifficultyBadge level={guide.difficulty} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-brand-teal-800">
                {guide.title}
              </h3>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {guide.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">{guide.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {guides.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No guides found{search ? ` for "${search}"` : ""}.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-teal-800 to-brand-teal-700 p-8 text-center text-white">
          <h3 className="text-lg font-bold">Need help with your specific project?</h3>
          <p className="mt-2 text-sm text-teal-100">
            Our Neufert AI consultant can answer questions about permits, costs, regulations, and design — tailored to your situation.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/project/demo/consultant"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-teal-50 transition-colors"
            >
              Ask AI Consultant
            </Link>
            <Link
              href="/library"
              className="rounded-xl border border-white/30 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">
          Part of the{" "}
          <Link href="/library" className="underline hover:text-brand-teal-800">
            ModulCA Knowledge Library
          </Link>
          . Guides are updated regularly with current regulations and pricing.
        </p>
      </footer>
    </div>
  );
}
