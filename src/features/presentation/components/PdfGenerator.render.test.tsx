/**
 * ST23–ST26 end-to-end: render the real react-pdf document in Node, with the
 * shape of Costin's smoke-test project (9 modules, 29 renders, preset land).
 */
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { PresentationDocument } from "./PdfGenerator";
import type { ModuleConfig, SavedRender } from "@/features/design/store";

// 1×1 white PNG
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const types = ["bedroom", "bedroom", "bedroom", "kitchen", "living", "bathroom", "office", "living", "storage"];
const modules = types.map((t, i) => ({
  row: Math.floor(i / 3), col: i % 3, moduleType: t, label: `${t.toUpperCase()} ${i + 1}`,
  layoutPreset: "a", floorFinish: "oak", wallColor: "white",
  wallConfigs: { north: "solid", south: "solid", east: "solid", west: "solid" },
})) as unknown as ModuleConfig[];

const savedRenders = Array.from({ length: 29 }, (_, i) => ({
  id: `r${i}`, imageUrl: PNG, label: i < 20 ? "BEDROOM" : types[i % 9].toUpperCase(),
  engine: "cloudflare-klein", moduleType: "bedroom", createdAt: new Date(1e12 + i * 1000).toISOString(),
})) as SavedRender[];

const ALL = ["cover", "description", "site", "floorplan", "vision", "modules", "renders", "materials", "products", "cost", "next"];

describe("PDF document (ST23–ST26)", () => {
  it("renders; page count = slides + extra module page + render pages (curated)", async () => {
    const buf = await renderToBuffer(
      <PresentationDocument
        template="minimal"
        slides={ALL.map((id) => ({ id, label: id, enabled: true }))}
        projectName="Smoke Test 1.03"
        clientName=""
        modules={modules}
        stats={{ totalModules: 9, totalArea: 81, usableArea: 52, sharedWalls: 12, moduleCost: 1, sharedWallDiscount: 0, wallUpgradeCost: 0, designFee: 0, totalEstimate: 1 }}
        style={null}
        finishLabel="Standard"
        polygon={[]}
        mapCenter={{ lat: 44.4, lng: 26.1 }}
        products={[]}
        savedRenders={savedRenders}
      />,
    );
    const pdfText = buf.toString("latin1");
    const pageCount = (pdfText.match(/\/Type\s*\/Page[^s]/g) || []).length;
    // 11 slides, + 1 (Module Details 2/2, ST24), renders: identical images dedupe to 1 → 1 page
    expect(pageCount).toBe(12);
    expect(buf.length).toBeLessThan(500_000);
  }, 30_000);
});
