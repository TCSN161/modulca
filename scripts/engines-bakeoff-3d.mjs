#!/usr/bin/env node
/**
 * engines-bakeoff-3d.mjs — 3D-capture → photoreal render bake-off (Chat 3, 3.06).
 *
 * Runs structure-preserving (img2img / control) candidates on the reference
 * 3D captures in docs/research/render-bakeoff-2026-11/inputs/ with ONE shared
 * style prompt, writes outputs to …/out/<engine>-<room>.<ext> and appends
 * latency/status rows to …/out/results.jsonl.
 *
 * Usage:
 *   node --env-file=.env.local scripts/engines-bakeoff-3d.mjs <engine> [room…]
 *   engines: cf-klein-4b cf-klein-9b cf-flux2-dev horde-img2img horde-canny
 *            horde-depth gemini-edit hf-kontext openai-edit pollinations-kontext
 *   rooms:   kitchen living bedroom (default: all three) · house · house-clientprompt
 *
 * Spend: only openai-edit costs money (gpt-image-1-mini, low ≈ $0.005–0.01/img).
 * CF engines draw on the shared free 10k neurons/day (klein-4b ≈ 126/img,
 * klein-9b ≈ 1.2k/img, dev ≈ 2k+/img) — run the expensive ones on ONE room.
 * Never calls Stability (no credit) or any engine through the prod chain.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("docs/research/render-bakeoff-2026-11");
const IN = path.join(ROOT, "inputs");
const OUT = path.join(ROOT, "out");
fs.mkdirSync(OUT, { recursive: true });

const ROOM_DESC = {
  kitchen: "a galley kitchen with two parallel counters, a sink, a tall fridge, a window and a doorway",
  living: "a living room with an L-shaped sofa, a coffee table, a TV unit, a large window and a doorway",
  bedroom: "a bedroom with a double bed, two nightstands, a wardrobe, a window and a doorway",
};
/** Overview input (Costin's prod case, 2026-11-26): whole-house axonometric. Two prompts on the SAME image. */
const HOUSE_PROMPT =
  "Turn this 3D cutaway axonometric of a small modular house (four 3x3 m modules, open plan: sleeping area with a double bed, " +
  "a shower corner, a sofa, a kitchen counter; large windows, doorways) into a photorealistic architectural cutaway render, " +
  "seen from above at the same angle. Keep the exact camera, the outer walls cut at the same height, every window and door " +
  "opening and every furniture position.";
/** What the client sends today in single-module mode (RenderPage.tsx default prompt) — reproduces the prod failure. */
const CLIENT_PROMPT_BEDROOM =
  "Photorealistic interior render of a modern Bedroom, Industrial Modern design style, daylight lighting, Light Oak flooring, " +
  "Alabaster walls, 1 large window with natural light, 1 door, furnished with King Bed, Nightstand, Nightstand, Wardrobe, " +
  "professional architectural photography, interior design magazine, 8k, photorealistic, soft natural lighting";
const INPUT_FILE = { house: "house-axo.png", "house-clientprompt": "house-axo.png" };
export const STYLE =
  "Industrial Modern interior: polished concrete floor, blackened steel details, warm oak, aged leather, " +
  "Edison pendant lights, soft natural daylight, photorealistic architectural visualization, 35mm, high detail";
const prompt = (room) =>
  room === "house" ? `${HOUSE_PROMPT} ${STYLE}.` :
  room === "house-clientprompt" ? CLIENT_PROMPT_BEDROOM :
  `Turn this 3D cutaway model of ${ROOM_DESC[room]} into a photorealistic render. ` +
  `Keep the exact camera, room shape, wall cut, window and door openings and furniture positions. ${STYLE}.`;

const env = process.env;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inputName = (room) => INPUT_FILE[room] || `${room}-cutaway.png`;
const readInput = (room) => fs.readFileSync(path.join(IN, inputName(room)));
// Keep the input's aspect (PNG IHDR width/height at bytes 16–23).
const fit = (maxSide, mult, room) => {
  const b = readInput(room);
  const W = b.readUInt32BE(16), H = b.readUInt32BE(20);
  const s = maxSide / Math.max(W, H);
  return { w: Math.round((W * s) / mult) * mult, h: Math.round((H * s) / mult) * mult };
};
const RAW_BASE = "https://raw.githubusercontent.com/TCSN161/modulca/master/docs/research/render-bakeoff-2026-11/inputs";

async function cfFlux(model, room, maxSide, extra = {}, refMax = 0) {
  const { w, h } = fit(maxSide, 16, room);
  const form = new FormData();
  form.append("prompt", prompt(room));
  form.append("width", String(w));
  form.append("height", String(h));
  form.append("seed", "42");
  for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
  // refMax > 0: downscale the reference first (Radar: CF changelog says refs must be < 512²).
  const ref = refMax
    ? await (await import("sharp")).default(readInput(room)).resize(refMax, refMax, { fit: "inside" }).png().toBuffer()
    : readInput(room);
  form.append("input_image_0", new Blob([ref], { type: "image/png" }), "base.png");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`, {
    method: "POST", headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` }, body: form,
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return { buf: Buffer.from(j.result.image, "base64"), note: `${w}x${h}` };
}

async function horde(room, mode) {
  const { w, h } = fit(576, 64, room); // anon limit ≤ 576² px
  const params = { width: w, height: h, steps: mode === "img2img" ? 25 : 15, cfg_scale: 7, sampler_name: "k_euler_a", n: 1, seed: "42" };
  const body = {
    // Same word sanitising as prod aihorde.ts (+ "model"): Horde's filter false-positives otherwise.
    prompt: `${prompt(room).replace(/bedroom/gi, "sleeping quarters").replace(/bed/gi, "sleeping platform").replace(/3D cutaway model/gi, "3D cutaway visualization")} ### cartoon, lowpoly, clay, blurry, distorted`,
    params, nsfw: false, censor_nsfw: true, r2: true, shared: false,
    source_image: readInput(room).toString("base64"), source_processing: "img2img",
    models: ["Deliberate"],
  };
  if (mode === "img2img") params.denoising_strength = 0.6;
  else { params.control_type = mode; params.denoising_strength = 1.0; }
  const key = env.AIHORDE_API_KEY || "0000000000";
  const r = await fetch("https://aihorde.net/api/v2/generate/async", {
    method: "POST", headers: { apikey: key, "Content-Type": "application/json", "Client-Agent": "modulca-bakeoff:1.0:anon" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.id) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  for (let i = 0; i < 300; i++) { // Horde queue can be 15+ min at peak
    await sleep(5000);
    const s = await (await fetch(`https://aihorde.net/api/v2/generate/check/${j.id}`)).json();
    if (s.done) break;
    if (s.faulted || s.is_possible === false) throw new Error(`horde faulted/impossible ${JSON.stringify(s).slice(0, 160)}`);
  }
  const st = await (await fetch(`https://aihorde.net/api/v2/generate/status/${j.id}`)).json();
  const g = st.generations?.[0];
  if (!g?.img) throw new Error(`no image ${JSON.stringify(st).slice(0, 200)}`);
  if (g.censored) throw new Error(`censored placeholder (Horde filter false positive) worker=${g.worker_name}`);
  const img = g.img.startsWith("http") ? Buffer.from(await (await fetch(g.img)).arrayBuffer()) : Buffer.from(g.img, "base64");
  return { buf: img, ext: "webp", note: `${w}x${h} ${g.model} worker=${g.worker_name}` };
}

async function geminiEdit(room) {
  const model = "gemini-2.5-flash-image";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST", headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt(room) }, { inline_data: { mime_type: "image/png", data: readInput(room).toString("base64") } }] }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const d = part?.inlineData || part?.inline_data;
  if (!d) throw new Error("no image part");
  return { buf: Buffer.from(d.data, "base64") };
}

async function hfKontext(room) {
  const r = await fetch("https://router.huggingface.co/fal-ai/fal-ai/flux-kontext/dev", {
    method: "POST", headers: { Authorization: `Bearer ${env.HUGGINGFACE_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt(room), image_url: `data:image/png;base64,${readInput(room).toString("base64")}`, seed: 42 }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 200)}`);
  const j = JSON.parse(t);
  const url = j.images?.[0]?.url;
  if (!url) throw new Error(`no image ${t.slice(0, 160)}`);
  return { buf: Buffer.from(await (await fetch(url)).arrayBuffer()) };
}

async function openaiEdit(room) {
  const form = new FormData();
  form.append("model", "gpt-image-1-mini");
  form.append("prompt", prompt(room));
  form.append("size", "1024x1024");
  form.append("quality", "low");
  form.append("image", new Blob([readInput(room)], { type: "image/png" }), "base.png");
  const r = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: form });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  return { buf: Buffer.from(j.data[0].b64_json, "base64"), note: `usage=${JSON.stringify(j.usage || {})}` };
}

async function pollinationsKontext(room) {
  const q = new URLSearchParams({ model: "kontext", image: `${RAW_BASE}/${inputName(room)}`, width: "1024", height: "896", seed: "42", nologo: "true" });
  const headers = env.POLLINATIONS_API_KEY ? { Authorization: `Bearer ${env.POLLINATIONS_API_KEY}` } : {};
  const r = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt(room))}?${q}`, { headers });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  return { buf: Buffer.from(await r.arrayBuffer()) };
}

/** HF Space (ZeroGPU, anonymous) via the Gradio HTTP API — quality reference only, not a prod API. */
async function gradioSpace(host, fn, buildData, room) {
  const up = new FormData();
  up.append("files", new Blob([readInput(room)], { type: "image/png" }), `${room}.png`);
  const auth = env.HUGGINGFACE_API_TOKEN ? { Authorization: `Bearer ${env.HUGGINGFACE_API_TOKEN}` } : {};
  const ur = await fetch(`https://${host}/gradio_api/upload`, { method: "POST", body: up, headers: auth });
  const [p] = await ur.json();
  if (!p) throw new Error(`upload ${ur.status}`);
  const file = { path: p, orig_name: `${room}.png`, mime_type: "image/png", meta: { _type: "gradio.FileData" } };
  const headers = { "Content-Type": "application/json", ...(env.HUGGINGFACE_API_TOKEN ? { Authorization: `Bearer ${env.HUGGINGFACE_API_TOKEN}` } : {}) };
  const r = await fetch(`https://${host}/gradio_api/call/${fn}`, { method: "POST", headers, body: JSON.stringify({ data: buildData(file, prompt(room)) }) });
  const j = await r.json();
  if (!j.event_id) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  const sse = await (await fetch(`https://${host}/gradio_api/call/${fn}/${j.event_id}`, { headers: auth })).text();
  const m = /event: complete\ndata: (.*)/.exec(sse);
  if (!m) throw new Error(`space: ${sse.slice(-250)}`);
  const out = JSON.parse(m[1]);
  const img = (Array.isArray(out[0]) ? out[0][0]?.image ?? out[0][0] : out[0]);
  const url = img?.url || img?.image?.url;
  if (!url) throw new Error(`no url ${m[1].slice(0, 200)}`);
  return { buf: Buffer.from(await (await fetch(url)).arrayBuffer()) };
}

/** Leonardo (prepaid API tokens): upload init image, then SDXL + Depth ControlNet. */
async function leonardo(room, preprocessorId = 20) {
  const H = { Authorization: `Bearer ${env.LEONARDO_API_KEY}`, "Content-Type": "application/json", accept: "application/json" };
  const base = "https://cloud.leonardo.ai/api/rest/v1";
  const ir = await (await fetch(`${base}/init-image`, { method: "POST", headers: H, body: JSON.stringify({ extension: "png" }) })).json();
  const u = ir.uploadInitImage;
  if (!u) throw new Error(`init-image ${JSON.stringify(ir).slice(0, 200)}`);
  const form = new FormData();
  for (const [k, v] of Object.entries(JSON.parse(u.fields))) form.append(k, v);
  form.append("file", new Blob([readInput(room)], { type: "image/png" }), "base.png");
  const s3 = await fetch(u.url, { method: "POST", body: form });
  if (!s3.ok) throw new Error(`s3 ${s3.status}`);
  const { w, h } = fit(1024, 8, room);
  const gr = await (await fetch(`${base}/generations`, {
    method: "POST", headers: H, body: JSON.stringify({
      prompt: prompt(room).slice(0, 1400), modelId: "5c232a9e-9061-4777-980a-ddc8e65647c6", // Leonardo Vision XL
      width: w, height: h, num_images: 1, alchemy: false, seed: 42,
      controlnets: [{ initImageId: u.id, initImageType: "UPLOADED", preprocessorId, weight: 0.8, strengthType: "High" }],
    }),
  })).json();
  const gid = gr.sdGenerationJob?.generationId;
  if (!gid) throw new Error(`gen ${JSON.stringify(gr).slice(0, 250)}`);
  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const g = (await (await fetch(`${base}/generations/${gid}`, { headers: H })).json()).generations_by_pk;
    if (g?.status === "COMPLETE") {
      const url = g.generated_images?.[0]?.url;
      return { buf: Buffer.from(await (await fetch(url)).arrayBuffer()), note: `${w}x${h} tokens=${gr.sdGenerationJob?.apiCreditCost ?? "?"}` };
    }
    if (g?.status === "FAILED") throw new Error("leonardo FAILED");
  }
  throw new Error("leonardo timeout");
}

const ENGINES = {
  "leonardo-depth": (room) => leonardo(room, 20),
  "leonardo-edge": (room) => leonardo(room, 19),
  "hfspace-kontext": (room) => gradioSpace("black-forest-labs-flux-1-kontext-dev.hf.space", "infer",
    (f, p) => [f, p, 42, false, 2.5, 28], room),
  "hfspace-qwen-edit": (room) => gradioSpace("qwen-qwen-image-edit.hf.space", "infer",
    (f, p) => [f, p, 42, false, 4, 30, false], room),
  "cf-klein-4b": (room) => cfFlux("@cf/black-forest-labs/flux-2-klein-4b", room, 1024),
  "cf-klein-4b-ref512": (room) => cfFlux("@cf/black-forest-labs/flux-2-klein-4b", room, 1024, {}, 504),
  "cf-klein-9b": (room) => cfFlux("@cf/black-forest-labs/flux-2-klein-9b", room, 768),
  "cf-flux2-dev": (room) => cfFlux("@cf/black-forest-labs/flux-2-dev", room, 768, { steps: 20 }),
  "horde-img2img": (room) => horde(room, "img2img"),
  "horde-canny": (room) => horde(room, "canny"),
  "horde-depth": (room) => horde(room, "depth"),
  "gemini-edit": geminiEdit,
  "hf-kontext": hfKontext,
  "openai-edit": openaiEdit,
  "pollinations-kontext": pollinationsKontext,
};

const [engine, ...rooms] = process.argv.slice(2);
if (!ENGINES[engine]) { console.error(`engine? ${Object.keys(ENGINES).join(" ")}`); process.exit(1); }
const list = rooms.length ? rooms : ["kitchen", "living", "bedroom"];
// Append-only JSONL so parallel runs never overwrite each other.
const resultsPath = path.join(OUT, "results.jsonl");

for (const room of list) {
  const t0 = Date.now();
  const row = { engine, room, at: new Date().toISOString() };
  try {
    const { buf, ext, note } = await ENGINES[engine](room);
    const e = ext || (buf[0] === 0x89 ? "png" : buf[0] === 0x52 ? "webp" : "jpg");
    const file = `${engine}-${room}.${e}`;
    fs.writeFileSync(path.join(OUT, file), buf);
    Object.assign(row, { ok: true, file, ms: Date.now() - t0, bytes: buf.length, note });
  } catch (err) {
    Object.assign(row, { ok: false, ms: Date.now() - t0, error: String(err.message || err).slice(0, 300) });
  }
  console.log(JSON.stringify(row));
  fs.appendFileSync(resultsPath, JSON.stringify(row) + "\n");
}
