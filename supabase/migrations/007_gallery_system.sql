-- Migration 007: Public gallery system
--
-- Stores rendered images that either admin or opt-in users chose to publish.
-- Acts as: (1) marketing showcase, (2) soft backup for users who lost access,
-- (3) analytics source of truth for long-term trends.
--
-- Architecture:
--   - public_renders: one row per published render. When the image is evicted
--     from storage (after FIFO 100 + hall-of-fame 30), the row stays and
--     image_url/thumb_url become null — this gives us permanent lightweight
--     analytics without keeping the bytes.
--   - render_ratings: one row per (user, render) to prevent double-voting
--     and to let us display "starred by N people".
--   - gallery_settings: single-row config table for global toggles
--     (e.g., show_prices, moderation mode).

/* ── Helper function (may already exist from migration 004) ───────── */
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

/* ── Main gallery table ──────────────────────────────────────────── */
create type public.render_status as enum ('active', 'hall-of-fame', 'archived');

create table if not exists public.public_renders (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,                       -- URL-safe: /g/{slug}

  -- Media (nullable after FIFO eviction)
  image_url text,                                  -- full-size WebP (~400KB)
  thumb_url text,                                  -- 400x300 WebP (~30KB)
  file_size_kb int,                                -- original PNG size for analytics

  -- Source metadata
  engine_id text not null,                          -- "gemini" | "openai" | ...
  prompt_excerpt text,                              -- first 200 chars (no PII)
  latency_ms int,

  -- Design context (may be null for admin test renders)
  room_type text,                                   -- "bedroom" | "living" | ...
  style_direction text,                             -- "scandinavian" | ...
  finish_level text,                                -- "standard" | "high"
  module_count int,
  area_sqm numeric,
  estimated_cost_eur numeric,
  show_price boolean not null default true,         -- landing page: display cost?

  -- Ownership
  user_id uuid references auth.users(id) on delete set null,
  is_admin boolean not null default false,          -- true = from /admin tester
  user_tier text,                                   -- snapshot for analytics

  -- Scoring & visibility
  status public.render_status not null default 'active',
  rating_sum int not null default 0,                -- sum of all star values
  rating_count int not null default 0,
  view_count int not null default 0,
  score_weighted numeric generated always as (
    case when rating_count = 0 then 0
    else (rating_sum::numeric / rating_count) * sqrt(rating_count)
         / (1 + (extract(epoch from (now() - created_at)) / 86400) * 0.02)
    end
  ) stored,

  -- Geo (from Vercel headers, anonymized)
  country text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_public_renders_updated_at on public.public_renders;
create trigger trg_public_renders_updated_at
  before update on public.public_renders
  for each row execute function public.set_updated_at();

create index if not exists idx_public_renders_status
  on public.public_renders(status, created_at desc);
create index if not exists idx_public_renders_score
  on public.public_renders(score_weighted desc)
  where status in ('active', 'hall-of-fame');
create index if not exists idx_public_renders_slug
  on public.public_renders(slug);
create index if not exists idx_public_renders_engine
  on public.public_renders(engine_id);
create index if not exists idx_public_renders_user
  on public.public_renders(user_id)
  where user_id is not null;

/* ── Ratings (prevent double votes) ─────────────────────────────── */
create table if not exists public.render_ratings (
  id uuid default gen_random_uuid() primary key,
  render_id uuid not null references public.public_renders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stars smallint not null check (stars >= 1 and stars <= 5),
  /* weight lets us give 0.5x to self-ratings for soft fairness */
  weight numeric(3,2) not null default 1.0,
  created_at timestamptz not null default now(),
  unique (render_id, user_id)
);

create index if not exists idx_render_ratings_render
  on public.render_ratings(render_id);

/* ── Global gallery settings (single row) ────────────────────────── */
create table if not exists public.gallery_settings (
  id int primary key default 1,
  -- Display controls
  show_prices_globally boolean not null default true,
  show_estimated_cost boolean not null default true,
  show_rating_counts boolean not null default true,
  -- Capacity limits
  max_active_renders int not null default 100,
  max_hall_of_fame int not null default 30,
  -- Moderation
  moderation_mode text not null default 'off'      -- 'off' | 'auto' | 'manual'
    check (moderation_mode in ('off', 'auto', 'manual')),
  -- Hall-of-fame threshold
  hall_score_threshold numeric not null default 3.0,
  updated_at timestamptz not null default now(),
  -- Single row lock
  constraint gallery_settings_single_row check (id = 1)
);

-- Seed the default row
insert into public.gallery_settings (id)
  values (1)
  on conflict (id) do nothing;

drop trigger if exists trg_gallery_settings_updated_at on public.gallery_settings;
create trigger trg_gallery_settings_updated_at
  before update on public.gallery_settings
  for each row execute function public.set_updated_at();

/* ── Row-Level Security ─────────────────────────────────────────── */
alter table public.public_renders enable row level security;
alter table public.render_ratings enable row level security;
alter table public.gallery_settings enable row level security;

-- public_renders: anyone reads active + hall-of-fame rows
drop policy if exists "Anyone can view active or hall-of-fame renders" on public.public_renders;
create policy "Anyone can view active or hall-of-fame renders"
  on public.public_renders for select
  using (status in ('active', 'hall-of-fame'));

drop policy if exists "Users can view their own archived renders" on public.public_renders;
create policy "Users can view their own archived renders"
  on public.public_renders for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access on public_renders" on public.public_renders;
create policy "Service role full access on public_renders"
  on public.public_renders for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- render_ratings: user sees their own votes; inserts allowed; no updates
drop policy if exists "Users can view their own ratings" on public.render_ratings;
create policy "Users can view their own ratings"
  on public.render_ratings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own ratings" on public.render_ratings;
create policy "Users can insert their own ratings"
  on public.render_ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Service role full access on render_ratings" on public.render_ratings;
create policy "Service role full access on render_ratings"
  on public.render_ratings for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- gallery_settings: anyone reads (so UI can check show_prices_globally);
-- only service role writes
drop policy if exists "Anyone can view gallery settings" on public.gallery_settings;
create policy "Anyone can view gallery settings"
  on public.gallery_settings for select
  using (true);

drop policy if exists "Service role manages gallery settings" on public.gallery_settings;
create policy "Service role manages gallery settings"
  on public.gallery_settings for all
  using (auth.jwt() ->> 'role' = 'service_role');

/* ── Cleanup function: FIFO eviction + hall promotion ───────────── */
create or replace function public.evict_old_renders()
returns table(evicted_count int, promoted_count int) as $$
declare
  s public.gallery_settings;
  active_count int;
  candidate_row record;
  evicted int := 0;
  promoted int := 0;
begin
  select * into s from public.gallery_settings where id = 1;

  -- Count active
  select count(*) into active_count
    from public.public_renders
    where status = 'active';

  -- While over capacity, evict the lowest-scored oldest active render
  while active_count > s.max_active_renders loop
    select id, score_weighted
      into candidate_row
      from public.public_renders
      where status = 'active'
      order by score_weighted asc, created_at asc
      limit 1;

    if candidate_row.score_weighted >= s.hall_score_threshold then
      -- Promote to hall of fame
      update public.public_renders
        set status = 'hall-of-fame'
        where id = candidate_row.id;
      promoted := promoted + 1;

      -- If hall of fame is over capacity, demote its lowest-scored one
      declare
        hall_count int;
        demote_id uuid;
      begin
        select count(*) into hall_count
          from public.public_renders
          where status = 'hall-of-fame';
        if hall_count > s.max_hall_of_fame then
          select id into demote_id
            from public.public_renders
            where status = 'hall-of-fame'
            order by score_weighted asc
            limit 1;
          -- Archive (keep metadata, clear bytes in separate step)
          update public.public_renders
            set status = 'archived', image_url = null, thumb_url = null
            where id = demote_id;
          evicted := evicted + 1;
        end if;
      end;
    else
      -- Archive: keep metadata, clear image bytes
      update public.public_renders
        set status = 'archived', image_url = null, thumb_url = null
        where id = candidate_row.id;
      evicted := evicted + 1;
    end if;

    active_count := active_count - 1;
  end loop;

  return query select evicted, promoted;
end;
$$ language plpgsql security definer;

/* ── Comments (documentation) ───────────────────────────────────── */
comment on table public.public_renders is
  'Published AI-generated renders. Shows in /gallery grid and /g/{slug} landing pages. FIFO evicts oldest 100 into hall-of-fame or archived status.';
comment on table public.render_ratings is
  '1-5 star ratings per (user, render). Self-ratings use weight 0.5.';
comment on table public.gallery_settings is
  'Single-row global gallery config. Admins toggle display options here.';
comment on column public.public_renders.score_weighted is
  'HN-style score: avg_stars × sqrt(votes) / (1 + age_days × 0.02). Auto-computed.';
