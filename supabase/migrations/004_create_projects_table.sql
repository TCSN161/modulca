-- Migration 004: Create projects table
-- Stores user design projects (referenced by projectService.ts).
-- Each project holds a JSON blob of the full configurator state.

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  -- Owner (FK to auth.users so it works even without a profiles row yet)
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Human-readable project name
  name text not null default 'Untitled Project',
  -- Full design state: modules, gridCells, gridRotation, finishLevel, styleDirection, etc.
  data jsonb not null default '{}'::jsonb,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Indexes for common queries
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);
create index if not exists idx_projects_created_at on public.projects(created_at desc);

-- Row Level Security: users can only CRUD their own projects
alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Service role bypass (for admin / API routes)
create policy "Service role full access on projects"
  on public.projects for all using (
    auth.jwt() ->> 'role' = 'service_role'
  );
