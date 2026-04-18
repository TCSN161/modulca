"use client";

/**
 * ProjectFilters — controlled filter/sort UI.
 * Pure presentational — parent owns state and derived list.
 */

import { useTranslations } from "next-intl";
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
  const t = useTranslations("portfolio.filters");
  const countries = Array.from(new Set(projects.map((p) => p.country).filter(Boolean) as string[])).sort();

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-[12px] bg-white border border-brand-bone-300/60">
      <Select
        label={t("country")}
        value={value.country}
        onChange={(v) => onChange({ ...value, country: v })}
      >
        <option value="all">{t("allCountries")}</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Select
        label={t("size")}
        value={value.size}
        onChange={(v) => onChange({ ...value, size: v as SizeBucket })}
      >
        <option value="all">{t("anySize")}</option>
        <option value="small">{t("sizeSmall")}</option>
        <option value="medium">{t("sizeMedium")}</option>
        <option value="large">{t("sizeLarge")}</option>
      </Select>

      <Select
        label={t("sortBy")}
        value={value.sort}
        onChange={(v) => onChange({ ...value, sort: v as SortMode })}
      >
        <option value="featured">{t("sortFeatured")}</option>
        <option value="area-asc">{t("sortAreaAsc")}</option>
        <option value="area-desc">{t("sortAreaDesc")}</option>
        <option value="cost-asc">{t("sortCostAsc")}</option>
        <option value="cost-desc">{t("sortCostDesc")}</option>
      </Select>

      <div className="ml-auto text-xs text-brand-gray">
        <span className="font-semibold text-brand-charcoal">{totalFiltered}</span>{" "}
        {t("ofTotalProjects", { total: projects.length })}
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
