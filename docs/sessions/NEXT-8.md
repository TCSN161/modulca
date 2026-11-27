# NEXT-8 — Chat 8 Express: resume point

**Last session:** `8.02.Express_MVP_20261128` (part 1 of ~2)
**Spec:** `docs/MCA-SPEC-EXPRESS-MODE-v1.md` (§4 orchestrator, §6 MVP cut)

## Done in 8.02 part 1

| Commit | What |
|---|---|
| `435e125` | `src/features/express/`: `types.ts`, `normalize.ts` (answers + tier caps → `ExpressBrief`), `briefToWizardInput.ts` (→ Chat 5 `WizardInput.targetModuleCount/bedroomsRequested`, capped to tier + 40 % plot footprint), `pickProducts.ts` (style ∩ room, one per subcategory by finish), `countyCentroids.ts` (42), `brief.test.ts` |
| `8ad4219` | `renderPlan.ts` (Chat 5 `buildViewPrompt` + `sanitizePrompt` + `buildImg2ImgBody`, engine auto → klein chain, **no client tier**), `orchestrator.ts` (`runExpress`, `retryFailedRenders`, all side effects via `ExpressDeps`), `orchestrator.test.ts` (mocked engines) |
| (this commit) | `clientDeps.ts` (real deps: wizard store, land `setPolygon`, `setSelectedProducts`, `saveActiveProject` with id "" = always a new project, `computeProjectCost`, `persistSavedRender`, POST `/api/ai-render` + Bearer), `flag.ts`, `i18n.ts` (RO/EN/NL) + `i18n.test.ts`, `ExpressPage.tsx`, route `src/app/(app)/express/page.tsx` (404 when the flag is off). tsc 0, vitest express 25/25, next build green |

Design decisions:
- **No Claude call in the MVP.** The form answers map straight to the brief (deterministic). `/api/express/brief` (Claude, free prompt) is post-MVP.
- Products **are** auto-picked (Chat 5 `setSelectedProducts` exists now), not skipped as spec §6 said.
- Renders = 3 camera presets `exterior`, `overview`, `interior` (living), capped to `aiRendersPerDay` of the client tier (UX only; the server enforces tier + quota via SEC-02 on `/api/ai-render`).
- 503 → wait 45 s (or `Retry-After`) and retry once; 429/402 → mark the rest `quota`, send nothing more.
- Feature flag: `NEXT_PUBLIC_EXPRESS_ENABLED=1` (or `EXPRESS_ENABLED=1` server-side) — off by default; the `/express` route returns 404 when off.

## Part 2 must do

1. **Scene capture for img2img** (`ExpressDeps.captureView`). Part 1's client deps return `null` unless a capturer is registered → renders are marked `scene` failed. Build a hidden R3F canvas (reuse Chat 5 `RenderScene3D` + `computeCameraPose` / `captureRgbPng` / `captureDepthPng` via public props only) and register it with `registerSceneCapture()` in `clientDeps.ts`. If `RenderScene3D` cannot be driven from outside, ask Chat 5 for a `captureFromPreset(preset): Promise<{rgb, depth}>` interface.
2. Manual smoke on local dev with the flag on, **render mocked** (do not burn CF): golden G1 → saved project, 12 modules on premium / 6 on free, presentation opens.
3. Golden briefs JSON (`src/features/express/golden/*.json`) + Playwright desktop config (8.04, needs Chat 3 mock engine `E2E_MOCK_RENDERS`).
4. Guard: confirm before overwriting an unsaved current design (spec §9 risk 3).
5. Optional: server-side Express run counter (needs a `QuotaKind` from Chat 4).
