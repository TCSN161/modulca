/**
 * AI Render Engine Interface
 *
 * Each engine implements this interface. To add a new engine:
 * 1. Create a new file in this folder (e.g., myengine.ts)
 * 2. Export a function matching AiRenderEngine
 * 3. Register it in the ENGINES map in ../route.ts
 */

/** Policy flags for EU compliance and provider routing */
export interface PolicyFlags {
  /** Allow China-based providers (Qwen, Hunyuan, Seedream). Default: false */
  allowChinaProviders?: boolean;
  /** Require EU data gateway / EU-region processing. Default: false */
  requireEUGateway?: boolean;
  /** Safe mode — extra content moderation. Default: true */
  safeMode?: boolean;
}

export interface AiRenderRequest {
  prompt: string;
  width: number;
  height: number;
  seed: string;
  /** Optional base64-encoded PNG from 3D scene capture (for img2img engines) */
  baseImage?: string;
  /** User tier — used for cost ceiling enforcement */
  tier?: string;
  /** Policy flags for region/compliance control */
  policyFlags?: PolicyFlags;
}

export interface AiRenderResult {
  /** Raw image bytes */
  buffer: Buffer;
  /** MIME type (e.g., "image/jpeg", "image/webp") */
  contentType: string;
  /** Which engine produced this result */
  engine: string;
  /** Estimated cost in USD for this generation */
  costUsd?: number;
  /** Generation latency in milliseconds */
  latencyMs?: number;
}

/**
 * An AI render engine function.
 * Returns a result on success, or null on failure.
 */
export type AiRenderEngine = (
  req: AiRenderRequest
) => Promise<AiRenderResult | null>;

/**
 * Metadata about an engine for the UI dropdown.
 */
export interface EngineInfo {
  id: string;
  label: string;
  description: string;
  /** Average generation time hint */
  speed: "fast" | "medium" | "slow";
}
