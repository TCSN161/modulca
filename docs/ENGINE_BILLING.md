# AI Render Engine Billing Guide

> Last updated: 2026-04-13

## Current Status

### Working NOW (no money needed)

| # | Engine | Cost/Image | Free Quota | Status |
|---|--------|-----------|------------|--------|
| 1 | **Pollinations** | $0.000 | Unlimited forever | WORKING |
| 2 | **AI Horde** | $0.000 | Unlimited (community GPUs) | WORKING |
| 3 | **Cloudflare AI** | $0.000 | 10,000 neurons/day forever | WORKING |
| 4 | **Hugging Face** | $0.001 | Free tier (monthly credits) | WORKING |
| 5 | **Leonardo.ai** | $0.030 | $5 free credits (~166 renders) | WORKING |

### Code Ready — Need Billing to Activate

| # | Engine | Cost/Image | Signup Bonus | Min Top-up | Billing URL | Priority |
|---|--------|-----------|-------------|-----------|-------------|----------|
| 6 | **fal.ai** | $0.003 | Free tier (exhausted) | ~$5 | fal.ai/dashboard/billing | HIGH — fastest img2img |
| 7 | **Together.ai** | $0.000 | Free 3 months (expired) | Add card | api.together.xyz/settings | HIGH — FLUX Kontext img2img |
| 8 | **Fireworks AI** | $0.0014 | $5 credits (acct suspended) | Add card | fireworks.ai/account/billing | HIGH — cheapest per image, best GDPR |
| 9 | **Replicate** | $0.003 | Free tier (exhausted) | Add card ($5 min) | replicate.com/account/billing | MEDIUM — ControlNet img2img |
| 10 | **DeepInfra** | $0.015 | Free tier (needs balance) | Add balance | deepinfra.com/dash/billing | MEDIUM — fast FLUX |
| 11 | **Segmind** | $0.005 | 0 credits left | $10 min top-up | cloud.segmind.com/billing | LOW — SDXL only |
| 12 | **Stability AI** | $0.040 | 25 credits (depleted) | Buy credits | platform.stability.ai/account/credits | LOW — expensive |
| 13 | **OpenAI** | $0.005-0.02 | Billing limit hit | Add credits | platform.openai.com/settings/billing | MEDIUM — best quality |
| 14 | **Black Forest Labs** | $0.003 | Credit-based | Buy credits | api.bfl.ml (note: .ml TLD may be blocked by ISP) | LOW — works on Vercel |
| 15 | **Prodia** | $0.002 | **1000 free calls (no card!)** | None | app.prodia.com/api | HIGH — create account! |

## Recommended Budget: €15-25/month

### Phase 1: Free (Now) — €0/month
5 engines working. Enough for beta testing and demo.

### Phase 2: Minimal (Add card, no spend) — €0/month
- **Prodia**: Create account → 1000 free calls, no card needed
- **Together.ai**: Add card → may reactivate free tier
- **Fireworks**: Add card → unsuspend account, $5 credits may still be there

### Phase 3: Low Budget — ~€5/month
- **fal.ai**: Top up $5 → ~1,666 renders
- **Replicate**: Add card, $5 → ~1,666 renders
- **OpenAI**: Add $5 credits → 250-1000 renders

### Phase 4: Full Production — ~€15-25/month
- All engines active with $5-10 each
- Total capacity: ~50,000+ renders/month
- Smart routing keeps costs minimal by using free engines first

## Startup Programs (Apply ASAP)

| Program | Credits | How to Apply |
|---------|---------|-------------|
| **Google Cloud for Startups** | $2,000 | cloud.google.com/startup |
| **Together.ai Startup** | $15,000-50,000 | together.ai/startups |
| **Modal Startups** | $25,000 | modal.com/startups |
| **DeepInfra DeepStart** | Up to 1B tokens | deepinfra.com/deepstart |
| **Replicate YC** | Credits for YC companies | Via YC partnership |

## Engine Capabilities Matrix

| Engine | text2img | img2img | Upscale | EU/GDPR | Speed |
|--------|----------|---------|---------|---------|-------|
| Pollinations | Yes | - | - | - | Fast |
| AI Horde | Yes | - | - | - | Slow |
| Cloudflare | Yes | - | - | **Yes** | Fast |
| Hugging Face | Yes | - | - | - | Medium |
| Leonardo | Yes | - | - | - | Medium |
| fal.ai | Yes | **Yes (Kontext)** | - | - | Fast |
| Together | Yes | **Yes (Kontext)** | - | - | Fast |
| Fireworks | Yes | - | - | **Yes** | Fast |
| Replicate | Yes | **Yes (ControlNet)** | - | - | Medium |
| Stability | Yes | **Yes (Structure)** | - | - | Medium |
| Prodia | Yes | - | - | - | Fast |
| DeepInfra | Yes | - | - | - | Fast |
| Segmind | Yes | - | **Yes** | - | Medium |
| Black Forest | Yes | - | - | **Yes** | Medium |
| OpenAI | Yes | - | - | - | Medium |

## Additional Engines Researched (Not Yet Integrated)

| Engine | Worth Adding? | Why |
|--------|-------------|-----|
| **Ideogram** | Yes (later) | Best text rendering in images, $0.04/img |
| **Recraft AI** | Yes (later) | Vector SVG output, design-focused |
| **Novita AI** | Yes (later) | $0.0015/img, 200+ models |
| **RunPod** | Maybe | Self-host ComfyUI, GDPR compliant |
| **Modal** | Maybe | $25K startup credits, Python SDK |
| Banana.dev | No | Shut down March 2024 |
| OctoAI | No | Acquired by NVIDIA, shut down Oct 2024 |
| Midjourney | No | No official public API |

## Tier → Engine Mapping

| User Tier | Engines Available | Cost Ceiling/Image |
|-----------|------------------|-------------------|
| guest_free | Pollinations, AI Horde, Cloudflare, HF, Together | $0.005 |
| free | Same as guest + Prodia | $0.01 |
| premium | All 15 engines | $0.05 |
| architect | All 15 engines (premium quality first) | $0.10 |
