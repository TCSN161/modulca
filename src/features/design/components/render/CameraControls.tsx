"use client";

import {
  FOCAL_MAX_MM, FOCAL_MIN_MM, PRESET_LABELS, focalToVerticalFov,
  type CameraPreset,
} from "./cameraPresets";

const PRESETS: CameraPreset[] = ["overview", "exterior", "interior"];

interface Props {
  camera: CameraPreset;
  onCameraChange: (preset: CameraPreset) => void;
  focalMm: number;
  onFocalChange: (mm: number) => void;
  /** Interior in the All Modules view: say which module the eye stands in */
  roomLabel?: string;
}

/**
 * Camera presets + field-of-view slider for "Randează ce vezi" (5.03-A).
 * Labels RO + EN. The lens is a 35 mm equivalent: 50 mm normal … 16 mm very wide.
 */
export default function CameraControls({ camera, onCameraChange, focalMm, onFocalChange, roomLabel }: Props) {
  return (
    <div className="space-y-2" data-testid="camera-controls">
      <label className="block text-[10px] font-bold text-gray-400 uppercase">Cameră / Camera</label>
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onCameraChange(p)}
            aria-pressed={camera === p}
            className={`flex-1 rounded-md px-1.5 py-1.5 text-center transition-colors ${camera === p ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <div className="text-[11px] font-semibold leading-tight">{PRESET_LABELS[p].ro}</div>
            <div className="text-[9px] opacity-75 leading-tight">{PRESET_LABELS[p].en}</div>
          </button>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <label htmlFor="render-fov">Unghi de vedere / Field of view</label>
          <span className="font-mono">{Math.round(focalMm)} mm · {Math.round(focalToVerticalFov(focalMm))}°</span>
        </div>
        <input
          id="render-fov"
          type="range"
          min={FOCAL_MIN_MM}
          max={FOCAL_MAX_MM}
          step={1}
          // Right = wider: the slider runs from 50 mm (normal) to 16 mm (wide)
          value={FOCAL_MAX_MM + FOCAL_MIN_MM - focalMm}
          onChange={(e) => onFocalChange(FOCAL_MAX_MM + FOCAL_MIN_MM - Number(e.target.value))}
          className="w-full accent-brand-teal-700"
          aria-label="Field of view (lens mm)"
        />
        <div className="flex justify-between text-[9px] text-gray-400">
          <span>Normal 50 mm</span>
          <span>Larg / Wide 16 mm</span>
        </div>
      </div>
      {camera === "interior" && (
        <p className="text-[10px] text-gray-500">
          {roomLabel ? `În / In: ${roomLabel}. ` : ""}
          Trage pentru a privi în jur, W A S D pentru a merge. / Drag to look around, W A S D to walk.
        </p>
      )}
    </div>
  );
}
