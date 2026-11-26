"use client";

/**
 * Render persistence (BUG-ST27).
 * ─────────────────────────────
 * Renders used to vanish from the presentation after browsing because:
 *  1. adding a render never triggered a cloud save (the auto-save only watched
 *     modules / finish / style), so the next cloud load restored the old list;
 *  2. raw PNG data URIs (1–3 MB each) overflowed localStorage, and the failed
 *     write was swallowed.
 *
 * Now a render is re-encoded as a ≤1024 px JPEG data URI (≈80–200 KB), added to
 * the design store, written to localStorage, and saved at once through the
 * single save path (`saveActiveProject` → `getProjectSnapshot`). The number of
 * stored renders is capped by the tier's `savedRenders` limit (unlimited → 40)
 * so the project row stays small.
 *
 * Why data URIs and not Storage URLs: client uploads to a Storage bucket need a
 * new bucket + RLS migration (shared infra, Chat 3 / MAIN). JPEG keeps the PDF
 * and the presentation working offline and in demo mode. Moving the bytes to
 * Storage later only changes `imageUrl`; readers already accept http URLs.
 */

import { useDesignStore, type SavedRender } from "./store";
import { saveActiveProject, getActiveProject } from "./projectSnapshot";
import { useAuthStore } from "@/features/auth/store";
import { getTierConfig } from "@/features/auth/types";
import { toJpegDataUrl } from "./components/render/renderImage";

/** Hard cap for "unlimited" tiers: 40 × ~150 KB ≈ 6 MB of JSONB at most. */
export const UNLIMITED_RENDER_CAP = 40;

export function savedRenderLimit(): number {
  const limit = getTierConfig(useAuthStore.getState().userTier).features.savedRenders;
  return limit === -1 ? UNLIMITED_RENDER_CAP : limit;
}

export type PersistRenderResult =
  | { ok: true; cloud: boolean }
  | { ok: false; reason: "limit"; limit: number }
  | { ok: false; reason: "error"; message: string };

/**
 * Store a render in the project. `render.imageUrl` may be a blob:, http or data
 * URI; it is re-encoded before storing.
 */
export async function persistSavedRender(
  render: SavedRender,
  projectId: string,
): Promise<PersistRenderResult> {
  const limit = savedRenderLimit();
  if (useDesignStore.getState().savedRenders.length >= limit) {
    return { ok: false, reason: "limit", limit };
  }
  let imageUrl: string;
  try {
    imageUrl = await toJpegDataUrl(render.imageUrl);
  } catch (err) {
    return { ok: false, reason: "error", message: err instanceof Error ? err.message : String(err) };
  }

  const design = useDesignStore.getState();
  design.addSavedRender({ ...render, imageUrl });
  design.saveToLocalStorage();

  const { isAuthenticated, userId } = useAuthStore.getState();
  if (!isAuthenticated || !userId || !projectId || projectId === "demo") {
    return { ok: true, cloud: false };
  }
  const result = await saveActiveProject(userId, getActiveProject().name ?? "Untitled Project", projectId);
  return { ok: true, cloud: result.ok };
}
