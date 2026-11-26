# MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26

**Status**: Free-engines expansion done (Chat 3 Engines, session `3.0z.Engines_Free-Engines-Expansion_20261126`)
**Supersedes**: §0, §3 and §4 of [[MCA-DOC-AI-ENGINES-BETA-READINESS-2026-11-26]] (v1). v1 §5–§8 still apply.
**Related**: [[MCA-DOC-PRICING-SERVER-TIER]] (Chat 4 SEC-02/E08) · [[MCA-DOC-WEEK-2026-W48-SCHEDULE]] §6

---

## 0. Verdict (read first)

**Beta renders are now free, and they render OUR 3D view.** Cloudflare Workers AI already hosts **FLUX.2 [klein] 4B**. It does real img2img: we send the 3D capture as a reference image and the geometry comes back unchanged (windows, roof line, camera). It draws from the same free 10,000 neurons/day we already use, so it needs no new account, key or money. It is now engine `cloudflare-klein` and is **first in every img2img chain**.

| Item | v1 (this morning) | v2 (now) |
|---|---|---|
| Free server engines that produced an image | 1 (CF schnell) | **5 paths**: CF schnell, **CF klein t2i**, **CF klein img2img**, Pollinations, AI Horde (t2i + img2img) |
| Free img2img (keeps the 3D view) | **none**; free users got text2img that ignores the scene | **CF klein** (6.4 s, 1024×576, e2e through `/api/ai-render`) + AI Horde as a weak last resort |
| Kill switches | none (code change needed) | `AI_ENGINES_DISABLED=a,b` or `ENGINE_<ID>_DISABLED=1`, for every engine |
| Spend for this session | — | **≈ $0.005** (one `gpt-image-1-mini` low render to prove OpenAI is funded). Everything else $0 |

⚠️ **v1 was wrong on one point: not every paid engine is at $0.** Funded today: **OpenAI** (rendered), **Stability 25 credits**, **Leonardo 3,114 API tokens**, **WaveSpeed $1**. The `/api/ai-render` route still trusts the client's `tier` until MAIN wires Chat 4's `getServerTier`. So anyone can send `tier=architect` and spend OpenAI money. Also, `effectiveTier` for beta = **premium**, and the premium chain contains openai. → **Costin action A** below.

---

## 1. Live test, every engine (2026-11-26 13:25, direct to provider, 512 px where possible)

Tool: `node --env-file=.env.local scripts/engines-live-check.mjs [id] [--json]` (new; it calls providers directly, never through the prod fallback chain).
Prompt: *"photorealistic modern modular timber house, flat roof, large windows, pine forest, soft daylight"*. The img2img prompt asked it to turn a clay 3D model into a photo and keep the geometry. The input was a 1024² untextured clay render of a box house.

| Engine | Key | Free tier | Result | Latency | Quality note | Free limit |
|---|---|---|---|---|---|---|
| CF FLUX.1 schnell (`cloudflare`) | ✅ | ✅ | **OK** | 2.7 s | good, 1024² fixed | 10k neurons/day shared (≈96/img → ~104/day) |
| **CF FLUX.2 klein 4B t2i** (`cloudflare-klein`) | ✅ | ✅ | **OK** | 7.0 s | sharper materials than schnell | same pool, 26 neurons per 512² out tile |
| **CF FLUX.2 klein 4B img2img** | ✅ | ✅ | **OK** | 4.4 s (512²) · 6.4 s (1024×576 e2e) | **geometry kept exactly**, convincing timber, real forest | same pool, + 5.4 neurons per input tile → ≈126/img at 1024×576 |
| CF FLUX.2 klein 9B img2img | ✅ | ✅ pool | OK | 16.3 s | good | 1,364 neurons/MP → ~7/day · **non-commercial license** ❌ |
| CF FLUX.2 dev img2img | ✅ | ✅ pool | OK | 7.5 s | best realism, geometry kept | 37.5 neurons/tile/**step** → ~1.8–3k/img → 3–5/day ❌ |
| CF Leonardo lucid-origin | ✅ | ✅ pool | OK | 1.4 s | good, t2i only | 636 neurons/tile → ~4/day ❌ |
| CF Leonardo phoenix-1.0 | ✅ | ✅ pool | OK | 2.8 s | good, t2i only | 530 neurons/tile → ~4/day ❌ |
| Pollinations | n/a | ✅ anon | **OK** (this morning: 402 1/45 s per IP) | 2.5 s | fine, 512² | rate-limited per IP; key = more |
| AI Horde t2i | n/a | ✅ | **OK** | 5.8 s (queue 0 s now; 110 s+ at peak) | SD-class | free, kudos priority |
| AI Horde img2img (manual probe) | n/a | ✅ | OK | 11 s | **weak**: stays clay-like, SD 1.5, 7.5 KB webp | free |
| Gemini image | ✅ | ❌ | 429 quota (`limit: 0`) | 0.2 s | — | 0 |
| Hugging Face | ✅ | ⚠️ | 402 "Purchase pre-paid credits" | 0.2 s | — | $0.10/mo, resets Dec 1 |
| Together | ✅ | ❌ | 402 "Credit limit exceeded" | 0.8 s | — | promo ended |
| Fireworks | ✅ | ❌ | 404 "Model not found … not deployed" | 0.2 s | — | BUG-E04 |
| fal.ai | ✅ | ❌ | 403 "User is locked … Exhausted balance" | 0.6 s | — | $0 |
| Replicate | ✅ | ❌ | 402 "Insufficient credit" | 0.5 s | — | $0 |
| Novita | ✅ | ❌ | 403 NOT_ENOUGH_BALANCE | 0.3 s | — | $0 |
| Black Forest Labs (`flux-dev`) | ✅ | ❌ | 402 "Insufficient credits" | 1.5 s | — | $0 |
| Prodia | ✅ | ❌ | **403 "token is invalid: revoked"** (new) | 0.5 s | — | key revoked → new BUG-E13 |
| Segmind | ✅ | ❌ | 406 "Insufficient credits … 0.0" | 0.7 s | — | $0 |
| DeepInfra | ✅ | ❌ | 402 "need positive balance" | 0.6 s | — | $0 |
| **OpenAI** (`gpt-image-1-mini`, low) | ✅ | ❌ | **OK, funded** | 10.4 s | good, 1024² | paid ≈ $0.005 this call |
| **Stability** (balance only) | ✅ | ⚠️ signup | **25 credits** | — | — | ≈ 8 structure img2img renders |
| **Leonardo** (balance only) | ✅ | ❌ | **3,114 paid API tokens** | — | — | paid |
| Runway | ❌ local key empty | ❌ | not tested | — | — | — |
| **WaveSpeed** (balance only) | ✅ | ❌ | **$1.00** | — | — | China-gated by policy anyway |

The admin page `/admin/engines` (compare API) now lists `cloudflare-klein` (t2i + img2img) and AI Horde as img2img-capable.

---

## 2. Research: free or free-credit options (2026-11-26)

| Option | Free limit | Commercial use | API stability | img2img | Verdict |
|---|---|---|---|---|---|
| **CF Workers AI FLUX.2 klein 4B** | shares 10k neurons/day (≈80 img2img at 1024×576, ≈158 at 768×432) | weights Apache-2.0; CF model card links BFL terms | GA since Jan 2026, same API as today | ✅ `input_image_0..` (multipart) | **ADDED** (`cloudflare-klein`) |
| CF FLUX.2 dev / klein 9B / Leonardo lucid / phoenix | same pool but 15–30× the neurons | dev/9B non-commercial weights; Leonardo terms | GA | dev/9B ✅ | not added: ≤ 7 images/day |
| **AI Horde img2img** | free (kudos queue) | volunteer workers, no SLA; outputs ours | stable API, unpredictable latency | ✅ `source_image` | **ADDED** (last-resort img2img in `aihorde.ts`) |
| Pollinations (key via enter.pollinations.ai) | anonymous rate-limited; key tiers in "pollen", exact free amount not published | open; check at signup | gateway moved to gen.pollinations.ai in 2026 | Kontext model reportedly needs a paid "seed" tier, **unverified** | already in chain; Costin action B |
| **Vercel AI Gateway** | **$5 credit every 30 days** for accounts that never bought credits; klein 4B at $0.014/MP → ~600 renders/month at 1024×576 | BFL terms via Vercel | GA, we are already on Vercel | ✅ (klein/Kontext via gateway) | **best next candidate**; not implemented (no key to test; unclear whether image models are in the free subset). Next session |
| HF Inference Providers | $0.10/month | per provider | stable | some | too small (BUG-E02) |
| HF Spaces (ZeroGPU) | ~3 runs or ~5 GPU-min/day per account | per Space license | Spaces sleep and change | some | no |
| Google Gemini image | free tier **limit 0** | — | — | ✅ | no (billing only) |
| Together FLUX schnell Free | ended Jul 2026 | — | — | — | no |
| fal / Replicate / BFL starter credits | none for existing accounts; BFL publishes no free credits | — | — | ✅ | no |
| NVIDIA build.nvidia.com | rate-limited trial | **trial = non-production use only** | image NIMs 404 on free accounts (Jun 2026 reports) | ✅ Kontext-dev | no (terms) |
| Leonardo API | no free API tier (web only) | ✅ | ✅ | ✅ | we hold 3,114 paid tokens; premium reserve, not beta |

Sources: Cloudflare Workers AI pricing (2026-11-18) and the klein 4B model page and changelog; BFL klein launch post and HF model card (Apache-2.0 4B / non-commercial 9B); Vercel AI Gateway pricing docs and klein model page; HF ZeroGPU docs and forum; NVIDIA developer forum (trial terms, 404 reports); Pollinations GitHub APIDOCS.

---

## 3. Final fallback order (code, `src/app/api/ai-render/route.ts`)

**img2img, free/guest (`IMG2IMG_FREE`, new):** `cloudflare-klein` → `ai-horde` (img2img) → `cloudflare` (t2i, loses the 3D) → `pollinations` (t2i)

**img2img, every other tier (`IMG2IMG_FALLBACK`):** **`cloudflare-klein`** → stability → fal → replicate → wavespeed → … (unchanged after it)

**text2img, free (`FALLBACK_FREE`):** `cloudflare` → **`cloudflare-klein`** → `pollinations` → huggingface → gemini → together (these 3 fail in < 0.5 s today) → `ai-horde`

**text2img, premium / architect / default:** `cloudflare-klein` was added right after `cloudflare` in each chain.

**Client side (unchanged):** if the server answers non-200, `useRenderEngine.ts` calls Pollinations from the user's browser and IP.

**Kill switches** (`engines/killSwitch.ts`, checked in `tryEngines` for both the requested engine and the fallback engines):
- `AI_ENGINES_DISABLED=openai,stability` (comma list), or
- `ENGINE_CLOUDFLARE_KLEIN_DISABLED=1` (id upper-cased, `-` → `_`)
- `AIHORDE_IMG2IMG_DISABLED=1` (Horde img2img only)
- `CF_KLEIN_MAX_SIDE=768` (halves neurons per render)

**Model ID in one place:** `CF_KLEIN_MODEL` in `engines/cloudflareKlein.ts`. `engines-model-check` sees it (✓, no leak).

✅ **Resolved (Chat 4 added the row on master; prod check 14:00: `engine=cloudflare-klein` → 200, `X-AI-Engine: cloudflare-klein`, cost 0).** Background: `creditManager.ts` gives unknown engine IDs `dailyLimit: 0`, so `canUseEngine()` returns false. Until Chat 4 adds `"cloudflare-klein": { totalBudgetUsd: -1, dailyLimit: 10000 }` to `ENGINE_LIMITS`, klein is **skipped** and the chain falls through as before. Nothing breaks. With that line, local e2e gave: free img2img → `cloudflare-klein-img2img` 6.4 s $0; explicit klein t2i 6.8 s $0. The request was sent to Chat 4 at 13:45.

---

## 4. Expected free renders for the whole beta (10–20 users, €0)

| Source | Per day | Quality | Keeps 3D view? |
|---|---|---|---|
| CF pool, klein img2img 1024×576 (≈126 neurons incl. 1024-px capture) | **≈ 80** | high | ✅ |
| same with `CF_KLEIN_MAX_SIDE=768` (≈63 neurons) | **≈ 158** | good | ✅ |
| CF pool, schnell text2img 1024² (≈96) | ≈ 104 (same pool; not additive) | good | ❌ |
| AI Horde img2img / t2i | tens, unpredictable (queue) | low | ✅ (weak) |
| Pollinations (browser, user's IP) | ~unlimited at 1 per 45 s per user | medium | ❌ |

**Recommendation:** Chat 4's beta limit of **5 renders/user/day** fits at 20 users × 5 = 100/day **if** `CF_KLEIN_MAX_SIDE=768` (≈158/day of capacity). At 1024 it fits ≈16 users at 5/day; the rest spill to Horde and Pollinations at €0 and lower quality. Month: **≈ 2,400 (1024) – 4,700 (768) high-quality free renders**.

Note: the capture size counts too (5.4 neurons per input tile). A 1920×1080 capture costs ~43 extra neurons. The render UI (not Chat 3's path) should downscale the canvas to ≤ 1024 px before POST. That is now BUG-E14.

---

## 5. New BUG lines (continuing v1 §7)

| ID | Flow | Steps | Owner | Severity |
|---|---|---|---|---|
| BUG-E13 | Render, ultra-cheap | Prodia key returns 403 "token is invalid: revoked". Prodia is out of all chains (benched), so there is no user impact. Remove it from the registry or issue a new key | Costin / Chat 3 | low |
| BUG-E14 | img2img cost | The 3D capture is POSTed at native canvas size. Each 512² input tile costs 5.4 CF neurons. Downscale to ≤ 1024 px client-side | render UI owner (MAIN to assign) | low |
| BUG-E15 | Security/cost | OpenAI, Stability, Leonardo and WaveSpeed are **funded**. `/api/ai-render` still trusts the client tier, and beta = premium has openai in its chain. Until `getServerTier` is wired: `AI_ENGINES_DISABLED=openai,stability,leonardo,wavespeed` in Vercel (Costin action A) | Costin + MAIN | **high** |
| BUG-E16 | Registry | `creditManager.ENGINE_LIMITS` lacked `cloudflare-klein` (unknown → dailyLimit 0). **Fixed by Chat 4**, verified in prod | Chat 4 | done |
| BUG-E12 | — | **Fixed**: Horde timeout 120 s → 75 s (below the client's 90 s abort) | Chat 3 | done |

---

## 6. Costin actions

| # | What | Where | Env var | Cost |
|---|---|---|---|---|
| **A (do today)** | Block the funded paid engines until server-side tier is wired | Vercel → modulca → Settings → Environment Variables (Production), then redeploy | `AI_ENGINES_DISABLED` = `openai,stability,leonardo,wavespeed` | €0 |
| A-alt | Or at least set a hard monthly budget on OpenAI | platform.openai.com → Settings → Limits | — | — |
| **B** | Free Pollinations key (from v1) | enter.pollinations.ai → sign in with GitHub → create **secret** key | `POLLINATIONS_API_KEY` | €0 |
| **C** | Check whether CF is on Workers Free (hard stop = €0 guaranteed) or Paid | dash.cloudflare.com → Workers & Pages → Plans | — | €0 |
| **D (recommended)** | Use the smaller render size so 20 users × 5/day fit in the free pool | Vercel env | `CF_KLEIN_MAX_SIDE` = `768` | €0 |
| E (optional, next session) | Vercel AI Gateway key, to test the $5 / 30 days free credit as a 2nd free img2img engine. **Don't buy credits**: buying ends the monthly free credit | Vercel dashboard → AI Gateway → API Keys | `AI_GATEWAY_API_KEY` | €0 |

No new accounts are needed for the engines added today.

---

## 7. Commands

```powershell
node --env-file=.env.local scripts/engines-live-check.mjs
```
```powershell
node --env-file=.env.local scripts/engines-live-check.mjs cf-klein4b-i2i
```
```powershell
npx vitest run src/app/api/ai-render
```
