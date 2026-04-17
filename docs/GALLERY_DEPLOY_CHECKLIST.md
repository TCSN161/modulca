# Gallery System — Deployment Checklist

One-time setup to activate the public gallery feature in production.
Estimated time: **~5 minutes manual + 5 minutes seed script**.

---

## ☑️ Step 1: Apply database migration

Copy the entire contents of `supabase/migrations/007_gallery_system.sql`
into the **Supabase SQL Editor** and click **Run**.

This creates:
- `public_renders` table (FIFO + hall-of-fame rows)
- `render_ratings` table (star votes)
- `gallery_settings` table (single-row global config)
- `render_status` enum
- `evict_old_renders()` function (runs on every publish to stay under capacity)
- Row-level security policies for each table

Expected result: `Success. No rows returned.`

---

## ☑️ Step 2: Create Supabase Storage bucket

**Supabase Dashboard → Storage → New bucket**

| Field | Value |
|---|---|
| Name | **`renders-public`** |
| Public bucket | **ON** (required for CDN image serving) |
| File size limit | **5 MB** |
| Allowed MIME types | `image/webp,image/png,image/jpeg` |

Click **Create**.

---

## ☑️ Step 3: Verify Storage policies (auto-applied)

Supabase automatically creates public READ policies for public buckets.
No extra config needed. Verify at:

**Storage → renders-public → Policies** — you should see `Public read` listed.

---

## ☑️ Step 4: Seed the gallery with 5 admin renders

Run locally:

```bash
npm run seed:gallery
```

This:
- Calls the live `/api/ai-render` endpoint with 5 diverse prompts
- Uses only FREE engines (cloudflare, pollinations, huggingface)
- Pipes each result into `/api/renders/publish` as `isAdmin=true`
- Leaves 10s between renders to respect rate limits

Expected output:
```
[1/5] cloudflare     living      ✓ rendered 554KB  ✓ /g/2026-04-17-cloudflare-xyz123
[2/5] pollinations   bedroom     ✓ rendered 94KB   ✓ /g/2026-04-17-pollinations-abc456
...
  Success: 5/5
```

---

## ☑️ Step 5: Verify public pages

- **https://www.modulca.eu/gallery** — should show your 5 seeded renders
- **https://www.modulca.eu/g/{slug}** — click any card, landing page loads
- **https://www.modulca.eu/admin/gallery** — analytics dashboard with charts
- **https://www.modulca.eu/gallery/hall-of-fame** — empty at first, populates once renders get rated

---

## ✅ You're done

From this point forward:

- **Admin test renders** in `/admin/engines` show a "📤 Publish to gallery" button on each successful card.
- **User renders** in `/project/[id]/render` show a "Share with community" section with a publish button when a render exists.
- Every publish:
  - Converts PNG → WebP @ q=85 (avg 400 KB)
  - Generates 400×300 thumbnail (~30 KB)
  - Embeds a QR watermark in the bottom-right pointing to `/g/{slug}`
  - Inserts DB row + uploads both to Storage
  - Runs `evict_old_renders()` to enforce the 100-slot cap
- Every rating (1-5 stars):
  - Guests → redirected to `/register?redirect=/g/{slug}`
  - Logged-in users vote once (unique constraint)
  - Self-ratings apply 0.5× weight to prevent gaming
  - Hall of Fame auto-promotes renders whose `score_weighted ≥ 3.0`

## 🔧 Admin tunables

Change these anytime in **Supabase → Table Editor → gallery_settings**:

| Column | Default | Meaning |
|---|---|---|
| `show_prices_globally` | `true` | Hide all prices on gallery tiles + `/g/{slug}` |
| `show_estimated_cost` | `true` | Hide just the cost column (keep area) |
| `show_rating_counts` | `true` | Show/hide total vote count next to avg |
| `max_active_renders` | `100` | FIFO capacity before eviction |
| `max_hall_of_fame` | `30` | Hall capacity before demoting lowest-rated |
| `moderation_mode` | `off` | `off` / `auto` / `manual` — for future Gemini Safety check |
| `hall_score_threshold` | `3.0` | Minimum score to qualify for hall promotion |

## 🧹 Routine maintenance

Weekly audit is automatic via the **GitHub Action** (`.github/workflows/engines-audit.yml`).
Monthly, pop the gallery analytics page for a sanity check of distribution:

**https://www.modulca.eu/admin/gallery**

That's it. No cron setup needed for the gallery — eviction runs per-publish.
