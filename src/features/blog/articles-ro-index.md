# Romanian Blog Articles - Index

Five Romanian-language blog articles converted from `docs/blog-drafts/` into the `BlogArticle` TypeScript format used by `src/features/blog/articles.ts`. Exported as `BLOG_ARTICLES_RO` from `src/features/blog/articles-ro.ts`.

All articles dated 2026-04-18, authored by "Echipa ModulCA".

## Recommended Publish Order

### 1. `casa-modulara-romania`
**Title:** Casa modulara in Romania - ghid complet 2026
**Why first:** Foundational pillar article. Defines what a modular home is, covers all major angles (cost, permits, choosing a builder) at a beginner level. The natural entry point for organic search traffic on "case modulare Romania" and feeds internal links to every other article.

### 2. `constructii-modulare-vs-traditionale`
**Title:** Constructii modulare vs traditionale - analiza comparativa 2026
**Why second:** The comparison query is the second-biggest search volume cluster. Converts visitors who read the pillar article and still need objective comparison data. Seismic and climate-resilience sections differentiate from generic European content.

### 3. `cost-casa-modulara-2026`
**Title:** Cat costa o casa modulara in Romania? Breakdown 2026
**Why third:** High commercial intent. Readers arriving at cost articles are further down the funnel. Includes three full scenarios (economic/premium/luxury) with per-component breakdowns, good for long-tail keywords like "pret casa modulara 120mp".

### 4. `permis-constructie-romania`
**Title:** Permis de constructie Romania - procesul AC pas cu pas
**Why fourth:** High-intent regulatory article. Captures searches from people actively preparing a build project. The 340-project dataset and time/cost tables by stage are hard to find elsewhere in Romanian.

### 5. `proiect-casa-3d-ai`
**Title:** Proiect casa 3D cu AI - viitor sau prezent pentru arhitectii din Romania?
**Why last:** B2B-focused article targeting architects rather than homeowners. Narrower audience, but highly aligned with the ModulCA pro tier. Best published after the consumer-facing articles are indexed, so internal links reinforce authority.

## Slug Summary

| # | Slug | Topic |
|---|------|-------|
| 1 | casa-modulara-romania | Complete guide |
| 2 | constructii-modulare-vs-traditionale | Modular vs traditional comparison |
| 3 | cost-casa-modulara-2026 | Cost breakdown |
| 4 | permis-constructie-romania | Building permit process |
| 5 | proiect-casa-3d-ai | AI in architecture |

## Notes for Integration

The `BlogArticle` interface currently has no `locale` / `isRomanian` field. To surface these as Romanian-specific on `/blog`, either add an optional `locale?: "en" | "ro"` to the interface or merge into `BLOG_ARTICLES` and route by slug prefix / language in the UI.
