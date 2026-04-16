/**
 * Authentication is handled by Supabase Auth (not NextAuth).
 *
 * Client-side: src/features/auth/store.ts (Zustand + Supabase)
 * OAuth callback: src/app/(auth)/auth/callback/page.tsx
 * Route protection: src/middleware.ts
 *
 * The next-auth package is installed but unused — kept for potential
 * future migration if server-side session management is needed.
 */
export {};
