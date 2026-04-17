"use client";

import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES, FINISH_LEVELS, MODULE_EXTERIOR_SIZE, MODULE_EXTERIOR_AREA, MODULE_INTERIOR_AREA } from "@/shared/types";
import { getStyleDirection } from "@/features/design/styles";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "@/features/design/layouts";
import StepNav from "@/features/design/components/shared/StepNav";
import FeatureGate from "@/shared/components/FeatureGate";
import { useAuthStore } from "@/features/auth/store";
import MobileStepFooter from "@/features/design/components/shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";
import "@/features/design/components/technical/print.css";

const PdfDownloadButton = lazy(() => import("./PdfGenerator"));

type PresentationTemplate = "minimal" | "bold" | "classic" | "luxury" | "architect";
type SlideId =
  | "cover"
  | "description"
  | "site"
  | "floorplan"
  | "vision"
  | "modules"
  | "renders"
  | "materials"
  | "products"
  | "cost"
  | "next";

interface SlideConfig {
  id: SlideId;
  label: string;
  description: string;
  enabled: boolean;
}

const TEMPLATES: Record<PresentationTemplate, { label: string; description: string; accent: string; bg: string; text: string }> = {
  minimal: {
    label: "Minimal White",
    description: "Clean, modern — inspired by Zaha Hadid Architects",
    accent: "#C8956C",
    bg: "#FFFFFF",
    text: "#1a1a1a",
  },
  bold: {
    label: "Dark Contrast",
    description: "Bold, dramatic — inspired by BIG (Bjarke Ingels)",
    accent: "#F59E0B",
    bg: "#111111",
    text: "#FFFFFF",
  },
  classic: {
    label: "Classic Architectural",
    description: "Traditional, elegant — inspired by Foster + Partners",
    accent: "#1D6B6B",
    bg: "#F8F6F2",
    text: "#2A2A2A",
  },
  luxury: {
    label: "Real Estate Luxury",
    description: "Premium, exclusive — inspired by high-end real estate marketing",
    accent: "#C5A572",
    bg: "#0A0A0A",
    text: "#FFFFFF",
  },
  architect: {
    label: "Architecture Portfolio",
    description: "Clean, technical — inspired by architectural submission documents",
    accent: "#333333",
    bg: "#FFFFFF",
    text: "#1a1a1a",
  },
};

const DEFAULT_SLIDES: SlideConfig[] = [
  { id: "cover", label: "Cover Page", description: "Project name, hero render, date", enabled: true },
  { id: "description", label: "Project Description", description: "Auto-generated overview of your design", enabled: true },
  { id: "site", label: "Site Plan", description: "Location map, terrain area, coordinates", enabled: true },
  { id: "floorplan", label: "Floor Plan", description: "Technical drawing, module layout", enabled: true },
  { id: "vision", label: "Design Vision", description: "Style direction, moodboard, palette", enabled: true },
  { id: "modules", label: "Module Details", description: "Per-room specs, furniture, materials", enabled: true },
  { id: "renders", label: "AI Renders", description: "Photorealistic visualizations", enabled: true },
  { id: "materials", label: "Materials & Finishes", description: "Floor, wall, finish specifications", enabled: true },
  { id: "products", label: "Products", description: "Selected items with quantities", enabled: true },
  { id: "cost", label: "Cost Summary", description: "Full pricing breakdown", enabled: true },
  { id: "next", label: "Next Steps", description: "Contact, timeline, builder info", enabled: true },
];

/** Texture background URLs for common materials (Unsplash) */
const MATERIAL_TEXTURES: Record<string, string> = {
  oak: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=200&h=200&fit=crop&q=60",
  walnut: "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=200&h=200&fit=crop&q=60",
  concrete: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=200&h=200&fit=crop&q=60",
  marble: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&h=200&fit=crop&q=60",
};

/** Product catalog for matching localStorage IDs — must match IDs from ProductsPage */
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  // Finishing Materials
  "fin-01": { name: "Engineered Oak Flooring", price: 42 },
  "fin-02": { name: "Gypsum Wall Panels", price: 18 },
  "fin-03": { name: "XPS Underfloor Insulation", price: 12 },
  "fin-04": { name: "Triple-Glazed Window Unit", price: 385 },
  "fin-05": { name: "Interior Flush Door", price: 145 },
  "fin-06": { name: "Mineral Wool Insulation Roll", price: 8 },
  "fin-07": { name: "Interior Wall Paint", price: 35 },
  "fin-08": { name: "Porcelain Floor Tiles", price: 28 },
  // Furniture & Decor
  "fur-01": { name: "Modular Sofa 3-Seat", price: 1290 },
  "fur-02": { name: "Wool Area Rug 200\u00D7300", price: 420 },
  "fur-03": { name: "Blackout Curtain Pair", price: 95 },
  "fur-04": { name: "Ceramic Vase Collection", price: 65 },
  "fur-05": { name: "Wall-Mounted Shelving Unit", price: 280 },
  "fur-06": { name: "Pendant Light Fixture", price: 175 },
  "fur-07": { name: "Round Wall Mirror", price: 210 },
  "fur-08": { name: "Upholstered Dining Chair", price: 195 },
  // Plumbing & Electrical
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

export default function PresentationPage() {
  const projectId = useProjectId();
  const { gridCells, gridRotation, polygon, mapCenter } = useLandStore();
  const {
    modules, setModulesFromGrid, styleDirection, finishLevel, getStats,
    moodboardPins, savedRenders, loadFromLocalStorage,
  } = useDesignStore();

  const userTier = useAuthStore((s) => s.userTier);
  const [template, setTemplate] = useState<PresentationTemplate>("minimal");
  const [slides, setSlides] = useState<SlideConfig[]>(DEFAULT_SLIDES);
  const [projectName, setProjectName] = useState("My Modular Home");
  const [clientName, setClientName] = useState("");
  const [activeSlide, setActiveSlide] = useState<SlideId>("cover");
  const [coverRenderIndex, setCoverRenderIndex] = useState(0);
  const [nextSteps, setNextSteps] = useState([
    { title: "Request a Builder Quote", desc: "Share this presentation with certified modular builders for detailed quotes." },
    { title: "Book a Consultation", desc: "Schedule a session with our architects to refine your design." },
    { title: "Secure Financing", desc: "Use this presentation for bank mortgage applications and investor meetings." },
    { title: "Begin Construction", desc: "Once approved, your modular home can be manufactured and assembled in weeks." },
  ]);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  const stats = getStats();
  const style = styleDirection ? getStyleDirection(styleDirection) : null;
  const tmpl = TEMPLATES[template];
  const finishInfo = FINISH_LEVELS.find((f) => f.id === finishLevel);
  const enabledSlides = slides.filter((s) => s.enabled);

  // Load products from localStorage
  const [products, setProducts] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("modulca-selected-products");
      if (raw) {
        const items: { id: string; quantity: number }[] = JSON.parse(raw);
        setProducts(items.map((item) => {
          const p = PRODUCT_CATALOG[item.id];
          return p ? { id: item.id, name: p.name, quantity: item.quantity, price: p.price } : null;
        }).filter((x): x is { id: string; name: string; quantity: number; price: number } => x !== null));
      }
    } catch { /* ignore */ }
  }, []);

  const toggleSlide = useCallback((id: SlideId) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  // High-quality PDF export via modular engine (html2canvas + jsPDF)
  const [exporting, setExporting] = useState(false);
  const handleHtmlExport = useCallback(async () => {
    setExporting(true);
    try {
      const { getDefaultEngine } = await import("../engines");
      const engine = getDefaultEngine();
      const slideEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-slide='true']")
      );
      if (slideEls.length === 0) return;
      await engine.exportSlides(slideEls, {
        format: "pdf",
        scale: 2,
        orientation: "landscape",
        filename: projectName || "ModulCA-Presentation",
      });
    } finally {
      setExporting(false);
    }
  }, [projectName]);

  const handleShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Presentation link copied to clipboard!");
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
    <div className="flex h-screen flex-col bg-gray-50 print-presentation-root">
      {/* Top Nav */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6 print:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={12} />
        <div className="flex items-center gap-2">
          <FeatureGate requires="sharableLink" hideIfLocked>
            <button onClick={handleShareLink} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
              Share Link
            </button>
          </FeatureGate>
          <FeatureGate requires="pdfPresentation" hideIfLocked>
            <button
              onClick={handleHtmlExport}
              disabled={exporting}
              className="rounded-lg border border-brand-olive-700 px-4 py-2 text-xs font-semibold text-brand-olive-700 hover:bg-brand-olive-50 transition-colors disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export HD PDF"}
            </button>
          </FeatureGate>
          <FeatureGate requires="pdfPresentation" hideIfLocked>
          <Suspense fallback={<span className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white opacity-50">Loading...</span>}>
            <PdfDownloadButton
              template={template}
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
              isFreeUser={userTier === "free"}
            />
          </Suspense>
          </FeatureGate>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Settings */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 print:hidden hidden md:block">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Presentation Settings</h3>

          {/* Project Name */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          {/* Client Name */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">Client Name (optional)</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Your name or company"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          {/* Template Selector */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">Template</label>
            <div className="space-y-2">
              {(Object.keys(TEMPLATES) as PresentationTemplate[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    template === key
                      ? "border-brand-amber-500 bg-brand-amber-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ background: `linear-gradient(135deg, ${TEMPLATES[key].bg} 50%, ${TEMPLATES[key].accent} 50%)` }}
                    />
                    <span className="text-xs font-semibold text-gray-800">{TEMPLATES[key].label}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">{TEMPLATES[key].description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slide Toggle */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">
              Slides ({enabledSlides.length} of {slides.length})
            </label>
            <div className="space-y-1">
              {slides.map((slide) => (
                <label
                  key={slide.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
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
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ml-2 ${
                      slide.enabled ? "bg-brand-amber-500" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${slide.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <Link href={`/project/${projectId}/finalize`} className="block text-center text-sm text-gray-500 hover:text-brand-teal-800">
              &larr; Back to Finalize
            </Link>
          </div>
        </aside>

        {/* Center — Slide Preview */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {/* Slide navigation tabs */}
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

          {/* Slide Preview Area */}
          <div ref={previewRef} className="mx-auto" style={{ maxWidth: 900 }}>
            {/* Each slide is a card styled per template */}
            {(activeSlide === "cover" || typeof window !== "undefined" && window.matchMedia("print").matches) && slides.find((s) => s.id === "cover")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <div className="relative flex flex-col items-center justify-center min-h-[500px] text-center">
                  {/* Hero render background */}
                  {savedRenders.length > 0 && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={savedRenders[coverRenderIndex]?.imageUrl || savedRenders[0].imageUrl}
                        alt="Hero render"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${tmpl.bg}CC 0%, ${tmpl.bg}99 40%, ${tmpl.bg}DD 100%)` }} />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: tmpl.accent }}>
                      ModulCA Project Presentation
                    </div>
                    <h1 className="text-4xl font-bold mb-4" style={{ color: tmpl.text }}>{projectName}</h1>
                    {clientName && (
                      <p className="text-lg mb-2" style={{ color: tmpl.text, opacity: 0.6 }}>Prepared for {clientName}</p>
                    )}
                    <p className="text-sm mb-8" style={{ color: tmpl.text, opacity: 0.4 }}>
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <div className="flex items-center gap-6 text-xs" style={{ color: tmpl.text, opacity: 0.5 }}>
                      <span>{modules.length} Modules</span>
                      <span>{stats.totalArea}m{"\u00B2"} Total Area</span>
                      <span>{style?.label || "Modern"} Style</span>
                      <span>{finishInfo?.label || "Standard"} Finish</span>
                    </div>
                    <div className="mt-12 h-1 w-24 rounded mx-auto" style={{ backgroundColor: tmpl.accent }} />
                  </div>
                  {/* Render thumbnail picker */}
                  {savedRenders.length > 1 && (
                    <div className="relative z-10 mt-6 flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider mr-2" style={{ color: tmpl.text, opacity: 0.4 }}>Cover image:</span>
                      {savedRenders.map((render, i) => (
                        <button
                          key={render.id}
                          onClick={() => setCoverRenderIndex(i)}
                          className={`h-10 w-14 rounded-md overflow-hidden border-2 transition-all ${
                            i === coverRenderIndex ? "border-current opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80"
                          }`}
                          style={{ borderColor: i === coverRenderIndex ? tmpl.accent : "transparent" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={render.imageUrl} alt={render.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </SlideCard>
            )}

            {activeSlide === "description" && slides.find((s) => s.id === "description")?.enabled && (() => {
              // Auto-generate project description from data
              const roomBreakdown = Array.from(new Set(modules.map((m) => m.moduleType))).map((type) => {
                const mt = MODULE_TYPES.find((m) => m.id === type);
                const count = modules.filter((m) => m.moduleType === type).length;
                return `${count} ${mt?.label || type}${count > 1 ? "s" : ""}`;
              });
              const styleName = style?.label || "modern";
              const totalArea = stats.totalArea;
              const usableArea = stats.usableArea;
              const finishName = finishInfo?.label || "Standard";

              return (
                <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                  <SlideHeader accent={tmpl.accent} text={tmpl.text} number={2} title="Project Description" />
                  <div className="mt-8 max-w-2xl mx-auto">
                    <p className="text-base leading-relaxed mb-6" style={{ color: tmpl.text, opacity: 0.8 }}>
                      This {styleName.toLowerCase()} modular residence comprises {modules.length} modules
                      totaling {totalArea}m{"\u00B2"} of built area ({usableArea}m{"\u00B2"} usable),
                      featuring {roomBreakdown.join(", ")}. Designed with a {finishName.toLowerCase()} finish
                      level, the project prioritizes efficient space utilization through modular construction
                      techniques.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="rounded-xl p-4" style={{ backgroundColor: tmpl.accent + "15" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tmpl.accent }}>Configuration</p>
                        <p className="text-2xl font-bold" style={{ color: tmpl.text }}>{modules.length} Modules</p>
                        <p className="text-xs mt-1" style={{ color: tmpl.text, opacity: 0.5 }}>{roomBreakdown.join(" + ")}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: tmpl.accent + "15" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tmpl.accent }}>Total Area</p>
                        <p className="text-2xl font-bold" style={{ color: tmpl.text }}>{totalArea}m{"\u00B2"}</p>
                        <p className="text-xs mt-1" style={{ color: tmpl.text, opacity: 0.5 }}>{usableArea}m{"\u00B2"} usable interior space</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: tmpl.accent + "15" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tmpl.accent }}>Design Style</p>
                        <p className="text-2xl font-bold" style={{ color: tmpl.text }}>{style?.label || "Modern"}</p>
                        <p className="text-xs mt-1" style={{ color: tmpl.text, opacity: 0.5 }}>{style?.tagline || "Contemporary modular design"}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: tmpl.accent + "15" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tmpl.accent }}>Investment</p>
                        <p className="text-2xl font-bold" style={{ color: tmpl.text }}>EUR {Math.round(stats.totalEstimate).toLocaleString()}</p>
                        <p className="text-xs mt-1" style={{ color: tmpl.text, opacity: 0.5 }}>{finishName} finish | EUR {Math.round(stats.totalEstimate / totalArea)}/m{"\u00B2"}</p>
                      </div>
                    </div>
                  </div>
                </SlideCard>
              );
            })()}

            {activeSlide === "site" && slides.find((s) => s.id === "site")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={2} title="Site Plan" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* SVG Site Plan — shows modules on terrain */}
                  <div className="rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 aspect-video flex items-center justify-center p-4">
                    {modules.length > 0 ? (
                      <SitePlanSvg modules={modules} accent={tmpl.accent} />
                    ) : (
                      <p className="text-sm text-gray-400">No modules placed yet</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <DetailRow label="Location" value={mapCenter.lat !== 44.4268 ? `${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}` : "Romania (default)"} text={tmpl.text} />
                    <DetailRow label="Terrain Area" value={polygon.length > 2 ? `~${Math.round(polygon.length * 50)} m\u00B2 (estimated)` : `~${stats.totalArea * 4} m\u00B2 (auto-sized)`} text={tmpl.text} />
                    <DetailRow label="Grid Configuration" value={`${modules.length} module${modules.length !== 1 ? "s" : ""} placed`} text={tmpl.text} />
                    <DetailRow label="Grid Rotation" value={`${gridRotation}\u00B0`} text={tmpl.text} />
                    <DetailRow label="Total Built Area" value={`${stats.totalArea} m\u00B2`} text={tmpl.text} />
                    <DetailRow label="Usable Area" value={`${stats.usableArea} m\u00B2`} text={tmpl.text} />
                    <DetailRow label="Building Footprint" value={`${Math.ceil(Math.sqrt(stats.totalArea))} \u00D7 ${Math.ceil(Math.sqrt(stats.totalArea))} m approx.`} text={tmpl.text} />
                  </div>
                </div>
              </SlideCard>
            )}

            {activeSlide === "floorplan" && slides.find((s) => s.id === "floorplan")?.enabled && (() => {
              // Build grid from gridCells (includes empty cells for context) + modules for placed data
              const activeCells = gridCells.filter((c) => c.moduleType !== null);
              const cellsToRender = activeCells.length > 0 ? activeCells : modules.map((m) => ({ row: m.row, col: m.col, moduleType: m.moduleType }));
              const allRows = cellsToRender.map((c) => c.row);
              const allCols = cellsToRender.map((c) => c.col);
              const minRow = Math.min(...allRows);
              const maxRow = Math.max(...allRows);
              const minCol = Math.min(...allCols);
              const maxCol = Math.max(...allCols);
              const numCols = maxCol - minCol + 1;
              const numRows = maxRow - minRow + 1;
              const cellLookup = new Map(cellsToRender.map((c) => [`${c.row},${c.col}`, c.moduleType]));
              // Also create a module label lookup
              const labelLookup = new Map(modules.map((m) => [`${m.row},${m.col}`, m.label]));

              // Build grid positions including empty cells for the bounding box
              const gridPositions: { row: number; col: number; moduleType: string | null }[] = [];
              for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                  const key = `${r},${c}`;
                  gridPositions.push({ row: r, col: c, moduleType: cellLookup.get(key) ?? null });
                }
              }

              return (
                <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                  <SlideHeader accent={tmpl.accent} text={tmpl.text} number={3} title="Floor Plan" />
                  <div className="mt-4 text-center">
                    <p className="text-xs mb-1" style={{ color: tmpl.text, opacity: 0.4 }}>
                      {numCols * MODULE_EXTERIOR_SIZE}m x {numRows * MODULE_EXTERIOR_SIZE}m footprint | {modules.length * MODULE_EXTERIOR_AREA}m{"\u00B2"} total | {modules.length * MODULE_INTERIOR_AREA}m{"\u00B2"} usable
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center overflow-x-auto">
                    <div className="grid gap-1" style={{
                      gridTemplateColumns: `repeat(${numCols}, minmax(60px, 80px))`,
                    }}>
                      {gridPositions.map(({ row, col, moduleType }) => {
                        const mt = moduleType ? MODULE_TYPES.find((m) => m.id === moduleType) : null;
                        const label = labelLookup.get(`${row},${col}`);
                        if (!moduleType) {
                          // Empty grid cell — show as faint placeholder
                          return (
                            <div
                              key={`${row}-${col}`}
                              className="rounded-lg border border-dashed p-2 text-center"
                              style={{
                                gridColumn: col - minCol + 1,
                                gridRow: row - minRow + 1,
                                borderColor: tmpl.text + "15",
                              }}
                            >
                              <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.15 }}>empty</div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={`${row}-${col}`}
                            className="rounded-lg border p-2 text-center"
                            style={{
                              gridColumn: col - minCol + 1,
                              gridRow: row - minRow + 1,
                              backgroundColor: mt?.color + "30",
                              borderColor: mt?.color || "#ccc",
                            }}
                          >
                            <div className="text-[9px] font-bold" style={{ color: tmpl.text }}>{label || moduleType}</div>
                            <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.5 }}>{mt?.label}</div>
                            <div className="text-[8px]" style={{ color: tmpl.text, opacity: 0.4 }}>{MODULE_EXTERIOR_SIZE}m x {MODULE_EXTERIOR_SIZE}m</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    {Array.from(new Set(modules.map((m) => m.moduleType))).map((type) => {
                      const mt = MODULE_TYPES.find((m) => m.id === type);
                      const count = modules.filter((m) => m.moduleType === type).length;
                      return (
                        <div key={type} className="flex items-center gap-2 text-xs" style={{ color: tmpl.text }}>
                          <div className="h-3 w-3 rounded" style={{ backgroundColor: mt?.color }} />
                          <span>{mt?.label} x{count} ({count * MODULE_EXTERIOR_AREA}m{"\u00B2"})</span>
                        </div>
                      );
                    })}
                  </div>
                </SlideCard>
              );
            })()}

            {activeSlide === "vision" && slides.find((s) => s.id === "vision")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={4} title="Design Vision" />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-2" style={{ color: tmpl.text }}>{style?.label || "Modern Design"}</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: tmpl.text, opacity: 0.6 }}>
                      {style?.description || "A carefully curated design direction that balances aesthetics with functionality."}
                    </p>
                    {/* Color palette */}
                    {style?.palette && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>Color Palette</p>
                        <div className="flex gap-2">
                          {style.palette.map((swatch, i) => (
                            <div key={i} className="text-center">
                              <div className="h-12 w-12 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: swatch.color }} />
                              <span className="text-[8px] mt-1 block" style={{ color: tmpl.text, opacity: 0.4 }}>{swatch.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>Mood Board</p>
                    {moodboardPins.length > 0 ? (
                      moodboardPins.slice(0, 4).map((pin, i) => (
                        <div key={`pin-${i}`} className="rounded-lg overflow-hidden bg-gray-200 aspect-video">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pin.imageUrl} alt={pin.label || `Pin ${i + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))
                    ) : style?.moodImages?.slice(0, 4).map((img, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-gray-200 aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {!moodboardPins.length && !style?.moodImages?.length && (
                      <div className="rounded-lg bg-gray-100 aspect-video flex items-center justify-center">
                        <p className="text-xs text-gray-400">Moodboard images from Step 4</p>
                      </div>
                    )}
                  </div>
                </div>
              </SlideCard>
            )}

            {activeSlide === "modules" && slides.find((s) => s.id === "modules")?.enabled && (() => {
              const MODS_PER_SLIDE = 4;
              const pages: typeof modules[] = [];
              for (let i = 0; i < modules.length; i += MODS_PER_SLIDE) {
                pages.push(modules.slice(i, i + MODS_PER_SLIDE));
              }
              return pages.map((pageMods, pageIdx) => (
                <SlideCard key={`modules-${pageIdx}`} bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                  <SlideHeader accent={tmpl.accent} text={tmpl.text} number={5 + pageIdx} title={pages.length > 1 ? `Module Details (${pageIdx + 1}/${pages.length})` : "Module Details"} />
                  <div className="mt-6 space-y-4">
                    {pageMods.map((mod) => {
                      const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
                      const preset = getPreset(mod.moduleType, mod.layoutPreset)
                        || getPresetsForType(mod.moduleType)[0];
                      const floor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
                      const wall = WALL_MATERIALS.find((w) => w.id === mod.wallColor);
                      return (
                        <div key={`${mod.row}-${mod.col}`} className="rounded-xl p-4" style={{ backgroundColor: tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8" }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-5 w-5 rounded" style={{ backgroundColor: mt?.color }} />
                            <h4 className="text-sm font-bold" style={{ color: tmpl.text }}>{mod.label}</h4>
                            <span className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>{mt?.label} | {preset?.label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-xs">
                            <div>
                              <span style={{ color: tmpl.text, opacity: 0.4 }}>Floor</span>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-3 w-3 rounded border" style={{ backgroundColor: floor?.color }} />
                                <span style={{ color: tmpl.text }}>{floor?.label}</span>
                              </div>
                            </div>
                            <div>
                              <span style={{ color: tmpl.text, opacity: 0.4 }}>Walls</span>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="h-3 w-3 rounded border" style={{ backgroundColor: wall?.color }} />
                                <span style={{ color: tmpl.text }}>{wall?.label}</span>
                              </div>
                            </div>
                            <div>
                              <span style={{ color: tmpl.text, opacity: 0.4 }}>Furniture</span>
                              <span className="block mt-1" style={{ color: tmpl.text }}>{preset?.furniture.length || 0} pieces</span>
                            </div>
                            <div>
                              <span style={{ color: tmpl.text, opacity: 0.4 }}>Area</span>
                              <span className="block mt-1" style={{ color: tmpl.text }}>9m2 (7m2 usable)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SlideCard>
              ));
            })()}

            {activeSlide === "renders" && slides.find((s) => s.id === "renders")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={6} title="AI Renders" />
                {savedRenders.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {savedRenders.map((render) => (
                      <div key={render.id} className="rounded-xl overflow-hidden border" style={{ borderColor: tmpl.text + "20" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={render.imageUrl} alt={render.label} className="w-full aspect-video object-cover" />
                        <div className="p-3">
                          <p className="text-xs font-medium" style={{ color: tmpl.text }}>{render.label}</p>
                          {render.description && (
                            <p className="text-[10px] leading-relaxed mt-1" style={{ color: tmpl.text, opacity: 0.6 }}>{render.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>Engine: {render.engine}</p>
                            {render.resolution && (
                              <p className="text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>{render.resolution}</p>
                            )}
                            {render.mode && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tmpl.accent + "20", color: tmpl.accent }}>
                                {render.mode === "img2img" ? "3D+AI" : "AI"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 text-center">
                    <div className="rounded-xl overflow-hidden bg-gray-200 aspect-video flex items-center justify-center mb-4">
                      <p className="text-sm text-gray-500">Save renders from Step 7 to see them here</p>
                    </div>
                    <p className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
                      Use the &quot;Save to Presentation&quot; button in the Render step
                    </p>
                  </div>
                )}
                {savedRenders.length > 6 && (
                  <p className="text-[10px] mt-2 text-center" style={{ color: tmpl.text, opacity: 0.3 }}>
                    {savedRenders.length} renders saved
                  </p>
                )}
              </SlideCard>
            )}

            {activeSlide === "materials" && slides.find((s) => s.id === "materials")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={7} title="Materials & Finishes" />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>Floor Materials</p>
                    <div className="space-y-2">
                      {Array.from(new Set(modules.map((m) => m.floorFinish))).map((floorId) => {
                        const floor = FLOOR_MATERIALS.find((f) => f.id === floorId);
                        const count = modules.filter((m) => m.floorFinish === floorId).length;
                        const textureUrl = MATERIAL_TEXTURES[floorId];
                        return (
                          <div key={floorId} className="flex items-center gap-3 rounded-lg p-2" style={{ backgroundColor: tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8" }}>
                            <div className="h-10 w-10 rounded-lg border overflow-hidden flex-shrink-0" style={{ backgroundColor: floor?.color }}>
                              {textureUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={textureUrl} alt={floor?.label || floorId} className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-medium" style={{ color: tmpl.text }}>{floor?.label}</span>
                              <span className="block text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>Used in {count} module{count > 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: tmpl.text, opacity: 0.4 }}>Wall Finishes</p>
                    <div className="space-y-2">
                      {Array.from(new Set(modules.map((m) => m.wallColor))).map((wallId) => {
                        const wall = WALL_MATERIALS.find((w) => w.id === wallId);
                        const count = modules.filter((m) => m.wallColor === wallId).length;
                        const textureUrl = MATERIAL_TEXTURES[wallId];
                        return (
                          <div key={wallId} className="flex items-center gap-3 rounded-lg p-2" style={{ backgroundColor: tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8" }}>
                            <div className="h-10 w-10 rounded-lg border overflow-hidden flex-shrink-0" style={{ backgroundColor: wall?.color }}>
                              {textureUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={textureUrl} alt={wall?.label || wallId} className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-medium" style={{ color: tmpl.text }}>{wall?.label}</span>
                              <span className="block text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>Used in {count} module{count > 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: tmpl.text, opacity: 0.4 }}>Finish Level</p>
                  <div className="inline-block rounded-lg px-4 py-2" style={{ backgroundColor: tmpl.accent + "20" }}>
                    <span className="text-sm font-bold" style={{ color: tmpl.accent }}>{finishInfo?.label || "Standard"}</span>
                  </div>
                </div>
              </SlideCard>
            )}

            {activeSlide === "products" && slides.find((s) => s.id === "products")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={8} title="Selected Products" />
                {products.length > 0 ? (
                  <div className="mt-6">
                    <div className="space-y-2">
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8" }}>
                          <div>
                            <span className="text-sm font-medium" style={{ color: tmpl.text }}>{p.name}</span>
                            <span className="block text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>Qty: {p.quantity} × EUR{p.price}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: tmpl.accent }}>EUR{(p.quantity * p.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t flex justify-between" style={{ borderColor: tmpl.text + "20" }}>
                      <span className="text-sm font-bold" style={{ color: tmpl.text }}>Products Total</span>
                      <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
                        EUR{products.reduce((sum, p) => sum + p.quantity * p.price, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-12">
                    <p className="text-sm" style={{ color: tmpl.text, opacity: 0.4 }}>No products selected yet. Add products in Step 11 (Products).</p>
                  </div>
                )}
              </SlideCard>
            )}

            {activeSlide === "cost" && slides.find((s) => s.id === "cost")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={9} title="Cost Summary" />
                <div className="mt-8 max-w-md mx-auto space-y-3">
                  <CostRow label={`Module cost (${finishInfo?.label || "Standard"})`} value={`EUR${stats.moduleCost.toLocaleString()}`} text={tmpl.text} />
                  {stats.sharedWallDiscount > 0 && (
                    <CostRow label="Shared wall discount" value={`-EUR${stats.sharedWallDiscount.toLocaleString()}`} text={tmpl.text} green />
                  )}
                  <CostRow label="Design fee (8%)" value={`EUR${stats.designFee.toLocaleString()}`} text={tmpl.text} />
                  <div className="border-t pt-3 mt-3" style={{ borderColor: tmpl.text + "20" }}>
                    <div className="flex justify-between">
                      <span className="text-lg font-bold" style={{ color: tmpl.text }}>Total Estimate</span>
                      <span className="text-lg font-bold" style={{ color: tmpl.accent }}>EUR{stats.totalEstimate.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-center mt-4" style={{ color: tmpl.text, opacity: 0.3 }}>
                    * Estimate based on {finishInfo?.label || "Standard"} finish level. Final price may vary based on local conditions and builder quotes.
                  </p>
                </div>
              </SlideCard>
            )}

            {activeSlide === "next" && slides.find((s) => s.id === "next")?.enabled && (
              <SlideCard bg={tmpl.bg} text={tmpl.text} accent={tmpl.accent}>
                <SlideHeader accent={tmpl.accent} text={tmpl.text} number={enabledSlides.findIndex((s) => s.id === "next") + 1} title="Next Steps" />
                <div className="mt-8 max-w-lg mx-auto space-y-6">
                  {nextSteps.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: tmpl.accent }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNextSteps((prev) => prev.map((s, j) => j === i ? { ...s, title: val } : s));
                          }}
                          className="w-full bg-transparent text-sm font-bold border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                          style={{ color: tmpl.text }}
                        />
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNextSteps((prev) => prev.map((s, j) => j === i ? { ...s, desc: val } : s));
                          }}
                          className="w-full bg-transparent text-xs mt-1 border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                          style={{ color: tmpl.text, opacity: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-6">
                    <div className="h-1 w-16 rounded mx-auto mb-4" style={{ backgroundColor: tmpl.accent }} />
                    <p className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
                      Generated with ModulCA | modulca.eu
                    </p>
                  </div>
                </div>
              </SlideCard>
            )}
          </div>
        </main>

        {/* Right Sidebar — Slide Navigator */}
        <aside className="hidden md:block w-56 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 print:hidden">
          <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Slides</h3>
          <div className="space-y-1">
            {enabledSlides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition-all ${
                  activeSlide === slide.id
                    ? "bg-brand-amber-50 border border-brand-amber-300"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">{i + 1}</span>
                  <span className={`text-xs ${activeSlide === slide.id ? "font-semibold text-brand-teal-800" : "text-gray-600"}`}>
                    {slide.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Quick Stats</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Modules</span><span className="font-medium">{modules.length}</span></div>
              <div className="flex justify-between"><span>Area</span><span className="font-medium">{stats.totalArea}m2</span></div>
              <div className="flex justify-between"><span>Style</span><span className="font-medium">{style?.label || "Modern"}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-bold text-brand-amber-600">EUR{stats.totalEstimate.toLocaleString()}</span></div>
            </div>
          </div>
        </aside>
      </div>
      <MobileStepFooter activeStep={12} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared slide components                                            */
/* ------------------------------------------------------------------ */

function SlideCard({ bg, text, children }: { bg: string; text: string; accent?: string; children: React.ReactNode }) {
  return (
    <div
      data-slide="true"
      className="rounded-2xl shadow-lg mb-6 p-4 md:p-8 print:shadow-none print:rounded-none print:mb-0 print:break-after-page"
      style={{ backgroundColor: bg, color: text, minHeight: 300, aspectRatio: "297/210" }}
    >
      {children}
    </div>
  );
}

function SlideHeader({ accent, text, number, title }: { accent: string; text: string; number: number; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: accent }}>
        {number}
      </div>
      <h2 className="text-2xl font-bold" style={{ color: text }}>{title}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: text + "15" }} />
    </div>
  );
}

function DetailRow({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: text, opacity: 0.5 }}>{label}</span>
      <span className="font-medium" style={{ color: text }}>{value}</span>
    </div>
  );
}

function CostRow({ label, value, text, green }: { label: string; value: string; text: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: text, opacity: 0.6 }}>{label}</span>
      <span className={`font-medium ${green ? "text-green-600" : ""}`} style={green ? {} : { color: text }}>{value}</span>
    </div>
  );
}

/** SVG site plan showing module layout on a terrain outline */
function SitePlanSvg({ modules, accent }: { modules: { row: number; col: number; moduleType: string; label: string }[]; accent: string }) {
  if (modules.length === 0) return null;
  const minR = Math.min(...modules.map((m) => m.row));
  const maxR = Math.max(...modules.map((m) => m.row));
  const minC = Math.min(...modules.map((m) => m.col));
  const maxC = Math.max(...modules.map((m) => m.col));
  const cols = maxC - minC + 1;
  const rows = maxR - minR + 1;
  const cellPx = 40;
  const pad = 60; // terrain padding around building
  const svgW = cols * cellPx + pad * 2;
  const svgH = rows * cellPx + pad * 2;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" style={{ maxHeight: 200 }}>
      {/* Terrain outline — slightly larger than building */}
      <rect
        x={12} y={12}
        width={svgW - 24} height={svgH - 24}
        rx={6}
        fill="#d1fae5" stroke="#6ee7b7" strokeWidth={1.5} strokeDasharray="6,3"
      />
      {/* Terrain label */}
      <text x={svgW / 2} y={24} textAnchor="middle" fontSize={8} fill="#065f46" fontFamily="sans-serif">TERRAIN BOUNDARY</text>
      {/* North arrow */}
      <text x={svgW - 20} y={28} fontSize={10} fill="#065f46" fontFamily="sans-serif" fontWeight="bold">N</text>
      <line x1={svgW - 17} y1={30} x2={svgW - 17} y2={40} stroke="#065f46" strokeWidth={1} markerEnd="" />
      {/* Module cells */}
      {modules.map((mod) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        const x = pad + (mod.col - minC) * cellPx;
        const y = pad + (mod.row - minR) * cellPx;
        return (
          <g key={`${mod.row}-${mod.col}`}>
            <rect x={x + 1} y={y + 1} width={cellPx - 2} height={cellPx - 2} rx={3}
              fill={mt?.color || "#ccc"} fillOpacity={0.7} stroke={accent} strokeWidth={1.5} />
            <text x={x + cellPx / 2} y={y + cellPx / 2 - 3} textAnchor="middle" fontSize={7} fill="#1a1a1a" fontWeight="bold" fontFamily="sans-serif">
              {mod.label}
            </text>
            <text x={x + cellPx / 2} y={y + cellPx / 2 + 7} textAnchor="middle" fontSize={5} fill="#555" fontFamily="sans-serif">
              3x3m
            </text>
          </g>
        );
      })}
      {/* Dimension line */}
      <text x={pad + (cols * cellPx) / 2} y={svgH - 10} textAnchor="middle" fontSize={7} fill="#555" fontFamily="sans-serif">
        {(cols * 3).toFixed(0)}m x {(rows * 3).toFixed(0)}m footprint
      </text>
    </svg>
  );
}
