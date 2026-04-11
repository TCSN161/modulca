/**
 * ModulCA Asset Library — Image Source Utilities
 *
 * Abstracts image sourcing so we can switch providers without touching components.
 * Currently: Unsplash (free, attribution required).
 * Future: Pexels API, Pixabay API, local CDN, producer APIs.
 */

import type { ImageSizeParams, UnsplashParams } from "./types";

/* ─── Unsplash ───────────────────────────────────────────────── */

/**
 * Build an optimized Unsplash URL with size/quality params.
 * Unsplash CDN supports on-the-fly resizing via query params.
 *
 * @param photoId - Unsplash photo ID (the part after /photo-)
 * @param params  - Size/quality overrides
 */
export function unsplash(photoId: string, params: UnsplashParams = {}): string {
  const { w = 400, h, q = 80, fit = "crop", fm, auto } = params;
  const base = `https://images.unsplash.com/photo-${photoId}`;
  const qs = new URLSearchParams();
  qs.set("w", String(w));
  if (h) qs.set("h", String(h));
  qs.set("q", String(q));
  qs.set("fit", fit);
  if (fm) qs.set("fm", fm);
  if (auto) qs.set("auto", auto);
  return `${base}?${qs.toString()}`;
}

/**
 * Extract Unsplash photo ID from a full URL.
 * "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400" → "1558618666-fcd25c85f82e"
 */
export function extractUnsplashId(url: string): string | null {
  const match = url.match(/photo-([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/* ─── Pexels (future) ────────────────────────────────────────── */

/**
 * Build a Pexels CDN URL. Pexels allows hotlinking with attribution.
 * Free API: 200 req/hr, no watermarks.
 * Requires API key for search, but direct URLs work without.
 */
export function pexels(photoId: string | number, params: ImageSizeParams = {}): string {
  const { w = 400, h } = params;
  // Pexels CDN format: photos.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&w=400
  const base = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg`;
  const qs = new URLSearchParams();
  qs.set("auto", "compress");
  qs.set("w", String(w));
  if (h) qs.set("h", String(h));
  return `${base}?${qs.toString()}`;
}

/* ─── Pixabay (future) ───────────────────────────────────────── */

/**
 * Pixabay CDN URL builder.
 * Free API: 5000 req/hr, no attribution required.
 */
export function pixabay(photoPath: string, params: ImageSizeParams = {}): string {
  const { w = 640 } = params;
  return `https://pixabay.com/get/${photoPath}?w=${w}`;
}

/* ─── Local assets ───────────────────────────────────────────── */

/**
 * Reference a local asset from public/ directory.
 */
export function local(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/* ─── GLB models ─────────────────────────────────────────────── */

/**
 * Reference a 3D model from public/models/.
 */
export function model(filename: string): string {
  return `/models/${filename}`;
}

/* ─── Responsive image helper ────────────────────────────────── */

/**
 * Generate srcSet for responsive images (Unsplash).
 * Returns multiple widths for <Image> srcSet.
 */
export function unsplashSrcSet(photoId: string, widths: number[] = [200, 400, 800]): string {
  return widths
    .map((w) => `${unsplash(photoId, { w })} ${w}w`)
    .join(", ");
}

/* ─── Source info for attribution ─────────────────────────────── */

export interface SourceAttribution {
  source: string;
  name: string;
  url: string;
  license: string;
  requiresAttribution: boolean;
}

export const SOURCE_INFO: Record<string, SourceAttribution> = {
  unsplash: {
    source: "unsplash",
    name: "Unsplash",
    url: "https://unsplash.com",
    license: "Unsplash License (free for commercial use)",
    requiresAttribution: true,
  },
  pexels: {
    source: "pexels",
    name: "Pexels",
    url: "https://www.pexels.com",
    license: "Pexels License (free, no attribution required)",
    requiresAttribution: false,
  },
  pixabay: {
    source: "pixabay",
    name: "Pixabay",
    url: "https://pixabay.com",
    license: "Pixabay License (free, no attribution required)",
    requiresAttribution: false,
  },
  sketchfab: {
    source: "sketchfab",
    name: "Sketchfab",
    url: "https://sketchfab.com",
    license: "CC BY 4.0 (varies per model)",
    requiresAttribution: true,
  },
};

/* ─── API config for future integration ──────────────────────── */

/**
 * Image search API endpoints (for runtime image search).
 * These require API keys set in env vars.
 *
 * UNSPLASH_ACCESS_KEY — https://unsplash.com/developers
 * PEXELS_API_KEY      — https://www.pexels.com/api/
 * PIXABAY_API_KEY     — https://pixabay.com/api/docs/
 *
 * All three are FREE for production use with generous limits.
 */
export const IMAGE_APIS = {
  unsplash: {
    searchUrl: "https://api.unsplash.com/search/photos",
    keyEnv: "UNSPLASH_ACCESS_KEY",
    freeLimit: "50 req/hr",
    features: ["High-res photos", "Curated collections", "Color search"],
  },
  pexels: {
    searchUrl: "https://api.pexels.com/v1/search",
    keyEnv: "PEXELS_API_KEY",
    freeLimit: "200 req/hr",
    features: ["No attribution needed", "Video too", "Good interiors"],
  },
  pixabay: {
    searchUrl: "https://pixabay.com/api/",
    keyEnv: "PIXABAY_API_KEY",
    freeLimit: "5000 req/hr",
    features: ["No attribution needed", "Illustrations", "Vectors"],
  },
} as const;
