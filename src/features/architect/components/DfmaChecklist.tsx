"use client";

import { useState, useMemo } from "react";
import { useArchitectStore } from "../store";
import { DFMA_CATEGORY_LABELS, PHASE_DEFINITIONS } from "../phases";
import type { DfmaCategory } from "../types";

const CATEGORIES = Object.keys(DFMA_CATEGORY_LABELS) as DfmaCategory[];

export default function DfmaChecklist() {
  const project = useArchitectStore((s) => s.project);
  const toggleDfmaItem = useArchitectStore((s) => s.toggleDfmaItem);
  const setDfmaItemNotes = useArchitectStore((s) => s.setDfmaItemNotes);
  const [filterCategory, setFilterCategory] = useState<DfmaCategory | "all">("all");
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);

  // Compute derived progress here (not via selector) to avoid new-object-per-render
  // infinite re-renders (selector returning new object triggers Zustand subscription).
  const dfmaProgress = useMemo(() => {
    if (!project) return { checked: 0, total: 0, critical: 0, criticalDone: 0 };
    const items = project.dfmaItems;
    const critical = items.filter((i) => i.critical);
    return {
      checked: items.filter((i) => i.checked).length,
      total: items.length,
      critical: critical.length,
      criticalDone: critical.filter((i) => i.checked).length,
    };
  }, [project]);

  if (!project) return null;

  const filtered = project.dfmaItems.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (showOnlyUnchecked && item.checked) return false;
    return true;
  });

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((i) => i.category === cat);
    if (items.length > 0) acc.push({ category: cat, items });
    return acc;
  }, [] as { category: DfmaCategory; items: typeof filtered }[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-teal-800">DfMA Checklist</h2>
          <p className="text-xs text-gray-400">
            Design for Manufacture and Assembly — modular-specific quality gates
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-brand-teal-700">
            {dfmaProgress.checked}/{dfmaProgress.total} items
          </div>
          <div className={`text-[10px] font-bold ${dfmaProgress.criticalDone < dfmaProgress.critical ? "text-red-500" : "text-green-600"}`}>
            {dfmaProgress.criticalDone}/{dfmaProgress.critical} critical
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-teal-500 transition-all"
          style={{ width: `${dfmaProgress.total > 0 ? (dfmaProgress.checked / dfmaProgress.total) * 100 : 0}%` }}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("all")}
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${filterCategory === "all" ? "bg-brand-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const cfg = DFMA_CATEGORY_LABELS[cat];
          const count = project.dfmaItems.filter((i) => i.category === cat).length;
          const done = project.dfmaItems.filter((i) => i.category === cat && i.checked).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${filterCategory === cat ? "bg-brand-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {cfg.icon} {cfg.label} ({done}/{count})
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
          <input
            type="checkbox"
            checked={showOnlyUnchecked}
            onChange={(e) => setShowOnlyUnchecked(e.target.checked)}
            className="h-3 w-3 rounded border-gray-300"
          />
          Show remaining only
        </label>
      </div>

      {/* Checklist groups */}
      <div className="space-y-4">
        {grouped.map(({ category, items }) => {
          const cfg = DFMA_CATEGORY_LABELS[category];
          return (
            <div key={category} className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2">
                <span className="text-sm">{cfg.icon}</span>
                <span className="text-xs font-bold text-gray-700">{cfg.label}</span>
                <span className="text-[10px] text-gray-400">
                  {items.filter((i) => i.checked).length}/{items.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-2.5 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleDfmaItem(item.id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${item.checked ? "text-gray-400 line-through" : "text-gray-800"}`}>
                            {item.label}
                          </span>
                          {item.critical && (
                            <span className="rounded bg-red-100 px-1 py-0.5 text-[8px] font-bold text-red-600 uppercase">
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{item.description}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-gray-400">Phases:</span>
                          {item.phaseRelevant.map((pid) => {
                            const def = PHASE_DEFINITIONS.find((d) => d.id === pid);
                            return (
                              <span key={pid} className="rounded bg-gray-100 px-1 py-0.5 text-[8px] text-gray-500">
                                {def?.number}. {def?.label}
                              </span>
                            );
                          })}
                        </div>
                        {/* Notes input */}
                        {(item.notes || !item.checked) && (
                          <input
                            value={item.notes || ""}
                            onChange={(e) => setDfmaItemNotes(item.id, e.target.value)}
                            placeholder="Notes..."
                            className="mt-1 w-full rounded border border-gray-100 px-2 py-0.5 text-[10px] text-gray-600 placeholder:text-gray-300 focus:outline-none focus:border-brand-teal-300"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
