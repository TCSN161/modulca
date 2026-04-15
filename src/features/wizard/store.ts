"use client";

import { create } from "zustand";
import type { WizardInput, GeneratedDesign } from "./types";
import { generateDesign, generateFromQuizProfile } from "./generator";
import { useDesignStore } from "@/features/design/store";
import { useQuizStore } from "@/features/quiz/store";
import type { StyleDirectionId } from "@/features/design/store";
import type { GridCell } from "@/features/land/store";

/**
 * Wizard Store — orchestrates auto-design generation and application.
 *
 * Flow:
 *   1. User provides WizardInput (via quick questions or quiz profile)
 *   2. generateDesign() produces a GeneratedDesign
 *   3. applyToProject() pushes the result into design store + land store
 *
 * The wizard is non-destructive — it generates a preview first,
 * then only applies when the user confirms.
 */

interface WizardStore {
  /** Current wizard input */
  input: WizardInput | null;
  /** Generated design (preview, not yet applied) */
  generatedDesign: GeneratedDesign | null;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;

  /** Set the wizard input parameters */
  setInput: (input: WizardInput) => void;
  /** Generate a design from current input */
  generate: () => void;
  /** Generate directly from the quiz profile (if available) */
  generateFromQuiz: () => boolean;
  /** Apply the generated design to the project (design + land stores) */
  applyToProject: () => void;
  /** Reset wizard state */
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  input: null,
  generatedDesign: null,
  isGenerating: false,
  error: null,

  setInput: (input) => {
    set({ input, generatedDesign: null, error: null });
  },

  generate: () => {
    const { input } = get();
    if (!input) {
      set({ error: "No input provided" });
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      const design = generateDesign(input);
      set({ generatedDesign: design, isGenerating: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Generation failed",
        isGenerating: false,
      });
    }
  },

  generateFromQuiz: () => {
    const profile = useQuizStore.getState().profile;
    if (!profile) {
      set({ error: "No quiz profile found. Complete the quiz first." });
      return false;
    }

    set({ isGenerating: true, error: null });

    try {
      const design = generateFromQuizProfile(profile);

      // Also set the input so the UI can show what was used
      set({
        input: {
          householdSize: profile.householdSize,
          budgetLevel:
            profile.budgetLevel === "economy"
              ? "tight"
              : profile.budgetLevel === "premium" || profile.budgetLevel === "luxury"
              ? "generous"
              : "moderate",
          stylePreference: (design.styleDirection ?? "warm-contemporary") as NonNullable<StyleDirectionId>,
          floors: 1,
          wantsTerrace: true,
          wantsOffice: profile.householdSize <= 2,
        },
        generatedDesign: design,
        isGenerating: false,
      });
      return true;
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Generation from quiz failed",
        isGenerating: false,
      });
      return false;
    }
  },

  applyToProject: () => {
    const { generatedDesign } = get();
    if (!generatedDesign) return;

    const designStore = useDesignStore.getState();

    // Convert modules to GridCells for the land store
    const gridCells: GridCell[] = generatedDesign.modules.map((mod) => ({
      row: mod.row,
      col: mod.col,
      moduleType: mod.moduleType,
    }));

    // Apply to design store: this triggers wall config computation + label generation
    designStore.setModulesFromGrid(gridCells, 0);

    // Apply finish level
    designStore.setFinishLevel(generatedDesign.finishLevel);

    // Apply style direction
    designStore.setStyleDirection(generatedDesign.styleDirection);

    // Apply style materials (floor + wall) to all modules
    designStore.applyStyleToModules();

    // Save to localStorage
    designStore.saveToLocalStorage();
  },

  reset: () => {
    set({
      input: null,
      generatedDesign: null,
      isGenerating: false,
      error: null,
    });
  },
}));
