"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";

const STEPS = [
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
];

interface StepNavProps {
  /** Zero-based index of the active step */
  activeStep: number;
}

export default function StepNav({ activeStep }: StepNavProps) {
  return (
    <div className="flex items-center gap-4">
      {STEPS.map((step, i) => (
        <Link
          key={step.label}
          href={step.href}
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-brand-amber-500",
            i === activeStep
              ? "text-brand-amber-600 border-b-2 border-brand-amber-500 pb-0.5"
              : i < activeStep
                ? "text-brand-teal-800"
                : "text-gray-400"
          )}
        >
          {i + 1}. {step.label}
        </Link>
      ))}
    </div>
  );
}

export { STEPS };
