# Week Plan — W48 (Mon 23 Nov to Sun 29 Nov 2026)

**Written by**: 1.02.MAIN_WeeklyPlan-W48_20261123 (Monday, not Friday — first week of the ritual)
**Phase**: Phase 1 closed (100%). Phase 2 (CATUC content) kicks off **Thu 26 Nov**.
**Inputs**: [[MCA-DOC-STATUS-2026-11-21]] · [[MCA-DOC-WEEKEND-PLAN-2026-11-22]] · [[MCA-DOC-PHASE2-KICKOFF-CHECKLIST]] · [[MCA-SPEC-CATUC-PHASE2-PLAN]]

---

## 0. Date correction (read first)

Earlier docs say "Phase 2 kickoff **Wed** 26 Nov". **26 Nov 2026 is a Thursday.** The same one-day weekday slip runs through STATUS-2026-11-21 §6, WEEKEND-PLAN, PHASE2-KICKOFF-CHECKLIST and the NAMING doc §4 example (where "Fri 28" is actually Saturday).

**Resolution used in this plan: the DATE stays fixed, the weekday label changes.**
- Session names, the kickoff checklist and Vlad's review window (Nov 28 – Dec 3) are all date-anchored, so keeping 26 Nov avoids rewriting them.
- It also adds one day of buffer for NotebookLM Q&A before F2.
- Result: F2 = Thu 26, F3 = Fri 27, and F4 + F6 move to **Mon 30 Nov (W49)**. Sat 28 is an optional buffer, not a planned work day.

---

## 1. Expected sessions

| Day | Chat | Session name | Est. duration | Est. tokens |
|---|---|---|---|---|
| Mon 23 | 1.MAIN | 1.02.MAIN_WeeklyPlan-W48_20261123 (this one; stays open for Vlad + NotebookLM updates) | 30 min | 8k |
| Mon 23 | user | — Vlad email: personalize + send ([template](MCA-DOC-VLAD-EMAIL-TEMPLATE.md)) | 30 min | 0 |
| Tue 24 | user | — NotebookLM: upload 3 CATUC sources + Q1–Q10 ([queries](research/2026-11-19-notebooklm-catuc-queries.md)) | 1–1.5h | 0 |
| Tue 24 | 2.Neufert | 2.02.Neufert_NotebookLM-Ingest_20261124 | 30 min | 8k |
| Wed 25 | 1.MAIN | 1.03.MAIN_Phase2-Readiness_20261125 | 30 min | 6k |
| **Thu 26** | 2.Neufert | **2.03.Neufert_Phase2-F2-Content_20261126** (kickoff) | 3h | 30k |
| Fri 27 | 2.Neufert | 2.04.Neufert_Phase2-F3-Content_20261127 | 4h | 40k (CRITICAL) |
| Fri 27 | 1.MAIN | 1.04.MAIN_Week-Wrap-W48_20261127 (W48 wrap + W49 schedule) | 30 min | 8k |
| Sat 28 | — | Buffer only (F3 overflow or NotebookLM Q11–Q25). Default: rest. | — | 0 |
| Sat 28 → | 7.Partners | Only if Vlad replies: 7.0x.Partners_Vlad-Engagement_{date} | 30 min | 5k |

**Total estimated tokens**: ~135k (≈ 100k Neufert, ≈ 30k MAIN, ≈ 5k Partners). Weekly budget resets Sat 06:00.

**Inactive this week**: 3.Engines, 4.Billing, 5.Drawings. Open them only for incidents.

### Note on the ingest session's chat
NAMING doc §3 lists the ingest as `1.03.MAIN_NotebookLM-Ingest`. But `scripts/catuc-ingest.mjs` writes to `src/knowledge/06-regulations/**`, which WORKFLOW §10 puts in Neufert's write paths, and WORKFLOW §1 gives the NotebookLM workflow to Neufert. **This plan moves the ingest to Chat 2.** That also lets the Neufert sequence run on from the ingest straight into F2 with the Q&A already loaded. MAIN only checks that the answers JSON exists.

---

## 2. Day-by-day detail

### Mon 23 — plan + Vlad outreach
- MAIN: this schedule (done). Stays on standby for two user updates:
  1. **Vlad replied / email sent** → MAIN logs it here (§6) and, if the reply needs follow-up (contract, fee, call), writes `docs/handoffs/MCA-HANDOFF-7-VLAD-ENGAGEMENT-{date}.md` for Chat 7.
  2. **NotebookLM Q1–Q10 done** → MAIN confirms the answers file path and gives the Chat 2 opening prompt (§5).
- User: send Vlad email. Ask him to confirm the **Nov 28 – Dec 3** review window.

### Tue 24 — NotebookLM
- User: NotebookLM steps 1–7 from WEEKEND-PLAN §B. Save answers as JSON (or paste in chat; MAIN converts to JSON).
- Chat 2: `node scripts/catuc-ingest.mjs <qa.json>` → produces `docs/research/2026-11-2x-notebooklm-catuc-answers.md` + populated `catuc-169-2026.new.md`. Commit.
- If NotebookLM output is weak → fallback per §4.

### Wed 25 — readiness gate (MAIN)
- Run the "pre-conditions" block of PHASE2-KICKOFF-CHECKLIST (ops:check, workflows, ingest done, Vlad status).
- Fix the weekday labels in the 4 docs from §0 (one small Edit each).
- Write `docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-25.md`: F2 → F3 order, done criteria, which parts go to DeepSeek (translation / boilerplate only — no CATUC legal reasoning).
- Go / No-Go for Thu: **Go** if ingest is committed. **Slip F2 by 1 day** if not (F3 then moves to Mon 30).

### Thu 26 — Phase 2 kickoff: F2
- `building-permit-process.new.md`: fill the existing skeleton with the NotebookLM answers. Claude writes the legal text; DeepSeek does EN translation.
- Done = file complete, frontmatter sources updated, tests green, committed.

### Fri 27 — F3 (critical legal) + week wrap
- `modular-prefab-regulations.new.md`. Every sentence is checked against the CATUC article text; Vlad reviews it in his window.
- Evening MAIN: W48 wrap + `MCA-DOC-WEEK-2026-W49-SCHEDULE.md` (F4, F6, Vlad review loop, F8 index regen after deploy).

### Sat 28 / Sun 29 — rest
- Vlad review window opens Sat 28 (if confirmed). Review block = F2 + F3 + the already-prepped F1/F5/F7/F9/F10.

---

## 3. Priorities

1. **NotebookLM Q1–Q10 ingested by Wed 25 EOD.** This is the hard gate for F2.
2. **Vlad email sent Mon 23.** Closes B4 sooner; his window starts Sat 28.
3. **F2 then F3** (in that order, F3 is the critical legal one).
4. W49 schedule written on Fri 27 (first real Friday ritual).

---

## 4. Dependencies & risks

| Risk | Trigger | Mitigation |
|---|---|---|
| NotebookLM Q&A not done by Wed 25 | User busy / tool friction | Slip F2 to Fri 27, F3 to Mon 30. No work on F2 without source answers. |
| NotebookLM answers poor quality | Vague or wrong article references | Re-query with exact article numbers; fallback Perplexity (free tier) or Gemini Flash on the PDF. Cross-check every cited article against `catuc-169-2026-articole.json`. |
| Vlad silent by Fri 27 | No reply | Follow-up email Mon 30; backup plan per VLAD-EMAIL-TEMPLATE "If Vlad declines" section. F2/F3 are committed but **not deployed** without his review. |
| Vlad window shifts | He proposes other dates | Fine. Content stays undeployed; W49 adapts. Beta 15 Dec has slack. |
| F3 overruns 4h | Legal complexity | Use the Sat 28 buffer or carry over to Mon 30; never rush F3. |
| Token budget | F3 heavier than estimated | ~135k estimate is within the weekly allowance; MAIN sessions stay short. |

---

## 5. Paste-ready opening prompts

**Tue 24, Chat 2 (after NotebookLM done):**
> Session: 2.02.Neufert_NotebookLM-Ingest_20261124. Read docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md §9 read-first files, then docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Tue. Run scripts/catuc-ingest.mjs on {path to qa.json}, review output vs catuc-169-2026-articole.json, commit.

**Wed 25, Chat 1:**
> Session: 1.03.MAIN_Phase2-Readiness_20261125. Read §9 files + docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Wed. Run the readiness gate, fix weekday labels, write the Phase 2 kickoff handoff for Chat 2.

**Thu 26, Chat 2:**
> Session: 2.03.Neufert_Phase2-F2-Content_20261126. Read §9 files + docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-25.md. Execute F2.

---

## 6. Live log (updated during the week)

| When | Event |
|---|---|
| Mon 23 | W48 schedule written. Waiting on: Vlad email (sent? reply?), NotebookLM Q1–Q10. |

---

## 7. Lessons applied (from W47 / Phase 1)

- Front-loading works: 6/10 CATUC files were pre-prepped before kickoff, so Phase 2 starts at ~50%.
- Check weekday ↔ date when writing schedules (the Wed/Thu 26 slip went through 4 docs unnoticed).
- One session per deliverable; specs on disk; no pasting context between chats.
