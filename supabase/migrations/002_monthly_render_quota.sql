-- Migration 002: Monthly render quota + cost tracking + guest_free tier
-- Server-side enforcement of render quotas (replaces localStorage tracking).

-- Monthly render counter (resets when month changes)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_renders_this_month INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_renders_month TEXT; -- 'YYYY-MM' format

-- Cumulative cost tracking (total USD spent on AI renders)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_cost_usd REAL NOT NULL DEFAULT 0;

-- Update tier check constraint to include guest_free
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tier_check
  CHECK (tier IN ('guest_free', 'free', 'premium', 'architect'));
