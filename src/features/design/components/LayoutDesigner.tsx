"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FloorPlan from "./FloorPlan";
import ProjectStats from "./ProjectStats";
import ProjectLayers, { DEFAULT_LAYERS, type LayerVisibility } from "./ProjectLayers";
import { useDesignStore } from "../store";
import { useLandStore } from "@/features/land/store";
import StepNav from "./shared/StepNav";

export default function LayoutDesigner() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules, loadFromLocalStorage } = useDesignStore();
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [mobilePanel, setMobilePanel] = useState<"none" | "layers" | "stats">("none");

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={2} />
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/project/demo/land"
            className="text-sm text-gray-500 hover:text-brand-teal-800 hidden md:inline"
          >
            &larr; Back to Land
          </Link>
          <Link
            href="/project/demo/output"
            className="rounded-lg bg-brand-amber-500 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Preview &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar — project layers (hidden on mobile) */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden md:block">
          <ProjectLayers visible={layers} onChange={setLayers} />
        </aside>

        {/* Center — floor plan */}
        <main className="flex-1 overflow-auto">
          <FloorPlan layers={layers} />
        </main>

        {/* Right sidebar — stats, cost, BIM (hidden on mobile) */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 hidden md:block">
          <ProjectStats />
        </aside>
      </div>

      {/* Mobile FABs */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden z-40">
        <button
          onClick={() => setMobilePanel(mobilePanel === "layers" ? "none" : "layers")}
          className="h-12 w-12 rounded-full bg-brand-teal-800 text-white shadow-lg flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
        <button
          onClick={() => setMobilePanel(mobilePanel === "stats" ? "none" : "stats")}
          className="h-12 w-12 rounded-full bg-brand-amber-500 text-white shadow-lg flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      {/* Mobile slide-over */}
      {mobilePanel !== "none" && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobilePanel("none")} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              <button onClick={() => setMobilePanel("none")} className="mb-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {mobilePanel === "layers" ? (
              <ProjectLayers visible={layers} onChange={setLayers} />
            ) : (
              <ProjectStats />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
