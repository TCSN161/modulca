# NEXT-5 — proposed next Chat 5 Design + Drawings session

**Session:** `5.06.DesignDrawings_PermitTracker-PT1-PT3_2026XXXX` (date = day MAIN starts it)
**Written by:** 5.05 (2026-11-28) · **Model:** Sonnet is enough for PT-1/PT-2; Opus for PT-3

## Prompt

You are Chat 5 Design + Drawings, session `5.06.DesignDrawings_PermitTracker-PT1-PT3`. Talk to Costin in Romanian.

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
- **B2**: `layouts.overlap.test.ts` guards all furniture presets (inside 0–3 m, no overlap > 2 cm, rugs exempt). **Known, not fixed:** preset coordinates use the 3 m footprint, but the 3D walls are 0.25 m (up to 0.3 m) inside it, so items at x/z 0.05–0.1 sit partly inside the walls in 3D. A real fix moves the coordinate system to the 2.4 m interior (2D floor plan, 3D, drawings): do it with the Blender remodel 3.10/3.11, not separately.
- Still open from 5.04: bake-off B3 (no partition walls in All Modules); inline FeatureGates may flash on a direct load (wrap with `useAuthReady()`).

