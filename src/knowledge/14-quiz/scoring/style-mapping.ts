/**
 * Quiz Answer → Style Affinity Mapping
 *
 * Maps quiz answers to architectural style scores.
 * Each style has a 0-1 affinity score that accumulates across all questions.
 * The top 1-2 styles become the user's profile.
 */

export const STYLE_IDS = [
  "modern-minimalist",
  "warm-organic",
  "scandinavian-functional",
  "industrial-loft",
  "traditional-romanian",
  "biophilic-nature",
  "eclectic-mixed",
] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export interface StyleScore {
  id: StyleId;
  label: string;
  score: number;
}

/** Human-readable labels for each style */
export const STYLE_LABELS: Record<StyleId, string> = {
  "modern-minimalist": "Modern Minimalist",
  "warm-organic": "Warm Organic",
  "scandinavian-functional": "Scandinavian Functional",
  "industrial-loft": "Industrial Loft",
  "traditional-romanian": "Traditional Romanian",
  "biophilic-nature": "Biophilic Nature",
  "eclectic-mixed": "Eclectic Mixed",
};

/** Map quiz profile ID → related knowledge base article IDs */
export const STYLE_ARTICLE_MAP: Record<StyleId, string[]> = {
  "modern-minimalist": ["minimalism", "space-planning", "lighting-design"],
  "warm-organic": ["organic-architecture", "natural-materials", "color-theory"],
  "scandinavian-functional": ["scandinavian", "natural-light", "furniture-ergonomics"],
  "industrial-loft": ["industrial", "materials-finishes", "lighting-design"],
  "traditional-romanian": ["vernacular-romanian", "natural-materials", "color-theory"],
  "biophilic-nature": ["principles", "natural-light", "indoor-plants", "water-features"],
  "eclectic-mixed": ["color-theory", "materials-finishes", "space-planning"],
};

/** Material palette suggestions per style */
export const STYLE_MATERIALS: Record<StyleId, string[]> = {
  "modern-minimalist": ["White-washed CLT", "Concrete effect", "Glass", "Matte metal", "Light oak"],
  "warm-organic": ["Natural oak", "Terracotta", "Linen", "Rattan", "Stone"],
  "scandinavian-functional": ["Birch plywood", "White paint", "Wool", "Light ash", "Ceramic"],
  "industrial-loft": ["Raw steel", "Exposed CLT", "Concrete", "Brick effect", "Dark metal"],
  "traditional-romanian": ["Walnut wood", "Painted wood", "Ceramic tile", "Wrought iron", "Wool textile"],
  "biophilic-nature": ["Living walls", "Reclaimed wood", "Cork", "Bamboo", "Natural stone"],
  "eclectic-mixed": ["Mixed woods", "Bold tiles", "Brass accents", "Textured walls", "Colorful textiles"],
};

/**
 * Compute style scores from accumulated quiz weights.
 * Returns sorted array, highest score first.
 */
export function computeStyleScores(
  accumulatedWeights: Record<string, number>
): StyleScore[] {
  return STYLE_IDS
    .map((id) => ({
      id,
      label: STYLE_LABELS[id],
      score: accumulatedWeights[id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}
