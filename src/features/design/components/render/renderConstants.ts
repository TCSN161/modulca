export type LightingMode = "daylight" | "evening" | "night";
export type CameraAngle = "interior" | "corner" | "detail";
export type RenderMode = "template" | "ai";
export type ViewMode = "single" | "all";
export type PromptTemplate = "magazine" | "cozy" | "realestate" | "blueprint" | "custom";
export type RenderResolution = "draft" | "standard" | "high";
export type AiEngine = "auto" | "pollinations" | "ai-horde" | "stability" | "together" | "leonardo";

export const AI_ENGINES: Record<AiEngine, { label: string; description: string; speed: string; free?: boolean }> = {
  auto: { label: "Auto (Best Available)", description: "Tries Pollinations → AI Horde → paid engines", speed: "", free: true },
  pollinations: { label: "Pollinations AI", description: "Free, no account needed — recommended", speed: "Fast", free: true },
  "ai-horde": { label: "AI Horde", description: "Free community GPUs, reliable", speed: "Slow", free: true },
  together: { label: "Together.ai FLUX", description: "Free 3 months, high quality — API key required", speed: "Fast" },
  stability: { label: "Stability AI", description: "img2img — uses 3D scene as base — API key required", speed: "Medium" },
  leonardo: { label: "Leonardo.ai", description: "150 free/day, photorealistic — API key required", speed: "Medium" },
};

export const PROMPT_TEMPLATES: Record<PromptTemplate, { label: string; description: string; suffix: string }> = {
  magazine: {
    label: "Magazine Cover Shot",
    description: "Wide angle, dramatic lighting",
    suffix: "wide angle lens, dramatic lighting, interior design magazine cover, award-winning architectural photography, ultra high resolution, cinematic composition",
  },
  cozy: {
    label: "Cozy Interior",
    description: "Warm lighting, detail focused",
    suffix: "warm ambient lighting, cozy atmosphere, soft textures, hygge style, detail focused macro photography, shallow depth of field, inviting space",
  },
  realestate: {
    label: "Real Estate Listing",
    description: "Bright, clean, professional",
    suffix: "bright natural daylight, clean and airy, professional real estate photography, HDR, wide angle, well-staged, inviting and spacious feel",
  },
  blueprint: {
    label: "Blueprint Overlay",
    description: "Technical + render hybrid",
    suffix: "architectural blueprint overlay, technical drawing blended with photorealistic render, wireframe accents, engineering precision, hybrid visualization",
  },
  custom: {
    label: "Custom",
    description: "Edit prompt freely",
    suffix: "",
  },
};

export const RENDER_RESOLUTIONS: Record<RenderResolution, { label: string; width: number; height: number; note: string }> = {
  draft: { label: "Draft", width: 512, height: 288, note: "Fast" },
  standard: { label: "Standard", width: 1024, height: 576, note: "Default" },
  high: { label: "High", width: 1536, height: 864, note: "Slower" },
};

/** Pinterest-style recommendation images per style */
export const STYLE_PINS: Record<string, { label: string; h: number; color: string; cat: string }[]> = {
  scandinavian: [
    { label: "Nordic Living Room", h: 220, color: "#E8DFD0", cat: "Living" },
    { label: "Oak Side Table", h: 160, color: "#D4A76A", cat: "Furniture" },
    { label: "Linen Curtains", h: 180, color: "#F0EDE5", cat: "Textile" },
    { label: "Birch Bookshelf", h: 240, color: "#D4B896", cat: "Furniture" },
    { label: "Ceramic Pendant", h: 150, color: "#C8CDD0", cat: "Lighting" },
    { label: "Wool Throw Blanket", h: 170, color: "#E0D8C8", cat: "Textile" },
    { label: "Minimalist Kitchen", h: 200, color: "#F5F3EF", cat: "Kitchen" },
    { label: "White Stone Vase", h: 140, color: "#EDEBE5", cat: "Decor" },
    { label: "Light Wood Flooring", h: 190, color: "#C8A878", cat: "Flooring" },
    { label: "Simple Desk Setup", h: 210, color: "#D0C8B8", cat: "Office" },
    { label: "Fog Grey Sofa", h: 180, color: "#B8BCC0", cat: "Furniture" },
    { label: "Clean Bathroom", h: 230, color: "#E8E4DC", cat: "Bathroom" },
  ],
  industrial: [
    { label: "Exposed Brick Loft", h: 230, color: "#B5654A", cat: "Living" },
    { label: "Steel Shelf Unit", h: 200, color: "#5A5A5A", cat: "Furniture" },
    { label: "Edison Bulb Cluster", h: 150, color: "#C87941", cat: "Lighting" },
    { label: "Concrete Countertop", h: 170, color: "#B0AFA8", cat: "Kitchen" },
    { label: "Leather Club Chair", h: 190, color: "#8B5E3C", cat: "Furniture" },
    { label: "Iron Pipe Rack", h: 160, color: "#4A4A4A", cat: "Storage" },
    { label: "Distressed Wood Table", h: 210, color: "#7B5B3A", cat: "Furniture" },
    { label: "Metal Pendant Lamp", h: 140, color: "#3A3A3A", cat: "Lighting" },
    { label: "Raw Concrete Floor", h: 180, color: "#9A9890", cat: "Flooring" },
    { label: "Copper Faucet", h: 150, color: "#C87941", cat: "Fixture" },
    { label: "Wire Frame Mirror", h: 220, color: "#6A6A6A", cat: "Decor" },
    { label: "Canvas Art Print", h: 200, color: "#444", cat: "Decor" },
  ],
  "warm-contemporary": [
    { label: "Walnut Dining Room", h: 220, color: "#7B5B3A", cat: "Dining" },
    { label: "Bouclé Armchair", h: 180, color: "#F2EBD9", cat: "Furniture" },
    { label: "Sage Velvet Cushions", h: 150, color: "#8FAE8B", cat: "Textile" },
    { label: "Brass Floor Lamp", h: 210, color: "#C8A96E", cat: "Lighting" },
    { label: "Terracotta Tiles", h: 170, color: "#C4735C", cat: "Flooring" },
    { label: "Fluted Glass Panel", h: 190, color: "#D4DDD2", cat: "Fixture" },
    { label: "Curved Wood Console", h: 160, color: "#8B6B4A", cat: "Furniture" },
    { label: "Textured Wall Art", h: 230, color: "#A08868", cat: "Decor" },
    { label: "Warm Bedroom Setup", h: 200, color: "#D4B898", cat: "Bedroom" },
    { label: "Green Plant Corner", h: 140, color: "#6A8A6A", cat: "Decor" },
    { label: "Stone Basin Sink", h: 180, color: "#B0A898", cat: "Bathroom" },
    { label: "Woven Pendant Light", h: 160, color: "#C4A882", cat: "Lighting" },
  ],
};
