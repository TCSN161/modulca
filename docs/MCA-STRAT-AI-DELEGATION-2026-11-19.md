# MCA-STRAT-AI-DELEGATION-2026-11-19

**Status**: Active, v1  
**Owner**: Costin Muraru  
**Scope**: Multi-AI delegation strategy for ModulCA 2.0 under €50/month budget constraint  
**Prev chats referenced**: MCA-DOC-HANDOFF-2026-11-19 (Claude.ai web chat)  
**Related**: [[MCA-DOC-STATUS-2026-11-19]] · [[MCA-STRAT-2026-11-19-reboot]] · `docs/META_SYSTEM.md` · `docs/TOOLS_INTEGRATION.md`

---

## 1. Problem

- Claude Pro plan €18/lună — are limită de tokeni pe săptămână.
- La ModulCA 2.0 avem volum mare de execuție: refactor CATUC content (11 fișiere), 212 KB articole de tradus/updatat, tests, blog drafts, marketing copy, OG images.
- Buget total MAX €50/lună ⇒ nu putem lua Claude Max (€100+/lună).
- **Soluția**: Claude Code (aici) rămâne orchestrator strategic + review critic. Deleg execuție în masă la AI-uri mai ieftine.

---

## 2. Principle — "Claude Orchestrates, Fleet Executes"

```
      ┌──────────────────────────────────────┐
      │  CLAUDE CODE (aici) — Orchestrator   │
      │  • Strategie, decizii, MCA-LOG       │
      │  • Code review critic (api/, auth/)  │
      │  • Legal content review (CATUC)      │
      │  • Final commit + push               │
      └───────────────┬──────────────────────┘
                      │ dispatches to…
      ┌───────────────┴──────────────────────┐
      │                                      │
      ▼                                      ▼
  ┌─────────────────┐              ┌──────────────────┐
  │  EXECUTION      │              │  RESEARCH        │
  │  DeepSeek       │              │  Perplexity      │
  │  Gemini         │              │  NotebookLM      │
  │  Groq           │              │  Grok (future)   │
  │  (optional GPT) │              │  (optional)      │
  └─────────────────┘              └──────────────────┘
```

---

## 3. AI Matrix — Who Does What

| AI | Primary role | Secondary role | Access | Cost | Risk if misused |
|---|---|---|---|---|---|
| **Claude Code (here)** — Opus 4.7 | Strategic coordination, arch, code review, legal review, MCA-LOG | Direct src/ edits for critical paths | Terminal + full repo | €18/lună Pro | Low — all actions visible, user approves |
| **DeepSeek API** — `deepseek-chat` / `deepseek-coder` | Cod în masă (translate articles RO, test boilerplate, refactor repetitiv, scheletă marketing copy) | Code review secundar | API via .env `DEEPSEEK_API_KEY` | ~$0.14 / 1M tokens input, $0.28 output (CHEAPEST) | Medium — review-uiesc toate PR-urile înainte de merge |
| **ChatGPT Plus (€20)** | Second opinion pentru decizii arhitecturale, code review alternativ | Docs long-form (plan documents, pitch deck) | ChatGPT web (login activ) | €20/lună (deja plătit) | Low — doar text, nu touch repo |
| **GPT API (OpenAI)** | Deja în providerChain NeufertAI (fallback 1) | Image generation (DALL-E 3 pentru OG) | API via `.env.local` `OPENAI_API_KEY` | Pay-per-use (~$0.001/req) | Low — scoped la NeufertAI |
| **Gemini 2.5 Flash (API)** | Multimodal: process PDF-ul CATUC, extract text din floor plans, bulk doc analysis | Fallback NeufertAI | API via `.env.local` `GEMINI_API_KEY` | **Free** up to 1500 req/day | Low |
| **Gemini Pro (via chat)** | Research cu context window larg, document synthesis | — | gemini.google.com (login) | Free | Low |
| **NotebookLM** | Document synthesis — CATUC law (1.25MB!), CATUC clarificări PDF, DPA docs | Podcast-style explainer pentru CATUC | notebooklm.google.com (login) | **Free** (nu trebuie Plus) | Low — doar read-only pe docs upload |
| **Groq** — `llama-3.3-70b` | NeufertAI tier gratuit (latency-critical) | Backup bulk translation | API via `.env.local` `GROQ_API_KEY` | **Free** up to limits | Low |
| **Perplexity Pro/Free** | Research cu citations — validare CATUC vs surse multiple, market intel, trend scan | Legal precedents | Web (login activ) | €18/lună Pro OR free tier | Low — read-only |
| **Claude Design** | UI mockups pentru PermitTracker v0, Step 14 polish | Component redesign preview | claude.ai/design | Inclus în Claude Pro | Low |

---

## 4. Delegation Rules — "What Where Why"

### ✅ SAFE să deleg (zero security risk)

| Task | Primary AI | Pattern |
|---|---|---|
| Translate articole knowledge RO→EN | DeepSeek | Claude prepares prompt + source → user paste în DeepSeek chat sau API call → Claude reviews output → commit |
| Refactoring repetitiv (schemă clară) | DeepSeek or ChatGPT | Claude writes spec in `docs/specs/` → delegate → review diff |
| Test boilerplate (Playwright E2E setup) | DeepSeek | Claude pastes test spec + example → execute → Claude reviews |
| OG images (Open Graph social cards) | DALL-E 3 via GPT API | Claude generates prompt list → execute via script |
| Marketing copy drafts | ChatGPT Plus | Claude writes brief → user paste → Claude edits final |
| PDF/doc synthesis (CATUC, DPA replies) | NotebookLM | User uploads doc → NotebookLM creates summary → paste back to Claude |
| Market research cu citations | Perplexity | Claude writes research question → user paste → return snippet to Claude |
| Floor plan text extraction | Gemini 2.5 Flash | Image URL → Gemini → return structured data |
| Research alternative tech stack decisions | ChatGPT + Perplexity (both, compare) | Second-opinion pattern |
| Content SEO optimization | ChatGPT | Draft article → suggestions → Claude integrates |

### 🚫 KEEP IN CLAUDE (risc de securitate / impact critic)

| Area | Why |
|---|---|
| `src/app/api/**` | Authentication, Stripe webhooks, RLS enforcement |
| `src/app/middleware.ts` | Auth gate, rate limit |
| `supabase/migrations/**` | Database schema — breaking changes irreversible |
| `.env.local` + `.env.example` | Secrets — never leave Claude orchestration |
| Stripe live keys | Financial — never share externally |
| CATUC legal content FINAL review | Legal liability — final version needs arhitect semnatar (Vlad Ioniță) |
| Deploy scripts (`stripe:go-live`, env:sync) | Prod state — one wrong env = site down |
| User PII (test accounts, DPA replies) | GDPR |
| Commit author & push commands | Audit trail integrity |

### 🤔 CASE-BY-CASE (review required)

- `src/features/**` — depends on complexity (UI tweaks → delegate; business logic → Claude)
- `src/knowledge/**` — bulk translation delegate, legal articles stay Claude
- `src/features/design/components/technical/PermitTracker.tsx` — Claude (touches CATUC logic)

---

## 5. Cost Projection — Scenariul MAX €50/lună

**Nivel 0 — Minimum (€18-25)**:
| Serviciu | Cost | Note |
|---|---|---|
| Claude Pro | €18 | Fixed |
| ChatGPT Plus | €20 | Already active per user |
| TOTAL | **€38** | Mergem cu astea două + AI free (Gemini, Groq, NotebookLM, DeepSeek pay-per-use) |

**Nivel 1 — With Perplexity Pro (€38-56)**:
| Add | Cost | Why |
|---|---|---|
| Perplexity Pro | €18 | Critical for CATUC validation + market research |
| TOTAL | **€56** | Slightly over — but critical research |

**DeepSeek pay-per-use estimate**:
- 10M tokens/month input ≈ $1.40
- 3M tokens/month output ≈ $0.84
- **Estimat $3-5/lună** = negligible

**Decision for ModulCA 2.0 start**: Nivel 0 (€38) + DeepSeek pay-as-you-go ($5) = **€43/lună**. Sub plafonul €50.

---

## 6. Integration Workflow — "How Claude Calls Other AIs"

### Pattern A: API-based (programmatic, no human handoff)

Used for: DeepSeek, Gemini, Groq, OpenAI, image gen.

```
Claude (here) writes script → script calls API → result in file → Claude reviews
```

Example for DeepSeek translate:
1. Claude writes `scripts/ai-delegate/translate-article.ts` with DeepSeek SDK
2. Claude runs `node scripts/ai-delegate/translate-article.ts src/knowledge/06-regulations/RO/...`
3. Output goes to `.new.md` sibling file
4. Claude reviews diff in-context, approves, commits

### Pattern B: Chat handoff (requires user copy/paste)

Used for: Perplexity, NotebookLM, Claude Design, Grok.

```
Claude writes "handoff prompt" → user pastes to external tool → user pastes result back → Claude integrates
```

Example for Perplexity CATUC verification:
1. Claude writes: "verify whether Legea 169/2026 art. 294(2)(a)(ii) requires notification for houses up to 150m² — cite sources from legislatie.just.ro or Monitorul Oficial"
2. User pastes to perplexity.ai
3. User pastes answer back in chat
4. Claude integrates in `MCA-DOC-CATUC-FACTS.md`

### Pattern C: NotebookLM Deep Synthesis

For CATUC files specifically:

1. User uploads `catuc-169-2026-text.md` + `CATUC Clarificari.pdf` + `.docx` source to notebooklm.google.com
2. User creates a "notebook" called "CATUC 169/2026"
3. Claude generates 10 questions → user pastes each → NotebookLM answers with citations
4. Claude integrates answers into `src/knowledge/06-regulations/RO/CATUC-169-2026.md`

**Advantage**: NotebookLM processes 1.25MB legal text in seconds. Claude processes same in ~30 messages. Gain: 5-10× faster for long docs.

---

## 7. Plugin Architecture — Scriptul "ai-delegate"

Build `scripts/ai-delegate/` cu:

```
scripts/ai-delegate/
├── index.ts              # CLI entry: `npm run ai -- --task translate --provider deepseek --input file.md`
├── providers/
│   ├── deepseek.ts       # API client
│   ├── gemini.ts         # Google AI SDK
│   ├── groq.ts           # Groq SDK (already in providerChain)
│   └── openai.ts         # Reused from consultant/route.ts
├── tasks/
│   ├── translate.ts      # RO→EN, EN→RO
│   ├── summarize.ts      # Long doc → bullet points
│   ├── refactor.ts       # Code refactoring from spec
│   ├── test-boilerplate.ts  # Generate test skeletons
│   └── seo-optimize.ts   # SEO meta + description
└── review/
    └── diff-review.ts    # Claude-side review of delegated output
```

Each task has:
- Input validation (schema)
- Provider selection (fallback chain)
- Rate limit respect
- Cost tracking (log tokens used)
- Output goes to `.new.md` or `.new.ts` sibling (never overwrite)

**To build**: Phase 2, after MCA-STATUS + CATUC fix. Est. 1-2 days work.

---

## 8. Security Audit — Multi-AI Threats

| Threat | Mitigation |
|---|---|
| Delegated AI leaks source code | Only share WHAT needs translating, not whole repo context |
| API keys leak (DeepSeek, Gemini) | `.env.local` only, never committed. Use rotating keys quarterly. |
| Delegated output contains malicious code | Claude reviews every diff. No auto-merge. `scripts/ai-delegate/` output → `.new.*` files only. |
| NotebookLM/Perplexity training on uploaded CATUC | CATUC is PUBLIC LAW — zero risk |
| ChatGPT Plus training on code we paste | User can opt out in ChatGPT settings → Data Controls → Chat history & training OFF |
| Prompt injection via external docs | Treat all external AI output as untrusted. Human validates. |
| Cost explosion (API loop) | Cost tracker in ai-delegate, hard cap per task ($5/task), monthly cap ($10) |

---

## 9. Trigger Rules — When to Delegate vs Do Here

**ALWAYS delegate if** (zero reason to burn Claude tokens):
- Translate text >500 words
- Summarize document >5k words
- Generate test boilerplate from clear spec
- OG image generation
- Market research with citations

**NEVER delegate** (core strategic / security):
- Code review of auth/api/stripe
- CATUC final content wording
- DB migrations
- Secret management
- Final commit messages

**ASK USER if unsure**:
- Any legal text that will be user-facing
- Any PII touch
- Any Stripe-adjacent code
- Any public-facing commitment

---

## 10. Next Steps (Phase 1 of this strategy)

- [ ] Add `DEEPSEEK_API_KEY` to `.env.local` (user action — needs account at platform.deepseek.com, free $5 trial credit)
- [ ] Add `PERPLEXITY_API_KEY` to `.env.local` (optional — only if Pro user activates API)
- [ ] Verify `GEMINI_API_KEY` is active (already in `.env.local` — test with `scripts/engines/audit.mjs`)
- [ ] Verify `GROQ_API_KEY` is active (already in `.env.local` — same)
- [ ] User opens NotebookLM, creates "CATUC 169/2026" notebook, uploads 3 files
- [ ] User confirms ChatGPT training opt-out
- [ ] Claude builds `scripts/ai-delegate/` skeleton (Phase 2, after status audit)

---

## 11. Review cadence

Re-evaluate this strategy monthly or when:
- Budget changes (if user gets funding → scale up)
- New model released (Claude Sonnet 5.5, GPT-5, Gemini 3)
- Delegation task hits security issue
- Cost of DeepSeek > $10/month (reconsider mix)

---

*Delegation is not about replacing Claude. It's about matching each task to the cheapest tool that still produces quality.*
