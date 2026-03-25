"use client";

import { useMemo, useState, type ReactElement } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useDesignStore } from "../../store";
import type { ModuleConfig } from "../../store";
import { getPreset, FLOOR_MATERIALS, WALL_MATERIALS } from "../../layouts";
import type { FurnitureItem } from "../../layouts";

const MODULE_SIZE = 3;
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.08;
const HALF_THICK = WALL_THICKNESS / 2;
const HALF_HEIGHT = WALL_HEIGHT / 2;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.1;
const WINDOW_BOTTOM = 0.9;
const WINDOW_TOP = 2.1;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Floor                                                              */
/* ------------------------------------------------------------------ */

function ModuleFloor({ x, z, color }: { x: number; z: number; color: string }) {
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
/*  Ceiling                                                            */
/* ------------------------------------------------------------------ */

function ModuleCeiling({ x, z }: { x: number; z: number }) {
  return (
    <mesh
      position={[x + MODULE_SIZE / 2, WALL_HEIGHT, z + MODULE_SIZE / 2]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[MODULE_SIZE, MODULE_SIZE]} />
      <meshStandardMaterial color="#f5f5f0" transparent opacity={0.15} side={2} />
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

/* ------------------------------------------------------------------ */
/*  Glass pane for windows                                             */
/* ------------------------------------------------------------------ */

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
/*  Build wall geometry based on wall type (matches ModuleScene3D)     */
/* ------------------------------------------------------------------ */

function buildCombinedWall(
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
/*  Walls using wallConfigs (respects window/door/none/shared)         */
/* ------------------------------------------------------------------ */

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
    ...buildCombinedWall(
      `${mod.row}-${mod.col}-north`,
      [ox + MODULE_SIZE / 2, HALF_HEIGHT, oz + HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.north, wallColor, true,
    ),
  );

  // South wall (z = oz + MODULE_SIZE, along X)
  walls.push(
    ...buildCombinedWall(
      `${mod.row}-${mod.col}-south`,
      [ox + MODULE_SIZE / 2, HALF_HEIGHT, oz + MODULE_SIZE - HALF_THICK],
      [MODULE_SIZE, WALL_HEIGHT, WALL_THICKNESS],
      wc.south, wallColor, true,
    ),
  );

  // West wall (x = ox, along Z)
  walls.push(
    ...buildCombinedWall(
      `${mod.row}-${mod.col}-west`,
      [ox + HALF_THICK, HALF_HEIGHT, oz + MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.west, wallColor, false,
    ),
  );

  // East wall (x = ox + MODULE_SIZE, along Z)
  walls.push(
    ...buildCombinedWall(
      `${mod.row}-${mod.col}-east`,
      [ox + MODULE_SIZE - HALF_THICK, HALF_HEIGHT, oz + MODULE_SIZE / 2],
      [WALL_THICKNESS, WALL_HEIGHT, MODULE_SIZE],
      wc.east, wallColor, false,
    ),
  );

  return <group>{walls}</group>;
}

/* ------------------------------------------------------------------ */
/*  Simplified detailed furniture (same logic as ModuleScene3D)        */
/* ------------------------------------------------------------------ */

function DetailedFurniture({
  w,
  h,
  d,
  color,
  label,
}: {
  w: number;
  h: number;
  d: number;
  color: string;
  label: string;
}) {
  const lbl = label.toLowerCase();
  const legColor = darken(color, 40);

  if (lbl.includes("bed")) {
    const legH = 0.12;
    const mattH = h - legH - 0.08;
    return (
      <group>
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * (w / 2 - 0.04), -h / 2 + legH / 2, sz * (d / 2 - 0.04)]}>
            <cylinderGeometry args={[0.025, 0.025, legH, 8]} />
            <meshStandardMaterial color={legColor} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, -h / 2 + legH + mattH / 2, 0]} castShadow>
          <boxGeometry args={[w - 0.04, mattH, d - 0.04]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, -h / 2 + legH + mattH + 0.04, -d / 2 + 0.03]} castShadow>
          <boxGeometry args={[w - 0.02, 0.08 + mattH * 0.3, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -h / 2 + legH + mattH + 0.04, -d / 2 + 0.2]}>
          <boxGeometry args={[w * 0.5, 0.06, 0.18]} />
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
        <mesh position={[0, -h / 2 + seatH / 2, 0.03]} castShadow>
          <boxGeometry args={[w - armW * 2, seatH, d - 0.06]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[0, -h / 2 + seatH + backH / 2, -d / 2 + 0.06]} castShadow>
          <boxGeometry args={[w - armW * 2, backH, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[-w / 2 + armW / 2, -h / 2 + (seatH + 0.06) / 2, 0]} castShadow>
          <boxGeometry args={[armW, seatH + 0.06, d]} />
          <meshStandardMaterial color={legColor} roughness={0.7} />
        </mesh>
        <mesh position={[w / 2 - armW / 2, -h / 2 + (seatH + 0.06) / 2, 0]} castShadow>
          <boxGeometry args={[armW, seatH + 0.06, d]} />
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
        <mesh position={[0, h / 2 - topH / 2, 0]} castShadow>
          <boxGeometry args={[w, topH, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * (w / 2 - 0.03), -topH / 2, sz * (d / 2 - 0.03)]}>
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
    const legH = h / 2 + seatY;
    return (
      <group>
        <mesh position={[0, seatY, 0.02]} castShadow>
          <boxGeometry args={[w, seatH, d - 0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0, seatY + (h / 2 - seatY) / 2 + seatH / 2, -d / 2 + 0.025]} castShadow>
          <boxGeometry args={[w - 0.04, h / 2 - seatY, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * (w / 2 - 0.03), -h / 2 + legH / 2, sz * (d / 2 - 0.03)]}>
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
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, d / 2 + 0.001]}>
          <planeGeometry args={[0.005, h - 0.1]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        <mesh position={[-0.03, 0, d / 2 + 0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
        <mesh position={[0.03, 0, d / 2 + 0.01]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={legColor} metalness={0.5} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("toilet")) {
    return (
      <group>
        <mesh position={[0, -h / 2 + h * 0.2, 0.02]} castShadow>
          <boxGeometry args={[w * 0.7, h * 0.4, d * 0.7]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
        <mesh position={[0, -h / 2 + h * 0.45, 0.04]} castShadow>
          <cylinderGeometry args={[w * 0.35, w * 0.3, 0.06, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0, -h / 2 + h * 0.5, -d / 2 + 0.08]} castShadow>
          <boxGeometry args={[w * 0.6, h * 0.45, 0.14]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("shower")) {
    return (
      <group>
        <mesh position={[0, -h / 2 + 0.02, 0]} castShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} />
        </mesh>
        <mesh position={[w / 2 - 0.02, 0, 0]}>
          <boxGeometry args={[0.02, h, d]} />
          <meshStandardMaterial color="#b8d4e3" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        <mesh position={[-w / 2 + 0.06, 0, -d / 2 + 0.06]}>
          <cylinderGeometry args={[0.012, 0.012, h, 8]} />
          <meshStandardMaterial color="#999" metalness={0.8} />
        </mesh>
        <mesh position={[-w / 2 + 0.06, h / 2 - 0.05, -d / 2 + 0.12]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#bbb" metalness={0.8} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("sink")) {
    return (
      <group>
        <mesh position={[0, h / 2 - 0.03, 0]} castShadow>
          <boxGeometry args={[w, 0.05, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[w - 0.02, h - 0.06, d - 0.02]} />
          <meshStandardMaterial color={legColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, h / 2 - 0.01, 0.02]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[Math.min(w, d) * 0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (lbl.includes("stove") || lbl.includes("oven")) {
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * w * 0.2, h / 2 + 0.002, sz * d * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
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
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0, h * 0.15, d / 2 + 0.001]}>
          <planeGeometry args={[w - 0.04, 0.005]} />
          <meshBasicMaterial color={legColor} />
        </mesh>
        <mesh position={[w / 2 - 0.04, 0, d / 2 + 0.015]}>
          <boxGeometry args={[0.015, h * 0.25, 0.02]} />
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
/*  Furniture piece (positioned within a module)                       */
/* ------------------------------------------------------------------ */

function FurniturePiece({
  item,
  offsetX,
  offsetZ,
  overrideColor,
  overrideX,
  overrideZ,
  overrideRotation,
}: {
  item: FurnitureItem;
  offsetX: number;
  offsetZ: number;
  overrideColor?: string;
  overrideX?: number;
  overrideZ?: number;
  overrideRotation?: number;
}) {
  const posX = overrideX ?? item.x;
  const posZ = overrideZ ?? item.z;
  const displayColor = overrideColor ?? item.color;
  const rotY = overrideRotation ?? 0;

  return (
    <group
      position={[
        offsetX + posX + item.width / 2,
        item.height / 2,
        offsetZ + posZ + item.depth / 2,
      ]}
    >
      <group rotation={[0, rotY, 0]}>
        <DetailedFurniture
          w={item.width}
          h={item.height}
          d={item.depth}
          color={displayColor}
          label={item.label}
        />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Clickable module highlight overlay                                 */
/* ------------------------------------------------------------------ */

function ModuleClickArea({
  mod,
  isSelected,
  onSelect,
}: {
  mod: ModuleConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ox = mod.col * MODULE_SIZE;
  const oz = mod.row * MODULE_SIZE;

  return (
    <group>
      {/* Invisible click target on the floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ox + MODULE_SIZE / 2, 0.002, oz + MODULE_SIZE / 2]}
        onClick={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[MODULE_SIZE - 0.1, MODULE_SIZE - 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Selection highlight border on floor */}
      {(isSelected || hovered) && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[ox + MODULE_SIZE / 2, 0.003, oz + MODULE_SIZE / 2]}
        >
          <planeGeometry args={[MODULE_SIZE - 0.02, MODULE_SIZE - 0.02]} />
          <meshBasicMaterial
            color={isSelected ? "#F59E0B" : "#94A3B8"}
            transparent
            opacity={isSelected ? 0.15 : 0.08}
          />
        </mesh>
      )}

      {/* Selection edge glow — 4 thin strips on the floor edges */}
      {isSelected && (
        <group>
          {/* North edge */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE / 2, 0.004, oz + 0.02]}>
            <planeGeometry args={[MODULE_SIZE, 0.04]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          {/* South edge */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE / 2, 0.004, oz + MODULE_SIZE - 0.02]}>
            <planeGeometry args={[MODULE_SIZE, 0.04]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          {/* West edge */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + 0.02, 0.004, oz + MODULE_SIZE / 2]}>
            <planeGeometry args={[0.04, MODULE_SIZE]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
          {/* East edge */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + MODULE_SIZE - 0.02, 0.004, oz + MODULE_SIZE / 2]}>
            <planeGeometry args={[0.04, MODULE_SIZE]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene content (inside Canvas)                                      */
/* ------------------------------------------------------------------ */

function SceneContent({ modules }: { modules: ModuleConfig[] }) {
  const selectedModule = useDesignStore((s) => s.selectedModule);
  const setSelectedModule = useDesignStore((s) => s.setSelectedModule);

  // Compute building bounds for camera positioning
  const { centerX, centerZ, extent } = useMemo(() => {
    if (modules.length === 0) return { centerX: 0, centerZ: 0, extent: 3 };
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
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
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[centerX + cameraDistance * 0.5, cameraDistance * 0.8, centerZ + cameraDistance * 0.5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[centerX - cameraDistance * 0.3, cameraDistance * 0.5, centerZ - cameraDistance * 0.3]}
        intensity={0.3}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.01, centerZ]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e8e5e0" roughness={1} />
      </mesh>

      {/* Render each module */}
      {modules.map((mod) => {
        const ox = mod.col * MODULE_SIZE;
        const oz = mod.row * MODULE_SIZE;
        const floorColor =
          FLOOR_MATERIALS.find((f) => f.id === mod.floorFinish)?.color || "#D4A76A";
        const wallColor =
          WALL_MATERIALS.find((w) => w.id === mod.wallColor)?.color || "#F0EDE5";
        const preset = getPreset(mod.moduleType, mod.layoutPreset);
        const furniture = preset?.furniture || [];
        const isSelected =
          selectedModule?.row === mod.row && selectedModule?.col === mod.col;

        return (
          <group key={`mod-${mod.row}-${mod.col}`}>
            <ModuleFloor x={ox} z={oz} color={floorColor} />
            <ModuleWalls mod={mod} wallColor={wallColor} />
            <ModuleCeiling x={ox} z={oz} />

            {/* Furniture */}
            {furniture.map((item) => {
              const presetOvr = mod.furnitureOverrides[mod.layoutPreset] ?? {};
              const override = presetOvr[item.id];
              return (
                <FurniturePiece
                  key={`${mod.row}-${mod.col}-${item.id}`}
                  item={item}
                  offsetX={ox}
                  offsetZ={oz}
                  overrideColor={override?.color}
                  overrideX={override?.x}
                  overrideZ={override?.z}
                  overrideRotation={override?.rotation}
                />
              );
            })}

            {/* Clickable selection overlay */}
            <ModuleClickArea
              mod={mod}
              isSelected={isSelected}
              onSelect={() => setSelectedModule({ row: mod.row, col: mod.col })}
            />
          </group>
        );
      })}

      {/* Click empty space to deselect */}
      <mesh
        visible={false}
        position={[centerX, -0.1, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => setSelectedModule(null)}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[centerX, -0.005, centerZ]}
        opacity={0.25}
        scale={extent + 10}
        blur={2}
      />

      {/* Orbit controls */}
      <OrbitControls
        target={[centerX, WALL_HEIGHT * 0.3, centerZ]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={cameraDistance * 2}
        enablePan
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper                                                   */
/* ------------------------------------------------------------------ */

export default function CombinedScene3D() {
  const modules = useDesignStore((s) => s.modules);

  // Compute camera position to see entire building
  const cameraPos = useMemo<[number, number, number]>(() => {
    if (modules.length === 0) return [5, 8, 5];
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
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
    const extent = Math.max(spanX, spanZ);
    const dist = extent * 1.4 + 4;
    return [cx + dist * 0.6, dist * 0.7, cz + dist * 0.6];
  }, [modules]);

  if (modules.length === 0) return null;

  return (
    <Canvas
      shadows
      camera={{
        position: cameraPos,
        fov: 40,
        near: 0.1,
        far: 200,
      }}
      style={{ background: "#f8f8f6", width: "100%", height: "100%" }}
    >
      <SceneContent modules={modules} />
    </Canvas>
  );
}
