import { describe, it, expect } from "vitest";
import { presentationT, renderEngineCaption, renderModeLabel, toPresentationLocale } from ".";
import { en } from "./en";
import { ro } from "./ro";
import { nl } from "./nl";

function keys(o: object, p = ""): string[] {
  return Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : keys(v, `${p}${k}.`)));
}

describe("presentation i18n (ST32)", () => {
  it("ro and nl have exactly the en keys", () => {
    expect(keys(ro).sort()).toEqual(keys(en).sort());
    expect(keys(nl).sort()).toEqual(keys(en).sort());
  });

  it("Romanian strings, plurals and formats", () => {
    const t = presentationT("ro");
    expect(t("slide.cost.label")).toBe("Sumar costuri");
    expect(t("common.modules", { count: 1 })).toBe("1 modul");
    expect(t("common.modules", { count: 9 })).toBe("9 module");
    expect(t("common.modules", { count: 20 })).toBe("20 de module");
    expect(t.rooms(["bedroom", "bedroom", "bedroom", "kitchen"])).toBe("3 dormitoare, 1 bucătărie");
    expect(t.eur(40272).replace(/\s/g, " ")).toBe("40.272 €");
    expect(t.date(new Date("2026-11-27T12:00:00Z"))).toBe("27 noiembrie 2026");
    expect(t.finish("standard")).toBe("Standard");
  });

  it("English default + unknown locale falls back to en", () => {
    expect(toPresentationLocale("de")).toBe("en");
    const t = presentationT(undefined);
    expect(t.eur(40272)).toBe("€40,272");
    expect(t("description.paragraph", { style: "modern", count: 2, area: 18, usable: 14, rooms: "2 bedrooms", finish: "standard" }))
      .toContain("comprises 2 modules");
  });

  it("render caption shows the fallback only when the list is not empty (ST29/ST37)", () => {
    const t = presentationT("ro");
    expect(renderEngineCaption(t, { engine: "cloudflare-klein-img2img", fallbackFrom: [] }))
      .toEqual({ engine: "FLUX.2 klein (Cloudflare)", fallback: null });
    expect(renderEngineCaption(t, { engine: "cloudflare-klein", fallbackFrom: ["cloudflare-klein-img2img"] }).fallback).toBeNull();
    expect(renderEngineCaption(t, { engine: "ai-horde", fallbackFrom: ["cloudflare-klein"] }).fallback)
      .toBe("(alternativă: FLUX.2 klein (Cloudflare) indisponibil)");
    expect(renderModeLabel(t, { mode: "img2img", baseSource: "upload" })).toBe("Foto+AI");
  });
});
