/**
 * Slide component contract.
 *
 * All slide components receive the same `SlideProps` — they pick what they
 * need and ignore the rest. This keeps the PresentationPage orchestrator
 * free of conditional prop-drilling.
 */

import type { PresentationTemplate } from "../../templates";

export type SlideId =
  | "cover"
  | "description"
  | "site"
  | "floorplan"
  | "vision"
  | "modules"
  | "renders"
  | "materials"
  | "products"
  | "cost"
  | "next";

export interface SlideConfig {
  id: SlideId;
  label: string;
  description: string;
  enabled: boolean;
}

export const DEFAULT_SLIDES: SlideConfig[] = [
  { id: "cover", label: "Cover Page", description: "Project name, hero render, date", enabled: true },
  { id: "description", label: "Project Description", description: "Auto-generated overview", enabled: true },
  { id: "site", label: "Site Plan", description: "Location, terrain, coordinates", enabled: true },
  { id: "floorplan", label: "Floor Plan", description: "Technical drawing, module layout", enabled: true },
  { id: "vision", label: "Design Vision", description: "Style direction, moodboard, palette", enabled: true },
  { id: "modules", label: "Module Details", description: "Per-room specs, furniture, materials", enabled: true },
  { id: "renders", label: "AI Renders", description: "Photorealistic visualizations", enabled: true },
  { id: "materials", label: "Materials & Finishes", description: "Floor, wall, finish specs", enabled: true },
  { id: "products", label: "Products", description: "Selected items with quantities", enabled: true },
  { id: "cost", label: "Cost Summary", description: "Full pricing breakdown", enabled: true },
  { id: "next", label: "Next Steps", description: "Contact, timeline, builder info", enabled: true },
];

/**
 * Data passed from the orchestrator to each slide component.
 * Extend this as slides gain new inputs — each slide documents which fields
 * it reads via destructuring, so unused fields are free.
 */
export interface SlideContext {
  template: PresentationTemplate;
  projectName: string;
  clientName: string;
  moduleCount: number;
  totalAreaSqm: number;
  usableAreaSqm: number;
  styleName: string;
  finishName: string;
  savedRenders: { id: string; imageUrl: string; label: string }[];
  coverRenderIndex: number;
  setCoverRenderIndex: (i: number) => void;
}
