#!/usr/bin/env node
/**
 * Collision Check — detects signs of parallel Claude session conflicts.
 *
 * Run: npm run collision-check
 * Or:  node scripts/collision-check.mjs
 *
 * What it checks:
 *   1. Uncommitted merge conflict markers in any tracked file
 *   2. Recent "hotspot" files (touched by many commits in last 24h)
 *   3. package.json vs package-lock.json divergence signal
 *   4. Unstaged vs staged file overlap (indication that a concurrent
 *      process modified a file you were about to commit)
 *   5. Remote ahead of local (another session pushed while you worked)
 *   6. Stale .tmp files left over from crashed sessions
 *
 * Exit code: 0 = clean, 1 = warnings, 2 = errors
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const errors = [];
const warnings = [];
const infos = [];

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (err) {
    return err.stdout?.toString().trim() || "";
  }
}

function header(text) {
  console.log(`\n${BOLD}${CYAN}▶ ${text}${RESET}`);
}

/* ─── 1. Conflict markers ──────────────────────────────────────────── */
header("1. Searching for unresolved merge conflict markers");
try {
  const files = run("git ls-files").split("\n").filter(Boolean);
  const conflicted = [];
  for (const file of files) {
    if (!/\.(ts|tsx|js|jsx|json|md|yaml|yml|css|html)$/.test(file)) continue;
    try {
      const content = readFileSync(file, "utf8");
      if (content.includes("<<<<<<< HEAD") || content.includes(">>>>>>>")) {
        conflicted.push(file);
      }
    } catch { /* skip unreadable */ }
  }
  if (conflicted.length > 0) {
    errors.push(`Found ${conflicted.length} files with conflict markers: ${conflicted.join(", ")}`);
    console.log(`${RED}✗ ${conflicted.length} files have conflict markers${RESET}`);
    conflicted.forEach((f) => console.log(`  ${RED}${f}${RESET}`));
  } else {
    console.log(`${GREEN}✓ No conflict markers found${RESET}`);
  }
} catch (err) {
  warnings.push(`Could not scan for conflicts: ${err.message}`);
}

/* ─── 2. Hotspot files in last 24h ──────────────────────────────────── */
header("2. Identifying hotspot files (touched by multiple commits in 24h)");
const hotspotOutput = run(
  `git log --since="24 hours ago" --name-only --pretty=format: | sort | grep -v "^$" | uniq -c | sort -rn | head -10`
);
const hotspots = hotspotOutput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const match = line.trim().match(/^(\d+)\s+(.+)$/);
    return match ? { count: Number(match[1]), file: match[2] } : null;
  })
  .filter((x) => x && x.count >= 3);

if (hotspots.length > 0) {
  console.log(`${YELLOW}⚠ ${hotspots.length} hotspot file(s) — high risk of concurrent edits:${RESET}`);
  hotspots.forEach((h) =>
    console.log(`  ${YELLOW}${h.count}× ${h.file}${RESET}`)
  );
  warnings.push(`${hotspots.length} hotspot files in last 24h (see above)`);
} else {
  console.log(`${GREEN}✓ No dangerous hotspots${RESET}`);
}

/* ─── 3. package.json vs lock divergence ────────────────────────────── */
header("3. Checking package.json ↔ package-lock.json sync");
if (existsSync("package.json") && existsSync("package-lock.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const pkgDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const lockDeps = lock.packages?.[""]?.dependencies || {};
  const lockDevDeps = lock.packages?.[""]?.devDependencies || {};
  const lockAll = { ...lockDeps, ...lockDevDeps };

  const missing = [];
  for (const [name, version] of Object.entries(pkgDeps)) {
    if (!lockAll[name]) {
      missing.push(name);
    } else if (lockAll[name] !== version) {
      // different pinned version — maybe fine, maybe drift
      // ignore for now unless way off
    }
  }
  if (missing.length > 0) {
    warnings.push(`package-lock.json missing ${missing.length} deps from package.json: ${missing.join(", ")} — run npm install`);
    console.log(`${YELLOW}⚠ Missing in lock: ${missing.join(", ")}${RESET}`);
    console.log(`${DIM}  Fix: npm install${RESET}`);
  } else {
    console.log(`${GREEN}✓ package.json ↔ lock in sync${RESET}`);
  }
} else {
  infos.push("package.json or package-lock.json not found");
}

/* ─── 4. Uncommitted changes + staged overlap ───────────────────────── */
header("4. Checking for modified + staged same-file conflicts");
const status = run("git status --porcelain=v1").split("\n").filter(Boolean);
const bothModified = status.filter((l) => /^MM /.test(l));
if (bothModified.length > 0) {
  errors.push(`${bothModified.length} file(s) have both staged AND unstaged changes — another process may have modified them concurrently`);
  console.log(`${RED}✗ ${bothModified.length} file(s) with staged+unstaged divergence:${RESET}`);
  bothModified.forEach((l) => console.log(`  ${RED}${l}${RESET}`));
} else {
  console.log(`${GREEN}✓ No staged/unstaged conflicts${RESET}`);
}

/* ─── 5. Remote ahead (another session pushed) ─────────────────────── */
header("5. Checking if remote has commits you don't have");
const fetchResult = run("git fetch --dry-run 2>&1");
const behind = run("git rev-list --count HEAD..@{u} 2>/dev/null") || "0";
const ahead = run("git rev-list --count @{u}..HEAD 2>/dev/null") || "0";
const behindNum = Number(behind);
const aheadNum = Number(ahead);

if (behindNum > 0) {
  warnings.push(`Remote has ${behindNum} commit(s) you don't have. Another session pushed. Run: git pull --rebase`);
  console.log(`${YELLOW}⚠ Remote is ${behindNum} commits ahead. Another session pushed.${RESET}`);
  console.log(`${DIM}  Fix: git pull --rebase${RESET}`);
} else if (aheadNum > 0) {
  console.log(`${GREEN}✓ You are ${aheadNum} commits ahead of remote (ready to push)${RESET}`);
} else {
  console.log(`${GREEN}✓ In sync with remote${RESET}`);
}

/* ─── 6. Stale .tmp files ──────────────────────────────────────────── */
header("6. Checking for stale .tmp files from crashed sessions");
const tmpFiles = run("git ls-files --others --exclude-standard | grep -E '\\.tmp\\.|\\.swp$|~$' || true")
  .split("\n")
  .filter(Boolean);
if (tmpFiles.length > 0) {
  warnings.push(`${tmpFiles.length} stale .tmp / .swp files — may be from crashed Claude session`);
  console.log(`${YELLOW}⚠ Stale temp files:${RESET}`);
  tmpFiles.forEach((f) => console.log(`  ${YELLOW}${f}${RESET}`));
  console.log(`${DIM}  Fix: delete them with rm${RESET}`);
} else {
  console.log(`${GREEN}✓ No stale temp files${RESET}`);
}

/* ─── 7. Recent "suspicious" commits (merge auto-resolve) ───────────── */
header("7. Scanning for suspicious merge commits");
const mergeCommits = run(`git log --since="24 hours ago" --merges --pretty=format:"%h %s"`)
  .split("\n")
  .filter(Boolean);
if (mergeCommits.length > 0) {
  warnings.push(`${mergeCommits.length} merge commit(s) in last 24h — could be from conflicts:`);
  mergeCommits.forEach((c) => console.log(`  ${YELLOW}${c}${RESET}`));
} else {
  console.log(`${GREEN}✓ No merge commits in last 24h${RESET}`);
}

/* ─── SUMMARY ──────────────────────────────────────────────────────── */
console.log(`\n${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}SUMMARY${RESET}`);
console.log(`${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${GREEN}${BOLD}✓ All clear — no collision signals${RESET}\n`);
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n${RED}${BOLD}ERRORS (${errors.length}):${RESET}`);
  errors.forEach((e, i) => console.log(`  ${RED}${i + 1}. ${e}${RESET}`));
}
if (warnings.length > 0) {
  console.log(`\n${YELLOW}${BOLD}WARNINGS (${warnings.length}):${RESET}`);
  warnings.forEach((w, i) => console.log(`  ${YELLOW}${i + 1}. ${w}${RESET}`));
}

console.log(`\n${DIM}Run this after every Claude session to detect collisions early.${RESET}\n`);
process.exit(errors.length > 0 ? 2 : 1);
