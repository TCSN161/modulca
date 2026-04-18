# Knowledge Library Translation Guide

The KB system supports per-article translations via filename suffix.

## Pattern

**Source article** (English, always required):
```
src/knowledge/04-neufert-standards/room-dimensions.md
```

**Romanian translation** (same folder, add `.ro` suffix before `.md`):
```
src/knowledge/04-neufert-standards/room-dimensions.ro.md
```

## Supported languages

Set in `src/knowledge/_types.ts` → `KBDocumentMeta.language`:
- `en` (default source)
- `ro` (Romanian)
- `nl` (Dutch)
- `de` (German)
- `fr` (French)

To add more: edit `SUPPORTED_LANGS` in `scripts/build-knowledge.mjs`.

## What happens at build time

When you run `npm run build:kb` (or any `npm run build` triggering prebuild):

1. Script scans every `.md` file
2. Detects language from filename (`room-dimensions.ro.md` → `language: "ro"`)
3. For non-English articles, auto-generates:
   - `id`: `room-dimensions-ro` (unique so both coexist in index)
   - `translationOf`: `room-dimensions` (links back to EN source)
   - `language`: `ro`
4. Writes updated `_index.ts` with both versions

## Translation frontmatter example

Copy the source article and change:

```yaml
---
id: room-dimensions          # <-- leave same; build appends -ro automatically
title: Dimensiuni camere     # <-- translated
category: neufert-standards
tags:
  - dimensiuni
  - camere
  - neufert
sources:
  - Neufert Architect's Data (RO)
difficulty: beginner
lastUpdated: "2026-04-18"
proOnly: false
language: ro                 # <-- optional, auto-detected from filename
---

# Conținutul tradus în română...
```

**Note**: `language` in frontmatter is optional — the filename suffix is the source of truth. But including it is good practice.

## How the UI picks the right version

Client code that wants the current locale's KB article:

```ts
import { ARTICLES } from "@/knowledge/_index";
import { getLocale } from "next-intl/server";

const locale = await getLocale();  // "en" | "ro" | "nl"
const enArticle = ARTICLES.find((a) => a.id === "room-dimensions");
const localized = ARTICLES.find(
  (a) => a.language === locale && a.translationOf === "room-dimensions"
);

return localized || enArticle;  // Fallback chain: locale → EN
```

Same pattern as `src/features/blog/locale.ts` — `getLocalizedArticle()` style.

## Priority articles for RO translation (recommendation)

Based on Romanian market SEO:

1. `06-regulations/RO/building-permit-process.md` → `.ro.md` (highest: "permis construcție" 890 searches/mo)
2. `06-regulations/RO/certificate-of-urbanism.md` → `.ro.md`
3. `04-neufert-standards/room-dimensions.md` → `.ro.md`
4. `04-neufert-standards/kitchens.md` → `.ro.md`
5. `04-neufert-standards/bathrooms.md` → `.ro.md`
6. `04-neufert-standards/bedrooms.md` → `.ro.md`
7. `01-fundamentals/modular-construction.md` → `.ro.md`
8. `12-cost-estimation/cost-per-sqm.md` → `.ro.md`
9. `13-sustainability/passive-house.md` → `.ro.md`
10. `06-regulations/RO/seismic-p100.md` → `.ro.md`

## After translating, verify

```bash
cd C:\Users\Costin\Documents\modulca
npm run build:kb          # regenerates _index.ts with new translations
npx tsc --noEmit          # verify types still clean
npx vitest run            # verify tests still pass
```

## Git workflow

1. Create the `.ro.md` file alongside the `.md` source
2. `npm run build:kb` to regenerate `_index.ts`
3. Commit both the new `.ro.md` and the updated `_index.ts`
4. Push — Vercel rebuilds automatically
