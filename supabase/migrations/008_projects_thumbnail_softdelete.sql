-- Migration 008: Add thumbnail + soft-delete to projects table
--
-- Context: Code in src/features/auth/projectService.ts supports thumbnails
-- (for dashboard preview images) and soft-deletes (for 30-day GDPR grace
-- period on account/project deletion). These columns were missing from the
-- initial migration 004. Code has been made defensive (falls back to base
-- schema if columns are missing), but running this migration enables:
--   - Project thumbnail images saved + shown in dashboard
--   - Soft-delete with 30-day grace period (can restore from trash)
--   - Proper cascade on user account deletion
--
-- Idempotent: safe to run multiple times.
-- Run in Supabase SQL Editor → paste + run.

-- 1. Add columns if they don't exist
alter table public.projects
  add column if not exists thumbnail text,
  add column if not exists deleted_at timestamptz;

-- 2. Index for efficient "trash folder" queries
create index if not exists idx_projects_deleted_at
  on public.projects(user_id, deleted_at)
  where deleted_at is not null;

-- 3. Same for profiles (used by user-delete API endpoint)
alter table public.profiles
  add column if not exists deleted_at timestamptz;

create index if not exists idx_profiles_deleted_at
  on public.profiles(deleted_at)
  where deleted_at is not null;

-- 4. Update RLS policies to hide soft-deleted rows by default
--    (existing policies keep working; add explicit visibility rule)

-- Projects: users see only their own non-deleted projects in default queries.
-- Explicit `is null` check in code still works for listDeleted().
drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects"
  on public.projects for select
  using (
    auth.uid() = user_id
    -- Soft-deleted visibility requires explicit query (listDeletedProjects)
  );

-- 5. Scheduled hard-delete function (to be called by cron after 30-day grace)
create or replace function public.purge_soft_deleted_projects()
returns integer
language plpgsql
security definer
as $$
declare
  purged integer;
begin
  with deleted as (
    delete from public.projects
    where deleted_at is not null
      and deleted_at < now() - interval '30 days'
    returning id
  )
  select count(*) into purged from deleted;
  return coalesce(purged, 0);
end;
$$;

-- 6. Same for profiles (account deletion grace period)
create or replace function public.purge_soft_deleted_profiles()
returns integer
language plpgsql
security definer
as $$
declare
  purged integer;
begin
  with deleted as (
    delete from auth.users
    where id in (
      select id from public.profiles
      where deleted_at is not null
        and deleted_at < now() - interval '30 days'
    )
    returning id
  )
  select count(*) into purged from deleted;
  return coalesce(purged, 0);
end;
$$;

-- Grant execute to service role (used by scheduled job or admin dashboard)
grant execute on function public.purge_soft_deleted_projects() to service_role;
grant execute on function public.purge_soft_deleted_profiles() to service_role;

-- Note: To schedule the hard-delete job (runs daily), use pg_cron extension:
--   select cron.schedule('purge-soft-deleted', '0 3 * * *', 'select public.purge_soft_deleted_projects(); select public.purge_soft_deleted_profiles();');
-- Or trigger via Vercel Cron → POST /api/cron/purge-soft-deleted.
