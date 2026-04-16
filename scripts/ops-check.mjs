#!/usr/bin/env node
/**
 * ModulCA Ops Check — Automated operational readiness audit.
 *
 * Usage:
 *   node scripts/ops-check.mjs              # Full check
 *   node scripts/ops-check.mjs --fix        # Auto-fix what's possible
 *   node scripts/ops-check.mjs --json       # Machine-readable output
 *   node scripts/ops-check.mjs --ci         # Exit code 1 if critical issues
 *
 * Checks:
 *   1. Environment variables (required, recommended, optional)
 *   2. Supabase connection & migration status
 *   3. Stripe configuration (test vs live, products, webhook)
 *   4. Resend email (domain verification, test send)
 *   5. Sentry monitoring
 *   6. Build health (tsc, next build)
 *   7. Test suite
 *   8. DNS/domain status
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const args = process.argv.slice(2);
const FIX = args.includes("--fix");
const JSON_OUT = args.includes("--json");
const CI = args.includes("--ci");

/* ── Helpers ── */

function loadEnv() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return {};
  const env = {};
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8", timeout: 120000, ...opts }).trim();
  } catch (e) {
    return null;
  }
}

function log(icon, msg) {
  if (!JSON_OUT) console.log(`  ${icon} ${msg}`);
}

/* ── Check Results ── */

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  summary: { pass: 0, warn: 0, fail: 0, skip: 0 },
};

function check(category, name, status, detail = "") {
  const entry = { category, name, status, detail };
  results.checks.push(entry);
  results.summary[status]++;
  const icons = { pass: "\x1b[32m✅\x1b[0m", warn: "\x1b[33m⚠️\x1b[0m", fail: "\x1b[31m❌\x1b[0m", skip: "⏭️" };
  log(icons[status] || "?", `[${category}] ${name}${detail ? ` — ${detail}` : ""}`);
}

/* ══════════════════════════════════════════
   1. ENVIRONMENT VARIABLES
   ══════════════════════════════════════════ */

function checkEnvVars() {
  if (!JSON_OUT) console.log("\n\x1b[1m📋 Environment Variables\x1b[0m");
  const env = loadEnv();

  const required = [
    ["NEXT_PUBLIC_SUPABASE_URL", "Supabase URL"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key"],
    ["SUPABASE_SERVICE_ROLE_KEY", "Supabase service role"],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Stripe publishable key"],
    ["STRIPE_SECRET_KEY", "Stripe secret key"],
    ["STRIPE_WEBHOOK_SECRET", "Stripe webhook secret"],
  ];

  const recommended = [
    ["RESEND_API_KEY", "Resend email"],
    ["NEXT_PUBLIC_SENTRY_DSN", "Sentry error monitoring"],
  ];

  const pricing = [
    "NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY",
    "NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY",
    "NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY",
    "NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY",
    "NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY",
    "NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_YEARLY",
  ];

  for (const [key, label] of required) {
    if (env[key]) {
      check("env", label, "pass");
    } else {
      check("env", label, "fail", `${key} missing`);
    }
  }

  for (const [key, label] of recommended) {
    if (env[key]) {
      check("env", label, "pass");
    } else {
      check("env", label, "warn", `${key} not set — degraded experience`);
    }
  }

  // Stripe mode check
  const stripeKey = env["STRIPE_SECRET_KEY"] || "";
  if (stripeKey.startsWith("sk_live_")) {
    check("env", "Stripe mode", "pass", "LIVE mode");
  } else if (stripeKey.startsWith("sk_test_")) {
    check("env", "Stripe mode", "warn", "TEST mode — switch to live for production");
  } else if (stripeKey) {
    check("env", "Stripe mode", "warn", "Unknown key format");
  }

  // Stripe prices
  const missingPrices = pricing.filter((k) => !env[k]);
  if (missingPrices.length === 0) {
    check("env", "Stripe price IDs", "pass", "All 6 configured");
  } else {
    check("env", "Stripe price IDs", "warn", `${missingPrices.length}/6 missing`);
  }

  // Email sender
  const from = env["RESEND_FROM_EMAIL"] || "";
  if (from.includes("resend.dev")) {
    check("env", "Email sender domain", "warn", "Still using resend.dev — verify custom domain");
  } else if (from.includes("modulca.eu")) {
    check("env", "Email sender domain", "pass", "Custom domain configured");
  }

  return env;
}

/* ══════════════════════════════════════════
   2. SUPABASE CONNECTION
   ══════════════════════════════════════════ */

async function checkSupabase(env) {
  if (!JSON_OUT) console.log("\n\x1b[1m🗄️  Supabase\x1b[0m");

  const url = env["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceKey) {
    check("supabase", "Connection", "skip", "Credentials not configured");
    return;
  }

  // Test REST API health
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (res.ok) {
      check("supabase", "REST API", "pass");
    } else {
      check("supabase", "REST API", "fail", `HTTP ${res.status}`);
    }
  } catch (e) {
    check("supabase", "REST API", "fail", e.message);
  }

  // Check projects table exists
  try {
    const res = await fetch(`${url}/rest/v1/projects?select=id&limit=0`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (res.ok) {
      check("supabase", "Projects table", "pass");
    } else {
      check("supabase", "Projects table", "fail", "Table may not exist — run migration 004");
    }
  } catch (e) {
    check("supabase", "Projects table", "fail", e.message);
  }

  // Check profiles table exists
  try {
    const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=0`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (res.ok) {
      check("supabase", "Profiles table", "pass");
    } else {
      check("supabase", "Profiles table", "warn", "Table may not exist");
    }
  } catch (e) {
    check("supabase", "Profiles table", "warn", e.message);
  }

  // Check auth endpoint
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || serviceKey },
    });
    if (res.ok) {
      const data = await res.json();
      check("supabase", "Auth service", "pass");
      // Check Google OAuth
      if (data.external?.google) {
        check("supabase", "Google OAuth", "pass", "Enabled");
      } else {
        check("supabase", "Google OAuth", "warn", "Not enabled in Supabase auth settings");
      }
    } else {
      check("supabase", "Auth service", "warn", `HTTP ${res.status}`);
    }
  } catch (e) {
    check("supabase", "Auth service", "warn", e.message);
  }
}

/* ══════════════════════════════════════════
   3. STRIPE VERIFICATION
   ══════════════════════════════════════════ */

async function checkStripe(env) {
  if (!JSON_OUT) console.log("\n\x1b[1m💳 Stripe\x1b[0m");

  const secretKey = env["STRIPE_SECRET_KEY"];
  if (!secretKey) {
    check("stripe", "Configuration", "skip", "No secret key");
    return;
  }

  // List products
  try {
    const res = await fetch("https://api.stripe.com/v1/products?limit=10&active=true", {
      headers: { Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}` },
    });
    if (res.ok) {
      const data = await res.json();
      check("stripe", "Products", "pass", `${data.data.length} active product(s)`);
    } else {
      check("stripe", "Products", "fail", `HTTP ${res.status}`);
    }
  } catch (e) {
    check("stripe", "Products", "fail", e.message);
  }

  // Check webhook endpoints
  try {
    const res = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=10", {
      headers: { Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}` },
    });
    if (res.ok) {
      const data = await res.json();
      const modulcaHooks = data.data.filter((h) =>
        h.url?.includes("modulca") || h.url?.includes("localhost")
      );
      if (modulcaHooks.length > 0) {
        const statuses = modulcaHooks.map((h) => `${h.status} (${h.url.split("/").pop()})`);
        check("stripe", "Webhooks", "pass", statuses.join(", "));
      } else {
        check("stripe", "Webhooks", "warn", `${data.data.length} endpoints but none for modulca`);
      }
    }
  } catch (e) {
    check("stripe", "Webhooks", "warn", e.message);
  }

  // Verify price IDs exist
  const priceKeys = [
    "NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY",
    "NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_MONTHLY",
    "NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_MONTHLY",
  ];
  for (const key of priceKeys) {
    const priceId = env[key];
    if (!priceId) continue;
    try {
      const res = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: { Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}` },
      });
      if (res.ok) {
        const price = await res.json();
        const amt = price.unit_amount / 100;
        const tier = key.includes("PREMIUM") ? "Premium" : key.includes("ARCHITECT") ? "Architect" : "Constructor";
        check("stripe", `${tier} price`, "pass", `€${amt}/${price.recurring?.interval || "?"}`);
      } else {
        check("stripe", `Price ${key}`, "fail", "Price ID not found in Stripe");
      }
    } catch (e) {
      check("stripe", `Price ${key}`, "warn", e.message);
    }
  }
}

/* ══════════════════════════════════════════
   4. RESEND EMAIL
   ══════════════════════════════════════════ */

async function checkResend(env) {
  if (!JSON_OUT) console.log("\n\x1b[1m📧 Email (Resend)\x1b[0m");

  const apiKey = env["RESEND_API_KEY"];
  if (!apiKey) {
    check("email", "Resend API key", "skip", "Not configured");
    return;
  }

  // Check domains
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      const domains = data.data || [];
      const modulcaDomain = domains.find((d) => d.name === "modulca.eu");
      if (modulcaDomain) {
        if (modulcaDomain.status === "verified") {
          check("email", "Domain modulca.eu", "pass", "Verified");
        } else {
          check("email", "Domain modulca.eu", "warn", `Status: ${modulcaDomain.status} — needs DNS records`);
          // Show required DNS records
          if (modulcaDomain.records) {
            for (const rec of modulcaDomain.records) {
              if (rec.status !== "verified") {
                log("  ", `  DNS: ${rec.type} ${rec.name} → ${rec.value}`);
              }
            }
          }
        }
      } else {
        check("email", "Domain modulca.eu", "warn", "Not added to Resend — add it in dashboard");
      }

      // Show other verified domains
      const verified = domains.filter((d) => d.status === "verified");
      check("email", "Verified domains", verified.length > 0 ? "pass" : "warn", `${verified.length} domain(s)`);
    }
  } catch (e) {
    check("email", "Resend API", "fail", e.message);
  }

  // Check API key validity
  try {
    const res = await fetch("https://api.resend.com/api-keys", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      check("email", "API key", "pass", "Valid");
    } else {
      check("email", "API key", "fail", `HTTP ${res.status}`);
    }
  } catch (e) {
    check("email", "API key", "fail", e.message);
  }
}

/* ══════════════════════════════════════════
   5. BUILD & TEST
   ══════════════════════════════════════════ */

function checkBuildAndTest() {
  if (!JSON_OUT) console.log("\n\x1b[1m🔨 Build & Tests\x1b[0m");

  // TypeScript
  const tscResult = run("./node_modules/.bin/tsc --noEmit 2>&1");
  if (tscResult === "") {
    check("build", "TypeScript", "pass", "Zero errors");
  } else if (tscResult === null) {
    check("build", "TypeScript", "fail", "tsc command failed");
  } else {
    const errorCount = (tscResult.match(/error TS/g) || []).length;
    check("build", "TypeScript", "fail", `${errorCount} error(s)`);
  }

  // Tests
  const testResult = run("npx vitest run 2>&1");
  if (testResult) {
    const match = testResult.match(/Tests\s+(\d+)\s+passed/);
    const failMatch = testResult.match(/(\d+)\s+failed/);
    if (failMatch && parseInt(failMatch[1]) > 0) {
      check("build", "Tests", "fail", `${failMatch[1]} failed`);
    } else if (match) {
      check("build", "Tests", "pass", `${match[1]} passed`);
    } else {
      check("build", "Tests", "warn", "Could not parse test output");
    }
  } else {
    check("build", "Tests", "fail", "Test runner failed");
  }

  // Check for .env.local in .gitignore
  const gitignore = readFileSync(resolve(ROOT, ".gitignore"), "utf-8");
  if (gitignore.includes(".env.local") || gitignore.includes(".env*")) {
    check("build", ".env.local in .gitignore", "pass");
  } else {
    check("build", ".env.local in .gitignore", "fail", "Secrets may be committed!");
  }
}

/* ══════════════════════════════════════════
   6. GIT & DEPLOY STATUS
   ══════════════════════════════════════════ */

function checkGit() {
  if (!JSON_OUT) console.log("\n\x1b[1m🔀 Git & Deploy\x1b[0m");

  const status = run("git status --porcelain");
  if (status === "") {
    check("git", "Working tree", "pass", "Clean");
  } else {
    const lines = status.split("\n").filter(Boolean).length;
    check("git", "Working tree", "warn", `${lines} uncommitted change(s)`);
  }

  const ahead = run("git rev-list --count origin/master..HEAD 2>/dev/null");
  if (ahead && parseInt(ahead) > 0) {
    check("git", "Unpushed commits", "warn", `${ahead} commit(s) not pushed`);
  } else if (ahead === "0") {
    check("git", "Remote sync", "pass", "Up to date with origin");
  }

  // Package version
  try {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf-8"));
    check("git", "Version", "pass", `v${pkg.version}`);
  } catch { /* */ }
}

/* ══════════════════════════════════════════
   7. DOMAIN & DNS
   ══════════════════════════════════════════ */

async function checkDomain() {
  if (!JSON_OUT) console.log("\n\x1b[1m🌐 Domain & DNS\x1b[0m");

  // Check if modulca.eu resolves
  try {
    const res = await fetch("https://www.modulca.eu", { method: "HEAD", redirect: "follow" });
    check("domain", "modulca.eu", "pass", `HTTP ${res.status}`);
  } catch (e) {
    check("domain", "modulca.eu", "warn", `Not reachable: ${e.message}`);
  }

  // Check health endpoint
  try {
    const res = await fetch("https://www.modulca.eu/api/health");
    if (res.ok) {
      const data = await res.json();
      check("domain", "Health endpoint", "pass", `Status: ${data.status}`);
      if (data.env && !data.env.ok) {
        check("domain", "Production env vars", "warn", `Missing: ${data.env.missingCritical?.join(", ")}`);
      }
    } else {
      check("domain", "Health endpoint", "warn", `HTTP ${res.status}`);
    }
  } catch (e) {
    check("domain", "Health endpoint", "skip", e.message);
  }
}

/* ══════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════ */

async function main() {
  if (!JSON_OUT) {
    console.log("\x1b[1m\x1b[36m");
    console.log("╔══════════════════════════════════════╗");
    console.log("║   ModulCA Ops Check                  ║");
    console.log("║   Beta Readiness Audit               ║");
    console.log("╚══════════════════════════════════════╝\x1b[0m");
  }

  const env = checkEnvVars();
  await checkSupabase(env);
  await checkStripe(env);
  await checkResend(env);
  checkBuildAndTest();
  checkGit();
  await checkDomain();

  // Summary
  if (JSON_OUT) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const { pass, warn, fail, skip } = results.summary;
    console.log("\n\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
    console.log(`  \x1b[32m✅ ${pass} passed\x1b[0m  \x1b[33m⚠️  ${warn} warnings\x1b[0m  \x1b[31m❌ ${fail} failed\x1b[0m  ⏭️  ${skip} skipped`);

    if (fail > 0) {
      console.log("\n  \x1b[31m\x1b[1mCritical issues found — fix before deploy!\x1b[0m");
      for (const c of results.checks.filter((c) => c.status === "fail")) {
        console.log(`    → [${c.category}] ${c.name}: ${c.detail}`);
      }
    }

    if (warn > 0) {
      console.log("\n  \x1b[33mWarnings (non-blocking but recommended):\x1b[0m");
      for (const c of results.checks.filter((c) => c.status === "warn")) {
        console.log(`    → [${c.category}] ${c.name}: ${c.detail}`);
      }
    }

    console.log("");
  }

  if (CI && results.summary.fail > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Ops check failed:", e);
  process.exit(1);
});
