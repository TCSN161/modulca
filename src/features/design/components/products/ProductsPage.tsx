// Products Page — powered by the centralized Asset Library
// Future: Integrate with retailer APIs (Sketchfab for 3D, affiliate links for purchases)
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDesignStore } from "../../store";
import { useLandStore } from "@/features/land/store";
import { PRODUCT_CATALOG, getProductsByCategory } from "@/assets";
import type { ProductEntry } from "@/assets";
import DesignHeader from "../shared/DesignHeader";
import MobileStepFooter from "../shared/MobileStepFooter";
import { useProjectId } from "@/shared/hooks/useProjectId";
import FeatureGate from "@/shared/components/FeatureGate";
import {
  Layers,
  Sofa,
  Wrench,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  Box,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

type CategoryId = "finishing" | "furniture" | "plumbing";

interface SelectedProduct {
  productId: string;
  quantity: number;
}

// ─── Storage ─────────────────────────────────────────────────

const STORAGE_KEY = "modulca-selected-products";

function loadSelectedProducts(): SelectedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SelectedProduct[];
  } catch {
    return [];
  }
}

function saveSelectedProducts(selected: SelectedProduct[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
}

// ─── Category Definitions ────────────────────────────────────

const CATEGORIES: { id: CategoryId; label: string; icon: LucideIcon; count: number }[] = [
  { id: "finishing", label: "Finishing Materials", icon: Layers, count: getProductsByCategory("finishing").length },
  { id: "furniture", label: "Furniture & Decor", icon: Sofa, count: getProductsByCategory("furniture").length },
  { id: "plumbing", label: "Plumbing & Electrical", icon: Wrench, count: getProductsByCategory("plumbing").length },
];

// ─── Icon mapping for subcategories ──────────────────────────

const SUBCATEGORY_ICONS: Record<string, string> = {
  flooring: "🪵",
  "wall-finish": "🧱",
  tile: "🔲",
  insulation: "🧊",
  paint: "🎨",
  window: "🪟",
  door: "🚪",
  seating: "🛋️",
  table: "🪑",
  bed: "🛏️",
  storage: "📦",
  lighting: "💡",
  textile: "🧵",
  decor: "🖼️",
  plumbing: "🚿",
  electrical: "🔌",
  hvac: "❄️",
};

// ─── Product Detail Modal ────────────────────────────────────

function ProductDetailModal({
  product,
  quantity,
  onClose,
  onAdd,
  onUpdateQuantity,
}: {
  product: ProductEntry;
  quantity: number;
  onClose: () => void;
  onAdd: (productId: string) => void;
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
              src={product.image.url}
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

          {/* Brand badge */}
          {product.brand && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 shadow-sm">
              {product.brand}
            </div>
          )}

          {/* 3D model badge */}
          {product.model3d && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#1B3A4B]/90 backdrop-blur-sm rounded-lg text-xs font-medium text-white shadow-sm flex items-center gap-1">
              <Box size={12} />
              3D Model
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1B3A4B]">{product.name}</h2>
              {product.brand && (
                <p className="text-xs text-gray-400 mt-0.5">by {product.brand}</p>
              )}
            </div>
            {product.subcategory && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0">
                {SUBCATEGORY_ICONS[product.subcategory] || ""} {product.subcategory}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Options:</span>
              {product.variants.map((v) => (
                <div
                  key={v.label}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: v.color }}
                  title={v.label}
                />
              ))}
            </div>
          )}

          {/* Style compatibility */}
          {product.styles && product.styles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.styles.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8913A]">
              &euro;{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">{product.unit}</span>
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
                    onAdd(product.id);
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
              onAdd(product.id);
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
  const projectId = useProjectId();
  const { modules, setModulesFromGrid, getStats, loadFromLocalStorage } = useDesignStore();
  const { gridCells, gridRotation } = useLandStore();

  const [activeCategory, setActiveCategory] = useState<CategoryId>("finishing");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (modules.length > 0) return;
    loadFromLocalStorage();
    const loaded = useDesignStore.getState().modules;
    if (loaded.length === 0 && gridCells.some((c) => c.moduleType !== null)) {
      setModulesFromGrid(gridCells, gridRotation);
    }
  }, [modules.length, loadFromLocalStorage, gridCells, gridRotation, setModulesFromGrid]);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSelectedProducts();
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

  // Filter products
  const filteredProducts = searchQuery
    ? PRODUCT_CATALOG.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.image.tags.some((t) => t.includes(searchQuery.toLowerCase()))
      )
    : PRODUCT_CATALOG.filter((p) => p.category === activeCategory);

  const productTotal = selectedProducts.reduce((sum, s) => {
    const prod = PRODUCT_CATALOG.find((p) => p.id === s.productId);
    return sum + (prod ? prod.price * s.quantity : 0);
  }, 0);
  const grandTotal = stats.totalEstimate + productTotal;

  const addProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((s) => s.productId === productId);
      if (existing) {
        return prev.map((s) =>
          s.productId === productId ? { ...s, quantity: s.quantity + 1 } : s
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((s) => s.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev
        .map((s) =>
          s.productId === productId
            ? { ...s, quantity: Math.max(0, s.quantity + delta) }
            : s
        )
        .filter((s) => s.quantity > 0)
    );
  }, []);

  const getQuantity = useCallback(
    (productId: string) => {
      const found = selectedProducts.find((s) => s.productId === productId);
      return found ? found.quantity : 0;
    },
    [selectedProducts]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* ── TOP NAV ── */}
      <DesignHeader activeStep={10} />

      {/* ── NAVIGATION BAR ── */}
      <div className="flex items-center justify-between h-12 px-6 bg-white border-b border-gray-200 shrink-0">
        <Link
          href={`/project/${projectId}/walkthrough`}
          className="text-sm text-[#1B3A4B] hover:text-[#E8913A] transition-colors flex items-center gap-1"
        >
          <span>&larr;</span> Back to Walkthrough
        </Link>
        <Link
          href={`/project/${projectId}/finalize`}
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
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1B3A4B]">
                Product Selection
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Choose finishing materials, furniture, and installations for your
                modular home. Products are saved automatically.
              </p>
            </div>

            {/* Search toggle */}
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showSearch
                  ? "bg-[#1B3A4B] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Search size={14} />
              Search
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="mb-4 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brand, or material type..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A4B]/20 focus:border-[#1B3A4B]"
                autoFocus
              />
              {searchQuery && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* ── Category Tabs ── */}
          {!searchQuery && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#1B3A4B] text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {cat.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
                      src={product.image.url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {product.model3d && (
                        <span className="px-1.5 py-0.5 bg-[#1B3A4B]/80 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                          <Box size={10} /> 3D
                        </span>
                      )}
                      {product.brand && (
                        <span className="px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded flex items-center gap-0.5">
                          <Tag size={10} /> {product.brand}
                        </span>
                      )}
                    </div>
                    {qty > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {qty}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Variants preview */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {product.variants.map((v) => (
                          <div
                            key={v.label}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: v.color }}
                            title={v.label}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">
                          {product.variants.length} options
                        </span>
                      </div>
                    )}

                    {/* Price (partner pricing gated) */}
                    <FeatureGate requires="partnerPricing" hideIfLocked fallback={
                      <div className="mt-3 text-xs text-gray-400 italic">Pricing available for Premium+</div>
                    }>
                      <div className="flex items-baseline justify-between mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#E8913A] font-bold text-base">
                            &euro;{product.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">{product.unit}</span>
                        </div>
                      </div>
                    </FeatureGate>

                    {/* Add Button (direct purchase gated) */}
                    <FeatureGate requires="directPurchase" hideIfLocked fallback={
                      <div className="mt-3 w-full py-2 rounded-lg text-xs text-center text-gray-400 border border-dashed border-gray-200">
                        Upgrade to add products
                      </div>
                    }>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addProduct(product.id);
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
                    </FeatureGate>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && searchQuery && (
            <div className="text-center py-16">
              <Filter size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No products match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-[#E8913A] hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR: Selected Products ── */}
        <aside className="hidden md:flex w-80 bg-white border-l border-gray-200 overflow-y-auto shrink-0 p-5 flex-col">
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
              {selectedProducts.map((s) => {
                const product = PRODUCT_CATALOG.find((p) => p.id === s.productId);
                if (!product) return null;
                return (
                  <div
                    key={s.productId}
                    className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setDetailProduct(product)}
                  >
                    {/* Thumbnail */}
                    <div className="w-9 h-9 rounded overflow-hidden shrink-0 relative">
                      <Image
                        src={product.image.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      {product.brand && (
                        <p className="text-[9px] text-gray-400">{product.brand}</p>
                      )}
                      <p className="text-[10px] text-[#E8913A] font-semibold">
                        &euro;{product.price.toLocaleString()} &times;{" "}
                        {s.quantity} ={" "}
                        &euro;{(product.price * s.quantity).toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(s.productId, -1);
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
                            updateQuantity(s.productId, 1);
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
                        removeProduct(s.productId);
                      }}
                      className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
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
              href={`/project/${projectId}/finalize`}
              className="block w-full py-3 rounded-lg bg-[#E8913A] text-white text-sm font-semibold text-center hover:bg-[#d07e2e] transition-colors"
            >
              Proceed to Finalize
            </Link>
          </div>
        </aside>
      </div>

      <MobileStepFooter activeStep={10} />

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
