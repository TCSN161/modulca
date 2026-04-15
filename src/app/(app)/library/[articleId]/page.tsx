import { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES, REGIONS } from "@/knowledge/_index";
import { CATEGORY_DEFINITIONS } from "@/knowledge/_taxonomy";

/**
 * SEO-optimized public article page.
 *
 * Each of the 200 knowledge articles gets its own indexable URL:
 *   /library/room-dimensions
 *   /library/ro-building-permit
 *   /library/passive-house
 *
 * Free visitors see the first ~30% of the article + upgrade CTA.
 * Google sees the full meta description + structured data for rich snippets.
 */

const KB_ROOT = join(process.cwd(), "src", "knowledge");

/* ── Static params for SSG ────────────────────────────────── */

export function generateStaticParams() {
  return ARTICLES.filter((a) => a.filePath).map((a) => ({
    articleId: a.id,
  }));
}

/* ── SEO Metadata ─────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleId: string }>;
}): Promise<Metadata> {
  const { articleId } = await params;
  const article = ARTICLES.find((a) => a.id === articleId);
  if (!article) return { title: "Article Not Found — ModulCA" };

  const region = article.region ? REGIONS.find((r) => r.code === article.region) : null;
  const catDef = CATEGORY_DEFINITIONS.find((c) => c.id === article.category);
  const description = [
    article.title,
    region ? `Building regulations for ${region.name}.` : "",
    catDef ? `Part of ${catDef.label}.` : "",
    `Difficulty: ${article.difficulty}.`,
    article.sources.length > 0 ? `Sources: ${article.sources.slice(0, 3).join(", ")}.` : "",
  ].filter(Boolean).join(" ");

  return {
    title: `${article.title} — ModulCA Knowledge Library`,
    description: description.slice(0, 160),
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: description.slice(0, 160),
      type: "article",
      images: [
        {
          url: `/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(catDef?.label || "Knowledge Library")}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `/library/${article.id}`,
    },
  };
}

/* ── Helpers ──────────────────────────────────────────────── */

function difficultyColor(d: string) {
  switch (d) {
    case "beginner": return "bg-green-100 text-green-700";
    case "intermediate": return "bg-yellow-100 text-yellow-700";
    case "advanced": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

/* ── Server-side Markdown → HTML (simplified) ─────────────── */

function markdownToHtml(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      // Headers
      if (line.startsWith("### ")) return `<h4 class="mt-4 mb-2 text-sm font-bold text-gray-700">${esc(line.slice(4))}</h4>`;
      if (line.startsWith("## ")) return `<h3 class="mt-5 mb-2 text-base font-bold text-gray-800">${esc(line.slice(3))}</h3>`;
      if (line.startsWith("# ")) return `<h2 class="mt-6 mb-3 text-lg font-bold text-gray-900">${esc(line.slice(2))}</h2>`;
      // Blockquote
      if (line.startsWith("> ")) return `<div class="my-3 border-l-4 border-teal-300 bg-teal-50/30 rounded-r-lg px-4 py-2.5 text-sm text-teal-800">${inlineFmt(line.slice(2))}</div>`;
      // Horizontal rule
      if (line.trim() === "---") return `<hr class="my-4 border-gray-200" />`;
      // List item
      if (line.startsWith("- ")) return `<div class="ml-4 text-sm text-gray-700 mb-1">&#8226; ${inlineFmt(line.slice(2))}</div>`;
      // Ordered list
      const ol = line.match(/^(\d+)\.\s+(.*)/);
      if (ol) return `<div class="ml-4 text-sm text-gray-700 mb-1"><span class="font-medium text-gray-500 mr-1">${ol[1]}.</span> ${inlineFmt(ol[2])}</div>`;
      // Table rows — pass through raw (tables handled separately below)
      if (line.startsWith("|")) return `<!--TABLE_ROW-->${line}`;
      // Empty line
      if (line.trim() === "") return `<div class="h-2"></div>`;
      // Paragraph
      return `<p class="text-sm text-gray-700 leading-relaxed">${inlineFmt(line)}</p>`;
    })
    .join("\n")
    // Post-process tables
    .replace(/(<!--TABLE_ROW-->\|.*\n?)+/g, (block) => {
      const rows = block.split("\n").filter(Boolean).map((r) => r.replace("<!--TABLE_ROW-->", ""));
      if (rows.length < 2) return rows.join("");
      const parseRow = (r: string) => r.split("|").slice(1, -1).map((c) => c.trim());
      const headers = parseRow(rows[0]);
      const isSep = (r: string) => /^\|[\s\-:|]+\|$/.test(r);
      const bodyStart = isSep(rows[1]) ? 2 : 1;
      const body = rows.slice(bodyStart).map(parseRow);
      return `<div class="my-4 overflow-x-auto rounded-lg border border-gray-200"><table class="min-w-full text-xs"><thead><tr class="bg-gray-50">${headers.map((h) => `<th class="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">${inlineFmt(h)}</th>`).join("")}</tr></thead><tbody>${body.map((r, i) => `<tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}">${r.map((c) => `<td class="px-3 py-2 text-gray-600 border-b border-gray-100">${inlineFmt(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineFmt(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-xs">$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-700 underline hover:text-teal-900">$1</a>');
}

/* ── Page Component ───────────────────────────────────────── */

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const article = ARTICLES.find((a) => a.id === articleId);
  if (!article || !article.filePath) return notFound();

  const region = article.region ? REGIONS.find((r) => r.code === article.region) : null;
  const catDef = CATEGORY_DEFINITIONS.find((c) => c.id === article.category);

  // Load content
  let content = "";
  try {
    const raw = await readFile(join(KB_ROOT, article.filePath), "utf-8");
    const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    content = match ? match[1].trim() : raw.trim();
  } catch {
    return notFound();
  }

  // Free tier: show first 30%
  const FREE_RATIO = 0.3;
  const cutPoint = Math.floor(content.length * FREE_RATIO);
  const freeContent = content.slice(0, cutPoint);
  // Find a clean cut at paragraph boundary
  const lastPara = freeContent.lastIndexOf("\n\n");
  const visibleContent = lastPara > 100 ? freeContent.slice(0, lastPara) : freeContent;
  const freeContentHtml = markdownToHtml(visibleContent);

  // Word count / reading time
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Related articles
  const relatedArticles = (article.relatedArticles || [])
    .map((id) => ARTICLES.find((a) => a.id === id))
    .filter(Boolean);

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    author: { "@type": "Organization", name: "ModulCA" },
    publisher: { "@type": "Organization", name: "ModulCA", url: "https://modulca.eu" },
    dateModified: article.lastUpdated,
    description: article.sources.join(", "),
    keywords: article.tags.join(", "),
    mainEntityOfPage: `https://modulca.eu/library/${article.id}`,
  };

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold text-brand-charcoal">ModulCA</Link>
            <span className="text-xs text-gray-400">|</span>
            <Link href="/library" className="text-sm text-gray-500 hover:text-brand-teal-800">Library</Link>
          </div>
          <Link
            href="/register"
            className="rounded-lg bg-brand-teal-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-teal-800 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-gray-400">
          <Link href="/library" className="hover:text-brand-teal-800">Library</Link>
          <span className="mx-1.5">›</span>
          {catDef && (
            <>
              <span>{catDef.icon} {catDef.label}</span>
              <span className="mx-1.5">›</span>
            </>
          )}
          <span className="text-gray-600">{article.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{article.title}</h1>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor(article.difficulty)}`}>
            {article.difficulty}
          </span>
          {region && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {region.flag} {region.name}
            </span>
          )}
          {article.proOnly && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              Pro
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            {readingTime} min read
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            Updated {article.lastUpdated}
          </span>
        </div>

        {/* Sources */}
        {article.sources.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-bold uppercase text-gray-400">Sources: </span>
            <span className="text-xs text-gray-500">{article.sources.join(" · ")}</span>
          </div>
        )}

        {/* Article content (free portion) */}
        <article
          className="mt-8 prose-sm"
          dangerouslySetInnerHTML={{ __html: freeContentHtml }}
        />

        {/* Upgrade gate */}
        <div className="mt-8 relative">
          {/* Fade overlay */}
          <div className="absolute -top-16 inset-x-0 h-16 bg-gradient-to-t from-brand-bone-100 to-transparent pointer-events-none" />

          <div className="rounded-2xl border-2 border-dashed border-brand-teal-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-3xl">📖</div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Continue Reading
            </h3>
            <p className="mb-1 text-sm text-gray-600">
              You&apos;re seeing {Math.round(FREE_RATIO * 100)}% of this article.
              Sign up for free to read more, or upgrade to Premium for full access to all {ARTICLES.length} articles.
            </p>
            <p className="mb-5 text-xs text-gray-400">
              {wordCount} words · {readingTime} min read · {article.tags.slice(0, 5).join(", ")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-brand-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-800 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-brand-teal-200 bg-white px-6 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
              >
                View Premium Plans
              </Link>
            </div>
          </div>
        </div>

        {/* AI consultant CTA */}
        <div className="mt-6 rounded-xl bg-brand-teal-50/50 border border-brand-teal-100 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h4 className="text-sm font-bold text-brand-teal-800">Have questions about this topic?</h4>
              <p className="mt-1 text-xs text-gray-600">
                Our AI architectural consultant can answer detailed questions about {article.title.toLowerCase()}, with references to standards and regulations.
              </p>
              <Link
                href={`/project/demo/consultant?q=${encodeURIComponent(`Tell me about ${article.title}`)}`}
                className="mt-2 inline-block text-xs font-semibold text-brand-teal-700 hover:underline"
              >
                Ask AI Consultant →
              </Link>
            </div>
          </div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Related Articles</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {relatedArticles.map((rel) => rel && (
                <Link
                  key={rel.id}
                  href={`/library/${rel.id}`}
                  className="rounded-lg border border-gray-100 bg-white p-3 hover:border-brand-teal-200 hover:shadow-sm transition-all"
                >
                  <div className="text-xs font-semibold text-gray-800">{rel.title}</div>
                  <div className="mt-1 text-[10px] text-gray-400">{rel.tags.slice(0, 3).join(" · ")}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">
          ModulCA Knowledge Library — {ARTICLES.length} articles on architecture, regulations & modular construction
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
          <Link href="/library" className="hover:text-brand-teal-800">All Articles</Link>
          <Link href="/pricing" className="hover:text-brand-teal-800">Pricing</Link>
          <Link href="/quiz" className="hover:text-brand-teal-800">Style Quiz</Link>
          <Link href="/" className="hover:text-brand-teal-800">ModulCA Home</Link>
        </div>
      </footer>
    </div>
  );
}
