# MCA-DOC-PRICING-COMP-ACCOUNTS — free full accounts (no Stripe charge)

> Owner: Chat 4 Billing · Written 2026-11-26 (sprint item B1, part of B2) · Status: **in force**
> Script: `scripts/stripe-comp-account.mjs` · Webhook guard: `src/app/api/stripe/webhook/route.ts` (`isCurrentSubscription`)

## 1. What a comp account is

A **comp account** is a profile with a paid tier that nobody pays for. It is used for Costin, the partner architect, and testers.

| Column | Value for comp |
|---|---|
| `profiles.tier` | `premium` / `architect` / `constructor` |
| `profiles.stripe_subscription_id` | `NULL` (this is the comp marker) |
| `profiles.subscription_status` | `'free'` (the CHECK constraint allows only `free, active, past_due, canceled, unpaid, trialing`, so there is no `'comp'` value without a migration) |
| `profiles.stripe_customer_id` | can stay as it is (an old TEST customer does no harm) |

**Rule:** paid tier + no `stripe_subscription_id` = comp. Stripe can't change it (§3).

## 2. Procedure

Run these from the repo root on a machine that has `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The script never prints keys, and it prints only the profile you name.

The user must have signed up and logged in once, so that the `profiles` row exists.

### Grant
```powershell
node scripts/stripe-comp-account.mjs grant <email> constructor
```
- The tier is `premium`, `architect` or `constructor` (default `constructor`).
- The grant refuses if the profile has a live Stripe subscription (`active`, `trialing` or `past_due`). Cancel that subscription in the Stripe dashboard first, or leave the paid plan alone.
- Add `--dry-run` to see the change without writing it.
- The user must **reload the app** (or log out and back in). The tier is read once at `loadSession`.

### Check
```powershell
node scripts/stripe-comp-account.mjs status <email>
```
The `kind` line says `COMP`, `PAID (Stripe-managed)` or `free`.

### Revoke
```powershell
node scripts/stripe-comp-account.mjs revoke <email>
```
- This sets `tier='free'`. It refuses for Stripe-managed accounts; for those, cancel in Stripe and the webhook downgrades them.
- ⚠️ If the account is **less than 3 months old**, the user falls into the beta promo and still gets **Premium** features until `created_at + 3 months` (`getEffectiveTier` in `src/features/auth/types.ts`). That is the intended behaviour for beta users. For a hard cut, use the SQL below and also set `created_at` back. Do this only on purpose.

### Same thing in SQL (Supabase → SQL Editor)
```sql
-- grant
update public.profiles
   set tier = 'constructor', stripe_subscription_id = null, subscription_status = 'free'
 where lower(email) = lower('<email>');

-- check
select tier, subscription_status, stripe_subscription_id is not null as has_sub
  from public.profiles where lower(email) = lower('<email>');

-- revoke
update public.profiles
   set tier = 'free', subscription_status = 'free'
 where lower(email) = lower('<email>') and stripe_subscription_id is null;
```

### Comp log (no emails here; the email is in the script's output only)
| Date | Who | Tier | By | Note |
|---|---|---|---|---|
| 2026-11-26 | Costin (personal account) | constructor | MAIN, then Chat 4 normalised it | Had an old TEST customer with status `canceled`; set to `free` |
| 2026-11-26 | Costin (admin account in `src/app/admin/page.tsx`) | constructor | MAIN, then Chat 4 normalised it | Same |

Add a row for Vlad and for each tester when they are granted.

## 3. B1 trace: does `constructor` really get everything?

**Verdict: yes.** Nothing downgrades a comp account after today's webhook fix.

| Where | How the tier is read | Constructor result |
|---|---|---|
| Client store `src/features/auth/store.ts` `loadSession` | `profiles.tier` (anon key + RLS), once per load and on `SIGNED_IN` / `TOKEN_REFRESHED` | `userTier='constructor'` |
| Beta promo `getEffectiveTier` / `isBetaPromoActive` (`types.ts`) | It only applies when `tier === 'free'` | Not touched ✅ |
| `canAccess` / `FeatureGate` / Style / Walkthrough (VR, cinematic) | The effective tier's `features` | All `true`; `vrMode`, `whiteLabel` and `exportDwg` too ✅ |
| `canCreateProject` | `maxProjects = -1` | Unlimited ✅ |
| `canUseAiCall` / `canUseMonthlyRender` (`ai_calls_*`, `ai_renders_*`) | `aiRendersPerMonth = -1` | Returns early, so there is no daily or monthly limit ✅ (the counters still go up; harmless) |
| AI render `/api/ai-render` (+ `creditManager.ts`) | The `tier` the client sends (`useRenderEngine` sends the raw `userTier`) | Bands free→premium, $40/month cap, 2000 calls/day (shared per tier, in memory) ✅; `maxCostUsdPerImage 0.15`; fallback chain = default `FALLBACK_ORDER` |
| Consultant `/api/consultant` | The `tier` the client sends (`ConsultantChat` sends the effective tier) | `aiConsultantTier: "architect"`, so the deepest prompt and provider chain ✅ |
| Library `/api/knowledge?tier=` | The client's effective tier | Pro articles and the full limit ✅ |
| Stripe webhook | `customer.subscription.updated/deleted` with `metadata.userId` | **Before the fix:** any event for that user, including a stale old TEST subscription, set `tier='free'`. **After the fix:** ignored unless `sub.id === profiles.stripe_subscription_id`. A comp account has `NULL`, so it is never touched ✅ |
| `checkout.session.completed` | Real checkout | This still overwrites the tier. That is correct: if a comp user actually subscribes, they become Stripe-managed |
| Expiry jobs / crons | — | None exist. There is no "no `stripe_subscription_id` → free" rule anywhere in the code ✅ |

**Webhook change (2026-11-26):** `isCurrentSubscription()` guards both `updated` and `deleted`. `trialing` now keeps the paid tier; before, every status except `active` meant `free`. Events can arrive out of order: an early `updated` that comes before `checkout.session.completed` is ignored, which is harmless because the checkout sets the tier anyway.

## 4. B2: beta promo path (code-level review, 2026-11-26)

**Finding: the beta promo is not a Stripe flow.** No Premium subscription is created, and no invite object exists. It is computed in the client: `tier='free'` **and** `now < profiles.created_at + 3 months` gives the effective tier `premium`. "Dated downgrade" means the promo simply stops being true. There is no event and no email. So there is nothing to run end to end in Stripe TEST. The review below is a code trace, not a live run. The live run belongs in MAIN's smoke test on Fri 27 with a fresh free test account.

Smoke-test steps for MAIN: (1) sign up a new account, (2) the pricing page shows "Premium (Beta — 9Xd left)", (3) Style premium directions are unlocked, (4) the consultant answers at premium depth, (5) a render works. Expect BUG-B2-01 on step 5.

| BUG | Flow | Steps | Owner | Severity |
|---|---|---|---|---|
| BUG-B2-01 | Beta promo → render | Free account < 3 months old renders an image. `useRenderEngine.ts` sends the raw `userTier` ('free'), not `getEffectiveTier()`, so the server gives free engines and a $0 cap while the UI says Premium | Chat 3 Engines (`src/features/design/components/render/useRenderEngine.ts`) | med |
| BUG-B2-02 | Beta promo window | The window is `created_at + 3 months`, not "3 months from the beta start / invite". Accounts made before Dec 15 lose part of the promo, and the 11 existing free users may already be expired or close to it. Decision needed: anchor on an invite date (`beta_invited_at` column + migration) or accept signup-based | MAIN decides → Chat 4 implements (`types.ts` + migration) | med |
| BUG-B2-03 | Beta invite | There is no invite gate or invite record (`src/features/beta/**` does not exist). Anyone who signs up gets the promo. For invite-only Dec 15 this needs a code or an allowlist | Chat 4 (B3, W50) | med |
| BUG-B2-04 | Promo expiry | Silent downgrade: no reminder email at about 7 days left and none at expiry. Users lose renders without being told | Chat 4 + MAIN (email templates) | low |
| BUG-SEC-01 | Tier self-grant | The RLS policy `"Users can update own profile"` has no column limit. Any logged-in user can run `supabase.from('profiles').update({tier:'constructor'})` from the browser console. `store.setTier` does exactly this in demo mode | MAIN (migration: a trigger that blocks tier / stripe_* changes unless `auth.role()='service_role'`) | **high** before public beta |
| BUG-SEC-02 | Tier trusted from client | `/api/ai-render`, `/api/consultant` and `/api/knowledge` take `tier` from the request body or query. Anyone can claim `constructor` (paid engines, up to $40/month per tier pool). The fix is to read the tier server-side from the session's profile | Chat 3 (ai-render) + Chat 2 (consultant, knowledge) | **high** before public beta |
| BUG-UI-01 | Dashboard | `dashboard/page.tsx:423` shows "Upgrade" to `constructor` (it only hides it for `architect`) | MAIN (dashboard) | low |
| BUG-DB-01 | Webhook statuses | The `subscription_status` CHECK is missing `incomplete`, `incomplete_expired` and `paused`. The webhook update for those statuses fails silently, and the tier is not changed either | MAIN (migration) | low |

## 5. Not done / next

- B2 live run: in MAIN's smoke test (steps in §4).
- After the beta, when real customers exist: re-check the comp list monthly (`status` on every row of the comp log).
