# Template: Audit Chat (READ-ONLY)

**Use when**: quarterly security sweep, performance profiling, GDPR recheck, dependency audit, code quality review — investigation that writes ONLY to audit reports.

**Duration**: 1-3h typical.

**Permissions**: READ EVERYTHING; WRITE ONLY to `docs/audits/**`.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Audit Chat (READ-ONLY)
TASK ID: AUDIT-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Investigation + report. Zero write access to source code. Only docs/audits/** is writable.

ALLOWED PATHS:
  READ: all of repo
  WRITE:
  - docs/audits/**/*.md (new audit reports)
  - docs/sessions/active/YYYY-MM-DD-audit-AUDIT-<id>.md (new scratchpad)
  - docs/sessions/TRACKER.md (status column)

FORBIDDEN (strict):
  - src/, app/, scripts/, supabase/, public/ — do NOT write anything
  - package.json, .env*, .github/, next.config.*
  - Even typo fixes in source comments — file a note in audit report, let main chat do it

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/CONTINUOUS_AUDIT.md (audit cadence + template structure)
  3. docs/audits/2026-04-17.md (previous comprehensive audit — baseline)
  4. docs/sessions/TRACKER.md
  5. Last 2 audit reports if any

AUDIT TYPES (pick one per session):

── Type 1: Security sweep ──────────────────
Focus areas:
- RLS policies on all Supabase tables (read supabase/migrations/)
- API route auth checks (read all src/app/api/**/route.ts)
- Input validation patterns (zod schemas? manual?)
- Secret handling (no leakage to client bundle)
- CORS + rate limiting gaps
- Dependency vulnerabilities (`npm audit` results)

── Type 2: Performance profile ──────────────
Focus areas:
- Bundle size (reference audit LCP/TBT estimates)
- Hotspot components (search for useState count, useEffect deps size)
- Image optimization (WebP, lazy load, sizes)
- DB queries (after migration 009, could call analyzer if active)
- Static generation vs SSR strategy

── Type 3: GDPR recheck ─────────────────────
Focus areas:
- Privacy Policy (src/app/(app)/privacy/page.tsx) vs DRAFT v2 vs reality
- DPA status (docs/GDPR/DPA_Status.md) — all signed?
- PII scrubbing in logs + Sentry (verify sentry.client.config.ts)
- User rights endpoints (export + delete) working
- Cookie consent banner behavior
- Third-party processors list complete

── Type 4: Code quality review ─────────────
Focus areas:
- TypeScript: any `any` or `@ts-ignore`
- Component size (>500 lines = flag)
- Duplicated logic across features
- Dead exports (exported but never imported)
- TODO/FIXME count + triage

── Type 5: i18n completeness check ─────────
Focus areas:
- String parity across en.json / ro.json / nl.json
- Untranslated strings in components (look for hardcoded text)
- Fallback behavior (missing key → graceful degradation)
- Locale detection priority order correct

OPERATING RULES:
- Write findings in `docs/audits/YYYY-MM-DD-<type>.md` (e.g. `docs/audits/2026-04-20-security.md`)
- Use same format as `docs/audits/2026-04-17.md` (modular sections, progress bars, SWOT)
- For each finding: severity (P0/P1/P2/P3), file:line, description, recommended fix, owner
- DO NOT propose fixes in a way that implies you'll execute them — hand off to main chat or domain chat
- READ-ONLY enforcement: if you touch any source file by accident, revert immediately in scratchpad + commit as mistake
- Commits: `audit(type): <what scope covered>` (e.g. `audit(security): quarterly sweep — 3 P1 findings`)

SESSION OUTPUT:
Two files:
1. The audit report itself (docs/audits/YYYY-MM-DD-<type>.md) — primary deliverable
2. docs/sessions/active/YYYY-MM-DD-audit-AUDIT-<id>.md — session scratchpad with:
   ## Audit type
   ## Files reviewed (count)
   ## Key findings summary
   ## Top 5 actions recommended for main chat
   ## Handoff

Final: commit + push + update TRACKER.md (including any P0 findings in "Blockers" section of TRACKER)

===== END SPAWN PROMPT =====
```

## 💡 Tips

- Audit = observer, not operator. If you're tempted to fix something you find, WRITE IT DOWN instead
- Quarterly cadence ideal: Jan, Apr, Jul, Oct
- Focus narrow per session — one audit type = one session. Don't boil ocean
- Audit reports are permanent record — phrase findings so future-you can still act on them months later
