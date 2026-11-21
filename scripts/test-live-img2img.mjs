#!/usr/bin/env node
/**
 * Live img2img healthcheck
 *
 * Posts a base64-encoded base image to /api/ai-render for engines that
 * advertise img2img capability. Separates true img2img specialists
 * (preserve 3D composition) from text2img-only fallbacks.
 *
 * Usage:
 *   node scripts/test-live-img2img.mjs
 *   BASE_URL=http://localhost:3000 node scripts/test-live-img2img.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || "https://www.modulca.eu";
const BASE_IMAGE_PATH = process.env.BASE_IMAGE || "/tmp/base.png";

// Engines that claim img2img capability per billing registry
const IMG2IMG_ENGINES = [
  // True img2img specialists — structure-preserving
  { id: "stability", kind: "specialist" },
  { id: "fal", kind: "specialist" },
  { id: "replicate", kind: "specialist" },
  { id: "wavespeed", kind: "specialist" },
  // Falls back to text2img when given baseImage
  { id: "together", kind: "fallback-to-text" },
  { id: "cloudflare", kind: "fallback-to-text" },
  { id: "blackforest", kind: "fallback-to-text" },
  { id: "huggingface", kind: "fallback-to-text" },
  { id: "segmind", kind: "fallback-to-text" },
  { id: "leonardo", kind: "fallback-to-text" },
  { id: "runway", kind: "fallback-to-text" },
  { id: "openai", kind: "fallback-to-text" },
];

const PROMPT = "transform this into a photorealistic cozy modern wooden cabin interior, golden hour natural light";

if (!existsSync(BASE_IMAGE_PATH)) {
  console.error(`Base image not found at ${BASE_IMAGE_PATH}`);
  console.error(`Run first: curl "https://image.pollinations.ai/prompt/empty%20room?width=512&height=384&nologo=true" -o /tmp/base.png`);
  process.exit(1);
}

const baseBuf = readFileSync(BASE_IMAGE_PATH);
const baseB64 = baseBuf.toString("base64");
console.log(`\n🎨 Live img2img check against ${BASE_URL}`);
console.log(`   Base image: ${baseBuf.length} bytes (${BASE_IMAGE_PATH})`);
console.log(`   Prompt: "${PROMPT.slice(0, 60)}..."\n`);

const results = [];

for (const e of IMG2IMG_ENGINES) {
  process.stdout.write(`  ${e.id.padEnd(14)} ${e.kind.padEnd(20)} `);
  const start = Date.now();
  try {
    // Post to the main render endpoint with baseImage
    const url = `${BASE_URL}/api/ai-render`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: PROMPT,
        width: 1024,
        height: 768,
        engine: e.id,
        baseImage: baseB64,
        tier: "architect",
      }),
    });
    const ms = Date.now() - start;
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.startsWith("image/")) {
      const size = Number(res.headers.get("content-length") || "0");
      console.log(`✓ ${res.status}  ${(size / 1024).toFixed(0).padStart(5)} KB  ${String(ms).padStart(6)} ms  ${ct}`);
      results.push({ ...e, ok: true, ms, size, contentType: ct });
    } else {
      const body = await res.text().catch(() => "");
      console.log(`✗ ${res.status}  ${ms}ms  ${body.slice(0, 80)}`);
      results.push({ ...e, ok: false, status: res.status, ms, body: body.slice(0, 200) });
    }
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`✗ ERR  ${ms}ms  ${err.message}`);
    results.push({ ...e, ok: false, ms, error: err.message });
  }
  // Space out to respect per-minute limits on free engines
  await new Promise((r) => setTimeout(r, 2000));
}

const specialists = results.filter((r) => r.kind === "specialist");
const fallbacks = results.filter((r) => r.kind === "fallback-to-text");
const specOk = specialists.filter((r) => r.ok).length;
const fallOk = fallbacks.filter((r) => r.ok).length;

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Specialists (preserve 3D): ${specOk}/${specialists.length}`);
console.log(`  Fallback (text2img-only):  ${fallOk}/${fallbacks.length}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.log(`\nFailed:`);
  for (const r of failed) {
    console.log(`  ✗ ${r.id} (${r.kind}): ${r.body || r.error || `HTTP ${r.status}`}`);
  }
}

console.log();
process.exit(failed.length > 0 ? 1 : 0);
