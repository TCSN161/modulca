"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";

const STEPS = [
  { label: "Marketplace", href: "/project/demo/marketplace" },
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
      <div className="flex items-center gap-1 md:gap-4 min-w-max md:justify-center">
        {STEPS.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-amber-500 whitespace-nowrap px-1 py-1",
              i === activeStep
                ? "text-brand-amber-600 border-b-2 border-brand-amber-500"
                : i < activeStep
                  ? "text-brand-teal-800"
                  : "text-gray-400",
              /* On mobile, hide steps far from active to reduce clutter */
              Math.abs(i - activeStep) > 2 ? "hidden md:inline" : ""
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
