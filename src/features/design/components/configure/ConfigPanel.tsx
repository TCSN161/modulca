"use client";

import { useState } from "react";
import { useDesignStore } from "../../store";
import { FINISH_LEVELS } from "@/shared/types";
import { getPresetsForType, getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";

/** All available fixture options */
const FIXTURE_OPTIONS = [
  { id: "led-lighting", label: "Integrated Lighting", description: "LED cove & spot lighting", category: "electrical" },
  { id: "smart-thermostat", label: "Smart Thermostat", description: "Individual climate control", category: "smart" },
  { id: "usb-c-outlets", label: "USB-C Power Outlets", description: "2× integrated USB-C ports", category: "electrical" },
  { id: "ethernet", label: "Ethernet Port", description: "Cat6 network connection", category: "electrical" },
  { id: "tv-cable", label: "TV Cable Outlet", description: "Coaxial TV connection", category: "electrical" },
  { id: "smart-blinds", label: "Smart Blinds", description: "Motorized window blinds", category: "smart" },
  { id: "underfloor-heating", label: "Underfloor Heating", description: "Electric radiant floor", category: "plumbing" },
  { id: "water-supply", label: "Water Supply Point", description: "Hot & cold water connection", category: "plumbing" },
  { id: "drain-point", label: "Drain Point", description: "Wastewater connection", category: "plumbing" },
  { id: "smart-speaker", label: "Smart Speaker Mount", description: "Built-in speaker wiring", category: "smart" },
  { id: "security-sensor", label: "Security Sensor", description: "Motion & door sensor", category: "smart" },
  { id: "ev-charger-prep", label: "EV Charger Prep", description: "240V outlet for EV charging", category: "electrical" },
];

interface ConfigPanelProps {
  moduleRow: number;
  moduleCol: number;
}

export default function ConfigPanel({ moduleRow, moduleCol }: ConfigPanelProps) {
  const { modules, updateModuleConfig, finishLevel, moduleFixtures, setModuleFixtures } = useDesignStore();
  const mod = modules.find((m) => m.row === moduleRow && m.col === moduleCol);
  const [activeTab, setActiveTab] = useState<"layouts" | "materials" | "fixtures" | "review">("layouts");

  if (!mod) return null;

  const presets = getPresetsForType(mod.moduleType);
  const finish = FINISH_LEVELS.find((f) => f.id === finishLevel)!;
  const modulePrice = finish.pricePerModule;

  const TABS = [
    { id: "layouts" as const, label: "Layouts", icon: "⊞" },
    { id: "materials" as const, label: "Materials", icon: "◈" },
    { id: "fixtures" as const, label: "Fixtures", icon: "◉" },
    { id: "review" as const, label: "Review", icon: "☑" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-5">
        <div className="text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
          Module Configuration
        </div>
        <h2 className="mt-1 text-xl font-bold text-brand-teal-800">
          {mod.label.replace(/(\d+)/, " Module $1") || mod.label + " Module"}
        </h2>
        <div className="mt-1 text-xs text-gray-400">
          3×3m Studio Module
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 px-5 pt-3">
        <div className="space-y-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-teal-50 font-semibold text-brand-teal-800"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "layouts" && (
          <div>
            <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Preset Layouts
            </h4>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() =>
                    updateModuleConfig(moduleRow, moduleCol, {
                      layoutPreset: preset.id,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition-all ${
                    mod.layoutPreset === preset.id
                      ? "border-brand-amber-500 bg-brand-amber-50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand-teal-800">
                        {preset.label}
                      </span>
                      {preset.tier === "premium" && (
                        <span className="rounded bg-brand-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-brand-amber-700 uppercase">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.description}
                    </div>
                  </div>
                  {mod.layoutPreset === preset.id && (
                    <span className="text-brand-amber-500 text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="space-y-6">
            {/* Floor Finish */}
            <div>
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Flooring Material
              </h4>
              <div className="flex flex-wrap gap-3">
                {FLOOR_MATERIALS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() =>
                      updateModuleConfig(moduleRow, moduleCol, {
                        floorFinish: f.id,
                      })
                    }
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                      mod.floorFinish === f.id
                        ? "border-brand-teal-800"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className="h-12 w-12 rounded-lg"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wall Color */}
            <div>
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Wall Color
              </h4>
              <div className="flex flex-wrap gap-3">
                {WALL_MATERIALS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() =>
                      updateModuleConfig(moduleRow, moduleCol, {
                        wallColor: w.id,
                      })
                    }
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                      mod.wallColor === w.id
                        ? "border-brand-teal-800"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div
                      className="h-12 w-12 rounded-lg border border-gray-200"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      {w.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "fixtures" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Fixtures & Installations
            </h4>
            <p className="text-[10px] text-gray-400">
              Toggle fixtures for this module. These affect cost and technical drawings.
            </p>
            {(["electrical", "plumbing", "smart"] as const).map((cat) => {
              const items = FIXTURE_OPTIONS.filter((f) => f.category === cat);
              return (
                <div key={cat}>
                  <h5 className="mb-2 text-[10px] font-bold text-brand-amber-600 uppercase tracking-wider">
                    {cat === "electrical" ? "Electrical" : cat === "plumbing" ? "Plumbing" : "Smart Home"}
                  </h5>
                  <div className="space-y-1.5">
                    {items.map((fixture) => {
                      const key = `${moduleRow},${moduleCol}`;
                      const current = moduleFixtures[key] || [];
                      const isOn = current.includes(fixture.id);
                      return (
                        <div key={fixture.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                          <div>
                            <div className="text-sm font-semibold text-brand-teal-800">{fixture.label}</div>
                            <div className="text-[10px] text-gray-500">{fixture.description}</div>
                          </div>
                          <button
                            onClick={() => {
                              const next = isOn ? current.filter((id) => id !== fixture.id) : [...current, fixture.id];
                              setModuleFixtures(moduleRow, moduleCol, next);
                            }}
                            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${isOn ? "bg-brand-teal-800" : "bg-gray-200"}`}
                          >
                            <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isOn ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "review" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Configuration Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Module Type</span>
                <span className="font-medium text-brand-teal-800">
                  {mod.moduleType.charAt(0).toUpperCase() + mod.moduleType.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Layout</span>
                <span className="font-medium text-brand-teal-800">
                  {(getPreset(mod.moduleType, mod.layoutPreset) || getPresetsForType(mod.moduleType)[0])?.label || "Default"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Floor</span>
                <span className="font-medium text-brand-teal-800">
                  {FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.label || "Oak"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Walls</span>
                <span className="font-medium text-brand-teal-800">
                  {WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.label || "Alabaster"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Finish Level</span>
                <span className="font-medium text-brand-teal-800 capitalize">
                  {finishLevel}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar: price + apply */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Current Configuration
            </div>
            <div className="text-sm font-medium text-brand-teal-800">
              {finishLevel.charAt(0).toUpperCase() + finishLevel.slice(1)}{" "}
              {mod.moduleType.charAt(0).toUpperCase() + mod.moduleType.slice(1)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-gray-400 uppercase">
              Module Estimate
            </div>
            <div className="text-xl font-bold text-brand-amber-600">
              €{modulePrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
