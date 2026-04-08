"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Floating "Ask AI" button — appears on every project step.
 * Opens a small tooltip with a link to the full Neufert AI Consultant page.
 * Hidden when already on the consultant page.
 */
export default function FloatingAIButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isConsultantPage = pathname?.includes("/consultant");

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Hide on the consultant page itself
  if (isConsultantPage) return null;

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {open && (
        <div className="absolute bottom-16 right-0 w-72 rounded-xl bg-white shadow-2xl border border-gray-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏗️</span>
            <h3 className="text-sm font-bold text-brand-teal-800">Neufert AI Consultant</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Ask questions about architecture standards, Romanian building regulations, room dimensions, and modular construction best practices.
          </p>
          <div className="space-y-2">
            <Link
              href="/project/demo/consultant"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-brand-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-700 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Open AI Consultant
            </Link>
            <p className="text-[10px] text-gray-400 text-center">
              Powered by Llama 3.3 with Neufert architectural standards
            </p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`group flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          open
            ? "bg-gray-200 text-gray-600 rotate-45"
            : "bg-gradient-to-br from-brand-teal-700 to-brand-teal-900 text-white hover:shadow-xl hover:scale-105"
        }`}
        aria-label="Ask AI Consultant"
        title="Ask AI Consultant"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Pulse animation on first load */}
      {!open && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-amber-500"></span>
        </span>
      )}
    </div>
  );
}
