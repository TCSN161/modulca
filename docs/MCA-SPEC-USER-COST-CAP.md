# Per-user monthly cost cap — spec (4.05, Chat 4, 2026-11-28)

Source: business plan v0 §5 (`docs/business/MCA-STRAT-BUSINESS-PLAN-v0.md`, line 52), decision 10.01.
Status: **spec only, no code**. Why: it does not fit cleanly in the current `quota.ts` / creditManager (see §4).

## 1. Rule
- Each paying (or promo) user has a monthly AI cost cap of **30% of the plan price**:
  Premium **€6**, Architect **€15**, Constructor **€45**. Free / guest: €0 (they already use only €0 engines).
- Beta promo users (free + `beta_invited_at` < 3 months ago) count as Premium: €6.
- Past the cap the user is **not blocked**. Routes fall back to €0 engines (Pollinations, AI Horde, Cloudflare,
  cloudflare-klein; consultant → free LLM pool). The response carries `X-Cost-Cap: reached` so the UI can say why quality dropped.
- The window is the calendar month (UTC), the same as `usage_quota_counters`.

## 2. What exists today (and why it is not enough)
| Piece | What it does | Gap |
|---|---|---|
| `TIER_MONTHLY_CAP_USD` (creditManager) | $5 / $15 / $40 per **tier**, demote at 80% | One pool shared by all users of the tier, **in memory per serverless instance** (resets on cold start) |
| `usage_quota_counters` + `consume_quota` (migration 012) | Per-user daily/monthly **counts** in the DB | Counts calls, not money; `kind` CHECK allows only `render`, `ai_call` |
| `render_logs.cost_usd` / `profiles.total_cost_usd` | Cost after the fact | Written by the browser (`total_cost_usd`) or not summed per month |

## 3. Design
1. **Migration 014 (MAIN applies):** `user_cost_month (subject text, month text 'YYYY-MM', cost_micro_eur bigint, primary key (subject, month))`,
   RLS on, no policies, plus two RPCs (service role only):
   - `cost_cap_state(p_subject, p_month) → cost_micro_eur`
   - `add_cost(p_subject, p_month, p_micro_eur)` (upsert + add, advisory lock like `consume_quota`).
   Store EUR in micro-units (integer, no float drift). USD → EUR with one constant `USD_TO_EUR` in config (0.92 now).
2. **`src/shared/server/costCap.ts` (Chat 4):** `getUserCostCapEur(effectiveTier)` = `round(0.30 × price)`
   from `ACCOUNT_TIERS` (one place, no new constants), `isOverCostCap(ctx)` (reads the RPC, memory fallback like quota.ts),
   `recordUserCost(ctx, usd)`. Guests: no-op.
3. **Route wiring (Chat 3 ai-render, Chat 2 consultant):** after `getServerTier`, call `isOverCostCap(ctx)` once;
   pass `{ tier, overUserCap }` in `UseEngineContext`. In `canUseEngine`, `overUserCap === true` → only band `free` passes
   (same path as today's `demoted`). After a successful paid call, `recordUserCost(ctx, result.costUsd)`.
4. **UI (later):** `/api/stripe/status` adds `costCapEur`, `costUsedEur` for the dashboard (item 3).

## 4. Why not now
- Needs a new table/RPC (migration 014): migrations go through MAIN and Costin pastes them.
- The call sites (`ai-render/route.ts`, `consultant/route.ts`) belong to Chat 3 / Chat 2.
- The tier caps in creditManager are already lower than or equal to 30% (Premium $5 ≈ €4.6 < €6), so the immediate
  money risk is covered for a beta of 10–20 users; the gap is per-user fairness and cold-start resets.

## 5. Tests to write with the code
- cap = 6 / 15 / 45 from the tier prices; promo user → 6; free → 0.
- over cap → `canUseEngine` false for budget/mid/premium bands, true for free band.
- `add_cost` under parallel calls never loses an increment (SQL test like PASUL 2 in MCA-SQL-012).
- Month rollover resets.

## 6. Owners / order
MAIN approves migration 014 → Chat 4 writes `costCap.ts` + tests → Chat 3 and Chat 2 wire their routes (one line each + record call).
