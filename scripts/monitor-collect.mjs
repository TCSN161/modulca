#!/usr/bin/env node
/**
 * Monitor Collect — Stage 1 (passive monitoring)
 *
 * Purpose: collect signals from 5+ data sources into monitoring_signals
 * Supabase table. NO classification, NO remediation, NO notifications yet.
 * Just: see everything, store everything, sleep well.
 *
 * Sources polled:
 *   1. Local ops-check (via subprocess)
 *   2. /api/health endpoint (via fetch)
 *   3. Git commits since last run (from git log)
 *   4. Vercel deploy status (if VERCEL_TOKEN set)
 *   5. Sentry project stats (if SENTRY_AUTH_TOKEN set)
 *
 * Usage:
 *   npm run monitor:collect              # one-shot, logs + writes signals
 *   npm run monitor:collect -- --verbose # extra console output
 *   npm run monitor:collect -- --dry     # no DB writes, just print what would be written
 *   npm run monitor:collect -- --source=ops-check  # limit to one source
 *
 * Scheduled via:
 *   - GitHub Actions cron (every 6h — see .github/workflows/ops-check-cron.yml)
 *   - Can also run locally: set up cron / launchd / systemd if desired
 *
 * Prerequisites:
 *   - Migration 010 applied in Supabase (agent_insert_signal RPC available)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local or env
 *
 * Safety:
 *   - Non-destructive: only INSERTs signals, never mutates other tables
 *   - Stateless: safe to run concurrently (dedup via fingerprint RPC)
 *   - Timeouts on all external calls (10s max)
 *   - Failures of individual sources don't block other sources
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose") || argv.includes("-v");
const DRY = argv.includes("--dry") || argv.includes("--dry-run");
const SOURCE_FILTER = (argv.find((a) => a.startsWith("--source=")) || "").replace("--source=", "");
const ROOT = process.cwd();

/* ── Env loading (no dotenv dep) ─────────────────────────── */

function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  } catch {
    // .env.local optional — env may be set externally (GitHub Actions secrets etc.)
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.modulca.eu";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || "modulca";
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "modulca-web";

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", magenta: "\x1b[35m",
};

function log(level, msg) {
  const colors = {
    normal: c.green, info: c.blue, watch: c.yellow,
    warn: c.magenta, critical: c.red,
  };
  const color = colors[level] || c.dim;
  console.log(`  ${color}●${c.reset} ${c.bold}${level.padEnd(10)}${c.reset} ${msg}`);
}

function verbose(msg) {
  if (VERBOSE) console.log(`  ${c.dim}${msg}${c.reset}`);
}

/* ── Signal helpers ──────────────────────────────────────── */

const signals = [];  // accumulated in this run

function fingerprint(source, messageTemplate) {
  return createHash("sha256").update(`${source}|${messageTemplate}`).digest("hex").slice(0, 32);
}

function addSignal({ source, severity, message, details = {}, fp = null }) {
  const signal = {
    source,
    severity,
    message: message.slice(0, 500),
    details,
    fingerprint: fp || fingerprint(source, message.replace(/\d+/g, "N").slice(0, 80)),
  };
  signals.push(signal);
  log(severity, `[${source}] ${message}`);
  return signal;
}

async function flushSignalsToSupabase() {
  if (DRY) {
    console.log(`\n${c.yellow}DRY RUN${c.reset} — would insert ${signals.length} signals, but no writes performed.`);
    return { inserted: 0, skipped: signals.length };
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(`\n${c.red}✗${c.reset} Missing SUPABASE credentials — cannot persist signals.`);
    console.error(`  Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY`);
    return { inserted: 0, skipped: signals.length, error: "missing-credentials" };
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const s of signals) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/agent_insert_signal`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_source: s.source,
          p_severity: s.severity,
          p_message: s.message,
          p_details: s.details,
          p_fingerprint: s.fingerprint,
          p_dedup_window_minutes: 5,
        }),
      });
      if (res.ok) {
        inserted++;
      } else {
        failed++;
        const body = await res.text();
        verbose(`RPC failed: ${res.status} ${body}`);
      }
    } catch (err) {
      failed++;
      verbose(`Insert error: ${err.message}`);
    }
  }

  return { inserted, skipped, failed };
}

/* ── SOURCE 1: ops-check (local subprocess) ──────────────── */

async function collectOpsCheck() {
  if (SOURCE_FILTER && SOURCE_FILTER !== "ops-check") return;
  verbose("Collecting ops-check signals...");

  try {
    const output = execSync("npm run ops:check:json --silent 2>/dev/null", {
      encoding: "utf8",
      timeout: 60000,
    });
    const report = JSON.parse(output);

    const passed = report.checks?.filter((c) => c.status === "pass").length || 0;
    const warnings = report.checks?.filter((c) => c.status === "warn").length || 0;
    const fails = report.checks?.filter((c) => c.status === "fail").length || 0;
    const total = report.checks?.length || 0;

    let severity = "normal";
    if (fails > 2) severity = "critical";
    else if (fails > 0) severity = "warn";
    else if (warnings > 0) severity = "watch";

    addSignal({
      source: "ops-check",
      severity,
      message: `ops-check: ${passed}/${total} pass, ${warnings} warnings, ${fails} fails`,
      details: {
        passed, warnings, fails, total,
        failed_checks: report.checks?.filter((c) => c.status === "fail").map((c) => c.name) || [],
        warning_checks: report.checks?.filter((c) => c.status === "warn").map((c) => c.name) || [],
      },
    });
  } catch (err) {
    // ops-check script itself failed — significant signal
    addSignal({
      source: "ops-check",
      severity: "warn",
      message: `ops-check subprocess failed: ${err.message?.slice(0, 200) || "unknown"}`,
      details: { error: err.message?.slice(0, 500) },
    });
  }
}

/* ── SOURCE 2: /api/health (public endpoint) ─────────────── */

async function collectHealth() {
  if (SOURCE_FILTER && SOURCE_FILTER !== "health") return;
  verbose(`Collecting health from ${APP_URL}/api/health ...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const start = Date.now();
    const res = await fetch(`${APP_URL}/api/health`, {
      signal: controller.signal,
      headers: { "User-Agent": "ModulCA-Monitor/1.0" },
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      addSignal({
        source: "health",
        severity: res.status >= 500 ? "critical" : "warn",
        message: `health returned HTTP ${res.status} (${latencyMs}ms)`,
        details: { status: res.status, latency_ms: latencyMs },
      });
      return;
    }

    const body = await res.json().catch(() => ({}));
    let severity = "normal";
    if (latencyMs > 5000) severity = "warn";
    else if (latencyMs > 2000) severity = "watch";
    if (body.status && body.status !== "ok") severity = severity === "normal" ? "watch" : severity;
    if (body.env?.missingCritical?.length > 0) severity = "critical";

    addSignal({
      source: "health",
      severity,
      message: `health OK (${latencyMs}ms, status=${body.status || "unknown"})`,
      details: {
        latency_ms: latencyMs,
        status: body.status,
        env_missing_critical: body.env?.missingCritical || [],
        env_warnings: body.env?.warnings || [],
      },
    });
  } catch (err) {
    clearTimeout(timer);
    addSignal({
      source: "health",
      severity: "critical",
      message: `health probe failed: ${err.name === "AbortError" ? "timeout" : err.message}`,
      details: { error: err.message, url: `${APP_URL}/api/health` },
    });
  }
}

/* ── SOURCE 3: Git commits since last N hours ────────────── */

async function collectGitActivity() {
  if (SOURCE_FILTER && SOURCE_FILTER !== "git") return;
  verbose("Collecting git activity...");

  try {
    const output = execSync('git log --since="6 hours ago" --pretty=format:"%h|%an|%s" -n 50', {
      encoding: "utf8",
      timeout: 10000,
    }).trim();

    if (!output) {
      verbose("No git commits in last 6h");
      return;
    }

    const commits = output.split("\n").map((line) => {
      const [sha, author, subject] = line.split("|");
      return { sha, author, subject };
    });

    // Classify commit activity
    const criticalKeywords = ["fix(critical)", "security", "breach", "outage"];
    const hasCritical = commits.some((c) => criticalKeywords.some((k) => c.subject.toLowerCase().includes(k)));

    addSignal({
      source: "git",
      severity: hasCritical ? "watch" : "info",
      message: `git: ${commits.length} commit(s) in last 6h`,
      details: {
        count: commits.length,
        authors: [...new Set(commits.map((c) => c.author))],
        recent: commits.slice(0, 5),
        has_critical_fix: hasCritical,
      },
      fp: fingerprint("git", `activity-6h`),
    });
  } catch (err) {
    verbose(`Git collection skipped: ${err.message}`);
  }
}

/* ── SOURCE 4: Vercel deploy status ──────────────────────── */

async function collectVercel() {
  if (SOURCE_FILTER && SOURCE_FILTER !== "vercel") return;
  if (!VERCEL_TOKEN) {
    verbose("VERCEL_TOKEN not set — skipping Vercel collection");
    return;
  }
  verbose("Collecting Vercel deploy status...");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch("https://api.vercel.com/v6/deployments?limit=5&state=READY,ERROR", {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      addSignal({
        source: "vercel",
        severity: "watch",
        message: `Vercel API returned ${res.status}`,
        details: { status: res.status },
      });
      return;
    }

    const data = await res.json();
    const deployments = data.deployments || [];
    const errors = deployments.filter((d) => d.state === "ERROR").length;
    const last = deployments[0];

    addSignal({
      source: "vercel",
      severity: errors > 0 ? "warn" : "normal",
      message: `Vercel: last 5 deploys — ${errors} errors, last state=${last?.state || "unknown"}`,
      details: {
        error_count: errors,
        last_deploy_state: last?.state,
        last_deploy_url: last?.url,
        last_deploy_created_at: last?.createdAt,
      },
      fp: fingerprint("vercel", "deploy-status"),
    });
  } catch (err) {
    clearTimeout(timer);
    verbose(`Vercel collection error: ${err.message}`);
  }
}

/* ── SOURCE 5: Sentry error rate (if configured) ─────────── */

async function collectSentry() {
  if (SOURCE_FILTER && SOURCE_FILTER !== "sentry") return;
  if (!SENTRY_AUTH_TOKEN) {
    verbose("SENTRY_AUTH_TOKEN not set — skipping Sentry collection");
    return;
  }
  verbose(`Collecting Sentry stats from ${SENTRY_ORG}/${SENTRY_PROJECT}...`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    // Get issue stats for last 24h
    const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/stats/?resolution=1h&stat=received&since=${Math.floor(Date.now() / 1000 - 86400)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SENTRY_AUTH_TOKEN}` },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      verbose(`Sentry API returned ${res.status}`);
      return;
    }

    const stats = await res.json();
    const totalEvents = stats.reduce((sum, [, count]) => sum + count, 0);

    let severity = "normal";
    if (totalEvents > 500) severity = "warn";
    else if (totalEvents > 100) severity = "watch";

    addSignal({
      source: "sentry",
      severity,
      message: `Sentry: ${totalEvents} events last 24h`,
      details: { total_24h: totalEvents, hourly_breakdown_sample: stats.slice(-6) },
      fp: fingerprint("sentry", "events-24h"),
    });
  } catch (err) {
    clearTimeout(timer);
    verbose(`Sentry collection error: ${err.message}`);
  }
}

/* ── Main ────────────────────────────────────────────────── */

async function main() {
  const start = Date.now();
  console.log(`${c.bold}🛰  Monitor Collect${c.reset} — ${new Date().toISOString()}`);
  if (DRY) console.log(`${c.yellow}DRY RUN — no DB writes${c.reset}`);
  if (SOURCE_FILTER) console.log(`${c.cyan}Filter: source=${SOURCE_FILTER}${c.reset}`);
  console.log();

  // Run all collectors in parallel (independent sources)
  const results = await Promise.allSettled([
    collectOpsCheck(),
    collectHealth(),
    collectGitActivity(),
    collectVercel(),
    collectSentry(),
  ]);

  const errors = results.filter((r) => r.status === "rejected").length;
  if (errors > 0) {
    console.log(`\n${c.yellow}⚠${c.reset} ${errors}/${results.length} collectors errored (signals still flushed)`);
  }

  // Flush to DB
  const flushResult = await flushSignalsToSupabase();

  // Summary
  const duration = Date.now() - start;
  console.log(`\n${c.bold}Summary${c.reset}`);
  console.log(`  Collected: ${signals.length} signals`);
  console.log(`  Inserted: ${flushResult.inserted || 0}`);
  if (flushResult.failed) console.log(`  Failed: ${c.red}${flushResult.failed}${c.reset}`);
  console.log(`  Duration: ${duration}ms`);

  if (flushResult.error) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${c.red}✗ Monitor collect failed:${c.reset} ${err.message}`);
  process.exit(1);
});
