# MCA-HANDOFF-1-MAIN-2026-11-22-workflow

**From**: Chat 3 (AI Engines & Rendering)
**To**: Chat 1 MAIN
**Date**: 2026-11-22
**Status**: 1 primary item + 2 side notes
**Priority**: Medium — do on next MAIN session, no rush

---

## 1. Primary item — adopt the new workflow doc

Costin asked in Chat 3 how to optimize token usage across all 5 ModulCA chats. The answer is cross-cutting (affects all chats, not just rendering), so it was codified as a canonical workflow doc owned by nobody and read by all:

**Read**: `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`

Please do on your next session start. Covers:
- Chat scope definitions (who owns what)
- Session-ending signals (when to start fresh — saves 40-60% tokens per topic)
- Daily rhythm (2 touchpoints in MAIN: morning plan + end-of-day wrap)
- Token discipline rules (English-first, Edit over Write, grep over full reads, handoff protocol)
- What NOT to do (no 6th "meta" chat, no pasting content between chats)

Nothing to change in that doc from your side — just read, acknowledge, and start applying.

### After reading, one action in MAIN

Update your memory reference so new MAIN sessions auto-find it:
- If MAIN's scope note in memory (`project_modulca_2_0.md` or equivalent) does NOT yet list `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` as required reading on session startup, add a one-line link.
- This way Chat 2 / 3 / 4 / 5 all pick up the workflow via the same chain.

---

## 2. Side notes for your awareness

### 2.1 Meta discussions move to MAIN
Costin's own words: he'll move general/meta/optimization discussions to MAIN from now on. Expect topics like:
- Language conventions (English-first switch happened today — memory already updated)
- Token optimization
- Chat routing / workflow questions
- Blocker triage across chats

Chat 3 will route anything inbound that's clearly rendering-only, redirect everything else to you.

### 2.2 Chat 3 inbox is empty — no other pending items
All Chat 3 work from the last two days shipped:
- `MCA-P1-T19` (NeufertAI → Sonnet 5.5) deployed to prod
- Critical Groq model fix (was silently 404-ing on fallback) deployed
- 2 cron GH Actions live (billing audit Mon 08:00 UTC, model-health check Sun 07:00 UTC)
- 19 engines inventoried + pricing bands mapped
- Walkthrough video spec written (Three.js + MediaRecorder = free, no AI needed)
- 3 handoff docs from 2026-11-19 (MAIN, NeufertAI, Prices/Accounts) — status check below
- LTX Video scaffold ready for Phase 3 wire-up
- U6 Nano Banana 2.1 upgrade shipped
- English-first convention adopted + memory updated

### 2.3 Status check on earlier handoffs
Prior handoffs from 2026-11-19 are still sitting at:
- `docs/handoffs/MCA-HANDOFF-1-MAIN-2026-11-19.md` (ITEM-1 blockers top-3 review, ITEM-2 GH Secrets config) — awaiting MAIN action
- `docs/handoffs/MCA-HANDOFF-2-NEUFERTAI-2026-11-19.md` (U2 gpt-5.1-mini, CATUC translate stub) — awaiting Chat 2 action
- `docs/handoffs/MCA-HANDOFF-4-PRICES-ACCOUNTS-2026-11-19.md` (U9 credit manager bands CRITICAL pre-Beta) — awaiting Chat 4 action

If you want Chat 3 to nudge/follow-up on any of these, drop a reverse handoff in `docs/handoffs/MCA-HANDOFF-3-ENGINES-*.md` and I'll catch it on next session.

---

## 3. Response expected

Minimal. One-line git commit in your scope referencing this handoff is enough acknowledgment — I can grep `git log` for it.

If you add a reverse handoff for anything in §2.3, Chat 3 will pick it up next session.

---

## 4. One-sentence user prompt to drop into Chat 1 MAIN

Costin can start the MAIN session with this exact prompt:

> Read `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` (new cross-chat workflow doc) and `docs/handoffs/MCA-HANDOFF-1-MAIN-2026-11-22-workflow.md` (my briefing), then do whatever actions they require and acknowledge in a commit.

That's it. No extra context pasting needed.
