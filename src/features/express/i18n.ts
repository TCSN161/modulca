/** Express UI strings — RO + EN + NL from day 1. */
import type { ExpressLocale, ExpressStage, ExpressWarning } from "./types";

export interface ExpressStrings {
  title: string;
  subtitle: string;
  youChoose: string;
  bedrooms: string;
  household: string;
  office: string;
  area: string;
  areaHint: string;
  budget: string;
  budgetBands: Record<"tight" | "moderate" | "generous", string>;
  style: string;
  finish: string;
  finishes: Record<"basic" | "standard" | "premium", string>;
  terrace: string;
  ownLand: string;
  plot: string;
  county: string;
  notes: string;
  yes: string;
  no: string;
  start: string;
  running: string;
  signIn: string;
  stages: Record<ExpressStage, string>;
  renderViews: Record<"exterior" | "overview" | "interior", string>;
  renderErrors: Record<"quota" | "scene" | "persist" | "other", string>;
  warnings: Record<ExpressWarning, string>;
  openPresentation: string;
  editInWizard: string;
  retryRenders: string;
  estimate: string;
  modules: string;
  products: string;
  disclaimer: string;
}

const ro: ExpressStrings = {
  title: "Express — propunere în câteva minute",
  subtitle: "Răspundeți la câteva întrebări; restul îl alegem noi. Puteți modifica totul ulterior în asistent.",
  youChoose: "Alegeți voi",
  bedrooms: "Câte dormitoare?",
  household: "Câte persoane vor locui în casă?",
  office: "Aveți nevoie de birou?",
  area: "Ce suprafață vă doriți (m²)?",
  areaHint: "1 modul = 9 m² (3×3 m)",
  budget: "Ce buget aveți?",
  budgetBands: { tight: "sub 80.000 €", moderate: "80.000–150.000 €", generous: "peste 150.000 €" },
  style: "Ce stil vă place?",
  finish: "Nivel de finisaje",
  finishes: { basic: "Economic", standard: "Standard", premium: "Premium" },
  terrace: "Doriți terasă?",
  ownLand: "Aveți deja teren?",
  plot: "Suprafața terenului (m²)",
  county: "Județul",
  notes: "Altceva ce ar trebui să știm?",
  yes: "Da",
  no: "Nu",
  start: "Generează proiectul",
  running: "Se generează…",
  signIn: "Autentificați-vă pentru a salva proiectul în cont.",
  stages: {
    design: "Module și compartimentare",
    land: "Teren",
    products: "Produse",
    save: "Salvare în cont",
    renders: "Randări",
    presentation: "Prezentare",
    done: "Gata",
    failed: "Eroare",
  },
  renderViews: { exterior: "Exterior", overview: "Vedere de sus", interior: "Living" },
  renderErrors: {
    quota: "Limita zilnică de randări a fost atinsă",
    scene: "Scena 3D nu a fost disponibilă",
    persist: "Randarea nu a putut fi salvată",
    other: "Randarea a eșuat",
  },
  warnings: {
    "modules-clamped-tier": "Suprafața a fost redusă la limita de module a planului dvs.",
    "modules-clamped-plot": "Suprafața a fost redusă: amprenta casei ≤ 40% din teren.",
    "renders-clamped-tier": "Numărul de randări a fost redus la limita zilnică a planului dvs.",
    "county-unknown": "Județ necunoscut — am folosit Cluj.",
    "bedrooms-clamped": "Numărul de dormitoare a fost ajustat (1–6).",
  },
  openPresentation: "Deschide prezentarea / PDF",
  editInWizard: "Editează în asistent",
  retryRenders: "Reîncearcă randările",
  estimate: "Estimare",
  modules: "module",
  products: "produse",
  disclaimer: "Propunere orientativă, generată automat. Nu înlocuiește proiectul tehnic sau avizele.",
};

const en: ExpressStrings = {
  title: "Express — a proposal in minutes",
  subtitle: "Answer a few questions; we choose the rest. You can change everything later in the wizard.",
  youChoose: "You choose",
  bedrooms: "How many bedrooms?",
  household: "How many people will live there?",
  office: "Do you need a home office?",
  area: "What floor area do you want (m²)?",
  areaHint: "1 module = 9 m² (3×3 m)",
  budget: "What is your budget?",
  budgetBands: { tight: "under €80,000", moderate: "€80,000–150,000", generous: "over €150,000" },
  style: "Which style do you like?",
  finish: "Finish level",
  finishes: { basic: "Economy", standard: "Standard", premium: "Premium" },
  terrace: "Do you want a terrace?",
  ownLand: "Do you already own land?",
  plot: "Plot area (m²)",
  county: "County",
  notes: "Anything else we should know?",
  yes: "Yes",
  no: "No",
  start: "Generate the project",
  running: "Generating…",
  signIn: "Sign in to save the project to your account.",
  stages: {
    design: "Modules and layout",
    land: "Land",
    products: "Products",
    save: "Saving to your account",
    renders: "Renders",
    presentation: "Presentation",
    done: "Done",
    failed: "Error",
  },
  renderViews: { exterior: "Exterior", overview: "Top view", interior: "Living room" },
  renderErrors: {
    quota: "Daily render limit reached",
    scene: "The 3D scene was not available",
    persist: "The render could not be saved",
    other: "The render failed",
  },
  warnings: {
    "modules-clamped-tier": "The area was reduced to your plan's module limit.",
    "modules-clamped-plot": "The area was reduced: house footprint ≤ 40% of the plot.",
    "renders-clamped-tier": "The number of renders was reduced to your plan's daily limit.",
    "county-unknown": "Unknown county — we used Cluj.",
    "bedrooms-clamped": "The number of bedrooms was adjusted (1–6).",
  },
  openPresentation: "Open presentation / PDF",
  editInWizard: "Edit in the wizard",
  retryRenders: "Retry renders",
  estimate: "Estimate",
  modules: "modules",
  products: "products",
  disclaimer: "Indicative, automatically generated proposal. It does not replace the technical design or permits.",
};

const nl: ExpressStrings = {
  title: "Express — een voorstel in enkele minuten",
  subtitle: "Beantwoord een paar vragen; de rest kiezen wij. U kunt later alles aanpassen in de wizard.",
  youChoose: "Kies maar",
  bedrooms: "Hoeveel slaapkamers?",
  household: "Hoeveel personen gaan er wonen?",
  office: "Heeft u een thuiskantoor nodig?",
  area: "Welke vloeroppervlakte wilt u (m²)?",
  areaHint: "1 module = 9 m² (3×3 m)",
  budget: "Wat is uw budget?",
  budgetBands: { tight: "onder € 80.000", moderate: "€ 80.000–150.000", generous: "boven € 150.000" },
  style: "Welke stijl spreekt u aan?",
  finish: "Afwerkingsniveau",
  finishes: { basic: "Voordelig", standard: "Standaard", premium: "Premium" },
  terrace: "Wilt u een terras?",
  ownLand: "Heeft u al een perceel?",
  plot: "Perceeloppervlakte (m²)",
  county: "District (județ)",
  notes: "Nog iets dat we moeten weten?",
  yes: "Ja",
  no: "Nee",
  start: "Project genereren",
  running: "Bezig met genereren…",
  signIn: "Log in om het project in uw account op te slaan.",
  stages: {
    design: "Modules en indeling",
    land: "Perceel",
    products: "Producten",
    save: "Opslaan in uw account",
    renders: "Renders",
    presentation: "Presentatie",
    done: "Klaar",
    failed: "Fout",
  },
  renderViews: { exterior: "Buitenkant", overview: "Bovenaanzicht", interior: "Woonkamer" },
  renderErrors: {
    quota: "Dagelijkse renderlimiet bereikt",
    scene: "De 3D-scène was niet beschikbaar",
    persist: "De render kon niet worden opgeslagen",
    other: "De render is mislukt",
  },
  warnings: {
    "modules-clamped-tier": "De oppervlakte is verkleind tot de modulelimiet van uw abonnement.",
    "modules-clamped-plot": "De oppervlakte is verkleind: footprint ≤ 40% van het perceel.",
    "renders-clamped-tier": "Het aantal renders is verlaagd tot de daglimiet van uw abonnement.",
    "county-unknown": "Onbekend district — we hebben Cluj gebruikt.",
    "bedrooms-clamped": "Het aantal slaapkamers is aangepast (1–6).",
  },
  openPresentation: "Presentatie / PDF openen",
  editInWizard: "Bewerken in de wizard",
  retryRenders: "Renders opnieuw proberen",
  estimate: "Schatting",
  modules: "modules",
  products: "producten",
  disclaimer: "Indicatief, automatisch gegenereerd voorstel. Vervangt geen technisch ontwerp of vergunningen.",
};

const STRINGS: Record<ExpressLocale, ExpressStrings> = { ro, en, nl };

export function toExpressLocale(l: string | null | undefined): ExpressLocale {
  return l === "ro" || l === "nl" ? l : "en";
}

export function expressT(locale: string | null | undefined): ExpressStrings {
  return STRINGS[toExpressLocale(locale)];
}

export const EXPRESS_STRINGS = STRINGS;
