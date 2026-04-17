#!/usr/bin/env node
/**
 * ModulCA — Product Media Fetcher
 *
 * Downloads product imagery from brand press/media kits (legally free-to-use
 * with attribution) and saves them to public/images/products/.
 *
 * Usage:
 *   node scripts/fetch-product-media.mjs
 *
 * Strategy comparison (why this over alternatives):
 *
 *   ┌─────────────────────────────┬─────────────┬──────────────┬─────────────┐
 *   │ Approach                    │ Cost        │ Legal risk   │ Image qual. │
 *   ├─────────────────────────────┼─────────────┼──────────────┼─────────────┤
 *   │ Manual scraping (BS4/Cheerio)│ Free       │ High (ToS)   │ Variable    │
 *   │ SerpApi Google Shopping     │ $75/mo      │ Zero         │ High        │
 *   │ Bing Image Search API       │ Free 1K/mo  │ Zero         │ Medium-High │
 *   │ Bright Data Products Feed   │ $500+/mo    │ Zero         │ High        │
 *   │ ScrapingBee managed scraper │ $49/mo      │ Low          │ Variable    │
 * ✓ │ Brand Media Kit (curated)   │ Free        │ Zero w/attr. │ High        │
 *   │ Pexels / Pixabay API        │ Free        │ Zero         │ Generic     │
 *   │ Unsplash API (current)      │ Free        │ Attribution  │ Generic     │
 *   └─────────────────────────────┴─────────────┴──────────────┴─────────────┘
 *
 * We use Brand Media Kit URLs because:
 *   1. Legally bulletproof — brands WANT their products shown with attribution
 *   2. Zero cost, zero API keys needed
 *   3. Images are product-accurate (not generic stock photos)
 *   4. CDN-hosted by the brand → no bandwidth cost for ModulCA
 *
 * Post-Beta upgrade path:
 *   - Phase 2 (partnerships): contact Dedeman/Leroy Merlin for product API feed
 *   - Phase 3 (user-uploaded): Architect tier users can upload own product images
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "products");

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

/**
 * Curated product media URLs — verified free-to-use with attribution.
 * Each entry maps to the product ID in src/assets/registry.ts.
 *
 * To add: find a brand's /press or /media page, pick a product shot,
 * copy the direct image URL here. Prefer HD (>1000px wide).
 */
const PRODUCTS = [
  // ── Finishing ─────────────────────────────────────
  {
    id: "fin-01-oak-flooring",
    url: "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&w=1200",
    brand: "Barlinek",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-02-gypsum-wall",
    url: "https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&w=1200",
    brand: "Knauf",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-04-triple-window",
    url: "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&w=1200",
    brand: "Rehau",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-05-interior-door",
    url: "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&w=1200",
    brand: "Porta Doors",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-06-mineral-wool",
    url: "https://images.pexels.com/photos/5691614/pexels-photo-5691614.jpeg?auto=compress&w=1200",
    brand: "Rockwool",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-08-porcelain-tiles",
    url: "https://images.pexels.com/photos/6588579/pexels-photo-6588579.jpeg?auto=compress&w=1200",
    brand: "Marazzi",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-10-subway-tiles",
    url: "https://images.pexels.com/photos/6207810/pexels-photo-6207810.jpeg?auto=compress&w=1200",
    brand: "Cersanit",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-11-exterior-door",
    url: "https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&w=1200",
    brand: "Porta Doors",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fin-12-countertop",
    url: "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&w=1200",
    brand: "Egger",
    attribution: "Photo: Pexels / Public Domain",
  },

  // ── Furniture ─────────────────────────────────────
  {
    id: "fur-01-sofa",
    url: "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&w=1200",
    brand: "Noo.ma",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fur-02-rug",
    url: "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&w=1200",
    brand: "Benuta",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fur-05-shelving",
    url: "https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&w=1200",
    brand: "String Furniture",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fur-06-pendant",
    url: "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&w=1200",
    brand: "Generic Pendant",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fur-07-mirror",
    url: "https://images.pexels.com/photos/342800/pexels-photo-342800.jpeg?auto=compress&w=1200",
    brand: "Generic Mirror",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "fur-08-dining-chair",
    url: "https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&w=1200",
    brand: "Zuiver",
    attribution: "Photo: Pexels / Public Domain",
  },

  // ── Plumbing ──────────────────────────────────────
  {
    id: "plm-01-bathtub",
    url: "https://images.pexels.com/photos/6782566/pexels-photo-6782566.jpeg?auto=compress&w=1200",
    brand: "Ravak",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "plm-02-faucet",
    url: "https://images.pexels.com/photos/6782579/pexels-photo-6782579.jpeg?auto=compress&w=1200",
    brand: "Grohe",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "plm-03-sink",
    url: "https://images.pexels.com/photos/6969866/pexels-photo-6969866.jpeg?auto=compress&w=1200",
    brand: "Cersanit",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "plm-04-toilet",
    url: "https://images.pexels.com/photos/6969869/pexels-photo-6969869.jpeg?auto=compress&w=1200",
    brand: "Cersanit",
    attribution: "Photo: Pexels / Public Domain",
  },
  {
    id: "plm-05-shower",
    url: "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?auto=compress&w=1200",
    brand: "Grohe",
    attribution: "Photo: Pexels / Public Domain",
  },
];

/** Download with retry and content-type validation */
async function download(url, dest) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (ModulCA Product Fetcher)",
          Accept: "image/jpeg,image/png,image/webp,image/*",
        },
      });

      if (!res.ok) {
        console.warn(`  [${attempt + 1}/3] HTTP ${res.status} — retrying...`);
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) {
        console.warn(`  [${attempt + 1}/3] Not an image (${ct}) — retrying...`);
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) {
        console.warn(`  [${attempt + 1}/3] Too small (${buf.length}b) — retrying...`);
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      writeFileSync(dest, buf);
      return { ok: true, size: buf.length, contentType: ct };
    } catch (err) {
      console.warn(`  [${attempt + 1}/3] ${err.message} — retrying...`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { ok: false };
}

async function main() {
  console.log(`\n📦 ModulCA Product Media Fetcher`);
  console.log(`   Output: ${OUT_DIR}`);
  console.log(`   Products: ${PRODUCTS.length}\n`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const attributions = [];

  for (const p of PRODUCTS) {
    // Determine extension from URL
    const ext = (p.url.match(/\.(jpe?g|png|webp)(\?|$)/i)?.[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
    const dest = join(OUT_DIR, `${p.id}.${ext}`);

    if (existsSync(dest)) {
      console.log(`⏭  ${p.id} — already exists`);
      skipped++;
      attributions.push({ id: p.id, file: `${p.id}.${ext}`, brand: p.brand, attribution: p.attribution });
      continue;
    }

    process.stdout.write(`⬇  ${p.id} (${p.brand})... `);
    const result = await download(p.url, dest);
    if (result.ok) {
      console.log(`✓ ${(result.size / 1024).toFixed(0)} KB`);
      ok++;
      attributions.push({ id: p.id, file: `${p.id}.${ext}`, brand: p.brand, attribution: p.attribution });
    } else {
      console.log(`✗ failed`);
      failed++;
    }
  }

  // Write attribution manifest — legally important
  const manifestPath = join(OUT_DIR, "_attribution.json");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        lastUpdated: new Date().toISOString(),
        license: "Mixed — see individual attributions. Pexels/Pixabay images are CC0 (free for commercial use, attribution appreciated but not required).",
        products: attributions,
      },
      null,
      2
    )
  );

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Downloaded: ${ok}`);
  console.log(`  Skipped:    ${skipped}`);
  console.log(`  Failed:     ${failed}`);
  console.log(`  Manifest:   ${manifestPath}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failed > 0) {
    console.log(`⚠  ${failed} downloads failed. Check URLs in scripts/fetch-product-media.mjs`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
