/**
 * Static fallback prices for Romanian construction materials (EUR).
 *
 * These are used when no live or estimated price is available.
 * Based on 2025-2026 Romanian market averages from Dedeman, Hornbach, MatHaus.
 *
 * All prices include VAT (19% TVA).
 * Last manual update: 2026-04-15
 */

import type { MaterialPrice, PriceSource } from "./types";

// ─── Helper ──────────────────────────────────────────────────

const FALLBACK_DATE = "2026-04-15";
const SUPPLIER = "fallback";

function fb(
  id: string,
  name: string,
  nameRo: string,
  category: MaterialPrice["category"],
  unit: MaterialPrice["unit"],
  priceEUR: number,
  variant?: string,
  isDefault?: boolean,
): MaterialPrice {
  return {
    id,
    name,
    nameRo,
    category,
    unit,
    priceEUR,
    supplier: SUPPLIER,
    lastUpdated: FALLBACK_DATE,
    confidence: "manual",
    sourceUrl: "",
    variant,
    isDefault,
  };
}

// ─── Fallback Materials (40+ items) ──────────────────────────

export const FALLBACK_PRICES: MaterialPrice[] = [
  // ── Flooring ─────────────────────────────────────────────
  fb("floor-oak-solid",       "Solid Oak Flooring",           "Parchet masiv stejar",         "flooring", "m2", 42,   "20mm solid",         true),
  fb("floor-oak-engineered",  "Engineered Oak Flooring",      "Parchet stratificat stejar",   "flooring", "m2", 35,   "14mm engineered"),
  fb("floor-laminate-8mm",    "Laminate Flooring 8mm",        "Parchet laminat 8mm",          "flooring", "m2", 12,   "8mm AC4"),
  fb("floor-laminate-12mm",   "Laminate Flooring 12mm",       "Parchet laminat 12mm",         "flooring", "m2", 18,   "12mm AC5"),
  fb("floor-terracotta",      "Terracotta Tiles",             "Gresie terracotta",            "flooring", "m2", 35,   "30x30cm"),
  fb("floor-porcelain",       "Porcelain Floor Tiles",        "Gresie portelanata",           "flooring", "m2", 28,   "60x60cm"),
  fb("floor-vinyl-lvt",       "Luxury Vinyl Tiles (LVT)",     "Parchet vinil LVT",            "flooring", "m2", 22,   "5mm click"),
  fb("floor-bamboo",          "Bamboo Flooring",              "Parchet bambus",               "flooring", "m2", 38,   "15mm strand-woven"),
  fb("floor-concrete-polish", "Polished Concrete",            "Beton slefuit",                "flooring", "m2", 45,   "with sealant"),
  fb("floor-epoxy",           "Epoxy Floor Coating",          "Rasina epoxidica pardoseala",  "flooring", "m2", 55,   "self-levelling"),

  // ── Wall Finishes ────────────────────────────────────────
  fb("wall-paint-interior",   "Interior Paint (washable)",    "Vopsea lavabila interior",     "wall-finish", "m2",  4,  "premium washable", true),
  fb("wall-paint-exterior",   "Exterior Paint",               "Vopsea exterior",              "wall-finish", "m2",  6,  "silicone-based"),
  fb("wall-ceramic-tile",     "Ceramic Wall Tiles",           "Faianta ceramica",             "wall-finish", "m2", 18,  "25x40cm"),
  fb("wall-decorative-plast", "Decorative Plaster",           "Tencuiala decorativa",         "wall-finish", "m2", 14,  "acrylic"),
  fb("wall-wood-panel",       "Wood Wall Panelling",          "Lambriu lemn",                 "wall-finish", "m2", 25,  "pine 12mm"),
  fb("wall-wallpaper",        "Non-woven Wallpaper",          "Tapet nontesut",               "wall-finish", "roll", 22, "0.53x10m roll"),

  // ── Insulation ───────────────────────────────────────────
  fb("ins-mineral-wool-100",  "Mineral Wool 100mm",           "Vata minerala bazaltica 100mm","insulation", "m2",  8,   "100mm, 35 kg/m3",  true),
  fb("ins-mineral-wool-150",  "Mineral Wool 150mm",           "Vata minerala bazaltica 150mm","insulation", "m2", 12,   "150mm, 35 kg/m3"),
  fb("ins-mineral-wool-200",  "Mineral Wool 200mm",           "Vata minerala bazaltica 200mm","insulation", "m2", 16,   "200mm, 35 kg/m3"),
  fb("ins-pir-80",            "PIR Board 80mm",               "Placa PIR 80mm",               "insulation", "m2", 22,   "80mm, lambda 0.022"),
  fb("ins-pir-120",           "PIR Board 120mm",              "Placa PIR 120mm",              "insulation", "m2", 32,   "120mm, lambda 0.022"),
  fb("ins-cellulose",         "Cellulose Insulation",         "Celuloza suflata",             "insulation", "m2", 12,   "blown-in, 150mm equiv"),
  fb("ins-eps-100",           "EPS (Polystyrene) 100mm",      "Polistiren expandat 100mm",    "insulation", "m2",  6,   "100mm, 15 kg/m3"),
  fb("ins-xps-80",            "XPS (Extruded) 80mm",          "Polistiren extrudat XPS 80mm", "insulation", "m2", 15,   "80mm, foundation-grade"),

  // ── Windows ──────────────────────────────────────────────
  fb("win-pvc-double",        "PVC Window Double-Glazed",     "Fereastra PVC dublu vitraj",   "windows", "piece", 285, "120x120cm, U=1.1",  true),
  fb("win-pvc-triple",        "PVC Window Triple-Glazed",     "Fereastra PVC triplu vitraj",  "windows", "piece", 385, "120x120cm, U=0.7"),
  fb("win-alu-triple",        "Aluminium Triple-Glazed",      "Fereastra aluminiu triplu",    "windows", "piece", 520, "120x120cm, U=0.7"),
  fb("win-roof-velux",        "Roof Window (Velux-type)",     "Fereastra mansarda tip Velux", "windows", "piece", 450, "78x118cm"),
  fb("win-fixed-glass",       "Fixed Glass Panel",            "Panou sticla fixa",            "windows", "piece", 220, "120x120cm"),

  // ── Doors ────────────────────────────────────────────────
  fb("door-interior-std",     "Interior Door (standard)",     "Usa interior standard",        "doors", "piece", 145, "80x200cm, MDF",     true),
  fb("door-interior-solid",   "Interior Door (solid wood)",   "Usa interior lemn masiv",      "doors", "piece", 280, "80x200cm, oak"),
  fb("door-exterior-steel",   "Exterior Door (steel)",        "Usa exterior metalica",        "doors", "piece", 320, "90x200cm, insulated"),
  fb("door-exterior-wood",    "Exterior Door (wood)",         "Usa exterior lemn",            "doors", "piece", 480, "90x200cm, oak"),
  fb("door-sliding-glass",    "Sliding Glass Door",           "Usa glisanta sticla",          "doors", "piece", 650, "200x220cm"),
  fb("door-bathroom",         "Bathroom Door (moisture-res)", "Usa baie rezistenta umiditate","doors", "piece", 165, "70x200cm"),

  // ── Structure ────────────────────────────────────────────
  fb("str-clt-panel",         "CLT Panel (Cross-Laminated)",  "Panou CLT lemn laminat",       "structure", "m2", 180, "120mm, spruce",     true),
  fb("str-timber-frame",      "Timber Frame",                 "Cadru lemn constructie",       "structure", "m2",  95, "KVH C24 grade"),
  fb("str-osb-18",            "OSB Board 18mm",               "Placa OSB 18mm",               "structure", "m2",  12, "OSB/3, 2500x1250"),
  fb("str-osb-22",            "OSB Board 22mm",               "Placa OSB 22mm",               "structure", "m2",  15, "OSB/3, 2500x1250"),
  fb("str-steel-beam",        "Steel I-Beam",                 "Grinda metalica IPE",          "structure", "ml",  45, "IPE 200, S235"),
  fb("str-plywood-birch",     "Birch Plywood 18mm",           "Placaj mesteacan 18mm",        "structure", "m2",  28, "BB/CP grade"),

  // ── Roofing ──────────────────────────────────────────────
  fb("roof-metal-sheet",      "Metal Roof Sheet",             "Tabla acoperis",               "roofing", "m2", 18, "0.5mm, polyester",    true),
  fb("roof-flat-epdm",        "Flat Roof EPDM Membrane",      "Membrana EPDM acoperis plat", "roofing", "m2", 25, "1.2mm, single-ply"),
  fb("roof-flat-tpo",         "Flat Roof TPO Membrane",       "Membrana TPO acoperis plat",  "roofing", "m2", 22, "1.5mm"),
  fb("roof-ceramic-tile",     "Ceramic Roof Tile",            "Tigla ceramica",               "roofing", "m2", 32, "Bramac-type"),
  fb("roof-green-sedum",      "Green Roof (sedum)",           "Acoperis verde sedum",         "roofing", "m2", 65, "substrate + sedum mat"),
  fb("roof-bitumen-shingle",  "Bitumen Shingles",             "Sindrila bituminoasa",         "roofing", "m2", 14, "3-tab standard"),

  // ── Plumbing ─────────────────────────────────────────────
  fb("plumb-pex-pipe",        "PEX Water Pipe 20mm",          "Teava PEX 20mm",              "plumbing", "ml",   3,  "cross-linked PE"),
  fb("plumb-ppr-pipe",        "PPR Pipe 25mm",                "Teava PPR 25mm",              "plumbing", "ml",   4,  "PN20, hot/cold"),
  fb("plumb-toilet",          "Toilet (wall-hung)",           "Vas WC suspendat",             "plumbing", "piece", 220, "rimless, soft-close"),
  fb("plumb-shower-tray",     "Shower Tray 90x90",           "Cadita dus 90x90",             "plumbing", "piece", 145, "acrylic, flat"),
  fb("plumb-sink-kitchen",    "Kitchen Sink (stainless)",     "Chiuveta inox bucatarie",      "plumbing", "piece", 120, "1.5 bowl, 80x50cm"),
  fb("plumb-sink-bathroom",   "Bathroom Sink",               "Lavoar baie",                  "plumbing", "piece",  85, "ceramic, 60x45cm"),
  fb("plumb-water-heater",    "Electric Water Heater 80L",   "Boiler electric 80L",          "plumbing", "piece", 195, "80L, 2kW"),
  fb("plumb-heat-pump-air",   "Air-Source Heat Pump",        "Pompa caldura aer-apa",        "plumbing", "piece", 3200, "6kW, A++ rating"),

  // ── Electrical ───────────────────────────────────────────
  fb("elec-cable-3x2.5",     "NYM Cable 3x2.5mm",            "Cablu NYM 3x2.5mm",           "electrical", "ml",   2,  "copper, solid core"),
  fb("elec-cable-3x1.5",     "NYM Cable 3x1.5mm",            "Cablu NYM 3x1.5mm",           "electrical", "ml",   1.5,"copper, solid core"),
  fb("elec-socket",          "Wall Socket (Schuko)",          "Priza Schuko",                 "electrical", "piece", 8, "flush-mount, white"),
  fb("elec-switch",          "Light Switch",                  "Intrerupator simplu",          "electrical", "piece", 7, "flush-mount, white"),
  fb("elec-led-panel",       "LED Panel Light 60x60",        "Panou LED 60x60",              "electrical", "piece", 35, "40W, 4000K"),
  fb("elec-consumer-unit",   "Consumer Unit 12-way",         "Tablou electric 12 module",    "electrical", "piece", 85, "DIN rail, IP40"),
  fb("elec-rcd-breaker",     "RCD/MCB Combo Breaker",        "Intrerupator diferential+MCB", "electrical", "piece", 42, "30mA, 16A"),
  fb("elec-smart-switch",    "Smart Light Switch (WiFi)",    "Intrerupator smart WiFi",      "electrical", "piece", 28, "Tuya-compatible"),

  // ── Exterior Finish ──────────────────────────────────────
  fb("ext-fiber-cement",     "Fiber Cement Board",            "Placa fibrociment",            "exterior-finish", "m2", 32, "8mm, painted"),
  fb("ext-wood-cladding",    "Larch Wood Cladding",          "Lambriu larice exterior",      "exterior-finish", "m2", 38, "19mm, treated",     true),
  fb("ext-metal-cladding",   "Corrugated Metal Cladding",    "Tabla cutata fatada",          "exterior-finish", "m2", 22, "0.5mm, polyester"),
  fb("ext-render-silicone",  "Silicone Render System",       "Tencuiala siliconica",         "exterior-finish", "m2", 28, "inc. mesh + primer"),
  fb("ext-hpl-panel",        "HPL Facade Panel",             "Panou HPL fatada",             "exterior-finish", "m2", 55, "8mm, UV-resistant"),

  // ── Fasteners & Misc ────────────────────────────────────
  fb("fast-screws-box",      "Wood Screws Box (200pc)",      "Suruburi lemn cutie 200buc",   "fasteners", "set",  8,  "4.5x60mm, galv."),
  fb("fast-brackets-set",    "Angle Brackets Set (50pc)",    "Coltar metalic set 50buc",     "fasteners", "set", 25,  "90x90mm, galv."),
  fb("fast-vapour-barrier",  "Vapour Barrier Membrane",      "Bariera vapori",               "fasteners", "m2",   2,  "PE foil, 0.2mm"),
  fb("fast-wind-barrier",    "Wind Barrier Membrane",        "Folie antivent",               "fasteners", "m2",   3,  "breathable, Sd<0.05"),
  fb("fast-adhesive-pu",     "PU Construction Adhesive",     "Adeziv PU constructii",        "fasteners", "piece", 9, "750ml can"),
  fb("fast-sealant-silic",   "Silicone Sealant",             "Silicon sanitar",              "fasteners", "piece", 6, "280ml, anti-mould"),

  // ── HVAC ─────────────────────────────────────────────────
  fb("hvac-erv-unit",        "ERV Ventilation Unit",         "Recuperator caldura ERV",      "hvac", "piece", 850,  "150 m3/h, 90% eff"),
  fb("hvac-duct-150",        "Ventilation Duct 150mm",       "Tub ventilatie 150mm",         "hvac", "ml",    8,    "galvanized steel"),
  fb("hvac-radiator-1000",   "Steel Panel Radiator",         "Calorifer otel panou",         "hvac", "piece", 120,  "Type 22, 600x1000mm"),
  fb("hvac-underfloor-kit",  "Underfloor Heating Kit",       "Kit incalzire pardoseala",     "hvac", "m2",    32,   "PEX pipe + manifold"),
];

// ─── Preconfigured Sources ───────────────────────────────────

export const DEFAULT_PRICE_SOURCES: PriceSource[] = [
  {
    id: "src-dedeman",
    name: "Dedeman",
    type: "scrape",
    baseUrl: "https://www.dedeman.ro",
    lastSyncedAt: null,
    status: "pending",
    materialCount: 0,
  },
  {
    id: "src-hornbach",
    name: "Hornbach",
    type: "scrape",
    baseUrl: "https://www.hornbach.ro",
    lastSyncedAt: null,
    status: "pending",
    materialCount: 0,
  },
  {
    id: "src-mathaus",
    name: "MatHaus",
    type: "scrape",
    baseUrl: "https://www.mathaus.ro",
    lastSyncedAt: null,
    status: "pending",
    materialCount: 0,
  },
  {
    id: "src-leroy-merlin",
    name: "Leroy Merlin",
    type: "scrape",
    baseUrl: "https://www.leroymerlin.ro",
    lastSyncedAt: null,
    status: "pending",
    materialCount: 0,
  },
  {
    id: "src-csv-manual",
    name: "CSV Import",
    type: "csv",
    baseUrl: "",
    lastSyncedAt: null,
    status: "active",
    materialCount: 0,
  },
  {
    id: "src-manual",
    name: "Manual Entry",
    type: "manual",
    baseUrl: "",
    lastSyncedAt: null,
    status: "active",
    materialCount: 0,
  },
];

// ─── Module Bill-of-Materials Templates ──────────────────────

/**
 * Material quantities needed per module (3x3m = 9m2 exterior, 7m2 usable)
 * by finish level. Keys are MaterialPrice IDs, values are quantities.
 */
export interface ModuleBOM {
  moduleType: string;
  finishLevel: "basic" | "standard" | "premium";
  items: Record<string, number>;
}

export const MODULE_BOMS: ModuleBOM[] = [
  // ── Bedroom ──────────────────────────────────────────────
  {
    moduleType: "bedroom",
    finishLevel: "basic",
    items: {
      "str-timber-frame": 18,          // 18 m2 structural walls + floor
      "str-osb-18": 16,                // sheathing
      "ins-mineral-wool-100": 18,      // walls + ceiling
      "floor-laminate-8mm": 7,         // usable floor area
      "wall-paint-interior": 28,       // ~28 m2 wall surface
      "win-pvc-double": 1,
      "door-interior-std": 1,
      "elec-cable-3x2.5": 15,
      "elec-socket": 4,
      "elec-switch": 1,
      "elec-led-panel": 1,
      "fast-vapour-barrier": 9,
      "ext-metal-cladding": 12,
      "roof-bitumen-shingle": 9,
    },
  },
  {
    moduleType: "bedroom",
    finishLevel: "standard",
    items: {
      "str-timber-frame": 18,
      "str-osb-22": 16,
      "ins-mineral-wool-150": 18,
      "floor-oak-engineered": 7,
      "wall-paint-interior": 28,
      "win-pvc-triple": 1,
      "door-interior-std": 1,
      "elec-cable-3x2.5": 18,
      "elec-socket": 5,
      "elec-switch": 2,
      "elec-led-panel": 1,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-wood-cladding": 12,
      "roof-metal-sheet": 9,
      "hvac-duct-150": 3,
    },
  },
  {
    moduleType: "bedroom",
    finishLevel: "premium",
    items: {
      "str-clt-panel": 18,
      "str-plywood-birch": 9,
      "ins-pir-120": 18,
      "floor-oak-solid": 7,
      "wall-paint-interior": 28,
      "wall-wood-panel": 6,
      "win-alu-triple": 1,
      "door-interior-solid": 1,
      "elec-cable-3x2.5": 22,
      "elec-socket": 6,
      "elec-switch": 2,
      "elec-smart-switch": 1,
      "elec-led-panel": 2,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-hpl-panel": 12,
      "roof-flat-epdm": 9,
      "hvac-duct-150": 3,
    },
  },

  // ── Kitchen ──────────────────────────────────────────────
  {
    moduleType: "kitchen",
    finishLevel: "basic",
    items: {
      "str-timber-frame": 18,
      "str-osb-18": 16,
      "ins-mineral-wool-100": 18,
      "floor-porcelain": 7,
      "wall-paint-interior": 20,
      "wall-ceramic-tile": 8,
      "win-pvc-double": 1,
      "door-interior-std": 1,
      "plumb-ppr-pipe": 8,
      "plumb-sink-kitchen": 1,
      "elec-cable-3x2.5": 20,
      "elec-socket": 6,
      "elec-switch": 1,
      "elec-led-panel": 1,
      "fast-vapour-barrier": 9,
      "ext-metal-cladding": 12,
      "roof-bitumen-shingle": 9,
    },
  },
  {
    moduleType: "kitchen",
    finishLevel: "standard",
    items: {
      "str-timber-frame": 18,
      "str-osb-22": 16,
      "ins-mineral-wool-150": 18,
      "floor-porcelain": 7,
      "wall-paint-interior": 18,
      "wall-ceramic-tile": 10,
      "win-pvc-triple": 1,
      "door-interior-std": 1,
      "plumb-ppr-pipe": 10,
      "plumb-sink-kitchen": 1,
      "plumb-water-heater": 1,
      "elec-cable-3x2.5": 25,
      "elec-socket": 8,
      "elec-switch": 2,
      "elec-led-panel": 2,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-wood-cladding": 12,
      "roof-metal-sheet": 9,
      "hvac-duct-150": 4,
    },
  },
  {
    moduleType: "kitchen",
    finishLevel: "premium",
    items: {
      "str-clt-panel": 18,
      "str-plywood-birch": 9,
      "ins-pir-120": 18,
      "floor-porcelain": 7,
      "wall-paint-interior": 16,
      "wall-ceramic-tile": 12,
      "win-alu-triple": 1,
      "door-interior-solid": 1,
      "plumb-ppr-pipe": 12,
      "plumb-sink-kitchen": 1,
      "plumb-water-heater": 1,
      "elec-cable-3x2.5": 30,
      "elec-socket": 10,
      "elec-switch": 2,
      "elec-smart-switch": 2,
      "elec-led-panel": 3,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-hpl-panel": 12,
      "roof-flat-epdm": 9,
      "hvac-erv-unit": 1,
      "hvac-duct-150": 5,
    },
  },

  // ── Bathroom ─────────────────────────────────────────────
  {
    moduleType: "bathroom",
    finishLevel: "basic",
    items: {
      "str-timber-frame": 18,
      "str-osb-18": 16,
      "ins-mineral-wool-100": 18,
      "floor-porcelain": 7,
      "wall-ceramic-tile": 28,
      "win-pvc-double": 1,
      "door-bathroom": 1,
      "plumb-pex-pipe": 12,
      "plumb-ppr-pipe": 6,
      "plumb-toilet": 1,
      "plumb-shower-tray": 1,
      "plumb-sink-bathroom": 1,
      "elec-cable-3x1.5": 10,
      "elec-socket": 2,
      "elec-switch": 1,
      "elec-led-panel": 1,
      "elec-rcd-breaker": 1,
      "fast-vapour-barrier": 9,
      "fast-sealant-silic": 4,
      "ext-metal-cladding": 12,
      "roof-bitumen-shingle": 9,
    },
  },
  {
    moduleType: "bathroom",
    finishLevel: "standard",
    items: {
      "str-timber-frame": 18,
      "str-osb-22": 16,
      "ins-mineral-wool-150": 18,
      "floor-porcelain": 7,
      "wall-ceramic-tile": 28,
      "win-pvc-triple": 1,
      "door-bathroom": 1,
      "plumb-pex-pipe": 14,
      "plumb-ppr-pipe": 8,
      "plumb-toilet": 1,
      "plumb-shower-tray": 1,
      "plumb-sink-bathroom": 1,
      "plumb-water-heater": 1,
      "elec-cable-3x2.5": 14,
      "elec-socket": 3,
      "elec-switch": 2,
      "elec-led-panel": 2,
      "elec-rcd-breaker": 1,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "fast-sealant-silic": 5,
      "ext-wood-cladding": 12,
      "roof-metal-sheet": 9,
      "hvac-duct-150": 3,
    },
  },
  {
    moduleType: "bathroom",
    finishLevel: "premium",
    items: {
      "str-clt-panel": 18,
      "str-plywood-birch": 9,
      "ins-pir-120": 18,
      "floor-porcelain": 7,
      "wall-ceramic-tile": 28,
      "win-alu-triple": 1,
      "door-interior-solid": 1,
      "plumb-pex-pipe": 16,
      "plumb-ppr-pipe": 10,
      "plumb-toilet": 1,
      "plumb-shower-tray": 1,
      "plumb-sink-bathroom": 1,
      "plumb-water-heater": 1,
      "elec-cable-3x2.5": 18,
      "elec-socket": 4,
      "elec-switch": 2,
      "elec-smart-switch": 1,
      "elec-led-panel": 3,
      "elec-rcd-breaker": 1,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "fast-sealant-silic": 6,
      "ext-hpl-panel": 12,
      "roof-flat-epdm": 9,
      "hvac-erv-unit": 1,
      "hvac-duct-150": 4,
      "hvac-underfloor-kit": 7,
    },
  },

  // ── Living Room ──────────────────────────────────────────
  {
    moduleType: "living",
    finishLevel: "basic",
    items: {
      "str-timber-frame": 18,
      "str-osb-18": 16,
      "ins-mineral-wool-100": 18,
      "floor-laminate-8mm": 7,
      "wall-paint-interior": 28,
      "win-pvc-double": 2,
      "door-interior-std": 1,
      "elec-cable-3x2.5": 18,
      "elec-socket": 6,
      "elec-switch": 2,
      "elec-led-panel": 2,
      "fast-vapour-barrier": 9,
      "ext-metal-cladding": 12,
      "roof-bitumen-shingle": 9,
    },
  },
  {
    moduleType: "living",
    finishLevel: "standard",
    items: {
      "str-timber-frame": 18,
      "str-osb-22": 16,
      "ins-mineral-wool-150": 18,
      "floor-oak-engineered": 7,
      "wall-paint-interior": 28,
      "win-pvc-triple": 2,
      "door-interior-std": 1,
      "elec-cable-3x2.5": 22,
      "elec-socket": 8,
      "elec-switch": 3,
      "elec-led-panel": 2,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-wood-cladding": 12,
      "roof-metal-sheet": 9,
      "hvac-duct-150": 4,
    },
  },
  {
    moduleType: "living",
    finishLevel: "premium",
    items: {
      "str-clt-panel": 18,
      "str-plywood-birch": 9,
      "ins-pir-120": 18,
      "floor-oak-solid": 7,
      "wall-paint-interior": 22,
      "wall-wood-panel": 8,
      "win-alu-triple": 2,
      "door-sliding-glass": 1,
      "elec-cable-3x2.5": 28,
      "elec-socket": 10,
      "elec-switch": 3,
      "elec-smart-switch": 2,
      "elec-led-panel": 3,
      "fast-vapour-barrier": 9,
      "fast-wind-barrier": 12,
      "ext-hpl-panel": 12,
      "roof-flat-epdm": 9,
      "hvac-erv-unit": 1,
      "hvac-duct-150": 5,
    },
  },
];

/**
 * Returns the BOM for a given module + finish, falling back to
 * "standard" if the exact combo isn't defined.
 */
export function getModuleBOM(
  moduleType: string,
  finishLevel: "basic" | "standard" | "premium",
): ModuleBOM | undefined {
  return (
    MODULE_BOMS.find(
      (b) => b.moduleType === moduleType && b.finishLevel === finishLevel,
    ) ??
    MODULE_BOMS.find(
      (b) => b.moduleType === moduleType && b.finishLevel === "standard",
    )
  );
}
