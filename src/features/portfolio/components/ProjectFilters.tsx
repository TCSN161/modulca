"use client";

/**
 * ProjectFilters — controlled filter/sort UI.
 * Pure presentational — parent owns state and derived list.
 */

import type { PortfolioProject } from "../types";

export type SizeBucket = "all" | "small" | "medium" | "large";
export type SortMode = "featured" | "area-asc" | "area-desc" | "cost-asc" | "cost-desc";

export interface FilterState {
  country: string;
  size: SizeBucket;
  sort: SortMode;
}

interface Props {
  projects: PortfolioProject[];
  value: FilterState;
  onChange: (next: FilterState) => void;
  totalFiltered: number;
}

export default function ProjectFilters({ projects, value, onChange, totalFiltered }: Props) {
  const countries = Array.from(new Set(projects.map((p) => p.country).filter(Boolean) as string[])).sort();

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-[12px] bg-white border border-brand-bone-300/60">
      <Select
        label="Country"
        value={value.country}
        onChange={(v) => onChange({ ...value, country: v })}
      >
        <option value="all">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Select
        label="Size"
        value={value.size}
        onChange={(v) => onChange({ ...value, size: v as SizeBucket })}
      >
        <option value="all">Any size</option>
        <option value="small">Small (≤ 30 m²)</option>
        <option value="medium">Medium (31–75 m²)</option>
        <option value="large">Large (76+ m²)</option>
      </Select>

      <Select
        label="Sort by"
        value={value.sort}
        onChange={(v) => onChange({ ...value, sort: v as SortMode })}
      >
        <option value="featured">Featured</option>
        <option value="area-asc">Area · smallest first</option>
        <option value="area-desc">Area · largest first</option>
        <option value="cost-asc">Cost · lowest first</option>
        <option value="cost-desc">Cost · highest first</option>
      </Select>

      <div className="ml-auto text-xs text-brand-gray">
        <span className="font-semibold text-brand-charcoal">{totalFiltered}</span> of {projects.length} projects
      </div>
    </div>
  );
}

export function applyFilters(projects: PortfolioProject[], f: FilterState): PortfolioProject[] {
  let list = projects;

  if (f.country !== "all") {
    list = list.filter((p) => p.country === f.country);
  }

  if (f.size !== "all") {
    list = list.filter((p) => {
      if (f.size === "small") return p.areaSqm <= 30;
      if (f.size === "medium") return p.areaSqm > 30 && p.areaSqm <= 75;
      return p.areaSqm > 75;
    });
  }

  return [...list].sort((a, b) => {
    switch (f.sort) {
      case "area-asc":
        return a.areaSqm - b.areaSqm;
      case "area-desc":
        return b.areaSqm - a.areaSqm;
      case "cost-asc":
        return a.estimatedCostEur - b.estimatedCostEur;
      case "cost-desc":
        return b.estimatedCostEur - a.estimatedCostEur;
      case "featured":
      default:
        return a.displayOrder - b.displayOrder;
    }
  });
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col text-[10px]">
      <span className="font-bold text-brand-gray uppercase tracking-[0.08em] mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[8px] border border-brand-bone-300 bg-white px-3 py-1.5 text-xs text-brand-charcoal focus:border-brand-olive-500 focus:outline-none focus:ring-1 focus:ring-brand-olive-500"
      >
        {children}
      </select>
    </label>
  );
}
