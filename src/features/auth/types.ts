/**
 * ModulCA Account Architecture
 * ─────────────────────────────
 * Three tiers with progressive feature access:
 *   1. Free       — basic exploration & design
 *   2. Premium    — full client experience
 *   3. Architect  — professional tools + multi-project management
 */

export type AccountTier = "guest_free" | "free" | "premium" | "architect";

export interface AccountTierConfig {
  id: AccountTier;
  label: string;
  labelRo: string;
  description: string;
  priceMonthly: number | null; // EUR, null = free
  priceYearly: number | null;  // EUR, null = free
  color: string;
  features: FeatureAccess;
}

export interface FeatureAccess {
  // Step 1 — Land Configuration
  maxTerrainSize: number;           // max terrain area in m²
  customTerrainShape: boolean;      // freeform polygon terrain
  importCadastralData: boolean;     // ANCPI cadastral import

  // Step 2 — Layout Design
  maxModules: number;               // max modules per project
  allModuleTypes: boolean;          // access to all module types
  customModuleDimensions: boolean;  // non-standard module sizes

  // Step 3 — 3D Preview
  highQualityPreview: boolean;      // enhanced materials & lighting
  moduleSwap: boolean;              // right-click swap feature

  // Step 4 — Design Vision
  styleDirections: number;          // number of style presets
  moodboardPins: number;            // max moodboard images
  customStyleUpload: boolean;       // upload reference photos

  // Step 5 — Configure (Materials)
  allMaterials: boolean;            // full material library
  customMaterials: boolean;         // user-added materials
  furnitureOverrides: boolean;      // reposition furniture

  // Step 6 — Visualize (Products)
  productCatalog: boolean;          // browse product catalog
  partnerPricing: boolean;          // real distributor prices
  directPurchase: boolean;          // buy through platform

  // Step 7 — AI Render
  aiRendersPerMonth: number;        // monthly AI render quota
  maxCostUsdPerImage: number;       // max cost per single render (USD) — controls which engines are allowed
  renderResolution: "sd" | "hd" | "4k";
  savedRenders: number;             // max saved renders

  // Step 8 — Technical
  allDrawingTypes: boolean;         // all 6 drawing types
  drawingPresentation: boolean;     // fullscreen slideshow
  knowledgeBase: boolean;           // construction manual
  permitTracker: boolean;           // building permit tracker
  exportPdf: boolean;               // PDF export
  exportDwg: boolean;               // DWG/DXF export (future)

  // Step 9 — Walkthrough
  walkthrough: boolean;             // 3D walkthrough
  autoTour: boolean;                // guided auto-tour
  vrMode: boolean;                  // VR headset support (future)

  // Step 10-12 — Presentation & Export
  presentationTemplates: number;    // number of templates
  pdfPresentation: boolean;         // download full PDF book
  sharableLink: boolean;            // public share link

  // Step 13 — Marketplace
  marketplaceBrowse: boolean;       // browse listings
  marketplaceList: boolean;         // list own land
  builderDirectory: boolean;        // find builders/architects

  // Project Management
  maxProjects: number;              // total saved projects
  projectCollaboration: boolean;    // invite team members
  clientDashboard: boolean;         // client-facing view
  analytics: boolean;               // project analytics
  whiteLabel: boolean;              // remove ModulCA branding

  // Support
  supportLevel: "community" | "email" | "priority";
}

/** ────────────────────────────────────────────────────────────── */
/*  Tier definitions                                              */
/** ────────────────────────────────────────────────────────────── */

export const ACCOUNT_TIERS: AccountTierConfig[] = [
  {
    id: "guest_free",
    label: "Guest",
    labelRo: "Vizitator",
    description: "Try ModulCA without signing up. Limited features.",
    priceMonthly: null,
    priceYearly: null,
    color: "#9CA3AF", // light gray
    features: {
      // Land
      maxTerrainSize: 500,
      customTerrainShape: false,
      importCadastralData: false,
      // Layout
      maxModules: 4,
      allModuleTypes: false,
      customModuleDimensions: false,
      // Preview
      highQualityPreview: false,
      moduleSwap: false,
      // Vision
      styleDirections: 1,
      moodboardPins: 3,
      customStyleUpload: false,
      // Materials
      allMaterials: false,
      customMaterials: false,
      furnitureOverrides: false,
      // Products
      productCatalog: true,
      partnerPricing: false,
      directPurchase: false,
      // Render
      aiRendersPerMonth: 3, // ~3/day via daily limit logic
      maxCostUsdPerImage: 0.005, // only free engines (Pollinations, AI Horde)
      renderResolution: "sd",
      savedRenders: 3,
      // Technical
      allDrawingTypes: false,
      drawingPresentation: false,
      knowledgeBase: false,
      permitTracker: false,
      exportPdf: false,
      exportDwg: false,
      // Walkthrough
      walkthrough: true,
      autoTour: false,
      vrMode: false,
      // Presentation
      presentationTemplates: 0,
      pdfPresentation: false,
      sharableLink: false,
      // Marketplace
      marketplaceBrowse: true,
      marketplaceList: false,
      builderDirectory: false,
      // Projects
      maxProjects: 1,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      // Support
      supportLevel: "community",
    },
  },
  {
    id: "free",
    label: "Explorer",
    labelRo: "Explorator",
    description: "Discover modular construction. Design your first home for free.",
    priceMonthly: null,
    priceYearly: null,
    color: "#6B7280", // gray
    features: {
      // NOTE: Free tier is fully unlocked for demo/MVP phase.
      // Re-enable limits when real billing (Stripe) is connected.
      // Land
      maxTerrainSize: 2000,
      customTerrainShape: true,
      importCadastralData: false,
      // Layout
      maxModules: 12,
      allModuleTypes: true,
      customModuleDimensions: false,
      // Preview
      highQualityPreview: true,
      moduleSwap: true,
      // Vision
      styleDirections: 3,
      moodboardPins: 12,
      customStyleUpload: true,
      // Materials
      allMaterials: true,
      customMaterials: false,
      furnitureOverrides: true,
      // Products
      productCatalog: true,
      partnerPricing: true,
      directPurchase: false,
      // Render
      aiRendersPerMonth: -1, // unlimited for demo
      maxCostUsdPerImage: 0.01, // free tier: only free/near-free engines
      renderResolution: "hd",
      savedRenders: 20,
      // Technical
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: false,
      // Walkthrough
      walkthrough: true,
      autoTour: true,
      vrMode: false,
      // Presentation
      presentationTemplates: 3,
      pdfPresentation: true,
      sharableLink: true,
      // Marketplace
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      // Projects
      maxProjects: 5,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      // Support
      supportLevel: "community",
    },
  },
  {
    id: "premium",
    label: "Premium",
    labelRo: "Premium",
    description: "Full design experience. Everything you need to plan your modular home.",
    priceMonthly: 19,
    priceYearly: 190, // ~17% savings
    color: "#F59E0B", // amber
    features: {
      // Land
      maxTerrainSize: 2000,
      customTerrainShape: true,
      importCadastralData: true,
      // Layout
      maxModules: 12,
      allModuleTypes: true,
      customModuleDimensions: false,
      // Preview
      highQualityPreview: true,
      moduleSwap: true,
      // Vision
      styleDirections: 3,
      moodboardPins: 12,
      customStyleUpload: true,
      // Materials
      allMaterials: true,
      customMaterials: false,
      furnitureOverrides: true,
      // Products
      productCatalog: true,
      partnerPricing: true,
      directPurchase: true,
      // Render
      aiRendersPerMonth: 30,
      maxCostUsdPerImage: 0.05, // premium: mid-tier engines (Stability, Together Kontext)
      renderResolution: "hd",
      savedRenders: 20,
      // Technical
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: false,
      // Walkthrough
      walkthrough: true,
      autoTour: true,
      vrMode: false,
      // Presentation
      presentationTemplates: 3,
      pdfPresentation: true,
      sharableLink: true,
      // Marketplace
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      // Projects
      maxProjects: 5,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      // Support
      supportLevel: "email",
    },
  },
  {
    id: "architect",
    label: "Architect / Builder",
    labelRo: "Arhitect / Constructor",
    description: "Professional toolkit. Manage clients, projects, and collaborate with your team.",
    priceMonthly: 49,
    priceYearly: 490, // ~17% savings
    color: "#1D6B6B", // teal
    features: {
      // Land
      maxTerrainSize: 10000,
      customTerrainShape: true,
      importCadastralData: true,
      // Layout
      maxModules: 50,
      allModuleTypes: true,
      customModuleDimensions: true,
      // Preview
      highQualityPreview: true,
      moduleSwap: true,
      // Vision
      styleDirections: 3,
      moodboardPins: 50,
      customStyleUpload: true,
      // Materials
      allMaterials: true,
      customMaterials: true,
      furnitureOverrides: true,
      // Products
      productCatalog: true,
      partnerPricing: true,
      directPurchase: true,
      // Render
      aiRendersPerMonth: 100,
      maxCostUsdPerImage: 0.10, // architect: all engines including premium
      renderResolution: "4k",
      savedRenders: 100,
      // Technical
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: true,
      // Walkthrough
      walkthrough: true,
      autoTour: true,
      vrMode: true,
      // Presentation
      presentationTemplates: 3,
      pdfPresentation: true,
      sharableLink: true,
      // Marketplace
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      // Projects
      maxProjects: -1, // unlimited
      projectCollaboration: true,
      clientDashboard: true,
      analytics: true,
      whiteLabel: true,
      // Support
      supportLevel: "priority",
    },
  },
];

/** Helper: get tier config by id */
export function getTierConfig(tier: AccountTier): AccountTierConfig {
  return ACCOUNT_TIERS.find((t) => t.id === tier) ?? ACCOUNT_TIERS[0];
}

/** Helper: check if a feature is available for a tier */
export function hasFeature(tier: AccountTier, feature: keyof FeatureAccess): boolean {
  const config = getTierConfig(tier);
  const value = config.features[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0 || value === -1;
  return value !== "community"; // for supportLevel, anything above community
}

/** Features that differ between tiers — for comparison table */
export const FEATURE_COMPARISON_ROWS: {
  category: string;
  features: { label: string; key: keyof FeatureAccess; format?: "boolean" | "number" | "text" }[];
}[] = [
  {
    category: "Design",
    features: [
      { label: "Max modules per project", key: "maxModules", format: "number" },
      { label: "All module types", key: "allModuleTypes" },
      { label: "Custom module dimensions", key: "customModuleDimensions" },
      { label: "Max terrain size (m²)", key: "maxTerrainSize", format: "number" },
      { label: "Cadastral data import", key: "importCadastralData" },
    ],
  },
  {
    category: "Visualization",
    features: [
      { label: "AI renders per month", key: "aiRendersPerMonth", format: "number" },
      { label: "Render resolution", key: "renderResolution", format: "text" },
      { label: "3D Walkthrough", key: "walkthrough" },
      { label: "Auto-tour", key: "autoTour" },
      { label: "VR mode", key: "vrMode" },
    ],
  },
  {
    category: "Technical",
    features: [
      { label: "All drawing types", key: "allDrawingTypes" },
      { label: "Drawing presentation", key: "drawingPresentation" },
      { label: "Permit tracker", key: "permitTracker" },
      { label: "PDF export", key: "exportPdf" },
      { label: "DWG/DXF export", key: "exportDwg" },
    ],
  },
  {
    category: "Presentation",
    features: [
      { label: "Presentation templates", key: "presentationTemplates", format: "number" },
      { label: "PDF book export", key: "pdfPresentation" },
      { label: "Sharable link", key: "sharableLink" },
    ],
  },
  {
    category: "Professional",
    features: [
      { label: "Max projects", key: "maxProjects", format: "number" },
      { label: "Team collaboration", key: "projectCollaboration" },
      { label: "Client dashboard", key: "clientDashboard" },
      { label: "Analytics", key: "analytics" },
      { label: "White-label branding", key: "whiteLabel" },
    ],
  },
];
