/**
 * Region Registry — Auto-discovers country modules in 06-regulations/
 *
 * Each country is a subfolder with a _meta.yaml file.
 * This registry reads all _meta.yaml files and provides:
 *   - List of all available regions
 *   - Lookup by country code
 *   - Filter by market status or content status
 *
 * MODULAR: To add a new country, create a folder (e.g. AT/) with _meta.yaml.
 * The build script calls discoverRegions() which reads the file system.
 * At runtime, we use the pre-built REGIONS constant from _index.ts.
 */

import type { KBRegion, KBMarketStatus, KBContentStatus } from "../_types";

/**
 * Runtime region data — populated by the build script.
 * Import from _index.ts for the built version.
 * This file provides the discovery logic used at build time.
 */

/**
 * Parse a _meta.yaml file content into a KBRegion object.
 * Used by the build script.
 */
export function parseRegionMeta(
  yamlContent: Record<string, unknown>
): KBRegion {
  return {
    name: String(yamlContent.name || ""),
    code: String(yamlContent.code || ""),
    flag: String(yamlContent.flag || ""),
    language: String(yamlContent.language || "en"),
    status: (yamlContent.status as KBContentStatus) || "planned",
    market: (yamlContent.market as KBMarketStatus) || "future",
    currency: String(yamlContent.currency || "EUR"),
    standardsBody: String(yamlContent.standards_body || ""),
    keyLegislation: Array.isArray(yamlContent.key_legislation)
      ? yamlContent.key_legislation.map(String)
      : [],
  };
}

/**
 * Filter regions by market status.
 */
export function filterByMarket(
  regions: KBRegion[],
  market: KBMarketStatus
): KBRegion[] {
  return regions.filter((r) => r.market === market);
}

/**
 * Filter regions by content status.
 */
export function filterByStatus(
  regions: KBRegion[],
  status: KBContentStatus
): KBRegion[] {
  return regions.filter((r) => r.status === status);
}

/**
 * Get a region by its ISO code.
 */
export function getRegionByCode(
  regions: KBRegion[],
  code: string
): KBRegion | undefined {
  return regions.find((r) => r.code === code.toUpperCase());
}

/**
 * Known folder names that are NOT country codes (skip during discovery).
 */
export const RESERVED_FOLDERS = new Set([
  "_shared",
  "_template",
]);
