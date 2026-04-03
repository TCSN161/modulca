# ModulCA — Master Plan

## 1. WHAT WE HAVE DONE

### Core Platform (Complete)
- Next.js 16 App Router + TypeScript strict mode
- Zustand store with auto-persistence (localStorage)
- 11-step wizard: Land → Design → Preview → Style → Configure → Visualize → Render → Technical → Walkthrough → Products → Finalize
- StepNav navigation across all steps with forward/back links
- 3D visualization with Three.js (single + combined module views)
- Module system: types, layouts, floor/wall materials, furniture presets
- Style directions (Scandinavian, Industrial, Warm Contemporary)
- Cost estimation engine with shared-wall discounts
- Homepage with all sections (Hero, How It Works, Pricing, For Builders)

### AI Rendering — Step 7 (Complete)
- Server-side API proxy at `/api/ai-render` (GET + POST)
- Modular engine architecture (pluggable engines in `engines/` directory)
- 3 engines integrated: Pollinations AI, AI Horde, Stability AI
- Engine selector dropdown in UI (Auto / Pollinations / AI Horde / Stability)
- Auto-fallback: if selected engine fails, tries others automatically
- img2img support: "Use 3D Scene as Base" toggle captures Three.js canvas
- Prompt templates (Magazine, Cozy, Real Estate, Blueprint, Custom)
- Resolution selector (Draft / Standard / High)
- Save/Share buttons for rendered images
- Elapsed time counter during generation
- Stability AI API key configured and ready

### Bug Fixes (Complete)
- Store persistence (auto-save/hydrate from localStorage)
- RenderPage module initialization from land store
- Homepage navigation (Pricing, For Builders, How It Works)
- Design page navigation (added StepNav + forward/back links)
- .next cache corruption fix (Windows)
- Node.js heap OOM fix (4GB for dev/build)

---

## 2. WHAT WE HAVE TO DO

### Phase 1 — More AI Engines (1-2 days)
- [ ] Add Together.ai FLUX schnell engine (free unlimited 3 months)
- [ ] Add Together.ai FLUX Kontext engine (img2img support)
- [ ] Add Replicate interior-ai engine (purpose-built for interior design)
- [ ] Test Stability AI img2img with the configured API key
- [ ] Update engine dropdown with new options

### Phase 2 — 3D Walkthrough Enhancement (2-3 days)
- [ ] Research and prototype GaussianSplats3D integration in Walkthrough page
- [ ] Add "Premium Walkthrough" toggle/dropdown (like AI engine selector)
- [ ] Integrate gsplat.js or GaussianSplats3D as Three.js plugin
- [ ] Generate explorable 3D scenes from AI renders
- [ ] Add walkthrough quality modes (Standard Three.js / Premium Gaussian)

### Phase 3 — Polish & Investor Demo (2-3 days)
- [ ] End-to-end test: full flow Land → Finalize works smoothly
- [ ] Mobile responsiveness across all steps
- [ ] Loading states and error handling improvements
- [ ] Gallery of past renders (render history)
- [ ] Progress bar instead of elapsed timer
- [ ] Better default prompts for each module type

### Phase 4 — Production Readiness (3-5 days)
- [ ] Authentication (NextAuth with email/password + Google)
- [ ] Database integration (save projects to Supabase/PostgreSQL)
- [ ] Deploy to Vercel with environment variables
- [ ] API key management (user brings own key for premium engines)
- [ ] Rate limiting and usage tracking
- [ ] Premium tier gating (free vs paid features)

---

## 3. RESOURCE REQUIREMENTS

### Development Time Estimate
| Phase | Effort | Calendar |
|-------|--------|----------|
| Phase 1: More AI Engines | 8-12 hours | 1-2 days |
| Phase 2: 3D Walkthrough | 16-24 hours | 2-3 days |
| Phase 3: Polish & Demo | 12-20 hours | 2-3 days |
| Phase 4: Production | 24-40 hours | 3-5 days |
| **TOTAL TO MVP LAUNCH** | **60-96 hours** | **8-13 days** |

### API Costs (Monthly Estimate for Demo/MVP)
| Engine | Monthly Cost | Notes |
|--------|-------------|-------|
| Pollinations AI | $0 | Free forever for basic models |
| AI Horde | $0 | Community powered, always free |
| Stability AI | ~$5-10 | 25 free credits, then $0.01/credit |
| Together.ai FLUX | $0 for 3 months | Free unlimited schnell endpoint |
| Replicate | ~$5-10 | ~$0.04/image, ~200 images/month |
| **Total API cost** | **$0-20/month** | During MVP/demo phase |

### Infrastructure
| Item | Cost | Notes |
|------|------|-------|
| Vercel (hosting) | $0-20/month | Free tier covers MVP |
| Supabase (database) | $0 | Free tier: 500MB, 50K requests |
| Domain | ~$12/year | modulca.com or similar |
| **Total infra** | **$0-20/month** | |

---

## 4. AI ENGINE CLASSIFICATION

### CATEGORY 1: AI Image Rendering Engines (Step 7 - Render)

#### FREE — No Account Needed
| Engine | Speed | img2img | API | Quality | Notes |
|--------|-------|---------|-----|---------|-------|
| **Pollinations.ai** | Fast | No | Yes (URL-based) | Good | Unlimited free for basic models. Rate-limited without key. |
| **AI Horde** | Slow | No | Yes (REST) | Good | Community GPUs. Anonymous key `0000000000`. Lower priority without account. |

#### FREE — Account Needed (No Payment)
| Engine | Speed | img2img | API | Quality | Free Limits | Notes |
|--------|-------|---------|-----|---------|-------------|-------|
| **Together.ai FLUX schnell** | Fast | No | Yes | Very Good | **Unlimited for 3 months** | Best free option. FLUX model. No credit card. |
| **Leonardo.ai** | Fast | Yes | Yes | Very Good | 150 tokens/day (web) + $5 API credits | Images public on free tier. |

#### FREE WITH LIMITS — Account Needed
| Engine | Speed | img2img | API | Quality | Free Limits | After Free |
|--------|-------|---------|-----|---------|-------------|------------|
| **Stability AI** | Medium | **Yes** | Yes | Excellent | 25 credits (~5-7 images) | $0.01/credit |
| **Together.ai Kontext** | Medium | **Yes** | Yes | Very Good | $25 signup credits | ~$0.04/image |
| **fal.ai** | Fast | Yes | Yes | Very Good | Small promo credits | Pay-per-use |
| **Replicate interior-ai** | Medium | **Yes** | Yes | **Excellent for interiors** | Free trial | ~$0.04/image |
| **Google Imagen** | Fast | Yes | Yes | Excellent | $300 GCP credits (90 days) | $0.02-0.06/image |
| **ReRender AI** | Fast | **Yes** | Yes | Excellent | ~3 free renders/day | From $15/month |
| **MyArchitectAI** | Fast | **Yes** | Yes | Excellent | 10 free/month | $29/month web, $99/month API |
| **mnml.ai** | Fast | **Yes** | Yes | Excellent | Free credits on signup | 100 credits/$29 |

#### PAID ONLY
| Engine | Speed | img2img | API | Quality | Price | Notes |
|--------|-------|---------|-----|---------|-------|-------|
| **OpenAI DALL-E 3** | Fast | No | Yes | Excellent | $0.04-0.08/image | No meaningful free tier |
| **Ideogram** | Medium | No | Yes | Very Good | $0.08/image (API) | Web: 40 free img/day, API: paid only |

#### RECOMMENDED INTEGRATION ORDER (Step 7)
1. **Together.ai FLUX schnell** — FREE unlimited 3 months, high quality, easy API ★★★
2. **Replicate interior-ai** — Purpose-built for interior design, img2img ★★★
3. **Together.ai Kontext** — img2img editing, $25 free credits ★★
4. **Leonardo.ai** — 150 free/day, good quality ★★
5. **Google Imagen** — $300 free credits, best quality ★

---

### CATEGORY 2: 3D Walkthrough Enhancement Engines (Step 8 - Premium)

#### FREE — No Account Needed (Open Source)
| Engine | Type | Integration | Quality | Notes |
|--------|------|-------------|---------|-------|
| **GaussianSplats3D** | Gaussian Splatting viewer | Three.js plugin (npm) | Photorealistic | Free, open source. Plugs into our Three.js stack. **Best option.** |
| **gsplat.js** | Gaussian Splatting viewer | Standalone JS (npm) | Photorealistic | Free, open source. By Hugging Face. Lighter than GaussianSplats3D. |
| **Babylon.js** | Full 3D engine | npm package | High | Free, open source (Apache 2.0). Microsoft-backed. WebGPU support. |
| **PlayCanvas** | Full 3D engine | npm package (engine) | High | Engine is MIT open source. Editor/hosting is paid. First WebGPU engine. |

#### FREE WITH LIMITS — Account Needed
| Engine | Type | Integration | Quality | Free Limits | Paid |
|--------|------|-------------|---------|-------------|------|
| **Luma AI Genie** | Text-to-3D generation | REST API | High | Limited free | $0.20/task, from $8/month |

#### PAID
| Engine | Type | Integration | Quality | Price | Notes |
|--------|------|-------------|---------|-------|-------|
| **Shapespark** | Architectural walkthrough | iframe embed + JS API | Excellent | From $19/month | Beautiful baked lighting. Best ready-made solution. |
| **Matterport** | Virtual tour | JS SDK + iframe | Excellent | Paid sub + dev license | Industry standard. Expensive, not transparent pricing. |
| **Enscape** | Desktop renderer | None (no API) | Excellent | From $575/year | **NOT integrable** — desktop plugin only. |
| **Unreal Pixel Streaming** | Cloud-streamed UE5 | WebRTC + iframe | Best possible | $0.50-1+/hr GPU | Most expensive. Requires GPU servers. Best quality. |

#### RECOMMENDED INTEGRATION ORDER (Step 8)
1. **GaussianSplats3D** — Free, Three.js plugin, photorealistic, easy to add ★★★
2. **gsplat.js** — Lighter alternative, also free ★★★
3. **Shapespark** — Premium tier, beautiful walkthroughs ($19/month) ★★
4. **Luma AI** — Premium tier, AI-generated 3D models ★

---

## 5. ARCHITECTURE: How Engines Plug In

### Current Engine Plugin System (Step 7 - Render)
```
src/app/api/ai-render/
├── route.ts              ← Main proxy (GET text2img, POST img2img)
├── engines/
│   ├── types.ts          ← AiRenderEngine interface
│   ├── pollinations.ts   ← Pollinations AI
│   ├── aihorde.ts        ← AI Horde
│   ├── stability.ts      ← Stability AI (img2img)
│   ├── route.ts          ← GET /api/ai-render/engines (list for UI)
│   ├── together.ts       ← TODO: Together.ai FLUX
│   └── replicate.ts      ← TODO: Replicate interior-ai
```

### To Add a New Engine:
1. Create `engines/newengine.ts` implementing `AiRenderEngine`
2. Add entry to `ENGINES` map in `route.ts`
3. Add entry to `ENGINE_LIST` in `engines/route.ts`
4. Add entry to `AI_ENGINES` in `RenderPage.tsx`

### Planned Walkthrough Plugin System (Step 8)
```
src/features/design/components/walkthrough/
├── WalkthroughPage.tsx       ← Main page
├── engines/
│   ├── types.ts              ← WalkthroughEngine interface
│   ├── threejs.ts            ← Default Three.js (current)
│   ├── gaussian-splatting.ts ← Premium: GaussianSplats3D
│   └── shapespark.ts         ← Premium: Shapespark embed
```

---

## 6. TIMELINE TO FINAL (Investor Demo Ready)

```
Week 1 (Days 1-5):
  ├── Day 1-2: Add Together.ai + Replicate engines
  ├── Day 2-3: Test all engines, fix Stability img2img
  ├── Day 3-4: GaussianSplats3D walkthrough prototype
  └── Day 5:   Polish, mobile responsiveness

Week 2 (Days 6-10):
  ├── Day 6-7: End-to-end flow testing & fixes
  ├── Day 7-8: Render gallery, better UX
  ├── Day 8-9: Auth + database integration
  └── Day 9-10: Deploy to Vercel, final testing

Week 3 (Days 11-13):  [BUFFER]
  ├── Premium tier gating
  ├── Bug fixes from testing
  └── Investor demo preparation
```

**Target: Investor-ready demo in ~2 weeks**
