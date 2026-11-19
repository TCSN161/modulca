# MCA-HANDOFF-1-MAIN-2026-11-19

**From**: Chat 3 (AI Engines & Rendering)
**To**: Chat 1 MAIN (general orchestration)
**Date**: 2026-11-19
**Status**: FYI + 2 items for your action
**Priority**: Medium — nothing blocks ModulCA launch Feb 1 2027

---

## 1. Status snapshot from Chat 3

All work in the render/visual scope is CURRENT and HEALTHY as of today:

- ✅ **MCA-P1-T19 deployed**: NeufertAI uses Claude Sonnet 5.5 (was `claude-sonnet-4-20250514`). Commit `2cfae40`, live on Vercel.
- ✅ **Critical Groq bug fixed**: `llama-3.3-70b-versatile` → `openai/gpt-oss-120b` (the old model returned 404 = silent NeufertAI fallback breakage). Commit `b8a6c20`.
- ✅ **19 render engines inventoried + mapped to pricing bands**: see `docs/MCA-DOC-AI-ENGINES-EXTENDED-2026-11.md`.
- ✅ **2 cron GitHub Actions active**:
  - Mon 08:00 UTC — billing audit (`engines-audit.yml`)
  - Sun 07:00 UTC — model freshness check (`engines-model-check.yml`)
- ✅ **Nano Banana 2.1 upgrade** (U6) applied — next deploy ships it.
- ✅ **LTX Video engine scaffold** added as `src/app/api/ai-render/engines/ltxVideo.ts`. NOT registered in the fallback chain yet — reserved for Phase 3 walkthrough animation feature.

Nothing in Chat 3's scope blocks Beta launch (Dec 15 invite-only).

---

## 2. Items that need MAIN chat attention

### ITEM-1 — MCA-DOC-BLOCKERS-2026-11-19 top-3 review
I referenced this doc multiple times but you're the owner of orchestration. Please do a top-3 blocker read and decide:
- Which blockers can be unblocked by cross-chat coordination now?
- Which require costin's manual action?
- Which can be deferred post-Beta?

Report back with any that touch render engines or visual pipeline — I'll pick them up here.

### ITEM-2 — GitHub Actions secrets configuration
The two new cron workflows need these repo secrets to work in CI:

```
GROQ_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
DEEPSEEK_API_KEY
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Values are already in `.env.local` (copy-paste from there). Path: github.com/TCSN161/modulca → Settings → Secrets and variables → Actions → New repository secret.

This is a 3-minute user task best triaged from MAIN since it's generic infra, not render-specific. Can you ask costin next time he's near the GitHub UI?

---

## 3. For your awareness — not actionable here

- **Chat 2 NeufertAI** has a handoff doc waiting (`MCA-HANDOFF-2-NEUFERTAI-2026-11-19.md`) about upgrading OpenAI provider from `gpt-4o-mini` to `gpt-5.1-mini` and about the CATUC translate stub.
- **Chat 4 Prices/Accounts** has a handoff doc (`MCA-HANDOFF-4-PRICES-ACCOUNTS-2026-11-19.md`) about U9 credit-manager bands sync, WaveSpeed/Novita/DeepSeek signup workflow, and the 5-tier pricing structure from the extended survey.
- **Chat 5 Technical Drawings**: nothing from this batch applies to it.

Please poke those chats if you can — the sooner they consume their handoffs the sooner Chat 3 can activate dependent features (e.g., WaveSpeed/Novita engines light up on first real-key paste).

---

## 4. Response expected

Minimal — I'll poll this doc's acknowledgment commit by watching for a MAIN-chat commit that references it. If MAIN wants me to take on render-related work surfaced from ITEM-1 blockers, drop a line in `docs/handoffs/MCA-HANDOFF-3-ENGINES-2026-11-19.md` (I'll check next session).

No weekly ritual needed — the two cron workflows already push issues to the repo for any engine deprecation / billing anomaly.
