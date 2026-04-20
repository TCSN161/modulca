# Session System — 3-Layer Captain Architecture

> **Purpose**: keep parallel Claude Code chats coherent, trackable, non-destructive across months of work.
> **Anchor**: this folder is the single source of truth for how sessions start, run, and hand off.
> **Architecture**: see `docs/META_SYSTEM.md` for the 3-Layer Captain model (Captain → Weekly Ops → Specialists).
> **Companion**: `docs/PARALLEL_SESSIONS.md` for full protocol; this README is the quick-start.
> **External AI tools**: see `docs/TOOLS_INTEGRATION.md` for Perplexity / NotebookLM / Codex / Grok / Claude Design / Manus handoff protocols.

---

## 🏗️ The 3-Layer model (at a glance)

```
┌──────────────────────────────────────────────────┐
│ CAPTAIN     — strategic, 1 active, ~monthly      │
│ WEEKLY OPS  — sprint exec, 1 active, Mon→Fri     │
│ SPECIALISTS — deep focus, ≤1 active, task-life   │
└──────────────────────────────────────────────────┘
         + external AI tools as sub-agents
```

Hard cap: **3 concurrent Claude Code chats** (Captain + Weekly Ops + at most 1 Specialist).

Full detail in `docs/META_SYSTEM.md`. Every new chat reads `META_SYSTEM.md` at spawn.

---

## 📁 What lives here

```
docs/sessions/
├── README.md                       # You are here
├── TRACKER.md                      # Live state of all sessions (past, active, planned)
├── templates/                      # Copy-paste spawn prompts per chat type
│   ├── captain.md                  # 🆕 Captain — strategic coordinator (monthly)
│   ├── weekly-ops.md               # 🆕 Weekly Ops — sprint execution (Mon-Fri)
│   ├── external-ops.md             # DPA outreach, Startup apps, CSR, partnerships
│   ├── content-seo.md              # Translations, blog, SEO content, OG images
│   ├── frontend-qa.md              # Mobile, a11y, UX polish, keyboard nav
│   ├── testing.md                  # E2E Playwright, unit coverage, edge cases
│   ├── architect-tools.md          # Step 14 (Architect), DfMA, client dashboard
│   ├── audit.md                    # Read-only security/perf/GDPR audits
│   ├── ops.md                      # Tech ops: Stripe live, Vercel, env, migrations (EXCLUSIVE)
│   └── bug-fix.md                  # Generic bug-fix template
└── active/                         # Per-session scratchpads (one file per run)
    ├── YYYY-MM-DD-captain-<YYYYMM>.md            # Captain session scratchpads
    ├── YYYY-MM-DD-captain-handoff.md             # Captain rotation handoffs
    ├── YYYY-Www-weekly-ops.md                    # Weekly Ops week scratchpad
    └── YYYY-MM-DD-<specialist-role>-<taskid>.md  # Specialist scratchpads
```

---

## 🚀 How to spawn a new chat

**Step 1: Check TRACKER.md**
Look at `docs/sessions/TRACKER.md` to see:
- Active chats right now (hard cap: **3 concurrent**)
- Recently completed/blocked sessions with lessons
- What's planned next

**Step 2: Open the right template**
Pick the template matching your task scope from `docs/sessions/templates/`.

**Step 3: Copy the spawn prompt**
Each template has a self-contained "SPAWN PROMPT" block at the top — copy it exactly.

**Step 4: Fill in the placeholders**
Each template has `[FILL IN]` markers for task-specific details:
- Task ID (increment from last in TRACKER.md)
- Spawn date/time
- Sibling chats active right now
- Specific sub-task if template covers multiple

**Step 5: Paste as first message in new Claude Code chat**
Claude confirms the header back, runs `npm run collision-check`, starts work.

**Step 6: Update TRACKER.md**
Add a row for the new session in the "Active" table. Come back and move it to "Past" when session ends.

---

## 🧭 Core principles (non-negotiable)

From `docs/PARALLEL_SESSIONS.md` and the ecosystem architecture principles:

1. **Modular** — each chat owns a well-bounded slice. No cross-claims.
2. **Non-destructive** — work is additive. Never `push --force` master.
3. **Antifragile** — collisions detected early, resolved without drama.
4. **Traceable** — every session has a scratchpad file committed.
5. **Efficient** — max 3 concurrent chats, ≥5 min between spawns, clean end-of-day.
6. **Coherent** — all chats read `PARALLEL_SESSIONS.md` + `ECOSYSTEM_ARCHITECTURE.md` at spawn.

---

## 🎯 Template selection matrix

| Your goal | Template | Layer | Typical duration |
|---|---|---|---|
| Start a new Captain rotation (monthly) | `captain.md` | Captain | ~1 month lifespan |
| Start a new week (Monday) | `weekly-ops.md` | Weekly Ops | Mon→Fri |
| Send DPA emails, apply to startup programs, CSR outreach | `external-ops.md` | Specialist | 1-3h |
| Translate content, publish blog, SEO metadata, OG images | `content-seo.md` | Specialist | 2-6h |
| Mobile responsive fixes, a11y pass, UX polish | `frontend-qa.md` | Specialist | 2-6h |
| Playwright E2E, unit coverage gaps, edge cases | `testing.md` | Specialist | 2-4h |
| Step 14 (Architect) features, DfMA checklist, client dashboard | `architect-tools.md` | Specialist | 4-8h |
| Security sweep, perf profiling, GDPR audit (READ ONLY) | `audit.md` | Specialist | 1-3h |
| Stripe live cutover, Vercel env sync, CI changes (EXCLUSIVE!) | `ops.md` | Specialist | 15 min - 2h |
| Fix specific bug + add regression test | `bug-fix.md` | Specialist | 30 min - 3h |
| External AI research / doc synthesis / code review / trend scan | see `docs/TOOLS_INTEGRATION.md` | sub-agent | varies |

---

## 💬 Communication between chats

Chats **cannot** talk directly. Communication is file-based:

1. **Handoff**: chat A finishes work that unblocks chat B → commit with
   `feat(scope): ... → unblocks <B-task-id>` → update TRACKER.md
2. **Blocker**: chat hits a problem only main can solve → update TRACKER.md
   status + write clear ask in scratchpad
3. **Context share**: cross-reference scratchpads via file path in commits
4. **Main chat coordinates**: this (modulca main repo chat) is the orchestrator.
   Parallel chats report up; it dispatches decisions down.

---

## 🔄 End-of-session ritual (every chat)

Before closing a chat:
1. Update scratchpad at `docs/sessions/active/YYYY-MM-DD-<role>-<taskid>.md`
   with: what was done, decisions taken, what's pending, handoff notes
2. Update TRACKER.md: move row from "Active" to "Past", set status, add outcome summary
3. Commit: `chore(session): close <role> chat <taskid> — <brief outcome>`
4. Push to master

---

## 🚨 Emergency: runaway chat

If a chat goes off scope or loops:
1. Stop it (tell the chat "stop immediately")
2. `git status` in main chat — see what's dirty
3. `git stash push -u -m "runaway-<taskid>-<date>"` to park changes safely
4. Review the stash; drop if bad, apply selectively if some changes were OK
5. Update TRACKER.md — mark session as "Aborted" with reason

See `docs/PARALLEL_SESSIONS.md` §4.5 for full recovery protocol.

---

## 📖 Reading order for any new chat

Every new chat reads these in order at spawn:
1. `docs/META_SYSTEM.md` (the 3-layer architecture + golden rules)
2. `docs/sessions/README.md` (this file)
3. `docs/PARALLEL_SESSIONS.md` (full protocol)
4. `docs/ECOSYSTEM_ARCHITECTURE.md` (what we're building + legal entities)
5. `docs/TASK_MASTER.md` (what's planned, what's done)
6. `docs/sessions/TRACKER.md` (live state)
7. Its own template file
8. For Captain: latest `active/<date>-captain-handoff.md`
9. For Weekly Ops: latest `active/YYYY-Www-1-weekly-ops.md` (previous week)
10. For Specialists: last 2-3 scratchpads in `active/` for context
11. `docs/TOOLS_INTEGRATION.md` if the chat may need external AI tools

That's ~20 min of reading, but reduces context-rebuild waste massively.

---

## 🔧 Maintenance

**Monthly**: review templates, retire or merge if scope shifts.
**Quarterly**: deep-review protocols in PARALLEL_SESSIONS.md, update decision log.
**On new pattern emerging**: write a new template file (modular — doesn't affect existing).

---

*The point of this system: any new chat should be able to start from ZERO knowledge of our conversations and become productive in 15 minutes. If a new chat can't get up to speed by reading the files above, something's wrong with our docs — fix the docs, not the chat.*
