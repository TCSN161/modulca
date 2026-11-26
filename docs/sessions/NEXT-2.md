# NEXT-2 — proposed next Chat 2 Neufert session

**Session:** `2.05.Neufert_Phase2-F4-F6-Content_20261130` (Mon 30)
**Written by:** 2.04 (2026-11-26), updated by 2.07 and 2.08 (2026-11-26) · **Model:** Opus (legal content) · Keep it lean.

## Prompt

You are Chat 2 Neufert, session `2.05.Neufert_Phase2-F4-F6-Content_20261130`, doing ITEM-4 from `docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md`.

Read first:
- The §9 read-first files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`. Write only in Chat 2 paths (§10).
- The handoff: ITEM-4, ITEM-5 (self-check rule for F4–F10), ITEM-6 (PAC), ITEM-7 (unverified order numbers).
- `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md`: §3 F4 + F6 plans and §4 mapping table (4b = Legea 350/2001 → CATUC: PUG art. 45–61, PUZ art. 62–76, PUD art. 81–85, CU art. 253–258).
- `docs/research/2026-11-25-notebooklm-catuc-answers.md`, including the Verification/errata section (Q3 is the PUG/PUZ/PUD answer).
- Style and structure to mirror: F2 `src/knowledge/06-regulations/RO/building-permit-process.new.md` and F3 `modular-prefab-regulations.new.md` (both done).
- Source of truth: `docs/references/catuc/catuc-169-2026-text.md` and `catuc-169-2026-articole.json`.

Task A — F4 `src/knowledge/06-regulations/RO/urban-planning-pug-puz.new.md`:
- Fill every TBD. Remap Legea 350/2001 → CATUC: urbanism documentation (art. 13), PUG (45–61; CUT > 4 only via PUG, art. 46; update art. 61, 573), PUZ (62–76; POT/CUT +20% once, art. 66), PUD = **Proiect** urbanistic de detaliu (81–85; approved by the mayor's order, art. 85), validity (art. 109), and the CU link (art. 257(9): CU may require a PUD/PUZ).
- What a modular-house buyer needs: when a PUZ/PUD is needed for their plot, and how POT/CUT limits the number of modules.
- Every legal sentence cites a CATUC article you checked in the law text. Ord. 1.022/2026 is now **confirmed** (2.07: Portal notes + MDLPA Clarificări pct. 1) and may be named: Ord. nr. 1.022/28.08.2026, M.Of. nr. 724/28.08.2026 — procedura de elaborare/aprobare a documentațiilor AT/U, formulare, lista avizelor.
- Frontmatter `id` = the live file's id (check `urban-planning-pug-puz.md`), so the `.new.md` → `.md` swap keeps the URL.

Task B — F6 `src/knowledge/17-guides/building-permit-romania.md` → create `building-permit-romania.new.md`:
- Step-by-step guide for the end user, built on F2 (cite the same articles, no new legal claims without a check). PAC (fostul DTAC) once. Drop "Norme metodologice CATUC — TBD" from sources.
- Same `id` rule.

Rules:
- RO first, then EN. DeepSeek is allowed only for RO→EN translation of finished F4/F6 text (check the balance first; it was $0.00 on Thu 26 → Claude translates). Claude reviews every DeepSeek line.
- Keep the "informational only" disclaimer. Never write the partner architect's name.
- F4 and F6 get a **Chat 2 self-check** (not an architect review): mark both `self-checked` in the spec §4 mapping table.

Finish:
- Script check: every `art. N` cited exists in the JSON (0 missing). Art. 415/524 exist only in `text.md` (the JSON merged them into 414/523), so cite them only if you also check `text.md`. Annexes are in the art. 584 entry of the JSON.
- No TBD left. Run `node scripts/build-knowledge.mjs` (`.new.md` is skipped; restore `_index.ts` if only the timestamp changed).
- `git add` only your files, commit with explicit paths, push (the pre-push hook runs tsc when `src/` changes).
- One line in §6 of the current week's schedule doc.
- Write the next prompt into `docs/sessions/NEXT-2.md`. Candidates: integrate the architect's F2/F3 edits after Sat 28 review; F7 `choosing-land-modular-home`; ~~ingest NotebookLM Q11–Q25~~ (done in 2.07); integrate the architect's answers on the 2.07 addendum (§5 of the partner review list); separate `catuc-clarificari-2026.new.md` chapter (spec §1) from `docs/references/catuc/catuc-clarificari-ocr.md`.
- Do not start any other session.

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
