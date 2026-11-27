# NEXT-3 — proposed next Chat 3 Engines session

**Session:** `3.08.Engines_Free-Capacity-GLB-Compression_2026112X` (date = day MAIN starts it)
**Written by:** 3.07 (2026-11-27) · **Model:** Opus (code) · Keep it lean.

## Prompt

You are Chat 3 Engines, session `3.08.Engines_Free-Capacity-GLB-Compression`.

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

## Context carried over from 3.07
- Paid img2img chain: `klein → replicate-depth → replicate-canny → stability-structure → fal → wavespeed → ai-horde → cloudflare → pollinations`. The paid ones are skipped silently until funded (`engines/structureFunding.ts`). Paid text2img runs only with `allowPaidText2img: true` (BUG-ST34).
- New optional POST fields `controlImage` + `controlType` (depth/canny), ignored without `baseImage` (doc §8.2, for Chat 5).
- `stability-structure` is reached by Constructor only (premium band); `replicate-*` by Premium and up.
- Kill switch for all three: `STRUCTURE_CONTROL_DISABLED=1`.
- Open question for Costin (from 3.04): upscale has no paid-tier gate. Should it stay quota-only?
