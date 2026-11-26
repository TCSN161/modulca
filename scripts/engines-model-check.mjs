#!/usr/bin/env node
/**
 * Engines model-freshness check
 *
 * For each engine with a model-listing endpoint, fetch the current catalog
 * and compare it against the model IDs hardcoded in our engine files.
 * Flag any that look deprecated.
 *
 * Anthropic (U8 / E2): lists models via the free Models API, checks the
 * consultant model (read from src/app/api/consultant/models.ts) and prints
 * a monthly "upgrade available" report when a newer Sonnet exists.
 *
 * Registry (E2): scans the render engines + consultant for model IDs and
 * flags any ID that is written in more than one source file (it should
 * live in exactly one place per engine).
 *
 * Only DeepSeek still sends a 1-token request (key/balance check).
 *
 * Runs weekly via .github/workflows/engines-model-check.yml.
 * Exit 0 if all clean, 1 if any deprecation detected. "Upgrade available"
 * and registry duplicates are warnings only (exit stays 0).
 *
 * Usage: node scripts/engines-model-check.mjs [--json]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.local (dev + CI both)
function loadEnv() {
  try {
    const text = readFileSync(join(ROOT, ".env.local"), "utf-8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^"|"$/g, "");
      }
    }
  } catch { /* CI uses GitHub secrets, no .env.local */ }
}
loadEnv();

const JSON_MODE = process.argv.includes("--json");
const ENGINES_DIR = join(ROOT, "src", "app", "api", "ai-render", "engines");
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
    out.upgradeAvailable = res.upgradeAvailable || false;
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

/* ─── Anthropic — Models API (U8 / E2, 2026-11-26) ───────────────────
 * GET /v1/models costs nothing (no tokens; replaces the old 1-token ping).
 * Lists every model the key can use, checks that the consultant model
 * still exists, and flags when a newer Sonnet is out. The consultant model
 * ID is read from its single source of truth (src/app/api/consultant/
 * models.ts), never hardcoded here.
 */
function readConsultantModel() {
  try {
    const src = readFileSync(join(ROOT, "src", "app", "api", "consultant", "models.ts"), "utf-8");
    return src.match(/CONSULTANT_CLAUDE_MODEL\s*=\s*"([^"]+)"/)?.[1] || null;
  } catch { return null; }
}
const CONSULTANT_MODEL = readConsultantModel();
let anthropicReport = null;

async function listAnthropicModels(key) {
  const all = [];
  let after = null;
  for (let page = 0; page < 10; page++) {
    const url = new URL("https://api.anthropic.com/v1/models");
    url.searchParams.set("limit", "1000");
    if (after) url.searchParams.set("after_id", after);
    const r = await fetch(url, { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 120)}`);
    const d = await r.json();
    all.push(...(d.data || []));
    if (!d.has_more || !d.last_id) break;
    after = d.last_id;
  }
  return all;
}

/** Newest model of a family by created_at (e.g. family "sonnet"). */
const newestOf = (models, family) =>
  models
    .filter((m) => m.id.startsWith(`claude-${family}-`))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] || null;

await check("anthropic", {
  currentModel: CONSULTANT_MODEL || "(not found in consultant/models.ts)",
  run: async () => {
    if (!CONSULTANT_MODEL) return { ok: false, details: "CONSULTANT_CLAUDE_MODEL not found in src/app/api/consultant/models.ts" };
    // Same precedence as the consultant (MODULCA_ key avoids Claude Code's env clash)
    const key = process.env.MODULCA_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!key) return { ok: false, details: "no MODULCA_ANTHROPIC_KEY / ANTHROPIC_API_KEY" };
    const models = await listAnthropicModels(key);
    const ids = models.map((m) => m.id);
    const present = ids.includes(CONSULTANT_MODEL);
    const newestSonnet = newestOf(models, "sonnet");
    const upgrade = !!newestSonnet && newestSonnet.id !== CONSULTANT_MODEL;
    anthropicReport = {
      month: new Date().toISOString().slice(0, 7),
      consultantModel: CONSULTANT_MODEL,
      consultantPresent: present,
      newestSonnet: newestSonnet?.id || null,
      newestOpus: newestOf(models, "opus")?.id || null,
      newestHaiku: newestOf(models, "haiku")?.id || null,
      upgradeAvailable: upgrade,
      models: models.map((m) => ({ id: m.id, created_at: m.created_at })),
    };
    return {
      ok: present,
      details: !present
        ? `${CONSULTANT_MODEL} NOT in /v1/models (${ids.length} listed)`
        : upgrade
          ? `${ids.length} models; UPGRADE AVAILABLE: newest Sonnet is ${newestSonnet.id}`
          : `${ids.length} models; consultant is the newest Sonnet`,
      availableSample: models.slice(0, 6).map((m) => m.id),
      deprecated: !present,
      upgradeAvailable: upgrade,
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
// Read the model ID from the engine file (single source of truth).
const CF_MODEL =
  readFileSync(join(ENGINES_DIR, "cloudflare.ts"), "utf-8").match(/const model = "([^"]+)"/)?.[1] ||
  "@cf/black-forest-labs/flux-1-schnell";
await check("cloudflare", {
  currentModel: CF_MODEL,
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
    const target = CF_MODEL;
    const present = names.some((n) => n === target);
    return {
      ok: present,
      details: present ? `${names.length} t2i models, current OK` : `${target} missing`,
      availableSample: names.filter((n) => n.toLowerCase().includes("flux") || n.toLowerCase().includes("sdxl")).slice(0, 5),
      deprecated: !present,
    };
  },
});

/* ─── Registry — one place per model ID (E2) ─────────────────────── */

/** String literals assigned to model-ish identifiers (model, MODEL, X_MODEL). */
const MODEL_LITERAL = /\b(?:model|[A-Z0-9_]*MODEL[A-Z0-9_]*)\s*[:=]\s*"([^"\s]{4,})"/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules" && name !== "__tests__") walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

function registryScan() {
  const sources = [
    ...readdirSync(ENGINES_DIR)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .map((f) => join(ENGINES_DIR, f)),
    join(ROOT, "src", "app", "api", "consultant", "models.ts"),
  ];
  const ids = new Set();
  for (const f of sources) {
    let text;
    try { text = readFileSync(f, "utf-8"); } catch { continue; }
    for (const m of text.matchAll(MODEL_LITERAL)) ids.add(m[1]);
  }
  const all = walk(join(ROOT, "src")).map((f) => [f, readFileSync(f, "utf-8")]);
  const rel = (f) => f.slice(ROOT.length + 1).replace(/\\/g, "/");
  const entries = [...ids].map((id) => {
    const files = all.filter(([, t]) => t.includes('"' + id + '"')).map(([f]) => rel(f));
    // Engine files are provider-specific, so two providers sharing a name
    // (e.g. "flux-schnell" at BFL and Novita) is fine. A copy OUTSIDE the
    // engine/consultant source (routes, health, UI) is a registry leak.
    const outside = files.filter((f) => !f.includes("api/ai-render/engines/") && !f.endsWith("api/consultant/models.ts"));
    return { id, files, duplicated: outside.length > 0 };
  });
  return entries.sort((a, b) => Number(b.duplicated) - Number(a.duplicated) || a.id.localeCompare(b.id));
}
const registry = registryScan();

/* ─── Output ──────────────────────────────────────────────────────── */

const summary = {
  checkedAt: new Date().toISOString(),
  total: results.length,
  ok: results.filter((r) => r.status === "ok").length,
  failed: results.filter((r) => r.status === "fail").length,
  errors: results.filter((r) => r.status === "error").length,
  deprecated: results.filter((r) => r.deprecated).length,
  upgradesAvailable: results.filter((r) => r.upgradeAvailable).length,
  registryDuplicates: registry.filter((e) => e.duplicated).length,
  results,
  anthropic: anthropicReport,
  registry,
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
    const dep = (r.deprecated ? red(" DEPRECATED") : "") + (r.upgradeAvailable ? yellow(" UPGRADE AVAILABLE") : "");
    console.log(`  ${icon} ${r.engine.padEnd(14)} ${dim(r.currentModel || "")}${dep}`);
    console.log(`    ${dim(r.details)}`);
    if (r.availableSample?.length) {
      console.log(`    ${dim("sample: " + r.availableSample.join(", "))}`);
    }
  }
  if (anthropicReport) {
    const a = anthropicReport;
    console.log(`\n📅 Anthropic model report — ${a.month}`);
    console.log(`    consultant:     ${a.consultantModel} ${a.consultantPresent ? green("(live)") : red("(MISSING)")}`);
    console.log(`    newest Sonnet:  ${a.newestSonnet}`);
    console.log(`    newest Opus:    ${a.newestOpus}`);
    console.log(`    newest Haiku:   ${a.newestHaiku}`);
    console.log(
      a.upgradeAvailable
        ? yellow(`    ⬆ UPGRADE AVAILABLE: ${a.consultantModel} → ${a.newestSonnet} (edit src/app/api/consultant/models.ts — Neufert chat)`)
        : green("    ✓ consultant is on the newest Sonnet — no upgrade this month")
    );
  }

  console.log(`\n🗂  Model-ID registry (${registry.length} IDs; each should live in one file)`);
  for (const e of registry) {
    const mark = e.duplicated ? yellow("⚠ DUP") : green("✓    ");
    console.log(`  ${mark} ${e.id.padEnd(48)} ${dim(e.files.join(", "))}`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  OK: ${green(summary.ok)}   Failed: ${red(summary.failed)}   Deprecated: ${red(summary.deprecated)}   Upgrades: ${yellow(summary.upgradesAvailable)}   Registry dups: ${yellow(summary.registryDuplicates)}`);
  console.log();
}

process.exit(summary.deprecated > 0 || summary.failed > 0 ? 1 : 0);
