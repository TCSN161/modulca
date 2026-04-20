# Week 2026-W17 — Weekly Ops

> **Spawned**: 2026-04-20 (Monday) EET
> **Close target**: 2026-04-24 (Friday) EET
> **Task ID**: WEEK-2026-W17
> **Worktree**: `.claude/worktrees/nice-chandrasekhar-aa2808` (branch `claude/nice-chandrasekhar-aa2808`)
> **Captain**: CAPTAIN-2026-04 (`claude/modest-blackwell-dfbf1f`)
> **Architecture**: 3-Layer Captain — see `docs/META_SYSTEM.md`
> **Cap check at spawn**: Captain (active) + Weekly Ops (this chat, spawning) + EXT-OPS-001 (🟡 prep-done, dormant-pending-user) = 3 — at cap but EXT-OPS-001 closes dormant as soon as user provides inputs, restoring headroom for FE-QA-001 Tue/Wed.

---

## Captain brief (pasted verbatim from spawn prompt)

**WEEK PRIORITIES (from Captain):**
1. Unblock EXT-OPS-001 — ensure the 3 user inputs (LinkedIn URL, Stripe acct_id, Supabase Pro decision) reach EXT-OPS-001 chat, verify placeholders filled + commit lands, support user through the 6 DPA actions (~45 min) and 6 startup app submissions (~2h batch).
2. Autonomous Agent Stage 1 live — ensure user runs `supabase/migrations/010_monitoring_signals.sql` in Supabase Dashboard. Verify GitHub Actions `ops-check-cron` runs green on first 6h tick. Flag any signals that look anomalous pre-launch.
3. Dispatch Frontend QA Specialist FE-QA-001 (Tue or Wed) — template `docs/sessions/templates/frontend-qa.md`. Scope: mobile 375px final audit across Steps 1–14 + a11y pass (ARIA, keyboard nav StepNav, focus trap modals, skip-to-content). Close Thursday with clean report or prioritized bug list.
4. Dispatch Testing Specialist TEST-001 (Thu or Fri) — template `docs/sessions/templates/testing.md`. Scope: Playwright E2E for auth flow + Stripe checkout (mock), plus CloudSyncProvider unit coverage gap. Live Stripe cutover is post-bank-verification, NOT in scope this week.
5. Relay one Perplexity handoff block from Captain mid-week (topic TBD — Captain produces). Pass to user, user pastes to Perplexity, result comes back, file at `docs/research/YYYY-MM-DD-perplexity-<topic>.md`.

**TARGET DELIVERABLES BY FRIDAY 2026-04-24:**
- 6 DPAs sent (4 dashboard self-serves: Stripe / Sentry / Vercel / Clarity; 2 emails: Supabase / Resend).
- 6 startup apps submitted (Microsoft Founders Hub, Supabase, Vercel, Figma, Together.ai, Anthropic).
- Migration 010 live in Supabase prod, GitHub Actions `ops-check-cron` showing 4+ green 6h ticks.
- Frontend QA report committed at `docs/sessions/active/2026-04-2X-frontend-qa-FE-QA-001.md`.
- Playwright E2E green for auth + Stripe mock; committed at `docs/sessions/active/2026-04-2X-testing-TEST-001.md`.
- 1 Perplexity research output filed at `docs/research/YYYY-MM-DD-perplexity-<topic>.md`.
- Friday handoff written below in §Friday Handoff to Captain.

---

## Daily log

### Monday 2026-04-20

**Session 1 — spawn + Monday kick-off**

Context load:
- Read: `META_SYSTEM.md` §3-Layer + §Golden rules, `sessions/README.md` §Naming, `PARALLEL_SESSIONS.md` §2, `TRACKER.md`, `TASK_MASTER.md` (flagged stale by Captain), Captain Session 1 scratchpad, EXT-OPS-001 scratchpad, `AUTONOMOUS_AGENT.md` §Stage 1, `weekly-ops.md` template.
- Preflight: `git fetch` — in sync with origin/master. `npm run collision-check` — all 7 checks green (no conflicts, no hotspots, lockfile synced, no stale temp, no suspect merges).
- Hygiene: unstaged 2 stray `.claude/launch.json` + `.claude/settings.json` deletions that were in the index at spawn (not my scope; left in working tree for whoever owns them).

Today's sub-priorities (P-this-day):
1. **Relay the 3-input ask to user** for EXT-OPS-001 (LinkedIn, Stripe acct_id, Supabase Pro decision) — single biggest unblocker for the whole week. Without Monday send, DPA reply window pushes past May 1.
2. **Relay migration 010 ask to user** — 2-min Supabase Dashboard SQL paste. Needed by Apr 21 to have 7+ days of baseline by May 1 launch.
3. Queue FE-QA-001 spawn prompt for Tuesday (frontend-qa.md) — do not dispatch today; would breach 3-chat cap with EXT-OPS-001 still alive.
4. Queue TEST-001 spawn prompt for Thursday/Friday (testing.md).

Decisions this session:
- **Deferring FE-QA-001 dispatch to Tuesday**, not Monday. Captain's plan is Tue OR Wed; Monday dispatch would breach the 3-chat cap (Captain + Weekly Ops + EXT-OPS-001 + FE-QA-001 = 4). EXT-OPS-001 scratchpad says it closes dormant after user fills placeholders → cap restores to 2 → safe to spawn FE-QA-001 Tuesday AM.
- **Migration 010 handled by Captain direct-to-user per Captain §Open questions** (noted in Captain scratchpad as default). Weekly Ops' job is to verify the first GitHub Actions `ops-check-cron` tick comes back green once user runs the SQL.
- **`docs/TASK_MASTER.md` stays untouched this week** per Captain note. Will mark individual task Status cells Done only when a Specialist closes one (e.g. B1/B4/B5/B7 Done when FE-QA-001 closes, E1-E4 when TEST-001 closes).

Commits this session:
- _(pending)_ `chore(weekly-ops): spawn WEEK-2026-W17 + Monday kick-off` — scratchpad create + TRACKER row update.

Open threads ending Monday:
- Awaiting user: 3 EXT-OPS-001 inputs, migration 010 run, Codex CLI install (optional), domain purchases (optional).
- Captain produces Perplexity topic by Wednesday AM for mid-week relay.

**EXT-OPS-001 input tracker** (collecting here; relay to EXT-OPS-001 chat as a single block once all 3 in):
- ✅ #1 LinkedIn URL: `https://www.linkedin.com/in/muraru-costin-93320bba/` (received 2026-04-20)
- ✅ #2 Stripe acct_id: `acct_1TLkh2F72yiHtCID` (received 2026-04-20)
- ✅ #3 Supabase Pro UPGRADED (confirmed 2026-04-20 via billing screenshot — ModulCA Org now on Pro Plan)

**Paste-ready block for EXT-OPS-001** delivered to user 2026-04-20. Awaiting EXT-OPS-001 commit `chore(ext-ops): fill remaining personalization placeholders` to land on master.

**Supabase Pro operational housekeeping flagged to user** (separate from EXT-OPS-001 scope):
- Tax ID missing on billing (needs RO35294600 / MCA SRL) — dashboard banner warning.
- Spend Cap currently ON (included-usage limit) — recommended: keep ON for launch-week cost safety.
- Daily backups auto-enabled on Pro (verified by user screenshot 2026-04-20 — first snapshot at 04:06 UTC).
- User paying via personal card (MCA SRL has no revenue yet). Pattern: record as decont/împrumut asociat via accountant — normal for early-stage RO SRL.

**VIES check result 2026-04-20** (user verified): RO35294600 = domestic VAT-registered but **NOT on VIES** (no ANAF Form 098 on file). Foreign SaaS will charge ~19% local VAT (no reverse-charge) until VIES registered. Supabase VAT impact: ~€57/yr. Full-stack cumulative impact once all SaaS billing via MCA SRL: ~€300-500/yr VAT savings once VIES on.

**Queued for Captain Session 2** (NOT launch-blocking, 30-60 day task):
- Engage Romanian accountant for MCA SRL (monthly bookkeeping + Form 098 VIES filing + VAT return + founder-expense reimbursement structure). Budget: ~€50-400/mo depending on freelance vs firm. ROI on Form 098: 2-4 months via reverse-charge savings across SaaS stack.
- "Monetize extra Supabase Pro resources" strategic question (from user 2026-04-20). Proposed Routes A (Perplexity handoff) or B (Audit Specialist) — Captain picks.

**Strategic question escalated to Captain**: user asked about "monetize extra Supabase resources" — that's product/revenue strategy, out of Weekly Ops scope per golden rules. Queued for Captain Session 2 with suggested framing (Perplexity handoff or Audit Specialist brief).

**Migration 010 bug flagged to Captain** (for OPS-NNN dispatch):
- `supabase/migrations/010_monitoring_signals.sql:44` has forward FK reference to `public.incidents(id)` before that table is created at line 71. Fails on fresh DB with "relation public.incidents does not exist". Workaround delivered to user: run `incidents` CREATE block first, then full file (idempotent). Canonical file needs proper reorder by Ops Specialist per PARALLEL_SESSIONS §3 (supabase/migrations is Ops-exclusive, not Weekly Ops scope).

**Migration 010 status: LIVE in Supabase prod** (user verified 2026-04-20, Monday afternoon):
- 2b: `incidents` shell block executed → Success (RLS enabled via Supabase "Run and enable RLS" option).
- 2c: Full migration file (monitoring_signals + incidents re-skip + remediation_log + RLS + policies + helper functions) executed → Success (user clicked "Run this query" on the destructive-operations warning; revokes/drops were idempotent cleanups, not data loss).
- 2d: Verification SELECT returned 3 rows (incidents, monitoring_signals, remediation_log) → Autonomous Agent Stage 1 data layer confirmed live.
- Next: watch for first green GitHub Actions `ops-check-cron` tick (6h schedule). Weekly Ops to verify + flag anomalies in Monday evening / Tuesday morning standup.

**EXT-OPS-001 closure** (2026-04-20 afternoon — Monday critical path COMPLETE):
- User continued EXT-OPS-001 in a fresh Claude Code chat (original 2026-04-18 chat not re-opened; not a problem — work landed on master cleanly).
- Commit `fe6b88d` (chore(ext-ops): fill remaining personalization placeholders) pushed to master; pulled into this worktree via rebase (after stashing/restoring local scratchpad).
- Edits confirmed at docs/pitch/startup-programs-applications.md: line 17 (LinkedIn URL), line 345 (Stripe acct_id), line 287 (Supabase row → "Pro — eligible to apply now"). Submission-log Notes row also updated with closure marker.
- Kit 100% send-ready per EXT-OPS-001 verification. User now executes 6 DPAs (~45 min) + 6 startup apps (~2h batch) per kit §"Suggested 2-hour batch plan" at own pace. Real hard deadline: Vercel DPA Saturday 2026-04-25.
- TRACKER.md updated: EXT-OPS-001 status 🟡 → 🟢 (inputs-filled-committed, kit send-ready); cap 3/3 → 2/3; FE-QA-001 Tuesday-AM dispatch unblocked.
- Lesson (first entry for TRACKER §Lessons): Specialist continuity survives a chat-session break if commits are clean + scratchpad stays on master. Don't over-engineer chat preservation — trust the git log + scratchpad protocol.

**Monday critical path CLOSED 2026-04-20 afternoon (EET):**
- [x] Supabase Pro upgrade + tax ID saved (RO35294600 / ATELIER DE PROIECTARE MCA S.R.L. / full address)
- [x] Migration 010 LIVE (incidents + monitoring_signals + remediation_log + RLS + policies + 4 helper functions)
- [x] EXT-OPS-001 inputs filled + kit 100% send-ready (commit `fe6b88d`)

**Monday remaining (optional, deferrable to Tue)**:
- [ ] Accountant email (VIES history + app preference Oblio/FGO/SmartBill + Semnătură Calificată question) — user sends when they have 5 min; response gates 30-60 day accountant engagement
- [ ] User executes 6 DPAs + 6 startup apps from kit (hard deadline Sat 2026-04-25 for Vercel DPA)
- [ ] Codex CLI install (needed Week 2 Stripe go-live review)
- [ ] Domain purchases (€95/yr brand protection)

### Tuesday 2026-04-21
_(to be filled)_

### Wednesday 2026-04-22
_(to be filled)_

### Thursday 2026-04-23
_(to be filled)_

### Friday 2026-04-24
_(to be filled — end with Friday Handoff section below)_

---

## Specialists dispatched

| Specialist | Task ID | Template | Dispatched | Closed | Status | Scratchpad |
|---|---|---|---|---|---|---|
| Frontend QA | FE-QA-001 | frontend-qa.md | _(pending — Tue AM)_ | — | 📅 queued + pre-dispatch scratchpad ready | `docs/sessions/active/2026-04-21-frontend-qa-FE-QA-001.md` (pre-created 2026-04-20 PM, spawn prompt embedded inside) |
| Ops (Telegram) | OPS-001 | ops.md | _(pending — Wed PM post-FE-QA close)_ | — | 📅 queued + pre-dispatch scratchpad ready | `docs/sessions/active/2026-04-22-ops-OPS-001.md` (pre-created 2026-04-20 PM, spawn prompt + user prerequisites @BotFather inside) |
| Testing | TEST-001 | testing.md | _(pending — Thu AM post-OPS-001 close)_ | — | 📅 queued + pre-dispatch scratchpad ready | `docs/sessions/active/2026-04-23-testing-TEST-001.md` (pre-created 2026-04-20 PM, spawn prompt embedded inside) |

Siblings active at spawn (not dispatched by me):
- **Captain** CAPTAIN-2026-04 (strategic; not counted as Specialist).
- **EXT-OPS-001** (🟡 prep-done-awaits-user; closes dormant once user fills the 3 inputs).

Queued for next week (per Captain):
- **EXT-OPS-002** — batch-process DPA replies + Stripe Climate email (needs acct_id). Trigger: ≥3 DPAs signed.

---

## External AI tool handoffs this week

| Tool | Topic | Produced by | Relayed date | Result filed |
|---|---|---|---|---|
| Perplexity | TBD (Captain produces mid-week) | Captain | _(pending)_ | _(to be filed: `docs/research/YYYY-MM-DD-perplexity-<topic>.md`)_ |

---

## Blockers / escalations opened this week

_(none yet — Monday spawn)_

---

## 📦 Ready-to-use assets for W17 (prepped 2026-04-20 afternoon by Weekly Ops)

> User ("Costin") explicitly asked Weekly Ops to front-load all autonomous prep on Monday so Tue-Fri = execution + unexpected-handling. These assets are copy-paste ready — user executes with zero prep friction.

### 📅 Day-by-day week plan

| Day | User does (~30-90 min each) | Weekly Ops does (autonomous) | Specialist active | Cap |
|---|---|---|---|---|
| **Mon 2026-04-20** ✅ DONE | Supabase Pro upgrade, migration 010 run, paste EXT-OPS-001 inputs | Monday critical path close, pre-dispatch scratchpads for FE-QA/TEST/OPS, prep assets batch | EXT-OPS-001 closed dormant | 2/3 |
| **Tue 2026-04-21** | Paste FE-QA-001 spawn prompt → new Claude Code chat (morning). Start 6 DPAs + 6 startup apps from kit (~2-3h at own pace) | Verify first `ops-check-cron` green tick, monitor FE-QA progress, update TRACKER on FE-QA spawn + close | **FE-QA-001** (mobile 375 + a11y pass Steps 1–14) | 3/3 |
| **Wed 2026-04-22** | 10-min BotFather + GitHub secrets setup (for OPS-001 — see Asset 5), paste OPS-001 spawn prompt mid-day after FE-QA closes. Execute Perplexity handoff if Captain produces one | Relay Captain's Perplexity topic, monitor OPS-001, file research result at `docs/research/2026-04-22-perplexity-<topic>.md` | **FE-QA-001** (closes mid-day) → **OPS-001** (Telegram notifications layer, ~90 min) | 3/3 serial |
| **Thu 2026-04-23** | Paste TEST-001 spawn prompt → new chat (morning). Continue DPA replies triage if vendors reply | Monitor TEST-001, verify Telegram notifications working (4+ cron ticks by now) | **TEST-001** (Playwright E2E auth + Stripe mock + CloudSync coverage) | 3/3 |
| **Fri 2026-04-24** | Close any user-blockers, verify Vercel DPA archived (real deadline 2026-04-25), reply to any specialist questions | Close TEST-001 coordination, write Friday Handoff to Captain (§section below), close WEEK-2026-W17 | TEST-001 (closes mid/late) | 3/3 → 2/3 |

### 📧 Asset 1 — Accountant email (RO, ready to send)

**To**: contabila pentru MCA SRL
**Subject**: `MCA SRL — 3 întrebări rapide pentru setup intrare săptămâna asta`

```
Bună [Nume],

Pregătim lansarea publică ModulCA pe 1 mai și vreau să finalizez setup-ul
administrativ pentru MCA SRL. 3 întrebări rapide dacă ai 5 min:

1. Semnătură Calificată / SPV:
   Ai deja certificat digital calificat propriu (de la alți clienți)?
   Dacă da, aș prefera să semnăm împuternicire SPV pe MCA SRL (formular
   ANAF 150) ca tu să depui declarațiile în numele firmei, nu să
   cumpăr un certificat nou pe firmă. Cost MCA SRL: 0 lei vs ~200 lei
   dacă trebuie certificat separat.

2. Istoric VIES — MCA SRL:
   Am verificat astăzi VIES pentru RO35294600 și a întors "invalid for
   cross-border transactions" — deci firma nu e (sau nu mai e) înregistrată
   pentru operațiuni intracomunitare.
   a. A fost MCA SRL vreodată înregistrată (cod TVA intracomunitar
      activ pe VIES)?
   b. Dacă da, când s-a inactivat și de ce (inactivitate 12 luni /
      non-conformitate / cerere voluntară)?
   c. Poți să depui formular ANAF 098 pentru re-activare (sau prima
      activare, după caz)? Am mai multe SaaS-uri străine (Supabase,
      Stripe, Vercel, Sentry, Resend) care îmi facturează 19% VAT
      extra lunar — reverse charge intracomunitar ar însemna ~€300-500
      economie/an.

3. App de facturare preferată:
   Vrem să emitem primele facturi MCA SRL în săptămânile următoare
   (clienți + consultanță + primele conversii ModulCA). Obligatoriu
   cu integrare e-Factura / SPV. Opțiuni pe care le-am în vedere:
   - Oblio (free tier generos)
   - FGO / facturis.ro (free 25 facturi/lună)
   - SmartBill (~50 RON/lună, cel mai popular cu contabilii)

   Ce preferi tu? Mă aliniez la alegerea ta ca să poți deschide direct
   fișierul firmei când vine vremea bilanțului.

Context scurt: MCA SRL va avea primele încasări prin Stripe (abonamente
€19.99 / €49.99 / €149.90) începând probabil cu luna iunie (bank verification
Stripe încă în proces). Până atunci, plățile spre furnizori externe le fac
din card personal — va trebui să discutăm decont asociat / împrumut asociat
la momentul potrivit.

Mulțumesc mult pentru răspuns!

Costin Muraru
Founder & CEO
ATELIER DE PROIECTARE MCA S.R.L.
CUI RO35294600 | J40/14760/2015
Str. Lacul Plopului nr. 10, Sector 5, București 051735
costin@modulca.eu | modulca.eu
```

**How to send**: copy above text → Gmail → New compose → to: your contabila email → send. Reply arrives in 1-3 days typically. Relay to me in this chat and I log findings + update Captain queue accordingly.

### ✅ Asset 2 — DPA + Startup app execution checklist (flat, ordered, ~2h total)

From `docs/pitch/vendor-dpa-emails.md` + `docs/pitch/startup-programs-applications.md` (already 100% send-ready post fe6b88d):

**Batch A — 4 DPAs via dashboard self-serve (~20 min total)**

| # | Vendor | URL | Values to confirm in form | Download |
|---|---|---|---|---|
| 1 | Stripe | https://dashboard.stripe.com/settings/legal | Entity: ATELIER DE PROIECTARE MCA S.R.L. | Signed DPA PDF |
| 2 | Sentry | https://sentry.io/settings/modulca/legal/ | Same | Signed DPA PDF |
| 3 | Vercel | https://vercel.com/teams/uiiacgsauto-8044s-projects/settings/billing → Legal | Same | Signed DPA PDF |
| 4 | Microsoft Clarity | Dashboard → Data Protection tab | Configure masking/consent + download Microsoft DPA PDF | DPA PDF |

→ Save all 4 PDFs to `~/Documents/modulca-business/legal/dpa/DPA-<vendor>-2026-04-20.pdf` (outside git).

**Batch B — 2 DPAs via email (~15 min, reply window starts)**

| # | Vendor | From | To | Body source |
|---|---|---|---|---|
| 5 | Supabase | costin@modulca.eu | support@supabase.com (cc privacy@supabase.com) | `docs/pitch/vendor-dpa-emails.md` §1 |
| 6 | Resend | costin@modulca.eu | support@resend.com | `docs/pitch/vendor-dpa-emails.md` §3 |

→ Open kit file → copy body → paste → send. Replies typically 3-7 days.

**Batch C — 6 startup apps (~2h, can split across Tue + Thu)**

| Order | Program | URL | Kit section | Time |
|---|---|---|---|---|
| 1 | Microsoft Founders Hub | https://startups.microsoft.com/signup | §3 | 20 min |
| 2 | Supabase for Startups | https://supabase.com/startups | §8 | 15 min (**Pro confirmed — eligible**) |
| 3 | Vercel for Startups | https://vercel.com/startups | §7 | 15 min |
| 4 | Figma for Startups | https://www.figma.com/community/startup-program | §9 | 15 min |
| 5 | Together.ai Startup | https://www.together.ai/forms/startup-program | §4 | 15 min |
| 6 | Anthropic Startup | https://www.anthropic.com/startups | §6 | 20 min |

→ Open kit file → each program has pre-filled answer table (Field → Answer) → paste answers into form → submit.

→ After each submission, append to kit's §Submission Log: `# | Program | Date | Reference email | Status: submitted | Credit TBD | Expiry TBD | Notes`

### 🗄️ Asset 3 — Migration 009 paste-ready (when user has 2 min)

From TRACKER §Blockers: "Migration 009 run in Supabase Dashboard | User (SQL Editor) | db:analyze script | When user has 2 min".

**File**: `supabase/migrations/009_query_analyzer_rpc.sql` is already correctly structured (no forward-FK bug unlike 010). Paste as-is.

**Instructions**:
1. Open https://supabase.com/dashboard/project/_/sql/new → select ModulCA Project / main
2. Open file `supabase/migrations/009_query_analyzer_rpc.sql` locally → Ctrl+A → Ctrl+C
3. Paste into SQL Editor → Run
4. Expected: `Success. No rows returned.` (creates pg_stat_statements extension + 6 analyzer functions, all service_role gated)
5. Verify: `select routine_name from information_schema.routines where routine_schema='public' and routine_name like 'analyzer_%';` → should return 6 rows (analyzer_slow_queries, analyzer_frequent_queries, analyzer_db_health, analyzer_unused_indexes, analyzer_table_sizes, analyzer_reset_stats)

Unblocks `npm run db:analyze` for performance monitoring. Nice-to-have before launch; not blocking May 1.

### 🔍 Asset 4 — 3 candidate Perplexity topics for Captain's mid-week handoff

Captain produces the final choice; these are 3 ranked candidates covering different strategic angles:

**Topic A — Accounting SaaS for RO pre-revenue SRL + contabil onboarding** ⭐ recommended
Query: *"For a pre-revenue Romanian SRL (single administrator, solo founder, first invoices within 60 days), compare Oblio vs FGO vs SmartBill for e-Factura + SPV integration, monthly cost, accountant compatibility, and 12-month scalability. Cite Romanian freelance accountant community recommendations from 2025-2026."*
Rationale: directly actionable, cheap, unblocks accountant engagement within days.

**Topic B — EU Civil Protection Mechanism 2026-Q3/Q4 calls for urban-resilience + construction-tech consortia** (Captain's original suggestion)
Query: *"List all EU Civil Protection Mechanism and Horizon Europe calls open or opening 2026-Q3/Q4 that accept Romanian SME+NGO consortia with focus on urban resilience, modular construction, or crisis-management tech. For each: deadline, funding ceiling, consortium requirements, typical first-time applicant success rate."*
Rationale: opens grant funding pipeline for MCA SRL + UII ONG dual structure (per ECOSYSTEM_ARCHITECTURE.md).

**Topic C — Monetization patterns for vertical-SaaS with Supabase headroom** (from user's Monday question)
Query: *"For a modular-construction-design SaaS (RO/EU market, pre-launch) moving from Supabase Free to Pro, what Supabase-backed premium features consistently drive tier-upgrade conversions in comparable vertical-SaaS plays (archicad-style tools, Procore-style, housebuilder CRMs)? Prioritize features that monetize DB headroom, storage, bandwidth, or edge functions specifically. Cite revenue data / case studies from 2024-2026."*
Rationale: ties back to user's Monday strategic question; Captain may delegate this to a future Audit Specialist instead of Perplexity.

→ Captain picks one → paste `▶ PERPLEXITY HANDOFF` block (format per `docs/TOOLS_INTEGRATION.md` §Tool 1) → user runs → result filed at `docs/research/2026-04-22-perplexity-<slug>.md`.

### 📱 Asset 5 — BotFather / GitHub secrets quick-guide (for OPS-001 pre-dispatch)

Full details in `docs/sessions/active/2026-04-22-ops-OPS-001.md` §Pre-Dispatch; here's the 10-min compact version:

1. Telegram → search `@BotFather` → `/newbot` → name: `ModulCA Monitoring`, username: `modulca_monitor_bot` (or similar). Save the HTTP API token.
2. Open the new bot → send `/start`. In browser: `https://api.telegram.org/bot<TOKEN>/getUpdates` → copy `"chat":{"id":<NUMBER>}`.
3. https://github.com/TCSN161/modulca/settings/secrets/actions → New repository secret:
   - `TELEGRAM_BOT_TOKEN` = the token from step 1
   - `TELEGRAM_CHAT_ID` = the chat id from step 2
4. Tell me "BotFather done" → I give you OPS-001 spawn prompt Wed PM.

### 🧠 Skills / automation to activate this week (my proposals)

Claude Code has built-in skills that could reduce friction for the week. I can invoke these autonomously if you say "go"; otherwise they queue as optional.

| Skill | What it does | ROI this week | Scope risk |
|---|---|---|---|
| `less-permission-prompts` | Scans recent transcripts for common read-only Bash/MCP tool calls, adds allowlist to `.claude/settings.json` → reduces permission prompts for all chats | 🟢 High — every chat Tue-Fri benefits (FE-QA, OPS, TEST) | ⚠️ Modifies `.claude/settings.json`; not clearly my scope per PARALLEL_SESSIONS §3. Needs your "go". |
| `consolidate-memory` | Reviews memory files, merges duplicates, prunes stale index entries | 🟡 Medium — keeps memory lean for Captain rotation end-April | 🟢 Low — operates only on user memory (~/.claude/projects/.../memory/) |
| `schedule` | Creates a cron-style task to run a prompt on interval | 🟡 Medium — could auto-check `ops-check-cron` tick status daily | 🟢 Low — scheduled tasks are additive |
| `security-review` | Complete security review of current branch changes | 🔴 NOT for W17 — would overlap with FE-QA scope and duplicate audit-specialist work | n/a |

**Recommendation**: I activate `less-permission-prompts` + `consolidate-memory` this week if you approve (5 min total). `schedule` is nice-to-have but can wait. `security-review` = skip for W17, defer to post-launch audit cadence.

---

## Friday Handoff to Captain — 2026-04-24

_(to be written Friday before close commit)_

### Shipped this week
- _TBD_

### Slipped this week
- _TBD_

### Specialists run this week
| Specialist | Task ID | Status | Key output |
|---|---|---|---|

### Blockers added / resolved
- Added: _TBD_
- Resolved: _TBD_

### Proposed priorities for next week (Captain decides)
- _TBD_

### Lessons / surprises
- _TBD_

### Open questions for Captain
- _TBD_
