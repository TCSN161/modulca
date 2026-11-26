# MCA-DOC-SESSION-MAP: harta chat-urilor și a sesiunilor

**Ce e**: vederea de ansamblu asupra tuturor chat-urilor (1–9) și sesiunilor: ce face fiecare, în ce stare e, ce a livrat, ce urmează, de cine depinde.
**Cine o ține la zi**: MAIN, după fiecare sesiune terminată și la închiderea de vineri.
**Ultima actualizare**: 2026-11-26 seara (MAIN 1.02)
**Legat de**: [[MCA-DOC-CHAT-WORKFLOW-2026-11-22]] (cine ce deține) · [[MCA-DOC-CHAT-NAMING-2026-11-22]] (cum se numesc) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] (ce urmează pe săptămâni) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26]] (planul complet)

Legendă: 🟢 lucrează acum · 🟡 așteaptă (pe cine scrie) · ✅ terminată (se poate arhiva) · 🔵 urmează (încă nepornită)

---

## 0. Pe scurt: ce e deschis acum

| Chat | Ultima sesiune | Stare | Următorul pas | Când |
|---|---|---|---|---|
| 1 MAIN | 1.02 (asta) | 🟢 | Testul complet al platformei (1.03) + închiderea săptămânii (1.04) | Vin 27 |
| 2 Neufert | 2.04 | ✅ F3 gata (1cf7a76) | 2.07 capitol nou (după Q11–Q25) · 2.05 F4+F6 | Lun 30 |
| 3 Engines | 3.04 | ✅ compare/upscale protejate (33f0682) | 3.05 compresie GLB + bug-uri din test (NEXT-3) | după testul complet |
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
│   ├── 2.06 Consultant-Claude-Fix (26 nov) ✅  Claude merge din nou, plan citit pe server, căutare CATUC (70db407, a9f5004)
│   └── 2.04 F3-Content (26 nov) ✅  case modulare sub CATUC RO+EN, 43 articole verificate + lista pentru Vlad (1cf7a76)
│       (2.04 = F3 vineri, 2.05 = F4+F6 luni: numere rezervate din planul inițial, de aceea 2.06 a venit înaintea lor)
│
├── 3 Engines — randări, video, 3D, prezentare
│   ├── 3.01 (vechi) Research unified AI API (22 nov) ✅
│   ├── 3.02 Beta-Render-Readiness (26 nov) ✅  raport motoare + verificare modele (8c57cc6)
│   ├── 3.03 Free-Engines + SEC-02 + Products-PDF (26 nov) ✅  motor gratuit nou cloudflare-klein, AI Horde, kill switch (f3b2fd8), securitate randări (eb21bba), produse în PDF (b691f8b)
│   └── 3.04 Compare-Upscale-Auth (26 nov) ✅  ultimele 2 rute protejate (33f0682); clienții încă fără Bearer → Chat 5 + admin
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
7. **În bara laterală**: o sesiune nouă stă sub MAIN cât lucrează (așa raportul vine automat la MAIN). Când e ✅ și verificată, MAIN o detașează și o mută în grupul chat-ului ei („2 · Neufert” etc.). Sesiunile din aprilie stau în „0 · Arhivă”.
8. **MAIN nou la fiecare săptămână** (sau când contextul se umple): 1.02 → 1.03 → … Harta asta e memoria comună, nu chat-ul.

---

## 4. Prognoza: sesiunile care urmează (flexibilă)

Numărul final se dă la pornire (următorul liber din chat). Stare: **📅 planificată** (are dată) · **⏳ condiționată** (pornește când se îndeplinește condiția) · **💡 opțională** (doar dacă e nevoie) · **❌ renunțat**. MAIN revizuiește lista vinerea: adaugă, mută sau taie.

### 4.1 Propuse de chat-uri (din rapoartele lor)
| Sesiune | Propusă de | Ce face | Când | Stare |
|---|---|---|---|---|
| 2.04 F3 modular-prefab | 2.03 | Fișierul juridic critic, fiecare frază cu articol | Vin 27 | 📅 |
| 2.05 F4+F6 | 2.03 / plan | Urbanism PUG/PUZ + ghidul de autorizare | Lun 30 | 📅 |
| 3.04 compare/upscale + bug-uri randare | 3.03 | Protecție pe cele 2 rute rămase + ce iese din testul complet | Sâm 28 | 📅 |
| 4.04 promo beta + 8 probleme | 4.02 | Promo calculat pe server, cele 8 BUG-uri minore | Sâm 5 dec | 📅 |
| 5.02 audit export → spec PermitTracker | 5.01 | Audit read-only al exportului PDF | Mar 1 dec | 📅 |
| 6.04 revizuire scripturi după Vlad | 6.03 | Ajustează Shorts și scripturile după review-ul juridic | După semnătura Vlad (~5 dec) | ⏳ |
| 8.02 Express MVP | 8.01 | Întrebări → proiect complet → 3 randări → prezentare | Mie 2 – Joi 3 dec | 📅 |
| 5.02 pagina de randare (val 2) | 1.03 test + PDF Costin | ST03 3D+Text→Image trimite captura 3D (img2img), butonul Image→Image activ, ST29 „Randat cu X” + fallback, ST27 randările salvate în proiect, ST02, ST05 | Vin 27 | 📅 || 3.06 comparație randare după 3D (bake-off) | MAIN (Costin) | Testează toate variantele gratuite care pornesc de la 3D (cloudflare-klein, ControlNet/depth pe Hugging Face, AI Horde ControlNet, Gemini edit, altele din Radar) față de stability-structure (randările vechi din PDF #8 = referință). Tabel fidelitate / calitate / cost / limită → decizia pe €10 | Lun 30 – Mar 1, după 5.02 | ⏳ după 5.02 || Decizie €10 Stability (Costin) | MAIN | Doar dacă bake-off-ul arată că gratuitul nu ajunge pentru demonstrații și beta | până pe 10 dec | ⏳ |
| 9.02 raport săptămânal | 9.01 | Top 3 noutăți „merită făcut” | Vin 27 și apoi în fiecare vineri | 📅 |
| Test Haiku 5.5 pentru traduceri | 9.01 (Radar) | Înlocuiește DeepSeek, cost mic | W49, în sesiunea 2.07 | 📅 |
| Foaie de buget (limita de €50) | 9.01 (Radar) | Tabel lunar de costuri AI/hosting | 1.04 vineri | 📅 |

### 4.2 Din plan (roadmap §2), până la beta
| Sesiune | Ce | Când | Stare |
|---|---|---|---|
| 1.03 test complet platformă | Browser, cont Constructor → lista BUG-xx | Vin 27 dim. | 📅 |
| 1.04 închidere W48 | Hartă, plan, Radar, bug-uri pe chat-uri | Vin 27 seara | 📅 |
| 1.05 retrospectivă noiembrie | | Dum 29 | 📅 |
| 7.02 acord Vlad + DPA | Draft acord + emailuri furnizori | Lun 30 | 📅 |
| 2.07 capitol CATUC nou | Din NotebookLM Q11–Q25 | Mar 1 dec | ⏳ (după Q11–Q25 de la Costin) |
| 1.0x upgrade securitate B15 | sharp 0.34→0.35 | Mie 2 dec | ⏳ (OK Costin) |
| 2.08 corecturi Vlad | | Joi 3 dec | ⏳ (după review) |
| 2.09 publicare Faza 2 | `.new.md` → live | Vin 4 dec | ⏳ (după semnătură) |
| 7.03 email către cei 10 utilizatori | Chestionar + cont gratuit 1–3 luni | Sâm 5 dec | ⏳ (OK Costin înainte de trimitere) |
| 2.1x `/catuc-check` + Profile Engine | | W50 | 📅 |
| 5.0x PermitTracker 3 PDF-uri | | W50 (11–12 dec) | 📅 |
| 8.03 teste automate Playwright | 3 briefuri de test | W50 | 📅 |
| 4.0x insignă BETA + feedback | | W50 | 📅 |
| 3.0x walkthrough v0 + compresie GLB | | W50 | 📅 |
| 2.1x Privacy + ToS beta | | W50 | 📅 |
| 7.0x lista de invitați + email | | până pe 10 dec | 📅 |
| 1.0x pre-flight beta | | 14 dec | 📅 |
| 3.0x LTX video wire-up | (din docs Chat 3) | după beta, dacă avem buget | 💡 |

### 4.3 După beta (ianuarie)
Stripe live (4) · canal YouTube (6) · presă + Cornetu (7) · Blender pipeline (3) · DWG export (5) · Express prompt liber (8) · bibliotecă în batch cu Haiku (2) · triaj săptămânal feedback (1).

### 4.4 Chat-uri noi posibile (doar dacă apare nevoia)
| Chat candidat | Când l-am porni (declanșator) | Până atunci se ocupă |
|---|---|---|
| **10 Support / Feedback beta** | Dacă feedback-ul de la beta depășește ~1 oră/zi de triaj | 1 MAIN |
| **11 SEO / Analytics** | Când pornim conținut regulat (ian) și vrem rapoarte săptămânale GA4 / Search Console | 1 MAIN + 6 Marketing |
| **12 Producători / Supply** | Când avem primii producători de module în discuții concrete | 7 Partners |
| **13 Mobile / AR** | Dacă după lansare vrem aplicație sau „casa pe terenul tău” în AR | 3 Engines |

Regula: un chat nou apare doar când un grup existent nu mai poate duce sarcina fără să-și încarce contextul. Altfel e doar o sesiune nouă într-un chat existent.

### 4.5 Pe fiecare grup existent: sesiunile previzibile, până după lansare
(Fiecare rând = o sesiune probabilă. Ordinea contează, datele sunt orientative.)

| Grup | Până la beta (dec) | Pre-lansare (ian) | După lansare (feb →) |
|---|---|---|---|
| **1 MAIN** | 1.03 test complet · 1.04 închidere W48 · 1.05 retro nov · închideri W49–W51 · upgrade securitate B15 · pre-flight beta · ziua beta (15 dec) | Triaj feedback săptămânal · Go/No-Go 15 ian · checklist lansare · retro dec + ian | MAIN nou săptămânal · ziua lunară de upgrade AI · retro lunare · planul trimestrial (Q1/Q2 2027) |
| **2 Neufert** | 2.04 F3 · 2.05 F4+F6 · 2.07 capitol nou + test Haiku · 2.08 corecturi Vlad · 2.09 publicare · `/catuc-check` + Profile Engine · Privacy/ToS beta | Citări de articole în consultant (Citations API) · biblioteca tradusă în batch · Codul Fiscal / alte legi | Actualizări la fiecare schimbare de lege · alte țări (bibliotecă pe țări) · consultant cu vizualizare (citește planuri și poze) |
| **3 Engines** | 3.04 compare/upscale + bug-uri · compresie GLB · walkthrough v0 · postprocessing 3 | Blender pipeline (variante de module, lumină) · randări care respectă exact vederea 3D · prezentări pptx cu Agent Skills | Video AI (LTX/altele, cu buget) · AR/VR (dacă nu devine grup separat 13) · motoare noi din Radar |
| **4 Billing** | 4.04 promo beta + 8 probleme · insignă BETA + widget feedback | Stripe LIVE · CUI/bancă · facturare · prețuri finale după beta | Pachete one-off (documente CATUC €9–29) · reînnoiri, retenție · conturi pentru firme |
| **5 Design + Drawings** | 5.02 audit export · PermitTracker 3 PDF-uri · bug-uri din testul complet | Export DWG v0 · îmbunătățiri wizard din feedback | Desene tehnice complete (planuri, secțiuni) · pachet PAC pentru arhitect · cote și standarde CAD |
| **6 Marketing** | (pauză) · 6.04 ajustări după Vlad · pilot 3–5 Shorts | Canal YouTube live · ritm de postare · lead magnet „Ghid CATUC” · quiz pe site · campanie lansare | Conținut săptămânal · studii de caz (Cornetu) · webinare pentru arhitecți |
| **7 Partners** | 7.02 acord Vlad + DPA · 7.03 email utilizatori · lista invitaților beta | 3 jurnaliști + kit de presă · programe startup · primii producători de module | Rețea de arhitecți parteneri · producători (sau grup 12) · investitori |
| **8 Express** | 8.02 MVP · 8.03 teste automate Playwright | Prompt liber · mai multe randări · alegere de produse | Express pentru arhitecți (propunere pentru client în 5 min) · Express din poza terenului |
| **9 Radar** | 9.02 raport vineri (în fiecare săptămână) · sweep lunar 7 dec | Sweep 4 ian · raport lansare (ce unelte noi folosim) | Raport săptămânal + lunar, pe aceeași regulă |
| **0 Arhivă** | — (doar istoric) | — | — |

Grupurile noi 10–13 (§4.4) preiau sarcini din tabelul de mai sus doar când declanșatorul lor se activează. Exemple: 10 Support preia triajul de la MAIN, 12 Producători preia de la Partners, 13 Mobile/AR preia AR de la Engines.
