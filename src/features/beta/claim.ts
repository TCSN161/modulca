/**
 * Beta invite gate (BUG-B2-03, Chat 4, session 4.05, 2026-11-27).
 *
 * MAIN decision: an email allowlist (`public.beta_invites`, migration 013) checked on the
 * server after sign-up and at every login, plus one optional shared invite code
 * (env `BETA_INVITE_CODE`; unset = the code path is off). An invited user gets
 * `profiles.beta_invited_at`, which anchors the 3-month beta promo (BUG-B2-02).
 * Everyone else can still use ModulCA as Explorer (free), without the promo.
 *
 * Pure functions only (no Supabase), so the rules are unit-tested in claim.test.ts.
 * The route `src/app/api/beta/claim/route.ts` does the I/O.
 */

export type ClaimSource = "existing" | "allowlist" | "code" | "none";

export interface ClaimInput {
  /** profiles.beta_invited_at already stored (null = never invited). */
  currentInvitedAt: string | null;
  /** beta_invites.invited_at for the user's email, null = not on the list. */
  allowlistInvitedAt: string | null;
  /** Code the user typed (optional). */
  code?: string | null;
  /** process.env.BETA_INVITE_CODE (optional). */
  envCode?: string | null;
  now?: Date;
}

export interface ClaimDecision {
  /** Promo anchor after the claim (null = not invited). */
  invitedAt: string | null;
  source: ClaimSource;
  /** true → write invitedAt to profiles.beta_invited_at. */
  writeProfile: boolean;
  /** true → add an allowlist row (invited_by = 'code') so the invite is on record. */
  writeAllowlist: boolean;
  /** A code was sent but did not match (or the code path is off). */
  codeRejected: boolean;
}

export function normalizeEmail(email: string | null | undefined): string | null {
  const e = (email ?? "").trim().toLowerCase();
  return e.includes("@") ? e : null;
}

/** Codes are compared trimmed and case-insensitive ("Modulca-Beta" = "MODULCA-BETA"). */
export function normalizeCode(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

/** The code path is on only when BETA_INVITE_CODE is set (and not blank). */
export function isCodeEnabled(envCode: string | null | undefined): boolean {
  return normalizeCode(envCode).length > 0;
}

export function codeMatches(code: string | null | undefined, envCode: string | null | undefined): boolean {
  if (!isCodeEnabled(envCode)) return false;
  const a = normalizeCode(code);
  const b = normalizeCode(envCode);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Decide the claim. Rules:
 *  1. Already invited → keep the stored date (a later allowlist edit or code never moves it,
 *     so the promo cannot be restarted).
 *  2. On the allowlist → use the allowlist `invited_at`.
 *  3. Valid code → now.
 *  4. Otherwise → not invited (Explorer, no promo).
 */
export function decideClaim(input: ClaimInput): ClaimDecision {
  const sentCode = normalizeCode(input.code).length > 0;
  const codeOk = sentCode && codeMatches(input.code, input.envCode);
  const codeRejected = sentCode && !codeOk;

  if (input.currentInvitedAt) {
    return { invitedAt: input.currentInvitedAt, source: "existing", writeProfile: false, writeAllowlist: false, codeRejected: false };
  }
  if (input.allowlistInvitedAt) {
    return { invitedAt: input.allowlistInvitedAt, source: "allowlist", writeProfile: true, writeAllowlist: false, codeRejected: false };
  }
  if (codeOk) {
    const at = (input.now ?? new Date()).toISOString();
    return { invitedAt: at, source: "code", writeProfile: true, writeAllowlist: true, codeRejected: false };
  }
  return { invitedAt: null, source: "none", writeProfile: false, writeAllowlist: false, codeRejected };
}

/** localStorage key where the sign-up form / ?invite= link keeps a typed code until the claim. */
export const INVITE_CODE_STORAGE_KEY = "mca_beta_invite_code";
