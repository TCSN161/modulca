/**
 * ProjectCard — list-view card used on /portfolio.
 *
 * Alternates image-left / image-right based on index (even/odd).
 * Fully Server-rendered; the only client-side bit is Link (already handled
 * by Next.js) and hover transitions in CSS.
 */

import Link from "next/link";
import Image from "next/image";
import type { PortfolioProject } from "../types";
import ProjectStats from "./ProjectStats";
import ProjectHighlights from "./ProjectHighlights";

interface Props {
  project: PortfolioProject;
  index: number;
}

export default function ProjectCard({ project, index }: Props) {
  const isImageRight = index % 2 === 1;

  return (
    <article
      className={`group flex flex-col ${
        isImageRight ? "md:flex-row-reverse" : "md:flex-row"
      } gap-6 md:gap-8 rounded-[16px] bg-white border border-brand-bone-300/60 shadow-card overflow-hidden transition-shadow hover:shadow-card-hover`}
    >
      {/* Image */}
      <Link
        href={`/portfolio/${project.slug}`}
        className="md:w-1/2 relative min-h-[256px] overflow-hidden"
        aria-label={`View ${project.title} details`}
      >
        <Image
          src={project.heroImageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading={index < 2 ? "eager" : "lazy"}
          priority={index === 0}
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-brand-charcoal uppercase tracking-wider shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Content */}
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
        <p className="text-[10px] font-bold text-brand-olive-500 uppercase tracking-[0.08em] mb-1">
          {project.location}
        </p>
        <h2 className="text-xl font-bold text-brand-charcoal tracking-heading mb-1">
          {project.title}
        </h2>
        {project.subtitle && (
          <p className="text-sm text-brand-olive-700 font-medium mb-2">{project.subtitle}</p>
        )}
        <p className="text-sm text-brand-gray leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        <div className="mb-4">
          <ProjectStats project={project} />
        </div>

        <div className="mb-5">
          <ProjectHighlights highlights={project.highlights.slice(0, 3)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/portfolio/${project.slug}`}
            className="inline-flex items-center gap-1.5 btn-primary text-sm px-5 py-2.5"
          >
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={`/portfolio/${project.slug}#clone`}
            className="inline-flex items-center text-sm font-semibold text-brand-olive-700 hover:text-brand-olive-500 transition-colors"
          >
            Start from this design →
          </Link>
        </div>
      </div>
    </article>
  );
}
