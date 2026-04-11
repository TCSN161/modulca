-- Migration 001: Add usage tracking columns to profiles
-- These columns are referenced by the auth store for tier limits.

-- Project count (denormalized for fast access)
alter table public.profiles add column if not exists project_count integer not null default 0;

-- Storage usage in megabytes
alter table public.profiles add column if not exists storage_used_mb real not null default 0;

-- AI render call tracking (daily reset)
alter table public.profiles add column if not exists ai_calls_today integer not null default 0;
alter table public.profiles add column if not exists ai_calls_reset_at date;

-- Allow profiles insert policy (for upsert on OAuth callback)
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
