import { useState } from "react";
import type { StylePin } from "./renderConstants";
import { pinImage } from "./inspirationImages";

/** BUG-ST35: product photo when we have one, else a labelled placeholder (never a bare colour block). */
function PinVisual({ pin }: { pin: StylePin }) {
  const img = pinImage(pin);
  const [failed, setFailed] = useState(false);
  const showImg = img && !failed;
  return (
    <div
      className="relative w-full flex items-end p-3"
      style={{ height: pin.h, backgroundColor: pin.color }}
      data-testid="inspiration-visual"
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- local /public photo, onError fallback
        <img
          src={img.url}
          alt={img.productName}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-4 text-center"
          aria-hidden="true"
        >
          <span className="rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-gray-700 backdrop-blur-sm">
            {pin.label}
            <span className="mt-0.5 block text-[9px] font-normal text-gray-500">No photo yet</span>
          </span>
        </div>
      )}
      <span className="relative rounded bg-white/80 px-2 py-0.5 text-[9px] font-bold text-gray-600 uppercase backdrop-blur-sm">
        {pin.cat}
      </span>
    </div>
  );
}

interface RenderGalleryProps {
  pins: StylePin[];
  styleLabel: string;
  moduleType: string;
  savedPins: Set<string>;
  onTogglePin: (label: string) => void;
}

export default function RenderGallery({
  pins,
  styleLabel,
  moduleType,
  savedPins,
  onTogglePin,
}: RenderGalleryProps) {
  return (
    <>
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
              <PinVisual pin={pin} />
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
