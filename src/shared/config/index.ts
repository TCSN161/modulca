/**
 * Application-wide configuration from environment variables.
 * Note: Maps use Leaflet + OpenStreetMap/Esri tiles (no Mapbox token needed).
 */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "ModulCA",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
} as const;
