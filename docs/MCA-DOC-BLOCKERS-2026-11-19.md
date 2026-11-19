# MCA-DOC-BLOCKERS-2026-11-19

**Status**: Living document — updated as blockers resolve  
**Owner**: Costin Muraru  
**Scope**: Prioritized list of what's broken / blocking ModulCA 2.0 progress  
**Related**: [[MCA-DOC-STATUS-2026-11-19]] · [[MCA-DOC-AUDIT-2026-11-19]]

---

## 🟥 Critical (block work NOW)

### B1. Supabase project auto-paused
- **Impact**: DB-dependent features broken: auth, profile data, projects CRUD
- **Discovered**: `ops:check` 2026-11-19 (REST API + Projects table fetch failed)
- **Likely cause**: Supabase Free tier auto-pauses projects after ~7 days no activity. We paused 7 months.
- **Fix**: User logs supabase.com/dashboard → open ModulCA project → click "Restore" / "Resume"
- **Est. time**: 2 min user + ~5 min restore
- **Owner**: User (needs dashboard login)
- **Verify after fix**: `npm run ops:check` again → should show 27+ ✅
- **Status**: ⏳ Awaiting user

---

## 🟨 Important (block Phase 2 CATUC fix)

### B2. 11 files reference repealed laws (Legea 50/1991, 350/2001)
- **Files**: see [[MCA-DOC-STATUS-2026-11-19]] §5
- **Impact**: Legal content incorrect → reputation/liability risk if public
- **Fix**: Rewrite each referencing CATUC 169/2026, parallel in `.new.md` siblings, don't deploy until Vlad Ioniță reviews
- **Est. time**: 2-3 days Claude work (bulk) + 2-3 days review+edit
- **Owner**: Claude (writing) + Vlad Ioniță (legal review) + Costin (coordination)
- **Phase**: 2 (Nov 26 - Dec 5)

### B3. NeufertAI model outdated
- **Current**: `claude-sonnet-4-20250514` (April-era)
- **Should be**: `claude-sonnet-5-5` (Oct 2026 release, supports better reasoning for complex legal queries)
- **File**: `src/app/api/consultant/route.ts` lines ~392, 408
- **Impact**: Users get worse CATUC answers than possible
- **Fix**: One-line env var or constant swap + test E2E
- **Est. time**: 30 min total
- **Owner**: Claude
- **Depends on**: `@anthropic-ai/sdk` version supporting new model → check in Phase 1 audit

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

### B7. Captain session 2026-04-20 never executed
- **Impact**: Session artifacts show April activity that never happened post-handoff
- **Fix**: Archive April sessions in TRACKER.md "Past"
- **Phase**: Day 0 (tomorrow Nov 20)

### B8. EXT-OPS-001 session awaits 3 user decisions (still)
- **Original blockers (April)**: LinkedIn URL, Stripe acct_id, Supabase Pro decision
- **Impact**: DPA + Startup program applications paused
- **Fix**: Costin decides each
- **Phase**: Phase 2-3 (parallel to CATUC work)

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
