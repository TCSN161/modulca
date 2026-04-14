-- Migration 005: Add Stripe columns, Constructor tier, Beta promo support
-- Run in Supabase SQL Editor after 004_create_projects_table.sql

-- ── 1. Add Stripe subscription columns ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'unpaid', 'trialing'));

-- ── 2. Update tier constraint to include 'constructor' ──
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tier_check
  CHECK (tier IN ('guest_free', 'free', 'premium', 'architect', 'constructor'));

-- ── 3. Indexes for Stripe lookups ──
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tier
  ON public.profiles(tier);

-- ── 4. Beta promo: created_at already exists, no extra column needed.
-- The application code checks: if tier='free' AND now() < created_at + interval '3 months'
-- then grant premium-level access. This is computed at runtime, not stored.

-- ── 5. Helpful view for admin: users with active beta promo ──
CREATE OR REPLACE VIEW public.beta_promo_users AS
  SELECT
    id,
    email,
    display_name,
    tier,
    created_at,
    created_at + interval '3 months' AS promo_expires_at,
    GREATEST(0, EXTRACT(DAY FROM (created_at + interval '3 months' - now()))) AS days_remaining
  FROM public.profiles
  WHERE tier = 'free'
    AND created_at + interval '3 months' > now();
