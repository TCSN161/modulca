"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { getStyleDirection } from "../../styles";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import { MODULE_TYPES } from "@/shared/types";
import StepNav from "../shared/StepNav";

const RenderScene3D = dynamic(() => import("./RenderScene3D"), { ssr: false });
const CombinedScene3D = dynamic(() => import("../visualize/CombinedScene3D"), { ssr: false });

type LightingMode = "daylight" | "evening" | "night";
type CameraAngle = "interior" | "corner" | "detail";
type RenderMode = "template" | "ai";
type ViewMode = "single" | "all";
type PromptTemplate = "magazine" | "cozy" | "realestate" | "blueprint" | "custom";
type RenderResolution = "draft" | "standard" | "high";
type PollinationsModel = "flux" | "zimage" | "gptimage";

const PROMPT_TEMPLATES: Record<PromptTemplate, { label: string; description: string; suffix: string }> = {
  magazine: {
    label: "Magazine Cover Shot",
    description: "Wide angle, dramatic lighting",
    suffix: "wide angle lens, dramatic lighting, interior design magazine cover, award-winning architectural photography, ultra high resolution, cinematic composition",
  },
  cozy: {
    label: "Cozy Interior",
    description: "Warm lighting, detail focused",
    suffix: "warm ambient lighting, cozy atmosphere, soft textures, hygge style, detail focused macro photography, shallow depth of field, inviting space",
  },
  realestate: {
    label: "Real Estate Listing",
    description: "Bright, clean, professional",
    suffix: "bright natural daylight, clean and airy, professional real estate photography, HDR, wide angle, well-staged, inviting and spacious feel",
  },
  blueprint: {
    label: "Blueprint Overlay",
    description: "Technical + render hybrid",
    suffix: "architectural blueprint overlay, technical drawing blended with photorealistic render, wireframe accents, engineering precision, hybrid visualization",
  },
  custom: {
    label: "Custom",
    description: "Edit prompt freely",
    suffix: "",
  },
};

const RENDER_RESOLUTIONS: Record<RenderResolution, { label: string; width: number; height: number; note: string }> = {
  draft: { label: "Draft", width: 512, height: 288, note: "Fast" },
  standard: { label: "Standard", width: 1024, height: 576, note: "Default" },
  high: { label: "High", width: 1536, height: 864, note: "Slower" },
};

/** Pinterest-style recommendation images per style */
const STYLE_PINS: Record<string, { label: string; h: number; color: string; cat: string }[]> = {
  scandinavian: [
    { label: "Nordic Living Room", h: 220, color: "#E8DFD0", cat: "Living" },
    { label: "Oak Side Table", h: 160, color: "#D4A76A", cat: "Furniture" },
    { label: "Linen Curtains", h: 180, color: "#F0EDE5", cat: "Textile" },
    { label: "Birch Bookshelf", h: 240, color: "#D4B896", cat: "Furniture" },
    { label: "Ceramic Pendant", h: 150, color: "#C8CDD0", cat: "Lighting" },
    { label: "Wool Throw Blanket", h: 170, color: "#E0D8C8", cat: "Textile" },
    { label: "Minimalist Kitchen", h: 200, color: "#F5F3EF", cat: "Kitchen" },
    { label: "White Stone Vase", h: 140, color: "#EDEBE5", cat: "Decor" },
    { label: "Light Wood Flooring", h: 190, color: "#C8A878", cat: "Flooring" },
    { label: "Simple Desk Setup", h: 210, color: "#D0C8B8", cat: "Office" },
    { label: "Fog Grey Sofa", h: 180, color: "#B8BCC0", cat: "Furniture" },
    { label: "Clean Bathroom", h: 230, color: "#E8E4DC", cat: "Bathroom" },
  ],
  industrial: [
    { label: "Exposed Brick Loft", h: 230, color: "#B5654A", cat: "Living" },
    { label: "Steel Shelf Unit", h: 200, color: "#5A5A5A", cat: "Furniture" },
    { label: "Edison Bulb Cluster", h: 150, color: "#C87941", cat: "Lighting" },
    { label: "Concrete Countertop", h: 170, color: "#B0AFA8", cat: "Kitchen" },
    { label: "Leather Club Chair", h: 190, color: "#8B5E3C", cat: "Furniture" },
    { label: "Iron Pipe Rack", h: 160, color: "#4A4A4A", cat: "Storage" },
    { label: "Distressed Wood Table", h: 210, color: "#7B5B3A", cat: "Furniture" },
    { label: "Metal Pendant Lamp", h: 140, color: "#3A3A3A", cat: "Lighting" },
    { label: "Raw Concrete Floor", h: 180, color: "#9A9890", cat: "Flooring" },
    { label: "Copper Faucet", h: 150, color: "#C87941", cat: "Fixture" },
    { label: "Wire Frame Mirror", h: 220, color: "#6A6A6A", cat: "Decor" },
    { label: "Canvas Art Print", h: 200, color: "#444", cat: "Decor" },
  ],
  "warm-contemporary": [
    { label: "Walnut Dining Room", h: 220, color: "#7B5B3A", cat: "Dining" },
    { label: "Bouclé Armchair", h: 180, color: "#F2EBD9", cat: "Furniture" },
    { label: "Sage Velvet Cushions", h: 150, color: "#8FAE8B", cat: "Textile" },
    { label: "Brass Floor Lamp", h: 210, color: "#C8A96E", cat: "Lighting" },
    { label: "Terracotta Tiles", h: 170, color: "#C4735C", cat: "Flooring" },
    { label: "Fluted Glass Panel", h: 190, color: "#D4DDD2", cat: "Fixture" },
    { label: "Curved Wood Console", h: 160, color: "#8B6B4A", cat: "Furniture" },
    { label: "Textured Wall Art", h: 230, color: "#A08868", cat: "Decor" },
    { label: "Warm Bedroom Setup", h: 200, color: "#D4B898", cat: "Bedroom" },
    { label: "Green Plant Corner", h: 140, color: "#6A8A6A", cat: "Decor" },
    { label: "Stone Basin Sink", h: 180, color: "#B0A898", cat: "Bathroom" },
    { label: "Woven Pendant Light", h: 160, color: "#C4A882", cat: "Lighting" },
  ],
};

export default function RenderPage() {
  const {
    modules, selectedModule, setSelectedModule,
    styleDirection, finishLevel, getStats,
  } = useDesignStore();

  const { saved, handleSave } = useSaveDesign();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [mobileSidebar, setMobileSidebar] = useState<"left" | "right" | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>("template");
  const [lighting, setLighting] = useState<LightingMode>("daylight");
  const [camera, setCamera] = useState<CameraAngle>("interior");
  const [atmosphere, setAtmosphere] = useState({ naturalLight: true, plants: true, people: false });
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [savedPins, setSavedPins] = useState<Set<string>>(new Set());
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate>("magazine");
  const [renderResolution, setRenderResolution] = useState<RenderResolution>("standard");
  const [pollinationsModel, setPollinationsModel] = useState<PollinationsModel>("flux");
  const [includePeople, setIncludePeople] = useState(false);
  const [includePlants, setIncludePlants] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);

  const handleSceneReady = useCallback((capture: () => string | null) => {
    captureRef.current = capture;
  }, []);

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  // Reset rendered image when settings change
  useEffect(() => {
    setRenderedImage(null);
  }, [lighting, camera, selectedModule]);

  const currentMod = selectedModule
    ? modules.find((m) => m.row === selectedModule.row && m.col === selectedModule.col)
    : null;

  const style = styleDirection ? getStyleDirection(styleDirection) : null;
  const preset = currentMod ? getPreset(currentMod.moduleType, currentMod.layoutPreset) : null;
  const moduleType = currentMod ? MODULE_TYPES.find((mt) => mt.id === currentMod.moduleType) : null;
  const floorMat = currentMod ? FLOOR_MATERIALS.find((f) => f.id === currentMod.floorFinish) : null;
  const wallMat = currentMod ? WALL_MATERIALS.find((w) => w.id === currentMod.wallColor) : null;
  const stats = getStats();

  const pins = STYLE_PINS[styleDirection || "scandinavian"] || STYLE_PINS.scandinavian;

  // Build default AI prompt from module data
  useEffect(() => {
    if (promptTemplate === "custom") return; // Don't overwrite custom prompts
    const styleName = styleDirection ? (getStyleDirection(styleDirection)?.label || styleDirection) : "modern";
    const templateSuffix = PROMPT_TEMPLATES[promptTemplate].suffix;

    if (viewMode === "all") {
      const moduleLabels = modules.map((m) => {
        const mt = MODULE_TYPES.find((t) => t.id === m.moduleType);
        return mt?.label || m.moduleType;
      });
      const uniqueLabels = [...new Set(moduleLabels)];
      const extras: string[] = [];
      if (includePeople) extras.push("people living in the space, lifestyle photography");
      if (includePlants) extras.push("indoor plants, greenery, biophilic design");
      setAiPrompt(
        `Photorealistic exterior and interior render of a modern modular building with ${uniqueLabels.join(", ")} modules, ${styleName} design style, ${lighting} lighting, professional architectural photography, interior design magazine, 8k, photorealistic, soft natural lighting${extras.length ? ", " + extras.join(", ") : ""}${templateSuffix ? ", " + templateSuffix : ""}`
      );
      return;
    }
    if (!currentMod) return;
    const modLabel = MODULE_TYPES.find((mt) => mt.id === currentMod.moduleType)?.label || currentMod.moduleType;
    const floor = FLOOR_MATERIALS.find((f) => f.id === currentMod.floorFinish)?.label || currentMod.floorFinish;
    const wall = WALL_MATERIALS.find((w) => w.id === currentMod.wallColor)?.label || currentMod.wallColor;

    // Describe wall features (windows, doors)
    const wallFeatures: string[] = [];
    const wc = currentMod.wallConfigs;
    if (wc) {
      const sides = ["north", "south", "east", "west"] as const;
      const windowCount = sides.filter((s) => wc[s] === "window").length;
      const doorCount = sides.filter((s) => wc[s] === "door").length;
      if (windowCount > 0) wallFeatures.push(`${windowCount} large window${windowCount > 1 ? "s" : ""} with natural light`);
      if (doorCount > 0) wallFeatures.push(`${doorCount} door${doorCount > 1 ? "s" : ""}`);
    }

    // Describe furniture from layout preset
    const furnitureDesc = preset?.furniture.map((f) => f.label).join(", ") || "";

    // People and plants toggles
    const extras: string[] = [];
    if (includePeople) extras.push("people living in the space, lifestyle photography");
    if (includePlants) extras.push("indoor plants, greenery, biophilic design");

    const parts = [
      `Photorealistic interior render of a modern ${modLabel}`,
      `${styleName} design style`,
      `${lighting} lighting`,
      `${floor} flooring`,
      `${wall} walls`,
      wallFeatures.length ? wallFeatures.join(", ") : "",
      furnitureDesc ? `furnished with ${furnitureDesc}` : "",
      ...extras,
      "professional architectural photography, interior design magazine, 8k, photorealistic, soft natural lighting",
      templateSuffix,
    ].filter(Boolean);

    setAiPrompt(parts.join(", "));
  }, [currentMod, styleDirection, lighting, viewMode, modules, promptTemplate, includePeople, includePlants, preset]);

  // Reset AI image when prompt changes
  useEffect(() => {
    setAiImageUrl(null);
    setAiError(null);
  }, [aiPrompt]);

  const handleGenerateRender = () => {
    setIsRendering(true);
    // Give Three.js a moment to render the frame
    setTimeout(() => {
      const img = captureRef.current?.();
      if (img) setRenderedImage(img);
      setIsRendering(false);
    }, 500);
  };

  const handleGenerateAiRender = useCallback((modelOverride?: PollinationsModel | React.MouseEvent) => {
    // When called as onClick handler, ignore the mouse event argument
    const effectiveModel: PollinationsModel =
      typeof modelOverride === "string" ? modelOverride : pollinationsModel;

    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiImageUrl(null);

    const model = effectiveModel;
    const res = RENDER_RESOLUTIONS[renderResolution];

    // Sanitize prompt: remove special chars that break the URL, limit length
    const sanitized = aiPrompt
      .trim()
      .replace(/[^\w\s,.\-!?']/g, " ")   // keep only safe chars
      .replace(/\s+/g, " ")                // collapse whitespace
      .slice(0, 500);                       // Pollinations prompt length limit

    const encoded = encodeURIComponent(sanitized);
    const url = `https://gen.pollinations.ai/image/${encoded}?width=${res.width}&height=${res.height}&model=${model}&nologo=true&nofeed=true&enhance=true&seed=${Date.now()}`;

    // Log URL for debugging
    console.log("[AI Render] URL:", url);
    console.log("[AI Render] model:", model, "resolution:", res.width, "x", res.height);

    // Use fetch to follow redirects, then create object URL
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000); // 60s timeout

    fetch(url, { signal: controller.signal })
      .then((resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.blob();
      })
      .then((blob) => {
        clearTimeout(timer);
        if (blob.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(blob);
          setAiImageUrl(objectUrl);
          setAiLoading(false);
        } else {
          throw new Error("Response was not an image");
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err.name === "AbortError") {
          if (model === "flux") {
            console.log("[AI Render] Timeout with flux, retrying with zimage...");
            handleGenerateAiRender("zimage");
          } else {
            setAiError("AI render timed out. Try a shorter prompt or Draft resolution.");
            setAiLoading(false);
          }
        } else if (model === "flux") {
          console.log("[AI Render] Error with flux, retrying with zimage...", err);
          handleGenerateAiRender("zimage");
        } else {
          console.error("[AI Render] Failed:", err);
          setAiError("Failed to generate AI render. Please try again or adjust your prompt.");
          setAiLoading(false);
        }
      });
  }, [aiPrompt, pollinationsModel, renderResolution]);

  if (modules.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No modules configured yet.</p>
          <Link href="/project/demo/land" className="mt-4 inline-block rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white">
            Go to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={6} />
        <button onClick={handleSave} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}>{saved ? "Saved!" : "Save"}</button>
      </header>

      {/* Module selector bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-3 overflow-x-auto">
        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
          const isActive = selectedModule?.row === mod.row && selectedModule?.col === mod.col;
          return (
            <button key={`${mod.row}-${mod.col}`} onClick={() => setSelectedModule({ row: mod.row, col: mod.col })}
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm whitespace-nowrap transition-all ${isActive ? "border-brand-amber-500 bg-brand-amber-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className="h-4 w-4 rounded" style={{ backgroundColor: mt?.color || "#888" }} />
              <span className={isActive ? "font-semibold text-brand-teal-800" : "text-gray-600"}>{mod.label}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/project/demo/visualize" className="text-sm text-gray-500 hover:text-brand-teal-800">← Back to Visualize</Link>
          <Link href="/project/demo/technical" className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600">Technical Drawings →</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Render Settings</h3>

          {/* Render mode */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Mode</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setRenderMode("template")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${renderMode === "template" ? "bg-brand-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                3D Render
              </button>
              <button onClick={() => setRenderMode("ai")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${renderMode === "ai" ? "bg-brand-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                AI Premium
              </button>
            </div>
          </div>

          {/* Lighting */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Lighting</label>
            <div className="flex gap-1">
              {(["daylight", "evening", "night"] as LightingMode[]).map((l) => (
                <button key={l} onClick={() => setLighting(l)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${lighting === l ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Camera */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Camera</label>
            <div className="flex gap-1">
              {(["interior", "corner", "detail"] as CameraAngle[]).map((c) => (
                <button key={c} onClick={() => setCamera(c)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${camera === c ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Atmosphere */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Atmosphere</label>
            <div className="space-y-2">
              {[
                { key: "naturalLight" as const, label: "Natural Light" },
                { key: "plants" as const, label: "Plants & Decor" },
                { key: "people" as const, label: "People" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer">
                  <span className="text-xs text-gray-700">{label}</span>
                  <button type="button" role="switch" aria-checked={atmosphere[key]}
                    onClick={() => setAtmosphere((p) => ({ ...p, [key]: !p[key] }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${atmosphere[key] ? "bg-brand-amber-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${atmosphere[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Generate button — mode-aware */}
          {renderMode === "template" ? (
            <>
              <button
                onClick={handleGenerateRender}
                disabled={isRendering}
                className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isRendering ? "Rendering..." : "Generate Render"}
              </button>
              {renderedImage && (
                <a
                  href={renderedImage}
                  download={`render-${currentMod?.label || "module"}-${lighting}.png`}
                  className="mt-2 block w-full rounded-lg border border-brand-teal-800 px-4 py-2 text-center text-xs font-semibold text-brand-teal-800 hover:bg-brand-teal-50"
                >
                  Download PNG
                </a>
              )}
            </>
          ) : (
            <>
              {/* Prompt Template */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Prompt Template</label>
                <select
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value as PromptTemplate)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500"
                >
                  {(Object.keys(PROMPT_TEMPLATES) as PromptTemplate[]).map((key) => (
                    <option key={key} value={key}>{PROMPT_TEMPLATES[key].label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-gray-400">{PROMPT_TEMPLATES[promptTemplate].description}</p>
              </div>

              {/* AI Model */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">AI Model</label>
                <div className="flex gap-1">
                  {(["flux", "zimage", "gptimage"] as PollinationsModel[]).map((m) => (
                    <button key={m} onClick={() => setPollinationsModel(m)}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${pollinationsModel === m ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Resolution</label>
                <div className="flex gap-1">
                  {(Object.keys(RENDER_RESOLUTIONS) as RenderResolution[]).map((r) => (
                    <button key={r} onClick={() => setRenderResolution(r)}
                      className={`flex-1 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${renderResolution === r ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      <div>{RENDER_RESOLUTIONS[r].label}</div>
                      <div className="text-[8px] opacity-70">{RENDER_RESOLUTIONS[r].width}x{RENDER_RESOLUTIONS[r].height}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include People / Plants toggles */}
              <div className="mb-3 space-y-2">
                <label className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer">
                  <span className="text-xs text-gray-700">Include People</span>
                  <button type="button" role="switch" aria-checked={includePeople}
                    onClick={() => setIncludePeople((p) => !p)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includePeople ? "bg-brand-amber-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${includePeople ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer">
                  <span className="text-xs text-gray-700">Include Plants</span>
                  <button type="button" role="switch" aria-checked={includePlants}
                    onClick={() => setIncludePlants((p) => !p)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includePlants ? "bg-brand-amber-500" : "bg-gray-300"}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${includePlants ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>

              {/* AI prompt textarea */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">AI Prompt</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => { setAiPrompt(e.target.value); if (promptTemplate !== "custom") setPromptTemplate("custom"); }}
                  rows={5}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500 resize-none"
                  placeholder="Describe the render you want..."
                />
              </div>
              <button
                onClick={handleGenerateAiRender}
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {aiLoading ? "Generating..." : `Generate AI Render (${RENDER_RESOLUTIONS[renderResolution].label})`}
              </button>
              {aiImageUrl && (
                <a
                  href={aiImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`ai-render-${currentMod?.label || "module"}-${lighting}.png`}
                  className="mt-2 block w-full rounded-lg border border-brand-teal-800 px-4 py-2 text-center text-xs font-semibold text-brand-teal-800 hover:bg-brand-teal-50"
                >
                  Download PNG
                </a>
              )}
            </>
          )}
        </aside>

        {/* Center */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentMod && (
            <div className="flex flex-col gap-6">
              {/* View mode toggle */}
              {modules.length > 1 && (
                <div className="flex items-center justify-center gap-1 rounded-full bg-gray-100 p-1 mx-auto">
                  <button
                    onClick={() => setViewMode("single")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "single" ? "bg-white text-brand-teal-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Single Module
                  </button>
                  <button
                    onClick={() => setViewMode("all")}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === "all" ? "bg-white text-brand-teal-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Modules
                  </button>
                </div>
              )}

              {/* Render viewport — fixed 16:9 aspect ratio */}
              <div className="relative mx-auto w-full overflow-hidden rounded-2xl shadow-lg" style={{ maxWidth: 800 }}>
                <div style={{ aspectRatio: "16/9", position: "relative" }}>
                  {renderedImage ? (
                    <img src={renderedImage} alt="Generated render" className="h-full w-full object-contain bg-gray-900 rounded-2xl" />
                  ) : viewMode === "all" ? (
                    <CombinedScene3D />
                  ) : (
                    <RenderScene3D
                      module={currentMod}
                      lighting={lighting}
                      camera={camera}
                      showPlants={atmosphere.plants}
                      onReady={handleSceneReady}
                    />
                  )}

                  {/* AI render overlay */}
                  {renderMode === "ai" && !aiImageUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                      {aiLoading ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-amber-500 border-t-transparent" />
                          <p className="text-sm font-medium text-brand-teal-800">Generating AI render...</p>
                          <p className="text-xs text-gray-400">This may take 10-30 seconds</p>
                        </div>
                      ) : aiError ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl">
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 uppercase tracking-wider">Error</span>
                          <p className="text-center text-sm text-gray-600 max-w-xs">{aiError}</p>
                          <button onClick={handleGenerateAiRender} className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600">
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl">
                          <span className="rounded-full bg-brand-amber-100 px-3 py-1 text-xs font-bold text-brand-amber-700 uppercase tracking-wider">AI Render</span>
                          <p className="text-center text-sm text-gray-600 max-w-xs">Configure your prompt below and click &quot;Generate AI Render&quot;</p>
                          <p className="text-xs text-gray-400">Powered by Pollinations.ai — Free, no API key needed</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* AI generated image */}
                  {renderMode === "ai" && aiImageUrl && (
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={aiImageUrl} alt="AI generated render" className="h-full w-full object-cover rounded-2xl" />
                    </div>
                  )}

                  {/* Camera badge */}
                  <div className="absolute top-3 right-3 rounded-full bg-black/30 px-3 py-1 text-[10px] font-medium text-white uppercase backdrop-blur-sm">
                    {camera} · {lighting}
                  </div>

                  {!renderedImage && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="rounded-lg bg-black/40 px-4 py-2 text-xs text-white backdrop-blur-sm">
                        Live 3D Preview — Click &quot;Generate Render&quot; to capture high-quality image
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera angle thumbnails */}
              <div className="mx-auto flex gap-3" style={{ maxWidth: 800, width: "100%" }}>
                {(["interior", "corner", "detail"] as CameraAngle[]).map((angle) => (
                  <button key={angle} onClick={() => setCamera(angle)}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-center text-xs font-medium capitalize transition-all ${camera === angle ? "border-brand-amber-500 bg-brand-amber-50 text-brand-teal-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                    {angle} View
                  </button>
                ))}
              </div>

              {/* Pinterest-style Design Inspiration Board */}
              <div className="mt-2">
                <h3 className="mb-1 text-sm font-bold text-brand-teal-800">
                  Design Inspiration — {style?.label || "Scandinavian Minimal"}
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  Curated by professional architects for your {currentMod.moduleType} module
                </p>
                <div style={{ columns: 3, columnGap: 12 }}>
                  {pins.map((pin) => (
                    <div
                      key={pin.label}
                      className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{ breakInside: "avoid" }}
                    >
                      <div
                        className="w-full flex items-end p-3"
                        style={{ height: pin.h, backgroundColor: pin.color }}
                      >
                        <span className="rounded bg-white/80 px-2 py-0.5 text-[9px] font-bold text-gray-600 uppercase backdrop-blur-sm">
                          {pin.cat}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-semibold text-brand-teal-800">{pin.label}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">{style?.label || "Scandinavian"}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSavedPins((prev) => {
                                const next = new Set(prev);
                                if (next.has(pin.label)) {
                                  next.delete(pin.label);
                                } else {
                                  next.add(pin.label);
                                }
                                return next;
                              });
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
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden md:block w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Render Details</h3>

          {currentMod && (
            <div className="space-y-5">
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Current Module</div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: moduleType?.color || "#888" }} />
                  <span className="text-sm font-semibold text-brand-teal-800">{currentMod.label}</span>
                </div>
                <div className="text-xs text-gray-500">Type: {moduleType?.label || currentMod.moduleType}</div>
                <div className="text-xs text-gray-500">Layout: {preset?.label || currentMod.layoutPreset}</div>
                <div className="text-xs text-gray-500">Style: {style?.label || "Default"}</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Materials</div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded border border-gray-200" style={{ backgroundColor: floorMat?.color || "#D4A76A" }} />
                  <span className="text-xs text-gray-700">Floor: {floorMat?.label || currentMod.floorFinish}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded border border-gray-200" style={{ backgroundColor: wallMat?.color || "#F0EDE5" }} />
                  <span className="text-xs text-gray-700">Walls: {wallMat?.label || currentMod.wallColor}</span>
                </div>
              </div>

              {preset && (
                <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Furniture ({preset.furniture.length})</div>
                  {preset.furniture.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="h-3 w-3 rounded-sm border border-gray-200" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Cost Summary</div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Module cost ({finishLevel})</span>
                  <span className="font-medium">€{stats.moduleCost.toLocaleString()}</span>
                </div>
                {stats.sharedWallDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Shared wall discount</span>
                    <span className="font-medium">-€{stats.sharedWallDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Design fee (8%)</span>
                  <span className="font-medium">€{stats.designFee.toLocaleString()}</span>
                </div>
                <div className="mt-1 border-t border-gray-200 pt-1 flex justify-between text-sm font-bold text-brand-teal-800">
                  <span>Total</span>
                  <span>€{stats.totalEstimate.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/project/demo/technical"
                className="block w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors">
                CONTINUE →
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile FAB to toggle sidebars */}
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={() => setMobileSidebar(mobileSidebar === "left" ? null : "left")}
            className="h-12 w-12 rounded-full bg-brand-teal-800 text-white shadow-lg flex items-center justify-center"
            aria-label="Toggle render settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
          <button
            onClick={() => setMobileSidebar(mobileSidebar === "right" ? null : "right")}
            className="h-12 w-12 rounded-full bg-brand-amber-500 text-white shadow-lg flex items-center justify-center"
            aria-label="Toggle render details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>

        {/* Mobile slide-over panel */}
        {mobileSidebar !== null && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSidebar(null)} />
            <aside
              className={`absolute top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto ${
                mobileSidebar === "left" ? "left-0" : "right-0"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <span className="text-sm font-bold text-brand-teal-800">
                  {mobileSidebar === "left" ? "Render Settings" : "Render Details"}
                </span>
                <button onClick={() => setMobileSidebar(null)} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {mobileSidebar === "left" ? (
                <div className="p-4">
                  <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Render Settings</h3>
                  <div className="mb-5">
                    <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Mode</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      <button onClick={() => setRenderMode("template")}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${renderMode === "template" ? "bg-brand-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                        3D Render
                      </button>
                      <button onClick={() => setRenderMode("ai")}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${renderMode === "ai" ? "bg-brand-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                        AI Premium
                      </button>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Lighting</label>
                    <div className="flex gap-1">
                      {(["daylight", "evening", "night"] as LightingMode[]).map((l) => (
                        <button key={l} onClick={() => setLighting(l)}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${lighting === l ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Camera</label>
                    <div className="flex gap-1">
                      {(["interior", "corner", "detail"] as CameraAngle[]).map((c) => (
                        <button key={c} onClick={() => setCamera(c)}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${camera === c ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {renderMode === "template" ? (
                    <button
                      onClick={handleGenerateRender}
                      disabled={isRendering}
                      className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50"
                    >
                      {isRendering ? "Rendering..." : "Generate Render"}
                    </button>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Prompt Template</label>
                        <select value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value as PromptTemplate)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none">
                          {(Object.keys(PROMPT_TEMPLATES) as PromptTemplate[]).map((key) => (
                            <option key={key} value={key}>{PROMPT_TEMPLATES[key].label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Resolution</label>
                        <div className="flex gap-1">
                          {(Object.keys(RENDER_RESOLUTIONS) as RenderResolution[]).map((r) => (
                            <button key={r} onClick={() => setRenderResolution(r)}
                              className={`flex-1 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${renderResolution === r ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                              {RENDER_RESOLUTIONS[r].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3 space-y-2">
                        <label className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer">
                          <span className="text-xs text-gray-700">Include People</span>
                          <button type="button" role="switch" aria-checked={includePeople} onClick={() => setIncludePeople((p) => !p)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includePeople ? "bg-brand-amber-500" : "bg-gray-300"}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${includePeople ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </label>
                        <label className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer">
                          <span className="text-xs text-gray-700">Include Plants</span>
                          <button type="button" role="switch" aria-checked={includePlants} onClick={() => setIncludePlants((p) => !p)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${includePlants ? "bg-brand-amber-500" : "bg-gray-300"}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${includePlants ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </label>
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">AI Prompt</label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => { setAiPrompt(e.target.value); if (promptTemplate !== "custom") setPromptTemplate("custom"); }}
                          rows={5}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none resize-none"
                          placeholder="Describe the render you want..."
                        />
                      </div>
                      <button
                        onClick={handleGenerateAiRender}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50"
                      >
                        {aiLoading ? "Generating..." : `Generate AI Render (${RENDER_RESOLUTIONS[renderResolution].label})`}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Render Details</h3>
                  {currentMod && (
                    <div className="space-y-5">
                      <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Current Module</div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: moduleType?.color || "#888" }} />
                          <span className="text-sm font-semibold text-brand-teal-800">{currentMod.label}</span>
                        </div>
                        <div className="text-xs text-gray-500">Style: {style?.label || "Default"}</div>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Cost Summary</div>
                        <div className="mt-1 flex justify-between text-sm font-bold text-brand-teal-800">
                          <span>Total</span>
                          <span>&euro;{stats.totalEstimate.toLocaleString()}</span>
                        </div>
                      </div>
                      <Link href="/project/demo/technical"
                        className="block w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors">
                        CONTINUE →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
