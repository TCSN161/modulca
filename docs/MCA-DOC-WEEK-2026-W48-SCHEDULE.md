# Week Plan — W48 (Mon 23 Nov to Sun 29 Nov 2026)

**Written by**: 1.02.MAIN_WeeklyPlan-W48_20261123 (Monday, not Friday — first week of the ritual)
**Phase**: Phase 1 closed (100%). Phase 2 (CATUC content) kicks off **Wed 25 Nov**.
**Inputs**: [[MCA-DOC-STATUS-2026-11-21]] · [[MCA-DOC-WEEKEND-PLAN-2026-11-22]] · [[MCA-DOC-PHASE2-KICKOFF-CHECKLIST]] · [[MCA-SPEC-CATUC-PHASE2-PLAN]]
**Bigger picture (all chats, to Dec 15 beta)**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]]

---

## 0. Date correction (read first)

Earlier docs say "Phase 2 kickoff **Wed 26** Nov". **26 Nov 2026 is a Thursday.** The weekday slip runs through STATUS-2026-11-21 §6, WEEKEND-PLAN, PHASE2-KICKOFF-CHECKLIST and the NAMING doc §4 example (where "Fri 28" is actually Saturday).

**Decision (Costin, 2026-11-23): keep the weekday, move the date → kickoff Wed 25 Nov.**
- Sequence stays as originally intended: Wed F2 → Thu F3 → Fri F4 + F6. Phase 2 content is done before the weekend.
- Vlad's review window (Nov 28 – Dec 3) is unchanged and now gets F2–F6 together.
- Cost: one day less buffer. NotebookLM Q1–Q10 must be ingested by **Tue 24 EOD**.
- Live docs updated to 25 Nov (KICKOFF-CHECKLIST, PHASE2-PLAN, BLOCKERS-ACTIVE). STATUS-2026-11-21 and WEEKEND-PLAN are point-in-time snapshots and stay as written; this doc supersedes their calendars.

---

## 1. Expected sessions

| Day | Chat | Session name | Est. duration | Est. tokens |
|---|---|---|---|---|
| Mon 23 | 1.MAIN | 1.02.MAIN_WeeklyPlan-W48_20261123 (this one; stays open for Vlad + NotebookLM updates) | 30 min | 8k |
| Mon 23 | user | — Vlad email: personalize + send ([template](MCA-DOC-VLAD-EMAIL-TEMPLATE.md)) | 30 min | 0 |
| **Wed 25** | user | — NotebookLM: upload 3 CATUC sources + Q1–Q10 ([queries](research/2026-11-19-notebooklm-catuc-queries.md)) | 1–1.5h | 0 |
| Wed 25 | user | — DeepSeek $5 top-up (Phase 2 translation from Wed 25; or tell MAIN "no") | 2 min | 0 |
| Wed 25 | 2.Neufert | 2.02.Neufert_NotebookLM-Ingest_20261125 | 30 min | 8k |
| ~~Tue 24 PM~~ | 1.MAIN | ~~1.03 Readiness~~ — done early Tue AM in 1.02 | — | 0 |
| **Thu 26** | 2.Neufert | **2.03.Neufert_Phase2-F2-Content_20261126** (kickoff) | 3h | 30k |
| Fri 27 | 2.Neufert | 2.04.Neufert_Phase2-F3-Content_20261127 | 4h | 40k (CRITICAL) |
| Mon 30 (W49) | 2.Neufert | 2.05.Neufert_Phase2-F4-F6-Content_20261130 | 3h | 25k |
| Fri 27 | 1.MAIN | 1.04.MAIN_Week-Wrap-W48_20261127 (W48 wrap + W49 schedule) | 30 min | 8k |
| Sat 28 | — | Buffer only (overflow from F3/F4/F6). Default: rest. | — | 0 |
| Sat 28 → | 7.Partners | Only if Vlad replies: 7.0x.Partners_Vlad-Engagement_{date} | 30 min | 5k |
| Sun 29 | 1.MAIN | 1.05.MAIN_Month-Retro-2026-11_20261129 (last Sunday of month ritual) | 30 min | 8k |

**Total estimated tokens**: ~160k (≈ 103k Neufert, ≈ 22k MAIN, ≈ 5k Partners, rest margin). Weekly budget resets Sat 06:00.

**Inactive this week**: 3.Engines, 4.Billing, 5.Drawings. Open them only for incidents.

### Note on the ingest session's chat
NAMING doc §3 lists the ingest as `1.03.MAIN_NotebookLM-Ingest`. But `scripts/catuc-ingest.mjs` writes to `src/knowledge/06-regulations/**`, which WORKFLOW §10 puts in Neufert's write paths, and WORKFLOW §1 gives the NotebookLM workflow to Neufert. **This plan moves the ingest to Chat 2.** MAIN only checks that the answers JSON exists and runs the Go/No-Go.

---

## 2. Day-by-day detail

### Mon 23 — plan + Vlad outreach
- MAIN: this schedule (done). Stays on standby for two user updates:
  1. **Vlad replied / email sent** → MAIN logs it here (§6) and, if the reply needs follow-up (contract, fee, call), writes `docs/handoffs/MCA-HANDOFF-7-VLAD-ENGAGEMENT-{date}.md` for Chat 7.
  2. **NotebookLM Q1–Q10 done** → MAIN confirms the answers file path and gives the Chat 2 opening prompt (§5).
- User: send Vlad email. Ask him to confirm the **Nov 28 – Dec 3** review window.

### Tue 24 — NotebookLM + readiness gate
- User (morning, if possible): NotebookLM steps 1–7 from WEEKEND-PLAN §B. Save answers as JSON (or paste in chat; MAIN converts to JSON).
- Chat 2: `node scripts/catuc-ingest.mjs <qa.json>` → produces `docs/research/2026-11-24-notebooklm-catuc-answers.md` + populated `catuc-169-2026.new.md`. Commit.
- MAIN (evening): run the "pre-conditions" block of PHASE2-KICKOFF-CHECKLIST (ops:check, workflows, ingest committed, Vlad status). Write `docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md`: F2 → F3 → F4/F6 order, done criteria, which parts go to DeepSeek (translation / boilerplate only — no CATUC legal reasoning).
- **Go** if ingest is committed. **No-Go** → F2 slips to Thu 26, F3 to Fri 27, F4 + F6 to Mon 30.

### Wed 25 — Phase 2 kickoff: F2
- `building-permit-process.new.md`: fill the existing skeleton with the NotebookLM answers. Claude writes the legal text; DeepSeek does EN translation.
- Done = file complete, frontmatter sources updated, tests green, committed.

### Thu 26 — F3 (critical legal)
- `modular-prefab-regulations.new.md`. Every sentence is checked against the CATUC article text; Vlad reviews it in his window.

### Fri 27 — F4 + F6 + week wrap
- F4 `urban-planning-pug-puz` (PUG/PUZ remap) + F6 `building-permit-romania.md` body rewrite.
- Evening MAIN: W48 wrap + `MCA-DOC-WEEK-2026-W49-SCHEDULE.md` (Vlad review loop, fixes from review, F8 index regen after deploy, Phase 2 deploy).

### Sat 28 / Sun 29 — rest
- Vlad review window opens Sat 28 (if confirmed). Review block = F2 + F3 + F4 + F6 + the already-prepped F1/F5/F7/F9/F10.

---

## 3. Priorities

1. **NotebookLM Q1–Q10 ingested by Tue 24 EOD.** Hard gate for F2.
2. **Vlad email sent Mon 23.** Closes B4 sooner; his window starts Sat 28.
3. **F2 → F3 → F4/F6** in that order (F3 is the critical legal one).
4. W49 schedule written on Fri 27 (first real Friday ritual).

---

## 4. Dependencies & risks

| Risk | Trigger | Mitigation |
|---|---|---|
| NotebookLM Q&A not done by Tue 24 | User busy / tool friction | No-Go at Tue gate: F2 Thu 26, F3 Fri 27, F4+F6 Mon 30. No work on F2 without source answers. |
| NotebookLM answers poor quality | Vague or wrong article references | Re-query with exact article numbers; fallback Perplexity (free tier) or Gemini Flash on the PDF. Cross-check every cited article against `catuc-169-2026-articole.json`. |
| Vlad silent by Fri 27 | No reply | Follow-up email Mon 30; backup plan per VLAD-EMAIL-TEMPLATE "If Vlad declines" section. Content is committed but **not deployed** without his review. |
| Vlad window shifts | He proposes other dates | Fine. Content stays undeployed; W49 adapts. Beta 15 Dec has slack. |
| F3 overruns 4h | Legal complexity | Push F4/F6 to Sat 28 buffer or Mon 30; never rush F3. |
| Token budget | F3 heavier than estimated | ~160k is within the weekly allowance; MAIN sessions stay short. |

---

## 5. Paste-ready opening prompts

**Tue 24, Chat 2 (after NotebookLM done):**
> Session: 2.02.Neufert_NotebookLM-Ingest_20261124. Read docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md §9 read-first files, then docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Tue. Run scripts/catuc-ingest.mjs on {path to qa.json}, review output vs catuc-169-2026-articole.json, commit.

**Tue 24 evening, Chat 1:**
> Session: 1.03.MAIN_Phase2-Readiness_20261124. Read §9 files + docs/MCA-DOC-WEEK-2026-W48-SCHEDULE.md §2 Tue. Run the readiness gate and write the Phase 2 kickoff handoff for Chat 2.

**Wed 25, Chat 2:**
> Session: 2.03.Neufert_Phase2-F2-Content_20261125. Read §9 files + docs/handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md. Execute F2.

---

## 6. Live log (updated during the week)

| When | Event |
|---|---|
| Mon 23 | W48 schedule written. Kickoff moved to Wed 25 (Costin). Waiting on: Vlad email (sent? reply?), NotebookLM Q1–Q10. |
| Mon 23 | **Vlad: OK in principle.** Next: 30-min call (questions + fee structure in `handoffs/MCA-HANDOFF-7-VLAD-ENGAGEMENT-2026-11-23.md`), then agreement draft in Chat 7. |
| Tue 24 AM | Readiness gate (infra half) done early by MAIN: ops:check 29/2/0, CI green. Local `.env.local` anon key is the disabled legacy JWT (local auth 401; prod OK). Kickoff handoff written: `handoffs/MCA-HANDOFF-2-PHASE2-KICKOFF-2026-11-24.md` → **evening session 1.03 not needed**. Remaining gate: NotebookLM Q1–Q10 ingested by EOD. |
| Wed 25 | **No-Go applied**: NotebookLM not done Tue → ingest today, F2 Thu 26, F3 Fri 27, F4+F6 Mon 30. Vlad scope (F2, F3, PDFs) still ready for Sat 28 — no impact on his window. |
| Wed 25 PM | NotebookLM Q1–Q10 done (Costin), file `research/2026-11-25-notebooklm-raw.txt`. MAIN spot-check: Q1 verbatim ✅, Q2 → DTAC is now **PAC** (ITEM-6), Q9 order number unverified (ITEM-7). Next: Chat 2 ingest. |
| Wed 25 eve | **Chat 2 ITEM-1 done** (2.02): `research/2026-11-25-notebooklm-catuc-qa.json` → `catuc-ingest.mjs` → `research/2026-11-25-notebooklm-catuc-answers.md` (+ Verification section). All cited CATUC articles exist (0 phantom; 415/524 only in text.md — JSON parser merged them into 414/523). Q1 + Q6 verbatim ✅. **Errata**: Q2 AC validity wrong (law: 3 ani, prelungire valabilitate interzisă, art. 309), Q2 art. 272→**273**, Q9 "24 aug 2026" cut-off not in art. 582. Spec §4 mapping table filled (🟩 except 1 🟨 transitory row + 2 ⚠️ order numbers). |
| Wed 25 eve | **Chat 2 ITEM-6 done**: PAC + one "PAC (fostul DTAC)" line in `building-permit-process.new.md` and `modular-prefab-regulations.new.md`. **For MAIN to route** (outside Chat 2 paths or live/no-`.new.md`): i18n `en/nl/ro.json` (3 each), `PermitTracker.tsx` (2), `consultant/neufertKB.ts` (1), `blog/articles-ro.ts` (8) + `articles.ts` (2) [Chat 2 path but live → F9], live KB `building-permit-process.md` (2), `17-guides/building-permit-romania.md` (3, F6), `17-guides/first-time-builder-checklist.md` (1), `blog-drafts/ro-01` (1), `ro-03` (5, F10), `ro-05` (6); docs: `MCA-DOC-VLAD-EMAIL-TEMPLATE.md` (5), `handoffs/MCA-HANDOFF-7-VLAD-ENGAGEMENT` (6) → Chat 7; `MCA-SPEC-CATUC-PHASE3-PLATFORM.md` (3), `MCA-STRAT-CATUC-SERVICE-CONTENT` (2), `ROADMAP-ALL-CHATS`, `STRAT-DECISIONS`, `STRAT-TOKEN-ECONOMY` (1 each). |
| Wed 25 eve | **Chat 2 ITEM-7 done**: Ord. 1022/2026 (and 975/2026) marked ⚠️ UNVERIFIED / do-not-publish in answers doc, spec §4, chapter draft. FYI: both *are* in `catuc-169-2026-text.md` as Portal Legislativ notes — written **"nr. 1.022"** (dot ⇒ grep "1022" = 0), M.Of. 724/28.08.2026 (on art. 31, 55, 87); Ord. 975 din 25.08.2026, M.Of. 711/26.08.2026 (on art. 262). Strong corroboration; one look on legislatie.just.ro would close it. |
| Wed 25 eve | ⚠️ **For MAIN — drafts are live**: `scripts/build-knowledge.mjs` (prebuild) indexes `.new.md` too → the F2/F3/F4 skeletons are public on modulca.eu (e.g. `/library/building-permit-process` showed "DRAFT SKELETON" + the reviewer's full name). Chat 2 removed the name from all three `.new.md` (push redeploys without it) and parked the ingest chapter stub in `research/2026-11-25-catuc-169-2026-chapter-draft.new.md` instead of `src/knowledge/`. Fix needed (MAIN, `scripts/`): skip `*.new.md` in build-knowledge before F2 content lands Thu 26. Also `catuc-ingest.mjs` hard-codes the reviewer's name in the stub template. |
| Thu 26 | **Chat 2 ITEM-2 done** (2.03): `building-permit-process.new.md` filled — 0 TBD, RO primary + EN (Claude; DeepSeek balance $0.00), every legal line cites CATUC (art. 253–299, 309–313, 367, 575–582), errata applied (AC 3 ani/prelungire interzisă art. 309, art. 273, no 24-aug cut-off), Ord. 975/1022 not named. Skeleton decision table corrected: notification = **rural intravilan only**. `id` → `ro-building-permit` (= live, swap keeps URL). 4 questions for partner architect in file provenance (309(5)/(6)/310(5), metropolitan exclusion in 294(2)(a)(ii), aviz arhitect-șef scope, L.50 transitory). ⚠️ vitest not run: machine out of commit memory (node OOM at startup); build-knowledge OK, draft not indexed. |
| Thu 26 | Local Supabase publishable key fixed (Costin) → ops:check **30 pass / 2 warn / 0 fail** (warn: Stripe TEST by design; tests output unparsed — likely low RAM, same OOM as 2.03). Chat 6 6.01 kickoff done (330449f): brand voice v0 + pillars v0; Costin to reserve @modulca handles. |
| Thu 26 PM | ⚠️ **Prod deploys failed ~4h** (TS2783 duplicate `gridRotation` from a parallel Chat 5 push; fixed by the next commit; latest deploys Ready). Mitigation (approved by Costin, installed): local `.git/hooks/pre-push` runs `tsc --noEmit` when `src/` changes. Also: `/login` removed from sitemap (Search Console noindex warning, 93b242b); `costin.muraru` → comp Constructor. |
| Thu 26 eve | Costin: F2 sense-check OK (no comments yet). Migration 012 verified in SQL Editor (3rd call refused, exceeded=day). Search Console: sitemap submitted (status "Couldn't fetch" right after submit; sitemap serves 200 XML, 240 URLs to Googlebot — recheck Fri), /_next/ unblocked in robots (4328a65), request-indexing on /library + /pricing. |
| Thu 26 | **Chat 4 B1 done**: constructor = full access confirmed (store, canAccess, quotas -1, creditManager bands, consultant architect depth). **Fix**: Stripe webhook now only changes tier for the profile's current `stripe_subscription_id` → stale TEST events can't downgrade comp accounts; `trialing` keeps tier. Comp procedure + `scripts/stripe-comp-account.mjs` (grant/status/revoke) in `MCA-DOC-PRICING-COMP-ACCOUNTS.md`; both Costin accounts normalised. B2 (code review): promo is client-computed, not Stripe → 8 BUG lines (2× **high** security: RLS tier self-grant, server trusts client tier; render ignores beta promo). |
| Thu 26 | **Chat 3 E1+E2 done** (`MCA-DOC-AI-ENGINES-BETA-READINESS-2026-11-26.md`): live test of 11 engines — only **Cloudflare** renders free server-side (fixed: CF schema change); Gemini image free tier = limit 0, HF model deprecated (→ SD3-medium, credits reset Dec 1), Together/fal/replicate/novita/BFL all $0 balance (= €0 guaranteed). Pollinations anon 1 img/45 s/IP → Costin: free `POLLINATIONS_API_KEY`. Quota **5 AI renders/user/day** ≈ CF 10k neurons; needs per-user counter (BUG-E08, Chat 4). `engines-model-check` now lists Anthropic models (free Models API, monthly upgrade report; Sonnet 5.5 = newest ✅) + registry scan (1 leak: `health/route.ts`). 12 BUG-E lines. Spend ≈ $0. |
| Thu 26 | **Chat 2 N1 done** (2.06): consultant Claude path **was broken** (Sonnet 5.5 → 400 "`temperature` is deprecated" → every Architect answer fell back to OpenAI). Now `@anthropic-ai/sdk` (`consultant/anthropic.ts`), model in `consultant/models.ts`, no temperature, effort `low`, `cache_control` on stable tier prompt (RAG/quiz after it), refusal/max_tokens checks, kill switch `CONSULTANT_DISABLE_ANTHROPIC=1`, +2048 max_tokens headroom for thinking (3/5 answers were truncated). Smoke 5 Qs (2 CATUC) all `anthropic`, `cache_read_input_tokens=1196` from call 2. OpenAI/Groq accept temperature 0.7 (no change). ⚠️ RAG doesn't match "CATUC" in questions (no tag) → Q3 answered "no CATUC in library" — follow-up. Spend ≈ $0.20. |
| Thu 26 | **Chat 4 SEC-02 + E08 done** (`MCA-DOC-PRICING-SERVER-TIER.md`): `src/shared/server/serverTier.ts` (`getServerTier(req)` → userId/tier/effectiveTier from verified session + `profiles`, beta promo server-side, guests = hashed IP) + `quota.ts` (`checkAndConsumeQuota` / `refundQuota`, atomic `consume_quota` RPC, migration **012** `usage_quota_counters`). Limits in tier config: beta (=premium) **5 renders/day**, 50/month; consultant 60 msgs/day. 27 new tests, tsc clean. **Costin**: paste `docs/MCA-SQL-012-APPLY.sql`. **MAIN → Chat 3/Chat 2**: wire routes per doc §3/§4 (until then client `tier` still trusted). |
| Thu 26 | **Chat 3 free-engines expansion done** (`MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26.md`): new engine **`cloudflare-klein`** (CF FLUX.2 klein 4B, same free 10k neurons) = **first free img2img that keeps the 3D view** (e2e 6.4 s, $0), first in all img2img chains; AI Horde img2img (last resort) + timeout 75 s (E12); kill switches `AI_ENGINES_DISABLED` / `ENGINE_<ID>_DISABLED`; live check of 26 engine paths (`scripts/engines-live-check.mjs`). ⚠️ OpenAI/Stability/Leonardo/WaveSpeed are **funded** → Costin: `AI_ENGINES_DISABLED=openai,stability,leonardo,wavespeed` until `getServerTier` is wired in ai-render (BUG-E15). Chat 4 added `cloudflare-klein` to `ENGINE_LIMITS`; prod verified (`X-AI-Engine: cloudflare-klein`, $0). Free capacity ≈ 80–158 img2img/day. Spend ≈ $0.005. |
| Thu 26 | **Chat 3 SEC-02/E08 wired in `/api/ai-render`** (eb21bba): tier comes only from `getServerTier` (client `tier` ignored, GET+POST), `checkAndConsumeQuota(render)` → 429 `QUOTA_EXCEEDED`, refund on 503, `maxCostUsd` clamped to the tier, `render_logs.user_id` set. Beta promo (free→premium) gets premium **limits** (5/day) but stays on **€0 engine chains** (`BETA_PAID_ENGINES=1` to change). ⚠️ **Chat 5 (features/design)**: `useRenderEngine.ts` must send `Authorization: Bearer <access_token>` (else every user = guest_free, 2/day) and must not fall back to Pollinations on 429. ⚠️ `/api/ai-render/compare` + `/upscale` have no auth (compare can call funded engines) → keep `AI_ENGINES_DISABLED` until gated. |
| Thu 26 | **Chat 3 BUG-X01 fixed** (b691f8b): presentation, PDF and `useSlideData` read `{productId, quantity}` via Chat 5's `getSelectedProducts()` and resolve through `getProduct()` from `@/assets`; the 3 hardcoded `PRODUCT_CATALOG` copies are gone. 53/53 tests. |
| Thu 26 | **Chat 2 SEC-02 wired** (2.06): `/api/consultant` + `/api/knowledge` + `/api/knowledge/search` read tier only via `getServerTier` (body/query `tier` ignored; `guest_free` = free). Consultant consumes 1 `ai_call` per message (`consultant/quotaGuard.ts`: fail-safe → in-memory tier limits, Sentry warning once/instance; refund on response-cache hit and local-KB fallback). Clients send Bearer (`features/consultant/authHeaders.ts`) in `ConsultantChat.tsx` (429 → server message, no local fallback) and `library/page.tsx` (`&tier=` dropped). Fixed: system prompt now keyed by consultant level (constructor/guest got the free prompt before). **CATUC RAG fix**: diacritics stripped + CATUC/L.169/L.50 aliases → permit tags (`consultant/queryExpansion.ts` + test); CATUC question now pulls `ro-building-permit` + `building-permit-romania`. Live: guest sending `tier:"architect"` → `guest_free`/groq ✅; `consume_quota` RPC answered (no fallback log). tsc 0, vitest 48/48. |
| Thu 26 | **Chat 5 5.01 Design+Drawings** (8723dc0, 59d713f, 2d15359): **BUG-X02** land store persisted to `modulca-land` (polygon, gridCells, mapCenter, zoom, layer, phase; `features/land/persistence.ts`) and saved under `projects.data.land` (+ top-level `gridCells`/`gridRotation` kept). **BUG-X03** `features/design/productSelection.ts` `get/setSelectedProducts()` (shape `{productId, quantity}` unchanged), saved as `projects.data.selectedProducts`. **Express interfaces**: `WizardInput.targetModuleCount`/`bedroomsRequested` honoured by `generateDesign`; `applyToProject({ syncLand })`; land `setPolygon(points)`; `features/design/projectSnapshot.ts` `getProjectSnapshot()` / `applyProjectSnapshot()` / `saveActiveProject(userId, name, id?)` replace the 4 duplicate payloads. tsc 0, vitest 52/52 on touched features. Open for Chat 5: `useRenderEngine.ts` Bearer header + no Pollinations fallback on 429 (from Chat 3 SEC-02 row). |
| Thu 26 | **Chat 3 3.04 compare/upscale gated** (BUG-SEC-02 leftovers): `/api/ai-render/compare` + `/upscale` read the tier only via `getServerTier` (compare `?tier=` = engine-group filter only). Compare consumes **1 render unit per engine, all-or-nothing** (429 before any engine if N > remaining; failed engines refunded); non-paying users (guest/free/beta promo) never reach paid engines → `AI_ENGINES_DISABLED` no longer needed for compare. Upscale/remove-bg = 1 unit, refunded on 503. New `consumeRenderUnits`/`refundRenderUnits` in `engines/renderTier.ts`. vitest ai-render 58/58, tsc 0. ⚠️ **For MAIN to route — callers send no Bearer** (each user = guest_free, 2/day): `features/design/components/render/RenderPage.tsx:623,651` (upscale, Chat 5) and `src/app/admin/engines/page.tsx:105` (compare, unowned path) → add `...(await authHeaders())` from `@/shared/lib/authHeaders` and show the 429 `error`. Open: upscale has no paid-tier gate (doc said "Architect only"). |
| Thu 26 eve | **Chat 2 ITEM-3 + ITEM-5 done** (2.04, pulled forward from Fri 27): `modular-prefab-regulations.new.md` filled — 0 TBD, RO + EN, Claude only, 43 CATUC articles cited, script check vs JSON 0 missing; `id` → `ro-modular-prefab-regulations` (= live). **Corrections**: Legea 10/1995 mostly **abrogated** (art. 576(3)(c)), not in force in parallel; Annex 6 puts P/P+1 houses in **CC1** → art. 440(3) no technical checking (may change F2 §3.2/§4.6). 7 F3 questions + 4 F2 questions + order numbers in `research/2026-11-26-catuc-partner-review-list.md` → **Chat 7 packages for Sat 28**. Draft not indexed (build-knowledge OK). Next: `sessions/NEXT-2.md` (2.05 F4+F6, Mon 30). |
| Thu 26 eve | **Chat 2 2.07 Q11–Q25 + OCR + CATUC chapter**: MDLPA Clarificări transcribed (no local OCR engine; read page images in the browser pane) → `docs/references/catuc/catuc-clarificari-ocr.md`; **Ord. 975/2026 + Ord. 1.022/2026 confirmed** (Portal notes + Clarificări). Q11–Q20 ingested + verified (77 art., 0 missing, 12 errata); Q21–Q25 answered by Claude from the law text (`docs/research/2026-11-26-catuc-answers-q11-q25.md`): **metropolitan exclusion only in art. 294(2)(a)(i), not the house** (Cornetu: notification possible on the text), 309(5)/(6) = start window vs execution period. New `catuc-169-2026.new.md` (RO+EN, 0 missing, 0 TBD); F2 §8 transition updated; spec §4 rows fixed; addendum §5 in partner review list for Sat 28. |
| Thu 26 eve | **1.03 MAIN smoke test (prod, Constructor)** → `MCA-DOC-BETA-SMOKE-TEST.md`: pass F-A, F-C, F-H, F-I; partial F-B, F-E, F-F, F-G; **fail F-D** (0/2 renders, server 503 for constructor). 26 BUG-ST rows (ST23–26 from Costin's PDF); top: ST01 renders (Chat 3), ST06 products lost without explicit Save (Chat 5), ST13 consultant denies CATUC exists (Chat 2), ST14–16 portal 401 / checkout trusts body userId / Constructor can buy Premium (Chat 4). X01 + X02 fixes confirmed. |

---

## 7. Lessons applied (from W47 / Phase 1)

- Front-loading works: 6/10 CATUC files were pre-prepped before kickoff, so Phase 2 starts at ~50%.
- Check weekday ↔ date when writing schedules (the Wed/Thu 26 slip went through 4 docs unnoticed).
- One session per deliverable; specs on disk; no pasting context between chats.
