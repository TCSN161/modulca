"use client";

import Link from "next/link";
import StepNav from "./StepNav";
import CloudSaveButton from "./CloudSaveButton";

interface DesignHeaderProps {
  activeStep: number;
}

/**
 * Shared header for all 13 design steps.
 * Shows: Logo | StepNav | CloudSave
 */
export default function DesignHeader({ activeStep }: DesignHeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-3 md:px-6 border-b border-gray-200 bg-white shrink-0">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold text-brand-teal-800">
          Modul<span className="text-brand-amber-500">CA</span>
        </span>
      </Link>
      <StepNav activeStep={activeStep} />
      <div className="shrink-0">
        <CloudSaveButton />
      </div>
    </header>
  );
}
