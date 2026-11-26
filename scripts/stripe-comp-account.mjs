#!/usr/bin/env node
/**
 * Comp accounts: give or take back a free full account (no Stripe charge).
 * Procedure + rules: docs/MCA-DOC-PRICING-COMP-ACCOUNTS.md
 *
 * Usage:
 *   node scripts/stripe-comp-account.mjs status <email>
 *   node scripts/stripe-comp-account.mjs grant  <email> [tier]   # tier: premium | architect | constructor (default)
 *   node scripts/stripe-comp-account.mjs revoke <email>
 *   add --dry-run to print what would change without writing
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (or the process env). Never prints keys. Prints only the one profile asked for.
 *
 * A comp account = paid tier + stripe_subscription_id NULL + subscription_status 'free'.
 * The Stripe webhook only changes a tier for the subscription stored on the profile,
 * so Stripe events can't downgrade a comp account. Grant refuses if the profile
 * has a live Stripe subscription (cancel it in Stripe first, or let it run).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const COMP_TIERS = ["premium", "architect", "constructor"];
const PAID_STATUSES = ["active", "trialing", "past_due"];

function loadEnv() {
  const env = { ...process.env };
  const file = join(process.cwd(), ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || env[m[1]]) continue;
      env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DRY_RUN = process.argv.includes("--dry-run");
const [cmd, rawEmail, rawTier] = args;
const email = (rawEmail || "").trim().toLowerCase();

if (!["status", "grant", "revoke"].includes(cmd) || !email.includes("@")) {
  console.log("Usage: node scripts/stripe-comp-account.mjs <status|grant|revoke> <email> [tier] [--dry-run]");
  process.exit(1);
}

const tier = (rawTier || "constructor").toLowerCase();
if (cmd === "grant" && !COMP_TIERS.includes(tier)) {
  fail(`tier must be one of: ${COMP_TIERS.join(", ")}`);
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing (.env.local)");

const sb = createClient(url, key, { auth: { persistSession: false } });

const COLS = "id, email, tier, subscription_status, stripe_subscription_id, stripe_customer_id, created_at";

async function getProfile() {
  const { data, error } = await sb.from("profiles").select(COLS).ilike("email", email).limit(2);
  if (error) fail(`profile lookup failed: ${error.message}`);
  if (!data || data.length === 0) fail(`no profile for ${email} (has the user signed up and logged in once?)`);
  if (data.length > 1) fail(`more than one profile matches ${email}; fix by hand`);
  return data[0];
}

function show(label, p) {
  const isComp = p.tier !== "free" && p.tier !== "guest_free" && !p.stripe_subscription_id;
  console.log(`${label}: ${p.email}`);
  console.log(`  tier                 ${p.tier}`);
  console.log(`  subscription_status  ${p.subscription_status ?? "—"}`);
  console.log(`  stripe_subscription  ${p.stripe_subscription_id ? "yes" : "none"}`);
  console.log(`  stripe_customer      ${p.stripe_customer_id ? "yes" : "none"}`);
  console.log(`  kind                 ${isComp ? "COMP (manual, Stripe can't change it)" : p.stripe_subscription_id ? "PAID (Stripe-managed)" : "free"}`);
}

async function update(patch) {
  if (DRY_RUN) {
    console.log("  [dry-run] would set:", patch);
    return;
  }
  const { error } = await sb.from("profiles").update(patch).ilike("email", email);
  if (error) fail(`update failed: ${error.message}`);
}

const before = await getProfile();

if (cmd === "status") {
  show("Profile", before);
} else {
  await change();
}

async function change() {
if (cmd === "grant") {
  if (before.stripe_subscription_id && PAID_STATUSES.includes(before.subscription_status)) {
    fail(
      `${email} has a live Stripe subscription (${before.subscription_status}). ` +
        "Cancel it in the Stripe dashboard first (or leave the paid plan as is).",
    );
  }
  await update({ tier, stripe_subscription_id: null, subscription_status: "free" });
}

if (cmd === "revoke") {
  if (before.stripe_subscription_id) {
    fail(`${email} is Stripe-managed, not comp. Cancel the subscription in Stripe instead.`);
  }
  await update({ tier: "free", subscription_status: "free" });
}

show(DRY_RUN ? "Unchanged (dry-run)" : "Now", DRY_RUN ? before : await getProfile());
}
