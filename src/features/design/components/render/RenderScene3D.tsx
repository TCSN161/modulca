"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { ModuleConfig } from "../../store";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import {
  MODULE_SIZE, WALL_HEIGHT,
  ModuleWalls, ModuleFloor, ModuleCeiling,
  StaticFurniturePiece,
} from "../shared/module3d";

type LightingMode = "daylight" | "evening" | "night";
type CameraAngle = "interior" | "corner" | "detail";

const CAMERA_POSITIONS: Record<CameraAngle, [number, number, number]> = {
  interior: [2.8, 1.6, 2.8],
  corner: [5.5, 4.5, 5.5],
  detail: [1.5, 0.8, 2.5],
};

const LIGHTING_CONFIGS: Record<LightingMode, { ambient: number; sun: number; sunColor: string; bgColor: string }> = {
  daylight: { ambient: 0.6, sun: 1.4, sunColor: "#fff8e7", bgColor: "#e8f0f8" },
  evening: { ambient: 0.3, sun: 0.9, sunColor: "#ff9944", bgColor: "#2a1810" },
  night: { ambient: 0.15, sun: 0.3, sunColor: "#6688cc", bgColor: "#0a0a1a" },
};

/** Inner component that registers the gl capture function with the parent */
function CanvasCapture({ onReady }: { onReady: (capture: () => string | null) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(() => {
      try {
        return gl.domElement.toDataURL("image/png");
      } catch {
        return null;
      }
    });
  }, [gl, onReady]);
  return null;
}

function SceneContent({ module, lighting, showPlants, showPeople }: {
  module: ModuleConfig;
  lighting: LightingMode;
  showPlants: boolean;
  showPeople: boolean;
}) {
  const lc = LIGHTING_CONFIGS[lighting];
  const preset = getPreset(module.moduleType, module.layoutPreset)
    || getPresetsForType(module.moduleType)[0];
  const furniture = preset?.furniture || [];
  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#D4A76A";
  const wallColor = WALL_MATERIALS.find((w) => w.id === module.wallColor)?.color || "#F0EDE5";
  const overrides = module.furnitureOverrides?.[module.layoutPreset] ?? {};

  return (
    <>
      <color attach="background" args={[lc.bgColor]} />
      <ambientLight intensity={lc.ambient} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={lc.sun}
        color={lc.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 5, -2]} intensity={lc.sun * 0.2} color={lc.sunColor} />
      <pointLight position={[MODULE_SIZE / 2, WALL_HEIGHT - 0.3, MODULE_SIZE / 2]} intensity={lighting === "night" ? 0.8 : 0.3} color={lighting === "night" ? "#ffcc88" : "#fff"} />

      <group position={[-MODULE_SIZE / 2, 0, -MODULE_SIZE / 2]}>
        <ModuleFloor color={floorColor} />
        <ModuleWalls wallConfigs={module.wallConfigs} wallColor={wallColor} />
        <ModuleCeiling />

        {furniture.map((item) => (
          <StaticFurniturePiece
            key={item.id}
            item={item}
            override={overrides[item.id]}
          />
        ))}

        {showPlants && (
          <group position={[2.6, 0, 2.6]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color="#4A7A4A" roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* Human silhouette figures for scale — semi-transparent shadow people */}
        {showPeople && (
          <>
            {/* Person 1 — standing near center */}
            <group position={[1.5, 0, 1.2]}>
              {/* Legs */}
              <mesh position={[-0.06, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.8, 6]} />
                <meshStandardMaterial color="#3a3a3a" transparent opacity={0.6} roughness={0.9} />
              </mesh>
              <mesh position={[0.06, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.8, 6]} />
                <meshStandardMaterial color="#3a3a3a" transparent opacity={0.6} roughness={0.9} />
              </mesh>
              {/* Torso */}
              <mesh position={[0, 1.05, 0]} castShadow>
                <cylinderGeometry args={[0.14, 0.12, 0.6, 8]} />
                <meshStandardMaterial color="#4a4a4a" transparent opacity={0.6} roughness={0.9} />
              </mesh>
              {/* Head */}
              <mesh position={[0, 1.55, 0]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#5a5a5a" transparent opacity={0.6} roughness={0.9} />
              </mesh>
            </group>

            {/* Person 2 — seated/leaning, smaller, different spot */}
            <group position={[0.8, 0, 2.0]} rotation={[0, 0.5, 0]}>
              {/* Legs (seated) */}
              <mesh position={[0, 0.3, 0.08]} castShadow rotation={[0.3, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 0.7, 6]} />
                <meshStandardMaterial color="#3a3a3a" transparent opacity={0.5} roughness={0.9} />
              </mesh>
              {/* Torso */}
              <mesh position={[0, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.11, 0.55, 8]} />
                <meshStandardMaterial color="#4a4a4a" transparent opacity={0.5} roughness={0.9} />
              </mesh>
              {/* Head */}
              <mesh position={[0, 1.3, 0]} castShadow>
                <sphereGeometry args={[0.11, 8, 8]} />
                <meshStandardMaterial color="#5a5a5a" transparent opacity={0.5} roughness={0.9} />
              </mesh>
            </group>
          </>
        )}
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={12} blur={2.5} />
      <OrbitControls
        target={[0, 1.2, 0]}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={10}
        enablePan={false}
      />
    </>
  );
}

export interface RenderScene3DProps {
  module: ModuleConfig;
  lighting: LightingMode;
  camera: CameraAngle;
  showPlants: boolean;
  showPeople?: boolean;
  onReady?: (capture: () => string | null) => void;
}

export default function RenderScene3D({ module, lighting, camera, showPlants, showPeople = false, onReady }: RenderScene3DProps) {
  const camPos = CAMERA_POSITIONS[camera];
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: camPos, fov: camera === "detail" ? 50 : 35, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      {onReady && <CanvasCapture onReady={onReady} />}
      <SceneContent module={module} lighting={lighting} showPlants={showPlants} showPeople={showPeople} />
    </Canvas>
  );
}
