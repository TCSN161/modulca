"use client";

import { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { getStyleDirection } from "@/features/design/styles";
import StepNav from "@/features/design/components/shared/StepNav";
import FeatureGate from "@/shared/components/FeatureGate";
import { useAuthStore } from "@/features/auth/store";
import MobileStepFooter from "@/features/design/components/shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";
import "@/features/design/components/technical/print.css";

const PdfDownloadButton = lazy(() => import("./PdfGenerator"));

// Extracted slide components (modular architecture — see slides/README.md)
import CoverSlide from "./slides/CoverSlide";
import DescriptionSlide from "./slides/DescriptionSlide";
import VisionSlide from "./slides/VisionSlide";
import SiteSlide from "./slides/SiteSlide";
import FloorplanSlide from "./slides/FloorplanSlide";
import ModulesSlide from "./slides/ModulesSlide";
import RendersSlide from "./slides/RendersSlide";
import MaterialsSlide from "./slides/MaterialsSlide";
import ProductsSlide from "./slides/ProductsSlide";
import CostSlide from "./slides/CostSlide";

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
  const tmpl = { id: template, ...TEMPLATES[template] };
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
              <CoverSlide
                template={tmpl}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
              />
            )}

            {activeSlide === "description" && slides.find((s) => s.id === "description")?.enabled && (() => {
              const roomBreakdown = Array.from(new Set(modules.map((m) => m.moduleType))).map((type) => {
                const mt = MODULE_TYPES.find((m) => m.id === type);
                const count = modules.filter((m) => m.moduleType === type).length;
                return `${count} ${mt?.label || type}${count > 1 ? "s" : ""}`;
              });
              return (
                <DescriptionSlide
                  template={tmpl}
                  slideNumber={2}
                  projectName={projectName}
                  clientName={clientName}
                  moduleCount={modules.length}
                  totalAreaSqm={stats.totalArea}
                  usableAreaSqm={stats.usableArea}
                  styleName={style?.label || "Modern"}
                  finishName={finishInfo?.label || "Standard"}
                  savedRenders={savedRenders}
                  coverRenderIndex={coverRenderIndex}
                  setCoverRenderIndex={setCoverRenderIndex}
                  roomBreakdown={roomBreakdown}
                  totalEstimateEur={stats.totalEstimate}
                  styleTagline={style?.tagline}
                />
              );
            })()}

            {activeSlide === "site" && slides.find((s) => s.id === "site")?.enabled && (
              <SiteSlide
                template={tmpl}
                slideNumber={2}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                modules={modules}
                mapCenter={mapCenter}
                polygonCount={polygon.length}
                gridRotation={gridRotation}
              />
            )}

            {activeSlide === "floorplan" && slides.find((s) => s.id === "floorplan")?.enabled && (
              <FloorplanSlide
                template={tmpl}
                slideNumber={3}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                gridCells={gridCells}
                modules={modules}
              />
            )}

            {activeSlide === "vision" && slides.find((s) => s.id === "vision")?.enabled && (() => {
              const moodImages = moodboardPins.length > 0
                ? moodboardPins.map((pin) => ({ imageUrl: pin.imageUrl, label: pin.label }))
                : (style?.moodImages || []).map((img) => ({ imageUrl: img.url, label: img.label }));
              return (
                <VisionSlide
                  template={tmpl}
                  slideNumber={4}
                  projectName={projectName}
                  clientName={clientName}
                  moduleCount={modules.length}
                  totalAreaSqm={stats.totalArea}
                  usableAreaSqm={stats.usableArea}
                  styleName={style?.label || "Modern Design"}
                  finishName={finishInfo?.label || "Standard"}
                  savedRenders={savedRenders}
                  coverRenderIndex={coverRenderIndex}
                  setCoverRenderIndex={setCoverRenderIndex}
                  styleDescription={style?.description}
                  palette={style?.palette || []}
                  moodImages={moodImages}
                />
              );
            })()}

            {activeSlide === "modules" && slides.find((s) => s.id === "modules")?.enabled && (
              <ModulesSlide
                template={tmpl}
                slideNumber={5}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                modules={modules}
              />
            )}

            {activeSlide === "renders" && slides.find((s) => s.id === "renders")?.enabled && (
              <RendersSlide
                template={tmpl}
                slideNumber={6}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                renders={savedRenders}
              />
            )}

            {activeSlide === "materials" && slides.find((s) => s.id === "materials")?.enabled && (
              <MaterialsSlide
                template={tmpl}
                slideNumber={7}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                modules={modules}
                textures={MATERIAL_TEXTURES}
              />
            )}

            {activeSlide === "products" && slides.find((s) => s.id === "products")?.enabled && (
              <ProductsSlide
                template={tmpl}
                slideNumber={8}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                products={products}
              />
            )}

            {activeSlide === "cost" && slides.find((s) => s.id === "cost")?.enabled && (
              <CostSlide
                template={tmpl}
                slideNumber={9}
                projectName={projectName}
                clientName={clientName}
                moduleCount={modules.length}
                totalAreaSqm={stats.totalArea}
                usableAreaSqm={stats.usableArea}
                styleName={style?.label || "Modern"}
                finishName={finishInfo?.label || "Standard"}
                savedRenders={savedRenders}
                coverRenderIndex={coverRenderIndex}
                setCoverRenderIndex={setCoverRenderIndex}
                moduleCost={stats.moduleCost}
                sharedWallDiscount={stats.sharedWallDiscount}
                designFee={stats.designFee}
                totalEstimateEur={stats.totalEstimate}
              />
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

// DetailRow, CostRow → moved to ./slides/shared.tsx
// SitePlanSvg → moved to ./slides/SitePlanSvg.tsx
