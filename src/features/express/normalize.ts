/**
 * Brief normaliser (spec v1 §3): answers + tier limits → fully resolved ExpressBrief.
 * Pure and deterministic. The tier limits here only shape the UX; the server
 * still enforces the real tier and quota on every render (SEC-02).
 */
import type { FinishLevelId } from "@/features/design/store";
import { COUNTY_CENTROIDS, DEFAULT_COUNTY } from "./countyCentroids";
import type {
  BudgetBand, ExpressAnswers, ExpressBrief, ExpressLocale, ExpressRenderView, ExpressWarning,
} from "./types";

export const MODULE_GROSS_SQM = 9;
export const MIN_MODULES = 4; // living + kitchen + bedroom + bathroom
export const MAX_FOOTPRINT_RATIO = 0.4; // CATUC-style placeholder until Chat 2's checkFootprint
export const DEFAULT_PLOT_SQM = 600;
export const MVP_RENDER_VIEWS: ExpressRenderView[] = ["exterior", "overview", "interior"];

export const BUDGET_TO_FINISH: Record<BudgetBand, FinishLevelId> = {
  tight: "basic",
  moderate: "standard",
  generous: "premium",
};

export interface NormalizeContext {
  locale: ExpressLocale;
  /** getTierConfig(tier).features.maxModules */
  maxModules: number;
  /** getTierConfig(tier).features.aiRendersPerDay (-1 = unlimited) */
  rendersPerDay: number;
}

export const EMPTY_ANSWERS: ExpressAnswers = {
  bedrooms: null, householdSize: null, wantsOffice: null, budgetBand: null, budgetEur: null,
  styleId: null, finishLevel: null, terrace: null, targetAreaSqm: null, ownLand: null,
  plotAreaSqm: null, county: null, notes: null,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const finite = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

function bandFromEur(eur: number): BudgetBand {
  if (eur < 80_000) return "tight";
  if (eur <= 150_000) return "moderate";
  return "generous";
}

/** Max modules the plot allows (footprint ≤ 40% of the plot), never below MIN_MODULES. */
export function plotModuleCap(plotAreaSqm: number): number {
  return Math.max(MIN_MODULES, Math.floor((plotAreaSqm * MAX_FOOTPRINT_RATIO) / MODULE_GROSS_SQM));
}

export function normalizeBrief(
  raw: Partial<ExpressAnswers>,
  ctx: NormalizeContext,
  source: ExpressBrief["source"] = "questions",
): ExpressBrief {
  const a = { ...EMPTY_ANSWERS, ...raw };
  const warnings: ExpressWarning[] = [];

  let bedrooms = finite(a.bedrooms) ? Math.round(a.bedrooms) : null;
  if (bedrooms !== null && (bedrooms < 1 || bedrooms > 6)) {
    bedrooms = clamp(bedrooms, 1, 6);
    warnings.push("bedrooms-clamped");
  }
  const householdSize = finite(a.householdSize)
    ? clamp(Math.round(a.householdSize), 1, 8)
    : bedrooms !== null ? clamp(bedrooms + 1, 1, 8) : 3;
  const resolvedBedrooms = bedrooms ?? clamp(Math.ceil(householdSize / 2), 1, 6);

  const budgetBand: BudgetBand = a.budgetBand ?? (finite(a.budgetEur) ? bandFromEur(a.budgetEur) : "moderate");
  const finishLevel: FinishLevelId = a.finishLevel ?? BUDGET_TO_FINISH[budgetBand];

  let county = (a.county ?? "").trim().toUpperCase();
  if (!county) county = DEFAULT_COUNTY;
  else if (!COUNTY_CENTROIDS[county]) {
    warnings.push("county-unknown");
    county = DEFAULT_COUNTY;
  }

  const ownLand = a.ownLand ?? false;
  const plotAreaSqm = finite(a.plotAreaSqm) ? clamp(Math.round(a.plotAreaSqm), 100, 20_000) : DEFAULT_PLOT_SQM;

  // Module cap = min(tier, plot). The generator's own size is capped later in briefToWizardInput.
  const tierCap = Math.max(MIN_MODULES, ctx.maxModules);
  const plotCap = plotModuleCap(plotAreaSqm);
  const moduleCap = Math.min(tierCap, plotCap);
  let targetModuleCount: number | null = null;
  if (finite(a.targetAreaSqm) && a.targetAreaSqm > 0) {
    const wanted = Math.max(MIN_MODULES, Math.round(a.targetAreaSqm / MODULE_GROSS_SQM));
    targetModuleCount = Math.min(wanted, moduleCap);
    if (wanted > tierCap) warnings.push("modules-clamped-tier");
    else if (wanted > plotCap) warnings.push("modules-clamped-plot");
  }

  const renderLimit = ctx.rendersPerDay < 0 ? MVP_RENDER_VIEWS.length : Math.max(0, ctx.rendersPerDay);
  const renderViews = MVP_RENDER_VIEWS.slice(0, Math.min(MVP_RENDER_VIEWS.length, renderLimit));
  if (renderViews.length < MVP_RENDER_VIEWS.length) warnings.push("renders-clamped-tier");

  const notes = a.notes?.trim() ? a.notes.trim().slice(0, 500) : null;

  return {
    version: 1,
    locale: ctx.locale,
    source,
    bedrooms: resolvedBedrooms,
    householdSize,
    wantsOffice: a.wantsOffice ?? householdSize <= 2,
    budgetBand,
    budgetEur: finite(a.budgetEur) ? Math.round(a.budgetEur) : null,
    styleId: a.styleId ?? "warm-contemporary",
    finishLevel,
    terrace: a.terrace ?? true,
    targetModuleCount,
    moduleCap,
    ownLand,
    plotAreaSqm,
    county,
    notes,
    renderViews,
    warnings,
  };
}
