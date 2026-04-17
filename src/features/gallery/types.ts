/**
 * Gallery domain types — shared between server, client, and DB layer.
 */

export type RenderStatus = "active" | "hall-of-fame" | "archived";

export interface PublicRender {
  id: string;
  slug: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  fileSizeKb: number | null;

  engineId: string;
  promptExcerpt: string | null;
  latencyMs: number | null;

  roomType: string | null;
  styleDirection: string | null;
  finishLevel: string | null;
  moduleCount: number | null;
  areaSqm: number | null;
  estimatedCostEur: number | null;
  showPrice: boolean;

  userId: string | null;
  isAdmin: boolean;
  userTier: string | null;

  status: RenderStatus;
  ratingSum: number;
  ratingCount: number;
  viewCount: number;
  scoreWeighted: number;

  country: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RenderRating {
  id: string;
  renderId: string;
  userId: string;
  stars: number;
  weight: number;
  createdAt: string;
}

export interface GallerySettings {
  showPricesGlobally: boolean;
  showEstimatedCost: boolean;
  showRatingCounts: boolean;
  maxActiveRenders: number;
  maxHallOfFame: number;
  moderationMode: "off" | "auto" | "manual";
  hallScoreThreshold: number;
}

export function ratingAverage(r: Pick<PublicRender, "ratingSum" | "ratingCount">): number {
  if (r.ratingCount === 0) return 0;
  return r.ratingSum / r.ratingCount;
}

export function formatCost(eur: number | null): string {
  if (!eur) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

export function rowToRender(row: Record<string, unknown>): PublicRender {
  return {
    id: row.id as string,
    slug: row.slug as string,
    imageUrl: (row.image_url as string) || null,
    thumbUrl: (row.thumb_url as string) || null,
    fileSizeKb: (row.file_size_kb as number) || null,
    engineId: row.engine_id as string,
    promptExcerpt: (row.prompt_excerpt as string) || null,
    latencyMs: (row.latency_ms as number) || null,
    roomType: (row.room_type as string) || null,
    styleDirection: (row.style_direction as string) || null,
    finishLevel: (row.finish_level as string) || null,
    moduleCount: (row.module_count as number) || null,
    areaSqm: (row.area_sqm as number) || null,
    estimatedCostEur: (row.estimated_cost_eur as number) || null,
    showPrice: (row.show_price as boolean) ?? true,
    userId: (row.user_id as string) || null,
    isAdmin: (row.is_admin as boolean) ?? false,
    userTier: (row.user_tier as string) || null,
    status: (row.status as RenderStatus) || "active",
    ratingSum: (row.rating_sum as number) ?? 0,
    ratingCount: (row.rating_count as number) ?? 0,
    viewCount: (row.view_count as number) ?? 0,
    scoreWeighted: Number(row.score_weighted ?? 0),
    country: (row.country as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
