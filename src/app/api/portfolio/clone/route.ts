/**
 * POST /api/portfolio/clone
 *
 * Clones a published featured_project's design_data into a new row in
 * the authenticated user's projects table. The user can then open the
 * project in the designer and continue editing.
 *
 * Auth: requires a valid Supabase session. User ID is extracted from the
 * verified session — NEVER trusted from the request body.
 *
 * Body: { slug: string, name?: string }
 * Returns: { projectId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/shared/lib/api-auth";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  // Authenticate — extract user ID from verified session, never from body
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required — please sign in" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      slug?: string;
      name?: string;
    };

    if (!body.slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Fetch the featured project
    const { data: featured, error: fetchErr } = await sb
      .from("featured_projects")
      .select("title, design_data")
      .eq("slug", body.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (fetchErr || !featured) {
      return NextResponse.json(
        { error: "Featured project not found" },
        { status: 404 }
      );
    }

    // Insert into user's projects table
    const projectName = body.name || `${featured.title as string} (copy)`;
    const { data: inserted, error: insertErr } = await sb
      .from("projects")
      .insert({
        user_id: userId,
        name: projectName,
        data: featured.design_data,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("[portfolio/clone] Insert failed:", insertErr);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projectId: inserted.id,
      projectName,
    });
  } catch (err) {
    console.error("[portfolio/clone] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
