# Platform Accounts — AI Providers & Services

## Overview

ModulCA uses multiple AI providers in a fallback chain. Each user tier gets access
to different quality levels. Start with free accounts, upgrade as revenue grows.

## AI Provider Accounts

### 1. Groq (Free Tier — Primary for Free Users)
- **URL**: https://console.groq.com
- **Model**: Llama 3.3 70B Versatile
- **Free limits**: 30 requests/min, 14,400 tokens/min, 500K tokens/day
- **Paid**: Pay-as-you-go, very cheap (~$0.59/1M tokens)
- **Quality**: Good for general architecture questions
- **ENV**: `GROQ_API_KEY=gsk_...`
- **Priority**: Create this account FIRST — it's free and fast

### 2. Together AI (Free Tier — Backup)
- **URL**: https://api.together.xyz
- **Model**: Llama 3.3 70B Instruct Turbo
- **Free limits**: $1 free credit on signup (~1M tokens)
- **Paid**: Pay-as-you-go ($0.88/1M tokens for Llama 3.3 70B)
- **Quality**: Similar to Groq, good redundancy
- **ENV**: `TOGETHER_API_KEY=...`
- **Priority**: Create second — backup for when Groq is rate-limited

### 3. OpenAI (Paid — Primary for Premium Users)
- **URL**: https://platform.openai.com
- **Model**: GPT-4o-mini
- **Free limits**: None (pay-as-you-go, but starts with $5 credit for new accounts)
- **Paid**: ~$0.15/1M input tokens, ~$0.60/1M output tokens (GPT-4o-mini)
- **Quality**: Significantly better than Llama for nuanced architectural advice
- **ENV**: `OPENAI_API_KEY=sk-...`
- **Priority**: Create when Premium subscribers start paying — ROI positive at ~100 queries/day
- **Cost estimate**: 100 queries/day × 4K tokens avg = 400K tokens/day = ~$0.24/day = ~$7/month

### 4. Anthropic (Paid — Primary for Architect Users)
- **URL**: https://console.anthropic.com
- **Model**: Claude Sonnet 4
- **Free limits**: None (pay-as-you-go)
- **Paid**: ~$3/1M input tokens, ~$15/1M output tokens (Claude Sonnet)
- **Quality**: Best for complex, multi-regulation architectural consultation
- **ENV**: `ANTHROPIC_API_KEY=sk-ant-...`
- **Priority**: Create when Architect subscribers justify the cost
- **Cost estimate**: 20 Architect queries/day × 12K tokens = 240K tokens/day = ~$3.60/day = ~$108/month
- **Note**: Can downgrade to Claude Haiku ($0.25/$1.25 per 1M) for cost savings

### 5. Pollinations (Free — Ultimate Fallback)
- **URL**: https://text.pollinations.ai
- **Model**: OpenAI (via their free proxy)
- **Free limits**: Unlimited (community project)
- **Quality**: Variable, sometimes slow
- **ENV**: None needed
- **Priority**: Already configured, no account needed

## Provider Chain by Tier

| Tier | Chain (in order) | Best Model | Fallback |
|------|-----------------|------------|----------|
| Free | Groq → Together → Pollinations | Llama 3.3 70B | Pollinations |
| Premium | OpenAI → Groq → Together → Pollinations | GPT-4o-mini | Groq |
| Architect | Anthropic → OpenAI → Groq → Together → Pollinations | Claude Sonnet | OpenAI |

## Other Platform Accounts (Non-AI)

### Supabase (Database + Auth)
- **URL**: https://supabase.com
- **Free limits**: 500MB database, 1GB storage, 50K monthly active users
- **Paid**: $25/month Pro (8GB DB, 100GB storage)
- **Status**: Already configured for ModulCA
- **ENV**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Stripe (Payments — Future)
- **URL**: https://stripe.com
- **Free limits**: No monthly fee, 2.9% + €0.25 per transaction
- **Priority**: Create when launching paid tiers
- **ENV**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Vercel (Hosting)
- **URL**: https://vercel.com
- **Free limits**: Hobby plan (100GB bandwidth, serverless functions)
- **Paid**: $20/month Pro (1TB bandwidth, more functions)
- **Priority**: Already using or plan to use
- **ENV**: Managed via Vercel dashboard

### Unsplash / Pexels (Image Assets)
- **URL**: https://unsplash.com/developers, https://www.pexels.com/api/
- **Free limits**: 50 requests/hour (Unsplash), 200 requests/hour (Pexels)
- **Priority**: For product/style imagery in the platform

## Setup Checklist

### Phase 1 — Launch (Free)
- [x] Pollinations (no account needed)
- [ ] Groq — create account, get API key
- [ ] Together — create account, get API key
- [ ] Add keys to `.env.local`

### Phase 2 — First Revenue
- [ ] OpenAI — create account, add $10 credit
- [ ] Add `OPENAI_API_KEY` to production env

### Phase 3 — Architect Tier Revenue
- [ ] Anthropic — create account, add $25 credit
- [ ] Add `ANTHROPIC_API_KEY` to production env
- [ ] Consider Claude Haiku for cost optimization

### Phase 4 — Scale
- [ ] Stripe — for subscription billing
- [ ] Monitor API costs vs subscription revenue
- [ ] Consider caching frequent queries (Redis/Supabase)
- [ ] Vector DB embeddings (OpenAI text-embedding-3-small)

## Monthly Cost Projections

| Users | Free Queries | Premium Queries | Architect Queries | Est. AI Cost | Est. Revenue |
|-------|-------------|----------------|-------------------|-------------|-------------|
| 100 | 500/month | 0 | 0 | ~$0.50 | $0 |
| 500 | 2,000/month | 500/month | 50/month | ~$5 | ~$1,000 |
| 2,000 | 5,000/month | 3,000/month | 500/month | ~$50 | ~$8,000 |
| 10,000 | 10,000/month | 15,000/month | 2,000/month | ~$300 | ~$40,000 |

AI costs remain < 1% of revenue at all scales. The main cost is development, not API usage.
