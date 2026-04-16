/**
 * Design style directions for the moodboard/style selection step.
 * Each style defines a complete visual identity: colors, materials, mood.
 * 8 styles: 3 free (Scandinavian, Industrial, Warm Contemporary)
 *           5 premium (Mediterranean, Japanese, Traditional Romanian, Biophilic, Eclectic)
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
      { url: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80", label: "Detail" },
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

  /* ── 4. Mediterranean ── */
  {
    id: "mediterranean",
    label: "Mediterranean",
    tagline: "Sun-drenched, earthy, open",
    description:
      "White lime-washed walls, terracotta accents, and courtyard living. Inspired by Greek islands and Tuscan villas — thick walls for thermal mass, arched openings, and outdoor rooms.",
    tier: "premium",
    palette: [
      { label: "Limewash", color: "#FAF6F0" },
      { label: "Terracotta", color: "#C4735C" },
      { label: "Azure", color: "#5B8FA8" },
      { label: "Olive", color: "#7A8B5C" },
      { label: "Sand", color: "#D4C5A9" },
    ],
    materials: [
      { label: "Terracotta Tile", color: "#C4735C" },
      { label: "Lime Plaster", color: "#FAF6F0" },
      { label: "Natural Stone", color: "#D4C5A9" },
      { label: "Wrought Iron", color: "#3A3A3A" },
    ],
    keywords: ["courtyard", "sun", "terracotta", "white", "outdoor living", "arches"],
    products: [
      { label: "Terracotta Floor Tiles", description: "Handmade terracotta, warm patina", color: "#C4735C", category: "flooring" },
      { label: "Olive Wood Table", description: "Solid olive wood, live edge", color: "#8B7355", category: "furniture" },
      { label: "Iron Lantern", description: "Hand-forged iron, candle holder", color: "#3A3A3A", category: "lighting" },
      { label: "Linen Drapes", description: "Natural linen, breeze-catching", color: "#F0E8D8", category: "textile" },
      { label: "Ceramic Bowls", description: "Hand-painted Aegean blue", color: "#5B8FA8", category: "fixture" },
      { label: "Rattan Armchair", description: "Woven rattan, curved back", color: "#C8B896", category: "furniture" },
    ],
    moodColors: ["#FAF6F0", "#C4735C", "#5B8FA8", "#D4C5A9"],
    heroImage: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400&q=80", label: "Courtyard" },
      { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", label: "Mediterranean Villa", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Sun-Drenched Interior", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&q=80", label: "Terracotta Kitchen", credit: "Unsplash" },
    ],
    floorDefault: "terracotta",
    wallDefault: "cream",
  },

  /* ── 5. Japanese Wabi-Sabi ── */
  {
    id: "japanese-wabi-sabi",
    label: "Japanese Wabi-Sabi",
    tagline: "Serene, imperfect, mindful",
    description:
      "Beauty in imperfection and transience. Shoji screens, natural wood, tatami textures, and deliberate emptiness (Ma). Every element is intentional, creating calm contemplation spaces.",
    tier: "premium",
    palette: [
      { label: "Rice Paper", color: "#F5F0E8" },
      { label: "Shou Sugi", color: "#3A3228" },
      { label: "Matcha", color: "#8B9E6B" },
      { label: "Bamboo", color: "#C8B896" },
      { label: "Indigo", color: "#394B6B" },
    ],
    materials: [
      { label: "Bamboo", color: "#C8B896" },
      { label: "Charred Cedar", color: "#3A3228" },
      { label: "Washi Paper", color: "#F5F0E8" },
      { label: "Raw Clay", color: "#B5A48A" },
    ],
    keywords: ["zen", "imperfection", "ma", "natural", "mindful", "simplicity"],
    products: [
      { label: "Bamboo Flooring", description: "Strand-woven bamboo, honey tone", color: "#C8B896", category: "flooring" },
      { label: "Low Platform Bed", description: "Solid hinoki wood, floor-level", color: "#B5A48A", category: "furniture" },
      { label: "Paper Lantern", description: "Washi paper, bamboo frame, soft glow", color: "#F5F0E8", category: "lighting" },
      { label: "Linen Noren", description: "Doorway curtain, indigo dyed", color: "#394B6B", category: "textile" },
      { label: "Raku Tea Bowl", description: "Hand-fired, irregular glaze", color: "#8B7B6B", category: "fixture" },
      { label: "Tatami Mat", description: "Woven rush, natural border", color: "#C8B896", category: "furniture" },
    ],
    moodColors: ["#F5F0E8", "#3A3228", "#8B9E6B", "#C8B896"],
    heroImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=400&q=80", label: "Detail" },
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1553881781-4c55163dc5fd?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80", label: "Zen Living Room", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80", label: "Wabi-Sabi Interior", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1553881781-4c55163dc5fd?w=600&q=80", label: "Japanese Garden Room", credit: "Unsplash" },
    ],
    floorDefault: "bamboo",
    wallDefault: "parchment",
  },

  /* ── 6. Traditional Romanian ── */
  {
    id: "traditional-romanian",
    label: "Traditional Romanian",
    tagline: "Heritage, wood, warmth",
    description:
      "A modern reinterpretation of Romanian vernacular architecture. Pitched roofs, carved wood details, warm timber throughout, and the prispa (covered porch) as a transition between home and garden.",
    tier: "premium",
    palette: [
      { label: "Timber", color: "#8B6914" },
      { label: "Lime White", color: "#F5F0E0" },
      { label: "Folk Red", color: "#A04030" },
      { label: "Forest", color: "#4A6B3A" },
      { label: "Clay", color: "#C4A882" },
    ],
    materials: [
      { label: "Carved Oak", color: "#8B6914" },
      { label: "Lime Plaster", color: "#F5F0E0" },
      { label: "Ceramic Tile", color: "#A04030" },
      { label: "Fir Plank", color: "#C4A882" },
    ],
    keywords: ["vernacular", "prispa", "carved wood", "folk", "heritage", "cozy"],
    products: [
      { label: "Wide Oak Planks", description: "Hand-scraped solid oak, warm tone", color: "#8B6914", category: "flooring" },
      { label: "Ceramic Stove", description: "Traditional soba, green glazed tiles", color: "#4A6B3A", category: "fixture" },
      { label: "Wrought Iron Chandelier", description: "Hand-forged, candle-style", color: "#3A3A3A", category: "lighting" },
      { label: "Woven Textile Runner", description: "Traditional patterns, natural wool", color: "#A04030", category: "textile" },
      { label: "Carved Wood Panel", description: "Maramures-style fretwork", color: "#8B6914", category: "fixture" },
      { label: "Pine Bench", description: "Solid fir, traditional form", color: "#C4A882", category: "furniture" },
    ],
    moodColors: ["#8B6914", "#F5F0E0", "#A04030", "#4A6B3A"],
    heroImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&q=80", label: "Heritage Home" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", label: "Interior" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80", label: "Romanian Heritage", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Warm Timber Interior", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=600&q=80", label: "Prispa Living", credit: "Unsplash" },
    ],
    floorDefault: "oak",
    wallDefault: "ivory",
  },

  /* ── 7. Biophilic / Organic ── */
  {
    id: "biophilic-organic",
    label: "Biophilic Organic",
    tagline: "Living, green, grounded",
    description:
      "Maximum nature connection in every module. Living walls, natural stone, abundant daylight, and organic forms. Inspired by Frank Lloyd Wright and biophilic design principles — the home breathes with its landscape.",
    tier: "premium",
    palette: [
      { label: "Moss", color: "#5A7A4A" },
      { label: "Stone", color: "#B5A898" },
      { label: "Earth", color: "#8B7355" },
      { label: "Leaf", color: "#A8C090" },
      { label: "Stream", color: "#7AA8B0" },
    ],
    materials: [
      { label: "Natural Stone", color: "#B5A898" },
      { label: "Living Moss", color: "#5A7A4A" },
      { label: "Cork", color: "#C4A872" },
      { label: "Rammed Earth", color: "#8B7355" },
    ],
    keywords: ["biophilic", "green wall", "natural", "organic", "landscape", "daylight"],
    products: [
      { label: "Reclaimed Oak Flooring", description: "Salvaged oak planks, character grade", color: "#8B7355", category: "flooring" },
      { label: "Living Wall Panel", description: "Pre-planted moss & fern module", color: "#5A7A4A", category: "fixture" },
      { label: "Natural Stone Basin", description: "River stone, hand-carved", color: "#B5A898", category: "fixture" },
      { label: "Organic Linen Throw", description: "Undyed linen, natural texture", color: "#E0D8C8", category: "textile" },
      { label: "Driftwood Pendant", description: "Reclaimed wood, warm LED", color: "#A89078", category: "lighting" },
      { label: "Cork Stool", description: "Solid cork, organic shape", color: "#C4A872", category: "furniture" },
    ],
    moodColors: ["#5A7A4A", "#B5A898", "#A8C090", "#8B7355"],
    heroImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80", label: "Green Interior" },
      { url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400&q=80", label: "Natural Light" },
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80", label: "Biophilic Living Room", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&q=80", label: "Organic Bedroom", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=600&q=80", label: "Nature Kitchen", credit: "Unsplash" },
    ],
    floorDefault: "oak",
    wallDefault: "moss",
  },

  /* ── 8. Eclectic Mixed ── */
  {
    id: "eclectic-mixed",
    label: "Eclectic Mixed",
    tagline: "Bold, personal, curated",
    description:
      "Your personality is the style. Mix patterns, eras, and cultures into a curated collage. Modern shell with vintage accents, global textiles, and unexpected color combinations. Rules exist to be artfully broken.",
    tier: "premium",
    palette: [
      { label: "Teal", color: "#2A8B8B" },
      { label: "Mustard", color: "#D4A030" },
      { label: "Berry", color: "#8B3A5A" },
      { label: "Sand", color: "#D8C8A8" },
      { label: "Charcoal", color: "#3A3A3A" },
    ],
    materials: [
      { label: "Patterned Tile", color: "#2A8B8B" },
      { label: "Velvet", color: "#8B3A5A" },
      { label: "Brass", color: "#D4A030" },
      { label: "Terrazzo", color: "#D8C8A8" },
    ],
    keywords: ["curated", "bold color", "mixed eras", "personal", "global", "maximalist"],
    products: [
      { label: "Terrazzo Floor Tiles", description: "Large format, warm aggregate", color: "#D8C8A8", category: "flooring" },
      { label: "Velvet Sofa", description: "Deep berry velvet, brass legs", color: "#8B3A5A", category: "furniture" },
      { label: "Moroccan Pendant", description: "Pierced brass, star pattern", color: "#D4A030", category: "lighting" },
      { label: "Kilim Rug", description: "Vintage Turkish kilim, mixed tones", color: "#C4735C", category: "textile" },
      { label: "Zellige Tiles", description: "Hand-cut teal glazed tiles", color: "#2A8B8B", category: "fixture" },
      { label: "Vintage Console", description: "Mid-century walnut, hairpin legs", color: "#7B5B3A", category: "furniture" },
    ],
    moodColors: ["#2A8B8B", "#D4A030", "#8B3A5A", "#D8C8A8"],
    heroImage: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80",
    moodImages: [
      { url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80", label: "Living Space" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", label: "Detail" },
      { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80", label: "Materials" },
      { url: "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=400&q=80", label: "Atmosphere" },
    ],
    renderImages: [
      { url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80", label: "Eclectic Living", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Mixed Era Bedroom", credit: "Unsplash" },
      { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80", label: "Curated Kitchen", credit: "Unsplash" },
    ],
    floorDefault: "walnut",
    wallDefault: "sand",
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
  mediterranean: [
    { label: "Terracotta", color: "#C4735C" },
    { label: "Limewash", color: "#FAF6F0" },
    { label: "Azure", color: "#5B8FA8" },
    { label: "Olive", color: "#7A8B5C" },
    { label: "Sand", color: "#D4C5A9" },
    { label: "Iron", color: "#3A3A3A" },
  ],
  "japanese-wabi-sabi": [
    { label: "Bamboo", color: "#C8B896" },
    { label: "Charred Cedar", color: "#3A3228" },
    { label: "Rice Paper", color: "#F5F0E8" },
    { label: "Matcha", color: "#8B9E6B" },
    { label: "Indigo", color: "#394B6B" },
    { label: "Raw Clay", color: "#B5A48A" },
  ],
  "traditional-romanian": [
    { label: "Carved Oak", color: "#8B6914" },
    { label: "Lime White", color: "#F5F0E0" },
    { label: "Folk Red", color: "#A04030" },
    { label: "Forest Green", color: "#4A6B3A" },
    { label: "Clay", color: "#C4A882" },
    { label: "Dark Fir", color: "#5A4A2A" },
  ],
  "biophilic-organic": [
    { label: "Moss", color: "#5A7A4A" },
    { label: "Stone", color: "#B5A898" },
    { label: "Earth", color: "#8B7355" },
    { label: "Leaf", color: "#A8C090" },
    { label: "Cork", color: "#C4A872" },
    { label: "Stream", color: "#7AA8B0" },
  ],
  "eclectic-mixed": [
    { label: "Teal", color: "#2A8B8B" },
    { label: "Mustard", color: "#D4A030" },
    { label: "Berry", color: "#8B3A5A" },
    { label: "Sand", color: "#D8C8A8" },
    { label: "Brass", color: "#C8A050" },
    { label: "Charcoal", color: "#3A3A3A" },
  ],
};
