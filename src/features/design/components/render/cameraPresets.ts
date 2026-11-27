/**
 * Camera presets + focal length for the render viewport (5.03-A).
 *
 * Pure maths, no Three.js import: positions are [x, y, z] in scene metres.
 * Bounds are the house footprint in the scene's own coordinates (the single
 * module view centres the module on the origin; the All Modules view uses
 * row/col × MODULE_SIZE).
 */

export type CameraPreset = "overview" | "exterior" | "interior";
export type Vec3 = [number, number, number];

export interface FootprintBounds {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

export interface CameraPose {
  position: Vec3;
  target: Vec3;
  /** Look-around in place (interior) instead of orbiting the house. */
  firstPerson: boolean;
}

export const EYE_HEIGHT = 1.6;
export const WALL_HEIGHT_M = 2.7;
/** Interior wall face inset from the module edge (0.3 m walls). */
const WALL_INSET = 0.3;

/** Default focal length per preset (35 mm equivalent). */
export const PRESET_FOCAL_MM: Record<CameraPreset, number> = {
  overview: 35,
  exterior: 28,
  interior: 18,
};

export const FOCAL_MIN_MM = 16;
export const FOCAL_MAX_MM = 50;

/**
 * Vertical field of view (degrees) of a 35 mm full-frame lens: sensor 36×24 mm.
 * 50 mm ≈ 27°, 24 mm ≈ 53°, 16 mm ≈ 74°.
 */
export function focalToVerticalFov(mm: number): number {
  const f = Math.min(FOCAL_MAX_MM, Math.max(FOCAL_MIN_MM, mm));
  return (2 * Math.atan(12 / f) * 180) / Math.PI;
}

export const PRESET_LABELS: Record<CameraPreset, { ro: string; en: string }> = {
  overview: { ro: "Axonometrie", en: "Overview" },
  exterior: { ro: "Exterior (ochi)", en: "Eye-level exterior" },
  interior: { ro: "Interior (persoana I)", en: "Interior first-person" },
};

export function boundsCenter(b: FootprintBounds): { cx: number; cz: number; span: number } {
  return {
    cx: (b.minX + b.maxX) / 2,
    cz: (b.minZ + b.maxZ) / 2,
    span: Math.max(b.maxX - b.minX, b.maxZ - b.minZ),
  };
}

/**
 * Camera pose for a preset.
 * @param room footprint of the module to stand in for "interior"; defaults to the house.
 */
export function computeCameraPose(
  preset: CameraPreset,
  house: FootprintBounds,
  room: FootprintBounds = house,
): CameraPose {
  const { cx, cz, span } = boundsCenter(house);
  if (preset === "overview") {
    const d = span * 1.1 + 3;
    return { position: [cx + d * 0.7, d * 0.9, cz + d * 0.7], target: [cx, 0.6, cz], firstPerson: false };
  }
  if (preset === "exterior") {
    const d = span * 1.3 + 4;
    return { position: [cx + d * 0.75, EYE_HEIGHT, cz + d * 0.55], target: [cx, 1.3, cz], firstPerson: false };
  }
  // Interior: stand in one inner corner at eye height, look at the far corner.
  const x0 = room.minX + WALL_INSET + 0.25, x1 = room.maxX - WALL_INSET;
  const z0 = room.minZ + WALL_INSET + 0.25, z1 = room.maxZ - WALL_INSET;
  const position: Vec3 = [x1 - 0.25, EYE_HEIGHT, z1 - 0.25];
  const look: Vec3 = [x0, 1.2, z0];
  return { position, target: lookTarget(position, look), firstPerson: true };
}

/** A target 0.05 m in front of the eye: orbiting it = turning the head. */
export function lookTarget(eye: Vec3, at: Vec3, dist = 0.05): Vec3 {
  const dx = at[0] - eye[0], dy = at[1] - eye[1], dz = at[2] - eye[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  return [eye[0] + (dx / len) * dist, eye[1] + (dy / len) * dist, eye[2] + (dz / len) * dist];
}

/** Footprint of grid modules (row/col × size), as the All Modules scene draws them. */
export function gridBounds(cells: { row: number; col: number }[], size: number): FootprintBounds {
  if (cells.length === 0) return { minX: 0, maxX: size, minZ: 0, maxZ: size };
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const c of cells) {
    minR = Math.min(minR, c.row); maxR = Math.max(maxR, c.row);
    minC = Math.min(minC, c.col); maxC = Math.max(maxC, c.col);
  }
  return { minX: minC * size, maxX: (maxC + 1) * size, minZ: minR * size, maxZ: (maxR + 1) * size };
}
