/**
 * ST23–ST26 + 3.08 (ST29–ST32) end-to-end: render the real react-pdf document
 * in Node, with the shape of Costin's smoke-test project (9 modules, 29
 * renders, preset land). Set PDF_OUT=<folder> to keep the generated PDFs.
 */
// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { isValidElement, type ReactNode } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PresentationDocument, type PdfDocumentProps } from "./PdfGenerator";
import { registerPdfFonts } from "./pdf/fonts";
import { TMPL, makeStyles } from "./pdf/theme";
import { costPages, productPages, renderPages } from "./pdf/detailPages";
import { coverPages } from "./pdf/overviewPages";
import type { PdfCtx } from "./pdf/types";
import { presentationT } from "../i18n";
import { computeProjectCost } from "@/features/design/projectCost";
import type { ModuleConfig, SavedRender } from "@/features/design/store";

// 1×1 white PNG
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const types = ["bedroom", "bedroom", "bedroom", "kitchen", "living", "bathroom", "office", "living", "storage"];
const modules = types.map((t, i) => ({
  row: Math.floor(i / 3), col: i % 3, moduleType: t, label: `${t.toUpperCase()} ${i + 1}`,
  layoutPreset: "a", floorFinish: "oak", wallColor: "white",
  wallConfigs: { north: "solid", south: "solid", east: "solid", west: "solid" },
})) as unknown as ModuleConfig[];

const LONG = "Style prompt: modern Scandinavian bedroom with warm oak floor, linen bedding, soft daylight from a large window, photorealistic, high resolution, magazine quality interior photography";
const savedRenders = Array.from({ length: 29 }, (_, i) => ({
  id: `r${i}`, imageUrl: PNG, label: i < 20 ? "BEDROOM" : types[i % 9].toUpperCase(),
  engine: i === 0 ? "ai-horde" : "cloudflare-klein-img2img", moduleType: "bedroom",
  createdAt: new Date(1e12 + i * 1000).toISOString(), description: LONG, mode: "img2img",
  fallbackFrom: i === 0 ? ["cloudflare-klein"] : [],
})) as SavedRender[];

const ALL = ["cover", "description", "site", "floorplan", "vision", "modules", "renders", "materials", "products", "cost", "next"];

const cost = computeProjectCost({ modules, finishLevel: "standard", selectedProducts: [{ productId: "fin-01", quantity: 1 }] });

function docProps(locale: string): PdfDocumentProps {
  return {
    template: "minimal",
    slides: ALL.map((id) => ({ id, label: id, enabled: true })),
    projectName: "Smoke Test 1.03",
    clientName: "Ștefan Țăranu",
    locale,
    modules,
    cost,
    style: null,
    finishLevel: "standard",
    polygon: [],
    mapCenter: { lat: 44.4, lng: 26.1 },
    savedRenders,
  };
}

function ctx(locale: string, over: Partial<PdfDocumentProps> = {}): PdfCtx {
  const t = presentationT(locale);
  return { props: { ...docProps(locale), ...over }, t, s: makeStyles(TMPL.minimal), theme: TMPL.minimal, finishName: t.finish("standard"), label: (id) => t(`slide.${id}.label`) };
}

/** All text in a react-pdf element tree (builders return plain JSX, no hooks) */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}
const pageCount = (buf: Buffer) => (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;

beforeAll(() => registerPdfFonts(resolve(process.cwd(), "public/fonts/pdf")));

describe("PDF document (ST23–ST26)", () => {
  it("renders; page count = slides + extra module page + render pages (curated)", async () => {
    const buf = await renderToBuffer(<PresentationDocument {...docProps("en")} />);
    // 11 slides, + 1 (Module Details 2/2, ST24), renders: identical images dedupe to 1 → 1 page
    expect(pageCount(buf)).toBe(12);
    expect(buf.length).toBeLessThan(500_000);
  }, 30_000);
});

describe("3.08 — RO PDF, costs, captions, fallback", () => {
  it("ST32: Romanian PDF with the Inter font embedded (no Helvetica)", async () => {
    const buf = await renderToBuffer(<PresentationDocument {...docProps("ro")} />);
    if (process.env.PDF_OUT) writeFileSync(join(process.env.PDF_OUT, "presentation-ro.pdf"), buf);
    expect(pageCount(buf)).toBe(12);
    const raw = buf.toString("latin1");
    expect(raw).toMatch(/\/BaseFont\s*\/[A-Z]{6}\+Inter/);
    expect(raw).not.toMatch(/\/BaseFont\s*\/Helvetica/);
    expect(buf.length).toBeLessThan(500_000);
  }, 30_000);

  it("ST32: Romanian texts on the cover and cost pages", () => {
    const c = ctx("ro");
    const cover = textOf(coverPages(c));
    expect(cover).toContain("Pregătit pentru Ștefan Țăranu");
    expect(cover).toContain("SUPRAFAȚĂ TOTALĂ");
    expect(textOf(costPages(c))).toContain("Sumar costuri");
  });

  it("ST31: per-m² product priced on the usable area; total = computeProjectCost grandTotal", () => {
    const c = ctx("ro");
    const t = c.t;
    expect(cost.productLines[0]).toMatchObject({ unit: "m2", quantity: 63, total: 63 * 42 });
    const products = textOf(productPages(c));
    expect(products).toContain("63 m²");
    expect(products).toContain(t.eur(63 * 42));
    const costText = textOf(costPages(c));
    expect(costText).toContain(t.eur(cost.grandTotal));
    expect(cost.grandTotal).toBe(cost.totalEstimate + 63 * 42);
    expect(textOf(coverPages(c))).toContain(t.eur(cost.grandTotal));
  });

  it("ST30 + ST29: captions cut at a word, fallback only when the list is not empty", () => {
    const two = [
      { ...savedRenders[0], id: "a", imageUrl: `${PNG}#a`, label: "BEDROOM" },
      { ...savedRenders[1], id: "b", imageUrl: `${PNG}#b`, label: "KITCHEN", moduleType: "kitchen" },
    ];
    const text = textOf(renderPages(ctx("ro", { savedRenders: two })));
    expect(text).toContain("…");
    const kept = text.slice(text.indexOf("Style prompt"), text.indexOf("…"));
    expect(LONG.startsWith(kept)).toBe(true);
    expect(LONG[kept.length]).toMatch(/[\s,]/);
    expect(text).toContain("(alternativă: FLUX.2 klein (Cloudflare) indisponibil)");
    expect(text.match(/alternativă/g)?.length).toBe(1);
  });
});
