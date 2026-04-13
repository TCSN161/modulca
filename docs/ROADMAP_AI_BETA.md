# ModulCA AI Render System — Beta Roadmap

> Master plan: Apr 11 → May 1, 2026
> Rule: modular, non-destructive, coherent, efficient

## What's Already Done (Apr 11)

- [x] Phase 1: costUsd + latencyMs tracking on all 5 engines
- [x] Phase 1: maxCostUsdPerImage per tier (cost ceiling enforcement)
- [x] Phase 1: PolicyFlags for EU compliance (allowChinaProviders: false)
- [x] Phase 1: guest_free tier (3 renders/mo, SD only, free engines only)
- [x] Phase 2: Supabase schema — monthly render quota columns + migration SQL
- [x] Phase 2: Auth store — canUseMonthlyRender() + incrementMonthlyRenders(costUsd)
- [x] Phase 2: RenderPage.tsx migrated from localStorage to auth store
- [x] Provider tracking doc at docs/AI_PROVIDERS.md
- [x] Provider-agnostic adapter architecture (engines/types.ts interface)

---

## Parallel Tracks

### TRACK A — Costin (accounts, apply, test)
### TRACK B — Claude (code, integrate, build)

These run at the same time. Track B does NOT need API keys for steps 1-4.

---

## TRACK A — Costin's Actions (in order)

### A1. Run Supabase migration (5 min) — DO FIRST
1. Open Supabase SQL Editor at https://supabase.com/dashboard
2. Paste and run contents of `supabase/migrations/002_monthly_render_quota.sql`
3. Verify: `SELECT ai_renders_this_month, ai_renders_month, total_cost_usd FROM profiles LIMIT 1;`

### A2. Create free accounts (10 min each, no credit card)

| Order | Provider | URL | What you get | Priority |
|-------|----------|-----|-------------|----------|
| 1 | **fal.ai** | https://fal.ai/dashboard | Free credits, all 4 features | CRITICAL — top pick |
| 2 | **Cloudflare Workers AI** | https://dash.cloudflare.com | 10K neurons/day FOREVER | CRITICAL — permanent free |
| 3 | **Replicate** | https://replicate.com | Free runs, ControlNet | HIGH — largest ecosystem |
| 4 | **Hugging Face** | https://huggingface.co/settings/tokens | Free inference API | HIGH — open source |
| 5 | **Segmind** | https://segmind.com | Free credits, $0.005 upscale | MEDIUM — upscaling |
| 6 | **OpenAI API** | https://platform.openai.com | $5 free (no expiry!) | MEDIUM — premium quality |

**After each signup:** copy the API key and add to `.env.local`:
```env
FAL_API_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
REPLICATE_API_TOKEN=...
HUGGINGFACE_API_TOKEN=...
SEGMIND_API_KEY=...
OPENAI_API_KEY=...
```

### A3. Apply for startup programs (15-30 min each)

| Order | Program | URL | Value | When |
|-------|---------|-----|-------|------|
| 1 | **Google Cloud Bootstrap** | https://cloud.google.com/startup/apply | $2,000 | This week |
| 2 | **Together.ai Startup** | https://www.together.ai/startup-accelerator | $15K-$50K | This week |
| 3 | **Replicate Startup** | Contact via site | $1K-$10K | This week |
| 4 | **NovitaAI Startup** | https://novita.ai | Up to $10K | This week |
| 5 | **AWS Activate** | https://aws.amazon.com/startups/credits | $100K-$300K | Next week |
| 6 | **Microsoft Founders Hub** | https://www.microsoft.com/en-us/startups | $150K | Next week |

### A4. Apply for EU funding (needs pitch deck)

| Program | Value | Deadline |
|---------|-------|----------|
| **EIC Accelerator GenAI** | Up to EUR 2.5M | 6 windows in 2026 |
| **Google Startups Accelerator EU** | $350K + mentorship | Batch-based |
| **GenAI4EU** | ~EUR 700M pool | Rolling |

---

## TRACK B — Claude's Coding Tasks (in order)

### B1. Prepare engine stubs — NO API KEY NEEDED (Apr 11-12)
Build the adapter files for all new providers so they're ready to activate
the moment Costin adds API keys. Each engine follows the existing pattern.

- [x] `engines/fal.ts` — img2img (Kontext Pro) + text2img (FLUX Schnell)
- [x] `engines/cloudflare.ts` — text2img (FLUX Schnell, 10K neurons/day free)
- [x] `engines/replicate.ts` — img2img (ControlNet) + text2img (FLUX Schnell)
- [x] `engines/huggingface.ts` — text2img (FLUX Schnell)
- [x] `engines/segmind.ts` — text2img (SDXL) + upscaling ready
- [x] `engines/openai.ts` — GPT Image 1 + DALL-E 3 fallback (premium tier)
- [x] Update route.ts — 11 engines registered, smart fallback chains by task type
- [x] Update renderConstants.ts — all 11 engines in UI dropdown

### B2. Smart routing by use case (Apr 12-13)
Update the router to pick the best engine based on task type, not just cost:

```
img2img chain:  Stability → fal → Together Kontext → Replicate ControlNet
text2img chain: Together Schnell → Cloudflare → fal → HuggingFace → Pollinations
upscale chain:  Segmind → fal → Replicate Real-ESRGAN
```

### B3. Render caching in Supabase Storage (Apr 14-16)
- [ ] Create Supabase Storage bucket `renders`
- [ ] After each render: upload image, store URL instead of base64
- [ ] Prompt hash → check cache before calling any engine
- [ ] Never regenerate the same prompt+seed+engine twice

### B4. Renders table for analytics (Apr 16-17)
- [ ] SQL: CREATE TABLE renders (id, user_id, provider, model, cost_usd, latency_ms, prompt, width, height, created_at)
- [ ] Log every render after generation
- [ ] Admin SQL views for cost/provider/tier breakdowns

### B5. Resolution tiering (Apr 17-18)
From the research strategy: drafts at 512px (cheap), only upscale finals.
- [ ] Add "Draft" mode: 512x288, cheapest engine, no cache
- [ ] Add "Final" mode: full resolution, best engine for tier, cached
- [ ] Auto-suggest: "Generate draft first, then upscale?"

### B6. Activate Stripe (Apr 19-22)
- [ ] Connect Payment Links
- [ ] Set real STRIPE_PRICE_* env vars
- [ ] Re-enable tier limits (remove -1 unlimited from free tier)
- [ ] Test: guest → free signup → premium upgrade flow

### B7. Deploy to modulca.eu (Apr 23-25)
- [ ] Verify all env vars on production
- [ ] Test each engine on production
- [ ] Monitor cost headers in production logs

### B8. Final polish (Apr 26-30)
- [ ] Error messages for each engine failure
- [ ] "Try cheaper mode" CTA when over budget
- [ ] Show cost estimate before generating (tier-aware)
- [ ] Upscale button on saved renders

---

## Combined Timeline

| Date | Costin (Track A) | Claude (Track B) |
|------|-------------------|-------------------|
| **Apr 11** | A1: Run migration SQL | Already done: Phase 1 + Phase 2 |
| **Apr 11-12** | A2: Create fal.ai + Cloudflare accounts | B1: Build all engine stubs |
| **Apr 12-13** | A2: Create Replicate + HF + Segmind + OpenAI | B2: Smart routing by use case |
| **Apr 13-14** | A3: Apply Google Bootstrap + Together Startup | B1+B2: Activate engines as keys come in |
| **Apr 14-16** | A3: Apply Replicate + NovitaAI startups | B3: Render caching (Supabase Storage) |
| **Apr 16-17** | Test renders on localhost, report quality | B4: Renders table + analytics |
| **Apr 17-18** | A3: Apply AWS + Microsoft | B5: Resolution tiering |
| **Apr 19-22** | Set up Stripe products + Payment Links | B6: Activate Stripe in code |
| **Apr 23-25** | Final review on modulca.eu | B7: Deploy to production |
| **Apr 26-30** | User acceptance testing | B8: Final polish |
| **May 1** | BETA LAUNCH | |

---

## Budget Strategy (from research)

| Phase | Monthly Cost | How |
|-------|-------------|-----|
| Now → Beta | EUR 0 | Free tiers only (Together, Cloudflare, Pollinations, AI Horde) |
| Beta → Month 1 | EUR 0-5 | Cloud credits (Google $2K, startup programs) |
| Month 2-6 | EUR 5-15 | fal.ai PAYG for premium users, free engines for free tier |
| Month 6+ | EUR 15-35 | Scale with paying users, apply revenue to API costs |

---

## Architecture Checklist (from Perplexity handoff)

| Requirement | Status |
|-------------|--------|
| Frontend never calls providers directly | DONE — all via /api/ai-render |
| Backend owns routing, quotas, moderation | DONE — route.ts + auth store |
| Provider-agnostic interface | DONE — AiRenderEngine type |
| Cost tracking per generation | DONE — costUsd + latencyMs |
| Tier-based cost ceiling | DONE — maxCostUsdPerImage |
| EU policy flags | DONE — PolicyFlags with allowChinaProviders |
| Monthly quota (server-side) | DONE — Supabase migration ready |
| Fallback chains | DONE — auto-fallback on failure |
| Content filter workarounds | DONE — prompt sanitization |
| Async queue system | NOT NEEDED — direct API calls work for current scale |
| Image CDN storage | B3 (next) — Supabase Storage |
| Render analytics table | B4 (next) — renders table |
| Resolution tiering | B5 (next) — draft vs final |
| Stripe billing | B6 (next) — Payment Links |
| Admin dashboard | LATER — use Supabase SQL views first |
| Video generation | LATER — after image pipeline is stable |
| 3D asset generation | LATER — Phase 3+ |
