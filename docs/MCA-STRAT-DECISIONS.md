# MCA-STRAT-DECISIONS

**Status**: Append-only log of strategic decisions affecting >1 chat or >1 week  
**Format**: Newest-first, one line per decision, no prose  
**Rule**: Prose explanations live in the committing doc, not here  
**Related**: [[MCA-DOC-CHAT-WORKFLOW-2026-11-22]] §11.1

---

| Date | Decision | Driver | Supersedes |
|---|---|---|---|
| 2026-11-23 | Vlad pre-beta review: max €150 cash (founding-partner deal, mostly deferred + in-kind), scope narrowed to F2, F3, notification PDFs; no retainer before revenue | €50/mo cap, pre-revenue | Template €300–500/mo retainer |
| 2026-11-23 | Phase 3 owners: Neufert = /catuc-check + Profile Engine + Privacy/ToS text; Drawings = PermitTracker PDFs; Billing = beta badge + feedback widget | Phase 3 spec had no chat owners | — |
| 2026-11-23 | Phase 2 kickoff Wed 25 Nov (F2 Wed, F3 Thu, F4+F6 Fri); NotebookLM ingest runs in Chat 2 | 26 Nov is a Thursday; keep weekday sequence; ingest writes Neufert paths | "Wed 26 Nov" kickoff |
| 2026-11-22 | Captain layer retired, Chat 1 MAIN owns orchestration; 7-chat flat structure (Chat 6 reserved) | Workflow simplification — April 3-Layer Captain overengineered for our scale | April 3-Layer Captain Architecture |
| 2026-11-22 | English-first for substantive technical content + docs + commits (RO allowed for legal verbatim or conversational chat) | Token optimization + cross-chat consistency | — |
| 2026-11-22 | Session naming format `{N}.{seq}.{Label}_{topic}_{YYYYMMDD}`, one session per shippable deliverable not per phase | Clear audit trail + context freshness per topic | ad-hoc chat names |
| 2026-11-22 | Weekly schedule ritual Friday evening; monthly retrospective last Sunday; phase-end retros in MCA-LOG | Antifragility — lessons compound | — |
| 2026-11-21 | Phase 2 (CATUC content) framework 70% front-loaded before Mon 26 kickoff via 10/10 CATUC file skeletons + ingest script | Save Phase 2 execution time | original plan: start from scratch Nov 26 |
| 2026-11-20 | 4 critical keys rotated (Anthropic, Supabase anon+service_role, OpenAI); Supabase migrated to new sb_ key system + legacy JWT disabled | Screenshots exposed values during setup session | — |
| 2026-11-20 | CI pipeline fix: decouple `output: export` from `GITHUB_ACTIONS` env var — use explicit `DEPLOY_TARGET=github-pages` flag | CI had been silently broken for 7 months | — |
| 2026-11-19 | Launch target: Feb 1 2027 public, Dec 15 2026 invite-only beta | Rebaseline after 7-month pause + CATUC law change (25.08.2026) | April target: May 1 2026 |
| 2026-11-19 | Budget cap €50/month total ops cost (hard limit for Phase 1-3) | Pre-revenue reality | — |
| 2026-11-19 | Arh. Vlad Ioniță confirmed as signatory architect (not public yet, formal engagement pending) | Required for CATUC content deploy + DTAC signing | — |
| 2026-11-19 | Multi-AI delegation: Claude = orchestrator + strategic; DeepSeek/Gemini/Groq = bulk execution; NotebookLM = long doc synthesis; ChatGPT = second opinion | Claude Pro token limits + cost optimization | single-provider strategy |
| 2026-11-19 | MCA-* artifact naming convention (MCA-DOC-, MCA-STRAT-, MCA-SPEC-, MCA-LOG-) | Grep-ability + semantic organization | mixed ad-hoc naming |

---

## How to append a decision

1. Prepend one row to the table (newest-first)
2. Keep prose in the committing doc; this log is a pointer only
3. "Supersedes" column: reference prior decision this replaces, or `—` if novel
4. Commit with message `chore(decisions): log {date} — {one-line decision}`

Keep the log under 100 rows. When it hits 100, archive oldest 50 to `docs/MCA-STRAT-DECISIONS-ARCHIVE-{year}.md`.
