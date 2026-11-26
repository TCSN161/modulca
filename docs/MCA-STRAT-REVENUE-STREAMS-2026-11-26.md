# MCA-STRAT-REVENUE-STREAMS-2026-11-26: toate sursele de venit, pe grupuri și perioade

**Status**: Direcție propusă de MAIN din ideile lui Costin (26 nov). De validat cu date din beta înainte de orice investiție.
**Owner**: Chat 10 Business (cercetare, plan) · MAIN (decizii) · execuție pe grupurile din §2
**Legat de**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-26]] · [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] §5 · [[MCA-DOC-SESSION-MAP]]

Principiu: **un singur utilizator, mai multe momente în care plătește sau aduce un comision**. Funnel-ul: conținut / checker CATUC → cont gratuit → design → randări → plan plătit → teren, produse, constructor, finanțare → casa modulară.

---

## 1. Sursele de venit

| # | Sursă | Cine plătește | Model | Exemplu de venit | Risc / condiție |
|---|---|---|---|---|---|
| R1 | **Abonamente** (Premium, Architect, Constructor) | Utilizatorul | lunar €19,99 / €49,99 / €149,90 | sursa de bază | Stripe live (ian) |
| R2 | **Randări: revânzare cu marjă** (agregator) | Utilizatorul (inclus în plan sau pachete extra) | cost motor ~€0,001–0,05 → preț inclus în plan / pachete „+50 randări” | marjă 3–10× pe motoarele ieftine | **Rezerva de randări** (§3); motoare multe și funcționale |
| R3 | **Pachete de documente CATUC** | Proprietarul | €9–29 / pachet | strategie CATUC §5 | conținut validat de Vlad |
| R4 | **Recomandare arhitect** | Arhitectul partener / clientul | taxă fixă sau % | doar dacă OAR permite | întrebare deschisă la Vlad |
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
