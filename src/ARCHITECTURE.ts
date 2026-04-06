/**
 * ModulCA Project Architecture Map
 * ─────────────────────────────────
 * READ THIS FIRST when working on the project.
 * Eliminates exploratory file reads — everything Claude needs to orient.
 *
 * Last updated: 2026-04-04
 * Total files: 98 | Total lines: ~21,600
 */

/* ── Step Flow ─────────────────────────────────────────────── */

export const STEPS = [
  { n: 1,  id: "land",         route: "/project/[id]/land",         component: "features/land/components/LandDesigner.tsx",                  store: "useLandStore",        lines: 580 },
  { n: 2,  id: "design",       route: "/project/[id]/design",       component: "features/design/components/LayoutDesigner.tsx",               store: "useDesignStore",      lines: 350 },
  { n: 3,  id: "output",       route: "/project/[id]/output",       component: "features/preview/components/PreviewPage.tsx",                 store: "useDesignStore",      lines: 280 },
  { n: 4,  id: "style",        route: "/project/[id]/style",        component: "features/design/components/style/StylePage.tsx",              store: "useDesignStore",      lines: 437 },
  { n: 5,  id: "configure",    route: "/project/[id]/configure",    component: "features/design/components/configure/ConfigurePage.tsx",      store: "useDesignStore",      lines: 385 },
  { n: 6,  id: "visualize",    route: "/project/[id]/visualize",    component: "features/design/components/visualize/VisualizePage.tsx",      store: "useDesignStore",      lines: 390 },
  { n: 7,  id: "render",       route: "/project/[id]/render",       component: "features/design/components/render/RenderPage.tsx",            store: "useDesignStore",      lines: 1113 },
  { n: 8,  id: "technical",    route: "/project/[id]/technical",    component: "features/design/components/technical/TechnicalPage.tsx",      store: "useDesignStore",      lines: 710 },
  { n: 9,  id: "walkthrough",  route: "/project/[id]/walkthrough",  component: "features/design/components/walkthrough/WalkthroughPage.tsx",  store: "useDesignStore",      lines: 751 },
  { n: 10, id: "products",     route: "/project/[id]/products",     component: "features/design/components/products/ProductsPage.tsx",        store: "useDesignStore",      lines: 879 },
  { n: 11, id: "finalize",     route: "/project/[id]/finalize",     component: "features/design/components/FinalizePage.tsx",                 store: "useDesignStore",      lines: 200 },
  { n: 12, id: "presentation", route: "/project/[id]/presentation", component: "features/presentation/components/PresentationPage.tsx",       store: "useDesignStore",      lines: 900 },
  { n: 13, id: "marketplace",  route: "/project/[id]/marketplace",  component: "features/marketplace/components/MarketplacePage.tsx",         store: "useMarketplaceStore", lines: 1055 },
] as const;

/* ── Stores ────────────────────────────────────────────────── */

export const STORES = {
  useLandStore:        { file: "features/land/store.ts",        lines: 250, keys: "gridCells, gridRotation, mapCenter, polygon, phase" },
  useDesignStore:      { file: "features/design/store.ts",      lines: 399, keys: "modules, finishLevel, selectedModule, styleDirection, moodboardPins, savedRenders, moduleFixtures, wallConfigs, furnitureOverrides" },
  useMarketplaceStore: { file: "features/marketplace/store.ts", lines: 180, keys: "terrains, filters, favorites, selectedTerrain, landMode" },
  useAuthStore:        { file: "features/auth/store.ts",        lines: 210, keys: "isAuthenticated, userId, userName, userEmail, userTier, signUp(), signIn(), signInWithGoogle(), signOut(), canAccess()" },
} as const;

/* ── Split Files (completed refactors) ─────────────────────── */

export const SPLIT_FILES = {
  "TechnicalDrawing": { shell: "technical/TechnicalDrawing.tsx (173 lines)", parts: "technical/drawings/{FloorPlan,Section,Elevation,WallDetail,Mep,Foundation}Drawing.tsx + drawingConstants.ts" },
  "ModuleScene3D":    { shell: "visualize/ModuleScene3D.tsx (310 lines)",    parts: "visualize/scene/{WallBuilder,FurnitureRenderer,SceneHelpers}.tsx + constants.ts" },
  "RenderPage":       { shell: "render/RenderPage.tsx (860 lines)",          parts: "render/{renderConstants.ts, useRenderEngine.ts, RenderGallery.tsx}" },
} as const;

/* ── Remaining Large Files (>500 lines) ───────────────────── */

export const LARGE_FILES = {
  "ProductsPage.tsx":      { lines: 879,  path: "features/design/components/products/ProductsPage.tsx" },
  "WalkthroughPage.tsx":   { lines: 751,  path: "features/design/components/walkthrough/WalkthroughPage.tsx" },
  "TechnicalPage.tsx":     { lines: 710,  path: "features/design/components/technical/TechnicalPage.tsx" },
} as const;

/* ── Shared Dependencies ──────────────────────────────────── */

export const SHARED = {
  types:      "shared/types/index.ts — MODULE_TYPES, FINISH_LEVELS, BUILDING_PRESETS, SHARED_WALL_DISCOUNT, DESIGN_FEE_PERCENTAGE",
  layouts:    "features/design/layouts.ts — getPresetsForType(), FLOOR_MATERIALS, WALL_MATERIALS, getPreset()",
  styles:     "features/design/styles.ts — getStyleDirection(), FURNITURE_COLORS",
  module3d:   "features/design/components/shared/module3d.tsx — StaticFurniturePiece, ModuleBox, getPresetOverrides()",
  stepNav:    "features/design/components/shared/StepNav.tsx — step navigation bar",
  authTypes:  "features/auth/types.ts — ACCOUNT_TIERS, FeatureAccess, getTierConfig(), hasFeature()",
  authForm:   "features/auth/components/AuthForm.tsx — shared login/register form",
  projectSvc: "features/auth/projectService.ts — CRUD projects (Supabase or localStorage)",
  supabase:   "shared/lib/supabase.ts — Supabase client singleton, isDemoMode, getSupabase()",
  featureGate:"shared/components/FeatureGate.tsx — tier-based feature wrapper",
  authGuard:  "shared/components/AuthGuard.tsx — route protection (soft/hard)",
  slidePanel: "shared/components/SlideOverPanel.tsx — reusable slide-over panel",
  config:     "shared/config/index.ts — MAPBOX_TOKEN, SUPABASE_URL",
} as const;

/* ── Hydration Pattern (all step pages use this) ──────────── */
// useEffect(() => {
//   if (modules.length > 0) return;
//   loadFromLocalStorage();
//   const loaded = useDesignStore.getState().modules;
//   if (loaded.length === 0 && gridCells.some(c => c.moduleType !== null)) {
//     setModulesFromGrid(gridCells, gridRotation);
//   }
// }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

/* ── Account Tiers ─────────────────────────────────────────── */
// free:      Explorer  — 4 modules, 5 renders/mo, 1 project, basic features
// premium:   Premium   — €19/mo, 12 modules, 30 renders/mo, 5 projects, full features
// architect: Architect — €49/mo, 50 modules, 100 renders/mo, unlimited projects, DWG, collaboration, white-label

/* ── Tech Stack ────────────────────────────────────────────── */
// Next.js 16.2.1 (App Router, output: "export" for GitHub Pages)
// React 19 | Zustand 5 | Three.js 0.183 | @react-three/fiber+drei
// Tailwind 3.4 | Mapbox GL 3.20 | Konva 10.2 | @react-pdf/renderer 4.3
// TypeScript 5 strict | Prisma 5.22 (not yet active) | NextAuth 5 beta (disabled)

/* ── TODO: FeatureGate wiring (Phase 2E) ──────────────────── */
// Priority gates to add next session:
// 1. RenderPage: limit aiRendersPerMonth, renderResolution per tier
// 2. TechnicalPage: gate permitTracker, drawingPresentation, exportPdf behind tier
// 3. WalkthroughPage: gate autoTour, gaussian behind tier
// 4. PresentationPage: gate presentationTemplates count, pdfPresentation, sharableLink
// 5. MarketplacePage: gate marketplaceList behind tier
// Pattern: wrap feature UI with <FeatureGate requires="featureKey">...</FeatureGate>

/* ── Naming Conventions ───────────────────────────────────── */
// Components: PascalCase.tsx | Stores: camelCase store.ts | Types: camelCase types.ts
// Routes: kebab-case | CSS: Tailwind utility classes | Colors: brand-teal-800, brand-amber-500
// Module IDs: bedroom, kitchen, bathroom, living, office, storage, hallway, terrace
