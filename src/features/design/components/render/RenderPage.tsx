"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore, type SavedRender } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { getStyleDirection } from "../../styles";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import { MODULE_TYPES } from "@/shared/types";
import StepNav from "../shared/StepNav";
import MobileStepFooter from "../shared/MobileStepFooter";

import type { LightingMode, CameraAngle, RenderMode, ViewMode, PromptTemplate, RenderResolution, AiEngine } from "./renderConstants";
import { AI_ENGINES, PROMPT_TEMPLATES, RENDER_RESOLUTIONS, STYLE_PINS } from "./renderConstants";
import { useRenderEngine } from "./useRenderEngine";
import RenderGallery from "./RenderGallery";
import { useAuthStore } from "@/features/auth/store";
import PublishButton from "@/features/gallery/components/PublishButton";
import { getTierConfig } from "@/features/auth/types";
import { useProjectId } from "@/shared/hooks/useProjectId";

const RenderScene3D = dynamic(() => import("./RenderScene3D"), { ssr: false });
const CombinedScene3D = dynamic(() => import("../visualize/CombinedScene3D"), { ssr: false });

export default function RenderPage() {
  const projectId = useProjectId();
  const gridCells = useLandStore((s) => s.gridCells);
  const gridRotation = useLandStore((s) => s.gridRotation);
  // Granular selectors — each subscribes to one slice, avoiding whole-store re-renders
  const modules = useDesignStore((s) => s.modules);
  const selectedModule = useDesignStore((s) => s.selectedModule);
  const setSelectedModule = useDesignStore((s) => s.setSelectedModule);
  const setModulesFromGrid = useDesignStore((s) => s.setModulesFromGrid);
  const styleDirection = useDesignStore((s) => s.styleDirection);
  const finishLevel = useDesignStore((s) => s.finishLevel);
  const getStats = useDesignStore((s) => s.getStats);
  const loadFromLocalStorage = useDesignStore((s) => s.loadFromLocalStorage);

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
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate>("magazine");
  const [renderResolution, setRenderResolution] = useState<RenderResolution>("standard");
  const [includePeople, setIncludePeople] = useState(false);
  const [includePlants, setIncludePlants] = useState(false);
  const [aiEngine, setAiEngine] = useState<AiEngine>("auto");
  const [useSceneAsBase, setUseSceneAsBase] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);

  const {
    aiImageUrl,
    aiLoading,
    aiError,
    aiElapsed,
    aiUsedEngine,
    handleGenerateAiRender: generateAiRender,
    resetAiImage,
  } = useRenderEngine({ aiEngine, renderResolution, useSceneAsBase, captureRef });

  // Tier-based render limits
  const userTier = useAuthStore((s) => s.userTier);
  const tierConfig = useMemo(() => getTierConfig(userTier), [userTier]);
  const maxRendersPerMonth = tierConfig.features.aiRendersPerMonth;
  const tierResolution = tierConfig.features.renderResolution;
  /** Check if a resolution is locked for the current tier */
  const isResLocked = useCallback((res: string) => {
    if (tierResolution === "4k") return false;
    if (tierResolution === "hd") return false;
    // SD tier: only draft + standard allowed
    if (tierResolution === "sd" && res === "high") return true;
    return false;
  }, [tierResolution]);

  // Monthly render quota — server-side via auth store (Supabase + localStorage fallback)
  const monthlyRenderCount = useAuthStore((s) => s.monthlyRenderCount);
  const { allowed: canRender } = useAuthStore.getState().canUseMonthlyRender();
  const atRenderLimit = !canRender;
  const incrementMonthlyRenders = useAuthStore((s) => s.incrementMonthlyRenders);

  const handleGenerateAiRender = useCallback(() => {
    if (atRenderLimit) return;
    generateAiRender(aiPrompt);
    incrementMonthlyRenders();
  }, [generateAiRender, aiPrompt, atRenderLimit, incrementMonthlyRenders]);

  const handleSceneReady = useCallback((capture: () => string | null) => {
    captureRef.current = capture;
  }, []);

  // Hydrate from localStorage first (preserves furnitureOverrides from Step 6),
  // then fall back to land store if localStorage had nothing.
  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  // Reset rendered image when settings change
  useEffect(() => {
    setRenderedImage(null);
  }, [lighting, camera, selectedModule]);

  const currentMod = useMemo(
    () => (selectedModule
      ? modules.find((m) => m.row === selectedModule.row && m.col === selectedModule.col) ?? null
      : null),
    [selectedModule, modules],
  );

  const style = useMemo(
    () => (styleDirection ? getStyleDirection(styleDirection) : null),
    [styleDirection],
  );
  const preset = useMemo(
    () => (currentMod
      ? getPreset(currentMod.moduleType, currentMod.layoutPreset)
        || getPresetsForType(currentMod.moduleType)[0]
      : null),
    [currentMod],
  );
  const moduleType = useMemo(
    () => (currentMod ? MODULE_TYPES.find((mt) => mt.id === currentMod.moduleType) : null),
    [currentMod],
  );
  const floorMat = useMemo(
    () => (currentMod ? FLOOR_MATERIALS.find((f) => f.id === currentMod.floorFinish) : null),
    [currentMod],
  );
  const wallMat = useMemo(
    () => (currentMod ? WALL_MATERIALS.find((w) => w.id === currentMod.wallColor) : null),
    [currentMod],
  );
  // getStats is a zustand getter reading fresh state; recompute when inputs change
  const stats = useMemo(
    () => getStats(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getStats, modules, finishLevel],
  );

  const pins = useMemo(
    () => STYLE_PINS[styleDirection || "scandinavian"] || STYLE_PINS.scandinavian,
    [styleDirection],
  );

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
    resetAiImage();
  }, [aiPrompt, resetAiImage]);

  const handleGenerateRender = useCallback(() => {
    setIsRendering(true);
    // Give Three.js a moment to render the frame
    setTimeout(() => {
      const img = captureRef.current?.();
      if (img) setRenderedImage(img);
      setIsRendering(false);
    }, 500);
  }, []);

  const handleTogglePin = useCallback((label: string) => {
    setSavedPins((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  if (modules.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No modules configured yet.</p>
          <Link href={`/project/${projectId}/land`} className="mt-4 inline-block rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white">
            Go to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={7} />
        <button onClick={handleSave} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}>{saved ? "Saved!" : "Save"}</button>
      </header>

      {/* Module selector bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 md:px-6 py-3 overflow-x-auto">
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
          <Link href={`/project/${projectId}/visualize`} className="text-sm text-gray-500 hover:text-brand-teal-800">← Back to Visualize</Link>
          <Link href={`/project/${projectId}/technical`} className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600">Technical Drawings →</Link>
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

              {/* Resolution */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Resolution</label>
                <div className="flex gap-1">
                  {(Object.keys(RENDER_RESOLUTIONS) as RenderResolution[]).map((r) => {
                    const locked = isResLocked(r);
                    return (
                      <button key={r} onClick={() => !locked && setRenderResolution(r)} disabled={locked}
                        className={`flex-1 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${locked ? "bg-gray-50 text-gray-300 cursor-not-allowed" : renderResolution === r ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        <div>{RENDER_RESOLUTIONS[r].label}{locked ? " 🔒" : ""}</div>
                        <div className="text-[8px] opacity-70">{RENDER_RESOLUTIONS[r].width}x{RENDER_RESOLUTIONS[r].height}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Engine selector */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">AI Engine</label>
                <select
                  value={aiEngine}
                  onChange={(e) => setAiEngine(e.target.value as AiEngine)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500"
                >
                  {(Object.keys(AI_ENGINES) as AiEngine[]).map((key) => (
                    <option key={key} value={key}>
                      {AI_ENGINES[key].label}{AI_ENGINES[key].speed ? ` (${AI_ENGINES[key].speed})` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-gray-400">{AI_ENGINES[aiEngine].description}</p>
              </div>

              {/* Render Mode Selector — text2img / img2img / text+img */}
              <div className="mb-3">
                <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Render Mode</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setUseSceneAsBase(false)}
                    className={`rounded-lg px-2 py-2.5 text-center transition-colors ${!useSceneAsBase ? "bg-brand-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    <div className="text-[10px] font-bold">Text → Image</div>
                    <div className="text-[8px] mt-0.5 opacity-75">From prompt only</div>
                  </button>
                  <button
                    onClick={() => setUseSceneAsBase(true)}
                    className={`rounded-lg px-2 py-2.5 text-center transition-colors ${useSceneAsBase ? "bg-brand-teal-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    <div className="text-[10px] font-bold">3D + Text → Image</div>
                    <div className="text-[8px] mt-0.5 opacity-75">3D scene as base</div>
                  </button>
                  <button
                    disabled
                    className="rounded-lg px-2 py-2.5 text-center bg-gray-50 text-gray-300 cursor-not-allowed"
                  >
                    <div className="text-[10px] font-bold">Image → Image</div>
                    <div className="text-[8px] mt-0.5 opacity-75">Coming soon</div>
                  </button>
                </div>
                {useSceneAsBase && (
                  <p className="mt-1.5 text-[10px] text-brand-teal-600 bg-brand-teal-50 border border-brand-teal-200 rounded-md px-2 py-1.5">
                    The 3D scene will be captured and used as a structural base. The AI will apply your style prompt while preserving the room layout.
                  </p>
                )}
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
                disabled={aiLoading || !aiPrompt.trim() || atRenderLimit}
                className="w-full rounded-lg bg-brand-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {atRenderLimit
                  ? "Monthly render limit reached"
                  : aiLoading
                  ? `Generating... ${aiElapsed}s`
                  : `Generate with ${aiEngine === "auto" ? "AI" : AI_ENGINES[aiEngine].label}`}
              </button>
              {maxRendersPerMonth !== -1 && (
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>{monthlyRenderCount}/{maxRendersPerMonth === -1 ? "∞" : maxRendersPerMonth} renders this month</span>
                  {atRenderLimit && (
                    <a href="/pricing" className="text-brand-amber-500 font-semibold hover:underline">Upgrade</a>
                  )}
                </div>
              )}
              {aiImageUrl && (
                <div className="mt-3 space-y-2">
                  {aiUsedEngine && (
                    <p className="text-center text-[10px] text-gray-400">
                      Generated by <span className="font-semibold text-brand-teal-700">{aiUsedEngine}</span>
                    </p>
                  )}
                  <a
                    href={aiImageUrl}
                    download={`modulca-render-${currentMod?.label || "module"}-${Date.now()}.png`}
                    className="block w-full rounded-lg border border-brand-teal-800 px-4 py-2 text-center text-xs font-semibold text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
                  >
                    {"💾 Save Image"}
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share && aiImageUrl) {
                        fetch(aiImageUrl)
                          .then((r) => r.blob())
                          .then((blob) => {
                            const file = new File([blob], `modulca-render.png`, { type: blob.type });
                            navigator.share({ title: "ModulCA AI Render", text: "Check out my modular home design!", files: [file] }).catch(() => {});
                          })
                          .catch(() => {});
                      } else if (aiImageUrl) {
                        navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied to clipboard!")).catch(() => {});
                      }
                    }}
                    className="block w-full rounded-lg border border-brand-amber-500 px-4 py-2 text-center text-xs font-semibold text-brand-amber-600 hover:bg-brand-amber-50 transition-colors"
                  >
                    {"📤 Share with Friends"}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const resp = await fetch(aiImageUrl);
                        const blob = await resp.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          // Auto-generate description for presentation
                          const styleName = style?.label || "Modern";
                          const moduleName = currentMod?.label || "Module";
                          const modeLabel = useSceneAsBase ? "3D scene conversion" : "AI text-to-image";
                          const engineName = aiUsedEngine || "AI";
                          const resLabel = RENDER_RESOLUTIONS[renderResolution]?.label || "Standard";
                          const autoDescription = [
                            `${styleName} interior design visualization of ${moduleName}.`,
                            `Generated via ${modeLabel} using ${engineName} engine at ${resLabel} resolution.`,
                            aiPrompt ? `Style prompt: "${aiPrompt.slice(0, 150)}${aiPrompt.length > 150 ? "..." : ""}"` : "",
                          ].filter(Boolean).join(" ");

                          const render: SavedRender = {
                            id: `render-${Date.now()}`,
                            imageUrl: base64,
                            label: `${moduleName} — ${styleName} AI Render`,
                            engine: engineName,
                            moduleType: currentMod?.moduleType || "unknown",
                            createdAt: new Date().toISOString(),
                            description: autoDescription,
                            prompt: aiPrompt,
                            mode: useSceneAsBase ? "img2img" : "text2img",
                            resolution: resLabel,
                          };
                          useDesignStore.getState().addSavedRender(render);
                          useDesignStore.getState().saveToLocalStorage();
                          alert("Render saved to your presentation!");
                        };
                        reader.readAsDataURL(blob);
                      } catch {
                        alert("Failed to save render.");
                      }
                    }}
                    className="block w-full rounded-lg bg-brand-teal-800 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-brand-teal-700 transition-colors"
                  >
                    {"🎨 Save to Presentation"}
                  </button>

                  {/* Publish to public gallery — opt-in, contributes to the public /gallery */}
                  {aiImageUrl && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                        Share with community
                      </p>
                      <PublishWrapper
                        aiImageUrl={aiImageUrl}
                        engineId={aiUsedEngine || "unknown"}
                        promptExcerpt={aiPrompt || ""}
                        roomType={currentMod?.moduleType}
                        styleDirection={styleDirection || undefined}
                      />
                    </div>
                  )}

                  {/* Upscale & Remove BG buttons — premium features */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Enhance</p>
                    <button
                      onClick={async () => {
                        try {
                          const resp = await fetch(aiImageUrl);
                          const blob = await resp.blob();
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            const upRes = await fetch("/api/ai-render/upscale", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ image: base64, mode: "upscale" }),
                            });
                            if (!upRes.ok) { alert("Upscale failed. Try again later."); return; }
                            const upBlob = await upRes.blob();
                            const url = URL.createObjectURL(upBlob);
                            const a = document.createElement("a");
                            a.href = url; a.download = `modulca-upscaled-${Date.now()}.png`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          };
                          reader.readAsDataURL(blob);
                        } catch { alert("Upscale failed."); }
                      }}
                      className="block w-full rounded-lg border border-purple-300 px-4 py-2 text-center text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      {"🔍 Upscale (HD)"}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const resp = await fetch(aiImageUrl);
                          const blob = await resp.blob();
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            const bgRes = await fetch("/api/ai-render/upscale", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ image: base64, mode: "remove-bg" }),
                            });
                            if (!bgRes.ok) { alert("Background removal failed."); return; }
                            const bgBlob = await bgRes.blob();
                            const url = URL.createObjectURL(bgBlob);
                            const a = document.createElement("a");
                            a.href = url; a.download = `modulca-nobg-${Date.now()}.png`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          };
                          reader.readAsDataURL(blob);
                        } catch { alert("Background removal failed."); }
                      }}
                      className="block w-full rounded-lg border border-indigo-300 px-4 py-2 text-center text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      {"✂️ Remove Background"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Center */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
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
                      showPeople={atmosphere.people || includePeople}
                      onReady={handleSceneReady}
                    />
                  )}

                  {/* AI generated image (from blob URL) */}
                  {renderMode === "ai" && aiImageUrl && !aiLoading && (
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={aiImageUrl} alt="AI generated render" className="h-full w-full object-cover rounded-2xl" />
                    </div>
                  )}
                  {/* AI overlay: loading spinner, error, or initial prompt */}
                  {renderMode === "ai" && (aiLoading || aiError || !aiImageUrl) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                      {aiLoading ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-amber-500 border-t-transparent" />
                          <p className="text-sm font-medium text-brand-teal-800">
                            Generating with {aiEngine === "auto" ? "AI" : AI_ENGINES[aiEngine].label}...
                          </p>
                          <p className="text-xs text-gray-400">{aiElapsed}s elapsed — typically takes 30-90 seconds</p>
                          <p className="text-[10px] text-gray-300">Please wait — the AI is creating your image</p>
                        </div>
                      ) : aiError ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl max-w-sm">
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 uppercase tracking-wider">Error</span>
                          <p className="text-center text-sm text-gray-600">{aiError}</p>
                          <button onClick={handleGenerateAiRender} className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600">
                            Try Again
                          </button>
                          <p className="text-[10px] text-gray-400 text-center">Tip: try &quot;Draft&quot; resolution for faster results</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl">
                          <span className="rounded-full bg-brand-amber-100 px-3 py-1 text-xs font-bold text-brand-amber-700 uppercase tracking-wider">
                            {aiEngine === "auto" ? "AI Render" : AI_ENGINES[aiEngine].label}
                          </span>
                          <p className="text-center text-sm text-gray-600 max-w-xs">Click the generate button to create a photorealistic render</p>
                          <p className="text-xs text-gray-400">Free AI image generation — no account needed</p>
                        </div>
                      )}
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

              <RenderGallery
                pins={pins}
                styleLabel={style?.label || "Scandinavian Minimal"}
                moduleType={currentMod.moduleType}
                savedPins={savedPins}
                onTogglePin={handleTogglePin}
                camera={camera}
                onCameraChange={setCamera}
              />
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
                <div className="flex justify-between text-xs text-gray-600" suppressHydrationWarning>
                  <span>Module cost ({finishLevel})</span>
                  <span className="font-medium">&euro;{stats.moduleCost.toLocaleString()}</span>
                </div>
                {stats.sharedWallDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Shared wall discount</span>
                    <span className="font-medium">-&euro;{stats.sharedWallDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Design fee (8%)</span>
                  <span className="font-medium">&euro;{stats.designFee.toLocaleString()}</span>
                </div>
                <div className="mt-1 border-t border-gray-200 pt-1 flex justify-between text-sm font-bold text-brand-teal-800" suppressHydrationWarning>
                  <span>Total</span>
                  <span>&euro;{stats.totalEstimate.toLocaleString()}</span>
                </div>
              </div>

              <Link href={`/project/${projectId}/technical`}
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
              className={`absolute top-0 bottom-0 w-full max-w-xs bg-white shadow-xl overflow-y-auto ${
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
                          {(Object.keys(RENDER_RESOLUTIONS) as RenderResolution[]).map((r) => {
                            const locked = isResLocked(r);
                            return (
                              <button key={r} onClick={() => !locked && setRenderResolution(r)} disabled={locked}
                                className={`flex-1 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${locked ? "bg-gray-50 text-gray-300 cursor-not-allowed" : renderResolution === r ? "bg-brand-teal-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {RENDER_RESOLUTIONS[r].label}{locked ? " 🔒" : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Render Mode selector (mobile) */}
                      <div className="mb-3">
                        <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Render Mode</label>
                        <div className="grid grid-cols-3 gap-1">
                          <button onClick={() => setUseSceneAsBase(false)}
                            className={`rounded-lg px-2 py-2 text-center transition-colors ${!useSceneAsBase ? "bg-brand-teal-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <div className="text-[10px] font-bold">Text→Img</div>
                          </button>
                          <button onClick={() => setUseSceneAsBase(true)}
                            className={`rounded-lg px-2 py-2 text-center transition-colors ${useSceneAsBase ? "bg-brand-teal-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                            <div className="text-[10px] font-bold">3D+Text→Img</div>
                          </button>
                          <button disabled className="rounded-lg px-2 py-2 text-center bg-gray-50 text-gray-300 cursor-not-allowed">
                            <div className="text-[10px] font-bold">Img→Img</div>
                          </button>
                        </div>
                      </div>
                      {/* AI Engine selector (mobile) */}
                      <div className="mb-3">
                        <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">AI Engine</label>
                        <select value={aiEngine} onChange={(e) => setAiEngine(e.target.value as AiEngine)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none">
                          {(Object.keys(AI_ENGINES) as AiEngine[]).map((key) => (
                            <option key={key} value={key}>{AI_ENGINES[key].label}</option>
                          ))}
                        </select>
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
                        {aiLoading ? `Generating... ${aiElapsed}s` : `Generate with ${aiEngine === "auto" ? "AI" : AI_ENGINES[aiEngine].label}`}
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
                        <div className="mt-1 flex justify-between text-sm font-bold text-brand-teal-800" suppressHydrationWarning>
                          <span>Total</span>
                          <span>&euro;{stats.totalEstimate.toLocaleString()}</span>
                        </div>
                      </div>
                      <Link href={`/project/${projectId}/technical`}
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
      <MobileStepFooter activeStep={7} />
    </div>
  );
}

/**
 * PublishWrapper — converts an AI image URL (or blob URL) to a data URL
 * required by /api/renders/publish, then delegates to PublishButton.
 * Kept inline because it's specific to the render-step integration.
 */
function PublishWrapper(props: {
  aiImageUrl: string;
  engineId: string;
  promptExcerpt: string;
  roomType?: string;
  styleDirection?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Convert URL → data URL (PublishButton needs base64 payload)
    fetch(props.aiImageUrl)
      .then((r) => r.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        /* ignore — PublishButton will show disabled state */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [props.aiImageUrl]);

  if (loading || !dataUrl) {
    return (
      <p className="text-[10px] text-gray-400 italic">
        {loading ? "Preparing image..." : "Image unavailable"}
      </p>
    );
  }

  return (
    <PublishButton
      imageDataUrl={dataUrl}
      engineId={props.engineId}
      promptExcerpt={props.promptExcerpt}
      roomType={props.roomType}
      styleDirection={props.styleDirection}
      showPrice
      size="sm"
    />
  );
}
