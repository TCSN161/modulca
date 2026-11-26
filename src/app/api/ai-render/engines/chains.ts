/**
 * Fallback chains per tier + mode (moved out of route.ts 2026-11-26, BUG-ST01).
 *
 * Invariant (tested in chains.test.ts): a higher tier gets MORE options, never
 * fewer. Every chain contains every free engine of the free chain for the same
 * mode, so a paying user still gets an image when all paid engines are
 * disabled (AI_ENGINES_DISABLED), unfunded, or over budget.
 *
 * Credit manager auto-skips depleted engines; the cost ceiling in
 * tryEngines() auto-skips anything over the per-image budget.
 *
 * Real production latency (same prompt, 2026-04-17):
 *   openai: 2s | cloudflare: 3s | pollinations: 5s | huggingface: 9s
 *   leonardo: 17s | runway: 39s | blackforest: 43s | together: 49s
 *   deepinfra/gemini: 51s | fal/replicate/segmind/stability: 52-53s
 *   fireworks: 54s | novita: 60s | wavespeed: 62s | ai-horde: 110s | prodia: 113s
 */

/** guest_free / free — STRICTLY €0 engines. 503 rather than spend on a non-payer. */
export const FALLBACK_FREE = [
  // Order reviewed 2026-11-26 (Chat 3 live test, MCA-DOC-AI-ENGINES-BETA-READINESS v2)
  "cloudflare",       // 2.7s — FLUX.1 schnell, ≈96 neurons/img of the 10K/day free
  "cloudflare-klein", // 7s   — FLUX.2 klein 4B, same 10K pool; model diversity if schnell breaks
  "pollinations",     // 2.5s — free; anonymous = 1 img/45s per IP, more with POLLINATIONS_API_KEY
  "huggingface",      // <0.5s fail today — $0.10/mo credits (resets Dec 1)
  "gemini",           // <0.5s fail — image free tier is limit 0 (BUG-E01)
  "together",         // <0.5s fail — promo ended (BUG-E03)
  "ai-horde",         // 6–75s — volunteer GPUs, last resort (≤576² anonymous, BUG-ST01)
] as const;

/** premium — free HERO first, then cheap paid, premium as last upgrade. */
export const FALLBACK_PREMIUM = [
  "cloudflare", "cloudflare-klein", "gemini", "together", "huggingface",
  // Cheap paid — only when free depleted
  "fireworks",      // $0.0014 (EU/GDPR)
  "blackforest",    // $0.003  (FLUX authors, EU)
  "fal",            // $0.003
  "replicate",      // $0.003
  // Premium quality — only if cheaper options failed
  "openai",         // $0.02
  "leonardo",       // $0.03
  // Final free fallbacks
  "pollinations", "ai-horde",
] as const;

/** architect — revenue (€79/mo) supports premium-first; free backup at the end. */
export const FALLBACK_ARCHITECT = [
  "openai", "blackforest", "stability", "leonardo", "runway",
  "fal", "fireworks", "replicate", "deepinfra", "wavespeed", "segmind",
  "gemini", "cloudflare", "cloudflare-klein", "together", "huggingface", "pollinations", "ai-horde",
] as const;

/**
 * constructor — superset of architect. Before 2026-11-26 it had no case and
 * fell into FALLBACK_ORDER (10 engines, FEWER than premium). Free-first while
 * beta renders must stay €0; paid engines only when the free pool is empty.
 */
export const FALLBACK_CONSTRUCTOR = [
  "cloudflare", "cloudflare-klein", "gemini", "together", "huggingface",
  "fireworks", "blackforest", "fal", "replicate", "segmind", "deepinfra", "wavespeed",
  "openai", "stability", "leonardo", "runway",
  "pollinations", "ai-horde",
] as const;

/** Unknown tier (misconfig, admin tools) — like free, with cheap paid backup. */
export const FALLBACK_ORDER = [
  "cloudflare", "cloudflare-klein", "pollinations", "gemini", "huggingface", "together",
  "fireworks", "blackforest", "fal", "ai-horde",
] as const;

/**
 * img2img (paid tiers) — engines that respect baseImage first, because
 * without structure preservation the 3D scene is wasted.
 */
export const IMG2IMG_FALLBACK = [
  "cloudflare-klein", // free, structure-preserving, 4s — profit-first
  "stability", "fal", "replicate", "wavespeed",
  // text2img fallback (loses the 3D structure, keeps the prompt)
  "blackforest", "openai", "fireworks", "runway", "leonardo",
  "gemini", "together", "cloudflare", "huggingface", "pollinations",
  "ai-horde",         // img2img since 2026-11-26
] as const;

/** img2img for guest_free / free (beta) — €0 only, geometry-preserving first. */
export const IMG2IMG_FREE = [
  "cloudflare-klein", // FLUX.2 klein reference-image edit (keeps the 3D view)
  "ai-horde",         // SD img2img, weak but keeps geometry
  "cloudflare",       // text2img fallback
  "pollinations",     // text2img fallback
] as const;

/** Append any engine of `floor` that `chain` lacks (keeps chain order). */
export function withFloor(chain: readonly string[], floor: readonly string[]): string[] {
  const out = [...chain];
  for (const id of floor) if (!out.includes(id)) out.push(id);
  return out;
}

/** Best fallback chain for a tier + mode. Always contains the free floor. */
export function getFallbackChain(tier: string, hasBaseImage: boolean): string[] {
  if (hasBaseImage) {
    return tier === "free" || tier === "guest_free"
      ? [...IMG2IMG_FREE]
      : withFloor(IMG2IMG_FALLBACK, IMG2IMG_FREE);
  }
  switch (tier) {
    case "guest_free":
    case "free":
      return [...FALLBACK_FREE];
    case "premium":
      return withFloor(FALLBACK_PREMIUM, FALLBACK_FREE);
    case "architect":
      return withFloor(FALLBACK_ARCHITECT, FALLBACK_FREE);
    case "constructor":
      return withFloor(FALLBACK_CONSTRUCTOR, FALLBACK_FREE);
    default:
      return withFloor(FALLBACK_ORDER, FALLBACK_FREE);
  }
}
