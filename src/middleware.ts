import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * Strategy: Client-side auth with Supabase means we can't verify JWT here
 * without @supabase/ssr (adds complexity). Instead we use a lightweight approach:
 * - Protected routes redirect to /login if no Supabase session cookie exists
 * - Actual auth verification happens client-side in AuthHydrator
 * - This prevents the "flash of dashboard" for unauthenticated users
 *
 * Protected routes: /dashboard, /project/:id/* (except demo)
 * Public routes: /, /login, /register, /project/demo/*, /blog, /portfolio, /api/*
 */

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/update-password",
  "/auth/callback",
  "/blog",
  "/portfolio",
  "/pricing",
  "/library",
  "/quiz",
];

const PUBLIC_PREFIXES = [
  "/project/demo/",  // Demo flow is always public
  "/api/",           // API routes handle their own auth
  "/admin/",         // Admin tools (engine comparison, etc.)
  "/_next/",         // Next.js internals
  "/models/",        // Static 3D models
  "/images/",        // Static images
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // Allow static files
  if (pathname.includes(".")) return NextResponse.next();

  // Check for Supabase auth cookie (sb-*-auth-token)
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );

  // Also check for demo mode auth in localStorage (via a cookie we set)
  const hasDemoAuth = request.cookies.has("modulca-auth-active");

  if (!hasAuthCookie && !hasDemoAuth) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
