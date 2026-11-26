# MCA-DOC — AI engines: client contract for `/api/ai-render` (2026-11-26)

**Owner:** Chat 3 Engines (session 3.05) · **For:** Chat 5 (`useRenderEngine.ts`, `RenderPage.tsx`) · Fixes BUG-ST01 (server), specifies ST02 and ST03 for the client.

## 1. What was wrong in the smoke test (BUG-ST01, root cause)

`render_logs` for the two Constructor attempts (17:59 and 18:00 UTC) show the chain **did** reach the free engines, and every one failed in about 1 s:

| Engine | Why it failed | Fix |
|---|---|---|
| cloudflare + cloudflare-klein | Shared CF account: **daily 10,000 neurons used up** (429). Today's test bursts (≈40 klein renders at 1024 px) burned it. Resets 00:00 UTC. | Ops: set `CF_KLEIN_MAX_SIDE=768` in Vercel (halves the neurons). Long term: Workers Paid ($5/mo) or the Vercel AI Gateway. |
| ai-horde | Anonymous requests over **576×576 px** get an instant 403 `KudosUpfront`. Our clamp sent 1024×576 as 768×576. | **Fixed**: `hordeSize()` fits ≤576² px (1024×576 → 768×384). Verified live: accepted. |
| pollinations | 402 from Vercel IPs without a key | Ops: `POLLINATIONS_API_KEY` |
| gemini / huggingface / together | Known: limit 0 / credits / promo ended | — |
| fireworks / blackforest / fal | Unfunded or killed | — |

Also fixed:
- An engine at health < 10 was never tried again on a warm instance, even after its quota reset. It now gets one probe after `HEALTH_COOLDOWN_MS` (5 min). `creditManager.ts` is Chat 4's file; MAIN approved this cross-path change.
- `constructor` had no chain of its own: it fell into the 10-engine default, which has fewer engines than premium. It now has `FALLBACK_CONSTRUCTOR`.
- Every chain is built with `withFloor()`, so it always contains the free chain. Tests check that each tier is a superset of the tier below (`engines/chains.test.ts`).

## 2. Request shapes

Always send `Authorization: Bearer <supabase access_token>`. Tier and maxCost come from the server; `tier` in the query or body is ignored.

**Text → Image**
```
GET /api/ai-render?prompt=<urlencoded>&width=1024&height=576&engine=<id|omitted>
```

**3D + Text → Image (img2img, BUG-ST03).** This must be a **POST** with the canvas capture. The GET path never sees the 3D view.
```http
POST /api/ai-render
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "photorealistic modern modular timber house, keep the exact geometry and camera",
  "width": 1024,
  "height": 576,
  "baseImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "engine": null
}
```
- `baseImage`: a data URI (`image/jpeg` or `image/png`) or raw base64. Use JPEG quality ≈ 0.85 at ≤1024 px on the long side, so the body stays under Vercel's 4.5 MB limit (aim for < 1 MB). Example: `canvas.toDataURL("image/jpeg", 0.85)` after `gl.render()` with `preserveDrawingBuffer: true`.
- `engine`: omit it or send `null`. The img2img chain puts `cloudflare-klein` first for **every** tier (free: then ai-horde, cloudflare, pollinations).
- On success the response is the image bytes. `X-AI-Engine` names the engine (`cloudflare-klein` means the geometry was kept; `cloudflare` or `pollinations` means a text-only fallback, so the UI may say "3D view not kept"). `X-AI-Cost-Usd` gives the cost.
- Server tests: `src/app/api/ai-render/paidTierChain.route.test.ts` (free, premium, architect and constructor).

## 3. Error handling (BUG-ST02)

| Status | Body | Client must |
|---|---|---|
| 503 | `{ "error": "All AI engines are currently busy…", "code": "ENGINES_UNAVAILABLE" }` + `Retry-After: 60` | Show `error` as is. Offer "Try again" only after `Retry-After`. **No client-side fallback.** |
| 429 | `{ "error": …, "code": "QUOTA_EXCEEDED", … }` | Show `error` (the daily or monthly render limit) and an upgrade CTA. No retry. |
| 400 / 500 | `{ "error": … }` | Show `error`. |

**Remove the direct `image.pollinations.ai` fallback** in `useRenderEngine.ts`. It has no auth, it bypasses the server quota and the tier, it returns 402, and its message hides the real cause.
