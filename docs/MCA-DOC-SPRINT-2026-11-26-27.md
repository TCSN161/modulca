# MCA-DOC-SPRINT-2026-11-26-27 — "Beta-functional + full account" sprint

**Status**: Proposed by MAIN 2026-11-26. It becomes active once Costin says go.
**Owner**: Chat 1 MAIN
**Goal**: by Fri 27 evening, Costin has a **full (Constructor) account** on modulca.eu and has walked **every flow end-to-end**: the 14 wizard steps, 3D, renders, presentation, consultant, PDF and billing in TEST mode. Every bug found has an owner chat and a ticket line. Nothing breaks the rest when one part fails.
**Feeds**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] · [[MCA-DOC-WEEK-2026-W48-SCHEDULE]] · [[MCA-DOC-PHASE4-BETA-PREP-CHECKLIST]]

---

## 0. What "beta-functional" means (definition of done)

| # | Flow | Done when |
|---|---|---|
| F-A | Sign up / log in (email + Google) | works locally and on prod; the beta promo is applied |
| F-B | Wizard: 14 steps, save, reload, resume | there are no dead ends and data persists |
| F-C | 3D view / walkthrough | loads within 10 s on a laptop; no console errors |
| F-D | AI renders | at least 2 free engines work; the quota message shows when the quota is hit; fallback order is correct |
| F-E | Presentation / export (PDF) | generates without errors and shows the correct project data |
| F-F | Consultant (NeufertAI) | answers on every tier; Architect tier uses Claude **(currently suspected broken, see §4.1)** |
| F-G | Billing (Stripe TEST) | upgrade, downgrade and portal all work; tier limits are enforced |
| F-H | Library / blog / quiz | pages render; no draft content is public |
| F-I | Ops | ops:check passes, Sentry receives errors, /api/health is ok |

MAIN writes this as a click-by-click checklist in `docs/MCA-DOC-BETA-SMOKE-TEST.md` and **runs it itself in the built-in browser** on modulca.eu. Costin then repeats only the parts that need human judgment: look and feel, and render quality.

---

## 1. Sessions: new or continue?

Rule: **one deliverable per session**. Start a new session when the old one is past ~60% of its context or the topic changes. Continuity lives in files (handoffs, live log), not in chat history.

| Chat | Current session | Decision for the sprint |
|---|---|---|
| 1 MAIN | 1.02 (this one, very long) | Finish today's sprint plan here, then **new session `1.04.MAIN_Sprint-SmokeTest_20261127`** tomorrow |
| 2 Neufert | 2.03 done | **New `2.04` F3** (planned). **New `2.06` consultant fix (§4.1)**, small, run it today |
| 3 Engines | last session 19–22 Nov | **New `3.0x.Engines_Beta-Render-Readiness_20261126`** |
| 4 Billing | last session 19 Nov | **New `4.0x.Billing_Full-Account-Beta-Promo_20261126`** |
| 5 Drawings | never opened | **New `5.01.Drawings_Export-Audit_20261127`**, read-only |
| 6 Marketing | 6.02 running | Continue; nothing to add for this sprint |
| 7 Partners | last session 23 Nov | **New `7.0x.Partners_Vlad-Agreement-DPA_20261127`** |

Sessions are started by MAIN in the same folder and touch only their own §10 paths, so parallel runs don't collide. At most **3 running at the same time** (RAM; see the Nahimic note in the W48 log).

---

## 2. Sprint backlog per chat

Time estimates are agent time. Token estimates are Claude Code subscription usage: S ≈ <5% of a 5-hour window, M ≈ 5–15%, L ≈ 15–30%.

### Chat 1 — MAIN
| # | Item | When | Time / tokens |
|---|---|---|---|
| M1 | This plan + roadmap update | Thu 26 | done / S |
| M2 | Full account for Costin: give the exact SQL to Costin, or run it with his OK (§3) | Thu 26 | 10 min / S |
| M3 | `MCA-DOC-BETA-SMOKE-TEST.md` checklist (F-A…F-I) | Thu 26 eve | 45 min / M |
| M4 | **Run the smoke test on prod in the built-in browser**; record every bug as `BUG-xx` with flow, steps, owner chat and severity | Fri 27 AM | 1.5–2 h / L |
| M5 | Route bugs to the owner chats as one handoff per chat | Fri 27 | 30 min / S |
| M6 | W48 wrap + W49 schedule (1.04) | Fri 27 PM | 45 min / M |

### Chat 2 — Neufert
| # | Item | When | Time / tokens |
|---|---|---|---|
| N1 | **Consultant Claude fix (§4.1)**: drop `temperature` for Sonnet 5.5; move to `@anthropic-ai/sdk`; set effort; add prompt caching on the KB system prompt; smoke test 5 questions | Thu 26 | 1 h / M |
| N2 | F3 modular-prefab-regulations (critical, Claude only) + Vlad package note | Fri 27 | 3–4 h / L |
| N3 | (W49) F4 + F6 | Mon 30 | 3 h / L |

### Chat 3 — Engines
| # | Item | When | Time / tokens |
|---|---|---|---|
| E1 | Beta render readiness: run `engines-audit.mjs` + `engines-model-check.mjs`; produce a table of which engines work on free tiers, quota per beta user and fallback order | Thu 26 | 1.5 h / M |
| E2 | **Engine registry check**: every model ID lives in one config per engine, and the audit script flags deprecated models monthly (§5) | Fri 27 | 1 h / M |
| E3 | Fix the render and 3D bugs from M4 | Fri 27 PM | depends |

### Chat 4 — Billing
| # | Item | When | Time / tokens |
|---|---|---|---|
| B1 | Full-account path: confirm that `profiles.tier = 'constructor'` unlocks everything (credits, quotas, consultant tier); document an **admin "comp account" procedure** (no Stripe charge) for Costin, Vlad and testers | Thu 26 | 1 h / M |
| B2 | Beta promo path end-to-end in Stripe TEST (invite → Premium 3 months → dated downgrade) | Fri 27 | 1.5 h / M |
| B3 | (W50) beta badge + feedback widget | later | — |

### Chat 5 — Drawings
| # | Item | When | Time / tokens |
|---|---|---|---|
| D1 | 5.01: read-only audit of `src/features/output` + presentation export → `MCA-SPEC-PERMITTRACKER-PDF.md` (planned W49, pulled forward because the smoke test needs the export status) | Fri 27 | 1–1.5 h / M |

### Chat 6 — Marketing
6.02 (Shorts drafts + Jan calendar) is running. No sprint items.

### Chat 7 — Partners
| # | Item | When | Time / tokens |
|---|---|---|---|
| P1 | Vlad agreement draft (Layer A €50 + €100 deferred) + email/handoff wording DTAC→PAC | Fri 27 | 1 h / M |
| P2 | DPA emails to Supabase, Resend, Sentry and Vercel, ready to send | Fri 27 | 45 min / S |

**Sprint total (agents)**: ~15–18 h of agent work, spread over 2 days in parallel. Usage is roughly **2–3 full 5-hour windows**, or about **15–25% of a weekly limit** (rough; depends on the plan; Settings → Usage shows the real number).

---

## 3. Costin's list for the sprint

| When | Action | Time |
|---|---|---|
| Thu 26 | Say "go" on this plan | 1 min |
| Thu 26 | Full account: in Supabase → SQL Editor, run the one line MAIN gives you (sets your profile to `constructor`). Or tell MAIN to do it with the service key | 2 min |
| Thu 26 eve | Read F2 (sense check) | 30 min |
| Thu 26 | Reserve the @modulca handles (Chat 6 list) | 20 min |
| Fri 27 | Walk the smoke test yourself **after** MAIN's run: look and feel, render quality, "would I show this to a client?" Write notes freely; MAIN turns them into BUG lines | 1–1.5 h |
| Fri 27 | Read F3 | 30 min |
| on reply | Vlad call | 45 min |
| optional | Disable NahimicService permanently (services.msc) | 2 min |

---

## 4. Claude updates: what helps us, where

### 4.1 Found today: consultant's Claude path is likely broken
`src/app/api/consultant/route.ts` calls `claude-sonnet-5-5` with **`temperature: 0.7`** via raw `fetch`. On Sonnet 5.5, non-default sampling values return **HTTP 400**, so Architect-tier users probably fall back to another provider or get an error. Fix it in N1:
- remove `temperature`;
- use the official SDK;
- set `output_config.effort` (`low` for chat answers keeps it cheap and fast);
- add a `cache_control` breakpoint after the long, stable KB/system prompt (cuts input cost on repeat questions).

Owner: Chat 2.

### 4.2 Upgrades worth doing (ranked by value per effort)
| # | Upgrade | Where | Value | When |
|---|---|---|---|---|
| U1 | **Citations API** on CATUC documents: the consultant answers *with the exact article text cited* (`citations: {enabled: true}` on document blocks) | Consultant, `/catuc-check` | Legal answers you can verify → trust, which is the brand promise | Phase 3 (W50) |
| U2 | **Prompt caching** for the KB system prompt | Consultant | −50–90% input cost on repeat traffic | N1 (now) |
| U3 | **Claude Haiku 5.5** ($0.10 / $0.50 per M tokens) for translation, tagging and summaries, replacing DeepSeek in `catuc-translate` | Chat 2 | Cheaper than the DeepSeek top-up and one fewer provider | W49 |
| U4 | **Message Batches** (−50%) for bulk work: translating the 82+ library articles, re-tagging | Chat 2 | Big one-off jobs at half price | Jan |
| U5 | **Structured outputs** for the checker / Profile Engine (typed JSON verdict) | Chat 2 Phase 3 | No parsing bugs; testable | W50 |
| U6 | **Vision input**: user uploads a land photo, sketch or existing plan → Claude reads it | Wizard step "land" | Wow factor for architects | after beta |
| U7 | **Agent Skills (pptx/docx/pdf)** server-side to generate a polished client presentation or document pack | Chat 3 presentation / Chat 5 | Pro-grade exports with little code | Jan |
| U8 | **Models API** check in `engines-model-check.mjs`: lists Anthropic models monthly and flags when ours is not the newest | Chat 3 | Automatic "new model available" signal | E2 (now) |

### 4.3 How we work (Claude Code side)
- **Built-in browser** → MAIN runs the E2E smoke test itself (M4), and repeats it before every deploy.
- **Parallel sessions per chat** (as done today) with handoff files, and **restart sessions often** to keep context small.
- **Scheduled routines** (cloud) for the weekly ops:check + engine model check, after the repo is reachable from the cloud. Optional, Jan.
- **/code-review** on bigger diffs before deploy (Phase 3 code).
- **Hooks**: a pre-commit guard that fails if a public file contains the reviewer's name or if the KB index contains `.new.md`, so the two incidents from this week can't repeat.

### 4.4 "Always up to date" mechanism (the upgrade lane)
1. **One place per vendor for model IDs** (`src/shared/ai/models.ts` or each engine's config). No model strings scattered in routes.
2. **Monthly "AI upgrade day"** (first Monday, MAIN ritual): run the model checks → read vendor changelogs → one small upgrade PR per chat, behind a flag.
3. **Feature flags / kill switch per engine and per model** (env var). A new model goes live for admin first, then beta users, then everyone.
4. **Golden-question tests**: 10 fixed consultant questions + 3 fixed render prompts; compare before and after an upgrade.

---

## 5. 3D, Blender and other tools

The current stack is Three.js r183 + React Three Fiber 9 + drei + postprocessing 2 + XR, with 20 GLB models.

| Tool | Use | Verdict |
|---|---|---|
| **Blender** (offline, scripted with Python) | Asset pipeline: clean, decimate, bake lighting, Draco/meshopt compression of the 20 GLBs → faster 3D loads; batch-produce module variants | **Yes, Jan.** Not on the critical path for beta. Chat 3 owns it |
| `gltf-transform` CLI | Compress and validate GLBs without Blender (minutes, €0) | **Yes, W49**: quick win for load time |
| postprocessing 2 → 3 | Better image quality (AO, SMAA), already in backlog | W50 with MAIN's B15 |
| Gaussian splats | Photoreal scans of *built* houses (the investor feedback: "show real houses") | After the first built pilot (Cornetu) |
| Unreal / Twinmotion | Marketing films | No: cost and a second pipeline |

---

## 6. Modularity and resilience rules (apply from this sprint)

1. **Each feature fails alone**: React error boundary per wizard step and per panel (3D, render, consultant). One crash must not blank the app.
2. **Each provider is behind a registry with a fallback order and a kill switch** (engines already; consultant gets the same in N1).
3. **Health per module** in `/api/health`: auth, db, stripe, each AI provider, and the KB index (fails if a `.new.md` is in it).
4. **Sentry tags per feature** (`feature: wizard|render|consultant|billing`), so an error points to the owning chat directly.
5. **Contracts between modules** (typed inputs like `PermitProjectInput`) plus a grep check that a module imports nothing it shouldn't.
6. **Every bug gets one owner chat**: `BUG-xx | flow | steps | owner | severity`. Fixes happen in that chat's paths only.
7. **Small deploys**: one feature per push, `ops:check` before, smoke test after.

---

## 7. Open questions for Costin

1. Go on this plan as written? (If yes, MAIN starts N1, E1 and B1 today.)
2. Full account: do you run the SQL line, or does MAIN run it with the service key?
3. Is the admin page email in `src/app/admin/page.tsx` your account? If not, which email should be admin? (MAIN will move it to an env var.)
