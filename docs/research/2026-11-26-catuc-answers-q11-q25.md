# CATUC answers Q11–Q25 — verification (Q11–Q20) and Claude's answers from the law text (Q21–Q25)

**Session**: `2.07.Neufert_Q11-Q25-OCR-New-Chapter_20261126` (Chat 2 Neufert), 2026-11-26
**Sources of truth**: `docs/references/catuc/catuc-169-2026-articole.json` (582 entries), `docs/references/catuc/catuc-169-2026-text.md` (art. 415 and 524 only here), `docs/references/catuc/catuc-clarificari-ocr.md` (MDLPA Clarificări, transcribed this session).
**Q11–Q20 inputs**: NotebookLM raw `docs/research/2026-11-26-notebooklm-raw-q11-q25.txt` → ingest JSON `docs/research/2026-11-26-notebooklm-catuc-qa-q11-q20.json` → consolidated `docs/research/2026-11-26-notebooklm-catuc-answers.md` (via `scripts/catuc-ingest.mjs`, same as 2.02).
**Q21–Q25**: not asked in NotebookLM. Claude answered them directly from the local law text; every claim below carries an article that was opened and read this session.

> **Statut**: material de lucru intern. Nu este consultanță juridică. Clarificările MDLPA sunt orientare administrativă, nu lege; unde diferă de CATUC, prevalează legea.

---

## Part A — Ministerial orders: ITEM-7 resolved

| Act | Evidence 1: Portal Legislativ note in the law text | Evidence 2: MDLPA Clarificări (OCR) | Status |
|---|---|---|---|
| **Ordinul MDLPA nr. 975 din 25.08.2026** — modelele formularelor pentru autorizarea executării lucrărilor de construcții (CU, construire, desființare, modificare, regularizare, notificare, formulare conexe) | note under art. 262: „ORDINUL nr. 975 din 25 august 2026, publicat în M.Of. Partea I nr. 711 din 26 august 2026” | pct. 1: „Ordinul nr. 975/2026 privind aprobarea modelelor formularelor referitoare la autorizarea construirii”; pct. 8: „Ordinul MDLPA nr. 975 din 25 august 2026” | ✅ **Confirmed** (two independent sources agree on number, date, subject) |
| **Ordinul nr. 1.022 din 28.08.2026** — Procedura de elaborare, modificare/actualizare și aprobare a documentațiilor de amenajare a teritoriului și de urbanism, a formularelor utilizate și a listei avizelor necesare | notes under art. 31, 55, 87: „PROCEDURA din 28 august 2026 … aprobată prin ORDINUL nr. 1.022 din 28 august 2026, publicat în M.Of. Partea I nr. 724 din 28 august 2026” | pct. 1: „Anexa nr. 6 din Ordinul nr. 1022/2026 privind aprobarea Procedurii de elaborare, modificare/actualizare și aprobare a documentațiilor de amenajare a teritoriului și a documentațiilor de urbanism, a formularelor utilizate, precum și a listei avizelor necesare” | ✅ **Confirmed** (number and subject in both; date and M.Of. from the Portal note only). The Clarificări do not name the issuer of 1.022; art. 31 says such procedures are approved „prin ordin de ministru” by the ministry responsible for urban planning. |
| **Ordinul nr. 3.167 din 27.08.2026** — two procedures for Ministry of Culture written agreements (intervenții în primă urgență la monumente; notificarea lucrărilor din art. 284 alin. (4)) | notes under art. 283, 284: M.Of. Partea I nr. 717 din 27.08.2026; art. 283(7), 284(7) say the procedures are set „prin ordin al ministrului culturii” | not mentioned | 🟨 **Single source** (Portal note). New find; not relevant for modular houses outside protected areas. |

**Not confirmed by anything local**: the publication date and M.Of. issue of the Clarificări themselves (the PDF carries no date or number).

---

## Part B — Q11–Q20 verification

**Method**: every CATUC article number in the ten answers was extracted by script (ranges expanded; references to Legea 50/1991, Codul administrativ, Codul civil excluded) and looked up in the JSON, with `text.md` as fallback. Key factual claims were then read in the article text. Q11 was compared line by line with the OCR of the Clarificări.

### B1. Article existence — 0 missing

| Q | CATUC articles cited | Result |
|---|---|---|
| Q11 | 66, 82, 216–219, 240, 245, 293, 299, 301, 310, 582 | ✅ all exist |
| Q12 | 137, 139, 254, 256, 257, 270, 273, 278, 280, 295, 296, 306, 316 | ✅ all exist; digital-submission quotes match (254(5), 270(1)–(3), 295(6), 278, 280(10), 316(1) lit. f)) |
| Q13 | 301 (plus uncited figures, checked below) | ✅ |
| Q14 | 18, 19, 21, 46, 63, 78, 91, 92, 104, 112, 113, 119, 128, 136–139, 143, 177, 227, 253, 257, 272, 295, 301, 305, 307, 308, 313, 316, 351, 376, 377, 386, **415**, 465, 517, 576 | ✅ all exist (415 in `text.md` only) · ⚠️ 3 wrong alineate (B2.6) |
| Q15 | 264, 317, 428, 434, 440–446 | ✅ all exist |
| Q16–Q19 | no article numbers given | claims checked below |
| Q20 | 46, 63, 66, 85, 139, 269, 273, 294, 296, 299, 301, 305, 357, 358, 422, 570, 576 | ✅ all exist |

Script result: **77 distinct CATUC articles cited, 0 missing.**

### B2. Errata and unsupported claims (do NOT carry into content)

1. **Metropolitan exclusion misapplied to the house — Q16 §1, Q20 #1.** Both say the 150 mp rural house under notification must be outside metropolitan areas. The law writes the exclusion **only in art. 294(2)(a) pct. (i)** (outbuildings ≤ 50 mp), not in pct. (ii) (the house). Full analysis: Q21 below.
2. **Q16 §4 — "urban: technical checking is mandatory".** Wrong as a general rule: projects in CC1 need no technical checking (art. 440(3)); Annex 6 puts P and P+1 single-family houses in CC1. The rural-notification statement is right (art. 298(2)), and geotechnical + topographic studies are mandatory there (art. 298(3)). Note also: Annex 3 (simplified PAC, rural, P+M, ≤ 150 mp) belongs to the **permit** route (art. 264(4)), not to the notification.
3. **Q16 §2 — "urban: all new outbuildings need a building permit".** Not stated anywhere; the law only limits art. 294(2)(a) and art. 299(2)(c) to the rural area. Unsupported as phrased.
4. **Q20 #7 — "all avize are obtained through one Acord Unic".** The Acord Unic route applies only if the applicant **opts** for it, and avize under art. 266(2) lit. f)–h), l), m) are excluded from it (art. 269(1)).
5. **Q14 — wrong alineate**: the urgent-permit special fee is **art. 273(2)** (with art. 484), not 272(2) — art. 272 is "consultarea autorității emitente" (same error as Q2 in 2.02). CU fees are not in art. 253(10) (no fee text in art. 253). The CAU fee text is in art. 308(1), not (3). Taxa locală de echipare: **art. 576(4)** ✅. Majorare impozit 100%: **art. 301(11)** ✅.
6. **Q15 §3.5 — fines for architects** "10.000–20.000 lei" (0 hits in the law) and "20.000–50.000 lei" (the only hit, art. 144(2), concerns urbanism/spatial-planning documentation, not building designers in general). → **Unsupported.** Suspension of the right to practise exists (art. 572) but the "6–12 months" figure was not checked → do not use. Professional liability insurance: confirmed for executants/site staff (art. 449 lit. f), 456 lit. h), 459 lit. l)); for designers it was not checked → do not use.
7. **Q15 §2 / Q18 (most of it)** — lists of what an architect may not sign (structural, seismic, own-project checking, monuments) and the long document list in Q18 carry **no article citations** and were not checked. Only the following are verified: architect participation mandatory on PAC and notification projects (art. 264(8)); conductor arhitect may sign CC1 outside protected areas (art. 317(1) lit. a)); designer liability for hidden defects 10 years from reception (art. 424(5)); verifier ≠ designer (art. 440(1)–(2)).
8. **Q17 — "P.O.E. (Proiectul pentru Organizarea Execuției Lucrărilor)"** — the exact name gets 0 hits; CATUC speaks of "proiectul de organizare a execuției" / organizarea de șantier (art. 517). PAD exists (e.g. art. 289(2) lit. j)). Autorizația de modificare = art. 293 ✅, de regularizare = art. 301 ✅, AC pentru amenajări = art. 286 ✅.
9. **Q19 §4 — "designer must reclassify the consequences class on change of use"** — 0 hits; unsupported. Q19 §2 notification cases are right (art. 294(2)(b) pct. (ix), (x); art. 294(3) lit. h)). Q19 §5 neighbours' agreement offence: art. 357(1) lit. v) ✅.
10. **Q11 — additions not in the Clarificări**: pct. 9 "propose a single coordinating PUZ for the whole area" (not in the Clarificări; 0 hits in the law — art. 66(3)–(6) only provide the public list, justified timing and a priority grid). Pct. 11 cites "art. 82" for PUD parcelling: wrong article — the rule is **art. 218(2)** (up to 12 lots for individual houses, once, via PUD); art. 82 is about when a PUD may change higher-level rules. Pct. 12 "sancționare contravențională" and "încadrare strictă în PUG" are NotebookLM embellishments.
11. **Q11 pct. 8 — "art. 310 alin. (7)"**: NotebookLM copied the Clarificări correctly ("cu respectarea alin. 7 al art. 310"), but in the law text the rule "nefinalizare → nouă autorizație" is **art. 310(6)**; art. 310(7) covers continuing interrupted works on the basis of an expert report. Likely a numbering slip in the Clarificări → architect question.
12. **Q13 — comparison column "Legea 50/1991"** (fines 1.000–100.000 lei, 3-year limitation) cannot be checked against local sources (Legea 50/1991 is not in the repo) → do not publish the comparison figures.

### B3. Confirmed claims worth reusing (with the article actually checked)

| Claim | Article |
|---|---|
| No notification / not respecting notified project: fine 5.000–50.000 lei | art. 357(1) lit. a), (4) lit. a) |
| No permit (construire, desființare, regularizare, modificare) or not respecting it: fine 50.000–1.000.000 lei | art. 357(1) lit. b), (4) lit. b) |
| Exceeding the permitted height: fine 50.000–500.000 lei **per unauthorised level** | art. 357(5) |
| Action to demolish: limitation 10 years from actual completion | art. 357(11) |
| Offences (3 months–1 year or fine) for unauthorised works on monuments / protected zones etc. | art. 356(1) |
| Building tax +100% for unauthorised, unregularised buildings | art. 301(11) |
| Administrative demolition on public/private land of the State or UAT | art. 359 |
| Control bodies must order compliance or regularisation | art. 358(1) |
| CUT > 4 only through PUG | art. 46(5) |
| Rezervare: max. 60 days, max. 5% of price; advances into a separate dedicated bank account; installations tranche max. 20% | art. 422(9)–(10) |
| Contracte de urbanizare (PUZ initiator, negotiation commission) | art. 63 |
| Taxa locală de echipare a teritoriului | art. 576(4) |
| Ghișeul unic național; digital filing of AC documentation; digital notification with automatic acknowledgement | art. 137(3), 139, 270(1)–(3), 295(6) |
| Self-build (regie proprie) only for ground-floor houses in rural areas, garages, terraces, ground-floor annexes | art. 279(1) |
| Parcelling up to 12 lots for individual houses once via PUD; otherwise PUZ | art. 218(1)–(2) |
| Dezmembrare = split into two plots, needs CU for cadastral operations (with exceptions in alin. (3)) | art. 240(1)–(3) |

### B4. Q11 against the OCR — summary

NotebookLM's 15-point summary of the Clarificări matches the transcription in substance, apart from the additions in B2.10–11. The 15 points (titles): 1 cereri până la 24.08.2026; 2 formulare în tranziție; 3 PUD aprobat prin dispoziția primarului; 4 data inițierii (art. 582(6)); 5 arhitecți-șefi — condiții; 6 drept de semnătură arhitect-șef (nu e condiție); 7 POT — noua definiție nu se aplică documentațiilor aprobate înainte de 25.08.2026; 8 autorizații L.50 — prelungire, expirare, modificare; 9 mai multe intenții PUZ; 10 CU pentru operațiuni cadastrale; 11 dezlipire vs parcelare PUD/PUZ; 12 „legalizarea” art. 37(6) L.50; 13 clădiri dinainte de 1.08.2001; 14 art. 245 nelimitativ (superficie); 15 branșamente. Full text: `docs/references/catuc/catuc-clarificari-ocr.md`.

### B5. Corrections to the 2.02 verification (`2026-11-25-notebooklm-catuc-answers.md`)

- **B4 (Q8 prelungire L.50)**: now checkable. The Clarificări pct. 8 base the extension on **art. 310(5)**, which does say "o singură dată", "nu mai mare de 12 luni", "cu cel puțin 15 zile **lucrătoare**", taxă 30%. NotebookLM's Q8 was therefore right; 2.02 compared it against art. 309(6) ("15 zile"), the wrong paragraph. Status → 🟩 for the wording; the 309 vs 310 interplay stays an architect question (Q22).
- **B5 (Q9 "24 august 2026")**: still not in the law, but it **is** in the Clarificări pct. 1–2 (cereri înregistrate până la 24.08.2026 inclusiv → legislația de la data înregistrării, formularele vechi). Status → supported by ministry guidance, not by law text.
- **C (ITEM-7)**: Ord. 975/2026 and Ord. 1.022/2026 → ✅ confirmed (Part A).

---

## Part C — Q21–Q25: Claude's answers from the law text

### Q21 — Does the notification of art. 294(2)(a)(ii) apply to rural localities in metropolitan areas (e.g. near Bucharest)?

**Answer: on the text of the law, yes — the metropolitan exclusion is written only for outbuildings (pct. (i)), not for the house (pct. (ii)).** Treat it as the literal reading until the partner architect or the local CU confirms it.

**Exact text** (art. 294(2) lit. a), JSON, checked verbatim):

- Chapeau, lit. a): „realizarea de construcții noi **în afara zonelor protejate și a zonelor de protecție a monumentelor istorice, doar în mediul rural, în intravilan și cu respectarea documentațiilor de urbanism aprobate**, după cum urmează:”
- Pct. (i): „clădiri/construcții noi exterioare locuințelor unifamiliale, astfel cum sunt garaje, terase acoperite, pergole, bucătării de vară, chioșcuri, piscine, grupuri sanitare și altele asemenea, care nu depășesc cumulat 50 mp, inclusiv cele sub 20 mp construite cu fundație, cu caracter permanent, nedemontabile, situate în mediul rural, **cu excepția localităților rurale aflate în zonele metropolitane**;”
- Pct. (ii): „o singură locuință unifamilială cu acces și lot propriu, parter sau demisol și parter, fără subsol, cu o suprafață desfășurată maximă de 150 mp, în intravilanul din mediul rural, cu respectarea regulamentului de urbanism aplicabil, exclusiv pentru locuințele realizate în baza unor proiecte-tip … sau pe baza unor proiecte individuale întocmite de către colective tehnice de specialitate, formate din arhitecți cu drept de semnătură și ingineri proiectanți de structuri și proiectanți de instalații, cu respectarea Ghidului de arhitectură pentru încadrarea în specificul local din mediul rural, elaborat de Ordinul Arhitecților din România, avizate de arhitectul-șef de județ;”

**Why the exclusion does not reach pct. (ii)**: the words „cu excepția localităților rurale aflate în zonele metropolitane” sit inside pct. (i), before the semicolon that closes it; pct. (ii) repeats its own location condition („în intravilanul din mediul rural”) without that exception; the chapeau (common to both) lists only protected zones, monument protection zones, rural, intravilan and approved urbanism documents.

**No other article adds it**: "metropolitan" appears in 24 articles (5, 10, 13, 36, 38, 39, 45, 84, 86, 91, 105, 116, 118, 121, 124, 128, 130, 132, 134, 135, 149, 203, 269, 294); none of art. 295–298 (the notification procedure) contains it. The only one in Part V (authorization) other than 294 is art. 269(6)–(7), which concerns which Acord Unic commission is competent in a metropolitan territory (list = Annex 1 to Legea 246/2022), not who may notify.

**Conditions that do apply to the house in a commune near Bucharest** (all from art. 294(2)(a) and (ii) unless stated):
1. rural locality (Annex 1 defines "localitate rurală – sat", art. 584), in **intravilan**;
2. outside protected zones and monument protection zones;
3. respects approved urbanism documents and the applicable urbanism regulation;
4. one single-family house, own access and plot, P or D+P, no basement, ≤ 150 mp desfășurată;
5. standard design from a public authority **or** an individual design by architects with signing rights + structural and MEP engineers, following the OAR rural guide, **endorsed by the county chief architect** (here: Ilfov);
6. no EIA / appropriate-assessment conflict (art. 294(5); art. 297(6));
7. geotechnical and topographic studies are mandatory (art. 298(3)).

**Exceptions that do exclude metropolitan rural localities**: outbuildings ≤ 50 mp under notification (pct. (i)). Those go to a building permit, or, if they meet art. 299(2)(c) (≤ 20 mp, ≤ 2,5 m, no foundation, demountable, wood/metal, rural), need no formalities — art. 299(2)(c) has no metropolitan exception either.

**For the Cornetu pilot**: whether Cornetu belongs to the Bucharest metropolitan territory is set by Annex 1 to Legea 246/2022 (art. 269(7)), which is not in the repo — not verified. It matters only for outbuildings under pct. (i). For the house, the deciding facts are intravilan, protected-zone status and the urbanism rules, which the **certificat de urbanism** for the plot will state (art. 257). Ask the county chief architect early, since the individual design needs their endorsement.

**Architect question**: is the literal reading applied in practice (Ilfov county chief architect, Cornetu town hall)?

### Q22 — Art. 309(5) forbids extending validity; art. 309(6) allows up to 12 months. How do they fit?

**Exact text** (art. 309, JSON):
- (1) „Autorizațiile de construire și desființare sunt valabile pentru un termen de 3 ani de la data emiterii.”
- (2) „Termenul de valabilitate prevăzut la alin. (1) se extinde pe toată durata de execuție a lucrărilor prevăzută prin autorizație, începând cu data începerii lucrărilor înștiințată autorității …”
- (4) suspension once, ≤ 12 months, by notifying the issuer.
- (5) „Prelungirea termenului de valabilitate a autorizațiilor **prevăzut la alin. (1)** este interzisă, indiferent de motivele … În termenul de valabilitate al autorizațiilor, solicitantul autorizației are dreptul de a începe lucrările autorizate sau poate solicita o autorizație de modificare.”
- (6) „În cazul justificat în care lucrările de construcții **nu pot fi finalizate conform duratei de execuție** stabilite prin autorizație, inițiatorul proiectului poate solicita autorității emitente prelungirea valabilității autorizației cu cel puțin 15 zile înaintea expirării acesteia, situație în care prelungirea valabilității autorizației se acordă pentru o perioadă de cel mult 12 luni.”
- (7) the extension is an administrative procedure attached to the same act.

And art. 310(5): „În cazul în care lucrările de construcții **nu pot fi începute ori nu pot fi executate integral** la termenul stabilit, investitorul poate solicita autorității emitente **prelungirea duratei de execuție** cu cel puțin **15 zile lucrătoare** înaintea expirării acesteia. Prelungirea duratei de execuție se acordă **o singură dată** și pentru o perioadă nu mai mare de **12 luni**, cu achitarea unei taxe de **30%** din valoarea taxei inițiale.”

**Reconciliation (Claude's reading)** — the law uses two different periods:
1. **The 3-year start window** (309(1)): you must start works within it, or the permit lapses (310(1)). **This window cannot be extended** (309(5)). Options inside it: start, suspend once ≤ 12 months (309(4)), or apply for an amendment permit (309(5), 293).
2. **The execution period** (309(2)): once works start and the start is notified, validity runs for the whole execution period in the permit. **This period can be extended once by ≤ 12 months** when works cannot be finished on time (309(6); 310(5)). 309(5) targets only the term "prevăzut la alin. (1)", so it does not bar 309(6).

**Remaining friction (for the architect)**:
- 309(6) says "cel puțin 15 zile"; 310(5) says "cel puțin 15 zile lucrătoare" and adds the 30% fee. Practical rule: file **at least 15 working days** before expiry and expect the 30% fee — this satisfies both.
- 310(5) also covers works that "nu pot fi începute". Read literally, that extends the execution period, not the start window, so it does not undo 309(5). The MDLPA Clarificări pct. 8 apply 310(5) to Law 50/1991 permits **not yet started but not expired** — i.e. the ministry reads 310(5) as available before the start. For CATUC permits, whether 310(5) can push back the start deadline is not settled by the text → architect question.
- If works are not finished within the validity: new permit (310(6)).

### Q23 — Ministerial orders implementing CATUC mentioned in the sources

| Order | Date | M.Of. Partea I | Approves | Where cited |
|---|---|---|---|---|
| **Ord. MDLPA nr. 975/2026** | 25.08.2026 | nr. 711 din 26.08.2026 | Models of the forms used in construction authorisation: urbanism certificate, building, demolition, amendment, regularisation permits, notification procedure, related forms | Portal note under art. 262; Clarificări pct. 1, 8 |
| **Ord. nr. 1.022/2026** | 28.08.2026 | nr. 724 din 28.08.2026 | Procedure for drawing up, amending/updating and approving spatial-planning and urbanism documentation, the forms used and the list of required avize (Annex 6 = forms) | Portal notes under art. 31, 55, 87; Clarificări pct. 1 |
| **Ord. nr. 3.167/2026** (ministrul culturii, per art. 283(7), 284(7)) | 27.08.2026 | nr. 717 din 27.08.2026 | (a) procedure for the Ministry of Culture written agreement for first-emergency interventions on monuments / buildings of architectural value (art. 283); (b) procedure for notifying and agreeing works under art. 284(4) | Portal notes under art. 283, 284 |
| Ord. 839/2009, Ord. 233/2016 (old norms for L.50 and L.350) | — | — | **Abrogated** by CATUC | art. 576(3) lit. d)–e); Clarificări pct. 2 |

Legal basis for secondary legislation: art. 578(2); entry into force is automatic and not conditional on it (art. 575(2)). The forms ministerial order is foreseen in art. 262(1) lit. a) and art. 295(10). No order other than these three is named in the local sources. The date and M.Of. issue of 1.022 and 3.167 come only from the Portal notes.

### Q24 — Studies and avize for a modular / prefab house with a foundation; does off-site manufacture change anything?

**Short answer: the route and the paperwork are the same as for a site-built house. Off-site manufacture adds product-documentation and assembly duties, not a different permit.** CATUC has no specific provision for modular or prefabricated buildings ("modular" and "industrializ" 0 hits; "prefabricat" only in technical execution provisions: art. 408, 412, 517, Annex 1).

**Under a building permit** (default route, art. 259):
- **Urbanism certificate** for building (art. 257) — lists the avize and studies required; avize are grouped by when they are obtained (art. 257(3)).
- **Studies (documentații complementare)**, requested through the CU, non-exhaustive list (art. 265(1)–(2)): geotechnical study (lit. a)); topographic study in Stereo 70, received by ANCPI (lit. d)); **NZEB compliance report** (lit. e)); environmental impact report where the EIA procedure applies (lit. f)); preliminary expert report on effects on neighbours, if needed (lit. b)).
- **Avize and acorduri** (art. 266(1)–(2)): set by location, complexity, risk and type and communicated through the CU — typically the location aviz for utility connections (lit. e)), the environmental authority's point of view (lit. f)), water management aviz where applicable (lit. h)), Ministry of Culture aviz in protected zones (lit. l)), neighbours' agreement where the law requires it (lit. m); art. 261).
- **Acord Unic**: optional single procedure through the Acord Unic commission, except avize under art. 266(2) lit. f)–h), l), m) (art. 269(1)).
- **PAC**: framework content Annex 2 (art. 264(3)); simplified Annex 3 for a rural single-family house up to P+M and 150 mp (art. 264(4)); architect with signing rights takes part (art. 264(8)).
- **Technical checking**: not needed for CC1 projects (art. 440(3)); Annex 6 lists P and P+1 single-family houses in CC1. Open architect question (art. 259(5) mentions verified works).

**Under notification** (rural house ≤ 150 mp, P/D+P, Q21): no technical checking (art. 298(2)); geotechnical **and** topographic studies mandatory (art. 298(3)).

**The foundation**: does not change the route for a house (the "fără fundație" condition matters only for art. 299(2)(c) outbuildings). The foundation design rests on the geotechnical study (art. 265(2) lit. a); art. 298(3)); the execution project contains the foundation plan and details (art. 508(4) lit. c)).

**What off-site manufacture adds**:
- Construction products must comply with EU/national marketing rules (art. 410(1)); harmonised products fall under Reg. (UE) 305/2011 (art. 559 lit. a)).
- The manufacturer/importer must hold, as applicable, the declaration of performance + CE marking, or the national declaration of conformity + technical approval (agrement tehnic) (art. 563(1) lit. a)–d)), in Romanian (art. 563(3)).
- Agrement tehnic is mandatory only for products without CE marking and declaration of performance (art. 561(5)); it can set conditions for transport and dismantling (art. 561(1)).
- Delivery with handling, storage and assembly instructions (art. 410(2)); assembly instructions for prefabricated structural and roof elements (art. 412(3)).
- Site organisation project (crane, storage, access) is subject to authorisation (art. 517(1)–(2), (4)); temporary occupation of the public domain with fee (art. 517(3)); road administrator's aviz where needed (art. 291(4) lit. c)).
- Demountable buildings and recovered elements are re-assessed technically before each reuse (art. 368(10)).
- **Not covered by CATUC**: road transport of oversized modules.

Whether a whole volumetric module is itself one "construction product" (one CE marking) or an assembly of products is not settled by the text (F3 §6.4, architect question).

### Q25 — Transitional rules for permits issued under Legea 50/1991, not started or not finished by 25.08.2026

**What the law says**:
- CATUC entered into force on 25.08.2026, automatically (art. 575(1)–(2)); Legea 50/1991 is abrogated (art. 576(3) lit. b)).
- CUs issued before entry into force **keep their validity**; permits are issued on their basis by the authority competent at CU issue or under the new code, based on the avize listed in those CUs (art. 582(4)); if competence moved, the new authority issues the permit on the valid CU (art. 582(5)).
- Urbanism / spatial-planning procedures started earlier stay under the law in force when they were initiated (art. 582(1)); the initiation date is the date the act starting the procedure was made known to third parties (art. 582(6)); missing avize may continue through the integrated commission (art. 582(2)).
- Partial receptions are possible under CATUC for works in progress on entry into force (art. 574).
- **The law has no express article on extending or renewing Law 50/1991 permits.** References to repealed provisions are read as references to CATUC (art. 583(3)).

**What the MDLPA Clarificări add** (ministry guidance, pct. 1, 2, 8):
- Applications registered **until 24.08.2026 inclusive** are decided under the law in force on registration (L.50/1991, L.350/2001 and their norms), on the old forms, with a note on art. 582. From **25.08.2026**: new forms (Ord. 975/2026; Annex 6 to Ord. 1.022/2026), citing the Code, even if the CU or aviz was issued under the old law; the merits are judged under the law applicable to the procedure.
- **Not started, not expired** / **started, cannot be finished on time**: the investor may ask **once** for an extension of the execution period of **up to 12 months**, at least **15 working days** before expiry, paying the fee — under **art. 310(5)** of the Code. From 25.08.2026 the request uses the Ord. 975/2026 extension form; the extension is written on the original permit.
- **Not finished within validity**: apply for a **new permit** (the Clarificări cite art. 310 alin. (7); the matching rule in the law text is art. 310(6)), **without a new CU and without new avize**; new form, merits under the applicable law, note on art. 582.
- **Change of brief** on an L.50 permit: new **amendment permit** under art. 293, new form.

**Practical for a ModulCA client with an old permit**: check the expiry date now; file any extension ≥ 15 working days before it, on the new form, with the 30% fee (art. 310(5)); if the start window has already passed, the permit has lapsed (art. 310(1)) and a new one is needed. Confirm with the issuing town hall — this rests on ministry guidance, not on an express transitional article.

---

## Part D — Effects on F2 / F3 and the spec

| File | Change made in 2.07 | Why |
|---|---|---|
| F2 `building-permit-process.new.md` §8 (RO + EN) | Added the MDLPA Clarificări transitional guidance (24.08.2026 registration rule; L.50 extension via art. 310(5); new permit without new CU/avize; amendment via art. 293) and named Ord. 975/2026 for the forms | Q25, Part A |
| F2 provenance | Orders now confirmed; architect points 2 and 4 updated with Q21/Q25 findings | Part A, Q21, Q25 |
| F3 `modular-prefab-regulations.new.md` provenance | Orders now confirmed (F3 text itself unchanged; it already applied the metropolitan exception to outbuildings only) | Part A |
| Spec §4 | 🟨 L.50 extension row → art. 310(5) + Clarificări; ⚠️ order rows → ✅; 4c notification row corrected (metropolitan exclusion only in pct. (i)) | Part A, Q21, Q25 |
| `2026-11-25-notebooklm-catuc-answers.md` | ITEM-7 rows → confirmed; B4/B5 annotated | B5 |
| Partner review list | Addendum: Q21, Q22 and the 310(6)/(7) numbering question | Q21, Q22, B2.11 |
| New chapter `src/knowledge/06-regulations/RO/catuc-169-2026.new.md` | Written (RO + EN) | Task 4 |

F2 §4.1 and F3 §2.2 already state the house conditions without a metropolitan exclusion, so Q21 needed no change to their body text.

## Part E — Script check

`node <scratchpad>/check.js <file>` (extracts every `art. N` / `art. N–M` / `Articolul N`, skips other acts, looks up the JSON then `text.md`):

- This file: see the commit message of 2.07 for the final counts (0 missing).
- Raw Q11–Q20: 77 articles, 0 missing.
