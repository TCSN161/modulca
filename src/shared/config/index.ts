/**
 * Application-wide configuration from environment variables.
 */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "ModulCA",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
} as const;
