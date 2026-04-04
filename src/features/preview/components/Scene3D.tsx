"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from "@react-three/drei";
import { useDesignStore, type ModuleConfig } from "@/features/design/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { FLOOR_MATERIALS, WALL_MATERIALS } from "@/features/design/layouts";
import * as THREE from "three";

const MODULE_SIZE = 3;
const MODULE_HEIGHT = 2.8;
const GAP = 0.05;

interface ModuleBoxProps {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  onClick: (nativeEvent: MouseEvent) => void;
  onContextMenu: (nativeEvent: MouseEvent) => void;
}

function ModuleBox({ position, color, isSelected, onClick, onContextMenu }: ModuleBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      const target = isSelected ? 0.15 : hovered ? 0.05 : 0;
      meshRef.current.position.y +=
        (position[1] + MODULE_HEIGHT / 2 + target - meshRef.current.position.y) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1] + MODULE_HEIGHT / 2, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e.nativeEvent);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        onContextMenu(e.nativeEvent);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <boxGeometry args={[MODULE_SIZE - GAP, MODULE_HEIGHT, MODULE_SIZE - GAP]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isSelected ? 1 : hovered ? 0.9 : 0.85}
      />
      {/* Selection wireframe */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(MODULE_SIZE - GAP, MODULE_HEIGHT, MODULE_SIZE - GAP)]} />
          <lineBasicMaterial color="#E8913A" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

const GRASS_COLOR = new THREE.Color("#4a7c3f");
const GRASS_COLOR_LIGHT = new THREE.Color("#5a9a4a");
const GRASS_COLOR_DARK = new THREE.Color("#3a6630");

/** Procedural grass ground with subtle vertex-color variation */
function GrassGround() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.getAttribute("position");
    const count = posAttr.count;
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Pseudorandom variation per vertex based on position
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const noise =
        Math.sin(x * 1.7 + y * 2.3) * 0.3 +
        Math.sin(x * 4.1 - y * 3.7) * 0.15 +
        Math.cos(x * 0.5 + y * 0.8) * 0.15;
      const t = noise * 0.5 + 0.5; // normalize to 0..1

      if (t < 0.5) {
        c.lerpColors(GRASS_COLOR_DARK, GRASS_COLOR, t * 2);
      } else {
        c.lerpColors(GRASS_COLOR, GRASS_COLOR_LIGHT, (t - 0.5) * 2);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, []);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[30, 30, 24, 24]} />
      <meshStandardMaterial vertexColors roughness={0.95} />
    </mesh>
  );
}

/** Subtle grid overlay on the grass to give spatial reference */
function GrassGrid() {
  return (
    <gridHelper
      args={[30, 10, "#6b9960", "#5a8a50"]}
      position={[0, 0.01, 0]}
    />
  );
}

const DEFAULT_POS = new THREE.Vector3(12, 10, 12);

function ZoomController() {
  const { camera } = useThree();

  useEffect(() => {
    const handleZoom = (e: Event) => {
      const delta = (e as CustomEvent).detail?.delta ?? 0;
      const dir = camera.position.clone().normalize();
      camera.position.addScaledVector(dir, delta);
    };
    const handleReset = () => {
      camera.position.copy(DEFAULT_POS);
    };
    window.addEventListener("modulca-zoom", handleZoom);
    window.addEventListener("modulca-reset-view", handleReset);
    return () => {
      window.removeEventListener("modulca-zoom", handleZoom);
      window.removeEventListener("modulca-reset-view", handleReset);
    };
  }, [camera]);

  return null;
}

/** Invisible ground plane that deselects modules when clicked */
function ClickCatcher({ onDeselect }: { onDeselect: () => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onDeselect();
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

type InfoSection = "geometry" | "material" | "metadata";

/** Floating info panel rendered in HTML overlay */
function ModuleInfoPanel({
  mod,
  position,
}: {
  mod: ModuleConfig;
  position: { x: number; y: number };
}) {
  const [activeSection, setActiveSection] = useState<InfoSection | null>(null);
  const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
  const finishLevel = useDesignStore((s) => s.finishLevel);
  const finish = FINISH_LEVELS.find((f) => f.id === finishLevel);
  const cost = finish?.pricePerModule ?? 0;

  const floorMat = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish);
  const wallMat = WALL_MATERIALS.find((w) => w.id === mod.wallColor);

  // Count walls, doors, windows
  const wc = mod.wallConfigs;
  const sides = ["north", "south", "east", "west"] as const;
  const wallCount = wc ? sides.filter((s) => wc[s] === "solid").length : 4;
  const doorCount = wc ? sides.filter((s) => wc[s] === "door").length : 0;
  const windowCount = wc ? sides.filter((s) => wc[s] === "window").length : 0;

  const toggleSection = (section: InfoSection) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div
      className="pointer-events-auto absolute z-10 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
      style={{
        left: position.x + 16,
        top: position.y - 40,
        minWidth: 200,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-3 w-3 rounded"
          style={{ backgroundColor: mt?.color || "#888" }}
        />
        <span className="text-sm font-bold text-brand-teal-800">
          {mod.label}
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Type</span>
          <span className="font-medium text-brand-teal-800">{mt?.label ?? mod.moduleType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Size</span>
          <span className="font-medium text-brand-teal-800">3.0 x 3.0 m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Grid</span>
          <span className="font-medium text-brand-teal-800">Row {mod.row}, Col {mod.col}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-gray-100">
          <span className="text-gray-500 font-semibold">Est. Cost</span>
          <span className="font-bold text-brand-amber-600">&euro;{cost.toLocaleString()}</span>
        </div>
      </div>

      {/* Section toggle buttons */}
      <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100">
        {(["geometry", "material", "metadata"] as InfoSection[]).map((section) => (
          <button
            key={section}
            onClick={() => toggleSection(section)}
            className={`flex-1 rounded-md px-2 py-1 text-[10px] font-medium capitalize transition-colors ${
              activeSection === section
                ? "bg-brand-teal-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Section details */}
      {activeSection === "geometry" && (
        <div className="mt-2 space-y-1 text-[11px] rounded-md bg-gray-50 p-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Dimensions</span>
            <span className="font-medium text-brand-teal-800">3.0 x 3.0 m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Height</span>
            <span className="font-medium text-brand-teal-800">2.8 m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Solid Walls</span>
            <span className="font-medium text-brand-teal-800">{wallCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doors</span>
            <span className="font-medium text-brand-teal-800">{doorCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Windows</span>
            <span className="font-medium text-brand-teal-800">{windowCount}</span>
          </div>
        </div>
      )}

      {activeSection === "material" && (
        <div className="mt-2 space-y-1 text-[11px] rounded-md bg-gray-50 p-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Floor Finish</span>
            <span className="flex items-center gap-1 font-medium text-brand-teal-800">
              {floorMat && <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: floorMat.color }} />}
              {floorMat?.label ?? mod.floorFinish}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Wall Material</span>
            <span className="flex items-center gap-1 font-medium text-brand-teal-800">
              {wallMat && <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: wallMat.color }} />}
              {wallMat?.label ?? mod.wallColor}
            </span>
          </div>
        </div>
      )}

      {activeSection === "metadata" && (
        <div className="mt-2 space-y-1 text-[11px] rounded-md bg-gray-50 p-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Module Type</span>
            <span className="font-medium text-brand-teal-800">{mt?.label ?? mod.moduleType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Layout Preset</span>
            <span className="font-medium text-brand-teal-800">{mod.layoutPreset}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Grid Position</span>
            <span className="font-medium text-brand-teal-800">Row {mod.row}, Col {mod.col}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created</span>
            <span className="font-medium text-brand-teal-800">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

type ContextMenuState = {
  x: number;
  y: number;
  row: number;
  col: number;
} | null;

type SwapState = { row: number; col: number } | null;

export default function Scene3D() {
  const { modules, selectedModule, setSelectedModule, loadFromLocalStorage, swapModules } = useDesignStore();
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [waited, setWaited] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [swapSource, setSwapSource] = useState<SwapState>(null);

  // Try to hydrate from localStorage if modules are empty
  useEffect(() => {
    if (modules.length === 0) loadFromLocalStorage();
    const t = setTimeout(() => setWaited(true), 200);
    return () => clearTimeout(t);
  }, [modules.length, loadFromLocalStorage]);

  const handleDeselect = useCallback(() => {
    setSelectedModule(null);
    setClickPos(null);
    setContextMenu(null);
  }, [setSelectedModule]);

  const handleContextMenu = useCallback((row: number, col: number, nativeEvent: MouseEvent) => {
    nativeEvent.preventDefault();
    const canvas = (nativeEvent.target as HTMLElement)?.closest?.("canvas");
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    setContextMenu({
      x: nativeEvent.clientX - rect.left,
      y: nativeEvent.clientY - rect.top,
      row,
      col,
    });
  }, []);

  // Close context menu on click anywhere
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Compute center offset so the building is centered at origin
  const minRow = modules.length > 0 ? Math.min(...modules.map((m) => m.row)) : 0;
  const maxRow = modules.length > 0 ? Math.max(...modules.map((m) => m.row)) : 0;
  const minCol = modules.length > 0 ? Math.min(...modules.map((m) => m.col)) : 0;
  const maxCol = modules.length > 0 ? Math.max(...modules.map((m) => m.col)) : 0;
  const centerX = ((minCol + maxCol) / 2) * MODULE_SIZE;
  const centerZ = ((minRow + maxRow) / 2) * MODULE_SIZE;

  const selectedMod = selectedModule
    ? modules.find((m) => m.row === selectedModule.row && m.col === selectedModule.col)
    : null;

  if (modules.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        {waited ? "No modules to preview. Complete Steps 1 & 2 first." : "Loading 3D scene..."}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Info panel overlay */}
      {selectedMod && clickPos && (
        <ModuleInfoPanel mod={selectedMod} position={clickPos} />
      )}

      <Canvas
        shadows
        className="h-full w-full"
      >
        <ZoomController />
        <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={45} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, MODULE_HEIGHT / 2, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Sky / environment */}
        <color attach="background" args={["#b8d4e8"]} />
        <fog attach="fog" args={["#b8d4e8", 200, 500]} />
        <Environment preset="park" background={false} />

        {/* Grass ground */}
        <GrassGround />
        <GrassGrid />

        {/* Invisible click catcher for deselection */}
        <ClickCatcher onDeselect={handleDeselect} />

        {/* Contact shadows */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={30}
          blur={2}
          far={10}
        />

        {/* Module boxes */}
        {modules.map((mod) => {
          const mt = MODULE_TYPES.find((m) => m.id === mod.moduleType);
          const color = mt?.color || "#888";
          const x = mod.col * MODULE_SIZE - centerX;
          const z = mod.row * MODULE_SIZE - centerZ;
          const isSelected =
            selectedModule?.row === mod.row && selectedModule?.col === mod.col;

          return (
            <ModuleBox
              key={`${mod.row}-${mod.col}`}
              position={[x, 0, z]}
              color={color}
              isSelected={isSelected}
              onClick={(nativeEvent: MouseEvent) => {
                // If we're in swap mode, complete the swap
                if (swapSource) {
                  if (swapSource.row !== mod.row || swapSource.col !== mod.col) {
                    swapModules(swapSource, { row: mod.row, col: mod.col });
                  }
                  setSwapSource(null);
                  return;
                }
                setSelectedModule({ row: mod.row, col: mod.col });
                const canvas = (nativeEvent.target as HTMLElement)?.closest?.("canvas");
                const rect = canvas?.getBoundingClientRect();
                if (rect) {
                  setClickPos({
                    x: nativeEvent.clientX - rect.left,
                    y: nativeEvent.clientY - rect.top,
                  });
                }
              }}
              onContextMenu={(nativeEvent: MouseEvent) => handleContextMenu(mod.row, mod.col, nativeEvent)}
            />
          );
        })}

      </Canvas>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="absolute z-50 rounded-lg bg-white shadow-xl border border-gray-200 py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const mod = modules.find((m) => m.row === contextMenu.row && m.col === contextMenu.col);
            const mt = MODULE_TYPES.find((m) => m.id === mod?.moduleType);
            return (
              <>
                <div className="px-3 py-1.5 border-b border-gray-100">
                  <span className="text-xs font-bold text-brand-teal-800">{mod?.label || "Module"}</span>
                  <span className="text-[10px] text-gray-400 ml-1">{mt?.label}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedModule({ row: contextMenu.row, col: contextMenu.col });
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Properties
                </button>
                <button
                  onClick={() => {
                    setSwapSource({ row: contextMenu.row, col: contextMenu.col });
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Swap With...
                </button>
                <button
                  onClick={() => {
                    setSelectedModule({ row: contextMenu.row, col: contextMenu.col });
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Swap mode indicator */}
      {swapSource && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 rounded-lg bg-brand-amber-500 px-4 py-2 shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold text-white">
            Click another module to swap with {modules.find((m) => m.row === swapSource.row && m.col === swapSource.col)?.label}
          </span>
          <button
            onClick={() => setSwapSource(null)}
            className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-white hover:bg-white/30"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
