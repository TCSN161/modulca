#!/usr/bin/env node
/**
 * Session Sync — cross-chat state visibility for parallel Claude Code sessions.
 *
 * One command surfaces everything that changed across parallel chats since
 * last sync, so main chat (or any coordinator) can read state without
 * opening 5 files manually.
 *
 * Actions:
 *   1. git fetch origin master
 *   2. Show remote commits not yet pulled (if any)
 *   3. Optionally pull (--pull flag, default auto-prompts; --yes skips prompt)
 *   4. Parse docs/sessions/active/*.md — show active session headers
 *   5. Parse docs/sessions/TRACKER.md — show live active/blocked rows
 *   6. Show recent commits filtered by session-prefix patterns
 *   7. Highlight handoff signals (commits with "→ unblocks" or "handoff:" prefix)
 *
 * Usage:
 *   npm run session:sync               # colored report + prompt to pull
 *   npm run session:sync -- --yes      # auto-pull without prompting
 *   npm run session:sync -- --no-pull  # show state without pulling
 *   npm run session:sync -- --json     # machine-readable output
 *   npm run session:sync -- --watch    # re-run every 60s (light polling)
 *
 * No external deps. Uses git CLI + node built-ins only.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const argv = process.argv.slice(2);
const AUTO_YES = argv.includes("--yes") || argv.includes("-y");
const NO_PULL = argv.includes("--no-pull");
const JSON_OUT = argv.includes("--json");
const WATCH = argv.includes("--watch");

const ROOT = process.cwd();
const SESSIONS_DIR = join(ROOT, "docs", "sessions");
const ACTIVE_DIR = join(SESSIONS_DIR, "active");
const TRACKER = join(SESSIONS_DIR, "TRACKER.md");

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", cyan: "\x1b[36m", magenta: "\x1b[35m",
};

/* ── Git helpers ─────────────────────────────────────────── */

function gitExec(cmd) {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (err) {
    return { error: err.stderr?.toString() || err.message };
  }
}

function getAhead() {
  const res = gitExec("rev-list --count HEAD..@{u}");
  return typeof res === "string" ? parseInt(res, 10) || 0 : 0;
}

function getBehind() {
  const res = gitExec("rev-list --count @{u}..HEAD");
  return typeof res === "string" ? parseInt(res, 10) || 0 : 0;
}

function getIncomingCommits(count = 20) {
  const res = gitExec(`log HEAD..@{u} --pretty=format:"%h|%ar|%an|%s" -n ${count}`);
  if (typeof res !== "string" || !res) return [];
  return res.split("\n").map((line) => {
    const [sha, age, author, subject] = line.split("|");
    return { sha, age, author, subject };
  });
}

function getRecentCommits(count = 15) {
  const res = gitExec(`log --pretty=format:"%h|%ar|%an|%s" -n ${count}`);
  if (typeof res !== "string" || !res) return [];
  return res.split("\n").map((line) => {
    const [sha, age, author, subject] = line.split("|");
    return { sha, age, author, subject };
  });
}

function gitStatus() {
  const res = gitExec("status --porcelain");
  if (typeof res !== "string") return { clean: false, files: [], error: res.error };
  const files = res ? res.split("\n") : [];
  return { clean: files.length === 0, files };
}

/* ── Session file parsing ─────────────────────────────────── */

function parseSessionFile(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8");
    const lines = raw.split("\n");

    // Extract session name from filename
    const basename = filePath.split(/[\\/]/).pop().replace(/\.md$/, "");

    // Try to find key sections
    const headers = {};
    let currentSection = null;
    let sectionContent = [];

    for (const line of lines) {
      const h2 = line.match(/^##\s+(.+)/);
      if (h2) {
        if (currentSection) headers[currentSection] = sectionContent.join("\n").trim();
        currentSection = h2[1].trim();
        sectionContent = [];
      } else if (currentSection) {
        sectionContent.push(line);
      }
    }
    if (currentSection) headers[currentSection] = sectionContent.join("\n").trim();

    const stats = statSync(filePath);

    return {
      file: basename,
      path: filePath.replace(ROOT + /[\\/]/, ""),
      mtime: stats.mtime,
      goal: headers["Goal"] || "(not set)",
      decisions: headers["Decisions taken"] || "",
      openQuestions: headers["Open questions for main chat"] || "",
      handoff: headers["Handoff"] || "",
      fullContent: raw,
    };
  } catch (err) {
    return { file: filePath, error: err.message };
  }
}

function parseTrackerActive() {
  if (!existsSync(TRACKER)) return [];
  const raw = readFileSync(TRACKER, "utf8");
  const activeSection = raw.split("## 🎯")[0].split("## 🟢 Active sessions")[1];
  if (!activeSection) return [];
  const lines = activeSection.split("\n").filter((l) => l.startsWith("|") && !l.includes("---") && !l.includes("Chat"));
  return lines.map((line) => {
    const cells = line.split("|").map((s) => s.trim()).filter(Boolean);
    if (cells.length < 6) return null;
    return {
      chat: cells[0],
      taskId: cells[1],
      started: cells[2],
      eta: cells[3],
      scope: cells[4],
      status: cells[5],
    };
  }).filter(Boolean);
}

function parseTrackerBlockers() {
  if (!existsSync(TRACKER)) return [];
  const raw = readFileSync(TRACKER, "utf8");
  const match = raw.match(/## 🚨 Blockers[^\n]*\n([\s\S]*?)(?=\n## |$)/);
  if (!match) return [];
  const lines = match[1].split("\n").filter((l) => l.startsWith("|") && !l.includes("---") && !l.includes("Blocker"));
  return lines.map((line) => {
    const cells = line.split("|").map((s) => s.trim()).filter(Boolean);
    if (cells.length < 4) return null;
    return {
      blocker: cells[0],
      owner: cells[1],
      blocks: cells[2],
      eta: cells[3],
      resolved: cells[0].startsWith("~~"),
    };
  }).filter(Boolean).filter((b) => !b.resolved);
}

/* ── Rendering ────────────────────────────────────────────── */

function classifyCommit(subject) {
  if (!subject) return { type: "misc", icon: "·" };
  if (subject.startsWith("chore(ext-ops)")) return { type: "external-ops", icon: "🔗" };
  if (subject.startsWith("chore(session)")) return { type: "session", icon: "📓" };
  if (subject.startsWith("feat(")) return { type: "feature", icon: "✨" };
  if (subject.startsWith("fix(")) return { type: "bugfix", icon: "🔧" };
  if (subject.startsWith("ui(")) return { type: "ui-polish", icon: "🎨" };
  if (subject.startsWith("content(")) return { type: "content", icon: "📝" };
  if (subject.startsWith("test(")) return { type: "test", icon: "🧪" };
  if (subject.startsWith("audit(")) return { type: "audit", icon: "🔍" };
  if (subject.startsWith("docs:")) return { type: "docs", icon: "📚" };
  if (subject.startsWith("chore:")) return { type: "chore", icon: "⚙️" };
  return { type: "misc", icon: "·" };
}

function truncate(str, max) {
  const s = String(str || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

async function confirmPull(count) {
  if (AUTO_YES) return true;
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const ans = await rl.question(`${c.cyan}?${c.reset} Pull ${count} commits from origin/master? [Y/n] `);
  rl.close();
  return !/^n(o)?$/i.test(ans.trim());
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    sections: {},
  };

  if (!JSON_OUT) {
    console.log(`${c.bold}📡 Session Sync${c.reset}  ${c.dim}${new Date().toLocaleString("en-GB")}${c.reset}\n`);
  }

  // ── 1. Git status check ──
  const status = gitStatus();
  if (!status.clean && status.files.length > 0) {
    if (!JSON_OUT) {
      console.log(`${c.yellow}⚠  Working tree has uncommitted changes (${status.files.length}):${c.reset}`);
      status.files.slice(0, 5).forEach((f) => console.log(`   ${c.dim}${f}${c.reset}`));
      if (status.files.length > 5) console.log(`   ${c.dim}... and ${status.files.length - 5} more${c.reset}`);
      console.log(`  ${c.dim}Commit or stash before pulling.${c.reset}\n`);
    }
    report.sections.local_dirty = status.files.length;
  }

  // ── 2. Fetch + incoming commits ──
  if (!JSON_OUT) process.stdout.write(`${c.dim}Fetching origin...${c.reset} `);
  const fetchRes = gitExec("fetch origin master 2>&1");
  if (!JSON_OUT) console.log(`${c.green}done${c.reset}`);

  const ahead = getAhead();
  const behind = getBehind();
  report.sections.remote = { ahead_remote: ahead, behind_remote: behind };

  if (!JSON_OUT) {
    if (ahead > 0) {
      console.log(`\n${c.bold}${c.green}⬇  ${ahead} new commit${ahead === 1 ? "" : "s"} on origin/master${c.reset}`);
      const incoming = getIncomingCommits(20);
      incoming.forEach((cm) => {
        const { icon } = classifyCommit(cm.subject);
        console.log(`   ${icon} ${c.dim}${cm.sha}${c.reset} ${c.cyan}${truncate(cm.age, 12).padEnd(12)}${c.reset} ${c.dim}${truncate(cm.author, 20).padEnd(20)}${c.reset} ${truncate(cm.subject, 80)}`);
      });

      if (!NO_PULL && status.clean) {
        const shouldPull = await confirmPull(ahead);
        if (shouldPull) {
          process.stdout.write(`\n${c.dim}Pulling...${c.reset} `);
          const pullRes = gitExec("pull --rebase origin master 2>&1");
          if (typeof pullRes === "string") {
            console.log(`${c.green}success${c.reset}`);
            report.sections.pull_result = "success";
          } else {
            console.log(`${c.red}failed${c.reset}`);
            console.log(`  ${c.dim}${pullRes.error}${c.reset}`);
            report.sections.pull_result = "failed";
          }
        }
      } else if (!NO_PULL && !status.clean) {
        console.log(`\n  ${c.yellow}↳ Not pulling: working tree is dirty. Commit/stash first.${c.reset}`);
      }
    } else if (behind > 0) {
      console.log(`${c.yellow}⬆  Your branch is ahead of origin by ${behind} commit${behind === 1 ? "" : "s"} (push pending).${c.reset}`);
    } else {
      console.log(`${c.green}✓ In sync with origin/master${c.reset}`);
    }
    console.log();
  }

  // ── 3. Active sessions (from TRACKER.md) ──
  const active = parseTrackerActive();
  report.sections.tracker_active = active;
  if (!JSON_OUT) {
    console.log(`${c.bold}🟢 Active sessions (from TRACKER.md)${c.reset}`);
    if (active.length === 0) {
      console.log(`  ${c.dim}(tracker not populated yet or parser miss)${c.reset}\n`);
    } else {
      active.forEach((a) => {
        console.log(`  ${a.chat.padEnd(22)} ${c.cyan}${a.taskId.padEnd(16)}${c.reset} ${c.dim}${a.started}${c.reset}  ${truncate(a.scope, 60)}`);
      });
      console.log();
    }
  }

  // ── 4. Active session scratchpads ──
  let scratchpads = [];
  if (existsSync(ACTIVE_DIR)) {
    const files = readdirSync(ACTIVE_DIR).filter((f) => f.endsWith(".md"));
    scratchpads = files.map((f) => parseSessionFile(join(ACTIVE_DIR, f))).sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
  }
  report.sections.scratchpads = scratchpads;

  if (!JSON_OUT) {
    console.log(`${c.bold}📓 Session scratchpads (docs/sessions/active/)${c.reset}`);
    if (scratchpads.length === 0) {
      console.log(`  ${c.dim}(no active scratchpads yet)${c.reset}\n`);
    } else {
      scratchpads.forEach((sp) => {
        if (sp.error) {
          console.log(`  ${c.red}✗${c.reset} ${sp.file}: ${sp.error}`);
          return;
        }
        const age = sp.mtime ? `${Math.round((Date.now() - sp.mtime.getTime()) / 60000)}m ago` : "?";
        console.log(`  ${c.green}●${c.reset} ${c.bold}${sp.file}${c.reset} ${c.dim}(updated ${age})${c.reset}`);
        if (sp.goal && sp.goal !== "(not set)") {
          console.log(`    ${c.dim}Goal:${c.reset} ${truncate(sp.goal, 100)}`);
        }
        if (sp.openQuestions && sp.openQuestions.trim() && !sp.openQuestions.includes("(any tech questions")) {
          console.log(`    ${c.yellow}? Open questions:${c.reset} ${truncate(sp.openQuestions, 100)}`);
        }
        if (sp.handoff && sp.handoff.trim() && !sp.handoff.includes("- Unblocked tasks:")) {
          console.log(`    ${c.cyan}→ Handoff:${c.reset} ${truncate(sp.handoff, 100)}`);
        }
      });
      console.log();
    }
  }

  // ── 5. Recent commits (filtered by session/chat prefix) ──
  const recent = getRecentCommits(20);
  const grouped = {};
  recent.forEach((cm) => {
    const { type, icon } = classifyCommit(cm.subject);
    if (!grouped[type]) grouped[type] = { icon, commits: [] };
    grouped[type].commits.push(cm);
  });
  report.sections.recent_commits = recent;

  if (!JSON_OUT) {
    console.log(`${c.bold}📜 Recent commits (last 20, grouped by chat type)${c.reset}`);
    const typeOrder = ["external-ops", "session", "feature", "bugfix", "ui-polish", "content", "test", "audit", "docs", "chore", "misc"];
    for (const type of typeOrder) {
      const g = grouped[type];
      if (!g) continue;
      console.log(`  ${g.icon} ${c.bold}${type}${c.reset} ${c.dim}(${g.commits.length})${c.reset}`);
      g.commits.slice(0, 5).forEach((cm) => {
        console.log(`    ${c.dim}${cm.sha}${c.reset} ${c.cyan}${truncate(cm.age, 10).padEnd(10)}${c.reset} ${truncate(cm.subject, 90)}`);
      });
      if (g.commits.length > 5) console.log(`    ${c.dim}... +${g.commits.length - 5} more${c.reset}`);
    }
    console.log();
  }

  // ── 6. Blockers ──
  const blockers = parseTrackerBlockers();
  report.sections.blockers = blockers;
  if (!JSON_OUT) {
    console.log(`${c.bold}🚨 Blockers requiring user action${c.reset}`);
    if (blockers.length === 0) {
      console.log(`  ${c.green}✓ No active blockers${c.reset}\n`);
    } else {
      blockers.forEach((b) => {
        console.log(`  ${c.red}●${c.reset} ${c.bold}${truncate(b.blocker, 50)}${c.reset}`);
        console.log(`    ${c.dim}Owner: ${b.owner}  •  Blocks: ${truncate(b.blocks, 60)}  •  ETA: ${b.eta}${c.reset}`);
      });
      console.log();
    }
  }

  // ── Output mode ──
  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  }
}

async function run() {
  if (WATCH) {
    while (true) {
      console.clear();
      await main();
      console.log(`${c.dim}── Watching (re-run in 60s, Ctrl+C to stop) ──${c.reset}`);
      await new Promise((r) => setTimeout(r, 60000));
    }
  } else {
    await main();
  }
}

run().catch((err) => {
  console.error(`\n${c.red}✗ Session sync failed:${c.reset} ${err.message}`);
  process.exit(1);
});
