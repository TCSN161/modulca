# MCA-DOC-AI-ENGINES-SURVEY-2026-11

**Status**: Comprehensive survey of AI engines available Nov 2026 for ModulCA use cases
**Owner**: Costin Muraru
**Scope**: Image gen, video gen, text-to-3D, text (NeufertAI), audit of what we already have vs what's new, freshness check of hardcoded model IDs
**Related**: [[MCA-DOC-AI-LANDSCAPE-2026-11]] · [[project_ai_engines]]

---

## 1. TL;DR verdict

**No urgent action required.** 7/7 engines currently configured still work.
Discovered optional upgrades (cheaper or better for same task) — track in §6.
Net-new vendors (Luma Ray 3, Sora 2, Veo 3.5) are expensive relative to our
€50/mo cap — defer to Phase 4+ when revenue justifies video rendering.

---

## 2. Current ModulCA engine inventory — model-freshness audit

Automated via `npm run engines:check` (2026-11-19 run). All 7 engines OK.

| Engine | Model hardcoded | Still available? | Replacement candidate |
|---|---|---|---|
| anthropic | claude-sonnet-5-5 | ✅ | — |
| gemini | gemini-flash-latest (alias) | ✅ auto-rolls | — |
| groq | openai/gpt-oss-120b | ✅ | — |
| deepseek | deepseek-chat | ✅ (key, $0 bal) | top-up $5 when Phase 2 |
| pollinations | default SD | ✅ | — |
| ai-horde | SD community | ✅ | — |
| cloudflare | @cf/black-forest-labs/flux-1-schnell | ✅ | **flux-2-dev** (Cloudflare) |

### Full engine list (incl. Vercel-side): 19 total
- Anthropic, OpenAI (dall-e-3), Groq, Gemini, DeepSeek, Pollinations, AI Horde,
  Cloudflare, HuggingFace, Replicate, Fireworks, DeepInfra, Segmind, Leonardo,
  Stability, fal, BFL, Together, WaveSpeed, Novita, Runway, Prodia

---

## 3. What's NEW in AI engines Apr → Nov 2026

### 3.1 Image generation (potentially useful for us)

| Engine | Model | Price | Free tier | Notes |
|---|---|---|---|---|
| **Cloudflare FLUX 2** | `@cf/black-forest-labs/flux-2-dev` | included in 10K neurons/day | ✅ | **UPGRADE candidate** — FLUX 2 released Sept 2026, ~30% better quality than FLUX 1 Schnell at similar cost |
| **FLUX 2 Klein 9B/4B** | by BFL, on CF + fal | $0.006/img (BFL direct) | — | Lightweight FLUX 2 variant |
| **Qwen Image 3** | via Together.ai | $0.004/img | — | Alibaba's image model, strong for Asian architecture |
| **Nano Banana 2.1** | Google (via Gemini API) | free tier daily | ✅ | Successor to our gemini-2.5-flash-image |
| **Ideogram 3.0** | ideogram.ai | $0.01/img | $5 trial | Best typography/labels in renders |

### 3.2 Video generation (NEW category — not in ModulCA 1.0)

| Engine | Model | Price | Free tier | For us? |
|---|---|---|---|---|
| **Runway Gen-4** | gen4_turbo | $0.03/sec | 125 credits/mo | Current gen3a_turbo still works. Upgrade worth it for Architect tier marketing. |
| **Sora 2** | OpenAI | $0.05/sec | — | Flagship video. Too expensive for our Beta. Phase 5+ consideration. |
| **Veo 3.5** | Google | $0.08/sec | — | Enterprise quality. Phase 7+. |
| **Luma Ray 3** | lumalabs.ai | $0.014/sec | 10 free/mo | Cheapest viable for 10s walkthrough clips. |
| **Hailuo-02** | MiniMax | $0.012/sec | $1 trial | Chinese provider — gated per our China policy. |
| **Kling 2.5** | Kuaishou | varies | — | Chinese. Same policy gate. |

**Recommendation**: Skip video entirely for Beta. Revisit at Phase 5 (public launch marketing videos) with Luma Ray 3 as primary.

### 3.3 Text-to-3D (future ModulCA 2.0+ differentiator)

| Engine | Model | Price | Notes |
|---|---|---|---|
| **Luma Genie 2** | lumalabs.ai | $0.08/model | 10 free/mo | 3D mesh from text, usable in walkthrough |
| **Meshy-5** | meshy.ai | $20/mo | 200 credits trial | Industry standard, GLB export |
| **Tripo 3** | tripo3d.ai | ~$0.05/model | 20 free/day | Text-to-3D, good for furniture |
| **Spline AI** | spline.design | subscription | — | In-browser editor, different UX |

**Recommendation**: **Tripo 3 free tier** fits our workflow for Phase 3 ("Place AI-generated furniture"). Add later.

### 3.4 Text / consultant (NeufertAI alternatives)

| Model | Provider | Nov 2026 strength |
|---|---|---|
| **Claude Sonnet 5.5** | Anthropic | ⭐ our current |
| **GPT-5.1** | OpenAI | Released Oct, best reasoning overall, $5/1M in |
| **GPT-5.1-mini** | OpenAI | $0.25/1M in, replaces gpt-4o-mini |
| **Gemini 3.6 Flash** | Google | Free 1500/day, 2M context — ideal for CATUC 1.25MB |
| **DeepSeek V3-Coder** | DeepSeek | $0.14/1M in — cheapest viable for bulk |
| **GPT-OSS 120B (Groq)** | Meta/OSS on Groq | Free tier — current fallback |

**Recommendation on consultant fallback chain**: keep current `[anthropic, openai, groq, pollinations]`. Consider swapping `openai → gpt-5.1-mini` (same price tier as gpt-4o-mini but materially better).

---

## 4. Aggregator platforms (unified API over many models)

| Platform | Why interesting | Downside |
|---|---|---|
| **OpenRouter** | 100+ models through 1 key, routes to cheapest | Adds 5% margin; billing is OpenRouter |
| **Runware** | Serverless image gen (19 models) | No unique model; duplicates what we have |
| **Replicate** | Already configured — huge catalog | Already in our stack |
| **Together.ai** | ⚠️ removed (B14) — free tier expired | Re-add only if we top-up |

**Recommendation**: No aggregator needed. Our 7-engine fallback chain covers all practical needs. Re-evaluate if we exceed 1K renders/day across engines (not expected before Phase 4).

---

## 5. What to activate NOW vs defer

### Activate NOW (no cost, high value)
- ✅ Already done: `openai/gpt-oss-120b` on Groq, `claude-sonnet-5-5` on Anthropic, `gemini-flash-latest` alias — fixed in commit `b8a6c20`
- 📋 Weekly automated check — ⬇️ installed now (`engines:check` + GH Action)

### Defer (needs user action for keys)
- 🔑 **WaveSpeed** signup → add real `WAVESPEED_API_KEY` on Vercel (placeholder now)
- 🔑 **Novita** signup → add real `NOVITA_API_KEY` on Vercel (placeholder now)
- 🔑 **DeepSeek $5 top-up** → enables Phase 2 bulk translate (deferred until Phase 2 starts)

### Defer (post-Beta)
- 📅 Luma Ray 3 video — Phase 5 marketing
- 📅 Tripo 3 text-to-3D — Phase 3 enhanced products step
- 📅 Sora 2 / Veo 3.5 video — Phase 7+ if revenue supports
- 📅 Ideogram 3.0 — only if we see poor typography in generated signage

### Do NOT activate
- ❌ Runware — no unique model, net complexity cost
- ❌ MiniMax / Kling — China policy gate
- ❌ OpenRouter — aggregator margin eats our cheap-first strategy

---

## 6. Optional upgrades identified (low priority, track for future)

| # | Change | Benefit | Effort | When |
|---|---|---|---|---|
| U1 | Cloudflare: `flux-1-schnell` → `flux-2-dev` | ~30% better quality, same free quota | 1 line | Any time after Beta |
| U2 | OpenAI consultant: `gpt-4o-mini` → `gpt-5.1-mini` | Better reasoning, same price tier | 1 line + test | Any time |
| U3 | OpenAI image: `dall-e-3` → `gpt-image-1` | Current flagship, better instruction following | 1 line + test | Phase 3 |
| U4 | BFL: `flux-pro-1.1` → `flux-2-pro` | Latest FLUX 2 | 1 line | When BFL confirms API GA |
| U5 | Runway: `gen3a_turbo` → `gen4_turbo` | 2x fidelity | 1 line | When marketing video needed |

---

## 7. Automation

**Weekly check**: `.github/workflows/engines-model-check.yml`
- Runs Sunday 07:00 UTC
- Opens issue labeled `engine-health` if any failure or deprecation detected
- Artifact JSON retained 60 days

**Local commands**:
```bash
npm run engines:check         # full color report
npm run engines:check:json    # machine-readable
npm run engines:audit         # billing/credit audit (quarterly review)
```

**Future (Phase 4+)**: Add new-engine discovery crawl — scrape openrouter.ai + paperswithcode weekly to flag models beating our current price/perf on $/token or $/image metrics.

---

## 8. Key takeaways for ModulCA 2.0

1. **No current engine is broken** after the critical Groq fix (b8a6c20).
2. **Automation in place** — weekly health check will surface breakage within 7 days.
3. **Free-first strategy intact** — 6 free engines viable, €0/mo running cost.
4. **Clear upgrade path** when we need quality (U1-U5) or when we grow (Phase 3/4/5 roadmap).
5. **No signup overload** — user only needs to act when DeepSeek top-up or WaveSpeed/Novita infra is explicitly required.
