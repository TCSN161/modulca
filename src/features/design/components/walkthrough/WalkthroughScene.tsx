"use client";

import { useRef, useEffect, useMemo, useCallback, type ReactElement } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useDesignStore } from "../../store";
import type { ModuleConfig } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";

import * as THREE from "three";

const MODULE_SIZE = 3;
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.08;
const HALF_THICK = WALL_THICKNESS / 2;
const HALF_HEIGHT = WALL_HEIGHT / 2;
const MOVE_SPEED = 3; // m/s
const EYE_HEIGHT = 1.6;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.1;

/* ------------------------------------------------------------------ */
/*  Floor                                                              */
/* ------------------------------------------------------------------ */

function ModuleFloor({
  x,
  z,
  color,
}: {
  x: number;
  z: number;
  color: string;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[x + MODULE_SIZE / 2, 0.001, z + MODULE_SIZE / 2]}
      receiveShadow
    >
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Single wall segment                                                */
/* ------------------------------------------------------------------ */

function WallSegment({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Walls for a single module, removing shared walls and adding doors   */
/* ------------------------------------------------------------------ */

/** Build wall geometry based on wall type config */
function buildWall(
  key: string,
  pos: [number, number, number],
  fullSize: [number, number, number],
  wallType: string,
  wallColor: string,
  isHorizontal: boolean,
): ReactElement[] {
  const walls: ReactElement[] = [];

  if (wallType === "none") {
    // No wall at all — fully open
    return walls;
  }

  if (wallType === "solid" || wallType === "window") {
    // Solid wall (window has a wall with glass pane — simplified as solid in 3D walkthrough)
    walls.push(
      <WallSegment key={key} position={pos} size={fullSize} color={wallType === "window" ? "#c8dde8" : wallColor} />,
    );
    return walls;
  }

  // "shared" or "door" — wall with door opening
  const wallLen = isHorizontal ? fullSize[0] : fullSize[2];
  const doorLeft = (wallLen - DOOR_WIDTH) / 2;
  const doorRight = doorLeft + DOOR_WIDTH;
  const rightWidth = wallLen - doorRight;
  const topHeight = WALL_HEIGHT - DOOR_HEIGHT;

  if (isHorizontal) {
    // Along X axis
    const baseX = pos[0] - wallLen / 2;
    const baseZ = pos[2];
    walls.push(
      <WallSegment key={`${key}-l`} position={[baseX + doorLeft / 2, HALF_HEIGHT, baseZ]} size={[doorLeft, WALL_HEIGHT, WALL_THICKNESS]} color={wallColor} />,
    );
    walls.push(
      <WallSegment key={`${key}-r`} position={[baseX + doorRight + rightWidth / 2, HALF_HEIGHT, baseZ]} size={[rightWidth, WALL_HEIGHT, WALL_THICKNESS]} color={wallColor} />,
    );
    walls.push(
      <WallSegment key={`${key}-t`} position={[pos[0], DOOR_HEIGHT + topHeight / 2, baseZ]} size={[DOOR_WIDTH, topHeight, WALL_THICKNESS]} color={wallColor} />,
    );
  } else {
    // Along Z axis
    const baseX = pos[0];
    const baseZ = pos[2] - wallLen / 2;
    walls.push(
      <WallSegment key={`${key}-l`} position={[baseX, HALF_HEIGHT, baseZ + doorLeft / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, doorLeft]} color={wallColor} />,
    );
    walls.push(
      <WallSegment key={`${key}-r`} position={[baseX, HALF_HEIGHT, baseZ + doorRight + rightWidth / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, rightWidth]} color={wallColor} />,
    );
    walls.push(
      <WallSegment key={`${key}-t`} position={[baseX, DOOR_HEIGHT + topHeight / 2, pos[2]]} size={[WALL_THICKNESS, topHeight, DOOR_WIDTH]} color={wallColor} />,
    );
  }

  return walls;
}

function ModuleWalls({
  mod,
  wallColor,
}: {
  mod: ModuleConfig;
  wallColor: string;
}) {
  const ox = mod.col * MODULE_SIZE;
  const oz = mod.row * MODULE_SIZE;
  const walls: ReactElement[] = [];
  const wc = mod.wallConfigs;

  // North wall (z = oz, along X)
  walls.push(
    ...buildWall(
      "back", [ox + MODULE_SIZE / 2, HALF_HEIGHT, oz + HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.north, wallColor, true,
    ),
  );

  // South wall (z = oz + MODULE_SIZE, along X)
  walls.push(
    ...buildWall(
      "front", [ox + MODULE_SIZE / 2, HALF_HEIGHT, oz + MODULE_SIZE - HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.south, wallColor, true,
    ),
  );

  // West wall (x = ox, along Z)
  walls.push(
    ...buildWall(
      "left", [ox + HALF_THICK, HALF_HEIGHT, oz + MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.west, wallColor, false,
    ),
  );

  // East wall (x = ox + MODULE_SIZE, along Z)
  walls.push(
    ...buildWall(
      "right", [ox + MODULE_SIZE - HALF_THICK, HALF_HEIGHT, oz + MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.east, wallColor, false,
    ),
  );

  return <group>{walls}</group>;
}

/* ------------------------------------------------------------------ */
/*  Ceiling for a module                                               */
/* ------------------------------------------------------------------ */

function ModuleCeiling({ x, z }: { x: number; z: number }) {
  return (
    <mesh
      position={[x + MODULE_SIZE / 2, WALL_HEIGHT, z + MODULE_SIZE / 2]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial
        color="#f5f5f0"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Furniture box                                                      */
/* ------------------------------------------------------------------ */

function FurnitureBox({
  item,
  offsetX,
  offsetZ,
  overrideColor,
}: {
  item: FurnitureItem;
  offsetX: number;
  offsetZ: number;
  overrideColor?: string;
}) {
  const color = overrideColor || item.color;
  return (
    <mesh
      position={[
        offsetX + item.x + item.width / 2,
        item.height / 2,
        offsetZ + item.z + item.depth / 2,
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[item.width, item.height, item.depth]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  WASD First-Person Movement Controller                              */
/* ------------------------------------------------------------------ */

interface MovementControllerProps {
  modules: ModuleConfig[];
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
}

/** Check if a wall between two adjacent modules allows passage */
function canPassThrough(
  modules: ModuleConfig[],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  const fromMod = modules.find((m) => m.row === fromRow && m.col === fromCol);
  const toMod = modules.find((m) => m.row === toRow && m.col === toCol);
  if (!fromMod || !toMod) return false;

  // Determine which wall side connects these modules
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  let fromSide: "north" | "south" | "east" | "west";
  if (dr === -1 && dc === 0) fromSide = "north";
  else if (dr === 1 && dc === 0) fromSide = "south";
  else if (dr === 0 && dc === -1) fromSide = "west";
  else if (dr === 0 && dc === 1) fromSide = "east";
  else return false;

  const wallType = fromMod.wallConfigs[fromSide];
  // Allow passage through shared walls (door opening), doors, and open walls
  return wallType === "shared" || wallType === "door" || wallType === "none";
}

function MovementController({
  modules,
  controlsRef,
  cameraPositionRef,
}: MovementControllerProps) {
  const { camera } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());

  // Build bounding boxes for all modules (with smaller margin for walkable area)
  const bounds = useMemo(() => {
    const margin = 0.15;
    return modules.map((m) => ({
      row: m.row,
      col: m.col,
      minX: m.col * MODULE_SIZE + margin,
      maxX: (m.col + 1) * MODULE_SIZE - margin,
      minZ: m.row * MODULE_SIZE + margin,
      maxZ: (m.row + 1) * MODULE_SIZE - margin,
    }));
  }, [modules]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
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

  /** Find which module contains a point */
  const getModuleAt = useCallback(
    (x: number, z: number) => {
      const col = Math.floor(x / MODULE_SIZE);
      const row = Math.floor(z / MODULE_SIZE);
      return modules.find((m) => m.row === row && m.col === col);
    },
    [modules],
  );

  /** Check if position is walkable (inside a module or passing through an open wall) */
  const isWalkable = useCallback(
    (x: number, z: number, fromX: number, fromZ: number): boolean => {
      // First check: inside any module's bounds
      const inBounds = bounds.some(
        (b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ,
      );
      if (inBounds) return true;

      // Second check: in the transition zone between two modules
      // Find current module and target module
      const fromMod = getModuleAt(fromX, fromZ);
      const toCol = Math.floor(x / MODULE_SIZE);
      const toRow = Math.floor(z / MODULE_SIZE);
      const toMod = modules.find((m) => m.row === toRow && m.col === toCol);

      if (fromMod && toMod && fromMod !== toMod) {
        return canPassThrough(modules, fromMod.row, fromMod.col, toMod.row, toMod.col);
      }

      return false;
    },
    [bounds, modules, getModuleAt],
  );

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const keys = keysRef.current;
    const dir = directionRef.current;
    dir.set(0, 0, 0);

    if (keys.has("KeyW") || keys.has("ArrowUp")) dir.z -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) dir.z += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) dir.x -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) dir.x += 1;

    if (dir.lengthSq() === 0) return;

    dir.normalize();

    // Get camera's forward and right vectors projected to XZ plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const vel = velocityRef.current;
    vel.set(0, 0, 0);
    vel.addScaledVector(right, dir.x);
    vel.addScaledVector(forward, -dir.z);
    vel.normalize();
    vel.multiplyScalar(MOVE_SPEED * delta);

    const newX = camera.position.x + vel.x;
    const newZ = camera.position.z + vel.z;
    const curX = camera.position.x;
    const curZ = camera.position.z;

    // Collision: move if destination is walkable (inside module or through passable wall)
    if (isWalkable(newX, newZ, curX, curZ)) {
      camera.position.x = newX;
      camera.position.z = newZ;
    } else if (isWalkable(newX, curZ, curX, curZ)) {
      camera.position.x = newX;
    } else if (isWalkable(curX, newZ, curX, curZ)) {
      camera.position.z = newZ;
    }

    camera.position.y = EYE_HEIGHT;
    cameraPositionRef.current.copy(camera.position);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene Content (inside Canvas)                                      */
/* ------------------------------------------------------------------ */

interface SceneContentProps {
  modules: ModuleConfig[];
  teleportTarget: { row: number; col: number } | null;
  onTeleportDone: () => void;
  controlsRef: React.RefObject<any>;
  cameraPositionRef: React.MutableRefObject<THREE.Vector3>;
}

function SceneContent({
  modules,
  teleportTarget,
  onTeleportDone,
  controlsRef,
  cameraPositionRef,
}: SceneContentProps) {
  const { camera } = useThree();

  // Handle teleport
  useEffect(() => {
    if (teleportTarget) {
      const x = teleportTarget.col * MODULE_SIZE + MODULE_SIZE / 2;
      const z = teleportTarget.row * MODULE_SIZE + MODULE_SIZE / 2;
      camera.position.set(x, EYE_HEIGHT, z);
      cameraPositionRef.current.set(x, EYE_HEIGHT, z);
      onTeleportDone();
    }
  }, [teleportTarget, camera, cameraPositionRef, onTeleportDone]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 15, -5]} intensity={0.3} />

      {/* Per-module point lights */}
      {modules.map((mod) => (
        <pointLight
          key={`light-${mod.row}-${mod.col}`}
          position={[
            mod.col * MODULE_SIZE + MODULE_SIZE / 2,
            WALL_HEIGHT - 0.3,
            mod.row * MODULE_SIZE + MODULE_SIZE / 2,
          ]}
          intensity={0.6}
          distance={5}
          decay={2}
          color="#fff5e6"
        />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e8e5e0" roughness={1} />
      </mesh>

      {/* Render each module */}
      {modules.map((mod) => {
        const ox = mod.col * MODULE_SIZE;
        const oz = mod.row * MODULE_SIZE;
        const floorColor =
          FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color ||
          "#D4A76A";
        const wallColor =
          WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color ||
          "#F0EDE5";
        const preset = getPreset(mod.moduleType, mod.layoutPreset);
        const furniture = preset?.furniture || [];

        return (
          <group key={`mod-${mod.row}-${mod.col}`}>
            <ModuleFloor x={ox} z={oz} color={floorColor} />
            <ModuleWalls mod={mod} wallColor={wallColor} />
            <ModuleCeiling x={ox} z={oz} />

            {/* Furniture */}
            {furniture.map((item) => {
              const override = mod.furnitureOverrides[item.id];
              return (
                <FurnitureBox
                  key={`${mod.row}-${mod.col}-${item.id}`}
                  item={item}
                  offsetX={ox}
                  offsetZ={oz}
                  overrideColor={override?.color}
                />
              );
            })}
          </group>
        );
      })}

      {/* First-person controls */}
      <PointerLockControls ref={controlsRef} />
      <MovementController
        modules={modules}
        controlsRef={controlsRef}
        cameraPositionRef={cameraPositionRef}
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
}

export default function WalkthroughScene({
  teleportTarget,
  onTeleportDone,
  controlsRef,
  cameraPositionRef,
}: WalkthroughSceneProps) {
  const modules = useDesignStore((s) => s.modules);

  // Initial camera position: center of first module
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
      camera={{
        position: initialPos,
        fov: 70,
        near: 0.1,
        far: 200,
      }}
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
