/**
 * Client-side Neufert Knowledge Base
 * Used as fallback when API routes are unavailable (e.g., GitHub Pages static export).
 * Mirrors the server-side KB in api/consultant/route.ts.
 */

const NEUFERT_KB: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["bedroom", "sleeping", "bed room"],
    answer:
      "**Bedroom (Neufert Standards)**\n\n" +
      "- **Single bedroom**: min 10m² (2.80×3.60m)\n" +
      "- **Double bedroom**: min 14m² (3.60×3.90m)\n" +
      "- **Bed clearances**: 0.60m sides, 0.80m foot\n" +
      "- **Ceiling height**: min 2.50m\n" +
      "- **Door width**: min 0.80m\n" +
      "- **Window**: min 1/8 of floor area for natural light\n\n" +
      "**In our 3×3m module system**: One module (9m² gross, ~7m² usable) fits a single bedroom with bed, nightstand, and wardrobe. For a double bedroom, consider 2 adjacent modules with shared wall removed.",
  },
  {
    keywords: ["kitchen", "cooking", "counter", "work triangle"],
    answer:
      "**Kitchen (Neufert Standards)**\n\n" +
      "- **Minimum area**: 6m² (small) to 12m² (family)\n" +
      "- **Work triangle** (sink–stove–fridge): each leg 1.2–2.7m, total ≤6.6m\n" +
      "- **Counter height**: 85–90cm standard, 100–110cm bar height\n" +
      "- **Counter depth**: 60cm standard\n" +
      "- **Clearance between facing counters**: min 1.20m\n" +
      "- **Ventilation**: min 60 l/s extraction rate\n\n" +
      "**In our 3×3m module**: One module fits an L-shape kitchen. Two modules create a spacious kitchen-dining area with island.",
  },
  {
    keywords: ["bathroom", "toilet", "shower", "bath", "wc"],
    answer:
      "**Bathroom (Neufert Standards)**\n\n" +
      "- **Minimum area**: 4m² (WC+shower+basin)\n" +
      "- **Full bath**: 6–8m² (add bathtub)\n" +
      "- **Toilet clearance**: 0.20m sides, 0.60m front\n" +
      "- **Shower**: min 0.80×0.80m, recommended 0.90×0.90m\n" +
      "- **Basin height**: 0.80–0.85m\n" +
      "- **Ventilation**: min 40 l/s or window 1/10 of floor area\n\n" +
      "**In our 3×3m module**: One module comfortably fits a full bathroom with shower, vanity, and toilet.",
  },
  {
    keywords: ["living", "lounge", "sitting", "room"],
    answer:
      "**Living Room (Neufert Standards)**\n\n" +
      "- **Minimum area**: 16m² (small), 20–30m² (family)\n" +
      "- **Sofa-to-TV distance**: 2.5m for 55\" screen\n" +
      "- **Coffee table clearance**: 0.45m from sofa\n" +
      "- **Circulation space**: min 0.90m passage width\n" +
      "- **Ceiling height**: 2.60–2.80m recommended for spacious feel\n\n" +
      "**In our 3×3m module**: Two modules with shared wall create a 14m² usable living space. Three modules in an L-shape give 21m² — ideal for open-plan living.",
  },
  {
    keywords: ["stair", "steps", "ramp"],
    answer:
      "**Stairs (Neufert Standards)**\n\n" +
      "- **Rise (riser)**: 170–190mm\n" +
      "- **Going (tread)**: 260–290mm\n" +
      "- **Formula**: 2×rise + going = 590–650mm\n" +
      "- **Min width**: 0.90m (residential), 1.20m (accessible)\n" +
      "- **Headroom**: min 2.10m\n" +
      "- **Handrail height**: 0.90–1.00m\n" +
      "- **Landing**: required every 18 steps max\n\n" +
      "**In modular construction**: Stairs typically occupy one full 3×3m module for a single-story access.",
  },
  {
    keywords: ["door", "entrance", "opening"],
    answer:
      "**Doors (Neufert Standards)**\n\n" +
      "- **Interior door**: 0.80m wide × 2.01m high\n" +
      "- **Main entrance**: 1.00m wide minimum\n" +
      "- **Accessible**: 0.90m clear opening\n" +
      "- **Door swing clearance**: 0.80m radius\n" +
      "- **Corridor doors**: same width as corridor min\n\n" +
      "**Romanian regulation**: Main entrance min 0.90m, fire doors REI 30.",
  },
  {
    keywords: ["corridor", "hallway", "passage"],
    answer:
      "**Corridors (Neufert Standards)**\n\n" +
      "- **Minimum width**: 0.90m\n" +
      "- **Recommended**: 1.10m\n" +
      "- **Accessible**: 1.20m (wheelchair turning: 1.50m×1.50m)\n" +
      "- **Max dead-end length**: 7.50m (fire regulation)\n\n" +
      "**In modular construction**: Corridors can be integrated into module layouts or created between module rows.",
  },
  {
    keywords: ["landscape", "garden", "outdoor", "terrace", "patio", "yard", "planting"],
    answer:
      "**Landscaping & Gardens (Neufert Standards)**\n\n" +
      "- **Terrace/patio**: min 12m² (3×4m), south/south-west orientation preferred\n" +
      "- **Garden paths**: 0.60m (single), 1.20m (double), 1.50m (wheelchair)\n" +
      "- **Planting distances from boundary**: 0.50m (shrubs), 2.00m (trees <3m), 4.00m (tall trees)\n" +
      "- **Outdoor steps**: rise 120–150mm, tread 350–400mm\n" +
      "- **Parking**: 2.50×5.00m per car, 3.50m for accessible\n\n" +
      "**Romanian regulations**: Min distance from side boundaries: 1.0m. Green space: typically 20–30% of lot required by CU.",
  },
  {
    keywords: ["permit", "regulation", "romanian", "legal", "certificat", "urbanism"],
    answer:
      "**Romanian Building Regulations**\n\n" +
      "- **Certificat de Urbanism (CU)**: required before design, valid 12 months\n" +
      "- **Building permit (Autorizație de Construire)**: required for structures >50m²\n" +
      "- **Max building coverage (POT)**: typically 35–45% of lot\n" +
      "- **Max land use (CUT)**: typically 0.9–1.5\n" +
      "- **Boundary setbacks**: 1.0m from side, 2.0m from front\n" +
      "- **Fire resistance**: min REI 30 for residential\n\n" +
      "**Modular advantage**: Factory-built modules can be pre-certified, reducing on-site inspection time.",
  },
  {
    keywords: ["modular", "module", "3x3", "prefab"],
    answer:
      "**Our 3×3m Modular System**\n\n" +
      "- **Module size**: 3.00 × 3.00m (9m² gross)\n" +
      "- **Usable area**: ~7m² after walls (0.15m exterior, 0.10m interior)\n" +
      "- **Wall height**: 2.70m\n" +
      "- **Shared walls**: Open space between adjacent modules\n" +
      "- **Max span**: 3.00m without additional support\n" +
      "- **Structure**: CLT (Cross-Laminated Timber) or steel frame\n" +
      "- **Foundation**: Screw piles or strip foundation\n\n" +
      "**Layouts**: Combine modules in line, L-shape, T-shape, U-shape, or courtyard configurations.",
  },
  {
    keywords: ["cost", "price", "budget", "estimate", "investment"],
    answer:
      "**Modular Construction Costs (Romania 2024–2025)**\n\n" +
      "- **Basic module**: €800–1,200/m² (structure + insulation + finishes)\n" +
      "- **Premium module**: €1,200–1,800/m² (high-end finishes, smart home)\n" +
      "- **Foundation**: €50–100/m²\n" +
      "- **Transport**: €500–2,000 per module (distance-dependent)\n" +
      "- **Assembly**: €100–200/m² (crane + labor)\n" +
      "- **Total turnkey**: €1,000–2,000/m² depending on specification\n\n" +
      "**Comparison**: Traditional construction in Romania: €800–1,500/m². Modular is competitive while being 40–60% faster.",
  },
  {
    keywords: ["sustainability", "energy", "passive", "insulation", "solar", "green", "clt"],
    answer:
      "**Sustainability & Energy (Neufert + Romanian Standards)**\n\n" +
      "- **Passive house**: ≤15 kWh/m²·year heating demand\n" +
      "- **Orientation**: Living areas south/south-east for solar gain\n" +
      "- **Insulation**: U-value ≤0.20 W/m²K walls, ≤0.15 roof\n" +
      "- **Windows**: Triple glazing, U ≤1.0 W/m²K\n" +
      "- **Air tightness**: n50 ≤0.6/h for passive standard\n" +
      "- **Natural ventilation**: Cross-ventilation with windows on opposite walls\n\n" +
      "**CLT advantage**: Carbon-negative material, excellent thermal mass, factory precision ensures air tightness.",
  },
];

export function getLocalAnswer(question: string): string {
  const q = question.toLowerCase();
  let bestMatch: (typeof NEUFERT_KB)[0] | null = null;
  let bestScore = 0;
  for (const entry of NEUFERT_KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }
  return (
    "I'm your Neufert architectural consultant. I can help with:\n\n" +
    "- **Room dimensions**: Bedrooms, kitchens, bathrooms, living rooms\n" +
    "- **Building regulations**: Romanian permits, setbacks, fire codes\n" +
    "- **Modular construction**: Our 3×3m system, layouts, costs\n" +
    "- **Sustainability**: Passive house, insulation, solar orientation\n" +
    "- **Stairs, doors, corridors**: Neufert standard dimensions\n\n" +
    "Please ask about a specific topic for detailed Neufert standards."
  );
}
