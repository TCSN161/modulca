# MCA-SPEC-EXPRESS-MODE-v1 — Express mode (final spec after audit)

**Status**: Spec v1 (Chat 8 Express, session `8.01.Express_Wizard-Audit-Spec_20261126`). Supersedes [[MCA-SPEC-EXPRESS-MODE-v0]].
**Owner**: Chat 8 Express
**Audit basis**: master @ `f8efeb7` (2026-11-26). Read-only audit, no code changed.
**Write paths (Chat 8)**: `src/features/express/**`, `src/app/api/express/**`, `src/app/(app)/express/**`, `tests/e2e/express*`, `docs/MCA-SPEC-EXPRESS-*`

---

## 0. TL;DR

1. **About 70% of Express already exists.** `src/features/wizard/` holds a pure auto-configurator: `generateDesign(WizardInput) → GeneratedDesign` and `useWizardStore.applyToProject()`, which already fills the design store (modules, finish, style, materials). The `/wizard` page uses it today. Express = **Claude brief → `WizardInput` → the existing generator** + renders + presentation.
2. **The MVP needs no blocking interface from other chats.** Everything can go through interfaces that are already public:
   - `useWizardStore` actions;
   - `useDesignStore` setters;
   - `useLandStore` setters;
   - `saveProject()`;
   - the HTTP `POST /api/ai-render`;
   - the existing `/project/[id]/presentation` page, which reads the filled stores.

   The one hard dependency is Chat 4's in-flight **SEC-02**: a server-side tier plus a per-user quota.
3. **The state is client-side only.** It lives in Zustand + localStorage, and Supabase holds a `projects.data` JSON blob. So the **MVP orchestrator runs in the browser**. Only the brief (the Claude call) runs on the server. A headless, server-side pipeline is post-MVP, and it needs the pure-function interfaces in §5.
4. **The audit found 4 bugs** (§8), which go to MAIN for routing. The biggest one: the presentation and the PDF **never show the selected products**. They read `item.id`, but the Products page saves `productId`.

---

## 1. Audit findings

### 1.1 Wizard steps: data, setter, gap, owner

There are 14 steps, per `StepNav.tsx`. `src/ARCHITECTURE.ts` is stale: it dates from April and lists 13 steps.

| # | Step (slug) | Store / persistence | Public way to fill it programmatically | Gap | Module owner |
|---|---|---|---|---|---|
| 1 | Choose (`choose`) | `useMarketplaceStore` (memory only, demo terrains) | `selectTerrain(id)`, `setFilter()` | Only demo terrains. Nothing to fill for Express, so it is **skipped** | unassigned → MAIN |
| 2 | Land (`land`) | `useLandStore` (memory only) | `setMapCenter`, `setMapZoom`, `addPolygonPoint`×N, `setGridCells`, `setGridRotation`, `setPhase` | No `setPolygon(points)` (only point-by-point). **Never persisted**: `FinalizePage` reads `localStorage["modulca-land"]`, but nothing writes it (BUG-X02). No geocoder: county → lat/lng has to be an Express-owned lookup table | unassigned → MAIN |
| 3 | Design (`design`) | `useDesignStore.modules` → `localStorage["modulca-design"]` (auto-save on change) | `useWizardStore.setInput()` → `generate()` → `applyToProject()`, or directly `useDesignStore.setModulesFromGrid(cells, rot)` | `generateDesign` sizes the house from **household size only**, so a target area/module count is ignored. `floors: 2` is typed but not implemented (no multi-level in the design store). `applyToProject` does not mirror `gridCells` into the land store | wizard/design: unassigned → MAIN |
| 4 | Preview (`output`) | derived from `modules` | — (nothing to fill) | — | — |
| 5 | Style (`style`) | `styleDirection`, `styleDescription`, `stylePhoto`, `moodboardPins` | `setStyleDirection`, `setStyleDescription`, `applyStyleToModules`, `addMoodboardPin` | None. 8 styles are available (§1.4) | design |
| 6 | Configure (`configure`) | `modules[].layoutPreset/floorFinish/wallColor/wallConfigs/wallThicknessConfigs`, `moduleFixtures` | `updateModuleConfig`, `updateWallConfig`, `updateWallThickness`, `setModuleFixtures` | None. Smart wall defaults are computed in `setModulesFromGrid`, and the MVP accepts the defaults | design |
| 7 | Visualize (`visualize`) | derived (R3F scene) | — | — | Chat 3 (`*Three*`) |
| 8 | Render (`render`) | `savedRenders[]` (base64 data URLs in localStorage and `projects.data`) | `POST /api/ai-render` (HTTP, returns image bytes with an `X-AI-Engine` header) → `addSavedRender(SavedRender)` | The **prompt builder is buried in a `useEffect`** in `RenderPage.tsx:164-222`. The fetch + Pollinations browser fallback is inside the hook `useRenderEngine`, which is not callable outside React. img2img needs a mounted R3F canvas capture, so the MVP is text2img only. The tier is sent by the client (SEC-02) | Chat 3 |
| 9 | Technical (`technical`) | derived from `modules` | — | PermitTracker is optional and not needed | Chat 5 |
| 10 | Walkthrough (`walkthrough`) | derived | — | — | Chat 3 |
| 11 | Products (`products`) | `localStorage["modulca-selected-products"]` = `{productId, quantity}[]`, **inside the component** | **None.** The state is private to `ProductsPage.tsx` | Needs an exported selection API. Products are **not** included in any `saveProject` payload, so they are lost on cloud save (BUG-X03) | design: unassigned → MAIN |
| 12 | Finalize (`finalize`) | `saveProject(userId, {id, name, data})` + `localStorage["modulca-active-project"]` | `saveProject()` is public, but the **snapshot assembly is duplicated** in 4 places: `FinalizePage`, `useSaveDesign`, `CloudSaveButton`, `CloudSyncProvider` | Needs a single `getProjectSnapshot()` | auth/projectService (shared): MAIN |
| 13 | Present (`presentation`) | reads the stores through `useSlideData()` (hook) | **Navigate to `/project/[id]/presentation`**: the page renders from the filled stores, and its PDF button works | `useSlideData` is a hook. `PresentationDocument` is not exported. `PdfDownloadButton` triggers a DOM download, so there is no headless `Promise<Blob>` | Chat 3 (presentation slide engine) |
| 14 | Architect (`architect`) | `useArchitectStore` | — | Not part of Express | — |
| (side) | Consultant | API `src/app/api/consultant` | — | Post-MVP: "explain this design" | Chat 2 |

**Persistence model (important).** The design state is **one global localStorage blob** (`modulca-design`), not one blob per project. A project is bound through `modulca-active-project` and hydrated from the cloud by `useLoadProject` in `useSaveDesign.ts`. `/project/new` creates a project with `data: {preset}` only. Express therefore has to do two things: (a) create the project with the full snapshot, and (b) set `modulca-active-project` before it navigates. MAIN has to sanction (b) as an interface, or `saveActiveProject()` in §5 can cover it.

### 1.2 Renders

- `POST /api/ai-render` takes `{prompt, width, height, seed, engine?, baseImage?, tier, maxCostUsd}` and returns **image bytes**, plus the headers `X-AI-Engine`, `X-AI-Cost-Usd` and `X-AI-Latency-Ms`. On failure it returns 503 "All AI engines busy".
- The fallback chains are chosen by `tier`:
  - `FALLBACK_FREE`: cloudflare → pollinations → huggingface → gemini → together → ai-horde;
  - `FALLBACK_PREMIUM` and `FALLBACK_ARCHITECT`;
  - `IMG2IMG_FALLBACK` when there is a `baseImage`.

  `creditManager` gates every engine by tier, band, monthly cap and credits.
- Reality on 2026-11-26 (see Chat 3's E1/E2 hand-over): **only Cloudflare renders for free server-side** (~2.4 s). Pollinations anonymous allows 1 image per 45 s per IP, and it is the real overflow path through the **browser** fallback in `useRenderEngine.ts`. The recommended quota is **5 AI renders per user per day**.
- **SEC-02 (Chat 4, in flight):** the tier is currently trusted from the client body. The server-side tier helper and the per-user quota counter land in Chat 4's session `b-sec02-quota`. Express **must not** send `tier` on its own authority. Once SEC-02 is in, it relies on the server derivation.
- Consequence for Express: within the free tier, 3 renders per run is the realistic ceiling, and even that uses 3 of the 5 daily renders. 8–10 renders need a paid tier with funded engines.

### 1.3 Presentation and PDF

- `PresentationPage.tsx` (732 lines) has 13+ slide types. `useSlideData()` aggregates the data from the design and land stores and localStorage.
- `PdfGenerator.tsx` (726 lines) uses `@react-pdf/renderer` (`pdf(doc).toBlob()`). The `PresentationDocument` component is internal (not exported). `PdfDownloadButton` is the default export and does the DOM download.
- `features/output/` is **empty** (`types.ts` = `export {}`).
- **Can it run without the UI?** The rendering logic is pure React-PDF, so yes in principle, but it is not exposed. For the MVP, Express navigates to the presentation page, which already works from the filled stores. A headless or server PDF needs the §5 interfaces from Chat 3.

### 1.4 What the AI can choose from

| Catalog | Source | Size | Keys the AI uses |
|---|---|---|---|
| Styles | `StyleDirectionId` (`features/design/store.ts`), `STYLE_DIRECTIONS` (`features/design/styles.ts`) | **8** | `scandinavian`, `industrial`, `warm-contemporary`, `mediterranean`, `japanese-wabi-sabi`, `traditional-romanian`, `biophilic-organic`, `eclectic-mixed` |
| Finish level | `FINISH_LEVELS` (`shared/types`) | 3 | `basic` €6,010/module · `standard` €9,300 · `premium` €12,600 |
| Module types | `MODULE_TYPES` | 8 | bedroom, kitchen, bathroom, living, office, storage, hallway, terrace |
| Building presets | `BUILDING_PRESETS` | n | `house-compact`, … |
| Products | `PRODUCT_CATALOG` (`src/assets/registry.ts`, public API `@/assets`) | **36** (finishing / furniture / plumbing) | `getProductsByStyle(styleId)`, `getProductsByRoom(roomType)`, `getProductsByCategory` |
| Style hero images | `STYLE_HERO_IMAGES` | 1 per style | moodboard pins |
| Floor / wall materials | `FLOOR_MATERIALS`, `WALL_MATERIALS` (`features/design/layouts.ts`), style → material map in the design store | — | applied by `applyStyleToModules` |

**Rule:** Claude never invents IDs. The brief schema uses **enums generated from these constants**. Products are chosen deterministically by Express code (`getProductsByStyle ∩ getProductsByRoom`, filtered by finish budget), not by Claude.

**Geometry:** 1 module = 3×3 m exterior = **9 m² gross**, with `MODULE_INTERIOR_AREA` = 6.25 m² usable. The tier module caps (`maxModules` in `auth/types.ts`) are guest 4, free 6, premium 12, architect 50 and constructor 200. So "120 m²" means 13–14 modules, which is above the free and Premium caps. The brief normaliser clamps to the tier cap and tells the user.

### 1.5 Playwright

- The config lives at `tests/e2e/playwright.config.ts`, **not** at the repo root. It defines two mobile projects (iPhone 13 Pro, Pixel 5), and `baseURL` defaults to **production** `https://www.modulca.eu`. There is one spec, `mobile-smoke.spec.ts`. The scripts are `test:mobile` and `test:mobile:local`.
- Golden briefs need:
  - a desktop project;
  - a `BASE_URL` pointing to local or a Vercel preview, never production;
  - a **render mock**, so CI does not burn the CF quota (see the §5 Chat 3 row);
  - a test account (Chat 4's comp script `scripts/stripe-comp-account.mjs`).

---

## 2. Final question list (MVP = 7 questions + free text)

Each answer maps 1:1 to an `ExpressBrief` field. "Alegeți voi" / "You choose" is always allowed and sets the field to `null`, so the defaults table decides.

| # | RO | EN | Field | Input | Default when skipped |
|---|---|---|---|---|---|
| Q1 | Unde construiți? (județ / localitate) și cât teren aveți (m²)? | Where are you building (county / town), and how big is the plot (m²)? | `site.county`, `site.town`, `site.plotAreaSqm`, `site.setting` | county select (42) + town text + number | Cluj, 600 m², `periurban` |
| Q2 | Câte persoane vor locui în casă? Aveți nevoie de birou? | How many people will live there? Do you need a home office? | `household.size`, `household.wantsOffice` | 1–8 + toggle | 3, office if size ≤ 2 |
| Q3 | Ce suprafață vă doriți și ce buget aveți? | What floor area do you want, and what is your budget? | `size.targetAreaSqm`, `budget.band` | slider 27–180 m² + 3 bands (`tight` <€80k · `moderate` €80–150k · `generous` >€150k) | from household · `moderate` |
| Q4 | Ce stil vă place? | Which style do you like? | `style.id` (+ optional `style.notes`) | 8 style cards with hero images | `warm-contemporary` |
| Q5 | Doriți terasă? (Etajul / mansarda vin în curând.) | Do you want a terrace? (Upper floor / attic coming soon.) | `features.terrace`, `features.levels` | toggle; levels shown disabled with "în curând / coming soon" | terrace yes, levels `P` |
| Q6 | Nivel de finisaje: economic, standard sau premium? | Finish level: economy, standard or premium? | `finishLevel` | 3 cards with €/module | from budget band |
| Q7 | Câte randări și ce vederi? | How many renders, and which views? | `renders.count`, `renders.views[]` | 3 / 5 / 8 / 10 (capped by tier) + checkboxes: exterior zi / exterior apus / living / bucătărie / dormitor | 3 · `[exterior-day, living, kitchen]` |
| Q8 | Altceva ce ar trebui să știm? | Anything else we should know? | `notes` | free text, max 500 characters | — |

**Single-prompt mode** (post-MVP UI, but the same API): *"Casă 120 mp, 3 dormitoare, stil scandinav, lângă Cluj, buget 120k €, 8 randări"* → the same `ExpressBrief`. Claude fills what is stated and sets the rest to `null`; the normaliser applies the defaults.

Out of the MVP (shown as "în curând" / "coming soon"): P+1 / P+M, garage, reference-image upload, facade/roof/window product preferences. The design store and generator have no data model for these yet.

---

## 3. `ExpressBrief` type

File: `src/features/express/types.ts`. The zod schema in `brief.schema.ts` is the single source of truth. The TS type is `z.infer<>`, and the same JSON Schema is passed to Claude as the tool `input_schema`.

```ts
import type { StyleDirectionId, FinishLevelId } from "@/features/design/store";

export type ExpressRenderView =
  | "exterior-day" | "exterior-dusk" | "living" | "kitchen" | "bedroom" | "bathroom" | "terrace";

export type BudgetBand = "tight" | "moderate" | "generous";   // = WizardInput.budgetLevel

export interface ExpressBrief {
  version: 1;
  locale: "ro" | "en" | "nl";
  source: "questions" | "prompt" | "golden";

  site: {
    county: string | null;            // ISO 3166-2:RO code, e.g. "CJ"; validated against the Express county table
    town: string | null;
    setting: "urban" | "periurban" | "rural" | null;
    plotAreaSqm: number | null;       // 100..20000
  };
  household: {
    size: number;                     // 1..8 (required: the default is applied before validation)
    wantsOffice: boolean | null;
    bedroomsRequested: number | null; // from the free prompt ("3 dormitoare"); overrides the generator if set
  };
  size: {
    targetAreaSqm: number | null;     // gross; → targetModuleCount = round(area / 9)
    targetModuleCount: number | null; // derived by the normaliser; clamped to the tier cap
  };
  budget: { band: BudgetBand | null; amountEur: number | null };
  style: { id: NonNullable<StyleDirectionId> | null; notes: string | null };
  finishLevel: FinishLevelId | null;
  features: { terrace: boolean | null; levels: "P" };   // "P+1" | "P+M" added once the design store supports levels
  renders: { count: 3 | 5 | 8 | 10; views: ExpressRenderView[] };
  notes: string | null;

  /** Filled by the normaliser, not by Claude */
  _resolved?: {
    clampedBy?: "tier-module-cap" | "plot-area";
    warnings: string[];               // i18n keys, shown to the user
  };
}

/** Express job state: persisted in localStorage under "modulca-express-job" (Express-owned key) */
export type ExpressStage =
  | "brief" | "design" | "style" | "land" | "products" | "save" | "renders" | "presentation" | "done" | "failed";

export interface ExpressJob {
  id: string;                         // uuid
  brief: ExpressBrief;
  projectId: string | null;
  stage: ExpressStage;
  renders: { view: ExpressRenderView; status: "pending" | "ok" | "failed"; engine?: string; renderId?: string; error?: string }[];
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
}
```

**Normaliser** (`normalizeBrief(raw, ctx: {tier, limits})`, pure, unit-tested):
1. Applies the defaults table (§2).
2. `targetModuleCount = clamp(round(targetAreaSqm/9), 3, tierModuleCap)`.
3. Checks the footprint against the plot (≤ 40% of `plotAreaSqm`, a CATUC-style placeholder until Chat 2 provides the rule).
4. Fills `finishLevel` from the budget band when it is null.
5. Caps `renders.count` to the tier limit.
6. Records warnings for every clamp.

---

## 4. Per-step filling plan (MVP orchestrator, client-side)

`src/features/express/orchestrator.ts` is a plain async function, not a hook. It writes `ExpressJob` progress after each stage, so a reload can resume, and a failed stage never loses the earlier ones.

| Stage | Steps filled | Calls (all already public unless marked ★ = §5 interface; MVP has a fallback) |
|---|---|---|
| `brief` | — | `POST /api/express/brief` {answers or prompt} → server: Claude structured output (tool use with `input_schema` = the brief JSON Schema) → zod validate → `normalizeBrief` → `ExpressBrief`. One retry with the validation errors fed back. |
| `design` | 3, 4, 6, 7, 9, 10 | `useWizardStore.getState().setInput(briefToWizardInput(brief))` → `.generate()` → `.applyToProject()`. ★ `targetModuleCount` / `bedroomsRequested` are honoured only after the wizard interface lands. Until then the MVP uses household size only and shows a warning when the area differs by more than 20%. |
| `style` | 5 | `setStyleDescription(brief.style.notes)`; `addMoodboardPin({source:"curated", imageUrl: STYLE_HERO_IMAGES[id].url, …})`. Style and materials are already applied by `applyToProject`. |
| `land` | 2 | `setMapCenter(COUNTY_CENTROIDS[county])` (Express-owned table); `clearPolygon()` + `addPolygonPoint` ×4 (a square of `sqrt(plotAreaSqm)`, metres → lat/lng); `setGridCells(design.modules → GridCell[])`; `setGridRotation(0)`; `setPhase("modules")`. Not persisted (BUG-X02); the snapshot includes it explicitly. |
| `products` | 11 | `getProductsByStyle(style) ∩ getProductsByRoom(room)` per module type, filtered by finish (basic: cheapest per subcategory; premium: most expensive). ★ `setSelectedProducts()`. MVP fallback: **skip** and show the "Produse: alege în pasul 11" CTA. Writing the private localStorage key is not allowed. |
| `save` | 12 | `saveProject(userId, {name, data: snapshot})`, where the snapshot is built by Express with the same fields as `useSaveDesign` + `gridCells`. ★ `getProjectSnapshot()` replaces this. Then set `modulca-active-project` (★ `saveActiveProject()` replaces this). Guest / demo mode: localStorage project (projectService already handles it). |
| `renders` | 8 | For each view, sequentially (CF rate + Pollinations 45 s/IP): Express's own `buildExpressPrompt(view, snapshot)` (★ Chat 3's `buildRenderPrompt` replaces it) → `fetch POST /api/ai-render {prompt, width:1024, height:576, seed}` with **no client `tier` once SEC-02 lands** → blob → data URL (JPEG ≤ 200 KB) → `addSavedRender({…, label: view, engine: X-AI-Engine})`. Failure → mark `failed`, continue. 503 → wait 45 s, retry once. Then re-save the project. |
| `presentation` | 13 | `router.push(/project/{id}/presentation?express=1)`. The page reads the filled stores. The PDF comes from its existing button. The Express result panel (in `/express`) offers: open presentation · edit in wizard (`/project/{id}/design`) · retry failed renders. |
| — | 1, 14 | Skipped. |

**Feature flag:** `EXPRESS_MODE_ENABLED` (server) and `NEXT_PUBLIC_EXPRESS_MODE_ENABLED` (client nav/route). The `/express` page and `/api/express/*` return 404 when off. With the admin override `EXPRESS_ADMIN_EMAILS` (comma list), MAIN can run it on production while it is off for others.

**Tier limits (proposal; Chat 4 owns the numbers):** guest = 1 run/day, 3 renders, watermark · free/beta = 2 runs/day, 3 renders · premium 5 · architect 8 · constructor 10. Renders always count against the normal per-user render quota (SEC-02). Express adds no separate pool.

**Cost:** one Claude call per run (Sonnet, ~2k in / ~600 out tokens, ≈ €0.01) plus renders. Model constant: `EXPRESS_CLAUDE_MODEL`, Express-owned and defaulting to the same model as the consultant. No import from `api/consultant/**`, to stay detachable.

---

## 5. Interfaces other chats must add (one row per chat)

**MVP blocking** is only Chat 4's SEC-02. Everything else is upgrade-path work: the MVP ships with the fallbacks in §4.

| Chat | Exact signature(s) | Where | Why Express needs it | Priority |
|---|---|---|---|---|
| **4 Billing** | `export async function getServerTier(req: NextRequest): Promise<Tier>` · `export async function consumeQuota(userId: string, kind: "render" \| "express_run", n?: number): Promise<{ allowed: boolean; remaining: number }>` · in `auth/types.ts`: feature keys `expressMode: boolean`, `expressRendersPerRun: number`, `expressRunsPerDay: number` per tier | `src/app/api/ai-render/engines/creditManager.ts` (+ the helper module Chat 4 is adding now), `src/features/auth/types.ts` | `/api/express/brief` must gate by the real tier and count runs. Renders must not trust the client tier | **MVP-blocking** (already in flight as SEC-02) |
| **3 Engines** | `export function buildRenderPrompt(i: { view: "exterior-day" \| "exterior-dusk" \| "interior"; moduleType?: string; styleId: string \| null; floorFinish?: string; wallColor?: string; wallConfigs?: WallConfigs; furniture?: string[]; lighting: LightingMode; template: PromptTemplate; extras?: { people?: boolean; plants?: boolean } }): string` · `export async function requestAiRender(req: { prompt: string; width: number; height: number; seed?: string; engine?: string \| null; baseImage?: string \| null }, opts?: { signal?: AbortSignal; browserFallback?: boolean }): Promise<{ blob: Blob; engine: string; costUsd: number; latencyMs: number }>` · mock engine: `engine: "mock"` accepted **only** when `process.env.E2E_MOCK_RENDERS === "1"` (returns a fixed 1024×576 JPEG, cost 0) | `features/design/components/render/renderPrompt.ts`, `…/render/requestAiRender.ts` (extracted from `RenderPage` and `useRenderEngine`; the hook then calls them), `api/ai-render/engines/mock.ts` | The same prompts as the manual Render step (consistency), the Pollinations browser fallback, and golden-brief CI without burning quota | Upgrade W50 (the mock is needed for the §7 CI) |
| **3 Engines** (presentation) | `export function buildSlideData(s: ProjectSnapshot, opts: { projectName: string; clientName: string }): SlideData` (pure; `useSlideData` becomes a thin wrapper) · `export async function generatePresentationPdf(p: { snapshot: ProjectSnapshot; template: TemplateId; slides: SlideId[]; projectName: string; clientName: string; isFreeUser: boolean }): Promise<Blob>` · fix BUG-X01 (`productId` key) | `features/presentation/hooks/slideData.ts`, `features/presentation/components/PdfGenerator.tsx` | "Download PDF" straight from the Express result, and later a headless or server PDF and email-to-client | Upgrade (Jan) · BUG-X01 now |
| **MAIN** (or the chat MAIN assigns for `features/wizard` + `features/design` + `features/land`) | wizard: `WizardInput` += `targetModuleCount?: number; bedroomsRequested?: number`, honoured by `generateDesign` · `useWizardStore.applyToProject(opts?: { syncLand?: boolean })`, where `syncLand` calls `useLandStore.setGridCells` · land: `setPolygon(points: LatLng[]): void` + persist to `localStorage["modulca-land"]` (fixes BUG-X02) · products: `src/features/design/productSelection.ts` → `export function getSelectedProducts(): SelectedProduct[]; export function setSelectedProducts(items: SelectedProduct[]): void` (`ProductsPage` uses the same functions) · snapshot: `export function getProjectSnapshot(): ProjectDesignData` (design + land.gridCells + selectedProducts) and `export async function saveActiveProject(userId: string, name: string, id?: string): Promise<ProjectResult<ProjectRecord>>` (also sets `modulca-active-project`); then replace the 4 duplicates | `features/wizard/*`, `features/land/store.ts`, `features/design/productSelection.ts`, `features/auth/projectService.ts` | Area-driven sizing (Q3), land persisted, products in the project and the presentation, one save path | Upgrade W50; `targetModuleCount` is the most valuable |
| **MAIN** (infra) | env `EXPRESS_MODE_ENABLED`, `NEXT_PUBLIC_EXPRESS_MODE_ENABLED`, `EXPRESS_ADMIN_EMAILS` in Vercel · `src/proxy.ts`: no change expected (verify `/express` is not blocked) · a `tests/e2e` desktop Playwright project or a separate config (Chat 8 can own `tests/e2e/express.config.ts`) | Vercel, `.env.example` | Flag + CI | MVP (env only) |
| **2 Neufert** | `export function checkFootprint(i: { plotAreaSqm: number; footprintSqm: number; setting: "urban" \| "periurban" \| "rural"; county?: string }): { ok: boolean; maxFootprintSqm: number; ruleRef: string }` | `src/features/catuc/**` | Replace Express's 40% POT placeholder with the real CATUC/PUG rule | Post-MVP (Jan) |
| **5 Drawings** | — | — | Technical drawings are derived from `modules` automatically | none |

---

## 6. MVP cut (session 8.02, behind `EXPRESS_MODE_ENABLED`)

**In:**
- `src/app/(app)/express/page.tsx`: the 7-question form + free-text Q8, RO/EN/NL strings in `src/features/express/i18n.ts`.
- `src/app/api/express/brief/route.ts`:
  - flag check;
  - Claude tool-use call (structured output) with the zod-derived JSON Schema;
  - validate, retry once, normalise;
  - **no store access** (pure server).
- `src/features/express/`: `types.ts`, `brief.schema.ts`, `normalize.ts` (+ `.test.ts`), `briefToWizardInput.ts` (+ test), `countyCentroids.ts` (42 counties), `prompts.ts` (Express prompt builder, 3 views), `orchestrator.ts`, `ExpressProgress.tsx` (stage list with ✓ / ✗ / retry).
- Stages `brief → design → style → land → save → renders(3) → presentation`. Products are skipped, with a CTA.
- Render failure → the project and presentation are still delivered, with a "Reîncearcă randările" button.

**Out (post-MVP):** single free-prompt UI (the API supports it from day 1), products auto-pick (★ needs the setter), 5–10 renders, img2img from the 3D scene, headless PDF, P+1/P+M, consultant "explain this design", Neufert footprint rule.

**Done =** on a local dev server with the flag on, golden brief G1 typed into the form gives a saved project with ≥ 6 modules in Scandinavian style, 3 saved renders (or ✗ with retry), and the presentation page rendering. `npx tsc --noEmit`, `npm run test:run` and `npx next build` are green.

---

## 7. Golden briefs (3) — fixed inputs for E2E

Stored as `src/features/express/golden/*.json` (`source: "golden"`, so they bypass Claude and go straight to `normalizeBrief`; deterministic). The test lives in `tests/e2e/express-golden.spec.ts`, with a desktop Chromium project, `BASE_URL` = local or preview, and `E2E_MOCK_RENDERS=1`.

| ID | Brief | Expected assertions |
|---|---|---|
| **G1 "Familie Cluj"** | CJ / Florești, periurban, 600 m²; 4 persons, no office; 110 m² → 12 modules, `moderate`; scandinavian; terrace; standard; 3 renders `[exterior-day, living, kitchen]` | modules within the tier cap; contains ≥ 3 bedrooms, ≥ 1 bathroom, 1 kitchen, 1 living, 1 terrace; `styleDirection = "scandinavian"`; `finishLevel = "standard"`; 3 `savedRenders` (mock); presentation page shows the cover slide + room breakdown; project in the `projects` list |
| **G2 "Cuplu Brașov tradițional"** | BV / Bran, rural, 1,500 m²; 2 persons + office; null area; `generous`; traditional-romanian; terrace; finish null → premium; 3 renders `[exterior-dusk, living, bedroom]` | 2 bedrooms + 1 office; `finishLevel = "premium"` (derived from budget); estimate > €100k; 3 renders |
| **G3 "Studio tight urban"** (edge) | B / Sector 3, urban, 150 m² plot; 1 person; 40 m² → 4 modules, `tight`; industrial; no terrace; basic; 10 renders requested by a free user | renders clamped to 3 + a warning shown; no terrace module; footprint ≤ 40% of the plot (60 m²) → ≤ 6 modules; `finishLevel = "basic"` |

Plus a 4th, **non-golden** smoke test, run manually or nightly with a real key and not on every deploy: the free prompt *"Casă 120 mp, 3 dormitoare, stil scandinav, lângă Cluj, buget 120k €"*. It asserts that the brief parses to `style.id = scandinavian`, `household.bedroomsRequested = 3` and `site.county = "CJ"`.

---

## 8. Bugs found during the audit (→ MAIN to route)

| ID | Severity | Bug | Evidence | Proposed owner |
|---|---|---|---|---|
| **BUG-X01** | high (visible in every presentation) | Presentation and PDF products are always empty. `ProductsPage` saves `{productId, quantity}`, while `PresentationPage.tsx:197-201`, `useSlideData.ts:111` and `PdfGenerator.tsx:627-636` parse `{id, quantity}`. There are also 3 separate copies of a hardcoded `PRODUCT_CATALOG` Record instead of `@/assets` | `ProductsPage.tsx:34-57` vs the files listed | Chat 3 (presentation) |
| **BUG-X02** | medium | Land state (polygon, gridCells, mapCenter) is never persisted. `FinalizePage.tsx:81` reads `localStorage["modulca-land"]`, which no code writes, so `gridCells` are never saved to `projects.data` | `grep -rn modulca-land src` → 1 hit | MAIN → owner of `features/land` |
| **BUG-X03** | medium | Selected products are not part of any `saveProject` payload, so they are lost across devices and on cloud load | `useSaveDesign.ts:39-49`, `FinalizePage.tsx`, `CloudSaveButton`, `CloudSyncProvider` | MAIN → owner of `features/design` |
| **BUG-X04** | low | Playwright config sits in `tests/e2e/` but `npm run test:mobile` runs `playwright test` from the root without `--config`. Its `baseURL` default is **production** | `package.json:25-26` | MAIN |
| note | info | `src/ARCHITECTURE.ts` is stale (April, 13 steps; misses Choose, Architect and the wizard/express features) | — | MAIN |

---

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Free render capacity (CF only, 5/user/day, Pollinations 1/45 s/IP) | Express shows ✗ renders; demo looks broken | 3 renders max on free; sequential with backoff; deliver the project + presentation anyway; "retry renders"; demo account = constructor comp account with funded engines |
| SEC-02 not landed when 8.02 starts | Express could let the client choose the tier | 8.02 never sends `tier` from Express code. If SEC-02 is late, the flag stays off on prod (admin-only) |
| Client-only state (global `modulca-design` blob) | Running Express overwrites the user's current unsaved design | Before starting: if `modules.length > 0` and unsaved, confirm, or auto-save the current project first. Express always creates a **new** project |
| Generator ignores target area (until the ★ wizard interface lands) | "120 m²" yields ~9 modules | Show the warning with the actual m². Top-priority interface request |
| localStorage quota (base64 renders) | 8–10 renders × ~250 KB plus moodboard can exceed 5 MB | MVP 3 renders, JPEG ≤ 200 KB; post-MVP upload to Supabase Storage (`/api/renders/publish` pattern) and keep URLs only |
| Claude hallucinated IDs / bad JSON | Broken fill | Enum-constrained schema + zod + one retry + normaliser defaults; golden briefs bypass Claude |
| Detachability drift (Express touching internals) | Coupling | Lint rule (post-MVP): `src/features/express/**` may import only from `@/features/*/store`, `@/features/wizard/*`, `@/assets`, `@/shared/*`, `@/features/auth/projectService`. Code review checks it |
| Legal/quality: AI choices vs CATUC/PUG | Unrealistic proposals | 40% footprint placeholder now; Chat 2's `checkFootprint` in Jan; result page carries the "propunere orientativă / indicative proposal" disclaimer |
| Multi-level (P+1/P+M) expected by users | Unmet expectation | Shown as "în curând"; needs a design-store levels model (MAIN decision, 2027) |

---

## 10. Estimate

| Work | Owner | Hours | Sessions |
|---|---|---|---|
| 8.02 MVP: schema + normaliser + tests, brief API (Claude), orchestrator, `/express` page + progress UI, i18n RO/EN/NL | Chat 8 | 10–14 h | 2 (8.02 core + API, 8.03 UI + polish) |
| 8.04 Golden briefs: 3 JSON + Playwright desktop config + spec (needs the Chat 3 mock engine) | Chat 8 | 4–5 h | 1 |
| SEC-02 tier + quota helpers (in flight) + Express feature keys | Chat 4 | 1–2 h extra on top of SEC-02 | 0 (piggy-back) |
| `buildRenderPrompt` + `requestAiRender` extraction + mock engine + BUG-X01 | Chat 3 | 4–6 h | 1 |
| Wizard `targetModuleCount`, land persistence, `productSelection`, `getProjectSnapshot` / `saveActiveProject` (BUG-X02/X03) | owner assigned by MAIN | 5–7 h | 1–2 |
| 8.05 Products auto-pick + 5–10 renders + free-prompt UI | Chat 8 | 6–8 h | 1–2 |
| Headless PDF (`generatePresentationPdf`) | Chat 3 | 3–4 h | 1 |
| **Total to the beta-ready Express (MVP + golden CI)** | | **≈ 20–28 h** | **≈ 5–6 sessions across chats** |
| **Total incl. Jan extras** | | **≈ 30–40 h** | **≈ 8–10 sessions** |

Timeline fits v0: MVP in W49–W50, golden CI in W50, and the beta decision (Dec 15) by MAIN.

---

## 11. Open questions for MAIN

1. **Who owns `features/wizard`, `features/design` (non-render parts), `features/land` and `features/marketplace`?** None of them is in §10 of the workflow doc. Proposal: MAIN assigns, or allows Chat 8 to make the small **additive** wizard changes (`targetModuleCount`, `syncLand`) under a MAIN-approved handoff.
2. Route BUG-X01…X04 (§8).
3. Confirm the per-tier Express limits (§4) with Chat 4.
4. Should Express runs be recorded server-side (a table `express_runs` for analytics and the run quota)? This needs a migration (shared infra, coordinate). The MVP proposal is no: localStorage job + quota counter from SEC-02.

---

## 12. Changelog

| Date | Change |
|---|---|
| 2026-11-26 | v1 written after the read-only audit (session 8.01). Supersedes v0 §2–§4. |
