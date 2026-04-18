-- Migration 009: Query Analyzer RPC Functions
--
-- Adds read-only SECURITY DEFINER functions that expose PostgreSQL's internal
-- statistics tables (pg_stat_statements, pg_stat_user_indexes, etc.) to the
-- service_role, so scripts/supabase-query-analyzer.mjs can call them via RPC
-- without needing direct DB connection credentials.
--
-- Idempotent. Run once via Supabase Dashboard → SQL Editor → paste + Run.
-- Only grants execute to service_role (never to anon/authenticated).

-- Ensure pg_stat_statements extension is enabled (usually pre-enabled in Supabase)
create extension if not exists pg_stat_statements;

-- ─────────────────────────────────────────────────────────────────────
-- 1. TOP SLOW QUERIES (by mean execution time)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_slow_queries(limit_n integer default 10)
returns table (
  query_preview text,
  calls bigint,
  total_ms double precision,
  mean_ms double precision,
  max_ms double precision,
  rows_avg double precision,
  cache_hit_pct double precision
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    left(regexp_replace(s.query, '\s+', ' ', 'g'), 120)::text as query_preview,
    s.calls,
    round(s.total_exec_time::numeric, 2)::double precision as total_ms,
    round(s.mean_exec_time::numeric, 2)::double precision as mean_ms,
    round(s.max_exec_time::numeric, 2)::double precision as max_ms,
    round((s.rows::numeric / greatest(s.calls, 1)), 1)::double precision as rows_avg,
    case when (s.shared_blks_hit + s.shared_blks_read) > 0
      then round((100.0 * s.shared_blks_hit / (s.shared_blks_hit + s.shared_blks_read))::numeric, 1)::double precision
      else 100.0
    end as cache_hit_pct
  from pg_stat_statements s
  where s.query not ilike '%pg_stat_statements%'
    and s.query not ilike '%pg_catalog%'
    and s.query not ilike 'COMMIT%'
    and s.query not ilike 'BEGIN%'
  order by s.mean_exec_time desc
  limit limit_n;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. TOP FREQUENT QUERIES (by call count)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_frequent_queries(limit_n integer default 10)
returns table (
  query_preview text,
  calls bigint,
  total_ms double precision,
  mean_ms double precision
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    left(regexp_replace(s.query, '\s+', ' ', 'g'), 120)::text as query_preview,
    s.calls,
    round(s.total_exec_time::numeric, 2)::double precision as total_ms,
    round(s.mean_exec_time::numeric, 2)::double precision as mean_ms
  from pg_stat_statements s
  where s.query not ilike '%pg_stat_statements%'
    and s.query not ilike '%pg_catalog%'
  order by s.calls desc
  limit limit_n;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 3. DATABASE HEALTH (cache hit ratio, connections, size)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_db_health()
returns table (
  metric text,
  value text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  cache_hit double precision;
  db_size_bytes bigint;
  active_conns integer;
  max_conns integer;
begin
  -- Overall cache hit ratio
  select round(
    100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0),
    2
  )::double precision into cache_hit
  from pg_stat_database where datname = current_database();

  -- DB size
  select pg_database_size(current_database()) into db_size_bytes;

  -- Connections
  select count(*) into active_conns from pg_stat_activity where state = 'active';
  select setting::integer into max_conns from pg_settings where name = 'max_connections';

  return query
  values
    ('Cache hit ratio',
     coalesce(cache_hit::text, '—') || '%',
     case when cache_hit is null then 'unknown'
          when cache_hit >= 99 then 'excellent'
          when cache_hit >= 95 then 'good'
          when cache_hit >= 90 then 'watch'
          else 'concerning' end),
    ('Database size',
     pg_size_pretty(db_size_bytes)::text,
     case when db_size_bytes < 400000000 then 'ok'        -- < 400MB
          when db_size_bytes < 480000000 then 'watch'     -- < 480MB (free tier 500MB)
          else 'near-limit' end),
    ('Active connections',
     active_conns::text || ' / ' || max_conns::text,
     case when active_conns::double precision / max_conns < 0.5 then 'ok'
          when active_conns::double precision / max_conns < 0.8 then 'watch'
          else 'high' end);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 4. UNUSED INDEXES (never scanned — cleanup candidates)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_unused_indexes()
returns table (
  schema_name text,
  table_name text,
  index_name text,
  index_size text,
  scans bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    s.schemaname::text,
    s.relname::text as table_name,
    s.indexrelname::text as index_name,
    pg_size_pretty(pg_relation_size(s.indexrelid))::text as index_size,
    s.idx_scan as scans
  from pg_stat_user_indexes s
  join pg_index i on i.indexrelid = s.indexrelid
  where s.idx_scan = 0
    and not i.indisunique
    and not i.indisprimary
    and s.schemaname = 'public'
  order by pg_relation_size(s.indexrelid) desc
  limit 20;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 5. TABLE SIZES (biggest tables — memory/disk hogs)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_table_sizes(limit_n integer default 10)
returns table (
  table_name text,
  total_size text,
  table_size text,
  indexes_size text,
  row_count_estimate bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    t.tablename::text,
    pg_size_pretty(pg_total_relation_size('public.' || t.tablename))::text as total_size,
    pg_size_pretty(pg_relation_size('public.' || t.tablename))::text as table_size,
    pg_size_pretty(pg_total_relation_size('public.' || t.tablename) - pg_relation_size('public.' || t.tablename))::text as indexes_size,
    coalesce(c.reltuples::bigint, 0) as row_count_estimate
  from pg_tables t
  left join pg_class c on c.relname = t.tablename
  where t.schemaname = 'public'
  order by pg_total_relation_size('public.' || t.tablename) desc
  limit limit_n;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 6. RESET STATISTICS (admin — call after optimizations to measure impact)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.analyzer_reset_stats()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_stat_statements_reset();
  return 'pg_stat_statements reset at ' || now()::text;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- Grants — ONLY service_role, never anon/authenticated
-- ─────────────────────────────────────────────────────────────────────

grant execute on function public.analyzer_slow_queries(integer) to service_role;
grant execute on function public.analyzer_frequent_queries(integer) to service_role;
grant execute on function public.analyzer_db_health() to service_role;
grant execute on function public.analyzer_unused_indexes() to service_role;
grant execute on function public.analyzer_table_sizes(integer) to service_role;
grant execute on function public.analyzer_reset_stats() to service_role;

-- Revoke from public/anon/authenticated for safety (no data leak via GraphQL)
revoke execute on function public.analyzer_slow_queries(integer) from public, anon, authenticated;
revoke execute on function public.analyzer_frequent_queries(integer) from public, anon, authenticated;
revoke execute on function public.analyzer_db_health() from public, anon, authenticated;
revoke execute on function public.analyzer_unused_indexes() from public, anon, authenticated;
revoke execute on function public.analyzer_table_sizes(integer) from public, anon, authenticated;
revoke execute on function public.analyzer_reset_stats() from public, anon, authenticated;
