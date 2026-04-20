# Meta-System — Captain Architecture

> **Status**: Active from 2026-04-20
> **Purpose**: long-term work coordination across multiple chats + AI tools without context collapse
> **Owner**: Costin Muraru
> **Anchor doc**: this file is the single source of truth for how work is organized across chats/tools

---

## 🎯 The problem this solves

**Before** (until 2026-04-20): single main Claude Code chat accumulates 80k+ tokens, becomes incoherent, decisions get lost, context rebuilding wastes hours.

**After**: 3-layer system where each layer has a fresh, scoped chat, and documents carry state across transitions. Captain coordinates. Workers execute. Specialists go deep. External AI tools augment specific capabilities.

---

## 🏗️ The 3-Layer System

```
┌────────────────────────────────────────────────────────────┐
│  CAPTAIN — Strategic Coordinator                           │
│  • Fresh chat monthly (or when >50k tokens)                │
│  • Reads memory + docs/ at spawn                           │
│  • Writes prompts for Weekly Ops                           │
│  • Never codes                                             │
│  • Reviews weekly outputs, updates principles/decisions    │
└──────────────────────┬─────────────────────────────────────┘
                       │ Monday prompt
                       ▼
┌────────────────────────────────────────────────────────────┐
│  WEEKLY OPS — Sprint Execution                             │
│  • Fresh chat every Monday                                 │
│  • Receives week priorities from Captain                   │
│  • Manages daily stand-ups, bug triage, deploys            │
│  • Dispatches to Specialists                               │
│  • Friday hand-off back to Captain                         │
└──────────────────────┬─────────────────────────────────────┘
                       │ On-demand dispatch
                       ▼
┌────────────────────────────────────────────────────────────┐
│  SPECIALISTS — Deep Focus (8 templates)                    │
│  external-ops, content-seo, frontend-qa, testing,          │
│  architect-tools, audit, ops, bug-fix                      │
│  • Spawn when task matches template scope                  │
│  • Close when task complete                                │
│  • Handoff via docs/sessions/active/*.md                   │
└────────────────────────────────────────────────────────────┘
```

Plus **orthogonal dimension** — external AI tools used as sub-agents by any layer:

```
Perplexity Pro ── research with citations
NotebookLM     ── document synthesis
Claude Design  ── UI mockups
ChatGPT Codex  ── alternate code opinion
Grok           ── social/real-time signals
Manus AI       ── autonomous multi-step (only when specifically justified)
Claude Cowork  ── team collaboration (future)
```

---

## 🧭 Golden rules (non-negotiable)

1. **Captain never codes** — if you catch Captain writing code, stop. Something's wrong.
2. **Weekly Ops never strategizes** — if Weekly Ops is debating vision, escalate to Captain.
3. **Specialist scope is tight** — never expand beyond template-defined allowed paths.
4. **External AI ≠ parallel chat** — external tools are sub-agents. Results flow back to orchestrating Claude chat.
5. **File-based communication** — chats coordinate via git commits + docs/sessions/. No other channels.
6. **Fresh is strength** — a new chat loaded from memory+docs is MORE coherent than a 100k-token one.
7. **Hard cap: 3 Claude Code chats concurrent** (Captain + Weekly Ops + 1 Specialist max).
8. **Kill switch everywhere** — every layer has a way to abort gracefully.

---

## 🔄 Cadence & rotation

| Layer | Lifespan | Trigger to retire | Trigger to start new |
|---|---|---|---|
| Captain | ~1 month | Context >50k tokens OR month boundary | Previous Captain writes handoff |
| Weekly Ops | Monday → Friday | Week ends OR priorities shift | New week starts |
| Specialist | Task lifecycle | Task done / blocked | Captain or Weekly Ops dispatches |

**Monthly retrospective** (first Monday of month): Captain reviews previous 4 weeks, updates ECOSYSTEM_ARCHITECTURE.md decision log with lessons, writes next month's strategic themes.

---

## 🛠️ Tool assignment matrix

When a task arrives, match it to the best tool:

| Task type | Primary tool | Layer that uses it | Fallback |
|---|---|---|---|
| Write Next.js/TS code | Claude Code | Weekly Ops or Specialist | — |
| UI design / mockup | Claude Design | Captain briefs, UI specialist executes | Figma AI |
| Real-time web research + citations | Perplexity Pro | Captain or any layer | Grok |
| Document synthesis (PDFs, long KB, DPA replies) | NotebookLM | Captain (legal/strategy) | Claude chat |
| Alternate code opinion / peer review | ChatGPT Codex CLI | Weekly Ops (critical paths) | — |
| Social / real-time trend scan | Grok (via X Premium) | Captain (pre-launch launch reactions) | Perplexity |
| Long autonomous multi-step task | Manus AI | Only if task justifies €20 credits | Claude Code + MCP chain |
| Team coordination | Claude Cowork | When team > 1 person | Email/Slack |
| Deep technical investigation | Perplexity + NotebookLM combo | Captain OR Specialist | Claude chat |

---

## 🔌 Integration protocols (summary — full detail in `docs/TOOLS_INTEGRATION.md`)

Each external tool has:
1. **Setup** (what user does once)
2. **Handoff prompt format** (what orchestrator chat produces)
3. **Result format** (what user pastes back)
4. **Trigger conditions** (when to use)

See `docs/TOOLS_INTEGRATION.md` for each tool's specifics.

---

## 📂 File structure (what's where)

```
docs/
├── META_SYSTEM.md                 # This file — architecture
├── TOOLS_INTEGRATION.md           # External AI tool integration guide
├── ECOSYSTEM_ARCHITECTURE.md      # Business + legal + brand strategy
├── PARALLEL_SESSIONS.md           # Detailed parallel-chat protocol
├── AUTONOMOUS_AGENT.md            # Stage 1-4 monitoring agent
├── DASHBOARD_SPEC.md              # admin.archicore.eu spec
├── AUTOMATION.md                  # Ops automation playbook
├── CONTINUOUS_AUDIT.md            # Audit cadence
├── TASK_MASTER.md                 # Task list with chat allocation
├── sessions/
│   ├── README.md                  # Session protocol quickstart
│   ├── TRACKER.md                 # Live state of all sessions
│   ├── templates/
│   │   ├── captain.md             # NEW — Captain spawn prompt
│   │   ├── weekly-ops.md          # NEW — Weekly Ops spawn prompt
│   │   ├── external-ops.md        # DPA + Startup + CSR
│   │   ├── content-seo.md         # Translations + blog + SEO
│   │   ├── frontend-qa.md         # Mobile + a11y + polish
│   │   ├── testing.md             # E2E + unit coverage
│   │   ├── architect-tools.md     # Step 14 features
│   │   ├── audit.md               # READ-ONLY audits
│   │   ├── ops.md                 # EXCLUSIVE prod ops
│   │   └── bug-fix.md             # Single-bug template
│   └── active/                    # Live session scratchpads
│       └── YYYY-MM-DD-<role>-<id>.md
```

---

## 🧠 Memory hierarchy

Memory files in `~/.claude/projects/C--Users-Costin-Documents-modulca/memory/` persist across all chats:

- `user_costin.md` — user identity + preferences
- `project_modulca.md` — platform overview
- `principle_modular_i18n.md` — design principles
- `feedback_autonomy.md` — autonomy preferences
- `feedback_efficiency.md` — token efficiency rules
- ... and others

Every new chat reads these at spawn. Update them when principles evolve.

---

## 🎚️ Circuit breakers

System disables cleanly if:
- Captain can't access memory files → switches to "limited mode", escalates to user
- Weekly Ops loses sight of week priorities → pauses, reads `sessions/active/*` + TRACKER
- Specialist escapes allowed paths → PARALLEL_SESSIONS.md protocol kicks in (stop, stash, escalate)
- External AI tool times out → fallback in the matrix
- >3 Claude chats active → spawn blocked (per TRACKER.md cap)

---

## 📊 Success metrics (how we know it's working)

- **Context load time**: new Captain should be fully operational in <15 min from spawn
- **Handoff accuracy**: 0 information lost across Captain rotations
- **Chat longevity**: no single Claude Code chat exceeds 50k tokens
- **Decision continuity**: decisions made in month N are respected in month N+1 (check ECOSYSTEM_ARCHITECTURE.md decision log)
- **Tool efficiency**: right tool used for each task (not Claude for research that Perplexity does better)

Track these in the monthly Captain retrospective.

---

## 🔄 Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-20 | 3-layer Captain architecture | Original main chat reached 80k+ tokens, became incoherent |
| 2026-04-20 | Captain never codes | Prevents strategic layer from accumulating execution detail noise |
| 2026-04-20 | Fresh Captain monthly | Balances context freshness with operational continuity |
| 2026-04-20 | External AI tools as sub-agents (not parallel chats) | Prevents N-squared coordination cost |
| 2026-04-20 | File-based inter-chat communication only | Git-native, auditable, no side channels |
| 2026-04-20 | Manus AI NOT adopted yet | Credit-based pricing unpredictable; re-evaluate when brand #2 launches |
| 2026-04-20 | Perplexity + NotebookLM as research foundation | Combined €20/mo, minimal overlap, covers 90% of research needs |

---

*The Captain's job isn't to know everything. It's to know who knows what and coordinate them well.*
