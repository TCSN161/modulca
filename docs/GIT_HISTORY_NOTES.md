# Git History Notes

Notes about commits with misleading or incomplete messages, to preserve context.

---

## `ebae1cc` — "test: cleanup test file" (2026-04-17)

**Actual content: 39 files, +2013 / -53 lines**

This commit has a misleading message. The intended change was a 1-line
cleanup (deleting `.gitignore-test-delete-me`), but the commit accidentally
included work that was staged by **parallel Claude Code sessions** running
simultaneously on the same repo.

### Root cause

Multiple Claude Code sessions share the same git working directory and
index. When session A runs `git add file1.ts` and session B later runs
`git commit -m "unrelated"`, the commit picks up ALL staged files,
including session A's work.

This was the first real collision caught after we added branch protection
and the `collision-check` script.

### What this commit actually contains

**Product images & assets** (from session "Products"):
- `public/images/products/_attribution.json`
- 20 product JPGs (finishing, furniture, plumbing categories)
- `src/assets/registry.ts`, `src/assets/sources.ts` updates

**AI Render engines** (from session "RENDERI AI"):
- `src/app/api/ai-render/engines/gemini.ts`
- `src/app/api/ai-render/engines/novita.ts`
- `src/app/api/ai-render/engines/runway.ts`
- `src/app/api/ai-render/engines/wavespeed.ts`
- `src/app/api/ai-render/engines/route.ts`
- `src/app/api/ai-render/engines/types.ts`
- `src/app/api/ai-render/route.ts` (integration)

**Automation scripts** (from session "MAIN"):
- `scripts/env-sync.mjs` (env var sync helper)
- `scripts/fetch-product-media.mjs` (download product images)
- `scripts/seed-demo-projects.mjs` (seed demo data)
- `scripts/stripe-go-live.mjs` (Stripe production checklist)

**Database** (from session "Preturi, conturi"):
- `supabase/migrations/006_featured_projects.sql`

**Config updates**:
- `.gitignore` (one line added)
- `package.json` (scripts added)
- `docs/AUTOMATION.md` (refreshed)

### Why we didn't rewrite history

Branch protection blocks force-push on master. Rewriting history via
`git commit --amend` + `git push --force` would require temporarily
disabling protection, which risks exposing a window where other sessions
could push bad history.

**The code is correct** — only the commit message is wrong. Leaving the
commit as-is and documenting it here is the safer choice.

### Prevention (see CLAUDE.md)

Always commit with explicit file paths:

```bash
# WRONG (picks up other sessions' staged files):
git add . && git commit -m "my change"
git commit -m "my change"

# CORRECT (commits only the file you specify):
git add src/my-file.ts && git commit src/my-file.ts -m "my change"
git commit src/my-file.ts -m "my change"
```

And always run `npm run collision-check` before committing when other
sessions may be active.
