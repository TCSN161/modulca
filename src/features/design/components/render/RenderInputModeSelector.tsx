"use client";

import { useRef } from "react";
import type { RenderInputMode } from "./renderConstants";
import { toJpegDataUrl, blobToDataUrl, BASE_IMAGE_QUALITY, STORED_RENDER_MAX_SIDE } from "./renderImage";

/** Uploads above this are refused before decoding (phones shoot 5–12 MB). */
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

interface Props {
  value: RenderInputMode;
  onChange: (mode: RenderInputMode) => void;
  uploadImage: string | null;
  onUploadImage: (dataUrl: string | null) => void;
  compact?: boolean;
}

/** 5.03-A: the two Image → Image options first, RO + EN; text-only last. */
const MODES: { id: RenderInputMode; label: string; short: string; hint: string }[] = [
  { id: "scene", label: "Randează ce vezi", short: "Ce vezi", hint: "Render what you see (3D)" },
  { id: "upload", label: "Imaginea ta", short: "Imaginea ta", hint: "Upload your image" },
  { id: "text", label: "Doar text", short: "Text", hint: "Text → Image" },
];

/**
 * Render input selector (BUG-ST03): text2img, 3D view as img2img base, or an
 * uploaded image as img2img base. The upload is re-encoded to a ≤1024 px JPEG
 * at pick time so the POST body stays well under Vercel's 4.5 MB limit.
 */
export default function RenderInputModeSelector({ value, onChange, uploadImage, onUploadImage, compact }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_UPLOAD_BYTES) {
      alert("Choose a JPEG or PNG image under 15 MB.");
      return;
    }
    const dataUrl = await blobToDataUrl(file);
    onUploadImage(await toJpegDataUrl(dataUrl, STORED_RENDER_MAX_SIDE, BASE_IMAGE_QUALITY));
    onChange("upload");
  };

  return (
    <div className="mb-3">
      <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Render Mode</label>
      <div className="grid grid-cols-3 gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onChange(m.id);
              if (m.id === "upload" && !uploadImage) fileRef.current?.click();
            }}
            className={`rounded-lg px-2 ${compact ? "py-2" : "py-2.5"} text-center transition-colors ${value === m.id ? "bg-brand-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <div className="text-[10px] font-bold">{compact ? m.short : m.label}</div>
            {!compact && <div className="text-[8px] mt-0.5 opacity-75">{m.hint}</div>}
          </button>
        ))}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value === "scene" && (
        <p className="mt-1.5 text-[10px] text-brand-teal-600 bg-brand-teal-50 border border-brand-teal-200 rounded-md px-2 py-1.5">
          Se trimite exact cadrul din vizualizatorul 3D (plus harta de adâncime). Rotește camera, alege o presetare sau Single / All Modules.
          <br />
          The exact 3D frame you see is sent (plus its depth map). Orbit, pick a camera preset, or switch Single / All Modules.
        </p>
      )}
      {value === "upload" && (
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-brand-teal-200 bg-brand-teal-50 px-2 py-1.5">
          {uploadImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadImage} alt="Base image" className="h-10 w-14 rounded object-cover" />
          ) : (
            <span className="text-[10px] text-brand-teal-600">No image chosen yet.</span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="ml-auto rounded border border-brand-teal-700 px-2 py-1 text-[10px] font-semibold text-brand-teal-700 hover:bg-white"
          >
            {uploadImage ? "Change image" : "Choose image"}
          </button>
        </div>
      )}
    </div>
  );
}
