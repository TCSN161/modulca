# NEXT-5 — proposed next Chat 5 Design + Drawings session

**Session:** `5.05.DesignDrawings_PermitTracker-Audit-Spec_2026112X` (date = day MAIN starts it)
**Written by:** 5.04 (5.03-A, 2026-11-27) · **Model:** Opus (audit + spec, little code)

## Prompt

You are Chat 5 Design + Drawings, session `5.05.DesignDrawings_PermitTracker-Audit-Spec`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 5 paths (§10): `src/features/permits/**`, `src/app/api/permits/**`, `docs/MCA-SPEC-PERMITTRACKER-*`.
- `docs/MCA-SPEC-CATUC-PHASE3-PLATFORM.md` (PermitTracker part) and any existing `docs/MCA-SPEC-PERMITTRACKER-*`.
- The latest status snapshot and the session map row for PermitTracker.

Do:
1. **Audit** what exists today: `src/features/permits/**`, permit PDFs, the technical / drawings steps that feed them, routes, tests. Table: feature · file · works / partial / missing · evidence (test or browser).
2. **Spec** `docs/MCA-SPEC-PERMITTRACKER-v1.md`: the Romanian permit path (CU → avize → DTAC → AC) as user steps, the documents ModulCA can generate per step, data model (Supabase table proposal, no migration yet), UI screens, what Chat 2 (CATUC/Neufert) provides, out of scope for the Dec 15 beta.
3. A ranked build list (PT-1 … PT-n) with sizes, for MAIN to schedule.

Finish:
- Docs only unless a one-line fix is obvious. Explicit-path commits, push. One line in §6 of the current week's schedule doc. Next prompt into this file.
- Do not start any other session.

## Context carried over from 5.04 (5.03-A, commit 4f44173)
- Render step (`features/design/components/render/`):
  - `viewPrompt.ts` `buildViewPrompt()`: overview / exterior / interior / upload sentences (bake-off §4.2).
  - `cameraPresets.ts`: `computeCameraPose()`, `focalToVerticalFov()`, `gridBounds()`.
  - `ViewportRig.tsx`: moves the live camera, applies the FOV, registers `{ rgb, depth }` capture.
  - `depthCapture.ts`: linear depth shader, white = near.
  - `renderRequest.ts` `buildImg2ImgBody()` (3.07 contract), `sanitizePrompt(prompt, img2img)`.
  - `CameraControls.tsx`: RO+EN presets + FOV slider.
  - `CombinedScene3D` takes an optional `viewport` prop (Visualize unchanged).
  - `SavedRender.view` = `{ camera, focalMm, viewMode }`.
- **Not verified:** no live engine call (request body checked in the browser with fetch stubbed). The first real klein / Horde-with-depth render should be looked at by Costin. Depth contrast inside a room is modest: the far plane uses the whole-house sphere. If Horde/Replicate results look flat, tighten far to the room for the interior preset.
- **Open, small:** bake-off B2 (Kitchen L-shape furniture overlap) and B3 (no partition walls in All Modules) are not done.
- Open from 5.03: the presentation PDF should use `computeProjectCost` (not a Chat 5 path). Inline FeatureGates may flash on a direct load: wrap them with `useAuthReady()`.
