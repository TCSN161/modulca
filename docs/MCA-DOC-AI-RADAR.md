# MCA-DOC-AI-RADAR — what's new in Claude / AI tools and what we do with it

**Status**: Living doc. Last sweep: 2026-11-26 (9.01); refresh 2026-11-27 (9.02). Weekly top 3 on Fridays in `docs/radar/WEEKLY-*.md`; full sweep on the monthly "AI upgrade day" (first Monday of the month).
**Owner**: Chat 9 Radar (registered 2026-11-26). MAIN routes what it proposes. Every chat may propose rows through handoffs.
**Related**: [[MCA-DOC-SPRINT-2026-11-26-27]] §4

Status legend: ✅ using · 🧪 try next · 📅 planned (with date) · 👀 watch (also: anything not verified on an official source) · ⛔ not for us

---

## 0. Inbox (Costin pastes links here, Radar triages)

| Date | Link / note | From | Triage |
|---|---|---|---|
| 2026-11-26 | First sweep (web search + official pages), no links from Costin yet | Radar | rows in §1–§5; notes in `docs/radar/2026-11-26-*.md` |
| 2026-11-27 | Blender extension install error on Costin's PC; 3D quality track 3.10/3.11 | MAIN | §4 + [Blender note](radar/2026-11-26-blender-connector.md): run the official server from Claude Code |

Links can be YouTube, X, blogs or Anthropic posts. Radar reads or summarizes each one and moves it into a category below, or marks it ⛔.

---

## 1. Inside the product (Claude API — what our users get)

| Capability | Use in ModulCA | Status |
|---|---|---|
| Current models, $ per M tokens in/out: Haiku 5.5 from 0.10/0.50 · Sonnet 5.5 2/10 · Opus 5.5 4/20 · Fable 5.2 8/40 (top, 9 Nov) | Consultant on Sonnet; Haiku for translation and tagging | ✅ Sonnet · 🧪 Haiku (W49) |
| Haiku 5.5 (7 Oct): rejects `temperature`/`top_p`/`top_k`, `budget_tokens`, prefill; counts more tokens | [Note](radar/2026-11-26-claude-haiku-5-5.md) before replacing DeepSeek in `catuc-translate` | 🧪 W49 (Chat 2) |
| Fable 5.2 | Too expensive for user chat; needs 30-day data retention | ⛔ product · 👀 hard one-off jobs |
| Model retirements: Sonnet 4.5 on 30 Nov 2026, Opus 4.5 on 22 Jan 2027 | Neither found in `src/` or `scripts/` (searched 26 Nov) | ✅ nothing to do |
| API version 2026-10-21 + TypeScript SDK 1.0: sampling params removed | We are on SDK ^1.14; consultant fixed in `70db407` | ✅ keep in mind for new routes |
| Prompt caching (Sonnet 5.5 cache reads now $0.10/M) | Consultant KB prompt | ✅ shipped `70db407` |
| Citations on documents | Consultant quotes the exact CATUC article | 📅 Phase 3 (W50) |
| Structured outputs | CATUC checker verdict, Express brief | 📅 W50 |
| Vision (image input) | Read land photos, sketches, existing plans | 📅 after beta |
| Message Batches (−50%) | Bulk library translation | 📅 Jan |
| Agent Skills (docx / pptx / xlsx / pdf) | Pro-grade client presentation, document pack, cost sheet | 📅 Jan |
| Models API | Auto "new model available" check | 📅 sprint E2 |
| Message threads (beta, 2 Nov; expire after 5 min idle) | Smaller requests in long consultant chats; caching covers us today | 👀 |
| Usage and Cost Analytics API (beta, 29 Oct) | Automatic AI-spend line against the €50 cap; access for our account type unverified | 👀 |
| Managed Agents | Long background jobs (e.g. full Express run) | 👀 |
| MCP connector | Let the consultant call our own tools/data | 👀 |

## 2. How we build (Claude Code / desktop)

| Capability | Use | Status |
|---|---|---|
| Parallel sessions per chat + handoff files | Our multi-chat workflow | ✅ |
| Built-in browser | MAIN runs the E2E smoke test on modulca.eu | 📅 sprint M4 |
| Claude in Chrome | Tests that need your real logged-in browser | 🧪 |
| Subagents / forks | Wide searches without filling main context | ✅ |
| Hooks | Pre-commit guard: no reviewer name, no `.new.md` in the index | 📅 W49 |
| /code-review (since ~19 Nov: bugs + CLAUDE.md breaks only; cleanup moved to /simplify) | Before deploying Phase 3 code | 📅 W50 |
| Scheduled routines (cloud) | Weekly ops:check + model check | 👀 Jan (needs cloud access to repo) |
| Plugins / skills marketplace | Team-specific workflows packaged once | 👀 |
| Skills served from MCP servers (beta, 25 Nov) | A connected tool can bring its own how-to | 👀 |
| Claude Ship (23 Nov): reviews, fixes and approves PRs | We push to master; plan and price unverified | 👀 |
| Worktrees | Two chats editing code at the same time safely | 🧪 when collisions start |

## 3. Office, docs and organization (claude.ai + connectors)

| Capability | Use | Status |
|---|---|---|
| Claude Sheets (beta, 10 Nov; exports .xlsx/CSV; paid plans per secondary sources) | Beta cohort tracker (budget done in [MCA-DOC-BUDGET-2026](MCA-DOC-BUDGET-2026.md)), cost estimator — [note](radar/2026-11-26-claude-sheets-office.md) | 🧪 |
| Claude for Google Docs / Sheets / Slides add-on (beta) | Same sheets, edited where Costin already keeps them; needed plan not stated on the product page | 🧪 |
| Claude for Excel / Word / PowerPoint / Outlook add-ins (Pro, Max, Team, Enterprise) | Only if you work in Microsoft 365 | 👀 |
| Word / Google Docs, Claude Docs (in any chat since 16 Sep) | Vlad agreement, DPA letters, press kit | 🧪 |
| PowerPoint / Claude Slides (in any chat since 16 Sep) | Investor deck, webinar slides for architects | 🧪 |
| Artifacts (all plans; install as desktop app in beta, 24 Nov) | Investor one-pager, internal dashboards (sprint board, budget) | 🧪 |
| Interactive connectors (10 Nov): partner apps open inside Claude (Adobe, Notion; Figma announced per secondary source) | Marketing visuals without leaving the chat | 👀 (Chat 6) |
| Send/save files with connected apps (beta, 24 Nov, Pro/Max) | Drop generated PDFs into Drive | 👀 |
| Gmail / Calendar connectors | Draft partner emails, schedule the Vlad call | 👀 (always with your approval before sending) |
| Claude Meetings (beta, Team/Enterprise only) | Notes on partner calls; needs a pricier plan | ⛔ for now |

## 4. Visuals: renders, video, 3D, presentation, promotion

Owner of the upgrades: Chat 3 Engines (renders, video, 3D) · Chat 6 Marketing (promotion) · Chat 5 Drawings (technical docs).

| Area | Tool / tech | Use | Status |
|---|---|---|---|
| Image renders | Our ~19 engines (Cloudflare free today; FLUX / Gemini / OpenAI image paid) | Concept renders in the wizard and Express | ✅ Cloudflare · 👀 paid ones after revenue |
| Image renders | Cloudflare FLUX.2 klein 4B: ~95 free 1024² images/day; takes input images — [note](radar/2026-11-26-cloudflare-flux2-klein.md) | Better free renders, and render from our 3D view | 🧪 (Chat 3) |
| Image renders | Cloudflare FLUX.2 klein 9B: only ~7 free images/day | Admin / hero shots at most | 👀 |
| Image renders | Cloudflare retired 24 models on 20 Nov (incl. SDXL) | None of our model IDs is on the list | ✅ nothing to do |
| Image renders | Image-to-image / ControlNet-style "render this exact 3D view" — [comparison](radar/2026-11-26-render-3d-engines.md) | Renders that match the real design, not a random house | ✅ klein 4B live · 🧪 bake-off 3.06 |
| 3D → photo | AI Horde ControlNet (canny / depth), free | Real structure control at €0, quality unknown | 🧪 (Chat 3) |
| 3D → photo | Stability Control Structure, $0.05, 25 credits ≈ 5 renders | Quality benchmark with a strength setting | 🧪 (Chat 3) |
| 3D → photo | fal FLUX.2 klein edit $0.01/MP · BFL klein ≈$0.015 | Cheap paid overflow | 👀 after revenue |
| 3D → photo | Replicate FLUX depth / canny (≈$0.025, secondary source) | Strict geometry from our own depth map | 🧪 if free options fail |
| 3D → photo | Vercel AI Gateway free credit (amount and image coverage unconfirmed) | Second free klein pool | 👀 |
| 3D → photo | Gemini image edit ($0.0336, no free tier) | Paid alternative | 👀 |
| Image renders | Qwen-Image 2.1, MiniMax H3-Image (open weights; licenses restrictive or conflicting) | Self-hosting would need a GPU | 👀 |
| Image renders | Gendo, RenderAI and similar sketch-to-render (free starts, vendor claims) | Compare quality against ours | 👀 |
| Upscaling | AI upscalers (already have `/api/ai-render/upscale`) | Print-quality images for PDF | 👀 |
| Video | Canvas recording of AutoTour (no AI, €0) | Walkthrough video v0 | 📅 W50 |
| Video | LTX-2.5 open weights (free under $10M revenue, per model card; needs GPU) | Short animated flythroughs | 👀 Jan (with revenue) |
| Video | Wan 2.2 (Apache 2.0, ~24 GB GPU, secondary sources) | Alternative to LTX | 👀 |
| Video | NotebookLM "Scurt" / "Explicații" | CATUC explainers, Shorts | ✅ (Chat 6 pilot) |
| 3D web | Three.js + React Three Fiber + postprocessing | Live 3D in the browser | ✅ · 📅 postprocessing 3 (W50) |
| 3D assets | gltf-transform | Compress the redone GLB models (today ~0.35 MB in total, little to gain before remodelling) | 📅 W50 |
| 3D assets | Blender + official Blender connector for Claude (Blender Lab) — [note](radar/2026-11-26-blender-connector.md) | Asset pipeline, module variants, baked light; desktop extension fails to install (27 Nov), plan B in the note | 📅 5–6 Dec (3.10, 3.11) |
| 3D assets | Hunyuan3D / TripoSR / Modly image-to-3D (local GPU) | Furniture props; check Hunyuan's license for EU use first | 👀 |
| 3D capture | Gaussian splats / photogrammetry | Scans of built houses (investors: "show real houses") | 👀 after Cornetu |
| AR / VR | `@react-three/xr` (already a dependency) | "Place the house on your land" on a phone | 👀 after beta |
| Presentation | Claude Agent Skills (pptx / pdf) | Polished client presentation, investor deck | 📅 Jan |
| Design | Figma / Claude Design artifacts | UI polish, marketing visuals | 👀 |
| Promotion | Canva / CapCut-style editors, infographics from NotebookLM | Social posts, Shorts editing | 👀 (Chat 6) |

## 5. Other software that could help

| Tool | Use | Status |
|---|---|---|
| Google Analytics 4 + Microsoft Clarity + Vercel Analytics (all already installed) | Where visitors come from, what they click, where they drop off | ✅ installed · 🧪 read them weekly |
| Playwright (already a dev dependency) | Automated browser tests (Express golden briefs) | 📅 W50 |
| Resend (already used) | Product-update emails to users who opt in | 🧪 |
| NotebookLM | CATUC content, internal QA (see the CATUC strategy doc §6) | ✅ |

---

## 6. Sources Radar checks on upgrade day

- Claude API: [release notes](https://platform.claude.com/docs/en/release-notes/overview) · [models](https://platform.claude.com/docs/en/about-claude/models/overview) · [deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- Claude apps: [release notes](https://support.claude.com/en/articles/12138966-release-notes) · [product updates](https://claude.com/resources/product-updates) · [Claude Code changelog](https://code.claude.com/docs/en/changelog)
- Cloudflare Workers AI: [changelog](https://developers.cloudflare.com/changelog/product/workers-ai/) · [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Our own checks: `engines-model-check.mjs` (render engines + Anthropic models)
- Costin's inbox (§0)
