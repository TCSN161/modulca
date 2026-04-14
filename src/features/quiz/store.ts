"use client";

import { create } from "zustand";

/**
 * Quiz Profile Store — persists the architectural profile quiz results
 * to localStorage so they can be used to pre-fill project creation.
 */

export interface QuizProfile {
  /** Primary architectural style ID */
  primaryStyle: string;
  /** Secondary style influences */
  secondaryStyles: string[];
  /** Estimated module count */
  totalModules: number;
  /** Suggested layout shape */
  layout: string;
  /** Sustainability level 1-5 */
  sustainability: number;
  /** Biophilic affinity 1-5 */
  biophilic: number;
  /** Recommended materials */
  materials: string[];
  /** Recommended KB article IDs */
  articles: string[];
  /** Budget level */
  budgetLevel: string;
  /** Household size */
  householdSize: number;
  /** Gross area in m² */
  grossArea: number;
  /** Usable area in m² */
  usableArea: number;
  /** Timestamp */
  completedAt: string;
}

interface QuizStore {
  profile: QuizProfile | null;
  setProfile: (p: QuizProfile) => void;
  clearProfile: () => void;
  /** Map quiz style → design store StyleDirectionId */
  getDesignStyleDirection: () => string | null;
  /** Map quiz budget → design store FinishLevelId */
  getDesignFinishLevel: () => "basic" | "standard" | "premium";
}

const STORAGE_KEY = "modulca-quiz-profile";

function saveToStorage(profile: QuizProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* */ }
}

function loadFromStorage(): QuizProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Map quiz style IDs → design store's 8 style directions.
 * Each quiz profile now maps to a dedicated design style (1:1 where possible).
 */
const STYLE_MAP: Record<string, string> = {
  "modern-minimalist": "scandinavian",
  "warm-organic": "warm-contemporary",
  "scandinavian-functional": "scandinavian",
  "industrial-loft": "industrial",
  "traditional-romanian": "traditional-romanian",
  "biophilic-nature": "biophilic-organic",
  "eclectic-mixed": "eclectic-mixed",
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  profile: typeof window !== "undefined" ? loadFromStorage() : null,

  setProfile: (p) => {
    set({ profile: p });
    saveToStorage(p);
  },

  clearProfile: () => {
    set({ profile: null });
    saveToStorage(null);
  },

  getDesignStyleDirection: (): string | null => {
    const { profile } = get();
    if (!profile) return null;
    return STYLE_MAP[profile.primaryStyle] ?? "warm-contemporary";
  },

  getDesignFinishLevel: () => {
    const { profile } = get();
    if (!profile) return "standard";
    switch (profile.budgetLevel) {
      case "economy": return "basic";
      case "premium":
      case "luxury": return "premium";
      default: return "standard";
    }
  },
}));
