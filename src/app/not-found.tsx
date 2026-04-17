import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "This page doesn't exist at ModulCA. Browse our pricing, portfolio, FAQ, or start designing your modular home instead.",
  robots: { index: false, follow: false },
};

const HELPFUL_LINKS = [
  { label: "Pricing", href: "/pricing", desc: "Plans from free to Constructor" },
  { label: "Portfolio", href: "/portfolio", desc: "Real modular projects" },
  { label: "Blog", href: "/blog", desc: "Guides & case studies" },
  { label: "FAQ", href: "/faq", desc: "Common questions answered" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bone-100 px-4 py-16">
      <div className="max-w-xl text-center">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-block">
          <span className="text-2xl font-bold tracking-heading text-brand-charcoal">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>

        {/* 404 illustration */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-brand-teal-300 bg-brand-teal-100">
              <span className="text-3xl font-bold text-brand-teal-800">4</span>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-brand-amber-400 bg-brand-amber-100">
              <span className="text-2xl text-brand-amber-500">?</span>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-brand-teal-300 bg-brand-teal-100">
              <span className="text-3xl font-bold text-brand-teal-800">4</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-gray">
            Module not found
          </p>
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-heading text-brand-charcoal md:text-3xl">
          This module doesn&apos;t exist
        </h1>
        <p className="mb-8 text-sm text-brand-gray md:text-base">
          The page you&apos;re looking for has been moved, removed, or never
          existed. Let&apos;s get you back to building.
        </p>

        <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-brand-charcoal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-charcoal/90"
          >
            Back to Home
          </Link>
          <Link
            href="/project/new"
            className="rounded-lg border border-brand-bone-300 bg-white px-6 py-3 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-bone-100"
          >
            Start Designing
          </Link>
        </div>

        {/* Popular links — helps both users and search crawlers */}
        <div className="border-t border-brand-bone-300/60 pt-8">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
            Or explore
          </p>
          <div className="grid grid-cols-2 gap-3">
            {HELPFUL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-brand-bone-300/60 bg-white p-3 text-left transition-colors hover:border-brand-amber-400"
              >
                <div className="text-sm font-semibold text-brand-charcoal">
                  {link.label}
                </div>
                <div className="text-[11px] text-brand-gray">{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
