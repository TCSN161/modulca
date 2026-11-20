import { NextRequest, NextResponse } from "next/server";
import { devLog } from "@/shared/lib/devLog";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * CATUC Translate API — Phase 2 prep (MCA-HANDOFF-2 ITEM-2)
 *
 * Translates/explains CATUC (Legea 169/2026) paragraphs for users:
 *   - "formal" tone: preserves legal register
 *   - "plain" tone: rewrites for non-expert readers
 *   - RO ↔ EN direction
 *
 * Provider fallback (cheap-first, per MCA-STRAT-AI-DELEGATION):
 *   1. Gemini 2.5 Flash  — free, 2M context (fits whole CATUC)
 *   2. Groq GPT-OSS 120B — free, ~30 req/min
 *   3. DeepSeek V3       — $0.14/1M input, gated on DEEPSEEK_API_KEY present
 *                          AND NEXT_PUBLIC_DEEPSEEK_ENABLED flag (Chat 4 top-up)
 *
 * Privacy: input paragraph is NOT logged (CATUC is public law but user
 * paraphrases may be sensitive). Only metadata reaches devLog.
 */

type Lang = "ro" | "en";
type Tone = "formal" | "plain";

interface TranslateRequest {
  paragraph: string;
  lang?: Lang;
  tone?: Tone;
  sourceSection?: string;
}

interface TranslateResponse {
  translated: string;
  sourceSection?: string;
  warnings?: string[];
  provider: string;
  model: string;
}

type ProviderId = "gemini" | "groq" | "deepseek";

interface Provider {
  id: ProviderId;
  enabled: () => boolean;
  call: (req: Required<TranslateRequest>) => Promise<string | null>;
  model: string;
}

function validateRequest(body: unknown): TranslateRequest | string {
  if (!body || typeof body !== "object") return "Invalid JSON body";
  const b = body as Record<string, unknown>;
  if (typeof b.paragraph !== "string" || !b.paragraph.trim()) {
    return "paragraph is required and must be a non-empty string";
  }
  if (b.paragraph.length > 10000) {
    return "paragraph exceeds 10000 characters";
  }
  if (b.lang !== undefined && b.lang !== "ro" && b.lang !== "en") {
    return "lang must be 'ro' or 'en'";
  }
  if (b.tone !== undefined && b.tone !== "formal" && b.tone !== "plain") {
    return "tone must be 'formal' or 'plain'";
  }
  if (b.sourceSection !== undefined && typeof b.sourceSection !== "string") {
    return "sourceSection must be a string";
  }
  return {
    paragraph: b.paragraph,
    lang: (b.lang as Lang | undefined) ?? "ro",
    tone: (b.tone as Tone | undefined) ?? "plain",
    sourceSection: b.sourceSection as string | undefined,
  };
}

function buildPrompt(req: Required<TranslateRequest>): { system: string; user: string } {
  const toneDesc =
    req.tone === "formal"
      ? "preserve the formal legal register; keep article references (e.g. 'art. 294(2)(a)(ii)') and defined terms verbatim"
      : "rewrite for a non-expert reader: short sentences, concrete examples, define jargon inline; still preserve article references verbatim";

  const langDesc =
    req.lang === "ro"
      ? "Romanian (Romania, construction law audience)"
      : "English (international audience, Romanian architecture context)";

  const system =
    "You are a legal text translator specialised in Romanian urbanism and construction law (CATUC — Legea 169/2026). " +
    "Rules: (1) " +
    toneDesc +
    ". (2) Target language: " +
    langDesc +
    ". (3) Never invent article numbers or clauses not present in the source. (4) If the source is ambiguous, output `[uncertain: <reason>]` inline and continue. (5) Return ONLY the translated/rewritten text, no commentary.";

  const sectionHint = req.sourceSection ? `Source section: ${req.sourceSection}\n\n` : "";
  const user = `${sectionHint}Source paragraph:\n\n${req.paragraph}`;
  return { system, user };
}

/* ------------------------------------------------------------------ */
/*  Providers                                                          */
/* ------------------------------------------------------------------ */

const gemini: Provider = {
  id: "gemini",
  model: "gemini-2.5-flash",
  enabled: () => Boolean(process.env.GEMINI_API_KEY),
  async call(req) {
    const { system, user } = buildPrompt(req);
    const key = process.env.GEMINI_API_KEY!;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  },
};

const groq: Provider = {
  id: "groq",
  model: "openai/gpt-oss-120b",
  enabled: () => Boolean(process.env.GROQ_API_KEY),
  async call(req) {
    const { system, user } = buildPrompt(req);
    const key = process.env.GROQ_API_KEY!;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groq.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? null;
  },
};

const deepseek: Provider = {
  id: "deepseek",
  model: "deepseek-chat",
  enabled: () =>
    Boolean(process.env.DEEPSEEK_API_KEY) &&
    process.env.NEXT_PUBLIC_DEEPSEEK_ENABLED === "true",
  async call(req) {
    const { system, user } = buildPrompt(req);
    const key = process.env.DEEPSEEK_API_KEY!;
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: deepseek.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? null;
  },
};

const PROVIDER_CHAIN: Provider[] = [gemini, groq, deepseek];

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateRequest(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  const req: Required<TranslateRequest> = {
    paragraph: validated.paragraph,
    lang: validated.lang ?? "ro",
    tone: validated.tone ?? "plain",
    sourceSection: validated.sourceSection ?? "",
  };

  const warnings: string[] = [];
  const triedProviders: string[] = [];

  for (const provider of PROVIDER_CHAIN) {
    if (!provider.enabled()) {
      devLog(`[catuc-translate] ${provider.id} not enabled, skipping`);
      continue;
    }
    triedProviders.push(provider.id);
    try {
      const translated = await provider.call(req);
      if (translated && translated.trim()) {
        devLog(
          `[catuc-translate] ok provider=${provider.id} chars_in=${req.paragraph.length} chars_out=${translated.length}`,
        );
        if (triedProviders.length > 1) {
          warnings.push(`Primary providers failed: ${triedProviders.slice(0, -1).join(", ")}`);
        }
        const response: TranslateResponse = {
          translated: translated.trim(),
          sourceSection: req.sourceSection || undefined,
          warnings: warnings.length ? warnings : undefined,
          provider: provider.id,
          model: provider.model,
        };
        return NextResponse.json(response);
      }
      warnings.push(`${provider.id} returned empty`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      devLog(`[catuc-translate] error provider=${provider.id} msg=${msg}`);
      warnings.push(`${provider.id} threw: ${msg}`);
    }
  }

  return NextResponse.json(
    {
      error: "All providers failed",
      warnings,
      triedProviders,
    },
    { status: 503 },
  );
}
