# Plan săptămânal — W49 (Lun 30 nov – Dum 6 dec 2026)

**Scris de**: 1.05.MAIN_Week-Wrap-W48-Plan-W49_20261127 (vineri seara)
**Faza**: finalul Fazei 2 (conținut CATUC) + start Faza 3 (platformă CATUC, Express). Beta pe invitație: **15 dec** (peste 2 săptămâni).
**Intrări**: [[MCA-DOC-WEEK-2026-W48-SCHEDULE]] §9 (închiderea W48) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26]] §2 W49 · [[MCA-DOC-SESSION-MAP]] §4 · [[MCA-DOC-BETA-SMOKE-TEST]] §5 · `docs/sessions/NEXT-*.md`
**Verificare dată ↔ zi**: 30 nov 2026 = luni ✅ · 6 dec = duminică ✅ · 10 dec (poarta €10) = joi.

**Reguli pentru săptămâna asta** (din lecțiile W48): max **2 sesiuni deodată, max 3 pe zi** · sesiunile mecanice (link-uri, benchmark-uri, Radar) pe Sonnet · fiecare raport spune explicit ce e „neverificat pe prod” · tabele mari: editare pe un singur rând, nu `sed` pe rânduri lipite.

---

## 1. Obiectivele săptămânii

1. **Faza 2 închisă pe conținut**: F4 + F6 scrise; pachetul F2+F3(+F4/F6) la arhitectul partener; acordul + DPA în draft.
2. **Express MVP** merge cap-coadă (8.02) — baza testelor automate din W50.
3. **Testul complet 2** pe prod, cu contul logat: confirmă cele 26 de reparații din W48.
4. **Decizii luate**: €10 pe motoare (până pe 10 dec), poarta de upscale, brandul Google trimis la verificare.

---

## 2. Zi cu zi

| Zi | Sesiuni (max 3, max 2 deodată) | Model | Costin |
|---|---|---|---|
| **Lun 30** | **2.05** F4+F6 (urbanism PUG/PUZ + ghidul de autorizare; NEXT-2) · **7.02** acord arhitect partener + emailuri DPA (draft) + pachetul F2+F3 · (5.04 img2img se termină, dacă n-a terminat în weekend) | Opus · Opus | Verificare pe site (§3 #1) · Google branding (§3 #4) · aprobi emailurile DPA |
| **Lun 30** (în plus) | **5.05** începe cu **ST36** (randarea nu rămâne salvată, high) + ST37–ST39, apoi auditul PermitTracker | Opus | — |
| **Mar 1** | **3.08** PDF în română: ST32 (RO+EN) + ST30 legende + ST31 costuri din `computeProjectCost` + ST29 header `X-AI-Fallback-From` · **2.09** verificarea link-urilor din bibliotecă (ST28) | Opus · Sonnet | Citești F4+F6 (seara) |
| **Mie 2** | **8.02** Express MVP, partea 1 · **1.07** upgrade securitate B15 (sharp 0.34→0.35) | Opus · Sonnet | OK pentru B15 · **decizia €10** (de preferat azi, după verificarea klein) |
| **Joi 3** | **8.02** Express MVP, partea 2 · **4.05** poartă de invitație + promo ancorat + plafon lunar de cost (30% din preț) + `ENGINE_LIMITS` după decizia €10 | Opus · Opus | Conturi de afiliat Profitshare + 2Performant (§3 #8) |
| **Vin 4** | **1.08** test complet 2 (dimineața, după deploy-uri; cont logat, retest ST-uri) · **9.02** raport Radar · seara **1.09** închiderea W49 (+ prima verificare a spațiului din baza Supabase) | Opus · Sonnet · Opus | La login, te autentifici tu în panoul de browser (~5 min) · 10 min rezumatul |
| **Sâm 5** | **3.10** audit 3D (decis de Costin 27 nov): ce arată rău pe fiecare tip de modul (neclar, puțin detaliu, mobilier suprapus), inventarul celor 20 GLB, legătura cu Blender verificată pe o copie · **2.10** corecturile arhitectului partener (⏳ doar dacă a trimis review-ul) | Opus · Opus | Aprobi emailul către cei 10 utilizatori (7.03) |
| **Dum 6** | **3.11** Blender pipeline v0: un modul (dormitorul) refăcut în Blender (materiale, texturi, muchii teșite, lumină coaptă) → GLB comprimat → comparat cu cel vechi · **7.03** email către cei 10 utilizatori (draft) · **2.11** publicare Faza 2 (⏳ după semnătură) | Opus · Sonnet · Opus | Ești lângă PC pentru Blender (conectorul rulează local) |

**Rezervă**: dacă 8.02 nu se termină joi, partea 3 intră sâmbătă în locul lui 10.02 (care se mută în W50). Dacă arhitectul partener nu răspunde până miercuri → planul B (alt arhitect din rețeaua OAR), Chat 7.

**Supabase Free (decis de Costin 27 nov)**: rămânem pe Free; Pro ($25/lună) doar peste ~400 utilizatori sau ~400 MB în bază. Gărzile: (1) export manual al bazei înainte de 15 dec, (2) verificarea spațiului în fiecare închidere de vineri, (3) **randările mutate din rândul proiectului în Supabase Storage în W50**, nu după beta, (4) o accesare automată pe zi de sărbători, ca proiectul să nu intre în pauză.

**Mutat în W50**: 10.02 benchmark-uri (loc pentru 3D; NEXT-10 zice oricum „după primele răspunsuri beta”) · 3.09 capacitate gratuită + compresie GLB (NEXT-3, task B) · 5.05 audit export → spec PermitTracker (dacă vineri nu e loc) · `/catuc-check` · insignă BETA.

---

## 3. Lista lui Costin (tot ce poți face doar tu)

| # | Ce | Când | Timp | Cum / unde |
|---|---|---|---|---|
| ~~1~~ | ✅ **Făcut (27 nov seara, cu MAIN)**: run 2 în `MCA-DOC-BETA-SMOKE-TEST.md` §6 — totul OK în afară de **ST36** (randarea nu rămâne salvată). ~~Verifici reparațiile pe site~~ (logat): randare „3D + Text” (trebuie „Randat cu cloudflare-klein”), PDF nou (pagini, randări curate), consultantul la o întrebare CATUC, `/pricing` + „Manage” pe contul comp | Lun 30 | 45 min | modulca.eu; scrii în chat-ul MAIN ce nu merge |
| 2 | Te uiți pe contact sheet-ul bake-off (klein vs randările vechi din PDF #8) | Lun 30 | 10 min | `docs/research/render-bakeoff-2026-11/index.html` |
| 3 | Citești F3 (+ nota CC1 / art. 440(3) care poate schimba F2) | până Lun 30 | 40 min | `src/knowledge/06-regulations/RO/modular-prefab-regulations.new.md` |
| ~~4~~ | ✅ **Făcut (27 nov)**: brand verificat de Google, ecranul arată „ModulCA” + logo. ~~Login Google cu numele ModulCA~~ (ST18): brand în Google Cloud Console, trimis la verificare (2–3 zile lucrătoare la Google) | **Lun 30** (ca să fie aprobat înainte de 15 dec) | 15 min + așteptare | `docs/MCA-DOC-GOOGLE-LOGIN-BRANDING.md` varianta A (gratuită) |
| ~~5~~ | ✅ **Făcut (27 nov)**: ~~Stripe, textele produselor~~, toate cele 6 produse TEST (lunar + anual); la LIVE (ian) se refac la fel | — | — | Stripe → Product catalog; textele exacte în `docs/sessions/NEXT-4.md` |
| ~~6~~ | ✅ **Făcut (27 nov)**: `CF_KLEIN_MAX_SIDE=768` (Production+Preview) și `POLLINATIONS_API_KEY` (Production, cheie „Quest balance only” = €0) în Vercel, redeploy, `/api/health` = ok | — | — | — |
| 7 | **Decizia €10 pe motoare**: (a) nimic, rămânem pe klein + Horde gratuit · (b) Replicate €10 ≈ 430 randări depth/canny · (c) Stability €10 ≈ 220 · (d) Cloudflare Workers Paid (≈ $5/lună + neuroni peste plafon, preț de verificat) · (e) OK pentru Leonardo Depth din creditul prepaid rămas (~240 randări, €0 nou) | **până pe 10 dec** (ideal Mie 2) | 10 min | Recomandarea MAIN: **(e) acum** (bani deja plătiți) + **(a)**; (b) doar dacă testul 2 arată randări nefidele |
| 8 | **Upscale: rămâne doar pe cotă, sau doar pentru planurile plătite?** | Mie 2 | 2 min | Recomandarea MAIN: doar pe cotă în beta (toți sunt Premium promo), poartă de plan la lansare |
| 9 | Conturi de afiliat **Profitshare** și **2Performant** (gratuite) + citești comisioanele reale | Joi 3 | 30 min | Sursa de venit R5; cifrele merg la 10.02 |
| 10 | **Apel cu arhitectul partener** + trimiți pachetul F2+F3 (pregătit de 7.02) | când răspunde (ideal Lun 30 – Mar 1) | 45 min | Întrebările din handoff-ul Chat 7 + lista `research/2026-11-26-catuc-partner-review-list.md` |
| 11 | Aprobări: emailurile DPA (Lun 30) · upgrade B15 (Mie 2) · emailul către utilizatori (Sâm 5) | W49 | 15 min total | un „OK” în chat-ul MAIN |
| ~~11b~~ | ✅ **OK B15 dat de Costin (27 nov seara)**: upgrade sharp 0.34.5 → 0.35.5 (1 high + 5 moderate vulnerabilități) → sesiunea 1.07, după 4.05/5.05 | — | — | — |
| ~~11c~~ | ✅ **SQL 013 aplicat pe prod (28 nov, MAIN 1.05 din SQL Editor, cu OK Costin)**: tabel `beta_invites` + coloana `profiles.beta_invited_at` + garda 011 extinsă; verificare true/true/true. Pas 5 + 4 (Costin: „păstrează promo-ul”): cele 10 conturi free existente sunt pe listă cu invited_at = 15 dec 2026, promo activ (view `beta_promo_users` = 10). Notă: până pe 15 dec zilele rămase arată > 90 (ancora e în viitor) | — | — | — |
| ~~12~~ | ✅ **Făcut (27 nov)**: sitemap-ul (240 URL, 200 OK) retrimis în Search Console (cont `uiiacgsauto`); „Couldn’t fetch” era statusul vechi. Recitim vineri 4 dec. Contul `costin.telefon` e acum și el proprietar (DNS) | — | — | — |
| 13 | Rezervi conturile **@modulca** pe rețelele sociale | când ai timp, până pe 13 dec | 20 min | Instagram, TikTok, YouTube, Facebook, LinkedIn |
| ~~14~~ | ✅ **Făcut (27 nov)**: costuri fixe confirmate ≈ €40/lună, sub plafon (bugetul §1) | — | — | — |
| ~~16~~ | ✅ **Făcut (27 nov)**: ~~spațiul din baza Supabase~~ = 50 / 500 MB, detalii în bugetul §6 | — | — | — |
| ~~17~~ | ✅ **Blender gata (28 nov)**: driver NVIDIA 621.40 + OptiX pe RTX 3060 · add-on oficial Blender Lab MCP 1.0.3 în Blender 5.3, server `localhost:9876`, Auto Start · **plan B ales de Costin**: serverul oficial instalat cu `uv tool install git+https://projects.blender.org/lab/blender_mcp.git#subdirectory=mcp` → `%USERPROFILE%.localinlender-mcp.exe` (pywin32 312 s-a instalat fără eroare) · `.mcp.json` local în proiect (ignorat de git) · rămas: prima sesiune Claude Code (3.10) aprobă serverul „blender” și testează „listează obiectele din scenă”. Extensia din aplicația Claude nu mai e necesară; dacă o activezi, ține activ un singur server „blender” | — | — | — |
| 15 | Lista de invitați beta (10–20, nume + email, fișier privat, nu în repo) | până pe 10 dec | 1 h | — |
| ~~—~~ | ~~NotebookLM Q11–Q25~~ | — | — | **Nu mai e nevoie**: Q11–Q25 au fost răspunse și verificate de Chat 2 (2.07) din textul legii |

---

## 4. Dependențe și riscuri

| Risc | Efect | Ce facem |
|---|---|---|
| Arhitectul partener nu răspunde până miercuri | Faza 2 nu se publică; Shorts blocate | Planul B: alt arhitect OAR (Chat 7); conținutul rămâne `.new.md`, consultantul are deja faptele CATUC |
| Cota Cloudflare (10k neuroni/zi) se termină în test sau demo | Randări 503 până la 00:00 UTC | Testul 2 dimineața; max 2–3 randări pe run; decizia €10 |
| Google nu aprobă brandul la timp | Ecranul Google arată supabase.co la beta | Trimis luni; varianta B (Supabase Custom Domain, ~$10/lună) doar ca rezervă |
| 8.02 Express e mai mare decât 2 sesiuni | Testele automate din W50 întârzie | Partea 3 sâmbătă (§2 rezervă) |
| Sesiuni paralele în același folder | `tsc` roșu din fișierul altcuiva, dev server blocat | Max 2 deodată; commit cu căi explicite |

---

## 5. Poarta de luni 7 dec (început W50)

- [ ] F4 + F6 scrise, 0 TBD · pachetul la arhitectul partener
- [ ] Express MVP: un brief → proiect complet → 3 randări → prezentare
- [ ] Testul 2: toate ST ✅ confirmate pe prod, ST28/ST32 reparate
- [ ] Decizia €10 luată · brandul Google ✅ verificat (27 nov) · textele Stripe actualizate ✅ (27 nov)
- [ ] Bugetul lunar confirmat sub €50 (sau decizie explicită de depășire)
- [x] Spațiul din baza Supabase notat (prima valoare de referință): 50 / 500 MB, 27 nov

---

## 6. Jurnal (se completează în timpul săptămânii)

| Când | Eveniment |
|---|---|
| Vin 27 | Planul scris de 1.05. 5.04 img2img automat rulează din W48. |
| Vin 27 (seara) | **2.05** adus din Lun 30: F4 `urban-planning-pug-puz.new.md` + F6 `building-permit-romania.new.md` scrise (RO+EN), self-check Chat 2 marcat în spec §4, 0 articole lipsă, 0 TBD. Niciun fapt schimbat față de F2/F3. NEXT-2 = 2.06. |
| Vin 27 (seara) | **9.02 Radar**: eroarea Blender diagnosticată (uv nu șterge `pywin32-311.data`; serverul instalat totuși pornește, 26 unelte). Plan B pentru 3.10 = server din Claude Code, `docs/radar/2026-11-26-blender-connector.md` §3. ⚠️ La §3 #17: **nu șterge folderul extensiei** înainte de pasul 1 din plan B; add-on-ul Blender încă nu răspunde; driverul era 511.65. |
| Vin 27 (seara) | **2.09** (adus din Mar 1): ST28 reparat în Library → Books: 6 linkuri moarte înlocuite (Internet Archive, PHI), ASIN Neufert corectat, cele 2 cărți Le Corbusier trecute la sursă Wikipedia (fără „Read Free”). Neverificate: butoanele „Open Library” (site-ul refuza conexiunile) și paginile Amazon (blochează agenții AI). Fără test în browser. |
| Vin 27 (seara) | **3.08 Engines** (adus din W49): ST29–ST32 rezolvate în cod (7d2ac43, d27fac2). **ST32**: slide-urile și PDF-ul urmează limba utilizatorului (RO/EN/NL, plus selector „Limba prezentării”); PDF-ul încorporează fontul Inter, deci ă â î ș ț apar corect. **ST31**: produsele și totalul vin din `computeProjectCost` (m² pe suprafața utilă, total = Finalize). **ST30**: legendele se taie la cuvânt, cu „…”. **ST29**: `/api/ai-render` trimite `X-AI-Fallback-From`; prezentarea arată „(alternativă: X indisponibil)” doar când lista nu e goală. `PdfGenerator.tsx` 733 → 113 linii. Verificat: tsc 0, vitest prezentare + ai-render 140/140, PDF RO generat offline și citit pagină cu pagină, slide-urile RO/NL în browser local. 0 randări live. Neverificat: descărcarea PDF din browser cu cont logat și pe prod. |
| Vin 27 (seara) | **7.02 Partners** (adus din Lun 30): drafturi în `docs/partners/` (acord arhitect partener, pachet review F2+F3, DPA furnizori, e-mail beta). Nimic trimis; Costin aprobă Lun 30. ⚠️ DPA-ul Vercel nu acoperă Hobby; `/privacy` nu numește mai mulți furnizori AI. NEXT-7 = 7.03. |
| Sâm 28 (noaptea) | **4.05 Billing** (adus din Joi 3): **B2-03** poartă de invitație = allowlist `beta_invites` + cod opțional `BETA_INVITE_CODE`, verificat pe server (`POST /api/beta/claim`) după înregistrare și la fiecare login; restul rămân Explorer fără promo. **B2-02** promo-ul pornește din `beta_invited_at`, nu din data contului (b84540a). Plafonul de cost per user = doar spec (`docs/MCA-SPEC-USER-COST-CAP.md`, e088db7), are nevoie de migrația 014 și de rutele Chat 3/2. Dashboard: portal inline, fără „Upgrade” la Constructor (6e85ddb). ⚠️ **Costin: rulează `docs/MCA-SQL-013-APPLY.sql`** în SQL Editor; până atunci nimeni nu are promo. Neverificat live. NEXT-4 = 4.06. |
| Sâm 28 (noaptea) | **5.05 Design + Drawings**: **ST20** cauza reală găsită: store-ul de design se umple din localStorage într-un microtask înainte de hidratare, iar Finalize/Products/Render apelau `getStats()` în render (citește starea vie) → HTML-ul serverului (proiect gol) ≠ client. Nou `useDesignStats()` (din selectori, snapshot de server la hidratare); cota de randări din selector; `toLocaleString()` → `formatNumber` (2266499). Test SSR→`hydrateRoot` reproduce exact mesajul Sentry pe codul vechi. **ST38** skeleton neutru în antetul `/dashboard` până la `useAuthReady()` (5074ff1). **ST39** antetul arhitect arată numele proiectului (proiect activ sau `loadProject`), repară vechile „Project <id>” (ec96dcb). **B2** frigiderul nu mai stă în blat (L-shape, galley) + alte 6 preseturi reparate; `layouts.overlap.test.ts` verifică toate preseturile (c307613). Neverificat pe prod: Sentry MODULCA-WEB-2 trebuie urmărit 24–48 h după deploy. Mobila încă intră ~10–25 cm în pereți în 3D (coordonate 0–3 m vs interior 2,4 m) → 3.10/3.11. **PermitTracker** audit + spec `docs/MCA-SPEC-PERMITTRACKER-v1.md` (build list PT-1…PT-7; texte CU/PAC/AC corectate după CATUC). NEXT-5 = 5.06 PT-1 + PT-3. |
| Sâm 28 (noaptea) | **8.02 Express MVP, partea 1**: `src/features/express/` (brief → `WizardInput` cu `targetModuleCount`/`bedroomsRequested`, plafon pe tier + 40% din teren; produse alese automat; teren pătrat pe centrul județului; salvare proiect nou prin `saveActiveProject`; 3 randări img2img din camerele preset prin `buildImg2ImgBody`, fără tier trimis de client) + ruta `/express` ascunsă de flag-ul `EXPRESS_ENABLED`, texte RO/EN/NL. 25 teste unitare (motoare mock), 0 randări live. Lipsește (partea 2): captura scenei 3D pentru img2img (acum randările apar ✗ „scena 3D indisponibilă”), test manual pe local. Detalii: `docs/sessions/NEXT-8.md`. |
| Sâm 28 (noaptea) | **1.07 B15 sharp**: `sharp ^0.34.5 → ^0.35.5` (aprobat Vin 27, §3 #11b). Audit: 6 (1 high + 5 moderate) → **5 moderate, 0 high**. Nicio schimbare de cod: singurul utilizator, `gallery/processor.ts`, nu folosește API-urile eliminate în 0.35; `/og` folosește `next/og`, nu sharp. Verificat: tsc 0, vitest 543/543, `next build` OK, test local `processRenderImage` (WebP 1600×1200 + QR + thumbnail 400×300). Cele 5 moderate (glob/minimatch prin Sentry) se rezolvă doar cu `@sentry/nextjs` 11 (major); apar doar la build, deci lăsate pentru o sesiune separată. Neverificat pe prod: publicarea în galerie după deploy. |
