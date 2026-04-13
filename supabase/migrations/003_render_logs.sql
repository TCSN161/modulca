-- Render Logs: per-render analytics for cost tracking, debugging, and optimization.
-- Every AI render (success or failure) gets logged here.

create table if not exists public.render_logs (
  id uuid default gen_random_uuid() primary key,
  -- Who requested it (null for anonymous/guest)
  user_id uuid references public.profiles(id) on delete set null,
  -- What was requested
  prompt text not null,
  width integer not null,
  height integer not null,
  seed text,
  mode text not null default 'text2img' check (mode in ('text2img', 'img2img')),
  tier text not null default 'free',
  -- Which engine handled it
  engine_id text not null,
  engine_label text,
  -- Result
  status text not null check (status in ('success', 'failed', 'error')),
  error_message text,
  -- Cost & performance
  cost_usd real not null default 0,
  latency_ms integer,
  image_size_bytes integer,
  content_type text,
  -- Cache info
  cache_hit boolean not null default false,
  cache_key text,
  -- Timestamps
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_render_logs_user on public.render_logs(user_id);
create index if not exists idx_render_logs_engine on public.render_logs(engine_id);
create index if not exists idx_render_logs_created on public.render_logs(created_at desc);
create index if not exists idx_render_logs_cache_key on public.render_logs(cache_key) where cache_key is not null;

-- RLS: users can see their own logs, service role can see all
alter table public.render_logs enable row level security;

create policy "Users can view own render logs"
  on public.render_logs for select using (auth.uid() = user_id);

-- Service role bypass (for admin dashboard / API routes)
create policy "Service role full access"
  on public.render_logs for all using (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Render cache index: find cached results by content hash
create table if not exists public.render_cache (
  id uuid default gen_random_uuid() primary key,
  -- Content-addressable key: hash of (prompt + width + height + engine)
  cache_key text not null unique,
  -- Supabase Storage path (bucket: renders)
  storage_path text not null,
  -- Metadata for cache management
  engine_id text not null,
  content_type text not null default 'image/png',
  image_size_bytes integer,
  width integer not null,
  height integer not null,
  -- TTL management
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  access_count integer not null default 1
);

create index if not exists idx_render_cache_key on public.render_cache(cache_key);
create index if not exists idx_render_cache_created on public.render_cache(created_at);

alter table public.render_cache enable row level security;

-- Cache is read-only for authenticated users, writable by service role
create policy "Authenticated users can read cache"
  on public.render_cache for select using (true);

create policy "Service role can manage cache"
  on public.render_cache for all using (
    auth.jwt() ->> 'role' = 'service_role'
  );
