# Continuous Audit System

> **Last updated**: 2026-04-17
> **Status**: Specification + partial implementation
> **Purpose**: Audits recurente pe 3 cadențe (daily/weekly/monthly) cu rapoarte actionable

---

## 1. Filozofia

**De ce audituri continue?**

Un audit manual (cum facem azi) = snapshot valid 2-4 săptămâni. După aceea, codul/configurările se schimbă, iar noi nu știm. Audituri continue = **visibility constantă**, nu punctuală.

**Principii:**
1. **Automatizat unde posibil** — omul confirmă, AI/scripts rulează
2. **Gradated** — daily mic (10 checks), weekly mediu (50 checks), monthly mare (200+ checks + SWOT)
3. **Actionable** — fiecare finding are severity + owner + deadline
4. **Versioned** — rapoartele sunt committed în git pentru trend analysis
5. **Non-distruptiv** — audits NU modifică codul/infrastructura

## 2. Cele 3 cadențe

### 2.1. DAILY — "Nightly Scan" 🌙

**Când**: noaptea 03:00 EET (trafic minim, rezultate gata până la dimineață)
**Durată**: 5-15 minute
**Cost**: zero (free tier APIs + GitHub Actions)
**Trigger**: cron GitHub Action `.github/workflows/audit-daily.yml`

**Ce verifică** (automat):

| # | Check | Criterii | Status |
|---|---|---|---|
| 1 | Site uptime | HTTP 200 pentru modulca.eu, /api/health | 🟢 if ok |
| 2 | TypeScript | 0 errors | 🟢 if 0 |
| 3 | Tests | 100% pass | 🟢 if all pass |
| 4 | Bundle size | No regression vs. last | 🟢 if ≤5% increase |
| 5 | Sentry error rate | Last 24h, per severity | 🟢 if P0=0, P1<5 |
| 6 | Stripe webhook deliveries | No failures in last 24h | 🟢 if 0 failed |
| 7 | Supabase latency | p95 query time | 🟢 if <500ms |
| 8 | Env drift | `.env.local` vs Vercel prod | 🟢 if in sync |
| 9 | Sensitive files | No secrets committed | 🟢 if clean |
| 10 | Dependencies audit | `npm audit` | 🟢 if no HIGH/CRITICAL |

**Output**:
- `docs/audits/daily/YYYY-MM-DD.json` (machine-readable)
- Alert pe email **doar dacă** 🟠 or 🔴
- Summary arătat pe dashboard next-day

**Rulează deja** (implementat): `npm run ops:check` covers items 1-9.

### 2.2. WEEKLY — "Friday Report" 📅

**Când**: vineri 18:00 EET (înainte de weekend, ai timp să reflectezi)
**Durată**: 30-60 minute (review manual după scan automat)
**Cost**: low (some API calls, 1h your time)
**Trigger**: cron GitHub Action + manual review

**Ce acoperă** (în plus față de daily):

| Secțiune | Automation | Review Human |
|---|---|---|
| **Technical** | Automated scan + diff vs prev week | Review top 5 findings |
| **Financial** | Stripe report + cost report | Confirm runway calculation |
| **Users** | Growth, churn, cohorts | Spot concerning trends |
| **Content** | Blog articles published, KB articles added | Plan next week's content |
| **Pipeline** | Grant deadlines, sponsor meetings | Update status pe opportunities |
| **Roadmap** | Tasks completed vs planned | Adjust if off-track |

**Output**:
- `docs/audits/weekly/YYYY-WW.md` — markdown report, committed în git
- Email summary în dimineața de sâmbătă
- 1 oră review slot în calendarul tău

**Sections standard** (modular — adaugi/scoți):

```markdown
# Weekly Audit: 2026-W42

## Executive Summary (3 bullets)
## Metrics Snapshot (traffic lights)
## Wins This Week 🟢
## Friction Points 🟡
## Blockers 🔴
## Pipeline Updates
## Content Published
## Next Week Priorities
```

### 2.3. MONTHLY — "Deep Audit" 🔬

**Când**: prima zi lucrătoare a fiecărei luni
**Durată**: 4-8 ore (combinație automation + manual)
**Cost**: medium (scripts + time)
**Trigger**: cron + manual deep dive

**Structura** (modulară, 10+ secțiuni extensibile):

| Secțiune | Conținut | Automation |
|---|---|---|
| 1. **Executive Summary** | 3-5 bullets, trend vs. last month | Semi-auto |
| 2. **SWOT Analysis** | Matrix complet, updated | Manual cu AI suggest |
| 3. **Technical Health** | Security scan, perf, tests, deps | Auto |
| 4. **Product Completeness** | Per-brand feature maturity | Semi-auto |
| 5. **Financial Health** | P&L, MRR, runway, unit economics | Auto |
| 6. **User Metrics** | Cohorts, retention, LTV/CAC | Auto |
| 7. **Legal & Compliance** | GDPR status, contracts, DPAs | Manual |
| 8. **SEO & Marketing** | Rankings, traffic, conversions | Auto |
| 9. **Brand & Ecosystem** | Domains status, brand mentions | Auto |
| 10. **Opportunities Pipeline** | Grants, partnerships, press | Manual |
| 11. **Risk Register Review** | New risks, mitigation progress | Manual |
| 12. **Roadmap Progress** | % complete per phase | Semi-auto |
| 13. **Decision Log** | New decisions, reversals | Manual |
| 14. **Action Items** | Prioritized, with owners + deadlines | Manual |
| 15. **Trend Analysis** | Compare vs. previous 3 months | Auto |

**Output**:
- `docs/audits/monthly/YYYY-MM.md` — full structured report
- Email: 1-page executive summary + link to full
- Dashboard: toate metrici updated

### 2.4. QUARTERLY — "Strategic Review" 🎯 (bonus)

**Când**: ultima săptămână a trimestrului
**Durată**: 1-2 zile (deep strategy session)
**Trigger**: manual

**Conținut** (adaugă la monthly):
- OKR review + next quarter OKR setting
- Investor / advisor briefing (dacă ai)
- Major architectural decisions review
- Competitive analysis refresh
- Market positioning update

## 3. Implementarea pas cu pas

### Faza 0 (acum - beta launch)
- ✅ `npm run ops:check` ca daily baseline (manual până se automatizează)
- ✅ Acest prim audit comprehensive (ca "luna 1 deep audit")
- ⏳ Setup GitHub Action pentru daily scan

### Faza 1 (post-launch, iunie-iulie 2026)
- Automatizează daily audit 100% (GitHub Actions)
- Template weekly audit committat în repo
- Primul weekly audit real la 1 săpt. după launch
- Dashboard v0 livreaza live metrics → deja ai visibility zilnică

### Faza 2 (aug-oct 2026)
- Scripts pentru monthly audit categories (sprints dedicate)
- Dashboard v1 automatizează 70% din weekly review
- Alerting matur (Sentry + email + SMS pentru critic)

### Faza 3 (2027+)
- AI agent citește toate sursele, produce raport
- Tu confirmi / respingi insights
- Quarterly strategic session cu AI + data

## 4. Scripts existente care fac parte din sistemul de audit

| Script | Cadență | Ce face |
|---|---|---|
| `npm run ops:check` | Daily | Runtime health (env, supabase, stripe, resend, build) |
| `npm run engines:audit` | Weekly | AI engines billing + usage |
| `npm run env:sync:dry` | Weekly | Env drift detection |
| `npm run domains:check` | Monthly | Domain availability + expiry |
| `npm run collision-check` | On demand | Parallel sessions check |
| `npm run predeploy` | Pre-deploy | Blocking deploy gate |
| `npm run typecheck` | Every commit | TS errors |
| `npm run test:run` | Every commit | Unit/integration tests |

**Lipsește** (de construit în timp):
- `npm run audit:security` — OWASP checks, secret scan, dependency audit
- `npm run audit:perf` — Lighthouse runs + bundle analyzer
- `npm run audit:seo` — Schema validation + sitemap check
- `npm run audit:gdpr` — PII scan în logs + DPA verification
- `npm run audit:financial` — Stripe + cost analysis

Fiecare din astea = ~4-8h de dezvoltare. Prioritate invers: security > gdpr > perf > seo > financial.

## 5. Format standard raport (modular)

Toate rapoartele audit folosesc același schelet (extensibil):

```markdown
# Audit Report: [Type] — [Date/Week/Month]

## Metadata
- Timestamp:
- Auditor: [human / AI agent / automation]
- Scope: [list of audited assets]
- Previous audit: [link]

## Executive Summary
- Overall status: 🟢 / 🟡 / 🟠 / 🔴
- Top 3 findings (one-line each)
- Recommended next actions (numbered)

## SWOT Analysis
(monthly/quarterly only)
| S | W |
|---|---|
| ... | ... |
| O | T |
| ... | ... |

## Sections (modular — add/remove per audit type)
### [Section Name] — [Status]
Progress: ▓▓▓▓▓▓▓▓░░ 80%
KPIs:
- Metric 1: X (prev: Y, trend: ↑/↓/→)
- Metric 2: ...
Findings:
- [P0/P1/P2/P3] Title
  - Description
  - Recommended fix
  - Owner / Deadline
Strengths:
- ...
Opportunities:
- ...

## Risk Register Delta
New risks:
Resolved risks:
Changed priority:

## Decision Log Delta
(new decisions din perioada auditată)

## Action Plan
| # | Action | Owner | Deadline | Priority |
|---|---|---|---|---|

## Appendix
Raw data, links, charts.
```

Asta devine template pentru:
- `docs/audits/templates/monthly.md`
- `docs/audits/templates/weekly.md`
- `docs/audits/templates/daily.md` (scurt)

## 6. Modularity — cum adăugăm categorii noi

Exemplu: user vrea să adăugăm "Accessibility (WCAG)" ca secțiune nouă.

**Pași**:
1. Adaugă o secțiune în `docs/CONTINUOUS_AUDIT.md` (acest doc)
2. Definește criteriile (ce se verifică, de cine, cum)
3. Dacă automatizat: creezi `scripts/audit-accessibility.mjs`
4. Update template raport cu noua secțiune
5. Primul audit viitor include automat

**Nu stricăm nimic** — pur additive. Rapoartele vechi rămân valide, cele noi au mai multe secțiuni.

## 7. Retention + versioning

- **Daily audits**: pastrate 90 zile, apoi archive
- **Weekly audits**: pastrate 1 an, apoi archive
- **Monthly audits**: pastrate PERMANENT (trend analysis matter)
- **Quarterly audits**: pastrate PERMANENT

Toate în git, committed ca markdown. Fișiere JSON pentru data crudă în `docs/audits/raw/`.

## 8. Alerting din audits

Audit → finding severe → alert automat.

**Severitate → Canal:**
- P0 (critical): SMS + email + dashboard alert
- P1 (high): email + dashboard alert
- P2 (medium): dashboard only, batch în weekly summary
- P3 (low): nu alert, doar în raport
- S (strength): batch în weekly summary 🎉

## 9. Cost estimat

| Cadență | Timp tău | Costuri tool | Total/lună |
|---|---|---|---|
| Daily | 0 min (auto) | €0 | €0 |
| Weekly | 1h × 4 | €0 | 4h |
| Monthly | 6h × 1 | ~€20 | 6h + €20 |
| Quarterly | 1 zi × 0.33 | €0 | 0.33 zi |

**Total**: ~10-12h/lună din timpul tău + ~€20/lună cost tool. Return: visibility 24/7 + prevention incidents + trend analysis + investor-ready reports.

## 10. Audit-ul pilot (acesta)

Acest prim audit (2026-04-17) servește ca:
1. **Baseline** — toate metricile actuale înregistrate
2. **Template** — structura pe care o urmăm la toate audituri viitoare
3. **Validation** — confirmă că spec-ul e practic
4. **First signal** — ce a ieșit la iveală, cât de mult trebuie să investim în sistemul continuu

Rezultate (vezi `docs/audits/2026-04-17.md`) devin input pentru Dashboard v0 (faza 1 build).
