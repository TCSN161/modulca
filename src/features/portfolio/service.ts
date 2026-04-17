/**
 * Portfolio service — Supabase fetch with hardcoded fallback.
 *
 * All functions are safe to call from Server Components (RSC).
 * If Supabase is misconfigured or unreachable, they return curated fallback
 * data so the portfolio page always renders something useful.
 *
 * Strategy:
 *   - Use the anon key (public-read policy is enabled on featured_projects)
 *   - Cache for 1 hour via Next.js ISR (set at page-level with `revalidate`)
 *   - Fallback to FALLBACK_PROJECTS if fetch fails or returns empty
 */

import { createClient } from "@supabase/supabase-js";
import type { PortfolioProject } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Read-only Supabase client (anon key). Null if not configured. */
function getReadClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Transform a raw Supabase row into our domain PortfolioProject type */
function rowToProject(row: Record<string, unknown>): PortfolioProject {
  return {
    slug: row.slug as string,
    title: row.title as string,
    subtitle: (row.subtitle as string) || undefined,
    description: (row.description as string) || "",
    location: (row.location as string) || "",
    country: extractCountry((row.location as string) || ""),
    areaSqm: Number(row.area_sqm) || 0,
    moduleCount: Number(row.module_count) || 0,
    estimatedCostEur: Number(row.estimated_cost_eur) || 0,
    assemblyDurationDays: Number(row.assembly_duration_days) || 0,
    tags: (row.tags as string[]) || [],
    heroImageUrl: (row.hero_image_url as string) || "",
    galleryImageUrls: (row.gallery_image_urls as string[]) || [],
    highlights: (row.highlights as string[]) || [],
    styleDirection: (row.design_data as Record<string, unknown>)?.styleDirection as string | undefined,
    designData: (row.design_data as Record<string, unknown>) || undefined,
    displayOrder: Number(row.display_order) || 0,
  };
}

function extractCountry(location: string): string {
  const parts = location.split(",").map((s) => s.trim());
  return parts[parts.length - 1] || "";
}

/**
 * Fetch all published featured projects, sorted by display_order.
 * Falls back to the hardcoded list if Supabase is down or empty.
 */
export async function listPortfolioProjects(): Promise<PortfolioProject[]> {
  const sb = getReadClient();
  if (!sb) return FALLBACK_PROJECTS;

  try {
    const { data, error } = await sb
      .from("featured_projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[portfolio] Supabase fetch failed, using fallback:", error.message);
      return FALLBACK_PROJECTS;
    }

    if (!data || data.length === 0) {
      console.info("[portfolio] No rows in featured_projects, using fallback");
      return FALLBACK_PROJECTS;
    }

    return data.map(rowToProject);
  } catch (err) {
    console.warn("[portfolio] Fetch threw, using fallback:", err);
    return FALLBACK_PROJECTS;
  }
}

/** Fetch a single project by slug (for detail pages) */
export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const sb = getReadClient();
  if (!sb) return FALLBACK_PROJECTS.find((p) => p.slug === slug) || null;

  try {
    const { data, error } = await sb
      .from("featured_projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_PROJECTS.find((p) => p.slug === slug) || null;
    }

    return rowToProject(data as Record<string, unknown>);
  } catch {
    return FALLBACK_PROJECTS.find((p) => p.slug === slug) || null;
  }
}

/** Get all slugs (for generateStaticParams) */
export async function getAllPortfolioSlugs(): Promise<string[]> {
  const projects = await listPortfolioProjects();
  return projects.map((p) => p.slug);
}

/* ═══════════════════════════════════════════════════════════════
   FALLBACK DATA — kept in sync with seed-demo-projects.mjs
   Used when Supabase is unreachable. Small, quick-loading subset.
   ═══════════════════════════════════════════════════════════════ */

export const FALLBACK_PROJECTS: PortfolioProject[] = [
  {
    slug: "riverside-cabin",
    title: "Riverside Cabin",
    subtitle: "Compact family retreat on the Someș river",
    description:
      "A six-module L-shaped cabin on the banks of the Someș river. The longer wing houses an open living / kitchen area with panoramic views, while the shorter wing holds two cozy bedrooms tucked away from the water.",
    location: "Cluj-Napoca, Romania",
    country: "Romania",
    areaSqm: 54,
    moduleCount: 6,
    estimatedCostEur: 64800,
    assemblyDurationDays: 18,
    tags: ["Residential", "2 Bedrooms", "CLT", "Passive House"],
    heroImageUrl: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80",
    galleryImageUrls: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80"],
    highlights: ["Passive house certified", "Solar panels integrated", "Built in 18 days on-site"],
    styleDirection: "scandinavian",
    displayOrder: 10,
  },
  {
    slug: "urban-studio",
    title: "Urban Studio Loft",
    subtitle: "Minimalist studio for short-term rental",
    description:
      "Three modules in a straight line maximize the narrow lot while delivering a full kitchen, bathroom, and sleeping area with 3.1m ceilings.",
    location: "Bucharest, Romania",
    country: "Romania",
    areaSqm: 27,
    moduleCount: 3,
    estimatedCostEur: 36000,
    assemblyDurationDays: 10,
    tags: ["Studio", "Urban", "Rental"],
    heroImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    highlights: ["Airbnb-ready in 2 weeks", "ROI in 18 months", "Zero waste construction"],
    styleDirection: "industrial",
    displayOrder: 20,
  },
  {
    slug: "family-courtyard",
    title: "Family Courtyard House",
    subtitle: "U-shaped family home around a central garden",
    description:
      "Twelve modules forming a U-shape around a protected central courtyard. Day and night zones naturally separate, and every room opens to the outdoor space.",
    location: "Sibiu, Romania",
    country: "Romania",
    areaSqm: 108,
    moduleCount: 12,
    estimatedCostEur: 129600,
    assemblyDurationDays: 35,
    tags: ["Family", "3 Bedrooms", "Courtyard"],
    heroImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    highlights: [
      "U-shape creates private courtyard",
      "Cross-ventilation in every room",
      "Traditional Romanian proportions",
    ],
    styleDirection: "warm-contemporary",
    displayOrder: 30,
  },
  {
    slug: "eco-lodge",
    title: "Eco-Lodge Retreat",
    subtitle: "Off-grid mountain lodge in the Carpathians",
    description: "A self-sufficient mountain lodge designed for eco-tourism. Five modules with premium timber finishes, a green roof, and integrated solar make this a zero-energy retreat.",
    location: "Brașov County, Romania",
    country: "Romania",
    areaSqm: 45,
    moduleCount: 5,
    estimatedCostEur: 67500,
    assemblyDurationDays: 14,
    tags: ["Hospitality", "Eco", "Off-Grid"],
    heroImageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
    highlights: ["Off-grid solar + battery", "Green roof with local flora", "Premium CLT interior exposed"],
    styleDirection: "biophilic",
    displayOrder: 40,
  },
  {
    slug: "office-pod",
    title: "Garden Office Pod",
    subtitle: "Backyard work-from-home pod",
    description: "A work-from-home pod placed in the backyard. Two modules with floor-to-ceiling glazing and acoustic insulation create a professional workspace steps from home.",
    location: "Timișoara, Romania",
    country: "Romania",
    areaSqm: 18,
    moduleCount: 2,
    estimatedCostEur: 24000,
    assemblyDurationDays: 5,
    tags: ["Office", "Compact", "WFH"],
    heroImageUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&q=80",
    highlights: ["Delivered fully finished", "No building permit needed (<50m²)", "Fiber-ready with cable routing"],
    styleDirection: "industrial",
    displayOrder: 50,
  },
  {
    slug: "duplex-rental",
    title: "Modular Duplex",
    subtitle: "Two mirrored rental apartments",
    description: "Eight modules split into two mirrored 4-module apartments sharing a central utility wall. Designed as a buy-to-let investment.",
    location: "Iași, Romania",
    country: "Romania",
    areaSqm: 72,
    moduleCount: 8,
    estimatedCostEur: 96000,
    assemblyDurationDays: 28,
    tags: ["Investment", "Duplex", "Rental"],
    heroImageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    highlights: ["Dual rental income", "Shared infrastructure saves 15%", "Each unit fully independent"],
    styleDirection: "scandinavian",
    displayOrder: 60,
  },
];
