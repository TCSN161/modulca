@AGENTS.md

# ModulCA — Claude Code Project Guide

## Quick Start
1. **Read `src/ARCHITECTURE.ts` first** — full project map, stores, routes, file sizes
2. Work on ONE feature folder per session (don't mix technical/ with render/)
3. Run `npx tsc --noEmit` and `npx next build` before committing

## ⚠️ Parallel Session Safety (CRITICAL)
Multiple Claude Code sessions may be running simultaneously on this repo.
To avoid stepping on another session's work:

**At the START of every session:**
```bash
git pull --rebase origin master       # get latest work from other sessions
npm run collision-check               # scan for hotspot files & conflicts
```

**DURING work:**
- Announce which files/folders you'll edit before starting
- If you detect another session edited your target file in the last hour, STOP and ask the user
- NEVER run `git push --force` — this can destroy another session's work

**⚠️ CRITICAL: Always commit with EXPLICIT file paths, never bare `git commit`**

Why: The git index is shared across parallel sessions. A bare `git commit`
picks up everything staged — including files another session was preparing.
This caused commit `ebae1cc` to mislabel 39 files as "test: cleanup test file".
See `docs/GIT_HISTORY_NOTES.md` for the full story.

```bash
# ❌ WRONG — absorbs other sessions' staged files:
git add . && git commit -m "..."
git add -A && git commit -m "..."
git commit -a -m "..."
git commit -m "..."              # if anything is staged, this is dangerous

# ✅ CORRECT — commits only the files you explicitly name:
git add src/specific-file.ts
git commit src/specific-file.ts -m "..."

# ✅ CORRECT — multiple specific files:
git add src/a.ts src/b.ts
git commit src/a.ts src/b.ts docs/c.md -m "..."

# ✅ OK for session isolation: check status FIRST, then add only yours:
git status                                 # review what's already staged
git restore --staged unrelated-file        # unstage anything not yours
git add my-files... && git commit -m "..."
```

Before every commit: **run `git status` and confirm every file listed is yours.**

**At the END of every session:**
```bash
npm run typecheck                     # verify clean
npm run test:run                      # verify nothing broke
git pull --rebase origin master       # catch any late pushes
git push origin master
npm run collision-check               # final sanity check
```

**Files with HIGH collision risk** (avoid editing unless it's your explicit task):
- `src/app/page.tsx` (landing)
- `src/app/layout.tsx`
- `src/app/sitemap.ts` / `robots.ts`
- `src/knowledge/_index.ts` (auto-generated — edit source YAMLs instead)
- `package.json` / `package-lock.json`
- `src/features/auth/store.ts`
- `src/features/design/components/finalize/FinalizePage.tsx`
- `PROJECT_DASHBOARD.md`

**For LARGE features** (Stripe, Auth overhaul, new pages):
Use a feature branch instead of master:
```bash
git checkout -b feature/[task-name]
# ...work, commit, push...
gh pr create                          # open PR for review
```

## Tech Stack
- Next.js 16.2.1 (App Router) | React 19 | TypeScript strict
- Zustand 5 (state) | Three.js + R3F (3D) | Tailwind 3.4
- Supabase (auth + DB) | Mapbox GL (maps) | @react-pdf/renderer

## Key Conventions
- **Module size:** 3x3m exterior, 2.4x2.4m interior, 0.3m walls
- **Colors:** brand-teal-800 (primary), brand-amber-500 (accent)
- **Stores:** useLandStore, useDesignStore, useMarketplaceStore, useAuthStore
- **Auth:** Supabase client-side. Demo mode (localStorage) when env vars not set
- **Build:** `npx next build` (Turbopack). Static export on GitHub Actions only

## File Organization
- `src/features/{name}/` — feature modules with store, components, types
- `src/shared/` — types, config, utils, reusable components
- `src/app/` — Next.js routes (thin wrappers importing feature components)
- `supabase/schema.sql` — database schema (run in Supabase SQL Editor)

## Don't
- Don't create files >500 lines — split into focused modules
- Don't mix feature folders in one edit session
- Don't add Prisma — using Supabase client directly
- Don't use `output: "export"` locally — only for GitHub Pages CI
