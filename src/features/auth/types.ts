/**
 * ModulCA Account Architecture
 * ─────────────────────────────
 * Five tiers with progressive feature access:
 *   1. Guest (Visitor) — browse without account, very limited
 *   2. Free (Explorer) — registered, basic features (3-month beta promo → Premium)
 *   3. Premium          — €29/mo, full individual experience
 *   4. Architect         — €79/mo, professional tools + team collaboration
 *   5. Constructor       — €149/mo, enterprise: unlimited, white-label, API
 *
 * Beta promotion (until ~July 2026):
 *   Free accounts get Premium-level access for 3 months after registration.
 *   After 3 months, they revert to standard Free tier limits.
 */

export type AccountTier = "guest_free" | "free" | "premium" | "architect" | "constructor";

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
  styleDirections: number;          // number of style presets (-1 = unlimited)
  moodboardPins: number;            // max moodboard images (-1 = unlimited)
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
  aiRendersPerMonth: number;        // monthly AI render quota (-1 = unlimited)
  maxCostUsdPerImage: number;       // max cost per single render (USD) — controls which engines are allowed
  renderResolution: "sd" | "hd" | "4k";
  savedRenders: number;             // max saved renders (-1 = unlimited)

  // Step 8 — Technical
  allDrawingTypes: boolean;         // all 6 drawing types
  drawingPresentation: boolean;     // fullscreen slideshow
  knowledgeBase: boolean;           // construction manual
  permitTracker: boolean;           // building permit tracker
  exportPdf: boolean;               // PDF export
  exportDwg: boolean;               // DWG/DXF export (future)

  // Knowledge Library & AI Consultant
  knowledgeArticlesFull: boolean;   // full article content (vs. truncated)
  knowledgeProArticles: boolean;    // access to pro-only articles
  knowledgeRegions: number;         // number of country regulations (-1 = all)
  aiConsultantTier: "free" | "premium" | "architect"; // AI quality level
  aiConsultantHistory: number;      // chat messages kept in context

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
  maxProjects: number;              // total saved projects (-1 = unlimited)
  projectCollaboration: boolean;    // invite team members
  clientDashboard: boolean;         // client-facing view
  analytics: boolean;               // project analytics
  whiteLabel: boolean;              // remove ModulCA branding

  // Support
  supportLevel: "community" | "email" | "priority" | "dedicated";
}

/** ────────────────────────────────────────────────────────────── */
/*  Tier definitions                                              */
/** ────────────────────────────────────────────────────────────── */

export const ACCOUNT_TIERS: AccountTierConfig[] = [
  /* ── 1. Guest / Visitor ── */
  {
    id: "guest_free",
    label: "Guest",
    labelRo: "Vizitator",
    description: "Try ModulCA without signing up. Limited features.",
    priceMonthly: null,
    priceYearly: null,
    color: "#9CA3AF",
    features: {
      maxTerrainSize: 500,
      customTerrainShape: false,
      importCadastralData: false,
      maxModules: 4,
      allModuleTypes: false,
      customModuleDimensions: false,
      highQualityPreview: false,
      moduleSwap: false,
      styleDirections: 1,
      moodboardPins: 3,
      customStyleUpload: false,
      allMaterials: false,
      customMaterials: false,
      furnitureOverrides: false,
      productCatalog: true,
      partnerPricing: false,
      directPurchase: false,
      aiRendersPerMonth: 3,
      maxCostUsdPerImage: 0.005,
      renderResolution: "sd",
      savedRenders: 3,
      allDrawingTypes: false,
      drawingPresentation: false,
      knowledgeBase: false,
      permitTracker: false,
      exportPdf: false,
      exportDwg: false,
      knowledgeArticlesFull: false,
      knowledgeProArticles: false,
      knowledgeRegions: 0,
      aiConsultantTier: "free",
      aiConsultantHistory: 5,
      walkthrough: true,
      autoTour: false,
      vrMode: false,
      presentationTemplates: 0,
      pdfPresentation: false,
      sharableLink: false,
      marketplaceBrowse: true,
      marketplaceList: false,
      builderDirectory: false,
      maxProjects: 1,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      supportLevel: "community",
    },
  },

  /* ── 2. Free / Explorer ── */
  {
    id: "free",
    label: "Explorer",
    labelRo: "Explorator",
    description: "Design your first modular home for free. Upgrade anytime.",
    priceMonthly: null,
    priceYearly: null,
    color: "#6B7280",
    features: {
      // Post-beta limits (during beta promo, free users get Premium features)
      maxTerrainSize: 1000,
      customTerrainShape: false,
      importCadastralData: false,
      maxModules: 6,
      allModuleTypes: true,
      customModuleDimensions: false,
      highQualityPreview: true,
      moduleSwap: true,
      styleDirections: 2,
      moodboardPins: 6,
      customStyleUpload: false,
      allMaterials: true,
      customMaterials: false,
      furnitureOverrides: true,
      productCatalog: true,
      partnerPricing: false,
      directPurchase: false,
      aiRendersPerMonth: 5,
      maxCostUsdPerImage: 0.005,
      renderResolution: "sd",
      savedRenders: 10,
      allDrawingTypes: false,
      drawingPresentation: false,
      knowledgeBase: true,
      permitTracker: false,
      exportPdf: false,
      exportDwg: false,
      knowledgeArticlesFull: false,
      knowledgeProArticles: false,
      knowledgeRegions: 1,
      aiConsultantTier: "free",
      aiConsultantHistory: 10,
      walkthrough: true,
      autoTour: false,
      vrMode: false,
      presentationTemplates: 1,
      pdfPresentation: false,
      sharableLink: false,
      marketplaceBrowse: true,
      marketplaceList: false,
      builderDirectory: false,
      maxProjects: 2,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      supportLevel: "community",
    },
  },

  /* ── 3. Premium — €29/month ── */
  {
    id: "premium",
    label: "Premium",
    labelRo: "Premium",
    description: "Full design experience. Everything to plan your modular home.",
    priceMonthly: 29,
    priceYearly: 290, // ~17% savings (2 months free)
    color: "#F59E0B",
    features: {
      maxTerrainSize: 5000,
      customTerrainShape: true,
      importCadastralData: true,
      maxModules: 12,
      allModuleTypes: true,
      customModuleDimensions: false,
      highQualityPreview: true,
      moduleSwap: true,
      styleDirections: 5,
      moodboardPins: 20,
      customStyleUpload: true,
      allMaterials: true,
      customMaterials: false,
      furnitureOverrides: true,
      productCatalog: true,
      partnerPricing: true,
      directPurchase: true,
      aiRendersPerMonth: 50,
      maxCostUsdPerImage: 0.05,
      renderResolution: "hd",
      savedRenders: 30,
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: false,
      knowledgeArticlesFull: true,
      knowledgeProArticles: true,
      knowledgeRegions: 3,
      aiConsultantTier: "premium",
      aiConsultantHistory: 20,
      walkthrough: true,
      autoTour: true,
      vrMode: false,
      presentationTemplates: 3,
      pdfPresentation: true,
      sharableLink: true,
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      maxProjects: 10,
      projectCollaboration: false,
      clientDashboard: false,
      analytics: false,
      whiteLabel: false,
      supportLevel: "email",
    },
  },

  /* ── 4. Architect — €79/month ── */
  {
    id: "architect",
    label: "Architect",
    labelRo: "Arhitect",
    description: "Professional toolkit. Manage clients, projects, and collaborate.",
    priceMonthly: 79,
    priceYearly: 790, // ~17% savings
    color: "#1D6B6B",
    features: {
      maxTerrainSize: 10000,
      customTerrainShape: true,
      importCadastralData: true,
      maxModules: 50,
      allModuleTypes: true,
      customModuleDimensions: true,
      highQualityPreview: true,
      moduleSwap: true,
      styleDirections: -1, // unlimited
      moodboardPins: 50,
      customStyleUpload: true,
      allMaterials: true,
      customMaterials: true,
      furnitureOverrides: true,
      productCatalog: true,
      partnerPricing: true,
      directPurchase: true,
      aiRendersPerMonth: 200,
      maxCostUsdPerImage: 0.10,
      renderResolution: "4k",
      savedRenders: 100,
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: true,
      knowledgeArticlesFull: true,
      knowledgeProArticles: true,
      knowledgeRegions: -1,
      aiConsultantTier: "architect",
      aiConsultantHistory: 50,
      walkthrough: true,
      autoTour: true,
      vrMode: true,
      presentationTemplates: 5,
      pdfPresentation: true,
      sharableLink: true,
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      maxProjects: -1, // unlimited
      projectCollaboration: true,
      clientDashboard: true,
      analytics: true,
      whiteLabel: false,
      supportLevel: "priority",
    },
  },

  /* ── 5. Constructor — €149/month ── */
  {
    id: "constructor",
    label: "Constructor",
    labelRo: "Constructor",
    description: "Enterprise solution. Unlimited projects, white-label, dedicated support.",
    priceMonthly: 149,
    priceYearly: 1490, // ~17% savings
    color: "#7C3AED",
    features: {
      maxTerrainSize: 50000,
      customTerrainShape: true,
      importCadastralData: true,
      maxModules: 200,
      allModuleTypes: true,
      customModuleDimensions: true,
      highQualityPreview: true,
      moduleSwap: true,
      styleDirections: -1,
      moodboardPins: -1,
      customStyleUpload: true,
      allMaterials: true,
      customMaterials: true,
      furnitureOverrides: true,
      productCatalog: true,
      partnerPricing: true,
      directPurchase: true,
      aiRendersPerMonth: -1, // unlimited
      maxCostUsdPerImage: 0.15,
      renderResolution: "4k",
      savedRenders: -1,
      allDrawingTypes: true,
      drawingPresentation: true,
      knowledgeBase: true,
      permitTracker: true,
      exportPdf: true,
      exportDwg: true,
      knowledgeArticlesFull: true,
      knowledgeProArticles: true,
      knowledgeRegions: -1,
      aiConsultantTier: "architect",
      aiConsultantHistory: -1,
      walkthrough: true,
      autoTour: true,
      vrMode: true,
      presentationTemplates: 10,
      pdfPresentation: true,
      sharableLink: true,
      marketplaceBrowse: true,
      marketplaceList: true,
      builderDirectory: true,
      maxProjects: -1,
      projectCollaboration: true,
      clientDashboard: true,
      analytics: true,
      whiteLabel: true,
      supportLevel: "dedicated",
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

/**
 * Beta promotion: free accounts get Premium-level access for 3 months.
 * Check if a free account qualifies based on created_at timestamp.
 */
export function isBetaPromoActive(tier: AccountTier, createdAt: string | Date | null): boolean {
  if (tier !== "free" || !createdAt) return false;
  const created = new Date(createdAt);
  const promoEnd = new Date(created);
  promoEnd.setMonth(promoEnd.getMonth() + 3);
  return new Date() < promoEnd;
}

/**
 * Get the effective tier considering beta promo.
 * Free users within 3 months of registration → Premium features.
 */
export function getEffectiveTier(tier: AccountTier, createdAt: string | Date | null): AccountTier {
  if (isBetaPromoActive(tier, createdAt)) return "premium";
  return tier;
}

/**
 * Get remaining beta promo days (0 if expired or not eligible).
 */
export function getBetaPromoDaysLeft(tier: AccountTier, createdAt: string | Date | null): number {
  if (tier !== "free" || !createdAt) return 0;
  const created = new Date(createdAt);
  const promoEnd = new Date(created);
  promoEnd.setMonth(promoEnd.getMonth() + 3);
  const diff = promoEnd.getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 86400_000) : 0;
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
      { label: "Max terrain size (m\u00B2)", key: "maxTerrainSize", format: "number" },
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
    category: "Knowledge & AI",
    features: [
      { label: "Full article content", key: "knowledgeArticlesFull" },
      { label: "Pro-only articles (regulations)", key: "knowledgeProArticles" },
      { label: "Country regulations", key: "knowledgeRegions", format: "number" },
      { label: "AI consultant quality", key: "aiConsultantTier", format: "text" },
      { label: "AI chat history depth", key: "aiConsultantHistory", format: "number" },
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
