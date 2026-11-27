# MCA-STRAT-BUSINESS-PLAN-v0: ModulCA, planul de afaceri v0

**Status**: v0 (Chat 10 Business, sesiunea `10.01.Business_Revenue-Research-Business-Plan-v0_20261126`, 27 nov 2026). De revăzut după beta (15 ian 2027) cu date reale.
**Owner**: Chat 10 Business · decizii: Costin / MAIN
**Legat de**: [[MCA-STRAT-BUSINESS-RESEARCH-2026-11-27]] (surse și cifre) · [[MCA-STRAT-REVENUE-STREAMS-2026-11-26]] (R1–R12) · [[MCA-STRAT-2026-11-19-reboot]]

**Regula cifrelor**: tot ce e proiecție e 🟡 **estimare**. Cifrele de piață au sursa în documentul de cercetare. Nimic de aici nu e promisiune pentru investitori până nu îl confirmă beta.

---

## 1. Problema

| Pentru cine | Problema |
|---|---|
| Familia care vrea o casă | Nu știe ce casă își permite pe terenul ei, cât costă, ce acte îi trebuie. **CATUC 169/2026** (în vigoare din 25.08.2026) a schimbat procedurile, iar aproape nimeni nu l-a citit. Un proiect clasic costă 20–30 €/m² și durează luni până la primul desen. |
| Arhitectul / firma mică | Pierde timp cu clienți care nu știu ce vor; n-are unelte ieftine pentru variante rapide, randări și ciorne de acte CATUC. |
| Producătorul de case modulare | N-are configurator; clienții vin cu întrebări, nu cu un proiect și un buget. |

## 2. Soluția

modulca.eu: configurator modular (module de 3×3 m) → randări AI din vederea 3D → verificare CATUC („ce procedură îmi trebuie?”) → ciorne de acte → arhitect partener pentru ce cere semnătură → casa modulară (producător, constructor, finanțare).

## 3. Segmente de clienți

| Segment | Mărime (🟡) | Ce plătește | Plan |
|---|---|---|---|
| Familii care construiesc (RO) | ~35.000 autorizații rezidențiale/an, ~70% rural; ~3.500/an caută online | Premium, pachete CATUC, comisioane (R5–R10) | Premium €19,99 |
| Arhitecți, firme mici de proiectare | câteva mii de birouri în RO ❓ | Unelte pro, ciorne CATUC, randări | Architect €49,99 |
| Constructori, producători de module | sute de firme ❓ | Configurator cu brandul lor, lead-uri | Constructor €149,90 / white-label |

## 4. Propunerea de valoare

**„Casa ta modulară, legal și cu preț, în câteva ore, nu în câteva luni.”** Ce nu face nimeni altcineva în RO, din ce am găsit: configurator modular + randări din propria vedere 3D + CATUC explicat și ciorne de acte, într-un singur cont. Niciun producător RO găsit n-are configurator public.

## 5. Economia pe unitate, pe plan (lunar, €)

Ipoteze: comision Stripe ~1,5% + €0,25 pe card UE (🟡 de confirmat de Chat 4); costuri randări din `docs/MCA-DOC-AI-ENGINES-EXTENDED-2026-11.md` §3; costul consultantului AI e 🟡 estimare (de confirmat cu Chat 2 la prețurile curente); „realist” = utilizare tipică presupusă, „la plafon” = utilizatorul folosește toate limitele din `src/features/auth/types.ts`.

| | Premium | Architect | Constructor |
|---|---|---|---|
| Preț | 19,99 | 49,99 | 149,90 |
| Stripe | 0,55 | 1,00 | 2,50 |
| Randări, realist | 0,10 (50 randări, mai ales gratuite) | 3,70 (200 × $0,02) | 8,30 (300 × $0,03) |
| Consultant AI, realist | 0,50 (GPT-mini) | 6,00 (~300 mesaje Claude) | 15,00 |
| Hosting (cotă) | ~€50–100/lună fix, împărțit la toți plătitorii → < €1 de la 100 de plătitori | | |
| **Marjă de contribuție, realist** | **≈ €18,8 (94%)** | **≈ €39,3 (79%)** | **≈ €124 (83%)** |
| Randări la plafon | 50 × $0,005 = 0,23 | 200 × $0,02 = 3,70 | **100/zi × 30 × $0,065 ≈ €180** |
| Consultant la plafon | 60/zi → ~€3–4 | **200/zi Claude → ~€100+** | **1.000/zi → sute de €** |
| **Marjă la plafon** | **≈ €15 (76%)** | **negativă** | **negativă** |
| **Rezerva de randări propusă** | **20% = €4,00** | **15% = €7,50** | **15% = €22,50** |

**Constatare importantă (pentru Chat 4)**: Architect și Constructor pot pierde bani dacă un singur utilizator folosește limitele zilnice tot luna. Propunere: **plafon lunar de cost per utilizator = 30% din preț** (€6 / €15 / €45). Peste plafon, motoarele scumpe trec automat pe cele ieftine/gratuite (deja prevăzut ca „fallback-down” în §3.4 din doc-ul de motoare), fără să blocăm utilizatorul. Rezerva de randări (§5 rândul de jos) acoperă plafonul de două ori la Premium și la jumătate la celelalte; excedentul se eliberează trimestrial.

**TVA**: firma e neplătitoare de TVA; plafonul e 395.000 lei/an (~€79.000). Peste el, din prețurile cu TVA inclus pierdem ~17%. Prețurile B2B (Architect, Constructor, white-label) se afișează „+TVA” de la început.

## 6. Proiecție pe 12 luni (dec 2026 – nov 2027), 3 scenarii 🟡

Ipoteze: lansare publică 1 feb 2027; beta (dec–ian) gratuită; ARPU (venit mediu/plătitor/lună) €25 / €30 / €32,5 după mixul de planuri (pesimist = aproape doar Premium); cost variabil 12% din abonamente (randări, AI, Stripe); cost fix €50/lună până la lansare, apoi €100 / €150 / €250. **Nu includ**: salariul lui Costin, contabilitate, marketing plătit, impozit pe venitul micro (de calculat cu contabilul).

**Plătitori la sfârșit de trimestru**

| Scenariu | Q1 (dec–feb) | Q2 (mar–mai) | Q3 (iun–aug) | Q4 (sep–nov) |
|---|---|---|---|---|
| Pesimist | 5 | 12 | 20 | 30 |
| De bază | 15 | 50 | 85 | 120 |
| Optimist | 40 | 140 | 260 | 400 |

**Venituri și costuri (€)**

| | Pesimist | De bază | Optimist |
|---|---|---|---|
| Abonamente (R1, R2 inclus) | 3.840 | 18.680 | 61.750 |
| Alte surse (pachete randări, CATUC, afiliere, constructori) | 300 | 2.500 | 9.000 |
| **Venit total pe 12 luni** | **4.140** | **21.180** | **70.750** |
| Cost fix (hosting, conturi) | 1.100 | 1.600 | 2.600 |
| Cost variabil (12% din abonamente) | 460 | 2.240 | 7.410 |
| **Rezultat înainte de salariu, contabilitate, taxe** | **+2.580** | **+17.340** | **+60.740** |
| MRR în nov 2027 | 750 | 3.600 | 13.000 |

**Pragurile care contează**: ~5 plătitori acoperă costurile de operare; **~70 de plătitori** (ARPU €32,5) acoperă și €2.000/lună pentru Costin. Scenariul de bază ajunge acolo în ~Q3 2027.

**Ce trebuie să fie adevărat pentru scenariul de bază**: ~4.000 de conturi gratuite într-un an cu 3% conversie la plătit (reper tipic freemium 2–5%, 🟡). Asta cere canalul de conținut CATUC (Chat 6) și SEO, nu reclame plătite. **Un singur comision de la un producător de module (R8: 1–3% dintr-o casă de €60–150k = €600–4.500)** schimbă scenariul pesimist în cel de bază; de aceea R8 are pilot în Q2.

## 7. Finanțare

| Nevoie | Cât | Cum |
|---|---|---|
| Beta → lansare (dec–ian) | €0 în plus (plafonul €50/lună) | bootstrap |
| Lansare → Q2 | €0–500 (credite de motoare peste rezerva din abonamente) | din venit |
| Accelerare după tracțiune (Q3 2027) | 🟡 €20–50k pre-seed: marketing, timp de arhitect, dezvoltator part-time | angel / accelerator, doar cu ≥ 20 plătitori **și** o casă reală (Cornetu) |

| Opțiune | Verdict |
|---|---|
| Start-Up Nation | ❌ doar firme nou-înființate; MCA SRL e din 2015. O firmă nouă doar pentru grant = risc de conflict de interese și muncă birocratică; nerecomandat acum |
| PNRR / digitalizare IMM | ❓ nu am găsit apel deschis potrivit; de reverificat în 10.02 |
| Co-Creation Accelerator (UE, până la €250k pentru equity) | 🟡 runda 2027, după primele date |
| Founder Institute RO 2027 (feb–apr, online) | 🟡 de cântărit: costă timp și o taxă ❓; potrivit doar dacă Costin vrea structură de pitch |
| Romania ClimAccelerator | 🟡 runda următoare; casa eficientă energetic e argumentul |
| Credite cloud pentru startup-uri | 🟡 Chat 7 (în scope-ul lor), gratuit, reduce costul de randare |
| Angels (după tracțiune) | Semnalul din demo-ul din apr. 2026: investitorii vor **case construite**. Fără Cornetu, nu merită pitch-ul |

## 8. Riscuri

| Risc | Probabilitate | Impact | Ce facem |
|---|---|---|---|
| Puțini plătitori (piața scade −9,6% în S1 2026) | Medie | Mare | Plan gratuit generos + conținut CATUC; măsurăm intenția de plată în beta |
| Un utilizator Architect/Constructor arde costuri peste preț | Medie | Mediu | Plafon lunar de cost per utilizator (§5) — Chat 4 |
| Motoarele gratuite dispar sau se limitează | Medie | Mediu | 5 căi gratuite + rezerva de randări + kill-switch pe motor (Chat 3) |
| Juridic: afiliere nemarcată, comision imobiliar fără CAEN, OAR | Mică dacă respectăm §5 din cercetare | Mare (amenzi, încredere) | Marcaj vizibil, CAEN 6831 înainte de R6, nicio taxă OAR până la răspunsul arhitectului partener |
| GDPR la lead-uri (R7–R10) | Medie | Mare | Consimțământ per partener, DPA, fără lead-uri până nu sunt gata |
| Încredere: „recomandă ce-i aduce comision” | Medie | Mare | Recomandări marcate; ordinea nu se schimbă după comision fără să spunem |
| Dependența de timpul lui Costin (4–6 h/zi) | Mare | Mare | Automatizare, puține surse în paralel (top 3 din §9 al doc-ului R1–R12) |
| Trecerea plafonului de TVA | Mică în anul 1 | Mediu | Prețuri B2B „+TVA” de acum |

## 9. KPI (lunar, raportat de MAIN)

| KPI | Țintă beta (ian) | Țintă Q2 2027 | Țintă nov 2027 (bază) |
|---|---|---|---|
| Conturi noi / lună | 100 (invitați) | 300 | 500 |
| Activare: proiect salvat + 1 randare | 50% | 40% | 40% |
| Conversie gratuit → plătit | răspuns la „aș plăti” ≥ 20% | 3% | 3% |
| Plătitori activi | — | 50 | 120 |
| MRR | — | €1.500 | €3.600 |
| Churn lunar | — | < 8% | < 6% |
| Cost randări + AI / venit abonamente | — | < 15% | < 12% |
| Clicuri pe produse (R5) / proiect | măsurat | 2 | 3 |
| Checker CATUC → configurator | măsurat | 15% | 20% |
| Lead-uri trimise la parteneri (R7–R10) | 0 | pilot | 30 / lună |
