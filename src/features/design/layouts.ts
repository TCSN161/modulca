/**
 * Predefined layouts for each module type (3 free presets per room type).
 *
 * Furniture items define both 2D floor plan and 3D positions.
 * Coordinates are in meters on the 3×3 m module (0–3 range), but since 5.06
 * every item is authored on the REAL interior: walls are 0.25 m thick, so the
 * usable floor is INTERIOR_MIN–INTERIOR_MAX (0.25–2.75 m) on both axes.
 * X runs west → east, Z runs north → south. The default door sits centred in
 * the south wall (store.ts smart defaults), so DOOR_ZONE stays free.
 *
 * Rules (checked by layouts.overlap.test.ts): nothing inside walls, no overlap
 * > 2 cm in 3D, door swing zone free. Authored by hand: aisles ≥ 0.6 m, beds and
 * desks with their long side against a wall.
 */

export type Facing = "south" | "north" | "east" | "west";

export interface FurnitureItem {
  id: string;
  label: string;
  // Footprint in meters, world axes (already the footprint AFTER `facing`)
  x: number;      // meters from the module's west edge (≥ 0.25 = interior)
  z: number;      // meters from the module's north edge (≥ 0.25 = interior)
  width: number;  // meters (X axis)
  depth: number;  // meters (Z axis)
  height: number; // meters (Y axis) for 3D
  color: string;  // furniture color for 3D
  /** Direction the item's front faces. Default "south" = model's native +Z. */
  facing?: Facing;
  /** Wall-mounted items: height of the item's bottom above the floor (m). */
  mountY?: number;
}

export interface LayoutPreset {
  id: string;
  label: string;
  description: string;
  tier: "free" | "premium";
  furniture: FurnitureItem[];
}

export interface RoomLayouts {
  moduleType: string;
  presets: LayoutPreset[];
}

export const INTERIOR_MIN = 0.25;
export const INTERIOR_MAX = 2.75;
/** Inward swing of the default 0.9 m south door (x 1.05–1.95, 0.9 m deep). */
export const DOOR_ZONE = { x0: 1.05, x1: 1.95, z0: 1.85, z1: 2.75 };
/** Room types without a door (open sides) — DOOR_ZONE does not apply. */
export const NO_DOOR_TYPES = ["terrace"];

const ROT: Record<Facing, number> = { south: 0, east: Math.PI / 2, north: Math.PI, west: -Math.PI / 2 };

/**
 * How the renderer builds an item: the model is sized modelW × height × modelD
 * in its own frame (front = +Z), then rotated by rotationY about Y.
 * For east/west the model's width/depth swap so the world footprint stays
 * width × depth. Both 3D renderers and the overlap test use this.
 */
export function modelFrame(item: FurnitureItem): { rotationY: number; modelW: number; modelD: number; baseY: number } {
  const facing = item.facing ?? "south";
  const side = facing === "east" || facing === "west";
  return {
    rotationY: ROT[facing],
    modelW: side ? item.depth : item.width,
    modelD: side ? item.width : item.depth,
    baseY: item.mountY ?? 0,
  };
}

export const ROOM_LAYOUTS: RoomLayouts[] = [
  {
    moduleType: "bedroom",
    presets: [
      {
        id: "rest",
        label: "Rest (Default)",
        description: "Double bed, nightstand & wardrobe",
        tier: "free",
        furniture: [
          { id: "bed", label: "Double Bed", x: 0.25, z: 0.25, width: 2.0, depth: 1.4, height: 0.5, color: "#8B7355", facing: "east" },
          { id: "nightstand-l", label: "Nightstand", x: 0.25, z: 1.65, width: 0.45, depth: 0.4, height: 0.5, color: "#8B7355" },
          { id: "wardrobe", label: "Wardrobe", x: 1.95, z: 2.25, width: 0.8, depth: 0.5, height: 2.2, color: "#A0926B", facing: "north" },
        ],
      },
      {
        id: "workspace",
        label: "Workspace",
        description: "Single bed, desk & bookshelf",
        tier: "free",
        furniture: [
          { id: "bed", label: "Single Bed", x: 0.25, z: 0.25, width: 0.8, depth: 2.0, height: 0.45, color: "#8B7355" },
          { id: "desk", label: "Desk", x: 1.55, z: 0.25, width: 1.2, depth: 0.6, height: 0.75, color: "#C4A882" },
          { id: "chair", label: "Chair", x: 1.9, z: 0.95, width: 0.5, depth: 0.5, height: 0.8, color: "#555555", facing: "north" },
          { id: "bookshelf", label: "Bookshelf", x: 2.4, z: 1.6, width: 0.35, depth: 1.0, height: 1.8, color: "#A0926B", facing: "west" },
        ],
      },
      {
        id: "social",
        label: "Social",
        description: "Daybed, lounge chair & side table",
        tier: "free",
        furniture: [
          { id: "daybed", label: "Daybed", x: 0.25, z: 0.25, width: 2.0, depth: 0.9, height: 0.4, color: "#8B7355", facing: "east" },
          { id: "lounge", label: "Lounge Chair", x: 0.25, z: 1.95, width: 0.75, depth: 0.75, height: 0.7, color: "#6B8E6B", facing: "north" },
          { id: "sidetable", label: "Side Table", x: 2.3, z: 0.25, width: 0.45, depth: 0.45, height: 0.45, color: "#C4A882" },
          { id: "rug", label: "Area Rug", x: 0.45, z: 1.25, width: 1.6, depth: 1.2, height: 0.02, color: "#C4B8A0" },
        ],
      },
    ],
  },
  {
    moduleType: "kitchen",
    presets: [
      {
        id: "l-shape",
        label: "L-Shape (Default)",
        description: "Counter along two walls, open center",
        tier: "free",
        furniture: [
          { id: "fridge", label: "Fridge", x: 0.25, z: 0.25, width: 0.6, depth: 0.6, height: 1.85, color: "#C0C0C0" },
          { id: "sink", label: "Kitchen Sink", x: 0.85, z: 0.25, width: 0.6, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "counter-back", label: "Back Counter", x: 1.45, z: 0.25, width: 0.7, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "stove", label: "Stove", x: 2.15, z: 0.25, width: 0.6, depth: 0.6, height: 0.9, color: "#D8D8D8" },
          { id: "counter-left", label: "Side Counter", x: 2.15, z: 0.85, width: 0.6, depth: 0.9, height: 0.9, color: "#E8E0D0", facing: "west" },
          { id: "table", label: "Dining Table", x: 0.25, z: 1.45, width: 0.8, depth: 1.2, height: 0.75, color: "#8B7355" },
        ],
      },
      {
        id: "galley",
        label: "Galley",
        description: "Parallel counters, efficient workflow",
        tier: "free",
        furniture: [
          { id: "fridge", label: "Fridge", x: 0.25, z: 0.25, width: 0.6, depth: 0.6, height: 1.85, color: "#C0C0C0", facing: "east" },
          { id: "sink", label: "Kitchen Sink", x: 0.25, z: 0.85, width: 0.6, depth: 0.6, height: 0.9, color: "#E8E0D0", facing: "east" },
          { id: "counter-left", label: "Left Counter", x: 0.25, z: 1.45, width: 0.6, depth: 1.2, height: 0.9, color: "#E8E0D0", facing: "east" },
          { id: "stove", label: "Stove", x: 2.15, z: 0.25, width: 0.6, depth: 0.6, height: 0.9, color: "#D8D8D8", facing: "west" },
          { id: "counter-right", label: "Right Counter", x: 2.15, z: 0.85, width: 0.6, depth: 1.3, height: 0.9, color: "#E8E0D0", facing: "west" },
        ],
      },
      {
        id: "island",
        label: "Island",
        description: "Island bar with two stools",
        tier: "free",
        furniture: [
          { id: "fridge", label: "Fridge", x: 0.25, z: 0.25, width: 0.6, depth: 0.6, height: 1.85, color: "#C0C0C0" },
          { id: "counter-back", label: "Back Counter", x: 0.85, z: 0.25, width: 0.7, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "sink", label: "Kitchen Sink", x: 1.55, z: 0.25, width: 0.6, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "stove", label: "Stove", x: 2.15, z: 0.25, width: 0.6, depth: 0.6, height: 0.9, color: "#D8D8D8" },
          { id: "island", label: "Kitchen Island", x: 0.25, z: 1.85, width: 0.8, depth: 0.8, height: 0.9, color: "#C4A882", facing: "north" },
          { id: "stool1", label: "Bar Stool", x: 0.28, z: 1.45, width: 0.35, depth: 0.35, height: 0.7, color: "#555555" },
          { id: "stool2", label: "Bar Stool", x: 0.68, z: 1.45, width: 0.35, depth: 0.35, height: 0.7, color: "#555555" },
        ],
      },
    ],
  },
  {
    moduleType: "bathroom",
    presets: [
      {
        id: "standard",
        label: "Standard",
        description: "Shower, vanity, mirror & toilet",
        tier: "free",
        furniture: [
          { id: "shower", label: "Shower", x: 0.25, z: 0.25, width: 0.9, depth: 0.9, height: 2.1, color: "#D4E6F1" },
          { id: "vanity", label: "Vanity", x: 1.35, z: 0.25, width: 0.8, depth: 0.5, height: 0.85, color: "#E8E0D0" },
          { id: "mirror", label: "Mirror", x: 1.45, z: 0.25, width: 0.6, depth: 0.03, height: 0.8, color: "#B8D4E3", mountY: 1.05 },
          { id: "toilet", label: "Toilet", x: 2.15, z: 1.0, width: 0.6, depth: 0.4, height: 0.4, color: "#F5F5F5", facing: "west" },
        ],
      },
      {
        id: "spa",
        label: "Spa Bath",
        description: "Bathtub, rain shower, vanity & toilet",
        tier: "free",
        furniture: [
          { id: "tub", label: "Freestanding Tub", x: 0.25, z: 0.25, width: 1.7, depth: 0.8, height: 0.55, color: "#F5F5F5" },
          { id: "shower", label: "Rain Shower", x: 1.95, z: 0.25, width: 0.8, depth: 0.9, height: 2.1, color: "#D4E6F1" },
          { id: "vanity", label: "Vanity", x: 0.25, z: 1.45, width: 0.5, depth: 1.0, height: 0.85, color: "#E8E0D0", facing: "east" },
          { id: "mirror", label: "Mirror", x: 0.25, z: 1.65, width: 0.03, depth: 0.6, height: 0.8, color: "#B8D4E3", facing: "east", mountY: 1.05 },
          { id: "toilet", label: "Toilet", x: 2.15, z: 1.6, width: 0.6, depth: 0.4, height: 0.4, color: "#F5F5F5", facing: "west" },
        ],
      },
      {
        id: "accessible",
        label: "Accessible",
        description: "Barrier-free, grab bar, roll-in shower",
        tier: "free",
        furniture: [
          { id: "shower", label: "Roll-in Shower", x: 0.25, z: 0.25, width: 1.2, depth: 1.2, height: 0.05, color: "#D4E6F1" },
          { id: "vanity", label: "Low Vanity", x: 2.25, z: 0.25, width: 0.5, depth: 1.0, height: 0.7, color: "#E8E0D0", facing: "west" },
          { id: "mirror", label: "Mirror", x: 2.72, z: 0.45, width: 0.03, depth: 0.6, height: 0.8, color: "#B8D4E3", facing: "west", mountY: 0.95 },
          { id: "toilet", label: "Raised Toilet", x: 2.15, z: 1.5, width: 0.6, depth: 0.4, height: 0.45, color: "#F5F5F5", facing: "west" },
          { id: "grab-bar", label: "Grab Bar", x: 2.7, z: 1.95, width: 0.05, depth: 0.6, height: 0.05, color: "#C0C0C0", facing: "west", mountY: 0.75 },
        ],
      },
    ],
  },
  {
    moduleType: "living",
    presets: [
      {
        id: "lounge",
        label: "Lounge (Default)",
        description: "Sofa, coffee table & wall TV",
        tier: "free",
        furniture: [
          { id: "sofa", label: "L-Sofa", x: 1.95, z: 0.25, width: 0.8, depth: 2.0, height: 0.7, color: "#7A8B99", facing: "west" },
          { id: "coffee-table", label: "Coffee Table", x: 1.25, z: 0.75, width: 0.4, depth: 1.0, height: 0.4, color: "#8B7355", facing: "west" },
          { id: "tv-unit", label: "TV Unit", x: 0.25, z: 0.45, width: 0.4, depth: 1.6, height: 0.5, color: "#A0926B", facing: "east" },
          { id: "tv", label: "Wall TV", x: 0.25, z: 0.75, width: 0.06, depth: 1.0, height: 0.6, color: "#222222", facing: "east", mountY: 0.95 },
          { id: "rug", label: "Area Rug", x: 0.85, z: 0.5, width: 1.05, depth: 1.5, height: 0.02, color: "#C4B8A0" },
        ],
      },
      {
        id: "dining",
        label: "Dining Room",
        description: "Dining table for 4-6 people",
        tier: "free",
        furniture: [
          { id: "table", label: "Dining Table", x: 0.65, z: 0.7, width: 1.2, depth: 0.75, height: 0.75, color: "#8B7355" },
          { id: "chair1", label: "Chair", x: 0.8, z: 0.3, width: 0.4, depth: 0.4, height: 0.8, color: "#555555" },
          { id: "chair2", label: "Chair", x: 1.3, z: 0.3, width: 0.4, depth: 0.4, height: 0.8, color: "#555555" },
          { id: "chair3", label: "Chair", x: 0.8, z: 1.45, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "north" },
          { id: "chair4", label: "Chair", x: 1.3, z: 1.45, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "north" },
          { id: "chair5", label: "Chair", x: 0.25, z: 0.88, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "east" },
          { id: "chair6", label: "Chair", x: 1.85, z: 0.88, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "west" },
          { id: "sideboard", label: "Sideboard", x: 2.35, z: 1.95, width: 0.4, depth: 0.8, height: 0.8, color: "#A0926B", facing: "west" },
        ],
      },
      {
        id: "media",
        label: "Media Room",
        description: "Home theater setup",
        tier: "free",
        furniture: [
          { id: "sofa", label: "Recliner Sofa", x: 1.95, z: 0.25, width: 0.8, depth: 2.0, height: 0.8, color: "#4A4A4A", facing: "west" },
          { id: "screen", label: "Projector Screen", x: 0.25, z: 0.45, width: 0.03, depth: 1.6, height: 1.0, color: "#F0F0F0", facing: "east", mountY: 0.8 },
          { id: "console", label: "Media Console", x: 0.25, z: 0.55, width: 0.4, depth: 1.4, height: 0.45, color: "#333333", facing: "east" },
        ],
      },
    ],
  },
  {
    moduleType: "office",
    presets: [
      {
        id: "single",
        label: "Single Desk",
        description: "One workstation with storage",
        tier: "free",
        furniture: [
          { id: "desk", label: "L-Desk", x: 0.25, z: 0.25, width: 1.6, depth: 0.7, height: 0.75, color: "#C4A882" },
          { id: "chair", label: "Office Chair", x: 0.8, z: 1.05, width: 0.55, depth: 0.55, height: 1.0, color: "#333333", facing: "north" },
          { id: "shelf", label: "Bookshelf", x: 2.35, z: 0.25, width: 0.4, depth: 1.6, height: 1.8, color: "#A0926B", facing: "west" },
          { id: "cabinet", label: "File Cabinet", x: 0.25, z: 2.15, width: 0.5, depth: 0.6, height: 0.7, color: "#C0C0C0", facing: "north" },
        ],
      },
      {
        id: "dual",
        label: "Dual Workspace",
        description: "Two people, side by side",
        tier: "free",
        furniture: [
          { id: "desk1", label: "Desk 1", x: 0.25, z: 0.25, width: 1.2, depth: 0.6, height: 0.75, color: "#C4A882" },
          { id: "desk2", label: "Desk 2", x: 1.55, z: 0.25, width: 1.2, depth: 0.6, height: 0.75, color: "#C4A882" },
          { id: "chair1", label: "Chair", x: 0.65, z: 0.9, width: 0.5, depth: 0.5, height: 1.0, color: "#333333", facing: "north" },
          { id: "chair2", label: "Chair", x: 1.9, z: 0.9, width: 0.5, depth: 0.5, height: 1.0, color: "#333333", facing: "north" },
          { id: "shelf", label: "Shared Shelf", x: 0.25, z: 1.45, width: 0.35, depth: 1.3, height: 1.5, color: "#A0926B", facing: "east" },
        ],
      },
      {
        id: "meeting",
        label: "Meeting Room",
        description: "Round table with 4 chairs",
        tier: "free",
        furniture: [
          { id: "table", label: "Round Table", x: 1.3, z: 0.65, width: 0.8, depth: 0.8, height: 0.75, color: "#C4A882" },
          { id: "chair1", label: "Chair", x: 1.5, z: 0.25, width: 0.4, depth: 0.4, height: 0.8, color: "#555555" },
          { id: "chair2", label: "Chair", x: 2.1, z: 0.85, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "west" },
          { id: "chair3", label: "Chair", x: 1.5, z: 1.45, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "north" },
          { id: "chair4", label: "Chair", x: 0.9, z: 0.85, width: 0.4, depth: 0.4, height: 0.8, color: "#555555", facing: "east" },
          { id: "whiteboard", label: "Whiteboard", x: 0.25, z: 0.45, width: 0.03, depth: 1.4, height: 1.0, color: "#F0F0F0", facing: "east", mountY: 0.9 },
        ],
      },
    ],
  },
  {
    moduleType: "storage",
    presets: [
      {
        id: "shelves",
        label: "Full Shelving",
        description: "Wall-to-wall storage shelves",
        tier: "free",
        furniture: [
          { id: "shelf-l", label: "Left Shelves", x: 0.25, z: 0.25, width: 0.5, depth: 2.5, height: 2.2, color: "#A0926B", facing: "east" },
          { id: "shelf-r", label: "Right Shelves", x: 2.25, z: 0.25, width: 0.5, depth: 2.5, height: 2.2, color: "#A0926B", facing: "west" },
          { id: "shelf-back", label: "Back Shelves", x: 0.75, z: 0.25, width: 1.5, depth: 0.5, height: 2.2, color: "#A0926B" },
        ],
      },
      {
        id: "workshop",
        label: "Workshop",
        description: "Workbench & tool wall",
        tier: "free",
        furniture: [
          { id: "bench", label: "Workbench", x: 0.25, z: 0.25, width: 1.8, depth: 0.7, height: 0.9, color: "#8B7355" },
          { id: "pegboard", label: "Tool Wall", x: 0.25, z: 0.25, width: 1.8, depth: 0.03, height: 1.0, color: "#D0D0D0", mountY: 1.1 },
          { id: "cabinet", label: "Storage Cabinet", x: 2.15, z: 0.25, width: 0.6, depth: 1.2, height: 1.8, color: "#C0C0C0", facing: "west" },
          { id: "stool", label: "Work Stool", x: 1.0, z: 1.05, width: 0.4, depth: 0.4, height: 0.6, color: "#555555", facing: "north" },
        ],
      },
      {
        id: "utility",
        label: "Utility Room",
        description: "Laundry, mechanicals & drying",
        tier: "free",
        furniture: [
          { id: "washer", label: "Washer", x: 0.25, z: 0.25, width: 0.6, depth: 0.6, height: 0.85, color: "#F0F0F0" },
          { id: "dryer", label: "Dryer", x: 0.85, z: 0.25, width: 0.6, depth: 0.6, height: 0.85, color: "#F0F0F0" },
          { id: "sink", label: "Utility Sink", x: 1.45, z: 0.25, width: 0.6, depth: 0.5, height: 0.85, color: "#E8E0D0" },
          { id: "boiler", label: "Water Heater", x: 2.25, z: 0.25, width: 0.5, depth: 0.45, height: 0.9, color: "#D0D0D0", mountY: 1.2 },
          { id: "shelf", label: "Drying Rack", x: 2.15, z: 1.0, width: 0.6, depth: 1.4, height: 1.5, color: "#C0C0C0", facing: "west" },
        ],
      },
    ],
  },
  // ─── Hallway ─────────────────────────────────────────────
  {
    moduleType: "hallway",
    presets: [
      {
        id: "corridor",
        label: "Corridor",
        description: "Simple pass-through hallway with coat hooks",
        tier: "free",
        furniture: [
          { id: "coat-rack", label: "Coat Rack", x: 0.25, z: 0.45, width: 0.08, depth: 1.0, height: 0.25, color: "#8B7355", facing: "east", mountY: 1.6 },
          { id: "shoe-bench", label: "Shoe Bench", x: 0.25, z: 0.45, width: 0.4, depth: 1.0, height: 0.45, color: "#D4A76A", facing: "east" },
          { id: "console", label: "Console Table", x: 2.35, z: 0.75, width: 0.4, depth: 1.0, height: 0.8, color: "#8B7355", facing: "west" },
        ],
      },
      {
        id: "entry",
        label: "Entryway",
        description: "Welcoming entrance with mirror & storage",
        tier: "free",
        furniture: [
          { id: "wardrobe", label: "Hall Wardrobe", x: 0.25, z: 0.25, width: 0.6, depth: 1.4, height: 2.0, color: "#F0EDE5", facing: "east" },
          { id: "mirror", label: "Mirror", x: 2.72, z: 0.85, width: 0.03, depth: 0.6, height: 1.2, color: "#C0C0C0", facing: "west", mountY: 0.75 },
          { id: "bench", label: "Hall Bench", x: 2.3, z: 0.65, width: 0.45, depth: 1.0, height: 0.45, color: "#D4A76A", facing: "west" },
        ],
      },
      {
        id: "gallery",
        label: "Gallery Hall",
        description: "Display hallway with shelving",
        tier: "free",
        furniture: [
          { id: "shelf-l", label: "Display Shelf", x: 0.25, z: 0.25, width: 0.3, depth: 2.5, height: 1.8, color: "#F0EDE5", facing: "east" },
          { id: "shelf-r", label: "Display Shelf", x: 2.45, z: 0.25, width: 0.3, depth: 2.5, height: 1.8, color: "#F0EDE5", facing: "west" },
          { id: "runner", label: "Hall Runner", x: 1.0, z: 0.25, width: 1.0, depth: 2.5, height: 0.01, color: "#B8860B" },
        ],
      },
    ],
  },
  // ─── Terrace (open sides: no DOOR_ZONE) ──────────────────
  {
    moduleType: "terrace",
    presets: [
      {
        id: "lounge",
        label: "Outdoor Lounge",
        description: "Relaxing outdoor seating area",
        tier: "free",
        furniture: [
          { id: "outdoor-sofa", label: "Outdoor Sofa", x: 0.25, z: 0.25, width: 1.8, depth: 0.8, height: 0.7, color: "#8B7355" },
          { id: "coffee-table", label: "Coffee Table", x: 0.75, z: 1.4, width: 0.8, depth: 0.6, height: 0.4, color: "#D4A76A" },
          { id: "planter", label: "Planter", x: 2.25, z: 0.25, width: 0.5, depth: 0.5, height: 0.6, color: "#68B584" },
        ],
      },
      {
        id: "dining",
        label: "Outdoor Dining",
        description: "Al fresco dining space with BBQ",
        tier: "free",
        furniture: [
          { id: "dining-table", label: "Dining Table", x: 0.8, z: 0.75, width: 1.2, depth: 1.2, height: 0.75, color: "#8B7355" },
          { id: "bench-1", label: "Bench", x: 0.3, z: 0.75, width: 0.4, depth: 1.2, height: 0.45, color: "#D4A76A", facing: "east" },
          { id: "bench-2", label: "Bench", x: 2.1, z: 0.75, width: 0.4, depth: 1.2, height: 0.45, color: "#D4A76A", facing: "west" },
          { id: "bbq", label: "BBQ Grill", x: 2.15, z: 2.25, width: 0.6, depth: 0.5, height: 1.0, color: "#333333", facing: "north" },
        ],
      },
      {
        id: "garden",
        label: "Garden Terrace",
        description: "Green space with planters & seating",
        tier: "free",
        furniture: [
          { id: "planter-1", label: "Large Planter", x: 0.25, z: 0.25, width: 0.8, depth: 0.8, height: 0.5, color: "#68B584" },
          { id: "planter-2", label: "Large Planter", x: 1.95, z: 0.25, width: 0.8, depth: 0.8, height: 0.5, color: "#68B584" },
          { id: "lounger", label: "Sun Lounger", x: 1.15, z: 0.95, width: 0.7, depth: 1.8, height: 0.4, color: "#F5F3EF" },
          { id: "side-table", label: "Side Table", x: 1.95, z: 1.45, width: 0.4, depth: 0.4, height: 0.5, color: "#D4A76A" },
        ],
      },
    ],
  },
];

/** Get the presets for a given module type */
export function getPresetsForType(moduleType: string): LayoutPreset[] {
  return ROOM_LAYOUTS.find((r) => r.moduleType === moduleType)?.presets || [];
}

/** Get a specific preset */
export function getPreset(moduleType: string, presetId: string): LayoutPreset | undefined {
  return getPresetsForType(moduleType).find((p) => p.id === presetId);
}

/** Material definitions */
export const FLOOR_MATERIALS = [
  { id: "oak", label: "Light Oak", color: "#D4A76A" },
  { id: "walnut", label: "Walnut", color: "#7B5B3A" },
  { id: "concrete", label: "Concrete", color: "#B0AFA8" },
];

export const WALL_MATERIALS = [
  { id: "alabaster", label: "Alabaster", color: "#F0EDE5" },
  { id: "sage", label: "Sage", color: "#8FAE8B" },
  { id: "slate", label: "Slate", color: "#7A8088" },
];
