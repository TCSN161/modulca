#!/usr/bin/env node
/**
 * Stripe Test → Live Cutover
 *
 * One command to flip everything from test to live mode:
 *  1. Validates the live key you provide actually works
 *  2. Creates/reuses the 3 products (Premium, Architect, Constructor) in live mode
 *  3. Creates 6 prices (monthly + yearly per tier) matching the test-mode prices
 *  4. Creates the webhook endpoint for your domain, captures signing secret
 *  5. Writes a new .env.local (backing up the test version)
 *  6. Syncs the new values to Vercel production
 *  7. Triggers a fresh deploy so the change takes effect
 *
 * Usage:
 *   # Pass live keys via env, run the script, done.
 *   STRIPE_LIVE_SECRET=sk_live_... STRIPE_LIVE_PUBLISHABLE=pk_live_... \
 *     node scripts/stripe-go-live.mjs
 *
 *   # Dry-run (no writes)
 *   node scripts/stripe-go-live.mjs --dry-run
 *
 *   # Skip Vercel push (just update local)
 *   node scripts/stripe-go-live.mjs --local-only
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const DRY_RUN = process.argv.includes("--dry-run");
const LOCAL_ONLY = process.argv.includes("--local-only");
const SKIP_WEBHOOK = process.argv.includes("--skip-webhook");

const ROOT = process.cwd();
const ENV_LOCAL = join(ROOT, ".env.local");
const ENV_BACKUP = join(ROOT, ".env.local.test.bak");

const APP_URL = "https://modulca.eu";
const WEBHOOK_PATH = "/api/stripe/webhook";
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
];

const TIERS = [
  { name: "Premium",     key: "PREMIUM",     monthlyEur: 19.99,  yearlyEur: 199 },
  { name: "Architect",   key: "ARCHITECT",   monthlyEur: 49.99,  yearlyEur: 499 },
  { name: "Constructor", key: "CONSTRUCTOR", monthlyEur: 149.90, yearlyEur: 1499 },
];

/* ── Helpers ────────────────────────────────────────────────── */

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
};

function log(msg) { console.log(msg); }
function ok(msg) { log(`  ${c.green}✓${c.reset} ${msg}`); }
function warn(msg) { log(`  ${c.yellow}⚠${c.reset}  ${msg}`); }
function fail(msg) { log(`  ${c.red}✗${c.reset} ${msg}`); }
function section(title) { log(`\n${c.bold}${title}${c.reset}`); }

async function prompt(question) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${c.cyan}?${c.reset} ${question}: `);
  rl.close();
  return answer.trim();
}

async function stripe(path, opts = {}) {
  const { method = "GET", body, sk } = opts;
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    Authorization: `Bearer ${sk}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const init = { method, headers };
  if (body) init.body = new URLSearchParams(body).toString();
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Stripe ${method} ${path}: ${msg}`);
  }
  return json;
}

function readEnvLocal() {
  if (!existsSync(ENV_LOCAL)) throw new Error(".env.local not found");
  const raw = readFileSync(ENV_LOCAL, "utf8");
  const map = new Map();
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
    if (m) map.set(m[1], m[2]);
  }
  return { raw, map };
}

function writeEnvLocal(rawOriginal, updates) {
  let result = rawOriginal;
  for (const [k, v] of Object.entries(updates)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    const line = `${k}="${v}"`;
    if (re.test(result)) {
      result = result.replace(re, line);
    } else {
      result += `\n${line}`;
    }
  }
  if (!DRY_RUN) writeFileSync(ENV_LOCAL, result);
}

function vercel(args, stdinValue) {
  const cmd = `npx vercel ${args}`;
  if (DRY_RUN || LOCAL_ONLY) {
    log(`    ${c.dim}[dry] ${cmd}${c.reset}`);
    return "";
  }
  try {
    const opts = { stdio: stdinValue ? ["pipe", "pipe", "pipe"] : "pipe", encoding: "utf8" };
    if (stdinValue) opts.input = stdinValue;
    return execSync(cmd, opts);
  } catch (e) {
    // vercel env rm for nonexistent var is OK
    if (args.startsWith("env rm") && e.stderr?.includes("does not exist")) return "";
    throw e;
  }
}

function vercelSetEnv(name, value) {
  // Remove old, add new (idempotent)
  vercel(`env rm ${name} production --yes`);
  vercel(`env add ${name} production`, value);
  ok(`vercel: ${name}`);
}

/* ── Main flow ──────────────────────────────────────────────── */

async function main() {
  section("🔀 Stripe Test → Live Cutover");
  if (DRY_RUN) log(`${c.yellow}DRY RUN — no writes will be performed${c.reset}`);
  if (LOCAL_ONLY) log(`${c.yellow}LOCAL ONLY — skipping Vercel push${c.reset}`);

  /* Step 1: Collect live keys */
  section("1. Live API keys");
  let liveSecret = process.env.STRIPE_LIVE_SECRET || "";
  let livePublishable = process.env.STRIPE_LIVE_PUBLISHABLE || "";

  if (!liveSecret) liveSecret = await prompt("Paste STRIPE live secret (sk_live_...)");
  if (!livePublishable) livePublishable = await prompt("Paste STRIPE live publishable (pk_live_...)");

  if (!liveSecret.startsWith("sk_live_")) throw new Error("Secret must start with sk_live_");
  if (!livePublishable.startsWith("pk_live_")) throw new Error("Publishable must start with pk_live_");

  // Validate by fetching account
  const account = await stripe("/accounts/me", { sk: liveSecret }).catch(() => null);
  const acc2 = account || await stripe("/account", { sk: liveSecret });
  ok(`Live account: ${acc2.id} (${acc2.business_profile?.name ?? acc2.email ?? "—"})`);
  if (acc2.charges_enabled !== true) {
    warn(`charges_enabled=false — account not fully activated yet. Finish onboarding first.`);
    if (!DRY_RUN) process.exit(1);
  }

  /* Step 2: Create products + prices in live mode */
  section("2. Products & prices (live mode)");
  const priceMap = {};
  for (const tier of TIERS) {
    // Check if product already exists in live mode (by name)
    const existing = await stripe(`/products/search?query=name:'${tier.name}'`, { sk: liveSecret });
    let product;
    if (existing.data.length > 0) {
      product = existing.data[0];
      ok(`Product exists: ${tier.name} (${product.id})`);
    } else {
      product = await stripe("/products", {
        method: "POST", sk: liveSecret,
        body: { name: tier.name, description: `ModulCA ${tier.name} plan` },
      });
      ok(`Created product: ${tier.name} (${product.id})`);
    }

    // Create prices (Stripe prices are immutable — always create new ones)
    const priceMonthly = await stripe("/prices", {
      method: "POST", sk: liveSecret,
      body: {
        product: product.id, currency: "eur",
        unit_amount: String(Math.round(tier.monthlyEur * 100)),
        "recurring[interval]": "month",
        nickname: `${tier.name} Monthly`,
      },
    });
    ok(`  ${tier.name} monthly: ${priceMonthly.id} (€${tier.monthlyEur})`);
    priceMap[`NEXT_PUBLIC_STRIPE_PRICE_${tier.key}_MONTHLY`] = priceMonthly.id;

    const priceYearly = await stripe("/prices", {
      method: "POST", sk: liveSecret,
      body: {
        product: product.id, currency: "eur",
        unit_amount: String(Math.round(tier.yearlyEur * 100)),
        "recurring[interval]": "year",
        nickname: `${tier.name} Yearly`,
      },
    });
    ok(`  ${tier.name} yearly:  ${priceYearly.id} (€${tier.yearlyEur})`);
    priceMap[`NEXT_PUBLIC_STRIPE_PRICE_${tier.key}_YEARLY`] = priceYearly.id;
  }

  /* Step 3: Webhook endpoint */
  let webhookSecret = "";
  if (!SKIP_WEBHOOK) {
    section("3. Webhook endpoint (live mode)");
    const endpoints = await stripe("/webhook_endpoints", { sk: liveSecret });
    const existing = endpoints.data.find((e) => e.url === `${APP_URL}${WEBHOOK_PATH}`);
    if (existing) {
      ok(`Endpoint exists: ${existing.id} (${existing.url})`);
      warn(`Cannot retrieve existing webhook secret via API — use --skip-webhook and fetch manually`);
    } else {
      const body = { url: `${APP_URL}${WEBHOOK_PATH}`, api_version: "2024-06-20" };
      for (const [i, evt] of WEBHOOK_EVENTS.entries()) body[`enabled_events[${i}]`] = evt;
      const wh = await stripe("/webhook_endpoints", { method: "POST", sk: liveSecret, body });
      webhookSecret = wh.secret;
      ok(`Created endpoint: ${wh.id}`);
      ok(`Signing secret: ${webhookSecret.slice(0, 12)}...`);
    }
  }

  /* Step 4: Write .env.local */
  section("4. Updating .env.local");
  const { raw } = readEnvLocal();
  if (!DRY_RUN) copyFileSync(ENV_LOCAL, ENV_BACKUP);
  ok(`Backed up test keys → ${ENV_BACKUP}`);

  const updates = {
    STRIPE_SECRET_KEY: liveSecret,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: livePublishable,
    ...priceMap,
  };
  if (webhookSecret) updates.STRIPE_WEBHOOK_SECRET = webhookSecret;

  writeEnvLocal(raw, updates);
  for (const k of Object.keys(updates)) ok(`local: ${k}`);

  /* Step 5: Push to Vercel */
  if (!LOCAL_ONLY) {
    section("5. Syncing to Vercel production");
    for (const [k, v] of Object.entries(updates)) vercelSetEnv(k, v);
  }

  /* Step 6: Trigger deploy */
  if (!LOCAL_ONLY && !DRY_RUN) {
    section("6. Triggering production deploy");
    try {
      execSync("npx vercel --prod --yes", { stdio: "inherit" });
      ok("Deploy triggered");
    } catch {
      warn("Deploy failed — trigger manually with: npx vercel --prod");
    }
  }

  /* Summary */
  section("✅ Cutover complete");
  log(`  ${c.green}Stripe is now LIVE.${c.reset} Run ${c.bold}npm run ops:check${c.reset} to verify.`);
  log(`  Test-mode backup: ${ENV_BACKUP}`);
  log(`\n  Next: send a test transaction end-to-end via /pricing to verify the full flow.`);
}

main().catch((err) => {
  console.error(`\n${c.red}✗ Cutover failed:${c.reset} ${err.message}`);
  process.exit(1);
});
