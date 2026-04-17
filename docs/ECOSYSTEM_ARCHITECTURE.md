# Ecosystem Architecture — Master Document

> **Last updated**: 2026-04-17
> **Status**: Active pre-beta planning
> **Scope**: Strategic constitution of the entire brand ecosystem.
> **Read this first** — all other strategic docs subordinate to this one.

---

## 1. Executive Summary

We are building a **modular digital ecosystem** around built-environment expertise (arhitectură, urbanism, construcții modulare, management de criză, sustenabilitate). The ecosystem is composed of:

- **Multiple consumer-facing brands** (verticals), each solving a specific problem: `modulca.eu`, `bunkere.ro`, `case-in-copaci.ro`, `padureata.ro` + future
- **Shared technical backbone** (knowledge base, AI render aggregator, auth/billing, 3D utilities, crisis management package)
- **Two legal entities** operating in tandem:
  - **MCA SRL** (for-profit, products + services)
  - **UII ONG** (non-profit, research + grants + public interest)
- **Internal control tower** (`admin.archicore.eu` dashboard) for real-time management across all brands

**Core principles**: modular, non-destructive, antifragile, maximum reuse, win-win-win.

The flagship product (`modulca.eu`) launches public beta **May 1, 2026**. All other brands in this document are phased into production **after** beta stabilization, reusing the same technical core to minimize cost and maximize consistency.

---

## 2. Vision & Principles

### Mission
Democratizăm accesul la expertiză arhitecturală, urbanistică, de construcții și management de criză, prin tehnologie modulară, educație accesibilă, și produse care aduc valoare reală utilizatorilor finali, partenerilor și comunității.

### Principii de proiectare (non-negociabile)

| # | Principiu | Aplicare concretă |
|---|---|---|
| 1 | **Modular** | Fiecare capacitate = un pachet `@archi/*` independent. Poate fi extras, vândut, licențiat, sau închis fără a afecta restul. |
| 2 | **Non-destructiv** | Orice lansare nouă = adăugare, nu rescriere. Produsele existente rămân stabile. |
| 3 | **Antifragil** | Sistemul câștigă din stres (bugs capturate devin teste, user feedback devine features, grant rejections devin iterate applications). |
| 4 | **Maximum reuse** | Cod scris într-un loc, folosit în toate. Regula: `if tempted to copy-paste, extract package instead`. |
| 5 | **Win-win-win** | User câștigă (valoare reală), partener câștigă (expunere/revenue), lume câștigă (construcții sustenabile, cunoștințe democratizate). |
| 6 | **Incremental + sigur** | Pași mici și siguri, accelerezi doar când ai validat. |
| 7 | **Opțional coerent** | Brand-urile pot opera independent (SEO, conversion), pot opera unit (cross-sell, SSO viitor). Nu alegem una la sfârșitul celeilalte. |
| 8 | **Data-driven decisions** | Fiecare decizie majoră are argumentul pe data + risc + reward, nu pe opinie. |

### Ce NU facem
- Nu lansăm produse fără să avem capacity operational să le susținem
- Nu creăm entități legale înainte să avem revenue/mission care să justifice overhead-ul
- Nu cumpărăm domenii "ca să avem" — doar dacă au justificare clară
- Nu urmărim vanity metrics (vizitatori, urmăritori) — doar revenue, grant awards, real user outcomes

---

## 3. Legal & Organizational Structure

### Entități active

| Entitate | Tip | Rol | Actori cheie |
|---|---|---|---|
| **MCA SRL** | Societate comercială (for-profit) | Produse SaaS + servicii comerciale | Asociat unic: [Costin]. Administrator: **Muraru Petria** |
| **UII ONG** | Organizație non-guvernamentală | Cercetare, educație, interes public, grant-uri | Președinte + Cofondator: [Costin] |

### Implicații operationale

**Separarea semnăturilor** (avantaj):
- Contracte inter-entități (UII ↔ MCA): **Costin semnează pt UII, Muraru Petria semnează pt MCA**.
- Elimină percepția de self-dealing. Rămân cerințele de related party transactions la nivel ANAF, dar paperwork-ul e curat.

**Separation of concerns**:
- MCA preia toată activitatea comercială (venit direct, TVA, profit).
- UII preia activitățile eligibile pentru grant-uri, CSR, academic, guvernamental.

**Regula pentru orice tranzacție MCA ↔ UII**:
1. Contract scris cu justificare (de ce această alegere vs. terți).
2. Preț de piață documentat (min 1-2 oferte comparative).
3. Factură normală, plată prin bancă, raportare în declarația fiscală ca "tranzacție cu parte afiliată".
4. Template-ul se scrie o dată, se reutilizează.

### Entități potențiale (nu activate acum)

| Entitate | Când s-ar crea | Rationale |
|---|---|---|
| **UIL SRL** (Urban Innovation Labs/Studio) | Doar când venit servicii comerciale ≥ €30K/an | Overhead admin €1200-3200/an nu se justifică mai devreme. Până atunci, brand "Urban Innovation Labs" operează ca **DBA (division) în cadrul MCA SRL**. |
| **Holding / SA** | Doar la Series A sau exit | Simplificare fiscală și decizională la scală mică; complicare la Series A (dilution, vesting, tag-along). |

### Principiu legal activ
**Nu creăm entitate nouă până revenue/funding nu justifică overhead-ul.** Dispersia operațională e mai scumpă decât tax savings sperate, în primele 12-18 luni.

---

## 4. Task Allocation Matrix (MCA ↔ UII ↔ UIL-DBA)

Cine face ce, clar și fără suprapunere. Matricea se actualizează când apar activități noi.

| Activitate | MCA SRL | UII ONG | UIL-DBA (sub MCA) |
|---|---|---|---|
| SaaS products (ModulCA, Bunkere, RenderLab etc.) | ✅ | — | — |
| NeufertAI Pro tiers (plătit, B2B) | ✅ | — | — |
| NeufertAI free tier pentru studenți / academici | — | ✅ (co-finanțat) | — |
| Research publications + whitepapers | — | ✅ | — |
| Academic partnerships (universități) | — | ✅ | — |
| EU grants (Horizon, PNRR, Civil Protection) | — | ✅ (lead) | — |
| CSR sponsorship receiver | — | ✅ | — |
| Municipality partnerships | — | ✅ (primary) | — |
| Custom design services (1-to-1) | — | — | ✅ |
| Consulting arhitectural plătit | — | — | ✅ |
| Consulting crisis management (SME, privat) | — | — | ✅ |
| Consulting crisis management (gov, dacă grant) | — | ✅ | — |
| Consulting crisis management (gov, dacă contract plătit) | — | — | ✅ |
| Training / workshops plătite | — | — | ✅ |
| Training / workshops gratuite publice | — | ✅ | — |
| White-label SaaS (produs-ified) | ✅ | — | — |
| White-label service custom (per client) | — | — | ✅ |
| Affiliate / retail partnerships | ✅ | — | — |
| Press / PR general ecosystem | Shared | Shared | Shared |

**Observation**: UIL-DBA apare doar în câteva categorii specifice. Până la ≥€30K revenue servicii/an, UIL nu merită entitate separată.

### Decizii-tip (când o activitate poate fi la două entități)

**Regula de decidere**:
1. Dacă există grant sau CSR potențial → UII preia
2. Dacă este contract plătit de privat / gov → UIL-DBA (în MCA)
3. Dacă este produs replicabil → MCA direct
4. Dacă este research fără client-specific → UII

---

## 5. Technical Architecture

### Structură monorepo

Decizie: **Monorepo cu `pnpm workspaces + Turborepo`**.

```
archicore/ (monorepo root)
├── packages/                      # Shared code, reusable across apps
│   ├── @archi/kb/                 # Knowledge Base content + API
│   ├── @archi/render/             # AI render engine aggregator
│   ├── @archi/saas/               # Auth + billing + tiers + email
│   ├── @archi/3d/                 # Three.js utilities + scene primitives
│   ├── @archi/crisis/             # Risk scoring, resilience scenarios
│   └── @archi/ui/                 # Shared UI kit (components, tokens)
├── apps/                          # Deployable apps (1 per brand/surface)
│   ├── modulca/                   # modulca.eu (flagship)
│   ├── neufertai/                 # neufertai.eu (B2B AI, Faza 1)
│   ├── renderlab/                 # renderlab.eu (AI render B2B, Faza 2)
│   ├── bunkere/                   # bunkere.ro (Faza 2)
│   ├── case-in-copaci/            # case-in-copaci.ro (Faza 3)
│   ├── crisisready/               # crisisready.eu (Faza 2-3)
│   ├── admin/                     # admin.archicore.eu (internal dashboard)
│   └── archicore-web/             # archicore.eu (umbrella landing, Faza 1)
├── scripts/                       # Ops scripts (current modulca scripts live here after migration)
└── docs/                          # Strategic documents (this file!)
```

### De ce monorepo cu Turborepo

| Criteriu | Monorepo | Multirepo |
|---|---|---|
| Siguranță cod partajat | ✅ 1 refactor = tot | ❌ Version drift |
| Costuri compute | ✅ Turbo cache (build doar diff) | ❌ Full build per repo |
| Costuri cognitiv | ✅ 1 context, 1 setup | ❌ Context switching |
| Refactorizări cross-project | ✅ 1 PR | ❌ N PR-uri coordonate |
| Izolare la crash | ⚠️ 1 bug CI poate bloca | ✅ Izolat natural |
| Deploy independent | ✅ Turborepo + Vercel o fac | ✅ Natural |
| Scale > 50 engineers | ❌ Dureros | ✅ Design for this |

Pentru 1 founder + AI agents, monorepo câștigă pe toate criteriile relevante.

### Packages breakdown

#### `@archi/kb` — Knowledge Base
- **Conținut**: 82+ articole Neufert + domeniu, multi-country (RO, NL, EU, DE)
- **API**: `api.archicore.eu/kb/{article-id}?lang=ro&tier=premium`
- **Consumatori**: Toate apps (ModulCA uses tip-of-day, NeufertAI use full RAG, CrisisReady use risk articles)
- **Administrare**: Via `admin.archicore.eu` dashboard (WYSIWYG editor)
- **Ownership IP**: UII (publicat, citabil). Licențiat către MCA pentru folosire comercială.

#### `@archi/render` — AI Render Aggregator
- **Engines**: 15+ configurate (5 free active, 10 pending billing)
- **Features**: Fallback chain, cost ceiling per tier, policy flags, img2img
- **Consumatori**: ModulCA (step 8 render), RenderLab (primary product), NeufertAI (visualize suggestions)
- **Ownership**: MCA (commercial product core)

#### `@archi/saas` — Auth + Billing + Tiers
- **Tech**: Supabase Auth + Stripe + Resend
- **Features**: 5-tier system, beta promo, Google OAuth, cloud save, RLS policies
- **Consumatori**: Toate apps
- **SSO readiness**: User model unificat (`profiles` cu `permissions_json` + `primary_brand`) — permite SSO switch-on când ajungem la 2+ produse live, fără migration.
- **Ownership**: MCA (commercial infrastructure)

#### `@archi/3d` — Three.js Utilities
- **Features**: Scene primitives, GLB loader, camera controls, module grid, walkthrough mode
- **Consumatori**: ModulCA (primary), Bunkere, CaseInCopaci (different geometries using same infrastructure)
- **Ownership**: MCA

#### `@archi/crisis` — Crisis Management Core (NEW)
- **Conținut**: Risk scoring models, GIS data pentru RO/NL/DE, scenarios templates, plan evacuare templates, compliance checklists
- **API**: `api.archicore.eu/crisis/risk-score`, `api.archicore.eu/crisis/scenarios`
- **Consumatori**:
  - ModulCA → feature "Resilience Score" la fiecare design
  - Bunkere → core business logic
  - CrisisReady → platformă dedicată
  - NeufertAI → mode "Crisis advisor"
- **Ownership**: UII (research-derived) + MCA (commercial features). Cross-licensed.

#### `@archi/ui` — Shared UI Kit
- **Conținut**: Componente React (buttons, modals, forms), design tokens (colors, spacing, typography), iconography
- **Consumatori**: Toate apps
- **Design philosophy**: Fiecare brand customizează culorile primare + logo; restul componentelor vin standardizate din kit.

### Dashboard intern (`admin.archicore.eu`)

**Scop**: Single pane of glass pentru control ecosistem.

**Versiuni**:
- **v0** (Faza 0-1): Live metrics per site (users, signups, revenue, errors), content editor `@archi/kb`, feature flags, deploy status
- **v1** (Faza 2): User support console, strategy OKR tracker, finance dashboard (Stripe + costs + runway), crisis incident room
- **v2** (Faza 3+): AI-powered insights, auto-routing tasks, marketing campaign scheduler, partner management

**Tech**: `apps/admin` în monorepo. Auth: admin role în `@archi/saas`. Deploy privat (IP allowlist + 2FA).

**Acces**: [Costin] + Muraru Petria (admin MCA) + cofondator UII (cand apare caz UII-specific). Roles differentiate ce vede fiecare.

### Data architecture

- **Supabase**: 1 project Supabase per app inițial (sau 1 shared cu row-level scoping pe `brand_id`). Decizia SSO determină.
- **Shared data**: KB content servit prin API public (cache edge la Vercel).
- **User data**: Izolat per-app în Faza 0-1, unificat la SSO activation (Faza 2+).
- **Analytics**: Vercel Analytics + Clarity per app, agregat în `admin.archicore.eu`.

---

## 6. Brand Strategy

### Model: "Brand-uri independente vizibil, umbrella discret"

**Fiecare brand are identitate proprie** (logo, culori, ton, audiență). Umbrella `archicore` este **vizibil doar în contexte unde adaugă valoare** (investor decks, press releases, cross-link footers).

### Reguli de branding

| Context | Ce văd userii | Exemplu |
|---|---|---|
| User ModulCA | Brand ModulCA standalone | Logo ModulCA, culori ModulCA, NO "Archicore" în header |
| Footer (orice app) | Link discret "Parte din rețeaua Archicore →" | Link la `archicore.eu/network` |
| Cross-link contextual | Relevant + natural | "Ai nevoie de un arhitect? Neufert AI te ajută →" |
| Investor / Partner | Prezentare unitară "Archicore Ecosystem" | Pitch deck multi-brand |
| Press release | Co-branded | "Archicore Network anunță lansarea..." |
| Grant application (UII) | "Partneriat MCA + UII + [universitate]" | Transparent |

### Anti-patterns

- ❌ "Un produs MCA Group" pe fiecare pagină (pierde autenticitate de brand local, scade conversie RO)
- ❌ Brand-uri complet izolate (pierde cross-sell, pierde authority transfer)
- ❌ Umbrella name agresiv în marketing când userul caută specific (SEO pierdere)

### Brand kits

Fiecare brand are:
- Logo primar + secundar
- Paletă culori (2 primare + 3 secundare)
- Font primar (coerent cross-brand — ONE font family)
- Tone of voice guide
- Fotografie style guide

Doar **font unic cross-brand** ca element de consistency subtle. Tot restul e per-brand.

---

## 7. Domain Portfolio

### Raport disponibilitate (rulat 2026-04-17 via RDAP)

#### ✅ Tier 1 — Critical (cumpără ACUM, ~€41/an)

| Domeniu | Status | Preț est./an | Scop |
|---|---|---|---|
| `archicore.eu` | ✅ LIBER | €10 | Umbrella tech (hidden initial) |
| `neufertai.eu` | ✅ LIBER | €10 | NeufertAI brand (vezi risc Neufert §8 bis) |
| `renderlab.eu` | ✅ LIBER | €10 | RenderLab brand |
| `crisisready.eu` | ✅ LIBER | €11 | CrisisReady brand |
| `modulca.com` | 🔴 LUAT | €12 | **Expiră 2026-07-10** — reminder drop-catch 2026-07-05 |

**Total imediat: €41/an pentru 4 domenii libere. Plus reminder pentru modulca.com.**

#### 🎯 Decizie finală domenii (user confirm 2026-04-17)

| Categorie | Domeniu | Cost |
|---|---|---|
| Tier 1 critical | archicore.eu + neufertai.eu + renderlab.eu + crisisready.eu | €41 |
| Neufert safety backup (brand diferit, fără risc) | archiai.eu | €10 |
| Defensive minim | neufertai.com + modulca.net | €24 |
| Expansion EU | bunkere.eu + **treehouse.eu** | €20 |
| **TOTAL CORE (decis)** | **9 domenii** | **€95/an** |

**Mai târziu (by need):**
- `baumhaus.de` (~€15 cu admin-C proxy) — pentru localizare Germania când intrăm acolo
- `neufert.ai` (€85) — opțional premium, amânat până vedem tracțiune NeufertAI
- `modulca.com` drop-catch 2026-07-10

**Decizii brand specifice:**
- **Treehouse vertical** = `treehouse.eu` (EN singular, pan-EU brand). `baumhaus.de` e pentru localizare DE când e nevoie, nu brand principal.
- **NeufertAI**: procedăm cu brand-ul dar avem `archiai.eu` ca safety net (brand complet diferit) dacă Neufert-Stiftung obiectează.

#### 🟡 Tier 2 — Expansion (cumpără 30-90 zile sau când e nevoie, ~€50/an)

| Domeniu | Status | Preț est./an | Când |
|---|---|---|---|
| `bunkere.eu` | ✅ LIBER | €10 | Când expansiune EU |
| `case-in-copaci.eu` | ✅ LIBER | €10 | La lansare public |
| `modulca.ro` | ✅ LIBER | €10 | Dacă SEO RO are nevoie |
| `crisisready.ro` | ✅ LIBER | €10 | Primul contract B2G RO |
| `uilabs.eu` | ✅ LIBER | €10 | Când UIL activat |

#### 🛡️ Tier 4 — Defensive (opțional, toate libere, ~€56 total)

| Domeniu | Status | Preț est./an | Rec |
|---|---|---|---|
| `neufertai.com` | ✅ LIBER | €12 | Grab — complement to .eu |
| `modulca.net` | ✅ LIBER | €12 | Defensive |
| `modulca.org` | ✅ LIBER | €10 | Defensive |
| `bunkere.com` | ✅ LIBER | €12 | Defensive |
| `padureata.eu` | ✅ LIBER | €10 | Extension Pădureața |

#### 📝 Domenii deja deținute (cost ongoing ~€77/an)

| Domeniu | Cost renewal | Notes |
|---|---|---|
| `modulca.eu` | €10 | Flagship, active |
| `bunkere.ro` | €12 | Held, dormant |
| `case-in-copaci.ro` | €15 | Held, dormant |
| `padureata.ro` | €12 | Held, potential repurpose (forest/wellness) |
| `urban-innovation.institute` | €28 | UII website (empty, to populate) |

### Bugete propuse

| Strategie | Cumpără | Cost nou/an | Total ecosystem/an |
|---|---|---|---|
| **Minimalist** | Tier 1 only (4 dom.) | €41 | €118 |
| **Balanced** (recomandat) | Tier 1 + 2-3 Tier 4 cheap | €75 | €152 |
| **Comprehensive** | Tier 1 + Tier 2 parțial | €90 | €167 |
| **Paranoid** | Tier 1 + Tier 2 + Tier 4 tot | €145 | €222 |

**Recomandare fermă: Balanced (~€152/an)**. Protecție brand complet, expansiune pregătită, sub €13/lună.

### Drop-catch strategy pt `modulca.com`

`modulca.com` expiră **2026-07-10**. Opțiuni:
1. **Backorder via registrar** (€30-80 cost) — registrar-ul încearcă să o prindă automat la expirare
2. **Monitoring manual** + aplicare imediată la drop
3. **Contact owner direct** (via WHOIS) — ofertă de răscumpărare

Acțiune imediată: **se setează reminder calendar pentru 2026-07-05** (5 zile înainte) să decidem drop-catch strategy.

---

## 8. Crisis Management Integration

### De ce este strategic important

[Costin] = specialist management de crize + cofondator UII.

Crisis management este **avantajul nostru competitiv unic** în spațiul arhitectural-construcții. Niciun competitor român (și puțini europeni) nu combină:
- Platformă digitală de design arhitectural (ModulCA)
- AI consultant arhitectural cu knowledge base (NeufertAI)
- Capacitate de research (UII, academic credibility)
- Expertiză crisis management (operator, not just theory)

Asta deschide categorii întregi de grant-uri EU și CSR bugets pe care alții nu le pot accesa.

### Unde se montează (cross-ecosystem)

| Platformă / Produs | Cum apare crisis management |
|---|---|
| **Bunkere.ro** | Core business — design și planning bunker familial/SME pentru criză (război, climă, pandemie, energie, tehnologic) |
| **ModulCA** | Feature "Resilience Score" gratuit — la fiecare design, user vede risc seismic/flood/fire + recomandări. Upsell: materiale resilience premium |
| **CaseInCopaci** | Retreat strategy — mental health, wellness, crisis recovery |
| **NeufertAI** | Mode "Crisis Advisor" — feature premium pentru arhitecți și specialiști |
| **`@archi/crisis`** (package) | Tehnologia comună — risk scoring, scenarios, plan templates |
| **CrisisReady.eu** (platformă B2B/gov dedicată) | Consulting pentru primării, SME, ONG — EU grants primary funnel |
| **Academic content (UII)** | Publicații co-branded cu universități de arhitectură și protecție civilă |

### Target audiences per segment

| Audiență | Platform(e) relevante | Value proposition |
|---|---|---|
| Familii (prepper, concerned citizens) | Bunkere.ro + ModulCA Resilience Score | "Casa ta, pregătită pentru orice" |
| SME (business continuity) | CrisisReady + UIL-DBA consulting | Planuri continuitate business, infrastructură rezilientă |
| Primării / Consilii județene | CrisisReady + UII consulting | Planuri rezilience urbană, acces la grant-uri EU |
| Arhitecți / Ingineri | NeufertAI Pro + RenderLab | Unelte pentru design rezilient |
| ONG-uri / Civil Protection | UII parteneriate | Research, training, policy advocacy |
| EU (Horizon Europe, Civil Protection Mechanism) | UII lead + MCA subcontract | Grant-uri 100K-5M€ pentru rezilience urbană + digitalizare construcții |

### Funnel grant-uri crisis management

Liniile de finanțare relevante (exemple):
- **Horizon Europe Cluster 3** — Civil Security for Society (€50M+ annual)
- **EU Civil Protection Mechanism** — Prevention & Preparedness (€20M+ annual)
- **EIT Climate-KIC** — Climate Adaptation & Resilience
- **PNRR C6** (RO) — Digitalizare pentru construcții reziliente
- **POR 2021-2027** — Dezvoltare urbană integrată
- **Regiunile NL** — climate adaptation funds

UII aplică ca lead → MCA subcontractant tehnic → research IP la UII, product IP la MCA.

---

## 9. Monetization Model

### Surse de venit per entitate

#### MCA SRL (for-profit)

| Sursă | Model | Ramp-up | Când începe |
|---|---|---|---|
| SaaS subscriptions (ModulCA tiers) | Recurring €19.99-149.90/lună | Fast post-launch | Mai '26 |
| NeufertAI Pro | Recurring €29-199/birou/lună | Medium | Iun '26 |
| RenderLab API | Pay-per-render + subscription | Slow | Sep '26 |
| Bunkere.ro subscriptions | Recurring + one-off designs | Medium | Oct '26 |
| Affiliate / retail partnerships | Comisioane 5-20% | Slow | Iun '26+ |
| White-label SaaS (enterprise) | Anual €5-50K per client | Slow | 2027+ |
| UIL-DBA services | Per-project €5-100K | Medium | Iun '26+ |

#### UII ONG (non-profit)

| Sursă | Model | Ramp-up | Când începe |
|---|---|---|---|
| EU Grants | Project-based €50K-5M | Slow (6-12 luni) | Aplicație iun '26, decizie dec '26 |
| PNRR / National grants (RO) | Project-based €20K-500K | Medium | Aplicație iul '26 |
| CSR sponsorship | Annual €2-50K per sponsor | Medium | Contact iul '26+ |
| Academic contracts (research) | Per-project | Slow | 2027+ |
| Donații / membri | Mic, simbolic | Slow | Oct '26+ |
| Training / workshops plătite (dacă rămân la UII) | Per-event | Slow | 2027+ |

### Fluxuri de bani între entități (legitim, documentat)

```
EU Grant → UII                           (UII primește)
         ↓
         Subcontract tehnic → MCA        (UII plătește MCA pentru dezvoltare)
         ↓
         Research published → UII        (IP rămâne la UII)
         ↓
         Product features → MCA           (MCA integrează în produse)
         ↓
         Revenue SaaS → MCA               (MCA vinde produse)
         ↓
         CSR Sponsorship → MCA → UII     (MCA plătește UII ca sponsor, deductibil)
         ↓
         Cross-funding cycle complete
```

### Projected revenue (indicative, prudent scenario)

| Anul | MCA revenue | UII funding | Total ecosystem |
|---|---|---|---|
| 2026 (post-beta) | €20-50K | €5-20K (1-2 small grants) | €25-70K |
| 2027 | €80-200K | €50-200K (1-2 medium grants) | €130-400K |
| 2028 | €300-800K | €100-500K | €400-1.3M |
| 2029 | €1-3M | €200K-1M | €1.2-4M |

**Aceste cifre sunt estimări pentru plan**, nu garanții. Depind de execuție, market fit, timing grant-uri.

---

## 10. Funding Strategy

### Bootstrap-first, venture-optional

**Abordare de bază**: creștem din venit + grant-uri (organic + non-dilutive) atâta timp cât runway-ul permite.

Venture (angel / VC) intră în scenariu **doar dacă**:
1. Există ferestră de piață care se închide (competitor scaling faster)
2. Există OPORTUNITATE strategică mare care necesită capital (expansiune NL/DE/FR rapid, acquisition)
3. Evaluation justifică dilution (post-revenue, post-market fit)

**NU caut investitori early doar pentru cash**. Grant-uri și revenue sunt mai ieftine (0% dilution).

### Surse de funding — prioritate execuție

#### Immediate (luna 1 post-beta)

| Sursă | Acțiune | Timp | Cost | Return estimat |
|---|---|---|---|---|
| Google for Startups Cloud Program | Aplicare online (~30 min) | 30 min | €0 | $2,000-100,000 cloud credit |
| AWS Activate | Aplicare online (~30 min) | 30 min | €0 | $1,000-100,000 credit |
| Azure for Startups | Aplicare online | 30 min | €0 | $150,000 credit (max) |
| Stripe Climate Program | Aplicare | 15 min | €0 | Carbon removal credits |
| Together.ai startup program | Aplicare | 20 min | €0 | $15-50K AI credits |
| Notion for Startups | Aplicare | 10 min | €0 | Free tier extended |

**Total timp ~2h, total credits potențiale $100K+. ZERO risc, ZERO dilution.**

#### Short-term (lunile 2-6)

| Sursă | Când aplici | Tip | Deadline tipic |
|---|---|---|---|
| **EIT Climate-KIC Accelerator** | Iun-iul '26 | Grant + mentorat | Anual, anunț februarie |
| **EIT Urban Mobility** | Iun-iul '26 | Grant | Rolling + call-uri |
| **Startup Nations Standard (RO)** | Iul '26 | Acceleraor + grant | Rolling |
| **Innovation Norway (collab)** | Aug '26 | Norvegian-RO | Anual |
| **Romanian CSR corporates** | Iul-sep '26 | Sponsorship UII | Ongoing |

#### Medium-term (lunile 6-12)

| Sursă | Tip | Ticket size | Deadline tipic |
|---|---|---|---|
| **Horizon Europe Cluster 3** (Civil Security) | Research grant | €500K-3M | 2x/an |
| **Horizon Europe Cluster 6** (Climate) | Research grant | €1M-5M | 2x/an |
| **PNRR C6** (RO digitalizare) | National grant | €50K-500K | Rolling |
| **Regional Operational Programme** (RO) | Regional grant | €50K-500K | Calls periodice |
| **Creative Europe** (educational content) | Creative grant | €50-200K | Anual |

#### Long-term (anul 2+)

| Sursă | Tip | Ticket size |
|---|---|---|
| **Angel investors** (RO, NL tech) | Equity | €100K-500K |
| **Venture capital** (seed) | Equity | €500K-3M |
| **Strategic acquirer** | Exit sau strategic | €1M-? |

### CSR strategy

CSR = bani companii mari alocați anual pentru cauze sociale/environmentale. **UII = recipient optim** (ONG + mission alignment + deductibilitate fiscală).

**Target-uri CSR**:

| Categorie | Exemple companii | Ofertă către ei |
|---|---|---|
| **Materiale construcții** | Kronospan, Egger, Stora Enso, Dedeman, Hornbach | Sponsorizare research sustenabilitate + content co-branded |
| **Energie / Renewable** | Enphase, Solar Panel Group RO, Nuclearelectrica | Content sustenabilitate + workshops publice |
| **Bănci / Finance** | Banca Transilvania, BCR, BRD, ING | Education construcții sustenabile pentru clienți credite ipotecare |
| **Tech** | Orange, Vodafone, UiPath | Education digitală arhitectură, accesibilitate |
| **Insurance** | Allianz, Groupama, Generali | Crisis management, resilience research |

**Template abordare**:
1. Identify decision maker (CSR manager) via LinkedIn
2. Trimis pitch UII + request meeting
3. Proposal: "€5-20K sponsorship anual, în schimbul content co-branded + event speaking slot + logo pe research"
4. Deductibil 20% pt sponsor, mission alignment pentru UII

---

## 11. Roadmap by Phase

### Faza 0 — Beta launch (aprilie-mai '26) ← SUNTEM AICI

**Obiectiv**: ModulCA.eu beta stabil, investitorii pot testa, primii useri reali.

**Deliverables**:
- [x] Cloud save/load
- [x] 147+ teste, 0 TS errors
- [x] Sentry + monitoring
- [x] Ops automation (ops-check, env-sync, stripe-go-live)
- [x] Mobile QA pass
- [x] Emails working (Resend)
- [ ] **Audit complet** (următorul pas)
- [ ] Stripe live (după bank verification)
- [ ] 1 test tranzacție real end-to-end
- [ ] Launch May 1

**KPI**: ModulCA live, 0 P0 bugs, primii 20 useri reali în prima săptămână.

### Faza 1 — NeufertAI + UII activare (iun-sep '26)

**Obiectiv**: Al 2-lea produs live, UII începe grant-uri, setup pentru scale.

**Deliverables**:
- Extract `@archi/kb` + `@archi/saas` în pachete monorepo
- Lansare `neufertai.eu` (MVP: chat AI + article viewer + subscribing)
- Dashboard v0 (`admin.archicore.eu`)
- Umbrella landing `archicore.eu/network`
- UII: prima aplicație EU grant (Civil Protection sau Climate-KIC)
- Aplicare toate startup programs (Google, AWS, Together, etc.)
- Primii useri NeufertAI Pro (B2B birouri arhitectură)

**KPI**: NeufertAI live, 10+ birouri plătitoare, 1 grant application depusă.

### Faza 2 — RenderLab + Bunkere + Dashboard v1 (oct '26 - feb '27)

**Obiectiv**: Diversificare veniturilor, crisis management ca produs.

**Deliverables**:
- `renderlab.eu` MVP live (API + self-serve subscription)
- `bunkere.ro` MVP live
- `crisisready.eu` early version (B2B/gov)
- Dashboard v1 (finance, support, strategy tracking)
- UII: 1-2 grant-uri câștigate (minimum), contracte cu 2+ primării
- Primii 100 useri ModulCA paying

**KPI**: 3 produse live cu revenue, €50K+ MRR combined, primul grant-uri EU encashed.

### Faza 3 — CaseInCopaci + UIL SRL spin-off (mar-aug '27)

**Obiectiv**: Consolidation, UIL ca entitate separată, expansion pregătită.

**Deliverables**:
- `case-in-copaci.ro` MVP live
- UIL SRL înființat (dacă servicii ≥€30K/an revenue)
- SSO activat across all apps
- Dashboard v2 (AI-powered insights, auto-routing)
- Prima campanie PR mare (cross-brand)
- Expansion research NL/DE

**KPI**: 5 produse live, €100K+ MRR, 2+ grant-uri EU in flight.

### Faza 4 — Expansion + venture-ready (sep '27+)

**Obiectiv**: Dominarea nișei RO, penetration NL/DE, decizie venture.

**Deliverables**:
- NL versions (`modulca.nl`, `bunkere.nl`, etc.)
- Partenariate universități majore (Delft, Wrocław, Cluj)
- White-label contracts (birouri mari arhitectură)
- Holding structure (dacă relevant)
- Series A preparation (dacă relevant) sau continuous bootstrap+grants

**KPI**: €500K+ MRR, 3+ țări live, research publicat în reviste peer-reviewed.

---

## 12. Financial Flows Between Entities

### Flow principal

```
                    ┌──────────────────────────┐
                    │  SURSE EXTERNE DE BANI   │
                    └─────┬──────┬──────┬──────┘
                          │      │      │
            SaaS customers │      │ EU grants
                          │      │      │
                          ▼      │      ▼
                    ┌──────────┐ │ ┌──────────┐
                    │ MCA SRL  │ │ │ UII ONG  │
                    │ (profit) │ │ │ (non-p.) │
                    └─┬────────┘ │ └────┬─────┘
                      │          │      │
                      │ CSR      │      │
                      │ sponsor  │      │
                      ├──────────┼─────►│
                      │          │      │
                      │          │      │ Subcontract
                      │          │      │ tehnic
                      │◄─────────┼──────┤
                      │          │      │
                      │ Tech     │      │ Research IP
                      │ license  │      │ stays at UII
                      ├─────────►│      │
                      │          │      │
                      ▼          │      ▼
                  Product        │   Research
                  Development    │   Output
                                 │
                                 ▼
                         Cross-pollinated
                         ecosystem growth
```

### Contracte-tip (template-uri)

**T1. UII licențiază tech de la MCA**
- Scop: UII poate folosi `@archi/kb`, `@archi/crisis` în activități non-profit
- Preț: nominal (€100-500/an) sau royalty pe grant amount (1-5%)
- Semnare: Costin (UII) + Muraru Petria (MCA)

**T2. MCA sponsorizează UII (CSR)**
- Scop: MCA donează UII pentru research/misiune publică
- Sumă: anual, funcție de profit MCA
- Deductibil: 20% impozit profit MCA
- Semnare: Muraru Petria (MCA) + Costin (UII)

**T3. UII subcontractează MCA (când grant câștigat)**
- Scop: UII câștigă grant → subcontractează dezvoltare/integrare la MCA
- Preț: piață, documentat
- Semnare: Costin (UII) + Muraru Petria (MCA)

**T4. Joint venture pe grant specific**
- Scop: Aplicație grant ca consortium MCA + UII + terți
- Split: definit în aplicația grant
- Semnare: toți partenerii

---

## 13. Risk Register

| Risc | Probabilitate | Impact | Mitigare |
|---|---|---|---|
| Stripe bank verification blocked extended | Mic | Mare | Alternative payment processors backup (Mollie, Paddle) |
| Beta launch bug-uri critice | Mediu | Mare | Audit pre-launch + error monitoring + rapid rollback |
| Parallel sessions git conflicts | Mediu | Mic-mediu | collision-check script + commit discipline |
| Domain squatter la `neufertai.eu` etc. | Scăzut acum | Mediu | Cumpără ACUM (toate libere) |
| `modulca.com` luat + refuză vânzare | Mediu | Mic | Nu-i critic — `modulca.eu` e primary |
| UII grant rejection (primele 2-3) | Mare (normal) | Mic | Aplicație multiplă, iterare pe feedback |
| CSR target nu răspunde | Mare (normal) | Mic | Outreach multiple, template iterare |
| MCA ↔ UII audit ANAF related party | Mic dacă documentat | Mare dacă nu | Template-uri contracte + documentare de la start |
| Conflict de interes perceput (Costin pe ambele) | Mediu | Mediu | Separare semnături (Costin UII, Muraru MCA) |
| Revenue MCA insuficient pt runway | Mic (capital mic needed) | Mare dacă apare | Bootstrap, runway extension via grants |
| Scope creep (prea multe branduri prea repede) | Mare (nature of vision) | Mare | Fazare strictă (nu începem Faza 2 până Faza 1 stable) |
| AI model cost explosion | Mediu | Mediu | Multi-engine fallback + cost ceiling per tier |
| Supabase downtime | Mic | Mare | Local fallback (existent), export periodic |
| Data breach / GDPR incident | Mic | Foarte mare | RLS + Sentry + DPO designation + insurance |
| Founder burnout | Mare (reality) | Catastrofic | Pace management, delegate la AI agents, don't chase every opportunity |

**Risc #1 general**: overestimarea capacității noastre de a lansa totul la timp. Antidot: fazare strictă + principiul "non-destructiv" + accept că lansarea cu funcționalitate mai puțină dar stabilă > lansare completă dar buggy.

---

## 14. Decision Log

Registru de decizii arhitecturale cheie, cu rationale. Format: decizie + data + alternative evaluate + motivare.

### DL-001: Monorepo vs Multirepo
- **Data**: 2026-04-17
- **Decizie**: Monorepo cu `pnpm workspaces + Turborepo`
- **Alternative evaluate**: Multi-repo cu npm packages private
- **Rationale**: Echipă mică (1 founder + AI), reuse cod masiv, simplitate Vercel deployment, Turbo cache ieftinește CI. Multi-repo câștigă doar la >50 engineers — nu suntem acolo.

### DL-002: SSO activation timing
- **Data**: 2026-04-17
- **Decizie**: Arhitectură SSO-compatible de la început, activation switching la lansarea produsului #2
- **Alternative evaluate**: SSO full acum | SSO niciodată | SSO per-brand separat
- **Rationale**: ROI SSO < 2 brand-uri = negativ. Arhitectura compatibilă = cost suplimentar zero la start. Activation = 1-2 zile când trebuie.

### DL-003: Knowledge Base delivery method
- **Data**: 2026-04-17
- **Decizie**: API (`api.archicore.eu/kb/*`)
- **Alternative evaluate**: npm package (static), copy-per-app
- **Rationale**: Single source of truth, update instant cross-brand, cache edge Vercel ieftin. Npm package ar fi necesitat publish + bump + install pt fiecare update.

### DL-004: Umbrella brand visibility
- **Data**: 2026-04-17
- **Decizie**: Brand-uri independente vizibil, umbrella discret (footer + cross-link)
- **Alternative evaluate**: "MCA Group" visible pe toate | Brand-uri complet izolate
- **Rationale**: SEO local mai puternic cu branduri separate; cross-sell păstrat via footer links; exit/spin-off friendly.

### DL-005: UIL SRL activation
- **Data**: 2026-04-17
- **Decizie**: Amânat până revenue servicii ≥€30K/an. Până atunci, "Urban Innovation Labs" operează ca DBA în MCA.
- **Alternative evaluate**: Creare imediată UIL SRL
- **Rationale**: Overhead admin €1200-3200/an nu se justifică fără revenue confirmat. Flexibility pentru pivot.

### DL-006: Domain portfolio strategy
- **Data**: 2026-04-17
- **Decizie**: Balanced approach — Tier 1 critical acum + 3-4 defensive din Tier 4. Total ~€75 domenii noi/an. Reminder pt modulca.com drop (2026-07-05).
- **Alternative evaluate**: Minimalist (doar T1) | Paranoid (toate)
- **Rationale**: Protection brand vs cost. Balanced = sub €13/lună pentru 5 brand-uri protejate.

### DL-007: Investment strategy
- **Data**: 2026-04-17
- **Decizie**: Bootstrap + grants first, venture optional (doar dacă strategic justificabil)
- **Alternative evaluate**: Seek angel/VC acum | Never equity
- **Rationale**: Principle-driven — noi modelăm structura, investitorii se mulează. Grant-uri = 0% dilution. Venture intră doar post product-market fit, evaluation superior.

### DL-008: Crisis management ca diferențiator strategic
- **Data**: 2026-04-17
- **Decizie**: Crisis management integrat în TOATE platformele + ca vertical dedicat (crisisready.eu + UII research lead)
- **Alternative evaluate**: Doar bunkere.ro | Nu includem
- **Rationale**: Expertiza founder + ONG credibility + grant-uri EU masive disponibile. Moat competițional real.

### DL-009: Treehouse brand pan-EU
- **Data**: 2026-04-17
- **Decizie**: `treehouse.eu` (singular) ca brand pan-EU. `baumhaus.de` rezervat pentru localizare Germania când e cazul (nu brand principal).
- **Alternative evaluate**: treehaus.eu (mix DE+EN, kitsch), baumhaus.eu (prea specific DE), canopy.eu (brandable dar non-descriptiv), treehouses.eu (plural, feels listing)
- **Rationale**: Pattern consistent cu ecosistem (modulca invenție + bunkere cuvânt + treehouse cuvânt EN descriptiv). Singular = brand mai puternic. Universal EN funcționează pan-EU. Strategia DE curată via baumhaus.de ulterior (ca Amazon: global + locale).

### DL-010: Neufert trademark risk — managed, not avoided
- **Data**: 2026-04-17
- **Decizie**: Procedăm cu `NeufertAI` ca brand primar. Rezervăm `archiai.eu` (brand complet diferit, fără risc) ca safety net pentru pivot rapid dacă Neufert-Stiftung obiectează. Nu investim marketing heavy în Germania cu numele NeufertAI până când consultăm IP lawyer specialist Namensrecht.
- **Alternative evaluate**: ArchiAI only (pierdem recognition), Contact proactiv Stiftung (bun dar nu urgent), Ignore risc (naiv)
- **Rationale**: Research (2026-04-17): Neufert-Stiftung activă din 2001 dar fără enforcement public vizibil. Fără trademark public detectat. Risc MEDIU-ÎNALT specific DE (Namensrecht §12 BGB), LOW-MEDIUM EU. Dual-branding = opționalitate la cost €10 extra.

### DL-011: Dashboard + Continuous Audit ca spec activă
- **Data**: 2026-04-17
- **Decizie**: Documentăm acum spec-ul pentru `admin.archicore.eu` Dashboard + sistemul de audituri continue (daily/weekly/monthly). Build-ul începe în Faza 1 (post beta-launch).
- **Alternative evaluate**: Build immediate (distrage de la beta-launch), defer indefinite (pierdere vizibilitate operațională)
- **Rationale**: User a cerut explicit. Spec scris acum = nu pierdem viziunea. Build început la Faza 1 = nu distragem launch ModulCA. Audituri manuale (cum facem azi) = baseline pentru când dashboard-ul preia automat.

---

## 15. Quick-Reference Commands

### Dev
```bash
npm run dev                   # Start local dev server
npm run build                 # Production build
npm run typecheck             # TypeScript check (0 errors expected)
npm run test:run              # Run all tests (147+ expected)
```

### Ops
```bash
npm run ops:check             # Full system health check
npm run predeploy             # Pre-deploy gate
npm run env:sync              # Sync .env.local → Vercel prod (with diff)
npm run env:sync:dry          # See diff, don't apply
npm run domains:check         # Check domain availability for ecosystem
```

### Future (after Stripe live)
```bash
STRIPE_LIVE_SECRET=sk_live_xxx STRIPE_LIVE_PUBLISHABLE=pk_live_xxx \
  npm run stripe:go-live      # One-command test→live cutover
```

---

## 16. Appendix: Key People & Contacts

| Persoană | Rol | Entitate |
|---|---|---|
| **Costin** | Founder & strategic lead | MCA SRL (asociat unic), UII ONG (președinte + cofondator) |
| **Muraru Petria** | Administrator | MCA SRL |
| *[Cofondator UII]* | Cofondator | UII ONG |

---

## 17. Document Maintenance

**Actualizare**: Acest document e **sursa de adevăr strategică**. Orice decizie arhitecturală majoră → se adaugă aici în Decision Log (secțiunea 14).

**Cadență review**: 
- Quick-review lunar (5 min, verifică roadmap progress)
- Deep-review trimestrial (30 min, revizie faze, KPI-uri, risk register)
- Major-update la fiecare lansare brand (new brand = update sections 7, 11, 12)

**Cine face update**: Costin (owner). AI agents pot propune updates via PR pentru decizii tehnice.

---

*Fine. Versiunea actuală reflectă deciziile luate pe 2026-04-17 în sesiunea de arhitectură.*
