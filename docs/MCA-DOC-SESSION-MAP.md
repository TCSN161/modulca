# MCA-DOC-SESSION-MAP: harta chat-urilor și a sesiunilor

**Ce e**: vederea de ansamblu asupra tuturor chat-urilor (1–9) și sesiunilor: ce face fiecare, în ce stare e, ce a livrat, ce urmează, de cine depinde.
**Cine o ține la zi**: MAIN, după fiecare sesiune terminată și la închiderea de vineri.
**Ultima actualizare**: 2026-11-26 seara (MAIN 1.02)
**Legat de**: [[MCA-DOC-CHAT-WORKFLOW-2026-11-22]] (cine ce deține) · [[MCA-DOC-CHAT-NAMING-2026-11-22]] (cum se numesc) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] (ce urmează pe săptămâni)

Legendă: 🟢 lucrează acum · 🟡 așteaptă (pe cine scrie) · ✅ terminată (se poate arhiva) · 🔵 urmează (încă nepornită)

---

## 0. Pe scurt: ce e deschis acum

| Chat | Ultima sesiune | Stare | Următorul pas | Când |
|---|---|---|---|---|
| 1 MAIN | 1.02 (asta) | 🟢 | Testul complet al platformei (1.03) + închiderea săptămânii (1.04) | Vin 27 |
| 2 Neufert | 2.06 | ✅ | **2.04 F3** (fișierul juridic critic) | Vin 27 |
| 3 Engines | 3.03 | ✅ | 3.04: protecție `/compare` + `/upscale` | Vin 27 |
| 4 Billing | 4.03 | ✅ | 4.04: promo beta cap-coadă în Stripe TEST | W49 |
| 5 Design + Drawings | 5.01 | ✅ | 5.02: audit export PDF → spec PermitTracker | W49 |
| 6 Marketing | 6.03 | ✅ (pauză până la beta) | — | după review-ul lui Vlad |
| 7 Partners | (aprilie) | 🔵 | 7.02: acord Vlad + email DPA + email către cei 10 utilizatori | W49 |
| 8 Express | 8.01 | ✅ | 8.02: construcția MVP | W49 |
| 9 Radar | 9.01 | 🟡 așteaptă link-uri de la Costin | Raport săptămânal vineri | Vin 27 |

---

## 1. Arborele complet

```
ModulCA
├── 1 MAIN — orchestrare, decizii, legătura dintre chat-uri
│   ├── 1.01 Phase1-Reboot (19 nov) ✅
│   └── 1.02 WeeklyPlan-W48-Sprint (23–26 nov) 🟢 ← AICI
│
├── 2 Neufert — CATUC, consultant AI, text juridic
│   ├── 2.01 (vechi) Expand Neufert AI KB (19 nov) ✅
│   ├── 2.02 NotebookLM-Ingest (25 nov) ✅  răspunsuri Q1–Q10, tabel articole, DTAC→PAC
│   ├── 2.03 F2-Content (26 nov) ✅  procesul de autorizare RO+EN (5533ec3)
│   └── 2.06 Consultant-Claude-Fix (26 nov) ✅  Claude merge din nou, plan citit pe server, căutare CATUC (70db407, a9f5004)
│       (2.04 = F3 vineri, 2.05 = F4+F6 luni: numere rezervate din planul inițial, de aceea 2.06 a venit înaintea lor)
│
├── 3 Engines — randări, video, 3D, prezentare
│   ├── 3.01 (vechi) Research unified AI API (22 nov) ✅
│   ├── 3.02 Beta-Render-Readiness (26 nov) ✅  raport motoare + verificare modele (8c57cc6)
│   └── 3.03 Free-Engines + SEC-02 + Products-PDF (26 nov) ✅  motor gratuit nou cloudflare-klein, AI Horde, kill switch (f3b2fd8), securitate randări (eb21bba), produse în PDF (b691f8b)
│
├── 4 Billing — planuri, Stripe, cote
│   ├── 4.01 (vechi) Prețuri, conturi (19 nov) ✅
│   ├── 4.02 Full-Account-Comp (26 nov) ✅  conturi comp, webhook sigur (34666e4)
│   └── 4.03 Server-Tier + Per-User-Quota (26 nov) ✅  plan citit pe server + cotă per utilizator, migrația 012 (379e148)
│
├── 5 Design + Drawings — wizard, design, teren, produse, salvare proiect + desene tehnice
│   ├── 5.00 (vechi, aprilie) Wall thickness ✅
│   └── 5.01 Express-Interfaces + Save-Bugs (26 nov) ✅  teren salvat (8723dc0), produse salvate + interfețe Express (2d15359), identitate la randări (acfc8a2)
│
├── 6 Marketing — comunicare, brand, YouTube/social, NotebookLM
│   ├── 6.01 Strategy-Kickoff ✅  voce brand v0, piloni (330449f)
│   ├── 6.02 Pilot-Shorts-Prep ✅  5 Shorts DRAFT + calendar ian (f8523df)   ⚠️ pornită de 6.01, nu de MAIN
│   └── 6.03 Pilot-Production ✅  voce brand v1 + 4 scripturi lungi (dbe90dc)   ⚠️ pornită de 6.02, nu de MAIN
│
├── 7 Partners — Vlad, DPA, presă, utilizatori
│   └── 7.01 (vechi, aprilie) DPA outreach ✅   (handoff Vlad 23 nov scris de MAIN)
│
├── 8 Express — wizard automat + teste automate
│   └── 8.01 Wizard-Audit-Spec ✅  spec v1 (5c11e95)
│
└── 9 Radar — noutăți AI și unelte
    └── 9.01 Setup-First-Sweep ✅  radar actualizat + raport săptămânal (e21db2d)
```

---

## 2. Cum depind unele de altele (ce blochează ce)

| Lucru | Așteaptă după | Deblochează |
|---|---|---|
| 8.02 Express MVP | 5.01 interfețe ✅ · 4.03 cotă ✅ · 3.03 randări ✅ | Testele automate (golden briefs) |
| F3 (2.04) | F2 ✅ | Pachetul pentru Vlad (sâmbătă 28) |
| Pachetul Vlad (7.02) | F2 ✅ + F3 | Review juridic → publicarea conținutului CATUC (W49) |
| Pilot Shorts (Chat 6) | Review-ul lui Vlad pe F2/F3 | Canal YouTube (ian) |
| `/catuc-check` (Chat 2, W50) | Conținut CATUC publicat | Serviciul /autorizare |
| PermitTracker PDF (Chat 5, W50) | 5.02 audit export | Pachetul de notificare |
| Testul complet (1.03) | Toate reparațiile de azi ✅ | Lista de bug-uri → câte un chat responsabil |

---

## 3. Reguli de lucru (de acum)

1. **Numerotare**: `{chat}.{NN}.{Eticheta}_{subiect}_{YYYYMMDD}`. `NN` = următorul număr liber **din acel chat**. MAIN îl alege când pornește sesiunea. Sesiunile vechi, dinainte de reboot, contează ca `.01`.
   *(Pe 26 nov am folosit greșit `3.0x`, `4.0y` etc. când pornisem mai multe deodată; le-am redenumit: 3.02, 3.03, 4.02, 4.03.)*
2. **Doar MAIN pornește sesiuni.** O sesiune nu pornește altă sesiune; dacă vrea o continuare, scrie promptul următoarei sesiuni la final, iar MAIN decide când o pornește. (Marketing a pornit singur 6.02 și 6.03; de acum nu se mai face.) MAIN le pornește singur, după plan (harta §0 + roadmap), fără să mai întrebe. Îl întreabă pe Costin doar dacă sesiunea cheltuie bani, trimite ceva în afară (emailuri, postări), schimbă ceva juridic sau de preț, ori iese din planul aprobat. Seara și vinerea, Costin primește lista cu ce s-a pornit și ce a livrat.
3. **O sesiune = o sarcină.** Se termină cu: commit + push, un rând în jurnalul săptămânii, promptul pentru sesiunea următoare.
4. **Rapoartele vin automat la MAIN.** Costin nu trebuie să verifice fiecare chat: MAIN primește raportul, verifică commit-urile pe master și actualizează harta asta. Costin se uită doar la §0.
5. **Maximum 2 sesiuni în paralel** (limita de utilizare și memoria PC-ului), niciodată două pe aceleași fișiere.
6. **Arhivare**: o sesiune ✅ verificată de MAIN se poate arhiva; harta și commit-urile păstrează istoria.
7. **În bara laterală**: sesiunile pornite de MAIN apar ca sub-sesiuni ale MAIN-ului curent; sesiunile vechi stau în grupurile „1 · MAIN” … „9 · Radar”, iar cele din aprilie în „0 · Arhivă”.
8. **MAIN nou la fiecare săptămână** (sau când contextul se umple): 1.02 → 1.03 → … Harta asta e memoria comună, nu chat-ul.
