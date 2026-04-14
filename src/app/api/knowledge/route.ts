import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { ARTICLES } from "@/knowledge/_index";

export const dynamic = "force-dynamic";

/**
 * Knowledge article content API.
 * Returns the markdown content of an article by ID.
 * Tier-gated: free users get truncated content, Premium/Architect get full.
 * Tracks article view counts in memory for popular articles.
 */

const KB_ROOT = join(process.cwd(), "src", "knowledge");

/* ------------------------------------------------------------------ */
/*  In-memory view counter                                             */
/* ------------------------------------------------------------------ */

const viewCounts = new Map<string, number>();

function trackView(articleId: string) {
  viewCounts.set(articleId, (viewCounts.get(articleId) || 0) + 1);
}

/** Top N articles by view count */
export function getPopularArticles(n = 10): { id: string; views: number }[] {
  return [...viewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id, views]) => ({ id, views }));
}

const TIER_LIMITS: Record<string, number> = {
  free: 800,       // ~first section only
  premium: 0,      // 0 = no limit
  architect: 0,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("id");
  const tier = searchParams.get("tier") || "free";

  if (!articleId) {
    return NextResponse.json({ error: "Article ID required" }, { status: 400 });
  }

  const article = ARTICLES.find((a) => a.id === articleId);
  if (!article || !article.filePath) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Pro-only articles require premium+
  if (article.proOnly && tier === "free") {
    return NextResponse.json({
      error: "Premium required",
      title: article.title,
      preview: "This article is available for Premium and Architect subscribers.",
    }, { status: 403 });
  }

  try {
    const fullPath = join(KB_ROOT, article.filePath);
    const raw = await readFile(fullPath, "utf-8");

    // Strip YAML frontmatter
    const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    let content = match ? match[1].trim() : raw.trim();

    // Apply tier limit
    const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
    const truncated = limit > 0 && content.length > limit;
    if (truncated) {
      // Cut at a paragraph boundary
      const cutContent = content.slice(0, limit);
      const lastPara = cutContent.lastIndexOf("\n\n");
      content = (lastPara > 0 ? cutContent.slice(0, lastPara) : cutContent) +
        "\n\n---\n\n*Upgrade to Premium for the full article.*";
    }

    // Track view
    trackView(articleId);

    // Reading time estimate (~200 words/min)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    return NextResponse.json({
      id: article.id,
      title: article.title,
      content,
      truncated,
      wordCount,
      readingTime,
    });
  } catch {
    return NextResponse.json({ error: "Failed to read article" }, { status: 500 });
  }
}
