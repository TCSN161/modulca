/**
 * Express mode — types (MCA-SPEC-EXPRESS-MODE-v1 §3, MVP cut 8.02).
 * Pure: no React, no stores.
 */
import type { FinishLevelId, StyleDirectionId } from "@/features/design/store";
import type { CameraPreset } from "@/features/design/components/render/cameraPresets";

export type ExpressLocale = "ro" | "en" | "nl";
export type BudgetBand = "tight" | "moderate" | "generous"; // = WizardInput.budgetLevel
export type ExpressStyleId = NonNullable<StyleDirectionId>;

/** MVP render views: one per camera preset of the 5.04 automatic img2img pipeline. */
export type ExpressRenderView = CameraPreset; // "exterior" | "overview" | "interior"

/** What the user typed in the short form. `null` = "you choose" → defaults. */
export interface ExpressAnswers {
  bedrooms: number | null;
  householdSize: number | null;
  wantsOffice: boolean | null;
  budgetBand: BudgetBand | null;
  budgetEur: number | null;
  styleId: ExpressStyleId | null;
  finishLevel: FinishLevelId | null;
  terrace: boolean | null;
  /** Gross floor area wanted, m² (→ modules = round(area / 9)) */
  targetAreaSqm: number | null;
  ownLand: boolean | null;
  plotAreaSqm: number | null;
  /** ISO 3166-2:RO code without the prefix, e.g. "CJ", "B" */
  county: string | null;
  notes: string | null;
}

export type ExpressWarning =
  | "modules-clamped-tier"
  | "modules-clamped-plot"
  | "renders-clamped-tier"
  | "county-unknown"
  | "bedrooms-clamped";

/** Normalised brief: every field resolved. */
export interface ExpressBrief {
  version: 1;
  locale: ExpressLocale;
  source: "questions" | "golden";
  bedrooms: number;
  householdSize: number;
  wantsOffice: boolean;
  budgetBand: BudgetBand;
  budgetEur: number | null;
  styleId: ExpressStyleId;
  finishLevel: FinishLevelId;
  terrace: boolean;
  /** From the wanted area; null = the generator sizes from household + bedrooms */
  targetModuleCount: number | null;
  /** min(tier maxModules, plot footprint cap) */
  moduleCap: number;
  ownLand: boolean;
  plotAreaSqm: number;
  county: string;
  notes: string | null;
  renderViews: ExpressRenderView[];
  warnings: ExpressWarning[];
}

export type ExpressStage =
  | "design" | "land" | "products" | "save" | "renders" | "presentation" | "done" | "failed";

export interface ExpressRenderState {
  view: ExpressRenderView;
  status: "pending" | "ok" | "failed";
  engine?: string;
  renderId?: string;
  error?: string;
}

/** Persisted in localStorage["modulca-express-job"] (Express-owned key). */
export interface ExpressJob {
  id: string;
  brief: ExpressBrief;
  projectId: string | null;
  projectName: string;
  stage: ExpressStage;
  modules: number;
  productCount: number;
  estimateEur: number | null;
  renders: ExpressRenderState[];
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
}
