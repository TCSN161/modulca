"use client";

import { useDesignStore, type FinishLevelId } from "../store";
import { FINISH_LEVELS } from "@/shared/types";
import Link from "next/link";
import { useProjectId } from "@/shared/hooks/useProjectId";

function formatEuro(n: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ProjectStats() {
  const projectId = useProjectId();
  const { finishLevel, setFinishLevel, getStats, selectedModule, modules } =
    useDesignStore();
  const stats = getStats();

  const selectedMod = selectedModule
    ? modules.find(
        (m) => m.row === selectedModule.row && m.col === selectedModule.col
      )
    : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* BIM Metadata */}
      <div className="border-b border-gray-200 p-5">
        <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          BIM Metadata
        </h3>
        <div className="space-y-2">
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Structure Type
            </div>
            <div className="text-sm font-bold text-brand-teal-800">
              Modular Timber Frame
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase">
                Thermal Performance
              </div>
              <div className="text-sm font-bold text-brand-teal-800">
                U-Value: 0.15
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
              PASS
            </span>
          </div>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="border-b border-gray-200 p-5">
        <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Project Statistics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Total Area
            </div>
            <div className="text-xl font-bold text-brand-teal-800">
              {stats.totalArea}.0 m²
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Net Modules
            </div>
            <div className="text-xl font-bold text-brand-teal-800">
              {stats.totalModules} Units
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Usable Area
            </div>
            <div className="text-lg font-bold text-brand-teal-700">
              {stats.usableArea}.0 m²
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3 text-center">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Shared Walls
            </div>
            <div className="text-lg font-bold text-brand-teal-700">
              {stats.sharedWalls}
            </div>
          </div>
        </div>
      </div>

      {/* Finish Level Selection */}
      <div className="border-b border-gray-200 p-5">
        <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Finish Level
        </h3>
        <div className="space-y-2">
          {FINISH_LEVELS.map((fl) => (
            <button
              key={fl.id}
              onClick={() => setFinishLevel(fl.id as FinishLevelId)}
              className={`flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition-all ${
                finishLevel === fl.id
                  ? "border-brand-amber-500 bg-brand-amber-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-brand-teal-800">
                  {fl.label}
                </div>
                <div className="text-xs text-gray-500">
                  {formatEuro(fl.pricePerModule)} / module
                </div>
              </div>
              {finishLevel === fl.id && (
                <div className="h-4 w-4 rounded-full bg-brand-amber-500 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="border-b border-gray-200 p-5">
        <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Cost Breakdown
        </h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{stats.totalModules} modules × {formatEuro(FINISH_LEVELS.find(f => f.id === finishLevel)!.pricePerModule)}</span>
            <span>{formatEuro(stats.moduleCost)}</span>
          </div>
          {stats.sharedWalls > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Shared wall discount (×{stats.sharedWalls})</span>
              <span>-{formatEuro(stats.sharedWallDiscount)}</span>
            </div>
          )}
          {stats.wallUpgradeCost !== 0 && (
            <div className={`flex justify-between ${stats.wallUpgradeCost > 0 ? "text-amber-600" : "text-green-600"}`}>
              <span>Wall upgrades</span>
              <span>{stats.wallUpgradeCost > 0 ? "+" : ""}{formatEuro(stats.wallUpgradeCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Design fee (8%)</span>
            <span>{formatEuro(stats.designFee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2" />
        </div>

        {/* Total Estimate */}
        <div className="mt-2 text-right">
          <div className="text-[10px] font-semibold text-gray-400 uppercase">
            Total Estimate
          </div>
          <div className="text-3xl font-bold text-brand-teal-800">
            {formatEuro(stats.totalEstimate)}
          </div>
          <p className="mt-1 text-[10px] text-gray-400">
            Estimated manufacturing and assembly costs. Excludes site prep and land taxes.
          </p>
        </div>
      </div>

      {/* Selected Module Info */}
      {selectedMod && (
        <div className="border-b border-gray-200 p-5">
          <h3 className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Selected Module
          </h3>
          <div className="text-sm font-bold text-brand-teal-800">{selectedMod.label}</div>
          <div className="text-xs text-gray-500">
            Type: {selectedMod.moduleType} · 3.0 × 3.0m · 9.0m²
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
            {(["north", "south", "east", "west"] as const).map((side) => (
              <div key={side} className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1">
                <span className="font-semibold text-gray-500 uppercase">{side[0]}</span>
                <span className="font-bold text-brand-teal-800 capitalize">
                  {selectedMod.wallConfigs[side]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-gray-400">
            Click wall edges on the floor plan to change type
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="p-5 mt-auto">
        <Link
          href={`/project/${projectId}/output`}
          className="flex w-full items-center justify-center rounded-lg bg-brand-teal-800
                     px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wider
                     transition-colors hover:bg-brand-teal-700"
        >
          Confirm Selection
        </Link>
      </div>
    </div>
  );
}
