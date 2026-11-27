import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ro from "@/i18n/messages/ro.json";
import en from "@/i18n/messages/en.json";
import RenderEngineBadge from "./RenderEngineBadge";

function renderIn(locale: "ro" | "en", ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "ro" ? ro : en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("RenderEngineBadge (BUG-ST29)", () => {
  it("RO: engine and fallback", () => {
    renderIn("ro", <RenderEngineBadge engine="ai-horde" fallbackFrom={["cloudflare-klein"]} />);
    const text = screen.getByTestId("render-engine-badge").textContent;
    expect(text).toContain("Randat cu AI Horde");
    expect(text).toContain("(alternativă: FLUX.2 klein (Cloudflare) indisponibil)");
  });

  it("EN: engine only, no fallback text", () => {
    renderIn("en", <RenderEngineBadge engine="cloudflare-klein" />);
    const text = screen.getByTestId("render-engine-badge").textContent;
    expect(text).toBe("Rendered with FLUX.2 klein (Cloudflare)");
  });
});
