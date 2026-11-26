# Render engines: our 3D view → photoreal, geometry kept (2026-11-26, for Chat 3 bake-off 3.06)

Prices in USD, ~1 MP (1024²) output; cap €0.04 ≈ $0.04 plus a little exchange margin. "Live" = tested by Chat 3 today ([readiness v2](../MCA-DOC-AI-ENGINES-BETA-READINESS-v2-2026-11-26.md)); everything else is from pages, **not run by Radar**.

## Top 5 to bake off

| # | Name / model | API | Free limit | Price | Image input + structure control | Commercial use | Link |
|---|---|---|---|---|---|---|---|
| 1 | Cloudflare FLUX.2 klein 4B (`@cf/black-forest-labs/flux-2-klein-4b`) | yes, wired | 10k neurons/day shared, ~79 edits at 1 MP in + out | ≈$0.0014 after free (Workers Paid) | up to 4 refs; **no** structure parameter; live: geometry kept | weights Apache-2.0; CF links BFL terms (API terms not read) | [model](https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/) |
| 2 | AI Horde + ControlNet (`control_type`: canny, depth, depth_anything_v2, normal, mlsd, lineart) | yes, wired for img2img only | free (kudos queue, no SLA) | €0 | `source_image` + real structure control; **control mode untested** (plain img2img was weak, live) | not verified (terms page did not render) | [swagger](https://aihorde.net/api/swagger.json) |
| 3 | Stability Control Structure (`/v2beta/stable-image/control/structure`) | yes | 25 signup credits; Chat 3 saw 25 on our account = **5 renders** | 5 credits = **$0.05** (slightly over cap) | image + `control_strength` 0–1 (default 0.7); output = input size; ≤ 9.4 MP, 10 MiB | API terms not read | [docs](https://docs.stability.ai/api-reference/control/structure.md) |
| 4 | fal FLUX.2 klein 4B edit (`fal-ai/flux-2/klein/4b/edit`); also `fal-ai/flux-2/edit` $0.012/MP | yes | none (our balance $0) | $0.01/MP (whether input MP is billed: not stated) | image URLs; no structure parameter | page tags commercial use | [model](https://fal.ai/models/fal-ai/flux-2/klein/4b/edit) |
| 5 | Replicate `black-forest-labs/flux-depth-dev` / `flux-canny-dev` | yes | none stated (our balance $0) | ≈$0.025 (secondary source; not on the official pages read) | **true depth / canny**; we can export an exact depth map from Three.js | page: images made on Replicate are usable commercially | [depth](https://replicate.com/black-forest-labs/flux-depth-dev) · [canny](https://replicate.com/black-forest-labs/flux-canny-dev) |

## Others

| Name | API | Free limit | Price | Image input + structure control | Commercial use | Link / verdict |
|---|---|---|---|---|---|---|
| Vercel AI Gateway, FLUX.2 klein 4B | yes | free credit exists, **amount not on the pricing page** (Chat 3 research: $5 / 30 days); image models in free subset unconfirmed | ~$0.014/MP (Chat 3 research) | up to 4 images; no structure | Apache-2.0 per model page | [pricing](https://vercel.com/docs/ai-gateway/pricing) · buying credits ends the free one |
| BFL direct, klein 4B / 9B edit | yes | none stated | ≈$0.015 / $0.017 with 1 MP ref | multi-ref; no structure | separate API terms not read | [pricing](https://bfl.ai/pricing) |
| Cloudflare FLUX.2 klein 9B | yes | same pool, ~7/day or fewer | ≈$0.017 | multi-ref; no structure | Chat 3: non-commercial weights; check hosted terms | [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) |
| Cloudflare FLUX.2 dev | yes | same pool, 3–5/day (live) | per step, total depends on steps | multi-ref; live: best realism, geometry kept | Chat 3: non-commercial weights; check hosted terms | [model](https://developers.cloudflare.com/workers-ai/models/flux-2-dev/) · quality reference only |
| Google `gemini-nano-banana-2.1` (name from a page summary) | yes | none for image models | $0.0336 at 1K, plus input tokens | instruction edit; no structure | terms not read | [pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| fal `fal-ai/flux-general` (ControlNet, control LoRA) | yes | none | $0.075/MP ❌ over cap | true ControlNet | page: permitted | [model](https://fal.ai/models/fal-ai/flux-general) |
| SiliconFlow (FLUX.1 Kontext pro) | yes | "$1 free credits" ≈ 25 renders | $0.04 | instruction edit | not read; China-hosting policy applies? | [pricing](https://www.siliconflow.com/pricing) |
| Together FLUX.2 dev | yes | none stated | $0.0154 | edit support not confirmed | not read | [pricing](https://www.together.ai/pricing) |
| Hugging Face Inference Providers | yes | page read today: no free-user credit; Chat 3 saw $0.10/month | pass-through | depends on model | per model | [pricing](https://huggingface.co/docs/inference-providers/pricing) · too small |

Not found: any depth/canny/ControlNet model in the [Cloudflare catalog](https://developers.cloudflare.com/workers-ai/models/). Not checked: Imagen edit (not on the Gemini pricing page), HF Spaces (Chat 3: ~3 runs/day, unstable), ModelScope (page empty).

## Check during the bake-off

- **Input size on klein:** Cloudflare's [launch changelog](https://developers.cloudflare.com/changelog/post/2026-01-15-flux-2-klein-4b-workers-ai/) says each input image must be smaller than 512×512 (read from a search snippet). Our 1024-px captures worked live, so they may be downscaled. Test 512 vs 1024 input: it affects detail and neuron math.
- Stability: 25 credits ÷ 5 = 5 renders (readiness v2 says ≈8). Funded paid engines are also covered by BUG-E15.
- Suggested same 3D view and prompt for all; score geometry (windows, roof line, camera), realism, latency, cost.
