/**
 * GET /api/user/export
 *
 * GDPR Article 15 (Right of access) + Article 20 (Right to data portability).
 * Returns a JSON export of ALL personal data held for the authenticated user:
 *   - Profile record (tier, display name, created_at, etc.)
 *   - All projects (including soft-deleted)
 *   - All saved renders
 *   - Subscription metadata (Stripe customer ID — not billing details)
 *
 * Excludes: passwords, session tokens, other users' data.
 *
 * Auth: requires authenticated Supabase session via getAuthenticatedUserId.
 * Response: JSON file download (Content-Disposition: attachment).
 */

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUser } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    // Parallel fetch all user-owned data
    const [profileRes, projectsRes, rendersRes] = await Promise.all([
      sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      sb.from("projects").select("*").eq("user_id", user.id),
      sb.from("public_renders").select("*").eq("user_id", user.id),
    ]);

    if (profileRes.error) {
      Sentry.captureException(profileRes.error, { tags: { source: "user-export" } });
    }

    const profile = profileRes.data as Record<string, unknown> | null;

    // Redact sensitive fields that shouldn't appear in export
    if (profile) {
      // Keep stripe_customer_id (user's own reference) but remove any internal admin-only fields
      delete profile.internal_notes;
      delete profile.admin_flags;
    }

    const exportData = {
      _metadata: {
        generated_at: new Date().toISOString(),
        format_version: 1,
        gdpr_rights_reference: "GDPR Article 15 (access) and Article 20 (portability)",
        notes: [
          "This file contains all personal data ModulCA holds for your account.",
          "It does not include passwords or session tokens (never stored in plaintext).",
          "For questions contact privacy@modulca.eu.",
        ],
      },
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile ?? null,
      projects: projectsRes.data ?? [],
      renders: rendersRes.data ?? [],
      stats: {
        project_count: projectsRes.data?.length ?? 0,
        render_count: rendersRes.data?.length ?? 0,
      },
    };

    const filename = `modulca-export-${user.id.slice(0, 8)}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[user/export] Unexpected error:", err);
    Sentry.captureException(err, { tags: { source: "user-export" } });
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
