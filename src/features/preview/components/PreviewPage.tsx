"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ToolsSidebar from "./ToolsSidebar";
import Inspector from "./Inspector";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import StepNav from "@/features/design/components/shared/StepNav";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-gray-400">Loading 3D scene...</div>
    </div>
  ),
});

export default function PreviewPage() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules, loadFromLocalStorage } = useDesignStore();
  // Ensure design store is hydrated from localStorage before rendering 3D,
  // then fall back to grid if nothing was persisted.
  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  const dispatchZoom = useCallback((delta: number) => {
    window.dispatchEvent(new CustomEvent("modulca-zoom", { detail: { delta } }));
  }, []);

  const dispatchReset = useCallback(() => {
    window.dispatchEvent(new CustomEvent("modulca-reset-view"));
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={2} />
        <div className="flex items-center gap-3">
          <Link
            href="/project/demo/style"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Choose Style &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — tools sidebar */}
        <ToolsSidebar />

        {/* Center — 3D scene */}
        <main className="flex-1 relative">
          <Scene3D />

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
            {[
              { key: "G", label: "Move" },
              { key: "S", label: "Scale" },
              { key: "R", label: "Rotate" },
            ].map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-600">
                  {s.key}
                </kbd>
                {s.label}
              </span>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => dispatchZoom(-2)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => dispatchZoom(2)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              title="Zoom out"
            >
              -
            </button>
            <div className="mx-1 h-5 w-px bg-gray-200" />
            <button
              onClick={dispatchReset}
              className="rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
              title="Reset view"
            >
              Reset
            </button>
          </div>
        </main>

        {/* Right — inspector */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}
