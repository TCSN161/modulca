"use client";

import Link from "next/link";
import { STEPS } from "./StepNav";

interface MobileStepFooterProps {
  /** Zero-based index of the active step */
  activeStep: number;
  /** Optional module/area info to show in center */
  info?: string;
}

/**
 * Always-visible bottom bar for mobile step navigation.
 * Shows: ← Previous | Step info | Next →
 * Sits above the MobileBottomNav (mb-16).
 * Hidden on desktop (md:hidden).
 */
export default function MobileStepFooter({ activeStep, info }: MobileStepFooterProps) {
  const prevStep = activeStep > 0 ? STEPS[activeStep - 1] : null;
  const nextStep = activeStep < STEPS.length - 1 ? STEPS[activeStep + 1] : null;
  const currentStep = STEPS[activeStep];

  return (
    <div className="md:hidden flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2 mb-16 shrink-0">
      {prevStep ? (
        <Link
          href={prevStep.href}
          className="text-[10px] font-semibold text-gray-400 active:text-gray-600"
        >
          &larr; {prevStep.label}
        </Link>
      ) : (
        <span />
      )}

      <div className="text-center min-w-0 px-2">
        <span className="text-[10px] font-bold text-brand-charcoal">
          {activeStep + 1}. {currentStep?.label}
        </span>
        {info && (
          <span className="text-[9px] text-gray-400 ml-1 truncate">
            {info}
          </span>
        )}
      </div>

      {nextStep ? (
        <Link
          href={nextStep.href}
          className="rounded-lg bg-brand-amber-500 px-3 py-1.5 text-[11px] font-bold text-white active:scale-95 transition-transform whitespace-nowrap"
        >
          {nextStep.label} &rarr;
        </Link>
      ) : (
        <span className="text-[10px] font-semibold text-green-600">Done!</span>
      )}
    </div>
  );
}
