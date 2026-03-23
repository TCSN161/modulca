import type { LatLng, GridCell } from "../store";

const MODULE_SIZE_METERS = 3;

/**
 * Convert LatLng to local meter coordinates relative to a reference point.
 * This ensures rotation preserves 90-degree angles.
 */
function toMeters(point: LatLng, ref: LatLng): { x: number; y: number } {
  return {
    x: (point.lng - ref.lng) * 111320 * Math.cos((ref.lat * Math.PI) / 180),
    y: (point.lat - ref.lat) * 111320,
  };
}

/**
 * Convert local meter coordinates back to LatLng.
 */
function toLatLng(m: { x: number; y: number }, ref: LatLng): LatLng {
  return {
    lat: ref.lat + m.y / 111320,
    lng: ref.lng + m.x / (111320 * Math.cos((ref.lat * Math.PI) / 180)),
  };
}

/**
 * Rotate a point (in meters) around origin by angle (degrees).
 */
function rotateM(
  p: { x: number; y: number },
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  };
}

/**
 * Check if a point is inside a polygon (both in meter coords).
 */
function pointInPolygonM(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Get the center of a polygon.
 */
export function getPolygonCenter(polygon: LatLng[]): LatLng {
  const lat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length;
  const lng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length;
  return { lat, lng };
}

/**
 * Generate a rotated 3x3m grid inside a polygon.
 *
 * All rotation is done in a local meter-based coordinate system
 * so that squares maintain perfect 90-degree corners regardless
 * of latitude distortion.
 */
export function generateGrid(
  polygon: LatLng[],
  rotationDeg: number = 0
): {
  cells: GridCell[];
  center: LatLng;
} {
  if (polygon.length < 3) {
    return { cells: [], center: { lat: 0, lng: 0 } };
  }

  const center = getPolygonCenter(polygon);

  // Convert polygon to meter coords relative to center
  const polyM = polygon.map((p) => toMeters(p, center));

  // Rotate polygon into grid-aligned space (inverse rotation)
  const rotatedPolyM = polyM.map((p) => rotateM(p, -rotationDeg));

  // Bounding box in rotated meter space
  const minX = Math.min(...rotatedPolyM.map((p) => p.x));
  const maxX = Math.max(...rotatedPolyM.map((p) => p.x));
  const minY = Math.min(...rotatedPolyM.map((p) => p.y));
  const maxY = Math.max(...rotatedPolyM.map((p) => p.y));

  const cols = Math.ceil((maxX - minX) / MODULE_SIZE_METERS);
  const rows = Math.ceil((maxY - minY) / MODULE_SIZE_METERS);

  const cells: GridCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Cell center in rotated meter space
      const cx = minX + (c + 0.5) * MODULE_SIZE_METERS;
      const cy = minY + (r + 0.5) * MODULE_SIZE_METERS;
      if (pointInPolygonM({ x: cx, y: cy }, rotatedPolyM)) {
        cells.push({ row: r, col: c, moduleType: null });
      }
    }
  }

  return { cells, center };
}

/**
 * Get the 4 corners of a grid cell in LatLng (world coordinates).
 *
 * Process:
 * 1. Compute corners in rotated meter space (axis-aligned squares)
 * 2. Rotate back to world meter space
 * 3. Convert to LatLng
 *
 * Because we work in meters, squares stay perfectly square.
 */
export function getCellCorners(
  polygon: LatLng[],
  row: number,
  col: number,
  center: LatLng,
  rotationDeg: number
): [number, number][] {
  // Recompute bounding box origin (same as generateGrid)
  const polyM = polygon.map((p) => toMeters(p, center));
  const rotatedPolyM = polyM.map((p) => rotateM(p, -rotationDeg));
  const minX = Math.min(...rotatedPolyM.map((p) => p.x));
  const minY = Math.min(...rotatedPolyM.map((p) => p.y));

  // 4 corners of this cell in rotated (grid-aligned) meter space
  const corners = [
    { x: minX + col * MODULE_SIZE_METERS, y: minY + row * MODULE_SIZE_METERS },
    { x: minX + (col + 1) * MODULE_SIZE_METERS, y: minY + row * MODULE_SIZE_METERS },
    { x: minX + (col + 1) * MODULE_SIZE_METERS, y: minY + (row + 1) * MODULE_SIZE_METERS },
    { x: minX + col * MODULE_SIZE_METERS, y: minY + (row + 1) * MODULE_SIZE_METERS },
  ];

  // Rotate back to world meter coords, then convert to LatLng
  return corners.map((c) => {
    const world = rotateM(c, rotationDeg);
    const ll = toLatLng(world, center);
    return [ll.lat, ll.lng] as [number, number];
  });
}

/**
 * Cached version of getCellCorners that precomputes the bounding box origin.
 * Use this when rendering many cells to avoid recomputing for each cell.
 */
export function createCellCornersFn(
  polygon: LatLng[],
  center: LatLng,
  rotationDeg: number
): (row: number, col: number) => [number, number][] {
  const polyM = polygon.map((p) => toMeters(p, center));
  const rotatedPolyM = polyM.map((p) => rotateM(p, -rotationDeg));
  const minX = Math.min(...rotatedPolyM.map((p) => p.x));
  const minY = Math.min(...rotatedPolyM.map((p) => p.y));

  return (row: number, col: number) => {
    const corners = [
      { x: minX + col * MODULE_SIZE_METERS, y: minY + row * MODULE_SIZE_METERS },
      { x: minX + (col + 1) * MODULE_SIZE_METERS, y: minY + row * MODULE_SIZE_METERS },
      { x: minX + (col + 1) * MODULE_SIZE_METERS, y: minY + (row + 1) * MODULE_SIZE_METERS },
      { x: minX + col * MODULE_SIZE_METERS, y: minY + (row + 1) * MODULE_SIZE_METERS },
    ];

    return corners.map((c) => {
      const world = rotateM(c, rotationDeg);
      const ll = toLatLng(world, center);
      return [ll.lat, ll.lng] as [number, number];
    });
  };
}
