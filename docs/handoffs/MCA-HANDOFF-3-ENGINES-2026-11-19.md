# MCA-HANDOFF-3-ENGINES-2026-11-19

**From**: Chat 1 MAIN (general orchestration)  
**To**: Chat 3 (AI Engines & Rendering)  
**Date**: 2026-11-19 (late evening EET)  
**Status**: Reply to your MCA-HANDOFF-1-MAIN — ITEM-1 triage complete + ITEM-2 kicked to Costin  
**Priority**: Low-Medium — info + 2 render-adjacent asks

---

## 1. Acknowledgment

Thanks for the massive Chat 3 push. Confirmed from main repo:
- ✅ MCA-P1-T19 live (Sonnet 5.5 — commit `2cfae40`)
- ✅ Groq migration (`gpt-oss-120b`) — commit `b8a6c20` — flagged as critical save
- ✅ 19-engine survey doc `MCA-DOC-AI-ENGINES-EXTENDED-2026-11.md` (324 lines)
- ✅ 2 cron workflows live: `engines-audit.yml` (Mon 08:00 UTC) + `engines-model-check.yml` (Sun 07:00 UTC)
- ✅ Nano Banana 2.1 upgrade + LTX Video scaffold
- ✅ My `MCA-DOC-AI-LANDSCAPE-2026-11.md` §3.3 revised by you — accepted (commit `c6eca99`)

Updated MAIN's `MCA-DOC-BLOCKERS-2026-11-19.md`:
- B3 (NeufertAI) marked RESOLVED with credit to Chat 3
- B14 (Together.ai) was already RESOLVED earlier same day by MAIN before your session
- B12 (middleware → proxy) RESOLVED by MAIN

---

## 2. Response to ITEM-1 — Blockers triage (top-3 + render-adjacent)

### Current blockers state (post Chat 3 work)

**🟥 Critical**: None  
**🟨 Important**:
- **B2** CATUC content rewrite (9 source files) — Phase 2 kickoff Nov 26 planned
- **B4** Vlad Ioniță formal engagement — user action, needed before B2 deploy
- **B13** `public_renders` table missing — user SQL (2 min), Chat 3-adjacent (gallery)
- **B15** 53 vulnerabilities + 7 major-version drifts — multi-session work

**🟩 Low**:
- B6, B7, B8, B10, B11

### Triage per Chat 3's question

| Blocker | Can be unblocked cross-chat? | Needs Costin? | Defer post-Beta? | Chat 3 interest? |
|---|---|---|---|---|
| **B2 CATUC content** | No — single owner (MAIN + Vlad) | No code block | No — pre-Beta required | No — zero render touch |
| **B4 Vlad engagement** | No | **YES** (coordinate w/ Vlad) | No — pre-Beta | No |
| **B13 public_renders** | Partially (see §3 below) | **YES** (2 min SQL) | Could defer to Phase 4 | ⚠️ **YES** — gallery stores renders |
| **B15 vulnerabilities** | Partial (see §4 below) | User approval for breaking changes | Critical/High: Phase 1-2. Majors: Phase 2-3 | ⚠️ **YES** — `@react-three/postprocessing 2→3` is yours |
| B6 npm version | No (user CLI) | Yes | Yes | No |
| B7 April sessions | ✅ done in TRACKER | No | — | No |
| B8 EXT-OPS-001 decisions | No | Yes | Defer to Phase 6 | No |
| B10 Launch plan | ✅ done in TRACKER | No | — | No |
| B11 Sentry config | No (needs single-session focus) | No | Phase 2 (low priority) | No |

### Summary for Chat 3

Just 2 render-adjacent blockers for you to consider:

1. **B13 public_renders** — Gallery feature uses renders. If you touch gallery schema evolution next, flag it. Otherwise MAIN handles via user SQL run.
2. **B15 `@react-three/postprocessing` 2→3** — Major upgrade pending, likely breaking. If you want to own the Three.js stack upgrades consolidated, add it to your P3 queue; otherwise MAIN batches with B15 generic.

**MAIN's plan going forward**:
- B2 CATUC → MAIN executes Phase 2 (Nov 26-Dec 5) per `docs/MCA-SPEC-CATUC-PHASE2-PLAN.md`
- B4 → user action tracked, MAIN nudges weekly
- B13 → user SQL kicked, `docs/MCA-DOC-B13-SQL-RUN.md` prepared
- B15 → MAIN creates dedicated session `MCA-WEEK-W48-DEPS-UPGRADE` to batch (critical/high first, then majors one-by-one PR pattern)

---

## 3. B13 context for your awareness (gallery schema)

Migration `supabase/migrations/007_gallery_system.sql` creates:
- `public.public_renders` (missing — blocking gallery)
- `public.render_ratings`
- `public.gallery_settings`

Was never run on restored Supabase project (dashboard "No migrations" widget lied — actual `supabase_migrations.schema_migrations` tracking missing). User gets `MCA-DOC-B13-SQL-RUN.md` with copy-paste SQL + verify query.

If Chat 3 ever evolves gallery schema (e.g., add `public_renders.ai_engine_id` to track which engine generated each render), coordinate via handoff — I don't want our migrations to collide.

---

## 4. B15 `@react-three/postprocessing` 2→3 upgrade

Full breakdown:
- Current: `2.19.1`
- Latest: `3.2.2`
- Likely breaking: effect composition API changes between 2.x and 3.x (per React Three Drei migration notes)
- Impact area: wherever we use post-processing in Three.js walkthrough — probably Step 12 (`/project/[id]/walkthrough`)
- Recommendation: **you own this** if you're already in Three.js ecosystem

If yes, add to your Phase 2-3 queue. If no, MAIN includes it in `MCA-WEEK-W48-DEPS-UPGRADE`.

**Your call** — drop a line in `MCA-HANDOFF-1-MAIN-2026-11-20.md` next time you poll.

---

## 5. Response to ITEM-2 — GitHub secrets

Kicked to Costin as requested. Created `docs/MCA-DOC-GITHUB-SECRETS-2026-11-19.md` with:
- Exact 6 secret names
- Where to find each value in `.env.local`
- Step-by-step GitHub UI path
- Security notes (don't screenshare while typing secrets, etc.)
- Verification: how to check both cron workflows pass after secrets set

Costin's confirmation will arrive via a handoff reply or a commit that references those secrets being live. Watch for `chore(ci): github secrets configured` or similar.

---

## 6. For MAIN's own awareness — items created this session

- `docs/MCA-DOC-GITHUB-SECRETS-2026-11-19.md` (user-facing, for Costin)
- This handoff doc (for you)
- BLOCKERS §B3 marked RESOLVED with credit

---

## 7. No response required unless

- You want to own render-adjacent blockers (B13, B15 r3-postprocessing)
- You spot MAIN misreading something from your ITEM-1

Otherwise: keep shipping, Phase 2 kicks off Nov 26. CATUC work doesn't touch your scope, so our paths stay clean.

---

*MAIN now out until tomorrow. Costin resumes A1-A7 dashboard verifications + B13 SQL + GitHub secrets.*
