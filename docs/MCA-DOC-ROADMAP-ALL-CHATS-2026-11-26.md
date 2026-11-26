# MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26: planul complet până la lansare

**Ce e**: planul. Ce mai avem de făcut, pe faze, pe săptămâni și pe grupuri (chat-uri).
**Pereche cu**: [[MCA-DOC-SESSION-MAP]], adică starea: ce rulează acum, ce s-a livrat.
**Înlocuiește**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] (păstrat ca istoric)
**Owner**: MAIN. Se actualizează vinerea, la închiderea săptămânii.

> Costin citește doar 2 documente: **harta** (unde suntem) și **planul ăsta** (unde mergem). Restul sunt referințe pentru chat-uri.

---

## 1. Fazele și „poarta” fiecăreia

| Faza | Perioada | Ce înseamnă | Poarta (gata când…) | Stare |
|---|---|---|---|---|
| 1 Reboot | 19–24 nov | Reorganizare, chat-uri, reguli | Workflow + naming + roadmap | ✅ |
| 2 Conținut CATUC | 25 nov – 5 dec | Bibliotecă juridică nouă (F1–F10) pe legea 169/2026 | Vlad semnează F2+F3 · toate `.new.md` publicate · consultantul răspunde cu CATUC | 🟢 F2 ✅, F3 vineri |
| **Sprint** platformă | 26–27 nov | Platformă funcțională + securitate | Test complet trecut, bug-uri cu responsabil | 🟢 reparațiile ✅, testul vineri |
| 3 Platformă CATUC | 6–13 dec | `/catuc-check` (`/autorizare`), Profile Engine, PermitTracker PDF, Express MVP | Checker + 3 PDF-uri semnate de Vlad · Express merge pe 3 briefuri | 🔵 |
| 4 Pregătire beta | 14–15 dec | Verificări finale, invitații | ops:check verde · CI verde · GDPR (DPA) · acord Vlad semnat · listă 10–20 invitați | 🔵 |
| **5 Beta (doar cu invitație)** | **15 dec** – 15 ian | 10–20 utilizatori, feedback, reparații | Go/No-Go pe 15 ian | 🔵 |
| 6 Pre-lansare | 16–31 ian | Stripe live, presă, canal YouTube, prețuri finale | Plăți reale testate · conținut de lansare gata | 🔵 |
| **7 Lansare publică** | **1 feb 2027** | | | 🔵 |

Pauză de sărbători: 23 dec – 5 ian, doar reparații urgente.

---

## 2. Pe săptămâni

### W48 (rest): vineri 27 – duminică 29 nov
| Zi | Sesiuni (max 2/zi) | Costin |
|---|---|---|
| **Vin 27** | **1.03** test complet al platformei (browser, contul Constructor) → lista BUG-xx · **2.04 F3** (critic, Claude) | După test: treci prin site cu ochi de om (~1 h) · seara citești F3 · verifici sitemap-ul în Search Console |
| Vin 27 seara | **1.04** închiderea săptămânii: harta, planul ăsta, raportul Radar, lista de bug-uri împărțită pe chat-uri | 10 min: citești rezumatul |
| Sâm 28 | **3.04** `/compare` + `/upscale` protejate + primele bug-uri de randare din test · pachetul pentru Vlad (F2+F3) | Trimiți pachetul la Vlad (dacă a răspuns) |
| Dum 29 | **1.05** retrospectiva lunii noiembrie | Opțional, 10 min |

### W49: 30 nov – 6 dec (final Faza 2, start Faza 3)
| Zi | Sesiuni | Costin |
|---|---|---|
| Lun 30 | **2.05** F4+F6 · **7.02** acord Vlad + emailuri DPA (draft) | NotebookLM Q11–Q25 (~1 h) · aprobi emailurile DPA |
| Mar 1 | **2.07** capitolul nou CATUC + clarificări (din Q11–Q25) · **5.02** audit export PDF → spec PermitTracker | Citești F4+F6 |
| Mie 2 | **8.02** Express MVP (partea 1) · **1.0x** B15 upgrade de securitate (sharp) | OK pentru upgrade |
| Joi 3 | **8.02** Express MVP (partea 2) · **2.08** corecturile lui Vlad | — |
| Vin 4 | **2.09** publicarea conținutului Faza 2 (după semnătura lui Vlad) · **1.0x** închiderea W49 | — |
| Sâm 5 – Dum 6 | **4.04** promo beta cap-coadă + cele 8 probleme minore · **7.03** email către cei 10 utilizatori (draft) | Aprobi emailul |

### W50: 7–13 dec (Faza 3)
| Ce | Grup |
|---|---|
| `/catuc-check` + Profile Engine (structured outputs, citări de articole) | 2 Neufert |
| PermitTracker: 3 PDF-uri pentru notificare (art. 294) + zip; la Vlad pe 11 dec | 5 Design + Drawings |
| Express: 3 briefuri de test → teste automate Playwright | 8 Express |
| Insignă BETA + widget de feedback | 4 Billing |
| Video walkthrough v0 (înregistrare AutoTour) · compresie modele 3D (gltf-transform) | 3 Engines |
| Privacy + ToS cu clauza de beta | 2 Neufert |
| Lista de invitați (10–20) + email de invitație | 7 Partners + Costin |

### W51: 14–20 dec (Faza 4 → **Beta 15 dec**)
| Ce | Grup |
|---|---|
| Pre-flight: ops:check, CI, secrete, Sentry, test complet | 1 MAIN |
| Trimiterea invitațiilor, monitorizare primele 48 h | 1 MAIN + Costin |
| Reparații rapide din feedback | grupul responsabil |

### Ianuarie (Faza 5 → 6)
| Ce | Grup |
|---|---|
| Triaj feedback beta, săptămânal | 1 MAIN |
| Go/No-Go 15 ian | 1 MAIN + Costin |
| Stripe TEST → LIVE, CUI, bancă | 4 Billing |
| Canal YouTube + Shorts (după review Vlad), lead magnet, quiz | 6 Marketing |
| Presă (3 jurnaliști), povestea Cornetu | 7 Partners |
| Blender pipeline, postprocessing 3, video AI (dacă avem venit) | 3 Engines |
| Express: prompt liber, mai multe randări | 8 Express |
| Haiku 5.5 pentru traduceri, batch pentru bibliotecă | 2 Neufert |

---

## 3. Pe grupuri: de ce se ocupă fiecare și ce are de făcut

| Grup | Se ocupă de | Urmează (în ordine) | Nu se atinge de |
|---|---|---|---|
| **1 MAIN** | Plan, hartă, decizii, pornirea sesiunilor, test complet, închideri săptămânale, SEO, securitate transversală | 1.03 test · 1.04 închidere · 1.05 retro · B15 upgrade · pre-flight beta | Cod de specialitate |
| **2 Neufert** | Conținut CATUC, consultant AI, text juridic (Privacy/ToS), `/catuc-check` | 2.04 F3 · 2.05 F4+F6 · 2.07 capitol nou · 2.08 corecturi Vlad · 2.09 publicare · checker (W50) | Randări, prețuri |
| **3 Engines** | Motoare de randare, video, 3D, prezentare/slide-uri | 3.04 compare/upscale + bug-uri · compresie GLB · walkthrough v0 · Blender (ian) | Consultant, prețuri |
| **4 Billing** | Planuri, Stripe, cote, conturi comp, insignă beta + feedback | 4.04 promo beta + 8 probleme · insignă/feedback (W50) · Stripe live (ian) | Cod de motoare |
| **5 Design + Drawings** | Wizard, design, teren, produse, salvare proiect, desene tehnice, PermitTracker | 5.02 audit export · PermitTracker (W50) · bug-uri din test | Prezentarea (Chat 3) |
| **6 Marketing** | Brand, conținut, YouTube, social, NotebookLM | ⏸ pauză până după review-ul lui Vlad · pilot Shorts (dec) · canal (ian) | Cod, text juridic |
| **7 Partners** | Vlad, DPA, utilizatori, presă, parteneri | 7.02 acord Vlad + DPA · 7.03 email utilizatori · invitații beta · presă (ian) | Cod |
| **8 Express** | Wizard automat + teste automate | 8.02 MVP · teste Playwright (W50) · prompt liber (ian) | Interioarele altor module |
| **9 Radar** | Noutăți AI și unelte, ziua de upgrade lunară | Raport vinerea · sweep 7 dec (prima luni din dec) | Cod, decizii |

---

## 4. Lista lui Costin (tot ce depinde doar de tine)

| Când | Ce | Timp |
|---|---|---|
| Vin 27 | Treci prin site după testul MAIN (cum arată, randări) | 1 h |
| Vin 27 | Citești F3 · verifici sitemap-ul (Search Console → Sitemaps = Success?) | 40 min |
| Când răspunde | Apel cu Vlad (întrebările din handoff-ul Chat 7) | 45 min |
| Lun 30 | NotebookLM Q11–Q25 | 1 h |
| W49 | Aprobi: emailurile DPA, emailul către utilizatori, upgrade-ul B15 | 15 min |
| când ai timp | Rezervi conturile @modulca pe rețelele sociale | 20 min |
| până pe 10 dec | Lista de invitați beta (nume + email, fișier privat) | 1 h |
| 11–13 dec | Urmărești semnătura lui Vlad pe PDF-uri | — |
| 15 dec | Trimiți invitațiile | 30 min |

---

## 5. Cum lucrăm mai eficient (de acum)

1. **Două documente pentru Costin**: harta (stare) + planul ăsta. Nimic altceva de urmărit.
2. **Coada de sesiuni**: MAIN pornește sesiunile din §2 în ordine, max 2 pe zi (dimineață + după-amiază), fără să mai întrebe, cu excepțiile din hartă §3.
3. **Fișier „NEXT” per chat**: fiecare sesiune scrie la final promptul următoarei sesiuni în `docs/sessions/NEXT-{chat}.md`. MAIN pornește direct din el, fără copy-paste și fără context pierdut.
4. **Testul complet ca poartă**: înainte de fiecare lot mare de deploy (și obligatoriu înainte de beta). Din W50 îl face automat Express (briefurile de test).
5. **Model potrivit pe sarcină**: Opus pentru juridic, arhitectură și cod complex; Sonnet pentru Radar, documente și sarcini mecanice; economisește limita de utilizare.
6. **Verificare TypeScript înainte de push** (instalată) + CI pe GitHub: un commit stricat nu mai blochează site-ul ore întregi.
7. **Vinerea**: închidere în 3 părți (ce s-a făcut / ce a alunecat / ce urmează), sesiunile terminate mutate în grupuri, harta și planul actualizate.
8. **Riscuri urmărite** (top 5): Vlad nu răspunde la timp (planul B: alt arhitect din rețeaua OAR) · limita de utilizare (max 2 sesiuni) · un singur motor gratuit stabil (avem acum 3) · conținut juridic greșit (poarta Vlad + citări) · PC-ul rămâne fără memorie (Nahimic).
