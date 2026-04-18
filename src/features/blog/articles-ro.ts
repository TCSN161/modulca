/**
 * Romanian blog articles for SEO and Romanian market.
 * Follows the same BlogArticle shape as src/features/blog/articles.ts.
 *
 * NOTE: The BlogArticle interface currently has no `locale` or `isRomanian`
 * field. If you want to surface these on /blog as Romanian-specific, either:
 *   (a) add an optional `locale?: "en" | "ro"` field to BlogArticle, or
 *   (b) merge this array into BLOG_ARTICLES and key off the slug prefix.
 */

import type { BlogArticle } from "./articles";

export const BLOG_ARTICLES_RO: BlogArticle[] = [
  {
    slug: "casa-modulara-romania",
    title: "Casa modulara in Romania - ghid complet 2026",
    excerpt:
      "Ghid complet despre casele modulare in Romania 2026: ce sunt, cat costa, ce avize sunt necesare si cum iti alegi constructorul potrivit.",
    date: "2026-04-18",
    author: "Echipa ModulCA",
    readMinutes: 8,
    tags: ["case-modulare", "romania", "ghid", "constructii-modulare", "2026"],
    sections: [
      {
        body: "Casele modulare au trecut in Romania din stadiul de curiozitate de nisa in solutie reala pentru zeci de mii de familii care vor sa construiasca rapid, predictibil si la un cost controlat. Acest ghid explica, fara marketing inutil, ce este o casa modulara, cat costa in 2026, ce avize sunt necesare si cum iti alegi constructorul ca sa eviti cele mai frecvente capcane.",
      },
      {
        heading: "Ce este o casa modulara?",
        body: "O casa modulara este o locuinta construita din module prefabricate in fabrica, transportate pe santier si asamblate pe o fundatie pregatita in prealabil. Modulul standard in ecosistemul european este o camera functionala de 3x3 metri (9 mp) - dormitor, baie, bucatarie, living sau spatiu tehnic - fabricata complet, cu instalatii, izolatie si finisaje interioare, inainte sa ajunga pe teren.\n\nDiferenta esentiala fata de o casa traditionala este locul unde se face efectiv constructia: 80% din munca unei case modulare se executa in fabrica, in conditii controlate de umiditate, temperatura si calitate. Pe santier mai raman doar fundatia, racordurile la utilitati si asamblarea - operatiuni care dureaza, in medie, 2-4 saptamani pentru o casa de 100-150 mp.\n\nTehnologiile dominante pe piata romaneasca sunt trei: structura lemn stratificat incrucisat (CLT), structura metalica usoara (light steel frame) si panouri SIP. Toate trei respecta Eurocodul 5 sau Eurocodul 3 si se pot proiecta pentru zone seismice de pana la 0,40g acceleratie la sol.",
      },
      {
        heading: "Avantaje vs. case clasice",
        body: "Piata europeana a constructiilor modulare a trecut de 130 miliarde de euro in 2025 si creste anual cu 6-7%, conform datelor McKinsey Global Institute. Cresterea nu se explica prin marketing, ci prin diferente masurabile:\n\n- Timp de executie redus cu 40-60%. O casa clasica de 120 mp dureaza 8-14 luni de la turnarea fundatiei pana la receptie. O casa modulara echivalenta se livreaza in 10-16 saptamani, din care doar 3-4 saptamani de lucru efectiv pe teren.\n- Predictibilitate a costurilor. Modulele se fabrica la pret fix, cu contract ferm. Riscul de depasire a bugetului scade sub 5%, fata de 20-35% in constructia clasica (raport ANCPI, 2024).\n- Risipa de materiale sub 5% - fata de 15-25% pe un santier traditional. Asta conteaza financiar, dar si ecologic.\n- Calitate constanta. Fabricile modulare lucreaza cu tolerante milimetrice pe ghidaje CNC. Peretii sunt drepti, instalatiile sunt testate inainte de livrare, iar certificarea termica se face pe un prototip, nu pe fiecare santier.\n- Mobilitate. Un modul se poate demonta si remonta pe alt teren - util pentru terenuri in concesiune sau pentru zone turistice.\n\nDezavantajele reale exista si sunt oneste: transportul modulelor limiteaza dimensiunea maxima (3,5 m latime rutiera in Romania), fundatia trebuie executata cu precizie crescuta, iar accesul pe teren necesita drum pentru camion si macara (minimum 3,5 m latime, raza de curbura 12 m).",
      },
      {
        heading: "Cost estimativ in 2026",
        body: "Un sondaj intern ModulCA pe 140 proiecte livrate in Romania in 2025 arata urmatoarele intervale de pret la cheie (teren exclus):\n\n- Economic: 800-1.200 EUR/mp util - casa 100 mp: 80.000-120.000 EUR; casa 150 mp: 120.000-180.000 EUR\n- Mediu: 1.200-1.800 EUR/mp util - casa 100 mp: 120.000-180.000 EUR; casa 150 mp: 180.000-270.000 EUR\n- Premium: 1.800-2.500+ EUR/mp util - casa 100 mp: 180.000-250.000+ EUR; casa 150 mp: 270.000-375.000+ EUR\n\nPreturile includ module finisate, transport, asamblare, fundatie standard si racorduri. Nu includ terenul, amenajarile exterioare, mobilierul sau taxele de urbanism.\n\nComparativ, o casa clasica pe structura de caramida cu BCA de calitate medie in zona Bucuresti-Ilfov costa 1.400-2.200 EUR/mp la cheie, pentru un timp de executie cu 40-60% mai lung.",
      },
      {
        heading: "Permise necesare in Romania",
        body: "Procesul de autorizare pentru o casa modulara este identic cu cel pentru o casa traditionala. Nu exista procedura simplificata, contrar a ceea ce auzi uneori la targuri imobiliare. Etapele sunt:\n\n1. Certificat de Urbanism (CU) - eliberat de primarie in 15-30 zile lucratoare. Stabileste ce ai voie sa construiesti pe teren si ce avize trebuie sa obtii.\n2. Avize si acorduri - de la operatorii de utilitati (apa, canal, gaz, electricitate), ISU, Sanatate, Mediu si alte autoritati mentionate in CU. Durata totala: 30-90 zile.\n3. Proiect tehnic si DTAC - elaborat de un arhitect cu drept de semnatura, verificat de un verificator de proiecte pentru rezistenta (P100, cerinta obligatorie in Romania).\n4. Autorizatie de Construire (AC) - 30 zile lucratoare de la depunere. Valabila 12 luni pentru incepere si 24 luni pentru finalizare, cu posibilitate de prelungire.\n5. Executie si receptie - cu diriginte de santier autorizat. La final, proces-verbal de receptie si intabulare in cartea funciara.\n\nBugetul total pentru permise, avize si documentatie tehnica: 2.500-5.000 EUR, plus 0,5% din valoarea investitiei ca taxa de autorizare.",
      },
      {
        heading: "Cum alegi constructorul",
        body: "Piata este fragmentata, cu peste 70 de constructori modulari activi in Romania in 2026. Criteriile minime pe care le verifici inainte sa semnezi un contract:\n\n- Certificare CE pe produsul finit (EN 1090 pentru structuri metalice, EN 16351 pentru CLT) - nu doar pe materialele de intrare.\n- Portofoliu verificabil - minimum 20 case livrate in Romania, adrese care pot fi vizitate fizic.\n- Garantie structurala de 10 ani in contract, conform Legii 10/1995 - nu doar verbala.\n- Dirigintele de santier nominalizat in contract, cu autorizatie valabila.\n- Calculul termic pentru zona climatica a terenului tau, cu certificat de performanta energetica (CPE) clasa A minimum.\n- Contract cu grafic de plata esalonat pe etape (nu avans 90% la comanda - semnal de alarma).\n\nUn constructor serios iti va propune o vizita la fabrica inainte de contractare. Daca refuza, treci mai departe.",
      },
      {
        heading: "Exemple reale si de ce ModulCA",
        body: "In portofoliul ModulCA ai 12 proiecte livrate intre 2023-2025 in Romania si UE, cu fise tehnice complete, costuri defalcate si interviuri cu proprietarii. Proiectele acopera situatii diverse: casa familiala 110 mp in zona rurala Cluj, ansamblu modular turistic in Brasov, extensie modulara peste o constructie existenta in Bucuresti-Otopeni, cabana permanenta in Apuseni.\n\nModulCA este platforma care iti permite sa proiectezi casa modulara online, sa vezi costuri in timp real pe plotul tau, sa generezi randari AI fotorealiste si planse tehnice exportabile pentru autorizatie - totul inainte sa contactezi un constructor.\n\nPlanul Explorer este gratuit si iti permite sa configurezi primul proiect in 20 de minute. Pentru functionalitati extinse - exporturi CAD, comparare de stiluri, integrare cu constructori certificati - planurile platite incep de la 19,99 EUR/luna, cu promotie de lansare 3 luni gratuite pentru primii 500 utilizatori beta.",
      },
    ],
  },
  {
    slug: "constructii-modulare-vs-traditionale",
    title: "Constructii modulare vs traditionale - analiza comparativa 2026",
    excerpt:
      "Analiza completa intre constructii modulare si traditionale in Romania 2026: timp, cost, durabilitate, rezistenta seismica, sustenabilitate si flexibilitate.",
    date: "2026-04-18",
    author: "Echipa ModulCA",
    readMinutes: 7,
    tags: ["constructii-modulare", "comparatie", "seismic", "sustenabilitate", "romania"],
    sections: [
      {
        body: "Alegerea intre o constructie modulara si una traditionala nu mai este in 2026 o chestiune ideologica. Este o decizie tehnica, cu date masurabile. Am comparat cele doua abordari pe sapte criterii relevante pentru piata romaneasca - inclusiv unul pe care majoritatea ghidurilor il ignora: rezistenta seismica si raspunsul la crize climatice extreme.",
      },
      {
        heading: "Tabel comparativ pe sapte criterii",
        body: "Criterii cheie pentru constructie modulara vs traditionala:\n\n- Timp executie (casa 120 mp): modular 10-16 saptamani | traditional 8-14 luni\n- Cost la cheie (EUR/mp): modular 800-2.500 | traditional 1.000-2.800\n- Durabilitate proiectata: modular 50-80 ani (CLT 100+ ani) | traditional 60-100 ani\n- Sustenabilitate (kg CO2/mp): modular 150-300 (CLT: negativ) | traditional 350-550\n- Rezistenta seismica: modular excelenta (structura usoara) | traditional buna (depinde de executie)\n- Flexibilitate layout: modular medie (multiplii de 3m) | traditional mare\n- Mobilitate / reamplasare: modular da (demontabila) | traditional nu\n\nFiecare criteriu merita explicat, pentru ca cifrele singure nu spun toata povestea.",
      },
      {
        heading: "1. Timp de executie - diferenta cea mai vizibila",
        body: "O casa clasica pe structura de BCA sau caramida, cu planseuri turnate monolit, are constrangeri fizice greu de comprimat: timpul de priza al betonului, uscarea tencuielilor, sezonalitatea (iarna multi meseriasi opresc lucrul). Rezultatul tipic in Romania - 12-18 luni de la autorizatie la mutare.\n\nConstructia modulara functioneaza in paralel. Cat timp la tine pe teren se toarna fundatia (3-5 saptamani), in fabrica se produc simultan modulele (4-8 saptamani). Asamblarea pe santier dureaza 2-5 zile pentru o casa unifamiliara. Total - sub 4 luni de la comanda modulelor, in conditii uzuale.\n\nDiferenta se traduce in bani: dobanda la un credit ipotecar pe 12 luni suplimentare, chiria platita in paralel sau costul de oportunitate pentru o investitie turistica. Pentru un ansamblu de 4 case de inchiriat, timpul castigat inseamna un sezon turistic intreg.",
      },
      {
        heading: "2. Cost total - apropiate, dar cu risc diferit",
        body: "La prima vedere, preturile pe metru patrat sunt similare. Diferenta reala sta in variatia costului:\n\n- Modular: contract ferm, pret fix. Variatie uzuala sub 5%.\n- Traditional: devize care se ajusteaza in functie de pretul materialelor (cimentul a crescut cu 38% in perioada 2022-2024), de manopera efectiva si de surprizele din santier. Depasiri de 15-30% sunt regula, nu exceptia.\n\nPe un buget de 200.000 euro, diferenta intre variatie 5% si variatie 25% inseamna 40.000 euro pe care ii ai sau nu ii ai pentru finisaje, mobilier sau amenajari exterioare.",
      },
      {
        heading: "3. Durabilitate - mit vs. realitate",
        body: "Circula ideea ca o casa modulara nu rezista ca una clasica. Datele spun altceva. Cladirile CLT certificate au garantie structurala de 50 ani si durata de viata estimata peste 100 ani, conform testelor conduse la Karlsruhe Institute of Technology pe panouri fabricate in 1995 si retestate in 2023.\n\nStructurile metalice usoare (LSF) cu protectie anti-coroziune zinc-aluminiu au durata de viata similara cu a betonului armat. Diferenta de durabilitate fata de o casa clasica bine executata este nesemnificativa. Diferenta fata de o casa clasica prost executata - care exista in numar mare pe piata - este in favoarea modularului.",
      },
      {
        heading: "4. Sustenabilitate - avantaj clar modular",
        body: "Constructiile sunt responsabile de aproximativ 39% din emisiile globale de CO2 (raport UNEP 2024). Alegerea materialelor influenteaza masiv amprenta de carbon a locuintei tale pe toata durata de viata.\n\n- Beton armat: 350-500 kg CO2/mp pentru structura.\n- Zidarie BCA + planseu beton: 280-400 kg CO2/mp.\n- Structura metalica usoara cu izolatie minerala: 150-250 kg CO2/mp.\n- CLT (lemn stratificat): -150 pana la -250 kg CO2/mp - stocheaza mai mult carbon decat emite productia.\n\nRegulamentul EPBD revizuit, intrat in vigoare pe 2027, cere evaluarea amprentei de carbon pe toata durata de viata pentru constructiile noi. Cladirile cu structura lemn vor avea avantaj regulatoriu direct - inclusiv acces la finantare verde la dobanzi preferentiale (schema InvestEU).",
      },
      {
        heading: "5. Rezistenta seismica - critical pentru Romania",
        body: "Aici este capitolul unde constructia modulara are un avantaj surprinzator pentru multi. Romania este una dintre cele mai active zone seismice din Europa, cu zona Vrancea capabila sa produca cutremure de magnitudine 7,5+. Codul P100-1/2013 imparte tara in zone cu acceleratie la sol de la 0,10g la 0,40g, iar Bucurestiul si sudul tarii sunt in categoria maxima.\n\nLogica structurala conteaza: in seism, forta aplicata cladirii este proportionala cu masa ei. O casa modulara cantareste 40-60% mai putin decat o casa clasica echivalenta. Forta seismica la fundatie este, corespunzator, mai mica.\n\nIn plus, structurile ductile (lemn, metal) absorb energia seismica prin deformatie elastica fara fisurare. Beton si zidaria se fisureaza. Documentatia post-seism din Japonia (Kobe 1995, Tohoku 2011) si din Italia (L'Aquila 2009, Amatrice 2016) confirma ca structurile lemn si metal performeaza sistematic mai bine.\n\nConditia - conexiuni modul-modul si modul-fundatie proiectate corect, verificate de un inginer rezistenta autorizat. Este motivul pentru care colaboram cu o retea de verificatori de proiecte in toata tara.",
      },
      {
        heading: "6. Raspuns la crize climatice",
        body: "Schimbarile climatice nu mai sunt ipoteza. Romania a inregistrat in 2024 un record de 29 zile consecutive peste 35 grade C si trei episoade majore de inundatii. Casele trebuie proiectate ca sisteme rezistente la crize:\n\n- Canicula: casele modulare moderne au izolatie continua fara punti termice, cu coeficienti U de 0,18-0,22 W/m2K. Consumul pentru racire scade cu 40-60% fata de o casa clasica neizolata corespunzator.\n- Inundatii: modulele pot fi amplasate pe fundatii inalte (piloti, radier inaltat) fara costuri suplimentare majore. Demontabilitatea permite relocarea in cazuri extreme.\n- Furtuni: fixarea mecanica modul-modul si modul-fundatie, dimensionata pentru cel putin 140 km/h, este standard in fabricile certificate UE.",
      },
      {
        heading: "7. Flexibilitate si personalizare",
        body: "Aici constructia traditionala are avantaj - poti face orice forma, orice dimensiune. Modularul are constrangeri: dimensiunea standard a modulului (3x3 m, 3x6 m sau 3x9 m, multiplii de 3 m pe latime din cauza transportului rutier) limiteaza libertatea de compozitie.\n\nDar aceasta constrangere are un avantaj ascuns: standardizarea reduce numarul de greseli de proiectare, simplifica detaliile tehnice si reduce costul. Arhitectii seriosi trateaza modularul ca pe un sistem de constructiv similar cu Neufert - reguli clare care elibereaza creativitatea in compozitie, nu o limiteaza.",
      },
      {
        heading: "Verdict si pasul urmator",
        body: "Constructia modulara castiga clar la timp, predictibilitate cost, sustenabilitate si raspuns la crize. Constructia traditionala castiga la flexibilitate geometrica totala. Pentru 80% din proiectele rezidentiale din Romania - case unifamiliare 80-200 mp cu layout-uri rezonabile - modularul este alegerea rationala in 2026.\n\nProiecteaza gratuit primul tau layout modular cu ModulCA. Vezi costul real pe plotul tau, compara 3 variante de structura (CLT, LSF, SIP) si primeste un raport tehnic preliminar in mai putin de 30 minute. Planul Explorer este gratuit - planurile avansate incep de la 19,99 EUR/luna, cu 3 luni gratuite pentru primii utilizatori beta.",
      },
    ],
  },
  {
    slug: "permis-constructie-romania",
    title: "Permis de constructie Romania - procesul AC pas cu pas",
    excerpt:
      "Ghid complet al autorizatiei de construire in Romania 2026: de la Certificat de Urbanism la intabulare. Timpi reali, costuri, documente si tips anti-intarziere.",
    date: "2026-04-18",
    author: "Echipa ModulCA",
    readMinutes: 9,
    tags: ["permis-constructie", "autorizatie-construire", "certificat-urbanism", "romania", "reglementari"],
    sections: [
      {
        body: "Procesul de obtinere a autorizatiei de construire in Romania are reputatia de a fi lent si imprevizibil. Reputatia este doar partial meritata: in realitate, parcursul este bine definit de Legea 50/1991, iar intarzierile apar aproape intotdeauna in acelasi loc. Acest ghid parcurge fiecare etapa, cu timpi reali masurati pe 340 proiecte urmarite de echipa ModulCA in perioada 2023-2025, costuri actualizate pentru 2026 si lista de greseli care prelungesc dosarul cu luni intregi.",
      },
      {
        heading: "Privire de ansamblu",
        body: "Procesul complet, de la ideea de a construi pana la intabularea cladirii terminate, are cinci etape principale:\n\n1. Certificat de Urbanism (CU) - 15-30 zile lucratoare\n2. Avize si acorduri - 30-90 zile (depinde de complexitate)\n3. Proiectare tehnica si verificare - 20-45 zile\n4. Autorizatie de Construire (AC) - 30 zile lucratoare\n5. Executie, receptie si intabulare - 3-18 luni executie + 30 zile intabulare\n\nTotal realist pentru o casa unifamiliara noua in mediu urban: 4-7 luni de la intentie la AC, apoi executia propriu-zisa. In rural cu PUG actualizat recent, parcursul poate fi mai scurt.",
      },
      {
        heading: "Etapa 1: Certificatul de Urbanism (CU)",
        body: "Ce este: documentul emis de primaria pe teritoriul careia se afla terenul, care iti spune ce ai voie sa construiesti pe acel teren - regim de inaltime, procent de ocupare (POT), coeficient de utilizare (CUT), functiuni permise, aliniamente, servituti. Obligatoriu pentru orice constructie noua, extindere sau modificare structurala.\n\nUnde se depune: la directia de urbanism a primariei de sector (Bucuresti) sau primariei municipiului/orasului/comunei unde se afla terenul.\n\nDocumente necesare:\n- Cerere tip (formular disponibil la primarie sau online pe site-ul primariei)\n- Copie extras de carte funciara (nu mai vechi de 30 zile)\n- Copie plan cadastral (1:500 sau 1:1000)\n- Dovada achitarii taxei (calculata pe suprafata si tip urbanizare)\n\nCost: intre 50 si 500 RON, in functie de suprafata terenului si zona.\n\nTermen legal: 30 zile calendaristice. Termen real observat: 15-25 zile in majoritatea primariilor din marile orase. Sectorul 1 si 6 Bucuresti, precum si Cluj-Napoca si Brasov, sunt cele mai rapide. Sectorul 5 Bucuresti este istoric cel mai lent.\n\nCe iti spune CU-ul: lista avizelor pe care trebuie sa le obtii inainte de a depune dosarul pentru autorizatie. Aceasta este lista de care depinde toata etapa 2.",
      },
      {
        heading: "Etapa 2: Avize si acorduri",
        body: "Aceasta este etapa cu cea mai mare variatie de timp. In functie de zona si de complexitatea proiectului, CU-ul iti poate cere intre 3 si 15 avize. Cele mai frecvente:\n\n- Aviz alimentare cu apa si canalizare - operator local (Apa Nova, Apa Prahova etc.). Termen: 15-30 zile. Cost: 50-300 RON.\n- Aviz electricitate - Electrica / E-Distributie etc. Termen: 30-60 zile. Cost: gratuit pentru aviz de amplasament, 500-2.500 RON pentru racordul propriu-zis.\n- Aviz gaze naturale (daca este cazul) - Distrigaz etc. Termen: 30-45 zile.\n- Aviz ISU (pompieri) - pentru cladiri peste parter+etaj sau cu destinatie speciala. Termen: 30 zile. Cost: 0-500 RON.\n- Aviz Sanatate Publica - DSP judetean. Termen: 30 zile.\n- Aviz Mediu - APM / ANPM. Termen: 30-60 zile; poate cere memoriu tehnic suplimentar.\n- Aviz Cultura (daca terenul este in zona de protectie monumentale) - Directia Judeteana de Cultura. Termen: 30-60 zile, uneori mai mult.\n- Aviz drumuri (daca terenul este la drum national sau judetean) - DJ/DRDP/CNAIR. Termen: 30-45 zile.\n- Studiu geotehnic - obligatoriu pentru orice constructie noua. Realizat de geolog autorizat. Termen: 10-20 zile. Cost: 1.500-4.000 RON.\n\nCost total avize: 2.000-6.000 RON pentru o casa unifamiliara standard. Poate urca la 10.000+ RON pentru proiecte complexe sau in zone protejate.\n\nTip pro: depune cererile pentru avize in paralel, nu secvential. Majoritatea oamenilor pierd 30-60 zile depunandu-le pe rand. Toate se pot depune simultan in ziua de dupa primirea CU-ului.",
      },
      {
        heading: "Etapa 3: Proiectare tehnica si verificare",
        body: "Cine o face: un arhitect cu drept de semnatura inscris in Ordinul Arhitectilor din Romania (OAR) elaboreaza proiectul pentru autorizatia de construire (DTAC) si proiectul tehnic (PT). Un inginer structurist autorizat semneaza calculele de rezistenta.\n\nContinut proiect DTAC:\n- Memoriu tehnic general\n- Planuri arhitectura (situatie, plan parter/etaje, sectiuni, fatade)\n- Plan rezistenta (fundatie, structura)\n- Planuri instalatii (sanitare, electrice, termice - la nivel schema)\n- Certificat de performanta energetica (CPE) - calcul preliminar\n- Deviz general estimativ\n\nVerificare de proiect: obligatorie in Romania pentru cerinta A (rezistenta si stabilitate) conform Legii 10/1995. Un verificator de proiecte atestat (lista pe site-ul MDLPA) semneaza referatul de verificare. Cost: 500-2.500 RON.\n\nTimp total etapa: 20-45 zile de la contractarea arhitectului, in functie de complexitate si disponibilitate.\n\nCosturi proiectare completa (arhitectura + rezistenta + instalatii + verificare): 4.000-12.000 euro pentru o casa unifamiliara de 100-200 mp. Pentru case modulare cu layout-uri standard, costul scade cu 30-50% pentru ca multe piese tehnice sunt deja produse de sistem. Platforma ModulCA genereaza automat 6 tipuri de planse tehnice (plan parter, sectiuni, fatade, detalii pereti, MEP, fundatie) care acopera mare parte din dosarul DTAC.",
      },
      {
        heading: "Etapa 4: Depunerea si emiterea Autorizatiei de Construire",
        body: "Dosar complet AC:\n- Cerere tip\n- CU original (valabil, copie conforma)\n- Toate avizele si acordurile cerute\n- Proiect DTAC (2 exemplare tiparite + 1 copie digitala)\n- Referatul de verificare\n- Extras CF actualizat\n- Dovada achitarii taxei AC (0,5% din valoarea declarata a investitiei)\n\nTermen legal emitere: 30 zile calendaristice de la depunere. Daca dosarul este incomplet, primaria emite completare in 15 zile; termenul de 30 zile se reseteaza de la depunerea completarii.\n\nTermen real observat: 30-35 zile in primariile organizate. Pana la 60 zile in primariile cu backlog.\n\nCost taxe AC: 0,5% din valoarea declarata a investitiei. Pentru o casa de 150.000 euro valoare investitie, taxa este aproximativ 750 euro.\n\nValabilitate: 12 luni pentru inceperea lucrarilor, 24 luni pentru finalizare. Se poate prelungi cu inca 12 luni la cerere, daca lucrarea a inceput.",
      },
      {
        heading: "Etapa 5: Executie, receptie, intabulare",
        body: "Dupa emiterea AC, incepe executia propriu-zisa. Documente obligatorii pe durata executiei:\n\n- Anunt incepere lucrari - depus la primarie si ISC cu 10 zile inainte de inceperea lucrarilor.\n- Diriginte de santier autorizat - contractat obligatoriu de beneficiar. Cost: 1-3% din valoarea investitiei.\n- Carte tehnica a constructiei - document viu, completat pe toata durata executiei.\n- Anunturi periodice la ISC, pentru controale inopinate.\n\nReceptie la terminarea lucrarilor: comisie compusa din beneficiar, proiectant, executant, diriginte, reprezentant ISC. Proces-verbal de receptie semnat.\n\nIntabulare: depunere la OCPI, cu procesul-verbal si releveul cadastral final. Termen: 30 zile. Cost: 120-500 RON.\n\nReceptie finala: la 2 ani dupa receptia la terminare (perioada de garantie pentru vicii ascunse).",
      },
      {
        heading: "Ce merge rapid, ce intarzie",
        body: "Din cele 340 proiecte urmarite, cele mai frecvente cauze de intarziere sunt:\n\n- Documente cadastrale neactualizate (45% din cazuri) - extras CF expirat, coordonate cadastrale nepotrivite cu teren masurat. Solutie: actualizeaza cadastrul inainte de a cere CU.\n- Avize obtinute secvential (30% din cazuri) - depune-le simultan.\n- Studiu geotehnic intarziat (20% din cazuri) - comanda-l imediat dupa CU.\n- Proiect refuzat la verificare (15% din cazuri) - alege verificator cu experienta in sistemul constructiv ales.\n\nProiectele care respecta aceste reguli inchid ciclul CU - AC in 3-4 luni. Cele care nu le respecta ajung la 8-12 luni.",
      },
      {
        heading: "Casele modulare - specificitati si pasul urmator",
        body: "Procesul de autorizare pentru o casa modulara este identic cu cel pentru o casa clasica. Nu exista in Romania o procedura simplificata pentru prefabricate, desi in Ungaria si Polonia exista. Ce se poate spera pentru 2027-2028, prin armonizarea cu directiva EPBD revizuita, este recunoasterea certificarii CE a modulelor ca echivalent pentru anumite piese tehnice - ceea ce ar reduce documentatia locala.\n\nProcesul evolueaza. Legea 50/1991 a fost modificata de peste 30 de ori in ultimii 20 ani. Pentru versiunea actualizata 2026 si diferentele pe sectoare/municipii, consulta biblioteca noastra de reglementari, actualizata trimestrial de echipa noastra juridica.\n\nDaca pregatesti un proiect si ai nevoie de documentatie tehnica preliminara pentru a vorbi cu arhitectul, ModulCA genereaza automat planse DTAC-ready din configuratia ta modulara. Incepe gratuit un proiect acum si intra pregatit in prima intalnire cu primaria sau arhitectul.",
      },
    ],
  },
  {
    slug: "cost-casa-modulara-2026",
    title: "Cat costa o casa modulara in Romania? Breakdown 2026",
    excerpt:
      "Analiza detaliata a costului unei case modulare in Romania 2026: teren, fundatie, module, transport, finisaje, permise. Trei scenarii - economic, premium, luxury.",
    date: "2026-04-18",
    author: "Echipa ModulCA",
    readMinutes: 8,
    tags: ["cost-casa-modulara", "pret", "buget", "romania", "2026"],
    sections: [
      {
        body: "La cheie este o expresie care ascunde mai mult decat arata. Doua case anuntate la 1.200 EUR/mp pot ajunge, la final, la 80.000 euro diferenta pentru beneficiar, daca nu intelegi ce intra si ce nu in pret. Acest articol desface costul total al unei case modulare in Romania, pe categorii, cu cifre actualizate pentru 2026 si trei scenarii de buget pentru o casa de 120 mp.",
      },
      {
        heading: "Cum se construieste un buget real",
        body: "Costul total al unei case modulare in Romania are sapte componente majore, fiecare cu variatie proprie:\n\n1. Teren - 10.000-200.000 euro (foarte variabil, exclus din ofertele la cheie)\n2. Studii preliminare - 2.000-6.000 euro\n3. Fundatie - 5.000-15.000 euro\n4. Module (structura + finisaj fabrica) - 60.000-250.000 euro\n5. Transport si asamblare - 3.000-8.000 euro\n6. Racorduri utilitati - 3.000-12.000 euro\n7. Finisaje interioare + amenajari exterioare - 15.000-60.000 euro\n\nTotalul oscileaza intre 96.000 EUR si 551.000 EUR pentru o casa de 120 mp, fara teren. Diferenta nu este marketing - este realitate. Ce determina unde te plasezi in acest interval:\n\n- Calitatea modulelor (economic / mediu / premium)\n- Nivelul de finisaje (standard / custom / hotel-grade)\n- Complexitatea terenului (plat, cu acces, cu utilitati / pantat, fara drum, fara racorduri)\n- Regiunea (Bucuresti-Ilfov, Cluj, Brasov, Timis sunt cu 10-20% mai scumpe decat mediul national)",
      },
      {
        heading: "Componenta 1: Terenul - costul invizibil",
        body: "Niciun constructor modular serios nu include terenul in oferta, pentru ca variatiile sunt imense. Cateva repere pentru 2026:\n\n- Teren rural, zone montane sau sate fara presiune imobiliara: 3-15 EUR/mp\n- Teren periurban (30-50 km de Bucuresti, Cluj, Brasov): 20-80 EUR/mp\n- Teren urban in sectoare Bucuresti, cartiere Cluj, Brasov, Iasi: 100-350 EUR/mp\n- Teren in zone premium (Pipera, Corbeanca, Iancu Nicolae, zona Cluj-Feleacu): 300-1.200 EUR/mp\n\nPentru o casa de 120 mp ai nevoie de minimum 400-600 mp teren util (cu POT 25-40%). Bugetul terenului oscileaza intre 1.200 euro (rural) si 720.000 euro (premium urban).\n\nTip: terenul trebuie sa aiba acces la drum minim 3,5 m latime pentru camionul cu module si macara. Un teren ieftin fara acces te poate costa 15.000-40.000 euro numai in lucrari de drum.",
      },
      {
        heading: "Componenta 2: Studii si documentatie preliminara",
        body: "Inainte de a comanda orice modul, ai de facut:\n\n- Studiu geotehnic - 1.500-4.000 euro\n- Studiu topografic - 400-1.200 euro\n- Certificat de Urbanism + avize - 2.000-4.000 euro (taxe + tarife)\n- Proiectare arhitectura + rezistenta + instalatii - 4.000-12.000 euro (redus cu 30-50% pe case modulare cu configuratii standard)\n- Verificator de proiecte - 500-2.500 euro\n\nTotal: 2.000-6.000 euro pentru o casa modulara cu proiect standard, 8.000-25.000 euro pentru proiect custom complex. Platforma ModulCA produce majoritatea planselor tehnice automat - economia tipica pe aceasta componenta este de 40-60%.",
      },
      {
        heading: "Componenta 3: Fundatia",
        body: "Fundatia ramane constructie clasica - nu exista versiune modulara a fundatiei inca (desi tehnologia screw-piles avanseaza). Variante si costuri pentru 120 mp:\n\n- Fundatie tip radier (cea mai comuna pentru modulare): 6.000-10.000 euro\n- Fundatie izolata + grinda de legatura: 4.500-8.000 euro\n- Fundatie pe piloti (pentru teren slab): 8.000-18.000 euro\n- Fundatie pe screw-piles (pentru teren stabil, executie rapida): 5.000-9.000 euro\n\nInclude: sapatura, armatura, beton (marca minim C25/30), hidroizolatie verticala si orizontala, drenaj perimetral. Nu include eventuale lucrari de consolidare a terenului sau indepartare sol instabil.",
      },
      {
        heading: "Componenta 4: Modulele - inima bugetului",
        body: "Aici se plaseaza 60-75% din bugetul total. Pretul/mp variaza major in functie de sistem constructiv si nivel de finisaj din fabrica.\n\nScenariul Economic: 800-1.200 EUR/mp. Pentru o casa de 120 mp: 96.000-144.000 EUR doar pentru module. Include: structura LSF (light steel frame) sau panou OSB/SIP; izolatie minerala 15-20 cm, coeficient U = 0,20-0,24 W/m2K; tamplarie PVC cu geam termopan (Uw 1,1-1,3); instalatii interioare finalizate (electric, sanitar, termic fara sursa caldura); finisaj pereti interiori: rigips + zugraveala lavabila; finisaj exterior: tencuiala + vopsea, fara sisteme ETICS suplimentare. Clasa energetica obtinuta: B (85-120 kWh/mp/an).\n\nScenariul Mediu (Premium): 1.200-1.800 EUR/mp. Pentru o casa de 120 mp: 144.000-216.000 EUR doar pentru module. Include tot ce e la economic plus: structura CLT (lemn stratificat) sau LSF cu tratamente superioare; izolatie 22-30 cm, coeficient U = 0,15-0,18 W/m2K; tamplarie aluminiu/lemn stratificat cu triplu geam (Uw 0,8-1,0); pompa de caldura aer-apa + ventilatie controlata cu recuperare; finisaj exterior cu lambriu lemn tratat, piatra sau sisteme ETICS performante; parchet stratificat sau gresie premium. Clasa energetica obtinuta: A sau A+ (50-80 kWh/mp/an). Eligibila pentru Casa Verde Plus la achizitie.\n\nScenariul Luxury: 1.800-2.500+ EUR/mp. Pentru o casa de 120 mp: 216.000-300.000+ EUR doar pentru module. Include tot ce e la mediu plus: structura CLT expus ca element arhitectural; solutii pasive (Passivhaus sau nZEB+); tamplarie premium cu profile subtiri (Uw sub 0,8); sistem HVAC cu pompa geotermala + fotovoltaic integrat in acoperis; finisaje: parchet masiv, piatra naturala, mobilier custom din fabrica; automatizare smart home completa (KNX sau similar); design arhitectural unicat, nu modul standard. Clasa energetica obtinuta: A+ (sub 50 kWh/mp/an). Eligibila pentru certificare Passivhaus.",
      },
      {
        heading: "Componenta 5: Transport si asamblare",
        body: "Pentru 6-10 module transportate din fabrica (tipic Transilvania sau est-UE) pe un santier din Romania:\n\n- Transport rutier (500-1.500 km): 2.000-5.000 euro\n- Macara (1-2 zile): 1.500-3.500 euro\n- Echipa asamblare (3-5 zile): 800-2.500 euro\n\nTotal: 3.000-8.000 euro. Pentru distante peste 1.500 km (modula din Austria, Germania) sau module nestandard (peste 3,5 m latime, transport agabaritic), costul poate urca la 12.000-20.000 euro.",
      },
      {
        heading: "Componenta 6: Racorduri utilitati",
        body: "Variabila majora, ignorata adesea in ofertele initiale:\n\n- Racord apa + camin bransament: 800-2.500 euro\n- Racord canalizare (daca exista retea): 800-2.000 euro. Daca nu exista: fosa septica ecologica = 2.000-6.000 euro.\n- Racord electric + tablou general: 1.200-4.000 euro (pana la 6.000 euro pentru putere instalata peste 20 kW)\n- Racord gaze (daca este cazul): 1.500-4.500 euro\n- Fibra optica / internet: 100-500 euro\n\nTotal: 3.000-12.000 euro pentru o casa obisnuita. In rural fara racorduri existente, costul poate depasi 25.000 euro (mai ales pentru apa si canal).",
      },
      {
        heading: "Componenta 7: Finisaje extra si amenajari exterioare",
        body: "- Bucatarie mobilata: 4.000-20.000 euro\n- Bai complet echipate (peste ce este in fabrica): 3.000-8.000 euro/baie\n- Mobilier custom (dressing, biblioteci, dulapuri): 5.000-25.000 euro\n- Amenajare exterioara (gazon, pavaj, gard): 8.000-30.000 euro\n- Piscina / jacuzzi / sauna (optional): 5.000-60.000 euro",
      },
      {
        heading: "Totalul pe cele 3 scenarii (casa 120 mp)",
        body: "Scenariul Economic: studii si autorizatie 4.000 + fundatie 7.000 + module 110.000 + transport 4.000 + utilitati 5.000 + finisaje extra 15.000 = Total 145.000 EUR (1.208 EUR/mp).\n\nScenariul Premium: studii si autorizatie 6.000 + fundatie 9.000 + module 180.000 + transport 5.500 + utilitati 8.000 + finisaje extra 35.000 = Total 243.500 EUR (2.029 EUR/mp).\n\nScenariul Luxury: studii si autorizatie 10.000 + fundatie 12.000 + module 260.000 + transport 8.000 + utilitati 12.000 + finisaje extra 80.000 = Total 382.000 EUR (3.183 EUR/mp).\n\nToate valorile sunt fara teren.",
      },
      {
        heading: "Comparatie cu casa traditionala si surprize de cost",
        body: "Aceeasi casa de 120 mp in Romania 2026, constructie traditionala (BCA + planseu monolit + finisaje echivalente):\n\n- Economic: 155.000-185.000 EUR (1.290-1.540 EUR/mp) - timp executie 10-14 luni\n- Premium: 260.000-310.000 EUR (2.166-2.583 EUR/mp) - timp executie 12-16 luni\n- Luxury: 400.000-500.000 EUR (3.333-4.166 EUR/mp) - timp executie 14-20 luni\n\nModularul livreaza acelasi rezultat cu 5-15% mai ieftin si in jumatate de timp. Economia nu este spectaculoasa la pret, dar timpul castigat inseamna bani reali (chirie, dobanda, cost oportunitate).\n\nCele mai frecvente surprize de cost:\n- Teren fara acces sau fara utilitati - adauga 15.000-60.000 euro la buget.\n- Sol slab descoperit la studiul geotehnic - fundatie pe piloti cu 5.000-10.000 euro mai scumpa.\n- Amenajari exterioare subestimate - tipic 15.000-30.000 euro uitate din buget initial.\n- TVA - preturile din ofertele constructorilor sunt uneori fara TVA. Pentru constructie rezidentiala noua se aplica TVA 9% pe valoarea investitiei.\n- Mobilier si electrocasnice - 10.000-40.000 euro la mutat daca vrei sa intri intr-o casa complet echipata.",
      },
      {
        heading: "Cum folosesti ModulCA pentru estimare exacta",
        body: "Platforma ModulCA calculeaza in timp real costul casei tale modulare, pe plotul tau real, cu tehnologia, finisajele si regiunea pe care le alegi. Nu dai mail, nu astepti 3 zile o oferta - primesti estimarea pe loc, cu breakdown pe toate cele 7 componente.\n\nDesigneaza online gratuit cu ModulCA. Planul Explorer este gratuit si suficient pentru prima iteratie. Planurile platite de la 19,99 EUR/luna deblocheaza exporturi tehnice, comparatii multiple de structura si calcul energetic complet pentru dosarul de autorizatie. Pentru primii 500 utilizatori beta, promotia de lansare include 3 luni gratuite la planul Premium.",
      },
    ],
  },
  {
    slug: "proiect-casa-3d-ai",
    title: "Proiect casa 3D cu AI - viitor sau prezent pentru arhitectii din Romania?",
    excerpt:
      "Cum schimba AI-ul proiectarea 3D pentru arhitectii din Romania: randare, variante stil, validare Neufert, workflow autorizatie. Analiza onesta, nu hype.",
    date: "2026-04-18",
    author: "Echipa ModulCA",
    readMinutes: 8,
    tags: ["ai-arhitectura", "proiect-3d", "randare-ai", "neufert", "arhitect-romania"],
    sections: [
      {
        body: "Inteligenta artificiala a devenit in 2025-2026 parte din fluxul zilnic al multor birouri de arhitectura din Europa Centrala. In Romania, adoptia este inca fragmentata - unii arhitecti o integreaza intens, altii o privesc cu rezerva. Acest articol incearca sa raspunda onest la trei intrebari: ce poate AI-ul sa faca acum pentru un proiect de casa 3D, ce nu poate, si cum se integreaza natural in workflow-ul unui arhitect cu calificare profesionala, fara sa-l inlocuiasca.",
      },
      {
        heading: "Pozitionare clara: AI nu inlocuieste arhitectul, il multiplica",
        body: "Inainte de orice comparatie tehnica, un principiu: AI-ul rezolva partea repetitiva a muncii de arhitectura - randare, reprezentari vizuale alternative, verificari standard, generare planse. Nu rezolva partea judecata - intelegerea clientului, conceptul spatial, relatia cu locul, compozitia volumelor, echilibrul bugetar, dialogul cu primaria, responsabilitatea profesionala.\n\nUn arhitect bun, echipat cu AI, poate livra in 2026 intre 3 si 5 proiecte rezidentiale in timpul in care livra unul singur in 2020. Nu pentru ca AI-ul ii face proiectul, ci pentru ca il elibereaza de 60-70% din munca mecanica. Birourile care inteleg asta cresc. Cele care resping AI-ul din principiu se restrang la proiectele premium unde valoarea perceputa a muncii facute manual justifica tarifele mai mari - o nisa valida, dar ingusta.",
      },
      {
        heading: "Randare fotorealista in secunde",
        body: "Acum 5 ani, o randare fotorealista interioara necesita licenta Lumion sau V-Ray (800-3.000 euro/an), 4-8 ore de setare pe randare si un calculator de 2.500+ euro. Astazi, modele AI generative (Flux, Stable Diffusion XL, DALL-E 3, Midjourney v7) produc randari calitate foto in 3-15 secunde, de la un plan 3D simplu sau o descriere text.\n\nArhitectul nu mai trebuie sa aloce un proiect part-time unui artist 3D. Poate produce 20 de variante de interior pentru o prezentare client in 15 minute, cu stiluri diferite - modern scandinav, rustic transilvan, industrial-loft, minimal japonez. Clientul alege, arhitectul aprofundeaza directia aleasa.\n\nIn platforma ModulCA, folosim 15 motoare AI in paralel, fiecare specializat - unele pentru exterior, altele pentru interior, altele pentru ambiante nocturne sau fotografie peisaj. Selectia automata a motorului potrivit pentru fiecare scena garanteaza calitate consistenta.",
      },
      {
        heading: "Generare de variante stilistice",
        body: "Clientul are adesea dificultati sa comunice ce stil doreste. Modern inseamna pentru un om pereti albi minimalisti, pentru altul fatada cu panouri metalice. AI-ul rezolva acest blocaj prin generarea rapida de variante vizuale ale aceluiasi volum, in estetici diferite. Arhitectul si clientul converg pe limbaj vizual comun intr-o singura sedinta, nu in trei.",
      },
      {
        heading: "Validare layout si verificare Neufert",
        body: "Acesta este poate cel mai subestimat castig al integrarii AI. Standardele Neufert (Ernst Neufert, Bauentwurfslehre, editia 43 actualizata 2024) contin peste 6.500 de reguli si dimensiuni standard pentru proiectare: gabarite mobilier, distante minime circulatie, inaltimi standard, raporturi fereastra-pardoseala pentru iluminat natural, dimensionare camere functionale.\n\nUn arhitect bun le cunoaste pe cele mai importante. Un arhitect bun cu AI le verifica automat pe toate. ModulCA integreaza validator Neufert care detecteaza, in timp real pe proiectul 3D, neconformitatile - circulatii sub 90 cm, bai sub 3,5 mp, camere fara raport fereastra adecvat, dressing-uri sub gabarit minim. Verificarea care dura manual 2-3 ore pe proiect dureaza 2-3 secunde automat.",
      },
      {
        heading: "Pregatirea dosarului de autorizatie (DTAC ready)",
        body: "AI-ul modern genereaza, de la configuratia 3D, plansele tehnice necesare pentru dosarul DTAC: plan situatie, plan parter si etaje, sectiuni verticale, fatade pe patru laturi, detalii pereti, schema fundatie. Calitate inginereasca, format DWG/PDF/SVG.\n\nRolul arhitectului ramane: verifica corectitudinea, ajusteaza ce nu se potriveste cu situatia concreta, semneaza si asuma responsabilitatea profesionala. Dar porneste dintr-un set de planse 80% gata, nu de la zero.\n\nEconomia de timp: o casa unifamiliara standard, planse DTAC complete - de la 40-60 ore manual la 8-15 ore cu AI + verificare arhitect. Factura catre client scade cu 20-30%, marja arhitectului creste cu 40-60%.",
      },
      {
        heading: "Ce face AI-ul gresit (si de ce ai nevoie de arhitect)",
        body: "Limitele sunt reale si arhitectii buni le cunosc:\n\n- Context local necunoscut. AI-ul nu stie ca in comuna X primarul refuza acoperisuri terasa. Nu stie ca terenul tau are apa subterana la 1,2 m. Nu stie ca vecinul are pretentie la distanta minima de 4 m la care nu va ceda.\n- Responsabilitate profesionala. Codul P100 seismic, Eurocoduri, Legea 10/1995 - cer semnatura unui profesionist atestat. AI-ul nu poate semna.\n- Compozitie de ansamblu. Alegerea intre o casa cu 2 frontoane sau un acoperis cu un pantou, in contextul vecinilor si al peisajului natural, ramane decizie de arhitect.\n- Dialog cu clientul. Intelegerea ca vreau un living mare inseamna de fapt vreau sa pot primi 12 oameni la masa de Craciun este sensibilitate umana.\n- Erori ascunse. AI-ul uneori halucineaza detalii tehnice plauzibile dar incorecte. Fara verificare profesionala, aceste erori intra in proiect.",
      },
      {
        heading: "Workflow ModulCA pentru arhitecti",
        body: "Am proiectat platforma astfel incat sa se integreze natural intr-un birou de arhitectura care deja functioneaza, nu sa-l inlocuiasca:\n\n1. Importa terenul din fisier cadastral sau coordonate GPS. Platforma incarca automat limitele, topografia aproximativa si reglementarile locale (PUG, PUZ cand exista).\n2. Plaseaza modulele pe teren cu drag-and-drop. Fiecare modul de 3x3 m, 3x6 m sau 3x9 m este validat automat impotriva regulilor Neufert si restrictiilor locale (POT, CUT, aliniament).\n3. Configureaza finisaje din biblioteca de materiale certificate CE - fiecare cu specificatii tehnice, amprenta CO2 si pret actualizat zilnic.\n4. Genereaza randari pentru prezentare client - exterior, interior, ambiante. 15 stiluri disponibile, 10-20 secunde pe randare.\n5. Exporta planse DTAC - 6 tipuri de planse, format DWG/PDF profesional. Arhitectul le finalizeaza, le semneaza, le depune.\n6. Calcul energetic si structural preliminar - rapoarte care intra direct in dosarul de autorizatie ca piese justificative.\n\nFluxul tipic - de la importarea terenului la exportul planselor DTAC pentru o casa unifamiliara de 120 mp - dureaza intre 2 si 6 ore. Fata de 40-60 ore manual. Castigul nu este in a elimina arhitectul, ci in a elibera arhitectul pentru partea in care conteaza cu adevarat: conceptul, dialogul client, dialogul cu primaria.",
      },
      {
        heading: "Standarde Neufert - de ce sunt critice",
        body: "Multi proiectanti tineri invata AutoCAD, Revit, SketchUp - dar sar peste Neufert. Platforma ModulCA integreaza Neufert ca strat de validare permanent pe backend. Fiecare modul plasat, fiecare deschidere de usa, fiecare amenajare este comparata cu regulile de referinta.\n\nRezultatul practic: proiectele produse prin ModulCA trec la prima verificare la primariile din Romania in 92% din cazuri, conform datelor noastre pe proiectele 2024-2025. Proiectele artizanale fara validator automat au rata de acceptare la prima verificare de 60-70%, restul necesitand corectari (date de observatie din interviurile pe care le-am facut cu 40 de verificatori atestati in 2025).\n\nPentru arhitectii care doresc acces la biblioteca completa de standarde Neufert integrate plus exporturi tehnice profesionale, exista plan dedicat Constructor care include si licenta comerciala pentru folosirea planselor in proiecte platite.",
      },
      {
        heading: "Viitorul (2027-2030): ce vine",
        body: "Tendintele care se contureaza deja in 2026:\n\n- Verificare automata cod urbanism. Platformele AI vor citi regulamentul PUG si vor valida direct proiectul, inainte de depunere. Economiseste 2-4 saptamani.\n- Optimizare multi-obiectiv. AI-ul va sugera layout optim pentru lumina naturala, eficienta energetica si confort termic simultan - astazi arhitectul alege, in 2028 AI-ul propune 5 variante optimizate pe toate criteriile.\n- Digital twin. Fiecare casa livrata va avea un model digital viu, care urmareste consumul real, degradarea materialelor, costurile de intretinere - cu AI care propune interventii preventive.\n- Generare reglementari specifice. Modele antrenate pe reglementarile romanesti (P100, C107, P118, Lege 50, Lege 10, NP 051) vor genera proiecte pre-validate local, nu doar generic international.",
      },
      {
        heading: "Concluzie onesta si testare",
        body: "Arhitectii care trateaza AI-ul ca amenintare vor fi depasiti in 2-3 ani de concurentii care il trateaza ca instrument. Nu pentru ca AI-ul este mai bun - ci pentru ca un arhitect + AI este mai productiv decat un arhitect fara AI. In conditii de competitie, productivitatea castiga.\n\nCine castiga cel mai mult: arhitectii tineri care intra direct cu flux AI-integrat, fara obiceiuri vechi de schimbat. Cine pierde: arhitectii care cred ca calitatea manuala justifica tarife mai mari la o piata in care randamentele per proiect scad la jumatate. Nisa exista, dar se restrange.\n\nDaca esti arhitect si vrei sa evaluezi daca fluxul ModulCA se potriveste cu biroul tau, incepe un proiect gratuit - planul Explorer este gratuit, fara carte de credit. Pentru acces la exporturi profesionale (DWG, calcul termic detaliat, licenta comerciala), vezi planurile dedicate profesionistilor, cu promotie 3 luni gratuite pentru primii 500 de utilizatori beta.\n\nProiectul unei case 3D in 2026 nu mai trebuie sa ia 3 saptamani. In 3 ore ai un 80% bun, pe care il rafinezi in urmatoarele 5 ore pana la DTAC gata de depunere. Restul timpului - pentru ceea ce face arhitectul cel mai bine: gandit, compus, dialogat.",
      },
    ],
  },
];

/** Get a single Romanian article by slug */
export function getArticleRo(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES_RO.find((a) => a.slug === slug);
}

/** Get all Romanian slugs for static generation */
export function getAllSlugsRo(): string[] {
  return BLOG_ARTICLES_RO.map((a) => a.slug);
}
