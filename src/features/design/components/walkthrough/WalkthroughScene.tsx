"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useDesignStore } from "../../store";
import type { ModuleConfig } from "../../store";
import { getPreset, getPresetsForType, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import {
  MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS,
  ModuleWalls, ModuleFloor, ModuleCeiling,
  StaticFurniturePiece,
} from "../shared/module3d";

import * as THREE from "three";

const MOVE_SPEED = 3; // m/s
const EYE_HEIGHT = 1.6;
const AUTO_TOUR_SPEED = 1.2; // m/s — slower for guided tour
const AUTO_TOUR_PAUSE_MS = 2500; // pause in each room
const PLAYER_RADIUS = 0.25; // collision radius around player

/* ------------------------------------------------------------------ */
/*  Wall collision system                                              */
/* ------------------------------------------------------------------ */

interface WallBox {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

/** Build AABB wall collision boxes from module wall configs.
 *  Only solid walls and window pillars block movement — doors and "none" are passable. */
function buildWallBoxes(modules: ModuleConfig[]): WallBox[] {
  const boxes: WallBox[] = [];
  const T = WALL_THICKNESS;
  const HT = T / 2;

  for (const mod of modules) {
    const ox = mod.col * MODULE_SIZE;
    const oz = mod.row * MODULE_SIZE;
    const cfg = mod.wallConfigs;

    // North wall (z = oz)
    if (cfg.north === "solid" || cfg.north === "window") {
      boxes.push({ minX: ox - HT, maxX: ox + MODULE_SIZE + HT, minZ: oz - HT, maxZ: oz + HT });
    }
    // South wall (z = oz + MODULE_SIZE)
    if (cfg.south === "solid" || cfg.south === "window") {
      boxes.push({ minX: ox - HT, maxX: ox + MODULE_SIZE + HT, minZ: oz + MODULE_SIZE - HT, maxZ: oz + MODULE_SIZE + HT });
    }
    // West wall (x = ox)
    if (cfg.west === "solid" || cfg.west === "window") {
      boxes.push({ minX: ox - HT, maxX: ox + HT, minZ: oz - HT, maxZ: oz + MODULE_SIZE + HT });
    }
    // East wall (x = ox + MODULE_SIZE)
    if (cfg.east === "solid" || cfg.east === "window") {
      boxes.push({ minX: ox + MODULE_SIZE - HT, maxX: ox + MODULE_SIZE + HT, minZ: oz - HT, maxZ: oz + MODULE_SIZE + HT });
    }
  }

  return boxes;
}

/** Check if position (with player radius) collides with any wall box.
 *  Returns corrected position that slides along walls instead of stopping. */
function resolveCollision(
  pos: THREE.Vector3,
  _prevPos: THREE.Vector3,
  boxes: WallBox[],
  radius: number
): THREE.Vector3 {
  const result = pos.clone();

  for (const box of boxes) {
    const expandedMinX = box.minX - radius;
    const expandedMaxX = box.maxX + radius;
    const expandedMinZ = box.minZ - radius;
    const expandedMaxZ = box.maxZ + radius;

    if (
      result.x > expandedMinX && result.x < expandedMaxX &&
      result.z > expandedMinZ && result.z < expandedMaxZ
    ) {
      // Player is inside expanded wall — push out along shortest axis
      const dLeft = result.x - expandedMinX;
      const dRight = expandedMaxX - result.x;
      const dTop = result.z - expandedMinZ;
      const dBottom = expandedMaxZ - result.z;
      const minDist = Math.min(dLeft, dRight, dTop, dBottom);

      if (minDist === dLeft) result.x = expandedMinX;
      else if (minDist === dRight) result.x = expandedMaxX;
      else if (minDist === dTop) result.z = expandedMinZ;
      else result.z = expandedMaxZ;
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  WASD First-Person Movement Controller                              */
/* ------------------------------------------------------------------ */

function MovementController({
  cameraPositionRef,
  wallBoxes,
}: {
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  wallBoxes: WallBox[];
}) {
  const { camera } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const prevPosRef = useRef(new THREE.Vector3());

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
      prevPosRef.current.copy(camera.position);
      vel.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(vel);
      // Clamp Y
      camera.position.y = Math.max(0.5, Math.min(camera.position.y, WALL_HEIGHT * 2));

      // Wall collision — slide along walls instead of stopping
      const resolved = resolveCollision(camera.position, prevPosRef.current, wallBoxes, PLAYER_RADIUS);
      camera.position.x = resolved.x;
      camera.position.z = resolved.z;
    }

    cameraPositionRef.current.copy(camera.position);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Auto-Tour Controller — walks camera through each room smoothly     */
/* ------------------------------------------------------------------ */

function AutoTourController({
  modules,
  cameraPositionRef,
  active,
  onFinished,
}: {
  modules: ModuleConfig[];
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  active: boolean;
  onFinished: () => void;
}) {
  const { camera } = useThree();
  const stateRef = useRef<{
    waypoints: THREE.Vector3[];
    currentIdx: number;
    pauseUntil: number;
    lookTarget: THREE.Vector3;
  } | null>(null);

  // Build waypoints when tour starts
  useEffect(() => {
    if (!active || modules.length === 0) {
      stateRef.current = null;
      return;
    }
    const wps = modules.map(
      (m) =>
        new THREE.Vector3(
          m.col * MODULE_SIZE + MODULE_SIZE / 2,
          EYE_HEIGHT,
          m.row * MODULE_SIZE + MODULE_SIZE / 2
        )
    );
    stateRef.current = {
      waypoints: wps,
      currentIdx: 0,
      pauseUntil: Date.now() + AUTO_TOUR_PAUSE_MS,
      lookTarget: wps.length > 1 ? wps[1].clone() : wps[0].clone().add(new THREE.Vector3(0, 0, 1)),
    };
    // Teleport to first room
    camera.position.copy(wps[0]);
    cameraPositionRef.current.copy(wps[0]);
  }, [active, modules, camera, cameraPositionRef]);

  useFrame((_, delta) => {
    const st = stateRef.current;
    if (!st || !active) return;

    const now = Date.now();
    // Pausing in current room
    if (now < st.pauseUntil) {
      // Slowly rotate camera to look around
      const angle = ((now % 8000) / 8000) * Math.PI * 2;
      const lookX = camera.position.x + Math.sin(angle) * 2;
      const lookZ = camera.position.z + Math.cos(angle) * 2;
      camera.lookAt(lookX, EYE_HEIGHT, lookZ);
      return;
    }

    const nextIdx = st.currentIdx + 1;
    if (nextIdx >= st.waypoints.length) {
      onFinished();
      return;
    }

    const target = st.waypoints[nextIdx];
    const dir = target.clone().sub(camera.position);
    const dist = dir.length();

    if (dist < 0.3) {
      // Arrived at next room
      camera.position.copy(target);
      cameraPositionRef.current.copy(target);
      st.currentIdx = nextIdx;
      st.pauseUntil = now + AUTO_TOUR_PAUSE_MS;
      return;
    }

    // Move towards target
    dir.normalize().multiplyScalar(AUTO_TOUR_SPEED * delta);
    camera.position.add(dir);
    cameraPositionRef.current.copy(camera.position);

    // Look towards target
    camera.lookAt(target.x, EYE_HEIGHT, target.z);
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
  enhanced,
  autoTour,
  onAutoTourFinished,
}: {
  modules: ModuleConfig[];
  teleportTarget: { row: number; col: number } | null;
  onTeleportDone: () => void;
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
  enhanced: boolean;
  autoTour: boolean;
  onAutoTourFinished: () => void;
}) {
  const { camera } = useThree();

  // Build collision boxes from wall configs (memoized)
  const wallBoxes = useMemo(() => buildWallBoxes(modules), [modules]);

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
      {/* Lighting — enhanced mode has richer, more realistic lighting */}
      <ambientLight intensity={enhanced ? 0.25 : 0.4} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={enhanced ? 1.4 : 1.0}
        castShadow
        shadow-mapSize-width={enhanced ? 4096 : 2048}
        shadow-mapSize-height={enhanced ? 4096 : 2048}
        shadow-bias={-0.0001}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 15, -5]} intensity={enhanced ? 0.5 : 0.3} />
      {enhanced && (
        <>
          {/* Warm fill light from below for enhanced mode */}
          <hemisphereLight args={["#ffeedd", "#88aacc", 0.3]} />
          {/* Soft backlight for depth */}
          <directionalLight position={[-5, 8, -15]} intensity={0.2} color="#aaccff" />
        </>
      )}

      {/* Per-module point lights */}
      {modules.map((mod) => (
        <pointLight
          key={`light-${mod.row}-${mod.col}`}
          position={[mod.col * MODULE_SIZE + MODULE_SIZE / 2, WALL_HEIGHT - 0.3, mod.row * MODULE_SIZE + MODULE_SIZE / 2]}
          intensity={enhanced ? 0.9 : 0.6}
          distance={enhanced ? 7 : 5}
          decay={2}
          color={enhanced ? "#fff0d6" : "#fff5e6"}
          castShadow={enhanced}
        />
      ))}

      {/* Ground plane — exterior surface around buildings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#c8c4b8" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Sky dome for better ambient feel */}
      {enhanced && (
        <mesh>
          <sphereGeometry args={[80, 32, 16]} />
          <meshBasicMaterial color="#d4e6f1" side={THREE.BackSide} />
        </mesh>
      )}

      {/* Render each module — uses shared renderer */}
      {modules.map((mod) => {
        const ox = mod.col * MODULE_SIZE;
        const oz = mod.row * MODULE_SIZE;
        const floorColor = FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#D4A76A";
        const wallColor = WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color || "#F0EDE5";
        // If preset not found (e.g. old data with "default" ID), fall back to first available preset
        const preset = getPreset(mod.moduleType, mod.layoutPreset)
          || getPresetsForType(mod.moduleType)[0];
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
      {!autoTour && <MovementController controlsRef={controlsRef} cameraPositionRef={cameraPositionRef} wallBoxes={wallBoxes} />}
      <AutoTourController
        modules={modules}
        cameraPositionRef={cameraPositionRef}
        active={autoTour}
        onFinished={onAutoTourFinished}
      />
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
  enhanced?: boolean;
  autoTour?: boolean;
  onAutoTourFinished?: () => void;
}

export default function WalkthroughScene({
  teleportTarget, onTeleportDone, controlsRef, cameraPositionRef, enhanced = false,
  autoTour = false, onAutoTourFinished,
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
      style={{ background: enhanced ? "#d4d0ca" : "#e8e5e0", width: "100%", height: "100%" }}
      gl={{ antialias: true, toneMapping: enhanced ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping, toneMappingExposure: enhanced ? 1.2 : 1 }}
    >
      <SceneContent
        modules={modules}
        teleportTarget={teleportTarget}
        onTeleportDone={onTeleportDone}
        controlsRef={controlsRef}
        cameraPositionRef={cameraPositionRef}
        enhanced={enhanced}
        autoTour={autoTour}
        onAutoTourFinished={onAutoTourFinished || (() => {})}
      />
    </Canvas>
  );
}
