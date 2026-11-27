/**
 * County seat coordinates (approximate) for the 41 counties + Bucharest.
 * Used only to centre the map and draw the placeholder plot; not a geocoder.
 */
import type { LatLng } from "@/features/land/store";

export interface CountyInfo {
  name: string;
  center: LatLng;
}

export const COUNTY_CENTROIDS: Record<string, CountyInfo> = {
  AB: { name: "Alba", center: { lat: 46.0733, lng: 23.5805 } },
  AR: { name: "Arad", center: { lat: 46.1866, lng: 21.3123 } },
  AG: { name: "Argeș", center: { lat: 44.8565, lng: 24.8692 } },
  BC: { name: "Bacău", center: { lat: 46.5670, lng: 26.9146 } },
  BH: { name: "Bihor", center: { lat: 47.0465, lng: 21.9189 } },
  BN: { name: "Bistrița-Năsăud", center: { lat: 47.1357, lng: 24.4880 } },
  BT: { name: "Botoșani", center: { lat: 47.7487, lng: 26.6694 } },
  BV: { name: "Brașov", center: { lat: 45.6427, lng: 25.5887 } },
  BR: { name: "Brăila", center: { lat: 45.2692, lng: 27.9575 } },
  B: { name: "București", center: { lat: 44.4268, lng: 26.1025 } },
  BZ: { name: "Buzău", center: { lat: 45.1500, lng: 26.8333 } },
  CS: { name: "Caraș-Severin", center: { lat: 45.3006, lng: 21.8892 } },
  CL: { name: "Călărași", center: { lat: 44.2000, lng: 27.3333 } },
  CJ: { name: "Cluj", center: { lat: 46.7712, lng: 23.6236 } },
  CT: { name: "Constanța", center: { lat: 44.1598, lng: 28.6348 } },
  CV: { name: "Covasna", center: { lat: 45.8667, lng: 25.7833 } },
  DB: { name: "Dâmbovița", center: { lat: 44.9254, lng: 25.4567 } },
  DJ: { name: "Dolj", center: { lat: 44.3302, lng: 23.7949 } },
  GL: { name: "Galați", center: { lat: 45.4353, lng: 28.0080 } },
  GR: { name: "Giurgiu", center: { lat: 43.9037, lng: 25.9699 } },
  GJ: { name: "Gorj", center: { lat: 45.0333, lng: 23.2833 } },
  HR: { name: "Harghita", center: { lat: 46.3600, lng: 25.8017 } },
  HD: { name: "Hunedoara", center: { lat: 45.8833, lng: 22.9000 } },
  IL: { name: "Ialomița", center: { lat: 44.5667, lng: 27.3667 } },
  IS: { name: "Iași", center: { lat: 47.1585, lng: 27.6014 } },
  IF: { name: "Ilfov", center: { lat: 44.5667, lng: 26.1167 } },
  MM: { name: "Maramureș", center: { lat: 47.6567, lng: 23.5850 } },
  MH: { name: "Mehedinți", center: { lat: 44.6333, lng: 22.6500 } },
  MS: { name: "Mureș", center: { lat: 46.5425, lng: 24.5575 } },
  NT: { name: "Neamț", center: { lat: 46.9275, lng: 26.3708 } },
  OT: { name: "Olt", center: { lat: 44.4333, lng: 24.3667 } },
  PH: { name: "Prahova", center: { lat: 44.9367, lng: 26.0129 } },
  SM: { name: "Satu Mare", center: { lat: 47.7900, lng: 22.8900 } },
  SJ: { name: "Sălaj", center: { lat: 47.1833, lng: 23.0500 } },
  SB: { name: "Sibiu", center: { lat: 45.7983, lng: 24.1256 } },
  SV: { name: "Suceava", center: { lat: 47.6514, lng: 26.2556 } },
  TR: { name: "Teleorman", center: { lat: 43.9667, lng: 25.3333 } },
  TM: { name: "Timiș", center: { lat: 45.7489, lng: 21.2087 } },
  TL: { name: "Tulcea", center: { lat: 45.1667, lng: 28.8000 } },
  VS: { name: "Vaslui", center: { lat: 46.6333, lng: 27.7333 } },
  VL: { name: "Vâlcea", center: { lat: 45.1000, lng: 24.3667 } },
  VN: { name: "Vrancea", center: { lat: 45.7000, lng: 27.1833 } },
};

export const DEFAULT_COUNTY = "CJ";

/** Square plot of `areaSqm` centred on `center` (metres → degrees). */
export function squarePlot(center: LatLng, areaSqm: number): LatLng[] {
  const half = Math.sqrt(Math.max(areaSqm, 1)) / 2;
  const dLat = half / 111_320;
  const dLng = half / (111_320 * Math.cos((center.lat * Math.PI) / 180));
  return [
    { lat: center.lat + dLat, lng: center.lng - dLng },
    { lat: center.lat + dLat, lng: center.lng + dLng },
    { lat: center.lat - dLat, lng: center.lng + dLng },
    { lat: center.lat - dLat, lng: center.lng - dLng },
  ];
}
