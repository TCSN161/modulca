import { NextRequest, NextResponse } from "next/server";
import { BOOK_REGISTRY, getBookCoverUrl, getOpenLibraryUrl } from "@/knowledge/15-books/_registry";

export const dynamic = "force-dynamic";

/**
 * Books API — serves enriched book data from registry + Open Library.
 *
 * GET /api/books              → all books with covers
 * GET /api/books?type=book    → filter by type
 * GET /api/books?free=true    → only free books
 * GET /api/books?q=vitruvius  → search by title/author
 * GET /api/books?id=xxx       → single book detail + Open Library metadata
 *
 * Open Library data is fetched on-demand and cached in-memory (1h TTL).
 * Cover URLs use the direct Open Library Covers API (no proxy needed).
 */

/* ── In-memory Open Library metadata cache ─────────────────── */

interface OLMeta {
  readUrl?: string;
  subjects?: string[];
  description?: string;
  pageCount?: number;
  fetchedAt: number;
}

const olCache = new Map<string, OLMeta>();
const OL_CACHE_TTL = 3600_000; // 1 hour

async function fetchOpenLibraryMeta(isbn?: string, olid?: string): Promise<OLMeta | null> {
  const key = isbn || olid;
  if (!key) return null;

  // Check cache
  const cached = olCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < OL_CACHE_TTL) return cached;

  try {
    const bibkey = isbn ? `ISBN:${isbn}` : `OLID:${olid}`;
    const url = `https://openlibrary.org/api/books?bibkeys=${bibkey}&format=json&jscmd=data`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json();
    const book = data[bibkey];
    if (!book) {
      // Cache miss to avoid re-fetching
      const empty: OLMeta = { fetchedAt: Date.now() };
      olCache.set(key, empty);
      return empty;
    }

    const meta: OLMeta = {
      readUrl: book.url,
      subjects: book.subjects?.map((s: { name: string }) => s.name).slice(0, 5),
      description: typeof book.excerpts?.[0]?.text === "string" ? book.excerpts[0].text.slice(0, 300) : undefined,
      pageCount: book.number_of_pages,
      fetchedAt: Date.now(),
    };
    olCache.set(key, meta);
    return meta;
  } catch {
    return null;
  }
}

/* ── Route Handler ─────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const query = searchParams.get("q");
  const typeFilter = searchParams.get("type");
  const freeFilter = searchParams.get("free");

  // Single book detail with Open Library enrichment
  if (id) {
    const book = BOOK_REGISTRY.find((b) => b.id === id);
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const olMeta = await fetchOpenLibraryMeta(book.isbn, book.olid);
    const coverUrl = getBookCoverUrl(book, "M");
    const coverUrlLarge = getBookCoverUrl(book, "L");
    const openLibraryUrl = getOpenLibraryUrl(book);

    return NextResponse.json({
      ...book,
      coverUrl,
      coverUrlLarge,
      openLibraryUrl,
      olMeta: olMeta || undefined,
    });
  }

  // Filter & search
  let results = [...BOOK_REGISTRY];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  if (typeFilter) {
    results = results.filter((b) => b.type === typeFilter);
  }

  if (freeFilter === "true") {
    results = results.filter((b) => b.free);
  } else if (freeFilter === "false") {
    results = results.filter((b) => !b.free);
  }

  // Enrich with cover URLs (no API call needed — direct URL construction)
  const enriched = results.map((b) => ({
    ...b,
    coverUrl: getBookCoverUrl(b, "M"),
    openLibraryUrl: getOpenLibraryUrl(b),
  }));

  return NextResponse.json({
    total: enriched.length,
    books: enriched,
  });
  } catch (err) {
    console.error("[books] Unhandled error:", err);
    return NextResponse.json(
      { error: "Books request failed.", books: [] },
      { status: 500 }
    );
  }
}
