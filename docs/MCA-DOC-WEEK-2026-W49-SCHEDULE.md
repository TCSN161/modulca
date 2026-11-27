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
| **Mar 1** | **3.08** PDF în română: ST32 (RO+EN) + ST30 legende + ST31 costuri din `computeProjectCost` + ST29 header `X-AI-Fallback-From` · **2.09** verificarea link-urilor din bibliotecă (ST28) | Opus · Sonnet | Citești F4+F6 (seara) |
| **Mie 2** | **8.02** Express MVP, partea 1 · **1.07** upgrade securitate B15 (sharp 0.34→0.35) | Opus · Sonnet | OK pentru B15 · **decizia €10** (de preferat azi, după verificarea klein) |
| **Joi 3** | **8.02** Express MVP, partea 2 · **4.05** poartă de invitație + promo ancorat + plafon lunar de cost (30% din preț) + `ENGINE_LIMITS` după decizia €10 | Opus · Opus | Conturi de afiliat Profitshare + 2Performant (§3 #8) |
| **Vin 4** | **1.08** test complet 2 (dimineața, după deploy-uri; cont logat, retest ST-uri) · **9.02** raport Radar · seara **1.09** închiderea W49 (+ prima verificare a spațiului din baza Supabase) | Opus · Sonnet · Opus | La login, te autentifici tu în panoul de browser (~5 min) · 10 min rezumatul |
| **Sâm 5** | **10.02** benchmark-uri + prețuri (NEXT-10) · **2.10** corecturile arhitectului partener (⏳ doar dacă a trimis review-ul) | Sonnet · Opus | Aprobi emailul către cei 10 utilizatori (7.03) |
| **Dum 6** | **7.03** email către cei 10 utilizatori (draft, nu se trimite fără OK) · **2.11** publicarea Fazei 2 (⏳ doar după semnătură) | Sonnet · Opus | Opțional: lista invitaților beta (termen 10 dec) |

**Rezervă**: dacă 8.02 nu se termină joi, partea 3 intră sâmbătă în locul lui 10.02 (care se mută în W50). Dacă arhitectul partener nu răspunde până miercuri → planul B (alt arhitect din rețeaua OAR), Chat 7.

**Supabase Free (decis de Costin 27 nov)**: rămânem pe Free; Pro ($25/lună) doar peste ~400 utilizatori sau ~400 MB în bază. Gărzile: (1) export manual al bazei înainte de 15 dec, (2) verificarea spațiului în fiecare închidere de vineri, (3) **randările mutate din rândul proiectului în Supabase Storage în W50**, nu după beta, (4) o accesare automată pe zi de sărbători, ca proiectul să nu intre în pauză.

**Mutat în W50**: 3.09 capacitate gratuită + compresie GLB (NEXT-3, task B) · 5.05 audit export → spec PermitTracker (dacă vineri nu e loc) · `/catuc-check` · insignă BETA.

---

## 3. Lista lui Costin (tot ce poți face doar tu)

| # | Ce | Când | Timp | Cum / unde |
|---|---|---|---|---|
| 1 | **Verifici reparațiile pe site** (logat): randare „3D + Text” (trebuie „Randat cu cloudflare-klein”), PDF nou (pagini, randări curate), consultantul la o întrebare CATUC, `/pricing` + „Manage” pe contul comp | Lun 30 | 45 min | modulca.eu; scrii în chat-ul MAIN ce nu merge |
| 2 | Te uiți pe contact sheet-ul bake-off (klein vs randările vechi din PDF #8) | Lun 30 | 10 min | `docs/research/render-bakeoff-2026-11/index.html` |
| 3 | Citești F3 (+ nota CC1 / art. 440(3) care poate schimba F2) | până Lun 30 | 40 min | `src/knowledge/06-regulations/RO/modular-prefab-regulations.new.md` |
| 4 | **Login Google cu numele ModulCA** (ST18): brand în Google Cloud Console, trimis la verificare (2–3 zile lucrătoare la Google) | **Lun 30** (ca să fie aprobat înainte de 15 dec) | 15 min + așteptare | `docs/MCA-DOC-GOOGLE-LOGIN-BRANDING.md` varianta A (gratuită) |
| ~~5~~ | ✅ **Făcut (27 nov)**: ~~Stripe, textele produselor~~, toate cele 6 produse TEST (lunar + anual); la LIVE (ian) se refac la fel | — | — | Stripe → Product catalog; textele exacte în `docs/sessions/NEXT-4.md` |
| 6 | **Vercel**: `CF_KLEIN_MAX_SIDE=768` și cheia gratuită `POLLINATIONS_API_KEY` (dacă nu sunt puse) | Lun 30 | 10 min | Vercel → Environment Variables → Redeploy |
| 7 | **Decizia €10 pe motoare**: (a) nimic, rămânem pe klein + Horde gratuit · (b) Replicate €10 ≈ 430 randări depth/canny · (c) Stability €10 ≈ 220 · (d) Cloudflare Workers Paid (≈ $5/lună + neuroni peste plafon, preț de verificat) · (e) OK pentru Leonardo Depth din creditul prepaid rămas (~240 randări, €0 nou) | **până pe 10 dec** (ideal Mie 2) | 10 min | Recomandarea MAIN: **(e) acum** (bani deja plătiți) + **(a)**; (b) doar dacă testul 2 arată randări nefidele |
| 8 | **Upscale: rămâne doar pe cotă, sau doar pentru planurile plătite?** | Mie 2 | 2 min | Recomandarea MAIN: doar pe cotă în beta (toți sunt Premium promo), poartă de plan la lansare |
| 9 | Conturi de afiliat **Profitshare** și **2Performant** (gratuite) + citești comisioanele reale | Joi 3 | 30 min | Sursa de venit R5; cifrele merg la 10.02 |
| 10 | **Apel cu arhitectul partener** + trimiți pachetul F2+F3 (pregătit de 7.02) | când răspunde (ideal Lun 30 – Mar 1) | 45 min | Întrebările din handoff-ul Chat 7 + lista `research/2026-11-26-catuc-partner-review-list.md` |
| 11 | Aprobări: emailurile DPA (Lun 30) · upgrade B15 (Mie 2) · emailul către utilizatori (Sâm 5) | W49 | 15 min total | un „OK” în chat-ul MAIN |
| 12 | Search Console → Sitemaps: statusul e „Success”? | Lun 30 | 5 min | dacă tot „Couldn't fetch”, spui MAIN |
| 13 | Rezervi conturile **@modulca** pe rețelele sociale | când ai timp, până pe 13 dec | 20 min | Instagram, TikTok, YouTube, Facebook, LinkedIn |
| 14 | Confirmi costurile lunare reale (planul Claude, ChatGPT Plus, Vercel, domeniul) | Lun 30 | 10 min | completezi rândurile ❓ din `docs/MCA-DOC-BUDGET-2026.md` |
| ~~16~~ | ✅ **Făcut (27 nov)**: ~~spațiul din baza Supabase~~ = 50 / 500 MB, detalii în bugetul §6 | — | — | — |
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
- [ ] Decizia €10 luată · brandul Google trimis · textele Stripe actualizate ✅ (27 nov)
- [ ] Bugetul lunar confirmat sub €50 (sau decizie explicită de depășire)
- [x] Spațiul din baza Supabase notat (prima valoare de referință): 50 / 500 MB, 27 nov

---

## 6. Jurnal (se completează în timpul săptămânii)

| Când | Eveniment |
|---|---|
| Vin 27 | Planul scris de 1.05. 5.04 img2img automat rulează din W48. |
