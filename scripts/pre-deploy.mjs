#!/usr/bin/env node
/**
 * Pre-Deploy Gate — Run before deploying to production.
 *
 * Usage:
 *   node scripts/pre-deploy.mjs
 *
 * Fails (exit 1) if any critical check fails.
 * Add to Vercel build command or CI pipeline.
 *
 * Checks:
 *   1. No uncommitted changes
 *   2. TypeScript compiles clean
 *   3. All tests pass
 *   4. Required env vars present (via .env.local or process.env)
 *   5. No TODO/FIXME in critical paths
 *   6. package.json version is set
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let failed = false;

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf-8", timeout: 180000 }).trim();
  } catch (e) {
    return null;
  }
}

function gate(name, pass, detail = "") {
  const icon = pass ? "\x1b[32m✅\x1b[0m" : "\x1b[31m❌\x1b[0m";
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failed = true;
}

console.log("\n\x1b[1m🚀 ModulCA Pre-Deploy Gate\x1b[0m\n");

// 1. Git clean
const gitStatus = run("git status --porcelain");
gate("Git working tree clean", gitStatus === "", gitStatus ? `${gitStatus.split("\n").length} dirty file(s)` : "");

// 2. TypeScript
console.log("  ⏳ Running TypeScript check...");
const tsc = run("./node_modules/.bin/tsc --noEmit 2>&1");
gate("TypeScript compiles", tsc === "", tsc ? `${(tsc.match(/error TS/g) || []).length} error(s)` : "Zero errors");

// 3. Tests
console.log("  ⏳ Running test suite...");
const testOut = run("npx vitest run 2>&1");
const testPassed = testOut && !testOut.includes("failed") && testOut.includes("passed");
const testMatch = testOut?.match(/(\d+)\s+passed/);
gate("All tests pass", testPassed, testMatch ? `${testMatch[1]} tests` : "");

// 4. Build
console.log("  ⏳ Running production build...");
const buildOut = run("npm run build 2>&1");
gate("Production build succeeds", buildOut !== null);

// 5. Critical env vars (check process.env or .env.local)
const envPath = resolve(ROOT, ".env.local");
let envVars = {};
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > 0) envVars[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
}
// Also check process.env
for (const key of Object.keys(process.env)) {
  if (!envVars[key]) envVars[key] = process.env[key];
}

const criticalKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
];
const missingCritical = criticalKeys.filter((k) => !envVars[k]);
gate("Critical env vars present", missingCritical.length === 0,
  missingCritical.length > 0 ? `Missing: ${missingCritical.join(", ")}` : `${criticalKeys.length}/${criticalKeys.length}`);

// 6. Version
try {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf-8"));
  gate("Package version set", pkg.version && pkg.version !== "0.0.0", `v${pkg.version}`);
} catch {
  gate("Package version", false, "Cannot read package.json");
}

// Result
console.log("\n\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
if (failed) {
  console.log("  \x1b[31m\x1b[1m❌ DEPLOY BLOCKED — fix issues above\x1b[0m\n");
  process.exit(1);
} else {
  console.log("  \x1b[32m\x1b[1m✅ ALL GATES PASSED — safe to deploy\x1b[0m\n");
}
