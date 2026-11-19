# ModulCA — Task Master List
### Updated: 2026-11-19 (ModulCA 2.0 reboot) | Invite-only Beta: Dec 15 2026 | Public Launch: Feb 1 2027

> **⚠️ April 2026 section (below the horizontal rule after "ModulCA 2.0 TASK LIST") is kept as REFERENCE for history + tasks that remain applicable.** Current work uses the MCA-* task IDs in the top section.

---

## 🎯 ModulCA 2.0 TASK LIST (ACTIVE)

**Phase overview**: `docs/MCA-STRAT-2026-11-19-reboot.md`

Task ID format: **`MCA-<phase>-T<nn>`** (e.g., `MCA-P2-T03`). Legacy April chat IDs (A/B/C/D/E/F) preserved in the old section for cross-reference.

### Phase 0 — Reset (Nov 19-20) — ✅ 85% DONE

| MCA ID | Task | Effort | Status | Owner | Notes |
|---|---|---|---|---|---|
| MCA-P0-T01 | Write 5 MCA-STRAT + MCA-DOC docs (reboot baseline) | L | ✅ DONE | Claude | Commit `39c60c8` |
| MCA-P0-T02 | Commit CATUC references folder with README provenance | S | ✅ DONE | Claude | Commit `39c60c8` |
| MCA-P0-T03 | Settings.local.json permissions preset | S | ✅ DONE | Claude | For session efficiency |
| MCA-P0-T04 | Write MCA-SPEC-CATUC-PHASE2-PLAN | L | ✅ DONE | Claude | Commit `76185cc` |
| MCA-P0-T05 | Write NotebookLM query packet for user | M | ✅ DONE | Claude | `docs/research/2026-11-19-notebooklm-catuc-queries.md` |
| MCA-P0-T06 | Fix B1 Supabase blocker ($12.90 invoice + restore) | S | ✅ DONE | User + Claude | Supabase Healthy |
| MCA-P0-T07 | Rebaseline TRACKER.md + TASK_MASTER.md with MCA-* | M | 🔄 IN PROGRESS | Claude | This edit |
| MCA-P0-T08 | Memory files refresh (Nov state replaces April) | S | ✅ DONE | Claude | 3 files updated |
| MCA-P0-T09 | Commit Phase 0 deliverables + push origin | S | ⏳ PARTIAL | Claude | 3 commits pushed, 1 pending (this edit + build results) |

### Phase 1 — Audit (Nov 21-25) — ⏳ 60% STARTED

| MCA ID | Task | Effort | Status | Owner | Notes |
|---|---|---|---|---|---|
| MCA-P1-T01 | ops:check baseline | S | ✅ DONE | Claude | 30/2/0 — Healthy after Supabase restore |
| MCA-P1-T02 | engines:audit — verify all AI keys valid | S | ✅ DONE | Claude | Together.ai FREE expired 142 days ago → downgrade from hero chain |
| MCA-P1-T03 | `npm run build` full production build | M | ⏳ RUNNING | Claude | Background task in progress |
| MCA-P1-T04 | `npm run typecheck` | S | ✅ DONE (via ops:check) | Claude | 0 errors |
| MCA-P1-T05 | `npm run test:run` all unit tests | S | ✅ DONE (via ops:check) | Claude | 147/147 pass |
| MCA-P1-T06 | `npm outdated` + `npm audit` — deps drift | S | ⏳ TODO | Claude | Est. tomorrow |
| MCA-P1-T07 | A1 Vercel dashboard verify | S | ⏳ AWAITS USER | User | Screenshot requested |
| MCA-P1-T08 | A2 Supabase dashboard post-restore metrics | S | ⏳ AWAITS USER | User | Tier, usage, migrations |
| MCA-P1-T09 | A3 Stripe mode + bank status | S | ⏳ AWAITS USER | User | Screenshot requested |
| MCA-P1-T10 | A4 Resend domain re-verify + usage | S | ⏳ AWAITS USER | User | ops:check passes, confirm visually |
| MCA-P1-T11 | A5 Sentry quota + project alive | S | ⏳ AWAITS USER | User | |
| MCA-P1-T12 | A6 Perplexity Pro status | S | ⏳ AWAITS USER | User | Decides AI delegation tier |
| MCA-P1-T13 | A7 Namecheap renewal + autorenewal | S | ⏳ AWAITS USER | User | Risk: domain expires |
| MCA-P1-T14 | CATUC 11-files grep scan — confirm 10 unique | S | ✅ DONE | Claude | Updated to 10 unique (not 11) |
| MCA-P1-T15 | AI landscape audit — what changed Apr→Nov | M | ⏳ TODO | Claude | → `MCA-DOC-AI-LANDSCAPE-2026-11.md` |
| MCA-P1-T16 | Content audit — SEO health, meta tags | S | ⏳ TODO | Claude | Sitemap + robots check |
| MCA-P1-T17 | Dependency security audit `npm audit` | S | ⏳ TODO | Claude | Flag high/critical |
| MCA-P1-T18 | Close April sessions in TRACKER (archive) | S | ✅ DONE | Claude | 3 past sessions logged |
| MCA-P1-T19 | NeufertAI model upgrade (sonnet-4 → sonnet-5-5) | S | ⏳ TODO | Claude | `src/app/api/consultant/route.ts` lines 392, 408 |
| MCA-P1-T20 | Together.ai removal from providerChain | S | ⏳ TODO | Claude | Free tier expired; replace or remove from hero chain |

### Phase 2 — CATUC Content Rewrite (Nov 26 - Dec 5) — 📅 PLANNED

See `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` for detailed per-file plan. Summary:

| MCA ID | Task | Effort | Status | Owner | Notes |
|---|---|---|---|---|---|
| MCA-P2-T01 | User: upload 3 files to NotebookLM | S (user) | ⏳ | User | Packet ready at `docs/research/2026-11-19-notebooklm-catuc-queries.md` |
| MCA-P2-T02 | User: run Q1-Q10 NotebookLM queries | M (user) | ⏳ | User | ~1h |
| MCA-P2-T03 | Claude: integrate NotebookLM answers into article mapping table | M | ⏳ | Claude | Fills `MCA-SPEC-CATUC-PHASE2-PLAN` §4 |
| MCA-P2-T04 | F1 PermitTracker.tsx — update legal text | S | ⏳ | Claude | 1 line edit |
| MCA-P2-T05 | F2 building-permit-process.new.md | L | ⏳ | Claude + DeepSeek | 2-3h rewrite |
| MCA-P2-T06 | F3 modular-prefab-regulations.new.md (CRITICAL legal) | L | ⏳ | Claude + Vlad | 3-4h, every word reviewed |
| MCA-P2-T07 | F4 urban-planning-pug-puz.new.md | M | ⏳ | Claude | 2h |
| MCA-P2-T08 | F5 _meta.yaml sources | S | ⏳ | Claude | 5 min |
| MCA-P2-T09 | F6 building-permit-romania.new.md (17-guides) | L | ⏳ | Claude + DeepSeek | 3-4h |
| MCA-P2-T10 | F7 choosing-land-modular-home.new.md | S | ⏳ | Claude | 1h |
| MCA-P2-T11 | F9 articles-ro.new.ts blog refs | M | ⏳ | Claude | 1h |
| MCA-P2-T12 | F10 docs/blog-drafts in-place rewrite | S | ⏳ | Claude | 30 min |
| MCA-P2-T13 | New: catuc-169-2026.new.md authoritative chapter | L | ⏳ | Claude + Vlad | 4-5h |
| MCA-P2-T14 | New: catuc-clarificari.new.md Ministry answers | M | ⏳ | Claude | 2-3h |
| MCA-P2-T15 | Vlad Ioniță formal review window | user | ⏳ | User + Vlad | Nov 28 - Dec 3 |
| MCA-P2-T16 | Deploy: mv .new.md → .md + build:kb regen + commit | S | ⏳ | Claude | Atomic step |

### Phase 3-7 — High-level placeholders

Detailed plans drafted when each phase approaches.

| Phase | Dates | High-level goal |
|---|---|---|
| **MCA-P3** PermitTracker v0 + Checker | Dec 6-14 | User inputs project → system outputs applicable CATUC regime + notification package |
| **MCA-P4** Pre-beta polish | Dec 15-22 | Deploy CATUC updates + residual beta blockers (mobile QA, a11y) |
| **MCA-P5** Invite-only beta | Dec 15 - Jan 15 | 10-20 users, feedback loop, zero critical bugs |
| **MCA-P6** Pre-launch | Jan 16-31 | Marketing groundwork, press kit, Cornetu case study, journalist outreach |
| **MCA-P7** Public launch | Feb 1 2027 | Go live + metrics dashboard + organic push |

---

## 📋 Blockers for Phase 2+ (sourced from MCA-DOC-BLOCKERS)

Linked: `docs/MCA-DOC-BLOCKERS-2026-11-19.md`

| Blocker ID | Blocks | Owner | ETA |
|---|---|---|---|
| ~~B1 Supabase paused~~ | ~~Phase 1 audit~~ | ✅ RESOLVED | — |
| B2 11→10 files with repealed law refs | Phase 2 deploy | Claude (Phase 2 writes) | Dec 5 |
| B3 NeufertAI model outdated | Better UX | Claude (quick fix) | Phase 1-2 |
| B4 Vlad Ioniță formal engagement | Phase 2 CATUC review | User | Before Dec 1 |
| B5 CATUC folder not committed | Repo integrity | ✅ RESOLVED | — |
| B6 npm version outdated | Minor | User | Phase 1 cleanup |
| B7 April sessions status in TRACKER | Documentation | ✅ RESOLVED | — |
| B8 EXT-OPS-001 user decisions pending | Phase 6 external ops | User | Phase 6 reactivate |
| B9 Dependencies possibly outdated | Build stability | Claude Phase 1 | Phase 1 audit |
| B10 Launch plan in TRACKER obsolete | Documentation | ✅ RESOLVED | — |

---

## 📊 Phase 0-1 Stats (as of 2026-11-19)

- Phase 0: 8/9 ✅ (89%), 1 in progress
- Phase 1: 7/20 ✅ (35%), 1 running, 12 todo
- Total MCA tasks defined: 55 (across Phase 0-2)
- Commits today: 4 (`39c60c8` reboot, `76185cc` Phase 2 plan, `194a6f0` status update, 1 pending)
- ops:check: 30 ✅ / 2 ⚠️ / 0 ❌
- Tests: 147/147
- TypeScript errors: 0

---

## ──────────────────────────────────────────

## ⚠️ LEGACY — April 2026 Task List (REFERENCE ONLY)

Below is the original April 2026 task list. Status snapshot: project was paused 2026-04-21 after Monday-only execution. Many tasks remain applicable, now re-categorized under MCA-P* phases above.

**Do not use chat IDs A/B/C/D/E/F below** — those map to the Captain/Weekly Ops architecture from April. Current approach is MCA-* task IDs + Captain layer when needed.

---

## HOW TO USE THIS LIST (original April)

Each task has:
- **Chat ID** — Which independent chat/session should own it
- **Priority** — P0 (beta blocker), P1 (should have), P2 (nice to have), P3 (post-beta)
- **Effort** — S (< 1h), M (1-4h), L (4-8h), XL (> 8h)
- **Status** — Done, In Progress, Todo, Blocked
- **Dependencies** — What must be done first

---

## CHAT/SESSION ALLOCATION

| Chat | Focus | Scope |
|------|-------|-------|
| **A — Infrastructure** | Auth, Stripe, email, env, deploy, monitoring | Backend ops |
| **B — Frontend QA** | Mobile responsive, a11y, UX polish, performance | All 14 steps |
| **C — Content & SEO** | i18n/Romanian, blog, KB, OG images, guides | Marketing |
| **D — AI & 3D** | Render engines, 3D walkthrough, Gaussian Splatting | AI pipeline |
| **E — Testing** | Test coverage, E2E tests, edge cases | Quality |
| **F — Architect Tools** | Step 14 polish, DfMA workflow, client dashboard | Pro features |

---

## P0 — BETA BLOCKERS (Must Do Before May 1)

### Chat A — Infrastructure

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| A1 | **Stripe: Test → Live keys** | S | BLOCKED | Waiting for bank verification (tomorrow). Then copy live keys to Vercel + .env.local |
| A2 | **Verify Stripe webhooks in live mode** | S | Todo | After A1. Create live webhook endpoint, update STRIPE_WEBHOOK_SECRET |
| A3 | **Sentry DSN setup** | S | Todo | Create sentry.io project, copy DSN to env. SDK already installed |
| A4 | **Vercel env vars sync** | M | Todo | Push all .env.local vars to Vercel production environment |
| A5 | **Test email delivery end-to-end** | S | Todo | Send test welcome email via /api/email/send. Resend domain is verified ✅ |
| A6 | **Run ops:check on production** | S | Todo | After A4. Hit /api/health on modulca.eu and verify all green |

### Chat B — Frontend QA

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| B1 | **Mobile QA: all 14 steps** | L | Todo | Test each step on 375px viewport. Fix layout breaks |
| B2 | **Fix any broken step transitions** | M | Todo | Navigate 1→14 on desktop + mobile, note any dead ends |
| B3 | **Loading states for slow operations** | M | Todo | AI render, cloud save, PDF generate — show spinners |

---

## P1 — SHOULD HAVE (High Impact, Do Before May 1 if Time)

### Chat A — Infrastructure

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| A7 | **Uptime monitoring** | S | Todo | BetterUptime or UptimeRobot free tier. Monitor /api/health |
| A8 | **Scheduled daily ops check** | S | Todo | Claude Code /schedule — retry when connection works |
| A9 | **Rate limiting on API routes** | M | Todo | Add rate limits to /api/ai-render, /api/consultant, /api/email |
| A10 | **Error notification channel** | S | Todo | Sentry → email alerts on new errors |

### Chat B — Frontend QA

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| B4 | **Accessibility pass — critical** | L | Todo | Add aria labels to buttons, form inputs, modals. Skip-to-content link |
| B5 | **Keyboard navigation for StepNav** | M | Todo | Arrow keys to navigate between steps |
| B6 | **Image alt text audit** | M | Todo | All <Image> components need descriptive alt text |
| B7 | **Focus management on modals** | M | Todo | Trap focus in upgrade modal, contact form, confirm dialogs |

### Chat C — Content & SEO

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| C1 | **Romanian translations — UI strings** | XL | Todo | Extract all hardcoded strings. Create en.json + ro.json |
| C2 | **next-intl or similar i18n setup** | L | Todo | Depends on C1. Route prefix /ro/ or auto-detect |
| C3 | **Dynamic OG images per page** | M | Todo | /api/og route with @vercel/og. Cover: homepage, pricing, steps |
| C4 | **Knowledge base: Romanian regulations** | L | Todo | Building permits, land categories, RO-specific content |
| C5 | **Blog: 5 more SEO articles** | M | Todo | Target keywords: "case modulare", "constructii modulare romania" |

### Chat D — AI & 3D

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| D1 | **Audit AI engine health** | M | Todo | Test all 15 configured engines. Remove broken ones, fix timeouts |
| D2 | **Render caching** | M | Todo | Cache identical prompts to avoid re-rendering. renderCache.ts exists |
| D3 | **Render queue with retry** | M | Todo | If engine fails, auto-retry with next engine in chain |

### Chat E — Testing

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| E1 | **E2E test: full 14-step flow** | L | Todo | Playwright or Cypress. Navigate all steps, verify no crashes |
| E2 | **Auth flow tests** | M | Todo | Signup → login → save project → load project → sign out |
| E3 | **Stripe checkout flow test** | M | Todo | Mock checkout → webhook → tier update |
| E4 | **Add tests for CloudSyncProvider** | M | Todo | Hydration, migration, debounced save |

### Chat F — Architect Tools

| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| F1 | **Architect Step 14 UX polish** | L | Todo | OverviewDashboard cards, phase pipeline visual |
| F2 | **Client-facing proposal PDF** | M | Todo | Generate proposal from ClientBrief data using @react-pdf |
| F3 | **DfMA checklist validation** | M | Todo | Block phase completion if critical DfMA items unchecked |

---

## P2 — NICE TO HAVE (Post Beta Launch Week)

### Chat A — Infrastructure
| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| A11 | **Vercel Analytics integration** | S | Todo | Package installed, needs activation |
| A12 | **Microsoft Clarity heatmaps** | S | Todo | NEXT_PUBLIC_CLARITY_PROJECT_ID already in env |
| A13 | **Stripe customer portal** | M | Todo | /api/stripe/portal route exists, needs testing |
| A14 | **Auto-backup projects to Supabase Storage** | M | Todo | JSON export of project data as backup |
| A15 | **Webhook retry monitoring** | S | Todo | Check Stripe dashboard for failed webhooks |

### Chat B — Frontend QA
| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| B8 | **Lighthouse score > 80** | L | Todo | Bundle splitting, lazy load, image optimization |
| B9 | **Skeleton loading screens** | M | Todo | Replace spinners with content-shaped skeletons |
| B10 | **Dark mode support** | L | Todo | Tailwind dark: classes throughout |
| B11 | **Print-friendly pages** | S | Todo | @media print styles for technical drawings + presentation |

### Chat C — Content & SEO
| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| C6 | **Homepage video demo** | M | Todo | Screen recording of full 14-step flow |
| C7 | **Testimonials section** | S | Todo | Placeholder quotes, replace with real ones after beta |
| C8 | **FAQ page** | S | Todo | Common questions about modular construction |
| C9 | **Press kit / About page** | S | Todo | Company info, founder bio, mission statement |

### Chat D — AI & 3D
| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| D4 | **Gaussian Splatting prototype** | XL | Todo | Premium walkthrough with photorealistic 3D |
| D5 | **AI room layout suggestions** | L | Todo | GPT-4 analyzes floor plan, suggests furniture |
| D6 | **Voice-guided walkthrough** | L | Todo | TTS narration during 3D walkthrough |
| D7 | **Render comparison view** | M | Todo | Side-by-side engine comparison UI |

### Chat F — Architect Tools
| # | Task | Effort | Status | Notes |
|---|------|--------|--------|-------|
| F4 | **Project sharing (public link)** | L | Todo | Read-only URL for client review |
| F5 | **Multi-user collaboration** | XL | Todo | Real-time editing with presence indicators |
| F6 | **Builder dashboard** | XL | Todo | Builders see and quote on client projects |

---

## P3 — FUTURE ROADMAP (Month 2+)

| # | Task | Chat | Notes |
|---|------|------|-------|
| G1 | Romanian market launch (RO domain, RO content) | C | After i18n |
| G2 | Netherlands market (NL regulations, NL content) | C | Second market |
| G3 | Land marketplace (buy/sell terrain) | New | Major feature |
| G4 | Mobile app (React Native) | New | After web is stable |
| G5 | AR mode (view modules on real terrain) | D | WebXR |
| G6 | White-label platform for builders | New | Enterprise feature |
| G7 | Real product affiliate partnerships | New | Revenue stream |
| G8 | Builder verification system | F | Trust layer |
| G9 | Construction timeline tracking | F | Post-handoff |
| G10 | Data analytics dashboard | A | Market insights |

---

## DEPENDENCY GRAPH

```
A1 (Stripe live) ─────→ A2 (webhook verify) ─→ A6 (prod check)
                                                      ↑
A3 (Sentry) ──→ A10 (error alerts) ──────────────────┘
                                                      ↑
A4 (Vercel env) ──────────────────────────────────────┘
                                                      
A5 (test email) ── standalone

B1 (mobile QA) ── standalone, highest B priority
B4 (a11y) ── standalone, do after B1

C1 (i18n strings) ──→ C2 (i18n setup) ──→ G1 (RO launch)
C3 (OG images) ── standalone
C4 (RO regs) ── can parallel with C1

D1 (engine audit) ── standalone
E1 (E2E test) ── depends on B1 completion
```

---

## SUMMARY

| Priority | Count | Effort | Status |
|----------|-------|--------|--------|
| **P0 — Beta Blockers** | 9 | ~8h | Most are S/M, quick wins |
| **P1 — Should Have** | 18 | ~48h | Mix of M/L tasks |
| **P2 — Nice to Have** | 15 | ~40h | Post-launch week |
| **P3 — Future** | 10 | ~200h+ | Month 2+ roadmap |
| **TOTAL** | 52 tasks | | |

### Critical Path to May 1:
```
Today (Apr 16) → A3+A5 (quick wins) → B1 (mobile QA) → 
Tomorrow → A1 (Stripe bank) → A2+A4 (deploy) → A6 (verify) →
Week of Apr 21 → B2+B3 (polish) → E1 (E2E test) →
Apr 28-30 → Final QA → BETA LAUNCH May 1
```
