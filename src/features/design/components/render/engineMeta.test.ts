import { describe, it, expect } from "vitest";
import { engineMetaFromHeaders } from "./engineMeta";

const h = (o: Record<string, string>) => new Headers(o);

describe("engineMetaFromHeaders (BUG-ST29)", () => {
  it("auto text2img with no fallback info: just the engine", () => {
    expect(engineMetaFromHeaders(h({ "X-AI-Engine": "ai-horde" }), { requestedEngine: "auto", hadBaseImage: false }))
      .toEqual({ engine: "ai-horde", fallbackFrom: [], baseNotKept: false });
  });

  it("explicit engine that did not answer is reported as the failed one", () => {
    expect(engineMetaFromHeaders(h({ "X-AI-Engine": "pollinations" }), { requestedEngine: "together", hadBaseImage: false }).fallbackFrom)
      .toEqual(["together"]);
  });

  it("img2img answered by a text-only engine: klein failed and the 3D view was lost", () => {
    expect(engineMetaFromHeaders(h({ "X-AI-Engine": "cloudflare" }), { requestedEngine: null, hadBaseImage: true }))
      .toEqual({ engine: "cloudflare", fallbackFrom: ["cloudflare-klein"], baseNotKept: true });
  });

  it("img2img answered by klein: no fallback", () => {
    expect(engineMetaFromHeaders(h({ "X-AI-Engine": "cloudflare-klein" }), { requestedEngine: null, hadBaseImage: true }))
      .toEqual({ engine: "cloudflare-klein", fallbackFrom: [], baseNotKept: false });
  });

  it("server X-AI-Fallback-From wins over inference", () => {
    const m = engineMetaFromHeaders(
      h({ "X-AI-Engine": "ai-horde", "X-AI-Fallback-From": "cloudflare-klein, gemini" }),
      { requestedEngine: "auto", hadBaseImage: false },
    );
    expect(m.fallbackFrom).toEqual(["cloudflare-klein", "gemini"]);
  });
});
