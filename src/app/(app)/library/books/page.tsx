"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthNav } from "@/features/auth/components/AuthNav";
import {
  BOOK_REGISTRY,
  getBooks,
  getFreeReadableBooks,
  getPaidBooks,
  getBookCoverUrl,
  getOpenLibraryUrl,
  getBooksByType,
} from "@/knowledge/15-books/_registry";
import type { KBSource } from "@/knowledge/_types";

/* ------------------------------------------------------------------ */
/*  Book Card Component                                                */
/* ------------------------------------------------------------------ */

function BookCard({ book }: { book: KBSource }) {
  const coverUrl = getBookCoverUrl(book, "M");
  const openLibraryUrl = getOpenLibraryUrl(book);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-brand-teal-200 hover:shadow-md transition-all">
      {/* Cover */}
      <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {coverUrl && !imgError ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="96px"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-3xl">
            {book.type === "book" ? "📖" : book.type === "standard" ? "📋" : book.type === "course" ? "🎓" : "🌐"}
          </div>
        )}
        {book.free && (
          <div className="absolute top-1 left-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-brand-teal-800">
            {book.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 truncate">{book.author}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
              {book.year}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 capitalize">
              {book.type}
            </span>
            {book.cost && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {book.cost}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {book.free && book.url && (
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read Free
            </a>
          )}
          {openLibraryUrl && (
            <a
              href={openLibraryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open Library
            </a>
          )}
          {!book.free && book.url && (
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Buy {book.cost || ""}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Tabs                                                        */
/* ------------------------------------------------------------------ */

type FilterTab = "all" | "free-books" | "paid-books" | "standards" | "courses" | "websites";

const TABS: { id: FilterTab; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "📚" },
  { id: "free-books", label: "Free Books", icon: "📖" },
  { id: "paid-books", label: "Essential Books", icon: "⭐" },
  { id: "standards", label: "Standards & Laws", icon: "📋" },
  { id: "courses", label: "Courses", icon: "🎓" },
  { id: "websites", label: "Websites", icon: "🌐" },
];

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function BooksPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filteredBooks = useMemo(() => {
    let results: KBSource[];

    switch (activeTab) {
      case "free-books": results = getFreeReadableBooks(); break;
      case "paid-books": results = getPaidBooks(); break;
      case "standards": results = [...getBooksByType("standard"), ...getBooksByType("law")]; break;
      case "courses": results = getBooksByType("course"); break;
      case "websites": results = getBooksByType("website"); break;
      default: results = [...BOOK_REGISTRY];
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    return results;
  }, [activeTab, search]);

  const freeBookCount = getFreeReadableBooks().length;
  const paidBookCount = getPaidBooks().length;
  const totalBooks = getBooks().length;

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-brand-charcoal">ModulCA</Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">|</span>
            <Link href="/library" className="hidden sm:inline-block text-sm text-gray-500 hover:text-brand-teal-800">Library</Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">›</span>
            <h1 className="hidden sm:inline-block text-sm font-semibold text-gray-700">Books & References</h1>
          </div>
          <AuthNav />
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900">📕 Architecture Books & References</h2>
          <p className="mt-2 text-sm text-gray-600">
            {totalBooks} books ({freeBookCount} free to read online) plus standards, courses, and curated resources.
            Free books via{" "}
            <a href="https://openlibrary.org/" target="_blank" rel="noopener noreferrer" className="text-brand-teal-700 underline">Open Library</a>,{" "}
            <a href="https://www.gutenberg.org/" target="_blank" rel="noopener noreferrer" className="text-brand-teal-700 underline">Project Gutenberg</a>, and{" "}
            <a href="https://archive.org/" target="_blank" rel="noopener noreferrer" className="text-brand-teal-700 underline">Internet Archive</a>.
          </p>

          {/* Search */}
          <div className="mt-4 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books by title or author..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-teal-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 bg-white/80">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-brand-teal-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Info banner for free books */}
        {activeTab === "free-books" && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">📖</span>
              <div>
                <h3 className="text-sm font-bold text-green-800">Free Architecture Classics</h3>
                <p className="mt-1 text-xs text-green-700">
                  These books are in the public domain and can be read for free online.
                  Click &quot;Read Free&quot; to open in Project Gutenberg, Internet Archive, or Open Library.
                  No account needed — zero cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "paid-books" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⭐</span>
              <div>
                <h3 className="text-sm font-bold text-amber-800">Essential Reference Books</h3>
                <p className="mt-1 text-xs text-amber-700">
                  These are the must-have books for architects and builders. Links go to Amazon
                  where you can buy them. ModulCA&apos;s knowledge articles distill their key insights — read our
                  summaries first, then buy the ones most relevant to your project.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="mb-4 text-xs text-gray-500">
          {filteredBooks.length} resource{filteredBooks.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </p>

        {/* Book grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No resources found{search ? ` for "${search}"` : ""}.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-teal-800 to-brand-teal-700 p-8 text-center text-white">
          <h3 className="text-lg font-bold">Want AI-powered answers from these books?</h3>
          <p className="mt-2 text-sm text-teal-100">
            Our Neufert AI consultant draws from all these references to answer your architecture questions instantly.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/project/demo/consultant"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-brand-teal-800 hover:bg-teal-50 transition-colors"
            >
              Ask AI Consultant
            </Link>
            <Link
              href="/library"
              className="rounded-xl border border-white/30 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">
          Book covers and metadata provided by{" "}
          <a href="https://openlibrary.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-teal-800">
            Open Library
          </a>
          . Free books hosted by{" "}
          <a href="https://www.gutenberg.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-teal-800">
            Project Gutenberg
          </a>
          {" "}and{" "}
          <a href="https://archive.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-teal-800">
            Internet Archive
          </a>.
        </p>
      </footer>
    </div>
  );
}
