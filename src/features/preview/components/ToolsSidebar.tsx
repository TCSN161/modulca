"use client";

import { useState } from "react";

const TOOLS = [
  { id: "select", label: "SELECT", icon: "▸" },
];

const BOTTOM_TOOLS = [
  { id: "layers", label: "LAYERS", icon: "◈" },
  { id: "history", label: "HISTORY", icon: "↺" },
];

export default function ToolsSidebar() {
  const [activeTool, setActiveTool] = useState("select");

  return (
    <div className="flex h-full w-16 flex-col items-center border-r border-gray-200 bg-white py-3">
      {/* Project badge */}
      <div className="mb-4 flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
          A
        </div>
        <span className="mt-0.5 text-[8px] font-medium text-gray-400">ALPHA</span>
      </div>

      {/* Main tools */}
      <div className="flex flex-col gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg text-xs transition-colors ${
              activeTool === tool.id
                ? "bg-brand-teal-800 text-white"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            <span className="text-base">{tool.icon}</span>
            <span className="mt-0.5 text-[7px] font-semibold tracking-wider">
              {tool.label}
            </span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom tools */}
      <div className="flex flex-col gap-1">
        {BOTTOM_TOOLS.map((tool) => (
          <button
            key={tool.id}
            className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="text-base">{tool.icon}</span>
            <span className="mt-0.5 text-[7px] font-semibold tracking-wider">
              {tool.label}
            </span>
          </button>
        ))}
      </div>

      {/* Add Module button */}
      <button className="mt-3 flex w-12 items-center justify-center rounded-lg bg-brand-teal-800 py-2 text-[8px] font-bold text-white">
        + Add
      </button>
    </div>
  );
}
