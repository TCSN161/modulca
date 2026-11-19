# BRIEF pentru chatul "3.renderi AI" — ModulCA 2.0

**Prepared by**: Claude Code main chat (ModulCA 2.0 reboot)  
**Date**: 2026-11-19  
**Copy-paste ready**: Yes — paste ENTIRE document into 3.renderi AI chat  
**Related**: `docs/MCA-STRAT-AI-DELEGATION-2026-11-19.md` · `docs/AI_PROVIDERS.md`

---

## 📋 Copy this entire section into the 3.renderi AI chat

---

### Context (de la main chat)

Lucrez la **ModulCA 2.0** — platformă SaaS pentru casă modulară, Next.js 16 + Supabase + Stripe, live la modulca.eu. Am avut o pauză de 7 luni (apr-nov 2026) și acum relansez cu target **1 feb 2027 public launch** (invite-only beta 15 dec 2026).

Buget total ops: **€50/lună MAX**. Fundul de token Claude e limitat, deci folosim multi-AI delegation (ca tine) pentru research specializat.

### Current state render/3D stack la ModulCA

**AI image providers configurate și testate (`.env.local` + `scripts/engines-audit.mjs`)**:

Hero chain (default pentru utilizatori free):
1. Pollinations AI — $0/img (text-to-image)
2. AI Horde — $0/img
3. Together.ai FLUX Schnell — $0.00003/img ⚠️ **FREE TIER EXPIRAT 2026-07-01** (trebuie înlocuit)
4. Cloudflare Workers AI — $0.00011/img
5. HuggingFace Inference — $0.001/img
6. Google Gemini Flash Image — $0.0025/img

Backup chain:
- Fireworks AI, NovitaAI, fal.ai, Replicate, WaveSpeed

Premium-only (plătite):
- Black Forest Labs (FLUX), Segmind, DeepInfra, OpenAI GPT Image, Runway Gen-3, Leonardo.ai, Stability AI

3D stack:
- Three.js pentru walkthrough 3D (Step 12 / project/[id]/walkthrough)
- 20 GLB models în `src/assets/` pentru module + obiecte furniture
- Zustand pentru state management 3D

Platform features relevante:
- Step 9 (visualize) — AI image generation pentru render interior/exterior
- Step 10 (render) — fine-tuned renders cu providers premium
- Step 12 (walkthrough) — 3D walkthrough cu Three.js
- Step 13 (presentation) — compile final visuals
- NeufertAI consultant (`/api/consultant/route.ts`) — Q&A arhitectural cu text providers (anthropic, openai, groq, together, pollinations)

---

### 🎯 Ce vreau de la tine — 6 întrebări concrete

Răspunde fiecăreia cu:
- **Recommendation** (adopt / wait / skip)
- **Rationale** (1-2 paragrafe)
- **Integration effort estimate** (hours of dev work)
- **Cost delta** vs current setup
- **Risk**

#### Q1 — Together.ai alternative (URGENT, free tier expirat)

Trebuie să înlocuiesc Together.ai FLUX Schnell în hero chain. 

Caută alternative free SAU foarte ieftine ($0 - $0.0001/img) cu calitate ≥ FLUX Schnell pentru text-to-image architectural/interior.

Candidați de evaluat (lista non-exhaustivă):
- Pollinations (deja hero, verific capacity limits)
- SiliconFlow (free plan?)
- OpenRouter image generation
- Replicate free tier re-evaluate
- Together.ai Pro tier cost analysis
- Newer: Recraft v3, Ideogram, Playground v3

Deliverable: **un ranking top 3 alternative + cost table + integration code snippet.**

#### Q2 — Gaussian Splatting status 2026-Q4

În aprilie 2026 avea potențial dar lipsea maturitate. Status acum?

Specifically:
- Luma AI API disponibil?
- Polycam SDK web-ready?
- Open source 3DGS implementations (nerfstudio, splatstudio)?
- Mobile capture → cloud process → web viewer end-to-end flow?
- Cost per scene?

Use case ModulCA: user scanează plot-ul propriu cu telefonul → avem ambient context pentru generare imagini AI contextuale (nu doar "a modular house" ci "a modular house on THIS land").

#### Q3 — NeRF / 3D-from-single-image maturity

Trellis (Microsoft), Rodin (Meshy), Hunyuan3D, Zero-1-to-3 — care produc modele GLB usable pentru our viewer?

Use case ModulCA: user uploadează poză inspirație → generăm module 3D customizat (plus față de cele 20 preset).

Decision gate: dacă quality ≥ 70% of a hand-modeled GLB AND cost < $0.50/model AND API latency < 60s → integrate în Phase 4+.

#### Q4 — Blender integration — da sau nu acum?

User a menționat că a văzut variante Blender. Vreau clarificat:

Opțiuni:
A) **Blender MCP server** (community) — rulează Blender headless, Claude sends commands → generates specific camera angles, lighting setups, materials
B) **Blender render backend** — user configurează scena în modulca.eu, we POST to Blender render service, user primește high-quality PNG/MP4
C) **Blender-based 3D editor embedded** — advanced users editează direct scena în browser (via Blender WebGL exports)

Pentru fiecare:
- Realistic complexity?
- Minimum feature cu value real pentru beta users (dec 2026)?
- Hosting cost dacă self-hosted render service?
- Alternative: Three.js Postprocessing, PlayCanvas, Babylon.js, UnrealJS

Recommendation pentru ModulCA 2.0: integrate acum sau defer Phase 7+?

#### Q5 — Video generation status

Runway Gen-3, Luma Dream Machine, Pika 2.0, Kling 2.0, Veo 2 — care sunt production-ready pentru:
- Walkthrough video (camera trip through modular house)
- Timelapse construction animation (pentru marketing)
- Interior/exterior "cinema reels" (presentation Step 13)

Cost per second of video + quality?

Use case: dec 2026 invite-only beta user generates 15-sec walkthrough of their custom design → shares on WhatsApp/Instagram. Need < $1/clip to be viable.

#### Q6 — NeufertAI model upgrade recommendations

Current: `claude-sonnet-4-20250514` (from April).  
providerChain: `[anthropic, openai, groq, together, pollinations]`

Possible upgrades:
- Claude: `claude-sonnet-5-5` or `claude-opus-4-7` (expensive but ultra-smart)
- OpenAI: `gpt-5` latest
- Groq: `llama-3.3-70b` → `llama-4-*`?
- xAI Grok 4 — worth adding?
- Chinese: DeepSeek V3 for legal+arch reasoning?

NeufertAI's tasks:
- Explain Neufert standards (interior spacing, lighting, building codes)
- Answer architectural Q about modular limits
- Phase 2: explain CATUC 169/2026 provisions (needs strong legal reasoning)

Recommend: **primary + 2 fallbacks** with reasoning for each.

---

### 🚦 Decision framework (how I'll evaluate your recommendations)

Pentru fiecare recomandare "adopt now", valid sub următoarele constraints:
- ✅ **Budget**: €0 adăugat lunar NEW ops cost. Can accept one-time setup cost < €50.
- ✅ **Time**: dev integration ≤ 1-2 days work
- ✅ **Stable**: provider funded, API ≥ 1y stable track record, SLA sau cel puțin status page cu uptime > 99%
- ✅ **Fit**: directly serves a user in first 100 users of invite-only beta (dec 2026)

If "wait" → specify when I should re-check (date or event trigger).

### 📨 Response format — what I need back

```markdown
# 3.renderi AI Research Response — 2026-11-DD

## Q1 — Together.ai replacement
- Recommendation: [adopt X / adopt Y / wait]
- Top 3 ranking:
  1. [provider] — $X/img, quality ★★★★☆, integration: [snippet]
  2. ...
- Current providerChain reorder suggestion:
  ```
  ["pollinations", "ai-horde", "<new>", "cloudflare", "huggingface", "gemini"]
  ```

## Q2 — Gaussian Splatting
- Recommendation: [adopt / wait until Q1 2027 / skip]
- Rationale: ...
- If adopt: integration path = [steps]
- If wait: re-check trigger = [date or event]

## Q3 — NeRF / 3D-from-image
...

## Q4 — Blender integration
- Decision per option A/B/C
- Recommended option for ModulCA 2.0: ...

## Q5 — Video generation
...

## Q6 — NeufertAI model stack
- Primary: [model] — rationale
- Fallback 1: ...
- Fallback 2: ...
- Config snippet for src/app/api/consultant/route.ts

## Appendix — Any surprise findings worth flagging
```

Deliverable file name suggestion: `docs/research/2026-11-DD-3renderi-ai-response.md`

---

### 🔗 What happens next

1. You answer above → paste full markdown back in main chat
2. Main chat (Claude Code) integrates recommendations:
   - Writes `docs/MCA-STRAT-RENDERS-2026-11.md` consolidating decisions
   - Updates `src/app/api/consultant/route.ts` providerChain
   - Creates MCA-* task IDs for each adopted change
   - Updates blockers list (B14 Together.ai resolved)
3. Implementation starts in Phase 1 (this week) for quick wins, Phase 2-3 for complex adopts.

---

### ⏱ Time expectation

- Quick-answer version: 30 min (Q1 + Q6 only, actionable now)
- Full version: 2-3 hours (all 6 questions)
- Deep version with provider API testing: 1 day

User (Costin) decides effort level based on your initial estimate.

---

*End of brief. Please acknowledge receipt before starting work, so main chat knows the ball is in your court.*
