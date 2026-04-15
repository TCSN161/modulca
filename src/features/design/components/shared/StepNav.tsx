"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { useProjectId } from "@/shared/hooks/useProjectId";

/** Step slugs — used to build dynamic hrefs */
const STEP_SLUGS = [
  { label: "Choose", slug: "choose" },
  { label: "Land", slug: "land" },
  { label: "Design", slug: "design" },
  { label: "Preview", slug: "output" },
  { label: "Style", slug: "style" },
  { label: "Configure", slug: "configure" },
  { label: "Visualize", slug: "visualize" },
  { label: "Render", slug: "render" },
  { label: "Technical", slug: "technical" },
  { label: "Walkthrough", slug: "walkthrough" },
  { label: "Products", slug: "products" },
  { label: "Finalize", slug: "finalize" },
  { label: "Present", slug: "presentation" },
];

interface StepNavProps {
  /** Zero-based index of the active step */
  activeStep: number;
}

export default function StepNav({ activeStep }: StepNavProps) {
  const projectId = useProjectId();

  return (
    <nav className="flex-1 overflow-x-auto mx-1 md:mx-4 scrollbar-none">
      <div className="flex items-center gap-1 md:gap-1 min-w-max md:justify-center">
        {STEP_SLUGS.map((step, i) => (
          <Link
            key={step.label}
            href={`/project/${projectId}/${step.slug}`}
            className={cn(
              "font-semibold uppercase transition-colors whitespace-nowrap rounded-md inline-flex items-center",
              // Mobile: bigger touch targets (min 32px height)
              "text-[11px] px-2 py-1.5 min-h-[32px]",
              // Desktop
              "md:text-[10px] md:px-1.5 md:py-1.5 md:min-h-0 md:tracking-[0.05em]",
              i === activeStep
                ? "text-brand-olive-700 bg-brand-olive-100 border-b-2 border-brand-olive-700"
                : i < activeStep
                  ? "text-brand-charcoal hover:text-brand-olive-700 hover:bg-brand-olive-50"
                  : "text-brand-gray/50 hover:text-brand-gray",
            )}
          >
            {/* Mobile: number + label for nearby steps */}
            <span className="md:hidden flex items-center gap-0.5">
              <span>{i + 1}</span>
              {i === activeStep && (
                <span className="text-[9px] ml-0.5">{step.label}</span>
              )}
            </span>
            {/* Desktop: full label */}
            <span className="hidden md:inline">{i + 1}. {step.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export { STEP_SLUGS };
