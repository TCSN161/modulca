import { describe, it, expect } from "vitest";
import { pickProjectName, presentationFileName, DEFAULT_PROJECT_NAME } from "./projectName";

describe("BUG-ST07 — presentation uses the project name", () => {
  it("cloud name wins", () => {
    expect(pickProjectName("p1", { id: "p1", name: "Local" }, "Smoke Test 1.03")).toBe("Smoke Test 1.03");
  });
  it("active ref is used only when its id matches", () => {
    expect(pickProjectName("p1", { id: "p1", name: "Casa Ana" })).toBe("Casa Ana");
    expect(pickProjectName("p1", { id: "other", name: "Stale" })).toBe(DEFAULT_PROJECT_NAME);
    expect(pickProjectName("demo", { id: "x", name: "Demo house" })).toBe("Demo house");
  });
  it("falls back to the default for blank names", () => {
    expect(pickProjectName("p1", {}, "   ")).toBe(DEFAULT_PROJECT_NAME);
  });
  it("builds a safe PDF filename", () => {
    expect(presentationFileName("Smoke Test 1.03")).toBe("Smoke_Test_1.03_Presentation.pdf");
    expect(presentationFileName('a/b:c*"d')).toBe("abcd_Presentation.pdf");
    expect(presentationFileName("")).toBe("My_Modular_Home_Presentation.pdf");
  });
});
