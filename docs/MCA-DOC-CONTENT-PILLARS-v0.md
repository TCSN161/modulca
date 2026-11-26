# MCA-DOC-CONTENT-PILLARS-v0

**Status**: Draft v0. Costin reviews it. It gets tested in the Dec pilot and becomes v1 before the channel goes live in January.
**Owner**: Chat 6 Marketing · session `6.01.Marketing_Strategy-Kickoff_20261126`
**Related**: [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] (§1 funnel, §6 NotebookLM tools, §7 quality gate, §8 pilot plan, §9 metrics, §10 answers) · [[MCA-BRAND-VOICE-v0]] (`docs/brand/MCA-BRAND-VOICE-v0.md`)
**Channel**: ModulCA · series **„CATUC pe înțelesul tuturor"** (§10 Q1)
**Budget**: €0 production (NotebookLM free tier, Costin's voice). Ops cap €50/month for any future tool, nothing planned yet.

---

## 0. How the pillars work

Every content piece belongs to **exactly one pillar** and **one audience** (homeowner 🏡 or architect 📐, per brand voice §2). The mix moves people down the funnel (strategy §1):

```
P1 Am nevoie de autorizație? ─┐
P2 Pas cu pas (procedura)  ───┼─→ free checker /autorizare ─→ email ─→ P4 document pack / architect ─→ P5 modular house
P3 Ce s-a schimbat (pro)   ───┘
```

| # | Pillar (RO / EN) | Audience | Job in funnel | Share of output (Jan target) |
|---|---|---|---|---|
| **P1** | **Îmi trebuie autorizație?** / *Do I need a permit?* | 🏡 | Reach: the most searched questions | **40%** |
| **P2** | **Pas cu pas** / *Step by step* | 🏡 (+📐) | Trust: walks through the procedure | **25%** |
| **P3** | **CATUC pentru profesioniști** / *CATUC for professionals* | 📐 | B2B: architects as amplifiers, Architect tier | **15%** |
| **P4** | **Pregătește dosarul** / *Get your file ready* | 🏡 | Conversion: checker, document pack, architect referral | **10%** |
| **P5** | **Construiește mai simplu** / *Build simpler* (modular) | 🏡 | Core revenue: bridge to ModulCA houses | **10%** |

Why this split: legal how-to content (P1–P2) earns the audience. Selling (P4–P5) stays at most 20%, so the channel keeps the trust its legal content needs (brand voice §6).

---

## P1 — Îmi trebuie autorizație? / Do I need a permit?

**Promise**: one concrete question → short answer → „depinde de 3 lucruri" → article → checker.
**Formats**: NotebookLM **Rezumat video „Scurt"** (portrait) · **Infografic** (portrait, limits) · **Cartonașe**
**Every piece**: the limit **with its conditions** (brand voice §3.2)

| Example topic | Law ref | §8 pilot? |
|---|---|---|
| Anexa de 20 m² / 2,5 m fără autorizație: când da, când nu | art. 299 | ✅ pilot Short #1 |
| Casa prin notificare: 150 mp în mediul rural, dar doar cu condiții | art. 294 | ✅ pilot Short #2 |
| Garaj, terasă acoperită, pergolă: notificare sau nimic? | art. 294, 299 | — |
| Panouri fotovoltaice pe casă sau pe sol (prosumator) | art. 299 | — |
| Mansardez podul: îmi trebuie autorizație? | art. 294 | — |
| Renovez baia/bucătăria: ce formalități am? | art. 294, 299 | — |

---

## P2 — Pas cu pas / Step by step

**Promise**: the whole route from „am un teren" to „încep lucrările", one step per piece. Each piece states its deadlines.
**Formats**: **Rezumat video „Explicații"** (long, landscape) · **Rezumat audio „Analiză detaliată"** (podcast) · **Prezentare detaliată** → lead-magnet PDF „Ghid CATUC"

| Example topic | Law ref | §8 pilot? |
|---|---|---|
| Aprobarea tacită: 15 zile lucrătoare, apoi încă 15 zile calendaristice | art. 296(1)(a), 296(6) | ✅ pilot Short #3 |
| Ce studii îți trebuie (topo, geo, …) înainte de proiect | per F2/F3 verified facts | ✅ pilot Short #5 |
| Certificatul de urbanism: ce e, cât durează, cât e valabil | art. 253–258 | — |
| Autorizația de construire: termen, valabilitate 3 ani, prelungire | art. 259, 273, 309 | — |
| Notificare: ce depui (formular + proiect tehnic simplificat) | art. 295(4) | — |
| Ce poate răspunde primăria la notificare (5 variante) | art. 296(1) | — |

---

## P3 — CATUC pentru profesioniști / CATUC for professionals

**Promise**: what changed against L.50/1991, in tables, fast. We address architects as partners, never as competitors.
**Formats**: LinkedIn carousel (**Infografic** landscape/square) · **Slide-uri pentru prezentator** → webinar · articles on modulca.eu · **Rezumat audio „Dezbatere"** (debate format: notification vs permit)
**Review**: flagship pieces go through partner-architect review (§7 step 3).

| Example topic | Law ref | §8 pilot? |
|---|---|---|
| DTAC → PAC: ce s-a schimbat în conținut | art. 262, 264, 265 | ✅ pilot Short #4 (🏡 version) |
| Notificarea pentru clienți: când o recomanzi, ce răspundere ai | art. 294–298 | — |
| PUD aprobat prin dispoziția primarului, nu prin HCL | per F2/F3 verified facts | — |
| L.50 vs CATUC: tabel cu 10 schimbări pentru birouri mici | multiple | — |
| Ce poate și ce nu poate face AI-ul într-un dosar (D4, OAR) | art. 295(4), 298(2) | — |

---

## P4 — Pregătește dosarul / Get your file ready

**Promise**: practical tools, not theory. This pillar converts.
**Formats**: **Test** → quiz „Ce procedură îți trebuie?" (`src/features/quiz`, a site-side change owned by another chat) · checklists · Shorts demos of the checker (after Phase 3 ships)
**Depends on**: `/autorizare` checker (Phase 3, Chat 2) and the document pack (pricing via Chat 4). **No P4 content before the checker is live.**

| Example topic | Law ref | §8 pilot? |
|---|---|---|
| Lista de documente pentru certificatul de urbanism (checklist PDF) | art. 253–258 | — |
| „Fă testul: ce procedură îți trebuie în 2 minute" | — | — |
| Ce întrebi arhitectul la prima întâlnire (brief template) | — | — |
| Formularul de notificare: de ce încă nu e publicat oficial | art. 295(10) | — |

---

## P5 — Construiește mai simplu / Build simpler (modular)

**Promise**: once you know the route, see how a modular house shortens it. This is the core ModulCA offer.
**Formats**: configurator screen recordings / Three.js walkthrough (Chat 3), case-study Shorts, and the „bridge" line at the end of P1–P2 pieces
**Signal from 2026-04-09 investor demo**: real built houses beat renders, so use the case study once its figures are verified.

| Example topic | Law ref | §8 pilot? |
|---|---|---|
| Casă modulară pe teren rural: ce procedură se aplică | art. 294 (conditions!) | — |
| Modul 3×3 m: ce încape, cum se combină | — | — |
| De la checker la casa ta în configurator (demo) | — | — |
| Case study: costuri și termene reale | — | — |

---

## 6. Pilot mapping (strategy §8, December, after the partner architect's F2/F3 review)

| Short | Pillar | Audience | NotebookLM | Focus-box prompt (draft) |
|---|---|---|---|---|
| #1 Anexa 20 m² / 2,5 m | P1 | 🏡 | Video Scurt | „Pentru proprietari din mediul rural: când poți construi o anexă fără nicio autorizație conform art. 299 CATUC; toate condițiile (fără fundație, provizoriu, demontabil, lemn/metal, PUG/RLU)." |
| #2 Casa prin notificare 150 mp | P1 | 🏡 | Video Scurt | „Pentru proprietari: casa unifamilială prin notificare (art. 294) — 150 mp, P sau D+P, rural intravilan, doar pe proiecte-tip sau proiecte individuale avizate; ce NU acoperă." |
| #3 Aprobare tacită 15 zile | P2 | 🏡 | Video Scurt | „Pentru proprietari: ce înseamnă aprobarea tacită la notificare — 15 zile lucrătoare (art. 296(1)(a)), apoi începi după încă 15 zile calendaristice (art. 296(6))." |
| #4 DTAC → PAC | P3→🏡 | 🏡 | Video Scurt | „Pentru proprietari care au auzit de DTAC: de ce acum se numește PAC și ce înseamnă pentru ei." |
| #5 Ce studii îți trebuie | P2 | 🏡 | Video Scurt | Topic is set after the F2/F3 verified facts land (Chat 2) |

Each Short goes through **brand voice §7** and the strategy **§7 gate**. Turn on „structure preview" so we can fix the script before spending quota.

**Measure** (strategy §9): views, watch time, clicks to modulca.eu per Short. The winning pillar gets more weight in the January calendar.

---

## 7. January rhythm (proposal, for 6.02)

- **2 Shorts / week** (P1, P2 mostly) + **1 long / week** (P2 or P3), alternating
- **1 LinkedIn carousel / week** (P3)
- **1 lead magnet**: „Ghid CATUC" PDF (P2, from Prezentare detaliată), email-gated, after flagship review
- Calendar file: `docs/content/MCA-DOC-CONTENT-CALENDAR-2027-01.md` (next session)

---

## 8. Changelog

| Date | Change |
|---|---|
| 2026-11-26 | v0 draft (Chat 6, session 6.01) |
