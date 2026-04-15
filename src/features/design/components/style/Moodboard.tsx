"use client";

import { useCallback, useRef, useState } from "react";
import { useDesignStore } from "../../store";
import type { MoodboardPin } from "../../store";
import { STYLE_DIRECTIONS } from "../../styles";

function pinId() {
  return `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Heights cycle for masonry effect */
const HEIGHTS = [180, 220, 160, 200, 240, 170];

export default function Moodboard() {
  const moodboardPins = useDesignStore((s) => s.moodboardPins);
  const addMoodboardPin = useDesignStore((s) => s.addMoodboardPin);
  const removeMoodboardPin = useDesignStore((s) => s.removeMoodboardPin);
  const styleDirection = useDesignStore((s) => s.styleDirection);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCurated, setShowCurated] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);

  // Collect curated images from all styles
  const curatedImages = STYLE_DIRECTIONS.flatMap((style) => [
    ...style.moodImages.map((img) => ({
      url: img.url,
      label: `${style.label} — ${img.label}`,
      styleId: style.id,
    })),
    ...style.renderImages.map((img) => ({
      url: img.url,
      label: `${style.label} — ${img.label}`,
      styleId: style.id,
    })),
  ]);

  // Filter curated: show selected style first, then others
  const sortedCurated = [...curatedImages].sort((a, b) => {
    if (styleDirection) {
      if (a.styleId === styleDirection && b.styleId !== styleDirection) return -1;
      if (b.styleId === styleDirection && a.styleId !== styleDirection) return 1;
    }
    return 0;
  });

  /** Auto-populate moodboard with all curated images for the selected style */
  const handleAutoPopulate = useCallback(() => {
    if (!styleDirection) return;
    const styleImages = curatedImages.filter((img) => img.styleId === styleDirection);
    let added = 0;
    for (const img of styleImages) {
      if (moodboardPins.some((p) => p.imageUrl === img.url)) continue;
      addMoodboardPin({
        id: pinId(),
        imageUrl: img.url,
        label: img.label,
        source: "curated",
      });
      added++;
    }
    return added;
  }, [styleDirection, curatedImages, moodboardPins, addMoodboardPin]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const pin: MoodboardPin = {
            id: pinId(),
            imageUrl: reader.result as string,
            label: file.name.replace(/\.[^.]+$/, ""),
            source: "upload",
          };
          addMoodboardPin(pin);
        };
        reader.readAsDataURL(file);
      });
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [addMoodboardPin]
  );

  const handleAddUrl = useCallback(() => {
    const url = urlInput.trim();
    if (!url) return;
    const pin: MoodboardPin = {
      id: pinId(),
      imageUrl: url,
      label: "Web image",
      source: "url",
    };
    addMoodboardPin(pin);
    setUrlInput("");
    setShowUrlInput(false);
  }, [urlInput, addMoodboardPin]);

  const handleAddCurated = useCallback(
    (url: string, label: string) => {
      // Don't add duplicates
      if (moodboardPins.some((p) => p.imageUrl === url)) return;
      const pin: MoodboardPin = {
        id: pinId(),
        imageUrl: url,
        label,
        source: "curated",
      };
      addMoodboardPin(pin);
    },
    [addMoodboardPin, moodboardPins]
  );

  // Drag reorder handlers
  const handleDragStart = useCallback((id: string) => {
    dragItemRef.current = id;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (dragItemRef.current && dragItemRef.current !== id) {
        setDragOverId(id);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      const srcId = dragItemRef.current;
      if (!srcId || srcId === targetId) {
        setDragOverId(null);
        return;
      }
      const pins = [...moodboardPins];
      const srcIdx = pins.findIndex((p) => p.id === srcId);
      const tgtIdx = pins.findIndex((p) => p.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) {
        setDragOverId(null);
        return;
      }
      const [moved] = pins.splice(srcIdx, 1);
      pins.splice(tgtIdx, 0, moved);
      useDesignStore.getState().reorderMoodboardPins(pins);
      dragItemRef.current = null;
      setDragOverId(null);
    },
    [moodboardPins]
  );

  const handleDragEnd = useCallback(() => {
    dragItemRef.current = null;
    setDragOverId(null);
  }, []);

  return (
    <div>
      {/* Header + actions */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-teal-800">
            Your Moodboard
          </h2>
          <p className="text-sm text-gray-500">
            Collect inspiration — upload photos, paste URLs, or pick from our library.
            Drag to reorder.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCurated(!showCurated)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              showCurated
                ? "border-brand-amber-500 bg-brand-amber-50 text-brand-amber-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {showCurated ? "Hide Library" : "Browse Library"}
          </button>
          {styleDirection && (
            <button
              onClick={handleAutoPopulate}
              className="rounded-lg border border-brand-teal-300 bg-brand-teal-50 px-3 py-1.5 text-xs font-medium text-brand-teal-700 hover:bg-brand-teal-100 transition-colors"
              title="Add all curated images for this style"
            >
              Auto-fill Style
            </button>
          )}
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Paste URL
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-brand-teal-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-teal-700 transition-colors"
          >
            Upload Photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500"
          />
          <button
            onClick={handleAddUrl}
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Add
          </button>
        </div>
      )}

      {/* Curated library grid */}
      {showCurated && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Curated Library — click to add
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {sortedCurated.map((img) => {
              const alreadyAdded = moodboardPins.some(
                (p) => p.imageUrl === img.url
              );
              return (
                <button
                  key={img.url}
                  onClick={() => handleAddCurated(img.url, img.label)}
                  disabled={alreadyAdded}
                  className={`group relative overflow-hidden rounded-lg border transition-all ${
                    alreadyAdded
                      ? "border-green-300 opacity-60"
                      : "border-gray-200 hover:border-brand-amber-400 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[9px] text-white backdrop-blur-sm">
                    {alreadyAdded ? "Added" : img.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Moodboard pins — Pinterest masonry */}
      {moodboardPins.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center hover:border-brand-amber-400 hover:bg-brand-amber-50/30 transition-colors"
        >
          <svg
            className="mb-3 h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500">
            Start your moodboard
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Upload photos, browse library, or paste image URLs
          </p>
        </div>
      ) : (
        <div
          style={{
            columns: moodboardPins.length <= 2 ? 2 : 3,
            columnGap: "12px",
          }}
        >
          {moodboardPins.map((pin, i) => (
            <div
              key={pin.id}
              draggable
              onDragStart={() => handleDragStart(pin.id)}
              onDragOver={(e) => handleDragOver(e, pin.id)}
              onDrop={() => handleDrop(pin.id)}
              onDragEnd={handleDragEnd}
              className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-lg border bg-white shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                dragOverId === pin.id
                  ? "border-brand-amber-500 ring-2 ring-brand-amber-200"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <div
                className="w-full overflow-hidden"
                style={{ height: HEIGHTS[i % HEIGHTS.length] }}
              >
                <img
                  src={pin.imageUrl}
                  alt={pin.label}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.parentElement!.style.backgroundColor = "#e5e7eb";
                  }}
                />
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-gray-700 truncate">
                  {pin.label}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-400">
                  {pin.source}
                </span>
              </div>
              {/* Remove button */}
              <button
                onClick={() => removeMoodboardPin(pin.id)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center text-xs text-gray-400">
        {moodboardPins.length} pin{moodboardPins.length !== 1 ? "s" : ""} on your board
      </div>
    </div>
  );
}
