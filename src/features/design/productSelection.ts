/**
 * Product selection — public API for step 11 (Products).
 * ─────────────────────────────────────────────────────
 * Fixes BUG-X03 (MCA-SPEC-EXPRESS-MODE-v1 §8): the selection used to be
 * private to ProductsPage and never reached projects.data.
 *
 * Stored shape is FIXED: `{ productId, quantity }[]` in
 * localStorage["modulca-selected-products"] and projects.data.selectedProducts.
 * Presentation / PDF (Chat 3, BUG-X01) read this exact shape.
 */

export interface SelectedProduct {
  productId: string;
  quantity: number;
}

export const SELECTED_PRODUCTS_KEY = "modulca-selected-products";

/** Validate unknown input (storage / projects.data); invalid items are dropped. */
export function parseSelectedProducts(raw: unknown): SelectedProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is SelectedProduct =>
        !!s &&
        typeof s === "object" &&
        typeof (s as SelectedProduct).productId === "string" &&
        (s as SelectedProduct).productId.length > 0 &&
        Number.isFinite((s as SelectedProduct).quantity) &&
        (s as SelectedProduct).quantity > 0,
    )
    .map((s) => ({ productId: s.productId, quantity: Math.floor(s.quantity) }))
    .filter((s) => s.quantity > 0);
}

export function getSelectedProducts(): SelectedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SELECTED_PRODUCTS_KEY);
    return raw ? parseSelectedProducts(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

/**
 * BUG-ST06: a user edit that has not reached the cloud yet is "pending". A cloud
 * load for the same project must not overwrite it with the older cloud copy.
 */
export const SELECTED_PRODUCTS_PENDING_KEY = "modulca-selected-products-pending";
/** window event fired after every change: detail = { source } */
export const SELECTED_PRODUCTS_EVENT = "modulca:selected-products";

export type SelectionSource = "user" | "cloud";

interface PendingMarker {
  at: number;
  projectId?: string;
}

function readPending(): PendingMarker | null {
  try {
    const raw = localStorage.getItem(SELECTED_PRODUCTS_PENDING_KEY);
    const p = raw ? JSON.parse(raw) : null;
    if (!p || typeof p !== "object" || typeof p.at !== "number") return null;
    return { at: p.at, projectId: typeof p.projectId === "string" ? p.projectId : undefined };
  } catch {
    return null;
  }
}

/** True when the local selection has user edits for this project not yet saved to the cloud. */
export function hasPendingSelectedProducts(projectId?: string): boolean {
  if (typeof window === "undefined") return false;
  const p = readPending();
  if (!p) return false;
  return !p.projectId || !projectId || p.projectId === projectId;
}

/** Called after a successful cloud save that started at `savedAt`. A newer edit stays pending. */
export function clearPendingSelectedProducts(savedAt: number = Date.now()): void {
  if (typeof window === "undefined") return;
  const p = readPending();
  if (!p || p.at > savedAt) return;
  try {
    localStorage.removeItem(SELECTED_PRODUCTS_PENDING_KEY);
  } catch {
    /* non-fatal */
  }
}

/**
 * Write the selection. Returns true when it changed. A "user" change is marked
 * pending (until the next cloud save) and announces itself so auto-save runs.
 */
export function setSelectedProducts(
  items: SelectedProduct[],
  opts: { source?: SelectionSource; projectId?: string } = {},
): boolean {
  if (typeof window === "undefined") return false;
  const source = opts.source ?? "user";
  const next = JSON.stringify(parseSelectedProducts(items));
  let prev: string | null = null;
  try {
    const raw = localStorage.getItem(SELECTED_PRODUCTS_KEY);
    prev = raw === null ? null : JSON.stringify(parseSelectedProducts(JSON.parse(raw)));
  } catch {
    prev = null;
  }
  if (prev === next) return false;
  try {
    localStorage.setItem(SELECTED_PRODUCTS_KEY, next);
    if (source === "user") {
      const marker: PendingMarker = { at: Date.now(), projectId: opts.projectId };
      localStorage.setItem(SELECTED_PRODUCTS_PENDING_KEY, JSON.stringify(marker));
    }
  } catch {
    /* quota / private mode — non-fatal */
  }
  try {
    window.dispatchEvent(new CustomEvent(SELECTED_PRODUCTS_EVENT, { detail: { source } }));
  } catch {
    /* non-fatal */
  }
  return true;
}

/** Subscribe to selection changes. Returns an unsubscribe function. */
export function subscribeSelectedProducts(cb: (source: SelectionSource) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const src = (e as CustomEvent<{ source?: SelectionSource }>).detail?.source;
    cb(src === "cloud" ? "cloud" : "user");
  };
  window.addEventListener(SELECTED_PRODUCTS_EVENT, handler);
  return () => window.removeEventListener(SELECTED_PRODUCTS_EVENT, handler);
}
