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

export interface TerrainFeatures {
  slope: "flat" | "gentle" | "moderate" | "steep";
  orientation: string; // e.g. "south", "south-east"
  soilType: string;
  nearbyPOI: string[]; // points of interest
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
  features: TerrainFeatures;
  photos: string[];
  seller: TerrainSeller;
  status: "available" | "reserved" | "sold";
  suitabilityScore: number; // 0-100
  maxModules: number; // how many 3×3m modules fit
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
    description: "South-facing residential plot with panoramic city views. Quiet neighborhood with mature lime trees along the perimeter, paved access road, and street lighting. Walking distance to Baneasa Shopping City and the American School. Ideal for a modern modular home with garden space. PUZ approved for P+1 construction.",
    location: { lat: 44.5050, lng: 26.0750, address: "Str. Baneasa 45", city: "Bucharest", county: "Ilfov" },
    area: 520,
    price: 78000,
    pricePerM2: 150,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "gentle", orientation: "south", soilType: "Clay loam", nearbyPOI: ["Baneasa Shopping City (1.2km)", "American School (800m)", "Baneasa Forest (500m)", "Bus station (200m)"] },
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop",
    ],
    seller: { name: "Ion Popescu", phone: "+40 721 345 678", email: "ion.popescu@gmail.com" },
    status: "available",
    suitabilityScore: 92,
    maxModules: 12,
    createdAt: "2026-03-15",
  },
  {
    id: "t2",
    title: "Central Mixed-Use Lot — Cluj-Napoca",
    description: "Prime location 5 min walk from Piata Unirii. Mixed zoning (UTR_M3) allows ground-floor commercial with residential above. Street-level visibility, heavy foot traffic. Fiber optic and 5G coverage. Neighboring buildings renovated. Perfect for a showroom + office modular concept.",
    location: { lat: 46.7712, lng: 23.6236, address: "Str. Memorandumului 12", city: "Cluj-Napoca", county: "Cluj" },
    area: 380,
    price: 114000,
    pricePerM2: 300,
    zoning: "mixed",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "flat", orientation: "east", soilType: "Sandy clay", nearbyPOI: ["Piata Unirii (400m)", "UBB University (600m)", "Central Park (300m)", "Tram station (100m)"] },
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=600&h=400&fit=crop",
    ],
    seller: { name: "Maria Ionescu", phone: "+40 744 123 456", email: "maria.ionescu@remax.ro" },
    status: "available",
    suitabilityScore: 85,
    maxModules: 8,
    createdAt: "2026-03-10",
  },
  {
    id: "t3",
    title: "Mountain View Estate — Brasov",
    description: "Spectacular 1200 m\u00B2 estate at the foot of T\u00E2mpa Mountain with unobstructed views of Postavaru peak. Bordered by forest on the north side, natural spring 50m away. Gravel access road maintained by local association. Geotechnical study available. Perfect for an eco-friendly modular retreat or B&B.",
    location: { lat: 45.6570, lng: 25.6015, address: "Drumul Poienii 78", city: "Brasov", county: "Brasov" },
    area: 1200,
    price: 96000,
    pricePerM2: 80,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    features: { slope: "moderate", orientation: "south-west", soilType: "Rocky loam", nearbyPOI: ["Tampa Mountain trail (200m)", "Poiana Brasov ski (4km)", "Old Town (3km)", "Grocery store (1.5km)"] },
    photos: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    ],
    seller: { name: "Andrei Marin", phone: "+40 723 987 654", email: "andrei.marin@yahoo.ro" },
    status: "available",
    suitabilityScore: 78,
    maxModules: 25,
    createdAt: "2026-02-28",
  },
  {
    id: "t4",
    title: "Commercial Corner — Timisoara",
    description: "High-visibility corner lot on Bulevardul Cetatii in Timisoara's rapidly expanding west side. Commercial zoning allows office, retail, or hospitality use. Parking for 15 cars on-site. Tramway stop 50m away. Adjacent to new residential developments with 2000+ apartments. Three-phase electricity already connected.",
    location: { lat: 45.7489, lng: 21.2087, address: "Bvd. Cetatii 200", city: "Timisoara", county: "Timis" },
    area: 650,
    price: 162500,
    pricePerM2: 250,
    zoning: "commercial",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "flat", orientation: "south-east", soilType: "Alluvial", nearbyPOI: ["Iulius Town (1km)", "Tramway station (50m)", "UPT University (1.5km)", "Auchan hypermarket (800m)"] },
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop",
    ],
    seller: { name: "Constructii TM SRL", phone: "+40 356 100 200", email: "office@constructii-tm.ro" },
    status: "reserved",
    suitabilityScore: 70,
    maxModules: 15,
    createdAt: "2026-03-01",
  },
  {
    id: "t5",
    title: "Garden Neighborhood Plot — Sibiu",
    description: "Flat, rectangular lot in Sibiu's sought-after Selimbar extension. New development zone with asphalt roads, street lighting, and all utilities at the boundary. Walk to Promenada Mall, schools, and Dumbrava park. Neighbors have already built modern homes. CU (Certificat de Urbanism) obtained, valid until 2027.",
    location: { lat: 45.7983, lng: 24.1256, address: "Str. Teilor 15, Selimbar", city: "Sibiu", county: "Sibiu" },
    area: 450,
    price: 67500,
    pricePerM2: 150,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "flat", orientation: "south", soilType: "Loamy", nearbyPOI: ["Promenada Mall (1km)", "Dumbrava Sibiului (2km)", "Schools (500m)", "Lidl (400m)"] },
    photos: [
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop",
    ],
    seller: { name: "Elena Dragomir", phone: "+40 745 222 333", email: "elena.d@imobiliare.ro" },
    status: "available",
    suitabilityScore: 95,
    maxModules: 10,
    createdAt: "2026-03-20",
  },
  {
    id: "t6",
    title: "Coastal Retreat — Eforie Nord",
    description: "Seaside plot 300m from the Black Sea beach in Eforie Nord. Gentle slope toward the water ensures sea views from any modular structure. Perfect for a vacation home or glamping business with high Airbnb rental potential (June\u2013September). Paved road, public water supply, seasonal electricity demand covered by 3-phase connection.",
    location: { lat: 44.0630, lng: 28.6500, address: "Str. Republicii 42", city: "Eforie Nord", county: "Constanta" },
    area: 300,
    price: 120000,
    pricePerM2: 400,
    zoning: "mixed",
    utilities: { water: true, electricity: true, gas: false, sewer: true },
    features: { slope: "gentle", orientation: "east", soilType: "Sandy", nearbyPOI: ["Black Sea beach (300m)", "Techirghiol Lake (2km)", "Aqua Magic Park (1.5km)", "Train station (500m)"] },
    photos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
    ],
    seller: { name: "Litoral Invest SRL", phone: "+40 241 500 600", email: "info@litoral-invest.ro" },
    status: "available",
    suitabilityScore: 75,
    maxModules: 6,
    createdAt: "2026-03-05",
  },
  {
    id: "t7",
    title: "Rural Homestead — Barsana, Maramures",
    description: "Expansive 2000 m\u00B2 flat terrain in the heart of Maramures, near the famous Barsana Monastery. Surrounded by traditional wooden homes, apple orchards, and hay fields. Well water on-site, electricity connected. Ideal for a self-sustaining homestead with multiple modules, workshop, and garden. Incredibly affordable at \u20AC15/m\u00B2.",
    location: { lat: 47.6584, lng: 23.5682, address: "Sat Barsana 120", city: "Barsana", county: "Maramures" },
    area: 2000,
    price: 30000,
    pricePerM2: 15,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    features: { slope: "flat", orientation: "south-east", soilType: "Fertile chernozem", nearbyPOI: ["Barsana Monastery (1km)", "Iza River (200m)", "Village center (500m)", "Sighetu Marmatiei (20km)"] },
    photos: [
      "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600&h=400&fit=crop",
    ],
    seller: { name: "Gheorghe Pop", phone: "+40 727 444 555", email: "gheorghe.pop@mail.ro" },
    status: "available",
    suitabilityScore: 60,
    maxModules: 50,
    createdAt: "2026-02-20",
  },
  {
    id: "t8",
    title: "Tech District Lot — Cluj-Napoca",
    description: "In the heart of Cluj's booming tech hub near Tetarom business park. Mixed zoning allows co-working modules, startup offices, or showrooms. Fiber internet and 5G already connected at boundary. Walking distance to 3 IT company headquarters. Plot includes a small existing structure (60 m\u00B2) that can be demolished or repurposed.",
    location: { lat: 46.7700, lng: 23.5900, address: "Str. Fabricii 80", city: "Cluj-Napoca", county: "Cluj" },
    area: 280,
    price: 140000,
    pricePerM2: 500,
    zoning: "commercial",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "flat", orientation: "north-west", soilType: "Sandy clay", nearbyPOI: ["Tetarom I Business Park (300m)", "Kaufland (500m)", "Bus station (100m)", "VIVO! Mall (2km)"] },
    photos: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
    ],
    seller: { name: "Digital Estate SRL", phone: "+40 364 100 200", email: "sales@digitalestate.ro" },
    status: "available",
    suitabilityScore: 82,
    maxModules: 6,
    createdAt: "2026-03-18",
  },
  {
    id: "t9",
    title: "Lakeside Parcel — Snagov",
    description: "Peaceful 800 m\u00B2 lakeside property with 15m direct water frontage on Snagov Lake. Mature willow trees provide natural shade. Private dock possibility. Year-round paved road access from DN1. Popular area for weekend homes \u2014 strong resale value. 25 min drive to Bucharest Otopeni Airport.",
    location: { lat: 44.6920, lng: 26.1530, address: "Str. Lacului 33", city: "Snagov", county: "Ilfov" },
    area: 800,
    price: 160000,
    pricePerM2: 200,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: true },
    features: { slope: "flat", orientation: "west", soilType: "Alluvial clay", nearbyPOI: ["Snagov Lake (direct access)", "Snagov Monastery (2km)", "DN1 highway (3km)", "Otopeni Airport (25km)"] },
    photos: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1502675135487-e971002a6adb?w=600&h=400&fit=crop",
    ],
    seller: { name: "Adrian Stanescu", phone: "+40 729 666 777", email: "adrian.stanescu@outlook.com" },
    status: "sold",
    suitabilityScore: 90,
    maxModules: 18,
    createdAt: "2026-01-15",
  },
  {
    id: "t10",
    title: "Vineyard Plot — Dealu Mare, Prahova",
    description: "Scenic 950 m\u00B2 plot in the famous Dealu Mare wine region. South-facing slope with excellent sun exposure. Abandoned vineyard rows can be restored or cleared for building. Access via communal road. Stunning views of the Carpathian foothills. Ideal for a wine-country modular retreat or agritourism project.",
    location: { lat: 45.0200, lng: 26.1700, address: "Sat Urlati, DJ102", city: "Urlati", county: "Prahova" },
    area: 950,
    price: 38000,
    pricePerM2: 40,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    features: { slope: "moderate", orientation: "south", soilType: "Calcareous clay", nearbyPOI: ["Dealu Mare vineyards (adjacent)", "Urlati center (2km)", "Ploiesti (35km)", "Bucharest (100km)"] },
    photos: [
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=600&h=400&fit=crop",
    ],
    seller: { name: "Vinia Estate SRL", phone: "+40 244 300 400", email: "contact@vinia-estate.ro" },
    status: "available",
    suitabilityScore: 68,
    maxModules: 20,
    createdAt: "2026-03-25",
  },
  {
    id: "t11",
    title: "Industrial Conversion — Oradea",
    description: "Former industrial yard in Oradea's regenerating Iosia district. 700 m\u00B2 flat concrete pad \u2014 minimal site preparation needed for modular placement. Heavy-duty electrical connection (100 kVA). Neighbors include new apartment complexes and a co-working space. Zoned mixed-use, ideal for a modular office campus or retail pop-up.",
    location: { lat: 47.0465, lng: 21.9189, address: "Str. Nufarului 88", city: "Oradea", county: "Bihor" },
    area: 700,
    price: 91000,
    pricePerM2: 130,
    zoning: "mixed",
    utilities: { water: true, electricity: true, gas: true, sewer: true },
    features: { slope: "flat", orientation: "north", soilType: "Compacted fill", nearbyPOI: ["Oradea Fortress (3km)", "Lotus Center Mall (1km)", "University of Oradea (2km)", "Tram line (200m)"] },
    photos: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    ],
    seller: { name: "Reconversie Urbana SRL", phone: "+40 259 400 500", email: "office@reconversie.ro" },
    status: "available",
    suitabilityScore: 80,
    maxModules: 16,
    createdAt: "2026-03-28",
  },
  {
    id: "t12",
    title: "Forest Edge Retreat — Rasnov",
    description: "Idyllic 600 m\u00B2 plot at the edge of a spruce forest, 3 km from medieval Rasnov Citadel. Gentle south-facing slope with views toward Piatra Craiului massif. Quiet, no-through-traffic road. Two neighboring plots already have modern homes. Septic solution required. Perfect for a mountain modular cabin or Airbnb retreat.",
    location: { lat: 45.5950, lng: 25.4620, address: "Str. Parcului 22, Rasnov", city: "Rasnov", county: "Brasov" },
    area: 600,
    price: 54000,
    pricePerM2: 90,
    zoning: "residential",
    utilities: { water: true, electricity: true, gas: false, sewer: false },
    features: { slope: "gentle", orientation: "south", soilType: "Mountain loam", nearbyPOI: ["Rasnov Citadel (3km)", "Piatra Craiului National Park (8km)", "Bran Castle (12km)", "Poiana Brasov ski (15km)"] },
    photos: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop",
    ],
    seller: { name: "Catalin Neagu", phone: "+40 723 111 222", email: "catalin.neagu@gmail.com" },
    status: "available",
    suitabilityScore: 86,
    maxModules: 12,
    createdAt: "2026-04-01",
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
