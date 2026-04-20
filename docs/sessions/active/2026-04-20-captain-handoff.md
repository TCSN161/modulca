# Captain Handoff — Inaugural (Old Main Chat → CAPTAIN-2026-04)

> **Written**: 2026-04-18 by the outgoing main chat (which was the de-facto orchestrator until now)
> **For**: The first Captain chat, spawned via `docs/sessions/templates/captain.md` on or around 2026-04-20
> **Context**: The old main chat reached ~80k tokens and was becoming incoherent. User approved Option A — transition to 3-Layer Captain Architecture per `docs/META_SYSTEM.md`.

---

## 🎯 Why you exist

The old main chat was doing everything: strategy + coding + ops + triage + investor docs + legal + CSR. It worked until it didn't — context collapse around 80k tokens. New model (per `docs/META_SYSTEM.md`):

- **You (Captain)** coordinate strategy + dispatch.
- **Weekly Ops** chat runs Mon-Fri sprint execution.
- **Specialists** (8 templates) run deep focus sessions.
- **External AI tools** (Perplexity, NotebookLM, Codex, Grok, Claude Design, Manus) plug in as sub-agents per `docs/TOOLS_INTEGRATION.md`.

You have **11 days to the 2026-05-01 beta launch**. This handoff is everything you need to land it without rebuilding context from scratch.

---

## 📊 Project state (as of 2026-04-18 EET)

**Product**: ModulCA — 14-step AI modular home design SaaS. Next.js 16 + Supabase (Frankfurt) + Stripe + Resend + Vercel + 15 AI render engines.

**Completion**: ~82%. 28/28 ops:check passes. All 14 product steps functional. i18n RO+EN working across pricing, auth, account, mobile nav, homepage, legal, FAQ, library, portfolio, press, B13.

**Launch target**: 2026-05-01 public Beta. T-11 days.

**Legal entities**:
- **MCA SRL** (ATELIER DE PROIECTARE MCA S.R.L.) — J40/14760/2015 — VAT RO35294600 — Str. Lacul Plopului nr. 10, Sector 5, București 051735 — operates the SaaS.
- **UII ONG** (urban-innovation.institute) — Costin's NGO — for grant-eligible + academic + CSR work.
- **Sole shareholder MCA**: Costin Muraru (100%). **Administrator MCA on paper**: Muraru Petria (legal requirement). ALL public contexts → Costin Muraru as founder+CEO.

**Domains**:
- `modulca.eu` — canonical, live.
- Brand protection pending (Namecheap, €95/yr, blocked on user 15 min).
- Planned sister sites: NeufertAI, RenderLab, Bunkere.ro, Treehouse.eu, CrisisReady under `archicore.eu` umbrella.

---

## 🧵 What's in flight right now

### Active chats (as of 2026-04-18)

| Chat | Task ID | Status | Owns |
|---|---|---|---|
| **Old main chat** | MAIN-ongoing | RETIRING after this handoff push | Orchestration duties → transfer to you |
| **External Ops** | EXT-OPS-001 | 🟡 Prep complete, awaiting 3 user inputs | DPA outreach (6 vendors) + Startup apps (6 programs) |

When you spawn, the old main chat will have pushed its last commit and the worktree for EXT-OPS-001 is separate (branch `claude/crazy-wozniak-c27690`).

### EXT-OPS-001 — what it's doing, what it's blocked on

Full scratchpad: `docs/sessions/active/2026-04-18-external-ops-EXT-OPS-001.md`.

**Stream A — DPA outreach**: personalized emails ready for Supabase, Resend. Self-serve dashboard instructions ready for Stripe, Sentry, Vercel, Microsoft Clarity. User hasn't yet sent/submitted any — waiting on green light.

**Stream B — Startup applications**: kit ready for 7 programs. Blocked on 3 user inputs:
1. LinkedIn URL (`LINKEDIN_URL_PENDING`)
2. Stripe account ID `acct_...` (`STRIPE_ACCT_ID_PENDING`)
3. Supabase Free → Pro upgrade decision (Supabase for Startups requires Pro)

**Your first action with EXT-OPS**: when user provides those 3 inputs, ping EXT-OPS-001 (or if it's been idle too long, close it cleanly and respawn EXT-OPS-002 via `external-ops.md` template).

---

## 🚧 Active blockers (who owns what)

| Blocker | Owner | Blocks | ETA |
|---|---|---|---|
| **Stripe bank verification** | User (call bank) | Stripe live cutover, A2 webhook verify in live mode | TBD after bank call |
| **DPA vendor replies × 6** | External vendors | Live Privacy Policy v2 cut-over | 3-7 days after EXT-OPS sends emails |
| **Domain purchases** | User (€95/yr Namecheap, 15 min) | Brand protection, archicore.eu umbrella | When user has 15 min |
| **Startup application decisions** | External committees | $150-300K potential free credits | 2-6 weeks after EXT-OPS submits |
| **Migration 010 run in Supabase Dashboard** | User (SQL Editor, 2 min) | Autonomous agent Stage 1 signal persistence | On first prompt — send user `supabase/migrations/010_monitoring_signals.sql` to paste |
| **Telegram bot token + chat_id** | User (set up via @BotFather, 5 min) | Autonomous agent notifications Stage 2+ | Low priority — Stage 1 works without it |
| **LinkedIn URL, Stripe acct_id, Supabase Pro decision** | User (5 min) | EXT-OPS-001 Stream B unblock | Near-term |

---

## 🗓 11-day launch schedule (suggested — adjust as you see fit)

**Apr 20 (Mon) — Week kick-off**:
- Spawn Weekly Ops (WEEK-2026-W17) via `docs/sessions/templates/weekly-ops.md`.
- Unblock EXT-OPS-001 (user provides 3 inputs → EXT-OPS sends DPA batch + startup apps).
- User runs migration 010 → autonomous agent Stage 1 goes live.

**Apr 21-22 (Tue-Wed)**:
- Weekly Ops dispatches Frontend QA Specialist (`frontend-qa.md`) for mobile 375px final audit + a11y pass.
- DPA replies start trickling in (EXT-OPS collects).
- User buys domains if time permits.

**Apr 23-24 (Thu-Fri)**:
- Weekly Ops dispatches Testing Specialist (`testing.md`) for Playwright E2E on auth + Stripe flows.
- Translations: dispatch Content & SEO Specialist (`content-seo.md`) for top-10 KB articles RO.
- Captain Fri-close. Old Captain retires on Apr 30 + fresh for May? Or stay if <50k tokens.

**Apr 25-26 (Sat-Sun)**:
- Soft work only. No new Specialist dispatches. User rests.
- If any DPAs signed: note in TRACKER for Monday Privacy Policy update.

**Apr 27 (Mon)**:
- Spawn Weekly Ops (WEEK-2026-W18).
- Critical path: Stripe bank verification should be done by now.
- Dispatch Ops Specialist (`ops.md` — EXCLUSIVE) if bank verified → `npm run stripe:go-live` cutover.
- User updates live Privacy Policy v2 if ≥4 DPAs signed.

**Apr 28-29 (Tue-Wed)**:
- Weekly Ops dispatches final bug-fix sprints as issues surface.
- Dashboard polish if time.
- Investor one-pager final pass (Captain direct edit).

**Apr 30 (Thu) — Pre-launch**:
- Final `npm run ops:check` — must pass 28/28.
- Autonomous agent baseline captured (7 days of history by now).
- Soft announce to close circle.

**May 1 (Fri) — BETA LAUNCH**:
- Social announcement.
- Press kit ready.
- Grok trend scan to gauge reception (via `docs/TOOLS_INTEGRATION.md`).
- Captain runs a post-launch retro within 24h.

---

## 🤖 Autonomous agent state

Per `docs/AUTONOMOUS_AGENT.md`:

- **Stage 1 (Prevention — passive monitoring)**: infrastructure deployed (`supabase/migrations/010_monitoring_signals.sql`, `scripts/monitor-collect.mjs`, `.github/workflows/ops-check-cron.yml`). Runs every 6h. Opens GitHub issues on failure, auto-closes on recovery. **User still needs to run migration 010 in Supabase Dashboard** for signal persistence.

- **Stage 2 (Preparation — classified alerts)**: deferred to post-beta. Needs Telegram bot setup.

- **Stage 3 (Response — auto-remediation)**: deferred to Q3 2026. Needs human-in-loop UI.

- **Stage 4 (Recovery + Learning)**: deferred to Q4 2026.

**Your job on autonomous agent**: ensure Stage 1 is humming (check GitHub Actions runs weekly); don't push Stage 2+ before beta launch stabilizes.

---

## 🔧 External AI tool state

Per `docs/TOOLS_INTEGRATION.md`:

| Tool | User paid? | Setup state | Last used | Next trigger |
|---|---|---|---|---|
| **Perplexity Pro** | ✅ €20/mo | Ready | Not yet in new system | First market-research task (e.g. "NL modular housing permit trends 2026") |
| **NotebookLM** | ✅ Free | Ready | Not yet in new system | First batch of DPA replies arriving (synthesize into updated Privacy Policy) |
| **Claude Design** | ✅ (included) | Ready | Not yet in new system | Investor one-pager visual refresh |
| **ChatGPT Codex CLI** | ✅ ChatGPT Plus €20/mo | **Not installed yet** | Never | Critical-path code review (e.g. Stripe go-live script) |
| **Grok** | ✅ X Premium | Ready | Not yet in new system | Pre-launch sentiment scan on launch day |
| **Manus AI** | ❌ Deferred | n/a | Never | Re-evaluate post-beta when brand #2 launches |
| **Claude Cowork** | ❌ Team size = 1 | n/a | Never | When team grows past user |

**What user needs to do one-time (when you first invoke each tool)**:
- Perplexity Pro: already logged in at perplexity.ai — just open it.
- NotebookLM: log in at notebooklm.google.com, create first notebook.
- Claude Design: already available in Claude desktop app — just activate.
- **Codex CLI**: `npm install -g @openai/codex-cli` → `codex auth login` with ChatGPT Plus account. ~5 min.
- Grok: open grok.x.ai with X Premium account logged in.

**Your job on tools**: trigger them per `TOOLS_INTEGRATION.md` protocols — produce a handoff prompt block, copy to user, user pastes to external tool, user pastes result back, you file result in `docs/research/<topic>-<date>.md` or similar.

---

## 🧠 Memory hierarchy (what persists across chat rotations)

At `~/.claude/projects/C--Users-Costin-Documents-modulca/memory/`:

- `user_costin.md` — user identity + preferences (Costin Muraru = founder+CEO public; Muraru Petria only in formal acts)
- `project_modulca.md` — platform overview
- `principle_modular_i18n.md` — design principles (i18n day 1, modular, non-destructive, antifragile)
- `feedback_autonomy.md` — autonomy preferences
- `feedback_efficiency.md` — token efficiency rules (read ARCHITECTURE.ts first, split big files, batch by folder)
- `project_beta_launch.md` — May 1 target
- `project_status_april2026.md` — status snapshots
- `project_tier_system.md` — 5 tiers, pricing
- `project_ai_engines.md` — 15 engines status
- `project_knowledge_library.md`, `project_knowledge_tiers.md` — 82+ articles
- `project_asset_library.md` — 36 products, 20 GLB, 12 portfolio
- `project_demo_feedback.md` — investor feedback patterns

Every new chat reads these at spawn. **You as Captain** should update them when principles evolve — but only the memory files covering principles/strategy, NOT project_status (that churns too fast; keep status in `docs/sessions/TRACKER.md`).

---

## 📚 Key documentation you should read in order (first session, ~25 min)

1. `docs/META_SYSTEM.md` — the 3-layer architecture you're running
2. `docs/TOOLS_INTEGRATION.md` — external AI tools
3. `docs/sessions/templates/captain.md` — your own template (so you know your rules)
4. `docs/sessions/templates/weekly-ops.md` — so you can write Monday briefs
5. This file (handoff)
6. `docs/sessions/TRACKER.md` — live chat state
7. `docs/ECOSYSTEM_ARCHITECTURE.md` — business / legal / brand / CSR
8. `docs/TASK_MASTER.md` — tasks + chat allocation
9. `docs/AUTONOMOUS_AGENT.md` — Stage 1-4 agent
10. `docs/sessions/active/2026-04-18-external-ops-EXT-OPS-001.md` — what EXT-OPS is doing
11. `docs/PARALLEL_SESSIONS.md` — full coordination protocol
12. `docs/pitch/ONE_PAGER.md` — investor pitch (understand the product you're shipping)
13. `docs/CONTINUOUS_AUDIT.md` — audit cadence
14. `docs/DASHBOARD_SPEC.md` — admin.archicore.eu spec (post-beta)

**If you hit 50k tokens before beta launches** — that's OK, rotate on Apr 30 for clean May 1 Captain. Write a new handoff.

---

## 🧭 Strategic principles (inherited — respect unless user overrides)

From `principle_modular_i18n.md` + ecosystem architecture decisions:

1. **i18n from day 1** — all new text goes through next-intl `t()`. RO + EN, easy to add more.
2. **Modular packages** — `@archi/*` monorepo vision; today the code is single Next.js but paths are named modularly.
3. **Non-destructive** — never force-push master, never overwrite migrations, never rm without stash.
4. **Antifragile** — every change should make the system MORE resilient, not less. Circuit breakers everywhere.
5. **Coherent** — one source of truth per concept. `lib/company.ts` for company info. `src/i18n/messages/*` for copy. No drift.
6. **Efficient** — minimize tokens, minimize work, maximize impact. User's meta-principle.
7. **Win-win-win** — every design decision should benefit user, ModulCA, and the wider ecosystem (partners, clients, regulators). No zero-sum.

From `docs/ECOSYSTEM_ARCHITECTURE.md` decision log (respect month N decisions in month N+1):

- 2026-04-16: modulca.eu is canonical (not .ro, not .com)
- 2026-04-17: archicore.eu is the umbrella for sister brands
- 2026-04-17: contact@modulca.eu is the public email (forwards to business inbox)
- 2026-04-17: Privacy Policy v2 must go live before beta (blocked on DPAs)
- 2026-04-18: 3-Layer Captain Architecture adopted; old main chat retired
- 2026-04-18: External AI tools used as sub-agents (not parallel Claude chats)
- 2026-04-18: Manus AI deferred until post-brand-#2

---

## 🧬 Subtle things a fresh Captain would miss without a hint

- **User is crisis-management trained.** This colors everything. Antifragility is a value, not a buzzword. When in doubt, choose the option that makes the system more robust to the unknown.
- **User speaks Romanian casually, English for technical.** Match their register. Don't over-translate technical terms into Romanian unnecessarily.
- **User works in batches by priority.** Will often say "give me 5 things to do now, ordered". Respect that — don't dump 20 bullets.
- **User values autonomy.** Per `feedback_autonomy.md`: act autonomously on code/CLI/deploy, only pause for human decisions. Don't over-ask. If you can do it safely and it's within scope, do it and report.
- **User is investor-demo focused.** Every decision should survive the question "how does this look to a Series Seed investor?" Keep quality investor-grade.
- **Postal code is 051735** (not 051704 — a past chat guessed wrong; user confirmed correct).
- **Share capital MCA SRL: 200 RON** (legal minimum, noted in `lib/company.ts`).
- **Domain status**: modulca.eu live. Others need purchase (user blocker).
- **Muraru Petria = paper Administrator only.** Don't surface that name in public/LinkedIn/pitch/DPA/startup contexts. Use Costin Muraru everywhere external.
- **3 concurrent chats hard cap.** Don't let Weekly Ops spawn a 4th Specialist. Queue it.
- **Ops chat is EXCLUSIVE.** Only one Ops chat at a time, ever. Race conditions on production are real.
- **The old main chat's worktree** (if any dirty state left) should be committed + pushed before you spawn. Your first act: `git status` on main repo, ensure clean state. Then `git log --oneline -20`.

---

## 🎬 Your first 60 minutes as Captain

1. **Read** this handoff + `docs/META_SYSTEM.md` + `docs/TOOLS_INTEGRATION.md` (20 min)
2. **Read** `docs/sessions/TRACKER.md` + latest EXT-OPS scratchpad (5 min)
3. **Verify** clean git state: `git status` + `git log --oneline -10`
4. **Write** your first session scratchpad: `docs/sessions/active/2026-04-20-captain-2026-04.md`
5. **Confirm** to user: priorities you're seeing, any disagreement with this handoff, open questions
6. **Plan** Monday (if today is Monday) — produce Weekly Ops spawn prompt for WEEK-2026-W17
7. **Commit**: `chore(captain): CAPTAIN-2026-04 spawn + first session`
8. **Push**

---

## 🙏 Closing note from the old main chat

I ran for 3 days straight and accumulated ~80k tokens, a lot of decisions, and some real muscle memory. I couldn't tell you everything I know implicitly — that's exactly why we built this architecture. But I've tried to put the non-obvious stuff in this file and in the memory files. The rest is reconstructible from docs + git log.

You don't need to remember what I remembered. You need to be fresh, coherent, and on-plan. Fresh IS strength.

Beta launches May 1. 11 days. User trusts you to not drop balls. The structure is built; your job is to coordinate, not to carry.

Go.

— Outgoing main chat, 2026-04-18 EET
