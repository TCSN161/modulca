"use client";

import type { ReactNode } from "react";

/**
 * Reusable slide-over panel from the right side.
 * Used by: KnowledgeBasePanel, PermitTracker, DrawingPresentation, mobile panels.
 * Saves ~40 lines per usage site.
 */

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Width class — default "max-w-lg" */
  width?: string;
  /** Position — default "right" */
  side?: "left" | "right";
}

export default function SlideOverPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-lg",
  side = "right",
}: SlideOverPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className={`relative w-full ${width} bg-white shadow-xl flex flex-col ${
          side === "left" ? "order-first" : ""
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
