# MCA-DOC-AUDIT-2026-11-19

**Status**: Active plan — audit running now  
**Owner**: Claude Code (Opus 4.7) + Costin Muraru  
**Scope**: Verify every claim in [[MCA-DOC-STATUS-2026-11-19]] against reality  
**Mode**: READ-ONLY. Zero code changes in this phase.  
**Est. duration**: Nov 19-25, 2026 (1 week)

---

## 1. Methodology

For each check:
1. **Claude automates** what's possible from the terminal (ops:check, build, grep, API ping)
2. **User assists** where external account access needed (dashboards, bank, 2FA)
3. **Record** result in this doc, section by section
4. **If BLOCKER found** — stop, propose fix, don't proceed until resolved

Each check has:
- ID (A1, A2, ...)
- Owner (Claude / User / Both)
- Expected outcome
- Actual outcome (filled during audit)
- Severity if failing: 🟥 Critical / 🟨 Important / 🟩 Low

---

## 2. Automated Checks (Claude self-run)

### CHECK-A0: Environment baseline
- **Owner**: Claude
- **Commands**: `node -v`, `npm -v`, `git --version`, `git log -1`, `git status`
- **Expected**: Node ≥ 18, npm ≥ 9, git clean except docs/references/catuc/
- **Status**: ⏳ Running

### CHECK-A1: Build pipeline
- **Owner**: Claude
- **Commands**: `npm install` (if needed) → `npm run prebuild` → `npm run build`
- **Expected**: Build succeeds, no TypeScript errors, bundle size reasonable (<10MB total)
- **Severity if fails**: 🟥 Critical
- **Status**: ⏳ Pending

### CHECK-A2: Type check
- **Owner**: Claude
- **Command**: `npm run typecheck`
- **Expected**: 0 errors
- **Severity**: 🟨 Important
- **Status**: ⏳ Pending

### CHECK-A3: Lint
- **Owner**: Claude
- **Command**: `npm run lint`
- **Expected**: 0 errors (warnings OK)
- **Severity**: 🟩 Low
- **Status**: ⏳ Pending

### CHECK-A4: Unit tests
- **Owner**: Claude
- **Command**: `npm run test:run`
- **Expected**: All pass (was 147 tests passing April)
- **Severity**: 🟨 Important
- **Status**: ⏳ Pending

### CHECK-A5: ops:check (comprehensive readiness) ✅ COMPLETE
- **Owner**: Claude (done 2026-11-19 ~afternoon)
- **Command**: `npm run ops:check`
- **Expected**: 28/28 OK or document what broke
- **Severity**: 🟥 Critical → downgraded 🟨 Important (fixable in 2 min dashboard click)
- **Status**: ✅ DONE — **25 ✅ / 4 ⚠️ / 2 ❌**
- **Findings**:
  - 🟥 Supabase REST API: fetch failed → auto-pause suspected
  - 🟥 Supabase Projects table: fetch failed → same
  - 🟨 Supabase Profiles + Auth: fetch failed → same root cause
  - 🟩 Stripe TEST mode (expected)
  - 🟩 Working tree: 1 uncommitted (CATUC folder — intentional)
- **Fix action**: User logs supabase.com/dashboard → click "Restore" / "Resume" project → rerun ops:check
- **Log location**: `scratchpad/ops-check-2026-11-19.log`

### CHECK-A6: AI engines audit
- **Owner**: Claude
- **Command**: `npm run engines:audit:json`
- **Expected**: 5+ AI providers return 200 OK; keys still valid
- **Severity**: 🟨 Important
- **Status**: ⏳ Pending

### CHECK-A7: Domain reachability (modulca.eu)
- **Owner**: Claude
- **Commands**: `curl -I https://modulca.eu` + `curl https://modulca.eu/api/health`
- **Expected**: 200 OK on homepage, JSON response on health endpoint
- **Severity**: 🟥 Critical
- **Status**: ⏳ Pending

### CHECK-A8: CATUC reference scan
- **Owner**: Claude
- **Command**: `grep -rE "Lege(a)? (nr\\. )?(50/1991|350/2001)" src/ docs/blog-drafts/`
- **Expected**: Produce list of ALL files needing updates (should match the 11 known)
- **Severity**: 🟨 Important
- **Status**: ⏳ Pending

### CHECK-A9: Package.json audit
- **Owner**: Claude
- **Commands**: `npm outdated`, `npm audit`
- **Expected**: List outdated + any security advisories (likely many after 7mo pause)
- **Severity**: 🟨 Important (depends on findings)
- **Status**: ⏳ Pending

### CHECK-A10: Session artifacts integrity
- **Owner**: Claude
- **Check**: `docs/sessions/TRACKER.md` shows April state. Needs re-baseline.
- **Severity**: 🟩 Low
- **Status**: ⏳ Pending (update as part of MCA-LOG)

---

## 3. User-assisted Checks (user runs or provides info)

### CHECK-B1 — Vercel deploy status (Owner: User + Claude)

**What**:
- Login at https://vercel.com
- Open "modulca" project
- Verify: tier (Hobby/Pro), production domain modulca.eu, last deployment date, build success

**User provides** (Y/N answers):
- [ ] Is tier Hobby? (we want this — free)
- [ ] Is modulca.eu linked and production? 
- [ ] Last successful deploy date?
- [ ] Any failed deployments shown?
- [ ] Analytics enabled (would require Pro)?

**Screenshot to send me**: Vercel project overview page.

### CHECK-B2 — Supabase status (Owner: User + Claude)

**What**:
- Login at https://supabase.com/dashboard
- Open ModulCA project

**User provides**:
- [ ] Project region = Frankfurt (eu-central-1)?
- [ ] Project tier = Free?
- [ ] Database size (GB used / limit)
- [ ] API requests last 7 days (should be low if paused)
- [ ] `auth.users` count (new signups during pause?)
- [ ] Last migration number applied (SQL Editor → look at history)
- [ ] Migration 009 run status (from TRACKER.md blockers)

**Screenshot**: Project dashboard home.

### CHECK-B3 — Stripe account status (Owner: User + Claude)

**What**:
- Login at https://dashboard.stripe.com
- Toggle: are we in Test mode or Live mode?

**User provides**:
- [ ] Current mode (Test / Live)?
- [ ] Bank account verified? (needed for live cutover)
- [ ] IBAN registered?
- [ ] Business verification complete? 
- [ ] 4 tiers × 2 periods = 8 price IDs match .env.local?
- [ ] Any test payments ever processed?
- [ ] Webhook endpoint status (modulca.eu/api/webhooks/stripe — active?)

**Screenshot**: Settings → Business settings → Public info + Compliance info.

### CHECK-B4 — Resend domain (Owner: User + Claude)

**What**:
- Login at https://resend.com
- Open Domains section

**User provides**:
- [ ] Domain modulca.eu status = Verified (green)?
- [ ] DKIM + SPF + DMARC records all green?
- [ ] Monthly email usage (0 / 3000)?
- [ ] Any bounces or complaints logged?

**Screenshot**: Resend → Domains → modulca.eu.

### CHECK-B5 — Sentry status (Owner: User)

**What**:
- Login at https://sentry.io
- Open ModulCA project

**User provides**:
- [ ] Project exists and active?
- [ ] Any errors logged recently (should be few/none if paused)?
- [ ] Quota usage: 0 / 5000 errors/month?

**Alternative**: if user not sure Sentry exists → it's documented in `docs/EMAIL_SETUP.md` or `docs/ROADMAP_AI_BETA.md`. Claude verifies configuration from env.

### CHECK-B6 — AI subscriptions (all services)

**User confirms**:
- [x] Claude Pro — ACTIVE €18/mo
- [x] ChatGPT Plus — ACTIVE €20/mo
- [ ] Perplexity — ACCOUNT exists, Pro status TBD. User logs in, checks Account → Subscription.
- [x] NotebookLM — FREE account OK (no Pro needed per MCA-STRAT-AI-DELEGATION)
- [ ] Vercel — TBD (See A1)
- [ ] Supabase — TBD (See A2)

### CHECK-B7 — Domain registrar (Owner: User)

**What**:
- Login at Namecheap (or wherever modulca.eu registered)

**User provides**:
- [ ] Renewal date of modulca.eu
- [ ] Autorenewal on?
- [ ] Payment method on file (card, exp date)?
- [ ] Any other reserved domains (modulca.ro, .com, etc.)?

---

## 4. Legal & Human Audit (Owner: User, Claude documents)

### CHECK-C1: Arhitect semnatar formal
- **Status**: Vlad Ioniță confirmed as named architect
- **Needed**: formal contract Costin ↔ Vlad for Q1 2027 signing commitments
- **Deadline**: Before Dec 15 invite-only beta (to avoid legal exposure)

### CHECK-C2: Engineers (structuri + instalații)
- **Status**: In progress, not confirmed
- **Action**: User to have 2 names by Dec 1 (priority for case study pipeline)

### CHECK-C3: Module producer
- **Status**: Discussions paused, need resume
- **Action**: User to contact prior producer within 2 weeks

### CHECK-C4: Cornetu plot
- **Status**: Exists, access complicated, metro zone TBD
- **Action**: Verify together using Primăria Sector + PUG online

### CHECK-C5: GDPR / DPAs (6 vendors from EXT-OPS-001)
- **Status**: Prep done April; outreach never sent
- **Action**: Decide: resume outreach now or in Dec?

---

## 5. Content & SEO Audit (Owner: Claude)

### CHECK-D1: Live site state (modulca.eu)
- Homepage loads? ✅ / ❌
- 14 step pages render? 
- NeufertAI responds?
- Payment flow starts (test checkout)?
- Mobile responsive (375px)?
- RO/EN language switch works?

**Method**: Use built-in browser to visit modulca.eu + each step. Screenshot issues.

### CHECK-D2: SEO health (quick)
- `curl https://modulca.eu/sitemap.xml` returns valid XML?
- `curl https://modulca.eu/robots.txt` present?
- Meta tags on homepage sensible?

### CHECK-D3: Analytics check
- GA4 property ID matches .env.local?
- Clarity project ID matches?
- (If user wants proof) send test event

---

## 6. Dependency Health (Owner: Claude)

### CHECK-E1: Node modules outdated
- `npm outdated | head -30` → list
- Major version bumps needed? (Next.js 16 → 17? etc.)

### CHECK-E2: Security advisories
- `npm audit` → fix high/critical if any
- Proactive: known CVEs since April 2026?

### CHECK-E3: Supabase client version
- `npm list @supabase/supabase-js` — still supported? Needs upgrade?

### CHECK-E4: Stripe SDK version
- `npm list stripe` — API version pinned? Still supported by Stripe?

### CHECK-E5: Anthropic SDK version
- `npm list @anthropic-ai/sdk` — supports claude-sonnet-5-5 / claude-opus-4-7?
- If no: upgrade before NeufertAI model upgrade

---

## 7. AI Landscape Audit (Owner: Claude)

Research what changed in AI between Apr 2026 and Nov 2026:

- [ ] Claude: 4.5 → 5.5? Sonnet 5.5 pricing vs Sonnet 4?
- [ ] OpenAI: GPT-5 released? Deprecated models we use?
- [ ] Gemini: 2.5 → 3.0? Breaking changes?
- [ ] Groq: new models? Rate limit changes?
- [ ] DeepSeek: V3 → V4? New reasoning models?
- [ ] Open-source: anything we should consider for self-hosting?

**Output**: `docs/MCA-DOC-AI-LANDSCAPE-2026-11.md` (separate doc, 1-2 pages).

---

## 8. Audit Deliverables

End of audit (target: Nov 25) produces:

1. **This file updated** with all CHECK results
2. **MCA-DOC-STATUS-2026-11-25.md** — snapshot AFTER audit (what's confirmed working)
3. **MCA-DOC-BLOCKERS-2026-11-19.md** — prioritized list of what's broken, severity, fix cost
4. **MCA-DOC-AI-LANDSCAPE-2026-11.md** — AI state-of-the-world since pause
5. **Updated `docs/TASK_MASTER.md`** — tasks in MCA-* format aligned with current reality

---

## 9. User's Checklist (Quick Reference)

**This week, user needs to do the following** (est. ~2h total):

| # | Action | Where | Time |
|---|---|---|---|
| 1 | Login Vercel → send screenshot | vercel.com | 5 min |
| 2 | Login Supabase → send screenshot + metrics | supabase.com/dashboard | 10 min |
| 3 | Login Stripe → confirm mode + bank status | dashboard.stripe.com | 10 min |
| 4 | Login Resend → verify domain green | resend.com | 5 min |
| 5 | Login Sentry → check project alive | sentry.io | 5 min |
| 6 | Check Perplexity Pro status | perplexity.ai → Settings | 2 min |
| 7 | Reserve 8 social handles (Instagram, LinkedIn, etc.) | Each platform | 30-60 min |
| 8 | Login Namecheap → domain renewal + autorenewal | namecheap.com | 10 min |
| 9 | Finalize architect formal agreement outline w/ Vlad | Email + draft | 30 min |

---

## 10. Non-blocking Next Steps (parallel)

While audit runs:
- Claude writes CATUC content prep (Phase 2 — non-deployed `.new.md` files)
- Claude proposes `.claude/settings.local.json` permissions allowlist
- User progresses engineers + Cornetu + module producer conversations

---

## 11. Review cadence

- Daily: update this doc with CHECK results
- Friday Nov 22: midweek review + adjust priorities
- Monday Nov 25: close audit, hand off to Phase 2 (CATUC fix)

---

*An audit's value is in finding what you didn't know. Don't skip checks that "probably work" — those are exactly where surprises hide.*
