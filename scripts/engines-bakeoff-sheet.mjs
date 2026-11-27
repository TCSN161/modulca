#!/usr/bin/env node
/**
 * engines-bakeoff-sheet.mjs — builds the side-by-side contact sheet
 * docs/research/render-bakeoff-2026-11/index.html from out/results.jsonl
 * (latest successful row per engine × room). No network.
 *   node scripts/engines-bakeoff-sheet.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("docs/research/render-bakeoff-2026-11");
const rows = fs.readFileSync(path.join(ROOT, "out/results.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const ROOMS = ["kitchen", "living", "bedroom", "house", "house-clientprompt"];
const INPUT = { house: "house-axo.png", "house-clientprompt": "house-axo.png" };
const ORDER = ["cf-klein-4b", "cf-klein-4b-ref512", "hfspace-qwen-edit", "leonardo-depth", "hfspace-kontext", "openai-edit",
  "horde-depth", "horde-canny", "horde-img2img", "gemini-edit", "hf-kontext", "pollinations-kontext"];
const LABEL = {
  "cf-klein-4b": "Cloudflare FLUX.2 klein 4B, 1024 ref (free, in prod)",
  "cf-klein-4b-ref512": "Cloudflare FLUX.2 klein 4B, ref downscaled to 504 px",
  "hfspace-qwen-edit": "Qwen-Image-Edit (HF Space ZeroGPU, reference only)",
  "leonardo-depth": "Leonardo Vision XL + Depth ControlNet (prepaid tokens)",
  "hfspace-kontext": "FLUX.1 Kontext dev (HF Space, non-commercial, reference only)",
  "openai-edit": "OpenAI gpt-image-1-mini edit, low (paid)",
  "horde-depth": "AI Horde SD1.5 + Depth ControlNet (free)",
  "horde-canny": "AI Horde SD1.5 + Canny ControlNet (free)",
  "horde-img2img": "AI Horde SD1.5 img2img 0.6 (free, in prod as last resort)",
  "gemini-edit": "Gemini 2.5 Flash Image edit",
  "hf-kontext": "HF Inference Providers (fal) Kontext",
  "pollinations-kontext": "Pollinations kontext",
};

const latest = new Map();
for (const r of rows) {
  const k = `${r.engine}|${r.room}`;
  const prev = latest.get(k);
  if (!prev || r.ok || !prev.ok) latest.set(k, r.ok ? r : prev?.ok ? prev : r);
}
const engines = [...new Set(rows.map((r) => r.engine))].sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cell = (r) => {
  if (!r) return `<td class="na">not run</td>`;
  if (!r.ok) return `<td class="na">✗ ${esc(r.error.slice(0, 90))}</td>`;
  return `<td><a href="out/${r.file}"><img src="out/${r.file}" loading="lazy"></a><small>${(r.ms / 1000).toFixed(1)} s</small></td>`;
};

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>ModulCA 3D→render bake-off 2026-11</title>
<style>body{font:14px system-ui;margin:16px;background:#faf9f6;color:#222}table{border-collapse:collapse;width:100%}
td,th{border:1px solid #ddd;padding:6px;vertical-align:top;text-align:left}th{background:#eee}img{width:100%;display:block}
td{width:18%}td.na{color:#999;font-size:12px}small{color:#666}th.e{width:10%}</style>
<h1>3D capture → photoreal render — bake-off (session 3.06, 2026-11-26)</h1>
<p>Same prompt for every engine (Industrial Modern, see <code>scripts/engines-bakeoff-3d.mjs</code>). Inputs are real captures of the public demo project, step 7 Visualize. Reference quality = Stability Structure renders in Costin's PDF #8 (not re-run: no credit). Click an image for full size.</p>
<table><tr><th class="e">Engine</th>${ROOMS.map((r) => `<th>${r}</th>`).join("")}</tr>
<tr><th class="e">INPUT (3D capture)</th>${ROOMS.map((r) => `<td><a href="inputs/${INPUT[r] || r + "-cutaway.png"}"><img src="inputs/${INPUT[r] || r + "-cutaway.png"}"></a></td>`).join("")}</tr>
${engines.map((e) => `<tr><th class="e">${esc(LABEL[e] || e)}</th>${ROOMS.map((r) => cell(latest.get(`${e}|${r}`))).join("")}</tr>`).join("\n")}
</table></html>`;
fs.writeFileSync(path.join(ROOT, "index.html"), html);
console.log(`wrote index.html (${engines.length} engines)`);
