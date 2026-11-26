# Cloudflare FLUX.2 klein on the free tier (checked 2026-11-26)

- Free: 10,000 neurons/day (reset 00:00 UTC). [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), page dated 18 Nov; none of the three models below is listed as needing paid billing.
- My arithmetic for one 1024×1024 image: schnell (our code uses 8 steps) ≈ 96 neurons → ~104/day · klein-4b ≈ 104 → ~95/day (each 512² input tile adds 5.4) · klein-9b ≈ 1,364 → ~7/day. The daily pool is shared by all three.
- [20 Nov retirements](https://developers.cloudflare.com/changelog/post/2026-11-05-planned-model-deprecations/): 24 models (incl. SDXL); neither schnell nor klein-4b is on the list.
- **Action (Chat 3, S):** check these numbers against `cloudflareKlein.ts` and the per-user quota; keep 9b away from beta users. Real neuron use is not measured yet.
