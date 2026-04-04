"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDesignStore } from "../../store";
import { useSaveDesign } from "../../hooks/useSaveDesign";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES } from "@/shared/types";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import { getStyleDirection } from "../../styles";
import { Vector3 } from "three";
import StepNav from "../shared/StepNav";

const WalkthroughScene = dynamic(() => import("./WalkthroughScene"), {
  ssr: false,
});

const MODULE_SIZE = 3;

type WalkthroughQuality = "standard" | "enhanced" | "gaussian";

const WALKTHROUGH_ENGINES: Record<WalkthroughQuality, { label: string; description: string; badge?: string }> = {
  standard: {
    label: "Standard (Three.js)",
    description: "Default 3D walkthrough",
  },
  enhanced: {
    label: "Enhanced (Post-Processing)",
    description: "Better lighting, shadows, and ambient occlusion",
    badge: "FREE",
  },
  gaussian: {
    label: "Premium (Gaussian Splatting)",
    description: "Photorealistic walkthrough from captured scenes",
    badge: "COMING SOON",
  },
};


/* ------------------------------------------------------------------ */
/*  Minimap SVG                                                        */
/* ------------------------------------------------------------------ */

function Minimap({
  modules,
  cameraX,
  cameraZ,
}: {
  modules: { row: number; col: number; moduleType: string }[];
  cameraX: number;
  cameraZ: number;
}) {
  if (modules.length === 0) return null;

  const minRow = Math.min(...modules.map((m) => m.row));
  const maxRow = Math.max(...modules.map((m) => m.row));
  const minCol = Math.min(...modules.map((m) => m.col));
  const maxCol = Math.max(...modules.map((m) => m.col));

  const cols = maxCol - minCol + 1;
  const rows = maxRow - minRow + 1;
  const cellSize = 28;
  const padding = 12;
  const w = cols * cellSize + padding * 2;
  const h = rows * cellSize + padding * 2;

  // Camera dot position in SVG space
  const camSvgX = padding + ((cameraX / MODULE_SIZE) - minCol) * cellSize;
  const camSvgY = padding + ((cameraZ / MODULE_SIZE) - minRow) * cellSize;

  return (
    <svg
      width={w}
      height={h}
      className="rounded-lg border border-gray-200 bg-gray-50"
    >
      {modules.map((mod) => {
        const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
        const rx = padding + (mod.col - minCol) * cellSize;
        const ry = padding + (mod.row - minRow) * cellSize;
        return (
          <rect
            key={`${mod.row}-${mod.col}`}
            x={rx + 1}
            y={ry + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            rx={3}
            fill={mt?.color || "#ccc"}
            opacity={0.6}
          />
        );
      })}
      {/* Camera dot */}
      <circle
        cx={camSvgX}
        cy={camSvgY}
        r={4}
        fill="#f59e0b"
        stroke="#fff"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function WalkthroughPage() {
  const { gridCells, gridRotation } = useLandStore();
  const {
    modules,
    setModulesFromGrid,
    selectedModule,
    setSelectedModule,
    styleDirection,
    loadFromLocalStorage,
  } = useDesignStore();

  const { saved, handleSave } = useSaveDesign();
  const controlsRef = useRef<any>(null);
  const cameraPositionRef = useRef<Vector3>(
    new Vector3(0, 1.6, 0),
  );

  const [teleportTarget, setTeleportTarget] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [cameraPos, setCameraPos] = useState({ x: 0, z: 0 });
  const [shareCopied, setShareCopied] = useState(false);
  const [recordTooltip, setRecordTooltip] = useState(false);
  const [walkthroughQuality, setWalkthroughQuality] = useState<WalkthroughQuality>("standard");
  const [autoTour, setAutoTour] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"none" | "controls" | "room">("none");

  useEffect(() => {
    if (modules.length === 0) loadFromLocalStorage();
  }, [loadFromLocalStorage, modules.length]);

  useEffect(() => {
    if (modules.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, gridCells, gridRotation, setModulesFromGrid]);

  // Default select first module
  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule({ row: modules[0].row, col: modules[0].col });
    }
  }, [modules, selectedModule, setSelectedModule]);

  // Poll camera position for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      const p = cameraPositionRef.current;
      setCameraPos((prev) => {
        if (
          Math.abs(prev.x - p.x) > 0.05 ||
          Math.abs(prev.z - p.z) > 0.05
        ) {
          return { x: p.x, z: p.z };
        }
        return prev;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Detect current room based on camera position
  const currentRoom = useMemo(() => {
    return modules.find((m) => {
      const ox = m.col * MODULE_SIZE;
      const oz = m.row * MODULE_SIZE;
      return (
        cameraPos.x >= ox &&
        cameraPos.x <= ox + MODULE_SIZE &&
        cameraPos.z >= oz &&
        cameraPos.z <= oz + MODULE_SIZE
      );
    });
  }, [modules, cameraPos]);

  const currentRoomType = currentRoom
    ? MODULE_TYPES.find((mt) => mt.id === currentRoom.moduleType)
    : null;

  const currentPreset = currentRoom
    ? getPreset(currentRoom.moduleType, currentRoom.layoutPreset)
    : null;

  const currentFloor = currentRoom
    ? FLOOR_MATERIALS.find((f) => f.id === currentRoom.floorFinish)
    : null;

  const currentWall = currentRoom
    ? WALL_MATERIALS.find((w) => w.id === currentRoom.wallColor)
    : null;

  // Style direction mood images
  const styleDir = styleDirection
    ? getStyleDirection(styleDirection)
    : null;
  const moodImages = styleDir?.moodImages?.slice(0, 2) || [];

  const handleTeleport = useCallback(
    (row: number, col: number) => {
      setTeleportTarget({ row, col });
    },
    [],
  );

  const handleTeleportDone = useCallback(() => {
    setTeleportTarget(null);
  }, []);

  const handleStartTour = useCallback(() => {
    controlsRef.current?.lock();
  }, []);

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
        <button onClick={handleSave} className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${saved ? "bg-green-600" : "bg-brand-teal-800 hover:bg-brand-teal-700"}`}>
          {saved ? "Saved!" : "Save"}
        </button>
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
            href="/project/demo/technical"
            className="text-sm text-gray-500 hover:text-brand-teal-800"
          >
            &larr; Back to Technical
          </Link>
          <Link
            href="/project/demo/products"
            className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600"
          >
            Products &amp; Shop &rarr;
          </Link>
        </div>
      </div>

      {/* ── Main Content (3-column) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 hidden md:block">
          <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Walkthrough
          </h3>

          {/* Instructions */}
          <div className="mb-4 rounded-lg bg-brand-teal-800/5 p-3 space-y-2">
            <p className="text-xs font-bold text-brand-teal-800">How to walk:</p>
            <ol className="text-xs text-gray-600 leading-relaxed space-y-1 list-decimal list-inside">
              <li>Click <strong>&quot;Start Tour&quot;</strong> or click on the 3D view</li>
              <li>Use <strong>WASD</strong> or <strong>Arrow keys</strong> to move</li>
              <li>Move <strong>mouse</strong> to look around</li>
              <li>Walk freely through rooms — no wall collision</li>
              <li>Press <strong>Esc</strong> to release cursor</li>
            </ol>
            <p className="text-[10px] text-brand-amber-600 font-medium">
              💡 Click on any room name below to teleport there instantly
            </p>
          </div>

          {/* Start Tour buttons */}
          <div className="mb-4 space-y-2">
            <button
              onClick={handleStartTour}
              className="w-full rounded-lg bg-brand-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors"
            >
              Start Free Walk
            </button>
            <button
              onClick={() => setAutoTour(true)}
              disabled={autoTour}
              className={`w-full rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                autoTour
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-brand-teal-800 text-brand-teal-800 hover:bg-brand-teal-50"
              }`}
            >
              {autoTour ? "Touring..." : "Auto-Guided Tour"}
            </button>
          </div>

          {/* 3D Engine Quality Selector */}
          <div className="mb-5">
            <label className="mb-1 block text-[10px] font-bold text-gray-400 uppercase">3D Engine</label>
            <select
              value={walkthroughQuality}
              onChange={(e) => setWalkthroughQuality(e.target.value as WalkthroughQuality)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-brand-amber-500 focus:outline-none focus:ring-1 focus:ring-brand-amber-500"
            >
              {(Object.keys(WALKTHROUGH_ENGINES) as WalkthroughQuality[]).map((key) => (
                <option key={key} value={key} disabled={key === "gaussian"}>
                  {WALKTHROUGH_ENGINES[key].label}
                  {WALKTHROUGH_ENGINES[key].badge ? ` [${WALKTHROUGH_ENGINES[key].badge}]` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-gray-400">{WALKTHROUGH_ENGINES[walkthroughQuality].description}</p>
            {walkthroughQuality === "gaussian" && (
              <p className="mt-1 text-[10px] text-brand-amber-600">
                Gaussian Splatting will be available in the premium tier.
                Uses photorealistic 3D captured from real photos.
              </p>
            )}
          </div>

          {/* Room list */}
          <div className="mb-5">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Rooms
            </div>
            <div className="space-y-1">
              {modules.map((mod) => {
                const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
                const isCurrent =
                  currentRoom?.row === mod.row &&
                  currentRoom?.col === mod.col;
                return (
                  <button
                    key={`room-${mod.row}-${mod.col}`}
                    onClick={() => handleTeleport(mod.row, mod.col)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      isCurrent
                        ? "bg-brand-amber-50 border border-brand-amber-300"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: mt?.color || "#888" }}
                    />
                    <span
                      className={
                        isCurrent
                          ? "font-semibold text-brand-teal-800"
                          : "text-gray-600"
                      }
                    >
                      {mod.label}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[9px] font-bold text-brand-amber-500 uppercase">
                        Here
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimap */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Map
            </div>
            <div className="flex justify-center">
              <Minimap
                modules={modules}
                cameraX={cameraPos.x}
                cameraZ={cameraPos.z}
              />
            </div>
          </div>

          {/* Controls reference */}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              Controls
            </div>
            <div className="space-y-1 text-[10px] text-gray-500">
              <div>
                <span className="inline-block w-8 rounded bg-gray-200 px-1 py-0.5 text-center font-mono text-[9px]">
                  W
                </span>{" "}
                Forward
              </div>
              <div>
                <span className="inline-block w-8 rounded bg-gray-200 px-1 py-0.5 text-center font-mono text-[9px]">
                  S
                </span>{" "}
                Backward
              </div>
              <div>
                <span className="inline-block w-8 rounded bg-gray-200 px-1 py-0.5 text-center font-mono text-[9px]">
                  A
                </span>{" "}
                Strafe left
              </div>
              <div>
                <span className="inline-block w-8 rounded bg-gray-200 px-1 py-0.5 text-center font-mono text-[9px]">
                  D
                </span>{" "}
                Strafe right
              </div>
              <div>
                <span className="inline-block w-10 rounded bg-gray-200 px-1 py-0.5 text-center font-mono text-[9px]">
                  Esc
                </span>{" "}
                Release cursor
              </div>
            </div>
          </div>
        </aside>

        {/* ── Center — 3D Scene ── */}
        <main className="flex-1 overflow-hidden relative">
          <WalkthroughScene
            teleportTarget={teleportTarget}
            onTeleportDone={handleTeleportDone}
            controlsRef={controlsRef}
            cameraPositionRef={cameraPositionRef}
            enhanced={walkthroughQuality === "enhanced"}
            autoTour={autoTour}
            onAutoTourFinished={() => setAutoTour(false)}
          />

          {/* Crosshair overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 opacity-30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <line x1="12" y1="4" x2="12" y2="20" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            </div>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4 hidden md:block">
          <h3 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Current Room
          </h3>

          {currentRoom ? (
            <div className="space-y-4">
              {/* Room identity */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded"
                    style={{
                      backgroundColor: currentRoomType?.color || "#888",
                    }}
                  />
                  <span className="text-sm font-semibold text-brand-teal-800">
                    {currentRoom.label}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Type</span>
                  <span className="font-medium">
                    {currentRoomType?.label || currentRoom.moduleType}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Layout</span>
                  <span className="font-medium">
                    {currentPreset?.label || currentRoom.layoutPreset}
                  </span>
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
                      backgroundColor: currentFloor?.color || "#D4A76A",
                    }}
                  />
                  <span className="text-xs text-gray-700">
                    Floor: {currentFloor?.label || currentRoom.floorFinish}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-gray-200"
                    style={{
                      backgroundColor: currentWall?.color || "#F0EDE5",
                    }}
                  />
                  <span className="text-xs text-gray-700">
                    Walls: {currentWall?.label || currentRoom.wallColor}
                  </span>
                </div>
              </div>

              {/* Furniture count */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Furniture
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Pieces</span>
                  <span className="font-medium">
                    {currentPreset?.furniture.length || 0}
                  </span>
                </div>
                {currentPreset?.furniture.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <div
                      className="h-3 w-3 rounded border border-gray-200"
                      style={{
                        backgroundColor:
                          (currentRoom.furnitureOverrides[currentRoom.layoutPreset] ?? {})[f.id]?.color ||
                          f.color,
                      }}
                    />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Style mood images */}
              {moodImages.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-3 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Style: {styleDir?.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {moodImages.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400">
                Walk into a room to see its details
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {shareCopied ? "Copied!" : "Share Walkthrough"}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setRecordTooltip(true);
                  setTimeout(() => setRecordTooltip(false), 3000);
                }}
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Record Video
                </span>
              </button>
              {recordTooltip && (
                <div className="absolute left-0 right-0 mt-1 rounded-lg bg-brand-teal-800 px-3 py-2 text-center text-xs text-white shadow-lg">
                  Video recording coming soon — Premium feature
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile floating controls — visible only on small screens */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-40">
        <button
          onClick={handleStartTour}
          className="rounded-full bg-brand-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg"
        >
          Start Tour
        </button>
        <button
          onClick={() => setAutoTour(true)}
          disabled={autoTour}
          className={`rounded-full px-4 py-3 text-sm font-bold shadow-lg ${
            autoTour ? "bg-green-500 text-white" : "bg-white text-brand-teal-800 border border-gray-200"
          }`}
        >
          {autoTour ? "Touring..." : "Auto Tour"}
        </button>
      </div>

      {/* Mobile room list FAB */}
      <div className="fixed top-20 right-3 md:hidden z-40">
        <button
          onClick={() => setMobilePanel(mobilePanel === "controls" ? "none" : "controls")}
          className="h-10 w-10 rounded-full bg-brand-teal-800 text-white shadow-lg flex items-center justify-center text-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile slide-over for room list */}
      {mobilePanel !== "none" && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobilePanel("none")} />
          <div className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-white shadow-xl overflow-y-auto p-4">
            <button onClick={() => setMobilePanel("none")} className="mb-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="mb-3 text-xs font-bold text-gray-500 uppercase">Rooms</h3>
            <div className="space-y-1">
              {modules.map((mod) => {
                const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
                const isCurrent = currentRoom?.row === mod.row && currentRoom?.col === mod.col;
                return (
                  <button
                    key={`mob-${mod.row}-${mod.col}`}
                    onClick={() => { handleTeleport(mod.row, mod.col); setMobilePanel("none"); }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      isCurrent ? "bg-brand-amber-50 font-semibold text-brand-teal-800" : "text-gray-600"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: mt?.color || "#888" }} />
                    <span>{mod.label}</span>
                    {isCurrent && <span className="ml-auto text-[9px] font-bold text-brand-amber-500">HERE</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
