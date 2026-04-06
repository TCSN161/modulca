@AGENTS.md

# ModulCA — Claude Code Project Guide

## Quick Start
1. **Read `src/ARCHITECTURE.ts` first** — full project map, stores, routes, file sizes
2. Work on ONE feature folder per session (don't mix technical/ with render/)
3. Run `npx tsc --noEmit` and `npx next build` before committing

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
