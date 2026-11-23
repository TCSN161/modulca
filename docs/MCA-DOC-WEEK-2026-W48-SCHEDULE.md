# Week Plan — W48 (Mon 23 Nov to Sun 29 Nov 2026)

**Written by**: 1.02.MAIN_WeeklyPlan-W48_20261123 (Monday, not Friday — first week of the ritual)
**Phase**: Phase 1 closed (100%). Phase 2 (CATUC content) kicks off **Wed 25 Nov**.
**Inputs**: [[MCA-DOC-STATUS-2026-11-21]] · [[MCA-DOC-WEEKEND-PLAN-2026-11-22]] · [[MCA-DOC-PHASE2-KICKOFF-CHECKLIST]] · [[MCA-SPEC-CATUC-PHASE2-PLAN]]

---

## 0. Date correction (read first)

Earlier docs say "Phase 2 kickoff **Wed 26** Nov". **26 Nov 2026 is a Thursday.** The weekday slip runs through STATUS-2026-11-21 §6, WEEKEND-PLAN, PHASE2-KICKOFF-CHECKLIST and the NAMING doc §4 example (where "Fri 28" is actually Saturday).

**Decision (Costin, 2026-11-23): keep the weekday, move the date → kickoff Wed 25 Nov.**
- Sequence stays as originally intended: Wed F2 → Thu F3 → Fri F4 + F6. Phase 2 content is done before the weekend.
- Vlad's review window (Nov 28 – Dec 3) is unchanged and now gets F2–F6 together.
- Cost: one day less buffer. NotebookLM Q1–Q10 must be ingested by **Tue 24 EOD**.
- Live docs updated to 25 Nov (KICKOFF-CHECKLIST, PHASE2-PLAN, BLOCKERS-ACTIVE). STATUS-2026-11-21 and WEEKEND-PLAN are point-in-time snapshots and stay as written; this doc supersedes their calendars.

---

## 1. Expected sessions

| Day | Chat | Session name | Est. duration | Est. tokens |
|---|---|---|---|---|
| Mon 23 | 1.MAIN | 1.02.MAIN_WeeklyPlan-W48_20261123 (this one; stays open for Vlad + NotebookLM updates) | 30 min | 8k |
| Mon 23 | user | — Vlad email: personalize + send ([template](MCA-DOC-VLAD-EMAIL-TEMPLATE.md)) | 30 min | 0 |
| Tue 24 AM | user | — NotebookLM: upload 3 CATUC sources + Q1–Q10 ([queries](research/2026-11-19-notebooklm-catuc-queries.md)) | 1–1.5h | 0 |
| Tue 24 | 2.Neufert | 2.02.Neufert_NotebookLM-Ingest_20261124 | 30 min | 8k |
| Tue 24 PM | 1.MAIN | 1.03.MAIN_Phase2-Readiness_20261124 (Go/No-Go + kickoff handoff) | 20 min | 6k |
| **Wed 25** | 2.Neufert | **2.03.Neufert_Phase2-F2-Content_20261125** (kickoff) | 3h | 30k |
| Thu 26 | 2.Neufert | 2.04.Neufert_Phase2-F3-Content_20261126 | 4h | 40k (CRITICAL) |
| Fri 27 | 2.Neufert | 2.05.Neufert_Phase2-F4-F6-Content_20261127 | 3h | 25k |
| Fri 27 | 1.MAIN | 1.04.MAIN_Week-Wrap-W48_20261127 (W48 wrap + W49 schedule) | 30 min | 8k |
| Sat 28 | — | Buffer only (overflow from F3/F4/F6). Default: rest. | — | 0 |
| Sat 28 → | 7.Partners | Only if Vlad replies: 7.0x.Partners_Vlad-Engagement_{date} | 30 min | 5k |

**Total estimated tokens**: ~160k (≈ 103k Neufert, ≈ 22k MAIN, ≈ 5k Partners, rest margin). Weekly budget resets Sat 06:00.

**Inactive this week**: 3.Engines, 4.Billing, 5.Drawings. Open them only for incidents.

### Note on the ingest session's chat
NAMING doc §3 lists the ingest as `1.03.MAIN_NotebookLM-Ingest`. But `scripts/catuc-ingest.mjs` writes to `src/knowledge/06-regulations/**`, which WORKFLOW §10 puts in Neufert's write paths, and WORKFLOW §1 gives the NotebookLM workflow to Neufert. **This plan moves the ingest to Chat 2.** MAIN only checks that the answers JSON exists and runs the Go/No-Go.

---

## 2. Day-by-day detail

### Mon 23 — plan + Vlad outreach
- MAIN: this schedule (done). Stays on standby for two user updates:
  1. **Vlad replied / email sent** → MAIN logs it here (§6) and, if the reply needs follow-up (contract, fee, call), writes `docs/handoffs/MCA-HANDOFF-7-VLAD-ENGAGEMENT-{date}.md` for Chat 7.
  2. **NotebookLM Q1–Q10 done** → MAIN confirms the answers file path and gives the Chat 2 opening prompt (§5).
- User: send Vlad email. Ask him to confirm the **Nov 28 – Dec 3** review window.

### Tue 24 — NotebookLM + readiness gate
- User (morning, if possible): NotebookLM steps 1–7 from WEEKEND-PLAN §B. Save answers as JSON (or paste in chat; MAIN converts to JSON).
- Chat 2: `node scripts/catuc-ingest.mjs <qa.json>` → produces `docs/research/2026-11-24-notebooklm-catuc-answers.md` + populated `catuc-169-2026.new.md`. Commit.
- MAIN (evening): run the "pre-conditions" block of PHASE2-KICKOFF-CHECKLIST (ops:check, workflows, ingest committed, Vlad status). Write `docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md`: F2 → F3 → F4/F6 order, done criteria, which parts go to DeepSeek (translation / boilerplate only — no CATUC legal reasoning).
- **Go** if ingest is committed. **No-Go** → F2 slips to Thu 26, F3 to Fri 27, F4 + F6 to Mon 30.

### Wed 25 — Phase 2 kickoff: F2
- `building-permit-process.new.md`: fill the existing skeleton with the NotebookLM answers. Claude writes the legal text; DeepSeek does EN translation.
- Done = file complete, frontmatter sources updated, tests green, committed.

### Thu 26 — F3 (critical legal)
- `modular-prefab-regulations.new.md`. Every sentence is checked against the CATUC article text; Vlad reviews it in his window.

### Fri 27 — F4 + F6 + week wrap
- F4 `urban-planning-pug-puz` (PUG/PUZ remap) + F6 `building-permit-romania.md` body rewrite.
- Evening MAIN: W48 wrap + `MCA-DOC-WEEK-2026-W49-SCHEDULE.md` (Vlad review loop, fixes from review, F8 index regen after deploy, Phase 2 deploy).

### Sat 28 / Sun 29 — rest
- Vlad review window opens Sat 28 (if confirmed). Review block = F2 + F3 + F4 + F6 + the already-prepped F1/F5/F7/F9/F10.

---

## 3. Priorities

1. **NotebookLM Q1–Q10 ingested by Tue 24 EOD.** Hard gate for F2.
2. **Vlad email sent Mon 23.** Closes B4 sooner; his window starts Sat 28.
3. **F2 → F3 → F4/F6** in that order (F3 is the critical legal one).
4. W49 schedule written on Fri 27 (first real Friday ritual).

---

## 4. Dependencies & risks

| Risk | Trigger | Mitigation |
|---|---|---|
| NotebookLM Q&A not done by Tue 24 | User busy / tool friction | No-Go at Tue gate: F2 Thu 26, F3 Fri 27, F4+F6 Mon 30. No work on F2 without source answers. |
| NotebookLM answers poor quality | Vague or wrong article references | Re-query with exact article numbers; fallback Perplexity (free tier) or Gemini Flash on the PDF. Cross-check every cited article against `catuc-169-2026-articole.json`. |
| Vlad silent by Fri 27 | No reply | Follow-up email Mon 30; backup plan per VLAD-EMAIL-TEMPLATE "If Vlad declines" section. Content is committed but **not deployed** without his review. |
| Vlad window shifts | He proposes other dates | Fine. Content stays undeployed; W49 adapts. Beta 15 Dec has slack. |
| F3 overruns 4h | Legal complexity | Push F4/F6 to Sat 28 buffer or Mon 30; never rush F3. |
| Token budget | F3 heavier than estimated | ~160k is within the weekly allowance; MAIN sessions stay short. |

---

## 5. Paste-ready opening prompts

**Tue 24, Chat 2 (after NotebookLM done):**
> Session: 2.02.Neufert_NotebookLM-Ingest_20261124. Read docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md §9 read-first files, then docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Tue. Run scripts/catuc-ingest.mjs on {path to qa.json}, review output vs catuc-169-2026-articole.json, commit.

**Tue 24 evening, Chat 1:**
> Session: 1.03.MAIN_Phase2-Readiness_20261124. Read §9 files + docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Tue. Run the readiness gate and write the Phase 2 kickoff handoff for Chat 2.

**Wed 25, Chat 2:**
> Session: 2.03.Neufert_Phase2-F2-Content_20261125. Read §9 files + docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md. Execute F2.

---

## 6. Live log (updated during the week)

| When | Event |
|---|---|
| Mon 23 | W48 schedule written. Kickoff moved to Wed 25 (Costin). Waiting on: Vlad email (sent? reply?), NotebookLM Q1–Q10. |

---

## 7. Lessons applied (from W47 / Phase 1)

- Front-loading works: 6/10 CATUC files were pre-prepped before kickoff, so Phase 2 starts at ~50%.
- Check weekday ↔ date when writing schedules (the Wed/Thu 26 slip went through 4 docs unnoticed).
- One session per deliverable; specs on disk; no pasting context between chats.
