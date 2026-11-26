/**
 * Single source of truth for the consultant's Claude model settings.
 * Change the model here only — route.ts and anthropic.ts import these.
 *
 * Sonnet 5.5 notes (verified 2026-11-26, session 2.06):
 *  - non-default `temperature` / `top_p` / `top_k` → HTTP 400 ("temperature is deprecated for this model")
 *  - thinking is adaptive by default; depth is controlled with `output_config.effort`
 *  - minimum cacheable prompt prefix is 512 tokens (tier system prompts are above it)
 */
export const CONSULTANT_CLAUDE_MODEL = "claude-sonnet-5-5";

/** `low` keeps chat answers fast and cheap (ops cap €50/month). */
export const CONSULTANT_CLAUDE_EFFORT = "low" as const;

/**
 * Extra max_tokens on top of the tier's answer budget. Sonnet 5.5 thinks adaptively
 * and thinking tokens count against max_tokens; without headroom 3/5 smoke-test
 * answers were truncated at the 2048 Architect limit (2026-11-26).
 */
export const CONSULTANT_CLAUDE_THINKING_HEADROOM = 2048;

/** Kill switch: set CONSULTANT_DISABLE_ANTHROPIC=1 (or "true") to skip Claude and use the next provider. */
export const CONSULTANT_DISABLE_ANTHROPIC_ENV = "CONSULTANT_DISABLE_ANTHROPIC";
