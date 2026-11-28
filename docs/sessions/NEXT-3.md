# NEXT-3 — proposed next Chat 3 Engines session

**Session:** `3.09.Engines_Free-Capacity-GLB-Compression_2026MMDD` (W50; date = day MAIN starts it)
**Written by:** 3.07 (2026-11-27), renumbered by 3.08 (MAIN moved this work to 3.09; 3.08 = PDF ST29–ST32) · **Model:** Opus (code) · Keep it lean.

## ▶ Next up first: 3.11 (Sun 6 Dec or next quota), written by 3.10 on 28 Nov

### ⏸ 3.11 progress (running 28 Nov night; resume here after the 06:00 quota reset)
- Layout step = done by 5.06 (bedroom/rest: bed 2.0×1.4 facing east, nightstand 0.45×0.40×0.50, wardrobe 0.80×0.50×2.20 facing north). Interior from code: 0.25 walls → 2.5 m (CLAUDE.md "2.4/0.3" is stale).
- Source: `docs/research/blender-3d/3.11/build_bedroom.py` (run in Blender via MCP: `exec(open(p).read(), ns); ns["build"]("bed"|"nightstand"|"wardrobe")`) + `bedroom-3.11.blend`. Compress: `npx -y @gltf-transform/cli optimize X.raw.glb X.glb --compress meshopt --texture-compress webp` (`*.raw.glb` not committed).
- [x] bed `bed-double-140.glb`: 1.40×2.00×0.95 m, 1 556 tris, 96 KB (wood albedo 1024 + AO 1024 on UV2, webp).
- [x] nightstand `nightstand-45.glb`: 0.45×0.40×0.50, 456 tris, 53 KB (AO 512). [x] wardrobe `wardrobe-80.glb`: 0.80×0.51×2.20, 456 tris, 63 KB (vertical grain). Set = 2 468 tris, 212 KB.
- [x] code mapping (bf3262d): `shared/realModels.ts`, opt-in `?real3d=1` (localStorage `mca-real3d`; `?real3d=0` off), exact labels "Double Bed" / "Nightstand" / "Wardrobe", uniform scale 1 when footprint ±5 %, no preset tint. GLBs copied to `public/models/real/` (kit untouched). Unit test `realModels.test.ts`.
- [x] acceptance screenshots `3.11-bedroom-before-kit.png` / `3.11-bedroom-after-real.png` (demo bedroom injected in localStorage, top view). FPS 30 in the browser pane for both modes (pane cap). [x] W49 §6 row.
- [x] Costin OKed before/after (28 Nov) → real models are the default; opt-out `?real3d=0`.
- [x] 3.11b (c1feccb): `fridge-60` (0.60×0.625×1.85, 824 tris, 23 KB), `washer-60` (0.60×0.615×0.85, 1 620 tris, 33 KB), `bookshelf-100` (1.0×0.35×1.8, 1 628 tris, 102 KB) + `bookshelf-160` (1.6×0.4×1.8, 2 000 tris, 119 KB), books on 3 shelves. Wood albedo brightened (bedroom set rebuilt: 103/56/66 KB). `realGlbPath(label, w, d)` picks the model whose footprint fits the slot ±5 %, checked before the 5.06 placeholder list (placeholders stay as fallback). Test covers every fridge/washer/bookshelf slot in all presets. Verified: all 7 real GLBs load in `/project/demo/visualize` (4-module demo), `3.11b-all-modules-real.png`. Total 7 models = 10 084 tris, 501 KB.
- Note: c1feccb also committed the `*.raw.glb` intermediates by mistake; removed in the next commit (+ `.gitignore` in `3.11/`), still in history (~7.6 MB).
- [ ] **Left:** FPS on Costin's phone · check the wood tone again in the app (brighter now; if still dark → AO strength / scene exposure) · "Display Shelf", "Shared Shelf", storage racks, dryer, stove, counters still primitives/kit · S/M/L variants + other rooms (W50).

**Session:** `3.11.Engines_Bedroom-Blender-Remodel` · **Model:** Opus · Costin at the PC, Blender 5.3 open, MCP add-on on :9876. 3.10 is done (3286b75, d1fcdc7, 3fa1562).

### What 3.10 found (read `docs/research/blender-3d/3.10-audit-3d.md` + `3.10-blender-link.md`)
- "Blurry" = **unlit flat furniture** (20/20 GLBs `KHR_materials_unlit`), not DPR/AA. Code fix shipped: `shared/glbMaterials.ts` makes them lit + shadows.
- The kit models are **~½ real size** (bedDouble = 0.96×1.13×0.38 m) and stretched per axis in code.
- `cabinetBedDrawer.glb` (27 cm drawer) still stands in for 16 labels (fridge, washer, bookshelf…). Wardrobe already moved to procedural.
- All presets sit 5–23 cm in the walls; a plain clamp makes 20 floor overlaps (2.5 m interior cannot hold bed 1.8 + 2×0.45). Needs a layout redesign, not a clamp.

### Prompt

You are Chat 3 Engines, session `3.11.Engines_Bedroom-Blender-Remodel`. Talk to Costin in Romanian. Rebuild the **bedroom/rest** furniture in Blender through MCP, following Radar §5 (`docs/radar/2026-11-26-blender-connector.md`). Blender only through MCP; source `.blend` + GLBs go to `docs/research/blender-3d/3.11/`, **new names** (`bed-double-160.glb` …); do not overwrite `public/models/*` until Costin OKs the before/after.

Steps (one commit each, explicit paths, push):
1. **Interior first**: confirm interior size from code (`WALL_THICKNESS` 0.25 → 2.5 m; CLAUDE.md says 2.4 m with 0.3 walls — ask Costin which one is true). Redesign bedroom/rest to fit: bed **1.40 or 1.60 × 2.00** (1.80 does not fit with nightstands), 2 nightstands 0.40, wardrobe 0.60 deep on the opposite wall, ≥ 0.60 m walkway, door zone free. Fix `layouts.ts` for bedroom only + extend `layouts.overlap.test.ts` with an "inside walls" check (0.25–2.75 m) for that preset.
2. **Model in Blender** (MCP `execute_blender_code`): bed, nightstand, wardrobe, at real size in metres, transforms applied, origin bottom-centre, −Z forward like the kit. Bevel 3–10 mm (1–2 segments) + Weighted Normal. Shared materials: wood, fabric, linen, metal (Principled, roughness/normal; textures 1024 px bed/wardrobe, 512 px rest).
3. **Bake AO** to UV2 (Cycles OptiX, 64–128 samples) → `aoMap`. Export glTF binary: +Y up, apply modifiers, no unlit. Then `npx -y @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp` (check `useGLTF` decodes meshopt; else keep uncompressed and note it).
4. **Code**: map the new GLBs for bedroom labels; for these real-size models use **uniform scale = 1** (skip the per-axis fit when the model's bbox is within ±5 % of the layout size), still floor-aligned. Keep the old path for the other 17 models.
5. **Accept**: same default camera `/project/demo/visualize` bedroom before/after (3.10 screenshots are the "before"); FPS on Costin's phone (Chrome remote or the `stats` overlay) ≥ 50; numbers in the doc.

**Budget:** ≤ 5k tris per piece, ≤ 30k tris for the bedroom set; ≤ 1.5 MB for the 3 GLBs after compression (≤ 5 MB per module total). 0 live AI renders.

Rules: `tsc` + vitest green; one row in §6 of the week schedule; do not start other sessions. If time is left: replace the `cabinetBedDrawer.glb` stand-ins with procedural boxes (fridge, washer, bookshelf) in `FurnitureRenderer.tsx` + `module3d.tsx`.

Report (first lines): commits, before/after numbers (tris, MB, FPS), what is still on the old kit.

---

## ✅ Done: 3.10 (ran Sat 28 Nov night, pulled forward), written by MAIN 1.05 on 28 Nov

**Session:** `3.10.Engines_3D-Audit-Blender-Link_20261205` · **Model:** Opus · Costin is at the PC with Blender 5.3 open. 3.09 (below) moves after 3.11.

### Prompt

You are Chat 3 Engines, session `3.10.Engines_3D-Audit-Blender-Link_20261205`. Talk to Costin in Romanian. This is the first of two 3D sessions; 3.11 (Sun 6) remodels one module in Blender. Costin's complaint: the 3D is blurry, has little detail and the furniture sits wrong or overlaps.

Ready since 28 Nov (verified):
- Blender 5.3, NVIDIA Studio driver 621.40, Cycles **OptiX** on the RTX 3060 Laptop;
- the official Blender Lab **MCP add-on 1.0.3**, server on `localhost:9876`, Auto Start;
- the Claude Code side: local `.mcp.json` → `blender` server (`%USERPROFILE%\.local\bin\blender-mcp.exe`, uv tool from projects.blender.org/lab/blender_mcp). A read-only test listed Camera/Cube/Light.

Read first:
- `docs/radar/2026-11-26-blender-connector.md` (§3 setup, **§5 the 8 rules for Chat 3**: unlit materials, per-axis stretching at `FurnitureRenderer.tsx:145-148` and `module3d.tsx:366-375`, PBR, bevels, AO, meshopt, collisions, one module before/after);
- `docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md` §4 (B1 camera, B2 fixed in c307613, B3 partitions);
- the asset registry in `src/assets/` and `public/models/*.glb` (20 models).
Write only Chat 3 paths plus `docs/`.

Do (one commit per step, explicit paths, push):
1. **Audit, no code change.** For each module type (bedroom, bathroom, kitchen, living, …), take a screenshot through the built-in browser at `/project/demo/visualize`. Table: what looks wrong · cause (file:line) · fix (code vs Blender) · size.
   - Check the "blurry" cause first: canvas DPR / `gl.setPixelRatio`, antialias, texture filtering, unlit materials.
2. **Quick code wins, if they are small and safe:** a correct DPR (capped at 2), antialias, and no per-axis stretching where uniform scale + real dimensions are possible. Test them, and take a before/after screenshot from the same camera.
3. **Blender link on a copy:**
   - copy one GLB (`bedDouble.glb`) to `docs/research/blender-3d/` (never edit the original);
   - import it in Blender through MCP;
   - report triangles, materials and dimensions, and whether the unlit extension is present;
   - no export into `public/` in this session.
4. **Plan for 3.11:** the bedroom module rebuilt in Blender per the rules in Radar §5, with the exact steps, the budget (triangles, MB) and the acceptance check (same camera before/after, FPS on a phone). Write it into the "3.11" section of this file.

Rules:
- Blender only through MCP, only on copies.
- 0 live AI renders.
- `tsc` + vitest stay green.
- One row in §6 of the current week's schedule.
- Do not start other sessions.

Report (first lines): commit hashes, top 5 problems with their causes, what was fixed in code, what goes to Blender in 3.11.

---

## Prompt

You are Chat 3 Engines, session `3.09.Engines_Free-Capacity-GLB-Compression`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 3 paths (§10).
- `docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md`: §3 chains, §8 structure-control engines (3.07: ready, off until funded).
- W48/W49 live log §6.

Task A: structure-control follow-up. Ask MAIN what Costin decided.
- If Costin funded Replicate or Stability, run ONE live render per funded engine on the house axonometric (`docs/research/render-bakeoff-2026-11/inputs/`), add it to the contact sheet, and confirm the request fields in doc §8.3. Spend < $0.20.
- If Chat 5 5.03-A has shipped the depth pass, run one free Horde render with `controlImage` (`image_is_control`) and compare it with Horde's own estimator.
- If Costin OKs Leonardo Depth as the prepaid fallback, wire it the same way: model id + preprocessor in one constant, a kill switch, place it after the structure engines in `IMG2IMG_FALLBACK`, and add a test that free tiers never reach it. Working code is in `scripts/engines-bakeoff-3d.mjs` → `leonardo()`.
- Check with MAIN whether Chat 4 raised `ENGINE_LIMITS` for replicate/stability: the $1-per-instance cap is about 40 or 20 renders.

Task B: free capacity (carried over).
- CF neuron counter: estimate per render (`kleinNeurons`) so the server skips both CF engines once the day's 10k is used.
- `CF_KLEIN_MAX_SIDE=768` / `POLLINATIONS_API_KEY` set? With a key, test Pollinations `kontext` img2img.
- Vercel AI Gateway (klein, $5 / 30 days free) if `AI_GATEWAY_API_KEY` exists. Spend < $0.30.

Task C: GLB compression with gltf-transform (carried over): inventory, `scripts/engines-glb-compress.mjs`, −60 % target, before/after screenshots. `package.json` needs MAIN's OK.

Finish: `npx vitest run src/app/api/ai-render` + `npx tsc --noEmit`, explicit-path commit, push, one live-log line, next prompt here. Do not start other sessions.

## Context carried over from 3.08 (PDF, 2026-11-27)
- `/api/ai-render` image responses send `X-AI-Fallback-From: a,b` = engine ids tried and failed before `X-AI-Engine` (skipped engines not listed; header absent when the first engine answered). Test: `fallbackHeader.route.test.ts`. Keep it when touching `tryEngines`.
- Presentation strings live in `src/features/presentation/i18n/{en,ro,nl}.ts` (not in `src/i18n/messages`); PDF font = Inter in `public/fonts/pdf/`. Engine labels in captions come from `AI_ENGINES` (renderConstants), so a new engine needs a label there.
- Not verified: PDF download in a logged-in browser and on prod (Costin's next smoke run).

## Context carried over from 3.07
- Paid img2img chain: `klein → replicate-depth → replicate-canny → stability-structure → fal → wavespeed → ai-horde → cloudflare → pollinations`. The paid ones are skipped silently until funded (`engines/structureFunding.ts`). Paid text2img runs only with `allowPaidText2img: true` (BUG-ST34).
- New optional POST fields `controlImage` + `controlType` (depth/canny), ignored without `baseImage` (doc §8.2, for Chat 5).
- `stability-structure` is reached by Constructor only (premium band); `replicate-*` by Premium and up.
- Kill switch for all three: `STRUCTURE_CONTROL_DISABLED=1`.
- Open question for Costin (from 3.04): upscale has no paid-tier gate. Should it stay quota-only?
