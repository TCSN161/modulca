/**
 * 5.03-A automatic Image → Image: prompt builder, camera presets + FOV,
 * resize, depth normalisation, request shape.
 */
import { describe, it, expect } from "vitest";
import { buildViewPrompt, summarizeModules, viewSentence } from "./viewPrompt";
import {
  computeCameraPose, focalToVerticalFov, gridBounds, lookTarget, PRESET_FOCAL_MM, EYE_HEIGHT,
} from "./cameraPresets";
import { fitWithin } from "./renderImage";
import { depthRange, depthToGray } from "./depthCapture";
import { buildImg2ImgBody, sanitizePrompt } from "./renderRequest";

const base = { styleName: "Scandinavian", lighting: "daylight" };

describe("viewPrompt (bake-off §4.2)", () => {
  it("summarises repeated modules", () => {
    expect(summarizeModules(["Bedroom", "Kitchen", "Bedroom"])).toBe("2 Bedroom, Kitchen");
  });

  it("overview of the house: cutaway axonometric, N modules, keeps camera and cut walls", () => {
    const p = buildViewPrompt({ ...base, view: "overview", moduleLabels: ["Living", "Kitchen", "Bedroom", "Bathroom"] });
    expect(p.startsWith("Turn this 3D cutaway axonometric of a modular house (4 modules: Living, Kitchen, Bedroom, Bathroom)")).toBe(true);
    expect(p).toContain("seen from above at the same angle");
    expect(p).toContain("outer walls cut at the same height");
    expect(p).toContain("Scandinavian design style");
    expect(p).not.toMatch(/interior render of a modern/);
  });

  it("interior: names the room, keeps camera, walls, openings, furniture; adds finishes", () => {
    const p = buildViewPrompt({ ...base, view: "interior", moduleLabels: ["Kitchen"], roomLabel: "Kitchen", finishes: ["Oak flooring"] });
    expect(p).toMatch(/^Turn this 3D view of a kitchen into a photoreal interior render; keep the exact camera, walls, openings and furniture positions\./);
    expect(p).toContain("Oak flooring");
  });

  it("exterior and upload have their own sentence; style goes last", () => {
    expect(viewSentence({ ...base, view: "exterior", moduleLabels: ["A", "B"] })).toContain("eye-level exterior view of a modular house (2 modules");
    const up = buildViewPrompt({ ...base, view: "upload", moduleLabels: [], templateSuffix: "magazine" });
    expect(up.startsWith("Turn this image into a photorealistic architectural render")).toBe(true);
    expect(up.endsWith("magazine")).toBe(true);
  });

  it("single-module overview does not claim a multi-module house", () => {
    expect(viewSentence({ ...base, view: "overview", moduleLabels: ["Bedroom"], roomLabel: "Bedroom" })).toContain("of a bedroom module");
  });
});

describe("camera presets + field of view", () => {
  const house = gridBounds([{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }], 3);

  it("grid bounds follow row/col × 3 m", () => {
    expect(house).toEqual({ minX: 0, maxX: 6, minZ: 0, maxZ: 6 });
  });

  it("interior stands INSIDE the chosen module at eye height and looks around in place", () => {
    const room = gridBounds([{ row: 1, col: 0 }], 3);
    const pose = computeCameraPose("interior", house, room);
    const [x, y, z] = pose.position;
    expect(y).toBe(EYE_HEIGHT);
    expect(x).toBeGreaterThan(room.minX + 0.3);
    expect(x).toBeLessThan(room.maxX - 0.3);
    expect(z).toBeGreaterThan(room.minZ + 0.3);
    expect(z).toBeLessThan(room.maxZ - 0.3);
    expect(pose.firstPerson).toBe(true);
    // target just in front of the eye, pointing into the room
    const d = Math.hypot(pose.target[0] - x, pose.target[1] - y, pose.target[2] - z);
    expect(d).toBeCloseTo(0.05, 5);
    expect(pose.target[0]).toBeLessThan(x);
  });

  it("overview is above the house, exterior at eye level outside it", () => {
    const o = computeCameraPose("overview", house);
    expect(o.position[1]).toBeGreaterThan(3);
    expect(o.firstPerson).toBe(false);
    const e = computeCameraPose("exterior", house);
    expect(e.position[1]).toBe(EYE_HEIGHT);
    expect(e.position[0]).toBeGreaterThan(house.maxX);
  });

  it("focal length → vertical FOV: 50 mm ≈ 27°, 24 mm ≈ 53°, 16 mm ≈ 74°, clamped", () => {
    expect(focalToVerticalFov(50)).toBeCloseTo(27, 0);
    expect(focalToVerticalFov(24)).toBeCloseTo(53.1, 0);
    expect(focalToVerticalFov(16)).toBeCloseTo(73.7, 0);
    expect(focalToVerticalFov(8)).toBe(focalToVerticalFov(16));
    expect(PRESET_FOCAL_MM.interior).toBeLessThanOrEqual(24);
  });

  it("lookTarget is a unit step of the given length", () => {
    expect(lookTarget([0, 0, 0], [10, 0, 0], 0.5)).toEqual([0.5, 0, 0]);
  });
});

describe("resize to the engine limit (keep ≤ 1024, bake-off §4.1)", () => {
  it("fits the long side, keeps aspect, never upscales", () => {
    expect(fitWithin(1600, 900, 1024)).toEqual({ width: 1024, height: 576 });
    expect(fitWithin(900, 1600, 1024)).toEqual({ width: 576, height: 1024 });
    expect(fitWithin(800, 450, 1024)).toEqual({ width: 800, height: 450 });
    expect(fitWithin(0, 0, 1024)).toEqual({ width: 1, height: 1 });
  });

  it("RGB and depth from the same canvas get the same size", () => {
    expect(fitWithin(1531, 861, 1024)).toEqual(fitWithin(1531, 861, 1024));
  });
});

describe("depth map normalisation (white = near, black = far)", () => {
  it("near/far wrap the house bounding sphere", () => {
    expect(depthRange([10, 0, 0], [0, 0, 0], 4)).toEqual({ near: 6, far: 14 });
    // camera inside the sphere: near clamps to 5 cm
    expect(depthRange([0, 1.6, 0], [0, 1.35, 0], 2.6).near).toBe(0.05);
  });

  it("linear grey: near 255, far 0, clamped outside", () => {
    expect(depthToGray(6, 6, 14)).toBe(255);
    expect(depthToGray(14, 6, 14)).toBe(0);
    expect(depthToGray(10, 6, 14)).toBe(128);
    expect(depthToGray(1, 6, 14)).toBe(255);
    expect(depthToGray(99, 6, 14)).toBe(0);
  });
});

describe("request shape (3.07 contract §8.2)", () => {
  const common = { prompt: "p", width: 1024, height: 576, seed: "1", baseImage: "data:image/jpeg;base64,A", maxCostUsd: 0.05 };

  it("auto → engine null; depth map → controlImage + controlType depth", () => {
    expect(buildImg2ImgBody({ ...common, engine: "auto", controlImage: "data:image/png;base64,D" })).toEqual({
      ...common, engine: null, controlImage: "data:image/png;base64,D", controlType: "depth",
    });
  });

  it("explicit engine kept; no control fields without a map", () => {
    const b = buildImg2ImgBody({ ...common, engine: "replicate-depth", controlImage: null });
    expect(b.engine).toBe("replicate-depth");
    expect(b).not.toHaveProperty("controlImage");
    expect(b).not.toHaveProperty("controlType");
  });

  it("img2img prompt keeps the view sentence first; text2img keeps its prefix", () => {
    const long = "Turn this 3D cutaway axonometric of a modular house; keep the exact camera. " + "x ".repeat(400);
    const img = sanitizePrompt(long, true);
    expect(img.startsWith("Turn this 3D cutaway")).toBe(true);
    expect(sanitizePrompt("a house (4 modules: Living, Kitchen)", true)).toBe("a house (4 modules: Living, Kitchen)");
    expect(img.length).toBeLessThanOrEqual(700);
    expect(sanitizePrompt("kitchen")).toMatch(/^architectural interior design visualization/);
  });
});
