/**
 * ModulCA Knowledge Library — Taxonomy
 *
 * Category definitions for all knowledge domains.
 * The build script uses folder names as IDs, but this file provides
 * human-readable labels, icons, and display metadata.
 *
 * MODULAR: To add a new domain, create a numbered folder (e.g. 15-new-topic/)
 * and add an entry here. The build script auto-discovers articles inside.
 */

import type { KBCategory } from "./_types";

/**
 * Static category metadata.
 * `id` must match the folder name suffix (e.g. "fundamentals" for "01-fundamentals/").
 * `order` must match the folder prefix number.
 */
export const CATEGORY_DEFINITIONS: Omit<KBCategory, "articleCount">[] = [
  {
    id: "modulca",
    label: "ModulCA Platform",
    icon: "🏠",
    order: 0,
    hasRegions: false,
  },
  {
    id: "fundamentals",
    label: "Fundamentals of Architecture",
    icon: "📖",
    order: 1,
    hasRegions: false,
  },
  {
    id: "history",
    label: "History of Architecture",
    icon: "🏛️",
    order: 2,
    hasRegions: false,
  },
  {
    id: "styles",
    label: "Architectural Styles",
    icon: "🎨",
    order: 3,
    hasRegions: false,
  },
  {
    id: "neufert-standards",
    label: "Neufert Standards (Space Planning)",
    icon: "📐",
    order: 4,
    hasRegions: false,
  },
  {
    id: "biophilic-design",
    label: "Biophilic & Nature-Based Design",
    icon: "🌿",
    order: 5,
    hasRegions: false,
  },
  {
    id: "regulations",
    label: "Building Regulations & Standards",
    icon: "📋",
    order: 6,
    hasRegions: true, // Contains _shared/ + country subfolders
  },
  {
    id: "modular-construction",
    label: "Modular Construction",
    icon: "🏗️",
    order: 7,
    hasRegions: false,
  },
  {
    id: "sustainability",
    label: "Sustainability & Energy",
    icon: "🌱",
    order: 8,
    hasRegions: false,
  },
  {
    id: "interior-design",
    label: "Interior Design",
    icon: "🛋️",
    order: 9,
    hasRegions: false,
  },
  {
    id: "mep-systems",
    label: "MEP Systems",
    icon: "🔌",
    order: 10,
    hasRegions: false,
  },
  {
    id: "landscape",
    label: "Landscape & Outdoor",
    icon: "🌳",
    order: 11,
    hasRegions: false,
  },
  {
    id: "project-management",
    label: "Project Management & Costs",
    icon: "📊",
    order: 12,
    hasRegions: false,
  },
  {
    id: "glossary",
    label: "Glossary & Terms",
    icon: "📚",
    order: 13,
    hasRegions: false,
  },
  {
    id: "quiz",
    label: "Architectural Profile Quiz",
    icon: "🧭",
    order: 14,
    hasRegions: false,
  },
  {
    id: "books",
    label: "Books & References",
    icon: "📕",
    order: 15,
    hasRegions: false,
  },
  {
    id: "guides",
    label: "Practical Guides",
    icon: "🗺️",
    order: 17,
    hasRegions: false,
  },
];

/**
 * Maps folder prefix numbers to category IDs.
 * Used by the build script to resolve folder names → categories.
 */
export const FOLDER_TO_CATEGORY: Record<string, string> = {
  "00-modulca": "modulca",
  "01-fundamentals": "fundamentals",
  "02-history": "history",
  "03-styles": "styles",
  "04-neufert-standards": "neufert-standards",
  "05-biophilic-design": "biophilic-design",
  "06-regulations": "regulations",
  "07-modular-construction": "modular-construction",
  "08-sustainability": "sustainability",
  "09-interior-design": "interior-design",
  "10-mep-systems": "mep-systems",
  "11-landscape": "landscape",
  "12-project-management": "project-management",
  "13-glossary": "glossary",
  "14-quiz": "quiz",
  "15-books": "books",
  "17-guides": "guides",
};

/**
 * Get category definition by ID.
 */
export function getCategoryById(
  id: string
): (typeof CATEGORY_DEFINITIONS)[number] | undefined {
  return CATEGORY_DEFINITIONS.find((c) => c.id === id);
}

/**
 * Get category definition by folder name (e.g. "01-fundamentals").
 */
export function getCategoryByFolder(
  folderName: string
): (typeof CATEGORY_DEFINITIONS)[number] | undefined {
  const categoryId = FOLDER_TO_CATEGORY[folderName];
  return categoryId ? getCategoryById(categoryId) : undefined;
}
