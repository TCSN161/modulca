"use client";

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

export type LayerVisibility = Record<string, boolean>;

export const DEFAULT_LAYERS: LayerVisibility = Object.fromEntries(
  LAYERS.map((l) => [l.id, true])
);

interface ProjectLayersProps {
  visible: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
}

export default function ProjectLayers({ visible, onChange }: ProjectLayersProps) {

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
              onChange({ ...visible, [layer.id]: !visible[layer.id] })
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
