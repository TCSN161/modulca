/**
 * Predefined layouts for each module type.
 * Each room type has exactly 3 free presets.
 * Premium presets will be added in future phases.
 *
 * Furniture items define both 2D floor plan and 3D positions.
 * Coordinates are in meters (0-3 range for a 3x3m module).
 */

export interface FurnitureItem {
  id: string;
  label: string;
  // Position and size in meters (for 3D) and proportional (for 2D)
  x: number;      // meters from left wall
  z: number;      // meters from back wall
  width: number;  // meters (X axis)
  depth: number;  // meters (Z axis)
  height: number; // meters (Y axis) for 3D
  color: string;  // furniture color for 3D
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

export const ROOM_LAYOUTS: RoomLayouts[] = [
  {
    moduleType: "bedroom",
    presets: [
      {
        id: "rest",
        label: "Rest (Default)",
        description: "King bed, nightstands & wardrobe",
        tier: "free",
        furniture: [
          { id: "bed", label: "King Bed", x: 0.6, z: 0.8, width: 1.8, depth: 2.0, height: 0.5, color: "#8B7355" },
          { id: "nightstand-l", label: "Nightstand", x: 0.1, z: 1.4, width: 0.45, depth: 0.4, height: 0.5, color: "#8B7355" },
          { id: "nightstand-r", label: "Nightstand", x: 2.45, z: 1.4, width: 0.45, depth: 0.4, height: 0.5, color: "#8B7355" },
          { id: "wardrobe", label: "Wardrobe", x: 0.2, z: 0.05, width: 2.6, depth: 0.6, height: 2.2, color: "#A0926B" },
        ],
      },
      {
        id: "workspace",
        label: "Workspace",
        description: "Single bed, desk & bookshelf",
        tier: "free",
        furniture: [
          { id: "bed", label: "Single Bed", x: 0.1, z: 1.2, width: 0.9, depth: 1.9, height: 0.45, color: "#8B7355" },
          { id: "desk", label: "Desk", x: 1.4, z: 0.1, width: 1.4, depth: 0.7, height: 0.75, color: "#C4A882" },
          { id: "chair", label: "Chair", x: 1.8, z: 0.9, width: 0.5, depth: 0.5, height: 0.8, color: "#555555" },
          { id: "bookshelf", label: "Bookshelf", x: 2.5, z: 1.4, width: 0.4, depth: 1.5, height: 1.8, color: "#A0926B" },
        ],
      },
      {
        id: "social",
        label: "Social",
        description: "Daybed, lounge chair & side table",
        tier: "free",
        furniture: [
          { id: "daybed", label: "Daybed", x: 0.2, z: 0.2, width: 2.0, depth: 0.9, height: 0.4, color: "#8B7355" },
          { id: "lounge", label: "Lounge Chair", x: 0.3, z: 1.6, width: 0.8, depth: 0.8, height: 0.7, color: "#6B8E6B" },
          { id: "sidetable", label: "Side Table", x: 1.3, z: 1.8, width: 0.5, depth: 0.5, height: 0.45, color: "#C4A882" },
          { id: "rug", label: "Area Rug", x: 0.5, z: 1.2, width: 2.0, depth: 1.6, height: 0.02, color: "#C4B8A0" },
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
          { id: "counter-back", label: "Back Counter", x: 0.1, z: 0.05, width: 2.8, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "counter-left", label: "Side Counter", x: 0.1, z: 0.65, width: 0.6, depth: 1.5, height: 0.9, color: "#E8E0D0" },
          { id: "fridge", label: "Fridge", x: 2.3, z: 0.05, width: 0.6, depth: 0.6, height: 1.8, color: "#C0C0C0" },
          { id: "table", label: "Dining Table", x: 1.0, z: 1.6, width: 1.2, depth: 0.8, height: 0.75, color: "#8B7355" },
        ],
      },
      {
        id: "galley",
        label: "Galley",
        description: "Parallel counters, efficient workflow",
        tier: "free",
        furniture: [
          { id: "counter-left", label: "Left Counter", x: 0.1, z: 0.1, width: 0.6, depth: 2.8, height: 0.9, color: "#E8E0D0" },
          { id: "counter-right", label: "Right Counter", x: 2.3, z: 0.1, width: 0.6, depth: 2.8, height: 0.9, color: "#E8E0D0" },
          { id: "fridge", label: "Fridge", x: 2.3, z: 0.1, width: 0.6, depth: 0.6, height: 1.8, color: "#C0C0C0" },
        ],
      },
      {
        id: "island",
        label: "Island",
        description: "Central island with bar seating",
        tier: "free",
        furniture: [
          { id: "counter-back", label: "Back Counter", x: 0.1, z: 0.05, width: 2.8, depth: 0.6, height: 0.9, color: "#E8E0D0" },
          { id: "island", label: "Kitchen Island", x: 0.7, z: 1.2, width: 1.6, depth: 0.8, height: 0.9, color: "#C4A882" },
          { id: "stool1", label: "Bar Stool", x: 0.9, z: 2.2, width: 0.35, depth: 0.35, height: 0.7, color: "#555555" },
          { id: "stool2", label: "Bar Stool", x: 1.7, z: 2.2, width: 0.35, depth: 0.35, height: 0.7, color: "#555555" },
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
        description: "Shower, vanity & toilet",
        tier: "free",
        furniture: [
          { id: "shower", label: "Shower", x: 0.1, z: 0.1, width: 0.9, depth: 0.9, height: 2.1, color: "#D4E6F1" },
          { id: "vanity", label: "Vanity", x: 1.2, z: 0.1, width: 0.8, depth: 0.5, height: 0.85, color: "#E8E0D0" },
          { id: "toilet", label: "Toilet", x: 2.2, z: 0.1, width: 0.4, depth: 0.6, height: 0.4, color: "#F5F5F5" },
          { id: "mirror", label: "Mirror", x: 1.2, z: 0.02, width: 0.8, depth: 0.05, height: 0.8, color: "#B8D4E3" },
        ],
      },
      {
        id: "spa",
        label: "Spa Bath",
        description: "Freestanding tub & rain shower",
        tier: "free",
        furniture: [
          { id: "tub", label: "Freestanding Tub", x: 0.5, z: 0.4, width: 1.7, depth: 0.8, height: 0.55, color: "#F5F5F5" },
          { id: "shower", label: "Rain Shower", x: 2.3, z: 0.1, width: 0.6, depth: 0.9, height: 2.1, color: "#D4E6F1" },
          { id: "vanity", label: "Vanity", x: 0.1, z: 2.2, width: 1.2, depth: 0.5, height: 0.85, color: "#E8E0D0" },
          { id: "toilet", label: "Toilet", x: 2.2, z: 2.2, width: 0.4, depth: 0.6, height: 0.4, color: "#F5F5F5" },
        ],
      },
      {
        id: "accessible",
        label: "Accessible",
        description: "Barrier-free, grab bars, roll-in shower",
        tier: "free",
        furniture: [
          { id: "shower", label: "Roll-in Shower", x: 0.1, z: 0.1, width: 1.4, depth: 1.2, height: 0.05, color: "#D4E6F1" },
          { id: "vanity", label: "Low Vanity", x: 1.8, z: 0.1, width: 1.0, depth: 0.5, height: 0.7, color: "#E8E0D0" },
          { id: "toilet", label: "Raised Toilet", x: 1.8, z: 1.8, width: 0.4, depth: 0.6, height: 0.45, color: "#F5F5F5" },
          { id: "grab-bar", label: "Grab Bar", x: 2.8, z: 1.6, width: 0.05, depth: 0.8, height: 0.05, color: "#C0C0C0" },
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
        description: "Sofa, coffee table & TV unit",
        tier: "free",
        furniture: [
          { id: "sofa", label: "L-Sofa", x: 0.2, z: 0.8, width: 2.2, depth: 0.9, height: 0.7, color: "#7A8B99" },
          { id: "coffee-table", label: "Coffee Table", x: 0.8, z: 1.9, width: 1.0, depth: 0.6, height: 0.4, color: "#8B7355" },
          { id: "tv-unit", label: "TV Unit", x: 0.3, z: 2.7, width: 1.8, depth: 0.35, height: 0.5, color: "#A0926B" },
          { id: "rug", label: "Area Rug", x: 0.4, z: 1.0, width: 2.0, depth: 1.8, height: 0.02, color: "#C4B8A0" },
        ],
      },
      {
        id: "dining",
        label: "Dining Room",
        description: "Dining table for 4-6 people",
        tier: "free",
        furniture: [
          { id: "table", label: "Dining Table", x: 0.6, z: 0.7, width: 1.6, depth: 1.0, height: 0.75, color: "#8B7355" },
          { id: "chair1", label: "Chair", x: 0.7, z: 0.3, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair2", label: "Chair", x: 1.65, z: 0.3, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair3", label: "Chair", x: 0.7, z: 1.75, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair4", label: "Chair", x: 1.65, z: 1.75, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "sideboard", label: "Sideboard", x: 0.2, z: 2.5, width: 2.0, depth: 0.4, height: 0.8, color: "#A0926B" },
        ],
      },
      {
        id: "media",
        label: "Media Room",
        description: "Home theater setup",
        tier: "free",
        furniture: [
          { id: "sofa", label: "Recliner Sofa", x: 0.3, z: 0.6, width: 2.4, depth: 1.0, height: 0.8, color: "#4A4A4A" },
          { id: "screen", label: "Projector Screen", x: 0.2, z: 2.8, width: 2.6, depth: 0.05, height: 1.5, color: "#F0F0F0" },
          { id: "console", label: "Media Console", x: 0.5, z: 2.5, width: 2.0, depth: 0.4, height: 0.45, color: "#333333" },
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
          { id: "desk", label: "L-Desk", x: 0.1, z: 0.1, width: 1.6, depth: 0.7, height: 0.75, color: "#C4A882" },
          { id: "chair", label: "Office Chair", x: 0.6, z: 1.0, width: 0.55, depth: 0.55, height: 1.0, color: "#333333" },
          { id: "shelf", label: "Bookshelf", x: 2.4, z: 0.1, width: 0.5, depth: 2.0, height: 1.8, color: "#A0926B" },
          { id: "cabinet", label: "File Cabinet", x: 0.1, z: 2.2, width: 0.5, depth: 0.6, height: 0.7, color: "#C0C0C0" },
        ],
      },
      {
        id: "dual",
        label: "Dual Workspace",
        description: "Two-person face-to-face",
        tier: "free",
        furniture: [
          { id: "desk1", label: "Desk 1", x: 0.2, z: 0.3, width: 1.2, depth: 0.6, height: 0.75, color: "#C4A882" },
          { id: "desk2", label: "Desk 2", x: 1.6, z: 0.3, width: 1.2, depth: 0.6, height: 0.75, color: "#C4A882" },
          { id: "chair1", label: "Chair", x: 0.5, z: 1.1, width: 0.55, depth: 0.55, height: 1.0, color: "#333333" },
          { id: "chair2", label: "Chair", x: 1.9, z: 1.1, width: 0.55, depth: 0.55, height: 1.0, color: "#333333" },
          { id: "shelf", label: "Shared Shelf", x: 0.3, z: 2.3, width: 2.4, depth: 0.4, height: 1.5, color: "#A0926B" },
        ],
      },
      {
        id: "meeting",
        label: "Meeting Room",
        description: "Round table with 4 chairs",
        tier: "free",
        furniture: [
          { id: "table", label: "Round Table", x: 0.8, z: 0.8, width: 1.2, depth: 1.2, height: 0.75, color: "#C4A882" },
          { id: "chair1", label: "Chair", x: 1.1, z: 0.2, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair2", label: "Chair", x: 2.1, z: 1.1, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair3", label: "Chair", x: 1.1, z: 2.1, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "chair4", label: "Chair", x: 0.2, z: 1.1, width: 0.45, depth: 0.45, height: 0.8, color: "#555555" },
          { id: "whiteboard", label: "Whiteboard", x: 0.02, z: 0.5, width: 0.05, depth: 2.0, height: 1.2, color: "#F0F0F0" },
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
          { id: "shelf-l", label: "Left Shelves", x: 0.05, z: 0.1, width: 0.5, depth: 2.8, height: 2.2, color: "#A0926B" },
          { id: "shelf-r", label: "Right Shelves", x: 2.45, z: 0.1, width: 0.5, depth: 2.8, height: 2.2, color: "#A0926B" },
          { id: "shelf-back", label: "Back Shelves", x: 0.6, z: 0.05, width: 1.8, depth: 0.5, height: 2.2, color: "#A0926B" },
        ],
      },
      {
        id: "workshop",
        label: "Workshop",
        description: "Workbench & tool wall",
        tier: "free",
        furniture: [
          { id: "bench", label: "Workbench", x: 0.2, z: 0.1, width: 2.0, depth: 0.7, height: 0.9, color: "#8B7355" },
          { id: "pegboard", label: "Tool Wall", x: 0.2, z: 0.02, width: 2.0, depth: 0.05, height: 1.5, color: "#D0D0D0" },
          { id: "cabinet", label: "Storage Cabinet", x: 2.3, z: 0.1, width: 0.6, depth: 1.2, height: 1.8, color: "#C0C0C0" },
          { id: "stool", label: "Work Stool", x: 1.0, z: 1.0, width: 0.4, depth: 0.4, height: 0.6, color: "#555555" },
        ],
      },
      {
        id: "utility",
        label: "Utility Room",
        description: "Laundry, mechanicals & drying",
        tier: "free",
        furniture: [
          { id: "washer", label: "Washer", x: 0.1, z: 0.1, width: 0.6, depth: 0.6, height: 0.85, color: "#F0F0F0" },
          { id: "dryer", label: "Dryer", x: 0.8, z: 0.1, width: 0.6, depth: 0.6, height: 0.85, color: "#F0F0F0" },
          { id: "sink", label: "Utility Sink", x: 1.6, z: 0.1, width: 0.6, depth: 0.5, height: 0.85, color: "#E8E0D0" },
          { id: "shelf", label: "Drying Rack", x: 2.3, z: 0.5, width: 0.6, depth: 1.5, height: 1.5, color: "#C0C0C0" },
          { id: "boiler", label: "Water Heater", x: 0.1, z: 2.2, width: 0.5, depth: 0.5, height: 1.2, color: "#D0D0D0" },
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
