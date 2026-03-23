"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDesignStore } from "../../store";
import { useLandStore } from "@/features/land/store";
import { getStyleDirection } from "../../styles";
import { MODULE_TYPES } from "@/shared/types";
import StepNav from "../shared/StepNav";

// ─── Types ───────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  imageColor: string;
  description: string;
  dimensions: string;
  inStock: boolean;
  matchScore: number;
  tags: string[];
}

type CategoryFilter =
  | "all"
  | "flooring"
  | "furniture"
  | "lighting"
  | "textiles"
  | "fixtures"
  | "appliances";

// ─── Step Nav ────────────────────────────────────────────────


const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "flooring", label: "Flooring" },
  { id: "furniture", label: "Furniture" },
  { id: "lighting", label: "Lighting" },
  { id: "textiles", label: "Textiles" },
  { id: "fixtures", label: "Fixtures" },
  { id: "appliances", label: "Appliances" },
];

// ─── Product Catalogs ────────────────────────────────────────

function getProductsForStyle(styleId: string | null): Product[] {
  if (styleId === "industrial") return INDUSTRIAL_PRODUCTS;
  if (styleId === "warm-contemporary") return WARM_CONTEMPORARY_PRODUCTS;
  return SCANDINAVIAN_PRODUCTS;
}

const SCANDINAVIAN_PRODUCTS: Product[] = [
  { id: "sc-1", name: "Birch Wide-Plank Flooring", brand: "Kvik Nordic", price: 89, category: "flooring", imageColor: "#D4A76A", description: "White-oiled birch planks, 200mm wide, matte finish", dimensions: "200 x 1800 mm per plank", inStock: true, matchScore: 98, tags: ["oak", "matte", "sustainable"] },
  { id: "sc-2", name: "Ektorp Modular Sofa", brand: "Nordisk Living", price: 1290, category: "furniture", imageColor: "#E8DFD0", description: "Linen-blend slipcover sofa, light grey, 3-seat", dimensions: "230 x 90 x 78 cm", inStock: true, matchScore: 95, tags: ["modular", "washable", "linen"] },
  { id: "sc-3", name: "Opal Glass Pendant", brand: "Muuto", price: 345, category: "lighting", imageColor: "#F5F3EF", description: "Hand-blown opal glass dome, brass fitting", dimensions: "28 cm diameter", inStock: true, matchScore: 97, tags: ["brass", "opal", "handmade"] },
  { id: "sc-4", name: "Handwoven Wool Rug", brand: "Finarte", price: 420, category: "textiles", imageColor: "#C8CDD0", description: "Natural undyed wool, geometric pattern, ivory/grey", dimensions: "200 x 300 cm", inStock: true, matchScore: 93, tags: ["wool", "handmade", "natural"] },
  { id: "sc-5", name: "Ceramic Table Lamp", brand: "Hay", price: 175, category: "lighting", imageColor: "#F0EDE5", description: "Matte white ceramic base, linen shade", dimensions: "22 x 40 cm", inStock: false, matchScore: 88, tags: ["ceramic", "minimalist"] },
  { id: "sc-6", name: "Oak Dining Table", brand: "Bolia", price: 1850, category: "furniture", imageColor: "#D4B896", description: "Solid oak, tapered legs, seats 6, natural oil finish", dimensions: "200 x 95 x 75 cm", inStock: true, matchScore: 96, tags: ["solid oak", "scandinavian", "seats 6"] },
  { id: "sc-7", name: "Sheer Linen Curtains", brand: "Tekla", price: 120, category: "textiles", imageColor: "#EAE0D2", description: "Stonewashed linen, natural tone, per panel", dimensions: "140 x 260 cm", inStock: true, matchScore: 91, tags: ["linen", "sheer", "natural"] },
  { id: "sc-8", name: "Stoneware Vase Set", brand: "Ro Collection", price: 95, category: "fixtures", imageColor: "#F0EDE5", description: "Matte white stoneware, set of 3, organic shapes", dimensions: "12-22 cm height", inStock: true, matchScore: 85, tags: ["stoneware", "set", "organic"] },
  { id: "sc-9", name: "Birch Bookshelf", brand: "String", price: 680, category: "furniture", imageColor: "#D4A76A", description: "Wall-mounted modular shelving, birch veneer", dimensions: "80 x 30 x 200 cm", inStock: true, matchScore: 92, tags: ["modular", "wall-mounted", "birch"] },
  { id: "sc-10", name: "Fog Grey Bath Towels", brand: "Tekla", price: 55, category: "textiles", imageColor: "#C8CDD0", description: "Organic cotton waffle weave, set of 2", dimensions: "70 x 140 cm", inStock: true, matchScore: 80, tags: ["organic", "waffle", "cotton"] },
  { id: "sc-11", name: "Pine Bedside Table", brand: "Kvik Nordic", price: 195, category: "furniture", imageColor: "#8FA68A", description: "Rounded corners, single drawer, solid pine", dimensions: "45 x 35 x 50 cm", inStock: false, matchScore: 89, tags: ["pine", "rounded", "bedroom"] },
  { id: "sc-12", name: "Slim Integrated Dishwasher", brand: "Asko", price: 890, category: "appliances", imageColor: "#E0E0E0", description: "45cm panel-ready, A+++ energy, whisper quiet", dimensions: "45 x 57 x 82 cm", inStock: true, matchScore: 78, tags: ["integrated", "energy-efficient", "quiet"] },
  { id: "sc-13", name: "Wool Throw Blanket", brand: "Klippan", price: 85, category: "textiles", imageColor: "#E8DFD0", description: "Lambswool, herringbone pattern, natural/cream", dimensions: "130 x 180 cm", inStock: true, matchScore: 90, tags: ["lambswool", "herringbone"] },
  { id: "sc-14", name: "Cork & Oak Side Table", brand: "Muuto", price: 275, category: "furniture", imageColor: "#D4B896", description: "Cork top, oak legs, multipurpose", dimensions: "45 cm diameter x 48 cm", inStock: true, matchScore: 86, tags: ["cork", "oak", "multipurpose"] },
  { id: "sc-15", name: "Concrete Bathroom Sink", brand: "Kvik Nordic", price: 560, category: "fixtures", imageColor: "#D0CEC8", description: "Micro-cement vessel sink, light grey", dimensions: "50 x 38 x 14 cm", inStock: true, matchScore: 82, tags: ["concrete", "vessel", "bathroom"] },
  { id: "sc-16", name: "Induction Cooktop 60cm", brand: "Asko", price: 720, category: "appliances", imageColor: "#3A3A3A", description: "4-zone induction, touch controls, black glass", dimensions: "60 x 52 cm", inStock: true, matchScore: 75, tags: ["induction", "touch", "energy-efficient"] },
  { id: "sc-17", name: "Brass Wall Sconce Pair", brand: "Hay", price: 230, category: "lighting", imageColor: "#C8A96E", description: "Brushed brass, directional, warm white LED", dimensions: "12 x 25 cm each", inStock: true, matchScore: 94, tags: ["brass", "LED", "pair"] },
  { id: "sc-18", name: "Linen Bed Set Queen", brand: "Tekla", price: 310, category: "textiles", imageColor: "#F5F3EF", description: "Stonewashed linen duvet cover + 2 pillowcases", dimensions: "Queen 240 x 220 cm", inStock: true, matchScore: 92, tags: ["linen", "queen", "stonewashed"] },
];

const INDUSTRIAL_PRODUCTS: Product[] = [
  { id: "in-1", name: "Polished Concrete Flooring", brand: "ConcreteLab", price: 75, category: "flooring", imageColor: "#B0AFA8", description: "Self-leveling micro-cement, sealed grey finish", dimensions: "Per m2, 3mm thickness", inStock: true, matchScore: 99, tags: ["concrete", "sealed", "grey"] },
  { id: "in-2", name: "Leather Chesterfield Sofa", brand: "Warehouse Home", price: 1890, category: "furniture", imageColor: "#8B5E3C", description: "Distressed brown leather, steel rivet details, 3-seat", dimensions: "220 x 95 x 75 cm", inStock: true, matchScore: 96, tags: ["leather", "distressed", "rivets"] },
  { id: "in-3", name: "Edison Cage Pendant", brand: "Industville", price: 125, category: "lighting", imageColor: "#3A3A3A", description: "Iron wire cage, E27, exposed filament included", dimensions: "18 cm diameter", inStock: true, matchScore: 98, tags: ["edison", "iron", "cage"] },
  { id: "in-4", name: "Reclaimed Wood Shelf Unit", brand: "Made.com", price: 580, category: "furniture", imageColor: "#6B4E37", description: "Reclaimed teak shelves on blackened steel frame, 5-tier", dimensions: "120 x 40 x 180 cm", inStock: true, matchScore: 94, tags: ["reclaimed", "steel", "teak"] },
  { id: "in-5", name: "Copper Tap & Handles Set", brand: "Industville", price: 340, category: "fixtures", imageColor: "#C87941", description: "Brushed copper, cross-handle mixer tap for kitchen", dimensions: "28 cm spout height", inStock: false, matchScore: 91, tags: ["copper", "mixer", "cross-handle"] },
  { id: "in-6", name: "Geometric Concrete Planters", brand: "ConcreteLab", price: 65, category: "fixtures", imageColor: "#B0AFA8", description: "Set of 3 hexagonal concrete vessels, raw finish", dimensions: "10-18 cm diameter", inStock: true, matchScore: 87, tags: ["concrete", "geometric", "set"] },
  { id: "in-7", name: "Metal Factory Dining Table", brand: "Warehouse Home", price: 1450, category: "furniture", imageColor: "#5A5A5A", description: "Steel base, reclaimed oak top, seats 6", dimensions: "200 x 90 x 76 cm", inStock: true, matchScore: 93, tags: ["steel", "oak", "factory"] },
  { id: "in-8", name: "Leather & Iron Bar Stools", brand: "Made.com", price: 195, category: "furniture", imageColor: "#8B5E3C", description: "Saddle leather seat, iron frame, set of 2", dimensions: "42 x 42 x 75 cm", inStock: true, matchScore: 90, tags: ["leather", "iron", "bar-height"] },
  { id: "in-9", name: "Exposed Brick Wallpaper", brand: "Rebel Walls", price: 55, category: "fixtures", imageColor: "#B5654A", description: "Photo-realistic brick texture, peel & stick, per roll", dimensions: "52 cm x 10 m", inStock: true, matchScore: 85, tags: ["brick", "peel-stick", "texture"] },
  { id: "in-10", name: "Steel Pipe Floor Lamp", brand: "Industville", price: 280, category: "lighting", imageColor: "#7A8088", description: "Black iron pipe, adjustable arm, vintage socket", dimensions: "170 cm height", inStock: true, matchScore: 92, tags: ["pipe", "adjustable", "iron"] },
  { id: "in-11", name: "Wool & Jute Area Rug", brand: "House Doctor", price: 320, category: "textiles", imageColor: "#8B7B6B", description: "Charcoal wool with jute border, hand-loomed", dimensions: "200 x 300 cm", inStock: true, matchScore: 82, tags: ["wool", "jute", "charcoal"] },
  { id: "in-12", name: "Black Steel Range Hood", brand: "Elica", price: 680, category: "appliances", imageColor: "#2A2A2A", description: "Matte black steel, wall-mounted, 90cm", dimensions: "90 x 50 x 60 cm", inStock: true, matchScore: 88, tags: ["black", "steel", "wall-mounted"] },
  { id: "in-13", name: "Riveted Metal Cabinet", brand: "Warehouse Home", price: 490, category: "furniture", imageColor: "#5A5A5A", description: "Military-style riveted steel, 2-door, aged patina", dimensions: "80 x 45 x 160 cm", inStock: false, matchScore: 89, tags: ["riveted", "military", "patina"] },
  { id: "in-14", name: "Concrete Pendant Cluster", brand: "ConcreteLab", price: 210, category: "lighting", imageColor: "#B0AFA8", description: "3x micro-concrete shades, black cord, cluster mount", dimensions: "12 cm diameter each", inStock: true, matchScore: 95, tags: ["concrete", "cluster", "trio"] },
  { id: "in-15", name: "Canvas & Leather Throw", brand: "House Doctor", price: 95, category: "textiles", imageColor: "#7A7060", description: "Waxed canvas with leather trim, dark olive", dimensions: "150 x 200 cm", inStock: true, matchScore: 79, tags: ["canvas", "leather", "olive"] },
  { id: "in-16", name: "Retro Fridge-Freezer", brand: "Smeg", price: 1650, category: "appliances", imageColor: "#3A3A3A", description: "Matte black, retro-industrial style, A++ rated", dimensions: "60 x 68 x 152 cm", inStock: true, matchScore: 84, tags: ["retro", "black", "A++"] },
  { id: "in-17", name: "Iron Towel Rack Ladder", brand: "Industville", price: 120, category: "fixtures", imageColor: "#3A3A3A", description: "Raw iron ladder rack, 5 rungs, wall-leaning", dimensions: "50 x 5 x 180 cm", inStock: true, matchScore: 86, tags: ["iron", "ladder", "bathroom"] },
  { id: "in-18", name: "Copper Desk Lamp", brand: "Made.com", price: 155, category: "lighting", imageColor: "#C87941", description: "Brushed copper shade, articulated arm, weighted base", dimensions: "45 cm height", inStock: true, matchScore: 91, tags: ["copper", "articulated", "desk"] },
];

const WARM_CONTEMPORARY_PRODUCTS: Product[] = [
  { id: "wc-1", name: "Walnut Herringbone Flooring", brand: "Parla", price: 115, category: "flooring", imageColor: "#7B5B3A", description: "Engineered walnut, herringbone pattern, satin finish", dimensions: "120 x 600 mm per piece", inStock: true, matchScore: 99, tags: ["walnut", "herringbone", "engineered"] },
  { id: "wc-2", name: "Cream Boucle Armchair", brand: "Gubi", price: 1680, category: "furniture", imageColor: "#F2EBD9", description: "Cream boucle upholstery, curved walnut frame", dimensions: "78 x 82 x 76 cm", inStock: true, matchScore: 97, tags: ["boucle", "curved", "walnut"] },
  { id: "wc-3", name: "Brass Arc Floor Lamp", brand: "Flos", price: 890, category: "lighting", imageColor: "#C8A96E", description: "Brushed brass arc, natural linen drum shade", dimensions: "190 cm height, 120 cm reach", inStock: true, matchScore: 96, tags: ["brass", "arc", "linen-shade"] },
  { id: "wc-4", name: "Sage Velvet Cushion Set", brand: "Ferm Living", price: 140, category: "textiles", imageColor: "#8FAE8B", description: "Sage green velvet, set of 3, piped edges", dimensions: "50 x 50 cm each", inStock: true, matchScore: 94, tags: ["velvet", "sage", "set"] },
  { id: "wc-5", name: "Terracotta Handmade Tiles", brand: "Marrakech Design", price: 95, category: "fixtures", imageColor: "#C4735C", description: "Handmade terracotta, natural variation, per m2", dimensions: "10 x 10 cm each tile", inStock: true, matchScore: 92, tags: ["terracotta", "handmade", "bathroom"] },
  { id: "wc-6", name: "Fluted Glass Room Divider", brand: "Gubi", price: 1250, category: "furniture", imageColor: "#D4DDD2", description: "Fluted glass panel, bronze aluminum frame", dimensions: "100 x 200 cm", inStock: false, matchScore: 90, tags: ["fluted", "glass", "bronze"] },
  { id: "wc-7", name: "Walnut Media Console", brand: "Ethnicraft", price: 1120, category: "furniture", imageColor: "#7B5B3A", description: "Solid walnut, 2 sliding doors, brass legs", dimensions: "180 x 45 x 55 cm", inStock: true, matchScore: 95, tags: ["walnut", "brass", "media"] },
  { id: "wc-8", name: "Linen & Wool Throw", brand: "Ferm Living", price: 110, category: "textiles", imageColor: "#F2EBD9", description: "Cream/sage reversible, fringed edges", dimensions: "140 x 200 cm", inStock: true, matchScore: 88, tags: ["linen", "wool", "reversible"] },
  { id: "wc-9", name: "Terracotta Table Lamp", brand: "Menu", price: 220, category: "lighting", imageColor: "#C4735C", description: "Glazed terracotta base, cream fabric shade", dimensions: "28 x 46 cm", inStock: true, matchScore: 91, tags: ["terracotta", "glazed", "warm"] },
  { id: "wc-10", name: "Sage Plaster Wall Paint", brand: "Farrow & Ball", price: 65, category: "fixtures", imageColor: "#8FAE8B", description: "Sage green, matte finish, 2.5L tin, per tin", dimensions: "Covers ~30 m2", inStock: true, matchScore: 86, tags: ["sage", "matte", "plaster-effect"] },
  { id: "wc-11", name: "Round Walnut Dining Table", brand: "Ethnicraft", price: 1950, category: "furniture", imageColor: "#7B5B3A", description: "Solid walnut, organic edge, seats 4-6", dimensions: "130 cm diameter x 76 cm", inStock: true, matchScore: 93, tags: ["walnut", "round", "organic"] },
  { id: "wc-12", name: "Built-in Steam Oven", brand: "Miele", price: 1890, category: "appliances", imageColor: "#E0D5C5", description: "Combination steam oven, bronze handle, 60cm", dimensions: "60 x 57 x 45 cm", inStock: true, matchScore: 80, tags: ["steam", "built-in", "bronze"] },
  { id: "wc-13", name: "Boucle Dining Chairs x2", brand: "Gubi", price: 780, category: "furniture", imageColor: "#F2EBD9", description: "Cream boucle, oak legs, pair", dimensions: "52 x 56 x 80 cm each", inStock: true, matchScore: 94, tags: ["boucle", "oak", "pair"] },
  { id: "wc-14", name: "Brass Pendant Light", brand: "Flos", price: 420, category: "lighting", imageColor: "#C8A96E", description: "Satin brass dome, warm LED, dimmable", dimensions: "35 cm diameter", inStock: true, matchScore: 93, tags: ["brass", "dome", "dimmable"] },
  { id: "wc-15", name: "Hand-knotted Wool Rug", brand: "Armadillo", price: 1250, category: "textiles", imageColor: "#E8D5C0", description: "Cream/terracotta, hand-knotted, New Zealand wool", dimensions: "200 x 300 cm", inStock: false, matchScore: 89, tags: ["hand-knotted", "wool", "terracotta"] },
  { id: "wc-16", name: "Integrated Coffee Machine", brand: "Miele", price: 1450, category: "appliances", imageColor: "#5A4A3A", description: "Built-in bean-to-cup, bronze trim, touch display", dimensions: "60 x 45 x 35 cm", inStock: true, matchScore: 77, tags: ["built-in", "bean-to-cup", "bronze"] },
  { id: "wc-17", name: "Bronze Mirror Round", brand: "Menu", price: 310, category: "fixtures", imageColor: "#C8A96E", description: "Antiqued bronze frame, wall-mounted, bevelled glass", dimensions: "80 cm diameter", inStock: true, matchScore: 90, tags: ["bronze", "round", "bevelled"] },
  { id: "wc-18", name: "Organic Cotton Bed Linen", brand: "Coyuchi", price: 280, category: "textiles", imageColor: "#F2EBD9", description: "Sateen weave, warm cream, queen duvet + pillowcases", dimensions: "Queen 240 x 220 cm", inStock: true, matchScore: 87, tags: ["organic", "sateen", "queen"] },
];

// ─── Component ───────────────────────────────────────────────

export default function ProductsPage() {
  const {
    modules,
    styleDirection,
    setModulesFromGrid,
    getStats,
  } = useDesignStore();

  const { gridCells, gridRotation } = useLandStore();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [budgetMax, setBudgetMax] = useState(5000);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showCount, setShowCount] = useState(12);
  const [consultationAdded, setConsultationAdded] = useState(false);
  const [quoteRequested, setQuoteRequested] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteEmail, setQuoteEmail] = useState("");

  // Photo upload states
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<"idle" | "analyzing" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import modules from grid if store is empty
  useEffect(() => {
    if (modules.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, gridCells, gridRotation, setModulesFromGrid]);

  const stats = getStats();
  const styleDir = styleDirection ? getStyleDirection(styleDirection) : null;
  const styleName = styleDir?.label ?? "Scandinavian Minimal";
  const primaryModuleType =
    modules.length > 0
      ? MODULE_TYPES.find((m) => m.id === modules[0].moduleType)?.label ?? "Module"
      : "Module";

  // Product catalog based on style
  const allProducts = getProductsForStyle(styleDirection);

  const filteredProducts = allProducts
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter((p) => p.price <= budgetMax)
    .slice(0, showCount);

  const productTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const grandTotal = stats.totalEstimate + productTotal + (consultationAdded ? 99 : 0);

  // Image heights for masonry
  const IMAGE_HEIGHTS = [140, 180, 220];

  function addProduct(product: Product) {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
  }

  function removeProduct(productId: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedPhoto(ev.target?.result as string);
      setAnalysisState("analyzing");
      setTimeout(() => setAnalysisState("done"), 2200);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* ── TOP NAV ── */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-gray-200 bg-white shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={9} />

        <div className="w-24" />
      </header>

      {/* ── MODULE SELECTOR BAR ── */}
      <div className="flex items-center justify-between h-12 px-6 bg-white border-b border-gray-200 shrink-0">
        <Link
          href="/project/demo/walkthrough"
          className="text-sm text-[#1B3A4B] hover:text-[#E8913A] transition-colors flex items-center gap-1"
        >
          <span>&larr;</span> Back to Walkthrough
        </Link>
        <Link
          href="/project/demo/finalize"
          className="text-sm font-medium text-[#E8913A] hover:text-[#d07e2e] transition-colors flex items-center gap-1"
        >
          Finalize Project <span>&rarr;</span>
        </Link>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto shrink-0 p-5 flex flex-col gap-6">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Product Categories
            </h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[#1B3A4B] text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Budget Range
            </h3>
            <div className="px-1">
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-[#E8913A]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>&euro;0</span>
                <span className="font-medium text-gray-800">
                  &euro;{budgetMax.toLocaleString()}
                </span>
                <span>&euro;5,000</span>
              </div>
            </div>
          </div>

          {/* Upload Inspiration */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Upload Inspiration
            </h3>
            {!uploadedPhoto ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-[#E8913A] hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
                  +
                </div>
                <span className="text-xs text-gray-500 text-center leading-relaxed">
                  Upload a photo to find matching products
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <div
                  className="w-full h-32 rounded-lg bg-cover bg-center border border-gray-200"
                  style={{ backgroundImage: `url(${uploadedPhoto})` }}
                />
                <div className="text-xs text-center">
                  {analysisState === "analyzing" ? (
                    <span className="text-[#E8913A] font-medium animate-pulse">
                      Analyzing...
                    </span>
                  ) : analysisState === "done" ? (
                    <span className="text-emerald-600 font-medium">
                      3 products found
                    </span>
                  ) : null}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Professional Help */}
          <div className="mt-auto">
            <div className="bg-[#1B3A4B] rounded-xl p-5 text-white">
              <h4 className="font-semibold text-sm mb-1">
                Need expert guidance?
              </h4>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Connect with a professional architect from our team for
                personalized recommendations
              </p>
              <button
                onClick={() => setConsultationAdded(!consultationAdded)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  consultationAdded
                    ? "bg-emerald-500 text-white"
                    : "bg-[#E8913A] text-white hover:bg-[#d07e2e]"
                }`}
              >
                {consultationAdded
                  ? "Consultation Added"
                  : "Book Consultation \u2014 \u20AC99"}
              </button>
              <p className="text-[10px] text-white/50 mt-2 leading-relaxed">
                Includes: 1h video call, custom material selection, 3D
                visualization review
              </p>
            </div>
          </div>
        </aside>

        {/* ── CENTER ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#1B3A4B]">
              Recommended for Your Design
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Products curated by professional architects for your{" "}
              <span className="font-medium text-gray-700">{styleName}</span>{" "}
              <span className="font-medium text-gray-700">
                {primaryModuleType}
              </span>
            </p>
          </div>

          {/* Masonry Grid */}
          <div
            style={{
              columns: 3,
              columnGap: "12px",
            }}
          >
            {filteredProducts.map((product, idx) => {
              const imgHeight = IMAGE_HEIGHTS[idx % 3];
              const isSelected = !!selectedProducts.find(
                (p) => p.id === product.id
              );
              return (
                <div
                  key={product.id}
                  className="break-inside-avoid mb-3 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image Placeholder */}
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      height: `${imgHeight}px`,
                      backgroundColor: product.imageColor,
                    }}
                  >
                    <span className="text-white/40 text-xs font-medium">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-3">
                    {/* Name */}
                    <h3 className="font-bold text-[13px] text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    {/* Brand */}
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {product.brand}
                    </p>
                    {/* Price & Match */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#E8913A] font-bold text-sm">
                        &euro;{product.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          product.matchScore >= 90
                            ? "bg-emerald-100 text-emerald-700"
                            : product.matchScore >= 80
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.matchScore}% match
                      </span>
                    </div>

                    {/* Stock indicator */}
                    <p className="text-[10px] mt-1.5">
                      {product.inStock ? (
                        <span className="text-emerald-600">In Stock</span>
                      ) : (
                        <span className="text-amber-600">Made to Order</span>
                      )}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Add to Project */}
                    <button
                      onClick={() =>
                        isSelected
                          ? removeProduct(product.id)
                          : addProduct(product)
                      }
                      className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-[#1B3A4B] text-white"
                          : "border border-[#1B3A4B] text-[#1B3A4B] hover:bg-[#1B3A4B] hover:text-white"
                      }`}
                    >
                      {isSelected ? "Added to Project" : "Add to Project"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          <div className="flex flex-col items-center gap-3 mt-8 mb-12">
            {showCount < allProducts.length && (
              <button
                onClick={() => setShowCount((c) => Math.min(c + 6, allProducts.length))}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Load More Products
              </button>
            )}
            <p className="text-xs text-gray-400">
              Can&apos;t find what you need?{" "}
              <button
                onClick={() => setConsultationAdded(true)}
                className="text-[#E8913A] underline hover:no-underline"
              >
                Book a consultation
              </button>
            </p>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shrink-0 p-5 flex flex-col">
          <h3 className="text-sm font-bold text-[#1B3A4B] mb-4">
            Your Selection
          </h3>

          {/* Selected Products List */}
          {selectedProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center">
                No products selected yet
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 mb-4">
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded shrink-0"
                      style={{ backgroundColor: p.imageColor }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-[#E8913A] font-semibold">
                        &euro;{p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProduct(p.id)}
                    className="text-gray-400 hover:text-red-500 text-xs shrink-0 ml-2"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">Product Subtotal</span>
                <span className="text-xs font-semibold text-gray-900">
                  &euro;{productTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Design Package */}
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Design Package
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">
                  Module Costs ({stats.totalModules} modules)
                </span>
                <span className="text-xs font-medium text-gray-900">
                  &euro;{stats.moduleCost.toLocaleString()}
                </span>
              </div>
              {stats.sharedWallDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">
                    Shared Wall Discount
                  </span>
                  <span className="text-xs font-medium text-emerald-600">
                    -&euro;{stats.sharedWallDiscount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Design Fee (8%)</span>
                <span className="text-xs font-medium text-gray-900">
                  &euro;{stats.designFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Product Total</span>
                <span className="text-xs font-medium text-gray-900">
                  &euro;{productTotal.toLocaleString()}
                </span>
              </div>
              {consultationAdded && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">
                    Professional Consultation
                  </span>
                  <span className="text-xs font-medium text-gray-900">
                    &euro;99
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-[#1B3A4B]">
                  Grand Total
                </span>
                <span className="text-sm font-bold text-[#1B3A4B]">
                  &euro;{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <Link
              href="/project/demo/finalize"
              className="block w-full py-3 rounded-lg bg-[#E8913A] text-white text-sm font-semibold text-center hover:bg-[#d07e2e] transition-colors"
            >
              Proceed to Finalize
            </Link>
            <button
              onClick={() => {
                if (!quoteRequested) setShowQuoteModal(true);
              }}
              disabled={quoteRequested}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                quoteRequested
                  ? "border border-emerald-500 text-emerald-600 bg-emerald-50 cursor-default"
                  : "border border-[#1B3A4B] text-[#1B3A4B] hover:bg-gray-50"
              }`}
            >
              {quoteRequested ? "Quote Requested \u2713" : "Request Quote"}
            </button>
            {quoteRequested && (
              <p className="text-xs text-emerald-600 text-center mt-1">
                Quote request sent! Our team will contact you within 24 hours.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1B3A4B] mb-4">Request a Quote</h3>

            {/* Project Summary */}
            <div className="rounded-lg bg-gray-50 p-4 mb-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Project Summary
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Modules</span>
                <span className="font-medium text-gray-900">{stats.totalModules}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Style</span>
                <span className="font-medium text-gray-900">{styleName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Products</span>
                <span className="font-medium text-gray-900">{selectedProducts.length} items</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-semibold text-[#1B3A4B]">Estimated Total</span>
                <span className="font-bold text-[#1B3A4B]">&euro;{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Email Field */}
            <label className="block mb-1 text-xs font-medium text-gray-600">Your Email</label>
            <input
              type="email"
              value={quoteEmail}
              onChange={(e) => setQuoteEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4 focus:border-[#E8913A] focus:outline-none focus:ring-1 focus:ring-[#E8913A]"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setQuoteRequested(true);
                  setShowQuoteModal(false);
                }}
                className="flex-1 rounded-lg bg-[#E8913A] py-2.5 text-sm font-semibold text-white hover:bg-[#d07e2e] transition-colors"
              >
                Send Quote Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
