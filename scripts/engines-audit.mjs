#!/usr/bin/env node
/**
 * ModulCA — Engine Billing Audit
 *
 * Scans the engine billing registry and reports:
 *   - 🔴 Expired: free quotas that ran out
 *   - 🟡 Expiring soon: within 30 days
 *   - 🔄 Next renewals: when auto-renewing engines reset
 *   - 📊 Role distribution: how many hero / backup / premium-only / do-not-use
 *   - 💰 Cost ceiling summary: cheapest → most expensive per tier
 *   - 🔀 Changes since last audit (diff vs scripts/.engines-audit-state.json)
 *
 * Runs offline — no network calls. Just analyzes the static registry data
 * against the current date.
 *
 * Usage:
 *   npm run engines:audit              # full report
 *   npm run engines:audit -- --json    # machine-readable output
 *   npm run engines:audit -- --save    # save current state as baseline
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_PATH = join(ROOT, "src", "features", "admin", "engine-billing-data.json");
const STATE_PATH = join(__dirname, ".engines-audit-state.json");

const JSON_MODE = process.argv.includes("--json");
const SAVE_BASELINE = process.argv.includes("--save");

/* ── Load current registry ────────────────────────────────────────── */

const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const registry = data.registry;
const meta = data._meta;

/* ── Helpers ──────────────────────────────────────────────────────── */

const now = new Date();
const DAY_MS = 86_400_000;

function daysUntil(iso) {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}

function nextRenewalIso(cadence) {
  const d = new Date(now);
  switch (cadence) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1, 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + 1, 0, 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    default:
      return null;
  }
}

/* ── Build analysis ───────────────────────────────────────────────── */

const expired = [];
const expiringSoon = [];
const renewals = [];
const byRole = { hero: [], backup: [], "premium-only": [], "do-not-use": [] };

for (const e of registry) {
  byRole[e.role].push(e);

  // Expiry windows
  if (e.freeExpiresAt) {
    const d = daysUntil(e.freeExpiresAt);
    if (d === null) continue;
    if (d < 0) {
      expired.push({ id: e.id, label: e.label, expiredDaysAgo: -d, freeExpiresAt: e.freeExpiresAt });
    } else if (d <= 30) {
      expiringSoon.push({ id: e.id, label: e.label, daysRemaining: d, freeExpiresAt: e.freeExpiresAt });
    }
  }

  // Next auto-renewal for hero/backup engines
  if (e.role === "hero" || e.role === "backup") {
    const iso = nextRenewalIso(e.renewalCadence);
    if (iso) {
      renewals.push({
        id: e.id,
        label: e.label,
        cadence: e.renewalCadence,
        nextRenewal: iso,
        daysUntil: daysUntil(iso),
      });
    }
  }
}

/* ── Cost ceiling summary per role ────────────────────────────────── */

function costSummary(role) {
  const items = byRole[role]
    .map((e) => ({ id: e.id, label: e.label, pricePerImageUsd: e.pricePerImageUsd }))
    .sort((a, b) => a.pricePerImageUsd - b.pricePerImageUsd);
  return items;
}

/* ── Diff vs last saved state ─────────────────────────────────────── */

const currentState = registry.map((e) => ({
  id: e.id,
  role: e.role,
  pricePerImageUsd: e.pricePerImageUsd,
  freeQuotaAmount: e.freeQuotaAmount,
  freeExpiresAt: e.freeExpiresAt,
  billingModel: e.billingModel,
}));

let changes = [];
let hasBaseline = existsSync(STATE_PATH);

if (hasBaseline) {
  try {
    const prev = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    const prevMap = new Map(prev.map((e) => [e.id, e]));
    const curMap = new Map(currentState.map((e) => [e.id, e]));

    // Added
    for (const [id, cur] of curMap) {
      if (!prevMap.has(id)) {
        changes.push({ type: "added", id, label: cur.id });
      }
    }
    // Removed
    for (const [id] of prevMap) {
      if (!curMap.has(id)) {
        changes.push({ type: "removed", id });
      }
    }
    // Modified
    for (const [id, cur] of curMap) {
      const old = prevMap.get(id);
      if (!old) continue;
      const diffs = [];
      for (const key of ["role", "pricePerImageUsd", "freeQuotaAmount", "freeExpiresAt", "billingModel"]) {
        if (JSON.stringify(old[key]) !== JSON.stringify(cur[key])) {
          diffs.push({ key, from: old[key], to: cur[key] });
        }
      }
      if (diffs.length > 0) {
        changes.push({ type: "modified", id, diffs });
      }
    }
  } catch (err) {
    changes.push({ type: "baseline-unreadable", error: err.message });
  }
}

if (SAVE_BASELINE) {
  writeFileSync(STATE_PATH, JSON.stringify(currentState, null, 2));
}

/* ── Emit ─────────────────────────────────────────────────────────── */

if (JSON_MODE) {
  console.log(
    JSON.stringify(
      {
        reviewedAt: meta.lastReviewed,
        nextReviewDue: meta.nextReviewDue,
        expired,
        expiringSoon,
        renewals,
        byRoleCount: Object.fromEntries(Object.entries(byRole).map(([r, arr]) => [r, arr.length])),
        costByRole: {
          hero: costSummary("hero"),
          backup: costSummary("backup"),
          "premium-only": costSummary("premium-only"),
          "do-not-use": costSummary("do-not-use"),
        },
        changes,
        baselineExisted: hasBaseline,
        savedBaseline: SAVE_BASELINE,
      },
      null,
      2
    )
  );
  process.exit(expired.length > 0 ? 1 : 0);
}

/* Human-readable report */

const h1 = (s) => `\n\x1b[1m${s}\x1b[0m\n${"─".repeat(60)}`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

console.log(`\n🔍 ModulCA Engine Billing Audit`);
console.log(`   Last reviewed: ${meta.lastReviewed}`);
console.log(`   Next review due: ${meta.nextReviewDue}`);
console.log(`   Registry: ${registry.length} engines`);

/* Expired */
console.log(h1("🔴 EXPIRED (action required)"));
if (expired.length === 0) {
  console.log(dim("   (none — all free quotas still valid)"));
} else {
  for (const e of expired) {
    console.log(
      `   ${red("✗")} ${e.label.padEnd(30)} ` +
        dim(`expired ${e.expiredDaysAgo}d ago (${e.freeExpiresAt.slice(0, 10)})`)
    );
  }
  console.log(
    `\n   ${red("Action:")} review these engines — either top-up, switch role, or remove from fallback chains.`
  );
}

/* Expiring soon */
console.log(h1("🟡 EXPIRING WITHIN 30 DAYS"));
if (expiringSoon.length === 0) {
  console.log(dim("   (none)"));
} else {
  for (const e of expiringSoon) {
    const color = e.daysRemaining < 7 ? red : yellow;
    console.log(`   ${color("⚠")} ${e.label.padEnd(30)} ${color(`in ${e.daysRemaining}d`)}   ${dim(e.freeExpiresAt.slice(0, 10))}`);
  }
}

/* Upcoming renewals */
console.log(h1("🔄 AUTO-RENEWALS (next 7 days)"));
const soonRenewals = renewals.filter((r) => r.daysUntil !== null && r.daysUntil <= 7).sort((a, b) => a.daysUntil - b.daysUntil);
if (soonRenewals.length === 0) {
  console.log(dim("   (none in next week)"));
} else {
  for (const r of soonRenewals) {
    console.log(
      `   ${green("↻")} ${r.label.padEnd(30)} ` +
        cyan(`${r.cadence}`) +
        dim(`  in ${r.daysUntil}d  (${r.nextRenewal.slice(0, 10)})`)
    );
  }
}

/* Role distribution */
console.log(h1("📊 ROLE DISTRIBUTION"));
const roleColors = { hero: green, backup: cyan, "premium-only": yellow, "do-not-use": red };
for (const role of ["hero", "backup", "premium-only", "do-not-use"]) {
  const items = byRole[role];
  const color = roleColors[role];
  console.log(`   ${color(role.padEnd(14))} ${items.length} engine${items.length !== 1 ? "s" : ""}`);
  for (const e of items) {
    const price = e.pricePerImageUsd === 0 ? green("$0.0000") : yellow(`$${e.pricePerImageUsd.toFixed(4)}`);
    console.log(`      ${dim("·")} ${e.label.padEnd(30)} ${price}/img`);
  }
}

/* Cost summary */
console.log(h1("💰 CHEAPEST → MOST EXPENSIVE (after free quota)"));
const allSorted = [...registry]
  .filter((e) => e.role !== "do-not-use")
  .sort((a, b) => a.pricePerImageUsd - b.pricePerImageUsd);
for (const e of allSorted.slice(0, 10)) {
  const color = e.pricePerImageUsd === 0 ? green : e.pricePerImageUsd < 0.005 ? cyan : yellow;
  console.log(
    `   ${color(`$${e.pricePerImageUsd.toFixed(4)}`.padStart(8))}/img   ${e.label.padEnd(30)} ${dim(`(${e.role})`)}`
  );
}

/* Changes */
console.log(h1("🔀 CHANGES SINCE LAST BASELINE"));
if (!hasBaseline) {
  console.log(dim("   (no baseline — run with --save to create one)"));
} else if (changes.length === 0) {
  console.log(dim("   ✓ No changes detected."));
} else {
  for (const c of changes) {
    if (c.type === "added") console.log(`   ${green("+")} added:    ${c.id}`);
    if (c.type === "removed") console.log(`   ${red("-")} removed:  ${c.id}`);
    if (c.type === "modified") {
      console.log(`   ${yellow("~")} modified: ${c.id}`);
      for (const d of c.diffs) {
        console.log(`       ${dim("·")} ${d.key}: ${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}`);
      }
    }
    if (c.type === "baseline-unreadable") console.log(red(`   baseline unreadable: ${c.error}`));
  }
}

/* Summary */
console.log(h1("📝 SUMMARY"));
const free = byRole.hero.length + byRole.backup.filter((e) => e.pricePerImageUsd === 0).length;
const paidHeroes = byRole.hero.filter((e) => e.pricePerImageUsd > 0).length;
console.log(`   Engines usable at $0:       ${green(free)}`);
console.log(`   Engines with usage cost:    ${yellow(registry.length - free)}`);
console.log(`   Premium-only (revenue reqd): ${yellow(byRole["premium-only"].length)}`);
console.log(`   Deprecated / do-not-use:    ${red(byRole["do-not-use"].length)}`);

if (expired.length > 0) {
  console.log(`\n${red("⚠  Action required — see EXPIRED section above.")}\n`);
  process.exit(1);
}

if (SAVE_BASELINE) {
  console.log(`\n${green("✓ Baseline saved to scripts/.engines-audit-state.json")}`);
  console.log(dim(`  Next audit run will diff against this snapshot.\n`));
} else if (!hasBaseline) {
  console.log(`\n${dim("💡 Run `npm run engines:audit -- --save` to establish baseline.")}\n`);
} else {
  console.log();
}

process.exit(0);
