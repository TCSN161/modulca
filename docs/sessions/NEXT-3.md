# NEXT-3 — proposed next Chat 3 Engines session

**Session:** `3.09.Engines_Free-Capacity-GLB-Compression_2026MMDD` (W50; date = day MAIN starts it)
**Written by:** 3.07 (2026-11-27), renumbered by 3.08 (MAIN moved this work to 3.09; 3.08 = PDF ST29–ST32) · **Model:** Opus (code) · Keep it lean.

## ▶ Next up first: 3.10 (Sat 5 Dec), written by MAIN 1.05 on 28 Nov

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
