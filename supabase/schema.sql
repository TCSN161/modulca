-- ModulCA Database Schema
-- Run this in Supabase SQL Editor to set up tables.
-- Full schema: profiles, projects, render_logs, render_cache.
-- Includes Stripe columns and beta promo support.

-- ── Profiles (extends Supabase auth.users) ──
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  tier text not null default 'free' check (tier in ('guest_free', 'free', 'premium', 'architect', 'constructor')),
  avatar_url text,
  project_count integer not null default 0,
  storage_used_mb real not null default 0,
  ai_calls_today integer not null default 0,
  ai_calls_reset_at date,
  -- Monthly render quota (server-side enforcement)
  ai_renders_this_month integer not null default 0,
  ai_renders_month text, -- 'YYYY-MM' format, resets when month changes
  -- Cost tracking
  total_cost_usd real not null default 0,
  -- Stripe subscription
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'free'
    check (subscription_status in ('free', 'active', 'past_due', 'canceled', 'unpaid', 'trialing')),
  -- Timestamps (created_at also used for beta promo calculation)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Projects ──
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default 'Untitled Project',
  data jsonb not null default '{}'::jsonb,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);

-- ── Row Level Security ──
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Projects: users can CRUD their own
create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);
create policy "Users can create projects"
  on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ── Stripe lookup indexes ──
create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id)
  where stripe_customer_id is not null;
create index if not exists idx_profiles_tier
  on public.profiles(tier);

-- ── Render Logs (per-render analytics, cost tracking, debugging) ──
create table if not exists public.render_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  prompt text not null,
  width integer not null,
  height integer not null,
  seed text,
  mode text not null default 'text2img' check (mode in ('text2img', 'img2img')),
  tier text not null default 'free',
  engine_id text not null,
  engine_label text,
  status text not null check (status in ('success', 'failed', 'error')),
  error_message text,
  cost_usd real not null default 0,
  latency_ms integer,
  image_size_bytes integer,
  content_type text,
  cache_hit boolean not null default false,
  cache_key text,
  created_at timestamptz not null default now()
);

create index if not exists idx_render_logs_user on public.render_logs(user_id);
create index if not exists idx_render_logs_engine on public.render_logs(engine_id);
create index if not exists idx_render_logs_created on public.render_logs(created_at desc);
create index if not exists idx_render_logs_cache_key on public.render_logs(cache_key) where cache_key is not null;

alter table public.render_logs enable row level security;

create policy "Users can view own render logs"
  on public.render_logs for select using (auth.uid() = user_id);
create policy "Service role full access on render_logs"
  on public.render_logs for all using (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ── Render Cache (content-addressable image cache) ──
create table if not exists public.render_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text not null unique,
  storage_path text not null,
  engine_id text not null,
  content_type text not null default 'image/png',
  image_size_bytes integer,
  width integer not null,
  height integer not null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  access_count integer not null default 1
);

create index if not exists idx_render_cache_key on public.render_cache(cache_key);
create index if not exists idx_render_cache_created on public.render_cache(created_at);

alter table public.render_cache enable row level security;

create policy "Authenticated users can read cache"
  on public.render_cache for select using (true);
create policy "Service role can manage cache"
  on public.render_cache for all using (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ── Updated_at triggers for new tables ──
create trigger set_render_logs_updated_at before update on public.render_logs
  for each row execute function public.set_updated_at();

-- ── Beta promo: admin view for users with active 3-month promo ──
-- Application code: if tier='free' AND now() < created_at + 3 months → premium access
create or replace view public.beta_promo_users as
  select
    id,
    email,
    display_name,
    tier,
    created_at,
    created_at + interval '3 months' as promo_expires_at,
    greatest(0, extract(day from (created_at + interval '3 months' - now()))) as days_remaining
  from public.profiles
  where tier = 'free'
    and created_at + interval '3 months' > now();
