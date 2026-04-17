/**
 * Presentation templates — visual theming tokens.
 *
 * Each template defines 4 color tokens used by all slides:
 *   - bg:     slide background
 *   - text:   primary text color
 *   - accent: brand accent (dividers, pull-quotes, number badges)
 *   - muted:  (derived) opacity-0.5 variant of text
 *
 * Adding a new template: just add an entry here — all slides pick it up
 * automatically because they consume the PresentationTemplate type.
 */

export type PresentationTemplateId = "minimal" | "bold" | "classic" | "luxury" | "architect";

export interface PresentationTemplate {
  id: PresentationTemplateId;
  label: string;
  description: string;
  accent: string;
  bg: string;
  text: string;
}

export const TEMPLATES: Record<PresentationTemplateId, PresentationTemplate> = {
  minimal: {
    id: "minimal",
    label: "Minimal White",
    description: "Clean, modern — inspired by Zaha Hadid Architects",
    accent: "#C8956C",
    bg: "#FFFFFF",
    text: "#1a1a1a",
  },
  bold: {
    id: "bold",
    label: "Dark Contrast",
    description: "Bold, dramatic — inspired by BIG (Bjarke Ingels)",
    accent: "#F59E0B",
    bg: "#111111",
    text: "#FFFFFF",
  },
  classic: {
    id: "classic",
    label: "Classic Architectural",
    description: "Traditional, elegant — inspired by Foster + Partners",
    accent: "#1D6B6B",
    bg: "#F8F6F2",
    text: "#2A2A2A",
  },
  luxury: {
    id: "luxury",
    label: "Real Estate Luxury",
    description: "Premium, exclusive — for high-end real estate marketing",
    accent: "#C5A572",
    bg: "#0A0A0A",
    text: "#FFFFFF",
  },
  architect: {
    id: "architect",
    label: "Architecture Portfolio",
    description: "Clean, technical — for submission documents",
    accent: "#333333",
    bg: "#FFFFFF",
    text: "#1a1a1a",
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
