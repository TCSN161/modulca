# Session: Frontend QA — FE-QA-001 — 2026-04-21

> **Role**: Frontend QA Specialist
> **Task ID**: FE-QA-001
> **Pre-dispatch-created**: 2026-04-20 by Weekly Ops WEEK-2026-W17 (so Specialist can spawn with zero friction Tue AM)
> **Expected spawn**: 2026-04-21 (Tuesday) morning EET
> **Expected close**: 2026-04-23 (Thursday) EET with clean report or prioritized bug list
> **Orchestrator**: Weekly Ops WEEK-2026-W17 (`claude/nice-chandrasekhar-aa2808`)
> **Captain**: CAPTAIN-2026-04 (`claude/modest-blackwell-dfbf1f`)
> **Purpose of this file**: single source of truth for this session's state; Specialist owns from here onward and updates on every commit.

---

## 📋 SPAWN PROMPT — paste into a NEW Claude Code chat as first message

```
===== BEGIN SPAWN PROMPT =====

ROLE: Frontend QA Chat (Specialist — 3-Layer Captain Architecture)
TASK ID: FE-QA-001
SPAWN TIME: 2026-04-21 [HH:MM] EET
CAPTAIN CHAT: CAPTAIN-2026-04
ORCHESTRATOR: WEEK-2026-W17 (Weekly Ops)
SIBLING CHATS: Captain (strategic) + Weekly Ops (sprint exec) active. EXT-OPS-001 dormant (kit 100% send-ready post commit fe6b88d, awaits user execution of 6 DPAs + 6 startup apps). Cap 3/3 momentary with this spawn; restores to 2 once FE-QA-001 closes.

SCOPE: UI quality pre-launch audit — mobile 375px final sweep across Steps 1–14 + a11y pass (ARIA, keyboard nav StepNav, focus trap modals, skip-to-content link). Component-level changes only. Close Thursday 2026-04-23 with clean report OR prioritized bug list for bug-fix dispatch.

WHY NOW (beta launch T-10 days, target 2026-05-01):
- Investor demo will happen on iPhone. Layout breakage at 375px = immediate trust loss.
- A11y = legal obligation (EU EAA 2025), GDPR posture signal, and broadens addressable market.
- Last clean window before feature freeze — next week is launch-prep only.

ALLOWED PATHS:
  READ: all of src/ and docs/
  WRITE:
  - src/app/** (pages/layouts — UI only, not route logic)
  - src/features/**/components/** (components)
  - src/shared/components/**
  - src/features/shared/components/**
  - src/i18n/messages/*.json (add new UI strings, never reorder existing)
  - globals.css (accessibility fix only)
  - docs/sessions/active/2026-04-21-frontend-qa-FE-QA-001.md (THIS FILE — you own it from spawn)
  - docs/sessions/TRACKER.md (status updates)
  - docs/TASK_MASTER.md (mark B1/B4/B5/B6/B7 Done as you close them)

FORBIDDEN:
  - src/app/api/** (API routes → bug-fix or ops chat)
  - scripts/, supabase/, package.json, next.config.*, .env*, .github/
  - Store logic (src/features/**/store.ts) — feature work
  - Server actions that change behavior
  - Spawning a 4th concurrent chat

READ FIRST at spawn (~15 min):
  1. docs/META_SYSTEM.md §3-Layer + §Golden rules (alignment)
  2. docs/sessions/README.md (naming, comms)
  3. docs/PARALLEL_SESSIONS.md §2 (chat type rules)
  4. docs/sessions/TRACKER.md (current active chats; confirm cap)
  5. THIS scratchpad (the one you're reading — continuation notes from Weekly Ops)
  6. docs/sessions/active/2026-W17-weekly-ops.md (Weekly Ops week scratchpad)
  7. docs/audits/2026-04-17.md §2 UX 14 Steps + §4.7 Accessibility (the audit that seeded this task)
  8. docs/I18N.md (RO+EN contract for strings)
  9. src/ARCHITECTURE.ts (project map — Costin memory rule: read this first for big projects)
  10. Last 2-3 scratchpads in docs/sessions/active/ for context

PRIORITY STACK FOR THIS SESSION (in order):

Task 1 — Mobile 375px sweep across Steps 1–14 (estimated 2-3h)
  - Open each of the 14 steps at 375px viewport (Chrome DevTools → iPhone SE or custom 375×667)
  - Note: layout breaks, horizontal overflow, tap-target sizes <44×44px, text wrapping weirdness
  - Known cramped candidates per audit: Steps 1, 8, 11, 13
  - Fix inline where <30 min per fix; if >30 min, log in this scratchpad for a bug-fix Specialist
  - Commit per step or per fix cluster: `ui(mobile): <what changed at step X>`

Task 2 — A11y pass critical items (estimated 1.5-2h)
  Per audit §4.7 findings:
  - [ ] All `<button>` with icon-only children: add aria-label
  - [ ] All `<Image>` across landing, steps, knowledge: descriptive alt (not "image", not empty)
  - [ ] Skip-to-content link added in root layout (`src/app/layout.tsx`)
  - [ ] Modal focus trap: upgrade modal, contact form, confirm dialogs — verify focus stays within on Tab; Esc closes + restores focus to trigger
  - [ ] `.text-brand-gray-X` contrast check against WCAG AA (4.5:1 normal, 3:1 large)
  - [ ] role + aria attributes on custom interactive elements (StepNav, LanguageSwitcher, Tier cards)

Task 3 — Keyboard navigation StepNav (estimated 30-45 min)
  - ← → arrow keys navigate between steps when StepNav focused
  - Home/End jump to first/last
  - Tab order logical through every step's controls
  - Enter submits primary CTA where applicable
  - Document keyboard shortcuts in a small accessible panel or aria-describedby

Task 4 — Focus management polish (estimated 45 min)
  - On modal close → restore focus to trigger element
  - On route change → focus main `<h1>` or set aria-live region
  - LanguageSwitcher dropdown: aria-expanded, arrow-key navigation, Escape closes

Task 5 — UX polish / visual bugs found during tasks 1-4
  - Log in scratchpad per finding; fix inline if trivial, queue if >30 min

OPERATING RULES:
- After every component change: `npx tsc --noEmit` MUST pass before commit
- Every 30 min active work: `npm run collision-check`
- Commits: `ui(<scope>): <what>` (scopes: `a11y`, `mobile`, `kb-nav`, `focus`, `polish`)
- NEVER commit with bare `git commit` — always explicit file paths per CLAUDE.md §Parallel Session Safety
- Test changes in dev: `npm run dev` → visit affected page → manual keyboard + DevTools a11y audit
- If a bug is >30 min: STOP, queue for bug-fix Specialist with clear repro steps in this scratchpad
- Don't refactor for refactoring — if a component is messy but works, leave it unless directly related to QA task

KILL SWITCH:
- If scope creep emerges (e.g., "while I'm here let me refactor X") → STOP, note in scratchpad, defer
- If blocked by Weekly Ops decision → update this scratchpad + escalate via commit body `→ blocked by <thing>`
- If prod incident during session → HALT, alert user immediately (no competing work)

SESSION OUTPUT (append to this file):
  ## Findings (categorized: mobile / a11y / kb / focus / polish)
  ## Bugs fixed inline (commits linked)
  ## Bugs queued for bug-fix Specialist (with repro + acceptance criteria)
  ## A11y improvements (WCAG criteria addressed with before/after)
  ## Mobile breakpoints tested (375, 430, 768)
  ## Regressions introduced (ideally: none)
  ## Handoff to Weekly Ops (for Friday Handoff → Captain)

On close:
  1. Run `npm run typecheck` + `npm run test:run` green
  2. Update TRACKER.md: FE-QA-001 row → Past with outcome summary
  3. Update TASK_MASTER.md: mark B1/B4/B5/B6/B7 Status = Done for items actually closed
  4. Commit: `chore(session): close FE-QA-001 — <outcome>`
  5. Push to master
  6. Append "Handoff to Weekly Ops" section below with bug-fix queue (if any)

===== END SPAWN PROMPT =====
```

---

## Context from Weekly Ops (prepared 2026-04-20)

### Why this session runs Tuesday, not Monday

EXT-OPS-001 was dormant-pending-user until Monday afternoon. Cap was 3/3 (Captain + Weekly Ops + EXT-OPS-001). Spawning FE-QA-001 Monday = 4 concurrent chats = hard-cap breach. Waiting until Tuesday respects the cap + gives EXT-OPS-001 a full commit window to close cleanly.

### What was done before your spawn

- ✅ Supabase Pro live with tax ID (MCA SRL / RO35294600 / full address) 2026-04-20
- ✅ Migration 010 `monitoring_signals + incidents + remediation_log` live in Supabase prod (Autonomous Agent Stage 1 data layer)
- ✅ EXT-OPS-001 commit `fe6b88d` — startup programs kit 100% send-ready
- ⏳ Awaiting first GitHub Actions `ops-check-cron` green tick (6h schedule from ~16:30 EET Monday)

### Specific audit references you'll need

- `docs/audits/2026-04-17.md` §2 lists Steps 1, 8, 11, 13 as cramped at 375px
- `docs/audits/2026-04-17.md` §4.7 lists the a11y gaps (aria labels, skip-to-content, focus management on modals)
- `docs/TASK_MASTER.md` rows B1 (mobile), B4 (a11y critical), B5 (kb nav), B6 (alt text), B7 (focus mgmt) map to this session's 5 tasks

### Handoff notes

- You're the 3rd chat in the 3/3 cap during your session. DO NOT spawn sub-specialists (bug-fix, content, etc.) — queue bugs in this scratchpad instead; Weekly Ops dispatches bug-fix Specialists next week if needed.
- If you find a bug that requires backend work (API, DB, auth), STOP and log it — that's outside FE-QA scope.
- Your close triggers Weekly Ops to dispatch TEST-001 Thursday/Friday.

---

## 🗂️ Specialist-owned sections (you fill these as you work)

### Findings

_(categorize: mobile / a11y / kb / focus / polish)_

### Bugs fixed inline (with commit SHAs)

_(list as you fix)_

### Bugs queued for bug-fix Specialist

_(list with repro steps + acceptance criteria + files to touch)_

### A11y improvements (WCAG criteria + before/after)

_(catalog)_

### Mobile breakpoints tested

- [ ] 375px (iPhone SE — smallest)
- [ ] 430px (iPhone 16 Pro Max)
- [ ] 768px (iPad portrait — tablet breakpoint)

### Regressions introduced

_(ideally none — log anything suspect for Weekly Ops verification)_

---

## Handoff to Weekly Ops

_(write on close — Weekly Ops reads this for Friday Handoff to Captain)_

### Outcome summary
_TBD_

### What shipped (commits)
_TBD_

### What's queued (bug-fixes for next week)
_TBD_

### Lessons / surprises
_TBD_

### Ready for TEST-001?
Yes / No / Blocked on _X_
