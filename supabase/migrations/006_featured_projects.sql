-- Migration 006: Featured (public) projects showcase
-- Public-readable showcase projects displayed on the landing / portfolio page.
-- Populated by scripts/seed-demo-projects.mjs.
--
-- Unlike regular `projects` rows, these have no user_id owner — they're
-- curated by admins and shown to everyone for marketing/demo purposes.

create table if not exists public.featured_projects (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,                        -- URL-safe identifier (e.g., "riverside-cabin")
  title text not null,                              -- Display name
  subtitle text,                                    -- Short tagline
  description text,                                 -- Long description (markdown ok)
  location text,                                    -- e.g., "Cluj-Napoca, Romania"
  area_sqm numeric,                                 -- Floor area in m²
  module_count int,                                 -- Number of 3x3m modules
  estimated_cost_eur numeric,                       -- Total build cost
  assembly_duration_days int,                       -- On-site assembly time
  tags text[] default array[]::text[],              -- e.g., ["residential", "2-bedroom"]
  hero_image_url text,                              -- Main showcase image
  gallery_image_urls text[] default array[]::text[],-- Additional images
  highlights text[] default array[]::text[],        -- Bullet points
  -- Full design state so users can "clone" this project as a starter
  design_data jsonb not null default '{}'::jsonb,
  -- Display control
  display_order int not null default 0,             -- Lower = shown first
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_featured_projects_updated_at
  before update on public.featured_projects
  for each row execute function public.set_updated_at();

create index if not exists idx_featured_projects_slug on public.featured_projects(slug);
create index if not exists idx_featured_projects_published
  on public.featured_projects(is_published, display_order)
  where is_published = true;

-- RLS: anyone can read published featured projects (no auth required)
alter table public.featured_projects enable row level security;

create policy "Anyone can view published featured projects"
  on public.featured_projects for select
  using (is_published = true);

create policy "Service role full access on featured_projects"
  on public.featured_projects for all
  using (auth.jwt() ->> 'role' = 'service_role');

comment on table public.featured_projects is
  'Curated public showcase projects shown on the landing and portfolio pages. Populated by scripts/seed-demo-projects.mjs.';
