import { describe, it, expect } from "vitest";
import { getLocalAnswer } from "./neufertKB";

describe("getLocalAnswer", () => {
  /* ------------------------------------------------------------------ */
  /*  1. Room dimension questions                                        */
  /* ------------------------------------------------------------------ */

  it("returns m2 info for bedroom dimension questions", () => {
    const answer = getLocalAnswer("What are the bedroom dimensions?");
    expect(answer).toContain("m²");
  });

  it("returns dimension data for generic room size questions", () => {
    const answer = getLocalAnswer("standard room dimensions for a house");
    expect(answer).toContain("m²");
  });

  /* ------------------------------------------------------------------ */
  /*  2. Kitchen questions                                               */
  /* ------------------------------------------------------------------ */

  it("returns kitchen content for kitchen questions", () => {
    const answer = getLocalAnswer("What are kitchen design standards?");
    expect(answer.toLowerCase()).toContain("kitchen");
  });

  it("mentions work triangle for detailed kitchen queries", () => {
    const answer = getLocalAnswer("kitchen counter height and work triangle");
    expect(answer.toLowerCase()).toContain("work triangle");
  });

  /* ------------------------------------------------------------------ */
  /*  3. Bathroom questions                                              */
  /* ------------------------------------------------------------------ */

  it("returns bathroom content for bathroom questions", () => {
    const answer = getLocalAnswer("bathroom minimum size requirements");
    expect(answer.toLowerCase()).toContain("bathroom");
  });

  it("mentions shower dimensions for bathroom queries", () => {
    const answer = getLocalAnswer("How big should a bathroom be?");
    expect(answer.toLowerCase()).toContain("shower");
  });

  /* ------------------------------------------------------------------ */
  /*  4. Romanian regulation detection                                   */
  /* ------------------------------------------------------------------ */

  it("detects RO region for Romanian permit questions", () => {
    const answer = getLocalAnswer("How do I get an autorizatie de construire in Romania?");
    expect(answer).toContain("Romanian");
  });

  it("detects RO for Bucharest-specific queries", () => {
    const answer = getLocalAnswer("building permit process in Bucuresti");
    expect(answer.toLowerCase()).toMatch(/ro|roman|autorizat|certificat/);
  });

  /* ------------------------------------------------------------------ */
  /*  5. Dutch regulation detection                                      */
  /* ------------------------------------------------------------------ */

  it("detects NL region for Dutch building questions", () => {
    const answer = getLocalAnswer("What is the bouwbesluit in the Netherlands?");
    expect(answer.toLowerCase()).toMatch(/dutch|nl|bouwbesluit|omgevingsvergunning/);
  });

  it("detects NL for omgevingswet queries", () => {
    const answer = getLocalAnswer("omgevingswet requirements for modular homes");
    expect(answer.toLowerCase()).toMatch(/dutch|nl|netherlands|omgevings/);
  });

  /* ------------------------------------------------------------------ */
  /*  6. ModulCA platform questions                                      */
  /* ------------------------------------------------------------------ */

  it("returns platform info for ModulCA questions", () => {
    const answer = getLocalAnswer("What is ModulCA and how does it work?");
    expect(answer).toContain("ModulCA");
  });

  it("mentions module system for grid questions", () => {
    const answer = getLocalAnswer("Tell me about the 3x3 module grid system");
    expect(answer.toLowerCase()).toContain("module");
  });

  /* ------------------------------------------------------------------ */
  /*  7. Cost and pricing questions                                      */
  /* ------------------------------------------------------------------ */

  it("returns cost info for pricing questions", () => {
    const answer = getLocalAnswer("cost estimation budget price per square meter");
    expect(answer).toMatch(/€|cost|price|budget/i);
  });

  /* ------------------------------------------------------------------ */
  /*  8. Fallback for unknown questions                                  */
  /* ------------------------------------------------------------------ */

  it("returns fallback help text for unrelated questions", () => {
    const answer = getLocalAnswer("xyzzy foobarbaz qqq");
    expect(answer).toContain("I'm your ModulCA architectural consultant");
  });

  it("fallback lists available topic areas", () => {
    const answer = getLocalAnswer("!!!###$$$");
    expect(answer).toContain("Room dimensions");
    expect(answer).toContain("Building regulations");
  });

  /* ------------------------------------------------------------------ */
  /*  9. Always returns non-empty string                                 */
  /* ------------------------------------------------------------------ */

  it("returns a non-empty string for normal input", () => {
    const answer = getLocalAnswer("bedroom");
    expect(typeof answer).toBe("string");
    expect(answer.length).toBeGreaterThan(0);
  });

  it("returns a non-empty string for empty input", () => {
    const answer = getLocalAnswer("");
    expect(typeof answer).toBe("string");
    expect(answer.length).toBeGreaterThan(0);
  });

  /* ------------------------------------------------------------------ */
  /*  10. Case insensitivity                                             */
  /* ------------------------------------------------------------------ */

  it("matches regardless of case", () => {
    const lower = getLocalAnswer("kitchen standards");
    const upper = getLocalAnswer("KITCHEN STANDARDS");
    const mixed = getLocalAnswer("Kitchen Standards");
    expect(lower).toBe(upper);
    expect(upper).toBe(mixed);
  });
});
