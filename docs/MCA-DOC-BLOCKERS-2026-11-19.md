# MCA-DOC-BLOCKERS-2026-11-19

**Status**: Living document — updated as blockers resolve  
**Owner**: Costin Muraru  
**Scope**: Prioritized list of what's broken / blocking ModulCA 2.0 progress  
**Related**: [[MCA-DOC-STATUS-2026-11-19]] · [[MCA-DOC-AUDIT-2026-11-19]]

---

## 🟥 Critical (block work NOW)

_No critical blockers as of 2026-11-19 ~20:00 EET._

### ✅ B1. Supabase project auto-paused — RESOLVED 2026-11-19
- **Root cause (actual)**: NOT auto-pause — had $12.90 unpaid invoice from Jul 2026 Pro-tier partial billing
- **Fix taken**: User paid $12.90 (FGOSHO-00006) → restored project → status Healthy
- **Verification**: `ops:check` 30 ✅ / 2 ⚠️ / 0 ❌ (vs prior 25 ✅ / 4 ⚠️ / 2 ❌)
- **Data preserved**: Projects + Profiles tables + Auth all queryable. "Last migration: No migrations" is UI quirk (we used SQL Editor, not Supabase CLI push)
- **Follow-up**: Keep Supabase Free; set payment method with far expiry to avoid future lockout

---

## 🟨 Important (block Phase 2 CATUC fix)

### B2. 11 files reference repealed laws (Legea 50/1991, 350/2001)
- **Files**: see [[MCA-DOC-STATUS-2026-11-19]] §5
- **Impact**: Legal content incorrect → reputation/liability risk if public
- **Fix**: Rewrite each referencing CATUC 169/2026, parallel in `.new.md` siblings, don't deploy until Vlad Ioniță reviews
- **Est. time**: 2-3 days Claude work (bulk) + 2-3 days review+edit
- **Owner**: Claude (writing) + Vlad Ioniță (legal review) + Costin (coordination)
- **Phase**: 2 (Nov 26 - Dec 5)

### ✅ B3. NeufertAI model outdated — RESOLVED 2026-11-19 (by Chat 3)
- **Fix applied**: `claude-sonnet-4-20250514` → `claude-sonnet-5-5`. Commit `2cfae40`, live on Vercel.
- **Bonus fix**: Chat 3 also caught + fixed critical Groq bug — `llama-3.3-70b-versatile` returned 404 silently (broke NeufertAI fallback). Replaced with `openai/gpt-oss-120b`. Commit `b8a6c20`.
- **Credit**: Chat 3 (AI Engines & Rendering) — handoff doc `MCA-HANDOFF-1-MAIN-2026-11-19.md`

### B4. Vlad Ioniță formal engagement not documented
- **Impact**: Legal exposure if we claim signing architect without contract
- **Fix**: User + Vlad draft engagement document (compensation, scope, term)
- **Est. time**: 1-2 weeks (needs lawyer review ideally)
- **Owner**: Costin
- **Phase**: 1-2 (parallel to code work)

### B5. CATUC folder not committed to git
- **Impact**: 4 files (3.7 MB) only exist on Costin's local machine. Lose machine → lose files. Other sessions can't see them.
- **Fix**: Add `docs/references/catuc/` + commit + push
- **Est. time**: 30 sec
- **Owner**: Claude (today, part of reboot commit)
- **Status**: ⏳ Will commit at end of session today

---

## 🟩 Low (nice-to-have / tech debt)

### B6. npm version outdated (11.9.0 → 11.21.3)
- **Impact**: Minor features missing, no security issue
- **Fix**: `npm install -g npm@11.21.3` (user runs, not Claude)
- **Phase**: Phase 1 cleanup

### B11. Sentry SDK config deprecations (surfaced in build 2026-11-19)
- **Impact**: Will break in future Sentry major update; Turbopack won't work with current config
- **Fix items**:
  1. Rename `sentry.client.config.ts` → `instrumentation-client.ts`
  2. Create `instrumentation.ts` at project root (Next 16 convention)
  3. Replace `disableLogger: true` with `webpack.treeshake.removeDebugLogging`
- **Est. time**: 1-2h with testing
- **Phase**: Phase 1-2 (low priority, don't ship broken)
- **Owner**: Claude

### ✅ B12. Next.js 16 middleware → proxy rename — RESOLVED 2026-11-19
- **Fix applied**: `git mv src/middleware.ts src/proxy.ts` + renamed `export function middleware(...)` → `export function proxy(...)`
- **Verified**: `npm run typecheck` 0 errors + `npm run test:run` 147/147 pass
- **Pending**: Confirm no warning in next `npm run build`

### B13. `public.public_renders` table missing from Supabase
- **Impact**: Gallery page "recent renders" section fails silently
- **Discovered**: Build log 2026-11-19 — `[gallery] recent renders fetch failed`
- **Possible causes**:
  1. Migration that creates `public_renders` was never run (check `supabase/migrations/`)
  2. Table was dropped during Supabase pause (unlikely, data preserved)
  3. Schema cache stale (unlikely after restore)
- **Fix**: `grep -rn "public_renders" supabase/migrations/` → identify creating migration → run in SQL Editor
- **Est. time**: 15 min investigation + 2 min SQL
- **Phase**: Phase 1 (quick cleanup)
- **Owner**: Claude investigate, user runs migration

### ✅ B14. Together.ai free tier expired — RESOLVED 2026-11-19
- **Fix applied**: Removed "together" from all 3 providerChain arrays (free/premium/architect tiers) in `src/app/api/consultant/route.ts:259-273`
- **Config kept**: Full Together.ai client config remains in file (lines 458+) for easy re-enable if we pay
- **Verified**: `npm run typecheck` + `npm run test:run` green
- **Still TODO**: Update `docs/AI_PROVIDERS.md` status badge (minor doc cleanup)

### B15. Dependencies outdated + 53 vulnerabilities (surfaced 2026-11-19 `npm audit`)
- **Impact**: Security advisories + feature drift; blocks eventual Next.js 17 upgrade
- **Discovered**: `npm audit --json` + `npm outdated`
- **Breakdown**:
  - 5 critical, 12 high, 34 moderate, 2 low vulnerabilities
  - Major version drift on: `@prisma/client 5 → 7`, `@stripe/stripe-js 9 → 10`, `@types/node 20 → 26`, `eslint 9 → 10`, `lucide-react 0 → 1`, `@react-three/postprocessing 2 → 3`, `@sentry/nextjs 10 → 11`
  - Minor/patch drift: 30+ packages behind
- **Fix approach**:
  1. Run `npm audit fix` first (patches auto-applied, low risk)
  2. For CRITICAL/HIGH: investigate each, prioritize fixes
  3. Minor updates batch: run `npm update` in dedicated session, test thoroughly
  4. Major updates: individual PRs with migration notes (one at a time)
- **Est. time**: 2-3h total, spread Phase 1-2
- **Phase**: Phase 1 (fix critical/high vuln), Phase 2-3 (major upgrades)
- **Owner**: Claude (analysis) + User (approve breaking-change migrations)
- **Deferred**: Full migration of @prisma 5→7 (likely breaking changes) — dedicated sub-task

### ✅ MCA-P1-T15. AI landscape doc written — DONE 2026-11-19
- **Output**: [MCA-DOC-AI-LANDSCAPE-2026-11](MCA-DOC-AI-LANDSCAPE-2026-11.md)
- **Key decisions**: NeufertAI upgrade to claude-sonnet-5-5, add DeepSeek V3 for bulk execution, enable prompt caching, keep ChatGPT Plus as second-opinion
- **Render/3D landscape**: Separate brief for `3.renderi AI` chat ([2026-11-19-brief-for-3renderi-ai-chat.md](research/2026-11-19-brief-for-3renderi-ai-chat.md))

### B7. Captain session 2026-04-20 never executed
- **Impact**: Session artifacts show April activity that never happened post-handoff
- **Fix**: Archive April sessions in TRACKER.md "Past"
- **Phase**: Day 0 (tomorrow Nov 20)

### B8. EXT-OPS-001 session awaits 3 user decisions (still)
- **Original blockers (April)**: LinkedIn URL, Stripe acct_id, Supabase Pro decision
- **Impact**: DPA + Startup program applications paused
- **Fix**: Costin decides each
- **Phase**: Phase 2-3 (parallel to CATUC work)

### ✅ Novita signup — DONE 2026-11-20 (card NOT required for key creation)
- **Status**: Key generated without card bind (contrary to Step 1 wizard suggestion)
- **Balance**: $0.00 — cannot execute requests until future top-up
- **Stored**: .env.local + GitHub secret `NOVITA_API_KEY` + Vercel Production (Secret type)
- **Follow-up**: $5 top-up when Phase 2 CATUC image generation needs backup (optional)

### ✅ WaveSpeed signup — DONE 2026-11-20
- Account: wavespeed.ai (uii.acgs.auto@gmail.com)
- Key: `modulca-production`, Full access, Active, $1 credit
- Stored: .env.local + GitHub secret `WAVESPEED_API_KEY` + Vercel Production (Secret type)

### B17. Ops Check cron needs 7 more GitHub secrets
- **Discovered**: 2026-11-20 — manual trigger failed, log showed empty env vars
- **Missing secrets**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `VERCEL_TOKEN`, `SENTRY_AUTH_TOKEN`
- **Temporary action**: Workflow disabled to avoid cron failure spam
- **Fix**: Add 7 secrets via GitHub Settings or `gh secret set`, then re-enable workflow
- **Phase**: Tomorrow (after weekly token reset)
- **Est. time**: 15 min

### B9. Dependencies possibly outdated (`npm outdated` not yet run)
- **Fix**: Run `npm outdated` → classify upgrades (major vs minor vs security)
- **Est. time**: 30 min analysis
- **Owner**: Claude (in Phase 1 audit CHECK-E1)

### B10. Launch plan obsolete in TRACKER.md
- **TRACKER.md still shows**: "Days to beta launch: 11 (target 2026-05-01)"
- **Should show**: "Days to invite-only beta: 26 (target 2026-12-15); Days to public: 74 (target 2027-02-01)"
- **Fix**: Edit TRACKER.md with current dates + reboot context
- **Phase**: Today or tomorrow

---

## ✅ Resolved today (2026-11-19)

- Legal law name clarified: CATUC = Legea 169/2026 (documented in [[../docs/references/catuc/README.md]])
- Vlad Ioniță confirmed as signing architect (D9)
- Budget constraint clarified: €50/mo max (drives [[MCA-STRAT-AI-DELEGATION-2026-11-19]])
- Multi-AI delegation strategy decided (D5)
- Marketing roadmap drafted (D6, in [[MCA-STRAT-MARKETING-2026-11-19]])
- Launch target rebaselined: Feb 1, 2027 public, Dec 15, 2026 invite-only (D3, D4)
- modulca.eu CONFIRMED LIVE (HTTP 200, /api/health OK)
- Resend domain CONFIRMED VERIFIED
- Stripe products + prices CONFIRMED CORRECT (TEST mode, as planned)

---

## Review cadence

- Daily (during audit week Nov 19-25): update B1-B10 status
- Weekly after: Monday review in Weekly Ops scratchpad
- At phase boundaries: close resolved blockers, reprioritize remaining
