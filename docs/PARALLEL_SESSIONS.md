# Parallel Claude Sessions — Coordination Playbook

> Last updated: 2026-04-18
> Status: Source of truth. Companion docs: `docs/AUTOMATION.md`, `docs/CONTINUOUS_AUDIT.md`, `docs/DASHBOARD_SPEC.md`, `docs/TASK_MASTER.md`
> Tooling anchor: `scripts/collision-check.mjs`

## 0. Why this doc exists

Costin is a solo founder working with multiple Claude Code chat sessions in parallel on a single git repository (`master` branch, Vercel auto-deploys, GitHub push protection). Parallelism multiplies throughput, but also multiplies the ways things collide: merge conflicts, divergent state, duplicated effort, broken assumptions across chats.

**Core stance**: parallel sessions are a force multiplier only when each chat owns a well-bounded slice of the repo. The moment two chats touch the same file without coordination, you lose more time resolving conflicts than you gained.

## 1. WHEN to parallelize vs when NOT to

### 1.1 Good candidates 🟢

| Scenario | Why it works |
|---|---|
| Feature A and Feature B in disjoint folders | Zero file overlap |
| i18n string extraction/translation while feature code stable | `src/i18n/messages/*.json` append-only per locale |
| Content work (blog, KB articles, `docs/*`) while product ships | Separate file trees |
| Audit/read-only investigations | No writes at all |
| Ops maintenance (env sync, Vercel, Stripe) | Touches `.env.local` / dashboards, not source |
| Tests after feature merged | Feature stable; tests additive |

### 1.2 Bad candidates 🔴

| Scenario | Why it breaks |
|---|---|
| Two chats refactoring same module | Merge conflicts, lost context |
| Two chats editing `package.json` / `package-lock.json` | npm install races, lockfile corruption |
| Two chats editing same `src/i18n/messages/<locale>.json` | JSON conflicts, duplicate keys |
| Supabase migration while another chat runs | Race on migrations + remote DB |
| Two chats editing `next.config.js` / `tsconfig.json` / `tailwind.config.ts` | Config drift |
| Destructive ops: `push --force`, history rewrites, Stripe live cutover | Only one session ever |
| Releases/deploys | Freeze all others |

### 1.3 Yellow zone 🟡

Sibling components sharing parent layout, dependency bumps, shared types/interfaces, API route signature changes. Require `session-claim` + sync on every commit.

## 2. Session types / roles

Every parallel chat is assigned ONE role at spawn time.

### 2.1 Feature Chat 🟢
- **Scope**: one well-scoped feature end-to-end
- **Allowed**: `src/features/<feature>/**`, tests, new migration if needed
- **Forbidden**: other features, shared config, docs outside feature readme
- **Duration**: 1–6 hours

### 2.2 Bug-Fix Chat 🟠
- **Scope**: reproduce + fix one bug + regression test
- **Allowed**: wherever the bug lives (declared up front)
- **Forbidden**: scope creep into refactors (stop → spawn Feature Chat)
- **Duration**: 30 min – 3 hours

### 2.3 i18n Chat 🔵
- **Scope**: extract hardcoded strings, translate, keep en/ro/nl in sync
- **Allowed**: `src/i18n/**`, component files ONLY to replace strings with `t('...')`
- **Forbidden**: behavior changes, new features, server routes
- **Duration**: 2–8 hours per sweep

### 2.4 Content Chat 🔵
- **Scope**: blog posts, KB articles, marketing copy, Romanian content
- **Allowed**: `docs/blog-drafts/**`, `src/knowledge/**`
- **Forbidden**: `src/features/**`, `src/app/api/**`, any code
- **Duration**: 1–4 hours

### 2.5 Audit Chat ⚪
- **Scope**: READ-ONLY investigation
- **Allowed**: read anything; write only to `docs/audits/**`
- **Forbidden**: any non-audit write; `npm install`; any push other than the report
- **Duration**: 1–3 hours

### 2.6 Ops Chat 🟡
- **Scope**: env vars, Vercel, Stripe, Supabase migrations, secrets, CI
- **Allowed**: `.env.local` (local only), dashboards, `supabase/migrations/*` (exclusive), `.github/workflows/*` (exclusive)
- **Forbidden**: product code; UI
- **Duration**: 15 min – 2 hours
- **Hard rule**: **only ONE Ops Chat at a time, ever.**

### 2.7 Release Chat 🔴 (future)
- **Scope**: cut release, `predeploy`, promote production
- **Hard rule**: ALL other sessions freeze during this

## 3. File ownership matrix

| Path | Primary owner | Secondary (read-only) | Hard rule |
|---|---|---|---|
| `src/features/architect/**` | one Feature Chat | Audit | Never two feature chats on same folder |
| `src/features/design/**` | one Feature Chat | Audit | Same |
| `src/features/presentation/**` | one Feature Chat | Audit | Same |
| `src/features/auth/**` | Feature OR Ops (exclusive) | Audit | Cross-cut — claim loudly |
| `src/app/**` (pages/layouts) | Feature Chat owning route | i18n (strings only) | i18n only replaces with `t('...')` |
| `src/app/api/**` | Feature Chat owning route | Ops (env only) | Contract changes: stop consumers first |
| `src/i18n/messages/en.json` | i18n Chat | Feature Chats (append new keys only) | Never two i18n chats |
| `src/i18n/messages/ro.json` | i18n Chat | — | Single owner |
| `src/i18n/messages/nl.json` | i18n Chat | — | Single owner |
| `src/i18n/{config,request}.ts` | i18n Chat | — | Config = i18n-only |
| `src/shared/**` | Feature Chat (claim loudly) | All | Prefer new files over editing shared |
| `src/knowledge/**` | Content Chat | — | Markdown/MDX only |
| `package.json` | **single session at a time** | All (read) | Announce; `npm install` immediately after |
| `package-lock.json` | regenerated, never hand-edited | — | On conflict: delete, `npm install`, recommit |
| `supabase/migrations/**` | Ops Chat (exclusive) | Feature Chats read | New files only; never edit existing |
| `next.config.js` / `tsconfig.json` / `eslint.config.mjs` | Ops Chat | — | One session |
| `tailwind.config.ts` | Feature Chat (prior announce) | — | Coordinate for design tokens |
| `.github/workflows/**` | Ops Chat (exclusive) | Audit | Never during running CI |
| `vercel.json` | Ops Chat | — | One session |
| `docs/AUTOMATION.md` | Ops Chat | All (read) | Ops appends |
| `docs/CONTINUOUS_AUDIT.md` | Audit Chat | All (read) | Audit appends |
| `docs/DASHBOARD_SPEC.md` | Costin + Feature Chat building dashboard | All (read) | Single owner once build starts |
| `docs/TASK_MASTER.md` | Costin (arbiter) | All chats append status | Only Costin reprioritizes |
| `docs/PARALLEL_SESSIONS.md` | Costin | All (read at spawn) | Amendments via PR |
| `docs/blog-drafts/**` | Content Chat | — | One draft = one chat |
| `docs/audits/**` | Audit Chat | — | Append-only |
| `scripts/**` | Ops OR Feature (if needed) | All (read) | Announce before editing |
| `tests/**`, `**/__tests__/**` | Feature Chat owning feature | All | Additions safe; edits follow ownership |
| `.env.local` | Ops Chat | — | Never committed, never two ops chats |

### Universal hard rules
1. Never edit a file you didn't declare at session start.
2. Never run `npm install` / `npm update` in parallel.
3. Never run Supabase migration while another chat has open feature session.
4. Never commit `.env.local`, `.env.*.local`, `*.tmp.*`.
5. Never `git push --force` to master. Ever.
6. If you see conflict markers — STOP, alert Costin, do not auto-resolve.

## 4. Coordination protocol

### 4.1 Spawn header (paste as first message in every new chat)

```
ROLE: <Feature|Bug-Fix|i18n|Content|Audit|Ops> Chat
SCOPE: <one-sentence goal>
ALLOWED PATHS: <explicit list, e.g. src/features/design/**>
FORBIDDEN PATHS: anything not listed above
TASK ID: <from docs/TASK_MASTER.md>
SPAWN TIME: <YYYY-MM-DD HH:MM EET>
SIBLING CHATS: <list of other active chats or "none">
READ FIRST: docs/PARALLEL_SESSIONS.md
```

First action: confirm header, read scope, run `npm run collision-check`.

### 4.2 Pre-flight (Costin, before spawn)

```bash
cd /c/Users/Costin/Documents/modulca
git status                      # must be clean
git fetch && git status         # must say "up to date"
npm run collision-check         # must exit 0
```

### 4.3 Checkpoints

| Trigger | Action |
|---|---|
| Every commit (before) | checkpoint |
| Every 30 min active work | checkpoint |
| Before touching 🟡 yellow-zone | checkpoint |
| Before `npm install` / `build` | checkpoint |
| Before declaring task done | full checkpoint + run relevant tests |

Checkpoint = `git fetch` + `git status` + `npm run collision-check` + optionally `git pull --rebase`.

### 4.4 Merge styles

**Style A — direct-to-master** (small, file-isolated):
```bash
git fetch && git pull --rebase origin master
npm run collision-check
npm run typecheck && npm run test:run
git add <explicit-files>
git commit -m "feat(scope): message"
npm run collision-check
git push origin master
```

**Style B — branch + PR** (required for 🟡, Ops, Release, multi-hour):
```bash
git checkout -b claude/<role>-<task-id>-<short>
# ...work...
git push -u origin claude/<role>-<task-id>-<short>
gh pr create --fill
# merge via squash after CI green
```

### 4.5 Emergency stop

If session misbehaves:
```bash
# In runaway chat: tell it to STOP, summarize changes
# In fresh shell:
git status && git diff && git diff --cached

# If uncommitted bad: git stash push -u -m "runaway-<chatID>"
# If committed local but unpushed: git reset --soft HEAD~N
# If pushed: git revert <bad-sha> && git push (NEVER --force master)
```

Destructive (`reset --hard`, `clean -fd`, `push --force`) = Costin-only, explicit intent.

## 5. Communication patterns

Chats talk via filesystem. No out-of-band.

### 5.1 Central ledger: `docs/TASK_MASTER.md`
Each chat updates OWN task row's Status column. Update = dedicated commit `chore(task): <id> <status>`.

### 5.2 Per-session scratchpad: `docs/sessions/<date>-<role>-<taskid>.md`
```markdown
# Session: <role> — <task id> — <date>
## Goal
## Scope claimed
## Decisions taken
## Open questions for Costin
## Handoff
```

### 5.3 Handoffs
1. Chat A commits: `feat(scope): ... → unblocks <B-task-id>`
2. Chat A appends to TASK_MASTER.md Notes: `"Unblocked YYYY-MM-DD by <sha>"`
3. Chat B on next spawn: `git pull --rebase` before continuing

### 5.4 Blockers
- Update TASK_MASTER.md status = `Blocked`, reason in Notes
- Clear ask to Costin: 1 sentence, 1 decision, 2-3 options
- Do NOT work around by touching forbidden paths
- Do NOT spawn new chat — only Costin spawns

## 6. Risk mitigation

### 6.1 Git conflicts
**Prevention**: ownership matrix (primary), scope declaration, pre-commit rebase, collision-check.
**Resolution**: if conflict → STOP. Read sibling sessions. Escalate unless trivial.
Lockfile conflicts: delete + `npm install` + commit. Never hand-merge.
JSON messages conflicts: owning i18n Chat reorders; feature chats never reorder.

### 6.2 Divergent state
Spawn check + TASK_MASTER.md + `session-claim.mjs` (proposed). If happens: stop newest, oldest finishes, others rebase.

### 6.3 Knowledge fragmentation
- Every chat reads this doc at spawn
- Every chat reads latest 3 `docs/sessions/*`
- Every chat reads TASK_MASTER.md
- CLAUDE.md / AGENTS.md at repo root required

### 6.4 User context overload
- **Hard cap: 3 active chats. Never 4+.**
- Each chat has one-line label
- Every 30 min, Costin scans TASK_MASTER.md (not chats)
- Future dashboard surfaces "active sessions" tile

### 6.5 Master drift during long sessions
- >2h sessions rebase every 30 min
- >4h probably should be two sessions
- If `git rev-list --count HEAD..@{u}` ≥ 3, pause + rebase

## 7. Tooling proposals (NOT built)

### 7.1 Enhancements to `scripts/collision-check.mjs`
1. Session-claim awareness (read `.claude/claims/*.json`)
2. Forbidden-path diff (fail hard on paths outside `SPAWN_HEADER.allowed`)
3. Lockfile-drift severity bump on master
4. Branch-age warning (≥24h + behind ≥10)
5. JSON-locale parity check across locales
6. Configurable hotspot threshold
7. `--json` flag for dashboard

### 7.2 New script: `scripts/session-claim.mjs`
Advisory lock per session:
```bash
node scripts/session-claim.mjs acquire --role feature --task A4 --paths "src/features/design/**"
node scripts/session-claim.mjs status
node scripts/session-claim.mjs release --task A4
```
Claim files git-ignored. TTL 2h. Stale → `collision-check` warns.

### 7.3 Git hooks (opt-in, `.githooks/`)
- pre-commit: `collision-check` (block exit 2)
- pre-push: typecheck changed files + collision-check
- commit-msg: reject without `<type>(<scope>): ` prefix

### 7.4 Dashboard tile (future)
```
🟡 Sessions
2 active · 0 blocked · last collision: 17m ago
```
Drill-down: active cards, stale claims, history, lockfile drift, commits/chat/day.

## 8. Practical cadence — typical day with 3 parallel chats

```
09:00  Costin: npm run ops:check && collision-check → green
09:05  SPAWN Ops: "Sync Vercel prod env" (ETA 45m)
09:10  SPAWN Feature: "Step 7 cost breakdown UI" (ETA 3h)
09:15  SPAWN Content: "RO KB article on permits" (ETA 2h)
09:45  Ops done → close
10:30  Feature + Content checkpoint #1 (rebase, collision-check)
11:00  Feature commits progress → TASK_MASTER updated
11:45  Content commits draft → TASK_MASTER updated
12:00  Costin scans TASK_MASTER: 2 greens, 0 blocked. Lunch.
13:30  SPAWN Bug-Fix: "Stripe webhook idempotency" (ETA 1h)
14:30  Feature done → close (cap restored to 2)
15:30  Bug-Fix done → close
16:30  Content done → close
16:35  Daily wrap: collision-check + ops:check
17:00  Done. No overnight.
```

Heuristics:
- Stagger spawns ≥5 min
- Never open 4th chat
- End day with no running chats unless explicit

## 9. Anti-patterns

- ❌ Spawning without scope declaration
- ❌ >3 concurrent chats
- ❌ Overlapping ALLOWED PATHS
- ❌ `npm install` in two chats simultaneously
- ❌ "Just cleaning up" unclaimed files
- ❌ Auto-resolving merge conflicts in a chat
- ❌ `git push --force` to master
- ❌ Supabase migration with live feature chats
- ❌ `package.json` edit without announcing + freezing others
- ❌ Editing shared config in Feature Chat (Ops-only)
- ❌ Trusting chat memory of "what we decided"
- ❌ Same chat switching roles (close + reopen with proper header)
- ❌ Skipping `collision-check` "because small change"
- ❌ Forgetting to update TASK_MASTER.md at close
- ❌ Treating this doc as suggestions

## 10. Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-18 | Hard cap of 3 concurrent chats | Solo founder context limit |
| 2026-04-18 | Six standard roles + Release | Covers observed work in TASK_MASTER |
| 2026-04-18 | Only one Ops Chat ever | Global blast radius |
| 2026-04-18 | File ownership = primary conflict prevention | Cheaper than merge-time |
| 2026-04-18 | File-based communication only | Auditable, git-native |
| 2026-04-18 | `collision-check` before commit AND push | Two checkpoints catch more |
| 2026-04-18 | `git push --force` to master forbidden | Unrecoverable if Vercel deploys bad |
| 2026-04-18 | Lockfile conflicts: regenerate, never hand-merge | Silent dependency drift |
| 2026-04-18 | Propose (not build) session-claim + hooks + dashboard | Keep doc actionable |
| 2026-04-18 | Status schema matches DASHBOARD_SPEC (🟢🟡🟠🔴🔵⚪) | Coherence |

## 11. Quick reference card (pin at top of each chat)

```
Role:        <one of 6>
Scope:       <one sentence>
Allowed:     <paths>
Forbidden:   anything else
Task ID:     <from TASK_MASTER.md>
Siblings:    <other active chats>

Before commit:  git fetch && git pull --rebase && npm run collision-check
Before push:    npm run collision-check (again)
On conflict:    STOP. Escalate. Never auto-resolve.
On blocker:     Update TASK_MASTER.md = Blocked. Ask Costin.
On finish:      Update TASK_MASTER.md = Done. Close chat.
Cap:            3 concurrent chats. No exceptions.
```

---

*End of PARALLEL_SESSIONS.md. Amendments via PR; decision-log append required.*
