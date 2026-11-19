# NotebookLM Query Packet — CATUC 169/2026

**Purpose**: User uploads 3 CATUC files to NotebookLM, pastes each query below one at a time, and saves answers back for Claude to integrate into `.new.md` files during Phase 2.  
**Date**: 2026-11-19 (packet prepared for Phase 2 kickoff Nov 26)  
**Related**: `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` §5

---

## 📋 Setup (one-time, 10 min)

### Step 1 — Open NotebookLM
Go to: [notebooklm.google.com](https://notebooklm.google.com)  
Sign in with your Google account (free, no Pro needed).

### Step 2 — Create notebook
- Click **"+ New notebook"**
- Name it: **"CATUC 169/2026"**

### Step 3 — Upload 3 source files
Click **"Add sources"** → **"Upload"** → select all 3:
- `C:\Users\Costin\Documents\modulca\docs\references\catuc\catuc-169-2026-text.md`
- `C:\Users\Costin\Documents\modulca\docs\references\catuc\catuc-169-2026-articole.json`
- `C:\Users\Costin\Documents\modulca\docs\references\catuc\CATUC _ Clarificari privind 169.2026.pdf`

Wait for NotebookLM to process (~2-3 min for 3.1 MB total).

### Step 4 — Verify sources
After processing, NotebookLM shows a sidebar with 3 sources. Click each to verify content was ingested correctly.

---

## 🎯 How to use the queries below

- Each query is self-contained. Copy exactly as written.
- Paste one at a time into the NotebookLM chat input.
- Wait for answer with citations (NotebookLM auto-cites source + page).
- **IMPORTANT**: Click "Save to note" after each answer (NotebookLM has a "Save" button). This lets you compile them all in one go later.
- Alternative: paste Q + A back into our main chat here — Claude integrates into `.new.md` docs.

Expected output quality: NotebookLM is EXCELLENT at this type of work. Expect specific article references + verbatim quotes.

**Pro tip**: If an answer is thin, follow with: *"Please cite the specific article number and paragraph for each claim."*

---

## 🔍 Query Set 1 — CORE ARTICLES (priority — do these first)

Start with these 10. They cover 80% of what we need for Phase 2 rewrite.

### Q1 — Articles 294-299 verbatim
```
Please provide the complete verbatim text of CATUC (Legea 169/2026) articles 
294, 295, 296, 297, 298, and 299. For each article include all paragraphs 
(alin.), sub-points (lit.), and references to other articles. Keep the 
original Romanian wording.
```

### Q2 — Replacement for Legea 50/1991
```
Which CATUC articles replace the following provisions from Legea 50/1991:
- Art. 1 (general obligation to obtain building authorization)
- Art. 7 (regime of building authorization)
- Art. 11 (urbanism certificate)
- Art. 13 (documentation for building authorization)

For each old article, give the new CATUC article number, title, and a 
brief description of changes vs the old law.
```

### Q3 — Replacement for Legea 350/2001
```
Which CATUC articles replace Legea 350/2001 provisions about:
- PUG (Planul Urbanistic General)
- PUZ (Planul Urbanistic Zonal)
- PUD (Planul Urbanistic de Detaliu)
- Certificat de urbanism

Give the new CATUC article numbers and summarize substantive changes (if any) 
from the old 350/2001 provisions.
```

### Q4 — Notification procedure (art. 294-298) complete
```
Explain the complete notification procedure under CATUC art. 294-298 for 
building a modular or small residential house:
1. What qualifies (dimensions, type P or D+P, 150m² cap)
2. Documents required with the notification
3. Timeline for municipality response
4. What happens if municipality does NOT respond within the deadline
5. Can the notification be rejected? On what grounds?
6. What next steps after notification is accepted (or deemed accepted by silence)?

Cite specific paragraphs.
```

### Q5 — Modular/prefabricated buildings
```
Does CATUC (Legea 169/2026) have any specific articles, paragraphs, or 
mentions addressing modular, prefabricated, panelized, or industrialized 
construction? 

Search for terms: "modular", "prefabricat", "panouri", "elemente 
industrializate", "containers", "unități modulare".

If yes, quote them verbatim and give article numbers. If not, confirm 
that CATUC treats modular construction the same as traditional.
```

### Q6 — Articles 415 and 524 (parse-issue flagged)
```
Give the full verbatim text of CATUC articles 415 and 524. These were 
flagged as having heading detection issues during JSON parse. Confirm 
what each one is about, its full title, and paragraphs.
```

### Q7 — No-formalities annex (art. 299(2)(c))
```
CATUC art. 299(2)(c) refers to no-formalities annexes up to 20m² in rural 
areas. 

Please provide:
1. The full verbatim text of art. 299, especially alin. (2) and sub-point (c)
2. What qualifies as "annex" (anexă) under CATUC
3. Any height restrictions (I need to verify if a 3-meter tall structure qualifies)
4. The difference between "rural" definition under CATUC vs the old laws
5. What paperwork, if any, is still needed even when "no formalities" applies
```

### Q8 — Transitory provisions
```
What are the transitory provisions (dispoziții tranzitorii) in CATUC for 
projects that were:
1. Already authorized under Legea 50/1991 before 25.08.2026 but not yet started
2. Started but not completed before 25.08.2026
3. In the authorization pipeline (certificat urbanism obtained, but authorization not issued) at the time of transition

Which articles cover this? What's the deadline for completing under old rules?
```

### Q9 — Norme metodologice CATUC
```
Have the "norme metodologice de aplicare" for CATUC been published? 
If yes, provide:
1. Publication date
2. Order/HG number
3. Key sections

If not published yet, what does CATUC say about when they must be issued, 
and what applies in the interim?
```

### Q10 — Signatary architect (arhitect cu drept de semnătură)
```
Does CATUC change the role of signatary architects (arhitect cu drept de 
semnătură, membru OAR)?

Specifically:
1. Which documents MUST be signed by a signatary architect under CATUC?
2. What qualifications must the signatary architect have?
3. Are there any changes from Legea 50/1991 and Legea 184/2001 on this?
4. Does CATUC introduce any new professional roles (e.g., urban planner, 
   structural engineer) with mandatory signatory capacity?
```

---

## 🔍 Query Set 2 — SECONDARY (do these when you have more time)

### Q11 — Ministry Clarifications 15 items
```
The source PDF "CATUC Clarificari privind 169.2026.pdf" from Ministerul 
Dezvoltării contains 15 clarifications. 

For each of the 15:
1. State the question
2. Give the Ministry's answer verbatim
3. Note which CATUC article(s) the clarification references

List all 15 in order.
```

### Q12 — Digital submission under CATUC
```
Does CATUC introduce or enable digital/electronic submission of:
- Building authorization applications (autorizație de construire)
- Notifications (art. 294)
- Urbanism certificates (certificat urbanism)

Cite any articles that mention digital/electronic submission, online 
platforms, or e-signatures.
```

### Q13 — Penalties under CATUC vs old laws
```
What are the penalties under CATUC for:
1. Building without authorization when authorization was required
2. Building without notification when notification was required  
3. Not complying with the authorized project
4. Not respecting CATUC during execution

Compare to penalties under the old Legea 50/1991 (where applicable). Are 
they higher, lower, same?
```

### Q14 — Agricultural & forestry land
```
What does CATUC say about building on:
1. Agricultural land (teren agricol)
2. Forestry land (teren forestier)
3. Protected areas (arii naturale protejate)
4. Pastureland (pășune)

Which CATUC articles cover this? Any special procedures for conversion 
(scoaterea din circuitul agricol) under the new law?
```

### Q15 — Rural vs urban differences
```
Does CATUC distinguish between rural and urban zones for:
1. Building authorization procedures
2. Notification regime availability
3. Area caps for no-formalities constructions
4. Documentation requirements

Give specific article references for rural-specific provisions.
```

### Q16 — Change of use (schimbarea destinației)
```
What CATUC articles govern "change of use" (schimbarea destinației) of an 
existing building? For example, converting a residence to a commercial 
space, or a storage building to residential.

Provide:
1. Article numbers
2. Procedure required
3. Documents needed
4. Timeline
5. Whether it's a notification or full authorization
```

### Q17 — Authorization terminology
```
Is the terminology "autorizație de construire" preserved under CATUC, or 
is it renamed? Similarly for:
- Certificat de urbanism
- Aviz
- Acord
- Notificare
- Autorizație de desființare

List all the authorization terms used in CATUC with their defining article.
```

### Q18 — Documents signed by architect
```
List all documents under CATUC that MUST include the signatary architect's 
seal and signature (ștampilă arhitect cu drept de semnătură).

Group by:
1. Documents required for notification (art. 294)
2. Documents required for building authorization
3. Documents required for completion certificate (proces-verbal recepție)
```

### Q19 — Urbanism certificate (certificat urbanism) under CATUC
```
How does CATUC regulate the urbanism certificate (certificat urbanism)?

Specifically:
1. Which article defines it?
2. What's its validity period?
3. What must it contain?
4. Who issues it (primărie, consiliu județean)?
5. Can it be refused? On what grounds?
6. Any digital/online issuance provisions?
```

### Q20 — Top 10 changes a homeowner must know
```
Summarize the top 10 practical changes a Romanian homeowner or small 
developer must know when planning to build under CATUC (Legea 169/2026) 
compared to the old Legea 50/1991 + Legea 350/2001 regime.

For each change:
1. Brief name
2. Old rule (one line)
3. New rule under CATUC (one line)
4. Why it matters practically (one line)
5. CATUC article(s) that govern this
```

---

## 📊 Query Set 3 — DEEP DIVE (if time allows, optional for Phase 2)

### Q21 — Energy efficiency + EPBD alignment
```
Does CATUC align with the EU Energy Performance of Buildings Directive 
(EPBD) 2024 revision? What energy-efficiency provisions does CATUC 
include that were not in Legea 50/1991?
```

### Q22 — Seismic provisions
```
How does CATUC address seismic-resistance requirements (zonele seismice 
din România)? Does it reference Legea 10/1995 (calitatea în construcții) 
or does it integrate seismic rules into CATUC itself?
```

### Q23 — Appeal process
```
What is the appeal process under CATUC for a:
1. Refused notification (art. 294)
2. Refused building authorization
3. Refused urbanism certificate

Timeline, body to appeal to, grounds for appeal, costs?
```

### Q24 — Demolition under CATUC
```
What are the rules for demolition (desființare) under CATUC? Compare to 
"autorizație de desființare" under old Legea 50/1991. Any new procedures?
```

### Q25 — Monitoring and control
```
What does CATUC say about inspections during construction (control pe 
șantier)? Who has authority to inspect? What can they require? Penalties 
for refusing inspection?
```

---

## ✉️ After NotebookLM session — compile results

When done:
1. Save each Q+A in NotebookLM's "Notes" section
2. Export the notebook: Notebook menu → "Export" → choose Markdown
3. Paste into Claude main chat here (or save to `docs/research/2026-11-NN-notebooklm-catuc-answers.md`)

Claude will then:
- Fill the Article Mapping Table in `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` §4
- Start writing `.new.md` siblings for the 9 source files
- Flag any gaps (questions NotebookLM couldn't answer clearly) for Perplexity cross-check or direct source reading

**Alternative workflow**: If you're short on time, do Q1-Q10 only this week, then schedule Q11-Q20 for next week.

---

## 🔗 Troubleshooting

**NotebookLM answer is thin or wrong**:
- Reword: "Please search the uploaded sources specifically for..."
- Add: "Give verbatim text with citation marks [1], [2]..."
- Fallback: ask Claude here to run a `grep` in `catuc-169-2026-text.md` for specific terms.

**Source upload fails**:
- `.md` file 1.25 MB should be fine
- If JSON fails: convert to text first (`cat catuc-169-2026-articole.json | python -m json.tool > out.txt`)
- `.pdf` 646 KB should work directly

**NotebookLM asks me to log in**:
- Free Google account is sufficient
- NotebookLM is free (no Pro needed for our use case)

---

*Prepared by Claude 2026-11-19. Ready for Phase 2 kickoff Nov 26. Zero prep required beyond file uploads.*
