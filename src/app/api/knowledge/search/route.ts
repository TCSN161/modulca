import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { ARTICLES } from "@/knowledge/_index";

export const dynamic = "force-dynamic";

/**
 * Full-text Knowledge Search API
 *
 * GET /api/knowledge/search?q=kitchen+dimensions&tier=free&limit=10
 *
 * Search modes by tier:
 *   Free     → title + tags only
 *   Premium  → title + tags + body content
 *   Architect → title + tags + body content (same, future: semantic/vector)
 *
 * Scoring: title match (10x) > tag match (5x) > body match (1x)
 * Results sorted by relevance score, capped at `limit`.
 */

const KB_ROOT = join(process.cwd(), "src", "knowledge");

/* ── Build-time body index (lazy, cached) ─────────────────── */

let bodyIndex: Map<string, string> | null = null;

async function getBodyIndex(): Promise<Map<string, string>> {
  if (bodyIndex) return bodyIndex;
  bodyIndex = new Map();
  const loadPromises = ARTICLES.filter((a) => a.filePath).map(async (a) => {
    try {
      const raw = await readFile(join(KB_ROOT, a.filePath!), "utf-8");
      const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      const content = match ? match[1].trim() : raw.trim();
      bodyIndex!.set(a.id, content.toLowerCase());
    } catch {
      /* skip unreadable files */
    }
  });
  await Promise.all(loadPromises);
  return bodyIndex;
}

/* ── Scoring ──────────────────────────────────────────────── */

interface SearchResult {
  id: string;
  title: string;
  category: string;
  tags: string[];
  difficulty: string;
  region?: string;
  proOnly: boolean;
  score: number;
  /** Snippet from body (first match + surrounding context) */
  snippet?: string;
}

function extractSnippet(body: string, queryLower: string, maxLen = 160): string {
  const pos = body.indexOf(queryLower);
  if (pos === -1) return "";
  const start = Math.max(0, pos - 60);
  const end = Math.min(body.length, pos + queryLower.length + 100);
  let snippet = body.slice(start, end).replace(/\n/g, " ").trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < body.length) snippet = snippet + "…";
  return snippet.slice(0, maxLen);
}

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const tier = searchParams.get("tier") || "free";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters", results: [] }, { status: 400 });
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1);

  // Determine if we do full-text search (Premium+) or just metadata (Free)
  const fullText = tier !== "free";
  const bodies = fullText ? await getBodyIndex() : null;

  const results: SearchResult[] = [];

  for (const article of ARTICLES) {
    let score = 0;
    let snippet: string | undefined;

    const titleLower = article.title.toLowerCase();
    const tagsJoined = article.tags.join(" ").toLowerCase();

    // Title scoring (highest weight)
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 10;
    }
    // Exact title phrase match bonus
    if (titleLower.includes(queryLower)) score += 15;

    // Tag scoring
    for (const word of queryWords) {
      if (tagsJoined.includes(word)) score += 5;
    }

    // Body scoring (Premium+ only)
    if (bodies && article.filePath) {
      const body = bodies.get(article.id);
      if (body) {
        for (const word of queryWords) {
          // Count occurrences (capped at 5 for scoring)
          const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          const matches = body.match(regex);
          if (matches) {
            score += Math.min(matches.length, 5);
          }
        }
        // Extract snippet around first match
        if (score > 0) {
          snippet = extractSnippet(body, queryWords[0]);
        }
      }
    }

    if (score > 0) {
      results.push({
        id: article.id,
        title: article.title,
        category: article.category,
        tags: article.tags,
        difficulty: article.difficulty,
        region: article.region,
        proOnly: article.proOnly,
        score,
        snippet,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    query,
    tier,
    fullText,
    total: results.length,
    results: results.slice(0, limit),
  });
  } catch (err) {
    console.error("[knowledge/search] Unhandled error:", err);
    return NextResponse.json(
      { error: "Search request failed.", results: [] },
      { status: 500 }
    );
  }
}
