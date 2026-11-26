# MCA-DOC-BETA-SMOKE-TEST — full-platform smoke test (reusable)

Owner: Chat 1 MAIN. First run: session `1.03.MAIN_Smoke-Test-Full-Platform_20261126`.
Target: production **https://www.modulca.eu** (built-in browser). Flows = `MCA-DOC-SPRINT-2026-11-26-27.md` §0.
Bug owners = `MCA-DOC-CHAT-WORKFLOW-2026-11-22.md` §10 (by path).

## Rules for every run

- **Production ≠ test host.** Claude never types passwords or card numbers (test cards included). At login, Costin signs in himself in the browser pane; at Stripe checkout Claude stops on the page.
- Prefer `read_page` / `get_page_text`; screenshots only for visual checks (3D, renders).
- After each flow: `read_console_messages {onlyErrors:true}`; note failed requests in `read_network_requests`.
- Each problem → one row in §3 with exactly one owner chat (by the path of the file that must change).
- Renders cost quota (5/day per user on beta/premium). Use at most 2–3 per run.

## 1. Checklist (click by click)

### F-A Auth (owner: Chat 4 `features/auth` types / MAIN store)
1. Open `/` as guest → header shows "Login"/"Register"; no console errors.
2. Open `/login` → email + password form and "Continue with Google" button visible.
3. Open `/register` → form renders; beta/promo text visible if applicable (do not submit).
4. **Costin** signs in (Google or email) with the Constructor account.
5. After redirect: header shows the user's name/avatar; `/dashboard` loads the project list.
6. `/dashboard/account` → plan shows **Constructor** (comp), not Free/Guest.
7. Reload `/dashboard` → still signed in (session persists).

### F-B Wizard — 14 steps, save, reload, resume (owner: Chat 5)
1. `/project/new` (or "New project" on dashboard) → project id created, lands on step 1.
2. Step 1 **land** `/project/[id]/land`: draw/choose a plot (polygon or grid cells). Note cell count.
3. Step 2 **marketplace**: page renders; terrain list or "own land" mode works.
4. Step 3 **design**: place/generate modules (≥2). Note module count.
5. Step 4 **output** (preview): floor plan renders.
6. Step 5 **style**: pick a style direction / finish level.
7. Step 6 **configure**: per-module config opens.
8. Step 7 **visualize**: 3D view (see F-C).
9. Step 8 **render**: see F-D.
10. Step 9 **technical**: drawings/tech sheet render.
11. Step 10 **walkthrough**: first-person 3D loads (see F-C).
12. Step 11 **products**: add ≥2 products. Note product ids + quantities.
13. Step 12 **finalize**: summary shows land, modules, products, cost.
14. Step 13 **presentation**: see F-E. (+ side steps: `architect`, `choose`, `consultant` reachable from nav.)
15. **Save** (Save button / autosave indicator).
16. Hard reload on the products page, then go to `/dashboard` → open the same project.
17. **Check persistence**: land polygon/cells still there (BUG-X02 fix), products + quantities still there (BUG-X03 fix), modules + style unchanged.
18. Navigation: "Next"/"Back" from every step works; no dead end (step without a way forward).

### F-C 3D (owner: Chat 3 `*Three*` components; page shell Chat 5)
1. `visualize` → 3D canvas visible within 10 s; orbit with drag works.
2. `walkthrough` → loads within 10 s; movement controls documented on screen.
3. Console: no WebGL / Three errors.

### F-D AI renders (owner: Chat 3 `api/ai-render/**`; client caller Chat 5)
1. `render` step → generate render #1 (default engine). Wait ≤ 90 s.
2. Check network: `POST /api/ai-render` has `Authorization: Bearer …`; response header `X-AI-Engine` = a free engine (e.g. `cloudflare-klein`).
3. Generate render #2 (another style/prompt or engine).
4. Tier recognised: UI/response does not say guest/free limit 2; remaining quota (if shown) matches Constructor (unlimited/-1).
5. If upscale/background buttons exist: check whether `POST /api/ai-render/upscale` sends Bearer (known gap).
6. `/admin/engines` (if accessible): compare call `GET /api/ai-render/compare` — check Bearer (known gap).

### F-E Presentation + PDF (owner: Chat 3 presentation/PDF; data Chat 5)
1. `presentation` step → slides render with project name, modules, land.
2. Products slide lists the products added in F-B (BUG-X01 fix), not a placeholder catalogue.
3. Export PDF → download starts / blob generated without error (don't need to open the file; check console + network).

### F-F Consultant (owner: Chat 2)
1. `project/[id]/consultant` (or consultant widget) → ask 1 general question (e.g. "Ce suprafață minimă trebuie să aibă un dormitor?").
2. Ask 1 CATUC question (e.g. "Ce spune CATUC despre autorizarea unei case modulare în intravilan rural?").
3. Check: answers arrive; Constructor/Architect level uses Claude (network response / provider field if exposed); CATUC answer cites CATUC articles, not "no CATUC in library".

### F-G Billing — Stripe TEST (owner: Chat 4)
1. `/pricing` → 5 tiers with prices €19.99 / €49.99 / €149.90; beta promo text.
2. Click upgrade on one paid plan → Stripe Checkout page opens (`checkout.stripe.com`, TEST badge). **Stop here.** No card data.
3. `/dashboard/account` → "Manage subscription" / portal link present (comp account may have none — note it).

### F-H Library / blog / quiz (owner: Chat 2)
1. `/library` → article list renders; open 2 articles.
2. Search the list / articles for "DRAFT", "SKELETON", "TBD", reviewer names → none public.
3. `/library/building-permit-process` and `/library/ro-building-permit` → no draft content.
4. `/blog` + one `/blog/[slug]` render.
5. `/quiz` → first question renders, answer one.

### F-I Ops (owner: MAIN)
1. `GET /api/health` → 200, JSON with modules ok.
2. Console errors collected across the run (summarised in §3).
3. `/sitemap.xml`, `/robots.txt` respond 200.

## 2. Run log

| Run | Date | Who | Result |
|---|---|---|---|
| 1 | 2026-11-26 | 1.03 MAIN | see §4 |

## 3. BUG table

Run 1 test project: `Smoke Test 1.03` (id `5895a485-…`, Compact House → Small House preset, 4 modules, Scandinavian). Prefix `BUG-ST` = smoke test.

| BUG | Flow | Steps to reproduce | Expected vs actual | Owner chat (path) | Severity |
|---|---|---|---|---|---|
| BUG-ST01 | F-D | Constructor, `/project/[id]/render` → AI Premium → engine Auto → "Generate with AI" (tried twice, Text→Image and "3D + Text → Image") | Expected a free-engine image (`X-AI-Engine: cloudflare-klein`). Actual: `GET /api/ai-render` (Bearer sent ✅) → **503** `{"error":"All AI engines are currently busy"}` both times. Hypothesis: the constructor chain only lists premium-band (funded) engines, which `AI_ENGINES_DISABLED` / $0 balances knock out, and the free CF engines are not in it. **Supporting evidence**: Costin's PDF exported earlier today (Constructor) has renders from `cloudflare-klein-img2img`, `cloudflare-flux`, `ai-horde` **and funded `leonardo` + `stability-structure`**, so renders worked before the funded engines were disabled, and the constructor tier was spending on funded engines. | **Chat 3** `src/app/api/ai-render/**` (engine chain / creditManager bands per tier) | **high** (blocker: no render for paid tiers) |
| BUG-ST02 | F-D | Same as ST01; watch the network after the 503 | Expected: show the server message, no client fallback (Chat 3 SEC-02 row). Actual: the client calls `image.pollinations.ai` directly (no auth) → **402**; UI shows "failed (402). Try again or use a simpler prompt" (first time "failed (400)"), hiding the real cause | **Chat 5** `features/design/.../useRenderEngine.ts` / `RenderPage.tsx` | medium |
| BUG-ST03 | F-D | Render page → RENDER MODE "3D + Text → Image" → Generate | Expected: POST img2img with the 3D capture (cloudflare-klein). Actual: same `GET /api/ai-render?prompt=…` as text-only; "Image → Image" labelled "Coming soon" | **Chat 5** `features/design/components/render/**` | medium |
| BUG-ST04 | F-D | After 2 failed renders, open `/dashboard` | Expected: failed renders not counted (server refunds on 503). Actual: dashboard "AI RENDERS 2"; client PATCHes `profiles` after each attempt + `modulca-render-count-2026-11` in localStorage | **Chat 5** (render caller) → counter in `features/auth/store.ts` = MAIN | low |
| BUG-ST05 | F-D | Code check (confirmed): `RenderPage.tsx:623` + `:651` (upscale/background) and `admin/engines/page.tsx:105` (compare) | Expected: `Authorization: Bearer` like `/api/ai-render`. Actual: headers only `Content-Type` → server treats user as guest / 401 | **Chat 5** `RenderPage.tsx`; **MAIN** `src/app/admin/engines/page.tsx` | medium (known open item, confirmed) |
| BUG-ST06 | F-B / F-E | Products step: "Add to Project" ×2 (localStorage `modulca-selected-products` = 2 items) → open any other project step by full page load (URL / reload / Finalize) | Expected: page text says "Products are saved automatically", so they persist. Actual: the project loader overwrites localStorage with the cloud copy (`[]`) → products lost; Finalize "Save Project" then saves `[]`. Only the explicit **Save** button on the Products page persists them (verified: after Save → reload → presentation shows the product). | **Chat 5** `features/design/productSelection.ts` / `projectSnapshot.ts` / `ProductsPage.tsx` (autosave to cloud, or don't overwrite newer local) | **high** (BUG-X03 fix only half-works) |
| BUG-ST07 | F-E | Presentation for project "Smoke Test 1.03" | Expected: cover + PDF named after the project. Actual: cover "My Modular Home", PDF `My_Modular_Home_Presentation.pdf`; PROJECT NAME field empty | **Chat 3** `features/presentation/**` (read project name from snapshot) | low |
| BUG-ST08 | F-B | `/project/[id]/finalize` | Expected: summary lists selected products; "N projects saved" matches dashboard. Actual: no products section; "0 projects saved — synced to cloud" while dashboard has 3–4 | **Chat 5** `features/design/components/finalize/FinalizePage.tsx` (high-collision file → coordinate) | low |
| BUG-ST09 | F-B | Constructor → open `/project/[id]/architect` (step 14) by **full page load** (URL, reload, bookmark), wait 8 s | Expected: Architect workspace (constructor = full access). Actual: FeatureGate `projectCollaboration` → "Architect Feature — Upgrade to Architect". Reached by in-app link (from presentation) it **opens fine** (Overview/Phases/Client/Fees/DfMA…). So the auth store tier is not hydrated on a direct load (no `loadSession` / gate renders before it) | **Chat 5** `src/app/(app)/project/[id]/architect/page.tsx` (+ MAIN `features/auth/store.ts` if `loadSession` is the cause) | medium |
| BUG-ST10 | F-B | `/project/new` → name + pick "Compact House" template → Create | Expected: template's 4 modules applied. Actual: lands on Land step with quick-start presets; template choice seems ignored. Template buttons also have no accessible name | **Chat 5** `src/app/(app)/project/new/**` | low |
| BUG-ST11 | F-B | Clear local project cache, open `/dashboard` (first load) | Expected: project list. Actual: first load showed "PROJECTS 0 / No projects yet", second load showed all 4 (race in cloud fetch). Similar transient "Sign in to save your project" on the Products page while signed in | **Chat 5** dashboard list / `projectService.ts` | low |
| BUG-ST12 | F-B | Compare cost on Design/Finalize vs dashboard card | Design/Finalize €39,096; dashboard card for the same project €43,200 | **Chat 5** (cost calc used by dashboard card) | low |
| BUG-ST13 | F-F | Consultant (Constructor, provider `anthropic`, `claude-sonnet-5-5` ✅): "Ce spune CATUC (Legea 169/2026) despre autorizarea unei case modulare în intravilan rural? …" | Expected: answer from CATUC (notification = rural intravilan only, art. cited). Actual: "**Nu pot confirma existența acestui act normativ**", answers on Legea 50/1991 and says notification is not enough. RAG pulled `ro-building-permit` etc., but the live articles are still the L.50 versions (F2/F3 are `.new.md`, waiting for Vlad) | **Chat 2** `src/app/api/consultant/**` (system prompt must know CATUC exists / is in force) + content swap after review | **high** (wrong legal advice) |
| BUG-ST14 | F-G | Dashboard (Constructor comp) → Subscription → "Manage" | Expected: Stripe portal or "no subscription" message. Actual: `POST /api/stripe/portal` **401 "Authentication required"**: `openCustomerPortal()` in `src/shared/lib/stripe.ts` sends no Bearer | **Chat 4** `src/shared/lib/stripe.ts` + `api/stripe/**` | medium |
| BUG-ST15 | F-G | Code check: `startCheckout` in `src/shared/lib/stripe.ts:57` | Sends `{priceId, userId, userEmail}` in body, no Bearer; checkout session created → server trusts the body `userId` (could attach a subscription to another account) | **Chat 4** `api/stripe/checkout` + `shared/lib/stripe.ts` | medium (security) |
| BUG-ST16 | F-G | Constructor → `/pricing` | Expected: "Current plan" on Constructor, no "Upgrade" to a lower plan. Actual: "Upgrade to Premium" opens a real TEST checkout; completing it would make the new subscription current → webhook could **downgrade the comp account** to Premium | **Chat 4** pricing page / checkout guard | medium |
| BUG-ST17 | F-G | Compare `/pricing` with Stripe Checkout for Premium | Pricing: "50 AI renders/month, 10 projects", "AI consultant (GPT-4o)", "123/180 articles", price "€149.9". Stripe product: "30 AI renders/month, 5 projects". Health: library has 212 articles; consultant model gpt-5.4-mini | **Chat 4** (`features/auth/types.ts` copy + Stripe product text) | low |
| BUG-ST18 | F-A | Google sign-in from `/login` | Google screen says "to continue to **gtlldluonbtgjabokjfo.supabase.co**", not ModulCA. Looks untrustworthy to beta users. Fix = Supabase custom auth domain or Google OAuth consent branding | **MAIN** (Supabase/Google console config) | medium |
| BUG-ST19 | F-A | `/register` as guest | Expected (§0 F-A): beta promo visible at sign-up. Actual: no beta/3-month mention on /register (only on /pricing) | **Chat 4** `features/beta/**` | low |
| BUG-ST20 | F-I | Console across the run | 4× **React #418** (hydration text mismatch) on app pages (seen after dashboard/pricing/consultant/project steps) | **MAIN** triage → owner of the page once the component is found | low |
| BUG-ST21 | F-I | `GET /api/health` | 200 ok, but only providers + env. §6 rule 3 asks for auth, db, stripe, each image engine and KB-index (`.new.md`) checks; missing optional `POLLINATIONS_API_KEY`, `HUGGINGFACE_API_KEY` | **MAIN** `src/app/api/health/**` (with Chat 3 for engine probes) | low |
| BUG-ST23 | F-E | Costin's PDF `My_Modular_Home_Presentation (7).pdf` (9 modules, 20 pages): read the page footers | Expected "n / 20". Actual: mixed totals: "1 / 11" … "7 / 20" … "17 / 11", "20 / 11". The total ignores the extra render pages | **Chat 3** `features/presentation/**` (PDF) | low |
| BUG-ST24 | F-E | Same PDF, p.6 "Module Details" vs p.4 "Floor Plan" | Floor plan lists 9 modules; Module Details lists 8 (STORAGE missing: cut off / page overflow) | **Chat 3** `features/presentation/**` | low |
| BUG-ST25 | F-E | Same PDF, p.7–16 | 10 pages of AI renders (29 images, mostly repeated BEDROOM shots, each ~1024 px) → **14.9 MB** PDF. Expected: a curated set (e.g. latest/best per module, max 1–2 pages) and compressed images | **Chat 3** `features/presentation/**` (+ Chat 5 for render selection) | low |
| BUG-ST26 | F-E | Same PDF, p.3 "Site Plan" | "Polygon Points 0", location = default Bucharest centre (preset land). Site Plan slide has no plot/map when the land came from a preset → show the module grid or hide the slide | **Chat 3** presentation (data from Chat 5 land) | low |
| BUG-ST22 | F-H | `/blog/permis-constructie-romania`, `/library/ro-building-permit` | Live content still on Legea 50/1991, "DTAC" ×5 in the blog post (known ITEM-6 list, F9 / Vlad review) | **Chat 2** `features/blog/**`, `src/knowledge/**` | low (known) |

## 4. Summary (run 1, 2026-11-26, Constructor comp account)

| Flow | Result | Note |
|---|---|---|
| F-A Auth | ✅ pass | Google login (Costin), dashboard + account show **Constructor**, session persists. ST18, ST19 |
| F-B Wizard 14 steps + resume | ⚠️ partial | All steps render, no dead ends. **Land persists from cloud ✅ (BUG-X02 fixed)**. **Products lost unless explicit Save (ST06)**. Step 14 gated on direct load only; in-app nav opens the Architect workspace ✅ (ST09). ST08, ST10–ST12 |
| F-C 3D | ✅ pass | visualize canvas 0.5 s, walkthrough 0.8 s, furniture visible; no WebGL errors |
| F-D Renders | ❌ fail | Bearer sent ✅, tier not guest, but **0/2 renders** — server 503 (ST01), client Pollinations fallback (ST02). ST03–ST05 |
| F-E Presentation + PDF | ⚠️ partial | **Products slide shows products ✅ (BUG-X01 fixed)** when saved; PDF generated (21 KB, intercepted, not downloaded). Wrong project name (ST07); products vanish per ST06. Costin's own PDF (20 p.) confirms the products table (6 items, €162) ✅ + ST07, and adds ST23–ST26 |
| F-F Consultant | ⚠️ partial | Both answered via **anthropic / claude-sonnet-5-5 / tier constructor**, Bearer ✅. General ✅. CATUC answer wrong (ST13) |
| F-G Billing | ⚠️ partial | Pricing renders; Stripe **TEST checkout opens** (Sandbox, €19.99, stopped there). Portal 401 (ST14), ST15–ST17 |
| F-H Library/blog/quiz | ✅ pass | No DRAFT/SKELETON/TBD public; `building-permit-process` = 404; search for draft = 0; quiz works. Old-law content (ST22) |
| F-I Ops | ✅ pass (with notes) | `/api/health` 200 ok, sitemap/robots 200. React #418 (ST20), health scope (ST21) |

**Top 4 for MAIN routing**: ST01 (Chat 3), ST06 (Chat 5), ST13 (Chat 2), ST14+ST15+ST16 (Chat 4).
