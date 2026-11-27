# NEXT-3 — proposed next Chat 3 Engines session

**Session:** `3.07.Engines_Free-Capacity-GLB-Compression_2026112X` (date = day MAIN starts it)
**Written by:** 3.06 (2026-11-27) · **Model:** Opus (code) · Keep it lean.

## Prompt

You are Chat 3 Engines, session `3.07.Engines_Free-Capacity-GLB-Compression`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 3 paths (§10).
- `docs/MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11.md` (3.06: klein = default, Horde ControlNet depth, BUG-ST34, Costin's €10 decision).
- W48/W49 live log §6.

Task A — act on Costin's bake-off decisions (ask MAIN what he chose from the contact sheet `docs/research/render-bakeoff-2026-11/index.html`):
- If he OKs Leonardo Depth as the prepaid fallback: add img2img to `engines/leonardo.ts` (init-image upload + `controlnets: [{ initImageId, initImageType: "UPLOADED", preprocessorId: 20, weight: 0.8, strengthType: "High" }]`, model Vision XL `5c232a9e-…`; working code in `scripts/engines-bakeoff-3d.mjs` → `leonardo()`), model ID + preprocessor in one constant, kill switch, and put it after the structure engines in `IMG2IMG_FALLBACK`. Test that free tiers never reach it.
- If he funds Replicate: add a `flux-depth-dev` branch (needs the exact depth pass from Chat 5, see doc §5).
- Verify in prod logs that img2img renders show `cloudflare-klein-img2img` or `ai-horde-img2img`, never `leonardo` (BUG-ST34).

Task B — free capacity (carried over from 3.05):
- CF neuron counter: estimate per render (`kleinNeurons`) so the server skips both CF engines once the day's 10k is used.
- Did MAIN set `CF_KLEIN_MAX_SIDE=768` / `POLLINATIONS_API_KEY`? With a key, test Pollinations `kontext` img2img (`scripts/engines-bakeoff-3d.mjs pollinations-kontext`).
- Vercel AI Gateway (klein, $5/30 days free) if `AI_GATEWAY_API_KEY` exists. Spend < $0.30.

Task C — GLB compression with gltf-transform (carried over; inventory, `scripts/engines-glb-compress.mjs`, −60 % target, before/after screenshots; `package.json` needs MAIN's OK).

Finish: `npx vitest run src/app/api/ai-render` + `npx tsc --noEmit`, explicit-path commit, push, one live-log line, next prompt here. Do not start other sessions.

## Context carried over from 3.06
- Chains: paid img2img = klein → funded stability/fal/replicate/wavespeed → ai-horde → cloudflare → pollinations; paid text2img only with `allowPaidText2img: true` (BUG-ST34).
- `ai-horde` img2img = ControlNet depth by default (`AIHORDE_CONTROL_TYPE`), returns null on `censored: true`; the prompt sanitiser also covers "model".
- Chat 5 owns the client side: describe-the-view prompts (overview vs room), the All Modules capture, camera bug B1 in `RenderScene3D.tsx`, the optional depth pass (doc §4–§5).
- Open question for Costin (from 3.04): upscale has no paid-tier gate. Should it stay quota-only?
