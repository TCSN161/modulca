# MCA-DOC-AI-ENGINES-3D-BAKEOFF-2026-11

**Session**: `3.06.Engines_3D-Render-Bakeoff_20261126` (Chat 3 Engines) · 2026-11-26 → 27
**Contact sheet (side by side, click for full size)**: [`docs/research/render-bakeoff-2026-11/index.html`](research/render-bakeoff-2026-11/index.html)
**Raw rows**: `docs/research/render-bakeoff-2026-11/out/results.jsonl` · **Re-run**: `node --env-file=.env.local scripts/engines-bakeoff-3d.mjs <engine> [room…]` then `node scripts/engines-bakeoff-sheet.mjs`
**Related**: [[MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26]] · [Radar sweep](radar/2026-11-26-render-3d-engines.md)

---

## 0. Verdict (RO, pentru Costin)

- **Motor implicit pentru „3D + Text → Image": `cloudflare-klein` (FLUX.2 klein 4B), gratuit, 4–5 s.** Pe axonometria casei, cu un prompt care descrie vederea, păstrează unghiul, pereții tăiați, toate ferestrele și ușile și poziția mobilierului (5/5). Pe camere păstrează planul, dar „închide" cutaway-ul într-o vedere de cameră (4/5). Calitate foto 4,5/5.
- **Ce a stricat randarea ta din prod NU e motorul, e promptul.** Cu aceeași axonometrie și promptul pe care îl trimite azi clientul („Photorealistic interior render of a modern Bedroom…"), klein și OpenAI scot un dormitor generic, la nivelul ochilor. Fix = Chat 5 (§4).
- **Rezervă 1: AI Horde + ControlNet depth** (gratuit; păstrează exact camera cutaway; calitate SD-1.5, 576 px; coadă 9–15 min seara). Acum e implicit în `aihorde.ts`.
- **Rezervă 2 (deja plătit, fără cheltuieli noi): Leonardo + Depth ControlNet.** 12 tokeni/randare; cei 2.917 tokeni rămași ajung pentru ≈ 240 de randări. Geometrie 3,5/5, calitate 2,5/5 (text fals). Încă nu e legat (decizia ta).
- **€10 Stability: NU acum.** klein e gratuit și pe capturile noastre reale păstrează geometria la calitate foto. Nu am avut acces la PDF #8 (nici la `render_logs`), deci comparația directă cu stability-structure o faci tu, din contact sheet lângă PDF #8. Păstrează cele ~25 de credite (≈ 4–5 randări) pentru demo-uri. Reconsideră doar dacă, pus lângă PDF #8, klein ți se pare clar mai slab la imaginile de prezentare.
- **Cheltuieli: ≈ $0,03 bani noi** (4 editări OpenAI la ≈ $0,006) **+ 60 de tokeni Leonardo prepay** (≈ $0,15 din sold). Total sub plafonul de $0,30.

---

## 1. Inputs (real app captures, public demo project)

| Input | Source | Size |
|---|---|---|
| `kitchen-cutaway.png` | `/project/demo/visualize`, Galley preset, orbit to the open corner | 1260×1100 |
| `living-cutaway.png` | same, Lounge preset | 1260×1100 |
| `bedroom-cutaway.png` | same, Rest preset, default camera | 1260×1100 |
| `house-axo.png` | `/project/demo/render`, **All Modules** (4 modules, open plan): Costin's prod case | 1000×562 |
| `renderstep-kitchen-interior.png` | `/project/demo/render`, single module, "Interior" camera: evidence of camera bug B1 | 1000×562 |

Same style prompt everywhere (Industrial Modern: polished concrete, blackened steel, oak, leather, Edison pendants, daylight). Room prompts describe the view and ask to keep camera, cut, openings and furniture; see `scripts/engines-bakeoff-3d.mjs`. `house-clientprompt` = the same axonometric + the exact single-module prompt `RenderPage.tsx` builds today.

## 2. Score table

Geometry fidelity = walls / openings / room shape / furniture positions / camera vs the input (1–5). Image quality = realism + style (1–5). Scored by Chat 3 from the outputs; **Costin judges the final call from the contact sheet.**

| Engine | Geometry (rooms) | Geometry (house axo, view prompt) | Quality | Latency | Free limit / day | Cost | Commercial use | Notes |
|---|---|---|---|---|---|---|---|---|
| **CF FLUX.2 klein 4B, 1024 ref** (`cloudflare-klein`, in prod) | **4**: layout, openings and odd furniture placements kept; cutaway closed into a room view | **5**: exact angle, cut walls, every window/door, furniture | **4.5** | **3.9–5.2 s** | shared 10k neurons ≈ 80 @1024 (≈ 158 with `CF_KLEIN_MAX_SIDE=768`) | $0 (then ≈ $0.0014 on Workers Paid) | weights Apache-2.0 (CF links BFL terms) | **Default.** 10/10 calls OK |
| CF klein 4B, ref downscaled to 504 px | 3.5: shell kept, furniture partly reinvented (stools, cabinets) | 3: shell/camera kept, bedroom became a living room | 4.5 | 3.4–5.7 s | slightly more/day (input tiles 1 vs 4) | $0 | same | Radar's "< 512² input" note is **not** needed: 1024 refs work and keep more detail. **Keep 1024** |
| AI Horde SD1.5 + ControlNet **depth** | **4.5**: exact cutaway camera, walls, window | (running at write time, see sheet) | 2.5 (576 px, SD-1.5) | **9–15 min** (evening queue; 11 s on 26 Nov morning) | unlimited (kudos queue) | $0 | outputs ours; volunteer workers, no SLA | Now **default** for Horde img2img. 3/3 OK |
| AI Horde + ControlNet canny | 4.5 | – | 2.5 | 9 min | same | $0 | same | 1/3 OK (1 censored, 1 lost job) |
| AI Horde plain img2img (old prod setting) | – | – | – | 4–14 min | same | $0 | same | **0/6 usable**: every output was the black "CENSORED" placeholder, or the job was lost |
| Qwen-Image-Edit (HF Space ZeroGPU) | 4: cutaway kept, fridge moved | not run (quota) | 4 | 52 s | ≈ 1/day (ZeroGPU) | $0 (Space only) | Apache-2.0 | Best "edit" model, but no free API for prod |
| Leonardo Vision XL + **Depth** ControlNet | 3.5: volume kept, a window moved | 3: box kept, warped | 2.5 (fake text, weak style) | 12–31 s | – | **12 API tokens/img** from prepaid (2,917 left ≈ 240 renders) | paid API: OK | Already funded → paid fallback candidate, **no new spend** |
| FLUX.1 Kontext dev (HF Space) | 2: re-staged at eye level (elements kept, camera not) | 3: angle kept, walls became railings | 4.5 | 30–35 s | few/day | – | **non-commercial weights ❌** | Reference only |
| OpenAI gpt-image-1-mini edit (low) | 2: re-staged at eye level | – | 4 | 7.5–10.4 s | – | ≈ $0.006/img (paid) | ✅ | Ignores the camera |
| Gemini 2.5 Flash Image edit | – | – | – | – | **0** (429, `limit: 0`) | – | – | needs billing |
| HF Inference Providers (fal Kontext) | – | – | – | – | $0.10/mo used up (402) | – | – | resets Dec 1 |
| Pollinations `kontext` | – | – | – | – | needs API key (403 "not part of the Classic API") | – | – | Costin action B (key) |
| Stability Structure (**reference, not run**) | Costin's PDF #8 | – | PDF #8 | 52 s (Apr log) | 25 signup credits ≈ 4–5 renders | 5–6.5 credits ≈ $0.05–0.065/img | API terms not read | No credit left; we did not call it |
| Replicate `flux-depth-dev` / `flux-canny-dev` (**paid, not run**) | – | – | – | – | none (our balance $0 → 402) | ≈ $0.025/img (Radar, secondary source) | outputs commercial per Replicate page | Needs Replicate billing + a control image (§5) |
| **Costin's prod case**: house axo + client "Bedroom" prompt | **1**: klein and OpenAI both return a generic eye-level bedroom. Kontext/Leonardo outputs on the sheet | – | 4.5 (pretty, but wrong) | 4.7 s (klein) | – | – | – | **Root cause = prompt, not engine** (§4) |

## 3. Recommendation (chains)

| Role | Engine | Why |
|---|---|---|
| **Default 3D + Text → Image** | `cloudflare-klein`, 1024 ref | free, 4–5 s, best geometry + quality we can run in prod today |
| **Fallback 1 (free)** | `ai-horde` img2img with **ControlNet depth** (now default, `AIHORDE_CONTROL_TYPE`) | free, keeps the exact camera; slow and low-res, so it is a safety net, not a demo engine |
| **Fallback 2 (prepaid, no new spend)** | Leonardo + Depth ControlNet (12 tokens) | keeps the volume; ≈ 240 renders on the existing balance. **Not wired**: needs Costin's OK (spends prepaid tokens) |
| Not recommended | OpenAI / Kontext edit models | re-stage the scene at eye level; geometry lost |

Chain after BUG-ST34 (commit 63b44d9): paid tiers `klein → stability/fal/replicate/wavespeed (funded only) → ai-horde → cloudflare → pollinations`; paid text2img only with `allowPaidText2img: true`. Free tiers: `klein → ai-horde → cloudflare → pollinations`.

**€10 Stability? No (for now).** Reasons: (1) klein is free and keeps the geometry at photo quality on our real captures (Chat 3 could not open PDF #8 or `render_logs`, so the direct comparison is Costin's); (2) the prod failure Costin saw was the prompt, which €10 would not fix; (3) 25 credits remain for 4–5 demo shots. Re-open only if Costin, looking at the sheet next to PDF #8, rates klein clearly worse for hero images.

## 4. For Chat 5 (client): two render modes + input size

Checked in `useRenderEngine.ts` / `RenderPage.tsx` (read only):

1. **Size**: the client sends `toJpegDataUrl(raw, 1024, 0.85)`, i.e. a JPEG with long side ≤ 1024. **Keep it.** The 504-px test lost furniture detail; CF accepted 1024 refs without error. No resize change needed.
2. **Prompt must describe the view, per mode:**
   - **Overview / All Modules** (axonometric): `"Turn this 3D cutaway axonometric of a modular house (N modules: <labels>, …) into a photorealistic architectural cutaway render, seen from above at the same angle. Keep the exact camera, the outer walls cut at the same height, every window and door opening and every furniture position. <style>"`. Today in `viewMode === "all"`, `captureRef.current = null`, so **no 3D capture is sent at all**. Enable the capture for All Modules.
   - **Single room**: the prompt can name the room, but it must say *"Turn this 3D view of a <room> into a photoreal render; keep the exact camera, walls, openings and furniture positions"*, not only "interior render of a modern Bedroom". The 3D view must also be an interior or cutaway view **of that module**.
3. **Bugs seen while capturing** (Chat 5 owns these files):
   - **B1**: `RenderScene3D.tsx`: the camera buttons (interior / corner / detail) do not move the camera after mount (R3F `camera` prop is read once). And "interior" `[2.8, 1.6, 2.8]` sits **outside** the 3×3 m module with `minDistance=2` on OrbitControls, so the Render-step capture is always a closed box from outside (`inputs/renderstep-kitchen-interior.png`). Fix: set the camera via `useThree().camera.position.set(...)` + `controls.update()` on change, and use an in-room position (e.g. `[0.9, 1.5, 0.9]` looking at the far corner, `minDistance` ≈ 0.5) or the Visualize cutaway camera.
   - **B2**: the Kitchen "L-shape" preset places counters, fridge and table overlapping in the middle of the module (Galley is fine).
   - **B3**: the combined view (All Modules) draws no interior partition walls. That may be intended (open plan), but the 4 modules read as one room.

## 5. Real structure control: exact depth / normal pass from Three.js

We own the geometry, so we can send a **perfect** control image instead of letting a model estimate depth from a shaded render:

```ts
// inside the R3F capture helper (Chat 5 file): ~15 lines, no new dependency
const { gl, scene, camera } = useThree();
function captureDepth(): string {
  const prev = scene.overrideMaterial, prevBg = scene.background;
  scene.overrideMaterial = new THREE.MeshDepthMaterial();   // or MeshNormalMaterial for a normal pass
  scene.background = new THREE.Color("#000");
  gl.render(scene, camera);                                  // tighten camera.near/far to the house bounds first
  const url = gl.domElement.toDataURL("image/png");
  scene.overrideMaterial = prev; scene.background = prevBg; gl.render(scene, camera);
  return url;
}
```

Who can use it:
- **AI Horde** (free): send it as `source_image` with `control_type: "depth"` and `image_is_control: true` (Horde API flag that skips its own estimator; not tested here).
- **Replicate `flux-depth-dev`** (paid ≈ $0.025): input `control_image` (URL or data URI) + `prompt` (+ `guidance`, `num_inference_steps`). Needs Replicate billing on our account (balance $0 today) and a new engine branch in `replicate.ts` with a model-ID constant + `ENGINE_REPLICATE_DISABLED` kill switch. `flux-canny-dev` takes the same shape with an edge image. **Paid: Costin decides.**
- **Leonardo** (prepaid tokens): the same depth image as a ControlNet init image.
- **klein** has no structure parameter. The RGB capture is still its best input.

## 6. Code changes this session

| Commit | Change |
|---|---|
| c5471e6 | Bake-off reference captures |
| 63b44d9 | **BUG-ST34**: img2img never falls to paid text2img; POST `body.engine` tried first. Tests fail on the old chain |
| fd215cb | `ai-horde` returns null on Horde's `censored: true` placeholder (was shipped as a render) |
| (this commit) | `ai-horde` img2img uses **ControlNet depth** by default (`AIHORDE_CONTROL_TYPE=depth\|canny\|none`, 15 steps); **prompt fix**: quality words were after `###`, i.e. in Horde's *negative* prompt; `model` added to the filter-word sanitiser. Bake-off scripts + contact sheet |

Kill switches unchanged: `AI_ENGINES_DISABLED`, `ENGINE_<ID>_DISABLED`, `AIHORDE_IMG2IMG_DISABLED`, `CF_KLEIN_MAX_SIDE`; new `AIHORDE_CONTROL_TYPE=none` restores the old Horde img2img.

## 7. Observations

- Leonardo's API balance fell from 3,114 to 2,941 tokens on 26 Nov **before** this session's first Leonardo call (≈ 160 tokens spent elsewhere, probably the BUG-ST34 fallback Costin saw). After the fix, img2img can no longer reach Leonardo.
- The CF pool was empty on the evening of 26 Nov (429 at 20:22 UTC). The 10 klein runs on 27 Nov used ≈ 1.2k neurons.
- Horde's CSAM filter false-positives on room prompts. Words that trip it: "bedroom", "bed", "model". Prod now sanitises all three and rejects censored outputs.
