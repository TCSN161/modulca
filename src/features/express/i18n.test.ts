import { describe, it, expect, afterEach } from "vitest";
import { EXPRESS_STRINGS, expressT, toExpressLocale } from "./i18n";
import { isExpressEnabled } from "./flag";

function keys(o: object, p = ""): string[] {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`])).sort();
}

describe("express i18n", () => {
  it("RO, EN and NL have the same non-empty keys", () => {
    const en = keys(EXPRESS_STRINGS.en);
    expect(keys(EXPRESS_STRINGS.ro)).toEqual(en);
    expect(keys(EXPRESS_STRINGS.nl)).toEqual(en);
    for (const l of ["ro", "en", "nl"] as const) {
      for (const v of Object.values(EXPRESS_STRINGS[l])) if (typeof v === "string") expect(v.length).toBeGreaterThan(0);
    }
  });
  it("falls back to EN", () => {
    expect(toExpressLocale("de")).toBe("en");
    expect(expressT("ro").start).toBe("Generează proiectul");
  });
});

describe("EXPRESS_ENABLED flag", () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });
  it("is off by default and on with either variable", () => {
    delete process.env.NEXT_PUBLIC_EXPRESS_ENABLED;
    delete process.env.EXPRESS_ENABLED;
    expect(isExpressEnabled()).toBe(false);
    process.env.EXPRESS_ENABLED = "1";
    expect(isExpressEnabled()).toBe(true);
    delete process.env.EXPRESS_ENABLED;
    process.env.NEXT_PUBLIC_EXPRESS_ENABLED = "true";
    expect(isExpressEnabled()).toBe(true);
  });
});
