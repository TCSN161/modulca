# ModulCA Project Dashboard
### Last updated: April 11, 2026 | Beta Launch: May 1, 2026 | Days Left: 20

---

## OVERALL PROGRESS

```
PLATFORM COMPLETION
====================================================================================
Frontend Steps    [========================================] 100%  13/13 pages built
Mobile Responsive [========================================] 100%  All pages done
3D Engine         [====================================    ]  90%  Furniture fix done
AI Rendering      [==============================          ]  75%  Free engines work
Auth & Users      [============                            ]  30%  Client-side only
Cloud Persistence [========                                ]  20%  localStorage only
Payments          [====                                    ]  10%  Skeleton only
Email Service     [                                        ]   0%  Not started
Testing           [                                        ]   0%  Not started
Analytics         [                                        ]   0%  Not started
====================================================================================
WEIGHTED TOTAL    [==========================              ]  65%  MVP Demo Ready
```

---

## 13-STEP COMPLETION DETAIL

```
Step  Name           UI    Logic  3D    AI    Mobile  Data    TOTAL
----- -------------- ----- ------ ----- ----- ------- ------  -----
 1    Choose         100%  70%    -     -     100%    40%     78%
 2    Land           100%  90%    -     -     100%    60%     88%
 3    Design         100%  85%    -     -     100%    60%     86%
 4    Preview        100%  80%    100%  -     100%    60%     88%
 5    Style          100%  85%    -     -     100%    60%     86%
 6    Configure      100%  90%    -     -     100%    60%     88%
 7    Visualize      100%  90%    100%  -     100%    60%     90%  <-- furniture FIXED
 8    Render         100%  85%    80%   75%   100%    60%     83%
 9    Technical      100%  50%    -     -     100%    40%     65%  <-- SVGs placeholder
10    Walkthrough    100%  80%    90%   -     100%    60%     86%
11    Products       100%  70%    -     -     100%    30%     72%  <-- no real images
12    Finalize       100%  80%    -     -     100%    30%     76%  <-- no cloud save
13    Presentation   100%  85%    -     -     100%    50%     84%
                                                              ----
                                                    AVERAGE:  82%
```

---

## INFRASTRUCTURE PROGRESS

```
Component             Status          What Works                    What's Missing
--------------------- --------------- ----------------------------- --------------------------
Supabase Auth         [====----]  50% Client auth, Google OAuth     NextAuth, email verify
Database              [===-----]  35% Tables + RLS, demo mode       Cloud save, migrations
AI Render API         [======--]  75% 5 engines, fallback chain     Leonardo key, premium
Neufert AI (RAG)      [======--]  75% 82 KB articles, 3 LLMs       Step guidance, RO regs
Knowledge Base        [=======.]  85% 82 articles, auto-index       More RO content
Stripe Payments       [=-------]  10% Skeleton, price IDs           Webhooks, portal
Email Service         [--------]   0% -                             Everything
Landing Page          [=======.]  85% Hero, pricing, features       Mobile polish
SEO                   [====----]  50% robots.txt, sitemap           Meta tags, OG images
Error Monitoring      [--------]   0% -                             Sentry setup
Analytics             [--------]   0% -                             Plausible/Vercel
CI/CD                 [======--]  75% GitHub Actions, Vercel        Tests in pipeline
```

---

## TOKEN & CONTEXT BUDGET PER CHAT

```
Chat                    Scope                   Est. Tokens    Context Risk    Memory
----------------------- ----------------------- -------------- -------------- --------
THIS CHAT (Frontend)    UI polish, UX, mobile   ~150K used     MEDIUM         Shared
Chat 2 (Backend)        Auth, DB, cloud save    ~80K est.      LOW            Shared
Chat 3 (Neufert AI)     KB, RAG, step guide     ~60K est.      LOW            Shared
Chat 4 (AI Rendering)   Engine eval, premium    ~40K est.      LOW            Shared
Chat 5 (Launch)         Stripe, email, monitor  ~60K est.      LOW            Shared
                                                ----------
                                        TOTAL:  ~390K tokens
```

### Context Window Strategy:
```
THIS CHAT remaining capacity:  [===========.........] ~55%
Action: Good for ~3-4 more major tasks before needing new chat
Split trigger: When this chat hits ~80% context, spawn "Frontend Chat 2"
```

---

## SPRINT PLAN — 20 Days to Beta

```
====== WEEK 1: Apr 11-18 (THIS CHAT) ======================================

Day 1-2  [##########] P0: Fix Preview routing + Render env vars on Vercel
Day 3-4  [##########] P1: Technical drawings (real SVG floor plans)
Day 5-6  [##########] P1: Landing page mobile + Neufert step guidance
Day 7    [##########] P2: Products page images + Walkthrough furniture

====== WEEK 2: Apr 19-25 (CHAT 2 — Backend) ===============================

Day 8-9  [..........] Full Supabase auth flow (email verify, password reset)
Day 10-11[..........] Cloud project save/load (replace localStorage)
Day 12-13[..........] User dashboard + protected routes
Day 14   [..........] Google OAuth publish + testing

====== WEEK 3: Apr 26-30 (CHAT 5 — Launch) ================================

Day 15-16[..........] Stripe webhooks + customer portal
Day 17   [..........] Email service (Resend) — registration, quotes
Day 18   [..........] Analytics (Plausible) + Sentry error tracking
Day 19   [..........] Final QA sweep — all 13 steps, mobile, desktop
Day 20   [..........] BETA LAUNCH May 1

======= LEGEND =============================================================
[##########] = In progress / this week
[..........] = Scheduled / future
```

---

## KPIs TO TRACK

```
KPI                          Current     Beta Target    Status
---------------------------- ----------- -------------- --------
Pages functional             13/13       13/13          DONE
Mobile responsive            13/13       13/13          DONE
Lighthouse mobile score      ~65         >80            NEEDS WORK
AI renders working           3/5 engines 4/5 engines    IN PROGRESS
Auth providers               1 (Google)  2 (+email)     PLANNED
Projects saveable to cloud   0           unlimited      PLANNED
Payment flow complete        No          Yes            PLANNED
Avg page load (3G)           ~4s         <3s            NEEDS WORK
Knowledge articles           82          100+           IN PROGRESS
Supported countries          2 (RO, NL)  3 (+generic)   IN PROGRESS
Test coverage                0%          >40%           PLANNED
Uptime monitoring            No          Yes            PLANNED
```

---

## CHAT ALLOCATION MAP

```
                    THIS CHAT (Frontend/UX)
                    ========================
                    Owns: All 13 step pages, components,
                    mobile layout, StepNav, 3D scenes,
                    landing page, CSS/Tailwind
                    
                         |
          +--------------+--------------+
          |              |              |
    Chat 2 (Backend)  Chat 3 (AI)   Chat 4 (Render)
    ================  ============  ===============
    Owns: Auth,       Owns: KB,     Owns: Engine
    Supabase, API     RAG, Neufert  eval, premium
    routes, cloud     AI, step      renders, img2img
    persistence,      guidance,     pipeline, API
    user dashboard    RO regs       key setup
          |
          |
    Chat 5 (Launch) — spawns Week 3
    ================================
    Owns: Stripe webhooks, email
    service, analytics, monitoring,
    final QA, go-live checklist
```

---

## RISK REGISTER

```
Risk                              Impact   Likelihood   Mitigation
--------------------------------- -------- ------------ ----------------------------------
Context overflow in this chat     MEDIUM   HIGH         Split at ~80%, spawn Frontend Chat 2
AI render engines rate-limited    HIGH     MEDIUM       5-engine fallback chain, caching
Supabase free tier limits         MEDIUM   LOW          <500 users in beta, upgrade if needed
Stripe review delays              HIGH     MEDIUM       Submit early (Week 2), test mode
Google OAuth verification         MEDIUM   HIGH         Already submitted, follow up
No test suite                     MEDIUM   HIGH         Add critical path tests in Week 3
Leonardo API key missing          LOW      HIGH         4 other engines work, not blocking
```

---

## RESOLVED ISSUES LOG

```
Date        Issue                                    Resolution
----------- ---------------------------------------- ----------------------------------
2026-04-11  Furniture clustering in All Modules       GlbFurniture computed bbox AFTER
            view — all items in top-left corner       scene attachment; world-space offsets
                                                      polluted centering. Fixed: compute
                                                      bbox BEFORE adding to scene graph.

2026-04-10  Mobile CSS not activating — all pages     Missing viewport meta tag in
            rendered as desktop                       layout.tsx. Added export const
                                                      viewport: Viewport.

2026-04-10  Sidebars overlapping content on mobile    Added hidden md:block to all aside
            (Steps 4,5,7,11,13)                       elements across all pages.

2026-04-10  Land page crash on mobile                 Suspense boundary for useSearchParams
                                                      + single-layout responsive approach.

2026-04-10  Z-index: buttons hidden behind Leaflet    Inline style={{ zIndex: 1100+ }} to
                                                      override Leaflet's ~1000 z-index.
```
