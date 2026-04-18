# Template: Content & SEO Chat

**Use when**: translating content, publishing blog articles, writing KB articles, optimizing metadata/OG images, researching keywords, managing editorial calendar.

**Duration**: 2-6h typical.

**Permissions**: read source code for context; write only to content/docs folders.

---

## 📋 Copy-paste spawn prompt

```
===== BEGIN SPAWN PROMPT =====

ROLE: Content & SEO Chat
TASK ID: CONTENT-[FILL IN NEXT NUMBER FROM TRACKER]
SPAWN TIME: [FILL IN: YYYY-MM-DD HH:MM EET]
SIBLING CHATS: [FILL IN from TRACKER.md Active section, or "none"]

SCOPE: Content creation + SEO + translations. Read source for context; writes limited to content directories.

ALLOWED PATHS:
  READ: all of src/ (for context only — understand product), docs/ (full)
  WRITE:
  - src/knowledge/**/*.md (and *.ro.md, *.nl.md translations per TRANSLATION_GUIDE.md)
  - src/features/blog/articles.ts + articles-ro.ts + articles-ro-index.md
  - docs/blog-drafts/**
  - docs/sessions/active/YYYY-MM-DD-content-CONTENT-<id>.md (new)
  - docs/sessions/TRACKER.md (status column)
  - docs/TASK_MASTER.md (status column)

FORBIDDEN:
  - src/app/** (unless only injecting structured data, and only with main-chat GO)
  - src/features/** except src/features/blog/ and src/knowledge/ 
  - src/i18n/messages/*.json (UI translations = Frontend QA chat, not this)
  - scripts/, supabase/migrations/, package.json, .env*, .github/

READ FIRST:
  1. docs/sessions/README.md + PARALLEL_SESSIONS.md
  2. docs/ECOSYSTEM_ARCHITECTURE.md §6 (brand strategy) + §9 (monetization)
  3. docs/sessions/TRACKER.md
  4. src/knowledge/TRANSLATION_GUIDE.md (how to add .ro.md / .nl.md articles)
  5. src/features/blog/articles-ro-index.md (existing RO blog plan)
  6. docs/audits/2026-04-17.md §4 SEO & Marketing (audit findings)
  7. Last 2 content session scratchpads if any

TYPICAL TASKS (pick what this session tackles):

── Task 1: Translate KB articles RO ──────────────────
Priority list (highest RO-SEO value):
  1. 06-regulations/RO/building-permit-process.md → .ro.md
  2. 06-regulations/RO/certificate-of-urbanism.md → .ro.md
  3. 04-neufert-standards/room-dimensions.md → .ro.md
  4. 04-neufert-standards/kitchens.md → .ro.md
  5. 04-neufert-standards/bathrooms.md → .ro.md
  6. 04-neufert-standards/bedrooms.md → .ro.md
  7. 01-fundamentals/modular-construction.md → .ro.md
  8. 12-cost-estimation/cost-per-sqm.md → .ro.md
  9. 13-sustainability/passive-house.md → .ro.md
  10. 06-regulations/RO/seismic-p100.md → .ro.md

Pattern per article:
  - Read source EN .md
  - Create .ro.md alongside (same folder, .ro before .md)
  - Translate title, description, body — use Romanian diacritics (ă â î ș ț)
  - Keep metric units (already RO-friendly)
  - Preserve markdown formatting, headings, tables
  - Adjust "related articles" links to point to RO versions if they exist
  - Run `node scripts/build-knowledge.mjs` to regenerate _index.ts
  - Run `npx tsc --noEmit` to verify clean

── Task 2: Publish RO blog drafts ────────────────────
Draft files exist in docs/blog-drafts/ (5 articles, RO). Also exist in TS format in src/features/blog/articles-ro.ts (5 entries ready).
- Review each for polish (tone, diacritics, internal link accuracy)
- If live, articles will show on /blog when user toggles to RO locale
- Propose improvements if wording feels off — commit with user GO
- Do NOT change BlogArticle interface or routing logic

── Task 3: Meta + OG image optimizations ─────────────
Per audit (docs/audits/2026-04-17.md §4):
- P1: pricing page metadata — already done, verify
- P2: library description update ("82+" → "229+") — quick 5-min fix
- P1: Add Service schema to src/shared/lib/schema.ts — propose diff, user approves
- Consider expanding FAQ answers to 60-80 words for Google snippets

── Task 4: New RO blog articles (beyond the 5 existing) ──
- Reference docs/audits/2026-04-17.md Romanian keyword volume list
- Propose 3-5 more articles targeting: sustainable materials, permit process by region (Cluj, Brașov, București), case studies
- Draft in docs/blog-drafts/ first
- When approved by user: convert to articles-ro.ts entries

OPERATING RULES:
- Build verify after each batch: `npm run build:kb && npx tsc --noEmit && npx vitest run`
- Every 30 min: collision-check
- Commits: `content(scope): <what>` (e.g. `content(kb): translate room-dimensions to RO`)
- If a KB article is poorly written in EN (not just translation issue): flag in scratchpad, don't silently rewrite EN — that's a separate editorial task

SESSION OUTPUT:
docs/sessions/active/YYYY-MM-DD-content-CONTENT-<id>.md with:
  ## Translated articles (source → dest)
  ## Published blog articles (if any)
  ## Meta/OG changes proposed
  ## New content proposals (to review with user)
  ## Handoff

Final: commit + push + update TRACKER.md

===== END SPAWN PROMPT =====
```

## 🔗 Handoff signals

- Major translation batch done → Main chat: announce in /blog page or dashboard
- New schema proposed → Main chat reviews + commits SEO structural changes
- Content gap identified → Update TASK_MASTER.md backlog

## 💡 Tips

- RO diacritics: ă â î ș ț (not  ț  with cedilla — use comma-below versions)
- Keep tone consistent with existing RO blog drafts
- Internal links use slugs; when translating, preserve slug structure or use RO slug
