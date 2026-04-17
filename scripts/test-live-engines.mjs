#!/usr/bin/env node
/**
 * Live Engine Smoke Test
 *
 * Hits the production /api/ai-render endpoint once per engine and reports:
 *   - HTTP status
 *   - Latency (ms)
 *   - Cost estimate
 *   - Error message if any
 *
 * Usage:
 *   node scripts/test-live-engines.mjs              # test all engines
 *   node scripts/test-live-engines.mjs gemini       # test one
 *   BASE_URL=http://localhost:3000 node scripts/test-live-engines.mjs
 */

const BASE_URL = process.env.BASE_URL || "https://www.modulca.eu";
const PROMPT =
  "photorealistic modern modular house with timber cladding, mountain landscape, golden hour light";

const FILTER = process.argv[2];

const ENGINES = [
  "pollinations",
  "ai-horde",
  "together",
  "cloudflare",
  "huggingface",
  "fal",
  "segmind",
  "fireworks",
  "deepinfra",
  "leonardo",
  "replicate",
  "blackforest",
  "stability",
  "openai",
  "prodia",
  "gemini",
  "novita",
  "wavespeed",
  "runway",
];

const list = FILTER ? ENGINES.filter((e) => e === FILTER) : ENGINES;

if (list.length === 0) {
  console.error(`Unknown engine: ${FILTER}`);
  console.error(`Available: ${ENGINES.join(", ")}`);
  process.exit(1);
}

console.log(`\n🧪 Live Engine Test against ${BASE_URL}`);
console.log(`   Prompt: "${PROMPT.slice(0, 60)}..."`);
console.log(`   Testing ${list.length} engine(s)\n`);

const results = [];

for (const engine of list) {
  const url = `${BASE_URL}/api/ai-render?prompt=${encodeURIComponent(PROMPT)}&width=1024&height=768&engine=${engine}&tier=architect`;
  const start = Date.now();
  process.stdout.write(`  ${engine.padEnd(14)} ... `);
  try {
    const res = await fetch(url, { method: "GET" });
    const ms = Date.now() - start;
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.startsWith("image/")) {
      const size = Number(res.headers.get("content-length") || "0");
      console.log(
        `✓ ${String(res.status).padEnd(3)} ${(size / 1024).toFixed(0).padStart(4)} KB  ${String(ms).padStart(5)} ms  ${ct}`
      );
      results.push({ engine, ok: true, ms, size, contentType: ct });
    } else {
      const body = await res.text().catch(() => "");
      console.log(`✗ ${res.status}  ${ms}ms  ${body.slice(0, 80)}`);
      results.push({ engine, ok: false, ms, status: res.status, body: body.slice(0, 200) });
    }
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`✗ ERR  ${ms}ms  ${err.message}`);
    results.push({ engine, ok: false, ms, error: err.message });
  }
}

const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Passed: ${passed} / ${results.length}`);
console.log(`  Failed: ${failed}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

if (failed > 0) {
  console.log("Failed engines:");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  - ${r.engine}: ${r.body || r.error || `HTTP ${r.status}`}`);
  }
  console.log();
}

process.exit(failed > 0 ? 1 : 0);
