# MCA-STRAT-REVENUE-STREAMS-2026-11-26: toate sursele de venit, pe grupuri și perioade

**Status**: Direcție propusă de MAIN din ideile lui Costin (26 nov). **Actualizat 27 nov de Chat 10 (sesiunea 10.01) cu cercetare: §6–§9.** De validat cu date din beta înainte de orice investiție.
**Owner**: Chat 10 Business (cercetare, plan) · MAIN (decizii) · execuție pe grupurile din §2
**Legat de**: [[MCA-STRAT-BUSINESS-PLAN-v0]] · [[MCA-STRAT-BUSINESS-RESEARCH-2026-11-27]] (surse) · [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26]] · [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] §5 · [[MCA-DOC-SESSION-MAP]]

Principiu: **un singur utilizator, mai multe momente în care plătește sau aduce un comision**. Funnel-ul: conținut / checker CATUC → cont gratuit → design → randări → plan plătit → teren, produse, constructor, finanțare → casa modulară.

---

## 1. Sursele de venit

| # | Sursă | Cine plătește | Model | Exemplu de venit | Risc / condiție |
|---|---|---|---|---|---|
| R1 | **Abonamente** (Premium, Architect, Constructor) | Utilizatorul | lunar €19,99 / €49,99 / €149,90 | sursa de bază | Stripe live (ian) |
| R2 | **Randări: revânzare cu marjă** (agregator) | Utilizatorul (inclus în plan sau pachete extra) | cost motor ~€0,001–0,05 → preț inclus în plan / pachete „+50 randări” | marjă 3–10× pe motoarele ieftine | **Rezerva de randări** (§3); motoare multe și funcționale |
| R3 | **Pachete de documente CATUC** | Proprietarul | €9–29 / pachet | strategie CATUC §5 | conținut validat de arhitectul partener |
| R4 | **Recomandare arhitect** | Arhitectul partener / clientul | taxă fixă sau % | doar dacă OAR permite | întrebare deschisă la arhitectul partener |
| R5 | **Mobilier și materiale: afiliere** | Magazinul / producătorul | 3–10% comision pe vânzare (programe de afiliere: eMAG, Dedeman, IKEA, 2Performant etc.) | pe fiecare listă de produse din proiect | marcaj „link afiliat” (lege + încredere) |
| R6 | **Teren: marketplace** | Vânzătorul / agentul | listare plătită (€10–50) sau comision la vânzare (1–2%) | teren + proiect posibil = argument unic | contract de intermediere; verificat juridic |
| R7 | **Constructori / executanți: director** | Firma | cont lunar (€29–99) + taxă pe lead sau % din lucrare | lead-uri calificate (au deja proiect + buget) | contracte, verificare firme, recenzii |
| R8 | **Producători de module** | Producătorul | % din comandă sau taxă pe lead | cea mai mare valoare/tranzacție | grup 13 când apar parteneri concreți |
| R9 | **Finanțare și asigurări** | Banca / brokerul | comision de recomandare (credit ipotecar, asigurare locuință) | | parteneriat cu broker autorizat |
| R10 | **Energie** (fotovoltaice, pompe de căldură) | Instalatorul | lead fee / comision | se leagă de „casa pasivă” | |
| R11 | **Conținut și educație** | Arhitecți / public | webinare, cursuri CATUC, sponsorizări pe canal | | după canal (ian) |
| R12 | **White-label / B2B** | Producători, firme | configuratorul cu brandul lor, licență lunară | | după lansare |

## 2. Pe grupuri: cine construiește ce

| Grup | Sursele de care se ocupă |
|---|---|
| 4 Billing | R1, R2 (pachete extra, rezerva de randări, contabilitate pe surse), R3 plată, comisioane în Stripe Connect (R6–R8, mai târziu) |
| 3 Engines | R2: cât mai multe motoare, împărțite pe tipuri de client, costul real per randare |
| 5 Design + Drawings | R5 (produsele din proiect cu link afiliat), R6 (teren → proiect), interfața pentru R7 |
| 2 Neufert | R3 (documente CATUC), R11 (conținut juridic) |
| 6 Marketing | R11, funnel-ul de conținut, comunicarea fiecărei surse |
| 7 Partners | R4, R5 (programe de afiliere), R6–R10 (contracte cu parteneri) |
| 8 Express | Express ca intrare rapidă în funnel (R1, R2) |
| **13 Marketplace & Parteneri** (candidat) | Pornește când avem primii parteneri concreți pentru R6–R10: un singur loc pentru teren, constructori, producători, finanțare |
| 1 MAIN | Prioritizare, verificare juridică pe fiecare sursă înainte de lansare |

## 3. Rezerva de randări (R2): cum ne asigurăm că avem mereu bani pentru ce am promis

1. **La fiecare plată**, o parte fixă intră automat într-un „cont” intern de randări. Ex.: 20% din Premium = €4/lună → ~100–1.000 randări la motoarele ieftine. Înregistrat în baza de date (registru pe sursă), nu un cont bancar separat.
2. **Prag de alarmă**: când soldul unui motor plătit (Leonardo, Stability, Replicate…) scade sub o sumă, MAIN primește alertă (ops:check / email); reîncărcarea o face Costin, pentru că furnizorii nu permit reîncărcare automată fără card salvat.
3. **Ordinea motoarelor pe tip de client**: gratuit/beta = doar motoare gratuite; Premium = gratuite + ieftine; Architect/Constructor = cele cu control de structură primele. Marja rămâne pozitivă pe fiecare plan.
4. **Raport lunar**: venit pe plan vs cost randări → marja reală; ajustăm cotele.

Owner: Chat 4 (registrul + pragurile) + Chat 3 (costul real per motor). Când: ian (odată cu Stripe live).

## 4. Pe perioade

| Perioadă | Ce facem | Venit așteptat |
|---|---|---|
| **Beta (15 dec – 15 ian)** | Nimic tranzacționat. Validăm: ce folosesc oamenii, ce ar plăti (chestionar), clicuri pe produse | €0 (date) |
| **Pre-lansare (ian)** | Stripe live (R1), pachete extra randări (R2), afiliere mobilier și materiale (R5, ușor: doar link-uri), rezerva de randări | primele abonamente |
| **Lansare → martie** | Pachete documente CATUC (R3), director constructori v0 (R7: cont lunar), teren v0 (R6: listări) | |
| **Q2 2027** | Comisioane prin Stripe Connect (R6–R8), finanțare (R9), energie (R10), producători | |
| **H2 2027** | White-label (R12), cursuri (R11) | |

## 5. Ce trebuie verificat înainte de fiecare sursă

- **Juridic**: comisioane în construcții și imobiliare (contracte, facturare), marcarea link-urilor afiliate, regula OAR pentru arhitecți (R4), GDPR pentru lead-uri (R7–R10).
- **Încredere**: recomandăm ce e bun pentru client, nu doar ce aduce comision; fiecare recomandare plătită e marcată.
- **Cost**: niciun parteneriat nu cere investiție înainte de date din beta (plafonul de €50/lună rămâne până la venit).

---

## 6. Ce a găsit cercetarea (27 nov, Chat 10) — pe scurt

Detalii și linkuri: [[MCA-STRAT-BUSINESS-RESEARCH-2026-11-27]] §4. ✅ = publicat · 🟡 = estimare · ❓ = de verificat.

| # | Ce credeam (§1) | Ce am găsit | Corecție |
|---|---|---|---|
| R1 | €19,99 / 49,99 / 149,90 | Analogi: B2C $5–20, pro $24–159/lună ✅ | Premium e la limita de sus pentru public; Constructor e sub Cedreo Enterprise ($159) → ok. **Architect/Constructor pot pierde bani la plafoanele zilnice** → plafon lunar de cost = 30% din preț (plan v0 §5) |
| R2 | marjă 3–10× | Cost: gratuit → $0,005 (BUDGET) → $0,02–0,065 ✅ intern | Pachet „+50 randări” la €4,99 pe BUDGET = marjă > 20×; pe PREMIUM ($0,065) doar ~1,5× → pachetele se vând **pe motoare ieftine**, cele scumpe rămân în plan |
| R3 | €9–29 | Niciun serviciu RO găsit cu preț public; onorariul de proiect 20–30 €/m² 🟡 | Prețul rămâne; e < 1,5% din onorariu → ușor de vândut ca „pregătire pentru arhitect” |
| R4 | taxă / % | Cod OAR: fără semnătură de complezență; regula pe recomandări ❓ | **Nicio taxă** până răspunde arhitectul partener (Chat 7). Gratuit, ca serviciu de încredere |
| R5 | 3–10% | eMAG/Profitshare **1–20%** pe categorii; istoric bricolaj 3–6%, mobilier ~4%; cookie 2–15 zile ✅. Dedeman, Hornbach, Leroy Merlin, IKEA RO: fără program public găsit ❓ | **Realist 3–5%**, cookie scurt → venit mic per utilizator, dar zero cost de pornire |
| R6 | €10–50 listare sau 1–2% | Agenții: 2–5% total, negociabil ✅; doar 25–30% din tranzacții trec prin agenți. Tarife de listare pe portaluri ❓ | Comisionul la vânzare = intermediere → **CAEN 6831 + contract**. Mutat în H2 |
| R7 | €29–99/lună + lead | UK £30+/lună + £5–40/lead; US $15–85/lead; RO (Daibau): abonament anual ✅ | Ok. Diferențierea: **lead exclusiv, cu proiect și buget**, max 3 firme |
| R8 | % sau lead | Fără reper public; casă €60–150k → 1–3% = €600–4.500 🟡 | **Cea mai mare valoare per tranzacție** → pilot cu 1 producător în Q2 |
| R9 | comision de recomandare | Brokerul e plătit de bancă (OUG 52/2016), gratuit pentru client 🟡 | Doar **recomandare către un broker autorizat**, cu contract; noi nu intermediem credite |
| R10 | lead fee | UK £7–75/lead (PV £8–30, pompe sol-apă £35–75) ✅; RO ❓ | Se potrivește cu „casa pasivă”; Q2 |
| R11–R12 | după lansare | Niciun producător RO găsit cu configurator public 🟡 | R12 are piață; după 3 luni de produs stabil |

## 7. Clasament: potențial × ușurință × încredere (1–5 fiecare)

| # | Potențial | Ușurință | Încredere | **Scor** | Perioadă |
|---|---|---|---|---|---|
| R1 Abonamente | 4 | 4 | 5 | **80** | lansare |
| R3 Pachete CATUC | 3 | 4 | 4 | **48** | lansare → martie |
| R5 Afiliere | 3 | 5 | 3 | **45** | lansare |
| R2 Pachete randări | 2 | 5 | 4 | **40** | lansare (add-on la R1) |
| R8 Producători | 5 | 2 | 4 | **40** | pilot Q2 |
| R7 Constructori | 4 | 3 | 3 | **36** | Q2 |
| R10 Energie | 3 | 3 | 4 | **36** | Q2 |
| R12 White-label | 4 | 2 | 4 | **32** | H2 |
| R11 Educație | 2 | 3 | 5 | **30** | H2 |
| R9 Finanțare | 3 | 3 | 3 | **27** | Q2 (recomandare) |
| R6 Teren | 3 | 2 | 3 | **18** | H2 |
| R4 Arhitect | 2 | 2 | 2 | **8** | doar după răspunsul despre OAR |

**Pe perioade (înlocuiește §4 unde diferă):**

| Perioadă | Pornim | Măsurăm |
|---|---|---|
| Beta (15 dec – 15 ian) | nimic plătit | intenția de plată (chestionar), clicuri pe produse, checker → configurator |
| Lansare (feb) | R1 + pachete R2, linkuri R5 marcate | conversie, cost / venit |
| Martie | R3 pachete CATUC | cumpărări per utilizator al checker-ului |
| Q2 2027 | R8 pilot (1 producător), R7 v0, R10, R9 recomandare | lead-uri acceptate de parteneri |
| H2 2027 | R6 (cu CAEN 6831), R12, R11 | venit pe sursă |

## 8. Primele 3 surse de pornit și pașii următori

| # | De ce | Pași concreți | Owner |
|---|---|---|---|
| **R1 (+ pachete R2)** | ~80% din venitul anului 1 în orice scenariu | 1) Stripe live (ian). 2) **Plafon lunar de cost per utilizator** = 30% din preț, cu trecere pe motoare ieftine. 3) Rezerva de randări 20% / 15% / 15% (plan v0 §5). 4) Pachet „+50 randări” la €4,99, doar pe motoare BUDGET. 5) Prețurile B2B afișate „+TVA” | **Chat 4** (plafoane, rezervă, pachete) · Chat 3 (costul real per motor) |
| **R3 Pachete CATUC** | singurul produs fără concurent cu preț public; leagă funnel-ul de conținut | 1) Lista finală de documente pe pachet (CU, notificare, declarații). 2) Validare de arhitectul partener. 3) Generare PDF (PermitTracker). 4) Plată unică €9 / €19 / €29 | **Chat 2** (conținut) · Chat 5 (PDF) · Chat 4 (plată) · Chat 6 (comunicare) |
| **R5 Afiliere** | zero cost, doar linkuri pe produsele din proiect | 1) **Costin** își face cont de afiliat pe Profitshare și 2Performant (gratuit) și verifică grilele reale. 2) Lista magazinelor cu program (eMAG, eMobili etc.). 3) Linkuri pe lista de produse din proiect + marcaj „link afiliat”. 4) Paragraf în Termeni | Costin (conturi) · **Chat 7** (programe) · Chat 5 (UI) · Chat 2 (textul din Termeni) |

## 9. Trebuie un grup separat dincolo de Chat 10?

**Da, dar nu acum.** Chat 10 face cercetarea, planul și prețurile propuse; nu construiește și nu semnează contracte.

- **R6–R10 (teren, constructori, producători, finanțare, energie)** au nevoie de același lucru: contracte cu parteneri, verificarea firmelor, consimțământ GDPR per partener, Stripe Connect, un panou pentru parteneri. Asta e exact **grupul 13 Marketplace & Parteneri** (candidat). **Pornire propusă: când avem 1 producător de module dispus să facă pilotul R8, țintă aprilie 2027.** Până atunci, Chat 7 ține discuțiile și Chat 5 interfața.
- **R12 White-label** poate sta la început în grupul 13 (același tip de client: producători, constructori). Grup separat doar dacă apar ≥ 3 clienți white-label.
- **Juridic**: R5, R6, R9 și GDPR pentru lead-uri cer un jurist înainte de lansare. Nu e un grup nou; e o întrebare pe care MAIN o rutează (Chat 2 are textul juridic, Chat 7 contactele).
- **Nu propunem** un grup separat pentru R1–R3, R5 și R11: rămân la grupurile din §2.
