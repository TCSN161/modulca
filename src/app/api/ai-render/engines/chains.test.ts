import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getFallbackChain, FALLBACK_FREE, IMG2IMG_FREE, withFloor } from "./chains";
import { hordeSize, HORDE_MAX_PIXELS } from "./aihorde";
import {
  canUseEngine, recordFailure, recordSuccess, HEALTH_COOLDOWN_MS, __resetCreditManagerState,
} from "./creditManager";

const LADDER = ["guest_free", "free", "premium", "architect", "constructor"] as const;

describe("BUG-ST01 — every tier keeps the free engines (more options, never fewer)", () => {
  for (const img of [false, true]) {
    const floor = img ? IMG2IMG_FREE : FALLBACK_FREE;
    it(`${img ? "img2img" : "text2img"}: each tier ⊇ the free floor`, () => {
      for (const t of [...LADDER, "unknown"]) {
        const chain = getFallbackChain(t, img);
        for (const id of floor) expect(chain, `${t} lacks ${id}`).toContain(id);
      }
    });
    it(`${img ? "img2img" : "text2img"}: each tier ⊇ the tier below`, () => {
      for (let i = 1; i < LADDER.length; i++) {
        const lower = getFallbackChain(LADDER[i - 1], img);
        const upper = getFallbackChain(LADDER[i], img);
        for (const id of lower) expect(upper, `${LADDER[i]} lacks ${id}`).toContain(id);
      }
    });
  }
  it("constructor has its own chain (was the 10-engine default)", () => {
    expect(getFallbackChain("constructor", false).length).toBeGreaterThanOrEqual(
      getFallbackChain("architect", false).length,
    );
  });
  it("img2img always starts with cloudflare-klein", () => {
    for (const t of LADDER) expect(getFallbackChain(t, true)[0]).toBe("cloudflare-klein");
  });
  it("withFloor keeps order and dedupes", () => {
    expect(withFloor(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });
});

describe("BUG-ST01 — AI Horde anonymous size (≤576² px, else KudosUpfront)", () => {
  it("fits the default 1024×576 (was sent as 768×576 → instant 403)", () => {
    const s = hordeSize(1024, 576);
    expect(s).toEqual({ width: 768, height: 384 });
    expect(s.width * s.height).toBeLessThanOrEqual(HORDE_MAX_PIXELS);
  });
  it("keeps multiples of 64 and never exceeds the limit", () => {
    for (const [w, h] of [[512, 512], [576, 576], [1920, 1080], [4000, 300], [100, 100], [NaN, 0]]) {
      const s = hordeSize(w, h);
      expect(s.width % 64).toBe(0);
      expect(s.height % 64).toBe(0);
      expect(s.width * s.height).toBeLessThanOrEqual(HORDE_MAX_PIXELS);
    }
    expect(hordeSize(512, 512)).toEqual({ width: 512, height: 512 });
  });
});

describe("BUG-ST01 — unhealthy engine recovers after the cooldown", () => {
  beforeEach(() => __resetCreditManagerState());
  afterEach(() => vi.useRealTimers());
  it("5 failures block; after HEALTH_COOLDOWN_MS one probe is allowed again", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T18:00:00Z"));
    for (let i = 0; i < 5; i++) recordFailure("cloudflare", "429 daily quota", { tier: "constructor" });
    expect(canUseEngine("cloudflare", { tier: "constructor" })).toBe(false);
    vi.setSystemTime(Date.now() + HEALTH_COOLDOWN_MS + 1);
    expect(canUseEngine("cloudflare", { tier: "constructor" })).toBe(true);
    // a failed probe blocks again for another cooldown
    recordFailure("cloudflare", "429", { tier: "constructor" });
    expect(canUseEngine("cloudflare", { tier: "constructor" })).toBe(false);
    vi.setSystemTime(Date.now() + HEALTH_COOLDOWN_MS + 1);
    recordSuccess("cloudflare", 0, 2000, { tier: "constructor" });
    expect(canUseEngine("cloudflare", { tier: "constructor" })).toBe(true);
  });
});
