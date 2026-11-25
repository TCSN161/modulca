# MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23

**Status**: Living cross-chat backlog from now to the Dec 15 invite-only beta (plus what comes after)
**Owner**: Chat 1 MAIN (update at every Friday wrap)
**Sources**: [[MCA-STRAT-2026-11-19-reboot]] §3 phases · [[MCA-DOC-BLOCKERS-ACTIVE-2026-11-21]] · [[MCA-SPEC-CATUC-PHASE2-PLAN]] · [[MCA-SPEC-CATUC-PHASE3-PLATFORM]] · [[MCA-DOC-PHASE4-BETA-PREP-CHECKLIST]] · [[MCA-SPEC-WALKTHROUGH-VIDEO-2026-11-21]] · all `docs/handoffs/*` (every ITEM there is closed as of today)
**This week in detail**: [[MCA-DOC-WEEK-2026-W48-SCHEDULE]]

---

## 0. Timeline at a glance

| Week | Dates | Phase | Headline |
|---|---|---|---|
| **W48** | Nov 23–29 | 2 CATUC (start Wed 25) | NotebookLM → F2, F3, F4, F6 drafts |
| **W49** | Nov 30–Dec 6 | 2 CATUC (finish Dec 5) → 3 starts Sat Dec 6 | Vlad review, new CATUC chapter, deploy Phase 2 content |
| **W50** | Dec 7–13 | 3 Platform | `/catuc-check`, Profile Engine, PermitTracker PDFs |
| **W51** | Dec 14–20 | 3 → 4 Polish → **Beta Dec 15** | Deploy gate, invites out, monitor |
| **W52** | Dec 21–27 | 4 / holiday pause from Dec 23 | Fix-only |
| Jan | Jan 6–31 | 5 Beta → Go/No-Go Jan 15 → 6 Pre-launch | Feedback, Stripe live, press |
| **Feb 1** | | 7 Public launch | |

---

## 1. Per-chat backlog

Legend: 🔴 gate for a phase · 🟡 should happen in that window · ⚪ later / optional

### Chat 1 — MAIN (orchestration)

| When | Item | Notes |
|---|---|---|
| Tue 24 PM | 🔴 Phase 2 readiness gate + kickoff handoff to Chat 2 | W48 §2 |
| Fri 27 | 🟡 W48 wrap + W49 schedule + update this roadmap | First real Friday ritual |
| **Sun 29** | 🟡 `MCA-LOG-MONTH-2026-11-retrospective.md` | Ritual calendar: last Sunday of month |
| W49 (Wed Dec 2, while Vlad reviews) | 🟡 **B15** 6 vulns: sharp 0.34→0.35 breaking upgrade, dedicated session, needs your OK | Root `package.json` = MAIN path with approval. Bundle `@react-three/postprocessing` 2→3 only if Chat 3 agrees |
| Dec 14 | 🔴 Phase 4 pre-flight: infrastructure gates (ops:check, CI 4/4, secrets, env vars, Sentry) | PHASE4 checklist §1.3 |
| Dec 15 | 🔴 Beta launch-day runbook | PHASE4 checklist §2 |
| ⚪ anytime | B6 npm 11.9 → 11.21 (you, one command) | |

### Chat 2 — Neufert (CATUC content, consultant, legal text)

| When | Item | Notes |
|---|---|---|
| Tue 24 | 🔴 NotebookLM ingest (`catuc-ingest.mjs`) | Session 2.02 |
| Wed 25 | 🔴 F2 building-permit-process | 2.03 |
| Thu 26 | 🔴 F3 modular-prefab-regulations (critical legal) | 2.04 |
| Fri 27 | 🔴 F4 urban-planning-pug-puz + F6 building-permit-romania | 2.05 |
| W49 Mon–Tue | 🔴 New chapter `catuc-169-2026` + Ministry clarifications (needs NotebookLM Q11–Q25) | Last 2 of the "11 .new.md" |
| W49 Nov 28–Dec 3 | 🔴 Apply Vlad's review fixes | Vlad window |
| W49 Thu–Fri Dec 4–5 | 🔴 Promote `.new.md` → live, F8 `_index.ts` regen, deploy | Only after Vlad sign-off (D11 rule) |
| W49 | 🟡 Consultant (NeufertAI) RAG: point answers at the new CATUC content; smoke test 10 CATUC questions | |
| W50 Dec 6–10 | 🔴 Phase 3: `/catuc-check` checker logic + tests + route; Profile Engine | Owner decided 2026-11-23, see §3 Q1 |
| W50 | 🟡 Privacy Policy + ToS beta clause ("preview product, no SLA") | Owner decided 2026-11-23, see §3 Q2 |

### Chat 3 — Engines (renders, video, 3D)

Nothing blocking this week. Everything ITEM-wise in its handoffs is closed.

| When | Item | Notes |
|---|---|---|
| W49 | 🟡 Beta render readiness audit: which engines work on free tiers, daily quota per beta user, fallback order, what a beta user sees when quota is hit | 10–20 users × N renders must fit €0 extra |
| W50 | 🟡 Walkthrough video v0: record canvas while AutoTour plays (spec ready, no AI, €0) | MCA-SPEC-WALKTHROUGH-VIDEO |
| W50 | ⚪ `@react-three/postprocessing` 2→3 (coordinate with MAIN B15) | |
| Jan | ⚪ LTX video scaffold → wire-up; Novita top-up only with revenue (B16) | |

### Chat 4 — Billing (tiers, credits, Stripe)

| When | Item | Notes |
|---|---|---|
| **Tue 24** | 🔴 **DeepSeek $5 top-up** (you, 2 min) — Phase 2 uses it for translation on Wed 25 | Fits €12 headroom. Without it, Claude does translation (more Claude tokens) |
| W50 | 🔴 Beta promo path: invite user signs up → gets Premium for 3 months → credits/quotas correct → downgrade logic dated | Test end-to-end in Stripe TEST mode |
| W50 | 🟡 Beta-specific onboarding: "BETA" badge + feedback widget | Owner decided 2026-11-23, see §3 Q3 |
| Jan 16–31 | 🔴 Stripe test → live cutover (`docs/STRIPE_GO_LIVE_CHECKLIST.md`), CUI/bank details | Phase 6 |

### Chat 5 — Drawings (technical docs, PDF/DWG)

Not opened yet. First real work is Phase 3.

| When | Item | Notes |
|---|---|---|
| W49 | 🟡 First session (5.01): read-only audit of existing export/PDF code (`src/features/output`, presentation) → write `MCA-SPEC-PERMITTRACKER-PDF.md` | ~1–2h, prepares Phase 3 |
| W50 Dec 11–12 | 🔴 PermitTracker v0: 3 PDF templates (notification package, art. 294) + zip/download | Owner decided 2026-11-23, see §3 Q1 |
| Dec 11 → 13 | 🔴 Send PDFs to Vlad Dec 11, sign-off by Dec 13 | Phase 3 risk table |
| Jan+ | ⚪ DWG export v0 | |

### Chat 7 — Partners (Vlad, DPAs, cohort, press)

| When | Item | Notes |
|---|---|---|
| Mon 23 | 🔴 Vlad email (you) | B4 |
| On reply | 🔴 Engagement agreement: scope, fee, signing rules, review SLAs, whether his name goes on `/about` | Must be signed before Dec 15 (PHASE4 §1.4) |
| W49 | 🔴 **DPA outreach** to Supabase, Resend, Sentry, Vercel (drafts exist since April, B8) | Moved earlier than "Phase 6": the Phase 4 checklist makes GDPR DPAs a **beta gate** |
| by Dec 10 | 🔴 Beta cohort list 10–20 people (your network + Vlad's recommendations) + invite email template | PHASE4 §1.5 |
| Jan | ⚪ 3 journalists, press kit, Cornetu story; startup program applications (optional) | Phase 6 |

---

## 2. Your own actions (Costin), in date order

| When | Action | Time |
|---|---|---|
| Mon 23 | Send Vlad email | 30 min |
| Tue 24 AM | NotebookLM Q1–Q10 | 1–1.5h |
| Tue 24 | DeepSeek $5 top-up (or tell MAIN "no") | 2 min |
| Wed 25–Fri 27 | Read F2 / F3 / F4+F6 drafts (sense check, not legal review) | ~30 min/day |
| Sun 29 | Optional: 10 min input for the monthly retro | 10 min |
| W49 Mon | NotebookLM Q11–Q25 (same notebook, already set up) | ~1h |
| W49 | Send DPA emails (Chat 7 prepares them) | 20 min |
| W49 Wed | Approve B15 breaking upgrade | 1 min |
| by Dec 10 | Beta invite list (names + emails, in a private file, not committed) | 1h |
| Dec 11–13 | Chase Vlad for PDF sign-off if needed | — |
| Dec 15 | Send invites | 30 min |

---

## 3. Ownership decisions (accepted by Costin 2026-11-23)

1. ✅ **Phase 3 code**: Chat 2 Neufert owns `/catuc-check` + Profile Engine (new path `src/features/catuc/**`, CATUC domain logic); Chat 5 Drawings owns PermitTracker PDFs (`src/features/permits/**`). Both paths added to WORKFLOW §10.
2. ✅ **Privacy Policy / ToS text**: Chat 2 (it owns legal text), Chat 7 checks wording with Vlad if needed.
3. ✅ **Beta badge + feedback widget**: Chat 4 Billing (it already owns tiers and the beta promo). Paths: `src/features/beta/**`, `src/app/api/feedback/**`.
4. ~~**Is Chat 6 needed before beta?** No.~~ → superseded by item 6.
5. ✅ **Phase 3 = detachable module** (Costin, 2026-11-25): `features/catuc` + `features/permits` import nothing from the configurator; standalone input form; lives at modulca.eu `/autorizare`, spin-out only on data. Rules in [[MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25]] §3.
6. ✅ **Chat 6 = Marketing** registered 2026-11-25: communication + content strategy, YouTube / NotebookLM outputs, CATUC service positioning. Beta feedback triage still stays in MAIN.

### Chat 6 — Marketing (new, 2026-11-25)

| When | Item | Notes |
|---|---|---|
| First session | 🟡 Read the strategy doc, answer its §10 open questions with Costin, draft brand voice v0 + content pillars | No posting yet |
| Dec (after Vlad F2/F3) | 🟡 Pilot 3–5 Shorts via NotebookLM "Scurt" video, quality gate §7 | |
| Jan (Phase 6) | 🔴 Channel live, posting rhythm, lead-magnet PDF, quiz | Pre-launch |

---

## 4. Rules for keeping this doc alive

- MAIN updates it at every Friday wrap: tick done items, move slipped items, add new ones.
- Other chats don't edit it. They report through handoffs; MAIN folds them in.
- When a phase closes, its rows move to the phase retrospective in `MCA-LOG-*`.
