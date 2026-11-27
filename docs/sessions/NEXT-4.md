# NEXT-4 — proposed next Chat 4 Billing session

**Session:** `4.05.Billing_Invite-Gate-Promo-Anchor_2026112X` (date = day MAIN starts it)
**Written by:** 4.04 (2026-11-27) · **Model:** Opus (code)

## What 4.04 shipped (master)
| Commit | Bug | Change |
|---|---|---|
| 62c33a2 | ST15 | `/api/stripe/checkout` needs a session (Bearer/cookie); the user id and email come from it. The body `userId` is ignored. `redirectToCheckout(priceId)` sends `authHeaders`. |
| bd3c7c8 | ST16 | `src/app/api/stripe/billing.ts` + tests. The checkout returns 409 `not_an_upgrade` for a tier ≤ the effective tier, 409 `use_portal` for a live subscriber (no second subscription), and 400 for an unknown price. On `checkout.session.completed`, the webhook keeps a comp tier when the purchase is lower, does not bind the subscription, and sends a Sentry warning ("refund needed"). `/pricing`: "Current plan" on the effective tier; lower tiers show "Included in your plan" plus the portal or "Contact us". |
| d36ba7d | ST14 | `openCustomerPortal()` sends Bearer. The portal returns `{code:"comp"}` / `{code:"no_subscription"}` (200) and shows "Cont gratuit (comp), fără abonament Stripe" (RO/EN/NL). `/pricing` shows it inline; the dashboard gets a localized `alert` fallback. |
| 432fbf1 | ST17 | The `/pricing` feature numbers (modules, renders/month, resolution, projects) are ICU params read from `ACCOUNT_TIERS`. Prices show as €149.90. The article counts are gone. The Premium consultant is "Advanced AI consultant": its chain is **OpenAI first** (`consultant/route.ts` `CONSULTANT_DEPTH.premium`), so it is *not* labelled Claude; Architect keeps Claude. The upgrade email reads from the tier config (it said 30/100 renders before; Constructor now gets its own list). |
| 8e505c9 | ST19 | `features/beta/components/BetaPromoNotice.tsx` appears above the sign-up form. |
| 714bcf8 | DB-01 + promo | The webhook maps `incomplete`→`unpaid` and `incomplete_expired`/`paused`→`canceled`, and throws on a failed profile update (Stripe retries). New route `GET /api/stripe/status`: tier, effective tier, beta days left, comp, subscription, all computed on the server. |

Tested: `npx vitest run` gives 384/384. tsc is clean except `dashboard/page.tsx`, which 5.03 is editing (uncommitted). In the browser, `/pricing` (guest) shows €149.90 and numbers from the config, and `/register` shows the beta banner. Not tested live: checkout and portal with a signed-in comp account. Costin or MAIN should check them in TEST mode on prod. Don't enter a card.

## Costin — Stripe dashboard text to change by hand (TEST and later LIVE)
The tier config (`src/features/auth/types.ts`) is the source. Product descriptions in Stripe → Product catalog:
- **ModulCA Premium**: "Up to 12 modules per project · 50 AI renders/month (HD) · all 6 drawing types + PDF export · 10 projects · email support". It says 30 renders / 5 projects now.
- **ModulCA Architect**: "Up to 50 modules, custom sizes · 200 AI renders/month (4K) · DWG/DXF export · unlimited projects · team collaboration · priority support".
- **ModulCA Constructor**: "Up to 200 modules · unlimited AI renders (4K, fair use 100/day) · white-label · unlimited projects · dedicated account manager". The price is €149.90/month.
- Don't mention a model name (GPT-4o or Claude) in any Stripe text.

## Prompt for 4.05

You are Chat 4 Billing, session `4.05.Billing_Invite-Gate-Promo-Anchor`.
Read first: the §9 files in `docs/MCA-DOC-CHAT-WORKFLOW-2026-11-22.md`, this file, and `docs/MCA-DOC-PRICING-COMP-ACCOUNTS.md` §4 (BUG-B2-*). Write only in Chat 4 paths.
1. **BUG-B2-03, invite gate for the Dec 15 invite-only beta.** Ask MAIN whether to use an invite code or an email allowlist. Build it in `src/features/beta/**`, with a server check in a `src/app/api/beta/**` or `api/stripe/**`-style route. Any migration goes through MAIN.
2. **BUG-B2-02, promo anchor.** Wait for MAIN's decision (`beta_invited_at` or signup date). Then change `getEffectiveTier` / `computeBillingStatus` in one place.
3. **Dashboard, once 5.03 has committed `dashboard/page.tsx`.** Read `/api/stripe/status` and render the portal result inline instead of using an `alert`. Hide "Upgrade" for Constructor (BUG-UI-01; MAIN owns the dashboard, so ask first). Have the pricing page's beta banner use `/api/stripe/status` too.
4. **BUG-B2-04, promo expiry email** at 7 days left and at 0, with MAIN (templates).
Finish: run vitest and tsc, commit with explicit paths, push, add a live-log line, and write the next NEXT-4.

## Open, owned elsewhere
- BUG-B2-01 (`useRenderEngine` sends the raw tier): Chat 3. Now partly moot, because routes use `getServerTier`.
- BUG-SEC-01: done by migration 011 (MAIN). Check that it is applied in prod.
- ST18 (Google consent shows the supabase.co domain): MAIN.
