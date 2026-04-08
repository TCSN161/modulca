"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";

const STEPS = [
  { label: "Choose", href: "/project/demo/choose" },
  { label: "Land", href: "/project/demo/land" },
  { label: "Design", href: "/project/demo/design" },
  { label: "Preview", href: "/project/demo/output" },
  { label: "Style", href: "/project/demo/style" },
  { label: "Configure", href: "/project/demo/configure" },
  { label: "Visualize", href: "/project/demo/visualize" },
  { label: "Render", href: "/project/demo/render" },
  { label: "Technical", href: "/project/demo/technical" },
  { label: "Walkthrough", href: "/project/demo/walkthrough" },
  { label: "Products", href: "/project/demo/products" },
  { label: "Finalize", href: "/project/demo/finalize" },
  { label: "Present", href: "/project/demo/presentation" },
];

interface StepNavProps {
  /** Zero-based index of the active step */
  activeStep: number;
}

export default function StepNav({ activeStep }: StepNavProps) {
  return (
    <nav className="flex-1 overflow-x-auto mx-4 scrollbar-none">
      <div className="flex items-center gap-0.5 md:gap-1 min-w-max md:justify-center">
        {STEPS.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.05em] transition-colors whitespace-nowrap px-1.5 py-1.5 rounded-md",
              i === activeStep
                ? "text-brand-olive-700 bg-brand-olive-100 border-b-2 border-brand-olive-700"
                : i < activeStep
                  ? "text-brand-charcoal hover:text-brand-olive-700 hover:bg-brand-olive-50"
                  : "text-brand-gray/50 hover:text-brand-gray",
              Math.abs(i - activeStep) > 2 ? "hidden md:inline-flex" : "inline-flex"
            )}
          >
            <span className="md:hidden">{i + 1}</span>
            <span className="hidden md:inline">{i + 1}. {step.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export { STEPS };
