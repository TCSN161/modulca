# Template: Frontend QA Chat

**Use when**: mobile responsiveness fixes, accessibility (a11y) pass, keyboard navigation, focus management, UX polish, visual bugs — user-facing UI quality work.

**Duration**: 2-6h typical.

**Permissions**: write access to components + styles; no config changes.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Frontend QA Chat
TASK ID: FE-QA-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: UI quality — mobile, a11y, keyboard nav, focus, visual polish. Component-level changes only.

ALLOWED PATHS:
  READ: all of src/ and docs/
  WRITE:
  - src/app/** (pages/layouts — but only UI, not route logic)
  - src/features/**/components/** (components)
  - src/shared/components/**
  - src/features/shared/components/**
  - src/i18n/messages/*.json (to add new UI strings if needed)
  - globals.css if accessibility fix
  - docs/sessions/active/YYYY-MM-DD-fe-qa-<id>.md (new)
  - docs/sessions/TRACKER.md + docs/TASK_MASTER.md (status)

FORBIDDEN:
  - src/app/api/** (API routes — that's bug-fix or ops chat)
  - scripts/, supabase/, package.json, next.config.*, .env*, .github/
  - Store logic (src/features/**/store.ts) — that's feature work
  - Server actions that change behavior

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/audits/2026-04-17.md §2 UX 14 Steps + §4.7 Accessibility
  3. docs/I18N.md
  4. docs/sessions/TRACKER.md
  5. Last 2 fe-qa scratchpads if any

TYPICAL TASKS (pick scope for this session):

── Task 1: Mobile 375px audit ──────────────────
- Open each of 14 steps at 375px viewport
- Note layout breaks, overflow, tap-target sizes
- Fix inline or propose approach in scratchpad
- Reference: audit report lists Steps 1, 8, 11, 13 as cramped

── Task 2: Accessibility pass ──────────────────
Per audit §4.7:
- All <button> need aria-label if icon-only
- All <Image> need descriptive alt text
- Skip-to-content link in layout
- Color contrast on .text-brand-gray check WCAG AA
- Modal focus trap (upgrade modal, contact form, confirm dialogs)
- role + aria attributes on custom interactive elements

── Task 3: Keyboard navigation ─────────────────
- StepNav arrow keys (← → between steps)
- Esc to close modals
- Enter to submit forms (check all forms)
- Tab order logical through pages

── Task 4: Focus management ────────────────────
- After modal close: restore focus to trigger
- On route change: focus main heading
- LanguageSwitcher dropdown: proper aria-expanded, arrow navigation

── Task 5: UX polish specific bugs ─────────────
[User lists specific bugs here in session — e.g. "Architect tab bar on mobile overflows" or "pricing tier cards don't align on iPad"]

OPERATING RULES:
- After every component change: `npx tsc --noEmit`
- Every 30 min: `npm run collision-check`
- Commits: `ui(scope): <what>` (e.g. `ui(a11y): add skip-to-content link`, `ui(mobile): fix step 8 overflow`)
- Don't refactor for refactoring — if a component is messy but works, leave it unless directly related to QA task
- Test changes in dev: `npm run dev` → visit the affected page

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-fe-qa-<id>.md with:
  ## Bugs fixed (before/after)
  ## A11y improvements (WCAG criteria addressed)
  ## Mobile fixes (which breakpoints tested)
  ## Regressions introduced (none, ideally)
  ## Handoff

Final: commit + push + update TRACKER.md

===== END SPAWN PROMPT =====
```

## 💡 Tips

- Chrome DevTools → Lighthouse → Accessibility tab: use for a11y score
- Chrome DevTools → Rendering → Emulate CSS media type: test prefers-reduced-motion
- 375px = iPhone SE (smallest we target)
- 768px = iPad portrait (important breakpoint — many tablets hit this)
- Keyboard test: unplug mouse for 10 min, navigate only with Tab/Enter/Esc/arrows
