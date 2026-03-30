"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useDesignStore } from "../../store";
import type { ModuleConfig } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import {
  MODULE_SIZE, WALL_HEIGHT,
  ModuleWalls, ModuleFloor, ModuleCeiling,
  StaticFurniturePiece,
} from "../shared/module3d";

import * as THREE from "three";

const MOVE_SPEED = 3; // m/s
const EYE_HEIGHT = 1.6;

/* ------------------------------------------------------------------ */
/*  WASD First-Person Movement Controller                              */
/* ------------------------------------------------------------------ */

function MovementController({
  cameraPositionRef,
}: {
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const { camera } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === "Space" || e.code === "ControlLeft" || e.code === "ControlRight") {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const vel = velocityRef.current;
    const dir = directionRef.current;

    vel.set(0, 0, 0);
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();

    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();

    if (keys.has("KeyW") || keys.has("ArrowUp")) vel.add(dir);
    if (keys.has("KeyS") || keys.has("ArrowDown")) vel.sub(dir);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) vel.sub(right);
    if (keys.has("KeyD") || keys.has("ArrowRight")) vel.add(right);

    // Vertical movement: Space = up, Ctrl = down
    if (keys.has("Space")) vel.y += 1;
    if (keys.has("ControlLeft") || keys.has("ControlRight")) vel.y -= 1;

    if (vel.lengthSq() > 0) {
      vel.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(vel);
      // Clamp Y
      camera.position.y = Math.max(0.5, Math.min(camera.position.y, WALL_HEIGHT * 2));
    }

    cameraPositionRef.current.copy(camera.position);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene contents                                                     */
/* ------------------------------------------------------------------ */

function SceneContent({
  modules,
  teleportTarget,
  onTeleportDone,
  controlsRef,
  cameraPositionRef,
}: {
  modules: ModuleConfig[];
  teleportTarget: { row: number; col: number } | null;
  onTeleportDone: () => void;
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const { camera } = useThree();

  // Teleport
  useEffect(() => {
    if (!teleportTarget) return;
    const x = teleportTarget.col * MODULE_SIZE + MODULE_SIZE / 2;
    const z = teleportTarget.row * MODULE_SIZE + MODULE_SIZE / 2;
    camera.position.set(x, EYE_HEIGHT, z);
    cameraPositionRef.current.set(x, EYE_HEIGHT, z);
    onTeleportDone();
  }, [teleportTarget, camera, cameraPositionRef, onTeleportDone]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 20, 10]} intensity={1.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-10, 15, -5]} intensity={0.3} />

      {/* Per-module point lights */}
      {modules.map((mod) => (
        <pointLight
          key={`light-${mod.row}-${mod.col}`}
          position={[mod.col * MODULE_SIZE + MODULE_SIZE / 2, WALL_HEIGHT - 0.3, mod.row * MODULE_SIZE + MODULE_SIZE / 2]}
          intensity={0.6} distance={5} decay={2} color="#fff5e6"
        />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e8e5e0" roughness={1} />
      </mesh>

      {/* Render each module — uses shared renderer */}
      {modules.map((mod) => {
        const ox = mod.col * MODULE_SIZE;
        const oz = mod.row * MODULE_SIZE;
        const floorColor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#D4A76A";
        const wallColor = WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color || "#F0EDE5";
        const preset = getPreset(mod.moduleType, mod.layoutPreset);
        const furniture = preset?.furniture || [];
        const overrides = mod.furnitureOverrides[mod.layoutPreset] ?? {};

        return (
          <group key={`mod-${mod.row}-${mod.col}`}>
            <ModuleFloor offsetX={ox} offsetZ={oz} color={floorColor} />
            <ModuleWalls wallConfigs={mod.wallConfigs} wallColor={wallColor} offsetX={ox} offsetZ={oz} />
            <ModuleCeiling offsetX={ox} offsetZ={oz} />

            {furniture.map((item) => (
              <StaticFurniturePiece
                key={`${mod.row}-${mod.col}-${item.id}`}
                item={item}
                override={overrides[item.id]}
                offsetX={ox}
                offsetZ={oz}
              />
            ))}
          </group>
        );
      })}

      <PointerLockControls ref={controlsRef} />
      <MovementController controlsRef={controlsRef} cameraPositionRef={cameraPositionRef} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

interface WalkthroughSceneProps {
  teleportTarget: { row: number; col: number } | null;
  onTeleportDone: () => void;
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
}

export default function WalkthroughScene({
  teleportTarget, onTeleportDone, controlsRef, cameraPositionRef,
}: WalkthroughSceneProps) {
  const modules = useDesignStore((s) => s.modules);

  const initialPos = useMemo(() => {
    if (modules.length === 0) return [0, EYE_HEIGHT, 0] as [number, number, number];
    const first = modules[0];
    return [
      first.col * MODULE_SIZE + MODULE_SIZE / 2,
      EYE_HEIGHT,
      first.row * MODULE_SIZE + MODULE_SIZE / 2,
    ] as [number, number, number];
  }, [modules]);

  if (modules.length === 0) return null;

  return (
    <Canvas
      shadows
      camera={{ position: initialPos, fov: 70, near: 0.1, far: 200 }}
      style={{ background: "#e8e5e0", width: "100%", height: "100%" }}
    >
      <SceneContent
        modules={modules}
        teleportTarget={teleportTarget}
        onTeleportDone={onTeleportDone}
        controlsRef={controlsRef}
        cameraPositionRef={cameraPositionRef}
      />
    </Canvas>
  );
}
