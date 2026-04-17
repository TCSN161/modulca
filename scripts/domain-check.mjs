#!/usr/bin/env node
/**
 * Domain Availability Checker
 *
 * Checks a curated list of domains via RDAP (modern WHOIS).
 * - RDAP returns 404 if the domain is NOT registered (= available)
 * - RDAP returns 200 with registration data if it IS registered (= taken)
 * - Uses rdap.org as aggregator (handles TLD routing automatically)
 *
 * Usage:
 *   npm run domains:check           # colored console table
 *   npm run domains:check -- --json # JSON output to domain-report.json
 *
 * No external deps, no registrar login needed. Read-only.
 */

import { writeFileSync } from "node:fs";

const OUTPUT_JSON = process.argv.includes("--json");
const CONCURRENCY = 2; // reduced to be nicer to rdap.org (avoids 429)
const TIMEOUT_MS = 10000;

/* ── Curated domain list ─────────────────────────────────────── */

const DOMAINS = [
  // Tier 1 — Critical (buy now)
  { name: "archicore.eu",       tier: 1, purpose: "Umbrella tech (hidden)",    estEur: 10 },
  { name: "neufertai.eu",       tier: 1, purpose: "AI consultant brand",       estEur: 10 },
  { name: "renderlab.eu",       tier: 1, purpose: "AI render platform",        estEur: 10 },
  { name: "modulca.com",        tier: 1, purpose: "Defensive for ModulCA",     estEur: 12 },
  { name: "crisisready.eu",     tier: 1, purpose: "Crisis mgmt platform",      estEur: 11 },

  // Tier 1 Backups — grab if primary is taken
  { name: "archcore.eu",        tier: "1b", purpose: "Backup: archicore",      estEur: 10 },
  { name: "archgrid.eu",        tier: "1b", purpose: "Backup: archicore",      estEur: 10 },
  { name: "neufert-ai.eu",      tier: "1b", purpose: "Backup: neufertai",      estEur: 10 },
  { name: "archiai.eu",         tier: "1b", purpose: "Backup: neufertai",      estEur: 10 },
  { name: "arcrender.eu",       tier: "1b", purpose: "Backup: renderlab",      estEur: 10 },
  { name: "airender.eu",        tier: "1b", purpose: "Backup: renderlab",      estEur: 10 },
  { name: "rezilient.eu",       tier: "1b", purpose: "Backup: crisisready",    estEur: 10 },
  { name: "saferbuild.eu",      tier: "1b", purpose: "Backup: crisisready",    estEur: 10 },

  // Tier 2 — Important (30-90d window)
  { name: "bunkere.eu",         tier: 2, purpose: "Expansion EU for Bunkere",  estEur: 10 },
  { name: "case-in-copaci.eu",  tier: 2, purpose: "Expansion EU",              estEur: 10 },
  { name: "modulca.ro",         tier: 2, purpose: "RO variant of modulca",     estEur: 10 },
  { name: "crisisready.ro",     tier: 2, purpose: "RO variant crisis",         estEur: 10 },
  { name: "uilabs.eu",          tier: 2, purpose: "UIL brand (future)",        estEur: 10 },

  // Tier 4 — Defensive (only if <€10 and available)
  { name: "neufertai.com",      tier: 4, purpose: "Defensive",                 estEur: 12 },
  { name: "modulca.net",        tier: 4, purpose: "Defensive",                 estEur: 12 },
  { name: "modulca.org",        tier: 4, purpose: "Defensive",                 estEur: 10 },
  { name: "bunkere.com",        tier: 4, purpose: "Defensive",                 estEur: 12 },
  { name: "padureata.eu",       tier: 4, purpose: "Defensive",                 estEur: 10 },

  // Treehouses — EN alternatives for case-in-copaci.eu
  { name: "treehaus.eu",        tier: "th", purpose: "Treehouse brand (EN)",   estEur: 10 },
  { name: "treehouses.eu",      tier: "th", purpose: "Treehouse brand (EN)",   estEur: 10 },
  { name: "treehomes.eu",       tier: "th", purpose: "Treehouse brand (EN)",   estEur: 10 },
  { name: "treeloft.eu",        tier: "th", purpose: "Treehouse brand (EN)",   estEur: 10 },
  { name: "arbore.eu",          tier: "th", purpose: "Tree (Latin/RO pun)",    estEur: 10 },
  { name: "canopy.eu",          tier: "th", purpose: "Canopy — brandable",     estEur: 10 },
  { name: "wildhaus.eu",        tier: "th", purpose: "Off-grid / retreat feel",estEur: 10 },
  { name: "nested.eu",          tier: "th", purpose: "Brandable — nested living", estEur: 10 },
  { name: "arborhaus.eu",       tier: "th", purpose: "Arbor + haus",           estEur: 10 },
  { name: "canopyhaus.eu",      tier: "th", purpose: "Canopy + haus",          estEur: 10 },

  // Authentic German for "treehouse" = Baumhaus
  { name: "baumhaus.eu",        tier: "th", purpose: "Baumhaus (auth. DE)",    estEur: 10 },
  { name: "baumhaus.ro",        tier: "th", purpose: "Baumhaus RO",            estEur: 12 },
  { name: "das-baumhaus.eu",    tier: "th", purpose: "'The Treehouse' DE",     estEur: 10 },
  { name: "neo-baumhaus.eu",    tier: "th", purpose: "Modern Baumhaus",        estEur: 10 },
  { name: "mein-baumhaus.eu",   tier: "th", purpose: "'My Treehouse' DE",      estEur: 10 },

  // .ai TLD options for AI brands (expensive ~$80-100/an)
  { name: "archi.ai",           tier: "ai", purpose: ".ai premium TLD",        estEur: 85 },
  { name: "neufert.ai",         tier: "ai", purpose: ".ai for NeufertAI",      estEur: 85 },
  { name: "render.ai",          tier: "ai", purpose: ".ai for RenderLab",      estEur: 85 },
  { name: "crisis.ai",          tier: "ai", purpose: ".ai for CrisisReady",    estEur: 85 },
];

/* ── RDAP check ──────────────────────────────────────────────── */

async function rdap(name, attempt = 1) {
  const url = `https://rdap.org/domain/${name}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);

    if (res.status === 404) return { status: "available" };
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const expiry = data?.events?.find((e) => e.eventAction === "expiration")?.eventDate;
      const registrar = data?.entities?.find((e) => e.roles?.includes("registrar"))?.vcardArray?.[1]?.find((f) => f[0] === "fn")?.[3];
      return { status: "taken", expiry, registrar };
    }
    if (res.status === 429) {
      // Rate limited — exponential backoff + retry up to 3 times
      if (attempt <= 3) {
        const wait = 2000 * attempt;
        await new Promise((r) => setTimeout(r, wait));
        return rdap(name, attempt + 1);
      }
      return { status: "rate-limited" };
    }
    return { status: "unknown", code: res.status };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") return { status: "timeout" };
    return { status: "error", error: err.message };
  }
}

/* ── Run with concurrency cap ────────────────────────────────── */

async function runBatched(items, handler, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await handler(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

/* ── Pretty output ───────────────────────────────────────────── */

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", magenta: "\x1b[35m",
};

function statusIcon(s) {
  if (s === "available") return `${c.green}✓ LIBER  ${c.reset}`;
  if (s === "taken")     return `${c.red}✗ LUAT   ${c.reset}`;
  if (s === "timeout")   return `${c.yellow}⏱ TIMEOUT${c.reset}`;
  if (s === "rate-limited") return `${c.yellow}⚠ LIMIT  ${c.reset}`;
  if (s === "error")     return `${c.yellow}⚠ EROARE ${c.reset}`;
  return `${c.dim}? NECUN. ${c.reset}`;
}

function tierLabel(t) {
  if (t === 1)    return `${c.red}T1${c.reset}`;
  if (t === "1b") return `${c.magenta}1b${c.reset}`;
  if (t === 2)    return `${c.yellow}T2${c.reset}`;
  if (t === 4)    return `${c.dim}T4${c.reset}`;
  return String(t);
}

/* ── Main ────────────────────────────────────────────────────── */

async function main() {
  console.log(`${c.bold}🌐 Domain Availability Check${c.reset} — ${DOMAINS.length} domains\n`);
  console.log(`${c.dim}(via rdap.org aggregator; may take ~30-60s)${c.reset}\n`);

  const startTs = Date.now();
  const results = await runBatched(DOMAINS, async (d) => {
    const check = await rdap(d.name);
    return { ...d, ...check };
  }, CONCURRENCY);

  // Print table
  console.log(`${c.bold}${"Tier".padEnd(4)} ${"Domeniu".padEnd(26)} ${"Status".padEnd(12)} ${"€/an".padEnd(6)} Scop${c.reset}`);
  console.log(c.dim + "─".repeat(90) + c.reset);

  let tier = null;
  for (const r of results) {
    if (r.tier !== tier) {
      tier = r.tier;
      console.log();
    }
    const status = statusIcon(r.status);
    const expiry = r.expiry ? ` ${c.dim}(exp. ${r.expiry.split("T")[0]})${c.reset}` : "";
    console.log(
      `${tierLabel(r.tier).padEnd(4)} ${r.name.padEnd(26)} ${status}  €${String(r.estEur).padEnd(4)} ${r.purpose}${expiry}`
    );
  }

  // Summary
  const avail = results.filter((r) => r.status === "available");
  const taken = results.filter((r) => r.status === "taken");
  const other = results.filter((r) => !["available", "taken"].includes(r.status));

  console.log(`\n${c.bold}Rezumat:${c.reset}`);
  console.log(`  ${c.green}✓ Libere:${c.reset} ${avail.length}/${results.length}`);
  console.log(`  ${c.red}✗ Luate:${c.reset}  ${taken.length}/${results.length}`);
  if (other.length) console.log(`  ${c.yellow}? Alt status:${c.reset} ${other.length}/${results.length}`);

  const criticalAvail = avail.filter((r) => r.tier === 1);
  const criticalTaken = taken.filter((r) => r.tier === 1);
  const t1bAvail = avail.filter((r) => r.tier === "1b");

  console.log(`\n${c.bold}Acțiuni recomandate:${c.reset}`);
  if (criticalAvail.length) {
    const sum = criticalAvail.reduce((s, r) => s + r.estEur, 0);
    console.log(`  ${c.green}→ Cumpără ACUM ${criticalAvail.length} Tier-1 LIBER(E) (~€${sum}/an):${c.reset}`);
    for (const r of criticalAvail) console.log(`     • ${r.name} ${c.dim}(${r.purpose})${c.reset}`);
  }
  if (criticalTaken.length) {
    console.log(`  ${c.yellow}→ Folosește BACKUP pentru ${criticalTaken.length} Tier-1 LUAT(E):${c.reset}`);
    for (const r of criticalTaken) {
      const backups = t1bAvail.filter((b) => b.purpose.toLowerCase().includes(r.name.split(".")[0]) || b.purpose.includes(r.name));
      const backupList = backups.map((b) => b.name).join(", ") || "(verifică manual backupurile din listă)";
      console.log(`     • ${r.name} → alternative libere: ${backupList}`);
    }
  }
  const t4Avail = avail.filter((r) => r.tier === 4);
  if (t4Avail.length) {
    const sum = t4Avail.reduce((s, r) => s + r.estEur, 0);
    console.log(`  ${c.dim}→ Defensive (opțional, €${sum} total): ${t4Avail.map((r) => r.name).join(", ")}${c.reset}`);
  }

  console.log(`\n${c.dim}Durată: ${((Date.now() - startTs) / 1000).toFixed(1)}s${c.reset}`);
  console.log(`${c.dim}Registrar recomandat: Namecheap (internațional) + RoTLD direct (pt .ro)${c.reset}`);

  if (OUTPUT_JSON) {
    writeFileSync("domain-report.json", JSON.stringify(results, null, 2));
    console.log(`\n${c.green}✓${c.reset} Scris: domain-report.json`);
  }
}

main().catch((err) => {
  console.error(`\n${c.red}✗ Failed:${c.reset}`, err);
  process.exit(1);
});
