import Anthropic from "@anthropic-ai/sdk";
import { devLog } from "@/shared/lib/devLog";
import {
  CONSULTANT_CLAUDE_MODEL,
  CONSULTANT_CLAUDE_EFFORT,
  CONSULTANT_CLAUDE_THINKING_HEADROOM,
  CONSULTANT_DISABLE_ANTHROPIC_ENV,
} from "./models";

/**
 * Claude call for the NeufertAI consultant (Architect tier).
 *
 * Prompt layout (prompt caching = prefix match):
 *   system[0]  stable tier prompt      ← cache_control breakpoint here
 *   system[1]  volatile: quiz profile + RAG articles for this question
 *   messages   conversation (last 20)
 * Anything that changes per request must stay AFTER the breakpoint.
 */

export function getAnthropicKey(): string | undefined {
  // MODULCA_ANTHROPIC_KEY first: a system-level ANTHROPIC_API_KEY can shadow .env.local
  return process.env.MODULCA_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || undefined;
}

export function isAnthropicDisabled(): boolean {
  const v = (process.env[CONSULTANT_DISABLE_ANTHROPIC_ENV] || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

let cachedClient: { key: string; client: Anthropic } | null = null;

function getClient(apiKey: string): Anthropic {
  if (!cachedClient || cachedClient.key !== apiKey) {
    // maxRetries 1: the provider chain is our real fallback; don't stall the user.
    cachedClient = { key: apiKey, client: new Anthropic({ apiKey, maxRetries: 1, timeout: 60_000 }) };
  }
  return cachedClient.client;
}

export interface ClaudeChatInput {
  stableSystem: string;
  volatileSystem: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
  apiKey: string;
}

function toClaudeMessages(messages: ClaudeChatInput["messages"]): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  // The API requires the first message to be from the user
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

/** Returns the reply text, or null so the caller falls through to the next provider. */
export async function callClaude(input: ClaudeChatInput): Promise<string | null> {
  const messages = toClaudeMessages(input.messages);
  if (messages.length === 0) return null;

  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: input.stableSystem, cache_control: { type: "ephemeral" } },
  ];
  if (input.volatileSystem.trim()) system.push({ type: "text", text: input.volatileSystem });

  let response: Anthropic.Message;
  try {
    response = await getClient(input.apiKey).messages.create({
      model: CONSULTANT_CLAUDE_MODEL,
      max_tokens: input.maxTokens + CONSULTANT_CLAUDE_THINKING_HEADROOM,
      system,
      messages,
      output_config: { effort: CONSULTANT_CLAUDE_EFFORT },
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`[consultant] anthropic API error ${err.status}: ${err.message.slice(0, 200)}`);
      return null;
    }
    throw err;
  }

  const u = response.usage;
  devLog(
    `[consultant] anthropic usage: in=${u.input_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} ` +
      `cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens} stop=${response.stop_reason}`,
  );

  if (response.stop_reason === "refusal") {
    console.warn(`[consultant] anthropic refusal (category=${response.stop_details?.category ?? "none"}), falling back`);
    return null;
  }
  if (response.stop_reason === "max_tokens") {
    console.warn("[consultant] anthropic hit max_tokens; returning truncated answer");
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return text.trim() ? text : null;
}
