"use client";

import Link from "next/link";
import { STEP_SLUGS } from "./StepNav";
import { useProjectId } from "@/shared/hooks/useProjectId";

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
  const projectId = useProjectId();
  const prevStep = activeStep > 0 ? STEP_SLUGS[activeStep - 1] : null;
  const nextStep = activeStep < STEP_SLUGS.length - 1 ? STEP_SLUGS[activeStep + 1] : null;

  return (
    <div className="md:hidden flex items-center justify-between border-t border-gray-200 bg-white px-2 py-2.5 mb-16 shrink-0">
      {prevStep ? (
        <Link
          href={`/project/${projectId}/${prevStep.slug}`}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-500 active:bg-gray-50"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {prevStep.label}
        </Link>
      ) : (
        <span className="w-16" />
      )}

      <div className="text-center min-w-0 px-1">
        <div className="text-[11px] font-bold text-brand-charcoal">
          {activeStep + 1}/{STEP_SLUGS.length}
        </div>
        {info && (
          <div className="text-[9px] text-gray-400 truncate">
            {info}
          </div>
        )}
      </div>

      {nextStep ? (
        <Link
          href={`/project/${projectId}/${nextStep.slug}`}
          className="flex items-center gap-1 rounded-lg bg-brand-amber-500 px-3 py-2 text-xs font-bold text-white active:scale-95 transition-transform whitespace-nowrap shadow-sm"
        >
          {nextStep.label}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="text-xs font-bold text-green-600 px-2">Done!</span>
      )}
    </div>
  );
}
