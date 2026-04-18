# Template: Testing Chat

**Use when**: writing E2E tests (Playwright), unit test coverage gaps, edge case coverage, regression tests for fixed bugs, load testing preparation.

**Duration**: 2-4h typical.

**Permissions**: full test file access; read source for context; never modify source logic.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Testing Chat
TASK ID: TEST-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Test coverage — E2E, unit, integration. Write tests; do not modify application code.

ALLOWED PATHS:
  READ: full repo (tests need to understand what they test)
  WRITE:
  - src/**/__tests__/** (unit tests)
  - src/**/*.test.ts and src/**/*.test.tsx (colocated tests)
  - tests/e2e/** (Playwright E2E if folder exists)
  - playwright.config.ts (only if user approves)
  - vitest.config.ts (only if user approves)
  - docs/sessions/active/YYYY-MM-DD-test-TEST-<id>.md (new)
  - docs/sessions/TRACKER.md (status)

FORBIDDEN:
  - src/app/** (application code — read-only)
  - src/features/** non-test files (application code — read-only)
  - scripts/, supabase/, next.config.*, .env*, package.json (only if user GO on adding test deps)

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/audits/2026-04-17.md §1 Technical (test coverage gaps noted)
  3. Current test files to understand style (e.g. src/features/auth/store.test.ts)
  4. docs/sessions/TRACKER.md
  5. Last 2 test scratchpads if any

TYPICAL TASKS:

── Task 1: Critical-path E2E (Playwright) ──────────
Scenarios to cover (no existing E2E yet):
  1. Signup → Google OAuth → Dashboard (happy path)
  2. Signup → Create project → Save to cloud → Reload → Project still there
  3. Guest → View pricing → Upgrade → Stripe checkout (test mode) → Webhook fires → Tier upgraded in DB → Dashboard reflects new tier
  4. Authenticated user → Request data export → JSON file downloads with their projects
  5. Authenticated user → Delete account → Soft-delete with 30-day grace → Sign out → Cannot sign back in until undo window
  6. AI render flow: enter prompt → select engine → render completes within 90s OR shows timeout error gracefully
  7. Free tier render quota: user at limit sees upgrade modal, doesn't get black-hole error
  8. Language switcher: toggle RO → UI reloads in RO → persists in cookie → EN-only page still readable

── Task 2: Unit test coverage gaps ─────────────────
Priority (no tests currently):
- Stripe webhook handler (src/app/api/stripe/webhook/route.ts) — mock Stripe.Event objects per event type
- User export endpoint (src/app/api/user/export/route.ts) — mock session + verify JSON structure
- User delete endpoint (src/app/api/user/delete/route.ts) — mock soft-delete + Stripe cancellation
- api-auth helper (src/shared/lib/api-auth.ts) — verify token extraction from Bearer + cookie
- Locale detection (src/i18n/config.ts detectLocale function) — all 4 sources (cookie/domain/header/default)

── Task 3: Regression tests for fixed bugs ─────────
Add test that ensures these don't regress:
- Architect page infinite loop fix (object-returning selectors → memoize)
- Thumbnail column defensive fallback (projectService.ts with and without extended schema)
- Step 1/2 order swap (choose comes before land)
- Language switcher cookie persistence
- Cookies page renders without errors (regression test for the 404 that was fixed)

── Task 4: Edge cases ──────────────────────────────
- Supabase offline (network error) → localStorage fallback kicks in
- Very long project name (200+ chars) → UI doesn't break
- Special characters in project name (Unicode, emoji)
- Render prompt with prompt-injection attempts → sanitized
- User with 0 projects → empty state displays
- User at tier project limit → upgrade CTA shows, doesn't silent-fail

OPERATING RULES:
- Follow existing test style (vi.mock with vi.hoisted for mocks that need to be available in mock factories)
- Tests must be fast: <5s per test, <30s per file
- Use beforeEach for setup, afterEach for teardown
- No flaky tests — if a test is timing-dependent, add explicit waits not setTimeout
- Run after each new test: `npx vitest run <file>` — then `npx vitest run` for full suite
- Commits: `test(scope): <what>` (e.g. `test(webhook): cover checkout.session.completed event`)

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-test-TEST-<id>.md with:
  ## Tests added (file + scenario)
  ## Coverage delta (before/after % if measurable)
  ## Bugs discovered during test writing
  ## E2E scenarios automated
  ## Handoff

Final: commit + push + update TRACKER.md

===== END SPAWN PROMPT =====
```

## 💡 Tips

- Playwright: `npm run test:mobile:local` with dev server running
- Vitest: `npx vitest --watch` for TDD, `npx vitest run` for CI-style
- Mock Supabase responses with `vi.mock` + `vi.hoisted`
- Mock Stripe: use `stripe-mock` if added, or hand-crafted event objects
- For flaky network tests: `msw` (mock service worker) is the modern way — check if already installed before adding
