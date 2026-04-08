import type { CameraAngle, StylePin } from "./renderConstants";

interface RenderGalleryProps {
  pins: StylePin[];
  styleLabel: string;
  moduleType: string;
  savedPins: Set<string>;
  onTogglePin: (label: string) => void;
  camera: CameraAngle;
  onCameraChange: (angle: CameraAngle) => void;
}

export default function RenderGallery({
  pins,
  styleLabel,
  moduleType,
  savedPins,
  onTogglePin,
  camera,
  onCameraChange,
}: RenderGalleryProps) {
  return (
    <>
      {/* Camera angle thumbnails */}
      <div className="mx-auto flex gap-3" style={{ maxWidth: 800, width: "100%" }}>
        {(["interior", "corner", "detail"] as CameraAngle[]).map((angle) => (
          <button key={angle} onClick={() => onCameraChange(angle)}
            className={`flex-1 rounded-lg border-2 px-4 py-3 text-center text-xs font-medium capitalize transition-all ${camera === angle ? "border-brand-amber-500 bg-brand-amber-50 text-brand-teal-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            {angle} View
          </button>
        ))}
      </div>

      {/* Pinterest-style Design Inspiration Board */}
      <div className="mt-2">
        <h3 className="mb-1 text-sm font-bold text-brand-teal-800">
          Design Inspiration — {styleLabel}
        </h3>
        <p className="mb-4 text-xs text-gray-400">
          Curated by professional architects for your {moduleType} module
        </p>
        <div style={{ columns: 3, columnGap: 12 }}>
          {pins.map((pin) => (
            <div
              key={pin.label}
              className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ breakInside: "avoid" }}
            >
              <div
                className="w-full flex items-end p-3 bg-cover bg-center"
                style={{
                  height: pin.h,
                  backgroundColor: pin.color,
                  backgroundImage: pin.img ? `url(${pin.img})` : undefined,
                }}
              >
                <span className="rounded bg-white/80 px-2 py-0.5 text-[9px] font-bold text-gray-600 uppercase backdrop-blur-sm">
                  {pin.cat}
                </span>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-brand-teal-800">{pin.label}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{styleLabel}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(pin.label);
                    }}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                      savedPins.has(pin.label)
                        ? "bg-brand-amber-500 text-white"
                        : "bg-brand-amber-50 text-brand-amber-600 hover:bg-brand-amber-100"
                    }`}
                  >
                    {savedPins.has(pin.label) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
