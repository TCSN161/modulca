import type { ModuleConfig, SavedRender } from "@/features/design/store";
import type { StyleDirection } from "@/features/design/styles";
import type { ProjectCost } from "@/features/design/projectCost";
import type { PresentationT } from "../../i18n";
import type { PdfStyles, PdfTheme } from "./theme";

export type PdfTemplateId = "minimal" | "bold" | "classic" | "luxury" | "architect";

export interface NextStep { title: string; desc: string }

export interface PdfDocumentProps {
  template: PdfTemplateId;
  slides: { id: string; label: string; enabled: boolean }[];
  projectName: string;
  clientName: string;
  /** "ro" | "en" | "nl" (BUG-ST32); anything else → en */
  locale: string;
  /* Pre-read data — hooks cannot run inside react-pdf */
  modules: ModuleConfig[];
  /** computeProjectCost(): same numbers as Finalize, products included (BUG-ST31) */
  cost: ProjectCost;
  style: StyleDirection | null;
  /** FINISH_LEVELS id ("basic" | "standard" | "premium") */
  finishLevel: string;
  polygon: { lat: number; lng: number }[];
  mapCenter: { lat: number; lng: number };
  savedRenders: SavedRender[];
  /** Edited "Next steps" from the slide; defaults to the translated ones */
  nextSteps?: NextStep[];
  isFreeUser?: boolean;
}

/** What every page builder gets */
export interface PdfCtx {
  props: PdfDocumentProps;
  t: PresentationT;
  s: PdfStyles;
  theme: PdfTheme;
  finishName: string;
  /** Translated slide label for the footer */
  label: (id: string) => string;
}
