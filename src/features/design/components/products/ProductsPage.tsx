// Future: Integrate with retailer APIs (Sketchfab for 3D, affiliate links for purchases)
// Note: IKEA does NOT have a free public API for 3D models or product data — their assets are proprietary.
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDesignStore } from "../../store";
import { useLandStore } from "@/features/land/store";
import StepNav from "../shared/StepNav";
import {
  Layers,
  Sofa,
  Wrench,
  ShoppingCart,
  X,
  Plus,
  Minus,
  PaintBucket,
  DoorOpen,
  Fence,
  Grid3X3,
  Lamp,
  Armchair,
  Blinds,
  Frame,
  BookOpen,
  Bath,
  Droplets,
  CircleDot,
  ShowerHead,
  Plug,
  ToggleLeft,
  Lightbulb,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

type CategoryId = "finishing" | "furniture" | "plumbing";

interface Product {
  id: string;
  name: string;
  price: number;
  category: CategoryId;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  image: string;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

// ─── Storage Key ─────────────────────────────────────────────

const STORAGE_KEY = "modulca-selected-products";

function loadSelectedProducts(
  allProducts: Product[]
): SelectedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { id: string; quantity: number }[];
    const result: SelectedProduct[] = [];
    for (const item of parsed) {
      const product = allProducts.find((p) => p.id === item.id);
      if (product) {
        result.push({ product, quantity: item.quantity });
      }
    }
    return result;
  } catch {
    return [];
  }
}

function saveSelectedProducts(selected: SelectedProduct[]) {
  if (typeof window === "undefined") return;
  const data = selected.map((s) => ({ id: s.product.id, quantity: s.quantity }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Category Definitions ────────────────────────────────────

const CATEGORIES: { id: CategoryId; label: string; icon: LucideIcon }[] = [
  { id: "finishing", label: "Finishing Materials", icon: Layers },
  { id: "furniture", label: "Furniture & Decor", icon: Sofa },
  { id: "plumbing", label: "Plumbing & Electrical", icon: Wrench },
];

// ─── Product Catalogs ────────────────────────────────────────

const ALL_PRODUCTS: Product[] = [
  // ── Finishing Materials ──
  {
    id: "fin-01",
    name: "Engineered Oak Flooring",
    price: 42,
    category: "finishing",
    description: "Wide-plank engineered oak, brushed matte finish, per m\u00B2",
    icon: Grid3X3,
    iconColor: "#92400E",
    bgColor: "#FEF3C7",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  },
  {
    id: "fin-02",
    name: "Gypsum Wall Panels",
    price: 18,
    category: "finishing",
    description: "Pre-finished gypsum board, smooth white, 120\u00D7240 cm per panel",
    icon: Fence,
    iconColor: "#6B7280",
    bgColor: "#F3F4F6",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&h=300&fit=crop",
  },
  {
    id: "fin-03",
    name: "XPS Underfloor Insulation",
    price: 12,
    category: "finishing",
    description: "Extruded polystyrene board, 30 mm thick, per m\u00B2",
    icon: Layers,
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    id: "fin-04",
    name: "Triple-Glazed Window Unit",
    price: 385,
    category: "finishing",
    description: "PVC frame, argon-filled triple glazing, 120\u00D7140 cm",
    icon: Frame,
    iconColor: "#0891B2",
    bgColor: "#CFFAFE",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&h=300&fit=crop",
  },
  {
    id: "fin-05",
    name: "Interior Flush Door",
    price: 145,
    category: "finishing",
    description: "Solid-core flush door, white primed, 80\u00D7200 cm with hardware",
    icon: DoorOpen,
    iconColor: "#7C3AED",
    bgColor: "#EDE9FE",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "fin-06",
    name: "Mineral Wool Insulation Roll",
    price: 8,
    category: "finishing",
    description: "Rock mineral wool, 100 mm thick, fire-rated A1, per m\u00B2",
    icon: Layers,
    iconColor: "#D97706",
    bgColor: "#FEF9C3",
    image: "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400&h=300&fit=crop",
  },
  {
    id: "fin-07",
    name: "Interior Wall Paint",
    price: 35,
    category: "finishing",
    description: "Low-VOC acrylic emulsion, matt white, 5 L tin covers ~40 m\u00B2",
    icon: PaintBucket,
    iconColor: "#059669",
    bgColor: "#D1FAE5",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop",
  },
  {
    id: "fin-08",
    name: "Porcelain Floor Tiles",
    price: 28,
    category: "finishing",
    description: "Rectified porcelain, 60\u00D760 cm, light grey, per m\u00B2",
    icon: Grid3X3,
    iconColor: "#64748B",
    bgColor: "#F1F5F9",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
  },

  // ── Furniture & Decor ──
  {
    id: "fur-01",
    name: "Modular Sofa 3-Seat",
    price: 1290,
    category: "furniture",
    description: "Linen-blend upholstery, removable covers, grey",
    icon: Sofa,
    iconColor: "#6B7280",
    bgColor: "#F3F4F6",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  },
  {
    id: "fur-02",
    name: "Wool Area Rug 200\u00D7300",
    price: 420,
    category: "furniture",
    description: "Hand-tufted New Zealand wool, ivory/grey geometric pattern",
    icon: Grid3X3,
    iconColor: "#92400E",
    bgColor: "#FEF3C7",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=300&fit=crop",
  },
  {
    id: "fur-03",
    name: "Blackout Curtain Pair",
    price: 95,
    category: "furniture",
    description: "Thermal blackout linen-look fabric, 140\u00D7260 cm per panel",
    icon: Blinds,
    iconColor: "#7C3AED",
    bgColor: "#EDE9FE",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop",
  },
  {
    id: "fur-04",
    name: "Ceramic Vase Collection",
    price: 65,
    category: "furniture",
    description: "Set of 3 matte stoneware vases, earth tones, 12\u201322 cm",
    icon: Frame,
    iconColor: "#DC2626",
    bgColor: "#FEE2E2",
    image: "https://images.unsplash.com/photo-1612196808214-b7e239e5bb89?w=400&h=300&fit=crop",
  },
  {
    id: "fur-05",
    name: "Wall-Mounted Shelving Unit",
    price: 280,
    category: "furniture",
    description: "Modular oak veneer shelves on steel frame, 80\u00D730\u00D7200 cm",
    icon: BookOpen,
    iconColor: "#92400E",
    bgColor: "#FEF3C7",
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop",
  },
  {
    id: "fur-06",
    name: "Pendant Light Fixture",
    price: 175,
    category: "furniture",
    description: "Brass fitting, opal glass dome shade, 28 cm diameter",
    icon: Lamp,
    iconColor: "#D97706",
    bgColor: "#FEF9C3",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=300&fit=crop",
  },
  {
    id: "fur-07",
    name: "Round Wall Mirror",
    price: 210,
    category: "furniture",
    description: "Brushed brass frame, 80 cm diameter, bevelled edge",
    icon: CircleDot,
    iconColor: "#B45309",
    bgColor: "#FDE68A",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=300&fit=crop",
  },
  {
    id: "fur-08",
    name: "Upholstered Dining Chair",
    price: 195,
    category: "furniture",
    description: "Boucle fabric seat, solid oak legs, set of 2",
    icon: Armchair,
    iconColor: "#059669",
    bgColor: "#D1FAE5",
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop",
  },

  // ── Plumbing & Electrical ──
  {
    id: "plm-01",
    name: "Freestanding Bathtub",
    price: 890,
    category: "plumbing",
    description: "Acrylic freestanding tub, white, 170\u00D775 cm, with drain",
    icon: Bath,
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop",
  },
  {
    id: "plm-02",
    name: "Single-Lever Basin Faucet",
    price: 125,
    category: "plumbing",
    description: "Brushed nickel, ceramic cartridge, cold-start eco mode",
    icon: Droplets,
    iconColor: "#0891B2",
    bgColor: "#CFFAFE",
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=400&h=300&fit=crop",
  },
  {
    id: "plm-03",
    name: "Ceramic Countertop Sink",
    price: 185,
    category: "plumbing",
    description: "White glazed ceramic vessel basin, 50\u00D738 cm",
    icon: CircleDot,
    iconColor: "#6B7280",
    bgColor: "#F3F4F6",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
  },
  {
    id: "plm-04",
    name: "Wall-Hung Toilet",
    price: 320,
    category: "plumbing",
    description: "Rimless wall-hung toilet with concealed cistern frame",
    icon: CircleDot,
    iconColor: "#7C3AED",
    bgColor: "#EDE9FE",
    image: "https://images.unsplash.com/photo-1564540586988-aa4e53ab3394?w=400&h=300&fit=crop",
  },
  {
    id: "plm-05",
    name: "Thermostatic Shower Set",
    price: 295,
    category: "plumbing",
    description: "Rain head 25 cm + hand shower, chrome, thermostatic valve",
    icon: ShowerHead,
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop",
  },
  {
    id: "plm-06",
    name: "Flush-Mount Outlet Pack",
    price: 48,
    category: "plumbing",
    description: "Pack of 10 Schuko outlets, white, with child safety shutters",
    icon: Plug,
    iconColor: "#D97706",
    bgColor: "#FEF9C3",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=70",
  },
  {
    id: "plm-07",
    name: "Modular Light Switch Set",
    price: 36,
    category: "plumbing",
    description: "Pack of 8 rocker switches, matt white, single-gang",
    icon: ToggleLeft,
    iconColor: "#64748B",
    bgColor: "#F1F5F9",
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=300&fit=crop",
  },
  {
    id: "plm-08",
    name: "LED Ceiling Downlight Pack",
    price: 85,
    category: "plumbing",
    description: "Pack of 6 recessed LED spots, 7 W each, warm white 3000 K",
    icon: Lightbulb,
    iconColor: "#D97706",
    bgColor: "#FEF9C3",
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop",
  },
  {
    id: "plm-09",
    name: "Electric Water Heater 80 L",
    price: 340,
    category: "plumbing",
    description: "Wall-mounted, enamel tank, 80 L, energy class B",
    icon: Flame,
    iconColor: "#DC2626",
    bgColor: "#FEE2E2",
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=400&h=300&fit=crop&q=70",
  },
];

// ─── Product Detail Modal ────────────────────────────────────

function ProductDetailModal({
  product,
  quantity,
  onClose,
  onAdd,
  onUpdateQuantity,
}: {
  product: Product;
  quantity: number;
  onClose: () => void;
  onAdd: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="relative">
          <div className="relative w-full h-64">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
              unoptimized
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-[#1B3A4B]">{product.name}</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-4">
            <span className="text-2xl font-bold text-[#E8913A]">
              &euro;{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 ml-1">per unit</span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mt-5">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (quantity > 0) onUpdateQuantity(product.id, -1);
                }}
                disabled={quantity === 0}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-base font-bold text-gray-900 w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => {
                  if (quantity > 0) {
                    onUpdateQuantity(product.id, 1);
                  } else {
                    onAdd(product);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {quantity > 0 && (
              <span className="text-sm text-gray-400">
                Subtotal: &euro;{(product.price * quantity).toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Project Button */}
          <button
            onClick={() => {
              onAdd(product);
              onClose();
            }}
            className="mt-6 w-full py-3 rounded-xl bg-[#1B3A4B] text-white text-sm font-semibold hover:bg-[#24516b] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {quantity > 0 ? "Add Another to Project" : "Add to Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────

export default function ProductsPage() {
  const { modules, setModulesFromGrid, getStats, loadFromLocalStorage } = useDesignStore();
  const { gridCells, gridRotation } = useLandStore();

  const [activeCategory, setActiveCategory] = useState<CategoryId>("finishing");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (modules.length === 0) loadFromLocalStorage();
  }, [loadFromLocalStorage, modules.length]);

  useEffect(() => {
    if (modules.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, gridCells, gridRotation, setModulesFromGrid]);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSelectedProducts(ALL_PRODUCTS);
    setSelectedProducts(loaded);
    setInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (initialized) {
      saveSelectedProducts(selectedProducts);
    }
  }, [selectedProducts, initialized]);

  const stats = getStats();

  const filteredProducts = ALL_PRODUCTS.filter(
    (p) => p.category === activeCategory
  );

  const productTotal = selectedProducts.reduce(
    (sum, s) => sum + s.product.price * s.quantity,
    0
  );
  const grandTotal = stats.totalEstimate + productTotal;

  const addProduct = useCallback((product: Product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((s) => s.product.id === product.id);
      if (existing) {
        return prev.map((s) =>
          s.product.id === product.id
            ? { ...s, quantity: s.quantity + 1 }
            : s
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((s) => s.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev
        .map((s) =>
          s.product.id === productId
            ? { ...s, quantity: Math.max(0, s.quantity + delta) }
            : s
        )
        .filter((s) => s.quantity > 0)
    );
  }, []);

  const getQuantity = useCallback(
    (productId: string) => {
      const found = selectedProducts.find((s) => s.product.id === productId);
      return found ? found.quantity : 0;
    },
    [selectedProducts]
  );

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

      {/* ── NAVIGATION BAR ── */}
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
        {/* ── CENTER AREA ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#1B3A4B]">
              Product Selection
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose finishing materials, furniture, and installations for your
              modular home. Products are saved automatically.
            </p>
          </div>

          {/* ── Category Tabs ── */}
          <div className="flex gap-2 mb-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1B3A4B] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* ── Product Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                  onClick={() => setDetailProduct(product)}
                >
                  {/* Product Image */}
                  <div className="relative w-full h-36 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#E8913A] font-bold text-base">
                        &euro;{product.price.toLocaleString()}
                      </span>
                      {qty > 0 && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {qty} in project
                        </span>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addProduct(product);
                      }}
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        qty > 0
                          ? "bg-[#1B3A4B] text-white hover:bg-[#24516b]"
                          : "border border-[#1B3A4B] text-[#1B3A4B] hover:bg-[#1B3A4B] hover:text-white"
                      }`}
                    >
                      <Plus size={14} />
                      {qty > 0 ? "Add Another" : "Add to Project"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── RIGHT SIDEBAR: Selected Products ── */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto shrink-0 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-[#1B3A4B]" />
            <h3 className="text-sm font-bold text-[#1B3A4B]">
              Selected Products
            </h3>
            {selectedProducts.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-white bg-[#E8913A] rounded-full w-5 h-5 flex items-center justify-center">
                {selectedProducts.length}
              </span>
            )}
          </div>

          {/* Selected Items */}
          {selectedProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                No products selected yet.
                <br />
                Browse categories and add items to your project.
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
              {selectedProducts.map((s) => (
                <div
                  key={s.product.id}
                  className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setDetailProduct(s.product)}
                >
                  {/* Thumbnail */}
                  <div className="w-9 h-9 rounded overflow-hidden shrink-0 relative">
                    <Image
                      src={s.product.image}
                      alt={s.product.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                      unoptimized
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {s.product.name}
                    </p>
                    <p className="text-[10px] text-[#E8913A] font-semibold">
                      &euro;{s.product.price.toLocaleString()} &times;{" "}
                      {s.quantity} ={" "}
                      &euro;{(s.product.price * s.quantity).toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(s.product.id, -1);
                        }}
                        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[11px] font-semibold text-gray-700 w-5 text-center">
                        {s.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(s.product.id, 1);
                        }}
                        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(s.product.id);
                    }}
                    className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cost Summary */}
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Cost Summary
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
                <span className="text-xs text-gray-600">
                  Products ({selectedProducts.length} items)
                </span>
                <span className="text-xs font-medium text-gray-900">
                  &euro;{productTotal.toLocaleString()}
                </span>
              </div>
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
          </div>
        </aside>
      </div>

      {/* ── Product Detail Modal ── */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          quantity={getQuantity(detailProduct.id)}
          onClose={() => setDetailProduct(null)}
          onAdd={addProduct}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </div>
  );
}
