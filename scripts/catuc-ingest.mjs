#!/usr/bin/env node
/**
 * CATUC Ingest — pulls Q&A JSON from NotebookLM (manual export by user)
 * and generates `.new.md` siblings for Phase 2 content rewrite.
 *
 * Usage:
 *   node scripts/catuc-ingest.mjs <qa-json-path>
 *
 * Input JSON format (produce manually from NotebookLM chat):
 * {
 *   "notebookName": "CATUC 169/2026",
 *   "exportedAt": "2026-11-21",
 *   "queries": [
 *     {
 *       "id": "Q1",
 *       "question": "Full verbatim text of CATUC articles 294-299",
 *       "answer": "Art. 294 ... [RO legal text] ...",
 *       "citations": ["catuc-169-2026-text.md:p.123", "..."]
 *     },
 *     ...
 *   ]
 * }
 *
 * Output:
 *   - docs/research/YYYY-MM-DD-notebooklm-catuc-answers.md (consolidated)
 *   - src/knowledge/06-regulations/RO/catuc-169-2026.new.md (new chapter stub)
 *   - Updates article-mapping table in MCA-SPEC-CATUC-PHASE2-PLAN.md
 *
 * Phase 2 task: once answers are ingested, Claude/DeepSeek completes
 * the `.new.md` siblings for F2, F3, F4, F6, F9, F10 using this content.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const [, , qaPath] = process.argv;
if (!qaPath) {
  console.error("Usage: node scripts/catuc-ingest.mjs <qa-json-path>");
  process.exit(1);
}

const abs = resolve(qaPath);
if (!existsSync(abs)) {
  console.error(`File not found: ${abs}`);
  process.exit(1);
}

const qa = JSON.parse(readFileSync(abs, "utf-8"));

if (!qa.queries || !Array.isArray(qa.queries)) {
  console.error('Invalid JSON: expected "queries" array');
  process.exit(1);
}

console.log(`📘 Ingesting ${qa.queries.length} queries from "${qa.notebookName}"`);

/* ── 1. Consolidated Q&A markdown ──────────────────────────────────── */

const today = new Date().toISOString().slice(0, 10);
const consolidatedPath = resolve(ROOT, "docs", "research", `${today}-notebooklm-catuc-answers.md`);

const consolidated = [
  `# NotebookLM CATUC Answers — ${qa.notebookName}`,
  "",
  `**Exported**: ${qa.exportedAt || today}  `,
  `**Queries**: ${qa.queries.length}  `,
  `**Source**: ${qa.notebookName} notebook (CATUC MD + JSON + PDF)`,
  "",
  "---",
  "",
  ...qa.queries.flatMap((q) => [
    `## ${q.id} — ${q.question.slice(0, 100)}${q.question.length > 100 ? "..." : ""}`,
    "",
    "### Question",
    q.question,
    "",
    "### Answer (from NotebookLM)",
    q.answer || "_(empty)_",
    "",
    q.citations && q.citations.length > 0
      ? "### Citations\n" + q.citations.map((c) => `- ${c}`).join("\n") + "\n"
      : "",
    "---",
    "",
  ]),
].join("\n");

writeFileSync(consolidatedPath, consolidated);
console.log(`✅ Consolidated: ${consolidatedPath}`);

/* ── 2. CATUC chapter stub ─────────────────────────────────────────── */

const catucChapterPath = resolve(
  ROOT,
  "src",
  "knowledge",
  "06-regulations",
  "RO",
  "catuc-169-2026.new.md"
);

const catucChapter = `---
id: "catuc-169-2026"
title: "CATUC — Codul Amenajării Teritoriului, Urbanismului și Construcțiilor"
category: "regulations"
region: "RO"
tags: ["catuc", "autorizare", "urbanism", "notificare"]
sources: ["Legea 169/2026 (CATUC)", "Monitorul Oficial 661/10.08.2026", "Ministerul Dezvoltării — Clarificări CATUC 2026"]
difficulty: "intermediate"
lastUpdated: "${today}"
proOnly: false
status: "draft-awaiting-vlad-review"
---

# CATUC — Codul Amenajării Teritoriului, Urbanismului și Construcțiilor (Legea 169/2026)

> **⚠️ Draft**: generated ${today} from NotebookLM. Pending review by Arh. Vlad Ioniță before deploy.

## 1. Context

CATUC (Legea 169/2026) a intrat în vigoare la 25.08.2026, consolidând și
înlocuind Legea 50/1991 (autorizarea construcțiilor) și Legea 350/2001
(amenajarea teritoriului și urbanismul). Clasificarea procedurilor:

- **Autorizație** (art. 285-293) — regimul general
- **Notificare** (art. 294-298) — pentru clădiri mici (P/D+P ≤ 150m²)
- **Fără formalități** (art. 299) — anexe ≤ 20m² rural

## 2. Articole-cheie pentru construcție modulară

${
  qa.queries
    .filter(
      (q) =>
        q.question.toLowerCase().includes("art") ||
        q.question.toLowerCase().includes("notification") ||
        q.question.toLowerCase().includes("modular")
    )
    .map((q) => `### ${q.id}\n**Q**: ${q.question}\n\n**A**: ${q.answer}\n`)
    .join("\n\n") || "_(NotebookLM Q&A will be integrated here after Phase 2 kickoff)_"
}

## 3. TBD — needs Vlad Ioniță review

- Transitory provisions for Legea 50/1991 projects in progress on 25.08.2026
- Articles 415, 524 (flagged as parse-issue in catuc-169-2026-articole.json)
- Norme metodologice publication status

---

*This file is a \`.new.md\` draft. Deploy only after Vlad review per MCA-SPEC-CATUC-PHASE2-PLAN §Deploy Gate.*
`;

writeFileSync(catucChapterPath, catucChapter);
console.log(`✅ Chapter stub: ${catucChapterPath}`);

/* ── 3. Report ─────────────────────────────────────────────────────── */

console.log("");
console.log("━".repeat(60));
console.log(`📊 Phase 2 Ingest Summary`);
console.log(`   Queries processed: ${qa.queries.length}`);
console.log(`   Articles referenced: ${qa.queries.filter((q) => q.answer && q.answer.includes("art.")).length}`);
console.log("");
console.log("Next steps:");
console.log("  1. Review docs/research/*.md consolidated file");
console.log("  2. Review src/knowledge/.../catuc-169-2026.new.md chapter");
console.log("  3. Update MCA-SPEC-CATUC-PHASE2-PLAN §4 article mapping table");
console.log("  4. Run DeepSeek/Claude to fill F2, F3, F4, F9, F10 .new.md siblings");
console.log("  5. Send to Vlad Ioniță for legal review");
console.log("  6. mv .new.md → .md after sign-off");
console.log("━".repeat(60));
