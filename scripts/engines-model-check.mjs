#!/usr/bin/env node
/**
 * Engines model-freshness check
 *
 * For each engine with a model-listing endpoint, fetch the current catalog
 * and compare it against the model IDs hardcoded in our engine files.
 * Flag any that look deprecated.
 *
 * Also runs a 1-token smoke test per engine (chat-only) to catch silent
 * breakage without consuming meaningful credits.
 *
 * Runs weekly via .github/workflows/engines-model-check.yml.
 * Exit 0 if all clean, 1 if any deprecation detected.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.local (dev + CI both)
function loadEnv() {
  try {
    const text = readFileSync(join(ROOT, ".env.local"), "utf-8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^"|"$/g, "");
      }
    }
  } catch { /* CI uses GitHub secrets, no .env.local */ }
}
loadEnv();

const JSON_MODE = process.argv.includes("--json");
const results = [];

async function check(name, opts) {
  const out = { engine: name, status: "unknown", details: "" };
  try {
    const res = await opts.run();
    out.status = res.ok ? "ok" : "fail";
    out.details = res.details || "";
    out.currentModel = opts.currentModel;
    out.availableSample = res.availableSample;
    out.deprecated = res.deprecated || false;
  } catch (err) {
    out.status = "error";
    out.details = err.message;
  }
  results.push(out);
}

/* ─── Groq — list + verify current model still exists ─────────────── */
await check("groq", {
  currentModel: "openai/gpt-oss-120b",
  run: async () => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { ok: false, details: "no GROQ_API_KEY" };
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) return { ok: false, details: `HTTP ${r.status}` };
    const d = await r.json();
    const ids = (d.data || []).map((m) => m.id);
    const current = "openai/gpt-oss-120b";
    const present = ids.includes(current);
    return {
      ok: present,
      details: present ? `${ids.length} models, current OK` : `${current} NOT in list`,
      availableSample: ids.filter((i) => i.includes("gpt-oss") || i.includes("llama") || i.includes("qwen")).slice(0, 5),
      deprecated: !present,
    };
  },
});

/* ─── Gemini — list + verify flash-latest alias resolves ─────────── */
await check("gemini", {
  currentModel: "gemini-flash-latest",
  run: async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { ok: false, details: "no GEMINI_API_KEY" };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!r.ok) return { ok: false, details: `HTTP ${r.status}` };
    const d = await r.json();
    const names = (d.models || []).map((m) => m.name.replace(/^models\//, ""));
    const hasAlias = names.includes("gemini-flash-latest");
    return {
      ok: hasAlias,
      details: hasAlias ? "flash-latest alias live" : "flash-latest missing",
      availableSample: names.filter((n) => n.includes("flash") && !n.includes("preview")).slice(0, 5),
      deprecated: !hasAlias,
    };
  },
});

/* ─── Anthropic — simple tokens endpoint check ────────────────────── */
await check("anthropic", {
  currentModel: "claude-sonnet-5-5",
  run: async () => {
    const key = process.env.ANTHROPIC_API_KEY || process.env.MODULCA_ANTHROPIC_KEY;
    if (!key) return { ok: false, details: "no ANTHROPIC_API_KEY" };
    // 1-token no-op sanity check
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 1,
        messages: [{ role: "user", content: "." }],
      }),
    });
    if (r.status === 200) return { ok: true, details: "sonnet-5-5 accepted" };
    const text = await r.text();
    return {
      ok: false,
      details: `HTTP ${r.status}: ${text.slice(0, 120)}`,
      deprecated: r.status === 404,
    };
  },
});

/* ─── DeepSeek — key-validity only (balance is user's problem) ────── */
await check("deepseek", {
  currentModel: "deepseek-chat",
  run: async () => {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) return { ok: true, details: "no key configured (expected for Phase 1)" };
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1,
        messages: [{ role: "user", content: "." }],
      }),
    });
    if (r.status === 200) return { ok: true, details: "deepseek-chat usable (has balance)" };
    const text = await r.text();
    if (text.includes("insufficient_balance")) {
      return { ok: true, details: "key valid but \\$0 balance (top-up needed)" };
    }
    return { ok: false, details: `HTTP ${r.status}: ${text.slice(0, 120)}` };
  },
});

/* ─── Pollinations — public endpoint reachability ────────────────── */
await check("pollinations", {
  currentModel: "default (SD)",
  run: async () => {
    const r = await fetch("https://image.pollinations.ai/prompt/test?nologo=true&width=64&height=64", {
      method: "HEAD",
    });
    return { ok: r.ok || r.status === 405, details: `HTTP ${r.status}` };
  },
});

/* ─── AI Horde — status endpoint ─────────────────────────────────── */
await check("ai-horde", {
  currentModel: "stable-diffusion default",
  run: async () => {
    const r = await fetch("https://stablehorde.net/api/v2/status/heartbeat");
    return { ok: r.ok, details: r.ok ? "heartbeat OK" : `HTTP ${r.status}` };
  },
});

/* ─── Cloudflare AI — list models ─────────────────────────────────── */
await check("cloudflare", {
  currentModel: "@cf/black-forest-labs/flux-1-schnell",
  run: async () => {
    const acc = process.env.CLOUDFLARE_ACCOUNT_ID;
    const tok = process.env.CLOUDFLARE_API_TOKEN;
    if (!acc || !tok) return { ok: false, details: "no CLOUDFLARE credentials" };
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${acc}/ai/models/search?task=Text-to-Image`,
      { headers: { Authorization: `Bearer ${tok}` } }
    );
    if (!r.ok) return { ok: false, details: `HTTP ${r.status}` };
    const d = await r.json();
    const names = (d.result || []).map((m) => m.name);
    const target = "@cf/black-forest-labs/flux-1-schnell";
    const present = names.some((n) => n === target);
    return {
      ok: present,
      details: present ? `${names.length} t2i models, current OK` : `${target} missing`,
      availableSample: names.filter((n) => n.toLowerCase().includes("flux") || n.toLowerCase().includes("sdxl")).slice(0, 5),
      deprecated: !present,
    };
  },
});

/* ─── Output ──────────────────────────────────────────────────────── */

const summary = {
  checkedAt: new Date().toISOString(),
  total: results.length,
  ok: results.filter((r) => r.status === "ok").length,
  failed: results.filter((r) => r.status === "fail").length,
  errors: results.filter((r) => r.status === "error").length,
  deprecated: results.filter((r) => r.deprecated).length,
  results,
};

if (JSON_MODE) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  const red = (s) => `\x1b[31m${s}\x1b[0m`;
  const green = (s) => `\x1b[32m${s}\x1b[0m`;
  const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
  const dim = (s) => `\x1b[2m${s}\x1b[0m`;

  console.log(`\n🔍 Engine Model Health Check — ${new Date().toISOString().slice(0, 16)}\n`);
  for (const r of results) {
    const icon = r.status === "ok" ? green("✓") : r.status === "fail" ? red("✗") : yellow("⚠");
    const dep = r.deprecated ? red(" DEPRECATED") : "";
    console.log(`  ${icon} ${r.engine.padEnd(14)} ${dim(r.currentModel || "")}${dep}`);
    console.log(`    ${dim(r.details)}`);
    if (r.availableSample?.length) {
      console.log(`    ${dim("sample: " + r.availableSample.join(", "))}`);
    }
  }
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  OK: ${green(summary.ok)}   Failed: ${red(summary.failed)}   Deprecated: ${red(summary.deprecated)}`);
  console.log();
}

process.exit(summary.deprecated > 0 || summary.failed > 0 ? 1 : 0);
