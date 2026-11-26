/**
 * Pure helpers for the react-pdf presentation (smoke test 2026-11-26, Costin's PDF).
 *
 *   ST24 — chunk(): Module Details / Floor Plan / Materials paginate instead
 *          of slicing (9 modules → STORAGE was cut).
 *   ST25 — curateRenders(): no duplicates, the latest render per module/label,
 *          max MAX_PDF_RENDERS (2 pages). 29 renders → 14.9 MB before.
 *   ST26 — hasPlot(): a preset land has no polygon → show the module grid.
 *   ST23 is solved in PdfGenerator with react-pdf's render-prop page numbers.
 */

export const MAX_PDF_RENDERS = 8;
export const RENDERS_PER_PAGE = 4;
export const MODULES_PER_DETAILS_PAGE = 8;
export const ROWS_PER_TABLE_PAGE = 14;

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (items.length === 0) return [[]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** "Module Details" / "Module Details (2/3)" */
export function pageLabel(base: string, i: number, n: number): string {
  return n > 1 ? `${base} (${i + 1}/${n})` : base;
}

export interface CuratableRender {
  id: string;
  imageUrl: string;
  label: string;
  moduleType: string;
  createdAt: string;
}

/**
 * Newest first, drop identical images, keep at most `perKey` per
 * module label (so 12 BEDROOM shots don't crowd out the rest), cap at `max`.
 * Rest of the slots: fill with the next-newest leftovers.
 */
export function curateRenders<T extends CuratableRender>(
  renders: readonly T[],
  max = MAX_PDF_RENDERS,
  perKey = 2,
): T[] {
  const time = (r: T) => Date.parse(r.createdAt) || 0;
  const sorted = [...renders].sort((a, b) => time(b) - time(a));
  const seen = new Set<string>();
  const unique = sorted.filter((r) => {
    const k = r.imageUrl.length > 256 ? `${r.imageUrl.length}:${r.imageUrl.slice(-128)}` : r.imageUrl;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const perCount = new Map<string, number>();
  const picked: T[] = [];
  const rest: T[] = [];
  for (const r of unique) {
    const key = (r.label || r.moduleType || "").toLowerCase();
    const n = perCount.get(key) ?? 0;
    if (n < perKey && picked.length < max) {
      picked.push(r);
      perCount.set(key, n + 1);
    } else rest.push(r);
  }
  for (const r of rest) {
    if (picked.length >= max) break;
    picked.push(r);
  }
  return picked;
}

export function hasPlot(polygon: readonly unknown[]): boolean {
  return polygon.length >= 3;
}

/** Bounding box of module grid positions, for the ST26 fallback diagram. */
export function gridBounds(mods: readonly { row: number; col: number }[]) {
  if (mods.length === 0) return { minRow: 0, minCol: 0, rows: 0, cols: 0 };
  const rows = mods.map((m) => m.row), cols = mods.map((m) => m.col);
  const minRow = Math.min(...rows), minCol = Math.min(...cols);
  return { minRow, minCol, rows: Math.max(...rows) - minRow + 1, cols: Math.max(...cols) - minCol + 1 };
}
