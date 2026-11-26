# MCA-DOC-AI-RADAR — what's new in Claude / AI tools and what we do with it

**Status**: Living doc. MAIN triages it every Friday and does a full sweep on the monthly "AI upgrade day" (first Monday of the month).
**Owner**: Chat 1 MAIN. Every chat may propose rows through handoffs.
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

## 4. Outside Claude (3D, video, design)

| Tool | Use | Status |
|---|---|---|
| gltf-transform | Compress the 20 GLB models | 📅 W49 |
| Blender (+ Python scripting, optionally a Blender MCP so Claude can drive it) | Asset pipeline, module variants, baked light | 📅 Jan |
| NotebookLM Studio | CATUC content, internal QA (see the CATUC strategy doc §6) | ✅ |
| Gaussian splats | Scans of built houses | 👀 after Cornetu |

---

## 5. Sources MAIN checks on upgrade day

- Anthropic news + Claude API release notes + Claude Code changelog
- Our own checks: `engines-model-check.mjs` (render engines + Anthropic models)
- Costin's inbox (§0)
