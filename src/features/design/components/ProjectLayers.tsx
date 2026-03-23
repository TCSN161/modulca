"use client";

import { useState } from "react";

interface Layer {
  id: string;
  label: string;
  icon: string;
  locked?: boolean;
}

const LAYERS: Layer[] = [
  { id: "walls", label: "Structural Walls", icon: "◉", locked: true },
  { id: "annotations", label: "Module Annotations", icon: "◉" },
  { id: "plumbing", label: "Service Plumbing", icon: "◉" },
  { id: "grids", label: "Drafting Grids", icon: "◎" },
];

export default function ProjectLayers() {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, true]))
  );

  return (
    <div className="p-4">
      <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
        Project Layers
      </h3>
      <div className="space-y-1">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() =>
              !layer.locked &&
              setVisible((v) => ({ ...v, [layer.id]: !v[layer.id] }))
            }
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              visible[layer.id]
                ? "text-brand-teal-800"
                : "text-gray-400"
            } hover:bg-gray-50`}
          >
            <span
              className={`text-xs ${
                visible[layer.id] ? "text-brand-teal-600" : "text-gray-300"
              }`}
            >
              {layer.icon}
            </span>
            <span className="flex-1">{layer.label}</span>
            {layer.locked && (
              <span className="text-xs text-gray-300">🔒</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
