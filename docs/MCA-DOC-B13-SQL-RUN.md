# MCA-DOC-B13-SQL-RUN

**Purpose**: Resolve B13 blocker — missing `public_renders` table in Supabase  
**Owner**: User (runs SQL in Supabase Dashboard)  
**Est. time**: 2 min  
**Risk**: Minimal (migration marked `if not exists` — idempotent)  
**Status**: ⏳ Awaiting user execution

---

## Context

Build 2026-11-19 surfaced:
```
[gallery] recent renders fetch failed: Could not find the table 'public.public_renders' in the schema cache
```

Investigation (via Supabase REST):
```json
{"code":"PGRST205","message":"Could not find the table 'public.public_renders' in the schema cache"}
```

Confirmed: Migration `007_gallery_system.sql` was never run on the restored Supabase project. All 3 tables it defines are missing:
- `public.public_renders`
- `public.render_ratings`
- `public.gallery_settings`

**Impact**: Gallery page `/gallery` "recent renders" section broken. Not critical for invite-only beta, but needed for public launch.

---

## How to run

### Step 1 — Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → ModulCA project → **SQL Editor** (left sidebar)

### Step 2 — New query
Click **"+ New query"** (top right)

### Step 3 — Paste the ENTIRE contents of `supabase/migrations/007_gallery_system.sql`

Quick way to get it:
```powershell
Get-Content C:\Users\Costin\Documents\modulca\supabase\migrations\007_gallery_system.sql | Set-Clipboard
```

(copies the full migration to clipboard — then paste in Supabase SQL editor)

### Step 4 — Click "Run"
Should take ~1 second. Expected result: success, no errors (table creation uses `if not exists`).

### Step 5 — Verify
After run, in a new query tab, paste:
```sql
select tablename from pg_tables where schemaname = 'public' and tablename in ('public_renders', 'render_ratings', 'gallery_settings');
```

Click Run → should return 3 rows.

### Step 6 — Also run migrations 008, 009, 010 (if not already done)

Check which migrations have been run:
```sql
select tablename from pg_tables where schemaname = 'public' order by tablename;
```

Expected tables (post migration 010):
- `aggregated_metrics`, `architect_profiles`, `assets`, `collisions`, `deletion_audit`, `gallery_settings`, `incidents`, `likes`, `monitoring_signals`, `moodboards`, `profiles`, `project_participants`, `projects`, `public_renders`, `rate_limits`, `render_ratings`, `renders`, `scraping_results`, `subscriptions`, ... (plus auth schema)

If any migration missing, run the file from `supabase/migrations/` in numerical order.

**⚠️ Migration 010 has a known FK forward-reference bug** (per TRACKER.md lessons learned). If running 010 fresh, extract the `incidents` CREATE TABLE block FIRST, then run the full file. Idempotent `if not exists` handles the duplicate.

---

## After completion

Zi-mi "B13 done" în chat → eu re-rulez:
```bash
npm run ops:check
npm run build
```

Build output should NOT show the `[gallery] recent renders fetch failed` warning anymore.

Blockers list updates:
- B13 → ✅ RESOLVED
- Migration 009 blocker (open since April) → likely also resolved if ran all 008-010

---

## Alternative: delay to Phase 4

If you're tired tonight and don't want to do SQL — this is non-critical for invite-only beta (gallery is a nice-to-have, not core). Can defer to Phase 4 (pre-beta polish, Dec 15-22 window).

In that case, set B13 phase = Phase 4 and move on.

---

*Prepared 2026-11-19. Discovered during Phase 1 audit build log. One-shot fix.*
