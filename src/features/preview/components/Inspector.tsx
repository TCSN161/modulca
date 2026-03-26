"use client";

import { useState } from "react";
import { useDesignStore } from "@/features/design/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { FLOOR_MATERIALS, WALL_MATERIALS, getPreset } from "@/features/design/layouts";

type InspectorTab = "geometry" | "material" | "metadata";

export default function Inspector() {
  const { selectedModule, modules, getStats } = useDesignStore();
  const stats = getStats();
  const [activeTab, setActiveTab] = useState<InspectorTab>("geometry");

  const selectedMod = selectedModule
    ? modules.find(
        (m) => m.row === selectedModule.row && m.col === selectedModule.col
      )
    : null;

  const mt = selectedMod
    ? MODULE_TYPES.find((m) => m.id === selectedMod.moduleType)
    : null;

  const floorMat = selectedMod
    ? FLOOR_MATERIALS.find((f) => f.id === selectedMod.floorFinish) ?? FLOOR_MATERIALS[0]
    : null;

  const wallMat = selectedMod
    ? WALL_MATERIALS.find((w) => w.id === selectedMod.wallColor) ?? WALL_MATERIALS[0]
    : null;

  const preset = selectedMod ? getPreset(selectedMod.moduleType, selectedMod.layoutPreset) : null;

  const wc = selectedMod?.wallConfigs;
  const wallCounts = wc
    ? {
        solid: Object.values(wc).filter((v) => v === "solid").length,
        window: Object.values(wc).filter((v) => v === "window").length,
        door: Object.values(wc).filter((v) => v === "door").length,
        none: Object.values(wc).filter((v) => v === "none").length,
        shared: Object.values(wc).filter((v) => v === "shared").length,
      }
    : null;

  const TABS: { id: InspectorTab; label: string }[] = [
    { id: "geometry", label: "Geometry" },
    { id: "material", label: "Material" },
    { id: "metadata", label: "Metadata" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Inspector Header */}
      <div className="border-b border-gray-200 p-5">
        {selectedMod && mt ? (
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: mt.color + "30" }}
            >
              {mt.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">
                Inspector
              </div>
              <div className="text-sm font-bold text-brand-teal-800">
                {selectedMod.label}
              </div>
              <div className="text-[10px] text-gray-400">
                {selectedMod.moduleType.charAt(0).toUpperCase() +
                  selectedMod.moduleType.slice(1)}{" "}
                Module
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">
              Inspector
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Click a module in the 3D view to inspect it.
            </div>
          </div>
        )}
      </div>

      {/* Selected Module Details */}
      {selectedMod && (
        <>
          {/* Tab Buttons */}
          <div className="border-b border-gray-200 p-5">
            <div className="mb-3 flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand-teal-800 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* GEOMETRY TAB */}
            {activeTab === "geometry" && (
              <>
                <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                  Spatial Parameters
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400">Width (X)</label>
                    <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                      <span className="text-sm font-medium text-brand-teal-800">3.00</span>
                      <span className="ml-auto text-xs text-gray-400">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Depth (Z)</label>
                    <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                      <span className="text-sm font-medium text-brand-teal-800">3.00</span>
                      <span className="ml-auto text-xs text-gray-400">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Height (Y)</label>
                    <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                      <span className="text-sm font-medium text-brand-teal-800">2.70</span>
                      <span className="ml-auto text-xs text-gray-400">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Area</label>
                    <div className="mt-0.5 flex items-center rounded border border-gray-200 bg-white px-2 py-1.5">
                      <span className="text-sm font-medium text-brand-teal-800">9.00</span>
                      <span className="ml-auto text-xs text-gray-400">m²</span>
                    </div>
                  </div>
                </div>

                {wallCounts && (
                  <div className="mt-3">
                    <h4 className="mb-1 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                      Walls
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {wallCounts.solid > 0 && <div>Solid walls: {wallCounts.solid}</div>}
                      {wallCounts.window > 0 && <div>Windows: {wallCounts.window}</div>}
                      {wallCounts.door > 0 && <div>Doors: {wallCounts.door}</div>}
                      {wallCounts.none > 0 && <div>Open (no wall): {wallCounts.none}</div>}
                      {wallCounts.shared > 0 && <div>Shared walls: {wallCounts.shared}</div>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* MATERIAL TAB */}
            {activeTab === "material" && (
              <>
                <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                  Floor
                </h4>
                {floorMat && (
                  <div className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2">
                    <div className="h-8 w-8 rounded" style={{ backgroundColor: floorMat.color }} />
                    <div>
                      <div className="text-sm font-medium text-brand-teal-800">{floorMat.label}</div>
                      <div className="text-[10px] text-gray-400">{floorMat.id}</div>
                    </div>
                  </div>
                )}

                <h4 className="mb-2 mt-3 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                  Walls
                </h4>
                {wallMat && (
                  <div className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2">
                    <div className="h-8 w-8 rounded" style={{ backgroundColor: wallMat.color }} />
                    <div>
                      <div className="text-sm font-medium text-brand-teal-800">{wallMat.label}</div>
                      <div className="text-[10px] text-gray-400">{wallMat.id}</div>
                    </div>
                  </div>
                )}

                {wc && (
                  <div className="mt-3 space-y-1">
                    <h4 className="text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                      Wall Types per Side
                    </h4>
                    {(["north", "south", "east", "west"] as const).map((side) => (
                      <div key={side} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-gray-600">{side}</span>
                        <span className="font-medium text-brand-teal-800 capitalize">{wc[side]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* METADATA TAB */}
            {activeTab === "metadata" && (
              <>
                <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                  Module Info
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-brand-teal-800 capitalize">{selectedMod.moduleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Label</span>
                    <span className="font-medium text-brand-teal-800">{selectedMod.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grid Position</span>
                    <span className="font-medium text-brand-teal-800">Row {selectedMod.row}, Col {selectedMod.col}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Layout Preset</span>
                    <span className="font-medium text-brand-teal-800">{preset?.label ?? selectedMod.layoutPreset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Furniture Items</span>
                    <span className="font-medium text-brand-teal-800">{preset?.furniture.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Cost</span>
                    <span className="font-medium text-brand-teal-800">€{FINISH_LEVELS[1].pricePerModule.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Module Type */}
          <div className="border-b border-gray-200 p-5">
            <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
              Module Type
            </h4>
            {mt && (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: mt.color + "20" }}
                >
                  {mt.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-teal-800">
                    {mt.label}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Mod-Type-{mt.id.charAt(0).toUpperCase()}1
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Constraints */}
          <div className="border-b border-gray-200 p-5">
            <h4 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
              Constraints
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Snap to Grid</span>
                <div className="h-5 w-9 rounded-full bg-brand-teal-600 p-0.5">
                  <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Locked Axis</span>
                <div className="h-5 w-9 rounded-full bg-gray-200 p-0.5">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Stats */}
      <div className="mt-auto border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Coordinates: X: {selectedMod ? (selectedMod.col * 3).toFixed(2) : "0.00"} Y: 0.00
            Z: {selectedMod ? (selectedMod.row * 3).toFixed(2) : "0.00"}
          </span>
          <span className="font-semibold text-brand-teal-800">
            Total Area: {stats.totalArea}.00 m²
          </span>
        </div>
      </div>
    </div>
  );
}
