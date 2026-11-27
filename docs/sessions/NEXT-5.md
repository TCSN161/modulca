# NEXT-5 — proposed next Chat 5 Design + Drawings session

**Session:** `5.03-A.DesignDrawings_Img2Img-Camera-Depth_2026112X` (date = day MAIN starts it)
**Written by:** 5.03 (2026-11-27) · **Model:** Opus (code)
**Inputs ready:** 3.06 bake-off done (`docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md`). Wait for 3.07 only if it changes the route contract (depth/control image field).

## Prompt

You are Chat 5 Design + Drawings, session `5.03-A.DesignDrawings_Img2Img-Camera-Depth`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 5 paths (§10). `*Three*` components are Chat 3; `RenderScene3D.tsx` B1 is assigned to Chat 5 by the bake-off doc §4.
- `docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md` §3–§5: klein (`cloudflare-klein`, 1024 ref) is the default; **the prod failure was the prompt and the view, not the engine**.
- W48 live log §6, the 5.02 and 5.03 lines. `src/features/design/components/render/useRenderEngine.ts`, `RenderPage.tsx`, `RenderScene3D.tsx`.

Build, one commit each:
1. **Automatic Image→Image**: "3D + Text" always sends the current 3D capture (`toJpegDataUrl(raw, 1024, 0.85)`, keep the size). Enable the capture in `viewMode === "all"` (today `captureRef.current = null`, nothing is sent).
2. **View-describing prompts** (bake-off §4.2): All Modules → "Turn this 3D cutaway axonometric of a modular house (N modules: …) into a photorealistic architectural cutaway render, seen from above at the same angle. Keep the exact camera, the outer walls cut at the same height, every window and door opening and every furniture position. <style>". Single room → "Turn this 3D view of a <room> into a photoreal render; keep the exact camera, walls, openings and furniture positions. <style>". Pure function + tests.
3. **Camera presets** that actually move the camera (B1): `useThree().camera.position.set(...)` + `controls.update()` on change; in-room "interior" position (≈ `[0.9, 1.5, 0.9]`, `minDistance` ≈ 0.5), corner, detail, axonometric.
4. **First-person camera** inside a module (eye height 1.6 m, look-around; WASD optional) for the capture.
5. **FOV slider** (e.g. 35–90°), stored with the render settings, applied to the capture camera.
6. **Depth map**: render a depth pass of the same camera from Three.js (`MeshDepthMaterial` or a depth texture → normalised grayscale JPEG) and send it as the control image when the route supports it (Horde ControlNet depth today; Replicate `flux-depth-dev` only if Costin approves paid). Check the field name with Chat 3 (3.07) before wiring; until then, generate + preview it only.
7. Optional, small: B2 Kitchen L-shape overlap, B3 partition walls in All Modules (bake-off §4.3).

Finish:
- `npx vitest run src/features/design src/features/wizard` + `npx tsc --noEmit` + `npm run test:run`. Browser pass on `/project/demo/render` (no login needed).
- Explicit-path commits, push. One line in §6 of the current week's schedule doc. Next prompt into this file.
- Do not start any other session.

## Context carried over from 5.03
- Project-save bugs ST06, ST08–ST12, ST31, ST35 fixed (W48 live log, Fri 27).
- `features/design/projectCost.ts` `computeProjectCost()` / `computeProjectCostFromData()` is the one cost function (design + products, per-m² by usable area). **Open (not Chat 5 path):** the presentation PDF "Cost Summary" and "Selected Products" should call it so ST31 is fixed on the PDF too.
- `useAuthReady()` (`features/design/hooks/useAuthReady.ts`) + `useAuthStore.sessionChecked`: use it before any tier gate. Only the Architect page, dashboard and CloudSaveButton use it; the inline `FeatureGate`s in Configure / Technical / Walkthrough / Products / Finalize may still flash the upgrade prompt on a direct load (not reported yet).
- Product selection: user edits are "pending" (`modulca-selected-products-pending`) until a cloud save succeeds; `applyProjectSnapshot(data, { projectId })` keeps pending local products.
- `/project/new` and the dashboard need login in the local dev server; `/project/demo/*` does not.
