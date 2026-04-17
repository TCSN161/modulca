#!/usr/bin/env node
/**
 * Gallery seed script — pushes N admin-owned renders to the public gallery
 * so /gallery has content out of the box (before any real user publishes).
 *
 * Usage:
 *   node scripts/seed-gallery.mjs          # uses default prompts, 3 engines, 5 renders
 *   COUNT=10 node scripts/seed-gallery.mjs # more renders
 *   BASE_URL=http://localhost:3000 node scripts/seed-gallery.mjs
 *
 * Requirements:
 *   - Migration 007 already applied in Supabase
 *   - Storage bucket 'renders-public' exists (public, 1-year cache)
 *   - Production deploy is live
 *
 * Strategy: call the public /api/ai-render endpoint with a free engine,
 * then pipe the result into /api/renders/publish as an admin-owned render.
 * No API keys needed — works purely against the live endpoint.
 */

const BASE_URL = process.env.BASE_URL || "https://www.modulca.eu";
const COUNT = Number(process.env.COUNT || 5);

/**
 * Seed set — diverse enough to show off filters on the gallery page
 * without spamming the free quota of any single engine.
 */
const SEEDS = [
  {
    prompt: "modern scandinavian living room with timber wall, natural light, minimalist birch furniture, interior design photography",
    engine: "cloudflare",
    roomType: "living",
    styleDirection: "scandinavian",
    finishLevel: "standard",
    moduleCount: 3,
    areaSqm: 27,
    estimatedCostEur: 32000,
  },
  {
    prompt: "warm contemporary bedroom with brass accents, soft textiles, warm wood floor, evening mood, architectural photography",
    engine: "pollinations",
    roomType: "bedroom",
    styleDirection: "warm-contemporary",
    finishLevel: "high",
    moduleCount: 2,
    areaSqm: 18,
    estimatedCostEur: 22000,
  },
  {
    prompt: "industrial kitchen with concrete counter, exposed ceiling beams, matte black fittings, morning natural light",
    engine: "cloudflare",
    roomType: "kitchen",
    styleDirection: "industrial",
    finishLevel: "standard",
    moduleCount: 2,
    areaSqm: 18,
    estimatedCostEur: 26000,
  },
  {
    prompt: "biophilic bathroom with green plants, slate tiles, rain shower, soft natural lighting, spa-like atmosphere",
    engine: "pollinations",
    roomType: "bathroom",
    styleDirection: "biophilic",
    finishLevel: "high",
    moduleCount: 1,
    areaSqm: 9,
    estimatedCostEur: 14000,
  },
  {
    prompt: "japanese wabi-sabi home office with tatami floor, shoji screens, minimalist desk, morning zen atmosphere",
    engine: "huggingface",
    roomType: "office",
    styleDirection: "japanese-wabi-sabi",
    finishLevel: "standard",
    moduleCount: 1,
    areaSqm: 9,
    estimatedCostEur: 12000,
  },
];

/** Call the public render endpoint and return the image buffer */
async function renderImage(seed) {
  const url = `${BASE_URL}/api/ai-render?prompt=${encodeURIComponent(seed.prompt)}&width=1024&height=768&engine=${seed.engine}&tier=architect`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${seed.engine}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/png";
  return { buf, contentType };
}

/** Push the buffer into the gallery via /api/renders/publish */
async function publishImage(seed, image) {
  const dataUrl = `data:${image.contentType};base64,${image.buf.toString("base64")}`;
  const res = await fetch(`${BASE_URL}/api/renders/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageDataUrl: dataUrl,
      engineId: seed.engine,
      isAdmin: true,
      promptExcerpt: seed.prompt.slice(0, 200),
      roomType: seed.roomType,
      styleDirection: seed.styleDirection,
      finishLevel: seed.finishLevel,
      moduleCount: seed.moduleCount,
      areaSqm: seed.areaSqm,
      estimatedCostEur: seed.estimatedCostEur,
      showPrice: true,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`publish failed ${res.status}: ${text.slice(0, 150)}`);
  }
  return res.json();
}

async function main() {
  console.log(`\n🌱 ModulCA Gallery Seeder`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Seeding ${COUNT} renders\n`);

  const seeds = SEEDS.slice(0, COUNT);
  let ok = 0;
  let fail = 0;

  for (const [i, seed] of seeds.entries()) {
    process.stdout.write(`[${i + 1}/${seeds.length}] ${seed.engine.padEnd(14)} ${seed.roomType.padEnd(10)} `);
    try {
      const img = await renderImage(seed);
      process.stdout.write(`✓ rendered ${(img.buf.length / 1024).toFixed(0)}KB  `);
      const pub = await publishImage(seed, img);
      console.log(`✓ /g/${pub.slug}`);
      ok++;
      // 10s between renders to respect per-minute rate limits on free engines
      if (i < seeds.length - 1) {
        await new Promise((r) => setTimeout(r, 10_000));
      }
    } catch (err) {
      console.log(`✗ ${err.message}`);
      fail++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Success: ${ok}/${seeds.length}`);
  console.log(`  Failed:  ${fail}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n✓ View at ${BASE_URL}/gallery\n`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
