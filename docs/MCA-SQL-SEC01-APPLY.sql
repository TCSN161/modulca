-- PASUL 1: lipește tot până la linia PASUL 2 și apasă Run.
-- Migration 011: BUG-SEC-01 — users must not be able to change their own tier or Stripe columns.
--
-- The RLS policy "Users can update own profile" has no column limit, so any logged-in user
-- could run supabase.from('profiles').update({ tier: 'constructor' }) from the browser.
-- This trigger keeps the billing columns unchanged for requests made with a user or anon JWT.
-- The service role (webhook, admin scripts) and direct SQL (dashboard, migrations) are not affected.
--
-- Values are silently kept (no error), so old client code such as store.setTier keeps working
-- without throwing; it just has no effect on the server.

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
    else
      new.tier := old.tier;
      new.stripe_customer_id := old.stripe_customer_id;
      new.stripe_subscription_id := old.stripe_subscription_id;
      new.subscription_status := old.subscription_status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_billing_columns on public.profiles;
create trigger trg_protect_profile_billing_columns
  before insert or update on public.profiles
  for each row execute function public.protect_profile_billing_columns();

-- PASUL 2 (test): șterge tot din editor, lipește doar cele 2 rânduri de mai jos și apasă Run.
-- Rezultatul trebuie să arate tier = free. Asta înseamnă că un utilizator nu-și mai poate da singur Constructor.
select set_config('request.jwt.claims', '{"role":"authenticated"}', false);
update public.profiles set tier = 'constructor' where id = (select id from public.profiles where tier = 'free' order by created_at limit 1) returning email, tier;

-- PASUL 3: curățenie după test (doar rândul de mai jos, Run).
-- select set_config('request.jwt.claims', '', false);
