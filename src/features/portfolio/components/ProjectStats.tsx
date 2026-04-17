/**
 * ProjectStats — compact 4-badge stat display.
 *
 * Renders the canonical four stats (Area, Modules, Cost, Assembly) in a
 * responsive 2-col / 4-col grid. Used on both the list cards and the
 * detail page so numbers stay visually consistent.
 *
 * Pure Server Component — no interactivity, no client JS.
 */

import { buildProjectStats, type PortfolioProject } from "../types";

interface Props {
  project: PortfolioProject;
  compact?: boolean;
}

export default function ProjectStats({ project, compact = false }: Props) {
  const stats = buildProjectStats(project);

  return (
    <div
      className={`grid ${
        compact ? "grid-cols-4 gap-1.5" : "grid-cols-2 sm:grid-cols-4 gap-2"
      }`}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-[10px] bg-brand-bone-100 ${
            compact ? "px-2 py-1.5" : "px-3 py-2"
          }`}
        >
          <div
            className={`${
              compact ? "text-[9px]" : "text-[10px]"
            } font-bold text-brand-gray uppercase tracking-[0.05em]`}
          >
            {s.label}
          </div>
          <div
            className={`${
              compact ? "text-xs" : "text-sm"
            } font-bold text-brand-charcoal`}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
