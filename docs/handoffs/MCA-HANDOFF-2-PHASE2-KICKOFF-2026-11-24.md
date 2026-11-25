# MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24

**From**: Chat 1 MAIN → **To**: Chat 2 Neufert
**Status**: Phase 2 execution contract for W48 (written early on Tue 24 to save the evening MAIN session)
**Update Wed 25**: No-Go applied (ingest not done Tue). All items shifted +1 day; see item headers.
**Spec**: [[MCA-SPEC-CATUC-PHASE2-PLAN]] (§2 methodology, §3 per-file plan, §4 mapping table, §8 deploy gate)
**Schedule**: [[MCA-DOC-WEEK-2026-W48-SCHEDULE]]

---

## 0. Readiness gate (Tue 24 morning, MAIN)

| Check | Result |
|---|---|
| ops:check | ✅ 29 pass / 2 warn / 0 fail |
| CI + cron workflows | ✅ green (last Ops Check cron 03:42 today) |
| Prod | ✅ modulca.eu 200, /api/health ok |
| Supabase auth warning | ⚠️ **local only**: `.env.local` still holds the legacy JWT anon key (disabled Nov 21) → local auth returns 401. Vercel prod keys were updated Nov 21. Does not block content work; blocks local login testing. Fix = Costin copies the new publishable key into `.env.local`. |
| DeepSeek top-up | ⏳ Costin today (if "no": Claude does translation itself) |
| NotebookLM Q1–Q10 | ⏳ Costin today — **the only hard gate** |
| `.new.md` skeletons | ✅ F2, F3, F4 exist (128 / 111 / 128 lines) |

**Go/No-Go rule**: ITEM-1 committed by Tue 24 EOD → Go Wed 25. Otherwise F2 Thu 26, F3 Fri 27, F4+F6 Mon 30.

---

## 1. Items

### ITEM-1 — NotebookLM ingest (Wed 25 after No-Go, session 2.02.Neufert_NotebookLM-Ingest_20261125)
- Costin pastes Q1–Q10 answers **directly in this session** (any format). Chat 2 builds the JSON (`scripts/catuc-ingest.mjs` header shows the format) and runs the script.
- Then fill §4 article mapping table in the spec (Legea 50/1991 / 350/2001 art. ↔ CATUC art.).
- **Verify every cited article number** against `docs/references/catuc/catuc-169-2026-articole.json`. Flag anything NotebookLM cited that does not exist.
- Done = answers doc + mapping table committed.

### ITEM-2 — F2 building-permit-process (Thu 26, session 2.03)
- Fill `building-permit-process.new.md` skeleton (all TBD markers).
- Done = no TBD left, frontmatter sources = CATUC articles, tests green, committed. **Not deployed.**

### ITEM-3 — F3 modular-prefab-regulations (Fri 27, session 2.04) — CRITICAL
- Every legal sentence carries an article reference. No paraphrase of obligations without a citation.
- Claude only; no DeepSeek for this file.

### ITEM-4 — F4 + F6 (Mon 30, session 2.05)
- F4 `urban-planning-pug-puz.new.md` (PUG/PUZ remap), F6 `17-guides/building-permit-romania.md` body → create `.new.md` sibling.

### ITEM-5 — Vlad review package (Fri 27, end of day — F2 + F3 only)
- Vlad's **full review** covers F2, F3 + notification PDFs only (decision 2026-11-23, fee cap). For F1, F4–F10: Chat 2 does a self-check against the article text and marks each file `self-checked` in the mapping table.
- List what goes to Vlad on Sat 28 in a short note; Chat 7 packages it (`MCA-DOC-VLAD-REVIEW-PACKAGE-2026-11-28.md`).

---

## 2. Delegation rules (DeepSeek)

| OK for DeepSeek | Not for DeepSeek |
|---|---|
| RO → EN translation of finished F2, F4, F6 text | Any legal reasoning, obligation wording, article interpretation |
| Formatting, frontmatter boilerplate, tables | F3 (whole file) |
| First draft of explanatory/how-to prose | Anything about the signatory architect role |

Claude reviews every DeepSeek output before commit.

---

## 3. Rules for this week

- Write only in Chat 2 paths (WORKFLOW §10). `.new.md` siblings only — **never overwrite the live `.md`** until the §8 deploy gate (W49, after Vlad).
- One session per item; end each with the standard end-of-session line and the next session's opening prompt.
- If an item overruns, carry it over; never rush F3.
- Report back: one line per finished item in `docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md` §6 (live log) is enough — no separate handoff needed unless something blocks.
