"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { getStyleDirection } from "@/features/design/styles";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "@/features/design/layouts";
import StepNav from "@/features/design/components/shared/StepNav";
import { useAuthStore } from "@/features/auth/store";

const PdfDownloadButton = lazy(() => import("./PdfGenerator"));

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

export type PresentationStyle = "brochure" | "portfolio";

export type SlideId =
  | "cover" | "overview" | "site" | "floorplan"
  | "renders" | "vision" | "technical" | "modules"
  | "products" | "cost" | "contact";

export interface SlideConfig {
  id: SlideId;
  label: string;
  description: string;
  enabled: boolean;
}

export const PRES_STYLES: Record<PresentationStyle, {
  label: string; tagline: string; accent: string;
  bg: string; text: string; secondary: string;
}> = {
  brochure: {
    label: "Modern Real Estate Brochure",
    tagline: "Luxurious · Image-first · Aspirational",
    accent: "#C8956C",
    bg: "#FFFFFF",
    text: "#1A1A1A",
    secondary: "#F5F2EE",
  },
  portfolio: {
    label: "Technical Architecture Portfolio",
    tagline: "Precise · Structured · Professional",
    accent: "#2D5A52",
    bg: "#F8F6F2",
    text: "#2A2A2A",
    secondary: "#ECEAE4",
  },
};

const DEFAULT_SLIDES: SlideConfig[] = [
  { id: "cover",     label: "Cover Page",           description: "Hero render, project name, key stats", enabled: true },
  { id: "overview",  label: "Project Overview",      description: "Module breakdown, area, brief summary", enabled: true },
  { id: "site",      label: "Location & Site",       description: "Site plan, coordinates, terrain data", enabled: true },
  { id: "floorplan", label: "Floor Plan",             description: "Color-coded layout with dimensions", enabled: true },
  { id: "renders",   label: "AI Renders",             description: "Full-page photorealistic visualizations", enabled: true },
  { id: "vision",    label: "Style & Materials",      description: "Design direction, palette, finishes", enabled: true },
  { id: "technical", label: "Technical Drawing",      description: "Elevation view, dimensions, openings", enabled: true },
  { id: "modules",   label: "Module Details",         description: "Per-room specs, furniture, materials", enabled: true },
  { id: "products",  label: "Product Selections",     description: "Selected items with quantities and prices", enabled: true },
  { id: "cost",      label: "Specifications & Cost",  description: "Full cost breakdown and key specs", enabled: true },
  { id: "contact",   label: "Contact & Back Page",    description: "QR code, social media, ModulCA branding", enabled: true },
];

const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  "fin-01": { name: "Engineered Oak Flooring", price: 42 },
  "fin-02": { name: "Gypsum Wall Panels", price: 18 },
  "fin-03": { name: "XPS Underfloor Insulation", price: 12 },
  "fin-04": { name: "Triple-Glazed Window Unit", price: 385 },
  "fin-05": { name: "Interior Flush Door", price: 145 },
  "fin-06": { name: "Mineral Wool Insulation Roll", price: 8 },
  "fin-07": { name: "Interior Wall Paint", price: 35 },
  "fin-08": { name: "Porcelain Floor Tiles", price: 28 },
  "fur-01": { name: "Modular Sofa 3-Seat", price: 1290 },
  "fur-02": { name: "Wool Area Rug 200×300", price: 420 },
  "fur-03": { name: "Blackout Curtain Pair", price: 95 },
  "fur-04": { name: "Ceramic Vase Collection", price: 65 },
  "fur-05": { name: "Wall-Mounted Shelving Unit", price: 280 },
  "fur-06": { name: "Pendant Light Fixture", price: 175 },
  "fur-07": { name: "Round Wall Mirror", price: 210 },
  "fur-08": { name: "Upholstered Dining Chair", price: 195 },
  "plm-01": { name: "Freestanding Bathtub", price: 890 },
  "plm-02": { name: "Single-Lever Basin Faucet", price: 125 },
  "plm-03": { name: "Ceramic Countertop Sink", price: 185 },
  "plm-04": { name: "Wall-Hung Toilet", price: 320 },
  "plm-05": { name: "Thermostatic Shower Set", price: 295 },
  "plm-06": { name: "Flush-Mount Outlet Pack", price: 48 },
  "plm-07": { name: "Modular Light Switch Set", price: 36 },
  "plm-08": { name: "LED Ceiling Downlight Pack", price: 85 },
  "plm-09": { name: "Electric Water Heater 80 L", price: 340 },
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PresentationPage() {
  const { gridCells, gridRotation, polygon, mapCenter } = useLandStore();
  const {
    modules, setModulesFromGrid, styleDirection, finishLevel, getStats,
    moodboardPins, savedRenders, loadFromLocalStorage,
  } = useDesignStore();

  const userTier = useAuthStore((s) => s.userTier);
  const [presStyle, setPresStyle] = useState<PresentationStyle>("brochure");
  const [slides, setSlides] = useState<SlideConfig[]>(DEFAULT_SLIDES);
  const [projectName, setProjectName] = useState("My Modular Home");
  const [clientName, setClientName] = useState("");
  const [activeSlide, setActiveSlide] = useState<SlideId>("cover");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Hydrate modules from store / localStorage
  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  // Generate QR code (changes color with style)
  useEffect(() => {
    import("qrcode").then((QRCode) => {
      const accent = PRES_STYLES[presStyle].accent;
      QRCode.toDataURL("https://tcsn161.github.io/modulca", {
        width: 200,
        margin: 1,
        color: { dark: accent, light: "#FFFFFF" },
      }).then(setQrCodeDataUrl).catch(console.error);
    });
  }, [presStyle]);

  const stats = getStats();
  const style = styleDirection ? getStyleDirection(styleDirection) : null;
  const tmpl = PRES_STYLES[presStyle];
  const finishInfo = FINISH_LEVELS.find((f) => f.id === finishLevel);
  const enabledSlides = slides.filter((s) => s.enabled);

  const [products, setProducts] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("modulca-selected-products");
      if (raw) {
        const items: { id: string; quantity: number }[] = JSON.parse(raw);
        setProducts(
          items.map((item) => {
            const p = PRODUCT_CATALOG[item.id];
            return p ? { id: item.id, name: p.name, quantity: item.quantity, price: p.price } : null;
          }).filter((x): x is { id: string; name: string; quantity: number; price: number } => x !== null)
        );
      }
    } catch { /* ignore */ }
  }, []);

  const toggleSlide = useCallback((id: SlideId) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }, []);

  const handleShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Presentation link copied to clipboard!");
  }, []);

  const heroRender = savedRenders[0] ?? null;

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
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 print:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={12} />
        <div className="flex items-center gap-2">
          <button onClick={handleShareLink} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Copy Link
          </button>
          <Suspense fallback={
            <button className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white opacity-50">
              Loading PDF…
            </button>
          }>
            <PdfDownloadButton
              presentationStyle={presStyle}
              slides={slides}
              projectName={projectName}
              clientName={clientName}
              modules={modules}
              stats={stats}
              style={style ?? null}
              finishLabel={finishInfo?.label || "Standard"}
              polygon={polygon}
              mapCenter={mapCenter}
              savedRenders={savedRenders}
              qrCodeDataUrl={qrCodeDataUrl}
              isFreeUser={userTier === "free"}
            />
          </Suspense>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 print:hidden md:block">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Presentation Settings
          </h3>

          <div className="mb-4 space-y-2">
            <label className="block text-[10px] font-bold uppercase text-gray-400">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          <div className="mb-5 space-y-2">
            <label className="block text-[10px] font-bold uppercase text-gray-400">Client Name (optional)</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Your name or company"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          {/* Style selector */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Presentation Style
            </label>
            <div className="space-y-2">
              {(Object.entries(PRES_STYLES) as [PresentationStyle, typeof PRES_STYLES.brochure][]).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setPresStyle(key)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                    presStyle === key
                      ? "border-brand-amber-500 bg-brand-amber-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-7 w-7 flex-shrink-0 rounded-lg border border-gray-200"
                      style={{ background: `linear-gradient(135deg, ${s.bg} 45%, ${s.accent} 45%)` }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{s.label}</div>
                      <div className="text-[9px] text-gray-400">{s.tagline}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slide toggles */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Slides ({enabledSlides.length}/{slides.length})
            </label>
            <div className="space-y-1">
              {slides.map((slide) => (
                <label
                  key={slide.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <div>
                    <span className="text-xs font-medium text-gray-700">{slide.label}</span>
                    <p className="text-[9px] text-gray-400">{slide.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={slide.enabled}
                    onClick={() => toggleSlide(slide.id)}
                    className={`relative ml-2 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                      slide.enabled ? "bg-brand-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${slide.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <Link href="/project/demo/finalize" className="block text-center text-sm text-gray-400 hover:text-brand-teal-800">
            ← Back to Finalize
          </Link>
        </aside>

        {/* Center — Slide Preview */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Tab bar */}
          <div className="mb-4 flex items-center gap-1 overflow-x-auto print:hidden">
            {enabledSlides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeSlide === slide.id
                    ? "bg-brand-teal-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}. {slide.label}
              </button>
            ))}
          </div>

          {/* Slide area */}
          <div className="mx-auto" style={{ maxWidth: 900 }}>

            {/* COVER */}
            {activeSlide === "cover" && slides.find((s) => s.id === "cover")?.enabled && (
              <SlideCard bg={heroRender ? "transparent" : tmpl.bg} text={heroRender ? "#FFFFFF" : tmpl.text} accent={tmpl.accent} fullBleed={!!heroRender}>
                {heroRender && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroRender.imageUrl} alt="Hero render" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                  </div>
                )}
                <div className={`relative flex flex-col justify-center min-h-[500px] ${heroRender ? "p-10" : "items-center text-center"}`}>
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: tmpl.accent }}>
                    ModulCA Project Presentation
                  </div>
                  <div className="mb-2 h-0.5 w-16" style={{ backgroundColor: tmpl.accent }} />
                  <h1 className="text-4xl font-bold mb-3" style={{ color: heroRender ? "#FFFFFF" : tmpl.text }}>
                    {projectName}
                  </h1>
                  {clientName && (
                    <p className="text-lg mb-2" style={{ color: heroRender ? "rgba(255,255,255,0.75)" : tmpl.text, opacity: heroRender ? 1 : 0.65 }}>
                      Prepared for {clientName}
                    </p>
                  )}
                  <p className="text-sm mb-8" style={{ color: heroRender ? "rgba(255,255,255,0.55)" : tmpl.text, opacity: heroRender ? 1 : 0.4 }}>
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <div className={`flex gap-8 text-sm ${heroRender ? "" : "justify-center"}`} style={{ color: heroRender ? "#FFFFFF" : tmpl.text }}>
                    <StatChip value={`${modules.length}`} label="Modules" accent={tmpl.accent} dark={!!heroRender} />
                    <StatChip value={`${stats.totalArea}m²`} label="Total Area" accent={tmpl.accent} dark={!!heroRender} />
                    <StatChip value={`EUR ${Math.round(stats.totalEstimate / 1000)}k`} label="Estimate" accent={tmpl.accent} dark={!!heroRender} />
                    <StatChip value={style?.label || "Modern"} label="Style" accent={tmpl.accent} dark={!!heroRender} />
                  </div>
                </div>
              </SlideCard>
            )}

            {/* OVERVIEW */}
            {activeSlide === "overview" && slides.find((s) => s.id === "overview")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={2} title="Project Overview" />
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-4 text-sm leading-relaxed" style={{ color: tmpl.text, opacity: 0.65 }}>
                      {style
                        ? `A ${style.label.toLowerCase()} home designed around ${modules.length} modular unit${modules.length !== 1 ? "s" : ""}. ${style.description}`
                        : `A modular home comprising ${modules.length} units, totalling ${stats.totalArea}m² of built area with ${stats.usableArea}m² usable living space.`}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Modules", value: `${stats.totalModules}` },
                        { label: "Built Area", value: `${stats.totalArea} m²` },
                        { label: "Usable Area", value: `${stats.usableArea} m²` },
                        { label: "Finish Level", value: finishInfo?.label || "Standard" },
                        { label: "Shared Walls", value: `${stats.sharedWalls}` },
                        { label: "AI Renders", value: `${savedRenders.length}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-3" style={{ backgroundColor: tmpl.secondary }}>
                          <div className="text-[10px] uppercase tracking-wider" style={{ color: tmpl.text, opacity: 0.4 }}>{label}</div>
                          <div className="text-lg font-bold mt-1" style={{ color: tmpl.accent }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>
                      Module Breakdown
                    </p>
                    <div className="space-y-2">
                      {Array.from(new Set(modules.map((m) => m.moduleType))).map((type) => {
                        const mt = MODULE_TYPES.find((m) => m.id === type);
                        const count = modules.filter((m) => m.moduleType === type).length;
                        const pct = Math.round((count / modules.length) * 100);
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-xs mb-1" style={{ color: tmpl.text }}>
                              <span className="flex items-center gap-2">
                                <span className="text-sm">{mt?.icon}</span>
                                {mt?.label}
                              </span>
                              <span className="font-semibold">{count} × {pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: tmpl.secondary }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: mt?.color || tmpl.accent }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </SlideCard>
            )}

            {/* SITE */}
            {activeSlide === "site" && slides.find((s) => s.id === "site")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={3} title="Location & Site" />
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div className="rounded-xl overflow-hidden border aspect-video flex items-center justify-center p-4"
                    style={{ backgroundColor: presStyle === "portfolio" ? "#E8F4EF" : "#F0FDF4", borderColor: tmpl.accent + "30" }}>
                    <SitePlanSvg modules={modules} accent={tmpl.accent} presStyle={presStyle} />
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Coordinates", value: mapCenter.lat !== 44.4268 ? `${mapCenter.lat.toFixed(5)}°N, ${mapCenter.lng.toFixed(5)}°E` : "Romania (default location)" },
                      { label: "Polygon Points", value: polygon.length > 0 ? `${polygon.length} vertices` : "Auto-generated boundary" },
                      { label: "Building Footprint", value: `${Math.ceil(Math.sqrt(stats.totalArea * 2))}m × ${Math.ceil(Math.sqrt(stats.totalArea * 2))}m (approx.)` },
                      { label: "Built Area", value: `${stats.totalArea} m²` },
                      { label: "Usable Area", value: `${stats.usableArea} m²` },
                      { label: "Grid Rotation", value: `${gridRotation}°` },
                    ].map(({ label, value }) => (
                      <DetailRow key={label} label={label} value={value} text={tmpl.text} />
                    ))}
                  </div>
                </div>
              </SlideCard>
            )}

            {/* FLOOR PLAN */}
            {activeSlide === "floorplan" && slides.find((s) => s.id === "floorplan")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={4} title="Floor Plan" />
                <div className="mt-4 flex justify-center">
                  <FloorPlanGrid modules={modules} tmpl={tmpl} />
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {Array.from(new Set(modules.map((m) => m.moduleType))).map((type) => {
                    const mt = MODULE_TYPES.find((m) => m.id === type);
                    const count = modules.filter((m) => m.moduleType === type).length;
                    return (
                      <div key={type} className="flex items-center gap-2 text-xs" style={{ color: tmpl.text }}>
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: mt?.color }} />
                        <span>{mt?.label} ×{count} (9m²)</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-center text-[10px]" style={{ color: tmpl.text, opacity: 0.35 }}>
                  Scale: each cell = 3m × 3m · Total footprint:{" "}
                  {(Math.max(...modules.map((m) => m.col)) - Math.min(...modules.map((m) => m.col)) + 1) * 3}m ×{" "}
                  {(Math.max(...modules.map((m) => m.row)) - Math.min(...modules.map((m) => m.row)) + 1) * 3}m
                </p>
              </SlideCard>
            )}

            {/* AI RENDERS */}
            {activeSlide === "renders" && slides.find((s) => s.id === "renders")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={5} title="AI Renders" />
                {savedRenders.length > 0 ? (
                  <div className={`mt-4 ${presStyle === "brochure" ? "space-y-4" : "grid grid-cols-2 gap-4"}`}>
                    {savedRenders.map((render) => (
                      <div key={render.id} className="rounded-xl overflow-hidden border" style={{ borderColor: tmpl.accent + "20" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={render.imageUrl}
                          alt={render.label}
                          className={`w-full object-cover ${presStyle === "brochure" ? "aspect-video" : "aspect-video"}`}
                        />
                        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: tmpl.secondary }}>
                          <p className="text-xs font-medium" style={{ color: tmpl.text }}>{render.label}</p>
                          <p className="text-[10px] rounded px-1.5 py-0.5 font-mono" style={{ backgroundColor: tmpl.accent + "20", color: tmpl.accent }}>{render.engine}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-center justify-center py-16">
                    <div className="h-24 w-24 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: tmpl.secondary }}>
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: tmpl.accent, opacity: 0.4 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M21 21V7.5M3 21V7.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: tmpl.text, opacity: 0.5 }}>No AI renders saved yet</p>
                    <p className="mt-1 text-xs" style={{ color: tmpl.text, opacity: 0.3 }}>
                      Generate renders in Step 8 and click &ldquo;Save to Presentation&rdquo;
                    </p>
                  </div>
                )}
              </SlideCard>
            )}

            {/* STYLE & MATERIALS */}
            {activeSlide === "vision" && slides.find((s) => s.id === "vision")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={6} title="Style & Materials" />
                <div className="mt-6 grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xl font-bold mb-1" style={{ color: tmpl.text }}>{style?.label || "Modern Design"}</h3>
                    <p className="text-xs italic mb-4" style={{ color: tmpl.accent }}>{style?.tagline}</p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: tmpl.text, opacity: 0.6 }}>
                      {style?.description || "A carefully curated design direction balancing aesthetics with functionality."}
                    </p>
                    {style?.palette && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>Color Palette</p>
                        <div className="flex gap-2 mb-5">
                          {style.palette.map((swatch, i) => (
                            <div key={i} className="text-center">
                              <div className="h-12 w-12 rounded-xl border shadow-sm" style={{ backgroundColor: swatch.color, borderColor: tmpl.text + "15" }} />
                              <span className="text-[8px] mt-1 block" style={{ color: tmpl.text, opacity: 0.4 }}>{swatch.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Floor Materials", items: Array.from(new Set(modules.map((m) => m.floorFinish))).map((id) => FLOOR_MATERIALS.find((f) => f.id === id)) },
                        { label: "Wall Finishes", items: Array.from(new Set(modules.map((m) => m.wallColor))).map((id) => WALL_MATERIALS.find((w) => w.id === id)) },
                      ].map(({ label, items }) => (
                        <div key={label}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>{label}</p>
                          {items.filter(Boolean).map((mat, i) => mat && (
                            <div key={i} className="flex items-center gap-2 mb-1.5">
                              <div className="h-5 w-5 rounded border" style={{ backgroundColor: mat.color, borderColor: tmpl.text + "20" }} />
                              <span className="text-xs" style={{ color: tmpl.text }}>{mat.label}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>Mood Board</p>
                    <div className="space-y-2">
                      {(moodboardPins.length > 0 ? moodboardPins.slice(0, 4) : style?.moodImages?.slice(0, 4) ?? []).map((pin, i) => {
                        const imgSrc = "imageUrl" in pin ? pin.imageUrl : pin.url;
                        const imgAlt = "label" in pin ? pin.label : `Mood ${i + 1}`;
                        return (
                          <div key={i} className="rounded-xl overflow-hidden aspect-video" style={{ backgroundColor: tmpl.secondary }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgSrc} alt={imgAlt} className="h-full w-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 inline-block rounded-lg px-3 py-2" style={{ backgroundColor: tmpl.accent + "15" }}>
                      <span className="text-xs font-semibold" style={{ color: tmpl.accent }}>{finishInfo?.label || "Standard"} Finish Level</span>
                    </div>
                  </div>
                </div>
              </SlideCard>
            )}

            {/* TECHNICAL DRAWING */}
            {activeSlide === "technical" && slides.find((s) => s.id === "technical")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={7} title="Technical Drawing" />
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>
                      Front Elevation (South Face)
                    </p>
                    <ElevationSvg modules={modules} accent={tmpl.accent} text={tmpl.text} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>
                      Technical Specifications
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Module Size (ext.)", value: "3.0m × 3.0m × 3.0m" },
                        { label: "Interior Clear Height", value: "2.7m" },
                        { label: "Wall Thickness", value: "0.30m (insulated)" },
                        { label: "Floor Assembly", value: "0.15m (structure + finish)" },
                        { label: "Window Type", value: "Triple-glazed, low-E" },
                        { label: "Structure", value: "Light steel frame" },
                        { label: "Foundation", value: "Concrete slab or piles" },
                        { label: "Assembly Time", value: "~2–5 days on site" },
                      ].map(({ label, value }) => (
                        <DetailRow key={label} label={label} value={value} text={tmpl.text} />
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg p-3 text-xs" style={{ backgroundColor: tmpl.secondary, color: tmpl.text }}>
                      <p className="font-semibold mb-1" style={{ color: tmpl.accent }}>Standard Compliance</p>
                      <p style={{ opacity: 0.6 }}>EN 13501 fire · ISO 140 acoustic · EN 12831 thermal</p>
                    </div>
                  </div>
                </div>
              </SlideCard>
            )}

            {/* MODULE DETAILS */}
            {activeSlide === "modules" && slides.find((s) => s.id === "modules")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={8} title="Module Details" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {modules.map((mod) => {
                    const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
                    const preset = getPreset(mod.moduleType, mod.layoutPreset) || getPresetsForType(mod.moduleType)[0];
                    const floor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
                    const wall = WALL_MATERIALS.find((w) => w.id === mod.wallColor);
                    return (
                      <div key={`${mod.row}-${mod.col}`} className="rounded-xl p-4" style={{ backgroundColor: tmpl.secondary }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: mt?.color }} />
                          <span className="text-sm font-bold" style={{ color: tmpl.text }}>{mod.label}</span>
                          <span className="text-[10px] ml-auto" style={{ color: tmpl.text, opacity: 0.4 }}>{mt?.label}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: tmpl.text }}>
                          <div>
                            <div className="opacity-40 mb-1">Floor</div>
                            <div className="flex items-center gap-1">
                              <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: floor?.color }} />
                              <span className="truncate">{floor?.label}</span>
                            </div>
                          </div>
                          <div>
                            <div className="opacity-40 mb-1">Walls</div>
                            <div className="flex items-center gap-1">
                              <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: wall?.color }} />
                              <span className="truncate">{wall?.label}</span>
                            </div>
                          </div>
                          <div>
                            <div className="opacity-40 mb-1">Layout</div>
                            <span className="truncate">{preset?.label || "Default"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SlideCard>
            )}

            {/* PRODUCTS */}
            {activeSlide === "products" && slides.find((s) => s.id === "products")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={9} title="Product Selections" />
                {products.length > 0 ? (
                  <div className="mt-4">
                    <div className="space-y-2">
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl p-3" style={{ backgroundColor: tmpl.secondary }}>
                          <div>
                            <span className="text-sm font-medium" style={{ color: tmpl.text }}>{p.name}</span>
                            <span className="block text-[10px] mt-0.5" style={{ color: tmpl.text, opacity: 0.4 }}>
                              {p.quantity} × EUR {p.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
                            EUR {(p.quantity * p.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between rounded-xl p-4" style={{ backgroundColor: tmpl.accent + "15" }}>
                      <span className="text-sm font-bold" style={{ color: tmpl.text }}>Products Total</span>
                      <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
                        EUR {products.reduce((sum, p) => sum + p.quantity * p.price, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 py-16 text-center">
                    <p className="text-sm" style={{ color: tmpl.text, opacity: 0.4 }}>
                      No products selected yet. Add items in Step 11 (Products).
                    </p>
                  </div>
                )}
              </SlideCard>
            )}

            {/* COST & SPECS */}
            {activeSlide === "cost" && slides.find((s) => s.id === "cost")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={10} title="Specifications & Cost" />
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>Cost Breakdown</p>
                    <div className="space-y-2">
                      <CostRow label={`${stats.totalModules} modules (${finishInfo?.label})`} value={`EUR ${stats.moduleCost.toLocaleString()}`} text={tmpl.text} />
                      {stats.sharedWallDiscount > 0 && (
                        <CostRow label={`Shared wall discount (×${stats.sharedWalls})`} value={`-EUR ${stats.sharedWallDiscount.toLocaleString()}`} text={tmpl.text} green />
                      )}
                      {stats.wallUpgradeCost !== 0 && (
                        <CostRow label="Wall upgrades (windows/doors)" value={`EUR ${stats.wallUpgradeCost.toLocaleString()}`} text={tmpl.text} />
                      )}
                      <CostRow label="Design fee (8%)" value={`EUR ${Math.round(stats.designFee).toLocaleString()}`} text={tmpl.text} />
                      {products.length > 0 && (
                        <CostRow label="Products" value={`EUR ${products.reduce((sum, p) => sum + p.quantity * p.price, 0).toLocaleString()}`} text={tmpl.text} />
                      )}
                      <div className="border-t pt-3" style={{ borderColor: tmpl.accent }}>
                        <div className="flex justify-between">
                          <span className="text-base font-bold" style={{ color: tmpl.text }}>Total Estimate</span>
                          <span className="text-base font-bold" style={{ color: tmpl.accent }}>
                            EUR {Math.round(stats.totalEstimate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>Key Specifications</p>
                    <div className="space-y-2">
                      {[
                        { label: "Total Modules", value: `${stats.totalModules} × 9m² units` },
                        { label: "Gross Built Area", value: `${stats.totalArea} m²` },
                        { label: "Net Usable Area", value: `${stats.usableArea} m²` },
                        { label: "Finish Level", value: finishInfo?.label || "Standard" },
                        { label: "Design Style", value: style?.label || "Not selected" },
                        { label: "Construction Type", value: "Off-site modular (steel frame)" },
                        { label: "Estimated Build Time", value: "8–14 weeks total" },
                        { label: "Estimated On-site", value: "2–5 days assembly" },
                      ].map(({ label, value }) => (
                        <DetailRow key={label} label={label} value={value} text={tmpl.text} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-center" style={{ color: tmpl.text, opacity: 0.3 }}>
                  * Estimate based on {finishInfo?.label || "Standard"} finish. Final price subject to site conditions and builder quotes.
                </p>
              </SlideCard>
            )}

            {/* CONTACT */}
            {activeSlide === "contact" && slides.find((s) => s.id === "contact")?.enabled && (
              <SlideCard bg={presStyle === "brochure" ? "#1A1209" : "#1C2B2A"} text="#FFFFFF" accent={tmpl.accent}>
                <div className="flex flex-col items-center justify-center min-h-[500px] text-center py-10">
                  <div className="mb-2 text-3xl font-bold text-white">
                    Modul<span style={{ color: tmpl.accent }}>CA</span>
                  </div>
                  <div className="mb-1 text-xs uppercase tracking-[0.2em] text-white opacity-50">Modular Construction Platform</div>
                  <div className="my-6 h-px w-24" style={{ backgroundColor: tmpl.accent }} />
                  {qrCodeDataUrl ? (
                    <div className="mb-6 rounded-2xl p-3 shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeDataUrl} alt="QR Code" className="h-28 w-28" />
                    </div>
                  ) : (
                    <div className="mb-6 h-28 w-28 rounded-2xl bg-white/10 animate-pulse" />
                  )}
                  <p className="text-sm text-white mb-1" style={{ opacity: 0.7 }}>tcsn161.github.io/modulca</p>
                  <p className="text-xs text-white mb-8" style={{ opacity: 0.4 }}>Scan to explore ModulCA</p>
                  <div className="flex gap-4 mb-6">
                    {[
                      { icon: "in", color: "#0077B5", name: "LinkedIn" },
                      { icon: "f", color: "#1877F2", name: "Facebook" },
                      { icon: "ig", color: "#E4405F", name: "Instagram" },
                      { icon: "▶", color: "#FF0000", name: "YouTube" },
                    ].map((social) => (
                      <div key={social.name} className="flex flex-col items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: social.color }}>
                          {social.icon}
                        </div>
                        <span className="text-[9px] text-white opacity-40">{social.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white opacity-20">
                    Designed with ModulCA · {new Date().getFullYear()} · All rights reserved
                  </p>
                </div>
              </SlideCard>
            )}

          </div>
        </main>

        {/* Right Sidebar — Slide Navigator */}
        <aside className="w-52 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4 print:hidden">
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Slides</h3>
          <div className="space-y-1">
            {enabledSlides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                  activeSlide === slide.id
                    ? "border-brand-amber-300 bg-brand-amber-50"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">{i + 1}</span>
                  <span className={`truncate text-xs ${activeSlide === slide.id ? "font-semibold text-brand-teal-800" : "text-gray-600"}`}>
                    {slide.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl p-3" style={{ backgroundColor: "#F5F2EE" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Quick Stats</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Modules</span><span className="font-medium">{modules.length}</span></div>
              <div className="flex justify-between"><span>Area</span><span className="font-medium">{stats.totalArea}m²</span></div>
              <div className="flex justify-between"><span>Renders</span><span className="font-medium">{savedRenders.length}</span></div>
              <div className="flex justify-between"><span>Total</span>
                <span className="font-bold text-brand-amber-600">EUR {Math.round(stats.totalEstimate / 1000)}k</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: tmpl.accent + "15" }}>
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-1">Style</p>
            <p className="text-[10px] font-semibold" style={{ color: tmpl.accent }}>
              {PRES_STYLES[presStyle].label.split(" ").slice(0, 2).join(" ")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function SlideCard({
  bg, text, fullBleed, children,
}: {
  bg: string; text: string; accent?: string; fullBleed?: boolean; children: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-2xl shadow-lg mb-6 print:shadow-none print:rounded-none print:mb-0 print:break-after-page ${fullBleed ? "p-0" : "p-8"}`}
      style={{ backgroundColor: bg, color: text, minHeight: 500 }}
    >
      {children}
    </div>
  );
}

function SlideHeader({ accent, text, number, title }: { accent: string; text: string; number: number; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: accent }}>
        {number}
      </div>
      <h2 className="text-2xl font-bold" style={{ color: text }}>{title}</h2>
      <div className="h-px flex-1" style={{ backgroundColor: text + "18" }} />
    </div>
  );
}

function StatChip({ value, label, accent, dark }: { value: string; label: string; accent: string; dark: boolean }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color: dark ? "#FFFFFF" : accent }}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider" style={{ color: dark ? "rgba(255,255,255,0.5)" : accent, opacity: dark ? 1 : 0.7 }}>{label}</div>
    </div>
  );
}

function DetailRow({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm" style={{ borderColor: text + "12" }}>
      <span style={{ color: text, opacity: 0.5 }}>{label}</span>
      <span className="font-medium" style={{ color: text }}>{value}</span>
    </div>
  );
}

function CostRow({ label, value, text, green }: { label: string; value: string; text: string; green?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b text-sm" style={{ borderColor: text + "12" }}>
      <span style={{ color: text, opacity: 0.6 }}>{label}</span>
      <span className={`font-medium ${green ? "text-emerald-600" : ""}`} style={green ? {} : { color: text }}>{value}</span>
    </div>
  );
}

function FloorPlanGrid({ modules, tmpl }: {
  modules: { row: number; col: number; moduleType: string; label: string }[];
  tmpl: { bg: string; text: string; accent: string; secondary: string };
}) {
  if (modules.length === 0) return null;
  const minR = Math.min(...modules.map((m) => m.row));
  const maxR = Math.max(...modules.map((m) => m.row));
  const minC = Math.min(...modules.map((m) => m.col));
  const maxC = Math.max(...modules.map((m) => m.col));
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  return (
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 76px)`, gridTemplateRows: `repeat(${rows}, 76px)` }}>
      {modules.map((mod) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        return (
          <div
            key={`${mod.row}-${mod.col}`}
            className="rounded-lg border-2 flex flex-col items-center justify-center text-center p-1"
            style={{
              gridColumn: mod.col - minC + 1,
              gridRow: mod.row - minR + 1,
              backgroundColor: (mt?.color || "#ccc") + "25",
              borderColor: mt?.color || "#ccc",
            }}
          >
            <div className="text-sm">{mt?.icon}</div>
            <div className="text-[9px] font-bold mt-0.5" style={{ color: tmpl.text }}>{mod.label}</div>
            <div className="text-[8px] opacity-40" style={{ color: tmpl.text }}>3×3m</div>
          </div>
        );
      })}
    </div>
  );
}

function SitePlanSvg({
  modules, accent, presStyle,
}: {
  modules: { row: number; col: number; moduleType: string; label: string }[];
  accent: string;
  presStyle: PresentationStyle;
}) {
  if (modules.length === 0) return null;
  const minR = Math.min(...modules.map((m) => m.row));
  const maxR = Math.max(...modules.map((m) => m.row));
  const minC = Math.min(...modules.map((m) => m.col));
  const maxC = Math.max(...modules.map((m) => m.col));
  const cols = maxC - minC + 1;
  const rows = maxR - minR + 1;
  const cellPx = 38;
  const pad = 52;
  const svgW = cols * cellPx + pad * 2;
  const svgH = rows * cellPx + pad * 2;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" style={{ maxHeight: 220 }}>
      {/* Terrain boundary */}
      <rect x={10} y={10} width={svgW - 20} height={svgH - 20} rx={6}
        fill={presStyle === "portfolio" ? "#D4EAE4" : "#D1FAE5"} stroke={accent} strokeWidth={1.5} strokeDasharray="6,3" />
      <text x={svgW / 2} y={22} textAnchor="middle" fontSize={7} fill={accent} fontFamily="sans-serif" fontWeight="bold">SITE BOUNDARY</text>

      {/* North arrow */}
      <g transform={`translate(${svgW - 22}, 22)`}>
        <circle cx={0} cy={0} r={10} fill="none" stroke={accent} strokeWidth={1} />
        <polygon points="0,-8 3,2 0,0 -3,2" fill={accent} />
        <text x={0} y={6} textAnchor="middle" fontSize={7} fill={accent} fontFamily="sans-serif" fontWeight="bold">N</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(${pad}, ${svgH - 14})`}>
        <line x1={0} y1={0} x2={cellPx} y2={0} stroke="#555" strokeWidth={1.5} />
        <line x1={0} y1={-3} x2={0} y2={3} stroke="#555" strokeWidth={1} />
        <line x1={cellPx} y1={-3} x2={cellPx} y2={3} stroke="#555" strokeWidth={1} />
        <text x={cellPx / 2} y={-4} textAnchor="middle" fontSize={6} fill="#555" fontFamily="sans-serif">3m</text>
      </g>

      {/* Module cells */}
      {modules.map((mod) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        const x = pad + (mod.col - minC) * cellPx;
        const y = pad + (mod.row - minR) * cellPx;
        return (
          <g key={`${mod.row}-${mod.col}`}>
            <rect x={x + 1} y={y + 1} width={cellPx - 2} height={cellPx - 2} rx={3}
              fill={mt?.color || "#ccc"} fillOpacity={0.75} stroke={accent} strokeWidth={1.5} />
            <text x={x + cellPx / 2} y={y + cellPx / 2 - 3} textAnchor="middle" fontSize={7} fill="#111" fontWeight="bold" fontFamily="sans-serif">
              {mod.label}
            </text>
            <text x={x + cellPx / 2} y={y + cellPx / 2 + 6} textAnchor="middle" fontSize={5} fill="#444" fontFamily="sans-serif">
              {mt?.icon}
            </text>
          </g>
        );
      })}

      {/* Dimensions */}
      <text x={pad + (cols * cellPx) / 2} y={svgH - 3} textAnchor="middle" fontSize={7} fill="#555" fontFamily="sans-serif">
        {cols * 3}m × {rows * 3}m
      </text>
    </svg>
  );
}

function ElevationSvg({
  modules, accent, text,
}: {
  modules: { row: number; col: number; moduleType: string; label: string; wallConfigs: { north: string; south: string; east: string; west: string } }[];
  accent: string;
  text: string;
}) {
  if (modules.length === 0) return null;

  // Get front face (min row — south elevation looking from south)
  const minRow = Math.min(...modules.map((m) => m.row));
  const frontModules = modules
    .filter((m) => m.row === minRow)
    .sort((a, b) => a.col - b.col);

  const cellW = 50;
  const cellH = 48; // represents 2.7m height
  const groundY = 80;
  const padX = 20;
  const roofH = 16;
  const svgW = frontModules.length * cellW + padX * 2 + 40;
  const svgH = groundY + 24;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Ground line */}
      <line x1={0} y1={groundY} x2={svgW} y2={groundY} stroke={text} strokeWidth={1.5} opacity={0.4} />
      <text x={4} y={groundY + 10} fontSize={6} fill={text} opacity={0.4} fontFamily="sans-serif">GL ±0.00</text>

      {/* Roof line */}
      <line x1={padX} y1={groundY - cellH - roofH} x2={padX + frontModules.length * cellW} y2={groundY - cellH - roofH}
        stroke={accent} strokeWidth={1} strokeDasharray="4,3" />

      {/* Dimension: height */}
      <line x1={padX - 10} y1={groundY - cellH} x2={padX - 10} y2={groundY} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <line x1={padX - 14} y1={groundY - cellH} x2={padX - 6} y2={groundY - cellH} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <line x1={padX - 14} y1={groundY} x2={padX - 6} y2={groundY} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <text x={padX - 18} y={groundY - cellH / 2} fontSize={6} fill={text} opacity={0.5} fontFamily="sans-serif" textAnchor="middle" transform={`rotate(-90, ${padX - 18}, ${groundY - cellH / 2})`}>2.7m</text>

      {frontModules.map((mod, i) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        const x = padX + i * cellW;
        const y = groundY - cellH;
        const hasSouthWindow = mod.wallConfigs.south === "window";
        const hasSouthDoor = mod.wallConfigs.south === "door";

        return (
          <g key={`${mod.row}-${mod.col}`}>
            {/* Module body */}
            <rect x={x} y={y} width={cellW} height={cellH} fill={mt?.color || "#ccc"} fillOpacity={0.25} stroke={text} strokeWidth={1} opacity={0.8} />
            {/* Module label */}
            <text x={x + cellW / 2} y={y + 10} textAnchor="middle" fontSize={7} fill={text} fontWeight="bold" fontFamily="sans-serif">{mod.label}</text>
            {/* Window */}
            {hasSouthWindow && (
              <rect x={x + 10} y={y + 14} width={cellW - 20} height={cellH - 26} fill="#BAE6FD" stroke={accent} strokeWidth={1} />
            )}
            {/* Door */}
            {hasSouthDoor && (
              <rect x={x + (cellW - 14) / 2} y={y + cellH - 20} width={14} height={20} fill={accent} fillOpacity={0.4} stroke={accent} strokeWidth={1} />
            )}
            {/* Dimension width below */}
            {i === Math.floor(frontModules.length / 2) && (
              <text x={x + cellW / 2} y={groundY + 12} textAnchor="middle" fontSize={6} fill={text} opacity={0.4} fontFamily="sans-serif">
                3.0m
              </text>
            )}
          </g>
        );
      })}

      {/* Total width dimension */}
      <line x1={padX} y1={groundY + 18} x2={padX + frontModules.length * cellW} y2={groundY + 18} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <line x1={padX} y1={groundY + 14} x2={padX} y2={groundY + 22} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <line x1={padX + frontModules.length * cellW} y1={groundY + 14} x2={padX + frontModules.length * cellW} y2={groundY + 22} stroke={text} strokeWidth={0.75} opacity={0.5} />
      <text x={padX + (frontModules.length * cellW) / 2} y={groundY + 22} textAnchor="middle" fontSize={6} fill={text} opacity={0.5} fontFamily="sans-serif">
        {frontModules.length * 3}.0m total width
      </text>
    </svg>
  );
}
