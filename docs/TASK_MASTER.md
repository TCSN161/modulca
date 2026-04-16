# ModulCA — Task Master List
### Updated: April 16, 2026 | Beta: May 1, 2026 | Days Left: 15

---

## HOW TO USE THIS LIST

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
