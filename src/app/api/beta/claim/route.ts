import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getAuthenticatedUser } from "@/shared/lib/api-auth";
import { getSupabaseServer } from "@/shared/lib/supabase-server";
import { decideClaim, normalizeEmail } from "@/features/beta/claim";
import { computeBillingStatus, type BillingProfile } from "../../stripe/billing";

export const dynamic = "force-dynamic";

/**
 * POST /api/beta/claim — BUG-B2-03 invite gate (4.05).
 * Called by the auth store after sign-up and at every login (idempotent).
 * Body (optional): { code?: string } — the shared invite code (env BETA_INVITE_CODE).
 * Auth: `Authorization: Bearer` (authHeaders()).
 *
 * Looks the verified email up in `beta_invites` (service role), and if the user is invited
 * stores the invite date in `profiles.beta_invited_at` (the promo anchor, BUG-B2-02).
 * Returns the server BillingStatus plus { invited, source, codeRejected }.
 * Before migration 013 is applied the table/column are missing: the route then answers
 * "not invited" (no promo) instead of failing.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let code: string | null = null;
  try {
    const body = (await req.json()) as { code?: unknown };
    if (typeof body?.code === "string") code = body.code.slice(0, 64);
  } catch {
    /* empty body is fine */
  }

  const { data: profileRow, error: profileErr } = await sb
    .from("profiles")
    .select("*") // "*" so a missing beta_invited_at column (pre-013) is not an error
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) {
    Sentry.captureException(profileErr, { tags: { source: "beta-claim" } });
    return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
  }
  const profile = (profileRow as BillingProfile | null) ?? null;

  const email = normalizeEmail(user.email);
  let allowlistInvitedAt: string | null = null;
  if (email && !profile?.beta_invited_at) {
    const { data: invite, error: inviteErr } = await sb
      .from("beta_invites")
      .select("invited_at")
      .eq("email", email)
      .maybeSingle();
    if (inviteErr) {
      // 42P01 = table missing (migration 013 not applied yet) → treat as not invited.
      if (inviteErr.code !== "42P01") Sentry.captureException(inviteErr, { tags: { source: "beta-claim" } });
    } else {
      allowlistInvitedAt = (invite as { invited_at: string } | null)?.invited_at ?? null;
    }
  }

  const decision = decideClaim({
    currentInvitedAt: profile?.beta_invited_at ?? null,
    allowlistInvitedAt,
    code,
    envCode: process.env.BETA_INVITE_CODE,
  });

  let invitedAt = decision.invitedAt;
  if (decision.writeAllowlist && email) {
    const { error } = await sb
      .from("beta_invites")
      .upsert({ email, invited_at: invitedAt, invited_by: "code", note: "invite code" } as never, { onConflict: "email", ignoreDuplicates: true });
    if (error) Sentry.captureException(error, { tags: { source: "beta-claim" } });
  }
  if (decision.writeProfile && profile) {
    const { error } = await sb
      .from("profiles")
      .update({ beta_invited_at: invitedAt } as never)
      .eq("id", user.id)
      .is("beta_invited_at", null);
    if (error) {
      Sentry.captureException(error, { tags: { source: "beta-claim" } });
      invitedAt = null; // not stored → do not report a promo the server will not honour
    }
  }

  const status = computeBillingStatus(profile ? { ...profile, beta_invited_at: invitedAt } : null);
  return NextResponse.json(
    { ...status, invited: !!invitedAt, source: invitedAt ? decision.source : "none", codeRejected: decision.codeRejected },
    { headers: { "Cache-Control": "no-store" } },
  );
}
