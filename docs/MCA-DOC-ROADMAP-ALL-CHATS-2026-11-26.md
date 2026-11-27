# MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26: planul complet până la lansare

**Ce e**: planul. Ce mai avem de făcut, pe faze, pe săptămâni și pe grupuri (chat-uri).
**Pereche cu**: [[MCA-DOC-SESSION-MAP]], adică starea: ce rulează acum, ce s-a livrat.
**Înlocuiește**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] (păstrat ca istoric)
**Owner**: MAIN. Se actualizează vinerea, la închiderea săptămânii. **Ultima actualizare**: 2026-11-27 (1.05, închiderea W48).

> Costin citește doar 2 documente: **harta** (unde suntem) și **planul ăsta** (unde mergem). Restul sunt referințe pentru chat-uri.

---

## 1. Fazele și „poarta” fiecăreia

| Faza | Perioada | Ce înseamnă | Poarta (gata când…) | Stare |
|---|---|---|---|---|
| 1 Reboot | 19–24 nov | Reorganizare, chat-uri, reguli | Workflow + naming + roadmap | ✅ |
| 2 Conținut CATUC | 25 nov – 5 dec | Bibliotecă juridică nouă (F1–F10) pe legea 169/2026 | Vlad semnează F2+F3 · toate `.new.md` publicate · consultantul răspunde cu CATUC | 🟢 F2 ✅ F3 ✅ capitol CATUC ✅ · F4+F6 Lun 30 · review partener |
| **Sprint** platformă | 26–27 nov | Platformă funcțională + securitate | Test complet trecut, bug-uri cu responsabil | ✅ test 1 (35 BUG-ST, 26 reparate) · test 2 Vin 4 |
| 3 Platformă CATUC | 6–13 dec | `/catuc-check` (`/autorizare`), Profile Engine, PermitTracker PDF, Express MVP | Checker + 3 PDF-uri semnate de Vlad · Express merge pe 3 briefuri | 🔵 |
| 4 Pregătire beta | 14–15 dec | Verificări finale, invitații | ops:check verde · CI verde · GDPR (DPA) · acord Vlad semnat · listă 10–20 invitați | 🔵 |
| **5 Beta (doar cu invitație)** | **15 dec** – 15 ian | 10–20 utilizatori, feedback, reparații | Go/No-Go pe 15 ian | 🔵 |
| 6 Pre-lansare | 16–31 ian | Stripe live, presă, canal YouTube, prețuri finale | Plăți reale testate · conținut de lansare gata | 🔵 |
| **7 Lansare publică** | **1 feb 2027** | | | 🔵 |

Pauză de sărbători: 23 dec – 5 ian, doar reparații urgente.

---

## 2. Pe săptămâni

### W48 (rest): vineri 27 – duminică 29 nov — ✅ închis (detaliu: W48 §9)
| Zi | Ce s-a întâmplat |
|---|---|
| Vin 27 | ✅ 4.04 plăți · 5.03 bug-uri proiect · 3.06 bake-off · 3.07 motoare de structură · 10.01 plan de afaceri · 1.04 reparații MAIN · **1.05 închiderea W48** |
| Sâm 28 | 5.04 img2img automat (🟢 pornit vineri) |
| Dum 29 | **1.06** retrospectiva lunii noiembrie + bugetul lunar |

### W49: 30 nov – 6 dec (final Faza 2, start Faza 3) — detaliu zi cu zi: [[MCA-DOC-WEEK-2026-W49-SCHEDULE]]
| Zi | Sesiuni (max 3/zi, max 2 deodată) | Costin |
|---|---|---|
| Lun 30 | **2.05** F4+F6 · **7.02** acord arhitect partener + DPA + pachetul F2+F3 | Verificare pe site · brand Google · aprobi DPA |
| Mar 1 | **3.08** PDF în RO (ST32, ST30, ST31, ST29) · **2.09** link-uri bibliotecă (ST28) | Citești F4+F6 |
| Mie 2 | **8.02** Express MVP (1) · **1.07** B15 upgrade sharp | OK B15 · **decizia €10** (termen 10 dec) |
| Joi 3 | **8.02** Express MVP (2) · **4.05** invitație + promo + plafon de cost | Conturi de afiliat |
| Vin 4 | **1.08** test complet 2 · **9.02** Radar · **1.09** închiderea W49 | Login în panoul de browser pentru test |
| Sâm 5 | **10.02** benchmark-uri · **2.10** corecturi partener (⏳ după review) | Aprobi emailul către utilizatori |
| Dum 6 | **7.03** email către cei 10 utilizatori (draft) · **2.11** publicare Faza 2 (⏳ după semnătură) | Lista invitaților (termen 10 dec) |

### W50: 7–13 dec (Faza 3)
| Ce | Grup |
|---|---|
| `/catuc-check` + Profile Engine (structured outputs, citări de articole) | 2 Neufert |
| 5.05 audit export (dacă nu s-a făcut în W49) → PermitTracker: 3 PDF-uri pentru notificare (art. 294) + zip; la arhitectul partener pe 11 dec | 5 Design + Drawings |
| Express: 3 briefuri de test → teste automate Playwright | 8 Express |
| Insignă BETA + widget de feedback | 4 Billing |
| **Randările din rândul proiectului → Supabase Storage** (bucket-ul `renders` **există deja** în Supabase, public, folosit de server pentru cache și galerie, 0 politici = doar serverul scrie — verificat de Costin 27 nov; cel mai simplu: upload prin rută de server, fără politici noi pe client; clientul salvează URL, nu imaginea): ține baza sub 500 MB pe Supabase Free | 5 Design (client) + 3 Engines (bucket) + MAIN (migrație) |
| Video walkthrough v0 (înregistrare AutoTour) · 3.09 capacitate gratuită + compresie modele 3D (gltf-transform) | 3 Engines |
| Privacy + ToS cu clauza de beta | 2 Neufert |
| Lista de invitați (10–20) + email de invitație | 7 Partners + Costin |

### W51: 14–20 dec (Faza 4 → **Beta 15 dec**)
| Ce | Grup |
|---|---|
| Pre-flight: ops:check, CI, secrete, Sentry, test complet, **export manual al bazei Supabase (backup)** | 1 MAIN |
| Accesare automată zilnică (GitHub Actions → `/api/health`, care atinge baza) de pe 20 dec până pe 6 ian, ca proiectul Free să nu intre în pauză | 1 MAIN |
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
| **1 MAIN** | Plan, hartă, decizii, pornirea sesiunilor, test complet, închideri săptămânale, SEO, securitate transversală | 1.06 retro nov · 1.07 B15 · 1.08 test 2 · 1.09 închidere W49 · pre-flight beta · buget lunar | Cod de specialitate |
| **2 Neufert** | Conținut CATUC, consultant AI, text juridic (Privacy/ToS), `/catuc-check` | 2.05 F4+F6 · 2.09 link-uri (ST28) · 2.10 corecturi partener · 2.11 publicare · checker (W50) · Privacy/ToS + paragraf afiliere | Randări, prețuri |
| **3 Engines** | Motoare de randare, video, 3D, prezentare/slide-uri | 3.08 PDF în RO (ST32, ST30, ST31, ST29) · 3.09 capacitate gratuită + GLB · walkthrough v0 · Blender (ian) | Consultant, prețuri |
| **4 Billing** | Planuri, Stripe, cote, conturi comp, insignă beta + feedback | 4.05 invitație + promo + plafon lunar de cost (30% din preț) · insignă/feedback (W50) · Stripe live (ian) | Cod de motoare |
| **5 Design + Drawings** | Wizard, design, teren, produse, salvare proiect, desene tehnice, PermitTracker | 5.04 img2img automat (🟢) · 5.05 audit export + ST20 · PermitTracker (W50) | Prezentarea (Chat 3) |
| **6 Marketing** | Brand, conținut, YouTube, social, NotebookLM | ⏸ pauză până după review-ul lui Vlad · pilot Shorts (dec) · canal (ian) | Cod, text juridic |
| **7 Partners** | Vlad, DPA, utilizatori, presă, parteneri | 7.02 acord arhitect partener + DPA · 7.03 email utilizatori · invitații beta · programe de afiliere (R5) · presă (ian) | Cod |
| **8 Express** | Wizard automat + teste automate | 8.02 MVP · teste Playwright (W50) · prompt liber (ian) | Interioarele altor module |
| **10 Business** | Venituri, plan de afaceri, benchmark-uri, prețuri | 10.02 benchmark-uri + prețuri (Sâm 5) · revizuirea planului după beta | Cod |
| **9 Radar** | Noutăți AI și unelte, ziua de upgrade lunară | 9.02 raport Vin 4 · sweep 7 dec | Cod, decizii |

---

## 4. Lista lui Costin (tot ce depinde doar de tine)

**Lista completă pe W49, cu timp și pași: [[MCA-DOC-WEEK-2026-W49-SCHEDULE]] §3** (o singură listă, actualizată vinerea). Termenele mari:

| Când | Ce |
|---|---|
| Lun 30 | Verificare pe site · brand Google (ST18) · costurile reale în [[MCA-DOC-BUDGET-2026]] |
| până pe 10 dec | **Decizia €10 pe motoare** · lista de invitați beta |
| când răspunde | Apelul cu arhitectul partener + pachetul F2+F3 |
| 11–13 dec | Semnătura arhitectului partener pe PDF-uri |
| 15 dec | Trimiți invitațiile |

~~NotebookLM Q11–Q25~~: nu mai e nevoie (Chat 2 a răspuns din textul legii, 2.07).

---

## 5. Cum lucrăm mai eficient (de acum)

1. **Două documente pentru Costin**: harta (stare) + planul ăsta. Nimic altceva de urmărit.
2. **Coada de sesiuni**: MAIN pornește sesiunile din §2 în ordine, max 2 pe zi (dimineață + după-amiază), fără să mai întrebe, cu excepțiile din hartă §3.
3. **Fișier „NEXT” per chat**: fiecare sesiune scrie la final promptul următoarei sesiuni în `docs/sessions/NEXT-{chat}.md`. MAIN pornește direct din el, fără copy-paste și fără context pierdut.
4. **Testul complet ca poartă**: înainte de fiecare lot mare de deploy (și obligatoriu înainte de beta). Din W50 îl face automat Express (briefurile de test).
5. **Model potrivit pe sarcină**: Opus pentru juridic, arhitectură și cod complex; Sonnet pentru Radar, documente și sarcini mecanice; economisește limita de utilizare.
6. **Verificare TypeScript înainte de push** (instalată) + CI pe GitHub: un commit stricat nu mai blochează site-ul ore întregi.
7. **Vinerea**: închidere în 3 părți (ce s-a făcut / ce a alunecat / ce urmează), sesiunile terminate mutate în grupuri, harta și planul actualizate, **spațiul din baza Supabase notat în [[MCA-DOC-BUDGET-2026]]** (Free = 500 MB; la ~400 MB → Pro).
8. **Bugetul**: [[MCA-DOC-BUDGET-2026]] se actualizează la fiecare sfârșit de lună; costurile fixe cunoscute sunt €38 (Supabase e pe Free, confirmat de Costin 27 nov); Vercel Pro din ianuarie le duce peste €50 → decizie Costin până la lansare.
9. **Riscuri urmărite** (top 5): arhitectul partener nu răspunde la timp (planul B: alt arhitect din rețeaua OAR) · limita de utilizare (max 2 sesiuni) · un singur motor gratuit stabil (avem acum 3) · conținut juridic greșit (poarta Vlad + citări) · PC-ul rămâne fără memorie (Nahimic).
