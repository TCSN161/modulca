/**
 * ProjectHero — full-width hero section for detail pages.
 *
 * Responsive: on mobile the image stacks above content; on desktop it's
 * a 60/40 split. Uses Next/Image with priority loading for LCP.
 */

import Image from "next/image";
import type { PortfolioProject } from "../types";

interface Props {
  project: PortfolioProject;
}

export default function ProjectHero({ project }: Props) {
  return (
    <section className="relative bg-white border-b border-brand-bone-300/60">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Image — 60% */}
          <div className="md:col-span-3 relative aspect-[4/3] md:aspect-[5/3] rounded-[16px] overflow-hidden shadow-card">
            <Image
              src={project.heroImageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-brand-charcoal uppercase tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content — 40% */}
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-brand-olive-500 uppercase tracking-[0.1em] mb-2">
              {project.location}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-charcoal tracking-heading mb-2">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-base text-brand-olive-700 font-medium mb-4">{project.subtitle}</p>
            )}
            <p className="text-sm text-brand-gray leading-relaxed">{project.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
