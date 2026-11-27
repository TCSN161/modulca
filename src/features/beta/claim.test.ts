import { describe, it, expect } from "vitest";
import { decideClaim, codeMatches, isCodeEnabled, normalizeEmail } from "./claim";

const NOW = new Date("2026-12-15T10:00:00.000Z");
const LIST = "2026-12-14T09:00:00.000Z";
const OLD = "2026-12-01T09:00:00.000Z";

describe("invite code", () => {
  it("is off when BETA_INVITE_CODE is unset or blank", () => {
    expect(isCodeEnabled(undefined)).toBe(false);
    expect(isCodeEnabled("   ")).toBe(false);
    expect(codeMatches("", "")).toBe(false);
    expect(codeMatches("anything", undefined)).toBe(false);
  });
  it("matches trimmed and case-insensitive, rejects others", () => {
    expect(codeMatches(" modulca-beta ", "MODULCA-BETA")).toBe(true);
    expect(codeMatches("MODULCA-BET", "MODULCA-BETA")).toBe(false);
    expect(codeMatches("WRONG-CODE!!", "MODULCA-BETA")).toBe(false);
  });
});

describe("decideClaim", () => {
  it("allowlisted email → invite date from the list, written to the profile", () => {
    expect(decideClaim({ currentInvitedAt: null, allowlistInvitedAt: LIST, now: NOW })).toEqual({
      invitedAt: LIST, source: "allowlist", writeProfile: true, writeAllowlist: false, codeRejected: false,
    });
  });
  it("valid code → now, and an allowlist row is recorded", () => {
    const d = decideClaim({ currentInvitedAt: null, allowlistInvitedAt: null, code: "beta", envCode: "BETA", now: NOW });
    expect(d).toMatchObject({ invitedAt: NOW.toISOString(), source: "code", writeProfile: true, writeAllowlist: true });
  });
  it("not invited → Explorer without promo; a wrong code is flagged", () => {
    expect(decideClaim({ currentInvitedAt: null, allowlistInvitedAt: null, now: NOW })).toMatchObject({ invitedAt: null, source: "none", codeRejected: false });
    expect(decideClaim({ currentInvitedAt: null, allowlistInvitedAt: null, code: "x", envCode: "BETA" })).toMatchObject({ invitedAt: null, codeRejected: true });
    // code path off: any code is rejected
    expect(decideClaim({ currentInvitedAt: null, allowlistInvitedAt: null, code: "BETA" })).toMatchObject({ source: "none", codeRejected: true });
  });
  it("an existing invite date never moves (promo cannot be restarted)", () => {
    const d = decideClaim({ currentInvitedAt: OLD, allowlistInvitedAt: LIST, code: "BETA", envCode: "BETA", now: NOW });
    expect(d).toEqual({ invitedAt: OLD, source: "existing", writeProfile: false, writeAllowlist: false, codeRejected: false });
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims, rejects non-emails", () => {
    expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
    expect(normalizeEmail("nope")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });
});
