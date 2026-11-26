# MCA-DOC-AI-RADAR — what's new in Claude / AI tools and what we do with it

**Status**: Living doc. MAIN triages it every Friday and does a full sweep on the monthly "AI upgrade day" (first Monday of the month).
**Owner**: Chat 9 Radar (registered 2026-11-26). MAIN routes what it proposes. Every chat may propose rows through handoffs.
**Related**: [[MCA-DOC-SPRINT-2026-11-26-27]] §4

Status legend: ✅ using · 🧪 try next · 📅 planned (with date) · 👀 watch · ⛔ not for us

---

## 0. Inbox (Costin pastes links here, MAIN triages)

| Date | Link / note | From | Triage |
|---|---|---|---|
| | | | |

Links can be YouTube, X, blogs or Anthropic posts. MAIN reads or summarizes each one and moves it into a category below, or marks it ⛔.

---

## 1. Inside the product (Claude API — what our users get)

| Capability | Use in ModulCA | Status |
|---|---|---|
| Current models (Sonnet 5.5, Haiku 5.5 cheap, Opus 5.5 top) | Consultant on Sonnet; Haiku for translation and tagging | ✅ Sonnet · 🧪 Haiku (W49) |
| Prompt caching | Consultant KB prompt (−50–90% input cost) | 📅 sprint N1 |
| Citations on documents | Consultant quotes the exact CATUC article | 📅 Phase 3 (W50) |
| Structured outputs | CATUC checker verdict, Express brief | 📅 W50 |
| Vision (image input) | Read land photos, sketches, existing plans | 📅 after beta |
| Message Batches (−50%) | Bulk library translation | 📅 Jan |
| Agent Skills (docx / pptx / xlsx / pdf) | Pro-grade client presentation, document pack, cost sheet | 📅 Jan |
| Models API | Auto "new model available" check | 📅 sprint E2 |
| Managed Agents | Long background jobs (e.g. full Express run) | 👀 |
| MCP connector | Let the consultant call our own tools/data | 👀 |

## 2. How we build (Claude Code / desktop)

| Capability | Use | Status |
|---|---|---|
| Parallel sessions per chat + handoff files | Our whole 7-chat workflow | ✅ |
| Built-in browser | MAIN runs the E2E smoke test on modulca.eu | 📅 sprint M4 |
| Claude in Chrome | Tests that need your real logged-in browser | 🧪 |
| Subagents / forks | Wide searches without filling main context | ✅ |
| Hooks | Pre-commit guard: no reviewer name, no `.new.md` in the index | 📅 W49 |
| /code-review | Before deploying Phase 3 code | 📅 W50 |
| Scheduled routines (cloud) | Weekly ops:check + model check | 👀 Jan (needs cloud access to repo) |
| Plugins / skills marketplace | Team-specific workflows packaged once | 👀 |
| Worktrees | Two chats editing code at the same time safely | 🧪 when collisions start |

## 3. Office, docs and organization (claude.ai + connectors)

| Capability | Use | Status |
|---|---|---|
| Excel / Google Sheets skills | Cost estimator sheets, beta cohort tracker, budget tracking (€50 cap) | 🧪 |
| Word / Google Docs | Vlad agreement, DPA letters, press kit | 🧪 |
| PowerPoint / Slides | Investor deck, webinar slides for architects | 🧪 |
| Artifacts (pages / apps made by Claude, shareable) | Investor one-pager, internal dashboards (sprint board, budget) | 🧪 |
| Gmail / Calendar connectors | Draft partner emails, schedule the Vlad call | 👀 (always with your approval before sending) |

## 4. Visuals: renders, video, 3D, presentation, promotion

Owner of the upgrades: Chat 3 Engines (renders, video, 3D) · Chat 6 Marketing (promotion) · Chat 5 Drawings (technical docs).

| Area | Tool / tech | Use | Status |
|---|---|---|---|
| Image renders | Our ~19 engines (Cloudflare free today; FLUX / Gemini / OpenAI image paid) | Concept renders in the wizard and Express | ✅ Cloudflare · 👀 paid ones after revenue |
| Image renders | Image-to-image / ControlNet-style "render this exact 3D view" | Renders that match the real design, not a random house | 🧪 W50 (Chat 3) |
| Upscaling | AI upscalers (already have `/api/ai-render/upscale`) | Print-quality images for PDF | 👀 |
| Video | Canvas recording of AutoTour (no AI, €0) | Walkthrough video v0 | 📅 W50 |
| Video | AI video (LTX, Wan OSS, others) | Short animated flythroughs | 👀 Jan (with revenue) |
| Video | NotebookLM "Scurt" / "Explicații" | CATUC explainers, Shorts | ✅ (Chat 6 pilot) |
| 3D web | Three.js + React Three Fiber + postprocessing | Live 3D in the browser | ✅ · 📅 postprocessing 3 (W50) |
| 3D assets | gltf-transform | Compress the 20 GLB models (faster loads) | 📅 W49 |
| 3D assets | Blender (+ Python, optionally a Blender MCP so Claude drives it) | Asset pipeline, module variants, baked light | 📅 Jan |
| 3D capture | Gaussian splats / photogrammetry | Scans of built houses (investors: "show real houses") | 👀 after Cornetu |
| AR / VR | `@react-three/xr` (already a dependency) | "Place the house on your land" on a phone | 👀 after beta |
| Presentation | Claude Agent Skills (pptx / pdf) | Polished client presentation, investor deck | 📅 Jan |
| Design | Figma / Claude design artifacts | UI polish, marketing visuals | 👀 |
| Promotion | Canva / CapCut-style editors, infographics from NotebookLM | Social posts, Shorts editing | 👀 (Chat 6) |

## 5. Other software that could help

| Tool | Use | Status |
|---|---|---|
| Google Analytics 4 + Microsoft Clarity + Vercel Analytics (all already installed) | Where visitors come from, what they click, where they drop off | ✅ installed · 🧪 read them weekly |
| Playwright (already a dev dependency) | Automated browser tests (Express golden briefs) | 📅 W50 |
| Resend (already used) | Product-update emails to users who opt in | 🧪 |
| NotebookLM | CATUC content, internal QA (see the CATUC strategy doc §6) | ✅ |

---

## 6. Sources MAIN checks on upgrade day

- Anthropic news + Claude API release notes + Claude Code changelog
- Our own checks: `engines-model-check.mjs` (render engines + Anthropic models)
- Costin's inbox (§0)
