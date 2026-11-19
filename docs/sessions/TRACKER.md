# Session Tracker

> Live state of all Claude Code parallel sessions across the 3-Layer Captain Architecture.
> Architecture: see `docs/META_SYSTEM.md`. Quickstart: see `docs/sessions/README.md`.
> Hybrid: Captain layer for chat orchestration + MCA-* convention for artifacts.
> Update this every time a session starts, pauses, or ends.
> **Hard cap: 3 active sessions.** Check this file before spawning anything new.

---

## 🟢 Active sessions (right now)

| Layer | Chat | Task ID | Started | ETA | Scope | Status |
|---|---|---|---|---|---|---|
| Main (reboot orchestrator) | this | MAIN-REBOOT-2026-11-19 | 2026-11-19 (Thu) EET | end-of-day Nov 20 | ModulCA 2.0 rebase, Phase 0-1 execution | 🟢 Active — see `docs/MCA-LOG-2026-11-19-session-reboot.md` |

**Hard cap not approached (1 / 3).** No Captain or Weekly Ops spawned yet — deferred until Phase 2 kickoff (Nov 26). Running as single-main-chat pattern through audit phase.

---

## 🗓️ Current phase: Phase 0-1 (Reset + Audit)

**ModulCA 2.0 plan**: `docs/MCA-STRAT-2026-11-19-reboot.md`

Phase overview (Nov 19 → Feb 1 2027, 10 weeks):
- **Phase 0** (Nov 19-20) — Reset docs, baseline audit ✅ IN PROGRESS
- **Phase 1** (Nov 21-25) — Audit complete (external services + content)
- **Phase 2** (Nov 26 - Dec 5) — CATUC content rewrite (see `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md`)
- **Phase 3** (Dec 6-14) — PermitTracker v0 + checker + profile engine
- **Phase 4** (Dec 15-22) — Final polish, invite-only beta deploy
- **Phase 5** (Dec 15 - Jan 15) — Invite-only beta (10-20 users)
- **Phase 6** (Jan 16-31) — Pre-launch marketing groundwork
- **Phase 7** (Feb 1 2027) — Public launch

---

## 🎯 Next up — planned sessions (in logical order)

Queued for Phase 2+ spawn.

| Priority | Chat type | Template | Blocking condition | Why |
|---|---|---|---|---|
| 🔴 P0 | Captain 2026-11 | `captain.md` | Phase 2 kickoff (Nov 26) | Strategic coordination for CATUC rewrite week |
| 🔴 P0 | Weekly Ops W48 | `weekly-ops.md` | Phase 2 start (Mon Nov 24) | Sprint execution: CATUC files + Vlad review orchestration |
| 🔴 P0 | Content & SEO | `content-seo.md` | After NotebookLM synthesis complete | CATUC content rewrite 9 files via `.new.md` siblings |
| 🟡 P1 | Specialist — DB migration audit | `ops.md` | Phase 1 audit | Verify migrations 001-010 state in restored Supabase, run migration 009 if pending |
| 🟡 P1 | Testing | `testing.md` | Pre-Phase 4 | E2E tests for CATUC flows + PermitTracker v0 |
| 🟡 P1 | Frontend QA | `frontend-qa.md` | Pre-Phase 5 (invite-only beta) | Mobile 375 + a11y pass Steps 1-14 (never ran in April) |
| 🟢 P2 | Ops (Stripe go-live) | `ops.md` | After bank verification + public launch decision | `npm run stripe:go-live` cutover — DEFERRED to post-launch |
| 🟢 P2 | External Ops | `external-ops.md` | Phase 6 (post invite-only beta) | DPA replies + Startup apps (6+6) — EXT-OPS-001 kit still 100% send-ready from April |
| 🟢 P2 | Architect Tools | `architect-tools.md` | Post public-launch | Step 14 polish, DfMA workflow |
| 🟢 P3 | Audit (quarterly) | `audit.md` | Quarterly cadence | Security + GDPR recheck + perf |

---

## 📚 Past sessions

Keep newest-first. Include outcome summary + lessons so future chats benefit.

| Task ID | Chat type | Started | Ended | Outcome | Commits |
|---|---|---|---|---|---|
| CAPTAIN-2026-04 | Captain | 2026-04-20 | 2026-11-19 (archived) | Spawned but project paused same week. Never executed beyond initial setup. Scratchpad `active/2026-04-20-captain-2026-04.md` kept for history. | `584fcba`, `d0369da` |
| WEEK-2026-W17 | Weekly Ops | 2026-04-20 | 2026-11-19 (archived) | Partial Monday-only execution. 3 pre-dispatch scratchpads produced (FE-QA-001, OPS-001, TEST-001) but never spawned. Project paused Tue-Fri. | `570700f`, `8be6f16`, `57717fc` |
| EXT-OPS-001 | Specialist (External Ops) | 2026-04-18 | 2026-04-20 (closed dormant, awaiting user) | Prep 100% done: 6 DPA emails + 6 Startup apps ready to send. User never executed outreach during pause. May reactivate for Phase 6. | `fe6b88d` |
| MAIN-ongoing | Main (pre-Captain) | ~2025 → 2026-04-18 | 2026-04-18 | Retired after writing handoff to Captain architecture at `active/2026-04-20-captain-handoff.md`. | multiple |

---

## 📝 Lessons learned (cross-session)

Accumulate non-obvious findings here. Any chat should skim this section at spawn.

- **2026-11-19 (reboot) — Code + infrastructure survive a 7-month pause remarkably well.** 147 tests still pass, 0 TS errors, modulca.eu LIVE, Resend domain still VERIFIED, Stripe products still configured. Only Supabase went down — and not due to inactivity but a $12.90 unpaid invoice from July. Lesson: after any pause, run `ops:check` FIRST — distinguishes real rot from administrative blocks.
- **2026-11-19 (reboot) — Supabase Free tier does NOT auto-pause for inactivity; it blocks for unpaid invoices.** The "Paused" state in dashboard can hide different root causes. "Go to billing" check before assuming inactivity.
- **2026-11-19 (reboot) — Hybrid naming works: Captain for chats + MCA-* for artifacts.** Captain architecture stays as orchestration pattern; strategic/task/doc artifacts get MCA-DOC-*, MCA-STRAT-*, MCA-SPEC-*, MCA-LOG-* prefixes for grep-ability. Keeps sessions/active/ for scratchpad continuity.
- **2026-11-19 (reboot) — "Supabase No migrations" widget is UI quirk, not data loss.** The dashboard's "LAST MIGRATION" widget only tracks `supabase db push` CLI usage, not SQL Editor execution. We run migrations via SQL Editor, so widget shows empty. Tables + data still queryable. Don't panic.
- **2026-04-20 (EXT-OPS-001 handoff)** — **Specialist continuity survives a chat-session break if commits are clean.** User couldn't re-open original EXT-OPS-001 chat (from 2026-04-18); spawned a fresh Claude Code chat with the scratchpad path as first context. Commit `fe6b88d` landed on master cleanly. Lesson: trust the git log + scratchpad protocol over chat-memory preservation.
- **2026-04-20 (Monday session-2 rebase)** — **Stash-and-rebase protocol works when peer chats push concurrently.** Zero data loss pattern to repeat.
- **2026-04-20 (Migration 010 FK forward-reference bug)** — **Always read a new migration top-to-bottom before running.** `supabase/migrations/010_monitoring_signals.sql:44` references `public.incidents(id)` before table is created at line 71. Fresh-DB run would fail. Flagged for future OPS-002.
- **2026-04-20 (Monday autonomous prep pattern)** — **Weekly Ops front-loads Monday batch so Tue-Fri focus on execution + unexpected.** Pattern: Monday = prep batch; Tue-Fri = dispatch + assist.

---

## 🚨 Blockers requiring user action

Tracking what's waiting on external / human-only actions.

| Blocker | Owner | Blocks | ETA |
|---|---|---|---|
| ~~Supabase paused ($12.90 outstanding)~~ | ✅ RESOLVED 2026-11-19 | ~~Phase 1 audit~~ | — |
| A1 Vercel dashboard verify | User (5 min login) | MCA-DOC-AUDIT CHECK-B1 | When user has 5 min |
| A2 Supabase dashboard metrics | User (10 min login) | MCA-DOC-AUDIT CHECK-B2 (post-restore) | When user has 10 min |
| A3 Stripe mode + bank verify | User (10 min login) | Phase 7 Stripe live cutover + MCA-DOC-AUDIT CHECK-B3 | Post public launch for live cutover |
| A4 Resend domain re-verify | User (5 min login) | MCA-DOC-AUDIT CHECK-B4 (already verified per ops:check, confirm visually) | When user has 5 min |
| A5 Sentry quota check | User (5 min login) | MCA-DOC-AUDIT CHECK-B5 | When user has 5 min |
| A6 Perplexity Pro status | User (2 min login) | AI delegation strategy fine-tuning | When user has 2 min |
| A7 Namecheap renewal check | User (5 min login) | Domain continuity | Before any renewal date passes |
| Vlad Ioniță formal engagement | User (coordinate) | Phase 2 CATUC content Vlad review | Before Dec 1 (Vlad window Nov 28 - Dec 3) |
| Engineers (structuri + instalații) | User (contact) | Cornetu pilot + case study | Before Phase 6 (Jan 2027) |
| Module producer resume talks | User (contact) | Supply chain for Phase 6 pipeline | Flexible |
| Cornetu plot metro-zone verify | User + Claude together | Case study feasibility | Before Phase 6 |
| Migration 009 run in Supabase SQL Editor | User (2 min, in restored project now) | `npm run db:analyze` script | When user has 2 min |
| Migration 010 FK fix (OPS-002) | Future Specialist | Fresh-DB rebuild integrity | Pre-Phase 5 |

---

## 📊 Quick stats

- Active chats: **1 / 3** cap (this main reboot session)
- Phase: **0-1** (Reset + Audit)
- Days to invite-only beta: **26** (target 2026-12-15)
- Days to public launch: **74** (target 2027-02-01)
- Last ops:check: 2026-11-19 — **30 ✅ / 2 ⚠️ / 0 ❌**
- Last meaningful commit: `194a6f0` (docs status post-Supabase restore)
- Architecture: 3-Layer Captain (chats) + MCA-* (artifacts) — hybrid documented in `docs/META_SYSTEM.md` + `docs/sessions/README.md`

---

## 🔄 How to update this file

**When a new chat spawns:**
1. Move its row from "Next up" to "Active"
2. Fill in actual Started timestamp
3. Commit: `chore(tracker): spawn <task-id> <role> chat`

**When a chat ends:**
1. Move its row from "Active" to "Past"
2. Fill in Ended timestamp, Outcome, key commits
3. If lesson learned, append bullet to "Lessons learned"
4. Commit: `chore(tracker): close <task-id> — <outcome>`

**When blocker resolves:**
1. Strike through the row in "Blockers" (`~~text~~`)
2. Or move the row to "Past" if it was its own session
3. Commit: `chore(tracker): unblock <item>`

---

*This file is the source of truth. If it and reality diverge, reality wins — update the file.*
