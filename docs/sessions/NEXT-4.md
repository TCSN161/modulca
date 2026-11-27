# NEXT-4 — proposed next Chat 4 Billing session

**Session:** `4.06.Billing_Cost-Cap-Expiry-Email_2026MMDD` (date = day MAIN starts it)
**Written by:** 4.05 (2026-11-28) · **Model:** Opus (code)

## What 4.05 shipped (master)
| Commit | Bug | Change |
|---|---|---|
| b84540a | B2-03 + B2-02 | Migration `013_beta_invites.sql` (+ paste-ready `docs/MCA-SQL-013-APPLY.sql`, **not applied**): table `beta_invites` (email PK lowercase, invited_at, invited_by, note; RLS, no policies), `profiles.beta_invited_at`, the 011 guard also protects `beta_invited_at`, view `beta_promo_users` re-anchored and revoked from anon/authenticated. `src/features/beta/claim.ts` (pure rules + tests) and `POST /api/beta/claim` (allowlist lookup, optional `BETA_INVITE_CODE`, writes `beta_invited_at` once, never moves it). Promo anchor = `beta_invited_at` everywhere: `getEffectiveTier`/`getBetaPromoDaysLeft` (types.ts), `promoAnchorOf` in `billing.ts` (checkout + status), `serverTier.ts`. The auth store calls the claim after sign-up (SIGNED_IN) and at every login; `?invite=CODE` on any URL is kept in localStorage until the claim. Pre-013 safe: `select("*")`, missing table = not invited. |
| e088db7 | cost cap | `docs/MCA-SPEC-USER-COST-CAP.md`: €6/€15/€45 per user per month, fallback to €0 engines. Not coded: needs migration 014 (money counter) and the ai-render / consultant call sites (Chat 3 / Chat 2). |
| 6e85ddb | UI-01 + item 3 | Dashboard: the portal result is shown inline (`notify:false`), "Upgrade" hidden for Constructor. |

Tested: vitest 472/472, tsc 0. Not tested live (no browser run with a signed-in account, SQL not applied).
Pricing beta banner: it reads the store, which now gets the anchor from the server claim, so it is server-sourced; no separate `/api/stripe/status` call added.

## Costin
1. SQL Editor → paste `docs/MCA-SQL-013-APPLY.sql` PASUL 1, Run; PASUL 2 must show true/true/true.
2. Add invites (PASUL 3). Decide PASUL 5 (keep the promo for the existing free accounts) — without it they are Explorer.
3. Optional: set `BETA_INVITE_CODE` in Vercel env (Production). Unset = code path off. Share links as `https://modulca.eu/register?invite=CODE`.
**Until step 1 runs, no one has the promo on prod** (the code is already live).

## Prompt for 4.06

You are Chat 4 Billing, session `4.06.Billing_Cost-Cap-Expiry-Email`.
Read first: this file, `docs/MCA-SPEC-USER-COST-CAP.md`, `src/features/beta/claim.ts`.
0. Check with MAIN that MCA-SQL-013 is applied (PASUL 2 output). If not, remind Costin, nothing else blocks.
1. **Cost cap.** If MAIN approves migration 014 from the spec: write it + `src/shared/server/costCap.ts` + tests; hand Chat 3/Chat 2 the one-line wiring (`overUserCap` in `UseEngineContext`, `recordUserCost`).
2. **BUG-B2-04, promo expiry email** at 7 days left and at 0 (MAIN owns templates). Needs a daily job (Vercel cron on Hobby = 1/day is enough) reading `beta_promo_users` with the service role; mark sent in a column to avoid repeats (migration).
3. Sign-up form: optional "Invite code" field writing `INVITE_CODE_STORAGE_KEY` (RO/EN/NL), if MAIN wants it beyond `?invite=`.
4. Smoke test on prod with a test account: not invited → Explorer; allowlisted → Premium (Beta — ~90d left); `/api/stripe/status` shows `betaInvitedAt`.
Finish: vitest + tsc, commit with explicit paths, push, W50 log row, next NEXT-4.

## Open, owned elsewhere
- BUG-B2-01 (`useRenderEngine` raw tier): Chat 3, mostly moot (routes use `getServerTier`).
- ST18 (Google consent shows supabase.co): MAIN.
