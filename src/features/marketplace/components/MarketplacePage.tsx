"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StepNav from "@/features/design/components/shared/StepNav";
import { useMarketplaceStore, filterTerrains } from "../store";
import FeatureGate from "@/shared/components/FeatureGate";
import type { Terrain } from "../store";

/* ------------------------------------------------------------------ */
/*  Zoning color map                                                   */
/* ------------------------------------------------------------------ */

const ZONING_COLORS: Record<string, { from: string; to: string }> = {
  residential: { from: "#34d399", to: "#059669" },
  mixed: { from: "#60a5fa", to: "#2563eb" },
  commercial: { from: "#fbbf24", to: "#d97706" },
};

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-red-100 text-red-700",
};

/** Build the href for "Use Terrain" / "Use This Terrain" buttons */
function terrainLandHref(t: Terrain) {
  const params = new URLSearchParams({
    lat: String(t.location.lat),
    lng: String(t.location.lng),
    address: `${t.location.address}, ${t.location.city}`,
    fromMarketplace: "1",
  });
  return `/project/demo/land?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MarketplacePage() {
  const { terrains, filters, favorites, setFilter, clearFilters, toggleFavorite } =
    useMarketplaceStore();

  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => filterTerrains(terrains, filters), [terrains, filters]);
  const cities = useMemo(() => [...new Set(terrains.map((t) => t.location.city))].sort(), [terrains]);
  const detailTerrain = detailId ? terrains.find((t) => t.id === detailId) : null;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={0} />
        <Link
          href="/project/demo/land"
          className="shrink-0 rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600 transition-colors"
        >
          Skip to Land →
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filters</h3>
            <button onClick={clearFilters} className="text-[10px] text-brand-amber-500 hover:underline">
              Clear all
            </button>
          </div>

          {/* Area range */}
          <FilterSection label="Area (m²)">
            <div className="flex gap-2">
              <NumberInput placeholder="Min" value={filters.minArea} onChange={(v) => setFilter("minArea", v)} />
              <NumberInput placeholder="Max" value={filters.maxArea} onChange={(v) => setFilter("maxArea", v)} />
            </div>
          </FilterSection>

          {/* Price range */}
          <FilterSection label="Price (EUR)">
            <div className="flex gap-2">
              <NumberInput placeholder="Min" value={filters.minPrice} onChange={(v) => setFilter("minPrice", v)} />
              <NumberInput placeholder="Max" value={filters.maxPrice} onChange={(v) => setFilter("maxPrice", v)} />
            </div>
          </FilterSection>

          {/* Zoning */}
          <FilterSection label="Zoning">
            <select
              value={filters.zoning || ""}
              onChange={(e) => setFilter("zoning", e.target.value || null)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              <option value="residential">Residential</option>
              <option value="mixed">Mixed</option>
              <option value="commercial">Commercial</option>
            </select>
          </FilterSection>

          {/* City */}
          <FilterSection label="City">
            <select
              value={filters.city || ""}
              onChange={(e) => setFilter("city", e.target.value || null)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FilterSection>

          {/* Suitability score */}
          <FilterSection label="Min Suitability Score">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.minScore ?? 0}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setFilter("minScore", v > 0 ? v : null);
              }}
              className="w-full accent-brand-amber-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0</span>
              <span className="font-bold text-brand-teal-800">{filters.minScore ?? 0}+</span>
              <span>100</span>
            </div>
          </FilterSection>

          {/* Results count */}
          <div className="mt-6 rounded-lg bg-brand-teal-800 p-3 text-center">
            <span className="text-2xl font-bold text-white">{filtered.length}</span>
            <span className="block text-[10px] text-brand-teal-200 uppercase tracking-wider">
              {filtered.length === 1 ? "terrain found" : "terrains found"}
            </span>
          </div>

          {/* List your land */}
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 p-3 text-center">
            <p className="text-[10px] text-gray-400 mb-2">Own land to sell?</p>
            <FeatureGate requires="marketplaceList">
              <Link
                href="/project/demo/land"
                className="inline-block rounded-lg border border-brand-teal-800 px-3 py-1.5 text-[10px] font-semibold text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
              >
                List My Land
              </Link>
            </FeatureGate>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-teal-800">Land Marketplace</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse available terrains, then click <strong>Use Terrain</strong> to design on it — or{" "}
              <Link href="/project/demo/land" className="text-brand-amber-500 hover:underline">
                use your own land
              </Link>
              .
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <p className="text-gray-500">No terrains match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-sm text-brand-amber-500 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((t) => (
                <TerrainCard
                  key={t.id}
                  terrain={t}
                  isFavorite={favorites.includes(t.id)}
                  onToggleFavorite={() => toggleFavorite(t.id)}
                  onViewDetails={() => setDetailId(t.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detailTerrain && (
        <TerrainDetailModal
          terrain={detailTerrain}
          isFavorite={favorites.includes(detailTerrain.id)}
          onToggleFavorite={() => toggleFavorite(detailTerrain.id)}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Terrain Card                                                       */
/* ------------------------------------------------------------------ */

function TerrainCard({
  terrain: t,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}: {
  terrain: Terrain;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
}) {
  const zc = ZONING_COLORS[t.zoning] || ZONING_COLORS.residential;
  const scoreColor = t.suitabilityScore > 70 ? "bg-emerald-500" : t.suitabilityScore > 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Photo or gradient header */}
      <div
        className="h-36 relative bg-cover bg-center"
        style={t.photos.length > 0
          ? { backgroundImage: `url(${t.photos[0]})` }
          : { background: `linear-gradient(135deg, ${zc.from}, ${zc.to})` }
        }
      >
        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[t.status]}`}>
          {t.status}
        </span>
        <div className={`absolute top-3 right-12 ${scoreColor} rounded-full px-2 py-0.5`}>
          <span className="text-[10px] font-bold text-white">{t.suitabilityScore}/100</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2.5 right-3 text-xl transition-transform hover:scale-110"
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
        <div className="absolute bottom-3 left-3 bg-black/40 rounded-lg px-2 py-1">
          <span className="text-white text-xs font-bold">{t.area.toLocaleString()} m²</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-brand-teal-800 mb-1 line-clamp-1">{t.title}</h3>
        <p className="text-[10px] text-gray-400 mb-2">{t.location.address}, {t.location.city}</p>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-lg font-bold text-brand-amber-600">&euro;{t.price.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400">({t.pricePerM2} &euro;/m²)</span>
        </div>

        <div className="flex gap-3 mb-3 text-[10px]">
          <UtilityBadge label="Water" on={t.utilities.water} />
          <UtilityBadge label="Electric" on={t.utilities.electricity} />
          <UtilityBadge label="Gas" on={t.utilities.gas} />
          <UtilityBadge label="Sewer" on={t.utilities.sewer} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 capitalize">{t.zoning}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{t.location.county}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          {t.status === "available" && (
            <Link
              href={terrainLandHref(t)}
              className="flex-1 rounded-lg bg-brand-amber-500 py-2 text-xs font-semibold text-white text-center hover:bg-brand-amber-600 transition-colors"
            >
              Use Terrain
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Modal                                                       */
/* ------------------------------------------------------------------ */

function TerrainDetailModal({
  terrain: t,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  terrain: Terrain;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  const zc = ZONING_COLORS[t.zoning] || ZONING_COLORS.residential;
  const scoreColor = t.suitabilityScore > 70 ? "text-emerald-600" : t.suitabilityScore > 40 ? "text-amber-600" : "text-red-600";

  const estModules = Math.max(2, Math.floor(t.area / 80));
  const estModuleCost = estModules * 9300;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div
          className="h-40 rounded-t-2xl relative"
          style={{ background: `linear-gradient(135deg, ${zc.from}, ${zc.to})` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-white text-lg transition-colors"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-xl font-bold text-white">{t.title}</h2>
            <p className="text-sm text-white/80">{t.location.address}, {t.location.city}, {t.location.county}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Key metrics */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <MetricCard label="Area" value={`${t.area.toLocaleString()} m²`} />
            <MetricCard label="Price" value={`€${t.price.toLocaleString()}`} />
            <MetricCard label="EUR/m²" value={`€${t.pricePerM2}`} />
            <MetricCard label="Score" value={`${t.suitabilityScore}/100`} valueClass={scoreColor} />
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{t.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Zoning & Status</h4>
              <p className="text-sm font-medium text-brand-teal-800 capitalize">{t.zoning}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[t.status]}`}>
                {t.status}
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Utilities</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <UtilityLine label="Water" on={t.utilities.water} />
                <UtilityLine label="Electricity" on={t.utilities.electricity} />
                <UtilityLine label="Gas" on={t.utilities.gas} />
                <UtilityLine label="Sewer" on={t.utilities.sewer} />
              </div>
            </div>
          </div>

          {/* Cost calculator */}
          <div className="rounded-lg border border-brand-amber-200 bg-brand-amber-50 p-4 mb-6">
            <h4 className="text-xs font-bold text-brand-amber-700 uppercase mb-3">Estimated Project Cost</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Terrain</span>
                <span className="font-medium">&euro;{t.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">~{estModules} modules (Standard)</span>
                <span className="font-medium">&euro;{estModuleCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-amber-200">
                <span className="font-bold text-brand-teal-800">Est. Total</span>
                <span className="font-bold text-brand-amber-600">&euro;{(t.price + estModuleCost).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Seller info */}
          <div className="rounded-lg bg-gray-50 p-4 mb-6">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Seller Contact</h4>
            <p className="text-sm font-medium text-brand-teal-800">{t.seller.name}</p>
            <p className="text-xs text-gray-500">{t.seller.phone}</p>
            <p className="text-xs text-gray-500">{t.seller.email}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {t.status === "available" && (
              <Link
                href={terrainLandHref(t)}
                className="flex-1 rounded-lg bg-brand-amber-500 py-3 text-sm font-semibold text-white text-center hover:bg-brand-amber-600 transition-colors"
              >
                Use This Terrain
              </Link>
            )}
            <button
              onClick={onToggleFavorite}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
            <a
              href={`mailto:${t.seller.email}?subject=Inquiry about ${t.title}`}
              className="rounded-lg border border-brand-teal-800 px-4 py-3 text-sm font-medium text-brand-teal-800 hover:bg-brand-teal-50 transition-colors"
            >
              Contact Seller
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helper components                                            */
/* ------------------------------------------------------------------ */

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-brand-amber-500 focus:outline-none"
    />
  );
}

function UtilityBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span className={`flex items-center gap-0.5 ${on ? "text-emerald-600" : "text-gray-300"}`}>
      {on ? "✓" : "✗"} {label}
    </span>
  );
}

function UtilityLine({ label, on }: { label: string; on: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${on ? "text-emerald-600" : "text-gray-400"}`}>
      <span>{on ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}

function MetricCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-sm font-bold ${valueClass || "text-brand-teal-800"}`}>{value}</div>
    </div>
  );
}
