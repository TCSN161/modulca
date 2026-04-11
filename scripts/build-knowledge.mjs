#!/usr/bin/env node
/**
 * Knowledge Library Build Script
 *
 * Scans src/knowledge/ for .md files and _meta.yaml files,
 * parses YAML frontmatter, and generates src/knowledge/_index.ts
 * with all article metadata and region data.
 *
 * Run: node scripts/build-knowledge.mjs
 * Or add to package.json: "prebuild": "node scripts/build-knowledge.mjs"
 *
 * MODULAR: Add a folder or .md file → re-run → auto-indexed.
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs";
import { join, relative, basename, extname } from "path";

const KNOWLEDGE_DIR = join(process.cwd(), "src", "knowledge");
const OUTPUT_FILE = join(KNOWLEDGE_DIR, "_index.ts");
const REGULATIONS_DIR = join(KNOWLEDGE_DIR, "06-regulations");

/* ------------------------------------------------------------------ */
/*  YAML & Frontmatter Parsing (no external deps)                      */
/* ------------------------------------------------------------------ */

/**
 * Minimal YAML parser — handles the subset we use in frontmatter.
 * Supports: strings, numbers, booleans, arrays (inline and indented), null.
 */
function parseSimpleYaml(text) {
  const result = {};
  const lines = text.split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Skip comments and empty lines
    if (!line || line.startsWith("#")) continue;

    // Array item (indented with "- ")
    const arrayMatch = line.match(/^\s+-\s+(.+)/);
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = [];
        result[currentKey] = currentArray;
      }
      currentArray.push(parseYamlValue(arrayMatch[1].trim()));
      continue;
    }

    // Key-value pair
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const rawVal = kvMatch[2].trim();

      // Inline array: [a, b, c]
      if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
        const items = rawVal
          .slice(1, -1)
          .split(",")
          .map((s) => parseYamlValue(s.trim()));
        result[currentKey] = items;
        currentArray = null;
      } else if (rawVal === "" || rawVal === "[]") {
        // Value will come as indented array items, or empty
        currentArray = [];
        result[currentKey] = currentArray;
      } else {
        result[currentKey] = parseYamlValue(rawVal);
        currentArray = null;
      }
    }
  }

  return result;
}

function parseYamlValue(val) {
  if (!val) return "";
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null" || val === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
}

/**
 * Parse Markdown file with YAML frontmatter (--- delimited).
 */
function parseFrontmatter(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!fmMatch) {
    console.warn(`  ⚠ No frontmatter in ${filePath}`);
    return null;
  }
  const meta = parseSimpleYaml(fmMatch[1]);
  const content = fmMatch[2].trim();
  return { meta, content };
}

/* ------------------------------------------------------------------ */
/*  Directory Scanning                                                  */
/* ------------------------------------------------------------------ */

function scanMarkdownFiles(dir, basePath = KNOWLEDGE_DIR) {
  const results = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir)) {
    // Skip _template, _registry, _types, _taxonomy, _index files
    // But allow _shared (EU-wide regulation articles)
    if (entry.startsWith("_") && entry !== "_shared") continue;

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...scanMarkdownFiles(fullPath, basePath));
    } else if (extname(entry) === ".md") {
      const parsed = parseFrontmatter(fullPath);
      if (parsed) {
        results.push({
          ...parsed,
          filePath: relative(basePath, fullPath).replace(/\\/g, "/"),
        });
      }
    }
  }
  return results;
}

function scanRegionMetas() {
  const regions = [];
  if (!existsSync(REGULATIONS_DIR)) return regions;

  for (const entry of readdirSync(REGULATIONS_DIR)) {
    if (entry.startsWith("_")) continue; // Skip _shared, _template, _registry

    const dirPath = join(REGULATIONS_DIR, entry);
    if (!statSync(dirPath).isDirectory()) continue;

    const metaPath = join(dirPath, "_meta.yaml");
    if (!existsSync(metaPath)) {
      console.warn(`  ⚠ No _meta.yaml in ${entry}/`);
      continue;
    }

    const yaml = parseSimpleYaml(readFileSync(metaPath, "utf-8"));

    // Count articles in this region
    const articleCount = readdirSync(dirPath).filter(
      (f) => extname(f) === ".md"
    ).length;

    regions.push({
      name: yaml.name || entry,
      code: yaml.code || entry,
      flag: yaml.flag || "",
      language: yaml.language || "en",
      status: yaml.status || "planned",
      market: yaml.market || "future",
      currency: yaml.currency || "EUR",
      standardsBody: yaml.standards_body || "",
      keyLegislation: yaml.key_legislation || [],
      articleCount,
    });
  }

  return regions;
}

function scanCategories() {
  const categories = [];
  for (const entry of readdirSync(KNOWLEDGE_DIR)) {
    const fullPath = join(KNOWLEDGE_DIR, entry);
    if (!statSync(fullPath).isDirectory()) continue;
    if (entry.startsWith("_")) continue;

    const match = entry.match(/^(\d+)-(.+)/);
    if (!match) continue;

    const order = parseInt(match[1], 10);
    const id = match[2];

    // Count .md files recursively
    const articles = scanMarkdownFiles(fullPath);

    categories.push({
      id,
      folderName: entry,
      order,
      articleCount: articles.length,
      hasRegions: id === "regulations",
    });
  }

  return categories.sort((a, b) => a.order - b.order);
}

/* ------------------------------------------------------------------ */
/*  Code Generation                                                    */
/* ------------------------------------------------------------------ */

function generateIndex(articles, regions, categories) {
  const articleMetas = articles.map(({ meta, filePath }) => ({
    id: meta.id || basename(filePath, ".md"),
    title: meta.title || "",
    category: meta.category || "",
    tags: meta.tags || [],
    sources: meta.sources || [],
    difficulty: meta.difficulty || "beginner",
    lastUpdated: meta.lastUpdated || "",
    proOnly: meta.proOnly || false,
    relatedArticles: meta.relatedArticles || [],
    region: meta.region || undefined,
    regionScope: meta.regionScope || undefined,
    filePath,
  }));

  const code = `/**
 * AUTO-GENERATED — Do not edit manually.
 * Generated by: node scripts/build-knowledge.mjs
 * Generated at: ${new Date().toISOString()}
 *
 * This index contains metadata for all knowledge base articles.
 * Article content is loaded on-demand from .md files.
 */

import type { KBDocumentMeta, KBRegion, KBCategory, KBIndex } from "./_types";

/* ------------------------------------------------------------------ */
/*  Article Metadata                                                   */
/* ------------------------------------------------------------------ */

export const ARTICLES: KBDocumentMeta[] = ${JSON.stringify(articleMetas, null, 2)};

/* ------------------------------------------------------------------ */
/*  Regions                                                            */
/* ------------------------------------------------------------------ */

export const REGIONS: KBRegion[] = ${JSON.stringify(regions, null, 2)};

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export const CATEGORIES: KBCategory[] = ${JSON.stringify(
    categories.map((c) => ({
      id: c.id,
      label: c.id, // Will be enriched by _taxonomy.ts at runtime
      icon: "",
      order: c.order,
      articleCount: c.articleCount,
      hasRegions: c.hasRegions,
    })),
    null,
    2
  )};

/* ------------------------------------------------------------------ */
/*  Full Index                                                         */
/* ------------------------------------------------------------------ */

export const KB_INDEX: KBIndex = {
  categories: CATEGORIES,
  regions: REGIONS,
  articles: ARTICLES,
  sources: [], // TODO: populate from sources/ directory
  generatedAt: "${new Date().toISOString()}",
  totalArticles: ${articleMetas.length},
};

/* ------------------------------------------------------------------ */
/*  Lookup Helpers                                                     */
/* ------------------------------------------------------------------ */

/** Get articles by category */
export function getArticlesByCategory(categoryId: string): KBDocumentMeta[] {
  return ARTICLES.filter((a) => a.category === categoryId);
}

/** Get articles by region code */
export function getArticlesByRegion(regionCode: string): KBDocumentMeta[] {
  return ARTICLES.filter((a) => a.region === regionCode);
}

/** Get articles by tag */
export function getArticlesByTag(tag: string): KBDocumentMeta[] {
  return ARTICLES.filter((a) => a.tags.includes(tag));
}

/** Search articles by keyword in title and tags */
export function searchArticles(query: string): KBDocumentMeta[] {
  const q = query.toLowerCase();
  return ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

/** Get article by ID */
export function getArticleById(id: string): KBDocumentMeta | undefined {
  return ARTICLES.find((a) => a.id === id);
}
`;

  return code;
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

console.log("📚 Building knowledge library index...\n");

const categories = scanCategories();
console.log(`  Found ${categories.length} categories:`);
for (const c of categories) {
  console.log(`    ${String(c.order).padStart(2, "0")}. ${c.id} (${c.articleCount} articles)`);
}

const regions = scanRegionMetas();
console.log(`\n  Found ${regions.length} regions:`);
for (const r of regions) {
  console.log(`    ${r.flag} ${r.name} (${r.code}) — ${r.status}, ${r.articleCount} articles`);
}

const articles = scanMarkdownFiles(KNOWLEDGE_DIR);
console.log(`\n  Total articles: ${articles.length}`);

const indexCode = generateIndex(articles, regions, categories);
writeFileSync(OUTPUT_FILE, indexCode, "utf-8");
console.log(`\n  ✅ Generated ${OUTPUT_FILE}`);
console.log("📚 Done!\n");
