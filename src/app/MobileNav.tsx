"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#for-builders", label: "For Builders" },
  { href: "/portfolio", label: "Portfolio", isLink: true },
  { href: "/blog", label: "Blog", isLink: true },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-charcoal hover:bg-brand-bone-200 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-brand-bone-300 bg-brand-bone-100/95 backdrop-blur-md shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.isLink ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-bone-200 hover:text-brand-charcoal transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-brand-gray hover:bg-brand-bone-200 hover:text-brand-charcoal transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <div className="mt-2 border-t border-brand-bone-300 pt-3 px-4">
              <Link
                href="/project/new"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-brand-olive-700 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-olive-800 transition-colors"
              >
                Start Designing — Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
