# MCA-HANDOFF-4-PRICES-ACCOUNTS-2026-11-19

**From**: Chat 3 (AI Engines & Rendering)
**To**: Chat 4 (Prices, Accounts, Subscriptions, Billing)
**Date**: 2026-11-19
**Status**: 4 items for your action — all cost-sensitive

---

## 1. Context — pricing tier structure consolidated

Chat 3 has mapped all 23 known AI engines to a 5-band cost structure.
Full detail in `docs/MCA-DOC-AI-ENGINES-EXTENDED-2026-11.md §3`. Summary:

| Band | Range per call | Which subscription unlocks it |
|---|---|---|
| 🟢 FREE | $0 | Guest, Free, Premium, Architect, Constructor |
| 🟢 BUDGET | $0.001 – $0.005 | Premium (€19.99/mo) + above |
| 🟡 MID | $0.005 – $0.02 | Architect (€49.99/mo) + above |
| 🟠 PREMIUM | $0.02 – $0.10 | Constructor (€149.90/mo) only |
| 🔴 ENTERPRISE | > $0.10 | Custom contracts only |

Each subscription has a per-call ceiling that enforces >75% margin even
at the user's fastest usage pattern.

---

## 2. Items for your action

### ITEM-1 (critical — pre-Beta, ~2h) — U9: creditManager bands sync

File: `src/app/api/ai-render/engines/creditManager.ts`

Currently enforces per-engine daily caps but was written April 2026 with
old price assumptions. Needs update to reflect:

1. The 5-band structure above.
2. Per-subscription per-month total cap:
   - Free: $0 total (no paid engines allowed, period)
   - Premium: $5/month total hard ceiling (margin preservation)
   - Architect: $15/month total hard ceiling
   - Constructor: $40/month total hard ceiling
3. Auto-demote behavior: when a month-cap is 80% hit, user's next calls
   silently downgrade to the next cheaper band.
4. Reset on 1st UTC of each month.

**Why Chat 4 owns this**: credit-manager is the enforcement layer between
Chat 3's engines and the subscription tiers in `src/features/auth/types.ts`.
Price decisions and subscription semantics are Chat 4 scope.

**Dependencies**: I've documented the current per-engine prices in
`src/features/admin/engine-billing-data.json` (23 rows). Credit manager
should consume that file instead of hardcoding prices.

### ITEM-2 (pre-Beta, 2 min + $0) — WaveSpeed signup

Ready to activate:
- Vercel env placeholder `WAVESPEED_API_KEY=""` already set (prod + dev).
- Engine code live at `src/app/api/ai-render/engines/wavespeed.ts`.
- Billing registry entry already in `engine-billing-data.json`
  (role: "backup").
- Admin dashboard already lists it.

**To activate**:
1. Signup at https://wavespeed.ai (free credits on account creation)
2. Generate API key
3. Paste real value into Vercel: `vercel env rm WAVESPEED_API_KEY production`
   then `vercel env add WAVESPEED_API_KEY production`
4. Redeploy (empty commit + push, or trigger via Vercel dashboard)

**Why Chat 4**: account creation + signup is accounts/billing territory.
Chat 3 just owns the engine code.

### ITEM-3 (pre-Beta, 2 min + $0) — Novita signup

Same workflow as WaveSpeed:
- Vercel placeholder `NOVITA_API_KEY=""` set
- Engine at `src/app/api/ai-render/engines/novita.ts`
- Signup: https://novita.ai (gets $0.50 trial credit automatically)
- Same vercel env rm/add + redeploy

### ITEM-4 (Phase 2 only — don't do yet) — DeepSeek $5 top-up

Key saved locally as `DEEPSEEK_API_KEY` in `.env.local`, **not synced to
Vercel** (key is valid but balance is $0 — unusable). When Chat 2
(NeufertAI) kicks off Phase 2 CATUC translate and signals it needs
DeepSeek for bulk code exec:

1. Login to platform.deepseek.com with existing account
2. Billing → Top-up → $5 (prepaid, no auto-renewal)
3. Sync to Vercel: `echo "sk-..." | vercel env add DEEPSEEK_API_KEY production`
4. Redeploy

**Hard rule**: never top-up unless Chat 2 explicitly requests it. It must
be revenue-aligned.

---

## 3. For your awareness — pricing recommendations

### 3.1 Current subscription prices are RIGHT for Nov 2026 cost curves

- Premium €19.99 → with BUDGET-band engines ($0.003/img), 1000 renders/mo
  costs us $3 = 85% margin. **Keep.**
- Architect €49.99 → with MID-band ($0.02/img), 500 renders/mo costs $10 =
  80% margin. **Keep.**
- Constructor €149.90 → with PREMIUM-band ($0.065/img), 500 renders/mo
  costs $32 = 79% margin. **Keep.**

### 3.2 Beta Bonus (3 months Premium free) stress test

If 20 beta users all hit Premium-level usage for 3 months without paying:
- Max load: 20 × 1000 renders/mo × 3 mo = 60K renders
- If all go to Fireworks ($0.0014/img): $84 total
- If we steer to HERO engines (Cloudflare, Pollinations, Gemini): **$0**
- Credit manager auto-tier-down should ensure we never exceed $30/mo across
  all 20 beta users combined.

**Risk**: a single user running batch scripts could burn $30 in one hour.
Protect via per-user daily call cap in credit manager (suggest: 100 calls/day
for Premium, 50 for Free).

### 3.3 Stripe test → live cutover (not in this handoff but reminder)

Our `STRIPE_SECRET_KEY` on Vercel is `sk_test_...`. Still TEST mode.
When CUI/bank details are ready (Costin's firma registration flow), run:
```
npm run stripe:go-live:dry    # dry-run first
npm run stripe:go-live         # actual cutover
```

Not Chat-3 territory but putting it on your radar since it's your scope.

---

## 4. What I DON'T recommend

- **Do not add OpenRouter aggregator** — their 5% margin eats our cheap-first
  strategy.
- **Do not activate ENTERPRISE band** (Sora 2 / Veo 3.5) until custom
  enterprise contracts land. $0.05-0.08/sec video burns a Constructor tier's
  entire monthly revenue in 30 minutes of generation.
- **Do not raise Premium to €24.99** — our margin is already healthy and
  €19.99 is a psychological price point for Romanian market.

---

## 5. Response expected

- ITEM-1 (creditManager U9): please confirm ownership + ETA. Chat 3 will
  not touch it unless you explicitly delegate back.
- ITEM-2 / ITEM-3 (WaveSpeed / Novita): no response needed — just do when
  costin has 5 minutes. Chat 3's weekly model-check will verify the keys
  go live automatically.
- ITEM-4 (DeepSeek top-up): please hold until Chat 2 explicitly requests.
