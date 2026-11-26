# NEXT-3 — proposed next Chat 3 Engines session

**Session:** `3.06.Engines_Free-Capacity-GLB-Compression_2026112X` (date = day MAIN starts it)
**Written by:** 3.05 (2026-11-26) · **Model:** Opus (code) · Keep it lean.

## Prompt

You are Chat 3 Engines, session `3.06.Engines_Free-Capacity-GLB-Compression`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 3 paths (§10).
- `docs/MCA-DOC-AI-ENGINES-CLIENT-CONTRACT-2026-11-26.md` (3.05: ST01 root cause, client contract).
- W48 live log §6 in `docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md`.

Task A — free render capacity (the real beta limit after ST01):
- Check `render_logs` (service role, read-only) for 503s since 3.05, by engine and by error.
- Did MAIN set `CF_KLEIN_MAX_SIDE=768` and `POLLINATIONS_API_KEY` in Vercel? If yes, verify Pollinations renders server-side from prod (X-AI-Engine). Check AI Horde renders at 768×384 in prod.
- Test the Vercel AI Gateway (klein $0.014/MP, $5 / 30 days free) as a capped paid fallback, if Costin has provided `AI_GATEWAY_API_KEY`. Keep spend < $0.30.
- Optional: a CF neuron counter (estimate per render via `kleinNeurons`) so the server skips both CF engines once the day's 10k is used, instead of 2 failing calls per render.
- Check whether Chat 5 has sent img2img as POST (ST03) and removed the Pollinations client fallback (ST02). If not, re-flag to MAIN.

Task B — GLB compression with gltf-transform (carried over from the 3.05 plan):
- Inventory the 20 GLB models in `public/` (registry in `src/assets/`): size, triangles, textures.
- `scripts/engines-glb-compress.mjs` with `@gltf-transform` (dedup, prune, weld, Draco or Meshopt, WebP textures ≤2048). `package.json` is high-collision: ask MAIN/Costin first (or use `npx`).
- Make sure the R3F loaders decode the codec. Screenshot before and after: no visible loss.
- Report in `docs/MCA-DOC-AI-ENGINES-GLB-COMPRESSION-2026-11-XX.md`. Target −60 % total.

Finish:
- `npx vitest run src/app/api/ai-render` + `npx tsc --noEmit`.
- Explicit-path commit, push (the pre-push hook runs tsc).
- One line in §6 of the current week's schedule doc. Next prompt into `docs/sessions/NEXT-3.md`.
- Do not start any other session.

## Context carried over from 3.05
- Chains live in `src/app/api/ai-render/engines/chains.ts`. `getFallbackChain()` always adds the free floor; `chains.test.ts` checks free ⊆ premium ⊆ architect ⊆ constructor.
- The creditManager health score now recovers: one probe after `HEALTH_COOLDOWN_MS` (5 min). This is Chat 4's file and the change was MAIN-approved.
- 503 body: `code: "ENGINES_UNAVAILABLE"` + `Retry-After: 60`.
- Open question for Costin (from 3.04): upscale has no paid-tier gate. Decide whether it stays quota-only.
