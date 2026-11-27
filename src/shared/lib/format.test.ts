import { describe, it, expect } from "vitest";
import { formatNumber, formatEurInt } from "./format";

describe("format (BUG-ST20)", () => {
  it("pins en-US grouping regardless of runtime locale", () => {
    expect(formatNumber(12500)).toBe("12,500");
    expect(formatNumber(1234.567)).toBe("1,234.57");
    expect(formatEurInt(12499.6)).toBe("12,500");
  });
  it("accepts an explicit app locale and guards NaN", () => {
    expect(formatNumber(12500, "ro-RO")).toBe("12.500");
    expect(formatNumber(Number.NaN)).toBe("0");
  });
});
