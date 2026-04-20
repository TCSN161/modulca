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

## 🔤 Naming convention (single source of truth)

Every artifact produced by a chat follows these patterns. **Consistency here is how any chat (or any human) can instantly see what a file is, who owns it, and when it was made.**

### Task IDs (what goes in TRACKER + spawn prompt)

| Layer | Template | Task ID format | Example | Notes |
|---|---|---|---|---|
| Captain | `captain.md` | `CAPTAIN-YYYY-MM` | `CAPTAIN-2026-04` | One per month. Month = rotation period. |
| Weekly Ops | `weekly-ops.md` | `WEEK-YYYY-Www` | `WEEK-2026-W17` | ISO week number. One per Mon-Fri. |
| External Ops | `external-ops.md` | `EXT-OPS-NNN` | `EXT-OPS-001` | Incremental. Next = max in TRACKER + 1. |
| Content & SEO | `content-seo.md` | `CONTENT-NNN` | `CONTENT-001` | Incremental. |
| Frontend QA | `frontend-qa.md` | `FE-QA-NNN` | `FE-QA-001` | Incremental. |
| Testing | `testing.md` | `TEST-NNN` | `TEST-001` | Incremental. |
| Architect Tools | `architect-tools.md` | `ARCH-NNN` | `ARCH-001` | Incremental. |
| Audit | `audit.md` | `AUDIT-NNN` | `AUDIT-001` | Incremental. |
| Ops (EXCLUSIVE) | `ops.md` | `OPS-NNN` | `OPS-001` | Incremental. Only one active ever. |
| Bug fix | `bug-fix.md` | `BUG-NNN` | `BUG-001` | Incremental. |

### Scratchpad filenames (in `docs/sessions/active/`)

Pattern: **date or period → role → task ID**. Sortable by date, groupable by role, unique per task.

| Type | Filename | Example |
|---|---|---|
| Captain session | `YYYY-MM-DD-captain-YYYY-MM.md` | `2026-04-20-captain-2026-04.md` |
| Captain handoff | `YYYY-MM-DD-captain-handoff.md` | `2026-04-30-captain-handoff.md` |
| Weekly Ops week | `YYYY-Www-weekly-ops.md` | `2026-W17-weekly-ops.md` |
| External Ops | `YYYY-MM-DD-external-ops-EXT-OPS-NNN.md` | `2026-04-18-external-ops-EXT-OPS-001.md` |
| Content & SEO | `YYYY-MM-DD-content-seo-CONTENT-NNN.md` | `2026-04-22-content-seo-CONTENT-001.md` |
| Frontend QA | `YYYY-MM-DD-frontend-qa-FE-QA-NNN.md` | `2026-04-23-frontend-qa-FE-QA-001.md` |
| Testing | `YYYY-MM-DD-testing-TEST-NNN.md` | `2026-04-24-testing-TEST-001.md` |
| Architect Tools | `YYYY-MM-DD-architect-tools-ARCH-NNN.md` | `2026-04-25-architect-tools-ARCH-001.md` |
| Audit | `YYYY-MM-DD-audit-AUDIT-NNN.md` | `2026-04-26-audit-AUDIT-001.md` |
| Ops | `YYYY-MM-DD-ops-OPS-NNN.md` | `2026-04-27-ops-OPS-001.md` |
| Bug fix | `YYYY-MM-DD-bug-fix-BUG-NNN.md` | `2026-04-28-bug-fix-BUG-001.md` |

Notes:
- **Dates in EET** (Europe/Bucharest). User's timezone — consistency matters when cross-referencing commits.
- **Captain handoff has no task ID suffix** — only one is current per rotation, the date uniquely identifies it.
- **Weekly Ops uses ISO week** (`Www`), not a calendar date — one file spans Mon-Fri.
- **Specialist scratchpads use spawn date** (not close date) so the file sorts with the session's actual start.

### Commit message prefixes

| Prefix | Scope | Who commits | Example |
|---|---|---|---|
| `feat(<area>):` | New feature / capability | Weekly Ops or Specialist | `feat(i18n): migrate pricing page to RO+EN` |
| `fix(<area>):` | Bug fix | Specialist (bug-fix or inline) | `fix(auth): session timeout race condition` |
| `docs(<area>):` | Documentation | Captain or any | `docs(meta): update decision log for April` |
| `chore(captain):` | Captain maintenance | Captain only | `chore(captain): week-close 2026-W17` |
| `chore(weekly-ops):` | Weekly Ops standup | Weekly Ops only | `chore(weekly-ops): Tuesday standup — EXT-OPS unblocked` |
| `chore(ext-ops):` | External Ops work | External Ops Specialist | `chore(ext-ops): DPA emails sent to 4 vendors` |
| `chore(content):` | Content & SEO work | Content Specialist | `chore(content): 3 KB articles translated RO` |
| `chore(fe-qa):` | Frontend QA work | Frontend QA Specialist | `chore(fe-qa): a11y pass on Steps 1-7` |
| `chore(test):` | Testing work | Testing Specialist | `chore(test): Playwright E2E for auth flow` |
| `chore(arch):` | Architect Tools work | Architect Specialist | `chore(arch): DfMA checklist UX polish` |
| `chore(audit):` | Audit findings | Audit Specialist | `chore(audit): Q2 security sweep report` |
| `chore(ops):` | Production ops | Ops Specialist | `chore(ops): Stripe test→live cutover OPS-001` |
| `chore(bug-fix):` | Bug-fix session | Bug-Fix Specialist | `chore(bug-fix): step 14 infinite loop BUG-007` |
| `chore(session): close` | Closing a session | Any (end-of-session) | `chore(session): close EXT-OPS-001 — 4 DPAs sent` |
| `chore(tracker):` | TRACKER.md update | Any | `chore(tracker): spawn WEEK-2026-W17` |
| `chore(config):` | Settings / tooling | Any | `chore(config): extend allow list for ops` |

Linking commits to sessions: include `→ unblocks <task-id>` in the commit body (not title) when A finishes work that B was waiting on. Grep-friendly.

### Research / tool outputs (from `docs/TOOLS_INTEGRATION.md`)

| Type | Filename | Example |
|---|---|---|
| Perplexity research | `docs/research/YYYY-MM-DD-<topic-slug>.md` | `docs/research/2026-04-22-nl-modular-permits.md` |
| NotebookLM synthesis | `docs/research/YYYY-MM-DD-notebooklm-<topic>.md` | `docs/research/2026-04-25-notebooklm-dpa-synthesis.md` |
| Codex CLI review | `docs/research/YYYY-MM-DD-codex-<scope>.md` | `docs/research/2026-04-27-codex-stripe-golive.md` |
| Grok trend scan | `docs/research/YYYY-MM-DD-grok-<query>.md` | `docs/research/2026-05-01-grok-launch-sentiment.md` |
| Claude Design mockup | `docs/design/YYYY-MM-DD-<artifact>.md` + images | `docs/design/2026-04-29-one-pager-v3.md` |

Why this matters: research accumulates fast. Without a consistent filename, finding "that Perplexity query about NL permits from 3 weeks ago" becomes archaeology.

### Memory files (at `~/.claude/projects/.../memory/`)

Already follow a clean `<kind>_<subject>.md` pattern (`user_costin.md`, `project_modulca.md`, `principle_modular_i18n.md`, `feedback_autonomy.md`). Don't rename these; they're referenced across chats.

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
