-- PASUL 1: lipește tot până la linia PASUL 2 și apasă Run.
-- Migration 012: BUG-E08 — per-user (and per-guest) AI quota counters, enforced server-side.
--
-- Before: TIER_DAILY_CALL_CAP (creditManager) was per TIER and in memory per serverless instance,
-- and the per-user counters on profiles (ai_calls_today, ai_renders_this_month) are written by the
-- browser, so anyone can reset them.
--
-- Now: one row per (subject, kind, period). subject = 'user:<uuid>' | 'ip:<hash>' | 'gid:<hash>' | 'anon'.
-- consume_quota() checks the daily + monthly limits and increments both under a per-subject advisory
-- lock in one transaction, so parallel requests cannot overshoot. Limits are passed in by the API
-- (they come from the tier config in src/features/auth/types.ts), so tier logic stays in one place.
--
-- Only the service role can touch this: RLS on with no policies, and EXECUTE revoked from anon/authenticated.

create table if not exists public.usage_quota_counters (
  subject     text        not null,
  kind        text        not null check (kind in ('render', 'ai_call')),
  period_key  text        not null,            -- 'YYYY-MM-DD' (day) or 'YYYY-MM' (month), UTC
  count       integer     not null default 0 check (count >= 0),
  updated_at  timestamptz not null default now(),
  primary key (subject, kind, period_key)
);

create index if not exists idx_usage_quota_counters_updated on public.usage_quota_counters(updated_at);

alter table public.usage_quota_counters enable row level security;
-- No policies: anon/authenticated see nothing; service role bypasses RLS.

create or replace function public.consume_quota(
  p_subject     text,
  p_kind        text,
  p_day_limit   integer,   -- -1 = unlimited
  p_month_limit integer    -- -1 = unlimited
)
returns table (allowed boolean, day_count integer, month_count integer, exceeded text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now   timestamp := now() at time zone 'utc';
  v_day   text := to_char(v_now, 'YYYY-MM-DD');
  v_month text := to_char(v_now, 'YYYY-MM');
  v_d     integer;
  v_m     integer;
begin
  -- Serialise concurrent calls for the same subject+kind (released at transaction end).
  perform pg_advisory_xact_lock(hashtext(p_subject || '|' || p_kind));

  select c.count into v_d from public.usage_quota_counters c
   where c.subject = p_subject and c.kind = p_kind and c.period_key = v_day;
  select c.count into v_m from public.usage_quota_counters c
   where c.subject = p_subject and c.kind = p_kind and c.period_key = v_month;
  v_d := coalesce(v_d, 0);
  v_m := coalesce(v_m, 0);

  if p_day_limit >= 0 and v_d >= p_day_limit then
    return query select false, v_d, v_m, 'day'::text;
    return;
  end if;
  if p_month_limit >= 0 and v_m >= p_month_limit then
    return query select false, v_d, v_m, 'month'::text;
    return;
  end if;

  insert into public.usage_quota_counters as c (subject, kind, period_key, count)
  values (p_subject, p_kind, v_day, 1), (p_subject, p_kind, v_month, 1)
  on conflict (subject, kind, period_key)
  do update set count = c.count + 1, updated_at = now();

  return query select true, v_d + 1, v_m + 1, null::text;
end;
$$;

create or replace function public.refund_quota(p_subject text, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamp := now() at time zone 'utc';
begin
  perform pg_advisory_xact_lock(hashtext(p_subject || '|' || p_kind));
  update public.usage_quota_counters
     set count = greatest(count - 1, 0), updated_at = now()
   where subject = p_subject and kind = p_kind
     and period_key in (to_char(v_now, 'YYYY-MM-DD'), to_char(v_now, 'YYYY-MM'));
end;
$$;

revoke all on function public.consume_quota(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.refund_quota(text, text) from public, anon, authenticated;
grant execute on function public.consume_quota(text, text, integer, integer) to service_role;
grant execute on function public.refund_quota(text, text) to service_role;

-- Housekeeping (optional, run any time): rows older than 3 months are never read again.
-- delete from public.usage_quota_counters where updated_at < now() - interval '3 months';

-- PASUL 2 (test): șterge tot din editor, lipește doar rândurile de mai jos și apasă Run.
-- Limita de test este 2 pe zi. Rezultatul trebuie să arate: true / true / false (al treilea refuzat, exceeded = day).
select g as apel, q.* from generate_series(1, 3) g cross join lateral public.consume_quota('test:sql-editor', 'render', 2, 50) q order by g;

-- PASUL 3: curățenie după test (doar rândul de mai jos, Run).
-- delete from public.usage_quota_counters where subject = 'test:sql-editor';
