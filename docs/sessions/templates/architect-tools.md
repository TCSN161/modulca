# Template: Architect Tools Chat (Step 14)

**Use when**: polishing Step 14 (Architect Workspace), building DfMA checklist features, client dashboard, change orders workflow, phase tracking — Pro-tier features for architect users.

**Duration**: 4-8h typical.

**Permissions**: write to architect feature only; read everything for context.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Architect Tools Chat
TASK ID: ARCH-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Step 14 (Architect Workspace) features — scope limited to src/features/architect/**.

ALLOWED PATHS:
  READ: all of src/ + docs/
  WRITE:
  - src/features/architect/** (components, store, types, phases)
  - src/app/(app)/project/[id]/architect/** (route)
  - src/features/architect/**/__tests__/** (tests for architect)
  - src/i18n/messages/*.json (to add architect.* namespace strings)
  - docs/sessions/active/YYYY-MM-DD-arch-ARCH-<id>.md (new)
  - docs/sessions/TRACKER.md (status)

FORBIDDEN:
  - src/features/* other than architect/
  - src/app/api/** (unless architect-specific route — flag to main chat first)
  - scripts/, supabase/, package.json, .env*, .github/

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/audits/2026-04-17.md §2 Step 14 (weakest step per audit)
  3. src/features/architect/ (all files — familiarize with phases.ts, store.ts, types)
  4. docs/ECOSYSTEM_ARCHITECTURE.md §5 (tech architecture)
  5. docs/sessions/TRACKER.md
  6. Last 2 architect session scratchpads if any

CONTEXT:
Step 14 (Architect Workspace) is the Pro-tier hub for architect users managing multiple projects + clients. Currently FeatureGate-protected requiring "projectCollaboration" tier.

Components already exist (ArchitectWorkspace, OverviewDashboard, PhaseTracker, ClientBrief, FeeTracker, ChangeOrders, DfmaChecklist, TimelineView, ProjectNotes). Infinite-loop re-render bug fixed earlier (object-returning Zustand selectors → now memoized).

Still TODO per audit:
- Demo/fallback view for free tier (let them preview what Pro gives)
- UX polish on mobile for 8 tab navigation (scrollable, responsive)
- Better visual hierarchy in OverviewDashboard (feels cluttered)
- Empty states when no data (new architect opens workspace)
- Client portal sub-view (read-only version of project for clients)
- Export change orders to PDF
- Integration with main design flow (pull cost estimates from Finalize step)

TYPICAL TASKS:

── Task 1: Free tier teaser ──────────────────
- When non-Pro user hits /architect, show a preview page with:
  - Screenshots/mockups of each tab
  - "What you get" feature list
  - Upgrade CTA to Pricing
- Currently FeatureGate blocks entirely — change to preview mode

── Task 2: Mobile nav for 8 tabs ──────────────────
- TabBar currently has 8 tabs, overflows on mobile
- Convert to bottom nav with scroll snap, or dropdown on mobile
- Preserve keyboard accessibility

── Task 3: OverviewDashboard visual redesign ──────
- Currently KPI cards + phase pipeline + recent activity all stacked
- Better: hero section (project name, client, active phase), 3-up KPI cards, split pipeline timeline + recent activity 2-col
- Keep same data; restyle layout

── Task 4: Empty states ───────────────────────────
- New architect: no projects, no client, no change orders
- Show friendly onboarding (3 cards: "Add your first client", "Define project phases", "Set fee budget")
- Instead of current "0 / 0" KPIs which feel broken

── Task 5: Export change orders to PDF ────────────
- Currently ChangeOrders component lists them in UI
- Add "Export all" button → generates PDF via @react-pdf/renderer (already in deps)
- Template similar to docs/sessions/templates (professional, printable)

OPERATING RULES:
- Zustand selectors: always subscribe to raw state + compute derived in useMemo (avoid the infinite-loop pattern)
- Test new features: `npx vitest run src/features/architect/` — existing tests must still pass
- Commits: `feat(architect): <what>` or `ui(architect): <what>` for pure visual changes
- If a feature requires new Supabase table: STOP, write proposal in scratchpad, main chat reviews before migration

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-arch-ARCH-<id>.md with:
  ## Features added/polished
  ## Mobile improvements
  ## Visual redesigns (before/after description)
  ## Tests added
  ## Handoff

Final: commit + push + update TRACKER.md

===== END SPAWN PROMPT =====
```

## 💡 Tips

- Architect is where customer LTV concentrates — Pro tier is the upgrade funnel
- Keep flows STRICTLY about project management, not redesigning the 14-step core
- Mobile is secondary for architects (desktop-first makes sense here)
