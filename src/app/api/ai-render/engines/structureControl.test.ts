/**
 * 3.07 — structure-control engine units: funding gate, Replicate request
 * shape, 402 parking, Horde client control map. fetch is always stubbed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  STRUCTURE_ENGINES, isStructureEngineFunded, markUnfunded, pickControlInput,
  __resetStructureFunding, UNFUNDED_TTL_MS,
} from "./structureFunding";
import { replicateStructureBody, replicateDepthEngine } from "./replicateStructure";
import { hordeImg2imgInput, hordeImg2imgParams } from "./aihorde";

const req = { prompt: "house", width: 1024, height: 576, seed: "42" };
const rgb = Buffer.from("rgb").toString("base64");
const depth = Buffer.from("depth").toString("base64");

beforeEach(() => __resetStructureFunding());
afterEach(() => { vi.unstubAllGlobals(); });

describe("model ids — one place", () => {
  it("Replicate FLUX depth/canny + Stability structure endpoint", () => {
    expect(STRUCTURE_ENGINES["replicate-depth"].model).toBe("black-forest-labs/flux-depth-dev");
    expect(STRUCTURE_ENGINES["replicate-canny"].model).toBe("black-forest-labs/flux-canny-dev");
    expect(STRUCTURE_ENGINES["stability-structure"].model).toMatch(/\/v2beta\/stable-image\/control\/structure$/);
  });
});

describe("isStructureEngineFunded", () => {
  it("no key → false; key → true (replicate has no balance API)", async () => {
    expect(await isStructureEngineFunded("replicate-depth", {})).toBe(false);
    expect(await isStructureEngineFunded("replicate-depth", { REPLICATE_API_TOKEN: "r8" })).toBe(true);
  });
  it("kill switches: global, per id, list", async () => {
    const env = { REPLICATE_API_TOKEN: "r8" };
    expect(await isStructureEngineFunded("replicate-depth", { ...env, STRUCTURE_CONTROL_DISABLED: "1" })).toBe(false);
    expect(await isStructureEngineFunded("replicate-depth", { ...env, ENGINE_REPLICATE_DEPTH_DISABLED: "true" })).toBe(false);
    expect(await isStructureEngineFunded("replicate-canny", { ...env, AI_ENGINES_DISABLED: "replicate-canny" })).toBe(false);
    expect(await isStructureEngineFunded("replicate-depth", { ...env, AI_ENGINES_DISABLED: "replicate-canny" })).toBe(true);
  });
  it("402 parks the provider for UNFUNDED_TTL_MS, then retries", async () => {
    const env = { REPLICATE_API_TOKEN: "r8" };
    markUnfunded("replicate", 1000);
    expect(await isStructureEngineFunded("replicate-canny", env, 1001)).toBe(false);
    expect(await isStructureEngineFunded("replicate-canny", env, 1000 + UNFUNDED_TTL_MS + 1)).toBe(true);
  });
  it("Stability: balance ≥ 5 credits funded, below not, 401 not; result cached", async () => {
    const env = { STABILITY_API_KEY: "sk" };
    const f = vi.fn(async () => new Response(JSON.stringify({ credits: 25 }), { status: 200 }));
    vi.stubGlobal("fetch", f);
    expect(await isStructureEngineFunded("stability-structure", env, 0)).toBe(true);
    expect(await isStructureEngineFunded("stability-structure", env, 1000)).toBe(true);
    expect(f).toHaveBeenCalledTimes(1);

    __resetStructureFunding();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ credits: 0 }), { status: 200 })));
    expect(await isStructureEngineFunded("stability-structure", env, 0)).toBe(false);

    __resetStructureFunding();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 401 })));
    expect(await isStructureEngineFunded("stability-structure", env, 0)).toBe(false);
  });
});

describe("control input", () => {
  it("matching client map wins, else RGB; data-URI prefix stripped", () => {
    const r = { baseImage: `data:image/jpeg;base64,${rgb}`, controlImage: `data:image/png;base64,${depth}`, controlType: "depth" as const };
    expect(pickControlInput("depth", r)).toBe(depth);
    expect(pickControlInput("canny", r)).toBe(rgb);
    expect(pickControlInput(undefined, r)).toBe(rgb);
    expect(pickControlInput("depth", {})).toBeUndefined();
  });
  it("Replicate body: prompt + control_image data URI + seed", () => {
    const b = replicateStructureBody("replicate-depth", { ...req, baseImage: rgb, controlImage: depth, controlType: "depth" });
    expect(b?.input).toMatchObject({ prompt: "house", control_image: `data:image/png;base64,${depth}`, seed: 42, output_format: "png" });
    expect(replicateStructureBody("replicate-canny", req)).toBeNull();
  });
});

describe("replicate-depth engine (fetch mocked)", () => {
  it("POSTs to the model endpoint and returns the image", async () => {
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test");
    const png = Buffer.alloc(2000, 7);
    const f = vi.fn(async (url: string) => String(url).startsWith("https://api.replicate.com/v1/models/")
      ? new Response(JSON.stringify({ status: "succeeded", output: ["https://out/x.png"] }), { status: 201 })
      : new Response(png, { status: 200, headers: { "content-type": "image/png" } }));
    vi.stubGlobal("fetch", f);
    const res = await replicateDepthEngine({ ...req, baseImage: rgb });
    expect(f.mock.calls[0][0]).toBe("https://api.replicate.com/v1/models/black-forest-labs/flux-depth-dev/predictions");
    expect(res).toMatchObject({ engine: "replicate-depth", costUsd: 0.025 });
    vi.unstubAllEnvs();
  });
  it("402 → null and Replicate parked", async () => {
    vi.stubEnv("REPLICATE_API_TOKEN", "r8_test");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Insufficient credit", { status: 402 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await replicateDepthEngine({ ...req, baseImage: rgb })).toBeNull();
    expect(await isStructureEngineFunded("replicate-canny", { REPLICATE_API_TOKEN: "r8_test" })).toBe(false);
    vi.unstubAllEnvs();
  });
});

describe("AI Horde ControlNet with a client map", () => {
  it("client depth map → source_image = map, image_is_control", () => {
    const i = hordeImg2imgInput({ baseImage: rgb, controlImage: `data:image/png;base64,${depth}`, controlType: "depth" }, {});
    expect(i).toEqual({ source: depth, control: "depth", imageIsControl: true });
    expect(hordeImg2imgParams(i!.control, i!.imageIsControl)).toMatchObject({ control_type: "depth", image_is_control: true });
  });
  it("canny map sets control_type canny; no map → RGB + Horde's own estimator", () => {
    expect(hordeImg2imgInput({ baseImage: rgb, controlImage: depth, controlType: "canny" }, {})?.control).toBe("canny");
    expect(hordeImg2imgInput({ baseImage: rgb }, {})).toEqual({ source: rgb, control: "depth", imageIsControl: false });
  });
  it("ControlNet off or img2img off → map ignored", () => {
    expect(hordeImg2imgInput({ baseImage: rgb, controlImage: depth }, { AIHORDE_CONTROL_TYPE: "none" })).toEqual({ source: rgb, control: null, imageIsControl: false });
    expect(hordeImg2imgInput({ baseImage: rgb, controlImage: depth }, { AIHORDE_IMG2IMG_DISABLED: "1" })).toBeNull();
  });
});
