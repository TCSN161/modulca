# MCA-DOC-AI-ENGINES-BETA-READINESS-2026-11-26

**Status**: E1 + E2 done (Chat 3 Engines, sprint Nov 26–27)
**⇒ Superseded in §0, §3, §4 by [[MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26]]** (free img2img via CF FLUX.2 klein; funded paid engines found).
**Owner**: Chat 3 Engines
**Related**: [[MCA-DOC-SPRINT-2026-11-26-27]] §2 Chat 3, §4.2 U8, §6 · [[MCA-DOC-AI-ENGINES-EXTENDED-2026-11]] · [[MCA-DOC-PRICING-COMP-ACCOUNTS]] (Chat 4 BUG list)

---

## 0. Verdict (read first)

**Beta renders can run at €0 extra, but only through one server engine.** On Nov 26, 2026, only Cloudflare Workers AI produced an image server-side. It worked after today's fix. Every other "free" engine failed for a reason outside our code (quota 0, credits spent, promo ended), and every paid backup has a **$0 balance**. That $0 balance is good for the €50 cap: nothing can spend money by accident.

| Item | Value |
|---|---|
| Engines with a live server-side free render today | **1**: Cloudflare (FLUX-1 schnell, 2.4 s, 1024×1024) |
| Free overflow | Pollinations: server-side 1 image / 45 s per IP (anonymous). The browser fallback runs from the **user's own IP** |
| Spend for this audit | **≈ $0.00001** (one 1-token Sonnet ping before E2 replaced it with the free Models API). Every paid render call was rejected with "no balance" |
| Recommended beta quota | **5 AI renders / user / day** (≈ 100/day for 20 users ≈ Cloudflare's free daily cap) |
| Blocker for a real per-user quota | BUG-E08: the quota is per tier and in memory, not per user (Chat 4) |

---

## 1. Engine table (live test 2026-11-26, 512–1024 px, one call each)

"Works" means a real image came back today. "Free tier" means it can render at $0 with no top-up. Cost is $/image after any free quota (`engine-billing-data.json` plus provider pricing).

| # | Engine | Works | Free tier | Model ID | ID status | Cost / render | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | **Cloudflare Workers AI** | ✅ yes (after fix) | ✅ 10k neurons/day | `@cf/black-forest-labs/flux-1-schnell` | current | $0 (≈ $0.001 past quota on Workers Paid) | Before the fix: 400 code 5006 (schema changed). After: 650 KB JPEG in 2.4 s |
| 2 | **Pollinations** | ⚠️ throttled | ✅ anonymous | default (`sana`) | current | $0 | 402 `FREE_LIMIT`: "1 image every 45 seconds per IP". Works when spaced out |
| 3 | **AI Horde** | ❌ timed out | ✅ volunteer | default SD | current | $0 | Job accepted, no image in 120 s (anonymous queue) |
| 4 | **Gemini Flash Image** | ❌ no | ❌ **limit 0** | `gemini-nano-banana-2.1` | current (listed) | ≈ $0.039 with billing | 429 on all 3 image models: `limit: 0 … Free Tier`. Google removed image gen from the free tier |
| 5 | **Hugging Face** | ❌ no | ⚠️ $0.10/mo credits, used up | ~~`FLUX.1-schnell`~~ → `stable-diffusion-3-medium-diffusers` | **deprecated → fixed** | ≈ $0.001 (credits) | 410 "model is deprecated … hf-inference". New ID routes fine, but returns 402 (credits spent) until the Dec 1 reset |
| 6 | **Together.ai** | ❌ no | ❌ promo ended Jul 2026 | `FLUX.1-schnell-Free` | unknown | $0.003 | 402 "Credit limit exceeded" |
| 7 | **Fireworks** | ❌ no | ❌ | `flux-1-schnell-fp8` | **broken** | $0.0014 | 404 "not deployed" on `image_generation` and `workflows`, for fp8 and non-fp8 (BUG-E04) |
| 8 | **fal.ai** | ❌ no | ❌ | FLUX schnell | current | $0.003 | 403 "User is locked. Exhausted balance" |
| 9 | **Replicate** | ❌ no | ❌ | FLUX schnell | current | $0.003 | 402 "Insufficient credit" |
| 10 | **NovitaAI** | ❌ no | ❌ | `flux-schnell` | current | $0.0015 | 403 `NOT_ENOUGH_BALANCE` |
| 11 | **Black Forest Labs** | ❌ no | ❌ | `flux-schnell` / `flux-pro-1.1` | **schnell endpoint gone** | $0.04 (pro-1.1) | `api.us1.bfl.ai` connect timeout → host **fixed** to `api.bfl.ai`. There: `flux-schnell` 404, `flux-pro-1.1` 402 "Insufficient credits" (BUG-E05) |
| 12 | OpenAI GPT Image | not tested | ❌ | `gpt-image-1` | current | $0.02 | Premium-only. Not tested (above cheapest-only rule) |
| 13 | Stability | not tested | ❌ | SD3 / img2img | — | $0.065 | Premium-only |
| 14 | Leonardo | not tested | ❌ | — | — | $0.03 | Premium-only |
| 15 | Runway | not tested | ❌ | `gen3a_turbo` | — | $0.02 | Premium-only |
| 16 | DeepInfra | not tested | ❌ | `FLUX-1-schnell` | ⚠️ HF reports this mapping in "error" | $0.015 | Premium-only |
| 17 | Segmind | not tested | ❌ | — | — | $0.005 | Premium-only |
| 18 | WaveSpeed | not tested | ❌ | `bytedance/seedream-v4(-edit)` | — | $0.003 | Backup, China-gated |
| 19 | Prodia | not tested | ❌ | — | — | $0.002 | `do-not-use` role |

Non-render models from `engines-model-check.mjs`: Groq `openai/gpt-oss-120b` ✅ · Gemini text `gemini-flash-latest` ✅ · **Anthropic `claude-sonnet-5-5` ✅, the newest Sonnet** · DeepSeek key valid, $0 balance.

---

## 2. Fixes made today (small, safe, in Chat 3 paths)

| File | Fix |
|---|---|
| `engines/cloudflare.ts` | Request body is now `{prompt, steps: 8}`. CF's new schema rejects `num_steps/width/height` (`additionalProperties:false`). The aspect hint moved into the prompt. Content type is now `image/jpeg` (it was mislabeled png) |
| `engines/huggingface.ts` | Deprecated `FLUX.1-schnell` replaced with `stable-diffusion-3-medium-diffusers` (the only text-to-image model still on hf-inference), 20 steps |
| `engines/pollinations.ts` | Optional `POLLINATIONS_API_KEY` (Bearer). A 402 FREE_LIMIT now hands off to the next engine at once with a clear log line, instead of a generic "HTTP error" |
| `engines/blackforest.ts` | Default host `api.us1.bfl.ai` → `api.bfl.ai` (`BFL_API_URL` still overrides) |
| `scripts/engines-model-check.mjs` | E2, see §6 |

`npx vitest run src/app/api/ai-render`: 35/35 pass. `tsc`: no errors in `ai-render`. The only errors are in `consultant/anthropic.ts`, which is Chat 2's uncommitted N1 work (SDK not installed yet).

---

## 3. Recommended fallback order (beta, free tier, €0)

Server side (`FALLBACK_FREE` in `route.ts`):

1. **cloudflare**: the only reliable free engine (≈ 3 s)
2. **pollinations**: free; with a key it is reliable, without one it is a lottery (Vercel egress IPs share the 1/45 s limit)
3. **ai-horde**: slow last resort. Its 120 s engine timeout is longer than the client's 90 s abort (BUG-E12)
4. *gemini, huggingface, together*: they stay in the chain but fail in < 0.5 s. They come back on their own if Costin enables Gemini billing, HF credits reset (Dec 1), or Together is topped up. No code change is needed

Client side (`useRenderEngine.ts`, already present): if the server answers non-200, the **browser calls Pollinations directly from the user's own IP**. Each user gets their own 1/45 s budget at $0. This is the real overflow for beta.

**Paid backups (fireworks, fal, replicate, BFL, novita): keep the balance at $0 during beta.** Today that is what guarantees €0 extra. BUG-SEC-02 (Chat 4) lets any client claim `tier=constructor`, so a funded paid engine would be open to anyone.

**Costin actions (each 5 min, all free):**
- A. Create a Pollinations key at enter.pollinations.ai and set `POLLINATIONS_API_KEY` in Vercel. This lifts the 1/45 s per-IP cap server-side. Check the free tier's limit at signup.
- B. Check in the Cloudflare dashboard whether the account is on Workers **Free** (hard stop at 10k neurons/day = €0 guaranteed) or Workers **Paid** (overflow billed at $0.011/1k neurons ≈ $0.001/image). Either is fine. Free is the strict €0 option.

---

## 4. Quota per beta user (€0 extra, 10–20 users)

Cloudflare FLUX-1 schnell, 1024² at 8 steps ≈ 4 tiles × 4.8 + 8 steps × 9.6 ≈ **96 neurons/image** (CF published neuron rates; verify in the CF dashboard after the first beta day). 10,000 neurons/day gives **≈ 100 server renders/day**.

| Users | Quota / user / day | Server renders / day | Fits CF free? |
|---|---|---|---|
| 10 | 10 | 100 | ✅ |
| 20 | **5** | 100 | ✅ (recommended) |
| 20 | 10 | 200 | ❌ only if half spill to the browser Pollinations fallback |

**Recommendation: 5 AI renders per user per day (≈ 150 per month).** Renders past the CF cap fall through to Pollinations. That still costs €0, it is just slower and lower quality. If the 5/day limit feels tight in the smoke test, dropping CF to 4 steps (≈ 58 neurons) gives ≈ 170/day, at some cost in sharpness.

⚠️ **This quota does not exist in code yet.** `TIER_DAILY_CALL_CAP` (creditManager, Chat 4) is **per tier, shared by every user of that tier**, and lives in memory per serverless instance. Today "free: 50/day" means 50 for all free users on one instance (BUG-E08). Also, render sends the raw `free` tier for beta users (BUG-B2-01), so beta users get the free chain. That is correct for €0.

---

## 5. What the user sees when the quota is hit

**Today (code as is):**
1. The server finds every engine blocked or failing and returns `503 {"error":"All AI engines are currently busy…"}`.
2. The client silently retries with Pollinations from the user's browser. If that works, the user gets an image labeled "pollinations": a quota hit is invisible, and the €0 is preserved.
3. If Pollinations also refuses (402, 1/45 s per IP), the user sees **"AI generation failed (402). Try again or use a simpler prompt."** That is misleading: the prompt is not the problem, there is no RO/NL text, and nothing says when it resets (BUG-E09).

**Target (proposed copy, i18n day 1):**
- RO: *"Ai folosit cele 5 randări AI incluse azi în beta. Se resetează la 02:00 (ora României). Între timp, randarea 3D rămâne nelimitată."*
- EN: *"You've used today's 5 beta AI renders. They reset at 00:00 UTC. The 3D view stays unlimited meanwhile."*
- NL: *"Je hebt de 5 AI-renders van vandaag in de bèta gebruikt. Ze worden om 00:00 UTC gereset. De 3D-weergave blijft onbeperkt."*
- Server side: return **429** with `{code:"QUOTA_EXCEEDED", resetAt}` (not 503), so the client can show this message instead of a generic error.

---

## 6. E2: engine registry and Models API check

`node scripts/engines-model-check.mjs [--json]` now:
- **Anthropic (U8):** `GET /v1/models` (headers `x-api-key` + `anthropic-version`, paginated, **costs nothing**; it replaces the 1-token Messages ping). Reads `CONSULTANT_CLAUDE_MODEL` from `src/app/api/consultant/models.ts` (single source), flags it if it is missing (exit 1), and prints a **monthly "📅 Anthropic model report — YYYY-MM"** with the newest Sonnet, Opus and Haiku plus `⬆ UPGRADE AVAILABLE` when the consultant is not the newest Sonnet (a warning; exit stays 0). Today's run: 15 models, consultant = newest Sonnet ✅.
- **Registry:** scans `ai-render/engines/*.ts` and `consultant/models.ts` for model-ID literals, then searches all of `src/` for copies. One ID per engine file is OK (two providers may share a name, e.g. `flux-schnell` at BFL and Novita). A copy **outside** an engine or consultant source counts as a leak. Today: **1 leak**, `claude-sonnet-5-5` hardcoded in `src/app/api/health/route.ts` (BUG-E10).
- Cloudflare's checked model is now read from `cloudflare.ts` instead of a second hardcoded copy.
- Coverage gap: engines that build the model into a URL (fal, replicate, stability, leonardo, segmind, prodia) are not detected by the literal scan. Each still keeps its ID in one file.

The weekly CI workflow (`.github/workflows/engines-model-check.yml`) runs it unchanged. The monthly report prints on every run, and the month in its header makes it greppable.

---

## 7. BUG list

| ID | Flow | Steps | Owner | Severity |
|---|---|---|---|---|
| BUG-E01 | Render, all tiers | Gemini image models answer 429 `limit: 0 … Free Tier` on the first call. The free tier for image gen is gone. Decide: enable billing (≈ $0.039/img, breaks €0) or keep it as a dead link in the chain | Costin decision → Chat 3 | med |
| BUG-E02 | Render, free | HF: model fixed, but credits are spent (402) until Dec 1. $0.10/mo is only a handful of images, so it is not a real beta engine | Chat 3 (monitor) | low |
| BUG-E03 | Render, free | Together returns 402 "Credit limit exceeded" (promo ended Jul 2026), and `engines:audit` flags it EXPIRED. Remove it from the chains or top it up. It fails in 0.5 s, so it is harmless meanwhile | Chat 3 | low |
| BUG-E04 | Render, premium/architect | Fireworks FLUX returns 404 "not deployed" for `flux-1-schnell(-fp8)` on the `image_generation` and `workflows` endpoints, though the models are listed. Needs a Fireworks docs/support check | Chat 3 | low (no balance anyway) |
| BUG-E05 | Render, premium | BFL dropped `flux-schnell` (404). The non-premium BFL path is dead, and the cheapest BFL option is now flux-dev/pro at ≥ $0.025. `estimatedCostUsd: 0.003` in `route.ts` is wrong. Repricing needs Costin's OK | Chat 3 + Costin | low |
| BUG-E06 | Ops | fal, replicate, novita, BFL and DeepSeek have a $0 balance, so the premium and architect chains are free-only in practice. **Keep it that way for beta** (see BUG-SEC-02) | Costin (info) | info |
| BUG-E07 | Render security/cost | Same as **BUG-SEC-02** (Chat 4): `tier` comes from the query or body. Fix in `route.ts` once a server-side tier helper exists | Chat 4 helper → Chat 3 route | high once any paid engine is funded |
| BUG-E08 | Beta quota | `TIER_DAILY_CALL_CAP` is per tier, not per user, and in memory per instance. A real "5/user/day" needs a per-user counter (Supabase `render_logs` count by `user_id` + day) | Chat 4 (creditManager) + Chat 3 (route) | high for beta |
| BUG-E09 | Render UX | Quota hit or all-fail shows "AI generation failed (402). Try a simpler prompt", in EN only. Needs a 429 `QUOTA_EXCEEDED` from the server plus the i18n copy in §5 | Chat 3 route + render UI (`src/features/design/components/render/`, needs MAIN to grant the path) | med |
| BUG-E10 | Registry | `src/app/api/health/route.ts:25` hardcodes `claude-sonnet-5-5`. It should import `CONSULTANT_CLAUDE_MODEL` | MAIN / Chat 2 | low |
| BUG-E11 | Ops | `engine-billing-data.json` was last reviewed 2026-04-17 (overdue since May 17). The Gemini, HF and Together rows are stale | Chat 3 (path `src/features/admin/`, needs a grant) | low |
| BUG-E12 | Render, free | AI Horde's engine timeout is 120 s and the client aborts at 90 s, so a Horde result can never reach the UI. Lower Horde to about 75 s or raise the client timeout | Chat 3 | low |

---

## 8. Commands

```powershell
npm run engines:audit
```
```powershell
node scripts/engines-model-check.mjs
```
