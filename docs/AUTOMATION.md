# ModulCA Automation Playbook

> Last updated: 2026-04-16

## Current Status (What's Automated)

| System | Status | How |
|--------|--------|-----|
| TypeScript check | ✅ | `npm run typecheck` / CI |
| Tests (129) | ✅ | `npm run test:run` / CI |
| Production build | ✅ | `npm run build` / CI |
| Ops health check | ✅ | `npm run ops:check` |
| Pre-deploy gate | ✅ | `npm run predeploy` |
| CI pipeline | ✅ | `.github/workflows/ci.yml` |
| Cloud save/load | ✅ | CloudSyncProvider auto-sync |
| Error boundaries | ✅ | Per-step + project-level |
| Stripe webhooks | ✅ | Auto tier sync on pay/cancel |
| Email templates | ✅ | Welcome, upgrade, cancel, payment failed |
| Env validation | ✅ | `/api/health` + env-check.ts |
| RLS policies | ✅ | Migration 004 |
| localStorage migration | ✅ | Auto on first auth |

## What Needs Human Action (One-Time)

### 1. Stripe: Test → Live Mode
**Why**: Currently sk_test_* — real payments need sk_live_*
**Steps**:
1. Go to https://dashboard.stripe.com/settings/integration
2. Toggle to "Live mode"
3. Copy live keys (sk_live_*, pk_live_*)
4. Update in Vercel env vars AND .env.local
5. Recreate products/prices in live mode (or they transfer automatically)
6. Update webhook endpoint URL to use live secret
7. Run `npm run ops:check` to verify

**Can we automate?** Partially — Stripe CLI can create products/prices via API.
Script could be written to migrate test prices to live.

### 2. Sentry DSN
**Why**: Error monitoring for production
**Steps**:
1. Go to https://sentry.io or create account
2. Create project "modulca-web" (Next.js)
3. Copy DSN string
4. Add as `NEXT_PUBLIC_SENTRY_DSN` in Vercel + .env.local
5. Sentry SDK is already installed and configured

**Can we automate?** Yes — Sentry has an API. Could script project creation.

### 3. Vercel Environment Variables Sync
**Why**: Production env vars need to match .env.local
**Steps**:
1. Go to https://vercel.com/[project]/settings/environment-variables
2. Add all variables from .env.local (use Production scope)
3. Or use: `vercel env pull` / `vercel env add`

**Can we automate?** YES — Vercel CLI:
```bash
# Install: npm i -g vercel
# Login: vercel login
# Sync: vercel env add VARIABLE_NAME production < value.txt
```
Future: Script to sync all env vars from .env.local to Vercel automatically.

### 4. Google OAuth (Already Done!)
**Status**: ✅ Enabled in Supabase — confirmed by ops check.

### 5. Custom Domain Email (Already Done!)
**Status**: ✅ modulca.eu verified in Resend — confirmed by ops check.

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
