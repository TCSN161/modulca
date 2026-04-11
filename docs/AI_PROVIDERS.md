# ModulCA AI Provider Accounts

> Living document. Update whenever adding/testing a new provider.
> Last updated: 2026-04-11

## Active Providers (integrated in codebase)

| # | Provider | Signup URL | Free Tier | API Key Env Var | Status | Cost/Image |
|---|----------|-----------|-----------|-----------------|--------|------------|
| 1 | **Pollinations** | No signup needed | Unlimited, free | _None needed_ | Active | $0.00 |
| 2 | **AI Horde** | https://stablehorde.net/register | Unlimited (community GPUs) | _Anonymous key: 0000000000_ | Active | $0.00 |
| 3 | **Stability AI** | https://platform.stability.ai | 25 free credits (~5-12 images) | `STABILITY_API_KEY` | Active | $0.04-0.065 |
| 4 | **Together.ai** | https://api.together.xyz/signin | Free unlimited 3 months (FLUX schnell) | `TOGETHER_API_KEY` | Active | $0.00 (schnell) / $0.04 (kontext) |
| 5 | **Leonardo.ai** | https://app.leonardo.ai/api-access | 150 tokens/day web, $5 API credits | `LEONARDO_API_KEY` | Configured, key empty | $0.03 |

## Priority Accounts to Create (for testing & production)

### Tier 1 - Create NOW (free, high value)

| # | Provider | Signup URL | Free Offer | Why | Action |
|---|----------|-----------|------------|-----|--------|
| 1 | **fal.ai** | https://fal.ai/dashboard | Free credits (90 day expiry) | Cheapest benchmarked, fastest inference, img2img + video | [ ] Create account |
| 2 | **Google Cloud** | https://cloud.google.com/startup/apply | $2,000 (bootstrap, no VC needed) | Imagen 4, Vertex AI, huge credit pool | [ ] Apply bootstrap tier |
| 3 | **Replicate** | https://replicate.com | Free runs + startup program ($1K-$10K) | Largest model ecosystem, ControlNet | [ ] Create account, [ ] Apply startup credits |
| 4 | **Hugging Face** | https://huggingface.co/settings/tokens | Free Inference API (rate-limited) | SDXL, FLUX models, no cost | [ ] Create account |
| 5 | **Cloudflare Workers AI** | https://dash.cloudflare.com | 10,000 free neurons/day | SDXL in Workers, EU regions, fast | [ ] Create account |
| 6 | **Segmind** | https://www.segmind.com | Free credits on signup | Cheapest upscaling ($0.005/img) | [ ] Create account |

### Tier 2 - Create SOON (free trials, good for premium tier)

| # | Provider | Signup URL | Free Offer | Why | Action |
|---|----------|-----------|------------|-----|--------|
| 7 | **OpenAI API** | https://platform.openai.com | $5 free credits (no expiry!) | GPT Image 1 Mini ~$0.005/img, premium quality | [ ] Create account |
| 8 | **NovitaAI** | https://novita.ai | $0.50 trial + up to $10K startup credits | 200+ models, $0.0015/img standard | [ ] Create account |
| 9 | **DeepInfra** | https://deepinfra.com | DeepStart program (up to 1B tokens free) | FLUX 2 Pro $0.014/img | [ ] Create account, [ ] Apply DeepStart |
| 10 | **Fireworks AI** | https://fireworks.ai | $1 free (~700 FLUX Schnell images) | Best GDPR (EU representative, SOC 2) | [ ] Create account |
| 11 | **Google Gemini API** | https://ai.google.dev | 500 requests/day free (ongoing!) | Gemini Flash image gen, batch 50% off | [ ] Create account |
| 12 | **WaveSpeedAI** | https://wavespeed.ai | Free credits on signup | 600+ models, Seedream 4.5, from $0.001/img | [ ] Create account |

### Tier 3 - Apply for BIG credits (cloud startup programs)

| # | Provider | Signup URL | Free Offer | Why | Action |
|---|----------|-----------|------------|-----|--------|
| 13 | **AWS Activate** | https://aws.amazon.com/startups/credits | $100K-$300K | Bedrock (Stability, Titan), huge runway | [ ] Apply |
| 14 | **Microsoft Founders Hub** | https://www.microsoft.com/en-us/startups | $150K Azure credits | Includes OpenAI models via Azure | [ ] Apply |
| 15 | **Together.ai Startup** | https://www.together.ai/startup-accelerator | $15K-$50K credits | 3 tiers (Build/Grow/Scale) by funding stage | [ ] Apply |

### Tier 4 - Create LATER (specialized, video/3D)

| # | Provider | Signup URL | Free Offer | Why | Action |
|---|----------|-----------|------------|-----|--------|
| 16 | **Runway** | https://app.runwayml.com | 125 credits (Builders Program: 500K) | Video generation (walkthrough animations) | [ ] Create account |
| 17 | **Luma AI** | https://lumalabs.ai | Free tier available | 3D generation, Dream Machine | [ ] Create account |
| 18 | **Krea AI** | https://krea.ai | 100 CU/day free (restrictive recently) | 8K upscaling, 40+ models | [ ] Create account |
| 19 | **Black Forest Labs** | https://bfl.ai | Open-weight models free locally | Source of all FLUX models, API from $0.014/img | [ ] Create account |

## Provider Comparison by Use Case

### img2img (3D screenshot -> photorealistic render)
| Provider | Model | Cost | Quality | Speed |
|----------|-------|------|---------|-------|
| Stability AI | Control/Structure | $0.065 | High | Medium |
| Together.ai | FLUX Kontext | $0.04 | High | Fast |
| fal.ai | Flux Kontext Pro | $0.04 | High | Fastest |
| Replicate | ControlNet + SDXL | ~$0.02 | Medium-High | Medium |

### text2img (prompt -> architectural visualization)
| Provider | Model | Cost | Quality | Speed |
|----------|-------|------|---------|-------|
| Together.ai | FLUX Schnell (free) | $0.00 | Good | Fast |
| Pollinations | Stable Diffusion | $0.00 | Decent | Fast |
| fal.ai | Seedream V4 | $0.03 | High | Fastest |
| OpenAI | GPT Image | ~$0.04 | Very High | Medium |

### Image Upscaling
| Provider | Model | Cost | Max Resolution |
|----------|-------|------|---------------|
| Segmind | Pruna P | $0.005 | 4x |
| Krea AI | Built-in upscaler | CU-based | 8K |
| Replicate | Real-ESRGAN | ~$0.01 | 4x |
| fal.ai | Various | ~$0.02 | 4x |

### Video Generation (walkthrough animations)
| Provider | Model | Cost/sec | Quality |
|----------|-------|----------|---------|
| fal.ai | Wan 2.5 | $0.05 | Good |
| Runway | Gen-3/4 | ~$0.10 | Very High |
| Luma | Dream Machine | Varies | High |

## Cost Ceiling Mapping (which providers work per tier)

| Tier | Max $/img | Allowed Providers |
|------|-----------|-------------------|
| guest_free | $0.005 | Pollinations, AI Horde, HuggingFace, Cloudflare Workers AI |
| free | $0.01 | Above + Together Schnell (free) |
| premium | $0.05 | Above + fal.ai, Segmind, Leonardo, Stability SD3, Together Kontext |
| architect | $0.10 | All including Stability Structure, OpenAI, Replicate premium |

## EU Compliance Notes

| Provider | GDPR Status | EU Regions | Notes |
|----------|------------|------------|-------|
| Fireworks AI | Best (EU representative, SOC 2, HIPAA) | Yes | Best for strict compliance |
| fal.ai | Partial (trust center, DPA) | Unknown | trust.fal.ai |
| Cloudflare | Good (EU regions) | Yes | Workers run in EU |
| Stability AI | UK-based (close to EU standards) | N/A | Community license <$1M revenue |
| Google Cloud | Full GDPR | Yes (eu-west) | Via Vertex AI |

## Startup Programs to Apply For

| Program | Value | Deadline | Status |
|---------|-------|----------|--------|
| Google Cloud Bootstrap | $2,000 | Rolling | [ ] Not applied |
| AWS Activate | $100K-$300K | Rolling | [ ] Not applied |
| Microsoft Founders Hub | $150K | Rolling | [ ] Not applied |
| Replicate Startup Credits | $1K-$10K | Rolling | [ ] Not applied |
| NovitaAI Startup Credits | Up to $10K | Rolling | [ ] Not applied |
| EIC Accelerator GenAI | Up to EUR 2.5M | 6 windows in 2026 | [ ] Not applied |
| Google Startups Accelerator EU | $350K + mentorship | Batches | [ ] Not applied |
| Runway Builders Program | 500K credits + fund | Rolling | [ ] Not applied |
