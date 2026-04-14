# AI Render Engine Billing Guide

> Last updated: 2026-04-14

## Architecture Overview

ModulCA uses a **multi-engine render system** with 15 adapters + Prodia as meta-gateway (30+ models).
Smart routing selects the best engine per user tier, render mode, and budget.

```
User Request → Smart Router → Tier Check → Engine Selection → Render → Cache → Log
                    │
              ┌─────┴──────┐
              │ Credit Mgr  │ — budget tracking, health scores, auto-disable
              │ Render Cache │ — content-hash dedup via Supabase Storage
              │ Render Logger│ — per-render analytics to Supabase
              └─────────────┘
```

---

## Working NOW (6 engines, $5/mo total)

| # | Engine | Cost/Image | Free Quota | Speed | Status |
|---|--------|-----------|------------|-------|--------|
| 1 | Pollinations | $0.00 | Unlimited | 0.7s | ✅ Free forever |
| 2 | AI Horde | $0.00 | Unlimited | 13-40s | ✅ Free (community GPUs) |
| 3 | Cloudflare AI | $0.00 | 10K neurons/day | 0.7s | ✅ Free forever |
| 4 | HuggingFace | $0.001 | Free tier monthly | 0.9s | ✅ Free |
| 5 | Leonardo.ai | $0.03 | $5 credits | 14s | ✅ Budget capped $1 |
| 6 | **Prodia Pro** | $0.002-0.05 | **$5/mo plan** | 0.25-10s | ✅ **30+ models** |

## Need Billing (code ready, just need card)

| # | Engine | Cost/Image | Min Top-up | Priority | Why |
|---|--------|-----------|------------|----------|-----|
| 7 | fal.ai | $0.003 | $0 (usage) | HIGH | Fastest engine |
| 8 | Together.ai | $0.00 | Card needed | HIGH | Free 3 months |
| 9 | Fireworks | $0.0014 | Card needed | MEDIUM | EU/GDPR, SOC 2 |
| 10 | Replicate | $0.003 | Card needed | MEDIUM | ControlNet img2img |
| 11 | DeepInfra | $0.015 | Card needed | LOW | DeepStart program |
| 12 | Segmind | $0.005 | Signup credits | LOW | Cheapest upscale |
| 13 | OpenAI | $0.02 | Billing limit | LOW | Premium only |
| 14 | Stability AI | $0.065 | 25 credits | LOW | Best img2img (native) |
| 15 | Black Forest Labs | $0.003 | Credit-based | LOW | FLUX creators |

---

## Tier → Engine Mapping

### Guest / Free Tier (maxCost: $0.005-0.01/img)

**Text-to-image:**
1. Prodia FLUX Fast Schnell (0.25s, $0.002)
2. Cloudflare FLUX Schnell (0.7s, free)
3. HuggingFace FLUX (0.9s, free)
4. Pollinations (0.7s, free)
5. AI Horde (13s, free)

**Img2img:**
1. Prodia FLUX Fast Schnell img2img ($0.002)

**Resolution:** SD only (512×288)
**Budget:** $0/mo (free engines) + Prodia as bonus

---

### Premium Tier — €19/mo (maxCost: $0.05/img)

**Text-to-image:**
1. Prodia FLUX Dev (3s, $0.008) — best quality/speed balance
2. Prodia FLUX 2 Dev (5s, $0.010) — newest model
3. Leonardo.ai (14s, $0.03) — photorealistic
4. Cloudflare (0.7s, free) — fast draft fallback
5. fal.ai (when billing added) — fastest overall

**Img2img:**
1. Prodia FLUX Kontext Pro (7s, $0.015) — structure-preserving
2. Prodia FLUX Dev img2img (3s, $0.008)
3. Stability (when billing added) — best native img2img

**Upscale:** Prodia Upscale ($0.003)
**Resolution:** HD (1024×576)
**Budget:** ~$2/mo from Prodia allocation

---

### Architect Tier — €49/mo (maxCost: $0.10/img)

**Text-to-image:**
1. Prodia FLUX 2 Pro (8s, $0.04) — top quality
2. Prodia FLUX Pro 1.1 Ultra (10s, $0.05) — maximum quality
3. Prodia Recraft V4 (18s, $0.02) — design/vector style
4. OpenAI GPT Image (when billing added)
5. BFL FLUX Pro (when billing added)

**Img2img:**
1. Prodia FLUX Kontext Max (10s, $0.025) — best 3D→photo
2. Prodia FLUX Kontext Pro (7s, $0.015) — fast alternative
3. Stability Structure (when billing added)

**Upscale:** Prodia HypIR ($0.005) — advanced upscale with detail
**Inpainting:** Prodia FLUX Dev Inpainting ($0.008)
**Vector/Plans:** Prodia Recraft V4 Vector ($0.02) — diagrams, floor plans
**Remove BG:** Prodia Remove Background ($0.003)
**Resolution:** Up to 4K (1536×864)
**Budget:** ~$3/mo from Prodia allocation

---

### Video (Future — all tiers with limits)

| Model | Via | Cost/video | Speed | Use Case |
|---|---|---|---|---|
| Sora 2 | Prodia | ~$0.10 | 2min | Walkthrough from prompt |
| Sora 2 Pro | Prodia | ~$0.20 | 2min | High quality walkthrough |
| Veo Fast | Prodia | ~$0.05 | 30s | Quick preview video |
| Kling | Prodia | ~$0.15 | 5min | Cinematic video |

---

## Prodia Budget Management ($5/mo)

### Allocation
- **$4/mo usage cap** ($1 safety margin)
- **50 renders/day** hard limit
- ~2000 renders/mo at $0.002 (drafts only)
- ~500 renders/mo at $0.008 (standard mix)
- ~100 renders/mo at $0.04 (premium quality)

### Smart routing saves money
1. Cache hits = $0 (same prompt+size+engine = cached)
2. Free engines tried first for free/guest tiers
3. Prodia only used when quality needed (premium/architect)
4. Daily limits prevent runaway spending

### Monthly budget scenarios

| Scenario | Monthly Cost | Renders |
|---|---|---|
| **Current (5 free + Prodia)** | $5 | 2000+ draft, 500 standard |
| **Phase 2 (+fal, +Together)** | $5-10 | 3000+ with fastest engines |
| **Phase 3 (+Fireworks, +Replicate)** | $15-20 | EU compliance + ControlNet |
| **Full scale (all engines)** | $25-40 | All capabilities maxed |

---

## Startup Programs (apply when ready)

| Program | Credits | URL |
|---|---|---|
| Together AI Startup | $15K-$50K | together.ai/startups |
| Google Cloud Startup | $2,000 | cloud.google.com/startup |
| Modal Startup | $25,000 | modal.com/startups |
| DeepInfra DeepStart | varies | deepinfra.com |

---

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ai-render` | GET | Text-to-image render |
| `/api/ai-render` | POST | Img2img render (with base image) |
| `/api/ai-render/upscale` | POST | Upscale or remove background |
| `/api/ai-render/compare` | GET | Compare all engines side-by-side |
| `/api/ai-render/budget` | GET | Engine credit/budget status |
| `/api/ai-render/analytics` | GET | Render analytics from Supabase |
| `/admin/engines` | Page | Visual engine comparison |
| `/admin/analytics` | Page | Render cost/usage dashboard |
