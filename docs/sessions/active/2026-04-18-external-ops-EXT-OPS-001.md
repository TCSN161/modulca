# Session: External Ops — EXT-OPS-001 — 2026-04-18

> **Role**: External Ops & Partnerships Chat
> **Spawned**: 2026-04-18 (EET)
> **Siblings**: Main modulca chat (orchestrator)
> **Branch**: `claude/crazy-wozniak-c27690` (worktree)
> **Purpose of this file**: single source of truth for this session's state; updates on every commit.

---

## Goal

Prepare + coordinate the two external streams ahead of the **2026-05-01 beta launch**:

- **Stream A**: DPA outreach to 6 sub-processors (Supabase, Resend, Stripe, Sentry, Vercel, Microsoft Clarity) to unblock the live Privacy Policy v2.
- **Stream B**: Apply to 6 startup programs (Microsoft Founders Hub, Supabase, Vercel, Figma, Together.ai, Anthropic; optional 7th: OpenAI) to secure cloud + AI credits.

This chat prepares the materials end-to-end. **The user executes the actual sending + form submissions** (the chat has no browser/email access).

---

## ⚠️ PENDING USER INPUT (blocks all outbound traffic)

Until these three items are resolved, the kit contents stay internal — nothing leaves the computer:

| # | Item | Placeholder currently in kit | Where it appears |
|---|---|---|---|
| 1 | **LinkedIn URL** | `LINKEDIN_URL_PENDING` | `docs/pitch/startup-programs-applications.md` master vars (line 17) |
| 2 | **Stripe account ID** (`acct_...`) | `STRIPE_ACCT_ID_PENDING` | `docs/pitch/startup-programs-applications.md` §10 Stripe Climate email body |
| 3 | **Supabase plan decision** | currently **Free** | Supabase for Startups requires **Pro** — upgrade first, or skip from the batch |

When the user replies with #1 + #2, I'll do in-place replacement and commit `chore(ext-ops): fill remaining personalization placeholders`. Decision on #3 shapes the Stream B batch scope.

---

## Canonicalization decisions (commit `48f4b40`)

Applied to both `docs/pitch/vendor-dpa-emails.md` and `docs/pitch/startup-programs-applications.md`:

| Was | Now | Source of truth |
|---|---|---|
| `modulca.ro` | `modulca.eu` | `docs/GDPR/PrivacyPolicy_v2_DRAFT.md` §1; `docs/pitch/ONE_PAGER.md` Contact |
| `dpo@modulca.ro` | `privacy@modulca.eu` | PrivacyPolicy §13 |
| Postal `051704` (kit guess) | `051735` | PrivacyPolicy §1 + user confirm 2026-04-18 |
| `Costin [LAST NAME]` | `Costin Muraru` | User memory `user_costin.md`; confirmed 2026-04-18 |
| `Founder / Administrator` | `Founder & CEO` | Muraru Petria is the SRL Administrator; Costin signs external docs as Founder & CEO |

**Intentional non-changes**:
- `acct_XXX` in `vendor-dpa-emails.md` §2 Stripe fallback subject — this is a break-glass template the user customizes only if the self-serve wizard breaks; baking a real acct ID into a reusable template reduces its value.

---

## Deadline map

| Date | Event | Owner | Impact if missed |
|---|---|---|---|
| 2026-04-25 | Vercel signed DPA archived | User (dashboard click) | Schrems II §6.15 non-compliance flag |
| 2026-04-28 | Conditional AI render engines DPA cutoff (Leonardo, Fireworks, DeepInfra, fal.ai, Prodia) | User (emails, this session scope excludes) | Code-level disable per Schrems II Decision Log §6; fallback engines Pollinations + AI Horde + Cloudflare EU remain |
| 2026-05-01 | Public beta launch | User | Full DPA panel + live Privacy Policy required |

**Pending user decision**: expand Stream A outreach to the 5 conditional AI engines, or accept auto-disable? Default = **accept auto-disable** (fallback coverage adequate; avoids 5 more 3-day email threads). Awaiting confirm.

---

## Stream A — DPA status (6 vendors)

Pulled from `docs/GDPR/DPA_Status.md` rows 1–5 + 7 (Microsoft Clarity). Status icons per mission spec: `⏳ waiting → ✅ signed → ⚠️ needs review`.

| # | Vendor | Channel | Prepared | Sent | Signed/Received | Date | Artifact location |
|---|---|---|---|---|---|---|---|
| 1 | Supabase | email → `support@supabase.com` (cc `privacy@supabase.com`) | ✅ | ⏳ | ⏳ | — | body in `vendor-dpa-emails.md` §1 (lines 33–79) |
| 2 | Resend | email → `support@resend.com` | ✅ | ⏳ | ⏳ | — | body in `vendor-dpa-emails.md` §3 (lines 109–157) |
| 3 | Stripe | dashboard self-serve → `https://dashboard.stripe.com/settings/legal` | ✅ | ⏳ | ⏳ | — | form values in `vendor-dpa-emails.md` §2 (lines 83–106) |
| 4 | Sentry | dashboard self-serve → `https://sentry.io/settings/modulca/legal/` | ✅ | ⏳ | ⏳ | — | form values in `vendor-dpa-emails.md` §4 (lines 161–182) |
| 5 | Vercel | dashboard self-serve → `https://vercel.com/teams/uiiacgsauto-8044s-projects/settings/billing` → Legal | ✅ | ⏳ | ⏳ | — | form values in `vendor-dpa-emails.md` §5 (lines 186–210) |
| 6 | Microsoft Clarity | dashboard config + optional confirmation email | ✅ | ⏳ | ⏳ | — | actions + optional email in `vendor-dpa-emails.md` §6 (lines 214–262) |

Legend: ✅ done · ⏳ pending · ⚠️ needs review.

### Execution order (user)

**Quick batch (~30 min — all dashboard self-serves):**
1. Stripe — click-through + download PDF
2. Sentry — click-through + download PDF
3. Vercel — click-through + download PDF
4. Clarity — configure masking/consent + download Microsoft DPA PDF

**Email batch (~15 min — reply-in-3-days window starts):**
5. Supabase — copy body from `vendor-dpa-emails.md` §1, send from `costin@modulca.eu`
6. Resend — copy body from `vendor-dpa-emails.md` §3, send from `costin@modulca.eu`

### As replies return (next 1–7 days)

For each vendor:
1. Save signed PDF locally at `docs/legal/dpa/DPA-<vendor>-YYYY-MM-DD.pdf` (ungitignored folder, secured storage; outside repo preferred).
2. Ping this chat with `"Vendor X signed YYYY-MM-DD"`; I update:
   - `docs/pitch/vendor-dpa-emails.md` top checklist → `[x] <vendor> — date: YYYY-MM-DD`
   - `docs/GDPR/DPA_Status.md` status column → `✅` (was `🟡`)
3. When all 6 are ✅, I flag main chat via this scratchpad Handoff section → main chat can publish Privacy Policy v2.

---

## Stream B — Startup applications (6 programs + 1 optional)

Order follows the kit's batch plan §"Suggested 2-hour batch plan":

| Order | Program | URL | Kit section | Est. time | Expected outcome |
|---|---|---|---|---|---|
| 1 | Microsoft Founders Hub | https://startups.microsoft.com/signup | `startup-programs-applications.md` §3 | 20 min | Approval 24–72h → $150K Azure + $2.5K OpenAI + M365/GitHub/Stripe Atlas perks |
| 2 | Supabase for Startups | https://supabase.com/startups | §8 | 15 min | Approval days. **⚠️ REQUIRES PRO UPGRADE FIRST** |
| 3 | Vercel for Startups | https://vercel.com/startups | §7 | 15 min | $2.4K+ credits; Pro trial likely |
| 4 | Figma for Startups | https://www.figma.com/community/startup-program | §9 | 15 min | 1 yr Figma Professional for 3 seats |
| 5 | Together.ai Startup Program | https://www.together.ai/forms/startup-program | §4 | 15 min | $5K–$25K inference credits |
| 6 | Anthropic Startup | https://www.anthropic.com/startups | §6 | 20 min | $1K–$25K Claude API credits |
| 7 (optional) | OpenAI Startup Program | https://openai.com/form/startup-program | §5 | 25–30 min | $2.5K API credits base |

**Deferred to a later session** (per user instruction + kit §"Save for a second session"):
- AWS Activate (no existing AWS account; signup flow creates one)
- Google for Startups Cloud (needs partner referral for Scale tier)
- Stripe Climate + outreach email (waits for STRIPE_ACCT_ID_PENDING)

### Per-program answer sheet source

All answers are pre-filled in `docs/pitch/startup-programs-applications.md`:
- Master vars at top (lines 13–33) drive every form.
- Pre-filled table per program (§1–§10) has Field → Answer rows ready to paste.
- After this session's personalization, remaining gaps are only the 2 pending placeholders (LinkedIn, Stripe acct ID) and the Supabase plan decision.

### Submission Log

Appended to the bottom of `docs/pitch/startup-programs-applications.md` (new "## Submission Log" section). Format: `# | Program | Date (UTC) | Applicant | Reference email | Status | Credit | Expiry | Notes`. Currently empty — populated per submission.

---

## Decisions taken this session

1. **Canonicalize to `modulca.eu`** (not `.ro`). Source of truth: PrivacyPolicy v2 DRAFT + ONE_PAGER. Commit `48f4b40`.
2. **Signatory title = "Founder & CEO"** (not "Founder / Administrator"). Rationale: Muraru Petria is SRL Administrator (for ONRC); Costin signs external documents as Founder & CEO per user memory `user_costin.md`.
3. **Postal code = 051735** (kit guess `051704` was wrong). Confirmed by PrivacyPolicy v2 DRAFT §1 + user.
4. **Defer AWS + Google for Startups Cloud + Stripe outreach** to a second batch session. AWS needs account signup first; Google wants a partner referral to unlock Scale tier; Stripe outreach waits for acct ID.
5. **Intentionally keep `acct_XXX` template placeholder** in `vendor-dpa-emails.md` §2 Stripe fallback subject (break-glass path; kit reuse value > pre-filled value).
6. **Focus top 6 DPAs this week**; accept code-level disable on 2026-04-28 for the 5 conditional AI render engines (Leonardo, Fireworks, DeepInfra, fal.ai, Prodia). Fallback engine coverage (Pollinations + AI Horde + Cloudflare EU) is adequate per Schrems II §6 decision matrix. **Pending user confirmation.**

---

## Open questions for main chat

None blocking. Items for main chat to pick up **after this session closes**:

- When all 6 DPAs signed: main chat replaces `⏳` in `PrivacyPolicy_v2_DRAFT.md` §5, swaps draft → live at `src/app/(app)/privacy/page.tsx`, lawyer sign-off, sets `{{EFFECTIVE_DATE}}`.
- When startup credits arrive: main chat updates `docs/AUTOMATION.md` with credit-usage playbook (stacking rules, rotation, limit alarms).
- `docs/legal/dpa/` folder does not exist yet in repo. Main chat decides: keep outside git (secured storage) or inside repo with `.gitignore` entry. Recommend **outside git** (signed DPAs include counterparty names/addresses/signatures = PII).

---

## Handoff

### What's unblocked for the user

- **Right now**: user can drop LinkedIn URL + Stripe acct ID + Supabase Pro-upgrade decision here. I fill placeholders, commit `chore(ext-ops): fill remaining personalization placeholders`, then the kit is 100% send-ready.
- **After that**: user executes the 6 DPA actions (≈45 min total) and 6 startup submissions (≈2h batch per kit §"Suggested 2-hour batch plan"). User reports back here per vendor/program → this chat updates the trackers.

### What's unblocked for main chat

- Nothing yet — zero DPAs signed, zero submissions sent. First unblock fires when all 6 DPAs return ✅.

### Next external-ops session should

- Continue this same session with the 2 remaining placeholders filled and user-reported progress updates, OR spawn `EXT-OPS-002` for the deferred batch (AWS Activate + Google for Startups Cloud + Stripe Climate outreach) after Stripe account gets live-mode keys.

### Blockers requiring user action externally

- LinkedIn URL (user)
- Stripe account ID (user; available from `https://dashboard.stripe.com`)
- Supabase Pro upgrade decision (user)
- Stripe live-mode keys (blocks the Stripe Climate outreach email — separate timeline, bank verification pending)

---

## Artifacts touched (this session, before push)

| Commit | File | Change |
|---|---|---|
| `48f4b40` | `docs/pitch/vendor-dpa-emails.md` | Canonicalize `.ro` → `.eu`, `dpo@` → `privacy@`, postal `051704` → `051735` |
| `48f4b40` | `docs/pitch/startup-programs-applications.md` | Canonicalize `.ro` → `.eu` |
| _(commit 2 — pending)_ | `docs/pitch/vendor-dpa-emails.md` | Personalize signatory name (`Costin Muraru`) + title (`Founder & CEO`) + contact line |
| _(commit 2 — pending)_ | `docs/pitch/startup-programs-applications.md` | Fill placeholders (last name, Vercel slug, Supabase ref, AWS n/a, Supabase plan note, LinkedIn/Stripe acct placeholders flagged) + append Submission Log section |
| _(commit 2 — pending)_ | `docs/sessions/active/2026-04-18-external-ops-EXT-OPS-001.md` | This scratchpad (new) |
| _(commit 3 — pending)_ | `docs/sessions/TRACKER.md` | Move EXT-OPS-001 row from "Next up" to "Active" |

After commit 3, I **pause before push** per user instruction. User confirms → I push.
