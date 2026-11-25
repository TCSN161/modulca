# MCA-STRAT-CATUC-SERVICE-CONTENT-2026-11-25

**Status**: Accepted direction (Costin, 2026-11-25). Execution mostly Phase 3 (architecture rule) + Jan 2027 (content channel).
**Owner**: Chat 6 Marketing (communication, content, positioning — registered 2026-11-25) · Chat 2 Neufert + Chat 5 Drawings (Phase 3 build, §3 rule) · Chat 1 MAIN (cross-chat decisions)
**Related**: [[MCA-DOC-ROADMAP-ALL-CHATS-2026-11-23]] · [[MCA-SPEC-CATUC-PHASE3-PLATFORM]] · [[MCA-HANDOFF-7-VLAD-ENGAGEMENT-2026-11-23]]

---

## 1. The idea in one paragraph

CATUC 169/2026 is new (in force since 25.08.2026) and few people have read it — homeowners *and* many professionals. ModulCA becomes the go-to place that **explains CATUC clearly** (articles, checker, videos) and **prepares the paperwork** (pre-filled drafts from the client's data). Every person who arrives with a permit question is a potential modular-house customer. Content channels (YouTube, social) measure demand and feed the funnel.

**Funnel**: video / article → free CATUC checker on modulca.eu → email → document pack or architect → modular house.

---

## 2. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | Build the permit/CATUC service as a **detachable module now**, not a separate site | Zero extra cost if done right in Phase 3; spin-out stays cheap |
| D2 | At launch it lives as a **section of modulca.eu** (working name `/autorizare`) | One brand, one account, one billing; CATUC articles build modulca.eu's search ranking |
| D3 | Separate site or subdomain **only when the data says so** (see §4 trigger) | A separate site from day 1 splits traffic and doubles the work |
| D4 | AI generates **drafts and forms only**. Anything needing an architect's signature (PAC, simplified technical project for notification) goes through a real architect | Law: art. 295(4), 298(2); OAR deontology ("courtesy signature" not allowed) |
| D5 | Content channel pilot **after Vlad reviews F2/F3**, full channel from Jan (Phase 6) with Chat 6 Marketing | Topic is hot now, but brand voice not final and beta comes first |

---

## 3. Architecture rule for Phase 3 (binding for Chat 2 + Chat 5)

The checker, Profile Engine and PermitTracker are built so they could be lifted out into another app with minimal work:

- Own folders: `src/features/catuc/**` (Chat 2), `src/features/permits/**` (Chat 5). Own API routes under `src/app/api/catuc-check/**`, `src/app/api/permits/**`.
- **No imports from the configurator** (`design`, `wizard`, `preview`, …). The data flows the other way: the configurator *calls* the module through a small typed input (`PermitProjectInput`: location, rural/urban, area, levels, basement, protected zone, use).
- The module works **standalone**: a user who never designed a house can fill the same input by hand (form) and get the same result.
- Shared things only via `src/shared/**` (auth, billing, UI kit).
- i18n from day 1 (RO first, EN), per project design principles.

Check at end of Phase 3: `grep` for configurator imports inside `features/catuc` and `features/permits` returns 0.

---

## 4. Spin-out trigger (when to consider a separate site)

Review at the Jan 15 Go/No-Go and again ~3 months after public launch. Consider a subdomain/separate brand if **two or more** are true:
- ≥ 40% of users use only the permit/CATUC part and never open the configurator
- Professionals (architects, small firms) become a large paying group of their own
- The permit brand needs a different tone/audience than the modular-house brand
- SEO data shows the CATUC section ranking on its own (not helped by the house pages)

---

## 5. Monetization ladder (prices are rough estimates, to validate in beta)

| Level | What the user gets | Price |
|---|---|---|
| Free | CATUC checker ("what procedure do I need?"), articles, basic checklist, videos | €0 — lead magnet |
| Document pack | Pre-filled drafts: certificat de urbanism request, notification form, declarations (e.g., art. 299(12) annex declaration), project brief for the architect | €9–29 one-off |
| Checked by an architect | Draft + PAC / simplified project done by a partner architect | Architect's own fee (client pays architect). Platform fee **only if OAR rules allow** (question open with Vlad) |
| Professionals | Document generator + CATUC tools for architects / small firms | Part of **Architect tier €49.99/mo** (strengthens that tier) |
| Final step | "You want to build? Here's the modular solution" | Core ModulCA revenue |

**Dependencies / limits**
- Official notification form must be approved by ministerial order (art. 295(10)) — templates follow the official form when published.
- Every legal statement in a document or page carries an article reference.
- "Informational only, does not replace professional advice" disclaimer everywhere.

---

## 6. NotebookLM Studio — what each tool is good for

All tools available in the free tier, in Romanian, from the same CATUC notebook (2 sources). AI usage is capped (usage bar) → generate selectively, not everything.

| NotebookLM tool | Formats | Best use for ModulCA | Channel |
|---|---|---|---|
| **Rezumat video** | **Scurt** (portrait, new) · Explicații (landscape) | Scurt = one question per video ("Pot construi o anexă fără autorizație?"). Explicații = long explainer per topic | Shorts / Reels / TikTok · YouTube long |
| **Rezumat audio** | Analiză detaliată · Rezumat · **Analiză critică** · Dezbatere | Detaliată = podcast episodes. Dezbatere = engaging topics (notificare vs autorizație). **Analiză critică = internal QA: run it on our own F2/F3 drafts to find gaps before Vlad** | Podcast / YouTube audio · internal |
| **Prezentare** | Prezentare detaliată · Slide-uri pentru prezentator | Detaliată = downloadable "Ghid CATUC" PDF (email-gated lead magnet). Slide-uri = webinars for architects, investor/partner talks | Website · webinars |
| **Hartă mintală** | — | **Internal**: decision tree for the checker / Profile Engine (which regime applies when). Also a visual for articles | Internal · site |
| **Raport** | Interactiv (new) · Document | Drafts for articles/guides (then through Chat 2 pipeline + Vlad), internal briefings | Internal |
| **Cartonașe** | count, difficulty, images | Onboarding for beta users and partners; "learn CATUC in 10 cards" | Site / social carousel |
| **Test** | count, difficulty, question types | Interactive quiz "Ce procedură îți trebuie?" (we already have `src/features/quiz`) → email capture | Site · social |
| **Infografic** | landscape/portrait/square, styles, detail level | Carousels and posts: limits (20 m², 2,5 m, 150 mp), timelines (15 zile lucrătoare) | Instagram / LinkedIn / Pinterest · articles |

Tips from the settings screens:
- Always fill the "focus / subject" box with **one narrow topic** + the target audience (homeowner vs architect). Generic prompts give generic results.
- Turn on **"Examinează notele producătorului" / structure preview** for video and presentations — lets us fix the script before generation (saves usage quota and catches errors).
- Use "Scurt" length for social, "Prestabilit" for long-form.

---

## 7. Quality gate (non-negotiable — legal content)

Every public piece (video, audio, infographic, quiz) passes:
1. **Fact check against the law text** (`docs/references/catuc/catuc-169-2026-text.md`) — article numbers, limits, deadlines. NotebookLM can be wrong (example: Q9 cited an order number not found in our sources).
2. **Disclaimer** in description/caption + link to the source article on modulca.eu.
3. **Vlad review** for flagship pieces (long videos, PDF guide). Shorts on verified facts can go with internal check only.
4. Correct terms: **PAC** (not DTAC), notificare, certificat de urbanism.
5. Brand check: logo, tone, call-to-action to modulca.eu.

Open check: confirm Google's terms allow commercial use of NotebookLM-generated audio/video (expected OK, not yet verified).

---

## 8. Content pilot plan

| When | What | Owner |
|---|---|---|
| Dec (after Vlad's F2/F3 review) | **3–5 Shorts** on verified facts: anexa 20 m² / 2,5 m · casa prin notificare 150 mp rural · aprobare tacită 15 zile · DTAC → PAC · ce studii îți trebuie | Costin + MAIN check |
| Dec | Internal: "Analiză critică" audio on F2/F3 drafts; mind map → checker decision tree | Chat 2 |
| Jan (Phase 6) | Open **Chat 6 Marketing**: channel setup, posting rhythm (e.g., 2 Shorts + 1 long / week), lead-magnet PDF, quiz on site | Chat 6 |
| Feb 1 → | Content plan tied to launch; measure (§9) | Chat 6 |

Face/voice: AI voices are fine for drafts and audio overviews; **your own voice or face** (and Vlad's, if he agrees) builds more trust for the flagship videos.

---

## 9. Metrics (what tells us demand is real)

- Views, watch time, subscribers per topic → which CATUC questions people care about
- Clicks to modulca.eu, checker uses, email signups
- Document pack purchases (after launch), architect referrals
- Share of users who go from checker → configurator (feeds the §4 spin-out trigger)

---

## 10. Open questions (not blocking now)

1. Channel name: under ModulCA, or a separate "CATUC explained" brand? (Default: ModulCA — one brand, per D2.)
2. Are you OK to appear on camera / voice? Would Vlad?
3. Social handles reserved? (Weekend plan option C — still open.)
4. Google terms for commercial use of NotebookLM outputs (§7).
5. OAR rule on platform fees for architect referrals (asked in Vlad call).
