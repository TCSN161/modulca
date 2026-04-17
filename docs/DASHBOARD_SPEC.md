# Master Dashboard Specification — `admin.archicore.eu`

> **Last updated**: 2026-04-17
> **Status**: Specification (pre-implementation)
> **Owner**: Costin + AI Agents
> **Target build start**: Faza 1 (iunie 2026, post-beta launch)

---

## 1. Scopul dashboard-ului

Un **singur loc de control** pentru tot ecosistemul. La orice moment (desktop, mobile, 2AM), să poți vedea:

- 🟢 Ce merge bine
- 🟡 Ce necesită atenție  
- 🟠 Ce e degradat
- 🔴 Ce e spart
- 🔵 Info / noutăți
- ⚪ Nu e măsurat încă

Fără să intri în 5 dashboard-uri diferite (Vercel, Supabase, Stripe, Sentry, Google Analytics...). Agregat. În română.

## 2. Referințe profesionale studiate

| Platformă | Ce luăm | Ce respingem |
|---|---|---|
| **Atlassian Statuspage** | Traffic light system, incident timeline | Prea public-facing; nu acoperă business metrics |
| **Datadog** | Service mesh map, drill-down | Prea complex pentru solo founder |
| **Grafana** | Custom panels, threshold alerts | Steep learning curve |
| **Linear** | Keyboard-first UX, clean hierarchy | Doar project mgmt |
| **Plausible Analytics** | Simple, privacy-friendly, fast | Doar web analytics |
| **Stripe Dashboard** | Financial KPIs clean | Doar payments |
| **Sentry** | Error + release tracking | Doar errors |
| **Vercel Dashboard** | Deploy status + logs | Doar infra |
| **Linear Roadmap** | Phase/milestone tracker | Project mgmt only |

**Sinteză**: luăm pattern-uri validate (traffic lights, drill-down, keyboard-first), dar facem UI **customizat pe nevoi ModulCA** — nu reimplementăm Datadog.

## 3. Arhitectura

```
apps/admin/                              # Next.js app în monorepo
├── app/
│   ├── (auth)/                          # Login with admin role
│   ├── (dashboard)/
│   │   ├── page.tsx                     # OVERVIEW — al global
│   │   ├── infrastructure/              # Servers, deploys, errors
│   │   ├── financials/                  # Revenue, costs, runway
│   │   ├── users/                       # Analytics, cohorts, churn
│   │   ├── products/                    # Per-brand live health
│   │   │   ├── modulca/
│   │   │   ├── bunkere/
│   │   │   ├── treehouse/
│   │   │   └── ...
│   │   ├── opportunities/               # Grants, partnerships, CSR pipeline
│   │   ├── strategy/                    # OKRs, roadmap, decisions
│   │   ├── crisis/                      # Crisis incident room (your expertise)
│   │   ├── audit/                       # Audit history + reports
│   │   └── content/                     # KB editor (@archi/kb)
│   └── api/                             # Backend aggregation
│       ├── metrics/                     # Pulls Vercel/Supabase/Stripe/Sentry
│       ├── audit/                       # Scheduled audit results
│       └── ...
└── components/                          # Shared UI (uses @archi/ui)
```

Tehnologii:
- **Next.js** (consistent cu ecosystem)
- **Recharts / Tremor** pentru vizualizări
- **tRPC sau plain REST** pentru agregare
- **Auth**: `@archi/saas` cu admin role
- **Deploy**: Vercel, IP allowlist + 2FA obligatoriu

## 4. Schema culorilor + semnificație

Traffic lights extinse (standard industrie + customizare):

| Icon | Culoare | Semnificație | Exemple |
|---|---|---|---|
| 🟢 | Green | OK, funcționează normal | Uptime 99.9%, build passing, no critical errors |
| 🟡 | Yellow | Atenție — nu e urgent | Test mode Stripe, Sentry DSN pending, P2 issues pending |
| 🟠 | Orange | Degradat — action needed | Error rate >1%, latency >2s, 1 P1 open >3 days |
| 🔴 | Red | Critical — immediate action | Site down, payment failing, P0 open, breach |
| 🔵 | Blue | Info — milestone sau noutate | New feature released, grant approved, press mention |
| ⚪ | White/Gray | Nu e măsurat / N/A | Future phase, not applicable |

**Consistență**: aceste 6 coduri se folosesc în TOATE modulele + raporturile audit.

## 5. Paginile dashboard-ului (modulare)

### 5.1. Overview (landing)

Single-screen mobile-friendly. 6 tile-uri mari, fiecare ← status indicator + 1 KPI + link.

```
┌─────────────────────────────────────────────┐
│ 🟢 Infrastructure   │ 🟢 Products          │
│ Uptime: 99.97%      │ 5/5 brands healthy    │
├─────────────────────┼───────────────────────┤
│ 🟡 Financials       │ 🟢 Users              │
│ TEST mode Stripe    │ 347 active, +12/day   │
├─────────────────────┼───────────────────────┤
│ 🔵 Opportunities    │ 🟢 Strategy           │
│ 3 grant calls open  │ Faza 0: 82% complete  │
└─────────────────────────────────────────────┘
```

Click pe orice tile → drill-down la pagina dedicată.

### 5.2. Infrastructure

- Uptime per brand (last 24h, 7d, 30d)
- Sentry errors (by severity + trend)
- Vercel deploy status (last deploys + failures)
- Supabase query performance + connection count
- AI render engines status (which free, which down)
- **Live ModulCA site map** ← cel cerut de user: harta interactivă cu nodes = pagini, colored by health

### 5.3. Financials

- MRR (monthly recurring revenue) per brand + total
- Users paying per tier
- Stripe: active subscriptions, failed payments, churn rate
- Costs: Vercel, Supabase, AI provider bills, domains, email (Resend)
- Runway calculator (cash on hand / monthly burn)
- Gross margin per product
- UII side: grant applications status, CSR sponsorships received

### 5.4. Users

- Total users + growth curve
- Per brand: signups, activations, conversions
- Per tier: guest/free/premium/architect/constructor counts
- Cohort analysis (retention week-over-week)
- Top user journeys (where drop off?)
- Churn reasons (if exit survey)
- **Live activity feed**: real-time user events

### 5.5. Products (per-brand health)

Pentru fiecare brand (modulca, bunkere, treehouse, neufertai, renderlab, crisisready), un tab:

- **Status summary** (traffic lights per component)
- **Features completion** % cu progress bars
- **Known issues** linked la tickets/Sentry
- **14-step health** (ModulCA specific): fiecare pas are status + completeness
- **Performance metrics** (LCP, TBT, bundle size)

### 5.6. Opportunities

Pipeline management — unde e vastly useful:

- **Grants**: status (research/drafting/submitted/awarded/rejected), deadline countdown, value, next action
- **Partnerships**: CSR sponsors, academic collaborations, material suppliers
- **Press/PR**: articles, mentions, upcoming interviews
- **Press mentions live feed** (Google Alerts API)
- **Competitors watching**: new launches, pricing changes

### 5.7. Strategy

- **OKRs per quarter** (editable)
- **Roadmap Gantt** per fază (Faza 0, 1, 2, 3, 4)
- **Decision Log** (synced din docs/ECOSYSTEM_ARCHITECTURE.md)
- **Risk Register** (live, prioritized)
- **SWOT analysis live** (editable matrix)
- **Progress vs plan** per brand + global

### 5.8. Crisis (expertiza ta)

Camera de incident management:

- **Incident-ready button**: declare incident → creates room, invites stakeholders, opens timeline
- **Active incidents** list (cu timeline, actions, communications)
- **Runbook library**: proceduri pentru categorii de criză (site down, data breach, DDoS, stock market crash, natural disaster...)
- **Post-mortem template + archive**
- **Proactive scan**: risks identified în audits care n-au fost rezolvate
- **External signals**: feed cu știri geopolitice/economice/sanitare care afectează business

### 5.9. Audit History

- **Last audit date per category**
- **Trend per score** (did we improve since last audit?)
- **Unresolved findings** grouped by severity
- **Next scheduled audits** countdown
- **Compare snapshots** (Q1 vs Q2)

### 5.10. Content (@archi/kb editor)

- WYSIWYG editor pentru toate articolele
- Version control (who edited what, when)
- Tag/categorize/translate
- Preview rendered output
- Multi-language

## 6. Live ModulCA site map (feature cerut de user)

Vizualizare: **harta interactivă a site-ului** unde fiecare pagină e un nod colorat.

```
         [/]
          │
     ┌────┼────┐
     │    │    │
  [about][pricing][dashboard]
                    │
        ┌───────────┼───────────┐
    [/project/*][library][portfolio]
        │            │
    [14 steps grid colored by health]
    [choose][land][design][preview]...
```

Fiecare nod:
- Culoarea = status health (verde/galben/portocaliu/roșu)
- Size = traffic volume (more users = bigger node)
- Click = drill-down cu: last errors, avg latency, conversion rate, LCP

Status calculat din:
- Sentry error rate ultimele 15 min
- Vercel latency p95 ultimele 15 min
- Custom health checks (dacă există)

Refresh auto la 30s (opțional pauză).

## 7. Notificări + alerting

### Canale
- **Dashboard badge** (real-time când ești logat)
- **Email** (zilnic summary + instant pentru critic)
- **SMS / Push** (numai critic, opțional)
- **Slack / Discord webhook** (customizable)

### Praguri default

| Eveniment | Severitate | Canal |
|---|---|---|
| Site down >1 min | 🔴 Critic | SMS + Email + Dashboard |
| Error rate >5% for 5 min | 🟠 Urgent | Email + Dashboard |
| Failed payment | 🟡 Atenție | Email + Dashboard |
| New user milestone (every 100) | 🔵 Info | Email summary |
| Grant approved | 🔵 Celebration | Email + SMS |
| Weekly audit complete | 🔵 Info | Email |

## 8. Permisiuni + roluri

| Rol | Acces |
|---|---|
| **Super-admin** (Costin) | Tot, inclusiv billing, legal, DPO tasks |
| **Admin MCA** (Muraru Petria) | Operational + financial MCA, nu UII sensitive |
| **Admin UII** (cofondator UII) | UII-specific, grants, research, nu financial MCA |
| **Viewer** (investori, viitor) | Read-only metrics, no drill-down la detail |
| **AI Agent** (eu) | Read + write pe conținut, read-only pe user data |

## 9. Integrări externe (API fetches)

Dashboard-ul agregă:

| Sursă | Ce luăm | Frecvență refresh |
|---|---|---|
| **Vercel API** | Deploy status, analytics, speed insights | 1 min |
| **Supabase API** | DB metrics, query count, user count | 1 min |
| **Stripe API** | Subscriptions, revenue, failed charges | 5 min |
| **Sentry API** | Errors, releases, performance | 1 min |
| **Resend API** | Email sends, bounces | 15 min |
| **Google Analytics API** | Traffic, conversions | 15 min |
| **Plausible API** | Privacy-friendly analytics | 5 min |
| **Microsoft Clarity** | Session replays, heatmaps | 1 h |
| **Google Search Console** | SEO rankings, impressions | 1 h |
| **GitHub API** | Commits, PRs, issues | 5 min |
| **Our own API** | Custom metrics (users active, projects saved, etc) | 1 min |

Totul cached la edge (Vercel Edge Config sau Supabase Edge Functions) pentru performance + cost control.

## 10. MVP vs. Full build

### v0 — MVP (2-3 săptămâni build, Faza 1 iulie 2026)
- Overview page cu 6 tiles
- Infrastructure (uptime + errors)
- Financials (Stripe + costs)
- Users (basic metrics)
- Live ModulCA site map (simple version, 14 nodes)
- Content editor (@archi/kb basic)
- Email alerts pentru critic

### v1 — Consolidare (Faza 2, oct 2026)
- Toate paginile de secțiune 5
- Full alerting cu customizare
- Compare periods
- Export reports

### v2 — Automation (Faza 3, 2027)
- AI insights ("userii abandonează pasul 7 — investighează?")
- Auto-routing tasks
- Predictive metrics (forecast churn, revenue)
- Voice / chatbot interface

## 11. Build effort + costs

- **v0**: ~80-120h dezvoltare (3 săptămâni solo founder + AI agents)
- **v1**: +60-80h
- **v2**: +120h
- **Infra costs**: ~€15-30/lună (Vercel + Supabase extra + edge)
- **External API costs**: mostly free tiers pentru MVP; ~€20/lună la scale

## 12. Anti-patterns (ce NU facem)

- ❌ Nu reimplementăm Datadog (scope creep)
- ❌ Nu expunem dashboard-ul public (security risk)
- ❌ Nu facem real-time ultra-low-latency (nu e trading platform, 30s refresh OK)
- ❌ Nu agregăm tot ce există — doar ce e actionable
- ❌ Nu trimitem alertă pentru orice warning — doar ce chiar cere atenție

## 13. Review + iteration

- **Build începe**: iunie 2026 (post-beta launch)
- **v0 review**: la 1 lună după launch v0
- **Spec review**: trimestrial (ce adăugăm/scoatem din dashboard)
- **User feedback**: la fiecare release, feedback form simplu
