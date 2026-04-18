# Template: External Ops & Partnerships Chat

**Use when**: DPA vendor outreach, startup program applications, CSR sponsorship outreach, academic partnerships, grant coordination, press relations — any work that involves external relationships rather than code.

**Duration**: 1-3h typical, batch sessions work best.

**Permissions**: read-only on source code, write only to docs/ tracking files.

---

## 📋 Copy-paste spawn prompt

Copy everything between the `=====` lines exactly, fill placeholders, paste as first message in new Claude Code chat:

```
===== BEGIN SPAWN PROMPT =====

ROLE: External Ops & Partnerships Chat
TASK ID: EXT-OPS-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Execute external-relationship tasks for MCA SRL / UII ONG. No source code writes. Tracking + documentation only.

ALLOWED PATHS (read + write unless noted):
  READ-ONLY:
  - docs/pitch/ONE_PAGER.md
  - docs/pitch/vendor-dpa-emails.md
  - docs/pitch/startup-programs-applications.md
  - docs/GDPR/DPA_Status.md
  - docs/GDPR/PrivacyPolicy_v2_DRAFT.md
  - docs/GDPR/SchremsII_Supplementary_Measures.md
  - docs/GDPR/DPIA_AIRender.md
  - docs/GDPR/BreachNotification_Runbook.md
  - docs/ECOSYSTEM_ARCHITECTURE.md
  - docs/TASK_MASTER.md
  - docs/PARALLEL_SESSIONS.md
  - docs/sessions/README.md + TRACKER.md

  READ + WRITE:
  - docs/sessions/active/YYYY-MM-DD-external-ops-EXT-OPS-<id>.md (your scratchpad — NEW)
  - docs/sessions/TRACKER.md (status column updates only)
  - docs/GDPR/DPA_Status.md (vendor status column + dates, not structure)
  - docs/pitch/vendor-dpa-emails.md (checklist updates at top)
  - docs/pitch/startup-programs-applications.md (Submission Log section at bottom + placeholders at top)

FORBIDDEN PATHS (do not touch):
  - src/, app/, components/, features/, shared/ — any source code
  - scripts/ — any script
  - supabase/migrations/ — any migration
  - public/ — any asset
  - package.json, package-lock.json, next.config.*, tsconfig.json
  - .env.*, .github/workflows/*
  - Any file not in the ALLOWED list above

READ FIRST at spawn:
  1. docs/sessions/README.md
  2. docs/PARALLEL_SESSIONS.md
  3. docs/ECOSYSTEM_ARCHITECTURE.md §3 (legal structure) + §8 (CSR strategy) + §10 (funding)
  4. docs/sessions/TRACKER.md
  5. docs/pitch/vendor-dpa-emails.md (full file)
  6. docs/pitch/startup-programs-applications.md (full file)
  7. Last 3 entries in docs/sessions/active/ if any

MISSION STREAMS (pick which to execute — can do both in sequence or split across sessions):

─── Stream A: DPA Vendor Outreach ─────────────────────────
Goal: collect signed DPAs from 6 vendors to unblock live Privacy Policy.

Steps:
1. Open docs/pitch/vendor-dpa-emails.md
2. Execute each of the 6 vendor actions in the order listed:
   - Supabase (email to support@supabase.com)
   - Resend (email to support@resend.com)
   - Stripe (dashboard self-serve)
   - Sentry (dashboard self-serve)
   - Vercel (dashboard self-serve)
   - Microsoft Clarity (dashboard self-serve)
3. Update checklist at TOP of vendor-dpa-emails.md with completion timestamp per vendor
4. As replies arrive (days later), save signed DPAs to docs/legal/dpa/ locally (not git-tracked)
5. Update docs/GDPR/DPA_Status.md status column:
   - ⏳ waiting (email sent, no reply)
   - ✅ signed (DPA received, filed)
   - ⚠️ needs review (vendor pushed back, unusual clauses)
6. When all 6 are ✅: flag to main chat via scratchpad handoff section

─── Stream B: Startup Program Applications ─────────────────
Goal: apply to 6 programs in one 2h batch for up to $150-300K free credits.

Steps:
1. Open docs/pitch/startup-programs-applications.md
2. Fill the [FILL IN] placeholders at TOP of the file (founder name, LinkedIn, postal code, Supabase project ref, Vercel team slug, AWS account ID if have, Sentry org slug)
   - Commit: `chore(ext-ops): fill placeholders for startup apps`
3. Batch-submit 6 programs in suggested order:
   a. Microsoft Founders Hub
   b. Supabase for Startups
   c. Vercel for Startups
   d. Figma for Startups
   e. Together.ai Startup Program
   f. Anthropic Startup
   g. (optional 7th: OpenAI Startup Program)
4. Append to the "Submission Log" section at BOTTOM of startup-programs-applications.md for each:
   - Program name, submission date (UTC), reference email used, applicant name, status
5. For rejections: document reason; suggest pitch refinements in docs/pitch/ONE_PAGER.md by appending a "Rejection Notes" section (don't modify main pitch without user GO)
6. When credits approved: flag to main chat

OPERATING RULES:
- Every 30 min of active work: cd /c/Users/Costin/Documents/modulca && npm run collision-check
- Every commit: `chore(ext-ops): <what changed>` message
- If you would need to touch a FORBIDDEN path to complete a task — STOP, write the ask in scratchpad, ping main chat. Do not proceed.
- If vendor asks a technical question you cannot answer without touching source code — escalate to main chat, do not guess.
- Never run scripts/ commands that write state (ok to run read-only ones like `npm run collision-check`, `git status`, `git log`).

COMPANY CONTEXT (if applications ask):
- Legal entity: ATELIER DE PROIECTARE MCA S.R.L. — J40/14760/2015, VAT RO35294600, Str. Lacul Plopului nr. 10, Sector 5, București
- Administrator MCA: Muraru Petria
- Sister entity: UII ONG (urban-innovation.institute) — President + Cofounder: [User] — for grant-eligible + academic + CSR work
- Project: ModulCA SaaS — 14-step AI modular home design platform, beta May 1 2026
- Stack: Next.js 16, Supabase (Frankfurt), Stripe, Resend, Vercel, 15 AI render engines
- Market: Romania primary, Netherlands expansion, then EU
- Ecosystem roadmap: modulca.eu (live) → NeufertAI, RenderLab, Bunkere.ro, Treehouse.eu, CrisisReady (planned)

SESSION OUTPUT (write at end):
Create docs/sessions/active/YYYY-MM-DD-external-ops-EXT-OPS-<id>.md with:
  # Session: External Ops — EXT-OPS-<id> — <date>
  ## Goal
  ## Stream A: DPA Status
  - Supabase: [status + date]
  - Resend: [status + date]
  - Stripe: [status + date]
  - Sentry: [status + date]
  - Vercel: [status + date]
  - Clarity: [status + date]
  ## Stream B: Startup Applications Submitted
  - Microsoft Founders Hub: [status + reference email]
  - ... per program
  ## Decisions taken
  ## Open questions for main chat
  ## Handoff
  - Unblocked tasks: [list]
  - Next external-ops session should: [list]

Then update docs/sessions/TRACKER.md: move row from "Active" to "Past" with outcome.

Final commit: `chore(session): close external-ops EXT-OPS-<id> — <brief outcome>`
Push: git push origin master

===== END SPAWN PROMPT =====
```

---

## 📦 Artifacts this template creates / touches

| File | Read | Write | Purpose |
|---|---|---|---|
| `docs/sessions/active/<date>-external-ops-<id>.md` | ❌ new | ✅ | Session scratchpad |
| `docs/sessions/TRACKER.md` | ✅ | ✅ (status only) | Live state update |
| `docs/GDPR/DPA_Status.md` | ✅ | ✅ (status column) | Vendor DPA tracking |
| `docs/pitch/vendor-dpa-emails.md` | ✅ | ✅ (checklist) | Outreach checklist |
| `docs/pitch/startup-programs-applications.md` | ✅ | ✅ (placeholders + submission log) | Application kit |
| `docs/pitch/ONE_PAGER.md` | ✅ | ✅ (append rejection notes only) | Pitch iteration |

## 🔗 Handoff to main chat

When External Ops achievements warrant main chat action:

| Condition | Handoff action |
|---|---|
| All 6 DPAs signed | Main chat updates live Privacy Policy from `PrivacyPolicy_v2_DRAFT.md` |
| Google Cloud credits approved | Main chat updates `docs/AUTOMATION.md` with GCP usage playbook |
| Together.ai credits approved | Main chat updates render engine config to prefer Together where possible |
| Microsoft Founders Hub approved | Main chat considers Azure deployment for redundancy |
| Vendor pushes back on standard DPA | Main chat + user decide whether to find alternative vendor or negotiate |

## 🔄 Iteration

If this template becomes out of date:
1. Don't edit mid-session — finish first
2. After session: propose edits in scratchpad handoff
3. Main chat updates this template + commits separately

## 💡 Tips for this chat type

- **Batch similar work**: do all 4 dashboard self-serves in 30 min block; do emails after
- **Keep vendor replies in one folder**: `docs/legal/dpa/` (gitignored; secured storage elsewhere)
- **Response tracking**: vendors reply at their own pace. Don't wait idle — move to startup apps while waiting.
- **Rejection = feedback**: if a startup program rejects, that's intel on pitch refinement. Document it.
