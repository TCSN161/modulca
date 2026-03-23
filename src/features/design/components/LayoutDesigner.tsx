"use client";

import { useEffect } from "react";
import Link from "next/link";
import FloorPlan from "./FloorPlan";
import ProjectStats from "./ProjectStats";
import ProjectLayers from "./ProjectLayers";
import { useDesignStore } from "../store";
import { useLandStore } from "@/features/land/store";

const STEPS = [
  { num: 1, label: "Locate Land", href: "/project/demo/land" },
  { num: 2, label: "Design Modules", href: "#" },
  { num: 3, label: "Get Plans", href: "/project/demo/output" },
];

export default function LayoutDesigner() {
  const { gridCells, gridRotation } = useLandStore();
  const { setModulesFromGrid, modules } = useDesignStore();

  // Import modules from Step 1 on mount
  useEffect(() => {
    if (gridCells.length > 0 && modules.length === 0) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [gridCells, gridRotation, setModulesFromGrid, modules.length]);

  const currentStep = 2;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/project/demo/land"
            className="text-gray-500 hover:text-brand-teal-800"
          >
            Layout Design
          </Link>
          <span className="text-gray-300">Technical Review</span>
          <span className="text-gray-300">Export Plans</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-brand-teal-800"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Step Progress */}
      <div className="flex items-center justify-center gap-16 border-b border-gray-200 bg-white py-4">
        {STEPS.map((step) => (
          <Link key={step.num} href={step.href} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                step.num === currentStep
                  ? "bg-brand-teal-800 text-white"
                  : step.num < currentStep
                  ? "bg-brand-teal-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-xs font-medium ${
                step.num === currentStep
                  ? "text-brand-teal-800"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </Link>
        ))}
      </div>

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
