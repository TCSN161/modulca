import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_PRICES } from "@/features/pricing/fallback-prices";
import type {
  MaterialPrice,
  MaterialCategory,
  PriceUpdateItem,
} from "@/features/pricing/types";
import { MATERIAL_CATEGORIES, MATERIAL_UNITS } from "@/features/pricing/types";

export const dynamic = "force-dynamic";

/**
 * Material pricing API.
 *
 * GET  /api/pricing              → all prices
 * GET  /api/pricing?category=X   → prices filtered by category
 * GET  /api/pricing?ids=a,b,c    → prices for specific material IDs
 * POST /api/pricing              → batch import (JSON or CSV)
 *
 * Server-side prices are served from a Map that starts with fallback data.
 * When scrapers or CSV imports update prices, they are stored here and
 * returned with higher confidence levels.
 *
 * Future: plug in scraper workers for Dedeman, Hornbach, MatHaus via
 * the SCRAPER_ENDPOINTS placeholder below.
 */

// ─── In-Memory Price Cache (server-side) ─────────────────────

const priceCache = new Map<string, MaterialPrice>();

// Seed with fallback prices on cold start
for (const p of FALLBACK_PRICES) {
  priceCache.set(p.id, p);
}

/** Timestamp of last cache population */
let lastCacheUpdate = new Date().toISOString();

// ─── Scraper Placeholder ─────────────────────────────────────

/**
 * Future scraper integration points.
 * Each entry maps a source ID to a scraping function that returns
 * price updates. These would be called by a cron job or on-demand
 * from the admin panel.
 *
 * Example implementation:
 *
 *   async function scrapeDedeman(): Promise<PriceUpdateItem[]> {
 *     const response = await fetch("https://www.dedeman.ro/api/...");
 *     const data = await response.json();
 *     return data.products.map(p => ({
 *       materialId: mapDedemanId(p.sku),
 *       name: p.name,
 *       nameRo: p.name,
 *       category: mapDedemanCategory(p.category),
 *       unit: mapDedemanUnit(p.unit),
 *       priceEUR: p.priceRON / EUR_RON_RATE,
 *       supplier: "Dedeman",
 *       sourceUrl: p.url,
 *     }));
 *   }
 */
interface ScraperEndpoint {
  sourceId: string;
  name: string;
  enabled: boolean;
  /** Future: the actual scraping function */
  // scrape: () => Promise<PriceUpdateItem[]>;
}

const _SCRAPER_ENDPOINTS: ScraperEndpoint[] = [
  { sourceId: "src-dedeman", name: "Dedeman", enabled: false },
  { sourceId: "src-hornbach", name: "Hornbach", enabled: false },
  { sourceId: "src-mathaus", name: "MatHaus", enabled: false },
  { sourceId: "src-leroy-merlin", name: "Leroy Merlin", enabled: false },
];

// Suppress unused variable warning — endpoints are a placeholder for future scrapers
void _SCRAPER_ENDPOINTS;

// ─── GET Handler ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryFilter = searchParams.get("category") as MaterialCategory | null;
    const idsParam = searchParams.get("ids");

    let results: MaterialPrice[];

    if (idsParam) {
      // Filter by specific IDs
      const ids = idsParam.split(",").map((s) => s.trim());
      results = ids
        .map((id) => priceCache.get(id))
        .filter((p): p is MaterialPrice => p !== undefined);
    } else if (categoryFilter && MATERIAL_CATEGORIES.includes(categoryFilter)) {
      // Filter by category
      results = [];
      priceCache.forEach((p) => {
        if (p.category === categoryFilter) results.push(p);
      });
    } else {
      // Return all
      results = Array.from(priceCache.values());
    }

    // Sort by category then name
    results.sort((a, b) => {
      const catCmp = a.category.localeCompare(b.category);
      return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      count: results.length,
      lastUpdated: lastCacheUpdate,
      prices: results,
    });
  } catch (error) {
    console.error("[api/pricing] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }
}

// ─── POST Handler ────────────────────────────────────────────

interface PostBody {
  format: "json" | "csv";
  /** JSON array of PriceUpdateItem (when format=json) */
  items?: PriceUpdateItem[];
  /** Raw CSV string (when format=csv) */
  csv?: string;
  /** Source identifier */
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostBody;
    const { format, source } = body;
    const timestamp = new Date().toISOString();
    let imported = 0;
    const errors: string[] = [];

    if (format === "json" && body.items) {
      for (const item of body.items) {
        const validation = validatePriceItem(item);
        if (validation) {
          errors.push(`${item.materialId}: ${validation}`);
          continue;
        }

        priceCache.set(item.materialId, {
          id: item.materialId,
          name: item.name,
          nameRo: item.nameRo,
          category: item.category,
          unit: item.unit,
          priceEUR: item.priceEUR,
          supplier: item.supplier || source || "api",
          lastUpdated: timestamp,
          confidence: "live",
          sourceUrl: item.sourceUrl || "",
          variant: item.variant,
        });
        imported++;
      }
    } else if (format === "csv" && body.csv) {
      const result = parseAndImportCSV(body.csv, source || "csv-upload", timestamp);
      imported = result.imported;
      errors.push(...result.errors);
    } else {
      return NextResponse.json(
        { error: "Request must include format ('json'|'csv') and corresponding data (items or csv)" },
        { status: 400 },
      );
    }

    lastCacheUpdate = timestamp;

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.length > 0 ? errors : undefined,
      totalPrices: priceCache.size,
      lastUpdated: timestamp,
    });
  } catch (error) {
    console.error("[api/pricing] POST error:", error);
    return NextResponse.json(
      { error: "Failed to import prices" },
      { status: 500 },
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function validatePriceItem(item: PriceUpdateItem): string | null {
  if (!item.materialId || typeof item.materialId !== "string") {
    return "missing materialId";
  }
  if (!item.name || typeof item.name !== "string") {
    return "missing name";
  }
  if (typeof item.priceEUR !== "number" || item.priceEUR < 0) {
    return "invalid priceEUR";
  }
  if (!MATERIAL_CATEGORIES.includes(item.category)) {
    return `invalid category "${item.category}"`;
  }
  if (!MATERIAL_UNITS.includes(item.unit)) {
    return `invalid unit "${item.unit}"`;
  }
  return null;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseAndImportCSV(
  csvData: string,
  source: string,
  timestamp: string,
): { imported: number; errors: string[] } {
  const lines = csvData.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { imported: 0, errors: ["CSV has no data rows"] };

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const colMap = (name: string) => header.indexOf(name);

  const idIdx = colMap("id");
  const nameIdx = colMap("name");
  const nameRoIdx = colMap("namero");
  const catIdx = colMap("category");
  const unitIdx = colMap("unit");
  const priceIdx = colMap("priceeur");
  const supplierIdx = colMap("supplier");
  const urlIdx = colMap("sourceurl");
  const variantIdx = colMap("variant");

  if (idIdx === -1 || nameIdx === -1 || priceIdx === -1) {
    return { imported: 0, errors: ["CSV must have at least: id, name, priceEUR columns"] };
  }

  const errors: string[] = [];
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const rowNum = i + 1;

    const id = cols[idIdx];
    const name = cols[nameIdx];
    const priceStr = cols[priceIdx];

    if (!id || !name) {
      errors.push(`Row ${rowNum}: missing id or name`);
      continue;
    }

    const priceEUR = parseFloat(priceStr);
    if (isNaN(priceEUR) || priceEUR < 0) {
      errors.push(`Row ${rowNum}: invalid price "${priceStr}"`);
      continue;
    }

    const categoryRaw = catIdx >= 0 ? cols[catIdx] : "";
    const isValidCat = (v: string): v is MaterialCategory =>
      (MATERIAL_CATEGORIES as readonly string[]).includes(v);
    const category: MaterialCategory = isValidCat(categoryRaw) ? categoryRaw : "structure";

    const unitRaw = unitIdx >= 0 ? cols[unitIdx] : "";
    type MU = typeof MATERIAL_UNITS[number];
    const isValidUnit = (v: string): v is MU =>
      (MATERIAL_UNITS as readonly string[]).includes(v);
    const unit = isValidUnit(unitRaw) ? unitRaw : "m2" as const;

    priceCache.set(id, {
      id,
      name,
      nameRo: nameRoIdx >= 0 ? cols[nameRoIdx] || name : name,
      category,
      unit,
      priceEUR,
      supplier: supplierIdx >= 0 ? cols[supplierIdx] || source : source,
      lastUpdated: timestamp,
      confidence: "estimated",
      sourceUrl: urlIdx >= 0 ? cols[urlIdx] || "" : "",
      variant: variantIdx >= 0 ? cols[variantIdx] : undefined,
    });
    imported++;
  }

  return { imported, errors };
}
