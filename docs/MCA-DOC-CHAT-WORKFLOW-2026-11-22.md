# MCA-DOC-CHAT-WORKFLOW-2026-11-22

**Status**: Canonical workflow rules — all ModulCA chats align to this (currently 6, extensible per §1 of MCA-DOC-CHAT-NAMING-2026-11-22)
**Owner**: Costin Muraru
**Applies to**: Chat 1 MAIN, Chat 2 Neufert, Chat 3 Engines, Chat 4 Billing, Chat 5 Drawings, Chat 7 Partners (Chat 6 reserved)
**Rule**: Any chat opening a new session reads this file before starting work. Memory files point here.

---

## 1. Scope per chat — which chat handles what

| Chat | Owns | Does NOT own |
|---|---|---|
| **1. MAIN** | Orchestration, meta-decisions, cross-cutting concerns, blocker triage, cross-chat coordination, daily planning, workflow optimization, language conventions, workspace decisions | Writing engine code, legal consultant logic, pricing models, technical drawings |
| **2. Neufert** | Consultant chain (`src/app/api/consultant/`), prompt engineering, legal text (CATUC 169/2026, Codul Fiscal), NotebookLM workflow, RAG depth per tier | Engine-level config, pricing enforcement, renders |
| **3. Engines** | Render pipeline, image engines (19 of them), video engines (LTX scaffold, Wan OSS), visual output, presentation slide engine, model-freshness audits, Three.js walkthrough recording | Consultant text logic, billing enforcement, construction docs |
| **4. Billing** | Subscription tiers (`src/features/auth/types.ts`), credit manager (`src/app/api/ai-render/engines/creditManager.ts`), Stripe test→live, API key signup workflow, bank/CUI/billing, pricing bands mapping | Engine code, consultant logic, drawings |
| **5. Drawings** | Construction documentation (DWG/PDF export), CAD standards, dimension conventions, engineering drawings output | Rendered imagery (that's Chat 3), legal text (Chat 2) |
| **6.** _reserved_ | TBD when needed (likely Marketing, Analytics, Ops, or Legal) | — |
| **7. Partners** | Collaborator + partner relationships: Vlad engagement docs, engineers/module producers coordination, DPA vendor outreach, startup program applications, press/journalist contacts, strategic partner conversations | Code, legal text content, pricing logic |

**Rule**: If a message starts in the wrong chat, the receiving chat redirects with one line: *"This belongs in Chat [N] — ask there: [1-sentence prompt]"*. No multi-paragraph explanation, no duplicated work.

---

## 2. Session-ending signals — when to start a fresh session in the same chat

Fresh session = same chat number, new conversation. All specs/docs persist on disk; new session reads them from the filesystem, not from conversation history. Saves 40-60% tokens per topic.

| Signal | Action |
|---|---|
| 🟢 Feature shipped + committed + pushed | End session now. Next topic starts in fresh session. |
| 🟢 Topic complete (e.g., finished render engine audit) | End session. Specs live in docs/. |
| 🟢 24h of no activity in a chat | Old context irrelevant. Start fresh. |
| 🟢 Switching from "audit X" to "implement Y" | New session — refresh context. |
| 🟡 Chat passes ~30 back-and-forth turns on one topic | Consider `/compact` or new session. |
| 🟡 Context feels bloated / replies slower | Run `/compact`. |
| 🔴 Mid-task, need to check something | Stay in session. Don't fragment. |
| 🔴 Awaiting a cron / background task result | Stay in session. |

**End-of-task signal from the chat**: when a chat finishes a major task, it emits one line:

> ✅ Task X shipped. **End this session** — next topic (Y) starts in Chat [N] fresh session.

---

## 3. Daily rhythm — Chat 1 MAIN only, 2 messages/day

Avoid micromanagement. Two touchpoints keep the day organized without spamming chats.

**Morning**, Chat 1 MAIN:
> "What's the plan for today? Which chats should be active?"

MAIN responds with 3-5 tasks mapped to specific chats + priorities.

**End of day**, Chat 1 MAIN:
> "Day wrap?"

MAIN responds with: what shipped, what's in flight, what's blocked, estimated token spend.

Any other time: just start working in the chat whose scope matches. No permission needed, no routing questions.

---

## 4. Token discipline rules (all chats)

| Rule | Why | Savings |
|---|---|---|
| **English-first** (Romanian only for legal text verbatim or business-nuance terms) | ~30% fewer tokens, consistent docs/commits | 25-30% |
| **New session per topic** (not per day — per TOPIC) | Avoid context bloat | 40-60% |
| **Edit over Write** for existing files | Smaller diff vs full file re-write | 10-20% |
| **grep / head / tail over full file reads** | Only read what's needed | 5-15% |
| **Handoff docs for cross-chat work** (never paste content between chats) | One source of truth, no duplicated context | 20-30% |
| **No re-reading files already seen in session** | Harness tracks reads | 5-10% |
| **Short tool outputs when verifying** (`| head -5`, `| tail -3`, not full dumps) | Only keep in context what's needed | 5-10% |

**Combined realistic savings vs undisciplined session**: ~60-70%.

---

## 5. Cross-chat communication protocol

### Writing a handoff
When Chat A needs Chat B to do something:
1. Chat A writes `docs/handoffs/MCA-HANDOFF-{B}-{topic}-{YYYY-MM-DD}.md` with clear items + priority + ETA expectation
2. Chat A gives user a 1-sentence prompt to drop into Chat B: *"Read docs/handoffs/MCA-HANDOFF-{B}-{topic}-{date}.md and execute ITEM-1."*
3. Chat A does NOT paste the handoff content — Chat B reads from disk

### Reading a handoff
Chat B on new session:
1. Checks `docs/handoffs/MCA-HANDOFF-{self}-*.md` for pending work
2. Reads them, executes, writes a response handoff if anything bounces back
3. Chat B does NOT re-ask Chat A for context — the handoff is the contract

### Naming convention
`MCA-HANDOFF-{to-chat-number}-{topic-slug}-{YYYY-MM-DD}.md`

Examples:
- `MCA-HANDOFF-1-MAIN-2026-11-19.md` (general status for MAIN)
- `MCA-HANDOFF-4-PRICES-ACCOUNTS-2026-11-19.md` (billing items for Chat 4)

---

## 6. When to write a strategy or spec doc vs just reply inline

| Scenario | What to do |
|---|---|
| Multi-step feature implementation | Write `MCA-SPEC-{topic}.md`, link in reply |
| Strategic decision affecting >1 chat | Write `MCA-STRAT-{topic}-{date}.md`, link in reply |
| State snapshot / audit result | Write `MCA-DOC-{topic}-{date}.md`, link in reply |
| Session log (optional) | Write `MCA-LOG-{date}-session.md` at end of day |
| Simple answer or confirmation | Reply inline, don't create a doc |

Rule: a doc is cheaper than re-answering the same question 3 sessions later.

---

## 7. What NOT to do

- ❌ Don't create a 6th chat for "optimization" or "meta" — Chat 1 MAIN handles it
- ❌ Don't ask "where should this go" — if you're not sure, drop in Chat 1 MAIN and it will route
- ❌ Don't paste multi-paragraph context between chats — write a handoff doc instead
- ❌ Don't reply in Romanian for substantive technical content (English-first per user profile)
- ❌ Don't re-read files already in session context (ask yourself: "did I see this this session?")
- ❌ Don't `TaskCreate` for one-off replies — only for multi-step work within a session

---

## 8. First-run setup (one-time user action)

Once you want the workflow live:

1. Confirm Chat 1 MAIN has read this doc (ask MAIN: *"Read `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` and acknowledge"*)
2. Each of Chat 2, 3, 4, 5 does the same on their next session start (one-line prompt: *"Read `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` before starting work"*)
3. After that, all chats auto-align from memory file reference

Memory file `user_costin.md` already points chats to `project_modulca_2_0.md`, which should reference this workflow doc for new sessions to find it. Update once in Chat 1 MAIN after acknowledgment.

---

## 9. Changelog

| Date | Change | Driver |
|---|---|---|
| 2026-11-22 | Initial doc created in Chat 3 to codify multi-chat workflow | Costin asked how to optimize token usage across all 5 chats; English-first switch same day |
