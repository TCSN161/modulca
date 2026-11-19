# MCA-DOC-AI-ENGINES-EXTENDED-2026-11

**Status**: Extended research — engines the user flagged (Meta, Nano Banana, OpenArt, Dreamina, LTX, Higgsfield, Raphael, Ideogram, etc.) + pricing tier structure + Canva decision
**Owner**: Costin Muraru
**Depends on**: [[MCA-DOC-AI-ENGINES-SURVEY-2026-11]] (parent survey)
**Date**: 2026-11-19

---

## 1. Specific engines user flagged — per-engine verdict

### 1.1 Meta (Llama 4 + Imagine)
- **Llama 4** (text, 400B weights, released Oct 2026):
  - Hosted on Groq (via our existing key, but Groq currently serves GPT-OSS 120B — Llama 4 appears only on paid tier)
  - Also on Together.ai (we removed) and Replicate (we have)
  - Via Replicate: `meta/llama-4-maverick-17b-128e-instruct` and similar — pay-per-token
- **Meta Imagine** (image gen via meta.ai):
  - ❌ **No public API** as of Nov 2026 — only consumer-facing at meta.ai
  - Skip until API ships
- **Verdict**: Llama 4 **not worth switching to** from our GPT-OSS 120B on Groq (free tier better than paid Llama 4 for our use case). Revisit when Meta ships Imagine API.

### 1.2 Nano Banana (Google Gemini Flash Image)
- **Already have**: `gemini-2.5-flash-image` as our `gemini` engine ✅
- **Newer variant**: `nano-banana-pro-preview` (in Gemini model list, confirmed Nov 2026)
- **And**: `gemini-nano-banana-2.1` — even newer, in catalog
- **Verdict**: **U-opt U6 added** — swap gemini-2.5-flash-image → gemini-nano-banana-2.1 for better quality at same free quota. 1-line change in `src/app/api/ai-render/engines/gemini.ts`.

### 1.3 OpenArt
- openart.ai — SD/FLUX playground + API
- Pricing: 100 free credits/day, then paid tier ~$0.02/img
- API is proxy-style over multiple models (SDXL, FLUX, SD3.5)
- Mostly consumer-focused — API documentation sparse
- **Verdict**: ❌ **Skip** — no unique model, consumer-first platform, we have 7+ engines covering same ground cheaper. Re-evaluate Phase 4 if their UI integrations become relevant (e.g., community prompts library).

### 1.4 Dreamina (ByteDance/CapCut)
- ByteDance's image + video gen (part of CapCut ecosystem)
- Very strong on dynamic camera moves + stylized video
- China-based → **gated per MCA GDPR policy**
- **Verdict**: ❌ **Skip for Beta**. Evaluate Phase 7+ only if we add a non-EU market and have consent-first flow.

### 1.5 "Elevena Art" — most likely ElevenLabs
- ElevenLabs = audio/voice/dubbing focus, NOT image
- They released **ElevenLabs Sound Effects 2.0** (Oct 2026) — image-adjacent (generates ambient audio from image/text)
- No image generation product from ElevenLabs
- **Verdict**: ❌ **Not applicable for image render pipeline**. HOWEVER, ElevenLabs IS relevant for **Phase 5 marketing** — generate Romanian voiceover for walkthrough videos from Vlad's architect script. Track for later.

### 1.6 Raphael AI (raphael.app)
- Free FLUX wrapper (frontend over free providers)
- No stable API — depends on Pollinations + volunteer GPU pools
- Not production-grade
- **Verdict**: ❌ **Do not use**. Our Pollinations + Cloudflare already cover its upstream for free, more reliably.

### 1.7 LTX (Lightricks)
- `ltx-video` model + LTX Studio platform
- Fast text-to-video (~5s for 4-sec clip on H100)
- Available on: fal.ai (we have), Replicate (we have), self-hosted via HuggingFace
- Cost on fal.ai: ~$0.01-0.015/sec of generated video
- Open-source weights — can run cheaper on our HF key
- **Verdict**: ⭐ **ADD to tracked video engines** — best price/perf for walkthrough animations. Phase 3-5 candidate. Activation = 1 new engine file (~80 lines) using fal.ai key we already have.

### 1.8 Higgsfield
- higgsfield.ai — cinematic video with explicit camera control (orbit, dolly, crane shots)
- Perfect for architectural walkthrough narratives
- Pricing: ~$0.02-0.03/sec, free trial 100 credits
- **Verdict**: ⭐ **Strong Phase 5 candidate** for Architect tier "cinematic walkthrough" feature. Note on roadmap. Skip for Beta.

### 1.9 Krea AI (not asked but same category)
- krea.ai — real-time generation + enhance pipeline
- Nov 2026: adds "Infinite Canvas" and multimodal realtime
- $10/mo subscription
- API: beta, not reliable yet
- **Verdict**: ❌ **Skip** — subscription model doesn't fit our pay-per-image profile.

### 1.10 Ideogram 3.0 (flagged in parent survey)
- Still: best typography inside renders (perfect for architectural signage, site plans with labels)
- $0.01/img, $5 trial
- **Verdict**: 📋 **Track U7** — add only when we see poor text rendering in generated signage during user testing.

---

## 2. Other engines discovered worth tracking (not yet in our stack)

| Engine | Why | Status |
|---|---|---|
| **xAI Grok Image** | Available via Grok 4, no architectural specialty | ❌ skip |
| **Mistral Pixtral Vision 2** | Multimodal reasoning (image → text) | 📋 useful for AI floor-plan analysis Phase 3 |
| **Alibaba Wan 2.5 Video** | Chinese video gen | ❌ China policy gate |
| **Qwen Image 3** | Via Together or direct — strong photorealism | ✅ already in Groq catalog (`qwen/qwen3.8-27b`) |
| **Stability SD 4.0** | Released Sept 2026, flagship | 📋 U8: upgrade our `stability` engine when stable-API ships |
| **BFL FLUX 2 Pro** | FLUX 2 flagship | 📋 U4 already tracked |
| **Luma Dream Machine 3** | Latest video from Luma | 📋 Phase 5 Architect feature |

---

## 3. Pricing tier structure — unified reference

### 3.1 Internal cost bands (per-image / per-second)

| Band | Range | Who pays |
|---|---|---|
| 🟢 **FREE** | $0.00 | Us (free tier capacity at provider) |
| 🟢 **BUDGET** | $0.001 – $0.005 | Us (Premium revenue covers) |
| 🟡 **MID** | $0.005 – $0.02 | Us (Architect revenue covers) |
| 🟠 **PREMIUM** | $0.02 – $0.10 | Us (Constructor revenue covers) |
| 🔴 **ENTERPRISE** | > $0.10 | Us (custom contracts only) |

### 3.2 Our engines mapped to bands (Nov 2026)

| Engine | Model | Band | Notes |
|---|---|---|---|
| Pollinations | SD default | 🟢 FREE | unlimited forever |
| AI Horde | SD community | 🟢 FREE | unlimited (slow) |
| Cloudflare | FLUX 1 Schnell | 🟢 FREE | 10K neurons/day |
| Groq GPT-OSS 120B | text | 🟢 FREE | generous rate limits |
| Gemini Flash | multimodal + image | 🟢 FREE | 1500 req/day |
| Together FLUX Schnell | image | 🟢 FREE | promo expires Jul 2026 — monitor |
| HuggingFace | FLUX.1-schnell | 🟢 FREE | monthly free quota |
| Novita FLUX Schnell | image | 🟢 BUDGET | $0.0015/img |
| Fireworks FLUX FP8 | image | 🟢 BUDGET | $0.0014/img (EU/GDPR) |
| BFL FLUX Schnell | image | 🟢 BUDGET | $0.003 |
| fal FLUX Schnell | image | 🟢 BUDGET | $0.003 |
| Replicate FLUX | image | 🟢 BUDGET | $0.003 |
| Prodia | image | 🟢 BUDGET | $0.002 (but 113s latency → `do-not-use`) |
| WaveSpeed Seedream | image | 🟢 BUDGET | $0.003 |
| Segmind SDXL | image | 🟡 MID | $0.005 (upscale cheapest $0.005) |
| DeepInfra FLUX 2 Pro | image | 🟡 MID | $0.015 |
| OpenAI dall-e-3 → gpt-image-1 | image | 🟡 MID | $0.02 |
| Runway Gen-3/4 | video | 🟡 MID | $0.02/sec |
| Leonardo | image | 🟠 PREMIUM | $0.03 |
| Stability SD3/SD4 | image | 🟠 PREMIUM | $0.065 (best img2img with 3D base) |
| Luma Ray 3 | video | 🟠 PREMIUM | $0.014/sec |
| LTX Video (on fal) | video | 🟠 PREMIUM | $0.01-0.015/sec |
| Higgsfield | cinematic video | 🟠 PREMIUM | $0.02-0.03/sec |
| Sora 2 | video | 🔴 ENTERPRISE | $0.05/sec |
| Veo 3.5 | video | 🔴 ENTERPRISE | $0.08/sec |

### 3.3 Which band each ModulCA subscription unlocks

| Subscription | Monthly price | Max band | Rationale |
|---|---|---|---|
| **Guest (not signed in)** | €0 | FREE only | Prevent cost on visitors |
| **Free (Explorer)** | €0 | FREE only | Convert via quality taste of free |
| **Premium** | €19.99 | FREE + BUDGET | ~1000 renders/mo at $0.003 = $3 cost vs €20 revenue = 85% margin |
| **Architect** | €49.99 | FREE + BUDGET + MID | ~500 renders/mo at $0.02 = $10 cost vs €50 revenue = 80% margin |
| **Constructor** | €149.90 | All bands including PREMIUM | Enterprise feature access; ENTERPRISE band on-demand upsell |

### 3.4 Guardrails
- **Hard ceiling per request**: cost_cap = (subscription_price_eur / 4) / expected_renders_per_month — ensures single call cannot wipe margin.
- **Monthly tier cap**: enforce via `creditManager.ts` — reset 1st of month.
- **Fallback-down**: if budget-ceiling hit mid-month, auto-demote to lower band (Architect falls back to Premium stack, etc.) with notification.

Credit manager at `src/app/api/ai-render/engines/creditManager.ts` already enforces this — needs minor update to reflect new bands (track as U9).

---

## 4. Presentations — Canva vs our own

### Options evaluated

| Option | Free tier | API cost | Quality | Fits ModulCA? |
|---|---|---|---|---|
| **Our Claude slides (current)** | ✅ built | $0 (uses Claude session or pre-rendered) | ⭐ matches our design system | ✅ Yes — already shipped |
| **Canva API (Connect)** | ❌ API needs approval + $$$ | ~$0.01/export + $200/mo min enterprise | ⭐⭐ polished | ❌ NO — exceeds €50/mo cap |
| **Canva external export** | ✅ user Canva free account | $0 (user's own) | varies | 🟡 Useful as "export to Canva" link |
| **Slidev / Reveal.js** | ✅ OSS | $0 | ⭐ code-driven | 🟡 overlap with current slides |
| **pptxgen (code-generated PPT)** | ✅ MIT library | $0 | ⭐ good for download | 📋 could add as export format |
| **Pitch.com** | free tier | API pricing TBD | ⭐⭐ | ❌ overkill |
| **Google Slides API** | free | $0 for API calls (quota) | ⭐ familiar | 📋 interesting: user "Export to Google Slides" |

### Decision: **Keep our own slides, skip Canva**

**Reasons**:
1. **€50/mo cap**: Canva Connect API minimum €183+/mo is >3.6x our entire budget
2. **Already shipped**: 10 extracted slide components, html2canvas PDF export works
3. **Design consistency**: Our templates (minimal/bold/classic/luxury/architect) match our brand
4. **Investor-facing**: Keeps the "all in one platform" story — "generated by ModulCA" vs "exported to Canva"
5. **Zero dependency**: No external account needed for users to get a presentation

### Augmentation (not Canva): offer 2 export formats
Current: HTML → html2canvas → PDF
**Add** (Phase 3, 1 day of work):
- **"Export .pptx"** via `pptxgenjs` library — users who want to edit further in PowerPoint/Keynote/Slides
- **"Open in Google Slides"** via copyToClipboard + user paste (no API cost)

Track as **U10**: `src/features/presentation/engines/pptxEngine.ts` — mirror the html2canvasEngine pattern.

### Why NOT Canva even as optional
- Adds account setup friction for users
- Introduces non-EU dependency (Canva = Australia-based, extra GDPR notice)
- API cost puts us in red immediately on first paying user

---

## 5. Updated upgrade tracker

New upgrade items on top of U1-U5 (from parent survey):

| # | Change | Benefit | Effort | When |
|---|---|---|---|---|
| U6 | Gemini: `gemini-2.5-flash-image` → `gemini-nano-banana-2.1` | Latest Nano Banana | 1 line | After Beta |
| U7 | Add Ideogram 3.0 as "typography specialist" | Better signage/labels | ~80 lines engine file | Only on demand |
| U8 | Stability: SD3 → SD4 when API stable | Latest flagship img2img | 1 line | Monitor BFL + Stability for Nov 2026 release |
| U9 | Update `creditManager.ts` with Nov 2026 bands | Cost control alignment | ~30 lines | Before first paid user |
| U10 | Add .pptx export to presentation | Investor polish | ~200 lines | Phase 3 |

---

## 6. Final recommendations — what to do with this research

### Do NOW (automated by me, zero cost)
- ✅ Document all this (this file)
- ✅ Weekly engines-check already running
- ✅ Weekly engines-audit already running

### Do THIS WEEK (user action required)
- 🔑 WaveSpeed signup → add `WAVESPEED_API_KEY` (Novita too)
- 🔑 Add engine keys to GitHub Secrets so weekly automation works in CI
- 🔑 DeepSeek top-up $5 only if Phase 2 CATUC starts

### Do PRE-BETA (Dec 15 invite-only)
- U9: Update creditManager bands (prevents accidental overspend on 10-20 beta users)
- Test presentation PDF export on 3 sample projects → ensure no regressions

### Do POST-BETA (Jan-Feb 2027)
- U1 Cloudflare FLUX 2 upgrade
- U2 OpenAI gpt-5.1-mini
- U6 Nano Banana 2.1
- U10 .pptx export

### Do IF-USER-DEMAND
- U7 Ideogram typography
- Add LTX Video + Higgsfield when Architect users ask for video walkthrough
- Luma Ray 3 Phase 5 marketing

### Explicitly DO NOT
- ❌ Runware (no unique value)
- ❌ Canva API (budget-blocking)
- ❌ Dreamina / Alibaba / MiniMax / Kling (China gate)
- ❌ Raphael AI (not production-grade)
- ❌ Krea subscription (price model mismatch)
- ❌ Meta Imagine (no public API yet)

---

## 7. Automation enhancement — add new-engine discovery

Add weekly cron (Phase 4+) to scrape model announcements and flag new providers:
- openrouter.ai/models — new models list
- huggingface.co/models?sort=trending
- paperswithcode.com/sota/image-generation-on-coco
- Twitter/X feed of key accounts (Anthropic, OpenAI, Google AI, BFL)

Track as **U11**: `scripts/engines-discover.mjs` — not needed now, but blueprint ready.
