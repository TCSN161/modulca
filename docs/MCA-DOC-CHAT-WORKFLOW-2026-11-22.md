# MCA-DOC-CHAT-WORKFLOW-2026-11-22

**Status**: Canonical workflow rules — all ModulCA chats align to this (currently 6, extensible per §1 of MCA-DOC-CHAT-NAMING-2026-11-22)
**Owner**: Costin Muraru
**Applies to**: Chat 1 MAIN, Chat 2 Neufert, Chat 3 Engines, Chat 4 Billing, Chat 5 Drawings, Chat 6 Marketing, Chat 7 Partners
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
| **6. Marketing** | Communication + content strategy: brand voice, YouTube/Shorts/social, NotebookLM Studio outputs (video, audio, infographics, quizzes), lead magnets, content calendar, positioning + monetization of the CATUC permit service, press kit content (with Chat 7 for outreach) | Code, legal text content (Chat 2 writes, Marketing reuses verified facts), pricing enforcement (Chat 4) |
| **7. Partners** | Collaborator + partner relationships: Vlad engagement docs, engineers/module producers coordination, DPA vendor outreach, startup program applications, press/journalist contacts, strategic partner conversations | Code, legal text content, pricing logic |
| **8. Express** | Automated "Express" wizard: questions/prompt → ExpressBrief (Claude structured output) → fills the 14 steps via public module interfaces → N renders → presentation/PDF. Also owns golden-brief automated E2E tests | Editing other modules (asks the owner chat for missing interfaces), engine code, pricing enforcement, legal text |
| **9. Radar** | AI/tools news intake: Costin pastes links (YouTube, posts, docs); Radar summarizes, classifies and updates the AI radar; sends MAIN a weekly "worth doing" list on Fridays; runs the monthly AI upgrade-day sweep | Code, decisions for other chats (it proposes, MAIN routes) |

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

## 9. Read-first ritual (every new session, ~5 min)

Any new chat session starts by reading 3 files from disk, in order:

1. `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` (this file — rules)
2. `docs/MCA-DOC-CHAT-NAMING-2026-11-22.md` (session naming format)
3. Latest status snapshot — find it via `ls docs/MCA-DOC-STATUS-*.md | tail -1`

Plus, if entering a Phase currently in progress, read that phase's spec:
- Phase 2 → `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md`
- Phase 3 → `docs/MCA-SPEC-CATUC-PHASE3-PLATFORM.md`
- Phase 4+ → equivalent

Open blockers always at `docs/MCA-DOC-BLOCKERS-ACTIVE-{latest-date}.md`.

Everything else is in memory file (`project_modulca_2_0.md`) which Claude auto-loads.

**Why 5 min, not 15**: Captain's original ritual was 15 min across 8 files because the old 3-Layer architecture had more handoff surface. Our flat 7-chat + memory file structure needs less.

---

## 10. Write boundaries per chat

Each chat writes only within its ownership paths. Prevents accidental cross-chat edits.

| Chat | ALLOWED write paths | FORBIDDEN (don't touch) |
|---|---|---|
| **1. MAIN** | `docs/**` (all MCA-* docs, handoffs, research, sessions), memory files, `.github/workflows/**`, `.claude/**`, root config files (next.config, tsconfig, package.json — with user approval) | `src/app/api/consultant/**`, `src/app/api/ai-render/**`, `src/features/auth/types.ts` (those belong to specialists) |
| **2. Neufert** | `src/app/api/consultant/**`, `src/app/api/catuc-translate/**`, `src/knowledge/**`, `src/features/blog/**`, `src/features/catuc/**` + `src/app/(app)/catuc-check/**` + `src/app/api/catuc-check/**` (Phase 3 checker + Profile Engine), `src/app/(app)/privacy/**` + `src/app/(app)/terms/**` (legal pages text), `docs/research/*catuc*`, `docs/MCA-SPEC-CATUC-*` | `src/app/api/ai-render/**`, `creditManager.ts`, drawings, Stripe, auth flow |
| **3. Engines** | `src/app/api/ai-render/**`, `src/features/*/components/*Three*`, `scripts/engines-*.mjs`, `docs/MCA-DOC-AI-ENGINES-*`, engine billing data | Consultant logic, legal text, pricing enforcement |
| **4. Billing** | `src/features/auth/types.ts`, `src/app/api/ai-render/engines/creditManager.ts`, `src/app/api/stripe/**`, `src/features/beta/**` + `src/app/api/feedback/**` (beta badge + feedback widget), `scripts/stripe-*.mjs`, `docs/STRIPE_*`, `docs/MCA-DOC-PRICING-*` | Engine code, consultant logic, drawings |
| **5. Drawings** | `src/features/drawings/**` (future), `src/app/api/drawings/**` (future), `src/features/permits/**` + `src/app/api/permits/**` (Phase 3 PermitTracker PDFs), `docs/MCA-SPEC-PERMITTRACKER-*`, CAD export scripts | Render imagery, legal text |
| **6. Marketing** | `docs/MCA-STRAT-CATUC-SERVICE-*`, `docs/MCA-DOC-MARKETING-*`, `docs/MCA-DOC-CONTENT-*`, `docs/content/**`, `docs/brand/**` | Code anywhere, legal text, pricing logic |
| **7. Partners** | `docs/MCA-DOC-VLAD-*`, `docs/MCA-DOC-PARTNERS-*`, DPA templates, startup app docs, press kit docs, email outreach drafts | Code anywhere, pricing logic |
| **8. Express** | `src/features/express/**`, `src/app/api/express/**`, `src/app/(app)/express/**`, `tests/e2e/express*`, `docs/MCA-SPEC-EXPRESS-*` | Other features' internals, engines, creditManager, legal text |
| **9. Radar** | `docs/MCA-DOC-AI-RADAR.md`, `docs/radar/**` | Code anywhere, other chats' docs |

**Shared infrastructure** (everyone can touch, with explicit intention):
- `.gitignore`, `README.md`, `supabase/migrations/**` (coordinate via handoff first — never two chats editing migrations)
- Test files (`*.test.ts`) — chat that owns the feature owns its tests

**Enforcement**: honor-system. If a chat accidentally writes outside its boundary, next session calls it out in commit review + revert if needed. Repeated violations = tighten rule.

---

## 11. Captain's inheritance — patterns we lift (Captain itself retired)

Captain layer is deprecated. Its orchestration role is Chat 1 MAIN's job now. But 4 patterns from Captain are worth keeping and are codified elsewhere in this doc:

| Pattern | Where in this doc |
|---|---|
| **File-based communication** (no side channels, no pasted context between chats) | §5 Handoff protocol |
| **Fresh is strength** (new session from memory+docs = more coherent than long session) | §2 Session-ending signals |
| **Scope boundaries** (each chat owns one domain, nothing crosses) | §1 Scope per chat, §10 Write boundaries |
| **Decision log** (strategic decisions recorded somewhere searchable) | §11.1 below |

### 11.1 Decision log

Strategic decisions that affect >1 chat or >1 week get logged in:

`docs/MCA-STRAT-DECISIONS.md` — append-only, one line per decision, newest-first.

Format:
```
| Date | Decision | Driver | Supersedes |
|---|---|---|---|
| 2026-11-22 | Captain layer retired, Chat 1 MAIN owns orchestration | Workflow simplification | April 3-Layer Captain Architecture |
| 2026-11-22 | English-first for substantive technical content | Token optimization + consistency | — |
| 2026-11-20 | 4 critical keys rotated (Anthropic, Supabase x2, OpenAI) | Screenshots exposed values | — |
| 2026-11-19 | Launch target: Feb 1 2027 public, Dec 15 2026 invite-only | Rebaseline after 7mo pause + CATUC law change | April May 1 target |
```

New decision → one line → commit. No prose explanations in the log — those live in the committing doc.

### 11.2 Kill-switch patterns (from Captain §7)

Graceful abort conditions, by chat:
- **Any chat accidentally touches forbidden path** → stop, revert, note in next commit
- **Session feels stuck >15 min on same sub-step** → close session, start fresh with the context doc updated
- **Prod incident mid-work** → all chats pause except whichever owns the incident (usually MAIN or Engines) → resolve first, then resume
- **User unavailable + a decision gates progress** → commit a draft marked `DRAFT: awaiting user decision on X` → close session → resume when user replies

---

## 12. Ritual calendar

| Rhythm | Owner | Output | Effort |
|---|---|---|---|
| **Daily morning** | Chat 1 MAIN | 3-5 tasks mapped to chats, effort levels, token estimates | Opus Medium, 5 min |
| **Daily evening** (optional) | Chat 1 MAIN | Day wrap: shipped / in flight / blocked, 3 lines | Opus Low, 2 min |
| **Friday evening** | Chat 1 MAIN | `docs/MCA-DOC-WEEK-{YYYY-Www}-SCHEDULE.md` for next week + wrap-up of current week | Opus High, 15-30 min |
| **Last Sunday of month** | Chat 1 MAIN | `docs/MCA-LOG-MONTH-{YYYY-MM}-retrospective.md` — phase progress, lessons, decisions to revisit, budget check | Opus High, 30-45 min |
| **End of each Phase** | Chat that owns the Phase | Phase retrospective embedded in MCA-LOG at phase close | Opus High, 20-30 min |

Antifragility compounds: each retro's lessons update this workflow doc. Over time, the system gets cheaper + smarter.

---

## 13. Changelog

| Date | Change | Driver |
|---|---|---|
| 2026-11-22 | Initial doc created in Chat 3 to codify multi-chat workflow | Costin asked how to optimize token usage across all 5 chats; English-first switch same day |
| 2026-11-22 | Added §9 Read-first ritual, §10 Write boundaries, §11 Captain's inheritance (decision log + kill switches), §12 Ritual calendar | MAIN: Captain layer retired, patterns lifted into flat 7-chat structure |
| 2026-11-23 | §10: new write paths — Neufert (catuc checker/Profile Engine, privacy/terms), Billing (beta badge/feedback), Drawings (PermitTracker) | Phase 3 ownership decided in MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23 §3 |
| 2026-11-25 | Chat 6 registered as **Marketing** (§1 scope, §10 write paths) | Costin: separate chat for CATUC service + communication strategy |
| 2026-11-26 | Chat 8 registered as **Express** (§1 scope, §10 write paths); spec [[MCA-SPEC-EXPRESS-MODE-v0]] | Costin: automated wizard for users + automated testing |
| 2026-11-26 | Chat 9 registered as **Radar** (§1, §10); owns [[MCA-DOC-AI-RADAR]] | Costin: keep news links out of MAIN |
