"use client";

import type { ReactElement } from "react";
import type { WallConfigs } from "../../../store";
import {
  MODULE_SIZE,
  WALL_HEIGHT,
  WALL_THICKNESS,
  HALF_THICK,
  HALF_HEIGHT,
  DOOR_WIDTH,
  DOOR_HEIGHT,
  WINDOW_BOTTOM,
  WINDOW_TOP,
} from "./constants";

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

  // Shared wall = open space between adjacent modules — no geometry
  if (wallType === "shared") return walls;

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

export function Walls({ color, wallConfigs }: { color: string; wallConfigs: WallConfigs }) {
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
