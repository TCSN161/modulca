/**
 * Quiz Answers → Room Size Recommendations
 *
 * Based on Neufert standards + quiz answers (household size, priorities,
 * cooking habits, WFH needs, etc.), calculates recommended room sizes
 * in m² and maps them to ModulCA module counts.
 */

/** Room types tracked in the quiz system */
export const ROOM_IDS = [
  "living",
  "kitchen",
  "master-bedroom",
  "bedroom-2",
  "bedroom-3",
  "bathroom-main",
  "bathroom-en-suite",
  "office",
  "storage",
  "hallway",
  "terrace",
  "utility",
] as const;

export type RoomId = (typeof ROOM_IDS)[number];

export interface RoomRecommendation {
  id: RoomId;
  label: string;
  /** Recommended area in m² */
  recommendedArea: number;
  /** Minimum acceptable area in m² (Neufert) */
  minimumArea: number;
  /** Module count needed (each module ~7m² usable) */
  modules: number;
  /** Priority rank (1 = most important) */
  priority: number;
}

/** Neufert minimum room sizes (m²) */
const NEUFERT_MINIMUMS: Record<RoomId, number> = {
  "living": 16,
  "kitchen": 6,
  "master-bedroom": 12,
  "bedroom-2": 9,
  "bedroom-3": 7,
  "bathroom-main": 4.5,
  "bathroom-en-suite": 3.5,
  "office": 7,
  "storage": 2,
  "hallway": 4,
  "terrace": 6,
  "utility": 3,
};

/** Comfortable room sizes for a standard household (m²) */
const COMFORTABLE_SIZES: Record<RoomId, number> = {
  "living": 25,
  "kitchen": 12,
  "master-bedroom": 16,
  "bedroom-2": 12,
  "bedroom-3": 10,
  "bathroom-main": 6,
  "bathroom-en-suite": 5,
  "office": 10,
  "storage": 4,
  "hallway": 6,
  "terrace": 12,
  "utility": 5,
};

const ROOM_LABELS: Record<RoomId, string> = {
  "living": "Living Room",
  "kitchen": "Kitchen",
  "master-bedroom": "Master Bedroom",
  "bedroom-2": "Bedroom 2",
  "bedroom-3": "Bedroom 3",
  "bathroom-main": "Main Bathroom",
  "bathroom-en-suite": "En-suite Bathroom",
  "office": "Home Office",
  "storage": "Storage",
  "hallway": "Hallway / Entry",
  "terrace": "Terrace / Deck",
  "utility": "Utility Room",
};

export interface QuizInputs {
  householdSize: number;
  workFromHome: boolean;
  cookingStyle: "minimal" | "standard" | "elaborate";
  entertainmentStyle: "intimate" | "mixed" | "large";
  outdoorImportance: number; // 1-5
  guestFrequency: "rare" | "occasional" | "frequent";
  roomPriorityBoosts: Record<string, number>;
}

/**
 * Calculate room recommendations based on quiz answers.
 */
export function calculateRoomSizes(inputs: QuizInputs): RoomRecommendation[] {
  const rooms: RoomRecommendation[] = [];

  // Determine which rooms are needed
  const needsBedroom2 = inputs.householdSize >= 2;
  const needsBedroom3 = inputs.householdSize >= 4 || inputs.guestFrequency === "frequent";
  const needsOffice = inputs.workFromHome;
  const needsEnSuite = inputs.householdSize >= 3;

  // Size multipliers based on quiz answers
  const kitchenMult = inputs.cookingStyle === "elaborate" ? 1.4 : inputs.cookingStyle === "minimal" ? 0.8 : 1.0;
  const livingMult = inputs.entertainmentStyle === "large" ? 1.3 : inputs.entertainmentStyle === "intimate" ? 0.9 : 1.0;
  const terraceMult = inputs.outdoorImportance / 3; // 0.33 to 1.67
  const storageMult = inputs.householdSize >= 4 ? 1.5 : 1.0;

  // Rooms always included
  const activeRooms: { id: RoomId; mult: number }[] = [
    { id: "living", mult: livingMult },
    { id: "kitchen", mult: kitchenMult },
    { id: "master-bedroom", mult: 1.0 },
    { id: "bathroom-main", mult: 1.0 },
    { id: "storage", mult: storageMult },
    { id: "hallway", mult: 1.0 },
    { id: "terrace", mult: terraceMult },
    { id: "utility", mult: 1.0 },
  ];

  if (needsBedroom2) activeRooms.push({ id: "bedroom-2", mult: 1.0 });
  if (needsBedroom3) activeRooms.push({ id: "bedroom-3", mult: 1.0 });
  if (needsOffice) activeRooms.push({ id: "office", mult: 1.0 });
  if (needsEnSuite) activeRooms.push({ id: "bathroom-en-suite", mult: 1.0 });

  // Build priority ranking from quiz boosts
  const boosts = inputs.roomPriorityBoosts;

  for (const { id, mult } of activeRooms) {
    const base = COMFORTABLE_SIZES[id];
    const recommended = Math.round(base * mult * 10) / 10;
    const minimum = NEUFERT_MINIMUMS[id];
    const boost = boosts[id] ?? 0;

    rooms.push({
      id,
      label: ROOM_LABELS[id],
      recommendedArea: recommended,
      minimumArea: minimum,
      modules: Math.ceil(recommended / 7), // ~7m² usable per module
      priority: boost,
    });
  }

  // Sort by priority (highest boost first), then by area
  rooms.sort((a, b) => b.priority - a.priority || b.recommendedArea - a.recommendedArea);

  // Assign sequential priority ranks
  rooms.forEach((r, i) => (r.priority = i + 1));

  return rooms;
}

/**
 * Estimate total module count from room recommendations.
 * Accounts for shared walls and circulation space.
 */
export function estimateModuleCount(rooms: RoomRecommendation[]): {
  modules: number;
  totalArea: number;
  usableArea: number;
} {
  const totalUsable = rooms.reduce((sum, r) => sum + r.recommendedArea, 0);
  // Each module is 9m² gross, ~7m² usable → ~78% efficiency
  const modules = Math.ceil(totalUsable / 7);
  return {
    modules,
    totalArea: modules * 9,
    usableArea: totalUsable,
  };
}
