"use client";

/**
 * Shared 3D module rendering utilities.
 * Single source of truth for walls, furniture (GLB + procedural), and constants.
 * Used by: Visualize (Step 6), Render (Step 7), Walkthrough (Step 9), Combined views.
 */

import { useRef, useEffect, Suspense, Component } from "react";
import type { ReactElement } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { WallConfigs, FurnitureOverride } from "../../store";
import type { FurnitureItem } from "../../layouts";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const MODULE_SIZE = 3; // 3m x 3m modules
export const WALL_HEIGHT = 2.7;
export const WALL_THICKNESS = 0.08;
export const HALF_THICK = WALL_THICKNESS / 2;
export const HALF_HEIGHT = WALL_HEIGHT / 2;
export const DOOR_WIDTH = 0.9;
export const DOOR_HEIGHT = 2.1;
export const WINDOW_BOTTOM = 0.9;
export const WINDOW_TOP = 2.1;

/* ------------------------------------------------------------------ */
/*  GLB model mapping — single source of truth                         */
/* ------------------------------------------------------------------ */

export const LABEL_TO_GLB: Record<string, string> = {
  // Beds
  "king bed": "/models/bedDouble.glb",
  "single bed": "/models/bedSingle.glb",
  bed: "/models/bedDouble.glb",
  daybed: "/models/bedSingle.glb",

  // Sofas & seating
  "l-sofa": "/models/loungeSofaCorner.glb",
  "recliner sofa": "/models/loungeSofa.glb",
  sofa: "/models/loungeSofa.glb",
  couch: "/models/loungeSofa.glb",
  "lounge chair": "/models/loungeChair.glb",
  armchair: "/models/loungeChair.glb",

  // Chairs & stools
  "office chair": "/models/chairDesk.glb",
  "desk chair": "/models/chairDesk.glb",
  "bar stool": "/models/chair.glb",
  "work stool": "/models/chair.glb",
  chair: "/models/chair.glb",

  // Desks & tables
  "l-desk": "/models/desk.glb",
  "desk 1": "/models/desk.glb",
  "desk 2": "/models/desk.glb",
  desk: "/models/desk.glb",
  "dining table": "/models/table.glb",
  "round table": "/models/tableRound.glb",
  "coffee table": "/models/sideTable.glb",
  table: "/models/table.glb",
  "kitchen island": "/models/table.glb",
  workbench: "/models/table.glb",

  // Side tables & small furniture
  nightstand: "/models/sideTable.glb",
  "side table": "/models/sideTable.glb",

  // Storage & cabinets
  wardrobe: "/models/cabinetBedDrawer.glb",
  closet: "/models/cabinetBedDrawer.glb",
  dresser: "/models/cabinetBedDrawer.glb",
  bookshelf: "/models/cabinetBedDrawer.glb",
  "shared shelf": "/models/cabinetBedDrawer.glb",
  sideboard: "/models/cabinetBedDrawer.glb",
  "media console": "/models/cabinetBedDrawer.glb",
  "tv unit": "/models/cabinetBedDrawer.glb",
  "file cabinet": "/models/cabinetBedDrawer.glb",
  "storage cabinet": "/models/cabinetBedDrawer.glb",
  "left shelves": "/models/cabinetBedDrawer.glb",
  "right shelves": "/models/cabinetBedDrawer.glb",
  "back shelves": "/models/cabinetBedDrawer.glb",
  "drying rack": "/models/cabinetBedDrawer.glb",

  // Bathroom
  toilet: "/models/toilet.glb",
  "raised toilet": "/models/toilet.glb",
  wc: "/models/toilet.glb",
  shower: "/models/shower.glb",
  "rain shower": "/models/shower.glb",
  "roll-in shower": "/models/shower.glb",
  bathtub: "/models/bathtub.glb",
  "freestanding tub": "/models/bathtub.glb",
  bath: "/models/bathtub.glb",
  vanity: "/models/bathroomSink.glb",
  "low vanity": "/models/bathroomSink.glb",
  sink: "/models/bathroomSink.glb",
  "utility sink": "/models/kitchenSink.glb",
  "kitchen sink": "/models/kitchenSink.glb",

  // Kitchen counters
  "back counter": "/models/kitchenSink.glb",
  "side counter": "/models/kitchenSink.glb",
  "left counter": "/models/kitchenSink.glb",
  "right counter": "/models/kitchenSink.glb",

  // Appliances
  fridge: "/models/cabinetBedDrawer.glb",
  refrigerator: "/models/cabinetBedDrawer.glb",
  washer: "/models/cabinetBedDrawer.glb",
  dryer: "/models/cabinetBedDrawer.glb",
  "water heater": "/models/cabinetBedDrawer.glb",

  // Lamps & plants
  lamp: "/models/lampRoundFloor.glb",
  "floor lamp": "/models/lampRoundFloor.glb",
  "table lamp": "/models/lampRoundTable.glb",
  "desk lamp": "/models/lampRoundTable.glb",
  plant: "/models/pottedPlant.glb",
};

/** Resolve a furniture label to a GLB path. Exact match first, then partial. */
export function getGlbPath(label: string): string | null {
  const lbl = label.toLowerCase();
  if (LABEL_TO_GLB[lbl]) return LABEL_TO_GLB[lbl];
  const sortedKeys = Object.keys(LABEL_TO_GLB).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lbl.includes(key) || key.includes(lbl)) return LABEL_TO_GLB[key];
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

export function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Wall segment + glass pane primitives                               */
/* ------------------------------------------------------------------ */

export function WallSegment({
  position, size, color,
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

export function GlassPane({
  position, size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#8ec8e8" transparent opacity={0.35} roughness={0.1} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  buildWall — creates wall geometry based on type                    */
/* ------------------------------------------------------------------ */

export function buildWall(
  key: string,
  pos: [number, number, number],
  fullSize: [number, number, number],
  wallType: string,
  wallColor: string,
  isHorizontal: boolean,
): ReactElement[] {
  const walls: ReactElement[] = [];

  if (wallType === "none") return walls;

  // Shared wall = open space between adjacent modules — no geometry
  if (wallType === "shared") return walls;

  if (wallType === "solid") {
    walls.push(<WallSegment key={key} position={pos} size={fullSize} color={wallColor} />);
    return walls;
  }

  if (wallType === "window") {
    const wallLen = isHorizontal ? fullSize[0] : fullSize[2];
    const windowH = WINDOW_TOP - WINDOW_BOTTOM;

    if (isHorizontal) {
      walls.push(<WallSegment key={`${key}-bot`} position={[pos[0], WINDOW_BOTTOM / 2, pos[2]]} size={[wallLen, WINDOW_BOTTOM, WALL_THICKNESS]} color={wallColor} />);
      walls.push(<GlassPane key={`${key}-glass`} position={[pos[0], WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[wallLen * 0.7, windowH, WALL_THICKNESS * 0.5]} />);
      const pillarW = wallLen * 0.15;
      walls.push(<WallSegment key={`${key}-pl`} position={[pos[0] - wallLen / 2 + pillarW / 2, WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[pillarW, windowH, WALL_THICKNESS]} color={wallColor} />);
      walls.push(<WallSegment key={`${key}-pr`} position={[pos[0] + wallLen / 2 - pillarW / 2, WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[pillarW, windowH, WALL_THICKNESS]} color={wallColor} />);
      const topH = WALL_HEIGHT - WINDOW_TOP;
      walls.push(<WallSegment key={`${key}-top`} position={[pos[0], WINDOW_TOP + topH / 2, pos[2]]} size={[wallLen, topH, WALL_THICKNESS]} color={wallColor} />);
    } else {
      walls.push(<WallSegment key={`${key}-bot`} position={[pos[0], WINDOW_BOTTOM / 2, pos[2]]} size={[WALL_THICKNESS, WINDOW_BOTTOM, wallLen]} color={wallColor} />);
      walls.push(<GlassPane key={`${key}-glass`} position={[pos[0], WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[WALL_THICKNESS * 0.5, windowH, wallLen * 0.7]} />);
      const pillarD = wallLen * 0.15;
      walls.push(<WallSegment key={`${key}-pl`} position={[pos[0], WINDOW_BOTTOM + windowH / 2, pos[2] - wallLen / 2 + pillarD / 2]} size={[WALL_THICKNESS, windowH, pillarD]} color={wallColor} />);
      walls.push(<WallSegment key={`${key}-pr`} position={[pos[0], WINDOW_BOTTOM + windowH / 2, pos[2] + wallLen / 2 - pillarD / 2]} size={[WALL_THICKNESS, windowH, pillarD]} color={wallColor} />);
      const topH = WALL_HEIGHT - WINDOW_TOP;
      walls.push(<WallSegment key={`${key}-top`} position={[pos[0], WINDOW_TOP + topH / 2, pos[2]]} size={[WALL_THICKNESS, topH, wallLen]} color={wallColor} />);
    }
    return walls;
  }

  // "door"
  const wallLen = isHorizontal ? fullSize[0] : fullSize[2];
  const doorLeft = (wallLen - DOOR_WIDTH) / 2;
  const doorRight = doorLeft + DOOR_WIDTH;
  const rightWidth = wallLen - doorRight;
  const topHeight = WALL_HEIGHT - DOOR_HEIGHT;

  if (isHorizontal) {
    const baseX = pos[0] - wallLen / 2;
    const baseZ = pos[2];
    walls.push(<WallSegment key={`${key}-l`} position={[baseX + doorLeft / 2, HALF_HEIGHT, baseZ]} size={[doorLeft, WALL_HEIGHT, WALL_THICKNESS]} color={wallColor} />);
    walls.push(<WallSegment key={`${key}-r`} position={[baseX + doorRight + rightWidth / 2, HALF_HEIGHT, baseZ]} size={[rightWidth, WALL_HEIGHT, WALL_THICKNESS]} color={wallColor} />);
    walls.push(<WallSegment key={`${key}-t`} position={[pos[0], DOOR_HEIGHT + topHeight / 2, baseZ]} size={[DOOR_WIDTH, topHeight, WALL_THICKNESS]} color={wallColor} />);
  } else {
    const baseX = pos[0];
    const baseZ = pos[2] - wallLen / 2;
    walls.push(<WallSegment key={`${key}-l`} position={[baseX, HALF_HEIGHT, baseZ + doorLeft / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, doorLeft]} color={wallColor} />);
    walls.push(<WallSegment key={`${key}-r`} position={[baseX, HALF_HEIGHT, baseZ + doorRight + rightWidth / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, rightWidth]} color={wallColor} />);
    walls.push(<WallSegment key={`${key}-t`} position={[baseX, DOOR_HEIGHT + topHeight / 2, pos[2]]} size={[WALL_THICKNESS, topHeight, DOOR_WIDTH]} color={wallColor} />);
  }

  return walls;
}

/* ------------------------------------------------------------------ */
/*  Walls component — renders all 4 walls of a module                  */
/* ------------------------------------------------------------------ */

/** Render walls for a module at a given offset. */
export function ModuleWalls({
  wallConfigs, wallColor, offsetX = 0, offsetZ = 0,
}: {
  wallConfigs: WallConfigs;
  wallColor: string;
  offsetX?: number;
  offsetZ?: number;
}) {
  const wc = wallConfigs;
  const walls: ReactElement[] = [];

  walls.push(...buildWall("north", [offsetX + MODULE_SIZE / 2, HALF_HEIGHT, offsetZ + HALF_THICK], [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS], wc.north, wallColor, true));
  walls.push(...buildWall("south", [offsetX + MODULE_SIZE / 2, HALF_HEIGHT, offsetZ + MODULE_SIZE - HALF_THICK], [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS], wc.south, wallColor, true));
  walls.push(...buildWall("west", [offsetX + HALF_THICK, HALF_HEIGHT, offsetZ + MODULE_SIZE / 2], [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE], wc.west, wallColor, false));
  walls.push(...buildWall("east", [offsetX + MODULE_SIZE - HALF_THICK, HALF_HEIGHT, offsetZ + MODULE_SIZE / 2], [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE], wc.east, wallColor, false));

  // Baseboards (skirting boards) — thin dark strip at bottom of visible walls
  const baseH = 0.06;
  const baseD = WALL_THICKNESS + 0.01;
  const baseColor = darken(wallColor, 30);
  const baseOffset = 0.005; // slight protrusion from wall
  if (wc.north !== "none" && wc.north !== "shared") {
    walls.push(<WallSegment key="base-n" position={[offsetX + MODULE_SIZE / 2, baseH / 2, offsetZ + HALF_THICK + baseOffset]} size={[MODULE_SIZE, baseH, baseD]} color={baseColor} />);
  }
  if (wc.south !== "none" && wc.south !== "shared") {
    walls.push(<WallSegment key="base-s" position={[offsetX + MODULE_SIZE / 2, baseH / 2, offsetZ + MODULE_SIZE - HALF_THICK - baseOffset]} size={[MODULE_SIZE, baseH, baseD]} color={baseColor} />);
  }
  if (wc.west !== "none" && wc.west !== "shared") {
    walls.push(<WallSegment key="base-w" position={[offsetX + HALF_THICK + baseOffset, baseH / 2, offsetZ + MODULE_SIZE / 2]} size={[baseD, baseH, MODULE_SIZE]} color={baseColor} />);
  }
  if (wc.east !== "none" && wc.east !== "shared") {
    walls.push(<WallSegment key="base-e" position={[offsetX + MODULE_SIZE - HALF_THICK - baseOffset, baseH / 2, offsetZ + MODULE_SIZE / 2]} size={[baseD, baseH, MODULE_SIZE]} color={baseColor} />);
  }

  return <group>{walls}</group>;
}

/* ------------------------------------------------------------------ */
/*  GLB model loader                                                   */
/* ------------------------------------------------------------------ */

/* getMeshOnlyBoundingBox removed — was computing bounds in world space
   which included parent offsets, causing furniture to cluster at origin
   in combined/multi-module views. Replaced with Box3.setFromObject()
   on detached clones (local space only). */

export function GlbFurniture({ path, w, h, d, color }: { path: string; w: number; h: number; d: number; color?: string }) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Deep-clone the cached scene to avoid cross-instance interference
    const cloned = scene.clone(true);

    // Reset any inherited transforms from the GLTF root
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.scale.set(1, 1, 1);
    cloned.updateMatrixWorld(true);

    // Apply color override to all meshes if provided
    if (color) {
      const threeColor = new THREE.Color(color);
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.isMeshStandardMaterial) {
            child.material = mat.clone();
            (child.material as THREE.MeshStandardMaterial).color.copy(threeColor);
          }
        }
      });
    }

    // ⚠️ IMPORTANT: Compute bounding box BEFORE adding to scene graph.
    // getMeshOnlyBoundingBox uses child.matrixWorld, so if the clone is
    // already parented to a group at a world offset (e.g. module at col=2),
    // the bounding box would include that offset, causing centering to
    // push furniture toward the origin. Computing while detached ensures
    // the bounding box is in pure local space.
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());

    // Guard against degenerate models (zero-size dimensions)
    const MIN_DIM = 0.001;
    const scaleX = size.x > MIN_DIM ? w / size.x : 1;
    const scaleY = size.y > MIN_DIM ? h / size.y : 1;
    const scaleZ = size.z > MIN_DIM ? d / size.z : 1;

    // Protect against insane scale values (corrupted model or bounding box)
    const MAX_SCALE = 1000;
    const safeScaleX = Math.min(Math.abs(scaleX), MAX_SCALE);
    const safeScaleY = Math.min(Math.abs(scaleY), MAX_SCALE);
    const safeScaleZ = Math.min(Math.abs(scaleZ), MAX_SCALE);
    cloned.scale.set(safeScaleX, safeScaleY, safeScaleZ);

    // Recompute after scaling, then center + floor-align (still detached)
    cloned.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    const minY = box2.min.y;

    // Center horizontally, place bottom on floor (y = 0 in group-local space)
    cloned.position.set(
      -center.x,
      Number.isFinite(minY) ? -minY : 0,
      -center.z,
    );

    // NOW add to scene graph, after all positioning is computed
    while (ref.current.children.length) ref.current.remove(ref.current.children[0]);
    ref.current.add(cloned);
  }, [scene, w, h, d, color]);

  return <group ref={ref} position={[0, -h / 2, 0]} />;
}

/* ------------------------------------------------------------------ */
/*  SafeGlbFurniture — error boundary + Suspense wrapper               */
/* ------------------------------------------------------------------ */

interface SafeGlbProps {
  path: string;
  w: number; h: number; d: number;
  color: string;
  label: string;
}

export class SafeGlbFurniture extends Component<SafeGlbProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.error(`[SafeGlbFurniture] Failed to load GLB "${this.props.path}":`, error);
  }
  render() {
    const { path, w, h, d, color, label } = this.props;
    if (this.state.hasError) {
      return <DetailedFurniture w={w} h={h} d={d} color={color} label={label} />;
    }
    return (
      <Suspense fallback={<mesh><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={color} transparent opacity={0.3} wireframe /></mesh>}>
        <GlbFurniture path={path} w={w} h={h} d={d} color={color} />
      </Suspense>
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Detailed procedural furniture (fallback when no GLB)               */
/* ------------------------------------------------------------------ */

export function DetailedFurniture({ w, h, d, color, label }: { w: number; h: number; d: number; color: string; label: string }) {
  const lbl = label.toLowerCase();
  const legColor = darken(color, 40);

  if (lbl.includes("bed")) {
    const legH = 0.12;
    const mattH = h - legH - 0.08;
    return (
      <group>
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.04), -h/2+legH/2, sz*(d/2-0.04)]}>
            <cylinderGeometry args={[0.025, 0.025, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, -h/2+legH+mattH/2, 0]} castShadow>
          <boxGeometry args={[w-0.04, mattH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.03]} castShadow>
          <boxGeometry args={[w-0.02, 0.08+mattH*0.3, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.2]}>
          <boxGeometry args={[w*0.5, 0.06, 0.18]} />
          <meshStandardMaterial color="#f0ede5" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("sofa") || lbl.includes("couch")) {
    const seatH = h * 0.4;
    const backH = h * 0.55;
    const armW = 0.08;
    return (
      <group>
        <mesh position={[0, -h/2+seatH/2, 0.03]} castShadow>
          <boxGeometry args={[w-armW*2, seatH, d-0.06]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[0, -h/2+seatH+backH/2, -d/2+0.06]} castShadow>
          <boxGeometry args={[w-armW*2, backH, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[-w/2+armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
        <mesh position={[w/2-armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("table") || lbl.includes("desk")) {
    const topH = 0.04;
    const legH = h - topH;
    return (
      <group>
        <mesh position={[0, h/2-topH/2, 0]} castShadow>
          <boxGeometry args={[w, topH, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -topH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.02, 0.02, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  if (lbl.includes("chair")) {
    const seatH = 0.04;
    const seatY = h * 0.1;
    const legH = h/2 + seatY;
    return (
      <group>
        <mesh position={[0, seatY, 0.02]} castShadow>
          <boxGeometry args={[w, seatH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, seatY + (h/2-seatY)/2+seatH/2, -d/2+0.025]} castShadow>
          <boxGeometry args={[w-0.04, h/2-seatY, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -h/2+legH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.015, 0.015, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  if (lbl.includes("wardrobe") || lbl.includes("closet")) {
    return (
      <group>
        <mesh castShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
        <mesh position={[0, 0, d/2+0.001]}><planeGeometry args={[0.005, h-0.1]} /><meshBasicMaterial color={legColor} /></mesh>
        <mesh position={[-0.03, 0, d/2+0.01]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color={legColor} metalness={0.5} /></mesh>
        <mesh position={[0.03, 0, d/2+0.01]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color={legColor} metalness={0.5} /></mesh>
      </group>
    );
  }

  if (lbl.includes("toilet")) {
    return (
      <group>
        <mesh position={[0, -h/2+h*0.2, 0.02]} castShadow><boxGeometry args={[w*0.7, h*0.4, d*0.7]} /><meshStandardMaterial color="#f0f0f0" roughness={0.3} /></mesh>
        <mesh position={[0, -h/2+h*0.45, 0.04]} castShadow><cylinderGeometry args={[w*0.35, w*0.3, 0.06, 16]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
        <mesh position={[0, -h/2+h*0.5, -d/2+0.08]} castShadow><boxGeometry args={[w*0.6, h*0.45, 0.14]} /><meshStandardMaterial color="#f0f0f0" roughness={0.3} /></mesh>
      </group>
    );
  }

  if (lbl.includes("shower")) {
    return (
      <group>
        <mesh position={[0, -h/2+0.02, 0]} castShadow><boxGeometry args={[w, 0.04, d]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh>
        <mesh position={[w/2-0.02, 0, 0]}><boxGeometry args={[0.02, h, d]} /><meshStandardMaterial color="#b8d4e3" transparent opacity={0.3} roughness={0.1} /></mesh>
        <mesh position={[-w/2+0.06, 0, -d/2+0.06]}><cylinderGeometry args={[0.012, 0.012, h, 8]} /><meshStandardMaterial color="#999" metalness={0.8} /></mesh>
        <mesh position={[-w/2+0.06, h/2-0.05, -d/2+0.12]}><sphereGeometry args={[0.04, 12, 12]} /><meshStandardMaterial color="#bbb" metalness={0.8} /></mesh>
      </group>
    );
  }

  if (lbl.includes("sink")) {
    return (
      <group>
        <mesh position={[0, h/2-0.03, 0]} castShadow><boxGeometry args={[w, 0.05, d]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
        <mesh position={[0, -0.03, 0]} castShadow><boxGeometry args={[w-0.02, h-0.06, d-0.02]} /><meshStandardMaterial color={legColor} roughness={0.6} /></mesh>
        <mesh position={[0, h/2-0.01, 0.02]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[Math.min(w,d)*0.3, 16, 8, 0, Math.PI*2, 0, Math.PI/2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("stove") || lbl.includes("oven")) {
    return (
      <group>
        <mesh castShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*w*0.2, h/2+0.002, sz*d*0.2]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.04, 0.008, 8, 16]} />
            <meshStandardMaterial color="#333" metalness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  if (lbl.includes("fridge") || lbl.includes("refrigerator")) {
    return (
      <group>
        <mesh castShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
        <mesh position={[0, h*0.15, d/2+0.001]}><planeGeometry args={[w-0.04, 0.005]} /><meshBasicMaterial color={legColor} /></mesh>
        <mesh position={[w/2-0.04, 0, d/2+0.015]}><boxGeometry args={[0.015, h*0.25, 0.02]} /><meshStandardMaterial color="#999" metalness={0.6} /></mesh>
      </group>
    );
  }

  // Default box
  return (
    <mesh castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  StaticFurniturePiece — renders furniture with all overrides        */
/*  Used by Render, Walkthrough, CombinedScene (non-interactive)       */
/* ------------------------------------------------------------------ */

export function StaticFurniturePiece({
  item,
  override,
  offsetX = 0,
  offsetZ = 0,
}: {
  item: FurnitureItem;
  override?: FurnitureOverride;
  offsetX?: number;
  offsetZ?: number;
}) {
  // ---- Safe dimensions (guard against undefined/NaN) ----
  const safeW = Number.isFinite(item.width) ? item.width : 0.5;
  const safeD = Number.isFinite(item.depth) ? item.depth : 0.5;
  const safeH = Number.isFinite(item.height) ? item.height : 0.5;

  // ---- Robust position validation ----
  // 1. Start with item defaults
  let posX = item.x;
  let posZ = item.z;

  // 2. Apply override only if values are finite AND within padded module bounds
  if (override) {
    if (typeof override.x === "number" && Number.isFinite(override.x)
        && override.x >= -0.5 && override.x <= MODULE_SIZE + 0.5) {
      posX = override.x;
    }
    if (typeof override.z === "number" && Number.isFinite(override.z)
        && override.z >= -0.5 && override.z <= MODULE_SIZE + 0.5) {
      posZ = override.z;
    }
  }

  // 3. Final safety: if item defaults themselves are bad, clamp to module center
  if (!Number.isFinite(posX) || posX < -0.5 || posX > MODULE_SIZE + 0.5) posX = MODULE_SIZE / 2 - safeW / 2;
  if (!Number.isFinite(posZ) || posZ < -0.5 || posZ > MODULE_SIZE + 0.5) posZ = MODULE_SIZE / 2 - safeD / 2;

  const displayColor = override?.color ?? item.color;
  const rotationY = (override?.rotation != null && Number.isFinite(override.rotation)) ? override.rotation : 0;
  const halfH = safeH / 2;
  const glbPath = getGlbPath(item.label);

  // 4. Validate offset + position computes to a sane world coordinate
  const worldX = offsetX + posX + safeW / 2;
  const worldZ = offsetZ + posZ + safeD / 2;


  return (
    <group position={[worldX, halfH, worldZ]}>
      <group rotation={[0, rotationY, 0]}>
        {glbPath ? (
          <SafeGlbFurniture
            path={glbPath}
            w={safeW} h={safeH} d={safeD}
            color={displayColor} label={item.label}
          />
        ) : (
          <DetailedFurniture
            w={safeW} h={safeH} d={safeD}
            color={displayColor} label={item.label}
          />
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Floor                                                              */
/* ------------------------------------------------------------------ */

export function ModuleFloor({
  offsetX = 0, offsetZ = 0, color,
}: {
  offsetX?: number; offsetZ?: number; color: string;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX + MODULE_SIZE / 2, 0.001, offsetZ + MODULE_SIZE / 2]} receiveShadow>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Ceiling                                                            */
/* ------------------------------------------------------------------ */

export function ModuleCeiling({
  offsetX = 0, offsetZ = 0,
}: {
  offsetX?: number; offsetZ?: number;
}) {
  return (
    <mesh position={[offsetX + MODULE_SIZE / 2, WALL_HEIGHT, offsetZ + MODULE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f8f7f4" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}
