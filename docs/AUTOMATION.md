# ModulCA Automation Playbook

> Last updated: 2026-04-17

## Current Status (What's Automated)

| System | Status | How |
|--------|--------|-----|
| TypeScript check | ✅ | `npm run typecheck` / CI |
| Tests (147) | ✅ | `npm run test:run` / CI |
| Production build | ✅ | `npm run build` / CI |
| Ops health check | ✅ | `npm run ops:check` |
| Pre-deploy gate | ✅ | `npm run predeploy` |
| CI pipeline | ✅ | `.github/workflows/ci.yml` |
| Cloud save/load | ✅ | CloudSyncProvider auto-sync |
| Error boundaries | ✅ | Per-step + project-level + Sentry wired |
| Stripe webhooks | ✅ | Auto tier sync on pay/cancel |
| Email templates | ✅ | Welcome, upgrade, cancel, payment failed |
| Env validation | ✅ | `/api/health` + env-check.ts |
| RLS policies | ✅ | Migration 004 |
| localStorage migration | ✅ | Auto on first auth |
| **Env drift detection + sync** | ✅ | `npm run env:sync` (diffs .env.local ↔ Vercel prod) |
| **Stripe test→live cutover** | ✅ | `npm run stripe:go-live` (one command) |
| **Sentry user context** | ✅ | Auto-attached on signIn/loadSession, cleared on signOut |

## Remaining Human Actions

### 🔴 Stripe Bank Verification (Only Remaining Blocker)
**Why**: Stripe account needs a verified IBAN to activate live mode. This is the ONE thing that cannot be automated — the bank & Stripe both require a human.

**Steps** (tomorrow morning):
1. Call your bank to confirm IBAN is active and can receive SEPA payouts
2. Go to https://dashboard.stripe.com/settings/payouts
3. Enter IBAN, submit verification
4. Wait for Stripe to confirm (usually instant, max 2 business days)
5. When `charges_enabled=true` in Stripe dashboard, run:
   ```bash
   STRIPE_LIVE_SECRET=sk_live_xxx STRIPE_LIVE_PUBLISHABLE=pk_live_xxx \
     npm run stripe:go-live
   ```
   This script does everything in one shot:
   - Validates the live keys work
   - Creates Products (Premium/Architect/Constructor) in live mode
   - Creates 6 Prices (monthly + yearly per tier) at correct EUR amounts
   - Creates the webhook endpoint at https://modulca.eu/api/stripe/webhook and captures signing secret
   - Backs up test keys to `.env.local.test.bak`
   - Updates `.env.local` with live values
   - Syncs all changes to Vercel production via CLI
   - Triggers a production deploy
6. Run `npm run ops:check` to verify "Stripe mode: LIVE"

**Dry-run first**: `npm run stripe:go-live:dry` validates keys & shows what would change, without writing anything.

### ✅ Done (previously manual, now automated where possible)
- Sentry DSN — set in .env.local + Vercel (script-assisted via `env:sync`)
- Vercel env variables — sync via `npm run env:sync` (idempotent; shows diff, asks confirmation)
- Resend domain + FROM — verified; templates live
- Google OAuth — enabled in Supabase
- Knowledge Library — 82+ articles auto-indexed at build time

## New Automations (Added 2026-04-17)

### `npm run env:sync` — Env Drift Correction
Diffs `.env.local` against `vercel env pull`, shows a colored diff, asks for confirmation, then applies only the differences. Skips vars that should differ (`NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, `DATABASE_URL`). Masks values in the diff so secrets don't hit the terminal history.

- `npm run env:sync:dry` — see diff, don't write
- `npm run env:sync -- --yes` — auto-apply without confirmation
- `npm run env:sync -- --env=preview` — target preview env instead of production

**Caught a real bug on first run**: Vercel had a stray tab character prefixing `NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY`, which would have broken Constructor checkout in production. Fixed in seconds.

### `npm run stripe:go-live` — Test→Live Cutover
Single command when Stripe account activates. Validates keys, creates live products/prices, sets up webhook, writes `.env.local`, syncs Vercel, deploys. See Stripe section above.

### Sentry user context (automatic)
Via `src/shared/lib/monitoring.ts` + auth store integration. When any error is captured in production, it's tagged with the user's ID and email automatically. No code changes needed at call sites — `captureException(err)` or unhandled errors via error boundaries both carry user context.

## Automation Layers (Future-Proof Architecture)

### Layer 1: CI/CD (Active)
```
Push → GitHub Actions → TypeScript + Tests + Build → Vercel Deploy
```

### Layer 2: Health Monitoring (To Build)
```
Cron (every 5min) → /api/health → Check response → Alert on failure
```
Options:
- **BetterUptime** (free tier: 10 monitors)
- **UptimeRobot** (free tier: 50 monitors)
- **Vercel Cron** (built-in, no extra service)

### Layer 3: Automated Alerts (To Build)
```
Stripe webhook failure → Sentry alert → Email to admin
Supabase error rate > threshold → Alert
Build failure → GitHub notification → Slack/email
```

### Layer 4: Self-Healing (Future)
```
User can't save → Auto-fallback to localStorage
AI render fails → Auto-retry with different engine
Database timeout → Cached response
Email fails → Queue for retry
```

### Layer 5: Analytics Pipeline (Future)
```
User actions → Vercel Analytics + Clarity
Revenue → Stripe Dashboard
Errors → Sentry
Performance → Vercel Speed Insights
Custom → /api/analytics (to build)
```

## Scheduled Tasks (Claude Code)

### Daily Ops Check
```bash
# Run every morning at 8:00 AM
npm run ops:check:json > /tmp/ops-report.json
# Could be automated via:
# - GitHub Actions scheduled workflow
# - Vercel Cron
# - Claude Code scheduled task
```

### Weekly Tasks (Manual → Automate)
- [ ] Review Sentry errors
- [ ] Check Stripe MRR dashboard
- [ ] Review user signups in Supabase
- [ ] Check AI render engine health
- [ ] Review Vercel build logs

## Resilience Patterns (Antifragile)

### 1. Multi-Layer Persistence
```
User data → localStorage (instant) + Supabase (durable) + Export (portable)
```
If Supabase goes down: localStorage keeps working.
If browser clears: Supabase has the backup.
If both fail: User can re-import from exported JSON/PDF.

### 2. AI Engine Failover
```
Primary → Secondary → Tertiary → Cached result
```
15 AI engines configured. Auto-fallback chain already in render route.

### 3. Payment Resilience
```
Stripe webhook → Update tier → Email confirmation
Webhook fails → Retry (Stripe retries for 72h)
Payment fails → Grace period → Downgrade → Re-upgrade easy
```

### 4. Deployment Resilience
```
Vercel → Automatic rollback on build failure
                → Preview deployments for PRs
                → Edge caching for static assets
```

### 5. Data Export (User Independence)
Every user can export:
- PDF presentation (Step 13)
- Technical drawings (Step 9)
- Cost breakdown (Step 12)
- Design state JSON (Save button)

Users are never locked in. This is antifragile by design.

## Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run typecheck              # TypeScript check only
npm run test:run               # Run all tests

# Operations
npm run ops:check              # Full system health audit
npm run ops:check:json         # Machine-readable output
npm run ops:check:ci           # Exit code 1 on failures

# Deploy
npm run predeploy              # Pre-deploy gate (blocks if issues)
npm run build                  # Production build

# Maintenance
npm run build:kb               # Rebuild knowledge base index
```
