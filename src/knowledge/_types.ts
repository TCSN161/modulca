/**
 * ModulCA Knowledge Library — Type Definitions
 *
 * Everything in this library is modular and auto-discoverable.
 * Types mirror the YAML frontmatter in each .md article file.
 *
 * Add a country → folder + _meta.yaml → auto-indexed.
 * Add a style → .md file in 03-styles/ → auto-indexed.
 * Add a domain → numbered folder → auto-indexed.
 */

/* ------------------------------------------------------------------ */
/*  Core Document Types                                                */
/* ------------------------------------------------------------------ */

/** Difficulty level for content filtering */
export type KBDifficulty = "beginner" | "intermediate" | "advanced";

/** Region scope for regulation articles */
export type KBRegionScope = "eu" | "national" | "regional" | "municipal";

/** Market status for a country */
export type KBMarketStatus = "active" | "expansion" | "future";

/** Content status for a country or article */
export type KBContentStatus = "complete" | "in-progress" | "planned" | "draft";

/**
 * YAML frontmatter parsed from each .md article.
 * This is the universal schema — every article has these fields.
 */
export interface KBDocumentMeta {
  /** Unique identifier (kebab-case, e.g. "room-dimensions") */
  id: string;
  /** Human-readable title */
  title: string;
  /** Parent category id (e.g. "neufert-standards", "regulations") */
  category: string;
  /** Search and filter tags */
  tags: string[];
  /** Source references (books, laws, standards) */
  sources: string[];
  /** Content difficulty */
  difficulty: KBDifficulty;
  /** Last content update (ISO date string) */
  lastUpdated: string;
  /** Restrict to Pro subscribers? */
  proOnly: boolean;
  /** Cross-links to related article IDs */
  relatedArticles?: string[];
  /** File path relative to src/knowledge/ */
  filePath?: string;
  /** ISO 3166-1 country code (only for regulation articles) */
  region?: string;
  /** Scope of the regulation */
  regionScope?: KBRegionScope;
  /**
   * Content language (ISO 639-1).
   * Defaults to "en" (source of truth). Translations live alongside their source
   * with a filename suffix: `room-dimensions.md` (EN) + `room-dimensions.ro.md` (RO).
   * The build script (`scripts/build-knowledge.mjs`) detects the suffix and sets
   * this field automatically. Manual override via frontmatter is possible but rare.
   */
  language?: "en" | "ro" | "nl" | "de" | "fr";
  /**
   * When this article is a translation of another, links to the source id.
   * Null/undefined for EN sources. Set automatically by build script when
   * detecting `<id>.<lang>.md` pattern — the suffix strips out of id, base id
   * points to EN source.
   */
  translationOf?: string;
}

/**
 * A fully parsed knowledge base article.
 * `meta` comes from YAML frontmatter, `content` is the Markdown body.
 */
export interface KBDocument {
  meta: KBDocumentMeta;
  /** Raw Markdown content (without frontmatter) */
  content: string;
  /** File path relative to src/knowledge/ */
  filePath: string;
}

/* ------------------------------------------------------------------ */
/*  Taxonomy & Categories                                              */
/* ------------------------------------------------------------------ */

/**
 * A knowledge domain (top-level folder like 01-fundamentals/).
 * Auto-discovered from the directory structure.
 */
export interface KBCategory {
  /** Folder-derived id (e.g. "fundamentals", "regulations") */
  id: string;
  /** Human-readable label */
  label: string;
  /** Emoji icon */
  icon: string;
  /** Sort order (from folder prefix: 01, 02, ...) */
  order: number;
  /** Number of articles in this category */
  articleCount: number;
  /** Whether this category contains region-specific subcategories */
  hasRegions: boolean;
}

/* ------------------------------------------------------------------ */
/*  Region System (Modular Country Modules)                            */
/* ------------------------------------------------------------------ */

/**
 * Parsed from _meta.yaml inside each country folder (e.g. RO/_meta.yaml).
 * Defines a pluggable region module.
 */
export interface KBRegion {
  /** Country/region name (e.g. "Romania") */
  name: string;
  /** ISO 3166-1 alpha-2 code (e.g. "RO") */
  code: string;
  /** Flag emoji */
  flag: string;
  /** Primary language code */
  language: string;
  /** Content completeness */
  status: KBContentStatus;
  /** Market priority */
  market: KBMarketStatus;
  /** Currency code (e.g. "EUR", "RON") */
  currency: string;
  /** National standards body */
  standardsBody: string;
  /** Key legislation references */
  keyLegislation: string[];
  /** Number of articles in this region */
  articleCount?: number;
}

/* ------------------------------------------------------------------ */
/*  Source References                                                   */
/* ------------------------------------------------------------------ */

/**
 * A reference source (book, law, standard, website).
 * Used for citation and the Pro library's source browser.
 */
export interface KBSource {
  /** Unique identifier */
  id: string;
  /** Full title */
  title: string;
  /** Author(s) */
  author: string;
  /** Publication year or "Current" */
  year: string;
  /** Type of source */
  type: "book" | "law" | "standard" | "website" | "course";
  /** Is it freely available? */
  free: boolean;
  /** URL if available online */
  url?: string;
  /** Approximate cost if paid */
  cost?: string;
  /** Applicable regions (empty = universal) */
  regions?: string[];
  /** ISBN-13 or ISBN-10 for Open Library cover/metadata lookup */
  isbn?: string;
  /** Open Library Work ID (e.g. "OL123W") for books without ISBN */
  olid?: string;
  /** Cover image URL (auto-populated from Open Library or manual) */
  coverUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Quiz System Types                                                  */
/* ------------------------------------------------------------------ */

/** Quiz question input type */
export type QuizInputType =
  | "single-choice"
  | "multiple-choice"
  | "slider"
  | "ranking"
  | "image-pair"
  | "scale";

/**
 * A single quiz question with scoring weights.
 */
export interface QuizQuestion {
  id: string;
  section: string;
  text: string;
  inputType: QuizInputType;
  options?: QuizOption[];
  /** Min/max for slider/scale types */
  range?: { min: number; max: number; step: number; labels?: string[] };
}

export interface QuizOption {
  label: string;
  value: string;
  /** Optional image URL for image-pair questions */
  image?: string;
  /** How this answer maps to style/space/sustainability scores */
  weights: QuizWeights;
}

/**
 * Scoring dimensions — each answer contributes to these.
 */
export interface QuizWeights {
  /** Style affinities (0-1 per style) */
  styles?: Record<string, number>;
  /** Room priority boosts */
  roomPriority?: Record<string, number>;
  /** Sustainability preference (0-5) */
  sustainability?: number;
  /** Biophilic affinity (0-5) */
  biophilic?: number;
  /** Social/communal vs. private (0-5) */
  social?: number;
}

/**
 * The computed architectural profile after quiz completion.
 */
export interface ArchitecturalProfile {
  /** Primary recommended style */
  primaryStyle: string;
  /** Secondary style influences */
  secondaryStyles: string[];
  /** Room size recommendations (room id → recommended m²) */
  roomSizes: Record<string, number>;
  /** Room priority ranking (most important first) */
  roomPriority: string[];
  /** Sustainability level 1-5 */
  sustainabilityLevel: number;
  /** Biophilic affinity 1-5 */
  biophilicLevel: number;
  /** Material preferences */
  materialPalette: string[];
  /** Estimated module count */
  estimatedModules: number;
  /** Budget range per m² */
  budgetRange: { min: number; max: number; currency: string };
  /** Related knowledge base article IDs */
  recommendedArticles: string[];
}

/* ------------------------------------------------------------------ */
/*  Index Types (Generated at Build Time)                              */
/* ------------------------------------------------------------------ */

/**
 * The complete knowledge base index, generated from all .md files.
 * Used by the AI for RAG and by the UI for browsing.
 */
export interface KBIndex {
  /** All categories (auto-discovered from folders) */
  categories: KBCategory[];
  /** All regions (auto-discovered from 06-regulations/) */
  regions: KBRegion[];
  /** All article metadata (without content — content loaded on demand) */
  articles: KBDocumentMeta[];
  /** All source references */
  sources: KBSource[];
  /** Build timestamp */
  generatedAt: string;
  /** Total article count */
  totalArticles: number;
}
