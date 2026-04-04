/**
 * ModulCA Construction Manual — Knowledge Base
 *
 * Curated reference data for modular wooden house construction.
 * Inspired by Neufert Architects' Data but focused specifically on:
 *   - Modular timber-frame / SIP panel construction
 *   - Romanian building regulations (P100, C107, etc.)
 *   - EU harmonised standards (Eurocodes, CE marking)
 *   - Ergonomic room dimensions for compact living
 *
 * Each category contains articles with title, summary, and detail entries.
 * This serves as the platform's built-in reference library so clients
 * and designers have everything in one place — a "swiss army knife" manual.
 */

export interface KBEntry {
  label: string;
  value: string;
  note?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  summary: string;
  icon: string;
  entries: KBEntry[];
}

export interface KBCategory {
  id: string;
  label: string;
  icon: string;
  articles: KBArticle[];
}

/* ------------------------------------------------------------------ */
/*  Knowledge Base Data                                                */
/* ------------------------------------------------------------------ */

export const KNOWLEDGE_BASE: KBCategory[] = [
  /* ============================================================== */
  /*  1. ROOM DIMENSIONS & ERGONOMICS                                */
  /* ============================================================== */
  {
    id: "dimensions",
    label: "Room Dimensions",
    icon: "📐",
    articles: [
      {
        id: "min-room-sizes",
        title: "Minimum Room Sizes (Romanian / EU)",
        summary: "Legal and ergonomic minimums for habitable rooms per Romanian building code and Neufert guidelines.",
        icon: "📏",
        entries: [
          { label: "Single bedroom", value: "≥ 8 m²", note: "Min. width 2.20m (RO P100)" },
          { label: "Double bedroom", value: "≥ 12 m²", note: "Min. width 2.60m" },
          { label: "Living room", value: "≥ 14 m²", note: "Min. width 3.00m" },
          { label: "Kitchen", value: "≥ 5 m²", note: "≥ 6 m² if dining included" },
          { label: "Bathroom", value: "≥ 2.5 m²", note: "≥ 3.5 m² with bathtub" },
          { label: "WC (separate)", value: "≥ 1.2 m²", note: "Min. 0.90 × 1.30m" },
          { label: "Hallway width", value: "≥ 1.10m", note: "≥ 1.20m if wheelchair" },
          { label: "Home office", value: "≥ 6 m²", note: "Neufert recommendation" },
          { label: "Storage / utility", value: "≥ 2 m²", note: "Per dwelling unit" },
        ],
      },
      {
        id: "ceiling-heights",
        title: "Ceiling Heights",
        summary: "Minimum and recommended clear heights for modular construction.",
        icon: "↕️",
        entries: [
          { label: "Habitable room min.", value: "2.50m", note: "Romanian building code" },
          { label: "Recommended residential", value: "2.60–2.70m", note: "Neufert optimal" },
          { label: "ModulCA standard", value: "2.70m", note: "Clear interior height" },
          { label: "Bathroom / kitchen", value: "≥ 2.40m", note: "Allowed reduction" },
          { label: "Mezzanine / loft", value: "≥ 2.20m", note: "At lowest point" },
          { label: "Corridor / hallway", value: "≥ 2.40m", note: "Can be lower than rooms" },
        ],
      },
      {
        id: "clearances",
        title: "Furniture Clearances & Ergonomics",
        summary: "Minimum space around furniture for comfortable use and circulation.",
        icon: "🚶",
        entries: [
          { label: "Bed side clearance", value: "≥ 600mm", note: "One side min., 750mm both" },
          { label: "Wardrobe front space", value: "≥ 800mm", note: "Door swing + standing" },
          { label: "Kitchen work triangle", value: "3.6–6.6m total", note: "Sink ↔ stove ↔ fridge" },
          { label: "Kitchen counter depth", value: "600mm", note: "Standard worktop" },
          { label: "Kitchen aisle width", value: "≥ 900mm", note: "≥ 1200mm for two cooks" },
          { label: "Dining chair space", value: "≥ 750mm", note: "From table edge to wall" },
          { label: "Toilet front clearance", value: "≥ 600mm", note: "From bowl to wall/door" },
          { label: "Shower min. size", value: "800 × 800mm", note: "900 × 900mm comfort" },
          { label: "Desk workspace depth", value: "≥ 700mm", note: "With monitor at arm's length" },
          { label: "Wheelchair turning", value: "1500mm ∅", note: "Accessible design" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  2. STRUCTURAL & MATERIALS                                      */
  /* ============================================================== */
  {
    id: "structural",
    label: "Structure & Materials",
    icon: "🏗️",
    articles: [
      {
        id: "timber-frame",
        title: "Timber Frame Construction",
        summary: "Specifications for CLT, glulam, and timber stud frame systems used in modular buildings.",
        icon: "🪵",
        entries: [
          { label: "CLT panel thickness", value: "80–120mm", note: "Walls; 120–200mm floors" },
          { label: "Glulam beam class", value: "GL24h / GL28h", note: "EN 14080 certified" },
          { label: "Timber stud spacing", value: "400–600mm c/c", note: "Depends on load" },
          { label: "Moisture content", value: "≤ 12%", note: "Kiln-dried, EN 14298" },
          { label: "Fire treatment", value: "Class B-s1, d0", note: "Euroclass for walls" },
          { label: "Timber grade (struct.)", value: "C24 min.", note: "EN 338 strength class" },
          { label: "Design life", value: "50 years", note: "EN 1990 Category 4" },
          { label: "Module transport max", value: "3.5 × 13.6m", note: "Standard truck trailer" },
        ],
      },
      {
        id: "sip-panels",
        title: "SIP Panels (Structural Insulated)",
        summary: "Performance data for SIP wall and roof panels used in ModulCA modules.",
        icon: "🧱",
        entries: [
          { label: "Panel thickness", value: "120–200mm", note: "Walls 120mm, roof 160mm" },
          { label: "U-value (120mm)", value: "0.22 W/m²K", note: "Meets nZEB in RO" },
          { label: "Core material", value: "EPS / PUR", note: "EN 14509 certified" },
          { label: "Facing material", value: "OSB-3 / cement board", note: "11–15mm each side" },
          { label: "Compressive strength", value: "≥ 100 kPa", note: "EN 826" },
          { label: "Fire rating", value: "REI 60", note: "With gypsum lining" },
          { label: "Airtightness", value: "≤ 0.6 ACH @50Pa", note: "When taped & sealed" },
          { label: "Assembly speed", value: "1 module / day", note: "2-person crew" },
        ],
      },
      {
        id: "foundations",
        title: "Foundation Systems",
        summary: "Options for modular building foundations — screw piles, pads, and strip footings.",
        icon: "⚙️",
        entries: [
          { label: "Screw pile diameter", value: "76–114mm", note: "Shaft; helix 200–300mm" },
          { label: "Screw pile depth", value: "1.5–3.0m", note: "Below frost line" },
          { label: "Bearing capacity", value: "25–50 kN/pile", note: "Depends on soil" },
          { label: "Frost depth (Romania)", value: "0.80–1.10m", note: "Zone-dependent" },
          { label: "Pad foundation size", value: "600 × 600mm", note: "Min. for 3×3m module" },
          { label: "Concrete class", value: "C20/25 min.", note: "EN 206" },
          { label: "Steel grade", value: "S355", note: "Screw piles; EN 10025" },
          { label: "Installation time", value: "4–8 piles/hour", note: "Mechanical driver" },
        ],
      },
      {
        id: "wall-buildup",
        title: "Wall Assembly Layers",
        summary: "Standard wall buildup for ModulCA modules — from exterior cladding to interior finish.",
        icon: "🧩",
        entries: [
          { label: "Total wall thickness", value: "265–300mm", note: "Exterior to interior" },
          { label: "Exterior cladding", value: "20mm", note: "Timber, fibre-cement, metal" },
          { label: "Ventilated air gap", value: "25mm", note: "Moisture drainage" },
          { label: "Insulation (mineral wool)", value: "120mm", note: "λ = 0.035 W/mK" },
          { label: "Structural frame", value: "80mm", note: "Steel C-section / timber stud" },
          { label: "Vapour barrier", value: "PE film", note: "Sd ≥ 100m" },
          { label: "Interior finish", value: "12.5–15mm", note: "Gypsum board / plywood" },
          { label: "Wall U-value", value: "0.18–0.22 W/m²K", note: "Passive house zone" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  3. THERMAL & ENERGY                                            */
  /* ============================================================== */
  {
    id: "thermal",
    label: "Thermal & Energy",
    icon: "🌡️",
    articles: [
      {
        id: "u-values",
        title: "U-Value Requirements",
        summary: "Maximum U-values for building elements per Romanian C107 and nZEB standards.",
        icon: "🧊",
        entries: [
          { label: "External wall", value: "≤ 0.28 W/m²K", note: "C107-2005; nZEB ≤ 0.22" },
          { label: "Roof / ceiling", value: "≤ 0.20 W/m²K", note: "C107-2005; nZEB ≤ 0.15" },
          { label: "Ground floor", value: "≤ 0.35 W/m²K", note: "C107-2005; nZEB ≤ 0.25" },
          { label: "Windows", value: "≤ 1.30 W/m²K", note: "Triple glazing recommended" },
          { label: "External doors", value: "≤ 1.80 W/m²K", note: "Insulated core" },
          { label: "Thermal bridges", value: "Ψ ≤ 0.05 W/mK", note: "Junction details" },
          { label: "ModulCA wall actual", value: "0.18 W/m²K", note: "Exceeds nZEB" },
        ],
      },
      {
        id: "energy-performance",
        title: "Energy Performance (nZEB)",
        summary: "Nearly Zero Energy Building requirements applicable from 2021 in Romania / EU.",
        icon: "⚡",
        entries: [
          { label: "Primary energy demand", value: "≤ 100 kWh/m²yr", note: "Romanian nZEB" },
          { label: "Heating demand", value: "≤ 15 kWh/m²yr", note: "Passive House level" },
          { label: "Cooling demand", value: "≤ 15 kWh/m²yr", note: "Passive House level" },
          { label: "Airtightness target", value: "≤ 0.6 ACH @50Pa", note: "Blower door test" },
          { label: "Renewable energy share", value: "≥ 30%", note: "RO EPBD transposition" },
          { label: "PV panel area/module", value: "~8 m²", note: "Flat roof, 3kW module" },
          { label: "Heat pump COP", value: "≥ 3.5", note: "Air-source, heating mode" },
        ],
      },
      {
        id: "hvac-sizing",
        title: "HVAC Sizing Guide",
        summary: "Quick sizing rules for heating, cooling, and ventilation in modular homes.",
        icon: "💨",
        entries: [
          { label: "Heating load (well-insulated)", value: "30–50 W/m²", note: "SIP/CLT construction" },
          { label: "Cooling load", value: "40–60 W/m²", note: "Continental climate" },
          { label: "Ventilation rate", value: "0.5 ACH", note: "Or 30 m³/h per person" },
          { label: "Kitchen extract", value: "60 l/s", note: "During cooking" },
          { label: "Bathroom extract", value: "15 l/s", note: "Intermittent" },
          { label: "Mini-split per module", value: "2.5–3.5 kW", note: "For 7 m² interior" },
          { label: "MVHR efficiency", value: "≥ 85%", note: "Heat recovery ventilation" },
          { label: "Duct diameter", value: "125–160mm", note: "Main supply/extract" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  4. MEP (MECHANICAL, ELECTRICAL, PLUMBING)                      */
  /* ============================================================== */
  {
    id: "mep",
    label: "MEP Systems",
    icon: "🔌",
    articles: [
      {
        id: "electrical",
        title: "Electrical Installation",
        summary: "Wiring standards, outlet counts, and circuit sizing for modular residential units.",
        icon: "⚡",
        entries: [
          { label: "Supply voltage", value: "230V / 50Hz", note: "Single phase (Romania)" },
          { label: "Main breaker", value: "32A per module", note: "MCB in consumer unit" },
          { label: "Ring circuit", value: "2.5mm² T&E", note: "Socket outlets" },
          { label: "Lighting circuit", value: "1.5mm² T&E", note: "Max 10 points / circuit" },
          { label: "Socket outlets (bedroom)", value: "4–6", note: "Double sockets count as 2" },
          { label: "Socket outlets (kitchen)", value: "6–8", note: "Above counter + appliance" },
          { label: "RCD protection", value: "30mA", note: "All circuits (NP I7)" },
          { label: "Cable route", value: "In stud / behind lining", note: "Concealed wiring" },
          { label: "EV charger prep", value: "6mm² radial", note: "Future-proofing" },
        ],
      },
      {
        id: "plumbing",
        title: "Plumbing & Water",
        summary: "Pipe sizing, fixture flows, and drainage for kitchen and bathroom modules.",
        icon: "🚰",
        entries: [
          { label: "Cold water supply", value: "15mm (½\") PE", note: "Main entry" },
          { label: "Hot water supply", value: "15mm copper/PEX", note: "From boiler/heat pump" },
          { label: "Sink drain", value: "40mm", note: "Kitchen and vanity" },
          { label: "Shower drain", value: "50mm", note: "Minimum flow rate" },
          { label: "Toilet drain", value: "110mm", note: "EN 12056" },
          { label: "Vent stack", value: "75mm", note: "Through roof" },
          { label: "Hot water temp", value: "55–60°C", note: "Legionella prevention" },
          { label: "Water pressure", value: "1.5–3.0 bar", note: "At fixture" },
          { label: "Floor drain slope", value: "1:80 min.", note: "Towards drain" },
        ],
      },
      {
        id: "fire-safety",
        title: "Fire Safety",
        summary: "Fire ratings, detection, and escape requirements for modular dwellings.",
        icon: "🔥",
        entries: [
          { label: "Wall fire rating", value: "REI 60", note: "With gypsum board lining" },
          { label: "Floor fire rating", value: "REI 60", note: "Between storeys" },
          { label: "Smoke detection", value: "Optical + heat", note: "Each room + hallway" },
          { label: "Escape distance", value: "≤ 9m", note: "To exit door (single dir.)" },
          { label: "Exit door width", value: "≥ 800mm", note: "Clear opening" },
          { label: "Emergency lighting", value: "1 lux on escape route", note: "3-hour battery" },
          { label: "Fire extinguisher", value: "1 per dwelling", note: "ABC powder, 6 kg" },
          { label: "Cladding reaction", value: "Class B-s2, d0", note: "Euroclass minimum" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  5. ROMANIAN REGULATIONS                                        */
  /* ============================================================== */
  {
    id: "regulations",
    label: "Romanian Regulations",
    icon: "📋",
    articles: [
      {
        id: "building-permit",
        title: "Building Permit Process (Romania)",
        summary: "Steps and documents required for Autorizație de Construire in Romania.",
        icon: "📝",
        entries: [
          { label: "Certificat de Urbanism", value: "Step 1", note: "From local primărie, 30 days" },
          { label: "Studiu geotehnic", value: "Required", note: "Soil survey for foundations" },
          { label: "Proiect tehnic (DTAC)", value: "Required", note: "Architect-signed drawings" },
          { label: "Avize utilități", value: "Required", note: "Water, electric, gas, telecom" },
          { label: "Autorizație de Construire", value: "Step 2", note: "Valid 12 months (ext. 12)" },
          { label: "Diriginte de șantier", value: "Required", note: "Licensed site supervisor" },
          { label: "Recepție la terminare", value: "Step 3", note: "Final inspection + cadastre" },
          { label: "Intabulare", value: "Step 4", note: "Land registry (ANCPI)" },
          { label: "Timeline estimate", value: "3–6 months", note: "CU to AC, normal flow" },
        ],
      },
      {
        id: "seismic",
        title: "Seismic Design (P100-1/2013)",
        summary: "Romania's seismic code requirements relevant to modular construction.",
        icon: "🌍",
        entries: [
          { label: "Peak ground accel. (ag)", value: "0.10–0.40g", note: "Zone-dependent map" },
          { label: "Bucharest zone", value: "ag = 0.30g", note: "Tc = 1.6s" },
          { label: "Cluj zone", value: "ag = 0.10g", note: "Tc = 0.7s" },
          { label: "Importance factor (γI)", value: "1.0", note: "Residential buildings" },
          { label: "Behaviour factor (q)", value: "1.5–2.0", note: "Timber/light steel" },
          { label: "Modular advantage", value: "Low mass", note: "Less seismic force" },
          { label: "Connection design", value: "Ductile details", note: "Module-to-module bolts" },
          { label: "Max. stories (light frame)", value: "2–3", note: "Without special analysis" },
        ],
      },
      {
        id: "thermal-ro",
        title: "Thermal Regulations (C107)",
        summary: "Romanian thermal performance code for residential buildings.",
        icon: "🌡️",
        entries: [
          { label: "Climatic zone I (south)", value: "Te = -15°C", note: "Design ext. temperature" },
          { label: "Climatic zone II (center)", value: "Te = -18°C", note: "Transylvania" },
          { label: "Climatic zone III (mountain)", value: "Te = -21°C", note: "Mountain areas" },
          { label: "Interior design temp.", value: "20°C", note: "Living spaces" },
          { label: "Condensation check", value: "Required", note: "Glaser method or EN 13788" },
          { label: "Summer overheating", value: "Ti ≤ 27°C", note: "Without active cooling" },
          { label: "Energy certificate", value: "Mandatory", note: "Before sale / rent" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  6. ACCESSIBILITY & COMFORT                                     */
  /* ============================================================== */
  {
    id: "accessibility",
    label: "Accessibility",
    icon: "♿",
    articles: [
      {
        id: "universal-design",
        title: "Universal Design Principles",
        summary: "Making modular homes accessible for all abilities — doorways, ramps, and fixtures.",
        icon: "🚪",
        entries: [
          { label: "Door clear width", value: "≥ 900mm", note: "≥ 850mm absolute min." },
          { label: "Corridor width", value: "≥ 1200mm", note: "Wheelchair passage" },
          { label: "Ramp gradient", value: "≤ 1:12 (8.3%)", note: "Max 6m run, then landing" },
          { label: "Threshold height", value: "≤ 20mm", note: "Bevelled edge" },
          { label: "Turning circle", value: "1500mm ∅", note: "In kitchen, bathroom, hallway" },
          { label: "Grab bar height", value: "800–900mm", note: "Beside toilet and shower" },
          { label: "Toilet seat height", value: "460–480mm", note: "Raised / comfort height" },
          { label: "Switch height", value: "900–1100mm", note: "From finished floor" },
          { label: "Socket height", value: "400–1000mm", note: "Accessible range" },
          { label: "Level entry", value: "±0mm", note: "Zero threshold at entrance" },
        ],
      },
    ],
  },

  /* ============================================================== */
  /*  7. TRANSPORT & ASSEMBLY                                        */
  /* ============================================================== */
  {
    id: "transport",
    label: "Transport & Assembly",
    icon: "🚛",
    articles: [
      {
        id: "logistics",
        title: "Module Transport & Lifting",
        summary: "Size limits, weight constraints, and crane requirements for moving modules to site.",
        icon: "🏗️",
        entries: [
          { label: "Max module width (road)", value: "3.50m", note: "Standard trailer, no escort" },
          { label: "Max module height (road)", value: "4.20m", note: "Including trailer deck" },
          { label: "Max module length", value: "13.60m", note: "Standard semi-trailer" },
          { label: "Module weight (empty)", value: "2.5–4.0 t", note: "3×3m SIP/timber module" },
          { label: "Crane capacity needed", value: "≥ 10 t", note: "With rigging factor" },
          { label: "Lifting points", value: "4 per module", note: "ISO corner castings" },
          { label: "Site access road width", value: "≥ 3.5m", note: "For delivery truck" },
          { label: "Assembly time per module", value: "1–2 hours", note: "Crane + 4-person crew" },
          { label: "Weather window", value: "No rain / wind ≤ 35 km/h", note: "For crane ops" },
        ],
      },
      {
        id: "connections",
        title: "Module-to-Module Connections",
        summary: "How modules bolt together on site — structural, MEP, and weatherproofing joints.",
        icon: "🔩",
        entries: [
          { label: "Structural bolt grade", value: "8.8 or 10.9", note: "EN 14399" },
          { label: "Bolt spacing", value: "600mm c/c", note: "Along shared wall" },
          { label: "Gasket / seal", value: "EPDM compressible strip", note: "Weather + acoustic" },
          { label: "Acoustic isolation", value: "≥ Rw 45 dB", note: "Between dwelling units" },
          { label: "Electrical jumper", value: "Quick-connect plug", note: "Pre-wired in factory" },
          { label: "Plumbing jumper", value: "Push-fit coupling", note: "15–22mm" },
          { label: "Shared wall savings", value: "€1,500 / wall", note: "ModulCA discount" },
          { label: "Alignment tolerance", value: "±5mm", note: "On foundation grid" },
        ],
      },
    ],
  },
];
