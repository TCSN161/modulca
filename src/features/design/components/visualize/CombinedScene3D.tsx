"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useDesignStore } from "../../store";
import type { ModuleConfig } from "../../store";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import {
  MODULE_SIZE, WALL_HEIGHT,
  ModuleWalls, ModuleFloor,
  StaticFurniturePiece,
} from "../shared/module3d";
import { useWASD } from "./scene/useWASD";

/* ------------------------------------------------------------------ */
/*  Clickable module highlight overlay                                 */
/* ------------------------------------------------------------------ */

function ModuleClickArea({
  mod, isSelected, onSelect,
}: {
  mod: ModuleConfig; isSelected: boolean; onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ox = mod.col * MODULE_SIZE;
  const oz = mod.row * MODULE_SIZE;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ox + MODULE_SIZE / 2, 0.002, oz + MODULE_SIZE / 2]}
        onClick={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[MODULE_SIZE - 0.1, MODULE_SIZE - 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE / 2, 0.003, oz + MODULE_SIZE / 2]}>
          <planeGeometry args={[MODULE_SIZE - 0.02, MODULE_SIZE - 0.02]} />
          <meshBasicMaterial color={isSelected ? "#F59E0B" : "#94A3B8"} transparent opacity={isSelected ? 0.15 : 0.08} />
        </mesh>
      )}

      {isSelected && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE / 2, 0.004, oz + 0.02]}>
            <planeGeometry args={[MODULE_SIZE, 0.04]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE / 2, 0.004, oz + MODULE_SIZE - 0.02]}>
            <planeGeometry args={[MODULE_SIZE, 0.04]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + 0.02, 0.004, oz + MODULE_SIZE / 2]}>
            <planeGeometry args={[0.04, MODULE_SIZE]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE - 0.02, 0.004, oz + MODULE_SIZE / 2]}>
            <planeGeometry args={[0.04, MODULE_SIZE]} /><meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene content                                                      */
/* ------------------------------------------------------------------ */

function SceneContent({ modules }: { modules: ModuleConfig[] }) {
  const orbitRef = useRef<any>(null);
  useWASD(orbitRef);
  const selectedModule = useDesignStore((s) => s.selectedModule);
  const setSelectedModule = useDesignStore((s) => s.setSelectedModule);

  const { centerX, centerZ, extent } = useMemo(() => {
    if (modules.length === 0) return { centerX: 0, centerZ: 0, extent: 3 };
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    for (const m of modules) {
      if (m.row < minRow) minRow = m.row;
      if (m.row > maxRow) maxRow = m.row;
      if (m.col < minCol) minCol = m.col;
      if (m.col > maxCol) maxCol = m.col;
    }
    const cx = ((minCol + maxCol + 1) * MODULE_SIZE) / 2;
    const cz = ((minRow + maxRow + 1) * MODULE_SIZE) / 2;
    const spanX = (maxCol - minCol + 1) * MODULE_SIZE;
    const spanZ = (maxRow - minRow + 1) * MODULE_SIZE;
    return { centerX: cx, centerZ: cz, extent: Math.max(spanX, spanZ) };
  }, [modules]);

  const cameraDistance = extent * 1.4 + 4;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[centerX + cameraDistance * 0.5, cameraDistance * 0.8, centerZ + cameraDistance * 0.5]}
        intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      />
      <directionalLight position={[centerX - cameraDistance * 0.3, cameraDistance * 0.5, centerZ - cameraDistance * 0.3]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.01, centerZ]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e8e5e0" roughness={1} />
      </mesh>

      {modules.map((mod) => {
        const ox = mod.col * MODULE_SIZE;
        const oz = mod.row * MODULE_SIZE;
        const floorColor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#D4A76A";
        const wallColor = WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color || "#F0EDE5";
        const preset = getPreset(mod.moduleType, mod.layoutPreset)
          || getPresetsForType(mod.moduleType)[0];
        const furniture = preset?.furniture || [];
        const overrides = mod.furnitureOverrides[mod.layoutPreset] ?? {};
        const isSelected = selectedModule?.row === mod.row && selectedModule?.col === mod.col;

        return (
          <group key={`mod-${mod.row}-${mod.col}`}>
            <ModuleFloor offsetX={ox} offsetZ={oz} color={floorColor} />
            <ModuleWalls wallConfigs={mod.wallConfigs} wallColor={wallColor} offsetX={ox} offsetZ={oz} />
            {/* No ceiling in combined view — allows orbital camera to see interiors */}

            {furniture.map((item) => (
              <StaticFurniturePiece
                key={`${mod.row}-${mod.col}-${item.id}`}
                item={item}
                override={overrides[item.id]}
                offsetX={ox}
                offsetZ={oz}
              />
            ))}

            <ModuleClickArea
              mod={mod}
              isSelected={isSelected}
              onSelect={() => setSelectedModule({ row: mod.row, col: mod.col })}
            />
          </group>
        );
      })}

      <mesh visible={false} position={[centerX, -0.1, centerZ]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => setSelectedModule(null)}>
        <planeGeometry args={[200, 200]} /><meshBasicMaterial />
      </mesh>

      <ContactShadows position={[centerX, -0.005, centerZ]} opacity={0.25} scale={extent + 10} blur={2} />
      <OrbitControls
        ref={orbitRef}
        target={[centerX, WALL_HEIGHT * 0.3, centerZ]}
        minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2}
        minDistance={3} maxDistance={cameraDistance * 2} enablePan
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

export default function CombinedScene3D() {
  const modules = useDesignStore((s) => s.modules);

  const cameraPos = useMemo<[number, number, number]>(() => {
    if (modules.length === 0) return [5, 8, 5];
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    for (const m of modules) {
      if (m.row < minRow) minRow = m.row;
      if (m.row > maxRow) maxRow = m.row;
      if (m.col < minCol) minCol = m.col;
      if (m.col > maxCol) maxCol = m.col;
    }
    const cx = ((minCol + maxCol + 1) * MODULE_SIZE) / 2;
    const cz = ((minRow + maxRow + 1) * MODULE_SIZE) / 2;
    const span = Math.max((maxCol - minCol + 1) * MODULE_SIZE, (maxRow - minRow + 1) * MODULE_SIZE);
    const dist = span * 1.4 + 4;
    return [cx + dist * 0.6, dist * 0.7, cz + dist * 0.6];
  }, [modules]);

  if (modules.length === 0) return null;

  return (
    <Canvas
      shadows
      camera={{ position: cameraPos, fov: 40, near: 0.1, far: 200 }}
      style={{ background: "#f8f8f6", width: "100%", height: "100%" }}
    >
      <SceneContent modules={modules} />
    </Canvas>
  );
}
