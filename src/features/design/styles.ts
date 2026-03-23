/**
 * Design style directions for the moodboard/style selection step.
 * Each style defines a complete visual identity: colors, materials, mood.
 * Free tier: 3 styles. Premium: more in the future.
 */

export interface StyleSwatch {
  label: string;
  color: string;
}

export interface StyleProduct {
  label: string;
  description: string;
  color: string;     // representative color for placeholder card
  category: string;  // "flooring" | "furniture" | "lighting" | "textile" | "fixture"
}

export interface MoodImage {
  url: string;
  label: string;
  credit?: string;
}

export interface StyleDirection {
  id: string;
  label: string;
  tagline: string;
  description: string;
  tier: "free" | "premium";
  palette: StyleSwatch[];
  materials: StyleSwatch[];
  keywords: string[];
  products: StyleProduct[];
  moodColors: string[]; // 4 colors for moodboard grid placeholders
  moodImages: MoodImage[]; // curated photos for the moodboard
  heroImage: string; // main style card image
  renderImages: MoodImage[]; // curated images for the render/recommendation step
  floorDefault: string;
  wallDefault: string;
}

export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    id: "scandinavian",
    label: "Scandinavian Minimal",
    tagline: "Light, airy, functional",
    description:
      "Clean lines, natural light wood, and white spaces create a calm, functional environment. Inspired by Nordic design principles — every object has purpose, every surface breathes.",
    tier: "free",
    palette: [
      { label: "Snow", color: "#F5F3EF" },
      { label: "Birch", color: "#D4B896" },
      { label: "Fog", color: "#C8CDD0" },
      { label: "Pine", color: "#8FA68A" },
      { label: "Charcoal", color: "#3A3A3A" },
    ],
    materials: [
      { label: "Light Oak", color: "#D4A76A" },
      { label: "White Lacquer", color: "#F0EDE5" },
      { label: "Linen", color: "#E8DFD0" },
      { label: "Concrete Light", color: "#D0CEC8" },
    ],
    keywords: ["minimal", "hygge", "natural light", "functional", "nordic", "clean"],
    products: [
      { label: "Oak Plank Flooring", description: "Wide-plank white oak, matte finish", color: "#D4A76A", category: "flooring" },
      { label: "Wool Area Rug", description: "Handwoven natural wool, ivory", color: "#E8DFD0", category: "textile" },
      { label: "Pendant Lamp", description: "Brass & opal glass dome pendant", color: "#C8A96E", category: "lighting" },
      { label: "Linen Curtains", description: "Sheer linen, natural tone", color: "#EAE0D2", category: "textile" },
      { label: "Ceramic Vase", description: "Matte white stoneware", color: "#F0EDE5", category: "fixture" },
      { label: "Birch Dining Table", description: "Solid birch, tapered legs", color: "#D4B896", category: "furniture" },
    ],
    moodColors: ["#F5F3EF", "#D4A76A", "#8FA68A", "#E8DFD0"],
    heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=400&q=80", label: "Detail" },
      { url: "https://images.unsplash.com/photo-1598928506311-c55ez637a11?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80", label: "Scandinavian Living Room", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Nordic Bedroom", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80", label: "Minimalist Kitchen", credit: "Unsplash" },
    ],
    floorDefault: "oak",
    wallDefault: "alabaster",
  },
  {
    id: "industrial",
    label: "Industrial Modern",
    tagline: "Raw, bold, urban",
    description:
      "Exposed materials meet refined details. Concrete, steel, and dark tones create an urban loft atmosphere with warmth from leather and copper accents.",
    tier: "free",
    palette: [
      { label: "Graphite", color: "#3A3A3A" },
      { label: "Steel", color: "#7A8088" },
      { label: "Rust", color: "#B5654A" },
      { label: "Concrete", color: "#B0AFA8" },
      { label: "Copper", color: "#C87941" },
    ],
    materials: [
      { label: "Polished Concrete", color: "#B0AFA8" },
      { label: "Blackened Steel", color: "#3A3A3A" },
      { label: "Aged Leather", color: "#8B5E3C" },
      { label: "Raw Brick", color: "#B5654A" },
    ],
    keywords: ["loft", "raw", "urban", "metal", "exposed", "bold"],
    products: [
      { label: "Polished Concrete Floor", description: "Sealed micro-cement, grey tone", color: "#B0AFA8", category: "flooring" },
      { label: "Leather Sofa", description: "Distressed brown leather, steel frame", color: "#8B5E3C", category: "furniture" },
      { label: "Edison Pendant", description: "Exposed filament, iron cage", color: "#3A3A3A", category: "lighting" },
      { label: "Metal Shelf Unit", description: "Blackened steel & reclaimed wood", color: "#5A5A5A", category: "furniture" },
      { label: "Copper Fixtures", description: "Brushed copper tap & handles", color: "#C87941", category: "fixture" },
      { label: "Concrete Planter", description: "Geometric concrete vessels", color: "#B0AFA8", category: "fixture" },
    ],
    moodColors: ["#3A3A3A", "#B0AFA8", "#B5654A", "#8B5E3C"],
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", label: "Detail" },
      { url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80", label: "Industrial Loft", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80", label: "Concrete & Steel Kitchen", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=600&q=80", label: "Urban Workspace", credit: "Unsplash" },
    ],
    floorDefault: "concrete",
    wallDefault: "slate",
  },
  {
    id: "warm-contemporary",
    label: "Warm Contemporary",
    tagline: "Elegant, textured, inviting",
    description:
      "Rich walnut tones, soft sage greens, and layered textures create a space that feels both modern and deeply comfortable. Organic shapes meet clean architecture.",
    tier: "free",
    palette: [
      { label: "Walnut", color: "#7B5B3A" },
      { label: "Sage", color: "#8FAE8B" },
      { label: "Cream", color: "#F2EBD9" },
      { label: "Terracotta", color: "#C4735C" },
      { label: "Gold", color: "#C8A96E" },
    ],
    materials: [
      { label: "Walnut Wood", color: "#7B5B3A" },
      { label: "Sage Plaster", color: "#8FAE8B" },
      { label: "Bouclé Fabric", color: "#F2EBD9" },
      { label: "Fluted Glass", color: "#D4DDD2" },
    ],
    keywords: ["warm", "textured", "organic", "elegant", "cozy", "layered"],
    products: [
      { label: "Walnut Herringbone", description: "Engineered walnut, herringbone pattern", color: "#7B5B3A", category: "flooring" },
      { label: "Bouclé Armchair", description: "Cream bouclé, curved frame", color: "#F2EBD9", category: "furniture" },
      { label: "Arch Floor Lamp", description: "Brushed brass, linen shade", color: "#C8A96E", category: "lighting" },
      { label: "Velvet Cushions", description: "Sage green velvet, set of 3", color: "#8FAE8B", category: "textile" },
      { label: "Terracotta Tiles", description: "Handmade bathroom tiles", color: "#C4735C", category: "fixture" },
      { label: "Fluted Glass Panel", description: "Privacy partition, bronze frame", color: "#D4DDD2", category: "furniture" },
    ],
    moodColors: ["#7B5B3A", "#8FAE8B", "#F2EBD9", "#C4735C"],
    heroImage: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400&q=80", label: "Detail" },
      { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=600&q=80", label: "Warm Contemporary Living", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&q=80", label: "Textured Bedroom", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=600&q=80", label: "Sage & Walnut Bathroom", credit: "Unsplash" },
    ],
    floorDefault: "walnut",
    wallDefault: "sage",
  },
];

export function getStyleDirection(id: string): StyleDirection | undefined {
  return STYLE_DIRECTIONS.find((s) => s.id === id);
}

/** Furniture color palettes per style for the furniture color picker */
export const FURNITURE_COLORS: Record<string, { label: string; color: string }[]> = {
  scandinavian: [
    { label: "Natural Oak", color: "#D4A76A" },
    { label: "White", color: "#F0EDE5" },
    { label: "Light Grey", color: "#C8CDD0" },
    { label: "Birch", color: "#D4B896" },
    { label: "Sage", color: "#8FA68A" },
    { label: "Charcoal", color: "#3A3A3A" },
  ],
  industrial: [
    { label: "Black Steel", color: "#2A2A2A" },
    { label: "Gunmetal", color: "#5A5A5A" },
    { label: "Aged Leather", color: "#8B5E3C" },
    { label: "Rust", color: "#B5654A" },
    { label: "Copper", color: "#C87941" },
    { label: "Concrete", color: "#B0AFA8" },
  ],
  "warm-contemporary": [
    { label: "Walnut", color: "#7B5B3A" },
    { label: "Cream", color: "#F2EBD9" },
    { label: "Sage", color: "#8FAE8B" },
    { label: "Terracotta", color: "#C4735C" },
    { label: "Gold", color: "#C8A96E" },
    { label: "Deep Green", color: "#4A6B4A" },
  ],
};
