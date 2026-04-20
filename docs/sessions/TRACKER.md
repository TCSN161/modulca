# Session Tracker

> Live state of all Claude Code parallel sessions across the 3-Layer Captain Architecture.
> Architecture: see `docs/META_SYSTEM.md`. Quickstart: see `docs/sessions/README.md`.
> Update this every time a session starts, pauses, or ends.
> **Hard cap: 3 active sessions.** Check this file before spawning anything new.

---

## 🟢 Active sessions (right now)

| Layer | Chat | Task ID | Started | ETA | Scope | Status |
|---|---|---|---|---|---|---|
| Captain | claude/modest-blackwell-dfbf1f | CAPTAIN-2026-04 | 2026-04-20 (Mon) EET | ~2026-04-30 (pre-launch rotation to CAPTAIN-2026-05) | Strategic coordination; 11-day beta-launch window | 🟢 Active — scratchpad `active/2026-04-20-captain-2026-04.md` |
| Weekly Ops | claude/nice-chandrasekhar-aa2808 | WEEK-2026-W17 | 2026-04-20 (Mon) EET | 2026-04-24 (Fri) | Week of Apr 20–24 sprint execution; dispatches FE-QA-001 + TEST-001 | 🟢 Active — scratchpad `active/2026-W17-weekly-ops.md` |
| Specialist (External Ops) | EXT-OPS-001 (run in new worktree 2026-04-20) | EXT-OPS-001 | 2026-04-18 | 2026-04-20 — kit 100% send-ready | DPA outreach (6 vendors) + Startup apps (6 programs) | 🟢 Inputs filled + committed `fe6b88d`; closed dormant awaiting user to execute 6 DPAs (~45 min) + 6 startup submissions (~2h) |

### Retired sessions (within last rotation)

| Layer | Chat | Task ID | Retired | Outcome |
|---|---|---|---|---|
| Main (pre-Captain-architecture) | MAIN-ongoing | MAIN-ongoing | 2026-04-18 | Orchestrator retired after writing handoff at `active/2026-04-20-captain-handoff.md`. |

---

## 🎯 Next up — planned sessions (in logical order)

These are queued — spawn in order as blockers clear and capacity allows.

| Priority | Chat type | Template | Blocking condition | Why |
|---|---|---|---|---|
| 🔴 P0 (W17) | Frontend QA | `frontend-qa.md` | Tue 2026-04-21 AM — pre-dispatch scratchpad ready at `active/2026-04-21-frontend-qa-FE-QA-001.md` | Pre-launch mobile 375 + a11y pass Steps 1–14 |
| 🔴 P0 (W17) | Ops (Telegram bot) | `ops.md` | Wed 2026-04-22 PM post-FE-QA close — pre-dispatch scratchpad ready at `active/2026-04-22-ops-OPS-001.md` | AUTONOMOUS_AGENT Stage 1 remaining: Telegram notification layer (commands deferred to OPS-003 W18) |
| 🔴 P0 (W17) | Testing | `testing.md` | Thu 2026-04-23 AM post-OPS-001 close — pre-dispatch scratchpad ready at `active/2026-04-23-testing-TEST-001.md` | Playwright E2E auth + Stripe mock + CloudSync coverage, launch-week regression moat |
| 🟡 P1 | Content & SEO | `content-seo.md` | After DPA replies start returning (W18+) | Translate top 10 KB articles to RO + publish 5 RO blog drafts + OG images |
| 🟡 P1 | External Ops | `external-ops.md` | EXT-OPS-002 triggers when ≥3 DPAs return signed (W18 likely) | Batch-process DPA replies + Stripe Climate email (now unblocked post fe6b88d with acct_id) |
| 🟢 P2 | Ops (Stripe go-live) | `ops.md` | After bank verification clears | Run `npm run stripe:go-live` cutover + verify webhooks + sync Vercel |
| 🟢 P2 | Ops (Migration 010 FK fix) | `ops.md` | OPS-002, after OPS-001 closes, before any fresh-DB spin-up ever runs 010 again | Canonical `supabase/migrations/010_monitoring_signals.sql:44` has forward-FK bug; needs reorder |
| 🟢 P2 | Architect Tools | `architect-tools.md` | Post-beta | Step 14 UX polish, DfMA workflow, client dashboard features |
| 🟢 P3 | Audit (quarterly) | `audit.md` | Quarterly cadence | Security sweep + GDPR recheck + perf profile |

---

## 📚 Past sessions

Keep newest-first. Include outcome summary + lessons so future chats benefit.

| Task ID | Chat type | Started | Ended | Outcome | Commits |
|---|---|---|---|---|---|
| — | — | — | — | Will populate as sessions close | — |

---

## 📝 Lessons learned (cross-session)

Accumulate non-obvious findings here. Any chat should skim this section at spawn.

- **2026-04-20 (EXT-OPS-001 handoff)** — **Specialist continuity survives a chat-session break if commits are clean.** User couldn't re-open original EXT-OPS-001 chat (from 2026-04-18); spawned a fresh Claude Code chat with the scratchpad path as first context. Commit `fe6b88d` landed on master cleanly. Lesson: trust the git log + scratchpad protocol over chat-memory preservation. The architecture is antifragile by design here — don't over-engineer chat persistence.
- **2026-04-20 (Monday session-2 rebase)** — **Stash-and-rebase protocol works when peer chats push concurrently.** EXT-OPS-001 pushed `fe6b88d` while Weekly Ops had uncommitted scratchpad edits. Stashed scratchpad + `.claude/` stray deletions separately, rebased onto origin/master (fast-forward clean, no code conflicts because files didn't overlap), popped scratchpad. Zero data loss. Pattern to repeat when multiple chats commit within same hour.
- **2026-04-20 (Migration 010 FK forward-reference bug)** — **Always read a new migration top-to-bottom before running, even if marked idempotent.** File `supabase/migrations/010:44` referenced `public.incidents(id)` before the `incidents` table was created at line 71. Fresh-DB run would fail. Workaround: extract the `incidents` CREATE block, run it first, then the full file — idempotent `if not exists` handles the re-create cleanly. Flagged for OPS-002 to fix the canonical file properly.
- **2026-04-20 (Monday autonomous prep pattern established)** — **User asked Weekly Ops to front-load all autonomous-possible work on Monday so Tue-Fri can focus on execution + unexpected.** Weekly Ops produced: 3 pre-dispatch scratchpads (FE-QA-001, OPS-001, TEST-001) each with full spawn prompt inside; 5 ready-to-use assets (accountant email, DPA/startup checklist, migration 009 paste, Perplexity candidates, BotFather guide); skills proposal. Pattern to repeat weekly: **Monday = prep batch; Tue-Fri = dispatch + assist.**

---

## 🚨 Blockers requiring user action

Tracking what's waiting on external / human-only actions.

| Blocker | Owner | Blocks | ETA |
|---|---|---|---|
| Stripe bank verification (IBAN check) | User (calls bank) | Stripe live cutover, A2 webhook verify | TBD after bank call |
| DPA vendor replies (6 vendors) | Vendors (external) | Privacy Policy v2 live update, DPA_Status final | 3-7 days after emails sent |
| Domain purchases (Namecheap, €95/yr) | User (credit card) | Brand protection, archicore.eu umbrella | When user has 15 min |
| Startup program decisions | External committees | Free credits ($150-300K potential) | 2-6 weeks after submit |
| Migration 008 run in Supabase Dashboard | ✅ DONE (2026-04-18) | ~~Thumbnail + soft-delete activation~~ | — |
| Migration 009 run in Supabase Dashboard | User (SQL Editor) | `npm run db:analyze` script | When user has 2 min |

---

## 📊 Quick stats

- Active chats: 2 / 3 cap (Captain CAPTAIN-2026-04, Weekly Ops WEEK-2026-W17). EXT-OPS-001 closed dormant 2026-04-20 after commit fe6b88d landed — kit 100% send-ready; user executes 6 DPAs + 6 startup apps at own pace (deadline Vercel DPA Sat 2026-04-25). Headroom: FE-QA-001 safe to spawn Tue AM.
- Planned chats: 6 Specialist queues
- Past chats: Main chat retired 2026-04-18 after handoff to Captain architecture
- Current calendar week focus: pre-beta finalization, Captain architecture rollout
- Days to beta launch: 11 (target 2026-05-01)
- Architecture: 3-Layer Captain (see `docs/META_SYSTEM.md`) — first rotation spawns 2026-04-20

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
