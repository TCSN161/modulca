# MCA-SPEC — PermitTracker v1 (audit + spec)

**Written by:** 5.05 Chat 5 Design + Drawings · 2026-11-28 · **Status:** spec, no migration yet
**Inputs:** `src/features/design/components/technical/PermitTracker.tsx` (566 lines), `docs/MCA-SPEC-CATUC-PHASE3-PLATFORM.md` §3–§4, KB `06-regulations/RO/catuc-169-2026.new.md` + `building-permit-process.new.md` (Chat 2 F6).

## 1. Audit: what exists today

| Feature | File | State | Evidence |
|---|---|---|---|
| Slide-over panel opened from Technical (desktop + mobile button) | `technical/TechnicalPage.tsx:342, 726, 761` | ✅ works | code read |
| 11-step checklist (CU, geo, topo, DTAC, avize, ISU, mediu, AC, diriginte, start notice, reception) with done / date / notes | `PermitTracker.tsx` `PERMIT_STEPS` | 🟡 partial: the steps follow Law 50/1991, not CATUC | code read |
| Progress bar (% of steps done) | `PermitTracker.tsx` | ✅ works | code read |
| City contacts (10 cities: urbanism office, phone, e-mail, address) | `PermitTracker.tsx` `CITY_CONTACTS` | ⚠️ not verified; some domains look wrong (`pfrclujnapoca.ro`, `pfrmt.ro`; the real city-hall sites are other domains). Do not show them in the beta until someone checks them | code read |
| State persistence | `localStorage["modulca-permit-tracker"]` | ❌ one key for **all** projects; not in Supabase; lost on another device | `PermitTracker.tsx:249` |
| Document "upload" | text input for a file name | ❌ placeholder only, no file | `PermitTracker.tsx:527-534` |
| CATUC notification route (art. 294–298, house ≤ 150 m² rural) | — | ❌ missing (the AC route is the only one) | KB §3 |
| Notification package PDF/zip (Phase 3 §3) | — | ❌ missing; no `api/permit-tracker/*`, no `features/catuc/` | `ls` |
| Profile engine (project → articles + required documents, Phase 3 §4) | — | ❌ missing | `ls` |
| Drawings that a package would reuse | `technical/drawings/*` (floor plan, combined plan, elevation, section, foundation, MEP, wall detail) + `exportDrawing.ts` `downloadPdf()` (SVG → canvas → PDF, one drawing at a time) | ✅ exist, single-sheet export only | code read |
| i18n | — | ❌ English UI only; `labelRo` exists for step names | code read |
| Tier gate | none (the FeatureGate doc comment uses it as an example only) | — | `FeatureGate.tsx:13` |
| Tests | — | ❌ none | `ls` |

**Fixed in 5.05 (text only):** CU validity 12–36 months (art. 257); DTAC renamed PAC (art. 264); AC: 30 days to issue, 3 years to start the works with no extension (art. 273, 309), plus a pointer to the notification route. The ISU, mediu and start-of-works descriptions still follow the old law and need Chat 2 wording.

## 2. User path (CATUC), as steps

0. **Route check**: house type, floors, basement, area, rural/urban intravilan, protected zone → AC / Notification / No formalities (art. 294, 299). The certificate of urbanism decides in the end (art. 257), so the result reads "probable route" until the CU is uploaded.
1. **CU**: request → issued (validity 12–36 months). Upload the CU PDF.
2. **Studies**: topographic survey (ANCPI-authorised surveyor), geotechnical study.
3. **Avize/acorduri listed in the CU**: one sub-step for each item the CU lists (water, power, gas, environment, ISU…).
4. **PAC** (AC route) or **notification documentation** (notification route): signed by the partner architect.
5. **Submission**: AC file, issued within 30 days; or the notification, tacitly approved after 15 working days (art. 296).
6. **Before works**: site supervisor (diriginte), PTE, start notice to the city hall and ISC (art. 278), site panel.
7. **Reception at completion**.

## 3. Documents ModulCA can generate per step

| Step | ModulCA output | Source | Exists? |
|---|---|---|---|
| 0 | Route check result + reasons (articles) | profile engine (Phase 3 §4) | ❌ |
| 1 | CU request data sheet (land, address, intended use, area) | land store + design stats | ❌ (data exists) |
| 3 | Checklist of the avize named in the CU | profile engine + user input | ❌ |
| 4 | Drawing set PDF: site plan, floor plans, elevations, sections, foundation | `technical/drawings/*` | 🟡 single sheets; needs a multi-page set |
| 4 | Area table, consequence class CC1 note (art. 370, annex 6) | design stats | ❌ |
| 5 | Notification package zip (Phase 3 §3.1) with a DRAFT watermark until Vlad signs | react-pdf templates | ❌ |
| all | Status export (what is done, what is missing) | tracker state | ❌ |

## 4. Data model (proposal, no migration yet)

```sql
create table permit_trackers (
  project_id uuid primary key references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  route text not null default 'unknown',  -- 'ac' | 'notification' | 'none' | 'unknown'
  route_inputs jsonb not null default '{}',  -- answers to step 0
  city text,                                 -- free text + optional SIRUTA code later
  steps jsonb not null default '{}',         -- { [stepId]: { status, date, notes, docIds[] } }
  updated_at timestamptz not null default now()
);
-- RLS: owner only (user_id = auth.uid()); later read access for the partner architect.
-- Documents: Supabase Storage bucket "permit-docs/{project_id}/{stepId}/…", private, owner RLS.
```

Until the migration: key localStorage by project (`modulca-permit-tracker-{projectId}`) and migrate the old global key into the active project once.

## 5. UI screens

1. **Route check** (wizard of 5–6 questions) → route card with the articles.
2. **Tracker** (the current slide-over, route-aware step list; sub-steps from the CU).
3. **Step detail**: status, date, notes, file upload (Storage), "what ModulCA generates here" button.
4. **Package**: list of the generated PDFs + download zip (DRAFT watermark).
All text in RO + EN + NL from day 1.

## 6. What Chat 2 (CATUC / Neufert) provides

- `catuc-articles-map.json` (Phase 3 §4.2): article → route, triggers, required documents.
- Correct RO/EN/NL wording for the step descriptions (ISU, mediu, start notice, reception) under CATUC.
- Verification of the 10 city contacts (or a decision to drop them for the beta).

## 7. Out of scope for the Dec 15 beta

Submitting online to the national single desk (Ghișeul unic, art. 139); generating the official forms from Ord. MDLPA 975/2026; any claim that the package is valid without the partner architect's signature; regularisation (art. 301).

## 8. Ranked build list (for MAIN)

| # | Item | Size | Owner | Needs |
|---|---|---|---|---|
| PT-1 | Per-project localStorage key + migrate the old key; hide unverified city contacts behind a "verify with the city hall" note | S (1 h) | Chat 5 | — |
| PT-2 | i18n of the tracker (RO/EN/NL) + CATUC step texts from Chat 2 | S–M (2 h) | Chat 5 + Chat 2 text | Chat 2 wording |
| PT-3 | Step 0 route check (pure function + tests), route-aware step list | M (3 h) | Chat 5 | KB §3 facts (exist) |
| PT-4 | Multi-page drawing set PDF (reuse `drawings/*`, react-pdf or a jsPDF merge) | M (3–4 h) | Chat 5 | — |
| PT-5 | Supabase `permit_trackers` + Storage bucket + RLS; tracker syncs | M (3 h) | Chat 5 + MAIN (migration) | Costin runs the SQL |
| PT-6 | Profile engine + `catuc-articles-map.json` | M–L | Chat 2 (data) + Chat 5 (engine) | Chat 2 |
| PT-7 | Notification package zip (Phase 3 §3) with a DRAFT watermark | L (1 day) | Chat 5 | PT-3, PT-4, PT-6, Vlad sign-off |

Recommendation: PT-1 and PT-3 before the beta (cheap, and they remove wrong guidance); PT-2 if Chat 2 has the texts; PT-4 to PT-7 in W50/W51.
