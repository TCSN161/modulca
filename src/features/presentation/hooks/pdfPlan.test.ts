import { describe, it, expect } from "vitest";
import { chunk, pageLabel, curateRenders, hasPlot, gridBounds, MAX_PDF_RENDERS } from "./pdfPlan";

const r = (id: string, label: string, t: number, img = `img-${id}`) => ({
  id, label, moduleType: label.toLowerCase(), imageUrl: img, createdAt: new Date(t * 1000).toISOString(),
});

describe("ST24 — paginate instead of slicing", () => {
  it("9 modules at 8/page → 2 pages, nothing dropped", () => {
    const pages = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 8);
    expect(pages).toEqual([[1, 2, 3, 4, 5, 6, 7, 8], [9]]);
    expect(pageLabel("Module Details", 1, 2)).toBe("Module Details (2/2)");
    expect(pageLabel("Module Details", 0, 1)).toBe("Module Details");
  });
  it("empty list still yields one page", () => {
    expect(chunk([], 8)).toEqual([[]]);
  });
});

describe("ST25 — curated renders", () => {
  it("29 renders (mostly BEDROOM, with duplicates) → ≤ 8, ≤ 2 per label first, newest first", () => {
    const renders = [
      ...Array.from({ length: 20 }, (_, i) => r(`b${i}`, "BEDROOM", 100 + i)),
      r("dup", "BEDROOM", 200, "img-b19"),
      r("k1", "KITCHEN", 50), r("k2", "KITCHEN", 51), r("k3", "KITCHEN", 52),
      r("l1", "LIVING", 60), r("ba", "BATHROOM", 70), r("o", "OFFICE", 80), r("s", "STORAGE", 10), r("x", "LIVING", 61),
    ];
    const out = curateRenders(renders);
    expect(out.length).toBe(MAX_PDF_RENDERS);
    expect(new Set(out.map((x) => x.imageUrl)).size).toBe(out.length);
    expect(out.filter((x) => x.label === "BEDROOM").length).toBeLessThanOrEqual(2);
    expect(out[0].id).toBe("dup"); // newest
    for (const l of ["KITCHEN", "LIVING", "BATHROOM", "OFFICE"]) expect(out.some((x) => x.label === l)).toBe(true);
  });
  it("few renders → fills from leftovers", () => {
    const out = curateRenders([r("a", "BEDROOM", 1), r("b", "BEDROOM", 2), r("c", "BEDROOM", 3)]);
    expect(out.map((x) => x.id)).toEqual(["c", "b", "a"]);
  });
});

describe("ST26 — site plan fallback", () => {
  it("preset land (no polygon) has no plot", () => {
    expect(hasPlot([])).toBe(false);
    expect(hasPlot([{}, {}, {}])).toBe(true);
  });
  it("grid bounds", () => {
    expect(gridBounds([{ row: 2, col: 3 }, { row: 3, col: 5 }])).toEqual({ minRow: 2, minCol: 3, rows: 2, cols: 3 });
  });
});

describe("truncateWords (ST30)", () => {
  it("keeps short text and cuts long text at a word boundary", async () => {
    const { truncateWords } = await import("./pdfPlan");
    expect(truncateWords("Short caption", 40)).toBe("Short caption");
    const long = "Style prompt: modern Scandinavian bedroom, warm oak floor, soft daylight, high resolution photo";
    const out = truncateWords(long, 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("…")).toBe(true);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
    // the char after the kept text is a space, i.e. no word was cut
    expect(long[out.length - 1]).toMatch(/[\s,]/);
    expect(truncateWords("Supercalifragilisticexpialidocious", 10)).toBe("Supercali…");
    expect(truncateWords(undefined, 10)).toBe("");
  });
});
