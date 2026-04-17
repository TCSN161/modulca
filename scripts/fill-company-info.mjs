#!/usr/bin/env node
/**
 * ModulCA — Company Info Filler
 *
 * Interactive (or --env-driven) script that replaces the "[COMPANY NAME]"
 * placeholders in Privacy Policy and Terms of Service with real company
 * details once you register the company in Romania.
 *
 * Usage:
 *   # Interactive mode (prompts for each field)
 *   node scripts/fill-company-info.mjs
 *
 *   # Non-interactive (from env vars)
 *   MODULCA_COMPANY_NAME="ModulCA SRL" \
 *   MODULCA_COMPANY_ADDRESS="Str. Example 5, Bucharest, Romania" \
 *   MODULCA_ONRC="J40/12345/2026" \
 *   MODULCA_CUI="RO45678901" \
 *   node scripts/fill-company-info.mjs --non-interactive
 *
 * What it updates:
 *   src/app/(app)/privacy/page.tsx
 *   src/app/(app)/terms/page.tsx
 *
 * Safe to run multiple times — uses explicit placeholder strings as markers
 * and will only replace if the placeholder is still present.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FILES = [
  join(ROOT, "src", "app", "(app)", "privacy", "page.tsx"),
  join(ROOT, "src", "app", "(app)", "terms", "page.tsx"),
];

const FIELDS = [
  {
    key: "company_name",
    envVar: "MODULCA_COMPANY_NAME",
    prompt: "Company name (e.g., 'ModulCA SRL')",
    placeholder: "[COMPANY NAME] SRL",
    required: true,
  },
  {
    key: "address",
    envVar: "MODULCA_COMPANY_ADDRESS",
    prompt: "Registered address (e.g., 'Str. Example 5, Bucharest, Romania')",
    placeholder: "[STREET, Bucharest, Romania]",
    required: true,
  },
  {
    key: "onrc",
    envVar: "MODULCA_ONRC",
    prompt: "ONRC / Company registration (e.g., 'J40/12345/2026')",
    placeholder: "J[XX/XXXXX/YYYY]",
    required: true,
  },
  {
    key: "cui",
    envVar: "MODULCA_CUI",
    prompt: "CUI / VAT number (e.g., 'RO45678901')",
    placeholder: "RO[XXXXXXXX]",
    required: true,
  },
];

async function promptField(rl, field) {
  const envValue = process.env[field.envVar];
  if (envValue) return envValue;

  let value = "";
  while (!value) {
    value = (await rl.question(`➤ ${field.prompt}: `)).trim();
    if (!value && field.required) {
      console.log("  (required)");
    }
  }
  return value;
}

async function main() {
  const nonInteractive = process.argv.includes("--non-interactive");

  console.log("\n🏢 ModulCA Company Info Filler");
  console.log("   Fills [COMPANY NAME] placeholders in Privacy + Terms\n");

  const values = {};

  if (nonInteractive) {
    for (const field of FIELDS) {
      const v = process.env[field.envVar];
      if (!v && field.required) {
        console.error(`✗ Missing env var ${field.envVar}`);
        process.exit(1);
      }
      values[field.key] = v;
    }
  } else {
    const rl = createInterface({ input, output });
    for (const field of FIELDS) {
      values[field.key] = await promptField(rl, field);
    }
    rl.close();
  }

  console.log("\n📋 Using values:");
  Object.entries(values).forEach(([k, v]) => console.log(`   ${k.padEnd(14)} ${v}`));
  console.log();

  let totalReplacements = 0;

  for (const filePath of FILES) {
    let content;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      console.warn(`⚠  Skipping ${filePath} — not found`);
      continue;
    }

    const original = content;
    let fileReplacements = 0;

    for (const field of FIELDS) {
      // Replace all occurrences of this placeholder
      const before = content;
      content = content.split(field.placeholder).join(values[field.key]);
      if (content !== before) {
        fileReplacements++;
      }
    }

    // Also remove the italicized "(to be filled before public launch)" note
    const note = '<em className="text-brand-gray/70">(to be filled before public launch)</em>';
    if (content.includes(note)) {
      content = content.split(note).join("");
      fileReplacements++;
    }

    if (content !== original) {
      writeFileSync(filePath, content);
      console.log(`✓ Updated ${filePath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}  (${fileReplacements} replacements)`);
      totalReplacements += fileReplacements;
    } else {
      console.log(`⏭  ${filePath.replace(ROOT + "\\", "")} — no placeholders found (already filled?)`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Total replacements: ${totalReplacements}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (totalReplacements > 0) {
    console.log("✓ Done. Next steps:");
    console.log("   1. Review the diff:  git diff src/app/\\(app\\)/privacy src/app/\\(app\\)/terms");
    console.log("   2. Build + test:     npm run build");
    console.log("   3. Commit + push:    git commit -am 'Add company legal info'\n");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
