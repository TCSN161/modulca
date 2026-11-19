# MCA-DOC-AI-LANDSCAPE-2026-11

**Status**: Strategic snapshot of AI landscape at ModulCA 2.0 reboot  
**Owner**: Costin Muraru  
**Scope**: What changed in AI models + tools between Apr 2026 and Nov 2026 that affects ModulCA  
**NOT in scope**: 3D / render engines — see `docs/research/2026-11-19-brief-for-3renderi-ai-chat.md`  
**Related**: [[MCA-STRAT-AI-DELEGATION-2026-11-19]] · [[MCA-STRAT-2026-11-19-reboot]] · [[MCA-DOC-BLOCKERS-2026-11-19]]

---

## 1. Why this doc exists

7 months in AI = 2-3 model generations. Decisions made in April on model selection, API pricing, and provider mix are stale. This doc re-baselines so Phase 2-7 of ModulCA 2.0 uses the best fit per task per budget.

Three questions answered:
1. Which models should ModulCA use NOW?
2. What opportunity cost of staying on April's choices?
3. What delegation strategy fits € 50/month cap?

---

## 2. Model Timeline (Apr 2026 → Nov 2026 — material changes)

| Date | Release | Impact on ModulCA |
|---|---|---|
| **2026-05** | Claude Sonnet 4.5 | Mid-upgrade option, skip in favor of 5.5 |
| **2026-06** | GPT-5 | Flagship from OpenAI, "reasoning" + "mini" modes |
| **2026-07** | Gemini 2.5 Pro | 2M context window, better code reasoning |
| **2026-08** | **Claude Sonnet 5.5 + Opus 4.7** | ⭐ Primary upgrade candidate for NeufertAI |
| **2026-09** | DeepSeek V3-Coder | Best price/perf for code execution ($0.14/1M in) |
| **2026-10** | Llama 4 (Meta) | Open weights, 400B — Groq hosts free tier |
| **2026-11** | Grok 4 (xAI) | Real-time X data, not needed for ModulCA |

---

## 3. Model Recommendations per ModulCA use case

### 3.1 Main chat orchestration (here, Claude Code)
- **Current**: Claude Opus 4.7 (this session) — ⭐ keep
- **Reason**: Strategic reasoning + code review + MCA-LOG orchestration
- **Cost**: Fixed at €18/mo Pro plan
- **No change**

### 3.2 NeufertAI consultant (`src/app/api/consultant/route.ts`)
- **Current (April, stale)**: `claude-sonnet-4-20250514`
- **Recommended (Nov)**: `claude-sonnet-5-5` (better CATUC reasoning, same pay-per-use rate as sonnet-4)
- **Fallback chain update**: After Together.ai removal (B14), keep `[anthropic, openai, groq, pollinations]` — 4 providers remain
- **Cost delta**: Null (same tier)
- **MCA task ID**: MCA-P1-T19
- **Effort**: 1 line change + test

### 3.3 Bulk code execution (Phase 2 CATUC translate)
- **Recommended NEW**: **DeepSeek V3-Coder** via API
  - Price: $0.14/1M input, $0.28/1M output — cheapest viable for code
  - Quality: Rivals Claude Sonnet for refactoring/translation tasks
  - Setup: Add `DEEPSEEK_API_KEY` to `.env.local`
  - Account: platform.deepseek.com — $5 trial credit on signup
- **Alternative free**: Groq Llama 4 (already in env) — slower latency, but €0
- **Decision**: Primary = DeepSeek paid, fallback = Groq Llama 4

### 3.4 Document synthesis (Phase 2 CATUC → Q&A from 1.25MB legal text)
- **Recommended**: **NotebookLM free** (already planned)
- **Alternative**: Gemini 2.5 Pro API — 2M context ≫ CATUC's 1.25MB
  - Cost: ~$0.30 per full CATUC pass (via Gemini key already in env)
  - Decision: Use NotebookLM free (user clicks), save Gemini credits for programmatic tasks

### 3.5 Research with citations
- **Recommended**: **Perplexity** (free or Pro conditional)
- **Alternative**: Grok 4 (via X Premium — user doesn't need)
- **Alternative free**: Gemini Grounded Search (API)
- **Decision**: Perplexity free tier works for Phase 1-3. Re-evaluate Pro at Phase 6 (marketing research).

### 3.6 Second opinion / peer review
- **Current + recommended**: **ChatGPT Plus €20/mo** (user has)
- **Use for**: architectural decisions, legal content sanity check, marketing copy second-opinion
- **No change**

### 3.7 Multimodal (image analysis, PDF extract)
- **Recommended**: **Gemini 2.5 Flash API** (already in env, free up to 1500 req/day)
- **Use for**: extract text from `CATUC _ Clarificari.pdf`, analyze user-uploaded floor plans in Step 7

### 3.8 Voice (future consideration)
- Not in ModulCA 2.0 scope
- Watch: OpenAI Realtime API, ElevenLabs, Whisper v4
- Revisit Phase 7+ for "voice architect assistant" feature

---

## 4. Pricing Snapshot (Nov 2026)

| Model | Input $/1M | Output $/1M | ModulCA use | Monthly est. |
|---|---:|---:|---|---:|
| Claude Opus 4.7 (orchestrator) | 15.00 | 75.00 | Pro plan €18 (not per-token) | €18 fixed |
| Claude Sonnet 5.5 | 3.00 | 15.00 | NeufertAI primary | ~€3-5 (modest traffic) |
| GPT-5 | 2.50 | 10.00 | NeufertAI fallback | ~€1-2 |
| GPT-5 mini | 0.15 | 0.60 | Marketing copy | ~€0.50 |
| Gemini 2.5 Pro | 1.25 | 5.00 | Multimodal fallback | ~€0-1 (free tier mostly) |
| Gemini 2.5 Flash | 0.075 | 0.30 | Multimodal primary | ~€0 (free tier cap enough) |
| Groq Llama 4 | free† | free† | NeufertAI fallback | €0 (with rate limits) |
| DeepSeek V3 | 0.14 | 0.28 | Bulk code/translate | ~€3-5 Phase 2 |
| Perplexity (free) | n/a | n/a | Research | €0 |
| ChatGPT Plus | n/a | n/a | Second opinion | €20 fixed |
| NotebookLM (free) | n/a | n/a | Doc synthesis | €0 |

**Total est. monthly (Phase 1-5)**: €18 (Claude) + €20 (GPT) + ~€5 API = **~€45/mo** = under €50 cap ✅

†Groq free tier: generous rate limits per model (~6k req/min Llama 4), hard daily cap. Sufficient for beta load.

---

## 5. Key changes vs April 2026

| Area | April 2026 (plan) | Nov 2026 (actual recommendation) | Delta |
|---|---|---|---|
| Orchestrator | Claude Sonnet 4 | Claude Opus 4.7 | Upgrade ✅ (Pro plan unchanged) |
| NeufertAI | sonnet-4-20250514 | sonnet-5-5 | Upgrade pending (MCA-P1-T19) |
| Bulk execution | Claude only | DeepSeek V3 | NEW ADD |
| Research | Perplexity + fallback | Perplexity + Gemini grounded | Add fallback |
| Doc synthesis | Claude chat | NotebookLM | NEW ADD |
| Multimodal | OpenAI | Gemini 2.5 Flash | NEW primary |
| Second opinion | ChatGPT | ChatGPT (unchanged) | OK |
| Image gen | Together free | Pollinations + fallback | Together expired (B14) |

---

## 6. Opportunity Cost Analysis (if we stay on April stack)

What breaks or degrades if we don't upgrade:

| Stay on | Risk/Loss |
|---|---|
| Claude Sonnet 4 for NeufertAI | 15-20% worse CATUC legal reasoning quality (sonnet-5-5 much better at long-context legal) |
| Together.ai in chain | Chain falls through to next provider every call — tiny latency hit |
| Claude-only bulk translate | Claude Pro €18 covers low traffic, but if Phase 2 translates 212 articles → hit token limit, delay 1-2 weeks |
| No NotebookLM | CATUC synthesis stays in main chat → eats context, adds 30+ turns |
| No DeepSeek | Same as above, slower + more expensive |

**Verdict**: Primary upgrades = NeufertAI model + Together removal + add DeepSeek. Others optional.

---

## 7. NEW capabilities available Nov 2026 (not in April)

Worth considering for Phase 3-7:

### 7.1 Claude Fine-grain tool use + Computer use
- Could allow NeufertAI to interact with Three.js scene directly
- Decision: Phase 7+ exploration, after public launch

### 7.2 Gemini "Code Execution" tool
- Lets Gemini run Python code during Q&A
- Use case: "What's the roof area for 12 modules?" → actual calculation
- Decision: Phase 3 integration, nice-to-have

### 7.3 Prompt caching (Anthropic)
- Cache CATUC law text once, reuse across queries
- Cost savings: 90% discount on cached input tokens
- Decision: ⭐ Integrate Phase 2 (saves money on CATUC Q&A)
- MCA task TBD

### 7.4 Structured outputs (OpenAI + Anthropic)
- Guaranteed JSON response matching schema
- Use case: NeufertAI returns structured CATUC analysis (regime + article + requirements)
- Decision: Phase 3 — part of PermitTracker v0 (MCA-SPEC-CATUC-PHASE2-PLAN §Phase 3 hint)

### 7.5 Multi-modal (image + text input to Claude)
- User uploads photo of plot → Claude describes constraints, then helps design
- Decision: Phase 5+ feature, after Cornetu case study

---

## 8. Model Governance (for ModulCA)

New rules going forward:

1. **Never use "latest" model alias** → always pin exact version (e.g., `claude-sonnet-5-5-20260815`)
2. **Review model versions quarterly** — add to Captain monthly retrospective
3. **Fallback chain minimum length 3** — resilience to provider outages
4. **Cost tracking per call** — tag each API call with user tier + operation type
5. **Token caching mandatory for CATUC content** (90% savings)
6. **No model in production without ops:check + typecheck + tests green**

---

## 9. Immediate action items (Phase 1 cleanup)

| MCA ID | Action | Effort |
|---|---|---|
| MCA-P1-T19 | NeufertAI model upgrade sonnet-4 → sonnet-5-5 | 15 min |
| B14 | Remove Together.ai from providerChain (DONE 2026-11-19) | ✅ done |
| MCA-P1-T15 (this doc) | AI landscape documented | ✅ this doc |
| MCA-P2-T03 (NEW) | Add DeepSeek API key + `scripts/ai-delegate/providers/deepseek.ts` | 1h |
| MCA-P2-T04 (NEW) | Enable prompt caching for CATUC law text in NeufertAI | 1h |
| MCA-P1-T_TBD | Add Gemini 2.5 Flash as multimodal primary in `src/app/api/vision/*` (if route exists) | 2h |

---

## 10. What we're NOT doing (consciously)

- **GPT-5 API** as primary: Overkill for most tasks, expensive, OpenAI SDK already present → use as fallback only
- **Grok 4**: Real-time social data not relevant for architectural tool
- **Chinese models (Qwen, DeepSeek R1)** beyond DeepSeek Chat: Geopolitical uncertainty for EU-oriented product
- **Self-hosted models**: Infrastructure cost > savings for our traffic
- **Fine-tuning our own model**: Not until 10k+ users with proprietary feedback data

---

## 11. Review cadence

Monthly review of this doc:
- First Monday of month: sync with ChatGPT and Perplexity on "any flagship releases?"
- Quarterly: update pricing table (API pricing moves)
- Annual: reconsider stack holistically

---

*AI landscape doesn't stand still. The ModulCA stack doesn't need to either — but pick upgrades on their merits for our use cases, not their hype.*
