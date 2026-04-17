#!/usr/bin/env node
/**
 * Env Sync — idempotent .env.local → Vercel production sync
 *
 * Pulls current Vercel prod env vars, diffs against .env.local, pushes any changes.
 * Safe to run repeatedly. Always shows a diff before making changes.
 *
 * Usage:
 *   npm run env:sync             # interactive: shows diff, asks for confirmation
 *   npm run env:sync -- --yes    # auto-apply without confirmation
 *   npm run env:sync -- --dry    # show diff only, no changes
 *   npm run env:sync -- --env=preview  # target preview env instead of production
 *
 * Excluded from sync (always skipped):
 *   - System vars (VERCEL_*, NEXT_RUNTIME, NODE_ENV)
 *   - Local-only overrides starting with LOCAL_
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry") || argv.includes("--dry-run");
const YES = argv.includes("--yes") || argv.includes("-y");
const envTarget = (argv.find((a) => a.startsWith("--env=")) || "--env=production").slice(6);

const TEMP_FILE = ".env.vercel-temp";
const SKIP_PREFIXES = ["VERCEL_", "NEXT_RUNTIME", "NODE_ENV", "LOCAL_"];
// Vars that SHOULD differ between local and prod — never sync these
const SKIP_KEYS = new Set([
  "NEXT_PUBLIC_APP_URL",     // local=localhost, prod=modulca.eu
  "NEXTAUTH_URL",            // same reason
  "DATABASE_URL",            // usually different dev/prod DBs
]);
// Values that would be catastrophic to push automatically
const SENSITIVE_REQUIRING_CONFIRM = ["STRIPE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
};

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2];
    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    map.set(m[1], val);
  }
  return map;
}

function shouldSkip(key) {
  if (SKIP_KEYS.has(key)) return true;
  return SKIP_PREFIXES.some((p) => key.startsWith(p));
}

function mask(v) {
  if (!v) return "(empty)";
  if (v.length <= 8) return `${v[0]}***`;
  return `${v.slice(0, 4)}…${v.slice(-4)} (${v.length}c)`;
}

async function confirm(question) {
  if (YES) return true;
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ans = await rl.question(`${c.cyan}?${c.reset} ${question} [y/N] `);
  rl.close();
  return /^y(es)?$/i.test(ans.trim());
}

async function main() {
  console.log(`${c.bold}🔄 Env Sync${c.reset} — .env.local → Vercel ${envTarget}`);
  if (DRY) console.log(`${c.yellow}DRY RUN${c.reset}`);

  // 1. Read local
  if (!existsSync(".env.local")) {
    console.error(`${c.red}✗${c.reset} .env.local not found`);
    process.exit(1);
  }
  const local = parseEnv(readFileSync(".env.local", "utf8"));
  console.log(`  Loaded ${local.size} vars from .env.local`);

  // 2. Pull Vercel
  console.log(`  Pulling current ${envTarget} env from Vercel…`);
  try {
    execSync(`npx vercel env pull ${TEMP_FILE} --environment=${envTarget} --yes`, {
      stdio: ["inherit", "pipe", "pipe"],
    });
  } catch (e) {
    console.error(`${c.red}✗${c.reset} Vercel pull failed: ${e.message}`);
    process.exit(1);
  }
  const remote = parseEnv(readFileSync(TEMP_FILE, "utf8"));
  console.log(`  Pulled ${remote.size} vars from Vercel`);

  // 3. Diff
  const toAdd = [];     // in local, not in remote
  const toUpdate = [];  // in both but differ
  const onlyRemote = []; // in remote, not in local (informational)

  for (const [k, v] of local) {
    if (shouldSkip(k)) continue;
    if (!remote.has(k)) {
      toAdd.push([k, v]);
    } else if (remote.get(k) !== v) {
      toUpdate.push([k, v, remote.get(k)]);
    }
  }
  for (const [k, v] of remote) {
    if (!local.has(k) && !shouldSkip(k)) onlyRemote.push([k, v]);
  }

  // 4. Report
  console.log(`\n${c.bold}Diff:${c.reset}`);
  if (toAdd.length === 0 && toUpdate.length === 0) {
    console.log(`  ${c.green}✓ In sync.${c.reset} No changes needed.`);
  } else {
    if (toAdd.length) {
      console.log(`\n  ${c.green}Will ADD ${toAdd.length}:${c.reset}`);
      for (const [k, v] of toAdd) console.log(`    + ${k} = ${mask(v)}`);
    }
    if (toUpdate.length) {
      console.log(`\n  ${c.yellow}Will UPDATE ${toUpdate.length}:${c.reset}`);
      for (const [k, v, oldV] of toUpdate) {
        console.log(`    ~ ${k}: ${c.dim}${mask(oldV)}${c.reset} → ${mask(v)}`);
      }
    }
  }
  if (onlyRemote.length) {
    console.log(`\n  ${c.dim}Only in Vercel (not touched): ${onlyRemote.length} vars${c.reset}`);
  }

  try { unlinkSync(TEMP_FILE); } catch {}

  if (DRY || (toAdd.length === 0 && toUpdate.length === 0)) {
    process.exit(0);
  }

  // 5. Confirm sensitive
  const sensitive = [...toAdd, ...toUpdate].filter(([k]) => SENSITIVE_REQUIRING_CONFIRM.includes(k));
  if (sensitive.length && !YES) {
    console.log(`\n  ${c.yellow}⚠  Changes include sensitive vars: ${sensitive.map(([k]) => k).join(", ")}${c.reset}`);
  }

  const go = await confirm(`\nApply ${toAdd.length + toUpdate.length} change(s) to Vercel ${envTarget}?`);
  if (!go) { console.log("Aborted."); process.exit(0); }

  // 6. Apply
  const apply = (k, v) => {
    try { execSync(`npx vercel env rm ${k} ${envTarget} --yes`, { stdio: "pipe" }); } catch {}
    execSync(`npx vercel env add ${k} ${envTarget}`, { input: v, stdio: ["pipe", "pipe", "pipe"] });
    console.log(`  ${c.green}✓${c.reset} ${k}`);
  };

  for (const [k, v] of toAdd) apply(k, v);
  for (const [k, v] of toUpdate) apply(k, v);

  console.log(`\n  ${c.green}✓ Synced ${toAdd.length + toUpdate.length} vars.${c.reset}`);
  console.log(`  ${c.dim}Trigger redeploy: npx vercel --prod${c.reset}`);
}

main().catch((e) => {
  console.error(`\n${c.red}✗ Sync failed:${c.reset} ${e.message}`);
  try { unlinkSync(TEMP_FILE); } catch {}
  process.exit(1);
});
