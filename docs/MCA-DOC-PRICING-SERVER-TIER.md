# MCA-DOC-PRICING-SERVER-TIER — server tier + per-user quota (BUG-SEC-02, BUG-E08)

**Owner:** Chat 4 Billing · **Date:** 2026-11-26 · **For:** Chat 3 (`/api/ai-render`), Chat 2 (`/api/consultant`, `/api/knowledge*`). MAIN forwards this note.

## 1. What exists now

| File | What it does |
|---|---|
| `src/shared/server/serverTier.ts` | `getServerTier(req)` returns `{ userId, tier, effectiveTier, quotaSubject }`. It verifies the Supabase session (`Authorization: Bearer <access_token>`, or the `sb-*-auth-token` cookie) through the existing `getAuthenticatedUser`. It reads `profiles.tier` and `created_at` with the service role and applies `getEffectiveTier`, the same beta-promo function the client uses. Without a session it returns `guest_free`, with a hashed IP as the subject (no raw IP is stored). |
| `src/shared/server/quota.ts` | `checkAndConsumeQuota(ctx, 'render' \| 'ai_call')`, `refundQuota(ctx, kind, source)` and `quotaExceededResponse(result)`, which returns a 429 response. |
| `supabase/migrations/012_usage_quota_counters.sql` | Table `usage_quota_counters` plus the RPCs `consume_quota` and `refund_quota`. Both are `security definer` and only the service role can run them. |
| `docs/MCA-SQL-012-APPLY.sql` | Paste version of the migration for Costin, with a 3-line self-test. |
| `src/features/auth/types.ts` | Two new tier fields hold the limits: `aiRendersPerDay` and `aiConsultantMessagesPerDay`. |

**Limits** (come from the tier config, keyed by `effectiveTier`):

| effectiveTier | renders/day | renders/month | ai_call/day |
|---|---|---|---|
| guest_free | 2 | 3 | 5 |
| free (no promo) | 3 | 5 | 20 |
| premium (= beta users) | **5** | 50 | 60 |
| architect | 20 | 200 | 200 |
| constructor | 100 | unlimited | 1000 |

Beta users are `free` accounts less than 3 months old, so they run as `premium`: **5 renders a day per user**, which is Chat 3's Cloudflare budget recommendation. To tune a limit, change the number in `types.ts`. No migration is needed.

### Why an atomic Postgres function and not counting `render_logs`
1. **Race-free.** Counting `render_logs` and then rendering is check-then-act. Five parallel requests all see "4 used" and all go through. `consume_quota` takes a per-subject advisory lock, checks the day and month windows, and increments both in one transaction.
2. **Logs come too late.** `render_logs` is written *after* the render and is best-effort (skipped when Supabase is down). Cache hits and failures are mixed in with real renders.
3. **Guests.** `render_logs.user_id` is a uuid FK. Guests need an IP-hash subject.
4. **Cheap.** It is one primary-key upsert per call, instead of a `count(*)` over a growing log table.
5. **Tier logic in one place.** The SQL receives the limits as parameters, and all tier and promo logic stays in TS.

`creditManager` is unchanged and stays the **engine-cost layer**: which cost bands a tier may use, the USD caps per tier, and `TIER_DAILY_CALL_CAP` as a per-instance circuit breaker. The quota layer decides **how many** calls one person may make. creditManager decides **which engine and at what cost**. Pass the server `effectiveTier` to both.

**Fallback.** If Supabase is not configured, or the RPC fails (for example before 012 is applied), the quota falls back to an in-memory counter per instance and logs a `console.warn`. It is best effort and never blocks the route by error.

## 2. Client side: send the token (needed for both chats)

The Supabase session lives in localStorage, not in cookies. **Every `fetch` to these routes must add the Bearer header**, or the caller is treated as a guest:

```ts
import { getSupabase } from "@/shared/lib/supabase";

async function authHeaders(): Promise<Record<string, string>> {
  const sb = getSupabase();
  const token = sb ? (await sb.auth.getSession()).data.session?.access_token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
// fetch("/api/ai-render", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body })
```

You can stop sending `tier` from the client. The server ignores it from now on.

## 3. Chat 3: `/api/ai-render/route.ts` (fixes BUG-SEC-02/E07, E08, B2-01)

Do this in **both GET and POST**:

```ts
import { getServerTier } from "@/shared/server/serverTier";
import { checkAndConsumeQuota, refundQuota, quotaExceededResponse } from "@/shared/server/quota";
import { getTierConfig } from "@/features/auth/types";

// at the top of GET/POST, before any engine work:
const ctx = await getServerTier(req);          // NEVER read tier from body/query
const tier = ctx.effectiveTier;                // beta users → "premium" (fixes B2-01)

const quota = await checkAndConsumeQuota(ctx, "render");
if (!quota.allowed) return quotaExceededResponse(quota);   // 429, code QUOTA_EXCEEDED

// clamp the client's maxCostUsd to the tier ceiling
const tierMax = getTierConfig(tier).features.maxCostUsdPerImage;
const maxCost = Math.min(Number(clientMaxCostUsd) || tierMax, tierMax);

const renderReq: AiRenderRequest = { /* …, */ tier, policyFlags: DEFAULT_POLICY };
const order = getFallbackChain(tier, !!baseImage);
const res = await tryEngines(renderReq, engineParam, order, maxCost, ctx.userId);

// no image produced → give the unit back
if (!res.ok) await refundQuota(ctx, "render", quota.source);
return res;
```

Also in `tryEngines`:
- Pass `user_id: userId ?? undefined` into every `logRender(...)`. Today `user_id` is never set.
- **Cache hits:** consume before the cache check (simplest; a hit is still a render for the user). If you would rather not charge hits, move the check after the cache block and refund nothing.
- **Client (`useRenderEngine.ts`):** on `response.status === 429`, show the JSON `error` and **do not** fall back to direct Pollinations. Otherwise the quota is bypassed. Keep the fallback for 5xx.

## 4. Chat 2: `/api/consultant/route.ts` and `/api/knowledge*`

### Consultant (one `ai_call` per user message)
```ts
import { getServerTier } from "@/shared/server/serverTier";
import { checkAndConsumeQuota, refundQuota, quotaExceededResponse } from "@/shared/server/quota";

export async function POST(req: NextRequest) {
  const ctx = await getServerTier(req);
  const { messages, quizProfile } = await req.json();      // drop `tier` from the destructure
  const tier = ctx.effectiveTier;

  const quota = await checkAndConsumeQuota(ctx, "ai_call");
  if (!quota.allowed) return quotaExceededResponse(quota);

  // … existing flow using getConsultantConfig(tier), getSystemPrompt(tier), getCacheKey(q, tier) …
  // If the answer comes from the response cache or the local-KB fallback (no LLM call),
  // you may refund:  await refundQuota(ctx, "ai_call", quota.source);
}
```
`ConsultantChat.tsx`: add the Bearer header (§2), stop sending `tier`, and show the 429 `error` text in the chat.

### Knowledge (`/api/knowledge`, `/api/knowledge/search`): tier gate only, no quota
```ts
import { getServerTier } from "@/shared/server/serverTier";

const { effectiveTier: tier } = await getServerTier(req);   // replaces searchParams.get("tier")
```
Remember that `guest_free` is now a real value: map it like `free` in `TIER_LIMITS` and in the `proOnly` check (`tier === "free" || tier === "guest_free"`). `library/page.tsx` must send the Bearer header and can drop `&tier=`.

If knowledge search ever calls an LLM or embeddings API, add `checkAndConsumeQuota(ctx, "ai_call")` there too.

## 5. Not done here (follow-ups)
- `src/features/auth/store.ts` still writes `ai_calls_today`, `ai_renders_this_month` and `total_cost_usd` from the browser. They are now **display-only**: the server enforces `usage_quota_counters`. A later Chat 4 task can add `GET /api/usage`, which returns `quota.used` for the UI, and drop those client writes. `store.ts` is a high-collision file, so that is a separate session.
- 012 must be applied in Supabase (`docs/MCA-SQL-012-APPLY.sql`). Until then the in-memory fallback is in force.
- Optional: set `QUOTA_HASH_SALT` in Vercel. The default salt works, but a secret salt makes the IP hashes harder to reverse.
