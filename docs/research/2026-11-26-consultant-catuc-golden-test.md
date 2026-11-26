# Consultant CATUC golden test — session 2.08 (BUG-ST13)

Date 2026-11-26 · Model `claude-sonnet-5-5`, effort low, Architect-tier stable prompt + `CATUC_FACTS` (`src/app/api/consultant/catucFacts.ts`), RAG = the two live pre-CATUC permit articles the smoke test pulled (flagged with the PRE-CATUC note). Script: scratchpad, not committed.

**Spend: $0.1087 (run 1, Q1–Q5) + $0.0429 (run 2, Q3–Q4 after fixes) = $0.152** (budget $0.30).

| # | Question | Articles expected | Result |
|---|---|---|---|
| Q1 | ST13: CATUC + modular house, rural intravilan | 575, 294(2)(a)(ii), 296, 298(2)–(3), 259, 264, 273, 309, 582 | ✅ all correct; says CATUC in force 25.08.2026; disclaimer |
| Q2 | 140 m², P, no basement, village → notification? studies? | 294(2)(a)(ii), 298(3), 296 | ✅ yes + geotech + topo mandatory |
| Q3 | P+1, 180 m², city → which act, validity? | AC 259, PAC 264, 273(1), 309(1),(4)–(6) | ✅ AC; 3 yrs non-extendable. Run 1 said tech checking applies → fixed: run 2 flags CC1 / art. 440(3) as under review |
| Q4 | EN: 15 m² timber shed, no foundation, rural | 299(2)(c) | ✅ no formalities, ≤20 m² cumulated, ≤2.5 m. Run 1 used RO disclaimer → fixed in run 2 (EN line) |
| Q5 | DTAC under Legea 50/1991 still valid? | 576(3)(b), 264, 583(3), 582 | ✅ repealed; PAC (fostul DTAC) |

Notes
- No "cannot confirm CATUC exists" in any answer; all say older library articles are being updated.
- The brief for 2.08 said "parter sau parter + mansardă"; the law text of art. 294(2)(a)(ii) says **"parter sau demisol și parter"** (P or D+P), no basement. The facts block follows the law text.
- Minor: Q4 cites a 0.6 m boundary setback from the Civil Code (not in our facts block) — plausible, not CATUC; left as is.

---

## Run 1 — full answers

# Q1: Ce spune CATUC (Legea 169/2026) despre autorizarea unei case modulare în intravilan rural? Am un teren într-o comună.
_in=2287 cw=3063 cr=0 out=1905 stop=end_turn cost=$0.0313_

# CATUC (Legea 169/2026) – casă modulară în intravilan rural

CATUC este în vigoare din **25.08.2026** (art. 575(1)). A abrogat Legea 50/1991, Legea 350/2001 și Ord. 839/2009. O casă modulară urmează aceleași rute ca orice casă; tipul de construcție (prefabricat/modular) nu schimbă procedura.

## Ruta 1: Notificare (procedură simplificată), art. 294(2)(a)(ii)

Casa poate intra pe notificare dacă îndeplinește **cumulativ**:
- o singură casă unifamilială, cu acces și parcelă proprii;
- regim **P** sau **D+P** (demisol + parter), **fără subsol**;
- **max. 150 m² suprafață desfășurată**;
- amplasată în **intravilanul unei localități rurale** (cazul terenului din comună, dacă e în intravilan);
- în afara zonelor protejate și a zonelor de protecție a monumentelor;
- conformă cu documentația de urbanism aprobată;
- proiectată fie după un proiect-tip public, fie ca proiect individual de o echipă de arhitecți cu drept de semnătură + ingineri structuriști și de instalații, urmând ghidul OAR de arhitectură rurală avizat de arhitectul-șef al județului.

**Termene:**
- aprobare tacită după **15 zile lucrătoare** de la primirea notificării (art. 296(1)(a));
- în aceleași 15 zile, autoritatea poate cere clarificări, poate cere AC sau poate respinge (art. 296(1)(b)–(e));
- lucrările încep la 15 zile calendaristice după acest termen (art. 296(6));
- execuția se face în maximum **3 ani** (art. 296(5)).

**Particularități:**
- nu se cere verificare tehnică (art. 298(2));
- **studiul geotehnic și releveul topografic sunt obligatorii** (art. 298(3)).

## Ruta 2: Autorizație de construire (AC)

Dacă nu îndeplinești condițiile de mai sus (P+1 sau P+M, subsol, peste 150 m², intravilan urban), ai nevoie de AC (art. 259):
- dosarul tehnic este acum **PAC** (art. 264), fostul DTAC; conținut-cadru în Anexa 2, iar Anexa 3 simplificată pentru gospodării rurale unifamiliale (art. 264(3)–(4));
- AC se emite în maximum **30 de zile calendaristice** de la dosarul complet (art. 273(1));
- valabilitate **3 ani** pentru începerea lucrărilor (art. 309(1)), neprelungibilă (art. 309(5)), dar suspendabilă o dată, max. 12 luni (art. 309(4)); după începerea lucrărilor, execuția poate fi prelungită o dată cu max. 12 luni, cu cerere depusă cu cel puțin 15 zile înainte de expirare (art. 309(2), (6)).

## Ce înseamnă pentru modulele ModulCA

Un modul de 3×3 m are ~9 m² brut. O casă de 150 m² desfășurați înseamnă aproximativ **16 module** (150 / 9 ≈ 16,6), deci, orientativ, maximum 16 module la parter. Configurațiile în linie, L sau U sunt posibile atât timp cât parcela, retragerile, POT și CUT din CU sunt respectate. Fundarea pe piloți metalici înșurububoți nu scutește de studiul geotehnic.

**Atenție:** terasele acoperite, pergolele sau bucătăria de vară din lemn, demontabile, fără fundație, max. 20 m² cumulat și 2,5 m înălțime, pot fi **fără formalități** (art. 299(2)(c)), dar numai ca anexe exterioare ale unei case unifamiliale.

## Puncte de verificat

1. **Certificatul de urbanism (CU)** al parcelei este decisiv: POT, CUT, regim de înălțime, retrageri, zone protejate.
2. Excluderea zonelor metropolitane din text se aplică doar anexelor ≤ 50 m² (art. 294(2)(a)(i)), nu casei din (ii). Interpretarea este încă în analiză la arhitectul nostru partener.
3. CU emise înainte de 25.08.2026 rămân valabile (art. 582(4)–(5)). Cererile înregistrate până la 24.08.2026 urmează legea veche.
4. Articolele mai vechi din bibliotecă (DTAC, Legea 50/1991) sunt în curs de actualizare. Puncte neacoperite aici, de exemplu avizele de utilități sub CATUC, nu sunt încă verificate în biblioteca noastră.

## Pași practici
- Cere CU și verifică dacă terenul este în intravilan și în afara zonelor protejate.
- Comandă studiul geotehnic și releveul topografic.
- Contactează un arhitect cu drept de semnătură familiarizat cu ghidul OAR de arhitectură rurală.
- Folosește pașii 2–3 din ModulCA (Land, Design) pentru a verifica încadrarea sub 150 m² desfășurați.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

---

# Q2: Casa mea modulară are 140 mp, parter, fără subsol, într-un sat (intravilan). Pot face doar notificare în loc de autorizație? Ce studii trebuie?
_in=2299 cw=0 cr=3063 out=1988 stop=end_turn cost=$0.0248_

# Notificare în loc de autorizație (CATUC, Legea 169/2026)

**Da, o casă de 140 mp, pe parter, fără subsol, în intravilanul unui sat, poate intra pe procedura simplificată prin notificare** (art. 294(2)(a)(ii)), dacă îndeplinește toate condițiile de mai jos.

## Condiții de eligibilitate
- **O singură locuință unifamilială**, cu acces propriu și parcelă proprie.
- **P sau D+P, fără subsol**, cu **maximum 150 mp suprafață desfășurată**. La 140 mp aveți o marjă de 10 mp, deci verificați cum se calculează suprafața desfășurată în proiect (pereți, terase acoperite etc.). Lăsați arhitectul să confirme că nu depășiți 150 mp.
- **Intravilan într-o localitate rurală**, în afara zonelor protejate și a zonelor de protecție a monumentelor.
- **Respectarea documentațiilor de urbanism aprobate** (POT, CUT, retrageri, regim de înălțime din CU/PUG/PUZ).
- **Proiectul** poate fi:
  - un proiect-tip public, sau
  - un proiect individual, realizat de o echipă de arhitecți cu drept de semnătură, plus ingineri de structură și instalații, conform ghidului OAR de arhitectură rurală, avizat de arhitectul-șef al județului.

## Studii obligatorii
Pentru această categorie de casă sunt **obligatorii (art. 298(3))**:
1. **Studiul geotehnic**
2. **Releveul topografic**

Pentru prefabricate pe piloți înșurubabili sau fundație continuă, studiul geotehnic stabilește și soluția de fundare. Verificarea tehnică de calitate **nu** este necesară (art. 298(2)).

Proiectul de structură și cel de instalații rămân necesare, pentru că echipa de proiectare include și specialiști în aceste domenii.

## Termene
| Etapă | Termen |
|---|---|
| Aprobare tacită după primirea notificării | **15 zile lucrătoare** (art. 296(1)(a)) |
| În același termen, autoritatea poate cere clarificări, poate cere AC sau poate respinge | art. 296(1)(b)–(e) |
| Începerea lucrărilor | la **15 zile calendaristice** după expirarea termenului (art. 296(6)) |
| Execuția lucrărilor notificate | maximum **3 ani** (art. 296(5)) |

## Puncte de atenție
- **Certificatul de urbanism** al parcelei este decisiv. Dacă satul se află în zonă protejată sau CU impune alte condiții, trebuie autorizație de construire (AC).
- **Zona metropolitană:** excluderea din text vizază doar anexele de maximum 50 mp (art. 294(2)(a)(i)), nu casa de la (ii). Acest punct este încă în analiza arhitectului nostru partener, deci confirmați la primărie.
- Dacă modificați ulterior proiectul (de exemplu, adăugați etaj sau subsol, ori depășiți 150 mp), pierdeți eligibilitatea și treceți pe AC (PAC, 30 de zile de la dosarul complet, art. 273(1)).
- Alte avize (utilități, branșamente) și cerințe de siguranță la incendiu nu sunt încă verificate în biblioteca noastră pe CATUC. Articolele ModulCA despre ele sunt în revizuire. Întrebați arhitectul și primăria ce se cere în cazul dumneavoastră.

## Pașii practici
1. Cereți **CU** pentru parcelă (cele emise înainte de 25.08.2026 rămân valabile, art. 582(4)–(5)).
2. Comandați **studiul geotehnic și releveul topografic**.
3. Angajați o echipă de proiectare cu drept de semnătură, care lucrează conform ghidului OAR rural.
4. Obțineți avizul arhitectului-șef al județului, dacă proiectul este individual.
5. Depuneți **notificarea** și așteptați cele 15 zile lucrătoare.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

---

# Q3: Vreau o casă P+1 de 180 mp în oraș. Ce act îmi trebuie acum, după 25.08.2026, și cât e valabilă autorizația?
_in=2294 cw=0 cr=3063 out=1385 stop=end_turn cost=$0.0187_

**Act necesar: autorizație de construire (AC)**, nu notificare.

**De ce nu se poate notifica (art. 294(2)(a)(ii) CATUC):** procedura simplificată e rezervată unei singure case unifamiliale P sau D+P, fără subsol, max 150 m² suprafață desfășurată, în intravilan **rural**. Proiectul dumneavoastră încalcă trei condiții: P+1, 180 m² (peste 150) și amplasament urban. Oricare dintre ele ar fi suficientă pentru a exclude notificarea.

**Ce presupune AC conform CATUC:**
- **Certificat de urbanism (CU):** obțineți CU pentru teren (POT, CUT, regim de înălțime, retrageri, lista avizelor). Un CU emis înainte de 25.08.2026 rămâne valabil și autorizația se emite pe baza lui (art. 582(4)-(5)).
- **Proiect:** se depune **PAC** (Proiectul pentru autorizarea construirii, art. 264), fostul DTAC, cu conținutul-cadru din Anexa 2. Anexa 3 (simplificată) este doar pentru gospodării rurale unifamiliale, deci nu vi se aplică.
- **Echipă de proiectare:** arhitect cu drept de semnătură, plus proiectant de structură și de instalații. Studiul geotehnic și releveul topografic sunt, în practică, necesare pentru fundare.
- **Termen de emitere:** maximum **30 de zile calendaristice** de la depunerea unui dosar complet (art. 273(1)).
- **Verificare tehnică:** scutirea din art. 298(2) vizează doar casele notificate, deci pentru AC rămân aplicabile verificările tehnice pe cerințele esențiale. Detaliile exacte pe CATUC nu sunt încă verificate în biblioteca noastră.

**Cât e valabilă autorizația:**
- **3 ani de la emitere** pentru a **începe** lucrările (art. 309(1)).
- Acest termen de 3 ani **nu poate fi prelungit** (art. 309(5)), dar poate fi **suspendat o singură dată, maximum 12 luni** (art. 309(4)).
- După începerea lucrărilor (cu start notificat), valabilitatea acoperă perioada de execuție (art. 309(2)). Aceasta se poate prelungi **o dată, cu maximum 12 luni**, la cerere depusă cu cel puțin 15 zile înainte de expirare (art. 309(6)).

Atenție: articolele noastre mai vechi indică o valabilitate de 12 luni (+12), dar acelea sunt pre-CATUC și depășite.

**Aspecte de planificat:**
- **Dacă se aplică vechea lege:** cererile înregistrate până la 24.08.2026 urmează legea veche, cele de la 25.08.2026 urmează CATUC.
- **Buget orientativ pentru proiectare:** în practica anterioară, arhitectură 2.000-6.000 EUR și structură 1.500-3.000 EUR. Sunt cifre pre-CATUC, de verificat cu proiectantul.
- **Încadrare modulară:** o casă modulară ModulCA urmează aceleași trasee ca orice altă casă. Pentru 180 mp pe două niveluri, modulele de 3×3 m se pot configura pe grilă, dar procedura rămâne AC.

**Întrebări de lămurit cu primăria / arhitectul-șef:**
1. Ce prevede CU privind POT, CUT și regimul de înălțime (P+1 permis?).
2. Există PUZ sau doar PUG pe zona dumneavoastră?
3. Lista exactă a avizelor cerute și forma verificării tehnice sub CATUC.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

---

# Q4: Do I need any permit for a 15 m² timber garden shed without foundation next to my rural house in Romania?
_in=2271 cw=0 cr=3063 out=1138 stop=end_turn cost=$0.0162_

**Short answer: most likely no permit and no notification, provided you stay within the limits of CATUC art. 299(2)(c).**

## Route: "No formalities" (art. 299(2)(c), Legea 169/2026)

Since 25.08.2026, rural outbuildings exterior to a single-family house (covered terraces, pergolas, summer kitchens, sheds, etc.) can be built **without any permit or notification** if they meet **all** of these conditions:

| Condition | Limit | Your case (15 m²) |
|---|---|---|
| Cumulated area | max **20 m²** | OK, with 5 m² left |
| Height | max **2.5 m** | Check: ridge/top point must be ≤ 2.50 m |
| Foundation | **none** | OK, no foundation |
| Nature | temporary, demountable | Must be bolted/screwed, removable |
| Structure | timber or metal | OK, timber |
| Location | rural, next to a single-family house | OK |

## Points to watch

1. **The 20 m² is cumulated.** It covers all such outbuildings on the plot (shed + pergola + covered terrace + summer kitchen). If you already have, for example, a 10 m² pergola, the 15 m² shed would bring you to 25 m² and exceed the limit.
2. **Height is measured at the highest point.** A mono-pitch roof with a 2.3 m front and 2.7 m back would fail. Design to ≤ 2.50 m overall.
3. **"No foundation" in practice.** Use removable supports (concrete pads laid on the ground, adjustable feet, or screw piles that can be taken out). Poured strip or slab foundations would take you out of the exemption. Screw piles are generally a grey area, so confirm locally.
4. **Not a dwelling.** No permanent habitation, and no fixed connections to water or sewage that make it a permanent building.
5. **Still binding:** the exemption concerns the permit procedure, not the substantive rules. Check setbacks from boundaries (usually 0.6 m minimum under the Civil Code and local PUG/PUZ rules, often more), POT/CUT, and fire distances to neighbours.
6. **Protected areas.** In monument protection zones or protected areas, local restrictions may apply. Check your urbanism certificate or ask the primărie.

## If you exceed the limits

- Above 20 m², over 2.5 m, or with a foundation, it is no longer under art. 299. It would generally need a building permit (AC), or notification if it qualifies under art. 294. For an outbuilding, the exact route should be confirmed with the primărie.
- Building without a permit where one is required exposes you to the regularisation route (art. 301), with fines and possible demolition orders.

## Recommended steps

1. Request a **certificate of urbanism (CU)** or an informative letter from the primărie confirming that the plot is in the rural intravilan and giving POT/CUT and setbacks.
2. Keep a simple sketch with the dimensions and a description of the demountable structure, in case of inspection.
3. Ask the primărie in writing whether they apply art. 299(2)(c) to your case. Implementation practice is still settling, and our CATUC articles are under review by a partner architect.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

---

# Q5: Arhitectul meu vorbește de DTAC după Legea 50/1991. Mai e valabil? Cum se numește acum documentația?
_in=2283 cw=0 cr=3063 out=1275 stop=end_turn cost=$0.0176_

Nu, nu mai este valabil. **Legea 50/1991 a fost abrogată** (art. 576(3) lit. b din CATUC) și înlocuită de **Codul amenajării teritoriului, urbanismului și construcțiilor – Legea nr. 169/2026** (M.Of. nr. 661/10.08.2026), în vigoare din **25.08.2026**.

## Cum se numește acum documentația

**DTAC → PAC – Proiectul pentru autorizarea construirii** (art. 264 CATUC).

- Conținutul-cadru este în **Anexa 2** la CATUC.
- Pentru locuințe unifamiliale din mediul rural există un conținut simplificat în **Anexa 3** (art. 264(3)–(4)).
- Referințele din alte acte normative la dispozițiile abrogate se citesc ca trimiteri la CATUC (art. 583(3)). Deci, în practică, „DTAC" se înlocuiește cu „PAC".

## Ce lege se aplică dosarului tău

- Cererile **înregistrate până la 24.08.2026** urmează legea veche (conform clarificărilor MDLPA).
- Cererile depuse **de la 25.08.2026** urmează CATUC.
- **Certificatele de urbanism emise înainte de 25.08.2026 rămân valabile**, iar autorizația se emite pe baza lor (art. 582(4)–(5)).

Deci dacă arhitectul tău încă spune „DTAC după Legea 50/1991", fie lucrează cu un dosar depus înainte de 25.08.2026, fie folosește terminologie depășită. Întreabă-l concret care dintre cele două situații este.

## Alte aspecte care s-au schimbat

- **Autorizația de construire (AC)** se emite în maximum **30 de zile calendaristice** de la depunerea unui dosar complet (art. 273(1)).
- **Valabilitatea AC este de 3 ani** de la emitere, pentru începerea lucrărilor (art. 309(1)). Termenul nu poate fi prelungit (art. 309(5)), dar poate fi suspendat o dată, maximum 12 luni (art. 309(4)). Vechea regulă „12 luni + 12" nu se mai aplică.
- Pentru o casă unifamilială **P sau D+P, fără subsol, max 150 mp desfășurați, în intravilanul unei localități rurale**, există varianta **notificării** (art. 294(2)(a)(ii)). Aceasta se aprobă tacit în 15 zile lucrătoare (art. 296(1)(a)) și nu necesită verificare tehnică (art. 298(2)). Studiul geotehnic și releveul topografic rămân obligatorii (art. 298(3)). Dacă proiectul tău este o casă modulară cu parter, merită verificat dacă te încadrezi.

## Ce să verifici cu arhitectul

1. Când a fost înregistrată (sau va fi) cererea: înainte sau după 25.08.2026?
2. Ce CU ai și când a fost emis?
3. Proiectul este în format PAC, conform Anexei 2 sau 3?
4. Te încadrezi pe notificare sau ai nevoie de AC?

Articolele noastre din bibliotecă care folosesc încă termenul DTAC și Legea 50/1991 sunt în curs de actualizare. Pentru detaliile care nu sunt încă verificate la noi, ghidează-te după CU și după arhitectul cu drept de semnătură.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

TOTAL $0.1087

## Run 2 — Q3, Q4 after fixes

# Q3: Vreau o casă P+1 de 180 mp în oraș. Ce act îmi trebuie acum, după 25.08.2026, și cât e valabilă autorizația?
_in=2294 cw=3214 cr=0 out=1441 stop=end_turn cost=$0.0270_

**Răspuns scurt:** pentru o casă P+1 de 180 mp în oraș (intravilan urban) vă trebuie **autorizație de construire (AC)** conform CATUC (Legea 169/2026), în vigoare din 25.08.2026. Procedura prin notificare nu se aplică.

## De ce nu poți folosi notificarea
Art. 294(2)(a)(ii) permite notificarea doar dacă sunt îndeplinite **toate** condițiile: o singură locuință unifamilială, P sau D+P, fără subsol, max 150 m² suprafață desfășurată, în intravilanul unei localități **rurale**. Proiectul tău nu respectă trei condiții:
- este **P+1** (nu P sau D+P),
- are **180 mp** (peste 150 m²),
- este în **oraș** (nu în localitate rurală).

Nici varianta „fără formalități" (art. 299) nu se aplică, fiindcă ea acoperă doar reparații și anexe mici de max 20 m².

## Ce presupune AC
- **Documentația:** **PAC – Proiectul pentru autorizarea construirii** (art. 264), fostul DTAC, cu conținutul-cadru din Anexa 2. Varianta simplificată din Anexa 3 este doar pentru gospodării rurale unifamiliale, deci nu o puteți folosi.
- **Certificatul de urbanism (CU):** dacă l-ați obținut **înainte de 25.08.2026**, rămâne valabil și autorizația se emite pe baza lui (art. 582(4)–(5)). Conform clarificărilor MDLPA, cererile înregistrate până la 24.08.2026 urmează legea veche, cele depuse de la 25.08.2026 urmează CATUC.
- **Termen de emitere:** maximum **30 de zile calendaristice** de la depunerea unui dosar complet (art. 273(1)).
- **Echipa de proiectare:** arhitect cu drept de semnătură, plus ingineri de structură și instalații.

## Cât e valabilă autorizația
- **3 ani de la emitere** pentru a **începe** lucrările (art. 309(1)).
- Acest termen **nu poate fi prelungit** (art. 309(5)), dar poate fi **suspendat o singură dată, maximum 12 luni** (art. 309(4)).
- După începerea lucrărilor (cu start notificat), valabilitatea acoperă perioada de execuție (art. 309(2)). Aceasta poate fi prelungită **o singură dată, cu maximum 12 luni**, la cerere depusă cu cel puțin **15 zile înainte de expirare** (art. 309(6)).

Atenție: articolele mai vechi din bibliotecă indică o valabilitate de 12 luni (prelungibilă cu 12). Acestea sunt pre-CATUC și se actualizează, așa că folosiți termenele de mai sus.

## Verificarea tehnică (încă neclarificată)
Anexa 6 încadrează casele unifamiliale P și P+1 la **clasa de importanță CC1**, iar art. 440(3) spune că proiectele CC1 nu necesită verificare tehnică. Dacă o casă CC1 construită pe bază de AC are totuși nevoie de referate de verificare, nu este încă stabilit. Subiectul este în analiză la arhitectul nostru partener, așa că nu pot confirma niciuna dintre variante. Întrebați proiectantul și autoritatea emitentă.

## Pași practici
1. Cereți sau verificați **CU** (POT, CUT, regim de înălțime, retrageri, lista avizelor).
2. Comandați **studiul geotehnic** și **releveul topografic**.
3. Elaborați **PAC** cu arhitect, inginer structurist și proiectanți de instalații.
4. Obțineți avizele din CU și depuneți dosarul.
5. Începeți lucrările în cei 3 ani de la emitere și notificați startul.

*Informativ, nu consultanță juridică. Verificați certificatul de urbanism al terenului și consultați un arhitect cu drept de semnătură.*

---

# Q4: Do I need any permit for a 15 m² timber garden shed without foundation next to my rural house in Romania?
_in=2271 cw=0 cr=3214 out=1104 stop=end_turn cost=$0.0159_

Most likely **no permit and no notification**, provided the shed fits the closed list in CATUC (Legea 169/2026), art. 299(2)(c).

## The conditions (all must be met)

Art. 299(2)(c) exempts rural outbuildings exterior to a single-family house (covered terraces, pergolas, summer kitchens, sheds, etc.) if they are:

| Criterion | Limit | Your shed |
|---|---|---|
| Cumulated area | max **20 m²** | 15 m² ✔ (but see below) |
| Height | max **2.5 m** | Check: roof ridge/highest point must be ≤ 2.5 m |
| Foundation | **none** | ✔ Use concrete pads, ground screws or sleepers laid on grade, not a poured slab or strip footing |
| Character | temporary, demountable | Bolted/screwed connections, no permanent anchoring |
| Structure | timber or metal | ✔ |

## Points that commonly trip people up

1. **The 20 m² is cumulated.** If you already have, or plan, a pergola, summer kitchen or another shed next to the house, all of them together must stay within 20 m². With a 15 m² shed you have only 5 m² left for anything else.
2. **Height of 2.5 m is measured to the highest point.** A mono-pitch roof is easier to keep under the limit than a gable roof.
3. **"Rural" and "outbuilding of a single-family house"** The shed must serve the house and be located on the same plot. The text for no-formality works is tied to rural localities.
4. **Foundation detail matters.** A concrete slab, even thin, can be read as a foundation and push the shed out of art. 299. Choose a floor on a timber frame over point supports.
5. **Do not use it as a dwelling.** Adding sleeping space, plumbing or a connection that turns it into habitable space changes the category, and then you need a notification or AC.

## What the exemption does not remove

- **Urbanism rules still apply.** Being free of permit formalities does not override the approved urbanism documentation (POT, setbacks from boundaries and road, protected zones). Check your certificate of urbanism or the local regulation for the plot. Setbacks from neighbors (and Civil Code rules on distances) still matter.
- **Protected areas and monument zones** may impose their own approvals. Check if your house is in or near one.
- **Cadastre:** a temporary demountable shed normally does not need to be registered, but check with your local OCPI if in doubt.

## If the shed exceeds the limits

- Over 20 m² cumulated, over 2.5 m, or on a foundation: it leaves art. 299 and generally requires a building permit (AC) as an annex, with a PAC file.
- Building it without a needed permit exposes you to a regularisation permit procedure (art. 301) and potential fines.

## Practical recommendation

Before building, ask the primărie (urbanism office) for a short written confirmation or the plot's urbanism information that no formalities are needed for the shed. Also note that the old Legea 50/1991 rules (including references in older articles) were repealed on 25.08.2026, so anything you read written under that law may be outdated.

*Informational only, not legal advice. Check the urbanism certificate for your plot and consult an architect with signing rights.*

TOTAL $0.0429
