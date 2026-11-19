# MCA-HANDOFF-2-NEUFERTAI-2026-11-19

**From**: Chat 3 (AI Engines & Rendering)
**To**: Chat 2 NeufertAI (consultant text / legal / CATUC domain)
**Date**: 2026-11-19
**Status**: 3 items for your action — 1 small, 1 medium, 1 strategic

---

## 1. Context — what Chat 3 already did for you

NeufertAI consultant route is **healthy on prod** after today's fixes:

- `src/app/api/consultant/route.ts` — Anthropic model migrated from
  `claude-sonnet-4-20250514` to `claude-sonnet-5-5` (MCA-P1-T19).
- Same file — Groq model migrated from `llama-3.3-70b-versatile` (dead)
  to `openai/gpt-oss-120b` (confirmed live). **Without this fix,
  NeufertAI fallback on Groq returned 404 silently.**
- Fallback chain for architect tier verified clean:
  `[anthropic, openai, groq, pollinations]`. Together.ai already removed
  (B14).

These were Chat-3 scope because they were engine-level config. Future
model-ID changes in `consultant/route.ts` are **your call**.

---

## 2. Three handoff items

### ITEM-1 (small, ~5 min) — U2: swap OpenAI consultant model to gpt-5.1-mini

Currently `ALL_PROVIDERS.openai.model = "gpt-4o-mini"` (lines 429, 436).

GPT-5.1-mini was released Oct 2026, same price tier as gpt-4o-mini
($0.25/1M in), but materially better reasoning for CATUC complex queries.

**Changes**:
1. `src/app/api/consultant/route.ts` line 429: `model: "gpt-5.1-mini"`
2. `src/app/api/consultant/route.ts` line 436: same
3. `src/app/api/health/route.ts` line 26: `model: "gpt-5.1-mini"` (display label)

**Smoke test** after:
```bash
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5.1-mini","messages":[{"role":"user","content":"ping"}],"max_tokens":5}'
```

If HTTP 200, commit + push. If 404 (not released yet on our account),
revert to `gpt-4o-mini` and track for later.

### ITEM-2 (medium, ~2-4h) — CATUC translate stub (Phase 2 kickoff)

Per `docs/MCA-DOC-AI-LANDSCAPE-2026-11.md §3.3`, Phase 2 begins once
you're ready to translate CATUC 169/2026 (1.25 MB legal text) into
user-facing explanations.

**Recommended route**:

Create `src/app/api/catuc-translate/route.ts` with provider fallback:
1. **Gemini 2.5 Flash** (free, 2M context — fits entire CATUC in one call)
2. **Groq GPT-OSS 120B** (free, ~30 req/min — good for chunked processing)
3. **DeepSeek V3-Coder** (escalation, $0.14/1M in — only when user opts-in,
   because current DeepSeek balance is $0 and needs $5 top-up)

The key `DEEPSEEK_API_KEY` is already saved locally but **NOT on Vercel**
until the balance top-up — Chat-4 (Prices/Accounts) tracks that gate.

Input body: `{ paragraph: string, lang?: "ro" | "en", tone?: "formal" | "plain" }`
Output body: `{ translated: string, sourceSection?: string, warnings?: string[] }`

Store NO user text in logs — CATUC content is public law, but user
rewrites might be sensitive. Use the existing `devLog` pattern.

### ITEM-3 (strategic) — NotebookLM workflow for CATUC Q&A
Per MCA strategy, NotebookLM is the chosen tool for long-document synthesis
(1.25 MB CATUC > any model's useful context for Q&A).

**Workflow to document in your chat**:
1. Costin uploads `CATUC _ Clarificari.pdf` to notebooklm.google.com (free)
2. NotebookLM produces per-section Q&A summaries
3. Those summaries get embedded into our vector KB (`src/knowledge/`) via
   `scripts/build-knowledge.mjs` — path already exists for `src/knowledge/06-regulations/RO/`
4. NeufertAI retrieves from that KB for routine CATUC questions, uses
   live LLM only for complex multi-section reasoning

**Not Chat-3 scope** but mentioned here because it affects which provider
in the fallback chain gets called most often (if NotebookLM pre-processes
80% of CATUC queries into KB chunks, Anthropic Sonnet 5.5 becomes rare
usage and billing stays near zero).

---

## 3. What I DON'T recommend moving forward

- **Do not switch Anthropic model** again before Beta. Sonnet 5.5 is current
  and the ANTHROPIC_API_KEY you have access to supports it (verified by
  Chat-3 model-check script 2026-11-19).
- **Do not add a 5th provider** to the consultant chain. 4 is already
  redundancy enough. Each add = more surface area to maintain.
- **Do not put NotebookLM work inside ModulCA** — it's a free Google tool
  for costin's manual pipeline. Automating "upload to NotebookLM" via API
  isn't publicly supported and would cost us engineering time.

---

## 4. Response expected

Minimal. When you finish ITEM-1 (gpt-5.1-mini swap), commit will show in
git log and Chat 3's weekly engines-model-check will verify it stays live.

For ITEM-2 (CATUC stub), ping Chat 4 (Prices/Accounts) if you need the
DeepSeek top-up gate resolved — DO NOT top-up unilaterally; it's a budget
decision that belongs to Chat 4.

For ITEM-3 (NotebookLM), the workflow lives in your scope — Chat 3 just
needs to know the final retrieval volume per provider so the credit
manager bands (U9 in extended survey) are correctly sized.
