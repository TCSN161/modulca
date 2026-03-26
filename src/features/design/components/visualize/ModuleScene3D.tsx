"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import * as THREE from "three";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, ContactShadows, useCursor, useGLTF } from "@react-three/drei";
import type { ModuleConfig, WallConfigs } from "../../store";
import { useDesignStore } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";
import type { FurnitureOverride } from "../../store";
import type { ReactElement } from "react";

const MODULE_SIZE = 3; // 3m
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.08;
const HALF_THICK = WALL_THICKNESS / 2;
const HALF_HEIGHT = WALL_HEIGHT / 2;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.1;
const WINDOW_BOTTOM = 0.9;
const WINDOW_TOP = 2.1;

function Floor({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MODULE_SIZE / 2, 0, MODULE_SIZE / 2]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/** Invisible floor plane used as the raycast target for drag operations. */
function DragPlane({
  onPointerMove,
  onPointerUp,
}: {
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[MODULE_SIZE / 2, 0.001, MODULE_SIZE / 2]}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Wall segment                                                       */
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

function GlassPane({
  position,
  size,
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
/*  Build wall geometry based on wall type                             */
/* ------------------------------------------------------------------ */

function buildWall(
  key: string,
  pos: [number, number, number],
  fullSize: [number, number, number],
  wallType: string,
  wallColor: string,
  isHorizontal: boolean,
): ReactElement[] {
  const walls: ReactElement[] = [];

  if (wallType === "none") return walls;

  if (wallType === "shared") {
    // Shared wall: render as door opening (passthrough between modules)
    const wallLen = isHorizontal ? fullSize[0] : fullSize[2];
    const doorLeft = (wallLen - DOOR_WIDTH) / 2;
    const doorRight = doorLeft + DOOR_WIDTH;
    const rightWidth = wallLen - doorRight;
    const topHeight = WALL_HEIGHT - DOOR_HEIGHT;

    if (isHorizontal) {
      const baseX = pos[0] - wallLen / 2;
      const baseZ = pos[2];
      walls.push(<WallSegment key={`${key}-l`} position={[baseX + doorLeft / 2, HALF_HEIGHT, baseZ]} size={[doorLeft, WALL_HEIGHT, WALL_THICKNESS]} color="#d4a56a" />);
      walls.push(<WallSegment key={`${key}-r`} position={[baseX + doorRight + rightWidth / 2, HALF_HEIGHT, baseZ]} size={[rightWidth, WALL_HEIGHT, WALL_THICKNESS]} color="#d4a56a" />);
      walls.push(<WallSegment key={`${key}-t`} position={[pos[0], DOOR_HEIGHT + topHeight / 2, baseZ]} size={[DOOR_WIDTH, topHeight, WALL_THICKNESS]} color="#d4a56a" />);
    } else {
      const baseX = pos[0];
      const baseZ = pos[2] - wallLen / 2;
      walls.push(<WallSegment key={`${key}-l`} position={[baseX, HALF_HEIGHT, baseZ + doorLeft / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, doorLeft]} color="#d4a56a" />);
      walls.push(<WallSegment key={`${key}-r`} position={[baseX, HALF_HEIGHT, baseZ + doorRight + rightWidth / 2]} size={[WALL_THICKNESS, WALL_HEIGHT, rightWidth]} color="#d4a56a" />);
      walls.push(<WallSegment key={`${key}-t`} position={[baseX, DOOR_HEIGHT + topHeight / 2, pos[2]]} size={[WALL_THICKNESS, topHeight, DOOR_WIDTH]} color="#d4a56a" />);
    }
    return walls;
  }

  if (wallType === "solid") {
    walls.push(<WallSegment key={key} position={pos} size={fullSize} color={wallColor} />);
    return walls;
  }

  if (wallType === "window") {
    // Wall with glass section in the middle
    const wallLen = isHorizontal ? fullSize[0] : fullSize[2];
    const windowH = WINDOW_TOP - WINDOW_BOTTOM;

    // Bottom section (below window)
    if (isHorizontal) {
      walls.push(<WallSegment key={`${key}-bot`} position={[pos[0], WINDOW_BOTTOM / 2, pos[2]]} size={[wallLen, WINDOW_BOTTOM, WALL_THICKNESS]} color={wallColor} />);
      walls.push(<GlassPane key={`${key}-glass`} position={[pos[0], WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[wallLen * 0.7, windowH, WALL_THICKNESS * 0.5]} />);
      // Side pillars next to glass
      const pillarW = wallLen * 0.15;
      walls.push(<WallSegment key={`${key}-pl`} position={[pos[0] - wallLen / 2 + pillarW / 2, WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[pillarW, windowH, WALL_THICKNESS]} color={wallColor} />);
      walls.push(<WallSegment key={`${key}-pr`} position={[pos[0] + wallLen / 2 - pillarW / 2, WINDOW_BOTTOM + windowH / 2, pos[2]]} size={[pillarW, windowH, WALL_THICKNESS]} color={wallColor} />);
      // Top section (above window)
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

  // "door" — wall with door opening
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
/*  Walls using wallConfigs                                            */
/* ------------------------------------------------------------------ */

function Walls({ color, wallConfigs }: { color: string; wallConfigs: WallConfigs }) {
  const walls: ReactElement[] = [];
  const wc = wallConfigs;

  // North wall (z = 0, along X)
  walls.push(
    ...buildWall(
      "north", [MODULE_SIZE / 2, HALF_HEIGHT, HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.north, color, true,
    ),
  );

  // South wall (z = MODULE_SIZE, along X)
  walls.push(
    ...buildWall(
      "south", [MODULE_SIZE / 2, HALF_HEIGHT, MODULE_SIZE - HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.south, color, true,
    ),
  );

  // West wall (x = 0, along Z)
  walls.push(
    ...buildWall(
      "west", [HALF_THICK, HALF_HEIGHT, MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.west, color, false,
    ),
  );

  // East wall (x = MODULE_SIZE, along Z)
  walls.push(
    ...buildWall(
      "east", [MODULE_SIZE - HALF_THICK, HALF_HEIGHT, MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.east, color, false,
    ),
  );

  return <group>{walls}</group>;
}

function Ceiling() {
  return (
    <mesh position={[MODULE_SIZE / 2, WALL_HEIGHT, MODULE_SIZE / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f5f5f0" transparent opacity={0.15} side={2} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  GLB Model loader — maps furniture labels to Kenney models          */
/* ------------------------------------------------------------------ */

const LABEL_TO_GLB: Record<string, string> = {
  bed: "/models/bedDouble.glb",
  "single bed": "/models/bedSingle.glb",
  sofa: "/models/loungeSofa.glb",
  couch: "/models/loungeSofa.glb",
  "l-sofa": "/models/loungeSofaCorner.glb",
  chair: "/models/chair.glb",
  "office chair": "/models/chairDesk.glb",
  "desk chair": "/models/chairDesk.glb",
  desk: "/models/desk.glb",
  table: "/models/table.glb",
  "dining table": "/models/table.glb",
  "round table": "/models/tableRound.glb",
  "coffee table": "/models/tableRound.glb",
  nightstand: "/models/sideTable.glb",
  "side table": "/models/sideTable.glb",
  wardrobe: "/models/cabinetBedDrawer.glb",
  closet: "/models/cabinetBedDrawer.glb",
  dresser: "/models/cabinetBedDrawer.glb",
  toilet: "/models/toilet.glb",
  wc: "/models/toilet.glb",
  shower: "/models/shower.glb",
  bathtub: "/models/bathtub.glb",
  bath: "/models/bathtub.glb",
  sink: "/models/bathroomSink.glb",
  "kitchen sink": "/models/kitchenSink.glb",
  lamp: "/models/lampRoundFloor.glb",
  "floor lamp": "/models/lampRoundFloor.glb",
  "table lamp": "/models/lampRoundTable.glb",
  "desk lamp": "/models/lampRoundTable.glb",
  plant: "/models/pottedPlant.glb",
  armchair: "/models/loungeChair.glb",
};

function getGlbPath(label: string): string | null {
  const lbl = label.toLowerCase();
  // Try exact match first
  if (LABEL_TO_GLB[lbl]) return LABEL_TO_GLB[lbl];
  // Try partial match
  for (const [key, path] of Object.entries(LABEL_TO_GLB)) {
    if (lbl.includes(key) || key.includes(lbl)) return path;
  }
  return null;
}

function GlbFurniture({ path, w, h, d }: { path: string; w: number; h: number; d: number }) {
  const { scene } = useGLTF(path);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!ref.current) return;
    const cloned = scene.clone(true);
    // Clear previous children
    while (ref.current.children.length) ref.current.remove(ref.current.children[0]);
    ref.current.add(cloned);

    // Compute bounding box to scale model to fit the designated dimensions
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const scaleX = size.x > 0 ? w / size.x : 1;
    const scaleY = size.y > 0 ? h / size.y : 1;
    const scaleZ = size.z > 0 ? d / size.z : 1;
    const s = Math.min(scaleX, scaleY, scaleZ);
    cloned.scale.set(s, s, s);

    // Re-compute after scale
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    const minY = box2.min.y;
    cloned.position.set(-center.x, -minY, -center.z);
  }, [scene, w, h, d]);

  return <group ref={ref} position={[0, -h / 2, 0]} />;
}

/* ------------------------------------------------------------------ */
/*  Detailed furniture geometry based on label (fallback)              */
/* ------------------------------------------------------------------ */

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function DetailedFurniture({ w, h, d, color, label }: { w: number; h: number; d: number; color: string; label: string }) {
  const lbl = label.toLowerCase();
  const legColor = darken(color, 40);

  // Bed: mattress + headboard + 4 legs + pillow
  if (lbl.includes("bed")) {
    const legH = 0.12;
    const mattH = h - legH - 0.08;
    return (
      <group>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.04), -h/2+legH/2, sz*(d/2-0.04)]}>
            <cylinderGeometry args={[0.025, 0.025, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.7} />
          </mesh>
        ))}
        {/* Mattress */}
        <mesh position={[0, -h/2+legH+mattH/2, 0]} castShadow>
          <boxGeometry args={[w-0.04, mattH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* Headboard */}
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.03]} castShadow>
          <boxGeometry args={[w-0.02, 0.08+mattH*0.3, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        {/* Pillow */}
        <mesh position={[0, -h/2+legH+mattH+0.04, -d/2+0.2]}>
          <boxGeometry args={[w*0.5, 0.06, 0.18]} />
          <meshStandardMaterial color="#f0ede5" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // Sofa/Couch: seat + backrest + armrests
  if (lbl.includes("sofa") || lbl.includes("couch")) {
    const seatH = h * 0.4;
    const backH = h * 0.55;
    const armW = 0.08;
    return (
      <group>
        {/* Seat cushion */}
        <mesh position={[0, -h/2+seatH/2, 0.03]} castShadow>
          <boxGeometry args={[w-armW*2, seatH, d-0.06]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, -h/2+seatH+backH/2, -d/2+0.06]} castShadow>
          <boxGeometry args={[w-armW*2, backH, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        {/* Left armrest */}
        <mesh position={[-w/2+armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
        {/* Right armrest */}
        <mesh position={[w/2-armW/2, -h/2+(seatH+0.06)/2, 0]} castShadow>
          <boxGeometry args={[armW, seatH+0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  // Table/Desk: thin top + 4 legs
  if (lbl.includes("table") || lbl.includes("desk")) {
    const topH = 0.04;
    const legH = h - topH;
    return (
      <group>
        {/* Tabletop */}
        <mesh position={[0, h/2-topH/2, 0]} castShadow>
          <boxGeometry args={[w, topH, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -topH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.02, 0.02, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Chair: seat + 4 legs + back
  if (lbl.includes("chair")) {
    const seatH = 0.04;
    const seatY = h * 0.1;
    const legH = h/2 + seatY;
    return (
      <group>
        {/* Seat */}
        <mesh position={[0, seatY, 0.02]} castShadow>
          <boxGeometry args={[w, seatH, d-0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, seatY + (h/2-seatY)/2+seatH/2, -d/2+0.025]} castShadow>
          <boxGeometry args={[w-0.04, h/2-seatY, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Legs */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*(w/2-0.03), -h/2+legH/2, sz*(d/2-0.03)]}>
            <cylinderGeometry args={[0.015, 0.015, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Wardrobe/Closet: tall box with door line
  if (lbl.includes("wardrobe") || lbl.includes("closet")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Door split line */}
        <mesh position={[0, 0, d/2+0.001]}>
          <planeGeometry args={[0.005, h-0.1]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.03, 0, d/2+0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
        <mesh position={[0.03, 0, d/2+0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
      </group>
    );
  }

  // Toilet: base + tank + seat
  if (lbl.includes("toilet")) {
    return (
      <group>
        {/* Base */}
        <mesh position={[0, -h/2+h*0.2, 0.02]} castShadow>
          <boxGeometry args={[w*0.7, h*0.4, d*0.7]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        {/* Seat */}
        <mesh position={[0, -h/2+h*0.45, 0.04]} castShadow>
          <cylinderGeometry args={[w*0.35, w*0.3, 0.06, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Tank */}
        <mesh position={[0, -h/2+h*0.5, -d/2+0.08]} castShadow>
          <boxGeometry args={[w*0.6, h*0.45, 0.14]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  // Shower: tray + glass panel + head
  if (lbl.includes("shower")) {
    return (
      <group>
        {/* Floor tray */}
        <mesh position={[0, -h/2+0.02, 0]} castShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} />
        </mesh>
        {/* Glass panel */}
        <mesh position={[w/2-0.02, 0, 0]}>
          <boxGeometry args={[0.02, h, d]} />
          <meshStandardMaterial color="#b8d4e3" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Shower pole */}
        <mesh position={[-w/2+0.06, 0, -d/2+0.06]}>
          <cylinderGeometry args={[0.012, 0.012, h, 8]} />
          <meshStandardMaterial color="#999" metalness={0.8} />
        </mesh>
        {/* Shower head */}
        <mesh position={[-w/2+0.06, h/2-0.05, -d/2+0.12]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#bbb" metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // Sink: counter + bowl
  if (lbl.includes("sink")) {
    return (
      <group>
        {/* Counter */}
        <mesh position={[0, h/2-0.03, 0]} castShadow>
          <boxGeometry args={[w, 0.05, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Cabinet below */}
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[w-0.02, h-0.06, d-0.02]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        {/* Bowl */}
        <mesh position={[0, h/2-0.01, 0.02]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[Math.min(w,d)*0.3, 16, 8, 0, Math.PI*2, 0, Math.PI/2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // Stove/Oven: box with burner rings
  if (lbl.includes("stove") || lbl.includes("oven")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Burner rings */}
        {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz], i) => (
          <mesh key={i} position={[sx*w*0.2, h/2+0.002, sz*d*0.2]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.04, 0.008, 8, 16]} />
            <meshStandardMaterial color="#333" metalness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // Fridge: tall box with freezer/fridge divider
  if (lbl.includes("fridge") || lbl.includes("refrigerator")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Divider line */}
        <mesh position={[0, h*0.15, d/2+0.001]}>
          <planeGeometry args={[w-0.04, 0.005]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        {/* Handle */}
        <mesh position={[w/2-0.04, 0, d/2+0.015]}>
          <boxGeometry args={[0.015, h*0.25, 0.02]} />
          <meshStandardMaterial color="#999" metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // Default: simple box
  return (
    <mesh castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive furniture piece                                        */
/* ------------------------------------------------------------------ */

interface FurniturePieceProps {
  item: FurnitureItem;
  override: FurnitureOverride | undefined;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: (e: ThreeEvent<PointerEvent>, item: FurnitureItem) => void;
}

function FurniturePiece({
  item,
  override,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
}: FurniturePieceProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const posX = override?.x ?? item.x;
  const posZ = override?.z ?? item.z;
  const displayColor = override?.color ?? item.color;
  const rotationY = override?.rotation ?? 0;
  const halfH = item.height / 2;

  return (
    <group position={[posX + item.width / 2, halfH, posZ + item.depth / 2]}>
      {/* Invisible hitbox for interaction (not rotated so drag stays consistent) */}
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onDragStart(e, item);
        }}
      >
        <boxGeometry args={[item.width, item.height, item.depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Rotated group containing furniture geometry */}
      <group rotation={[0, rotationY, 0]}>
        {/* GLB model or fallback detailed geometry */}
        {getGlbPath(item.label) ? (
          <GlbFurniture
            path={getGlbPath(item.label)!}
            w={item.width}
            h={item.height}
            d={item.depth}
          />
        ) : (
          <DetailedFurniture
            w={item.width}
            h={item.height}
            d={item.depth}
            color={displayColor}
            label={item.label}
          />
        )}

        {/* Hover/selection glow overlay */}
        {(hovered || isSelected) && (
          <mesh>
            <boxGeometry args={[item.width, item.height, item.depth]} />
            <meshStandardMaterial
              color={displayColor}
              transparent
              opacity={0.15}
              emissive={isSelected ? "#4488ff" : "#666666"}
              emissiveIntensity={isSelected ? 0.5 : 0.2}
            />
          </mesh>
        )}

        {/* Selection wireframe outline */}
        {isSelected && (
          <mesh>
            <boxGeometry args={[item.width + 0.02, item.height + 0.02, item.depth + 0.02]} />
            <meshBasicMaterial color="#4488ff" wireframe />
          </mesh>
        )}
      </group>

      {/* Rotation indicator ring on top of selected furniture */}
      {isSelected && (
        <group position={[0, halfH + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Circular ring */}
          <mesh>
            <torusGeometry args={[Math.max(item.width, item.depth) * 0.4, 0.012, 8, 32]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.6} />
          </mesh>
          {/* Arrow head to indicate rotation direction */}
          <mesh position={[Math.max(item.width, item.depth) * 0.4, 0, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.04, 0.08, 6]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Shadow / highlight disc under dragged piece */}
      {isDragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -halfH + 0.005, 0]}>
          <circleGeometry args={[Math.max(item.width, item.depth) * 0.6, 24]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.18} />
        </mesh>
      )}

      {/* Label floating above */}
      <Text
        position={[0, halfH + 0.12, 0]}
        fontSize={0.09}
        color="#555"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {item.label}
      </Text>
    </group>
  );
}

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
        <Walls color={wallColor} wallConfigs={module.wallConfigs} />
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
  const preset = getPreset(module.moduleType, module.layoutPreset);
  const furniture = preset?.furniture || [];
  const floorColor = FLOOR_MATERIALS.find((f) => f.id === module.floorFinish)?.color || "#D4A76A";
  const wallColor = WALL_MATERIALS.find((w) => w.id === module.wallColor)?.color || "#F0EDE5";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
        <SceneContent
          module={module}
          furniture={furniture}
          floorColor={floorColor}
          wallColor={wallColor}
        />
      </Canvas>
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
        Click to select &bull; Arrow keys to move &bull; R to rotate
      </div>
    </div>
  );
}
