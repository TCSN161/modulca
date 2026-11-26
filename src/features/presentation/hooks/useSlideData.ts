"use client";

/**
 * useSlideData — central data aggregator for all presentation slides.
 *
 * Why: historically every slide read directly from 3-4 stores + localStorage.
 * That made extraction hard (slides were tightly coupled to store shapes).
 * This hook is the single source of truth — slides receive plain props.
 *
 * Returns a stable object with everything any slide needs:
 *   - Computed stats (total area, usable area, cost estimate)
 *   - Room breakdown ("2 Bedrooms, 1 Kitchen")
 *   - Style info (label, description, palette, mood images)
 *   - Products (loaded from localStorage on mount)
 *   - Renders (from design store)
 *
 * Slides that need raw modules/materials can still read those from props.
 */

import { useEffect, useState, useMemo } from "react";
import { useDesignStore } from "@/features/design/store";
import { useLandStore } from "@/features/land/store";
import { MODULE_TYPES, FINISH_LEVELS } from "@/shared/types";
import { getStyleDirection } from "@/features/design/styles";
import { resolveSelectedProducts } from "./selectedProducts";

export interface SlideProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SlideRender {
  id: string;
  imageUrl: string;
  label: string;
}

export interface SlidePaletteSwatch {
  color: string;
  label: string;
}

export interface SlideMoodImage {
  imageUrl: string;
  label?: string;
}

export interface SlideData {
  /* ── Headline ── */
  projectName: string;
  clientName: string;

  /* ── Counts & areas ── */
  moduleCount: number;
  totalAreaSqm: number;
  usableAreaSqm: number;
  totalEstimateEur: number;

  /* ── Style ── */
  styleId: string | null;
  styleName: string;
  styleDescription: string | undefined;
  styleTagline: string | undefined;

  /* ── Finish ── */
  finishId: string | null;
  finishName: string;

  /* ── Room breakdown ── */
  roomBreakdown: string[]; // e.g., ["2 Bedrooms", "1 Kitchen"]

  /* ── Site ── */
  mapCenter: { lat: number; lng: number };
  polygon: Array<[number, number] | { lat: number; lng: number }>;
  gridRotation: number;

  /* ── Media ── */
  savedRenders: SlideRender[];
  moodImages: SlideMoodImage[];
  palette: SlidePaletteSwatch[];

  /* ── Products ── */
  products: SlideProduct[];
}

interface Options {
  projectName: string;
  clientName: string;
  /** @deprecated ignored — products resolve via @/assets (BUG-X01) */
  productCatalog?: Record<string, { name: string; price: number }>;
}

export function useSlideData(opts: Options): SlideData {
  const { projectName, clientName } = opts;

  const { gridRotation, polygon, mapCenter } = useLandStore();
  const {
    modules,
    styleDirection,
    finishLevel,
    getStats,
    moodboardPins,
    savedRenders,
  } = useDesignStore();

  /* ── Products: {productId, quantity} resolved via @/assets (BUG-X01) ── */
  const [products, setProducts] = useState<SlideProduct[]>([]);
  useEffect(() => {
    setProducts(resolveSelectedProducts());
  }, []);

  /* ── Derived values ── */
  const stats = getStats();
  const style = styleDirection ? getStyleDirection(styleDirection) : null;
  const finishInfo = FINISH_LEVELS.find((f) => f.id === finishLevel);

  const roomBreakdown = useMemo(() => {
    const uniqueTypes = Array.from(new Set(modules.map((m) => m.moduleType)));
    return uniqueTypes.map((type) => {
      const mt = MODULE_TYPES.find((m) => m.id === type);
      const count = modules.filter((m) => m.moduleType === type).length;
      return `${count} ${mt?.label || type}${count > 1 ? "s" : ""}`;
    });
  }, [modules]);

  const moodImages: SlideMoodImage[] = useMemo(() => {
    if (moodboardPins.length > 0) {
      return moodboardPins.map((pin) => ({
        imageUrl: pin.imageUrl,
        label: pin.label,
      }));
    }
    if (style?.moodImages?.length) {
      return style.moodImages.map((img) => ({
        imageUrl: img.url,
        label: img.label,
      }));
    }
    return [];
  }, [moodboardPins, style]);

  const palette: SlidePaletteSwatch[] = useMemo(() => {
    if (!style?.palette) return [];
    return style.palette.map((s) => ({ color: s.color, label: s.label }));
  }, [style]);

  const slideRenders: SlideRender[] = useMemo(
    () =>
      savedRenders.map((r) => ({
        id: r.id,
        imageUrl: r.imageUrl,
        label: r.label,
      })),
    [savedRenders]
  );

  return {
    projectName,
    clientName,
    moduleCount: modules.length,
    totalAreaSqm: stats.totalArea,
    usableAreaSqm: stats.usableArea,
    totalEstimateEur: stats.totalEstimate,
    styleId: styleDirection,
    styleName: style?.label || "Modern",
    styleDescription: style?.description,
    styleTagline: style?.tagline,
    finishId: finishLevel,
    finishName: finishInfo?.label || "Standard",
    roomBreakdown,
    mapCenter,
    polygon,
    gridRotation,
    savedRenders: slideRenders,
    moodImages,
    palette,
    products,
  };
}
