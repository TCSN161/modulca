"use client";

import { useState, useCallback, useEffect } from "react";
import { useLandStore } from "../store";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSearchProps {
  /** Pre-fill the search input (e.g. passed from marketplace terrain selection) */
  initialQuery?: string;
}

/**
 * Address search using Nominatim (OpenStreetMap geocoding, free, no API key).
 */
export default function AddressSearch({ initialQuery = "" }: AddressSearchProps) {
  const [query, setQuery] = useState(initialQuery);

  // Sync if parent provides a new initialQuery after mount (e.g. URL params resolved)
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { setMapCenter, setMapZoom } = useLandStore();

  const search = useCallback(async () => {
    if (query.trim().length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [query]);

  const selectResult = (r: SearchResult) => {
    setMapCenter({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setMapZoom(18);
    setResults([]);
    setQuery(r.display_name.split(",")[0]);
  };

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Search Address
      </label>
      <div className="mt-1 flex gap-1">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            &#128269;
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search for an address or place..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm
                       placeholder:text-gray-400 focus:border-brand-amber-400
                       focus:outline-none focus:ring-1 focus:ring-brand-amber-400"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="rounded-lg bg-brand-teal-800 px-3 text-xs font-medium text-white
                     hover:bg-brand-teal-700 disabled:opacity-50"
        >
          {loading ? "..." : "Go"}
        </button>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectResult(r)}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700
                         hover:bg-brand-teal-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
