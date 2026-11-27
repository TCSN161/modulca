# MCA-DOC-SESSION-MAP: harta chat-urilor și a sesiunilor

**Ce e**: vederea de ansamblu asupra tuturor chat-urilor (1–10) și sesiunilor: ce face fiecare, în ce stare e, ce a livrat, ce urmează, de cine depinde.
**Cine o ține la zi**: MAIN, după fiecare sesiune terminată și la închiderea de vineri.
**Ultima actualizare**: 2026-11-27 seara (MAIN 1.05, închiderea W48)
**Legat de**: [[MCA-DOC-CHAT-WORKFLOW-2026-11-22]] (cine ce deține) · [[MCA-DOC-CHAT-NAMING-2026-11-22]] (cum se numesc) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] (ce urmează pe săptămâni) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26]] (planul complet)

Legendă: 🟢 lucrează acum · 🟡 așteaptă (pe cine scrie) · ✅ terminată (se poate arhiva) · 🔵 urmează (încă nepornită)

---

## 0. Pe scurt: ce e deschis acum

| Chat | Ultima sesiune | Stare | Următorul pas | Când |
|---|---|---|---|---|
| 1 MAIN | 1.05 (asta, închiderea W48) | 🟢 | 1.06 retro noiembrie · test complet 2 · închiderea W49 | Dum 29 · Vin 4 |
| 2 Neufert | 2.08 | ✅ F2, F3, capitol CATUC, consultant CATUC | 2.05 F4+F6 · 2.09 link-uri bibliotecă (ST28) | Lun 30 · Mar 1 |
| 3 Engines | 3.07 | ✅ bake-off (klein implicit) + motoare de structură oprite până la credit | 3.08 PDF în RO (ST32, ST30, ST31, ST29) | Mar 1 |
| 4 Billing | 4.04 | ✅ plăți sigure ST14–17, ST19 | 4.05 poartă de invitație + promo + plafon de cost | Joi 3 |
| 5 Design + Drawings | 5.04 | 🟢 img2img automat (cameră, FOV, adâncime) | 5.05 audit export → spec PermitTracker + ST20 | W49 / W50 |
| 6 Marketing | 6.03 | ✅ (pauză până la review-ul juridic) | 6.04 după review | ~5 dec |
| 7 Partners | (aprilie) | 🔵 | 7.02 acord arhitect partener + DPA | Lun 30 |
| 8 Express | 8.01 | ✅ | 8.02 MVP | Mie 2 – Joi 3 |
| 9 Radar | 9.01 | ✅ | 9.02 raportul de vineri | Vin 4 |
| 10 Business | 10.01 | ✅ plan de afaceri v0 | 10.02 benchmark-uri + prețuri | Sâm 5 |

**Bug-uri din testul complet** (detaliu: `MCA-DOC-BETA-SMOKE-TEST.md` §5): 27 ✅ reparate (ST18 + ST21 verificate pe prod) · 5 🟡 parțial (ST04 MAIN, ST20 Chat 5, ST22 Chat 2, ST29 + ST31 Chat 3) · 3 ❌ deschise (ST28 Chat 2, ST30 + ST32 Chat 3). Run 2 parțial pe prod (27 nov seara, logat): reparațiile țin, ST36 (randarea nu rămânea salvată) + ST37 găsite și **reparate de 5.04 în aceeași seară (e8f7dd0), verificate pe prod**; ST38–ST39 (low) rămân pentru 5.05. Testul complet 2 rămâne Vin 4.

---

## 1. Arborele complet

```
ModulCA
├── 1 MAIN — orchestrare, decizii, legătura dintre chat-uri
│   ├── 1.01 Phase1-Reboot (19 nov) ✅
│   ├── 1.02 WeeklyPlan-W48-Sprint (23–27 nov) ✅  hartă, roadmap v2, NEXT, hook pre-push, SEO (527dbce, 9bbc764)
│   ├── 1.03 Smoke-Test-Full-Platform (26 nov) ✅  test pe prod, 35 BUG-ST (89f4ac1)
│   ├── 1.04 ST05-ST18-ST20-ST21 (27 nov) ✅  admin Bearer, /api/health pe module, hidratare, ghid login Google (5aed99c)
│   └── 1.05 Week-Wrap-W48-Plan-W49 (27 nov) 🟢 ← AICI
│
├── 2 Neufert — CATUC, consultant AI, text juridic
│   ├── 2.01 (vechi) Expand Neufert AI KB (19 nov) ✅
│   ├── 2.02 NotebookLM-Ingest (25 nov) ✅  răspunsuri Q1–Q10, tabel articole, DTAC→PAC (b3c7c6e)
│   ├── 2.03 F2-Content (26 nov) ✅  procesul de autorizare RO+EN (5533ec3)
│   ├── 2.06 Consultant-Claude-Fix (26 nov) ✅  Claude merge din nou, plan citit pe server (70db407, a9f5004)
│   ├── 2.04 F3-Content (26 nov) ✅  case modulare sub CATUC RO+EN, 43 articole (1cf7a76)
│   ├── 2.07 Q11-Q25-OCR-New-Chapter (26 nov) ✅  Clarificări transcrise, ordinele 975 + 1.022 confirmate, capitol CATUC (9eadfa0)
│   └── 2.08 Consultant-CATUC-Awareness (26 nov) ✅  ST13 + ST22 bannere (f015f08)
│       (2.05 = F4+F6, număr rezervat din planul inițial → Lun 30)
│
├── 3 Engines — randări, video, 3D, prezentare
│   ├── 3.01 (vechi) Research unified AI API (22 nov) ✅
│   ├── 3.02 Beta-Render-Readiness (26 nov) ✅  raport motoare (8c57cc6)
│   ├── 3.03 Free-Engines + SEC-02 + Products-PDF (26 nov) ✅  cloudflare-klein, Horde, kill switch (f3b2fd8, eb21bba, b691f8b)
│   ├── 3.04 Compare-Upscale-Auth (26 nov) ✅  (33f0682)
│   ├── 3.05 Paid-Tier-Render-Chain + PDF (26 nov) ✅  ST01, ST03, ST07, ST23–26 (2aaa637, 7d785df)
│   ├── 3.06 3D-Render-Bakeoff (26–27 nov) ✅  klein = implicit, ST34, Horde ControlNet (63b44d9, 108f532)
│   └── 3.07 Structure-Control-Engines (27 nov) ✅  Replicate depth/canny + Stability Structure, oprite până la credit (0a37698)
│
├── 4 Billing — planuri, Stripe, cote
│   ├── 4.01 (vechi) Prețuri, conturi (19 nov) ✅
│   ├── 4.02 Full-Account-Comp (26 nov) ✅  (34666e4)
│   ├── 4.03 Server-Tier + Per-User-Quota (26 nov) ✅  migrația 012 (379e148)
│   └── 4.04 Stripe-Security ST14–ST19 (27 nov) ✅  (62c33a2, bd3c7c8, d36ba7d, 432fbf1, 8e505c9, 714bcf8)
│
├── 5 Design + Drawings — wizard, design, teren, produse, salvare proiect + desene tehnice
│   ├── 5.00 (vechi, aprilie) Wall thickness ✅
│   ├── 5.01 Express-Interfaces + Save-Bugs (26 nov) ✅  (8723dc0, 59d713f, 2d15359)
│   ├── 5.02 Render-Page-Wave-2 (26 nov) ✅  ST27, ST03, ST29, ST02, ST05, ST33 (6d36b94 … b757f22)
│   ├── 5.03 Project-Save-Bugs (27 nov) ✅  ST06, ST08–12, ST31, ST35 (c449aaf … 1e8b4af)
│   └── 5.04 Img2Img-Camera-Depth (= „5.03-A”, 27 nov →) 🟢  vedere curentă, presetări cameră, FOV, hartă de adâncime
│
├── 6 Marketing — comunicare, brand, YouTube/social, NotebookLM
│   ├── 6.01 Strategy-Kickoff ✅  (330449f)
│   ├── 6.02 Pilot-Shorts-Prep ✅  (f8523df)   ⚠️ pornită de 6.01, nu de MAIN
│   └── 6.03 Pilot-Production ✅  (dbe90dc)   ⚠️ pornită de 6.02, nu de MAIN
│
├── 7 Partners — arhitectul partener, DPA, presă, utilizatori
│   └── 7.01 (vechi, aprilie) DPA outreach ✅   (handoff 23 nov scris de MAIN)
│
├── 8 Express — wizard automat + teste automate
│   └── 8.01 Wizard-Audit-Spec ✅  spec v1 (5c11e95)
│
├── 9 Radar — noutăți AI și unelte
│   └── 9.01 Setup-First-Sweep ✅  (e21db2d)
│
└── 10 Business — venituri, plan de afaceri, benchmark-uri
    └── 10.01 Revenue-Research-Business-Plan-v0 (26–27 nov) ✅  R1–R12, top 3, plan v0 (cc83be7)
```

---

## 2. Cum depind unele de altele (ce blochează ce)

| Lucru | Așteaptă după | Deblochează |
|---|---|---|
| 8.02 Express MVP | 5.01 interfețe ✅ · 4.03 cotă ✅ · 3.03 randări ✅ | Testele automate (golden briefs) |
| F3 (2.04) ✅ | F2 ✅ | Pachetul pentru arhitectul partener (7.02, Lun 30) |
| Pachetul Vlad (7.02) | F2 ✅ + F3 | Review juridic → publicarea conținutului CATUC (W49) |
| Pilot Shorts (Chat 6) | Review-ul lui Vlad pe F2/F3 | Canal YouTube (ian) |
| `/catuc-check` (Chat 2, W50) | Conținut CATUC publicat | Serviciul /autorizare |
| PermitTracker PDF (Chat 5, W50) | 5.02 audit export | Pachetul de notificare |
| Testul complet (1.03) ✅ | — | 35 BUG-ST → 26 reparate; testul 2 (Vin 4) confirmă pe prod |
| 5.04 img2img automat | 3.06 ✅ · 3.07 ✅ (`controlImage`) | Randări fidele vederii 3D pentru demo și beta · decizia €10 |
| 3.08 PDF în RO | 5.03 `computeProjectCost` ✅ | PDF pentru clienți români (ST32) |

---

## 3. Reguli de lucru (de acum)

1. **Numerotare**: `{chat}.{NN}.{Eticheta}_{subiect}_{YYYYMMDD}`. `NN` = următorul număr liber **din acel chat**. MAIN îl alege când pornește sesiunea. Sesiunile vechi, dinainte de reboot, contează ca `.01`.
   *(Pe 26 nov am folosit greșit `3.0x`, `4.0y` etc. când pornisem mai multe deodată; le-am redenumit: 3.02, 3.03, 4.02, 4.03.)*
2. **Doar MAIN pornește sesiuni.** O sesiune nu pornește altă sesiune; dacă vrea o continuare, scrie promptul următoarei sesiuni la final, iar MAIN decide când o pornește. (Marketing a pornit singur 6.02 și 6.03; de acum nu se mai face.) MAIN le pornește singur, după plan (harta §0 + roadmap), fără să mai întrebe. Îl întreabă pe Costin doar dacă sesiunea cheltuie bani, trimite ceva în afară (emailuri, postări), schimbă ceva juridic sau de preț, ori iese din planul aprobat. Seara și vinerea, Costin primește lista cu ce s-a pornit și ce a livrat.
3. **O sesiune = o sarcină.** Se termină cu: commit + push, un rând în jurnalul săptămânii, promptul pentru sesiunea următoare.
4. **Rapoartele vin automat la MAIN.** Costin nu trebuie să verifice fiecare chat: MAIN primește raportul, verifică commit-urile pe master și actualizează harta asta. Costin se uită doar la §0.
5. **Maximum 2 sesiuni în paralel, maximum 3 pe zi** (limita de utilizare și memoria PC-ului; în W48 cu 3–4 deodată am atins limita), niciodată două pe aceleași fișiere. Toate lucrează în același folder: o eroare `tsc` în fișierul altei sesiuni = așteaptă, nu repara.
6. **Arhivare**: o sesiune ✅ verificată de MAIN se poate arhiva; harta și commit-urile păstrează istoria.
7. **În bara laterală**: o sesiune nouă stă sub MAIN cât lucrează (așa raportul vine automat la MAIN). Când e ✅ și verificată, MAIN o detașează și o mută în grupul chat-ului ei („2 · Neufert” etc.). Sesiunile din aprilie stau în „0 · Arhivă”.
8. **MAIN nou la fiecare săptămână** (sau când contextul se umple): 1.02 → 1.03 → … Harta asta e memoria comună, nu chat-ul.

---

## 4. Prognoza: sesiunile care urmează (flexibilă)

Numărul final se dă la pornire (următorul liber din chat). Stare: **📅 planificată** (are dată) · **⏳ condiționată** (pornește când se îndeplinește condiția) · **💡 opțională** (doar dacă e nevoie) · **❌ renunțat**. MAIN revizuiește lista vinerea: adaugă, mută sau taie.

### 4.1 Propuse de chat-uri (din rapoartele lor)
| Sesiune | Propusă de | Ce face | Când | Stare |
|---|---|---|---|---|
| 2.04 F3 modular-prefab | 2.03 | Fișierul juridic critic | 26 nov | ✅ |
| 3.04 compare/upscale | 3.03 | Protecție pe cele 2 rute rămase | 26 nov | ✅ |
| 5.02 pagina de randare (val 2) | 1.03 | ST03, ST29, ST27, ST02, ST05 | 26 nov | ✅ |
| 3.06 bake-off 3D → randare | MAIN (Costin) | klein = implicit; eșecul de pe prod era promptul | 26–27 nov | ✅ |
| 3.07 motoare cu control de structură | MAIN (Costin) | Gata, oprite până la credit | 27 nov | ✅ |
| 4.04 securitate plăți | 1.03 | ST14–17, ST19, DB-01 | 27 nov | ✅ |
| 5.03 bug-uri proiect | 1.03 | ST06, ST08–12, ST31, ST35 | 27 nov | ✅ |
| Foaie de buget (limita de €50) | 9.01 | `MCA-DOC-BUDGET-2026.md` v0 | 27 nov (1.05) | ✅ |
| 5.04 (= 5.03-A) Image→Image automat | MAIN (Costin) | Vedere curentă, presetări cameră, persoana I + FOV, hartă de adâncime, prompt după vedere | 27–28 nov | 🟢 |
| 2.05 F4+F6 | 2.03 / plan | Urbanism PUG/PUZ + ghidul de autorizare | Lun 30 | 📅 |
| 2.09 verificare link-uri bibliotecă (ST28) | 1.03 | Books „Read” → 404; repară sau scoate link-urile | Mar 1 | 📅 (Sonnet) |
| 3.08 PDF în română (ST32) | 1.03 / 5.02 | PDF RO+EN, ST30 legende, ST31 costuri din `computeProjectCost`, ST29 header fallback | Mar 1 | 📅 |
| Randări → Supabase Storage (ST27 urmare) | MAIN (Costin, 27 nov) | Bucket + migrație + RLS; clientul salvează URL-ul; baza rămâne sub 500 MB pe Free | W50 | 📅 (5 + 3 + MAIN) |
| 3.09 capacitate gratuită + compresie GLB | 3.07 (NEXT-3) | Contor neuroni CF, Pollinations cu cheie, gltf-transform | W50 | 📅 |
| 4.05 poartă de invitație + promo + plafon de cost | 4.04 / 10.01 | Invitație beta, promo ancorat, plafon lunar 30% din preț, `ENGINE_LIMITS` | Joi 3 | 📅 |
| 5.05 audit export → spec PermitTracker | 5.01 | Audit read-only al exportului PDF + lista ST20 | Vin 4 | 📅 |
| 6.04 revizuire scripturi | 6.03 | Ajustează Shorts după review | După semnătura partenerului (~5 dec) | ⏳ |
| 8.02 Express MVP | 8.01 | Întrebări → proiect → 3 randări → prezentare | Mie 2 – Joi 3 | 📅 |
| 10.02 benchmark-uri + prețuri | 10.01 | Închide §7 din cercetare, costuri consultant per plan | Sâm 5 | 📅 (Sonnet) |
| Decizie €10 (Replicate / Stability / CF Paid / Leonardo Depth) | 3.06 / 3.07 | Doar dacă klein + Horde nu ajung pentru demo și beta | **până pe 10 dec** | ⏳ Costin |
| 9.02 raport săptămânal | 9.01 | Top 3 „merită făcut” | Vin 4, apoi vinerea | 📅 |
| Test Haiku 5.5 pentru traduceri | 9.01 | Înlocuiește DeepSeek | în 2.05 sau 2.10 | 📅 |

### 4.2 Din plan (roadmap §2), până la beta
| Sesiune | Ce | Când | Stare |
|---|---|---|---|
| 1.03 test complet platformă | → 35 BUG-ST | 26 nov | ✅ |
| 1.04 reparații MAIN | ST05, ST18 ghid, ST20, ST21 | 27 nov | ✅ |
| 1.05 închidere W48 | Hartă, plan W49, buget, lista lui Costin | 27 nov | ✅ |
| 2.07 capitol CATUC nou | Q11–Q25 + OCR | 26 nov | ✅ (pornit mai devreme) |
| 1.06 retrospectivă noiembrie | | Dum 29 | 📅 |
| 7.02 acord arhitect partener + DPA | Draft acord + emailuri furnizori + pachetul F2+F3 | Lun 30 | 📅 |
| 1.07 upgrade securitate B15 | sharp 0.34→0.35 | Mie 2 | ⏳ (OK Costin) |
| 1.08 test complet 2 | Retest ST-uri reparate, cont logat | Vin 4 dim. | 📅 |
| 1.09 închidere W49 | | Vin 4 seara | 📅 |
| 2.10 corecturi arhitect partener | | după review (~Sâm 5) | ⏳ |
| 2.11 publicare Faza 2 | `.new.md` → live | după semnătură | ⏳ |
| 7.03 email către cei 10 utilizatori | Chestionar + cont gratuit 1–3 luni | Sâm 5 | ⏳ (OK Costin înainte de trimitere) |
| 2.1x `/catuc-check` + Profile Engine | | W50 | 📅 |
| 5.0x PermitTracker 3 PDF-uri | | W50 (11–12 dec) | 📅 |
| 8.03 teste automate Playwright | 3 briefuri de test | W50 | 📅 |
| 4.0x insignă BETA + feedback | | W50 | 📅 |
| 3.0x walkthrough v0 | | W50 | 📅 |
| 2.1x Privacy + ToS beta (+ paragraf afiliere R5) | | W50 | 📅 |
| 7.0x lista de invitați + email | | până pe 10 dec | 📅 |
| 1.0x pre-flight beta | + export manual al bazei (backup) | 14 dec | 📅 |
| 1.0x accesare zilnică de sărbători | GitHub Actions → `/api/health`, 20 dec – 6 ian (Supabase Free nu intră în pauză) | până pe 19 dec | 📅 |
| 3.0x LTX video wire-up | | după beta, dacă avem buget | 💡 |

### 4.3 După beta (ianuarie)
Stripe live (4) · canal YouTube (6) · presă + Cornetu (7) · Blender pipeline (3) · DWG export (5) · Express prompt liber (8) · bibliotecă în batch cu Haiku (2) · triaj săptămânal feedback (1).

### 4.4 Chat-uri noi posibile (doar dacă apare nevoia)
| Chat candidat | Când l-am porni (declanșator) | Până atunci se ocupă |
|---|---|---|
| **11 Support / Feedback beta** | Dacă feedback-ul de la beta depășește ~1 oră/zi de triaj | 1 MAIN |
| **12 SEO / Analytics** | Când pornim conținut regulat (ian) și vrem rapoarte săptămânale GA4 / Search Console | 1 MAIN + 6 Marketing |
| **13 Marketplace & Parteneri** (teren, constructori, producători, finanțare, energie) | Când avem primii parteneri concreți pentru venituri R6–R10 ([[MCA-STRAT-REVENUE-STREAMS-2026-11-26]]) | 7 Partners + 5 Design |
| **14 Mobile / AR** | Dacă după lansare vrem aplicație sau „casa pe terenul tău” în AR | 3 Engines |

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
