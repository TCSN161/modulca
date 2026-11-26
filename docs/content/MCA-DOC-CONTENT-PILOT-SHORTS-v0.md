# MCA-DOC-CONTENT-PILOT-SHORTS-v0

**Status**: 🟡 **DRAFT — așteaptă review F2/F3.** Toate cele 5 Shorts sunt blocate până când arhitectul partener termină review-ul F2 + F3 (pachetul începe pe 28 nov, conform handoff-ului Chat 7 din 2026-11-23 din `docs/handoffs/`). Nu se generează nimic în NotebookLM până atunci.
**Owner**: Chat 6 Marketing · sesiunea `6.02.Marketing_Pilot-Shorts-Prep_20261126`
**Related**: [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] (§6 NotebookLM, §7 gate, §8 pilot, §10.1 house rules) · [[MCA-BRAND-VOICE-v0]] · [[MCA-DOC-CONTENT-PILLARS-v0]] (§6 pilot mapping) · [[MCA-DOC-CONTENT-CALENDAR-2027-01]]
**Canal / serie**: ModulCA · „CATUC pe înțelesul tuturor"
**Format**: NotebookLM → Rezumat video **„Scurt"** (portret), voce AI, cu „Examinează notele producătorului" pornit. Costin verifică fiecare piesă.
**Buget**: €0 (NotebookLM free tier).

> Repo public: documentul nu numește arhitectul partener. Folosim mereu „arhitectul partener".

---

## 0. Status review F2/F3 (verificat 2026-11-26)

| Sursă | Ce am găsit | Concluzie |
|---|---|---|
| `src/knowledge/06-regulations/RO/building-permit-process.new.md` (**F2**) | `status: draft-content-awaiting-architect-review`. Conținut complet (0 TBD, commit 5533ec3), cu toate articolele citate. | ⏳ Review neînceput |
| `src/knowledge/06-regulations/RO/modular-prefab-regulations.new.md` (**F3**) | `status: draft-skeleton-awaiting-notebooklm-and-architect-review`. Doar schelet, cu `[TBD]`. F3 e planificat pe 27 nov. | ⏳ Neînceput (nici conținutul) |
| Handoff Chat 7 (2026-11-23, `docs/handoffs/`) | Arhitectul partener a spus „OK în principiu". Review-ul F2 + F3 rulează între 28 nov și 15 dec, iar PDF-urile notificare pe 11–13 dec. | ⏳ Contract nesemnat încă |
| `docs/MCA-DOC-STATUS-*` (cel mai recent: 2026-11-21) | B4 „formal engagement" deschis | ⏳ |
| `docs/research/2026-11-25-*` (Chat 2) | Verificare NotebookLM Q1–Q10 + erate. Chapter draft parcat, `draft-awaiting-architect-review`. | Fapte verificate pe text, dar fără review |

**Decizie**: toate Shorts = **DRAFT — așteaptă review F2/F3**. Am verificat fiecare cifră și articol de mai jos direct în `docs/references/catuc/catuc-169-2026-text.md` (2026-11-26). Review-ul arhitectului rămâne totuși poarta de publicare pentru pilot (strategia §8: „Dec, after F2/F3 review").

**Deblocare**: când F2 are `status` de tip „reviewed/approved", Costin sau Chat 1 MAIN schimbă statusul fiecărui Short în ✅ READY. Short #2 (casa prin notificare) și #4 depind și de **F3** (prefabricate/modulare), deci așteaptă review-ul ambelor.

---

## 1. Cum folosești fișierul (flux per Short)

1. Deschide notebook-ul CATUC → **Rezumat video → Scurt** → lipește **promptul pentru caseta de focus** de mai jos.
2. Pornește **„Examinează notele producătorului"**. Compară scenariul propus cu **scriptul țintă** de mai jos: aceleași cifre, aceleași condiții, aceeași ordine. Corectează înainte să generezi (economisești cota).
3. După generare: verifică video-ul față de coloana „Articole citate". Orice cifră care nu apare acolo înseamnă **stop**.
4. Bifează checklist-ul §7 (brand voice §7) de la fiecare Short.
5. Postare: caption RO pe Shorts/Reels/TikTok, iar EN doar în descriere sau ca al doilea paragraf. Pe YouTube bifezi **„AI use"**.

Scriptul țintă are ~130–150 de cuvinte, adică ~55–60 s în ritm normal. Din ianuarie el devine și textul pentru vocea lui Costin.

**Link-uri** (vezi §7, întrebările deschise):
- Sursă în disclaimer: `modulca.eu/library/ro-building-permit` (articolul F2; devine live doar după review și swap-ul `.new.md → .md`).
- CTA checker: **`modulca.eu/autorizare`** (decis de Costin pe 2026-11-26, Q1). Ruta tehnică rămâne `/catuc-check` (Phase 3, W50), iar `/autorizare` face redirect spre ea. Dacă checker-ul nu e live la postare, CTA-ul trimite la articolul F2.

**Erori NotebookLM pe care NU le lăsăm să treacă** (brand voice §3.2): AC „12–36 luni" · „art. 272" · „art. 143" ca taxă locală · „cut-off 24 aug 2026" · Ord. 1022/2026 și 975/2026 (neverificate). Nici statutul formularului de notificare nu-l menționăm (vezi §7, Q3).

---

## Short #1 — Anexa de 20 mp fără autorizație: când da, când nu

| | |
|---|---|
| **Status** | 🟡 DRAFT — așteaptă review F2/F3 |
| **Pilon / audiență** | P1 · 🏡 proprietar |
| **Articole citate** | art. 299 alin. (2) lit. c) · art. 299 alin. (5) · art. 294 alin. (2) lit. a) pct. (i) |

**Verificare în text (catuc-169-2026-text.md)**
- art. 299(2)(c): anexe exterioare locuințelor unifamiliale, **mediul rural**, „terase acoperite, pergole, bucătării de vară, chioșcuri, magazii, grupuri sanitare", **≤ 20 mp cumulat**, **înălțime 2,5 m**, **fără fundație**, **provizoriu**, **demontabile**, **lemn sau metal**, cu respectarea PUG, RLU și a Legii 287/2009 ✅
- art. 299(5): recepția la terminare este **obligatorie** și se înscrie în cartea tehnică și în Registrul Național al Construcțiilor ✅
- art. 294(2)(a)(i): anexe **cu fundație**, permanente, **≤ 50 mp cumulat**, rural, intravilan, **cu excepția localităților rurale din zonele metropolitane** → procedura de **notificare** ✅

**Prompt pentru caseta de focus**
> Pentru proprietari de case din mediul rural, fără cunoștințe juridice. Un singur subiect: când poți construi o anexă (bucătărie de vară, pergolă, magazie) fără autorizație și fără notificare, conform art. 299 alin. (2) lit. c) din CATUC. Enumeră TOATE condițiile cumulative: maximum 20 mp cumulat, înălțime 2,5 m, fără fundație, provizorie, demontabilă, structură de lemn sau metal, mediul rural, cu respectarea PUG și a regulamentului local de urbanism. Spune clar că, dacă pui fundație sau depășești 20 mp, intri la notificare (art. 294 alin. (2) lit. a) pct. (i)). Menționează că recepția la final rămâne obligatorie (art. 299 alin. (5)). Ton calm, fără amenințări cu amenzi. Nu prezenta vocea ca fiind a unui arhitect. Încheie cu: verifică la primărie sau cu un arhitect.

**Script țintă (~55 s)**
> Vrei o bucătărie de vară sau o pergolă în curte? Ai auzit că sub 20 de metri pătrați nu-ți trebuie autorizație. E adevărat, dar doar dacă le bifezi pe toate.
> Conform noului Cod al construcțiilor, CATUC, articolul 299, construiești fără nicio formalitate doar dacă anexa:
> e în mediul rural, lângă o casă unifamilială;
> are cel mult 20 de metri pătrați în total, adică toate anexele la un loc;
> are cel mult 2,5 metri înălțime;
> n-are fundație, e provizorie și demontabilă;
> e din lemn sau din metal;
> și respectă regulile de urbanism ale comunei.
> Dacă torni fundație sau treci de 20 de metri pătrați, nu mai e „fără formalități". Intri la procedura de notificare, articolul 294.
> Și încă ceva: chiar și fără autorizație, recepția la final rămâne obligatorie.
> Nu ești sigur? Întreabă la primărie sau un arhitect. Iar pe modulca.eu verifici gratuit ce procedură ți se aplică.

**Caption RO**
> Anexă de 20 mp fără autorizație? Da, dar doar dacă bifezi TOATE condițiile din art. 299 CATUC: rural, ≤ 20 mp cumulat, ≤ 2,5 m, fără fundație, demontabilă, lemn sau metal.
> Informativ, nu consultanță juridică sau de proiectare. Verifică la primărie sau cu un arhitect. Sursa: CATUC (L.169/2026), art. 299 alin. (2) lit. c) → modulca.eu/library/ro-building-permit
> Narat cu voce generată AI (NotebookLM), verificat de echipa ModulCA.
> #CATUC #autorizatie #anexa #casamodulara #ModulCA

**Caption EN**
> A 20 m² outbuilding with no permit in Romania? Yes, but only if it meets EVERY condition in CATUC art. 299: rural, ≤ 20 m² in total, ≤ 2.5 m high, no foundation, demountable, wood or metal.
> For information only, not legal or design advice. Check with your city hall or an architect. Source: CATUC (Law 169/2026), art. 299(2)(c) → modulca.eu/library/ro-building-permit
> Narrated with an AI-generated voice (NotebookLM), reviewed by the ModulCA team.

**Checklist §7** — 1 ☑ audiență în focus · 2 ☑ fiecare limită are articol, verificat în text · 3 ☑ termeni (notificare, fără DTAC, diacritice) · 4 ☑ disclaimer + link · 5 ☐ linie AI ☑, „AI use" pe YouTube la postare · 6 ☑ fără nume de arhitect/ordine · 7 ☑ un CTA, fără bridge modular · 8 n/a (nu e flagship), **dar ☐ review F2 făcut (poarta pilotului)**

---

## Short #2 — Casa prin notificare: 150 mp la țară, dar cu condiții

| | |
|---|---|
| **Status** | 🟡 DRAFT — așteaptă review F2/F3 (depinde și de F3, case modulare) |
| **Pilon / audiență** | P1 · 🏡 proprietar |
| **Articole citate** | art. 294 alin. (2) lit. a) pct. (ii) · art. 295 alin. (4) · art. 298 alin. (3) · art. 264 alin. (8) |

**Verificare în text**
- art. 294(2)(a): construcții noi **în afara zonelor protejate**, **doar în mediul rural, în intravilan**, cu respectarea documentațiilor de urbanism ✅
- art. 294(2)(a)(ii): **o singură** locuință unifamilială, cu acces și lot propriu, **parter sau demisol + parter**, **fără subsol**, **suprafață desfășurată max. 150 mp**, **exclusiv** pe (1) proiecte-tip puse la dispoziție de autorități, rezultate din concursuri de soluții, sau (2) proiecte individuale ale unor colective tehnice (arhitecți cu drept de semnătură + ingineri), cu respectarea Ghidului OAR pentru mediul rural, **avizate de arhitectul-șef de județ** ✅
- art. 295(4): formular de notificare + **proiect tehnic de execuție cu conținut simplificat**, făcut de colective tehnice de specialitate + plata taxelor ✅
- art. 298(3): pentru această casă, **studiul geotehnic și cel topografic sunt obligatorii** ✅
- art. 264(8): arhitectul cu drept de semnătură e obligatoriu și la proiectele pe notificare ✅

⚠️ **Corecție pentru brand voice §3.2**: legea spune **„suprafață desfășurată"** max. 150 mp (toate nivelurile adunate), nu „suprafață construită / built area". Scriptul folosește formularea din lege. Nu spunem nimic despre zonele metropolitane la casă: excluderea există în text doar la pct. (i), pentru anexe (Chat 2 a semnalat asta pentru arhitectul partener).

**Prompt pentru caseta de focus**
> Pentru proprietari care vor să-și construiască o casă la țară. Un singur subiect: casa unifamilială prin procedura de notificare, conform art. 294 alin. (2) lit. a) pct. (ii) din CATUC. Enumeră toate condițiile: o singură casă, mediul rural, în intravilan, în afara zonelor protejate, parter sau demisol și parter, fără subsol, maximum 150 mp suprafață desfășurată, DOAR pe proiect-tip sau proiect individual făcut de arhitecți cu drept de semnătură și ingineri, avizat de arhitectul-șef de județ. Spune clar că notificarea NU înseamnă „fără proiect": ai nevoie de proiect tehnic simplificat (art. 295 alin. (4)), plus studiu geotehnic și topografic (art. 298 alin. (3)). Nu spune „fără autorizație" fără condiții. Nu prezenta vocea ca fiind a unui arhitect.

**Script țintă (~60 s)**
> „Poți face o casă de 150 de metri pătrați fără autorizație." Ai auzit asta? Adevărul e mai fin.
> Noul Cod, CATUC, articolul 294, permite o procedură mai rapidă, numită notificare, pentru o singură casă unifamilială, dar doar dacă:
> e în mediul rural, în intravilan, în afara zonelor protejate;
> are parter, sau demisol plus parter, fără subsol;
> are cel mult 150 de metri pătrați desfășurați, adică toate nivelurile la un loc;
> și e făcută pe un proiect-tip oficial sau pe un proiect individual al unor arhitecți și ingineri, avizat de arhitectul-șef de județ.
> Notificarea nu înseamnă „fără proiect". Depui un formular plus un proiect tehnic simplificat. Iar studiul geotehnic și cel topografic sunt obligatorii.
> Dacă nu bifezi toate condițiile, intri pe traseul clasic, cu autorizație de construire.
> Verifică gratuit pe modulca.eu ce traseu ți se aplică.

**Caption RO**
> Casă de 150 mp „fără autorizație"? Prin notificare (art. 294 CATUC), doar dacă: rural, intravilan, P sau D+P fără subsol, ≤ 150 mp desfășurați, proiect-tip sau proiect individual avizat de arhitectul-șef de județ. Proiectul și studiile geo + topo rămân obligatorii.
> Informativ, nu consultanță juridică sau de proiectare. Verifică la primărie sau cu un arhitect. Sursa: CATUC (L.169/2026), art. 294 alin. (2) lit. a) pct. (ii), art. 298 alin. (3) → modulca.eu/library/ro-building-permit
> Narat cu voce generată AI (NotebookLM), verificat de echipa ModulCA.
> #CATUC #notificare #casalatara #ModulCA

**Caption EN**
> A 150 m² house in Romania "without a permit"? Through the *notificare* procedure (CATUC art. 294), only if it is rural, inside the village limits, ground floor or semi-basement + ground floor with no basement, ≤ 150 m² total floor area, and built on a standard design or an individual design approved by the county chief architect. You still need the design plus geotechnical and topographic studies.
> For information only, not legal or design advice. Check with your city hall or an architect. Source: CATUC (Law 169/2026), art. 294(2)(a)(ii), 298(3) → modulca.eu/library/ro-building-permit
> Narrated with an AI-generated voice (NotebookLM), reviewed by the ModulCA team.

**Checklist §7** — 1 ☑ · 2 ☑ · 3 ☑ (notificare, „proiect tehnic de execuție cu conținut simplificat") · 4 ☑ · 5 ☑ linie AI / ☐ „AI use" la postare · 6 ☑ · 7 ☑ un CTA, fără bridge (un bridge modular aici ar fi tentant, dar așteaptă F3) · 8 n/a, **☐ review F2 + F3**

---

## Short #3 — Aprobarea tacită: 15 zile lucrătoare, apoi încă 15 calendaristice

| | |
|---|---|
| **Status** | 🟡 DRAFT — așteaptă review F2/F3 |
| **Pilon / audiență** | P2 · 🏡 proprietar |
| **Articole citate** | art. 295 alin. (1) · art. 296 alin. (1) lit. a), b), d), e) · art. 296 alin. (5), (6) · art. 298 alin. (1) |

**Verificare în text**
- art. 295(1): notificarea se face **înainte** de începerea lucrărilor ✅
- art. 296(1)(a): **aprobare tacită**, care produce efecte la împlinirea a **15 zile lucrătoare** de la primirea notificării ✅
- art. 296(1)(b), (d), (e): primăria poate cere clarificări, poate cere autorizație sau poate respinge, fiecare în **max. 15 zile lucrătoare** ✅ (lit. c: documentații complementare / avize prin Comisia de acord unic)
- art. 296(6): începerea lucrărilor la **15 zile calendaristice** după împlinirea termenului de la lit. a) ✅ · art. 298(1) confirmă ✅
- art. 296(5): termenul de realizare a lucrărilor notificate e valabil **3 ani** ✅

**Prompt pentru caseta de focus**
> Pentru proprietari care au depus sau vor depune o notificare la primărie. Un singur subiect: ce înseamnă aprobarea tacită în CATUC. Explică cele DOUĂ termene, în ordine: (1) 15 zile lucrătoare de la primirea notificării, după care notificarea e aprobată tacit dacă primăria nu răspunde (art. 296 alin. (1) lit. a)); (2) apoi încă 15 zile calendaristice până poți începe efectiv lucrările (art. 296 alin. (6)). Spune că, în primele 15 zile lucrătoare, primăria poate cere clarificări, poate cere autorizație de construire sau poate respinge notificarea. Menționează că ai 3 ani să realizezi lucrările (art. 296 alin. (5)). Nu spune „dacă tac, ai voie imediat". Ton calm, practic.

**Script țintă (~55 s)**
> Ai depus notificarea la primărie și n-ai primit niciun răspuns. Poți începe să construiești? Nu chiar a doua zi.
> CATUC, articolul 296, are două termene și contează amândouă.
> Unu: primăria are 15 zile lucrătoare de la primirea notificării. În timpul ăsta îți poate cere clarificări, îți poate spune că-ți trebuie autorizație de construire sau poate respinge notificarea.
> Dacă nu primești nimic în cele 15 zile lucrătoare, notificarea e aprobată tacit.
> Doi: după asta mai aștepți 15 zile calendaristice. Abia apoi poți începe lucrările.
> Socotit în total, e cam o lună și jumătate de la depunere până la șantier, dacă totul merge bine.
> Și ai 3 ani să termini lucrările notificate.
> Notează-ți data depunerii și numără corect: zile lucrătoare, apoi zile calendaristice.
> Detalii pas cu pas găsești pe modulca.eu.

> ⚠️ Fraza „cam o lună și jumătate" e un calcul aproximativ (15 zile lucrătoare ≈ 3 săptămâni + 15 zile calendaristice), nu un termen din lege. Dacă arhitectul partener o consideră riscantă, o scoatem.

**Caption RO**
> Aprobarea tacită la notificare are DOUĂ termene: 15 zile lucrătoare pentru răspunsul primăriei (art. 296 alin. (1) lit. a)), apoi încă 15 zile calendaristice până începi lucrările (art. 296 alin. (6)).
> Informativ, nu consultanță juridică sau de proiectare. Verifică la primărie sau cu un arhitect. Sursa: CATUC (L.169/2026), art. 296 → modulca.eu/library/ro-building-permit
> Narat cu voce generată AI (NotebookLM), verificat de echipa ModulCA.
> #CATUC #notificare #aprobaretacita #ModulCA

**Caption EN**
> Tacit approval under Romania's *notificare* procedure has TWO deadlines: 15 working days for the city hall to answer (CATUC art. 296(1)(a)), then 15 more calendar days before works can start (art. 296(6)).
> For information only, not legal or design advice. Check with your city hall or an architect. Source: CATUC (Law 169/2026), art. 296 → modulca.eu/library/ro-building-permit
> Narrated with an AI-generated voice (NotebookLM), reviewed by the ModulCA team.

**Checklist §7** — 1 ☑ · 2 ☑ (ambele termene, brand voice §3.1) · 3 ☑ · 4 ☑ · 5 ☑ / ☐ „AI use" · 6 ☑ · 7 ☑ · 8 n/a, **☐ review F2**

---

## Short #4 — DTAC → PAC: ce s-a schimbat pentru tine

| | |
|---|---|
| **Status** | 🟡 DRAFT — așteaptă review F2/F3 |
| **Pilon / audiență** | P3 → versiunea 🏡 proprietar |
| **Articole citate** | art. 262 alin. (1) lit. d) · art. 264 alin. (3), (4), (5), (6), (8) |

**Verificare în text**
- „DTAC" apare de **0 ori** în textul CATUC. Termenul legal e **„proiectul pentru autorizarea construirii"** (art. 262(1)(d), art. 264) ✅. „DTAC" a fost denumirea din Legea 50/1991 (context istoric, conform F2 §3.2).
- art. 264(3): conținut-cadru în **anexa nr. 2** · art. 264(4): pentru **gospodării unifamiliale în mediul rural**, **anexa nr. 3** ✅
- art. 264(5)–(6): după autorizație, PAC se detaliază în **proiectul tehnic de execuție**; începerea lucrărilor fără el e **interzisă** ✅
- art. 264(8): **arhitectul cu drept de semnătură** e obligatoriu la PAC ✅

**Prompt pentru caseta de focus**
> Pentru proprietari care au auzit de „DTAC" de la vecini, constructori sau din articole vechi. Un singur subiect: în noul Cod CATUC (Legea 169/2026), documentația pentru autorizația de construire se numește „proiectul pentru autorizarea construirii", prescurtat PAC (art. 262 alin. (1) lit. d), art. 264). Explică pe scurt: e întocmit de arhitect cu drept de semnătură și ingineri (art. 264 alin. (8)); pentru o casă la țară există un conținut-cadru separat, anexa 3 (art. 264 alin. (4)); după autorizație urmează proiectul tehnic de execuție, fără de care nu poți începe lucrările (art. 264 alin. (5)-(6)). Nu inventa diferențe de conținut față de vechiul DTAC. Ton prietenos, fără jargon neexplicat.

**Script țintă (~50 s)**
> Constructorul ți-a cerut „DTAC-ul"? În noul Cod al construcțiilor, CATUC, cuvântul ăsta nu mai apare.
> Acum se numește PAC, adică proiectul pentru autorizarea construirii. E dosarul tehnic pe baza căruia primești autorizația de construire.
> Trei lucruri bune de știut:
> unu, îl face obligatoriu un arhitect cu drept de semnătură, împreună cu inginerii;
> doi, pentru o casă la țară, legea are un conținut-cadru separat, mai potrivit gospodăriilor rurale;
> trei, PAC-ul nu e ultimul pas. După autorizație urmează proiectul tehnic de execuție, iar fără el nu ai voie să începi lucrările.
> Deci, când auzi „DTAC", gândește-te la PAC. Iar dacă vrei să vezi tot drumul, de la certificatul de urbanism la șantier, îl găsești explicat pe modulca.eu.

**Caption RO**
> DTAC → PAC. În CATUC, documentația pentru autorizația de construire se numește „proiectul pentru autorizarea construirii" (art. 262, 264). Îl face un arhitect cu drept de semnătură, iar fără proiectul tehnic de execuție nu începi lucrările.
> Informativ, nu consultanță juridică sau de proiectare. Verifică la primărie sau cu un arhitect. Sursa: CATUC (L.169/2026), art. 264 → modulca.eu/library/ro-building-permit
> Narat cu voce generată AI (NotebookLM), verificat de echipa ModulCA.
> #CATUC #PAC #autorizatie #ModulCA

**Caption EN**
> DTAC → PAC. Under CATUC, the design file for a Romanian building permit is called the *proiect pentru autorizarea construirii* (PAC, art. 262, 264). A licensed architect must be on the team, and works can't start without the detailed execution design.
> For information only, not legal or design advice. Check with your city hall or an architect. Source: CATUC (Law 169/2026), art. 264 → modulca.eu/library/ro-building-permit
> Narrated with an AI-generated voice (NotebookLM), reviewed by the ModulCA team.

**Checklist §7** — 1 ☑ · 2 ☑ · 3 ☑ (DTAC apare doar în explicația „DTAC → PAC", permis de brand voice §3.1) · 4 ☑ · 5 ☑ / ☐ „AI use" · 6 ☑ · 7 ☑ · 8 n/a, **☐ review F2/F3**

---

## Short #5 — Ce studii îți trebuie înainte de proiect

| | |
|---|---|
| **Status** | 🟡 DRAFT — așteaptă review F2/F3. Faptele vin din F2 §3.3 (Chat 2, commit 5533ec3) și le-am reverificat în text. Nu e placeholder. |
| **Pilon / audiență** | P2 · 🏡 proprietar |
| **Articole citate** | art. 257 alin. (12) lit. c) · art. 265 alin. (1), (2) lit. a), b), d) · art. 298 alin. (3) |

**Verificare în text**
- art. 257(12)(c): certificatul de urbanism conține **lista studiilor de specialitate** necesare ✅
- art. 265(1): studiile sunt „documentații complementare" **cerute prin certificatul de urbanism**, iar obținerea lor e **responsabilitatea solicitantului** ✅
- art. 265(2): lista e **neexhaustivă** („fără ca enumerarea să fie limitativă"): (a) **studiul geotehnic**; (b) expertiza privind influența asupra vecinătăților, „dacă este cazul"; (d) **studiul topografic** în **Stereo 70**, făcut de persoane autorizate ANCPI și **recepționat de ANCPI** ✅
- art. 298(3): pentru casa pe notificare, geotehnicul și topograficul sunt **obligatorii** ✅

**Ce NU spunem** (nu e în F2 și nu e verificat): prețuri pentru studii, termene de execuție a studiilor, lista completă a studiilor pentru un anume teren.

**Prompt pentru caseta de focus**
> Pentru proprietari care au teren și se pregătesc să facă proiectul casei. Un singur subiect: ce studii îți trebuie conform CATUC. Mesajul principal: lista exactă îți este dată de certificatul de urbanism (art. 257 alin. (12) lit. c), art. 265 alin. (1)), deci primul pas e certificatul. Explică cele două studii cele mai des cerute: studiul geotehnic (art. 265 alin. (2) lit. a)) și studiul topografic în sistemul Stereo 70, recepționat de ANCPI (art. 265 alin. (2) lit. d)). Spune că pentru casa pe notificare ambele sunt obligatorii (art. 298 alin. (3)). Spune că lista din lege nu e completă și că, după caz, pot fi cerute și altele. NU da prețuri sau durate. Ton calm, practic.

**Script țintă (~55 s)**
> Ai terenul și vrei să începi proiectul casei. Ce studii îți trebuie?
> Răspunsul corect: cele scrise în certificatul de urbanism. CATUC spune că certificatul conține lista studiilor de specialitate de care ai nevoie, iar obținerea lor e treaba ta, a celui care cere autorizația.
> Cele mai frecvente sunt două.
> Studiul geotehnic, care arată pe ce fel de teren construiești și cum trebuie făcută fundația.
> Studiul topografic, adică măsurătoarea terenului în sistemul Stereo 70, făcută de o persoană autorizată și recepționată de Cadastru, ANCPI.
> Iar dacă îți faci casa prin procedura de notificare, ambele sunt obligatorii, conform articolului 298.
> Pot fi cerute și altele, în funcție de teren. De aceea începi cu certificatul de urbanism.
> Pe modulca.eu găsești pașii, în ordine.

**Caption RO**
> Ce studii îți trebuie pentru casă? Pe cele din certificatul de urbanism (art. 257 alin. (12) lit. c) CATUC). Cele mai frecvente: studiul geotehnic și studiul topografic Stereo 70, recepționat de ANCPI (art. 265). Pentru casa pe notificare, ambele sunt obligatorii (art. 298 alin. (3)).
> Informativ, nu consultanță juridică sau de proiectare. Verifică la primărie sau cu un arhitect. Sursa: CATUC (L.169/2026), art. 265 → modulca.eu/library/ro-building-permit
> Narat cu voce generată AI (NotebookLM), verificat de echipa ModulCA.
> #CATUC #certificatdeurbanism #studiugeotehnic #ModulCA

**Caption EN**
> Which studies do you need before designing your house in Romania? The ones listed in your urban planning certificate (*certificat de urbanism*, CATUC art. 257(12)(c)). The most common: a geotechnical study and a Stereo 70 topographic survey registered with ANCPI, the cadastre agency (art. 265). For a house built via *notificare*, both are mandatory (art. 298(3)).
> For information only, not legal or design advice. Check with your city hall or an architect. Source: CATUC (Law 169/2026), art. 265 → modulca.eu/library/ro-building-permit
> Narrated with an AI-generated voice (NotebookLM), reviewed by the ModulCA team.

**Checklist §7** — 1 ☑ · 2 ☑ (fără cifre nesursate) · 3 ☑ (certificat de urbanism) · 4 ☑ · 5 ☑ / ☐ „AI use" · 6 ☑ · 7 ☑ · 8 n/a, **☐ review F2**

---

## 6. Ordinea de producție recomandată

| Ordine | Short | De ce |
|---|---|---|
| 1 | #3 Aprobarea tacită | Cel mai simplu, două termene clare. Bun pentru testat fluxul NotebookLM → notele producătorului → corectură. |
| 2 | #1 Anexa 20 mp | Cea mai căutată întrebare (P1, 40%) |
| 3 | #5 Studii | Depinde doar de F2 |
| 4 | #4 DTAC → PAC | Depinde doar de F2 |
| 5 | #2 Casa prin notificare | Cel mai sensibil: așteaptă și review-ul F3 (prefabricate/modulare) |

Ce măsurăm după 7 zile (strategia §9): vizualizări, timp de vizionare, click-uri spre modulca.eu. Rezultatul reponderează calendarul din ianuarie.

---

## 7. Întrebări deschise (pentru Costin / Chat 1 MAIN)

| # | Întrebare | Propunere |
|---|---|---|
| Q1 | URL-ul checker-ului: brand voice spune `modulca.eu/autorizare`, iar roadmap-ul (Phase 3) spune `/catuc-check`. Care rămâne public? | ✅ **Închis 2026-11-26 (Costin)**: URL public `/autorizare`, cu redirect spre `/catuc-check`. Redirect-ul e cod (Chat 2 / MAIN, Phase 3), iar Chat 6 doar îl folosește în CTA. |
| Q2 | Brand voice §3.2 spune „≤ 150 mp built area". Legea spune „suprafață desfășurată". | ✅ **Închis 2026-11-26 (6.03)**: brand voice v1 §3.2 spune „suprafață desfășurată max. 150 mp". |
| Q3 | Brand voice §4 dă exemplul „formularul de notificare încă nu e publicat prin ordin (art. 295(10))". Textul din `catuc-169-2026-text.md` are însă o notă de portal care pomenește un ordin din 25.08.2026 pentru formulare, neverificat (Chat 2). | ✅ **Închis 2026-11-26 (6.03)**: exemplul e scos din brand voice v1 §4, iar statutul formularului e pe lista „never publish" (§3.2). |
| Q4 | Pilotul e postat în decembrie, înainte de lansarea canalului în ianuarie? | Da, cu bio minimal (strategia §10 Q3). Handle-urile trebuie rezervate de Costin înainte. |

---

## 8. Changelog

| Data | Schimbare |
|---|---|
| 2026-11-26 | v0: 5 Shorts DRAFT, cu articole verificate în text (Chat 6, sesiunea 6.02) |
| 2026-11-26 | Q1 închis: CTA = `modulca.eu/autorizare` (redirect spre `/catuc-check`) |
| 2026-11-26 | Re-verificare review (sesiunea 6.03): F2 încă `draft-content-awaiting-architect-review`, F3 încă schelet, fără handoff Chat 7 nou după 2026-11-23. Toate Shorts rămân 🟡 DRAFT. Q2 și Q3 sunt închise în brand voice v1. |
