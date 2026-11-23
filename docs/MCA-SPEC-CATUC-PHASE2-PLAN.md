# MCA-SPEC-CATUC-PHASE2-PLAN

**Status**: Active plan — Phase 2 of ModulCA 2.0 (CATUC content rewrite)  
**Owner**: Claude Code + Costin (coordination) + Arh. Vlad Ioniță (legal review)  
**Dates**: 2026-11-26 → 2026-12-05 (10 days)  
**Non-destructive**: All work goes to `.new.md` siblings until Vlad validates  
**Related**: [[MCA-DOC-STATUS-2026-11-19]] · [[MCA-DOC-BLOCKERS-2026-11-19]] · [[MCA-STRAT-AI-DELEGATION-2026-11-19]] · `docs/references/catuc/`

---

## 1. Scope

Rewrite all code + content references from repealed laws (**Legea 50/1991, Legea 350/2001**) to **CATUC (Legea 169/2026)**, effective since 2026-08-25.

**Scope IN**:
- 9 source files (manual edits) in `src/features/`, `src/knowledge/`, `docs/blog-drafts/`
- 1 auto-regenerated file (`src/knowledge/_index.ts` — rebuilds via `scripts/build-knowledge.mjs`)
- New CATUC knowledge chapter: `src/knowledge/06-regulations/RO/catuc-169-2026.new.md`
- New Ministry Clarifications chapter: `src/knowledge/06-regulations/RO/catuc-clarificari-2026.new.md`

**Scope OUT**:
- English blog articles (`articles.ts`) — no RO law refs to update
- Non-RO regulations (BE, DE, etc.) — unaffected
- Non-regulatory knowledge (design, materials, 3D) — unaffected
- UI text layer (`src/i18n/messages/`) — currently has no law refs; verify first, update only if needed

---

## 2. Methodology — "Parallel, Non-Destructive, Reviewed"

```
┌─ Step 1 ─────────────────────────────────────────────┐
│ NotebookLM synthesizes CATUC source files            │
│ (user uploads 3 files → Claude generates 20 queries) │
│ → Output: docs/research/2026-11-NN-notebooklm-catuc  │
└───────────────────┬──────────────────────────────────┘
                    ▼
┌─ Step 2 ─────────────────────────────────────────────┐
│ Claude builds article mapping table                  │
│ Legea 50/1991 art. X ↔ CATUC art. Y                  │
│ → Output: §4 of this doc (updated live)              │
└───────────────────┬──────────────────────────────────┘
                    ▼
┌─ Step 3 ─────────────────────────────────────────────┐
│ Claude writes .new.md sibling for each source file   │
│ (DeepSeek delegated for bulk translate, Claude for   │
│ legal-critical sections)                             │
└───────────────────┬──────────────────────────────────┘
                    ▼
┌─ Step 4 ─────────────────────────────────────────────┐
│ Arh. Vlad Ioniță reviews .new.md files               │
│ (user forwards via email or shared doc)              │
└───────────────────┬──────────────────────────────────┘
                    ▼
┌─ Step 5 ─────────────────────────────────────────────┐
│ Claude integrates Vlad's edits → final .new.md        │
└───────────────────┬──────────────────────────────────┘
                    ▼
┌─ Step 6 ─────────────────────────────────────────────┐
│ Deploy: mv X.new.md X.md (atomic replacement)        │
│ Rebuild _index.ts: node scripts/build-knowledge.mjs  │
│ Commit, push, Vercel auto-redeploys                  │
└──────────────────────────────────────────────────────┘
```

**Rule**: No `X.md` touched until `X.new.md` is Vlad-approved. Prevents partial-deploy accidents.

---

## 3. Per-file Rewrite Plan

### 3.1 Priority 1 — USER-FACING (deploy critical)

#### F1: `src/features/design/components/technical/PermitTracker.tsx:560`

**Current**:
```tsx
Based on Romanian building regulations (Legea 50/1991, modificată). 
Contact your local primărie for specific requirements.
```

**New (proposed)**:
```tsx
Based on Romanian building regulations (CATUC — Legea 169/2026, 
Monitorul Oficial nr. 661/10.08.2026, în vigoare din 25.08.2026). 
Contact your local primărie for specific requirements.
```

**Effort**: 1 line edit. Claude does.  
**Risk**: Low — static text, no logic change.  
**File sibling**: NOT needed (single line → Edit tool direct after plan approval)

---

#### F2: `src/knowledge/06-regulations/RO/building-permit-process.md`

**Lines affected**: L8 (sources frontmatter), L38 (bulleted law list)

**Current sources**:
```yaml
sources: ["Legea 50/1991", "OMS 839/2009"]
```

**New sources**:
```yaml
sources: 
  - "Legea 169/2026 (CATUC) — Monitorul Oficial 661/10.08.2026"
  - "Ministerul Dezvoltării — Clarificări CATUC 2026"
```

**Body L38 rewrite**: Full chapter — not just line swap. Legea 50/1991 had a different permit structure. CATUC introduces: notification vs full authorization split (art. 294 vs 285).

**New structure for this file**:
1. CATUC overview (1 paragraph)
2. Decision tree: Notification (art. 294) vs Authorization (art. 285-293) vs No-formalities (art. 299)
3. Procedure timeline per path
4. Documents required per path
5. Common mistakes & delays

**Effort**: 2-3 hours Claude (needs NotebookLM input first).  
**Delegation**: Translation + first draft → DeepSeek. Legal wording → Claude. Final review → Vlad.  
**File sibling**: `building-permit-process.new.md`

---

#### F3: `src/knowledge/06-regulations/RO/modular-prefab-regulations.md`

**Lines affected**: L8, L27 (table entry), L175 (bibliography)

**Context**: This is the **MOST IMPORTANT** file for modular construction — defines how CATUC rules apply to prefabricated modules.

**Key additions needed**:
- CATUC art. 294(2)(a)(ii) — Notification procedure applies for P / D+P modular houses ≤ 150m²
- CATUC art. 299(2)(c) — Why Studio preset (2 modules × 9m² × 3m tall) does NOT qualify as "no-formalities annex" (height exceeds)
- Articles 415, 524 — pending NotebookLM lookup
- How module dimensions map to CATUC area caps (16 modules × 9m² = 144m² fits in notification)

**Effort**: 3-4 hours Claude + Vlad legal review (this is the one where legal exposure is highest).  
**Delegation**: Claude writes, Vlad reviews EVERY word.  
**File sibling**: `modular-prefab-regulations.new.md`

---

#### F4: `src/knowledge/06-regulations/RO/urban-planning-pug-puz.md`

**Lines affected**: L8, L63, L64

**Context**: PUG (Planul Urbanistic General) and PUZ (Planul Urbanistic Zonal) are defined by Legea 350/2001. CATUC §3 Titlul III moves this to articles ~150-250 (need NotebookLM verify).

**Key changes**:
- Legea 350/2001 → CATUC Titlul III (urbanism documentation)
- Legea 50/1991 → CATUC Titlul VIII (building authorization)
- Reference the specific CATUC article for PUG/PUZ definitions

**Effort**: 2 hours Claude.  
**File sibling**: `urban-planning-pug-puz.new.md`

---

#### F5: `src/knowledge/06-regulations/RO/_meta.yaml`

**Lines affected**: L10, L15

**Current**:
```yaml
sources:
  - "Legea 50/1991 — Building Permits ..."
  - "Legea 350/2001 — Urban and Territorial Planning"
```

**New**:
```yaml
sources:
  - "Legea 169/2026 (CATUC) — Codul Amenajării Teritoriului, Urbanismului și Construcțiilor"
  - "Monitorul Oficial nr. 661/10.08.2026"
  - "Ministerul Dezvoltării — Clarificări CATUC 2026"
```

**Effort**: 2 min Edit.  
**File sibling**: Not needed — meta file, quick swap after main files are verified.

---

#### F6: `src/knowledge/17-guides/building-permit-romania.md`

**Lines affected**: L6 (frontmatter sources)

**Current**:
```yaml
sources: [
  "Legea 50/1991 privind autorizarea executarii lucrarilor de constructii",
  "Normele metodologice din 2024",
  "Ordinul MLPDA 839/2009"
]
```

**New**:
```yaml
sources: [
  "Legea 169/2026 (CATUC) — Codul Amenajării Teritoriului, Urbanismului și Construcțiilor",
  "Monitorul Oficial nr. 661/10.08.2026",
  "Ministerul Dezvoltării — Clarificări CATUC 2026",
  "Norme metodologice CATUC (dacă au fost publicate — TBD)"
]
```

**Body**: Same rewrite as F2 but guide-oriented (step-by-step for end user).  
**Effort**: 3-4 hours Claude.  
**File sibling**: `building-permit-romania.new.md`

---

#### F7: `src/knowledge/17-guides/choosing-land-modular-home.md`

**Lines affected**: L6

**Current**:
```yaml
sources: ["Legea 50/1991", "Codul Civil Roman", "Normativ NP 074 privind documentatii de urbanism"]
```

**New**:
```yaml
sources: [
  "Legea 169/2026 (CATUC)",
  "Codul Civil Român",
  "Normativ NP 074 privind documentații de urbanism (verifică dacă încă e în vigoare în regim CATUC)"
]
```

**Body**: Check for inline refs to 50/1991 in text — if present, rewrite.  
**Effort**: 1 hour Claude.  
**File sibling**: `choosing-land-modular-home.new.md`

---

### 3.2 Priority 2 — AUTO-GENERATED (regenerates from sources above)

#### F8: `src/knowledge/_index.ts` (lines 3330, 3471, 3618, 3619, 5701, 5723, 5929, 5934)

**Auto-regenerated** by `node scripts/build-knowledge.mjs` from the knowledge markdown files in `src/knowledge/`.

**Action**: After F2-F7 .new.md are deployed (step 6 of methodology), run build-knowledge.mjs → `_index.ts` auto-updates. No manual edit.

**Risk**: If build-knowledge.mjs has a hardcoded fallback or caches old refs, we'd see it in regen. Verify by grep after regen.

---

### 3.3 Priority 3 — CONTENT MARKETING (can delay)

#### F9: `src/features/blog/articles-ro.ts:115, 147`

**Two blog articles referencing Legea 50/1991 in body text.**

**Approach**: Edit inline — replace `Legea 50/1991` with `CATUC — Legea 169/2026` + add a brief sentence that notes the transition from old law.

**Example rewrite for L115**:
```
"...în realitate, parcursul este bine definit de CATUC (Legea 169/2026, 
intrată în vigoare din august 2026), care consolidează și înlocuiește 
vechea Legea 50/1991. Acest ghid parcurge fiecare etapă..."
```

**Effort**: 1 hour Claude.  
**File sibling**: `articles-ro.new.ts`  
**Deploy priority**: AFTER F2-F7 live, because blog references the knowledge library.

---

#### F10: `docs/blog-drafts/ro-03-permis-constructie-romania-procesul-complet.md`

**Draft article**, not yet published. Can rewrite freely in-place (Edit).

**Lines affected**: L11, L130 — same pattern as F9.

**Effort**: 30 min Claude.  
**File sibling**: Not needed (not deployed).

---

## 4. Article Mapping Table (filled as NotebookLM input arrives)

| Old reference | New CATUC article | Confidence | Source |
|---|---|---|---|
| Legea 50/1991 art. 1 (general) | CATUC art. 285 (general building authorization) | 🟨 Medium | Handoff hint |
| Legea 50/1991 art. 11 (certificat urbanism) | CATUC art. 286-290 (tbd verify) | 🟩 TBD | NotebookLM |
| Legea 50/1991 art. 7 (autorizație construire) | CATUC art. 285-293 | 🟨 Medium | Handoff hint |
| "Notification for small houses" | CATUC art. 294(2)(a)(ii) ≤ 150m² P/D+P | 🟩 High | Handoff direct |
| "No-formalities annex" | CATUC art. 299(2)(c) ≤ 20m² rural | 🟩 High | Handoff direct |
| "Notification procedure" | CATUC art. 295-298 | 🟩 High | Handoff direct |
| Legea 350/2001 art. 1 (urbanism) | CATUC Titlul III (tbd verify) | 🟨 Medium | Logical mapping |
| Legea 350/2001 PUG/PUZ | CATUC art. ~200-250 range (tbd) | 🟨 Medium | NotebookLM |
| OMS 839/2009 (norme metodologice) | CATUC norme metodologice (publicate?) | 🟩 TBD | Verify with Ministry |
| HG 766/1997 (calitatea) | Legea 10/1995 + CATUC (unchanged?) | 🟩 TBD | Verify |

**Legend**: 🟩 verified against source, 🟨 educated guess, 🟩 TBD = needs lookup.

**Update triggers**: Each NotebookLM Q&A session updates this table.

---

## 5. NotebookLM Synthesis Plan (step 1)

**User action** (10 min): Upload 3 files to [notebooklm.google.com](https://notebooklm.google.com):
1. `docs/references/catuc/catuc-169-2026-text.md`
2. `docs/references/catuc/catuc-169-2026-articole.json`
3. `docs/references/catuc/CATUC _ Clarificari privind 169.2026.pdf`

Name the notebook: **"CATUC 169/2026"**.

**Claude-prepared queries** (user pastes each, returns answer to Claude):

```
Q1. What is the full text of CATUC articles 294, 295, 296, 297, 298, 299? Include paragraphs and sub-points.

Q2. Which CATUC article(s) replace Legea 50/1991 art. 1 "general obligation to obtain building authorization"?

Q3. Which CATUC article(s) replace Legea 50/1991 art. 7 and art. 11 regarding building authorization and urbanism certificate?

Q4. Which CATUC article(s) replace Legea 350/2001 provisions about PUG (Planul Urbanistic General), PUZ (Planul Urbanistic Zonal), and PUD (Planul Urbanistic de Detaliu)?

Q5. What is the complete procedure for the notification regime under art. 294(2)(a)(ii) — timeline, documents, response from municipality, what to do if delayed?

Q6. What are articles 415 and 524 about? (These were flagged as having heading issues in the JSON parse.)

Q7. What does CATUC say about modular / prefabricated buildings specifically? Any article that distinguishes them from traditional construction?

Q8. What are the transitory provisions for projects started under Legea 50/1991 but not completed before 25.08.2026?

Q9. Does CATUC have "Norme metodologice" published? If so, when?

Q10. What CATUC articles relate to buildings on agricultural / forestry land?

Q11. What does Ministerul Dezvoltării's "Clarificări" PDF say are the 15 most common questions? Give the full answer for each.

Q12. Is there any provision about digital submission of applications under CATUC?

Q13. What are penalties under CATUC for building without authorization? (Compare to Legea 50/1991 penalties.)

Q14. What CATUC articles define "regulations" vs "procedures" for local municipalities?

Q15. Does CATUC change the role of signatary architects (arhitect cu drept de semnătură)?

Q16. What CATUC provisions apply for rural (sat) vs urban (oraș) areas regarding modular homes?

Q17. Is the "autorizație de construire" terminology preserved, or renamed under CATUC?

Q18. What documents MUST include the signatary architect's seal under CATUC?

Q19. What CATUC provisions apply for change of use (schimbarea destinației)?

Q20. Summary: Top 10 changes a Romanian homeowner/developer needs to know about CATUC vs old law.
```

**Output file**: `docs/research/2026-11-NN-notebooklm-catuc.md` with Q+A pairs.

---

## 6. Effort Estimate

| Step | Effort (ideal) | Owner | Notes |
|---|---:|---|---|
| NotebookLM synthesis | 1 user hour + 2 Claude hours | Both | Step 1 |
| Article mapping fill | 1 hour | Claude | Step 2 |
| F1 PermitTracker fix | 2 min | Claude | Trivial |
| F2 building-permit-process | 2-3 hours | Claude + DeepSeek | Needs NotebookLM input |
| F3 modular-prefab-regulations | 3-4 hours | Claude | CRITICAL legal content |
| F4 urban-planning-pug-puz | 2 hours | Claude | PUG/PUZ remap |
| F5 _meta.yaml | 5 min | Claude | Quick swap |
| F6 building-permit-romania.md | 3-4 hours | Claude + DeepSeek | Guide rewrite |
| F7 choosing-land | 1 hour | Claude | Light touch |
| F9 articles-ro.ts | 1 hour | Claude | Inline Edit |
| F10 blog-draft | 30 min | Claude | In-place rewrite |
| F8 _index.ts regen | 2 min (auto) | `npm run build:kb` | After F2-F7 deploy |
| New: catuc-169-2026.new.md chapter | 4-5 hours | Claude + Vlad | New authoritative doc |
| New: catuc-clarificari.new.md | 2-3 hours | Claude | Ministry answers |
| Vlad review all files | 2-4 hours (user time) | Vlad | External |
| Vlad corrections integrated | 1-2 hours | Claude | Iterative |
| Deploy + build + verify | 30 min | Claude | Automated |
| **TOTAL CLAUDE TIME** | **~26 hours** | - | Spread over 10 days |
| **TOTAL USER TIME** | **~5 hours** | - | Vlad review + NotebookLM upload |

**Daily plan** (10 days):
- Day 1 (Nov 25): NotebookLM upload + Q1-Q10 synthesis
- Day 2: Finish Q11-Q20 + article mapping table
- Day 3: F1 + F5 (quick wins) + start F3 (critical)
- Day 4: Finish F3 (modular-prefab) + send to Vlad for early review
- Day 5: F2 (building-permit-process) + F4 (urban-planning)
- Day 6: F6 + F7
- Day 7: F9 + F10 (blog)
- Day 8: New CATUC authoritative chapter + clarificări
- Day 9: Vlad feedback integration
- Day 10: Deploy + build + commit + verify ops:check unchanged

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Vlad unavailable or slow to review | Delays Phase 3 | Start early engagement (Nov 20-21), book Vlad time for Nov 28 - Dec 3 |
| NotebookLM misses articles 415, 524 | Mapping incomplete | Fallback: ask Perplexity "verify CATUC art. 415" + manual check in `catuc-169-2026-text.md` |
| DeepSeek translation misses legal nuance | Content invalid | Claude reviews EVERY DeepSeek output; Vlad final approval |
| `_index.ts` regen fails after .md changes | Build broken | Run `npm run build:kb` incrementally; keep backup |
| Vercel auto-deploys before Vlad approves | Public site shows WIP | Keep .new.md pattern strict; only mv .new.md → .md AFTER Vlad sign-off |
| CATUC Norme metodologice not yet published | Content incomplete | Note "pending official norms" in doc; update when Ministry publishes |
| Transitory provisions (projects started pre-25.08) | Users confused | Dedicate section in catuc-169-2026.new.md explaining transition rules |

---

## 8. Deploy Gate (end of Phase 2)

Before mv `.new.md` → `.md`:
- [ ] Vlad Ioniță has reviewed and signed off (email or doc comment)
- [ ] NotebookLM article mapping table 100% filled (no 🟩 TBD rows)
- [ ] `npm run test:run` passes (147 tests, no regressions)
- [ ] `npm run typecheck` 0 errors
- [ ] `npm run build` succeeds
- [ ] Test deploy to Vercel Preview branch (not production yet)
- [ ] Manual QA: open PermitTracker on preview, verify CATUC text appears
- [ ] Manual QA: open knowledge library RO section, verify sources show CATUC
- [ ] Final grep: `grep -r "Lege(a)? (nr\.? ?)?(50/1991|350/2001)" src/` returns 0 (or only in context of "replaces the old")

After Vercel preview green → mv all .new.md → .md, commit, push, production deploys automatically.

---

## 9. After Phase 2 ends

Next doc to write: `MCA-SPEC-CATUC-PHASE3-PLATFORM.md` for Phase 3 (Dec 6-14) covering:
- `/catuc-check` route — user inputs project params, system outputs applicable regime (notification / authorization / no-formalities)
- Notification package generator (v0 for PermitTracker)
- Profile engine (match user project to CATUC articles)

---

## 10. Review cadence during Phase 2

- Daily Claude note to MCA-LOG — what shipped, what blocked
- Mid-week (Dec 1): status check with Costin, confirm Vlad timeline
- End of phase (Dec 5): MCA-DOC-STATUS-2026-12-05 snapshot + phase retrospective
