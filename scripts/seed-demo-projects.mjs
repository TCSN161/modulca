#!/usr/bin/env node
/**
 * ModulCA — Featured Projects Seeder
 *
 * Populates `public.featured_projects` with 10 curated showcase projects.
 * These are public (no login required) and displayed on the landing and
 * /portfolio pages.
 *
 * Usage:
 *   node scripts/seed-demo-projects.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Alternative approaches considered:
 *
 *   ┌─────────────────────────────────┬────────────┬─────────────┬──────────┐
 *   │ Approach                        │ Reusable   │ Testable    │ DX       │
 *   ├─────────────────────────────────┼────────────┼─────────────┼──────────┤
 *   │ Hardcoded in React components   │ No         │ No          │ Fast     │
 *   │ supabase/seed.sql (auto reset)  │ Dev only   │ Limited     │ Medium   │
 * ✓ │ Node script + service role      │ Yes        │ Yes         │ Good     │
 *   │ Admin panel UI                  │ Yes        │ Yes         │ Slow     │
 *   │ Contentful / Sanity CMS         │ Yes        │ Partial     │ $$$      │
 *   └─────────────────────────────────┴────────────┴─────────────┴──────────┘
 *
 * Why Node script:
 *   1. Version-controlled in git (same source of truth as code)
 *   2. Can run locally (for dev) or in CI/CD (for staging/production)
 *   3. Idempotent — upserts by slug, safe to rerun
 *   4. Generates real design_data JSON compatible with the full 13-step flow
 *      so users can actually click "Clone this project" and continue editing.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (Next.js normally handles this)
try {
  const envPath = join(__dirname, "..", ".env.local");
  const envText = readFileSync(envPath, "utf-8");
  for (const line of envText.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, "").trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {
  /* ignore — env may be set externally */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE env vars. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

/* ─── Helper: build a minimal but valid design state ──────────────── */

/** Create a module config with sensible defaults for seed data */
function mkModule(row, col, moduleType, label, layoutPreset, opts = {}) {
  return {
    row,
    col,
    moduleType,
    label,
    layoutPreset,
    floorFinish: opts.floor || "oak-natural",
    wallColor: opts.wall || "pure-white",
    furnitureOverrides: {},
    wallConfigs: opts.walls || {
      north: row === 0 ? "solid" : "none",
      south: "solid",
      east: "solid",
      west: col === 0 ? "solid" : "none",
    },
  };
}

/* ─── 10 curated featured projects ───────────────────────────────── */

const FEATURED_PROJECTS = [
  {
    slug: "riverside-cabin",
    title: "Riverside Cabin",
    subtitle: "Compact family retreat on the Someș river",
    description: "A six-module L-shaped cabin on the banks of the Someș river. The longer wing houses an open living / kitchen area with panoramic views, while the shorter wing holds two cozy bedrooms tucked away from the water. Built in 18 days on-site with passive-house-certified envelope and integrated solar.",
    location: "Cluj-Napoca, Romania",
    area_sqm: 54,
    module_count: 6,
    estimated_cost_eur: 64800,
    assembly_duration_days: 18,
    tags: ["Residential", "2 Bedrooms", "CLT", "Passive House"],
    hero_image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80",
    gallery_image_urls: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
    ],
    highlights: [
      "Passive house certified",
      "Solar panels integrated",
      "Built in 18 days on-site",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "living", "Living & Kitchen", "open-loft"),
        mkModule(0, 1, "living", "Dining", "dining-zone"),
        mkModule(0, 2, "living", "Lounge", "lounge-zone"),
        mkModule(1, 0, "bedroom", "Master Bedroom", "queen-centered"),
        mkModule(1, 1, "bedroom", "Second Bedroom", "twin-beds"),
        mkModule(1, 2, "bathroom", "Bathroom", "full-bath"),
      ],
      styleDirection: "scandinavian",
      finishLevel: "mid",
    },
    display_order: 10,
  },
  {
    slug: "urban-studio",
    title: "Urban Studio Loft",
    subtitle: "Minimalist studio for short-term rental",
    description: "Three modules in a straight line maximize the narrow lot while delivering a full kitchen, bathroom, and sleeping area with 3.1m ceilings. Designed specifically as a buy-to-let Airbnb investment with ROI projections under 18 months.",
    location: "Bucharest, Romania",
    area_sqm: 27,
    module_count: 3,
    estimated_cost_eur: 36000,
    assembly_duration_days: 10,
    tags: ["Studio", "Urban", "Rental"],
    hero_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Airbnb-ready in 2 weeks",
      "ROI in 18 months",
      "Zero waste construction",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "living", "Living + Kitchen", "kitchen-compact"),
        mkModule(0, 1, "bedroom", "Bedroom", "queen-centered"),
        mkModule(0, 2, "bathroom", "Bathroom", "compact-bath"),
      ],
      styleDirection: "industrial",
      finishLevel: "mid",
    },
    display_order: 20,
  },
  {
    slug: "family-courtyard",
    title: "Family Courtyard House",
    subtitle: "U-shaped family home around a central garden",
    description: "Twelve modules forming a U-shape around a protected central courtyard. Day and night zones naturally separate, and every room opens to the outdoor space. Traditional Romanian proportions inspired the 3:4:3 module spacing.",
    location: "Sibiu, Romania",
    area_sqm: 108,
    module_count: 12,
    estimated_cost_eur: 129600,
    assembly_duration_days: 35,
    tags: ["Family", "3 Bedrooms", "Courtyard"],
    hero_image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "U-shape creates private courtyard",
      "Cross-ventilation in every room",
      "Traditional Romanian proportions",
    ],
    design_data: {
      modules: [
        // North wing — day zone
        mkModule(0, 0, "living", "Living Room", "lounge-zone"),
        mkModule(0, 1, "living", "Dining", "dining-zone"),
        mkModule(0, 2, "living", "Kitchen", "kitchen-compact"),
        mkModule(0, 3, "utility", "Entry", "hallway"),
        // West wing — parents
        mkModule(1, 0, "bedroom", "Master Bedroom", "queen-centered"),
        mkModule(2, 0, "bathroom", "Master Bath", "full-bath"),
        // East wing — kids
        mkModule(1, 3, "bedroom", "Child Bedroom 1", "twin-beds"),
        mkModule(2, 3, "bedroom", "Child Bedroom 2", "twin-beds"),
        mkModule(3, 3, "bathroom", "Kids Bath", "compact-bath"),
        // South wing — utility
        mkModule(3, 0, "utility", "Laundry", "utility-compact"),
        mkModule(3, 1, "utility", "Storage", "utility-compact"),
        mkModule(3, 2, "utility", "Mudroom", "hallway"),
      ],
      styleDirection: "warm-contemporary",
      finishLevel: "high",
    },
    display_order: 30,
  },
  {
    slug: "eco-lodge",
    title: "Eco-Lodge Retreat",
    subtitle: "Off-grid mountain lodge in the Carpathians",
    description: "A self-sufficient mountain lodge designed for eco-tourism. Five modules with premium timber finishes, a green roof, and integrated solar make this a zero-energy retreat. Glazing oriented east captures the sunrise over the mountains.",
    location: "Brașov County, Romania",
    area_sqm: 45,
    module_count: 5,
    estimated_cost_eur: 67500,
    assembly_duration_days: 14,
    tags: ["Hospitality", "Eco", "Off-Grid"],
    hero_image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Off-grid solar + battery",
      "Green roof with local flora",
      "Premium CLT interior exposed",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "living", "Great Room", "open-loft"),
        mkModule(0, 1, "living", "Dining", "dining-zone"),
        mkModule(1, 0, "bedroom", "Master Bedroom", "queen-centered"),
        mkModule(1, 1, "bathroom", "Bathroom", "full-bath"),
        mkModule(0, 2, "utility", "Kitchen", "kitchen-compact"),
      ],
      styleDirection: "biophilic",
      finishLevel: "high",
    },
    display_order: 40,
  },
  {
    slug: "office-pod",
    title: "Garden Office Pod",
    subtitle: "Backyard work-from-home pod",
    description: "A work-from-home pod placed in the backyard of an existing property. Two modules with floor-to-ceiling glazing on one side and acoustic insulation create a professional workspace steps from home. Under 50m² — no building permit needed.",
    location: "Timișoara, Romania",
    area_sqm: 18,
    module_count: 2,
    estimated_cost_eur: 24000,
    assembly_duration_days: 5,
    tags: ["Office", "Compact", "WFH"],
    hero_image_url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Delivered fully finished",
      "No building permit needed (<50m²)",
      "Fiber-ready with cable routing",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "office", "Main Desk", "desk-double"),
        mkModule(0, 1, "office", "Meeting Nook", "meeting-nook"),
      ],
      styleDirection: "industrial",
      finishLevel: "mid",
    },
    display_order: 50,
  },
  {
    slug: "duplex-rental",
    title: "Modular Duplex",
    subtitle: "Two mirrored rental apartments",
    description: "Eight modules split into two mirrored 4-module apartments sharing a central utility wall. Designed as a buy-to-let investment with separate entrances. Each unit has a bedroom, bathroom, kitchen-living, and private terrace.",
    location: "Iași, Romania",
    area_sqm: 72,
    module_count: 8,
    estimated_cost_eur: 96000,
    assembly_duration_days: 28,
    tags: ["Investment", "Duplex", "Rental"],
    hero_image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Dual rental income",
      "Shared infrastructure saves 15%",
      "Each unit fully independent",
    ],
    design_data: {
      modules: [
        // Unit A
        mkModule(0, 0, "living", "Unit A — Living", "kitchen-compact"),
        mkModule(0, 1, "bedroom", "Unit A — Bedroom", "queen-centered"),
        mkModule(1, 0, "bathroom", "Unit A — Bath", "compact-bath"),
        mkModule(1, 1, "utility", "Unit A — Utility", "utility-compact"),
        // Unit B (mirrored)
        mkModule(0, 2, "living", "Unit B — Living", "kitchen-compact"),
        mkModule(0, 3, "bedroom", "Unit B — Bedroom", "queen-centered"),
        mkModule(1, 2, "utility", "Unit B — Utility", "utility-compact"),
        mkModule(1, 3, "bathroom", "Unit B — Bath", "compact-bath"),
      ],
      styleDirection: "scandinavian",
      finishLevel: "mid",
    },
    display_order: 60,
  },
  {
    slug: "tiny-house",
    title: "Nomad Tiny House",
    subtitle: "54m² movable home on a flatbed",
    description: "A compact 4-module home designed to be transported on a flatbed trailer. Perfect for Airbnb glamping sites, temporary construction housing, or as a guest house. Includes integrated water tanks and off-grid solar.",
    location: "Cluj County, Romania",
    area_sqm: 36,
    module_count: 4,
    estimated_cost_eur: 48000,
    assembly_duration_days: 3,
    tags: ["Movable", "Tiny House", "Off-Grid"],
    hero_image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Transportable on flatbed",
      "Off-grid capable (solar + water tank)",
      "Assembly in 3 days",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "living", "Living / Kitchen", "kitchen-compact"),
        mkModule(0, 1, "living", "Dining Nook", "dining-zone"),
        mkModule(1, 0, "bedroom", "Loft Bedroom", "queen-centered"),
        mkModule(1, 1, "bathroom", "Bathroom", "compact-bath"),
      ],
      styleDirection: "japanese-wabi-sabi",
      finishLevel: "mid",
    },
    display_order: 70,
  },
  {
    slug: "accessible-bungalow",
    title: "Accessible Bungalow",
    subtitle: "Single-level ADA-compliant family home",
    description: "Seven single-level modules arranged in a cross shape. Wide doorways (90cm), zero thresholds, walk-in shower, and wheelchair-accessible kitchen. Ideal for aging-in-place or multi-generational living.",
    location: "Oradea, Romania",
    area_sqm: 63,
    module_count: 7,
    estimated_cost_eur: 75600,
    assembly_duration_days: 21,
    tags: ["Accessible", "ADA", "Aging-in-place"],
    hero_image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Wheelchair accessible throughout",
      "Zero-threshold walk-in shower",
      "Wide corridors (130cm)",
    ],
    design_data: {
      modules: [
        mkModule(1, 0, "living", "Living Room", "lounge-zone"),
        mkModule(1, 1, "living", "Dining", "dining-zone"),
        mkModule(1, 2, "living", "Kitchen", "kitchen-compact"),
        mkModule(0, 1, "bedroom", "Master Bedroom", "queen-accessible"),
        mkModule(2, 1, "bedroom", "Guest Bedroom", "queen-centered"),
        mkModule(0, 2, "bathroom", "Master Bath", "accessible-bath"),
        mkModule(2, 2, "utility", "Laundry", "utility-compact"),
      ],
      styleDirection: "warm-contemporary",
      finishLevel: "mid",
    },
    display_order: 80,
  },
  {
    slug: "vineyard-guesthouse",
    title: "Vineyard Guest House",
    subtitle: "Romantic 2-module retreat among the vines",
    description: "Two modules placed at the edge of a working vineyard in Dealu Mare. Full-height glass walls on three sides give 180° views of the rolling hills. Perfect for a romantic getaway or wine-tasting accommodation.",
    location: "Dealu Mare, Romania",
    area_sqm: 18,
    module_count: 2,
    estimated_cost_eur: 28000,
    assembly_duration_days: 5,
    tags: ["Hospitality", "Luxury", "Romantic"],
    hero_image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "180° panoramic glazing",
      "Wine cellar integrated",
      "2-day assembly on-site",
    ],
    design_data: {
      modules: [
        mkModule(0, 0, "living", "Living / Kitchenette", "kitchen-compact"),
        mkModule(0, 1, "bedroom", "Bedroom + Ensuite", "queen-ensuite"),
      ],
      styleDirection: "mediterranean",
      finishLevel: "high",
    },
    display_order: 90,
  },
  {
    slug: "eco-village",
    title: "Eco-Village Starter",
    subtitle: "Three-unit micro-community cluster",
    description: "A cluster of three identical 5-module units arranged around a shared outdoor deck. Designed for intentional living communities, co-housing projects, or agri-tourism villages. Shared laundry, garden, and fire-pit reduce total build cost by 22%.",
    location: "Maramureș, Romania",
    area_sqm: 135,
    module_count: 15,
    estimated_cost_eur: 162000,
    assembly_duration_days: 42,
    tags: ["Community", "Multi-unit", "Shared"],
    hero_image_url: "https://images.unsplash.com/photo-1542928658-22251e208ac1?w=1200&q=80",
    gallery_image_urls: [],
    highlights: [
      "Shared amenities (-22% cost)",
      "3 independent dwelling units",
      "Solar microgrid ready",
    ],
    design_data: {
      modules: [
        // Unit 1
        mkModule(0, 0, "living", "Unit 1 Living", "kitchen-compact"),
        mkModule(0, 1, "bedroom", "Unit 1 Bed", "queen-centered"),
        mkModule(0, 2, "bathroom", "Unit 1 Bath", "compact-bath"),
        // Unit 2
        mkModule(1, 0, "living", "Unit 2 Living", "kitchen-compact"),
        mkModule(1, 1, "bedroom", "Unit 2 Bed", "queen-centered"),
        mkModule(1, 2, "bathroom", "Unit 2 Bath", "compact-bath"),
        // Unit 3
        mkModule(2, 0, "living", "Unit 3 Living", "kitchen-compact"),
        mkModule(2, 1, "bedroom", "Unit 3 Bed", "queen-centered"),
        mkModule(2, 2, "bathroom", "Unit 3 Bath", "compact-bath"),
      ],
      styleDirection: "biophilic",
      finishLevel: "mid",
    },
    display_order: 100,
  },
];

/* ─── Main ────────────────────────────────────────────────────────── */

async function main() {
  console.log(`\n🌱 ModulCA Featured Projects Seeder`);
  console.log(`   Target: ${SUPABASE_URL}`);
  console.log(`   Projects: ${FEATURED_PROJECTS.length}\n`);

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const project of FEATURED_PROJECTS) {
    process.stdout.write(`📦 ${project.slug.padEnd(24)} `);

    const { data: existing } = await supabase
      .from("featured_projects")
      .select("id")
      .eq("slug", project.slug)
      .maybeSingle();

    const payload = { ...project, updated_at: new Date().toISOString() };

    const { error } = existing
      ? await supabase.from("featured_projects").update(payload).eq("id", existing.id)
      : await supabase.from("featured_projects").insert(payload);

    if (error) {
      console.log(`✗ ${error.message}`);
      failed++;
    } else if (existing) {
      console.log(`↻ updated`);
      updated++;
    } else {
      console.log(`✓ inserted`);
      inserted++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Inserted:  ${inserted}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failed > 0) {
    console.log(`⚠  Some projects failed. Check the Supabase dashboard.`);
    console.log(`   Did you run migration 006_featured_projects.sql first?`);
    process.exit(1);
  }

  console.log(`✓ Done. View at https://www.modulca.eu/portfolio\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
