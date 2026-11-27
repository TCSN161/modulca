-- Migration 013: BUG-B2-03 (invite gate) + BUG-B2-02 (promo anchor) — Chat 4, session 4.05, 2026-11-27.
--
-- Invite-only beta (Dec 15 2026). MAIN decision:
--   * beta_invites = email allowlist, read only by the server (service role).
--   * profiles.beta_invited_at = when the user was invited. It is the ANCHOR of the 3-month beta
--     promo (before: profiles.created_at, so early sign-ups lost part of the promo and every new
--     sign-up got it). NULL = not invited = plain Explorer (free), no promo.
--   * POST /api/beta/claim (called after sign-up and every login) copies invited_at from the
--     allowlist row into profiles.beta_invited_at. The optional shared code (env BETA_INVITE_CODE)
--     does the same with now() and records an allowlist row with invited_by = 'code'.
--
-- No real emails in this file. Add invites in the SQL Editor:
--   insert into public.beta_invites (email, invited_by, note) values ('someone@example.com', 'costin', 'wave 1');

create table if not exists public.beta_invites (
  email       text        primary key check (email = lower(btrim(email)) and position('@' in email) > 1),
  invited_at  timestamptz not null default now(),
  invited_by  text,
  note        text
);

alter table public.beta_invites enable row level security;
-- No policies: anon/authenticated can neither read nor write; the service role bypasses RLS.
revoke all on table public.beta_invites from anon, authenticated;

alter table public.profiles add column if not exists beta_invited_at timestamptz;

-- Extend the 011 guard: beta_invited_at is set only by the service role (the claim route) or SQL.
create or replace function public.protect_profile_billing_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
begin
  if jwt_role in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.tier := 'free';
      new.stripe_customer_id := null;
      new.stripe_subscription_id := null;
      new.subscription_status := null;
      new.beta_invited_at := null;
    else
      new.tier := old.tier;
      new.stripe_customer_id := old.stripe_customer_id;
      new.stripe_subscription_id := old.stripe_subscription_id;
      new.subscription_status := old.subscription_status;
      new.beta_invited_at := old.beta_invited_at;
    end if;
  end if;
  return new;
end;
$$;

-- Admin view: same name as before, now anchored on beta_invited_at.
create or replace view public.beta_promo_users as
  select
    id,
    email,
    display_name,
    tier,
    created_at,
    beta_invited_at + interval '3 months' as promo_expires_at,
    greatest(0, extract(day from (beta_invited_at + interval '3 months' - now()))) as days_remaining
  from public.profiles
  where tier = 'free'
    and beta_invited_at is not null
    and beta_invited_at + interval '3 months' > now();

-- The view lists emails; only the service role / SQL Editor may read it.
revoke all on table public.beta_promo_users from anon, authenticated;
