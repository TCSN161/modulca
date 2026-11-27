import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { pinImage } from "./inspirationImages";
import { STYLE_PINS } from "./renderConstants";
import RenderGallery from "./RenderGallery";

describe("Design Inspiration images (BUG-ST35)", () => {
  it("matches pins to local product photos only", () => {
    expect(pinImage({ label: "Light Wood Flooring", cat: "Flooring" })?.url).toBe(
      "/images/products/fin-01-oak-flooring.jpg",
    );
    expect(pinImage({ label: "Fog Grey Sofa", cat: "Furniture" })?.url).toBe("/images/products/fur-01-sofa.jpg");
    expect(pinImage({ label: "Ceramic Pendant", cat: "Lighting" })?.url).toBe("/images/products/fur-06-pendant.jpg");
    expect(pinImage({ label: "Abstract Thing", cat: "Misc" })).toBeNull();
    for (const pins of Object.values(STYLE_PINS)) {
      for (const p of pins) {
        const m = pinImage(p);
        if (m) expect(m.url.startsWith("/images/")).toBe(true);
      }
    }
  });

  it("most pins get a photo", () => {
    const all = Object.values(STYLE_PINS).flat();
    const withPhoto = all.filter((p) => pinImage(p)).length;
    expect(withPhoto / all.length).toBeGreaterThan(0.4);
  });

  it("renders a photo, or a placeholder with the pin name", () => {
    render(
      <RenderGallery
        pins={[
          { label: "Light Wood Flooring", h: 100, color: "#ccc", cat: "Flooring" },
          { label: "Abstract Thing", h: 100, color: "#ccc", cat: "Misc" },
        ]}
        styleLabel="Scandinavian"
        moduleType="living"
        savedPins={new Set()}
        onTogglePin={() => {}}
      />,
    );
    expect(screen.getByAltText("Engineered Oak Flooring")).toBeTruthy();
    expect(screen.getByText("No photo yet")).toBeTruthy();
  });
});
