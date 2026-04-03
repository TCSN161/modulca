"use client";

import { create } from "zustand";

export interface TerrainUtilities {
  water: boolean;
  electricity: boolean;
  gas: boolean;
  sewer: boolean;
}

export interface TerrainLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  county: string;
}

export interface TerrainSeller {
  name: string;
  phone: string;
  email: string;
}

export interface Terrain {
  id: string;
  title: string;
  description: string;
  location: TerrainLocation;
  area: number; // m²
  price: number; // EUR
  pricePerM2: number;
  zoning: "residential" | "mixed" | "commercial";
  utilities: TerrainUtilities;
  photos: string[];
  seller: TerrainSeller;
  status: "available" | "reserved" | "sold";
  suitabilityScore: number; // 0-100
  createdAt: string;
}

export interface MarketplaceFilters {
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  zoning: string | null;
  city: string | null;
  minScore: number | null;
}

interface MarketplaceStore {
  terrains: Terrain[];
  filters: MarketplaceFilters;
  selectedTerrain: string | null;
  favorites: string[];
  setFilter: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  clearFilters: () => void;
  selectTerrain: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
}

const EMPTY_FILTERS: MarketplaceFilters = {
  minArea: null,
  maxArea: null,
  minPrice: null,
  maxPrice: null,
  zoning: null,
  city: null,
  minScore: null,
};

/* ------------------------------------------------------------------ */
/*  Demo terrain data                                                  */
/* ------------------------------------------------------------------ */

const DEMO_TERRAINS: Terrain[] = [
  {
    id: "t1",
    title: "Sunny Hillside Plot — Baneasa",
    description: "South-facing residential plot with panoramic city views. Quiet neighborhood, mature trees along the perimeter. Ideal for a modern modular home with garden space.",
    location: { lat: 44.5050, lng: 26.0750, address: "Str. Baneasa 45", city: "Bucharest", county: "Ilfov" },
    area: 520,
    price: 78000,
    pricePerM2: 150,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    photos: [],
    seller: { name: "Ion Popescu", phone: "+40 721 000 001", email: "ion.p@email.ro" },
    status: "available",
    suitabilityScore: 92,
    createdAt: "2026-03-15",
  },
  {
    id: "t2",
    title: "Central Mixed-Use Lot — Cluj-Napoca",
    description: "Prime location near the city center. Zoned for mixed use — perfect for a ground-floor commercial space with residential modules above.",
    location: { lat: 46.7712, lng: 23.6236, address: "Str. Memorandumului 12", city: "Cluj-Napoca", county: "Cluj" },
    area: 380,
    price: 114000,
    pricePerM2: 300,
    zoning: "mixed",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    photos: [],
    seller: { name: "Maria Ionescu", phone: "+40 722 000 002", email: "maria.i@email.ro" },
    status: "available",
    suitabilityScore: 85,
    createdAt: "2026-03-10",
  },
  {
    id: "t3",
    title: "Mountain View Estate — Brasov",
    description: "Large estate at the foot of Tampa Mountain. Natural spring water access, forest boundary. Perfect for an eco-friendly modular retreat.",
    location: { lat: 45.6570, lng: 25.6015, address: "Drumul Poienii 78", city: "Brasov", county: "Brasov" },
    area: 1200,
    price: 96000,
    pricePerM2: 80,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    photos: [],
    seller: { name: "Andrei Marin", phone: "+40 723 000 003", email: "andrei.m@email.ro" },
    status: "available",
    suitabilityScore: 78,
    createdAt: "2026-02-28",
  },
  {
    id: "t4",
    title: "Commercial Corner — Timisoara",
    description: "High-traffic corner lot in the expanding west side. Commercial zoning with ample parking potential. Great for office modules or retail.",
    location: { lat: 45.7489, lng: 21.2087, address: "Bvd. Cetatii 200", city: "Timisoara", county: "Timis" },
    area: 650,
    price: 162500,
    pricePerM2: 250,
    zoning: "commercial",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    photos: [],
    seller: { name: "Constructii TM SRL", phone: "+40 724 000 004", email: "office@ctm.ro" },
    status: "reserved",
    suitabilityScore: 70,
    createdAt: "2026-03-01",
  },
  {
    id: "t5",
    title: "Garden Neighborhood Plot — Sibiu",
    description: "Charming residential area in the new development zone. Flat terrain, all utilities connected. Walking distance to schools and parks.",
    location: { lat: 45.7983, lng: 24.1256, address: "Str. Teilor 15", city: "Sibiu", county: "Sibiu" },
    area: 450,
    price: 67500,
    pricePerM2: 150,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    photos: [],
    seller: { name: "Elena Dragomir", phone: "+40 725 000 005", email: "elena.d@email.ro" },
    status: "available",
    suitabilityScore: 88,
    createdAt: "2026-03-20",
  },
  {
    id: "t6",
    title: "Coastal Retreat — Constanta",
    description: "Beachside plot 300m from the Black Sea. Perfect for a vacation modular home or glamping modules. Seasonal rental potential.",
    location: { lat: 44.1598, lng: 28.6348, address: "Str. Falezei 42", city: "Constanta", county: "Constanta" },
    area: 300,
    price: 120000,
    pricePerM2: 400,
    zoning: "mixed",
    utilities: { water: true, electricity: true, gas: false, sewer: true },
    photos: [],
    seller: { name: "Litoral Invest SRL", phone: "+40 726 000 006", email: "info@litoral-invest.ro" },
    status: "available",
    suitabilityScore: 75,
    createdAt: "2026-03-05",
  },
  {
    id: "t7",
    title: "Rural Farmland — Maramures",
    description: "Expansive flat terrain in the countryside. Ideal for a self-sustaining homestead with multiple modules. Incredibly affordable.",
    location: { lat: 47.6584, lng: 23.5682, address: "Sat Barsana 120", city: "Barsana", county: "Maramures" },
    area: 2000,
    price: 30000,
    pricePerM2: 15,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    photos: [],
    seller: { name: "Gheorghe Pop", phone: "+40 727 000 007", email: "gheorghe.p@email.ro" },
    status: "available",
    suitabilityScore: 55,
    createdAt: "2026-02-20",
  },
  {
    id: "t8",
    title: "Tech District Lot — Cluj-Napoca",
    description: "In the heart of Cluj's tech hub. Mixed zoning allows for co-working modules or startup offices. Fiber internet already connected.",
    location: { lat: 46.7700, lng: 23.5900, address: "Str. Fabricii 80", city: "Cluj-Napoca", county: "Cluj" },
    area: 280,
    price: 140000,
    pricePerM2: 500,
    zoning: "commercial",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    photos: [],
    seller: { name: "Digital Estate SRL", phone: "+40 728 000 008", email: "sales@digitalestate.ro" },
    status: "available",
    suitabilityScore: 82,
    createdAt: "2026-03-18",
  },
  {
    id: "t9",
    title: "Lakeside Parcel — Snagov",
    description: "Peaceful lakeside property with direct water access. Build your dream modular lake house. Well-maintained road access year-round.",
    location: { lat: 44.6920, lng: 26.1530, address: "Str. Lacului 33", city: "Snagov", county: "Ilfov" },
    area: 800,
    price: 160000,
    pricePerM2: 200,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: true },
    photos: [],
    seller: { name: "Adrian Stanescu", phone: "+40 729 000 009", email: "adrian.s@email.ro" },
    status: "sold",
    suitabilityScore: 90,
    createdAt: "2026-01-15",
  },
];

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  terrains: DEMO_TERRAINS,
  filters: { ...EMPTY_FILTERS },
  selectedTerrain: null,
  favorites: [],

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  clearFilters: () => set({ filters: { ...EMPTY_FILTERS } }),

  selectTerrain: (id) => set({ selectedTerrain: id }),

  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    })),
}));

/* ------------------------------------------------------------------ */
/*  Selector: filtered terrains                                        */
/* ------------------------------------------------------------------ */

export function filterTerrains(terrains: Terrain[], filters: MarketplaceFilters): Terrain[] {
  return terrains.filter((t) => {
    if (filters.minArea !== null && t.area < filters.minArea) return false;
    if (filters.maxArea !== null && t.area > filters.maxArea) return false;
    if (filters.minPrice !== null && t.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && t.price > filters.maxPrice) return false;
    if (filters.zoning && t.zoning !== filters.zoning) return false;
    if (filters.city && t.location.city !== filters.city) return false;
    if (filters.minScore !== null && t.suitabilityScore < filters.minScore) return false;
    return true;
  });
}
