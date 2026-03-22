/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * Usage: cn("px-4 py-2", isActive && "bg-brand-teal-800", className)
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
