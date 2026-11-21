# MCA-SPEC-CATUC-PHASE3-PLATFORM

**Status**: Framework (not implementation yet)  
**Phase**: 3 — Dec 6-14, 2026  
**Prev**: [[MCA-SPEC-CATUC-PHASE2-PLAN]]  
**Next**: MCA-DOC-PHASE4-BETA-PREP-CHECKLIST  
**Dependencies**: Phase 2 CATUC content deployed (`.new.md` → `.md` after Vlad approval)

---

## 1. Scope

Three deliverables, must land before invite-only beta (Dec 15):

1. **CATUC Checker route** `/catuc-check` — user inputs project params → output applicable regime
2. **PermitTracker v0** — generates notification package (art. 294) PDF/zip with pre-filled DTAC skeleton
3. **Profile Engine** — maps user project data → CATUC articles → required documents list

---

## 2. Deliverable 1 — CATUC Checker Route

### 2.1 Route: `GET/POST /catuc-check`

**Input** (POST body or query params):
```ts
{
  moduleCount: number;         // 1-16 modules
  area_sqm: number;            // derived from modules × 9m²
  heightRegime: "P" | "D+P" | "P+1" | "P+E+M";
  zone: "urban" | "rural";
  isIntravilan: boolean;       // vs extravilan
  isResidential: boolean;      // vs annexe
  hasExistingUtilities: boolean; // water/electric/sewer at plot
}
```

**Output**:
```ts
{
  applicableRegime: "no-formalities" | "notification" | "full-authorization";
  catucArticle: string;        // e.g., "art. 294(2)(a)(ii)"
  rationale: string;           // 1-paragraph explanation RO
  requiredDocuments: string[]; // from F2 content
  estimatedTimeline: string;   // "30 days" | "60-180 days"
  warnings?: string[];
}
```

### 2.2 UI

- Form-based page under `/project/[id]/technical` (integrate into existing step 11)
- Or standalone `/catuc-check` for public (SEO content)
- Vizual decision tree + explanation

### 2.3 Logic file

`src/features/catuc/checker.ts` — pure function, no I/O, 100% testable.

Decision tree:
```
IF !isResidential AND area_sqm ≤ 20 AND !isIntravilan → "no-formalities" (art. 299(2)(c))
ELIF isResidential AND heightRegime ∈ ["P", "D+P"] AND area_sqm ≤ 150 → "notification" (art. 294(2)(a)(ii))
ELSE → "full-authorization" (art. 285-293)
```

### 2.4 Tests

`src/features/catuc/checker.test.ts` — 10-15 cases covering edge:
- Studio 2 modules (18m²) → notification (not no-formalities because residential)
- Family 10 modules P (90m²) → notification
- Family 20 modules P+1 (180m²) → full authorization
- Annexe 20m² rural → no-formalities
- Annexe 22m² rural → notification (over threshold)

---

## 3. Deliverable 2 — PermitTracker v0 (notification package generator)

### 3.1 Component

`src/features/design/components/technical/PermitTracker.tsx` — already exists, upgrade v0 → v1 with:

- "Generate Notification Package" button (visible only if applicableRegime === "notification")
- Click → server action generates zip:
  - `Notificare_CATUC_art_294.pdf` (templated, pre-filled with user data)
  - `Plan_amplasament.pdf` (export from Step 7 land config)
  - `Plan_arhitectura.pdf` (export from Step 10 design)
  - `Documente_necesare_checklist.pdf` (list of what user still needs to add)
  - `README.txt` (instructions how to submit at primărie)

### 3.2 Server action

`src/app/api/permit-tracker/notification-package/route.ts` (NEW):
- Receives project ID + CATUC checker result
- Fetches project data from Supabase
- Uses `@react-pdf/renderer` (already in deps) to generate PDFs
- Returns zip stream

### 3.3 PDF templates

`src/features/catuc/pdf-templates/`:
- `NotificareCATUCTemplate.tsx` — the main notification form
- `ChecklistTemplate.tsx` — what-you-still-need list
- `ReadmeTemplate.tsx` — step-by-step primărie submission guide

### 3.4 Legal review

Each PDF template needs **Vlad sign-off** before deploy. Add watermark "DRAFT - pending signatory architect validation" until signed.

---

## 4. Deliverable 3 — Profile Engine

### 4.1 Purpose

Maps user project → ALL applicable CATUC articles + required documents list.

Example: "Casa P+1 90m² intravilan urban" → engine returns:
- Articles: 285, 286, 287, 288, [...], Legea 10/1995 (parallel)
- Documents: CU, DTAC, Studiu geotehnic, [...], Aviz electric, Aviz apă-canal

### 4.2 Data source

`src/knowledge/06-regulations/RO/catuc-articles-map.json` (NEW) — parsed from CATUC JSON:
```json
{
  "art-285": {
    "title": "...",
    "regimeType": "full-authorization",
    "triggers": ["residential && >150m²"],
    "requiredDocuments": ["CU", "DTAC", "..."]
  },
  ...
}
```

### 4.3 Service

`src/features/catuc/profile-engine.ts` — pure function:
```ts
function getApplicableArticles(project: ProjectProfile): CatucArticle[]
function getRequiredDocuments(project: ProjectProfile): Document[]
```

### 4.4 Integration points

- CATUC Checker (§2) uses this for the rationale
- PermitTracker v0 (§3) uses this for checklist generation
- Step 14 (Finalize) shows this as "Documents I still need"

---

## 5. Daily plan Phase 3 (Dec 6-14)

| Day | Focus |
|---|---|
| **Vi 6** | checker.ts logic + tests (pure TS, no UI yet) |
| **Sa 7** | checker UI + API route |
| **Lu 9** | Profile engine data model + parser from CATUC JSON |
| **Ma 10** | Profile engine service + integration with checker |
| **Mi 11** | PermitTracker v0 PDF templates (3 files) |
| **Jo 12** | Server action + zip generation + download flow |
| **Vi 13** | E2E tests (Playwright) + Vlad review PDFs |
| **Sa 14** | Deploy prep + verification |

---

## 6. Dependencies

| Dep | Status | Notes |
|---|---|---|
| Phase 2 CATUC content deployed | ⏳ by Dec 5 | Checker needs article references |
| Vlad Ioniță review PDFs | ⏳ by Dec 13 | Legal gate for notification package |
| `@react-pdf/renderer` 4.9.0 | ✅ in deps | Already installed |
| Supabase projects table | ✅ live | Project data source |

---

## 7. Deploy gate

Before Dec 15 beta start:
- [ ] Checker tests 100% green (10+ cases)
- [ ] PermitTracker v0 generates valid PDF (manual review)
- [ ] Profile engine returns consistent output for all 14 preset configs
- [ ] Vlad sign-off on PDF templates
- [ ] E2E test: user goes from Step 1 → Step 14 → downloads notification package

---

## 8. Not in Phase 3 scope (defer to Phase 4-7)

- Full authorization package (art. 285-293) — much more complex, Phase 7+
- Automatic avize submission (electronic signatures, Primărie APIs) — Phase 7+
- Multi-arhitect coordination flow — Phase 6+
- Payment processing for permit fees — out of scope (user pays primărie directly)

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| PDF rendering edge cases (Romanian diacritics, long names) | Test with 10+ real user scenarios |
| Vlad takes >2 days for PDF review | Front-load: send draft Dec 11, ask review by Dec 13 |
| Checker logic misses CATUC edge case | Peer-review with Vlad before deploy; add warning for borderline cases |
| Supabase query latency on profile fetch | Add 1h cache (same pattern as consultant route) |

---

*Phase 3 = platform teeth. Phase 2 was content; Phase 3 makes content actionable.*
