"use client";

/**
 * PortfolioGrid — client wrapper that owns filter state and renders the card list.
 *
 * This is the only client component on the portfolio index page. It receives
 * the full project list from the Server Component parent (SSG-fetched) and
 * applies filter/sort entirely client-side for instant response.
 *
 * We keep rendering inside a client component because ProjectCard uses Next
 * Image with `priority` and the filtered list needs to re-render on filter
 * change without a round-trip. The cards themselves stay lightweight.
 */

import { useState, useMemo } from "react";
import type { PortfolioProject } from "../types";
import ProjectCard from "./ProjectCard";
import ProjectFilters, { applyFilters, type FilterState } from "./ProjectFilters";

interface Props {
  projects: PortfolioProject[];
}

export default function PortfolioGrid({ projects }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    country: "all",
    size: "all",
    sort: "featured",
  });

  const filtered = useMemo(() => applyFilters(projects, filters), [projects, filters]);

  return (
    <>
      <div className="mb-8">
        <ProjectFilters
          projects={projects}
          value={filters}
          onChange={setFilters}
          totalFiltered={filtered.length}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[16px] bg-white border border-brand-bone-300/60 p-12 text-center">
          <p className="text-sm text-brand-gray mb-4">
            No projects match the selected filters.
          </p>
          <button
            onClick={() =>
              setFilters({ country: "all", size: "all", sort: "featured" })
            }
            className="text-sm font-semibold text-brand-olive-700 hover:text-brand-olive-500 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {filtered.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
