# Template: Bug-Fix Chat

**Use when**: single specific bug to reproduce + fix + regression test. NOT for refactoring or scope creep.

**Duration**: 30 min - 3h typical.

**Permissions**: write access wherever the bug lives — but declared at spawn time, not expanded mid-session.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Bug-Fix Chat
TASK ID: BUG-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Fix ONE specific bug. Reproduce, fix, add regression test, done.

BUG DESCRIPTION: [FILL IN — 1-2 sentences]
REPRODUCTION STEPS: [FILL IN — numbered list or URL with steps]
EXPECTED: [FILL IN]
ACTUAL: [FILL IN]
SEVERITY: [FILL IN — P0 / P1 / P2 / P3]
SUSPECTED AREA: [FILL IN — e.g. "src/features/design/components/render/RenderPage.tsx" or "Stripe webhook idempotency"]

ALLOWED PATHS:
  READ: full repo
  WRITE:
  - Files directly related to the bug (scope declared above)
  - Related tests (`*.test.ts` near the bug)
  - docs/sessions/active/YYYY-MM-DD-bug-BUG-<id>.md (new)
  - docs/sessions/TRACKER.md (status)

FORBIDDEN:
  - Refactoring unrelated code ("while I'm here, let me clean up X" = NO)
  - Touching multiple features unless bug spans them
  - next.config.*, tsconfig.json, package.json, .env*, .github/

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/audits/2026-04-17.md — check if bug listed there
  3. docs/sessions/TRACKER.md
  4. The suspected source file (and git log on it)

PROCEDURE:

── 1. Reproduce (10-30 min) ──────────────────
- Can you reliably reproduce the bug?
- If not, STOP — add instrumentation (Sentry breadcrumbs, console.log) first, ship, wait for real user to hit it
- If yes — document exact repro in scratchpad

── 2. Root cause analysis (10-60 min) ────────
- Find the root cause, not just the symptom
- Git log on affected file: when was the faulty line introduced? What was the intent?
- Check related tests: did we have test coverage that missed this?

── 3. Fix (30 min - 2h) ──────────────────────
- Minimal change that addresses root cause
- NO refactoring beyond what's directly necessary
- Preserve existing patterns in the file (don't introduce new conventions mid-fix)
- If fix requires >50 lines changed: STOP, consider if this should be a Feature Chat instead

── 4. Regression test (30 min - 1h) ──────────
- Add a test that would have FAILED before your fix and PASSES after
- If adding test isn't feasible (e.g. 3D rendering visual bug): document manual test steps in scratchpad
- Run full test suite: `npx vitest run`

── 5. Verify no regressions ──────────────────
- `npx tsc --noEmit` — zero errors
- `npx vitest run` — all tests pass
- Manual: exercise the happy path around the fixed code
- `npm run collision-check` before commit

── 6. Commit + push ──────────────────────────
- Message format: `fix(scope): <description>` (e.g. `fix(render): prevent infinite loop in RenderScene3D`)
- Include bug description + root cause in commit body (not just what, but why)
- Push to master via direct commit (bug fixes are small, no PR needed unless >100 lines)

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-bug-BUG-<id>.md with:
  ## Bug
  ## Reproduction (confirmed)
  ## Root cause
  ## Fix (summary + file:line)
  ## Regression test added (test file + scenario)
  ## Commits
  ## Verified clean (tsc + vitest + ops:check)
  ## Handoff (usually: none — bug fixes complete in one session)

Final: commit + push + update TRACKER.md

===== END SPAWN PROMPT =====
```

## 💡 Tips

- **Reproduce before fixing.** A bug you can't reproduce is a bug you can't verify fixed.
- **Regression test > temporary fix.** Every fix that ships without a test is a future regression.
- **Small PRs / commits.** Bug fixes should rarely exceed 50 lines changed. If bigger, consider feature chat.
- **Document the root cause, not just the symptom.** "Fixed undefined error" is lazy. "Fixed infinite loop caused by object-returning Zustand selectors creating new refs every render" is useful.
- **Don't fix adjacent bugs you notice.** File them in TRACKER.md backlog instead. Scope discipline.
