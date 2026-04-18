#!/usr/bin/env node
/**
 * Supabase Query Analyzer
 *
 * Identifies performance bottlenecks in the Supabase DB by calling RPC
 * functions defined in migration 009 (analyzer_*). Read-only, safe to run
 * in production. Uses service_role — values in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Reports:
 *   1. Database health snapshot (cache hit ratio, size, connections)
 *   2. Top 10 slow queries (by mean exec time)
 *   3. Top 10 frequent queries (by call count)
 *   4. Biggest tables (memory/disk hogs)
 *   5. Unused indexes (cleanup candidates)
 *
 * Usage:
 *   npm run db:analyze              # colored console report
 *   npm run db:analyze:json         # machine-readable JSON
 *   npm run db:analyze -- --reset   # reset pg_stat_statements (measure new period)
 *
 * PREREQUISITES:
 *   - Run migration 009 in Supabase SQL Editor first (one-time)
 *   - .env.local must have SUPABASE service role credentials
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const IS_JSON = process.argv.includes("--json");
const RESET = process.argv.includes("--reset");
const ROOT = process.cwd();

/* ── Load .env.local manually (no dotenv dependency) ───────── */

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
    // .env.local not found — expected on some setups; require env vars to be set externally
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Missing SUPABASE credentials.");
  console.error("  Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  console.error("  Check .env.local or set them in your environment.");
  process.exit(1);
}

/* ── Colors ──────────────────────────────────────────────── */

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", magenta: "\x1b[35m",
};

function statusColor(s) {
  switch (s) {
    case "excellent": case "ok": return c.green;
    case "good": return c.green;
    case "watch": return c.yellow;
    case "concerning": case "near-limit": case "high": return c.red;
    default: return c.dim;
  }
}

/* ── RPC helper ─────────────────────────────────────────── */

async function rpc(fnName, args = {}) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fnName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC ${fnName} failed (${res.status}): ${text}`);
  }
  return res.json();
}

/* ── Formatting helpers ─────────────────────────────────── */

function renderTable(headers, rows, colWidths) {
  const widths = colWidths || headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length)));
  const line = widths.map((w) => "─".repeat(w + 2)).join("┼");

  const renderRow = (row, bold) =>
    row.map((cell, i) => {
      const str = String(cell ?? "");
      const padded = str.padEnd(widths[i]);
      return bold ? `${c.bold}${padded}${c.reset}` : padded;
    }).join(" │ ");

  console.log(renderRow(headers, true));
  console.log(c.dim + line + c.reset);
  rows.forEach((row) => console.log(renderRow(row, false)));
}

function truncate(str, max) {
  if (!str) return "";
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/* ── Main ───────────────────────────────────────────────── */

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    sections: {},
  };

  // ── Reset mode ──
  if (RESET) {
    console.log(`${c.yellow}⚠  Resetting pg_stat_statements — existing stats will be lost.${c.reset}`);
    const res = await rpc("analyzer_reset_stats");
    console.log(`${c.green}✓${c.reset} ${res}`);
    return;
  }

  if (!IS_JSON) {
    console.log(`${c.bold}🔍 Supabase Query Analyzer${c.reset} — ${new Date().toLocaleString("en-GB")}`);
    console.log(`${c.dim}${SUPABASE_URL}${c.reset}\n`);
  }

  // ── 1. Health ──
  try {
    const health = await rpc("analyzer_db_health");
    report.sections.health = health;

    if (!IS_JSON) {
      console.log(`${c.bold}1. Database Health${c.reset}`);
      for (const h of health) {
        const col = statusColor(h.status);
        console.log(`  ${col}●${c.reset} ${h.metric.padEnd(22)} ${h.value.padEnd(18)} ${c.dim}[${h.status}]${c.reset}`);
      }
      console.log();
    }
  } catch (err) {
    console.error(`${c.red}✗${c.reset} Health check failed: ${err.message}`);
    if (err.message.includes("analyzer_db_health")) {
      console.error(`  ${c.yellow}→${c.reset} Run migration 009 first: supabase/migrations/009_query_analyzer_rpc.sql`);
      process.exit(1);
    }
  }

  // ── 2. Slow queries ──
  try {
    const slow = await rpc("analyzer_slow_queries", { limit_n: 10 });
    report.sections.slow_queries = slow;

    if (!IS_JSON) {
      console.log(`${c.bold}2. Top 10 Slow Queries (by mean exec time)${c.reset}`);
      if (slow.length === 0) {
        console.log(`  ${c.dim}No query stats yet. Run some queries + re-run.${c.reset}\n`);
      } else {
        const rows = slow.map((q) => [
          truncate(q.query_preview, 60),
          q.calls.toLocaleString(),
          `${q.mean_ms.toFixed(1)}ms`,
          `${q.max_ms.toFixed(1)}ms`,
          `${q.cache_hit_pct}%`,
        ]);
        renderTable(["Query (preview)", "Calls", "Mean", "Max", "Cache"], rows);
        console.log();
      }
    }
  } catch (err) {
    console.error(`${c.red}✗${c.reset} Slow queries failed: ${err.message}\n`);
  }

  // ── 3. Frequent queries ──
  try {
    const freq = await rpc("analyzer_frequent_queries", { limit_n: 10 });
    report.sections.frequent_queries = freq;

    if (!IS_JSON) {
      console.log(`${c.bold}3. Top 10 Frequent Queries${c.reset}`);
      if (freq.length === 0) {
        console.log(`  ${c.dim}No stats yet.${c.reset}\n`);
      } else {
        const rows = freq.map((q) => [
          truncate(q.query_preview, 60),
          q.calls.toLocaleString(),
          `${(q.total_ms / 1000).toFixed(2)}s`,
          `${q.mean_ms.toFixed(1)}ms`,
        ]);
        renderTable(["Query (preview)", "Calls", "Total", "Mean"], rows);
        console.log();
      }
    }
  } catch (err) {
    console.error(`${c.red}✗${c.reset} Frequent queries failed: ${err.message}\n`);
  }

  // ── 4. Table sizes ──
  try {
    const tables = await rpc("analyzer_table_sizes", { limit_n: 10 });
    report.sections.table_sizes = tables;

    if (!IS_JSON) {
      console.log(`${c.bold}4. Largest Tables${c.reset}`);
      const rows = tables.map((t) => [
        t.table_name,
        t.total_size,
        t.table_size,
        t.indexes_size,
        t.row_count_estimate.toLocaleString(),
      ]);
      renderTable(["Table", "Total", "Data", "Indexes", "~Rows"], rows);
      console.log();
    }
  } catch (err) {
    console.error(`${c.red}✗${c.reset} Table sizes failed: ${err.message}\n`);
  }

  // ── 5. Unused indexes ──
  try {
    const unused = await rpc("analyzer_unused_indexes");
    report.sections.unused_indexes = unused;

    if (!IS_JSON) {
      console.log(`${c.bold}5. Unused Indexes (cleanup candidates)${c.reset}`);
      if (unused.length === 0) {
        console.log(`  ${c.green}✓${c.reset} All indexes are being used. Nothing to clean up.\n`);
      } else {
        const rows = unused.map((u) => [
          u.table_name,
          u.index_name,
          u.index_size,
          u.scans.toString(),
        ]);
        renderTable(["Table", "Index", "Size", "Scans"], rows);
        console.log(`  ${c.dim}↳ Consider dropping indexes with 0 scans after 7+ days.${c.reset}\n`);
      }
    }
  } catch (err) {
    console.error(`${c.red}✗${c.reset} Unused indexes failed: ${err.message}\n`);
  }

  // ── Output mode ──
  if (IS_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`${c.dim}Reset stats & re-measure after optimizations:${c.reset}`);
    console.log(`  ${c.cyan}npm run db:analyze -- --reset${c.reset}\n`);
  }
}

main().catch((err) => {
  console.error(`\n${c.red}✗ Analyzer failed:${c.reset} ${err.message}`);
  process.exit(1);
});
