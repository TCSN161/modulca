# MCA-DOC-CHAT-NAMING-2026-11-22

**Status**: Canonical naming rules for all ModulCA chat sessions  
**Owner**: Costin Muraru  
**Applies to**: Chat 1 MAIN, Chat 2 Neufert, Chat 3 Engines, Chat 4 Billing, Chat 5 Drawings  
**Related**: [[MCA-DOC-CHAT-WORKFLOW-2026-11-22]] (scope + workflow rules)

---

## 1. Canonical chat labels

Use single-word English short names. No RO/EN mixing, no spaces, no slashes.

| # | Canonical name | Scope (per workflow doc §1) | Previous labels (deprecated) |
|---|---|---|---|
| 1 | **MAIN** | Orchestration, meta, cross-cutting | — |
| 2 | **Neufert** | NeufertAI consultant, legal text, RAG | "NeufertAI" (too long for session name prefix) |
| 3 | **Engines** | AI engines + rendering + video + visuals | "AI Engines & Rendering", "render_ai", "render_AI" |
| 4 | **Billing** | Pricing, subscriptions, credit manager, Stripe, bank, CUI, API-key signup | "Prices/Accounts", "Preturi, conturi", "Preturi conturi" |
| 5 | **Drawings** | Technical drawings, DWG/PDF export, CAD standards | "Technical Drawings", "desen tehnic" |

**Rule**: Use the canonical name in session titles, commits, handoff filenames, and docs. Old names are deprecated.

---

## 2. Session naming format

```
{ChatN}.{seq}.{Label}_{topic}_{YYYYMMDD}
```

- `ChatN` = 1 through 5
- `seq` = 2-digit sequence within that chat (01, 02, 03...)
- `Label` = canonical name from §1 (MAIN, Neufert, Engines, Billing, Drawings)
- `topic` = CamelCase or kebab-case, max ~20 chars, describes the shippable deliverable
- `YYYYMMDD` = start date (no dashes, sorts chronologically)

### Good examples

```
1.01.MAIN_Phase1-Reboot_20261119
1.02.MAIN_WeeklyPlan_20261123
1.04.MAIN_Phase2-Kickoff_20261126
2.02.Neufert_Phase2-F2-Content_20261126
2.03.Neufert_Phase2-F3-Content_20261127
3.05.Engines_LTX-Phase3-WireUp_20261207
4.03.Billing_Stripe-Live-Prep_20270118
5.02.Drawings_DWG-Export-v0_20270105
```

### Bad examples

```
1.02.MAIN_Phase 2 - Week 2 - CATUC content fill_22.11.2026   ← spaces, dots in date
2.02.NeufertAI_Phase2_F2_2026-11-26                           ← label too long, dashes in date
render_ai_11.22                                               ← no chat number, old label, no topic
```

---

## 3. Granularity rule

**One session per shippable deliverable, NOT per phase.**

Phase 2 (10 days) is NOT one session — it's 5-7 sessions:
```
1.03.MAIN_NotebookLM-Ingest_20261124
2.02.Neufert_Phase2-F2-Content_20261126
2.03.Neufert_Phase2-F3-Content_20261127
2.04.Neufert_Phase2-F4-Content_20261128
1.05.MAIN_Phase2-Vlad-Integration_20261201
1.06.MAIN_Phase2-Deploy_20261205
```

Each session ends when:
- Committed + pushed, OR
- Topic complete, OR
- Switching to different kind of work

See workflow doc §2 for end-of-session signals.

---

## 4. Weekly schedule ritual (Friday evening)

**Every Friday**, Chat 1 MAIN writes a session schedule for the upcoming week.

### Output format

File: `docs/MCA-DOC-WEEK-{YYYY-Www}-SCHEDULE.md`

Content:

```markdown
# Week Plan — W{nn} ({start date} to {end date})

## Expected sessions

| Day | Chat | Session name | Est. duration | Est. tokens |
|---|---|---|---|---|
| Mon 23 | 1.MAIN | 1.02.MAIN_WeeklyPlan_20261123 | 20 min | 5k |
| Mon 23 | user | — Vlad email send | 30 min | 0 |
| Tue 24 | user | — NotebookLM Q1-Q10 | 1h | 0 |
| Tue 24 | 1.MAIN | 1.03.MAIN_NotebookLM-Ingest_20261124 | 20 min | 5k |
| Wed 26 | 2.Neufert | 2.02.Neufert_Phase2-F2-Content_20261126 | 3h | 30k |
| Thu 27 | 2.Neufert | 2.03.Neufert_Phase2-F3-Content_20261127 | 4h | 40k (CRITICAL) |
| Fri 28 | 2.Neufert | 2.04.Neufert_Phase2-F4-Content_20261128 | 3h | 25k |
| Fri 28 | 1.MAIN | 1.04.MAIN_Week-Wrap-W48_20261128 | 15 min | 3k |

**Total estimated tokens**: ~108k across the week.

## Priorities
1. Phase 2 content (F2 → F3 → F4 order)
2. Vlad review loop (start Nov 28)

## Dependencies
- NotebookLM Q&A must land before F2 content work
- Vlad availability window (Nov 28 - Dec 3)

## Risks
- Vlad slow to reply → activate backup template from MCA-DOC-VLAD-EMAIL-TEMPLATE.md §Notes
- NotebookLM quality poor → fallback Perplexity

## Lessons applied from W{nn-1}
- (3 bullets from prior Friday wrap)
```

---

## 5. Delete old chats?

**NO. Keep all chats, no delete, ever.**

Reasons:
- Audit trail (decisions, context)
- Searchable later
- Zero cost to keep
- True memory lives in git + memory files + docs on disk — chat history is secondary

If UI gets crowded, archive/collapse old chats. Don't delete.

---

## 6. Renaming existing chats

Current chat (this one — Phase 1 reboot work since Nov 19):
```
Rename to: 1.01.MAIN_Phase1-Reboot_20261119
```

For other chats (Chat 2-5), when you open each next time, first message should rename to canonical format. Example for Chat 3 (currently "3.renderi AI"):
```
Rename to: 3.01.Engines_Nov2026-Audit_20261119
```

Then all future sessions in each chat continue the sequence (3.02, 3.03, ...).

---

## 7. Signal-end-of-session format (reminder from workflow doc)

When a session ends, MAIN (or any chat) outputs:

```
✅ Session complete. Topic: {topic}. Commit: {sha}.
End this session. Next topic → Chat {N}, open fresh session named:
{N}.{next_seq}.{Label}_{next_topic}_{YYYYMMDD}

Opening prompt for new session:
{paste-ready prompt, under 100 words}
```

You copy + paste. 10 seconds, new session starts clean.

---

## 8. Changelog

| Date | Change |
|---|---|
| 2026-11-22 | Initial doc — canonical names for 5 chats, session naming format, weekly schedule ritual, no-delete rule |
