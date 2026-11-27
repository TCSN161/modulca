# NEXT-2 — proposed next Chat 2 Neufert session

**Session:** `2.06.Neufert_Phase2-ArchitectEdits-F7_20261130` (Mon 30, or as soon as the partner architect's F2/F3 answers are in)
**Written by:** 2.05 (2026-11-27; 2.05 ran Fri 27 evening, pulled forward from Mon 30) · **Model:** Opus (legal content) · Keep it lean.

## Prompt

You are Chat 2 Neufert, session `2.06.Neufert_Phase2-ArchitectEdits-F7_20261130`. Talk to Costin in Romanian.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 2 paths (§10).
- `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md` §3 (F5, F7) and §4 (mapping table + F4/F6 review status).
- The partner review list `docs/research/2026-11-26-catuc-partner-review-list.md` (§2 questions, §5 the 2.07 addendum) and the architect's answers, if they are in (Chat 7 packages them; check `docs/` for `MCA-DOC-VLAD-REVIEW-PACKAGE-2026-11-28.md` and any answers file). Never write the partner architect's name in content.
- Source of truth: `docs/references/catuc/catuc-169-2026-text.md` and `catuc-169-2026-articole.json`; Clarificări: `docs/references/catuc/catuc-clarificari-ocr.md`.

Task A — only if the architect's answers are in: integrate them into F2 `building-permit-process.new.md` and F3 `modular-prefab-regulations.new.md`.
- Key open point: CC1 / art. 440(3) (no technical checking) vs. art. 259(5) and F2 §3.2/§4.6. When answered, also align F6 Step A2 (`17-guides/building-permit-romania.new.md`) and `src/app/api/consultant/catucFacts.ts` (re-run `catucFacts.test.ts`).
- Other answers: 309(5)/309(6)/310(5) reading, metropolitan exclusion (294(2)(a)(ii)), arhitect-șef aviz scope, diriginte de șantier for CC1.
- Record each answer in the files' provenance sections; set `status` to the approved value the spec §8 deploy gate expects.
- If the answers are not in, skip Task A and say so in one line.

Task B — F7 `src/knowledge/17-guides/choosing-land-modular-home.md` → create `choosing-land-modular-home.new.md`:
- Same `id` as the live file. Chat 2 self-check (ITEM-5), RO first then EN.
- Rewrite the legal parts on CATUC, reusing F4 (CU for information art. 253(3)(a); POT/CUT Annex 1 + Clarificări pct. 7; PUD/PUZ triggers art. 82, 66, 257(9); several houses on one plot art. 240(7); parcelare art. 216, 218, 240) and F2 (notification only rural intravilan). Check NP 074 status before citing it.
- Mark `self-checked` in the spec §4 F4/F6 status table (add an F7 row).

Task C (small) — F5 `src/knowledge/06-regulations/RO/_meta.yaml`: sources → CATUC (spec §3 F5); fix "Legea 10/1995 — still in force" (mostly abrogated, art. 576(3)(c)).

Finish:
- Script check: every `art. N` cited exists in the JSON (0 missing). Art. 415/524 only in `text.md`. Script from 2.05 is easy to redo: extract `art. N` / lists / ranges, compare with the JSON article numbers.
- No TBD left. Run `node scripts/build-knowledge.mjs`, then `git checkout -- src/knowledge/_index.ts` (never commit it).
- `git status` first; commit with explicit paths; push (pre-push runs tsc when `src/` changes; if it fails on another session's file, wait and retry).
- One line in §6 of the current week's schedule doc.
- Write the next prompt into `docs/sessions/NEXT-2.md`. Candidates: separate `catuc-clarificari-2026.new.md` chapter (spec §1); F8–F10; RO blog `casa-modulara-romania` rewrite (after review).
- Do not start any other session.

## Context carried over from 2.05 (F4 + F6, 2026-11-27)
- F4 `06-regulations/RO/urban-planning-pug-puz.new.md` (id `ro-urban-planning`, proOnly kept `true` like the live file) and F6 `17-guides/building-permit-romania.new.md` (id `building-permit-romania`) are written and self-checked. F4 cites 30 CATUC articles, F6 29 (+ Cod fiscal 474/476); 0 missing.
- No fact changed vs F2/F3; `catucFacts.ts` not touched. New verified facts in F6: art. 143(4)–(6) (0.1% state control contribution, half for notification, paid at the start notice) and art. 352(1)–(3) (0.5% ISC contribution, 50% at start, balance by acceptance). The old guide's "CSC 0.5%" is dropped (not in CATUC).
- F6 Step A2 mirrors F3 on technical checking (open with the architect). F2 left unchanged.
- Open in F4 provenance: Annex 1 POT definition — the consolidated text lists items 1–8 (uncovered terraces, alleys, parking, pools, pergolas, PV…) without saying whether they count or are excluded. Check the official M.Of. text before using the list (useful for F7).
- On swap `.new.md` → `.md`: remove the ST22 banner from the live F4 and F6 files.
- `build-knowledge` raised `articleCount` 16 → 17 in `_index.ts` (another session's `15-books` work, not F4/F6); restored, not committed.

## Context carried over from 2.08 (consultant CATUC awareness, ST13 + ST22)
- `src/app/api/consultant/catucFacts.ts` = the verified CATUC facts the consultant uses until F2/F3 go live (cached system block, all tiers). If F4/F6 or the architect's review changes a fact (e.g. CC1 / art. 440(3) technical checking, metropolitan exclusion), update this block in the same session and re-run `catucFacts.test.ts`.
- Retrieval: articles tagged `catuc` / `legea-169-2026` rank first on permit/CATUC questions, so the `.new.md` → `.md` swaps must keep those tags. Articles that still cite Legea 50/1991 / 350/2001 / DTAC get a PRE-CATUC note in the RAG context.
- ST22 banners ("Actualizare în curs …", RO+EN) are in 4 live library files (building-permit-process, modular-prefab-regulations, urban-planning-pug-puz, 17-guides/building-permit-romania) and 4 blog posts (`src/features/blog/catucBanner.ts`; RO casa-modulara-romania, permis-constructie-romania; EN building-regulations-romania-2026, choosing-architect-romania). **Remove each banner when its CATUC version goes live.** F6 replaces `building-permit-romania.md` → drop its banner then.
- RO blog `casa-modulara-romania` still says "Nu exista procedura simplificata" and AC valid 12 luni — wrong under CATUC; needs a content rewrite (after review).
- Golden test (5 questions, $0.15): `docs/research/2026-11-26-consultant-catuc-golden-test.md`.

## Context carried over from 2.07 (Q11–Q25, OCR, CATUC chapter)
- MDLPA Clarificări transcribed: `docs/references/catuc/catuc-clarificari-ocr.md` (pct. 3 = PUD via mayor's order for pre-CATUC PUDs; pct. 7 = new POT definition does not apply to PUG/PUZ approved before 25.08.2026; pct. 9 = PUZ intentions list, art. 66(3)–(6); pct. 11 = dezlipire 2 lots / PUD 3–12 lots / PUZ > 12 lots, art. 216–219, 240). Useful for F4.
- Ord. 975/2026 and Ord. 1.022/2026 confirmed. Q11–Q25 verification + errata: `docs/research/2026-11-26-catuc-answers-q11-q25.md` (Q14 errata: urgent-permit fee is art. 273(2), not 272(2)).
- New overview chapter `src/knowledge/06-regulations/RO/catuc-169-2026.new.md` (id `ro-catuc-169-2026`) — link to it from F4/F6 via `relatedArticles`.
- `src/knowledge/06-regulations/RO/_meta.yaml` still lists "Legea 10/1995 — still in force"; most of it is abrogated (art. 576(3)(c)). Fix when touching RO metadata.

## Context carried over from 2.04
- F3 done. The review list for the partner architect (F2 + F3, 12 questions) is in `docs/research/2026-11-26-catuc-partner-review-list.md`, and Chat 7 packages it for Sat 28.
- Open question that may change F2: Annex 6 puts P/P+1 single-family houses in **CC1**, and art. 440(3) says CC1 projects need no technical checking. F2 §3.2/§4.6 say checking is required for a permit. Wait for the architect's answer and don't edit F2 before then.
- Legea 10/1995 is mostly repealed (art. 576(3)(c)). If F4/F6 or the live files cite it as in force, correct it.
