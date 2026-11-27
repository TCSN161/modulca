/**
 * ExpressBrief → WizardInput (Chat 5 public interface, 5.01).
 * Pure. Keeps the generated house within brief.moduleCap (tier + plot):
 * when no area was asked, the household-based size is measured with the
 * generator's own pure allocator and capped.
 */
import { computeRoomAllocation } from "@/features/wizard/generator";
import type { WizardInput } from "@/features/wizard/types";
import type { ExpressBrief } from "./types";

export function briefToWizardInput(brief: ExpressBrief): WizardInput {
  const input: WizardInput = {
    householdSize: brief.householdSize,
    budgetLevel: brief.budgetBand,
    stylePreference: brief.styleId,
    floors: 1,
    wantsTerrace: brief.terrace,
    wantsOffice: brief.wantsOffice,
    bedroomsRequested: brief.bedrooms,
  };
  if (brief.targetModuleCount !== null) {
    input.targetModuleCount = Math.min(brief.targetModuleCount, brief.moduleCap);
  } else {
    const natural = computeRoomAllocation(input).totalModules;
    if (natural > brief.moduleCap) input.targetModuleCount = brief.moduleCap;
  }
  return input;
}
