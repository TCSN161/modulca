"use client";

import { useEffect } from "react";
import Link from "next/link";
import FloorPlan from "./FloorPlan";
import ProjectStats from "./ProjectStats";
import ProjectLayers from "./ProjectLayers";
import { useDesignStore } from "../store";
import { useLandStore } from "@/features/land/store";
import StepNav from "./shared/StepNav";

export default function LayoutDesigner() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules } = useDesignStore();

  // Import modules from Step 1 on mount
  useEffect(() => {
    if (gridCells.length > 0 && modules.length === 0) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [gridCells, gridRotation, setModulesFromGrid, modules.length]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={1} />
        <div className="flex items-center gap-3">
          <Link
            href="/project/demo/land"
            className="text-sm text-gray-500 hover:text-brand-teal-800"
          >
            ← Back to Land
          </Link>
          <Link
            href="/project/demo/output"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Preview →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — project layers */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
          <ProjectLayers />
        </aside>

        {/* Center — floor plan */}
        <main className="flex-1 overflow-auto">
          <FloorPlan />
        </main>

        {/* Right sidebar — stats, cost, BIM */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
          <ProjectStats />
        </aside>
      </div>
    </div>
  );
}
