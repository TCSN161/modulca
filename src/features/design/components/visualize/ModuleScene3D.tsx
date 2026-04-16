"use client";

import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { ModuleConfig } from "../../store";
import { useDesignStore, getEffectiveThickness } from "../../store";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";

import { MODULE_SIZE } from "./scene/constants";
import {
  CanvasErrorBoundary,
  CanvasErrorFallback,
  LoadingIndicator,
  Floor,
  DragPlane,
  Ceiling,
} from "./scene/SceneHelpers";
import { Walls } from "./scene/WallBuilder";
import { FurniturePiece } from "./scene/FurnitureRenderer";
import { useWASD } from "./scene/useWASD";

/* ------------------------------------------------------------------ */
/*  Scene contents (inside Canvas)                                     */
/* ------------------------------------------------------------------ */

interface SceneContentProps {
  module: ModuleConfig;
  furniture: FurnitureItem[];
  floorColor: string;
  wallColor: string;
}

function SceneContent({ module, furniture, floorColor, wallColor }: SceneContentProps) {
  const orbitRef = useRef<any>(null);
  useWASD(orbitRef);

  const selectedFurniture = useDesignStore((s) => s.selectedFurniture);
  const setSelectedFurniture = useDesignStore((s) => s.setSelectedFurniture);
  const updateFurnitureOverride = useDesignStore((s) => s.updateFurnitureOverride);

  const [dragging, setDragging] = useState<FurnitureItem | null>(null);
  // Offset between pointer hit and furniture center so the piece doesn't jump on grab
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  /* ---- helpers ---- */

  const clampPos = useCallback(
    (x: number, z: number, fw: number, fd: number) => ({
      x: Math.max(0, Math.min(MODULE_SIZE - fw, x)),
      z: Math.max(0, Math.min(MODULE_SIZE - fd, z)),
    }),
    [],
  );

  /** Convert a pointer event on the drag plane to room-local coords. */
  const toRoomCoords = useCallback((e: ThreeEvent<PointerEvent>) => {
    // The group is offset by [-MODULE_SIZE/2, 0, -MODULE_SIZE/2], so world
    // coords need to be shifted back into room space.
    const pt = e.point;
    return { x: pt.x + MODULE_SIZE / 2, z: pt.z + MODULE_SIZE / 2 };
  }, []);

  /* ---- arrow-key movement for selected furniture ---- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedFurniture === null) return;

      const STEP_NORMAL = 0.05;
      const STEP_SHIFT = 0.2;

      // Rotation: R key
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        const rotStep = e.shiftKey ? Math.PI / 4 : Math.PI / 2; // 45 or 90 degrees
        const presetOvrRot = module.furnitureOverrides[module.layoutPreset] ?? {};
        const overrideRot = presetOvrRot[selectedFurniture];
        const curRot = overrideRot?.rotation ?? 0;
        updateFurnitureOverride(module.row, module.col, selectedFurniture, {
          rotation: curRot + rotStep,
        });
        return;
      }

      let dx = 0;
      let dz = 0;

      switch (e.key) {
        case "ArrowUp":
          dz = -1;
          break;
        case "ArrowDown":
          dz = 1;
          break;
        case "ArrowLeft":
          dx = -1;
          break;
        case "ArrowRight":
          dx = 1;
          break;
        default:
          return;
      }

      e.preventDefault();

      const item = furniture.find((f) => f.id === selectedFurniture);
      if (!item) return;

      const step = e.shiftKey ? STEP_SHIFT : STEP_NORMAL;
      const presetOvr = module.furnitureOverrides[module.layoutPreset] ?? {};
      const override = presetOvr[selectedFurniture];
      const curX = override?.x ?? item.x;
      const curZ = override?.z ?? item.z;

      const clamped = clampPos(curX + dx * step, curZ + dz * step, item.width, item.depth);
      updateFurnitureOverride(module.row, module.col, selectedFurniture, {
        x: clamped.x,
        z: clamped.z,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFurniture, furniture, module.furnitureOverrides, module.layoutPreset, module.row, module.col, clampPos, updateFurnitureOverride]);

  /* ---- drag handlers ---- */

  const handleDragStart = useCallback(
    (e: ThreeEvent<PointerEvent>, item: FurnitureItem) => {
      e.stopPropagation();
      (e as any).nativeEvent?.target?.setPointerCapture?.((e as any).nativeEvent?.pointerId);

      const roomPt = toRoomCoords(e);
      const presetOvrDrag = module.furnitureOverrides[module.layoutPreset] ?? {};
      const overridePos = presetOvrDrag[item.id];
      const curX = overridePos?.x ?? item.x;
      const curZ = overridePos?.z ?? item.z;

      dragOffset.current = {
        x: roomPt.x - (curX + item.width / 2),
        z: roomPt.z - (curZ + item.depth / 2),
      };

      setDragging(item);
      setSelectedFurniture(item.id);
      if (orbitRef.current) orbitRef.current.enabled = false;
    },
    [module.furnitureOverrides, setSelectedFurniture, toRoomCoords],
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return;
      e.stopPropagation();

      const roomPt = toRoomCoords(e);
      const rawX = roomPt.x - dragOffset.current.x - dragging.width / 2;
      const rawZ = roomPt.z - dragOffset.current.z - dragging.depth / 2;
      const clamped = clampPos(rawX, rawZ, dragging.width, dragging.depth);

      updateFurnitureOverride(module.row, module.col, dragging.id, {
        x: clamped.x,
        z: clamped.z,
      });
    },
    [dragging, clampPos, module.row, module.col, toRoomCoords, updateFurnitureOverride],
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return;
      e.stopPropagation();
      setDragging(null);
      if (orbitRef.current) orbitRef.current.enabled = true;
    },
    [dragging],
  );

  const handleBackgroundClick = useCallback(() => {
    if (!dragging) setSelectedFurniture(null);
  }, [dragging, setSelectedFurniture]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 10, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.3} />

      {/* Module structure */}
      <group position={[-MODULE_SIZE / 2, 0, -MODULE_SIZE / 2]}>
        <Floor color={floorColor} />
        <Walls color={wallColor} wallConfigs={module.wallConfigs} wallThickness={getEffectiveThickness(module)} />
        <Ceiling />

        {/* Invisible drag plane */}
        <DragPlane onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} />

        {/* Furniture */}
        {furniture.map((item) => (
          <FurniturePiece
            key={item.id}
            item={item}
            override={(module.furnitureOverrides[module.layoutPreset] ?? {})[item.id]}
            isSelected={selectedFurniture === item.id}
            isDragging={dragging?.id === item.id}
            onSelect={() => setSelectedFurniture(item.id)}
            onDragStart={handleDragStart}
          />
        ))}
      </group>

      {/* Click on empty space deselects */}
      <mesh
        visible={false}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial />
      </mesh>

      {/* Ground plane shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
      />

      {/* Controls */}
      <OrbitControls
        ref={orbitRef}
        target={[0, 1, 0]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={12}
        enablePan={false}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

interface ModuleScene3DProps {
  module: ModuleConfig;
}

export default function ModuleScene3D({ module }: ModuleScene3DProps) {
  const preset = getPreset(module.moduleType, module.layoutPreset)
    || getPresetsForType(module.moduleType)[0];
  const furniture = preset?.furniture || [];
  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#D4A76A";
  const wallColor = WALL_MATERIALS.find((w) => w.id === module.wallColor)?.color || "#F0EDE5";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 200 }}>
      <CanvasErrorBoundary fallback={<CanvasErrorFallback />}>
        <Canvas
          shadows
          camera={{
            position: [5.5, 4.5, 5.5],
            fov: 35,
            near: 0.1,
            far: 100,
          }}
          style={{ background: "#f8f8f6", width: "100%", height: "100%" }}
        >
          <Suspense fallback={<LoadingIndicator />}>
            <SceneContent
              module={module}
              furniture={furniture}
              floorColor={floorColor}
              wallColor={wallColor}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
      {/* Controls hint overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 11,
          pointerEvents: "none",
          lineHeight: 1.4,
        }}
      >
        WASD: Pan camera &bull; Click: Select &bull; Arrows: Move furniture &bull; R: Rotate
      </div>
    </div>
  );
}
