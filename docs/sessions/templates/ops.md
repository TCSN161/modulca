# Template: Ops Chat (EXCLUSIVE)

**Use when**: Stripe test→live cutover, Vercel env vars sync, Supabase migrations, CI/CD workflow changes, secrets rotation, production incidents.

**Duration**: 15 min - 2h typical.

**HARD RULE: ONLY ONE OPS CHAT AT A TIME, EVER. Check TRACKER before spawning.**

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Ops Chat (EXCLUSIVE)
TASK ID: OPS-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN — MUST be zero other Ops chats. All other types may coexist.]

SCOPE: Production operations only — env vars, dashboards, migrations, CI. Zero application feature work.

ALLOWED PATHS:
  READ: full repo
  WRITE:
  - .env.local (local only — never committed, never staged)
  - supabase/migrations/**/*.sql (NEW files only — never edit existing migrations)
  - .github/workflows/*.yml (ops-exclusive)
  - vercel.json (ops-exclusive)
  - scripts/ops-*.mjs and scripts/env-*.mjs and scripts/stripe-*.mjs
  - docs/AUTOMATION.md (append records of what was changed in external systems)
  - docs/GDPR/DPA_Status.md (when vendor DPAs arrive)
  - docs/sessions/active/YYYY-MM-DD-ops-OPS-<id>.md (new)
  - docs/sessions/TRACKER.md (status)

FORBIDDEN:
  - Any src/ source code (that's feature work, not ops)
  - package.json (dependency changes require user decision)
  - Any git push --force / reset --hard

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md §2.6 (Ops Chat rules)
  2. docs/AUTOMATION.md (operational playbook)
  3. docs/ops-check output: `npm run ops:check`
  4. docs/sessions/TRACKER.md (verify no other Ops chat active!)
  5. Last 2 ops scratchpads if any

TYPICAL OPS TASKS:

── Task 1: Stripe test → live cutover ──────────────
Blocker check: `charges_enabled=true` confirmed in Stripe Dashboard after bank verification.

Procedure:
  1. Get live keys from Stripe Dashboard: Developers → API keys → Reveal live secret
  2. Run dry-run first: STRIPE_LIVE_SECRET=sk_live_... STRIPE_LIVE_PUBLISHABLE=pk_live_... npm run stripe:go-live:dry
  3. Review output — will show what products/prices/webhooks get created, no writes
  4. Actual run: same command without :dry
     Script auto-handles: create 3 products, 6 prices, webhook endpoint, webhook secret capture, .env.local write, Vercel env push, redeploy trigger
  5. Verify: npm run ops:check (should show Stripe mode = LIVE)
  6. First transaction test: visit modulca.eu/pricing, try a €0.50 test subscription with real card, confirm webhook fires, tier updates in Supabase, refund immediately

── Task 2: Vercel env sync ────────────────────────
  1. npm run env:sync:dry — shows diff between .env.local and Vercel prod
  2. Review each change (sensitive vars prompt for confirmation)
  3. Run npm run env:sync -- --yes (or without --yes for confirmation)
  4. Verify: npx vercel env ls (or check Dashboard)
  5. Trigger redeploy if env changes require restart: npx vercel --prod

── Task 3: Supabase migration ──────────────────────
If user asks to apply a new migration:
  1. Verify migration file is NEW (never edit existing migration number)
  2. Read the migration — ensure idempotent (if not exists / if not null / etc.)
  3. User runs in Supabase Dashboard SQL Editor (you can't run SQL directly)
  4. Confirm success in scratchpad
  5. Update docs/AUTOMATION.md with what was changed + when

── Task 4: Sentry DSN / monitoring setup ──────────
  1. Create sentry.io project (user action — needs their login)
  2. Copy DSN to .env.local (NEXT_PUBLIC_SENTRY_DSN)
  3. Push to Vercel: npx vercel env add NEXT_PUBLIC_SENTRY_DSN production
  4. Redeploy: npx vercel --prod
  5. Verify: check sentry.io for first error hit after deploy

── Task 5: DPA vendor status update ──────────────
When External Ops chat signals DPAs received:
  1. Update docs/GDPR/DPA_Status.md for each vendor
  2. Save DPA PDFs to local docs/legal/dpa/ (NOT git — secured storage)
  3. If all 6 signed: flag to main chat to replace live Privacy Policy with v2

OPERATING RULES (CRITICAL):
- BEFORE any write: `git status` + `npm run collision-check` + verify you're the only Ops chat
- NEVER run `git push --force` (deny rule blocks it anyway, but verbally never suggest it)
- NEVER commit `.env.local` or `.env.*` files (deny rule blocks it, but double-check)
- Secrets in committable files = STOP, revert, escalate
- Production changes: always announce in scratchpad BEFORE making change. After: confirm with ops:check.
- Rollback plan mandatory: for any production change, document exact rollback steps in the same scratchpad

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-ops-OPS-<id>.md with:
  ## Operation performed
  ## Systems changed (Stripe? Vercel? Supabase? Sentry? etc.)
  ## Pre-change verification (ops:check baseline)
  ## Post-change verification (ops:check after)
  ## Rollback plan (in case of issues)
  ## Handoff

Also append to docs/AUTOMATION.md a dated record of the change.

Final: commit + push + update TRACKER.md
If any production incident during session: create docs/GDPR/incidents/YYYY-MM-DD-<slug>.md using breach runbook template.

===== END SPAWN PROMPT =====
```

## 💡 Tips

- **Production ops are unsafe to parallelize.** If anything else writes to Vercel/Stripe/Supabase during your session, you WILL race.
- **Dry-run first, always.** Every ops script has a :dry flag. Use it.
- **Keep sessions short.** 15-90 min max. If you're in for 3+ hours, you're probably doing feature work, not ops — spawn a feature chat.
- **Evening / off-hours.** Production changes less risky when users are asleep (RO timezone — aim for 22:00-06:00 EET)
