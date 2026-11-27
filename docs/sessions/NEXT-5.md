# NEXT-5 — proposed next Chat 5 Design + Drawings session

**Session:** `5.07.DesignDrawings_PermitTracker-PT1-PT3_2026XXXX` (date = day MAIN starts it)
**Written by:** 5.05 (2026-11-28), renumbered + handover added by 5.06 (2026-11-28; 5.06 was spent on the furniture layouts) · **Model:** Sonnet is enough for PT-1/PT-2; Opus for PT-3

## Prompt

You are Chat 5 Design + Drawings, session `5.07.DesignDrawings_PermitTracker-PT1-PT3`. Talk to Costin in Romanian.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 5 paths.
- `docs/MCA-SPEC-PERMITTRACKER-v1.md` (5.05 audit + spec + build list PT-1…PT-7).
- KB `src/knowledge/06-regulations/RO/catuc-169-2026.new.md` §3–§4 and `building-permit-process.new.md`.

Do, each step its own commit + push:
1. **PT-1**: per-project storage key for `PermitTracker.tsx` (`modulca-permit-tracker-{projectId}`), migrate the old global key into the active project once; mark the 10 city contacts "unverified, check with the city hall" (or hide them) until Chat 2 verifies. Test.
2. **PT-3**: route check as a pure function (`features/design/permits/route.ts` or similar): inputs = house type, floors, basement, area, rural/urban intravilan, protected zone → `ac | notification | none | unknown` + article list (art. 294, 299, 259). Tests for the edges (150 m², metropolitan-zone note in KB §3.1). Show the probable route at the top of the tracker.
3. **PT-2** only if Chat 2 has delivered the CATUC step texts: RO/EN/NL for the tracker.

Finish: tsc + vitest, one §6 row in the current week's schedule doc, next prompt into this file. Do not start other sessions.

## Context carried over from 5.05 (2266499, 5074ff1, ec96dcb, c307613 + docs)
- **ST20 hydration**: root cause = the design store loads localStorage in a module-load microtask, before React hydrates; render-time `getStats()` / `useXStore.getState()` read the live store, so hydration differs from the server HTML. Rule for all new code: **in render use selectors or `useDesignStats()`, never `getState()` / `getStats()`**. Proof test `design/components/finalize/hydration.test.tsx` (renderToString → hydrateRoot); add pages to it when they show store-derived text. Not verified on prod: watch Sentry MODULCA-WEB-2 for 24–48 h after deploy. `/render` was fixed by the same change (stats + quota) but has no SSR test (Three.js).
- **ST38**: dashboard header/stats wait for `useAuthReady()` (test `app/(app)/dashboard/page.test.tsx`).
- **ST39**: architect store `setProjectName()`; page resolves the name from the active project, else `loadProject()`.
- **B2**: superseded by 5.06 below.
- Still open from 5.04: bake-off B3 (no partition walls in All Modules); inline FeatureGates may flash on a direct load (wrap with `useAuthReady()`).


## Handover from 5.06 Furniture layouts (d85d1be, 468fd6f)
Done: all **24/24 presets re-authored** on the real interior (0.25–2.75 m, walls 0.25 m); default south door swing zone (x 1.05–1.95, 0.9 m deep) free except terrace; beds/desks long side on a wall; aisles ≥ 0.6 m (by hand, not tested). New optional `FurnitureItem.facing` (front direction: model rotated, w/d swapped) and `mountY` (wall-mounted: mirrors, wall TV, screen, whiteboard, tool wall, coat rack, grab bar, water heater). `layouts.modelFrame()` is the one place both renderers use (`FurnitureRenderer.tsx` + `module3d.tsx`: 3 lines each + 1-line placeholder guard; reported to Chat 3). `furniturePlaceholders.ts` = 30 labels drawn as sized primitives until Blender (3.11+/W50): kitchen counters/island, fridge, stove, shelves, tall cabinet, washer/dryer, water heater, wall items, benches, lounger, BBQ. `layouts.overlap.test.ts`: rendered 3D box (after facing/scale), wall bounds, door zone, overlap > 2 cm, mapping guard: 95 tests green; tsc + full vitest (592) green.

Not done / open:
- **Step 5 screenshots**: after-only, top view (default camera only sees outer walls, audit #5), all 8 room types, default presets: `docs/research/blender-3d/5.06-<room>-after-top.png`. Before = the 3.10 images. Checked visually: nothing in walls, mirror/TV/coat rack on the wall, toilet and sofa rotated correctly.
- Only default presets were looked at live; rotated kit models (east/west/north) assume the model's front is +Z; if one faces the wrong way, flip that item's `facing` in `layouts.ts`, nothing else.
- Users with saved `furnitureOverrides` keep their old positions (0–3 m); no migration.
- 2.5 m rooms are tight: bedroom now has a 1.4 m double bed (was 1.8 king), the island preset is an island bar against the west wall, meeting table 0.8 m.
- Aisle ≥ 0.6 m is not machine-checked; a free-path test (door → front of each item) would be the next guard.
- Inset assumes walls ≤ 0.25 m (store max today); thicker walls would need the per-wall thickness as inset.
- Wardrobe / hall wardrobe stay procedural (3.10); the 3.11 bedroom remodel covers them.
