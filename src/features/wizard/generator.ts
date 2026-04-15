/**
 * Wizard Design Generator — Pure Logic
 * ─────────────────────────────────────
 * Takes WizardInput → produces GeneratedDesign.
 * No React, no stores, no side effects. Fully testable.
 *
 * Algorithm:
 *   1. Compute room allocation from household size + preferences
 *   2. Choose layout shape from module count
 *   3. Place modules on grid following architectural logic
 *   4. Assign room types with adjacency rules
 *   5. Compute wall configs (uses existing smart defaults)
 *   6. Calculate cost estimate
 */

import type {
  WizardInput,
  RoomAllocation,
  LayoutShape,
  GeneratedDesign,
} from "./types";
import type {
  ModuleConfig,
  WallConfigs,
  WallType,
  FinishLevelId,
} from "@/features/design/store";
import {
  FINISH_LEVELS,
  SHARED_WALL_DISCOUNT,
  DESIGN_FEE_PERCENTAGE,
} from "@/shared/types";

// ─── 1. Room Allocation ──────────────────────────────────────

/** Determine how many rooms of each type based on household size + prefs */
export function computeRoomAllocation(input: WizardInput): RoomAllocation {
  const { householdSize, budgetLevel, wantsTerrace, wantsOffice } = input;

  // Base room counts by household size
  let bedrooms: number;
  let bathrooms: number;
  let hallway = 0;
  let storage = 0;

  if (householdSize <= 1) {
    bedrooms = 1;
    bathrooms = 1;
  } else if (householdSize <= 2) {
    bedrooms = budgetLevel === "tight" ? 1 : 2;
    bathrooms = 1;
  } else if (householdSize <= 4) {
    bedrooms = householdSize <= 3 ? 2 : 3;
    bathrooms = budgetLevel === "tight" ? 1 : 2;
    hallway = 1;
  } else {
    bedrooms = Math.min(householdSize - 1, 4);
    bathrooms = 2;
    hallway = 1;
    storage = budgetLevel !== "tight" ? 1 : 0;
  }

  // Always 1 living + 1 kitchen
  const living = 1;
  const kitchen = 1;

  // Optional rooms
  const office = wantsOffice ? 1 : 0;
  const terrace = wantsTerrace !== false ? 1 : 0; // default yes unless explicitly off

  // Budget adjustments
  if (budgetLevel === "tight") {
    // Tight budget: minimize extras
    if (bedrooms > 2 && householdSize <= 3) bedrooms = 2;
  } else if (budgetLevel === "generous") {
    // Generous: add extras
    if (householdSize >= 3 && !wantsOffice) storage = 1;
  }

  const totalModules =
    bedrooms + bathrooms + living + kitchen + office + hallway + terrace + storage;

  return {
    bedrooms,
    bathrooms,
    living,
    kitchen,
    office,
    hallway,
    terrace,
    storage,
    totalModules,
  };
}

// ─── 2. Layout Shape Selection ───────────────────────────────

/** Choose the best layout shape based on module count */
export function chooseLayoutShape(totalModules: number): LayoutShape {
  if (totalModules <= 3) return "line";
  if (totalModules <= 5) return "L-shape";
  if (totalModules <= 8) return "L-shape";
  if (totalModules <= 10) return "T-shape";
  return "U-shape";
}

// ─── 3. Grid Placement ──────────────────────────────────────

interface GridPosition {
  row: number;
  col: number;
}

/**
 * Generate grid positions for a given layout shape.
 * Returns positions in placement order (entry → living → bedrooms → etc.)
 */
export function generateGridPositions(
  totalModules: number,
  shape: LayoutShape
): GridPosition[] {
  const positions: GridPosition[] = [];

  switch (shape) {
    case "line": {
      // Single row: [0,0] [0,1] [0,2] ...
      for (let c = 0; c < totalModules; c++) {
        positions.push({ row: 0, col: c });
      }
      break;
    }

    case "L-shape": {
      // Horizontal arm (top), then vertical arm (right side going down)
      const armH = Math.ceil(totalModules / 2);
      const armV = totalModules - armH;
      // Top row
      for (let c = 0; c < armH; c++) {
        positions.push({ row: 0, col: c });
      }
      // Right column going down
      for (let r = 1; r <= armV; r++) {
        positions.push({ row: r, col: armH - 1 });
      }
      break;
    }

    case "T-shape": {
      // Top row (full width), center column going down
      const topWidth = Math.ceil(totalModules * 0.5);
      const stem = totalModules - topWidth;
      const centerCol = Math.floor(topWidth / 2);
      // Top row
      for (let c = 0; c < topWidth; c++) {
        positions.push({ row: 0, col: c });
      }
      // Stem going down from center
      for (let r = 1; r <= stem; r++) {
        positions.push({ row: r, col: centerCol });
      }
      break;
    }

    case "U-shape": {
      // Left column + bottom row + right column
      const sideLen = Math.ceil(totalModules / 3);
      const bottomLen = totalModules - 2 * sideLen;
      const maxRow = sideLen - 1;
      // Left column (top to bottom)
      for (let r = 0; r < sideLen; r++) {
        positions.push({ row: r, col: 0 });
      }
      // Bottom row (left to right, skip corner)
      for (let c = 1; c <= bottomLen; c++) {
        positions.push({ row: maxRow, col: c });
      }
      // Right column (bottom to top)
      const rightCol = bottomLen + 1;
      for (let r = maxRow; r >= 0 && positions.length < totalModules; r--) {
        positions.push({ row: r, col: rightCol });
      }
      break;
    }

    case "compact":
    default: {
      // Rectangular grid, fill row by row
      const cols = Math.ceil(Math.sqrt(totalModules));
      let placed = 0;
      for (let r = 0; placed < totalModules; r++) {
        for (let c = 0; c < cols && placed < totalModules; c++) {
          positions.push({ row: r, col: c });
          placed++;
        }
      }
    }
  }

  return positions;
}

// ─── 4. Room Type Assignment ─────────────────────────────────

/**
 * Assign room types to grid positions following architectural logic:
 * - Entry/living near the front (first positions)
 * - Kitchen adjacent to living
 * - Bedrooms grouped together (rear)
 * - Bathrooms adjacent to bedrooms
 * - Terrace at corner or end
 * - Hallway connects zones when > 6 modules
 */
export function assignRoomTypes(
  positions: GridPosition[],
  rooms: RoomAllocation
): string[] {
  const n = positions.length;
  const assignment: string[] = new Array(n).fill("");

  // Build a flat room list in placement priority order
  const roomList: string[] = [];

  // Zone 1: Social (front of house)
  roomList.push("living");
  roomList.push("kitchen");
  if (rooms.terrace > 0) roomList.push("terrace");

  // Zone 2: Transition
  for (let i = 0; i < rooms.hallway; i++) roomList.push("hallway");

  // Zone 3: Private (rear)
  for (let i = 0; i < rooms.bedrooms; i++) roomList.push("bedroom");
  for (let i = 0; i < rooms.bathrooms; i++) roomList.push("bathroom");

  // Zone 4: Utility
  for (let i = 0; i < rooms.office; i++) roomList.push("office");
  for (let i = 0; i < rooms.storage; i++) roomList.push("storage");

  // Assign rooms to positions (1:1 mapping)
  for (let i = 0; i < n && i < roomList.length; i++) {
    assignment[i] = roomList[i];
  }

  // Fill any remaining positions with extra bedrooms or storage
  for (let i = roomList.length; i < n; i++) {
    assignment[i] = "storage";
  }

  // Optimization: place bathrooms adjacent to bedrooms
  // Swap bathroom positions to be next to bedroom clusters
  const bedroomIndices = assignment
    .map((t, i) => (t === "bedroom" ? i : -1))
    .filter((i) => i >= 0);
  const bathroomIndices = assignment
    .map((t, i) => (t === "bathroom" ? i : -1))
    .filter((i) => i >= 0);

  for (const bathIdx of bathroomIndices) {
    // Check if already adjacent to a bedroom
    const bathPos = positions[bathIdx];
    const isAdjacent = bedroomIndices.some((bedIdx) => {
      const bedPos = positions[bedIdx];
      const dr = Math.abs(bathPos.row - bedPos.row);
      const dc = Math.abs(bathPos.col - bedPos.col);
      return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    });

    if (!isAdjacent && bedroomIndices.length > 0) {
      // Find the position adjacent to first bedroom that isn't a bedroom or living
      const targetBed = positions[bedroomIndices[0]];
      const candidates = positions
        .map((p, i) => ({ ...p, idx: i }))
        .filter((p) => {
          const dr = Math.abs(p.row - targetBed.row);
          const dc = Math.abs(p.col - targetBed.col);
          const adj = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
          return (
            adj &&
            assignment[p.idx] !== "bedroom" &&
            assignment[p.idx] !== "living" &&
            assignment[p.idx] !== "kitchen" &&
            p.idx !== bathIdx
          );
        });

      if (candidates.length > 0) {
        // Swap bathroom with the candidate
        const swapIdx = candidates[0].idx;
        const temp = assignment[swapIdx];
        assignment[swapIdx] = assignment[bathIdx];
        assignment[bathIdx] = temp;
      }
    }
  }

  return assignment;
}

// ─── 5. Wall Config Computation ──────────────────────────────

/** Compute wall configs for all modules (reuses same logic as design store) */
function computeAllWallConfigs(
  modules: Array<{ row: number; col: number; moduleType: string }>
): WallConfigs[] {
  const occupiedSet = new Set(modules.map((m) => `${m.row},${m.col}`));
  type WallSide = "north" | "south" | "east" | "west";

  return modules.map((mod) => {
    const sides: WallSide[] = ["north", "south", "east", "west"];
    const deltas: Record<WallSide, string> = {
      north: `${mod.row - 1},${mod.col}`,
      south: `${mod.row + 1},${mod.col}`,
      west: `${mod.row},${mod.col - 1}`,
      east: `${mod.row},${mod.col + 1}`,
    };

    const cfg: WallConfigs = {
      north: occupiedSet.has(deltas.north) ? "shared" : "solid",
      south: occupiedSet.has(deltas.south) ? "shared" : "solid",
      west: occupiedSet.has(deltas.west) ? "shared" : "solid",
      east: occupiedSet.has(deltas.east) ? "shared" : "solid",
    };

    const exteriorSides = sides.filter((s) => cfg[s] === "solid");
    if (exteriorSides.length === 0) return cfg;

    const noExteriorDoor = ["bathroom", "storage"];
    const prefersWindows = ["bedroom", "living", "office", "kitchen"];
    const isOpenType = mod.moduleType === "terrace";

    if (isOpenType) {
      for (const s of exteriorSides) cfg[s] = "none";
      return cfg;
    }

    const doorPriority: WallSide[] = ["south", "east", "west", "north"];
    if (!noExteriorDoor.includes(mod.moduleType)) {
      for (const s of doorPriority) {
        if (cfg[s] === "solid") {
          cfg[s] = "door";
          break;
        }
      }
    }

    if (prefersWindows.includes(mod.moduleType)) {
      for (const s of exteriorSides) {
        if (cfg[s] === "solid") cfg[s] = "window";
      }
    }

    if (mod.moduleType === "bathroom") {
      for (const s of exteriorSides) {
        if (cfg[s] === "solid") {
          cfg[s] = "window";
          break;
        }
      }
    }

    return cfg;
  });
}

// ─── 6. Cost Calculation ─────────────────────────────────────

const WALL_UPGRADE_PRICES: Record<WallType, number> = {
  solid: 0,
  window: 800,
  door: 600,
  none: -200,
  shared: 0,
};

function computeCost(
  modules: ModuleConfig[],
  finishLevel: FinishLevelId
): number {
  const finish = FINISH_LEVELS.find((f) => f.id === finishLevel) ?? FINISH_LEVELS[1];
  const moduleCost = modules.length * finish.pricePerModule;

  // Count shared walls
  let sharedWalls = 0;
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const dr = Math.abs(modules[i].row - modules[j].row);
      const dc = Math.abs(modules[i].col - modules[j].col);
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) sharedWalls++;
    }
  }
  const sharedDiscount = sharedWalls * SHARED_WALL_DISCOUNT;

  // Wall upgrades
  let wallUpgradeCost = 0;
  for (const mod of modules) {
    for (const side of ["north", "south", "east", "west"] as const) {
      wallUpgradeCost += WALL_UPGRADE_PRICES[mod.wallConfigs[side]];
    }
  }

  const subtotal = moduleCost - sharedDiscount + wallUpgradeCost;
  const designFee = Math.round(subtotal * DESIGN_FEE_PERCENTAGE);
  return subtotal + designFee;
}

// ─── 7. Style ↔ Finish Mapping ──────────────────────────────

const STYLE_FLOOR_WALL: Record<string, { floor: string; wall: string }> = {
  scandinavian: { floor: "oak", wall: "alabaster" },
  industrial: { floor: "concrete", wall: "slate" },
  "warm-contemporary": { floor: "walnut", wall: "sage" },
  mediterranean: { floor: "terracotta", wall: "cream" },
  "japanese-wabi-sabi": { floor: "bamboo", wall: "parchment" },
  "traditional-romanian": { floor: "oak", wall: "ivory" },
  "biophilic-organic": { floor: "oak", wall: "moss" },
  "eclectic-mixed": { floor: "walnut", wall: "sand" },
};

function budgetToFinish(budget: WizardInput["budgetLevel"]): FinishLevelId {
  switch (budget) {
    case "tight":
      return "basic";
    case "generous":
      return "premium";
    default:
      return "standard";
  }
}

// ─── 8. Label Generator ──────────────────────────────────────

function generateLabel(moduleType: string, index: number): string {
  const labels: Record<string, string> = {
    bedroom: "BEDROOM",
    bathroom: "BATHROOM",
    living: "LIVINGROOM",
    kitchen: "KITCHEN",
    office: "OFFICE",
    storage: "STORAGE",
    hallway: "HALLWAY",
    terrace: "TERRACE",
  };
  const base = labels[moduleType] ?? moduleType.toUpperCase();
  return index > 0 ? `${base}${String(index + 1).padStart(2, "0")}` : base;
}

// ─── MAIN GENERATOR ─────────────────────────────────────────

/**
 * Generate a complete modular home design from wizard input.
 * Pure function — no side effects.
 */
export function generateDesign(input: WizardInput): GeneratedDesign {
  // 1. Compute room allocation
  const rooms = computeRoomAllocation(input);

  // 2. Choose layout shape
  const layoutShape = chooseLayoutShape(rooms.totalModules);

  // 3. Generate grid positions
  const positions = generateGridPositions(rooms.totalModules, layoutShape);

  // 4. Assign room types
  const roomTypes = assignRoomTypes(positions, rooms);

  // 5. Build module placement data for wall configs
  const modulePlacements = positions.map((pos, i) => ({
    row: pos.row,
    col: pos.col,
    moduleType: roomTypes[i],
  }));

  // 6. Compute wall configs
  const wallConfigs = computeAllWallConfigs(modulePlacements);

  // 7. Determine finish & style materials
  const finishLevel = budgetToFinish(input.budgetLevel);
  const styleDirection = input.stylePreference ?? "warm-contemporary";
  const styleMaterials = STYLE_FLOOR_WALL[styleDirection] ?? STYLE_FLOOR_WALL["warm-contemporary"];

  // 8. Build ModuleConfig array
  const typeCounts: Record<string, number> = {};
  const modules: ModuleConfig[] = positions.map((pos, i) => {
    const moduleType = roomTypes[i];
    const count = typeCounts[moduleType] ?? 0;
    typeCounts[moduleType] = count + 1;

    return {
      row: pos.row,
      col: pos.col,
      moduleType,
      label: generateLabel(moduleType, count),
      layoutPreset: "default",
      floorFinish: styleMaterials.floor,
      wallColor: styleMaterials.wall,
      furnitureOverrides: {},
      wallConfigs: wallConfigs[i],
    };
  });

  // 9. Calculate cost
  const estimatedCost = computeCost(modules, finishLevel);

  // 10. Generate description
  const description = buildDescription(input, rooms, layoutShape, estimatedCost);

  return {
    modules,
    finishLevel,
    styleDirection,
    layoutShape,
    rooms,
    estimatedCost,
    description,
  };
}

// ─── Description Builder ─────────────────────────────────────

function buildDescription(
  input: WizardInput,
  rooms: RoomAllocation,
  shape: LayoutShape,
  cost: number
): string {
  const people = input.householdSize === 1 ? "1 person" : `${input.householdSize} people`;
  const area = rooms.totalModules * 9;
  const usable = rooms.totalModules * 7;

  const roomList: string[] = [];
  if (rooms.bedrooms > 0) roomList.push(`${rooms.bedrooms} bedroom${rooms.bedrooms > 1 ? "s" : ""}`);
  if (rooms.bathrooms > 0) roomList.push(`${rooms.bathrooms} bathroom${rooms.bathrooms > 1 ? "s" : ""}`);
  roomList.push("living room");
  roomList.push("kitchen");
  if (rooms.office > 0) roomList.push("home office");
  if (rooms.terrace > 0) roomList.push("terrace");
  if (rooms.storage > 0) roomList.push("storage");

  const styleLabel = (input.stylePreference ?? "warm-contemporary")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    `A ${shape.replace("-", " ")} modular home for ${people}, featuring ${roomList.join(", ")}. ` +
    `${rooms.totalModules} modules (${area}m² gross / ${usable}m² usable) in ${styleLabel} style. ` +
    `Estimated cost: €${cost.toLocaleString("en-US")}.`
  );
}

/**
 * Quick generate from a QuizProfile (convenience wrapper).
 * Maps quiz fields to WizardInput.
 */
export function generateFromQuizProfile(profile: {
  householdSize: number;
  budgetLevel: string;
  primaryStyle: string;
}): GeneratedDesign {
  const STYLE_MAP: Record<string, string> = {
    "modern-minimalist": "scandinavian",
    "warm-organic": "warm-contemporary",
    "scandinavian-functional": "scandinavian",
    "industrial-loft": "industrial",
    "traditional-romanian": "traditional-romanian",
    "biophilic-nature": "biophilic-organic",
    "eclectic-mixed": "eclectic-mixed",
  };

  const budgetMap: Record<string, WizardInput["budgetLevel"]> = {
    economy: "tight",
    balanced: "moderate",
    premium: "generous",
    luxury: "generous",
  };

  return generateDesign({
    householdSize: profile.householdSize,
    budgetLevel: budgetMap[profile.budgetLevel] ?? "moderate",
    stylePreference: (STYLE_MAP[profile.primaryStyle] ?? "warm-contemporary") as NonNullable<
      import("@/features/design/store").StyleDirectionId
    >,
    floors: 1,
    wantsTerrace: true,
    wantsOffice: profile.householdSize <= 2,
  });
}
