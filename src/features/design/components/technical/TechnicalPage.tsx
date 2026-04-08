"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES } from "@/shared/types";
import { FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import StepNav from "../shared/StepNav";
import TechnicalDrawing from "./TechnicalDrawing";
import {
  findDrawingSvg,
  downloadPdf,
  downloadSvg,
  printDrawing,
} from "./exportDrawing";
import KnowledgeBasePanel from "./KnowledgeBasePanel";
import PermitTracker from "./PermitTracker";
import DrawingPresentation from "./DrawingPresentation";
import FeatureGate from "@/shared/components/FeatureGate";


const DRAWING_TYPES = [
  { id: "floor-plan", label: "Floor Plan" },
  { id: "section-aa", label: "Section A-A" },
  { id: "front-elevation", label: "Front Elevation" },
  { id: "wall-detail", label: "Wall Detail" },
  { id: "mep-plan", label: "MEP Plan" },
  { id: "foundation-detail", label: "Foundation Detail" },
];

const WALL_LAYERS = [
  { material: "Exterior Cladding", thickness: "20mm" },
  { material: "Air Gap", thickness: "25mm" },
  { material: "Mineral Wool Insulation", thickness: "120mm" },
  { material: "Steel Frame (SIP)", thickness: "80mm" },
  { material: "Vapour Barrier", thickness: "5mm" },
  { material: "Interior Finish", thickness: "15mm" },
];

export default function TechnicalPage() {
  const {
    modules,
    selectedModule,
    setSelectedModule,
    setModulesFromGrid,
    loadFromLocalStorage,
  } = useDesignStore();

  const { gridCells, gridRotation } = useLandStore();

  const { saved, handleSave } = useSaveDesign();
  const [activeDrawing, setActiveDrawing] = useState("floor-plan");
  const [zoom, setZoom] = useState(100);
  const [kbOpen, setKbOpen] = useState(false);
  const [permitOpen, setPermitOpen] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"none" | "drawings" | "specs">("none");
  const drawingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  // Default to first module if none selected
  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  const currentMod = selectedModule
    ? modules.find(
        (m) => m.row === selectedModule.row && m.col === selectedModule.col
      )
    : null;

  const getSvg = useCallback(() => findDrawingSvg(drawingRef.current), []);

  const handleDownloadPdf = useCallback(async () => {
    const svg = getSvg();
    if (!svg) return;
    const label = currentMod?.label ?? "drawing";
    await downloadPdf(svg, `MCA-${label}-${activeDrawing}.pdf`);
  }, [getSvg, currentMod?.label, activeDrawing]);

  const handleDownloadSvg = useCallback(() => {
    const svg = getSvg();
    if (!svg) return;
    const label = currentMod?.label ?? "drawing";
    downloadSvg(svg, `MCA-${label}-${activeDrawing}.svg`);
  }, [getSvg, currentMod?.label, activeDrawing]);

  const handlePrint = useCallback(() => {
    const svg = getSvg();
    if (svg) printDrawing(svg);
  }, [getSvg]);

  const floorMat = currentMod
    ? FLOOR_MATERIALS.find((f) => f.id === currentMod.floorFinish)
    : null;
  const wallMat = currentMod
    ? WALL_MATERIALS.find((w) => w.id === currentMod.wallColor)
    : null;

  const isKitchenOrBathroom =
    currentMod?.moduleType === "kitchen" ||
    currentMod?.moduleType === "bathroom";

  if (modules.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No modules configured yet.</p>
          <Link
            href="/project/demo/land"
            className="mt-4 inline-block rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Go to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ── Top Nav ── */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={8} />
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}>
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      {/* ── Module selector bar ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 md:px-6 py-2 md:py-3 overflow-x-auto">
        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
          const isActive =
            selectedModule?.row === mod.row && selectedModule?.col === mod.col;
          return (
            <button
              key={`${mod.row}-${mod.col}`}
              onClick={() =>
                setSelectedModule({ row: mod.row, col: mod.col })
              }
              className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-amber-500 bg-brand-amber-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: mt?.color || "#888" }}
              />
              <span
                className={
                  isActive
                    ? "font-semibold text-brand-teal-800"
                    : "text-gray-600"
                }
              >
                {mod.label}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/project/demo/render"
            className="text-sm text-gray-500 hover:text-brand-teal-800"
          >
            &larr; Back to Render
          </Link>
          <button
            onClick={handleDownloadPdf}
            className="rounded-lg border border-brand-amber-500 px-3 py-2 text-sm font-semibold text-brand-amber-600 hover:bg-brand-amber-50"
          >
            Export PDF
          </button>
          <Link
            href="/project/demo/walkthrough"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Walkthrough &rarr;
          </Link>
        </div>
      </div>

      {/* ── Main Content (3-column) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left Sidebar ── */}
        <aside className={`w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 hidden md:block`}>
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Drawing Set
          </h3>

          {/* Drawing type list */}
          <div className="mb-5 space-y-1">
            {DRAWING_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => setActiveDrawing(dt.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeDrawing === dt.id
                    ? "bg-brand-teal-800 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>

          {/* Drawing info */}
          <div className="mb-5 rounded-lg bg-gray-50 p-3 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase">
              Drawing Info
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Scale</span>
              <span className="font-medium">1:25</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Sheet Size</span>
              <span className="font-medium">A3</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Drawing No.</span>
              <span className="font-medium">
                MCA-{currentMod?.label || "---"}-01
              </span>
            </div>
          </div>

          {/* Drawing Standards */}
          <div className="mb-5 rounded-lg bg-gray-50 p-3 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase">
              Drawing Standards
            </div>
            <div className="text-xs text-gray-600">ISO 128</div>
            <div className="text-xs text-gray-600">
              Module: 3000 &times; 3000mm
            </div>
          </div>

          {/* Print/Export buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePrint}
              className="w-full rounded-lg border border-brand-teal-800 px-4 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Drawing
              </span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
            >
              Export All Sheets
            </button>
            <FeatureGate requires="drawingPresentation">
            <button
              onClick={() => setPresentationOpen(true)}
              className="w-full rounded-lg border border-brand-teal-800 px-4 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                View All Drawings
              </span>
            </button>
            </FeatureGate>
          </div>

          {/* Knowledge Base / Construction Manual */}
          <div className="mt-5 pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setKbOpen(true)}
              className="w-full rounded-lg border-2 border-dashed border-brand-teal-300 bg-brand-teal-50/50 px-4 py-3 text-left hover:border-brand-teal-500 hover:bg-brand-teal-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-brand-teal-800 group-hover:text-brand-teal-900">
                    Construction Manual
                  </div>
                  <div className="text-[10px] text-brand-teal-600 mt-0.5">
                    Standards, dimensions, regulations
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPermitOpen(true)}
              className="w-full rounded-lg border-2 border-dashed border-brand-amber-300 bg-brand-amber-50/50 px-4 py-3 text-left hover:border-brand-amber-500 hover:bg-brand-amber-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-brand-amber-700 group-hover:text-brand-amber-800">
                    Permit Tracker
                  </div>
                  <div className="text-[10px] text-brand-amber-600 mt-0.5">
                    Building authorization process
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* AI Architect Consultant */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/project/demo/consultant"
              className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brand-olive-300 bg-brand-olive-50 p-3 group hover:border-brand-olive-500 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-olive-100 text-lg group-hover:bg-brand-olive-200 transition-colors">
                📐
              </div>
              <div>
                <div className="text-xs font-bold text-brand-olive-700 group-hover:text-brand-olive-800">
                  AI Architect Consultant
                </div>
                <div className="text-[10px] text-brand-olive-600 mt-0.5">
                  Neufert-based planning advice
                </div>
              </div>
            </Link>
          </div>
        </aside>

        {/* ── Center — Drawing Display ── */}
        <main
          className="flex-1 overflow-auto relative"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div
            className="flex items-center justify-center p-8"
            style={{ minHeight: "100%" }}
          >
            <div
              ref={drawingRef}
              className="bg-white shadow-xl rounded-sm border border-gray-200"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
            >
              {currentMod && (
                <TechnicalDrawing
                  module={currentMod}
                  drawingType={activeDrawing}
                  projectName="ModulCA Project"
                />
              )}
            </div>
          </div>

          {/* Zoom controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-md border border-gray-200 backdrop-blur-sm">
            <button
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
              className="rounded px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-xs font-medium text-gray-700 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="rounded px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button
              onClick={() => setZoom(100)}
              className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              Fit
            </button>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 hidden md:block">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Specifications
          </h3>

          {currentMod && (
            <div className="space-y-5">
              {/* Module specs */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Module Dimensions
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Exterior Size</span>
                  <span className="font-medium">3000 &times; 3000mm</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Interior Area</span>
                  <span className="font-medium">
                    7m&sup2; (2400 &times; 2400mm)
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Wall Thickness</span>
                  <span className="font-medium">300mm</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Ceiling Height</span>
                  <span className="font-medium">2700mm</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Floor Slab</span>
                  <span className="font-medium">200mm</span>
                </div>
              </div>

              {/* Materials */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Materials
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-gray-200"
                    style={{
                      backgroundColor: floorMat?.color || "#D4A76A",
                    }}
                  />
                  <span className="text-xs text-gray-700">
                    Floor: {floorMat?.label || currentMod.floorFinish}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-gray-200"
                    style={{
                      backgroundColor: wallMat?.color || "#F0EDE5",
                    }}
                  />
                  <span className="text-xs text-gray-700">
                    Walls: {wallMat?.label || currentMod.wallColor}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Insulation: Mineral Wool 120mm
                </div>
              </div>

              {/* Structural info */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Structural
                </div>
                <div className="text-xs text-gray-600">
                  Frame: Galvanized Steel
                </div>
                <div className="text-xs text-gray-600">
                  Panels: SIP (Structural Insulated Panels)
                </div>
                <div className="text-xs text-gray-600">
                  Foundation: Screw Pile / Pad
                </div>
                <div className="text-xs text-gray-600">
                  Roof: Flat, EPDM Membrane
                </div>
              </div>

              {/* MEP summary */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  MEP Summary
                </div>
                <div className="text-xs text-gray-600">
                  Electrical: {isKitchenOrBathroom ? "6" : "4"} outlets, 1 switch
                  panel
                </div>
                <div className="text-xs text-gray-600">
                  Lighting: LED recessed, {isKitchenOrBathroom ? "4" : "2"} points
                </div>
                {isKitchenOrBathroom && (
                  <>
                    <div className="text-xs text-gray-600">
                      Plumbing:{" "}
                      {currentMod.moduleType === "kitchen"
                        ? "Hot/cold supply, waste drain"
                        : "Hot/cold supply, waste drain, vent stack"}
                    </div>
                    <div className="text-xs text-gray-600">
                      Water points:{" "}
                      {currentMod.moduleType === "kitchen" ? "1 (sink)" : "3 (shower, vanity, toilet)"}
                    </div>
                  </>
                )}
                <div className="text-xs text-gray-600">
                  HVAC: Mini-split duct connection
                </div>
              </div>

              {/* Layer buildup table */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Wall Layer Buildup
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1 font-medium text-gray-500">
                        Layer
                      </th>
                      <th className="text-right py-1 font-medium text-gray-500">
                        Thickness
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {WALL_LAYERS.map((layer, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-1 text-gray-600">
                          {layer.material}
                        </td>
                        <td className="py-1 text-right text-gray-600 font-medium">
                          {layer.thickness}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300">
                      <td className="py-1 font-semibold text-gray-700">
                        Total
                      </td>
                      <td className="py-1 text-right font-semibold text-gray-700">
                        265mm
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Compliance notes */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Compliance
                </div>
                <div className="text-xs text-gray-600">
                  EN 1090 Steel Structures
                </div>
                <div className="text-xs text-gray-600">
                  EN 14509 SIP Panels
                </div>
                <div className="text-xs text-gray-600">
                  Passive House Compatible
                </div>
                <div className="text-xs text-gray-600">
                  Fire Rating: REI 60
                </div>
              </div>

              {/* Download buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleDownloadSvg}
                  className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
                >
                  Download SVG
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile FABs — visible only on small screens */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden z-40">
        <button
          onClick={() => setMobilePanel(mobilePanel === "drawings" ? "none" : "drawings")}
          className="h-12 w-12 rounded-full bg-brand-teal-800 text-white shadow-lg flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => setMobilePanel(mobilePanel === "specs" ? "none" : "specs")}
          className="h-12 w-12 rounded-full bg-brand-amber-500 text-white shadow-lg flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Mobile slide-over panels */}
      {mobilePanel !== "none" && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobilePanel("none")} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto p-4">
            <button
              onClick={() => setMobilePanel("none")}
              className="mb-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {mobilePanel === "drawings" && (
              <>
                <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase">Drawing Set</h3>
                <div className="space-y-1">
                  {DRAWING_TYPES.map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => { setActiveDrawing(dt.id); setMobilePanel("none"); }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        activeDrawing === dt.id
                          ? "bg-brand-teal-800 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <button onClick={() => { handlePrint(); setMobilePanel("none"); }} className="w-full rounded-lg border border-brand-teal-800 py-2 text-sm font-semibold text-brand-teal-800">
                    Print Drawing
                  </button>
                  <button onClick={() => { handleDownloadPdf(); setMobilePanel("none"); }} className="w-full rounded-lg bg-brand-amber-500 py-2 text-sm font-bold text-white">
                    Export PDF
                  </button>
                  <button onClick={() => { setPresentationOpen(true); setMobilePanel("none"); }} className="w-full rounded-lg border border-brand-teal-800 py-2 text-sm font-semibold text-brand-teal-800">
                    View All Drawings
                  </button>
                  <button onClick={() => { setKbOpen(true); setMobilePanel("none"); }} className="w-full rounded-lg border border-dashed border-brand-teal-300 py-2 text-sm font-bold text-brand-teal-800">
                    Construction Manual
                  </button>
                  <button onClick={() => { setPermitOpen(true); setMobilePanel("none"); }} className="w-full rounded-lg border border-dashed border-brand-amber-300 py-2 text-sm font-bold text-brand-amber-700">
                    Permit Tracker
                  </button>
                </div>
              </>
            )}
            {mobilePanel === "specs" && currentMod && (
              <>
                <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase">Specifications</h3>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex justify-between"><span>Exterior</span><span className="font-medium">3000 x 3000mm</span></div>
                  <div className="flex justify-between"><span>Interior</span><span className="font-medium">2400 x 2400mm</span></div>
                  <div className="flex justify-between"><span>Wall</span><span className="font-medium">300mm</span></div>
                  <div className="flex justify-between"><span>Ceiling</span><span className="font-medium">2700mm</span></div>
                  <div className="flex justify-between"><span>Floor</span><span className="font-medium">{floorMat?.label || currentMod.floorFinish}</span></div>
                  <div className="flex justify-between"><span>Walls</span><span className="font-medium">{wallMat?.label || currentMod.wallColor}</span></div>
                </div>
                <div className="mt-4 space-y-2">
                  <button onClick={() => { handleDownloadSvg(); setMobilePanel("none"); }} className="w-full rounded-lg bg-brand-amber-500 py-2 text-sm font-bold text-white">
                    Download SVG
                  </button>
                  <button onClick={() => { handleDownloadPdf(); setMobilePanel("none"); }} className="w-full rounded-lg bg-brand-amber-500 py-2 text-sm font-bold text-white">
                    Download PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Base slide-over panel */}
      <KnowledgeBasePanel open={kbOpen} onClose={() => setKbOpen(false)} />

      {/* Building Permit Tracker slide-over panel */}
      <PermitTracker open={permitOpen} onClose={() => setPermitOpen(false)} />

      {/* Full-screen drawing presentation */}
      <DrawingPresentation open={presentationOpen} onClose={() => setPresentationOpen(false)} />
    </div>
  );
}
