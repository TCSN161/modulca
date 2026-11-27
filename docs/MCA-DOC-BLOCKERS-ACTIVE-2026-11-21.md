# MCA-DOC-BLOCKERS-ACTIVE-2026-11-21

**Status**: Living document — clean list of ACTIVE blockers only  
**Prev**: [[MCA-DOC-BLOCKERS-2026-11-19]] (historical, keeps resolved items)  
**Owner**: Costin Muraru

Post Phase 1 close, consolidated clean list. Old blockers (B1, B3, B5, B7, B10, B11, B12, B13, B14, B17) all closed — see historical doc.

---

## 🟨 Important (block Phase 2)

### B2. 7 remaining CATUC files pending full rewrite
- **Files**: F2 building-permit-process, F3 modular-prefab-regulations, F4 urban-planning-pug-puz, F6 building-permit-romania (body prose), plus NEW chapter catuc-169-2026 + clarificări
- **Status**: 4/10 pre-prepped (F1, F5, F6 frontmatter, F7 frontmatter, F9 body, F10 body)
- **Blocked on**: NotebookLM upload by user → `scripts/catuc-ingest.mjs` processes → .new.md siblings
- **Phase**: 2 (Nov 25 - Dec 5)
- **Owner**: User (NotebookLM) + Claude (writing) + Vlad Ioniță (review)

### B4. Vlad Ioniță formal engagement not documented
- **Impact**: Legal exposure if we deploy CATUC content without signatory architect
- **Fix**: User sends outreach email (template ready in `docs/MCA-DOC-VLAD-EMAIL-TEMPLATE.md`)
- **Deadline**: Before Dec 1 (Vlad window Nov 28 - Dec 3)
- **Owner**: Costin
- **Phase**: This week

### B15. npm audit: high one fixed (2026-11-28); 5 moderate remain (Sentry 11 needed)
- **Before (Nov 28)**: 6 vulnerabilities = 1 high (**sharp ≤0.35.5-rc.1**: libvips/libheif/librsvg CVEs; brace-expansion no longer appeared) + 5 moderate (glob 9–14.0.1 + minimatch 7–11 via `@sentry/nextjs` 10.78 → `@sentry/bundler-plugins` / `@sentry/webpack-plugin`)
- **Done (1.07)**: `sharp ^0.34.5 → ^0.35.5` (libvips 8.18.3, sharp-libvips 1.3.4). Now deduplicated with Next's own sharp 0.35.5; linux-x64 binaries are in the lockfile. Code change: **none needed**. The only runtime user is `src/features/gallery/processor.ts` (`rotate/metadata/resize/composite/webp/png`), and it calls none of the APIs removed in 0.35 (`failOnError`, `metadata.paletteBitDepth`, old `sharpen` props, `format.jp2k`). OG images (`/og`) use `next/og`, not sharp. Verified: tsc 0, vitest 543/543, `next build` OK, plus a local test of `processRenderImage` (2400×1800 PNG → 1600×1200 WebP with QR watermark + 400×300 thumbnail).
- **After**: 5 moderate, 0 high. `npm audit fix` without `--force` changes nothing: the fix needs `@sentry/nextjs` ≥11.11 (latest 11.20.0), a **major** bump. Glob/minimatch are only used by Sentry's source-map upload at **build time**, with no user input, so there is no runtime exposure. Left as is, on purpose. Do not force a `glob` override (glob 13 → 14 is also a major).
- **Remaining**: a dedicated Sentry 10 → 11 session (migration guide + `instrumentation*.ts` / `next.config` / `sentry.*.config`). Phase 5, not a beta blocker.
- **Not verified on prod**: gallery publish (`/api/renders/publish`) on Vercel after deploy. `/og` does not depend on sharp.
- **Owner**: Claude

### B8. EXT-OPS-001 user decisions (deferred from April)
- **Original**: LinkedIn URL, Stripe acct_id, Supabase Pro decision
- **Status**: Prep done April (6 DPA emails + 6 Startup apps ready to send)
- **Current relevance**: DPA outreach makes sense for Phase 6 (pre-public launch); startup apps anytime if interested in grants
- **Owner**: Costin
- **Phase**: Phase 6 or when energy allows

### B16. Novita top-up decision ($5)
- **Status**: Account created, key exists, balance $0
- **Impact**: Novita backup engine inactive until top-up
- **Decision**: Hold until revenue OR batch with DeepSeek top-up ($10 total)
- **Owner**: Costin
- **Phase**: Phase 2 or later

---

## 🟩 Low (housekeeping)

### B6. npm version 11.9.0 → 11.21.3
- **Fix**: `npm install -g npm@11.21.3`
- **Impact**: Minor features, no security issue
- **Owner**: Costin (single command)

---

## 📋 Summary

| Type | Count | Owner |
|---|---:|---|
| Important blocking Phase 2 | 1 (B2) | Mixed |
| Important needs user | 3 (B4, B8, B16) | Costin |
| Important needs dedicated Claude session | 1 (B15: sharp done, Sentry 11 left) | Claude |
| Low priority | 1 (B6) | Costin |

**No critical blockers** (all B1/B3/etc. resolved Phase 1).

**Phase 2 primary gating**: B2 → gated on B4 (Vlad engagement) for deploy.
