#!/usr/bin/env node
/**
 * One-off migration: replace `console.log` / `console.info` in server-side
 * API route files with the dev-only `devLog` helper.
 * Leaves `console.error` / `console.warn` alone — those are real signals.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";

// Files to migrate (excluded: stripe webhook — keeps audit-trail logs)
const TARGETS = [
  "src/app/api/ai-render/route.ts",
  "src/app/api/ai-render/compare/route.ts",
  "src/app/api/ai-render/upscale/route.ts",
  "src/app/api/consultant/route.ts",
  "src/app/api/ai-render/engines/aihorde.ts",
  "src/app/api/ai-render/engines/blackforest.ts",
  "src/app/api/ai-render/engines/cloudflare.ts",
  "src/app/api/ai-render/engines/deepinfra.ts",
  "src/app/api/ai-render/engines/fal.ts",
  "src/app/api/ai-render/engines/fireworks.ts",
  "src/app/api/ai-render/engines/gemini.ts",
  "src/app/api/ai-render/engines/huggingface.ts",
  "src/app/api/ai-render/engines/leonardo.ts",
  "src/app/api/ai-render/engines/novita.ts",
  "src/app/api/ai-render/engines/openai.ts",
  "src/app/api/ai-render/engines/pollinations.ts",
  "src/app/api/ai-render/engines/prodia.ts",
  "src/app/api/ai-render/engines/replicate.ts",
  "src/app/api/ai-render/engines/runway.ts",
  "src/app/api/ai-render/engines/segmind.ts",
  "src/app/api/ai-render/engines/stability.ts",
  "src/app/api/ai-render/engines/together.ts",
  "src/app/api/ai-render/engines/wavespeed.ts",
];

let totalReplacements = 0;
let filesChanged = 0;

for (const file of TARGETS) {
  let content;
  try {
    content = readFileSync(file, "utf-8");
  } catch {
    console.log(`  skip (missing): ${file}`);
    continue;
  }

  const before = content;

  // Replace console.log / console.info with devLog / devInfo
  content = content.replace(/\bconsole\.log\(/g, "devLog(");
  content = content.replace(/\bconsole\.info\(/g, "devInfo(");

  const replacements = (before.match(/\bconsole\.(log|info)\(/g) || []).length;
  if (replacements === 0) {
    continue;
  }

  // Add import if missing and if we actually changed something
  const usesDevLog = /\bdevLog\(/.test(content);
  const usesDevInfo = /\bdevInfo\(/.test(content);
  const needs = [];
  if (usesDevLog) needs.push("devLog");
  if (usesDevInfo) needs.push("devInfo");

  const hasImport = /from\s+["']@\/shared\/lib\/devLog["']/.test(content);
  if (!hasImport && needs.length > 0) {
    const importLine = `import { ${needs.join(", ")} } from "@/shared/lib/devLog";\n`;

    // Insert after the last existing import at the top of the file
    const importRegex = /^(import\s+.*?;\s*\n)+/m;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match) => match + importLine);
    } else {
      content = importLine + content;
    }
  }

  writeFileSync(file, content, "utf-8");
  totalReplacements += replacements;
  filesChanged++;
  console.log(`  ✓ ${file} — ${replacements} replacements`);
}

console.log(`\nDone: ${filesChanged} files, ${totalReplacements} replacements.`);
