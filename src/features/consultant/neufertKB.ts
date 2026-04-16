/**
 * Client-side Knowledge Base — powered by the auto-generated article index.
 * Used as fallback when API routes are unavailable (e.g., static export, offline).
 * Scores the user's question against 76+ article metadata entries.
 */

import { ARTICLES } from "@/knowledge/_index";
import type { KBDocumentMeta } from "@/knowledge/_types";

/* ------------------------------------------------------------------ */
/*  Region detection                                                   */
/* ------------------------------------------------------------------ */

const REGION_HINTS: Record<string, string[]> = {
  RO: ["romania", "romanian", "bucuresti", "bucharest", "autorizatie", "certificat", "p100", "c107"],
  NL: ["netherlands", "dutch", "holland", "bouwbesluit", "bbl", "omgevingswet", "beng", "kadaster", "waterschap"],
  EU: ["european", "eu ", "eurocode", "epbd", "ce marking"],
};

function detectRegion(question: string): string | null {
  const q = question.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const [region, hints] of Object.entries(REGION_HINTS)) {
    let score = 0;
    for (const hint of hints) {
      if (q.includes(hint)) score += hint.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = region;
    }
  }
  return bestScore > 0 ? best : null;
}

/* ------------------------------------------------------------------ */
/*  Article scoring (mirrors server-side logic)                        */
/* ------------------------------------------------------------------ */

function scoreArticle(article: KBDocumentMeta, question: string, detectedRegion: string | null): number {
  const q = question.toLowerCase();
  // Require words of length >= 3 — prevents single-char tag noise
  const words = q.split(/\s+/).filter((w) => w.length >= 3);
  let score = 0;
  let hasRealMatch = false; // gate: require actual content overlap

  for (const tag of article.tags) {
    // Only count full-tag matches for tags of length >= 3
    if (tag.length >= 3 && q.includes(tag)) {
      score += tag.length * 3;
      hasRealMatch = true;
    }
    for (const w of words) {
      if (tag.length >= 3 && tag.includes(w)) {
        score += w.length;
        hasRealMatch = true;
      }
    }
  }

  const titleLower = article.title.toLowerCase();
  for (const w of words) {
    if (titleLower.includes(w)) {
      score += w.length * 2;
      hasRealMatch = true;
    }
  }

  if (detectedRegion && article.region === detectedRegion) {
    score += 15;
    hasRealMatch = true;
  }
  if (detectedRegion && article.region === "EU") score += 5;
  if (article.category === "modulca") score += 3;

  // Without a real content match, return 0 so unknown queries hit fallback
  return hasRealMatch ? score : 0;
}

/* ------------------------------------------------------------------ */
/*  Compact summaries for client-side answers                          */
/* ------------------------------------------------------------------ */

/** Quick summaries for the most common topics — used when we can't read .md files client-side */
const TOPIC_SUMMARIES: Record<string, string> = {
  "room-dimensions": "**Room Dimensions (Neufert)**\n\n- Living room: ≥16m² (min width 3.30m)\n- Double bedroom: ≥14m² (min 3.00m wide)\n- Single bedroom: ≥10m² (min 2.40m wide)\n- Kitchen: ≥6m² (work triangle 3.6–6.6m)\n- Bathroom: ≥4m² (shower min 0.90×0.90m)\n- Home office: ≥7.5m² recommended\n\n**ModulCA**: 1 module = ~7m² usable. 2 modules = 14m² open-plan.",
  "kitchens": "**Kitchen Standards (Neufert)**\n\n- Work triangle (sink–stove–fridge): each leg 1.2–2.7m, total ≤6.6m\n- Counter height: 85–90cm, bar: 100–110cm\n- Counter depth: 60cm, aisle: ≥1.20m\n- Ventilation: 60 l/s extraction\n\n**ModulCA**: 1 module = L-shape kitchen. 2 modules = kitchen + dining with island.",
  "bathrooms": "**Bathroom Standards (Neufert)**\n\n- Minimum: 4m² (WC+shower+basin)\n- Full bath: 6–8m²\n- Toilet clearance: 0.20m sides, 0.60m front\n- Shower: min 0.90×0.90m recommended\n\n**ModulCA**: 1 module fits a full bathroom comfortably.",
  "bedrooms": "**Bedroom Standards (Neufert)**\n\n- Single: ≥10m² (2.40m wide min)\n- Double: ≥14m² (3.00m wide min)\n- Bed clearance: 0.60m sides, 0.80m foot\n- Wardrobe: 0.60m depth + 0.80m swing\n\n**ModulCA**: 1 module = single bedroom. 2 modules = spacious master suite.",
  "stairs-ramps": "**Stairs (Neufert)**\n\n- Rise: 170–190mm, Tread: 260–290mm\n- Formula: 2×rise + going = 590–650mm\n- Min width: 0.90m, accessible: 1.20m\n- Headroom: ≥2.10m\n\n**ModulCA**: Stairs typically occupy 1 full module.",
  "modulca-platform": "**ModulCA** is a digital platform for designing modular wooden homes.\n\n- 13-step guided design process\n- 3×3m module grid system (9m² gross, ~7m² usable)\n- Structure: CLT / timber frame / SIP panels\n- Foundation: Screw piles (removable)\n- Markets: Romania (active), Netherlands (expansion)\n- Tiers: Explorer (free), Premium (€19.99/mo), Architect (€49.99/mo), Constructor (€149.90/mo)",
  "modulca-module-system": "**3×3m Module System**\n\n- Grid: 3.00 × 3.00m per module\n- Gross: 9m², usable: ~7m² (after walls)\n- Wall height: 2.70m clear\n- Exterior wall: 150mm, interior: 100mm\n- Connections: Bolted (demountable)\n- Layouts: line, L, T, U, courtyard",
  "ro-building-permit": "**Romanian Building Permit**\n\n1. Certificat de Urbanism (CU) — from primărie, 30 days\n2. Technical project (DTAC) — architect-signed\n3. Utility approvals (avize)\n4. Autorizație de Construire — valid 12 months\n5. Construction + supervision (diriginte)\n6. Final inspection + land registry (intabulare)",
  "nl-building-permit": "**Dutch Building Permit (Omgevingsvergunning)**\n\n- Apply via Omgevingsloket online portal\n- Kwaliteitsborger (quality inspector) required since 2024\n- Regular procedure: 8 weeks\n- Extended: 26 weeks\n- Bouwbesluit/BBL compliance required",
  "foundations": "**Foundation Systems**\n\n- Screw piles: 76–114mm shaft, 1.5–3m depth (RO), up to 20m (NL Randstad)\n- Strip foundation: 0.80m+ below frost line\n- Bearing capacity: 25–50 kN/pile\n- ModulCA: 4–6 piles per module\n- NL special: soft clay/peat requires deep piling",
  "cost-estimation": "**Modular Construction Costs (Romania)**\n\n- Basic: €800–1,200/m²\n- Premium: €1,200–1,800/m²\n- Foundation: €50–100/m² (RO), €150–300/m² (NL piling)\n- Transport: €500–2,000/module\n- Total turnkey: €1,000–2,000/m²",
  "passive-house": "**Passive House Standards**\n\n- Heating demand: ≤15 kWh/m²·year\n- Primary energy: ≤120 kWh/m²·year\n- Airtightness: n50 ≤0.6/h\n- U-values: walls ≤0.15, roof ≤0.10, floor ≤0.15 W/m²K\n- ModulCA SIP walls: 0.18 W/m²K — near passive standard",
};

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function getLocalAnswer(question: string): string {
  const detectedRegion = detectRegion(question);

  const scored = ARTICLES.map((a) => ({
    article: a,
    score: scoreArticle(a, question, detectedRegion),
  }))
    // Require a real match signal — filter out articles that only got the
    // category bonus (score <= 3) so truly unknown queries hit the fallback.
    .filter((s) => s.score > 3)
    .sort((a, b) => b.score - a.score);

  // Try to return a pre-written summary for the best match
  if (scored.length > 0) {
    const best = scored[0].article;
    const summary = TOPIC_SUMMARIES[best.id];
    if (summary) return summary;

    // No pre-written summary — construct one from metadata
    const regionLabel = best.region ? ` (${best.region})` : "";
    const tagList = best.tags.slice(0, 5).join(", ");
    return `**${best.title}${regionLabel}**\n\nThis topic covers: ${tagList}.\n\nSources: ${best.sources.join(", ")}.\n\n*For detailed information, please use the AI consultant when available, or browse the Knowledge Library.*`;
  }

  // Generic fallback
  return (
    "I'm your ModulCA architectural consultant. I can help with:\n\n" +
    "- **Room dimensions**: Bedrooms, kitchens, bathrooms, living rooms\n" +
    "- **Building regulations**: Romanian permits, Dutch Omgevingswet, EU Eurocodes\n" +
    "- **Modular construction**: Our 3×3m system, layouts, costs\n" +
    "- **Sustainability**: Passive house, BENG, insulation, solar orientation\n" +
    "- **MEP systems**: Electrical, plumbing, HVAC sizing\n\n" +
    "Please ask about a specific topic for detailed standards."
  );
}
