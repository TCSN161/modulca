"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthNav } from "@/features/auth/components/AuthNav";
import { useQuizStore } from "@/features/quiz/store";
import { computeStyleScores, STYLE_LABELS, STYLE_MATERIALS, STYLE_ARTICLE_MAP } from "@/knowledge/14-quiz/scoring/style-mapping";
import { quickEstimate } from "@/knowledge/14-quiz/scoring/module-estimator";
import { exportQuizProfilePdf } from "@/features/quiz/exportPdf";

/* ------------------------------------------------------------------ */
/*  Quiz Data — hardcoded from .md section files                       */
/* ------------------------------------------------------------------ */

interface QuizOption {
  label: string;
  value: string;
  /** Optional image URL for visual questions */
  image?: string;
}

interface QuizQuestionDef {
  id: string;
  text: string;
  options: QuizOption[];
}

interface QuizSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  questions: QuizQuestionDef[];
}

const SECTIONS: QuizSection[] = [
  {
    id: "lifestyle",
    title: "Lifestyle",
    subtitle: "Daily routines & household composition",
    icon: "🏠",
    questions: [
      {
        id: "household-size",
        text: "How many people will live in this home?",
        options: [
          { label: "1 person (solo living)", value: "1" },
          { label: "2 people (couple)", value: "2" },
          { label: "3-4 people (small family)", value: "3-4" },
          { label: "5+ people (large family)", value: "5+" },
        ],
      },
      {
        id: "work-from-home",
        text: "How often do you work from home?",
        options: [
          { label: "Never", value: "never" },
          { label: "Occasionally (1-2 days/week)", value: "occasional" },
          { label: "Frequently (3-4 days/week)", value: "frequent" },
          { label: "Full-time remote", value: "fulltime" },
        ],
      },
      {
        id: "cooking-habits",
        text: "How would you describe your cooking habits?",
        options: [
          { label: "Minimal — quick meals & takeout", value: "minimal" },
          { label: "Regular — daily home cooking", value: "regular" },
          { label: "Enthusiast — elaborate meals & baking", value: "enthusiast" },
          { label: "Professional-level — large-scale cooking", value: "professional" },
        ],
      },
      {
        id: "entertainment",
        text: "How do you prefer to entertain at home?",
        options: [
          { label: "Quiet activities — reading, music", value: "quiet" },
          { label: "Media — movies, gaming, streaming", value: "media" },
          { label: "Social gatherings — dinners & parties", value: "social" },
          { label: "Mixed — a combination", value: "mixed" },
        ],
      },
      {
        id: "outdoor-time",
        text: "How much time do you spend outdoors at home?",
        options: [
          { label: "Minimal — I prefer being inside", value: "minimal" },
          { label: "Moderate — morning coffee on the terrace", value: "moderate" },
          { label: "Significant — gardening, outdoor dining", value: "significant" },
          { label: "Extensive — outdoor living is central", value: "extensive" },
        ],
      },
      {
        id: "pets",
        text: "Do you have or plan to have pets?",
        options: [
          { label: "No pets", value: "none" },
          { label: "Small pets (cats, small dogs)", value: "small" },
          { label: "Large dogs or multiple pets", value: "large" },
          { label: "Hobby animals (chickens, rabbits)", value: "hobby" },
        ],
      },
    ],
  },
  {
    id: "space",
    title: "Space Priorities",
    subtitle: "What matters most in your home",
    icon: "📐",
    questions: [
      {
        id: "most-important",
        text: "What is most important in your home?",
        options: [
          { label: "Maximum storage", value: "storage" },
          { label: "Open, flowing spaces", value: "open" },
          { label: "Privacy for each family member", value: "privacy" },
          { label: "Natural light everywhere", value: "light" },
        ],
      },
      {
        id: "morning-routine",
        text: "Describe your ideal morning routine at home:",
        options: [
          { label: "Quick shower, grab coffee, out the door", value: "quick" },
          { label: "Relaxed bath, leisurely breakfast", value: "relaxed" },
          { label: "Exercise first, then proper breakfast", value: "active" },
          { label: "Slow start — read, meditate, then prepare", value: "slow" },
        ],
      },
      {
        id: "office-needs",
        text: "Do you need a dedicated home office?",
        options: [
          { label: "No — I don't work from home", value: "none" },
          { label: "A small desk area is enough", value: "desk" },
          { label: "Yes — a separate, quiet room", value: "room" },
          { label: "Yes — with video call setup & storage", value: "professional" },
        ],
      },
      {
        id: "guest-frequency",
        text: "How often do you have overnight guests?",
        options: [
          { label: "Rarely or never", value: "rare" },
          { label: "A few times per year", value: "occasional" },
          { label: "Monthly or more", value: "frequent" },
          { label: "We need a permanent guest room", value: "permanent" },
        ],
      },
      {
        id: "hobby-space",
        text: "Do you need space for hobbies or workshops?",
        options: [
          { label: "No special space needed", value: "none" },
          { label: "Small craft/hobby area", value: "small" },
          { label: "Dedicated workshop or studio", value: "workshop" },
          { label: "Gym or fitness area", value: "gym" },
        ],
      },
      {
        id: "storage-priority",
        text: "How important is built-in storage?",
        options: [
          { label: "Minimal — I keep things simple", value: "minimal" },
          { label: "Average — standard closets are fine", value: "average" },
          { label: "Important — I need walk-in closets & pantry", value: "important" },
          { label: "Critical — maximum storage everywhere", value: "critical" },
        ],
      },
    ],
  },
  {
    id: "aesthetic",
    title: "Style & Aesthetics",
    subtitle: "Visual and material preferences",
    icon: "🎨",
    questions: [
      {
        id: "style-overall",
        text: "Which architectural style resonates with you most?",
        options: [
          { label: "Modern — clean geometry, flat roof, glass", value: "modern-minimalist", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop" },
          { label: "Traditional — pitched roof, warm materials", value: "traditional-romanian", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop" },
          { label: "Organic — flowing shapes, natural integration", value: "warm-organic", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop" },
          { label: "Industrial — exposed structure, raw materials", value: "industrial-loft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop" },
          { label: "Scandinavian — light wood, functional beauty", value: "scandinavian-functional", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop" },
        ],
      },
      {
        id: "material-preference",
        text: "Which building material do you find most appealing?",
        options: [
          { label: "Wood — warm, natural, versatile", value: "wood", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
          { label: "Concrete — bold, sculptural, modern", value: "concrete", image: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=400&h=300&fit=crop" },
          { label: "Glass — transparent, light-filled", value: "glass", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" },
          { label: "Stone — solid, timeless, grounded", value: "stone", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=300&fit=crop" },
          { label: "Mixed — combination depending on context", value: "mixed", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop" },
        ],
      },
      {
        id: "color-palette",
        text: "What color palette do you prefer for interiors?",
        options: [
          { label: "Warm — earth tones, amber, terracotta", value: "warm", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop" },
          { label: "Cool — blues, greens, greys", value: "cool", image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&h=300&fit=crop" },
          { label: "Neutral — whites, beiges, light wood", value: "neutral", image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400&h=300&fit=crop" },
          { label: "Bold — strong colors, high contrast", value: "bold", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
        ],
      },
      {
        id: "minimalist-scale",
        text: "On the minimalist-maximalist spectrum, where are you?",
        options: [
          { label: "Minimalist — less is more, empty surfaces", value: "minimalist" },
          { label: "Restrained — curated, intentional objects", value: "restrained" },
          { label: "Moderate — comfortable mix of items", value: "moderate" },
          { label: "Maximalist — I love collected, layered spaces", value: "maximalist" },
        ],
      },
      {
        id: "indoor-outdoor",
        text: "How important is the indoor-outdoor connection?",
        options: [
          { label: "Not very — I prefer enclosed spaces", value: "low" },
          { label: "Moderate — some windows are enough", value: "moderate" },
          { label: "Important — large glazing, views of nature", value: "important" },
          { label: "Essential — I want to feel immersed in nature", value: "essential" },
        ],
      },
    ],
  },
  {
    id: "environment",
    title: "Environment & Values",
    subtitle: "Sustainability and nature preferences",
    icon: "🌿",
    questions: [
      {
        id: "energy-importance",
        text: "How important is energy efficiency to you?",
        options: [
          { label: "Standard — just meet building code", value: "standard" },
          { label: "Above average — good insulation, efficient heating", value: "above" },
          { label: "High — near-passive house performance", value: "high" },
          { label: "Maximum — I want net-zero or passive house", value: "maximum" },
        ],
      },
      {
        id: "natural-materials",
        text: "How much do you value natural / non-toxic materials?",
        options: [
          { label: "Not a priority", value: "low" },
          { label: "Nice to have but not a dealbreaker", value: "moderate" },
          { label: "Important — I prefer natural where possible", value: "important" },
          { label: "Essential — only natural, non-toxic materials", value: "essential" },
        ],
      },
      {
        id: "green-systems",
        text: "Which green systems interest you?",
        options: [
          { label: "Solar panels (PV)", value: "solar" },
          { label: "Green roof / living roof", value: "green-roof" },
          { label: "Rainwater harvesting", value: "rainwater" },
          { label: "All of the above", value: "all" },
        ],
      },
      {
        id: "garden-type",
        text: "What kind of garden do you envision?",
        options: [
          { label: "Minimal / low-maintenance", value: "minimal" },
          { label: "Ornamental — flowers, landscaping", value: "ornamental" },
          { label: "Edible — vegetables, herbs, fruit trees", value: "edible" },
          { label: "Wild / naturalistic — meadow, biodiversity", value: "wild" },
        ],
      },
      {
        id: "nature-connection",
        text: "Rate your desire to feel connected to nature at home:",
        options: [
          { label: "Urban is fine — I don't need green views", value: "urban" },
          { label: "Some plants and natural light is enough", value: "some" },
          { label: "I want significant nature around me", value: "significant" },
          { label: "Nature immersion is my top priority", value: "immersed" },
        ],
      },
    ],
  },
  {
    id: "practical",
    title: "Practical Constraints",
    subtitle: "Budget, timeline, and site",
    icon: "🔧",
    questions: [
      {
        id: "budget-range",
        text: "What is your approximate budget per m²?",
        options: [
          { label: "Economy: €800-1,200/m²", value: "economy" },
          { label: "Standard: €1,200-1,600/m²", value: "standard" },
          { label: "Premium: €1,600-2,000/m²", value: "premium" },
          { label: "Luxury: €2,000+/m²", value: "luxury" },
        ],
      },
      {
        id: "timeline",
        text: "When do you want to move in?",
        options: [
          { label: "As soon as possible (3-6 months)", value: "asap" },
          { label: "Within a year", value: "year" },
          { label: "1-2 years — still planning", value: "planning" },
          { label: "Flexible — no rush", value: "flexible" },
        ],
      },
      {
        id: "land-situation",
        text: "What is your land/plot situation?",
        options: [
          { label: "I own rural/suburban land", value: "own-rural" },
          { label: "I own urban land", value: "own-urban" },
          { label: "I'm looking for land", value: "looking" },
          { label: "I want to add to an existing property", value: "extension" },
        ],
      },
      {
        id: "floors",
        text: "How many floors do you prefer?",
        options: [
          { label: "Single story — everything on one level", value: "1" },
          { label: "1.5 stories — loft or mezzanine", value: "1.5" },
          { label: "Two stories — bedrooms upstairs", value: "2" },
        ],
      },
      {
        id: "accessibility",
        text: "Do you have accessibility requirements?",
        options: [
          { label: "No current needs", value: "none" },
          { label: "Future-proofing — plan for aging in place", value: "future" },
          { label: "Yes — wheelchair accessibility needed now", value: "current" },
        ],
      },
    ],
  },
];

const TOTAL_QUESTIONS = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

interface Answers {
  [questionId: string]: string;
}

function computeProfile(answers: Answers) {
  // --- Style scoring ---
  const styleWeights: Record<string, number> = {};
  const styleDirect = answers["style-overall"];
  if (styleDirect) {
    styleWeights[styleDirect] = (styleWeights[styleDirect] ?? 0) + 5;
  }
  // Material influence
  const matMap: Record<string, string[]> = {
    wood: ["warm-organic", "scandinavian-functional", "traditional-romanian"],
    concrete: ["modern-minimalist", "industrial-loft"],
    glass: ["modern-minimalist", "scandinavian-functional"],
    stone: ["traditional-romanian", "warm-organic"],
    mixed: ["eclectic-mixed"],
  };
  const mat = answers["material-preference"];
  if (mat && matMap[mat]) {
    for (const s of matMap[mat]) styleWeights[s] = (styleWeights[s] ?? 0) + 2;
  }
  // Nature connection → biophilic
  if (answers["nature-connection"] === "immersed" || answers["nature-connection"] === "significant") {
    styleWeights["biophilic-nature"] = (styleWeights["biophilic-nature"] ?? 0) + 3;
  }
  // Indoor-outdoor → biophilic / scandinavian
  if (answers["indoor-outdoor"] === "essential") {
    styleWeights["biophilic-nature"] = (styleWeights["biophilic-nature"] ?? 0) + 2;
    styleWeights["scandinavian-functional"] = (styleWeights["scandinavian-functional"] ?? 0) + 1;
  }
  // Minimalist scale
  if (answers["minimalist-scale"] === "minimalist") {
    styleWeights["modern-minimalist"] = (styleWeights["modern-minimalist"] ?? 0) + 2;
  }
  if (answers["minimalist-scale"] === "maximalist") {
    styleWeights["eclectic-mixed"] = (styleWeights["eclectic-mixed"] ?? 0) + 2;
  }
  // Color palette
  if (answers["color-palette"] === "warm") {
    styleWeights["warm-organic"] = (styleWeights["warm-organic"] ?? 0) + 1;
    styleWeights["traditional-romanian"] = (styleWeights["traditional-romanian"] ?? 0) + 1;
  }
  if (answers["color-palette"] === "neutral") {
    styleWeights["scandinavian-functional"] = (styleWeights["scandinavian-functional"] ?? 0) + 1;
    styleWeights["modern-minimalist"] = (styleWeights["modern-minimalist"] ?? 0) + 1;
  }
  if (answers["color-palette"] === "bold") {
    styleWeights["eclectic-mixed"] = (styleWeights["eclectic-mixed"] ?? 0) + 2;
  }

  const styleScores = computeStyleScores(styleWeights);
  const primaryStyle = styleScores[0]?.id ?? "scandinavian-functional";
  const secondaryStyles = styleScores.slice(1, 3).filter((s) => s.score > 0).map((s) => s.id);

  // --- Module estimation ---
  const householdMap: Record<string, number> = { "1": 1, "2": 2, "3-4": 3, "5+": 5 };
  const householdSize = householdMap[answers["household-size"]] ?? 2;
  const budgetLevel = answers["budget-range"] === "economy" ? "economy" as const
    : answers["budget-range"] === "premium" || answers["budget-range"] === "luxury" ? "premium" as const
    : "standard" as const;

  const est = quickEstimate(householdSize, budgetLevel);

  // Extra modules for specific needs
  let extraModules = 0;
  if (answers["work-from-home"] === "frequent" || answers["work-from-home"] === "fulltime") extraModules++;
  if (answers["hobby-space"] === "workshop" || answers["hobby-space"] === "gym") extraModules++;
  if (answers["guest-frequency"] === "frequent" || answers["guest-frequency"] === "permanent") extraModules++;
  if (answers["outdoor-time"] === "extensive") extraModules++;

  const totalModules = est.modules + extraModules;

  // --- Sustainability ---
  const sustainMap: Record<string, number> = { standard: 1, above: 2, high: 4, maximum: 5 };
  const sustainability = sustainMap[answers["energy-importance"]] ?? 2;

  // --- Biophilic ---
  const bioMap: Record<string, number> = { urban: 1, some: 2, significant: 4, immersed: 5 };
  const biophilic = bioMap[answers["nature-connection"]] ?? 2;

  return {
    primaryStyle,
    secondaryStyles,
    styleScores: styleScores.slice(0, 4),
    totalModules,
    grossArea: totalModules * 9,
    usableArea: totalModules * 7,
    layout: est.layout,
    sustainability,
    biophilic,
    materials: STYLE_MATERIALS[primaryStyle] ?? [],
    articles: STYLE_ARTICLE_MAP[primaryStyle] ?? [],
    budgetLevel,
    householdSize,
  };
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-brand-teal-800 h-2 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onAnswer,
}: {
  question: QuizQuestionDef;
  answer: string | undefined;
  onAnswer: (value: string) => void;
}) {
  const hasImages = question.options.some((o) => o.image);

  return (
    <div className="mx-auto max-w-xl">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">{question.text}</h3>
      <div className={hasImages ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "space-y-3"}>
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={hasImages
              ? `rounded-xl border-2 overflow-hidden text-left transition-all ${
                  answer === opt.value
                    ? "border-brand-teal-800 ring-2 ring-brand-teal-200"
                    : "border-gray-200 hover:border-gray-300"
                }`
              : `w-full rounded-xl border-2 p-4 text-left text-sm transition-all ${
                  answer === opt.value
                    ? "border-brand-teal-800 bg-brand-teal-50 text-brand-teal-900 font-medium"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`
            }
          >
            {opt.image ? (
              <>
                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={opt.image}
                    alt={opt.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className={`p-2.5 text-xs leading-snug ${
                  answer === opt.value ? "font-medium text-brand-teal-900 bg-brand-teal-50" : "text-gray-600"
                }`}>
                  {opt.label}
                </div>
              </>
            ) : (
              opt.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileResult({ profile, onStartDesign, onRetake }: { profile: ReturnType<typeof computeProfile>; onStartDesign: () => void; onRetake: () => void }) {
  const styleLabel = STYLE_LABELS[profile.primaryStyle] ?? profile.primaryStyle;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mb-3 text-5xl">🏡</div>
        <h2 className="text-2xl font-bold text-gray-900">Your Architectural Profile</h2>
        <p className="mt-2 text-sm text-gray-500">Based on your {TOTAL_QUESTIONS} answers</p>
      </div>

      {/* Primary Style */}
      <div className="mb-6 rounded-2xl bg-brand-teal-800 p-6 text-white">
        <div className="text-xs font-medium uppercase tracking-wide text-brand-teal-200">Primary Style</div>
        <div className="mt-1 text-2xl font-bold">{styleLabel}</div>
        {profile.secondaryStyles.length > 0 && (
          <div className="mt-2 text-sm text-brand-teal-200">
            with influences from {profile.secondaryStyles.map((s) => STYLE_LABELS[s] ?? s).join(" & ")}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Modules", value: `${profile.totalModules}`, sub: `${profile.grossArea}m² gross` },
          { label: "Layout", value: profile.layout, sub: `~${profile.usableArea}m² usable` },
          { label: "Sustainability", value: `${profile.sustainability}/5`, sub: profile.sustainability >= 4 ? "Passive-level" : "Standard+" },
          { label: "Nature", value: `${profile.biophilic}/5`, sub: profile.biophilic >= 4 ? "Immersed" : "Balanced" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className="mt-1 text-lg font-bold text-gray-900">{m.value}</div>
            <div className="text-[11px] text-gray-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Material Palette */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold text-gray-700">Recommended Materials</h4>
        <div className="flex flex-wrap gap-2">
          {profile.materials.map((mat) => (
            <span key={mat} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
              {mat}
            </span>
          ))}
        </div>
      </div>

      {/* Style Breakdown */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-bold text-gray-700">Style Affinity</h4>
        <div className="space-y-2">
          {profile.styleScores.map((s) => {
            const max = profile.styleScores[0]?.score || 1;
            const pct = Math.round((s.score / max) * 100);
            return (
              <div key={s.id}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{s.label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-brand-teal-800 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onStartDesign}
          className="flex-1 rounded-xl bg-brand-olive-700 py-3 text-center text-sm font-semibold text-white hover:bg-brand-olive-800 transition-colors"
        >
          Start Designing Your Home
        </button>
        <Link
          href="/library"
          className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Explore {profile.articles.length} Recommended Articles
        </Link>
      </div>

      {/* Secondary actions */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => {
            const quizProfile = useQuizStore.getState().profile;
            if (quizProfile) exportQuizProfilePdf(quizProfile);
          }}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:underline"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
        <button onClick={onRetake} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
          Retake quiz
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Quiz Page                                                     */
/* ------------------------------------------------------------------ */

export default function QuizPage() {
  const router = useRouter();
  const setQuizProfile = useQuizStore((s) => s.setProfile);
  const [answers, setAnswers] = useState<Answers>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const section = SECTIONS[sectionIndex];
  const question = section?.questions[questionIndex];

  // Count answered questions
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (value: string) => {
    if (!question) return;
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after 300ms
    setTimeout(() => {
      if (questionIndex < section.questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else if (sectionIndex < SECTIONS.length - 1) {
        setSectionIndex(sectionIndex + 1);
        setQuestionIndex(0);
      } else {
        setCompleted(true);
      }
    }, 300);
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else if (sectionIndex > 0) {
      const prevSection = SECTIONS[sectionIndex - 1];
      setSectionIndex(sectionIndex - 1);
      setQuestionIndex(prevSection.questions.length - 1);
    }
  };

  const profile = useMemo(() => {
    if (!completed) return null;
    const p = computeProfile(answers);
    // Persist quiz profile for design step pre-fill
    setQuizProfile({
      primaryStyle: p.primaryStyle,
      secondaryStyles: p.secondaryStyles,
      totalModules: p.totalModules,
      layout: p.layout,
      sustainability: p.sustainability,
      biophilic: p.biophilic,
      materials: p.materials,
      articles: p.articles,
      budgetLevel: p.budgetLevel,
      householdSize: p.householdSize,
      grossArea: p.grossArea,
      usableArea: p.usableArea,
      completedAt: new Date().toISOString(),
    });
    return p;
  }, [completed, answers, setQuizProfile]);

  const handleStartDesign = () => {
    router.push("/project/demo/choose");
  };

  const handleRetake = () => {
    setAnswers({});
    setSectionIndex(0);
    setQuestionIndex(0);
    setCompleted(false);
  };

  // Keyboard: left/right arrows to navigate, number keys for quick answer
  useEffect(() => {
    if (completed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleBack();
      if (e.key >= "1" && e.key <= "5" && question) {
        const idx = parseInt(e.key) - 1;
        if (idx < question.options.length) handleAnswer(question.options[idx].value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="min-h-screen bg-brand-bone-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-brand-charcoal">ModulCA</Link>
            <span className="hidden sm:inline-block text-xs text-gray-400">|</span>
            <h1 className="hidden sm:inline-block text-sm font-semibold text-gray-700">Architectural Profile Quiz</h1>
          </div>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {completed && profile ? (
          <ProfileResult profile={profile} onStartDesign={handleStartDesign} onRetake={handleRetake} />
        ) : section && question ? (
          <>
            {/* Section dots */}
            <div className="mb-4 flex justify-center gap-2">
              {SECTIONS.map((s, si) => (
                <button
                  key={s.id}
                  onClick={() => { setSectionIndex(si); setQuestionIndex(0); }}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all ${
                    si === sectionIndex
                      ? "bg-brand-teal-800 text-white font-medium"
                      : si < sectionIndex
                      ? "bg-brand-teal-100 text-brand-teal-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  title={s.title}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                Question {questionIndex + 1}/{section.questions.length}
              </span>
              <span>{answeredCount}/{TOTAL_QUESTIONS} answered</span>
            </div>
            <ProgressBar current={answeredCount} total={TOTAL_QUESTIONS} />

            {/* Section header */}
            <div className="mt-6 mb-2 text-center">
              <div className="mb-1 text-3xl">{section.icon}</div>
              <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              <p className="text-xs text-gray-500">{section.subtitle}</p>
            </div>

            {/* Question */}
            <div className="mt-8">
              <QuestionCard
                question={question}
                answer={answers[question.id]}
                onAnswer={handleAnswer}
              />
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                disabled={sectionIndex === 0 && questionIndex === 0}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (answeredCount >= TOTAL_QUESTIONS - 3) {
                    setCompleted(true);
                  }
                }}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                Skip to results
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="mt-4 text-center text-[10px] text-gray-300">
              Tip: Press 1-{question.options.length} to answer quickly, or use arrow keys to navigate
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
