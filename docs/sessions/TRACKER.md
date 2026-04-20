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
| 🟡 P1 | Content & SEO | `content-seo.md` | After DPA replies start returning | Translate top 10 KB articles to RO (infra ready) + publish 5 RO blog drafts + OG images |
| 🟡 P1 | Frontend QA | `frontend-qa.md` | Pre-launch final week | A11y pass, keyboard nav StepNav, focus management modals, mobile 375px final audit |
| 🟡 P1 | Testing | `testing.md` | Pre-launch final week | Playwright E2E for auth + Stripe flows, edge cases, coverage boost |
| 🟢 P2 | Ops (Stripe go-live) | `ops.md` | After bank verification clears | Run `npm run stripe:go-live` cutover + verify webhooks + sync Vercel |
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

- _(none yet — first entry will appear after first external-ops session closes)_

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
