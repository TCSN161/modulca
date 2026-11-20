# MCA-STRAT-TOKEN-ECONOMY-2026-11-20

**Status**: Active operating rules  
**Owner**: Costin + Claude MAIN  
**Scope**: Token-efficient workflow + model routing + delegation templates  
**Related**: [[MCA-STRAT-AI-DELEGATION-2026-11-19]] (strategy) · this doc (tactics)

---

## 1. Principle

**Every token we don't burn today = 1 token available for Phase 2 (CATUC content, Nov 26)**. Phase 2 will cost real tokens (writing 9 legal docs). Phase 0-1 should NOT cost many.

Three rules:
1. **Right model for right task** (don't use Opus 4.7 for Sonnet work)
2. **Delegate execution, keep orchestration** (I decide, others execute)
3. **Context discipline** (don't re-read, don't over-explain, don't re-generate)

---

## 2. Claude model routing (Pro plan: Opus/Sonnet/Haiku)

### Effort level recommendation per task type

| Task type | Model | Effort | Why |
|---|---|---|---|
| **Strategic docs** (MCA-STRAT, decisions) | Opus 4.7 | extra | Reasoning-heavy, one-shot creation |
| **CATUC legal content review** | Opus 4.7 | extra | Liability — no quality compromise |
| **Code review on auth/stripe/api** | Opus 4.7 | normal | Security-critical, needs nuance |
| **Multi-file refactors + architecture** | Opus 4.7 | normal | Needs cross-file reasoning |
| **Writing MCA-DOC / MCA-LOG** | Sonnet 5.5 | normal | Structured but not reasoning-heavy |
| **Test boilerplate, simple bug fixes** | Sonnet 5.5 | normal | Pattern-matching tasks |
| **Code comments, variable renames** | Haiku 5.5 | normal | Mechanical |
| **Status checks, file listings, "what is X"** | Haiku 5.5 | low | Simple Q&A |
| **TypeScript error fixes** | Sonnet 5.5 | normal | Type reasoning but scoped |
| **Git ops (commit messages, PR descriptions)** | Sonnet 5.5 | low | Templated output |

### Current session mode
- **Running as**: Opus 4.7 extra effort
- **Recommended switch**: Opus 4.7 **normal** effort for the rest of Phase 0-1 audit work (status checks, file inspection, commit flow). Switch back to extra for Phase 2 CATUC rewrite.
- **How to switch**: use `/fast` to toggle fast mode OR ask me to use a smaller model for a given task

### Weekly budget target
| Category | Tokens/week target |
|---|---|
| Opus 4.7 extra | ≤ 40% weekly |
| Opus 4.7 normal | ≤ 40% weekly |
| Sonnet / Haiku | fill the rest |

---

## 3. External AI delegation map

### Primary delegation: WHO does WHAT

| Task class | Primary AI | Trigger | Save approx |
|---|---|---|---|
| **Translate RO ↔ EN** (articles, marketing copy) | DeepSeek V3 API | Phase 2 CATUC articles, Phase 6 marketing | 90% vs Claude |
| **Bulk doc synthesis** (CATUC 1.25MB law) | NotebookLM | Phase 2 kickoff | 100% (free, user-operated) |
| **Research with citations** (CATUC verification, market intel) | Perplexity | Phase 2 Q11-Q25, Phase 6 marketing research | 100% (free tier) |
| **PDF/image text extraction** | Gemini 2.5 Flash API | CATUC Clarificări PDF, floor plans | 80% (free quota) |
| **Second opinion on architecture/legal** | ChatGPT Plus | Critical decisions | 100% (fixed €20/mo) |
| **Fast structured outputs** (JSON, schemas) | GPT-5 mini API | Phase 3 PermitTracker | 60% |
| **NeufertAI latency fallback** | Groq Llama 4 | Already in providerChain | — |
| **Code reviews secondary opinion** | ChatGPT Plus / Codex CLI | Risky migrations | Shared load |

### Delegation templates (copy-paste ready)

#### Template A: DeepSeek translate task

```
Role: Technical Romanian↔English translator for architecture/construction domain.
Context: Modular house SaaS, EU market, legal/regulatory precision.

Task: Translate the following [RO→EN or EN→RO]:
[paste source text]

Constraints:
- Preserve markdown formatting
- Keep technical terms untranslated when standard (e.g., "autorizație", "PUG", "DTAC")
- Preserve all article references (e.g., "art. 294(2)(a)(ii)")
- Preserve all section headings exactly
- Return ONLY the translation, no explanation

Deliverable format: markdown, same structure as source.
```

#### Template B: NotebookLM document synthesis

Already written: `docs/research/2026-11-19-notebooklm-catuc-queries.md`. Use as-is.

#### Template C: Perplexity fact-check

```
Verify this claim with current public sources, EU + Romania focus:

[paste claim with specific numbers / article references]

Return format:
1. VERDICT (verified / partially verified / not verified / contradicted)
2. Top 3 sources with URLs and dates
3. Any corrections or caveats
4. Alternative formulation if the original is imprecise
```

#### Template D: ChatGPT Plus second opinion

```
I need a second opinion on this architectural decision for a Next.js 16 + Supabase SaaS:

CONTEXT:
[1-paragraph context]

MY PROPOSED APPROACH:
[approach]

ALTERNATIVE I'M CONSIDERING:
[alternative]

QUESTION:
Which approach would you recommend and why? Flag any blind spots or risks in either.

Constraint: Answer in ≤ 300 words. No code unless specifically needed.
```

#### Template E: Gemini 2.5 Flash PDF extract

```
Extract all text from this PDF, preserving structure.
[upload file]

Return as markdown with:
- Headings matching document structure
- Tables preserved as markdown tables
- Lists preserved
- Footnotes at end
- Page numbers as [p.X] inline references
```

---

## 4. Session economy rules (practical habits)

### What I will do differently starting now

| Habit | Before | After |
|---|---|---|
| Doc length | 400-500 lines "comprehensive" | 150-250 lines, focused |
| Chat response | 4 sections + 3 tables | 1 section + 1 table (if needed) |
| File reading | `Read` full file for context | `grep` or `Read offset/limit` |
| Re-reading | "Let me check..." → Read again | Trust context, don't re-verify |
| Explanations | Explain everything | Explain only non-obvious |
| Commit messages | 15-line HEREDOC with "subheadings" | 3-5 lines + bullet list |
| Status updates | Full dashboard tables | Delta from last update |
| Code comments | Doc-style JSDoc | Only when WHY not obvious |

### What user can do to save tokens

| Action | Save |
|---|---|
| Paste specific file paths / line numbers in questions | ~2k tokens (I don't search) |
| Use `/fast` for session switch to Sonnet when work is routine | ~40% per call |
| Reject my overlong first response, ask "mai scurt" | Future replies compact |
| Give me a "GO on A,B,C" so I don't re-propose | ~5k tokens |
| Keep images focused (crop to the relevant region) | ~1k per image |
| Point me at specific functions, not whole folders | ~10k on exploration |

### Red flags — when I MUST warn

- 50% weekly used by Wednesday
- 70% weekly used by Friday
- Any Phase 2 work before Nov 26 (should be in fresh week)
- Risk of Opus 4.7 extra exhaustion before CATUC review

---

## 5. Short / medium / long term game plan

### Short term (this week, Nov 20-25)
- Finish Phase 1 audit with **minimum tokens**
- User does A1-A7 (no Claude needed)
- I do: B13 verify, B15 audit fix, Phase 2 prep — all **Sonnet 5.5 or normal Opus**
- Switch to Opus extra ONLY for: MCA-DOC-STATUS-2026-11-25 end-of-phase snapshot (1 session)

### Medium term (Nov 26 - Dec 15, Phase 2 + 3)
- Phase 2 CATUC rewrite — delegate heavily:
  - NotebookLM → raw CATUC synthesis (user drives, free)
  - DeepSeek → first-pass translation of 9 files (API calls, ~$5 total)
  - Opus 4.7 extra → final legal wording review per file (expensive but critical)
  - Vlad Ioniță → final human check
- Phase 3 PermitTracker — Sonnet 5.5 for coding, Opus extra only for schema design

### Long term (Dec 15+, Phase 4-7)
- Beta polish → 90% Sonnet 5.5
- Marketing (Feb+) → DeepSeek for copy, ChatGPT for review
- Scaling conversations → consider dropping to Sonnet-only session mode

---

## 6. Monthly review

First Monday of each month, I will:
- Check actual token distribution across models
- Adjust routing table in §2 if a model class changed pricing/quality
- Flag any delegation pattern that didn't save tokens as expected
- Update this doc with learnings

---

## 7. Right now — action

**Immediate change**: unless you explicitly request Opus extra effort, I default to Opus 4.7 **normal** for the rest of today. Switch back to extra only for:
- End-of-phase retrospectives
- CATUC legal content final pass
- Strategic pivots

**Delegation foundation ready**: Templates A-E above are the baseline. Each gets refined as we use it.

---

*Writing fewer tokens isn't about being less helpful. It's about keeping the Opus 4.7 budget available for when it actually matters.*
