/**
 * Portfolio types — shared between Supabase rows and hardcoded fallback.
 * Keep this file pure-types (no runtime imports) so it can be used by
 * both Server Components and Client Components.
 */

/** A single published showcase project. */
export interface PortfolioProject {
  /** URL-safe unique identifier (e.g., "riverside-cabin") */
  slug: string;

  /** Display name */
  title: string;

  /** Short tagline under the title */
  subtitle?: string;

  /** Markdown-capable long description */
  description: string;

  /** Human-readable location, e.g., "Cluj-Napoca, Romania" */
  location: string;

  /** Country ISO-ish label for filtering, e.g., "Romania" */
  country?: string;

  /** Floor area in square meters */
  areaSqm: number;

  /** Number of 3×3m modules */
  moduleCount: number;

  /** Estimated total build cost in EUR */
  estimatedCostEur: number;

  /** On-site assembly time in days */
  assemblyDurationDays: number;

  /** Chips shown on the card (e.g., ["Residential", "2 Bedrooms", "CLT"]) */
  tags: string[];

  /** Main hero image URL (1200×800 recommended) */
  heroImageUrl: string;

  /** Optional gallery for detail page */
  galleryImageUrls?: string[];

  /** Bullet points shown on detail page */
  highlights: string[];

  /** Style direction id from design/styles.ts (e.g., "scandinavian") */
  styleDirection?: string;

  /**
   * Full configurator state so the user can "Clone this project"
   * and continue editing in the designer.
   * Shape matches src/features/design/store.ts DesignState.
   */
  designData?: Record<string, unknown>;

  /** Display order — lower = shown first */
  displayOrder: number;
}

/** Stats badge tuple for compact display */
export interface ProjectStat {
  label: string;
  value: string;
}

/** Cost formatter — EUR with thousands separator and no decimals */
export function formatEur(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Build the 4 canonical stat badges for a project */
export function buildProjectStats(p: PortfolioProject): ProjectStat[] {
  return [
    { label: "Area", value: `${p.areaSqm} m²` },
    { label: "Modules", value: String(p.moduleCount) },
    { label: "Cost", value: formatEur(p.estimatedCostEur) },
    { label: "Assembly", value: `${p.assemblyDurationDays} days` },
  ];
}
