export type LightingMode = "daylight" | "evening" | "night";
export type CameraAngle = "interior" | "corner" | "detail";
export type RenderMode = "template" | "ai";
export type ViewMode = "single" | "all";
export type PromptTemplate = "magazine" | "cozy" | "realestate" | "blueprint" | "custom";
export type RenderResolution = "draft" | "standard" | "high";
export type AiEngine =
  | "auto"
  // Free engines
  | "together" | "cloudflare" | "huggingface" | "pollinations" | "ai-horde"
  // Low-cost / mid engines
  | "fal" | "fireworks" | "segmind" | "deepinfra" | "replicate" | "leonardo"
  // Premium engines
  | "blackforest" | "stability" | "openai";

export const AI_ENGINES: Record<AiEngine, { label: string; description: string; speed: string }> = {
  auto:        { label: "Auto (Best Available)", description: "Smart routing by tier & task type", speed: "" },
  // ── Free ──
  together:    { label: "Together.ai FLUX",  description: "Free 3 months, FLUX Schnell + Kontext img2img", speed: "Fast" },
  fal:         { label: "fal.ai",            description: "Fastest inference, img2img + text2img + upscale", speed: "Fast" },
  cloudflare:  { label: "Cloudflare AI",     description: "Free forever (10K/day), EU regions, FLUX", speed: "Fast" },
  huggingface: { label: "Hugging Face",      description: "Free open-source FLUX & SDXL models", speed: "Medium" },
  pollinations:{ label: "Pollinations AI",   description: "Free, no account needed", speed: "Fast" },
  // ── Low-cost / Mid ──
  fireworks:   { label: "Fireworks AI",      description: "Best GDPR (EU rep, SOC 2). FLUX $0.0014/img", speed: "Fast" },
  segmind:     { label: "Segmind",           description: "Cheapest upscaling ($0.005), SDXL", speed: "Medium" },
  deepinfra:   { label: "DeepInfra",         description: "Fast FLUX inference, DeepStart startup program", speed: "Fast" },
  replicate:   { label: "Replicate",         description: "ControlNet img2img, largest model ecosystem", speed: "Medium" },
  leonardo:    { label: "Leonardo.ai",       description: "Photorealistic with alchemy, 150 free/day", speed: "Medium" },
  // ── Premium ──
  blackforest: { label: "Black Forest Labs", description: "FLUX creators, German (EU/GDPR), best FLUX quality", speed: "Medium" },
  stability:   { label: "Stability AI",      description: "img2img — uses 3D scene as structural base", speed: "Medium" },
  openai:      { label: "OpenAI GPT Image",  description: "Premium quality, GPT Image + DALL-E 3", speed: "Medium" },
  // ── Always available ──
  "ai-horde":  { label: "AI Horde",          description: "Free community GPUs, reliable fallback", speed: "Slow" },
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
export interface StylePin {
  label: string;
  h: number;
  color: string;
  cat: string;
  img: string;
}

export const STYLE_PINS: Record<string, StylePin[]> = {
  scandinavian: [
    { label: "Nordic Living Room", h: 220, color: "#E8DFD0", cat: "Living", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80" },
    { label: "Oak Side Table", h: 160, color: "#D4A76A", cat: "Furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
    { label: "Linen Curtains", h: 180, color: "#F0EDE5", cat: "Textile", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80" },
    { label: "Birch Bookshelf", h: 240, color: "#D4B896", cat: "Furniture", img: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&q=80" },
    { label: "Ceramic Pendant", h: 150, color: "#C8CDD0", cat: "Lighting", img: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80" },
    { label: "Wool Throw Blanket", h: 170, color: "#E0D8C8", cat: "Textile", img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80" },
    { label: "Minimalist Kitchen", h: 200, color: "#F5F3EF", cat: "Kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" },
    { label: "White Stone Vase", h: 140, color: "#EDEBE5", cat: "Decor", img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80" },
    { label: "Light Wood Flooring", h: 190, color: "#C8A878", cat: "Flooring", img: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&q=80" },
    { label: "Simple Desk Setup", h: 210, color: "#D0C8B8", cat: "Office", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80" },
    { label: "Fog Grey Sofa", h: 180, color: "#B8BCC0", cat: "Furniture", img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=80" },
    { label: "Clean Bathroom", h: 230, color: "#E8E4DC", cat: "Bathroom", img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80" },
  ],
  industrial: [
    { label: "Exposed Brick Loft", h: 230, color: "#B5654A", cat: "Living", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" },
    { label: "Steel Shelf Unit", h: 200, color: "#5A5A5A", cat: "Furniture", img: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&q=80" },
    { label: "Edison Bulb Cluster", h: 150, color: "#C87941", cat: "Lighting", img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&q=80" },
    { label: "Concrete Countertop", h: 170, color: "#B0AFA8", cat: "Kitchen", img: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&q=80" },
    { label: "Leather Club Chair", h: 190, color: "#8B5E3C", cat: "Furniture", img: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80" },
    { label: "Iron Pipe Rack", h: 160, color: "#4A4A4A", cat: "Storage", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80" },
    { label: "Distressed Wood Table", h: 210, color: "#7B5B3A", cat: "Furniture", img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80" },
    { label: "Metal Pendant Lamp", h: 140, color: "#3A3A3A", cat: "Lighting", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80" },
    { label: "Raw Concrete Floor", h: 180, color: "#9A9890", cat: "Flooring", img: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80" },
    { label: "Copper Faucet", h: 150, color: "#C87941", cat: "Fixture", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80" },
    { label: "Wire Frame Mirror", h: 220, color: "#6A6A6A", cat: "Decor", img: "https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=400&q=80" },
    { label: "Canvas Art Print", h: 200, color: "#444", cat: "Decor", img: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&q=80" },
  ],
  "warm-contemporary": [
    { label: "Walnut Dining Room", h: 220, color: "#7B5B3A", cat: "Dining", img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80" },
    { label: "Bouclé Armchair", h: 180, color: "#F2EBD9", cat: "Furniture", img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80" },
    { label: "Sage Velvet Cushions", h: 150, color: "#8FAE8B", cat: "Textile", img: "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400&q=80" },
    { label: "Brass Floor Lamp", h: 210, color: "#C8A96E", cat: "Lighting", img: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80" },
    { label: "Terracotta Tiles", h: 170, color: "#C4735C", cat: "Flooring", img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80" },
    { label: "Fluted Glass Panel", h: 190, color: "#D4DDD2", cat: "Fixture", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80" },
    { label: "Curved Wood Console", h: 160, color: "#8B6B4A", cat: "Furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
    { label: "Textured Wall Art", h: 230, color: "#A08868", cat: "Decor", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80" },
    { label: "Warm Bedroom Setup", h: 200, color: "#D4B898", cat: "Bedroom", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" },
    { label: "Green Plant Corner", h: 140, color: "#6A8A6A", cat: "Decor", img: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80" },
    { label: "Stone Basin Sink", h: 180, color: "#B0A898", cat: "Bathroom", img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80" },
    { label: "Woven Pendant Light", h: 160, color: "#C4A882", cat: "Lighting", img: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&q=80" },
  ],
};
