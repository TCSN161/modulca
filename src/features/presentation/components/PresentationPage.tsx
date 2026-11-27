"use client";

import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { getStyleDirection } from "@/features/design/styles";
import StepNav from "@/features/design/components/shared/StepNav";
import FeatureGate from "@/shared/components/FeatureGate";
import { useAuthStore } from "@/features/auth/store";
import MobileStepFooter from "@/features/design/components/shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";
import { computeProjectCost } from "@/features/design/projectCost";
import {
  getSelectedProducts, subscribeSelectedProducts, type SelectedProduct,
} from "@/features/design/productSelection";
import { LOCALE_LABELS } from "@/i18n/config";
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
import NextStepsEditSlide, { type NextStep } from "./slides/NextStepsEditSlide";
import type { SlideContext, SlideId } from "./slides/types";
import { useProjectName, presentationFileName } from "../hooks/projectName";
import { presentationT, PRESENTATION_LOCALES, toPresentationLocale, defaultNextSteps } from "../i18n";

type PresentationTemplate = "minimal" | "bold" | "classic" | "luxury" | "architect";

interface SlideToggle { id: SlideId; enabled: boolean }

/** Colours only; labels come from the presentation i18n (BUG-ST32) */
const TEMPLATES: Record<PresentationTemplate, { accent: string; bg: string; text: string }> = {
  minimal: { accent: "#C8956C", bg: "#FFFFFF", text: "#1a1a1a" },
  bold: { accent: "#F59E0B", bg: "#111111", text: "#FFFFFF" },
  classic: { accent: "#1D6B6B", bg: "#F8F6F2", text: "#2A2A2A" },
  luxury: { accent: "#C5A572", bg: "#0A0A0A", text: "#FFFFFF" },
  architect: { accent: "#333333", bg: "#FFFFFF", text: "#1a1a1a" },
};

const SLIDE_IDS: SlideId[] = [
  "cover", "description", "site", "floorplan", "vision", "modules",
  "renders", "materials", "products", "cost", "next",
];

/**
 * Material texture preview images.
 * Mapped to LOCAL curated product photos (public/images/products/) so what
 * users see in the slide actually matches the material they selected in
 * the designer. Unmapped materials show a solid color swatch from
 * FLOOR_MATERIALS / WALL_MATERIALS definitions — accurate, no confusion.
 *
 * To add a new material texture: drop image in public/images/products/ and
 * add the mapping here. The material id MUST match the id in
 * src/features/design/layouts.ts → FLOOR_MATERIALS / WALL_MATERIALS.
 */
const MATERIAL_TEXTURES: Record<string, string> = {
  // Floor materials (ids from FLOOR_MATERIALS)
  oak: "/images/products/fin-01-oak-flooring.jpg",
  // walnut, concrete: no curated image yet — colour swatch
  // Wall materials: colour swatches
};

export default function PresentationPage() {
  const projectId = useProjectId();
  const { gridCells, gridRotation, polygon, mapCenter } = useLandStore();
  const {
    modules, setModulesFromGrid, styleDirection, finishLevel,
    moodboardPins, savedRenders, loadFromLocalStorage,
  } = useDesignStore();

  const userTier = useAuthStore((s) => s.userTier);
  const [template, setTemplate] = useState<PresentationTemplate>("minimal");
  const [slides, setSlides] = useState<SlideToggle[]>(SLIDE_IDS.map((id) => ({ id, enabled: true })));
  const [projectName, setProjectName] = useProjectName(projectId); // BUG-ST07
  const [clientName, setClientName] = useState("");
  const [activeSlide, setActiveSlide] = useState<SlideId>("cover");
  const [coverRenderIndex, setCoverRenderIndex] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // BUG-ST32: slides + PDF follow the user's locale; the sidebar can override it
  const uiLocale = useLocale();
  const [localeOverride, setLocaleOverride] = useState<string | null>(null);
  const locale = toPresentationLocale(localeOverride ?? uiLocale);
  const t = useMemo(() => presentationT(locale), [locale]);

  // Next steps: translated defaults until the user edits a step
  const [editedSteps, setEditedSteps] = useState<Record<number, NextStep>>({});
  const nextSteps = defaultNextSteps(t).map((d, i) => editedSteps[i] ?? d);

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  // BUG-ST31: the one cost function (same total as Finalize + dashboard)
  const [selectedProducts, setSelectedProductsState] = useState<SelectedProduct[]>([]);
  useEffect(() => {
    setSelectedProductsState(getSelectedProducts());
    return subscribeSelectedProducts(() => setSelectedProductsState(getSelectedProducts()));
  }, []);
  const cost = computeProjectCost({ modules, finishLevel, selectedProducts });

  const style = styleDirection ? getStyleDirection(styleDirection) : null;
  const tmpl = { id: template, ...TEMPLATES[template], label: t(`template.${template}.label`) };
  const finishName = t.finish(finishLevel);
  const styleName = style?.label || t("common.defaultStyle");
  const enabledSlides = slides.filter((s) => s.enabled);
  const isOn = (id: SlideId) => activeSlide === id && slides.find((s) => s.id === id)?.enabled;
  const num = (id: SlideId) => enabledSlides.findIndex((s) => s.id === id) + 1;

  const toggleSlide = useCallback((id: SlideId) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }, []);

  // High-quality PDF export via modular engine (html2canvas + jsPDF)
  const [exporting, setExporting] = useState(false);
  const handleHtmlExport = useCallback(async () => {
    setExporting(true);
    try {
      const { getDefaultEngine } = await import("../engines");
      const engine = getDefaultEngine();
      const slideEls = Array.from(document.querySelectorAll<HTMLElement>("[data-slide='true']"));
      if (slideEls.length === 0) return;
      await engine.exportSlides(slideEls, {
        format: "pdf",
        scale: 2,
        orientation: "landscape",
        filename: presentationFileName(projectName).replace(/\.pdf$/, ""),
      });
    } finally {
      setExporting(false);
    }
  }, [projectName]);

  const handleShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    alert(t("ui.linkCopied"));
  }, [t]);

  if (modules.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t("ui.noModules")}</p>
          <Link href={`/project/${projectId}/land`} className="mt-4 inline-block rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white">
            {t("ui.goStep1")}
          </Link>
        </div>
      </div>
    );
  }

  /** Props every slide receives (SlideContext) */
  const ctx: SlideContext = {
    template: tmpl,
    t,
    projectName,
    clientName,
    moduleCount: modules.length,
    totalAreaSqm: cost.totalArea,
    usableAreaSqm: cost.usableArea,
    styleName,
    finishName,
    savedRenders,
    coverRenderIndex,
    setCoverRenderIndex,
  };

  const moodImages = moodboardPins.length > 0
    ? moodboardPins.map((pin) => ({ imageUrl: pin.imageUrl, label: pin.label }))
    : (style?.moodImages || []).map((img) => ({ imageUrl: img.url, label: img.label }));

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
              {t("ui.shareLink")}
            </button>
          </FeatureGate>
          <FeatureGate requires="pdfPresentation" hideIfLocked>
            <button
              onClick={handleHtmlExport}
              disabled={exporting}
              className="rounded-lg border border-brand-olive-700 px-4 py-2 text-xs font-semibold text-brand-olive-700 hover:bg-brand-olive-50 transition-colors disabled:opacity-50"
            >
              {exporting ? t("ui.exporting") : t("ui.exportHd")}
            </button>
          </FeatureGate>
          <FeatureGate requires="pdfPresentation" hideIfLocked>
          <Suspense fallback={<span className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white opacity-50">{t("ui.loading")}</span>}>
            <PdfDownloadButton
              template={template}
              slides={slides.map((s) => ({ ...s, label: t(`slide.${s.id}.label`) }))}
              projectName={projectName}
              clientName={clientName}
              locale={locale}
              modules={modules}
              cost={cost}
              style={style ?? null}
              finishLevel={finishLevel}
              polygon={polygon}
              mapCenter={mapCenter}
              savedRenders={savedRenders}
              nextSteps={nextSteps}
              isFreeUser={userTier === "free"}
            />
          </Suspense>
          </FeatureGate>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Settings */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 print:hidden hidden md:block">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("ui.settings")}</h3>

          {/* Presentation language (BUG-ST32) */}
          <div className="mb-4">
            <label htmlFor="presentation-locale" className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">{t("ui.language")}</label>
            <select
              id="presentation-locale"
              value={locale}
              onChange={(e) => setLocaleOverride(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            >
              {PRESENTATION_LOCALES.map((l) => (
                <option key={l} value={l}>{LOCALE_LABELS[l].flag} {LOCALE_LABELS[l].native}</option>
              ))}
            </select>
          </div>

          {/* Project Name */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">{t("ui.projectName")}</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          {/* Client Name */}
          <div className="mb-4">
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">{t("ui.clientName")}</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={t("ui.clientPlaceholder")}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-brand-amber-500 focus:outline-none"
            />
          </div>

          {/* Template Selector */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">{t("ui.template")}</label>
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
                    <span className="text-xs font-semibold text-gray-800">{t(`template.${key}.label`)}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">{t(`template.${key}.desc`)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slide Toggle */}
          <div className="mb-5">
            <label className="mb-2 block text-[10px] font-bold text-gray-400 uppercase">
              {t("ui.slidesCount", { enabled: enabledSlides.length, total: slides.length })}
            </label>
            <div className="space-y-1">
              {slides.map((slide) => (
                <label
                  key={slide.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <span className="text-xs font-medium text-gray-700">{t(`slide.${slide.id}.label`)}</span>
                    <p className="text-[9px] text-gray-400">{t(`slide.${slide.id}.desc`)}</p>
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
              &larr; {t("ui.backToFinalize")}
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
                {i + 1}. {t(`slide.${slide.id}.label`)}
              </button>
            ))}
          </div>

          {/* Slide Preview Area */}
          <div ref={previewRef} className="mx-auto" style={{ maxWidth: 900 }}>
            {(activeSlide === "cover" || typeof window !== "undefined" && window.matchMedia("print").matches) && slides.find((s) => s.id === "cover")?.enabled && (
              <CoverSlide {...ctx} />
            )}
            {isOn("description") && (
              <DescriptionSlide
                {...ctx}
                slideNumber={num("description")}
                moduleTypes={modules.map((m) => m.moduleType)}
                totalEstimateEur={cost.grandTotal}
                styleTagline={style?.tagline}
              />
            )}
            {isOn("site") && (
              <SiteSlide
                {...ctx}
                slideNumber={num("site")}
                modules={modules}
                mapCenter={mapCenter}
                polygonCount={polygon.length}
                gridRotation={gridRotation}
              />
            )}
            {isOn("floorplan") && (
              <FloorplanSlide {...ctx} slideNumber={num("floorplan")} gridCells={gridCells} modules={modules} />
            )}
            {isOn("vision") && (
              <VisionSlide
                {...ctx}
                slideNumber={num("vision")}
                styleDescription={style?.description}
                palette={style?.palette || []}
                moodImages={moodImages}
              />
            )}
            {isOn("modules") && <ModulesSlide {...ctx} slideNumber={num("modules")} modules={modules} />}
            {isOn("renders") && <RendersSlide {...ctx} slideNumber={num("renders")} renders={savedRenders} />}
            {isOn("materials") && (
              <MaterialsSlide {...ctx} slideNumber={num("materials")} modules={modules} textures={MATERIAL_TEXTURES} />
            )}
            {isOn("products") && (
              <ProductsSlide {...ctx} slideNumber={num("products")} lines={cost.productLines} productCost={cost.productCost} />
            )}
            {isOn("cost") && <CostSlide {...ctx} slideNumber={num("cost")} cost={cost} />}
            {isOn("next") && (
              <NextStepsEditSlide
                template={tmpl}
                t={t}
                number={num("next")}
                steps={nextSteps}
                onChange={(i, step) => setEditedSteps((prev) => ({ ...prev, [i]: step }))}
              />
            )}
          </div>
        </main>

        {/* Right Sidebar — Slide Navigator */}
        <aside className="hidden md:block w-56 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 print:hidden">
          <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t("ui.slides")}</h3>
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
                    {t(`slide.${slide.id}.label`)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{t("ui.quickStats")}</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>{t("ui.statModules")}</span><span className="font-medium">{modules.length}</span></div>
              <div className="flex justify-between"><span>{t("ui.statArea")}</span><span className="font-medium">{cost.totalArea} m²</span></div>
              <div className="flex justify-between"><span>{t("ui.statStyle")}</span><span className="font-medium">{styleName}</span></div>
              <div className="flex justify-between"><span>{t("ui.statTotal")}</span><span className="font-bold text-brand-amber-600">{t.eur(cost.grandTotal)}</span></div>
            </div>
          </div>
        </aside>
      </div>
      <MobileStepFooter activeStep={12} />
    </div>
  );
}
