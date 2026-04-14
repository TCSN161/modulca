import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { ARTICLES } from "@/knowledge/_index";
import type { KBDocumentMeta } from "@/knowledge/_types";

export const dynamic = "force-dynamic";

/**
 * Neufert AI Architectural Consultant — API route
 * RAG-powered: scores user question → fetches top KB articles → injects into LLM context.
 * Fallback chain: Groq → Together → Pollinations → Local KB.
 */

const KB_ROOT = join(process.cwd(), "src", "knowledge");

const BASE_SYSTEM_PROMPT = `You are an expert architectural consultant for ModulCA (modulca.eu) — a platform for designing modular wooden homes using a 3×3m module system.

You are powered by a comprehensive knowledge library covering Neufert standards, EU/Romanian/Dutch regulations, modular construction, sustainability, and more. Use the reference articles provided below to give precise, evidence-based answers.

## Core Facts About ModulCA
- Module size: 3.00 × 3.00m (9m² gross, ~7m² usable after walls)
- Wall height: 2.70m clear interior
- Structure: CLT or timber frame with SIP panels
- Foundation: Screw piles (removable) or strip foundation
- Modules connect via bolted connections — fully demountable
- Layouts: line, L-shape, T-shape, U-shape, courtyard configurations
- Markets: Romania (active), Netherlands (expansion)
- Account tiers: Explorer (free), Premium (€19/mo), Architect (€49/mo)

## The 13 Design Steps (guide users through these)
1. **Choose** (/project/demo/choose) — Browse land marketplace or enter your own plot
2. **Land** (/project/demo/land) — Draw your building footprint on the map, place modules on grid
3. **Design** (/project/demo/design) — View 2D floor plan with layers (walls, furniture, grid, dimensions)
4. **Preview** (/project/demo/output) — 3D preview of your layout with inspector panel
5. **Style** (/project/demo/style) — Choose design direction (Scandinavian, Industrial, Mediterranean), upload inspiration
6. **Configure** (/project/demo/configure) — Set wall types (solid/window/door), floor materials, layout presets per room
7. **Visualize** (/project/demo/visualize) — Interactive 3D view: single module or all modules, customize furniture colors
8. **Render** (/project/demo/render) — AI-generated photorealistic images of your design with lighting/camera controls
9. **Technical** (/project/demo/technical) — Architectural drawings: combined floor plan, sections, elevations, wall details, MEP, foundation. PDF/SVG export
10. **Walkthrough** (/project/demo/walkthrough) — First-person 3D walkthrough with WASD controls
11. **Products** (/project/demo/products) — Browse and select finishing materials, furniture, plumbing & electrical
12. **Finalize** (/project/demo/finalize) — Save project, view cost summary, request quote or consultation
13. **Presentation** (/project/demo/presentation) — Generate PDF presentation with 5 templates and 11 slide types

## How to Answer
1. Cite specific dimensions, standards, and regulations from the reference articles
2. Relate advice to the 3×3m modular system when applicable
3. Be practical — suggest optimal and minimum dimensions
4. Detect the user's region context (Romania, Netherlands, EU) and cite relevant regulations
5. If unsure about a specific regulation, say so clearly
6. Use metric units exclusively (meters, square meters)
7. Keep answers concise but thorough — like a professional consultant
8. When referencing ModulCA features, be accurate — you represent the platform
9. When a user asks "what should I do next?" or seems lost, guide them through the 13 steps above
10. Suggest the relevant step URL when it helps (e.g., "Head to the Configure step to set your wall types")`;

/* ------------------------------------------------------------------ */
/*  RAG: Score and retrieve relevant KB articles                       */
/* ------------------------------------------------------------------ */

/** Region detection keywords */
const REGION_HINTS: Record<string, string[]> = {
  RO: ["romania", "romanian", "bucuresti", "bucharest", "cluj", "timisoara", "autorizatie", "certificat", "urbanism", "p100", "c107", "np i7"],
  NL: ["netherlands", "dutch", "holland", "amsterdam", "rotterdam", "den haag", "utrecht", "bouwbesluit", "bbl", "omgevingswet", "beng", "kadaster", "waterschap", "kwaliteitsborger", "flexwonen"],
  EU: ["european", "eu ", "eurocode", "epbd", "ce marking", "cpr"],
};

function detectRegion(question: string): string | null {
  const q = question.toLowerCase();
  let bestRegion: string | null = null;
  let bestScore = 0;
  for (const [region, hints] of Object.entries(REGION_HINTS)) {
    let score = 0;
    for (const hint of hints) {
      if (q.includes(hint)) score += hint.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRegion = region;
    }
  }
  return bestScore > 0 ? bestRegion : null;
}

function scoreArticle(article: KBDocumentMeta, question: string, detectedRegion: string | null): number {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  let score = 0;

  // Tag matches (strongest signal)
  for (const tag of article.tags) {
    if (q.includes(tag)) score += tag.length * 3;
    for (const w of words) {
      if (tag.includes(w)) score += w.length;
    }
  }

  // Title word matches
  const titleLower = article.title.toLowerCase();
  for (const w of words) {
    if (titleLower.includes(w)) score += w.length * 2;
  }

  // Category match
  const catLower = article.category.toLowerCase();
  for (const w of words) {
    if (catLower.includes(w)) score += w.length;
  }

  // Region boost: if user asks about NL, boost NL articles
  if (detectedRegion && article.region === detectedRegion) {
    score += 15;
  }
  // EU articles get a small boost when any region is detected (they're always relevant)
  if (detectedRegion && article.region === "EU") {
    score += 5;
  }

  // ModulCA articles always get a small baseline boost (platform context)
  if (article.category === "modulca") {
    score += 3;
  }

  return score;
}

async function loadArticleContent(filePath: string): Promise<string> {
  try {
    const fullPath = join(KB_ROOT, filePath);
    const raw = await readFile(fullPath, "utf-8");
    // Strip YAML frontmatter
    const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    return match ? match[1].trim() : raw.trim();
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Tier-based context depth                                           */
/* ------------------------------------------------------------------ */

interface TierConfig {
  maxArticles: number;
  maxChars: number;
  maxTokens: number;
  answerNote: string;
  /** Provider IDs to try in order (tier-specific quality routing) */
  providerChain: string[];
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  free: {
    maxArticles: 2,
    maxChars: 2000,
    maxTokens: 768,
    answerNote: "Upgrade to Premium for deeper, regulation-specific answers.",
    providerChain: ["groq", "together", "pollinations"],
  },
  premium: {
    maxArticles: 4,
    maxChars: 6000,
    maxTokens: 1024,
    answerNote: "",
    providerChain: ["openai", "groq", "together", "pollinations"],
  },
  architect: {
    maxArticles: 6,
    maxChars: 12000,
    maxTokens: 2048,
    answerNote: "",
    providerChain: ["anthropic", "openai", "groq", "together", "pollinations"],
  },
};

function getTierConfig(tier: string): TierConfig {
  return TIER_CONFIGS[tier] ?? TIER_CONFIGS.free;
}

interface RAGResult { context: string; articlesUsed: string[] }

async function buildRAGContext(question: string, maxArticles = 4, maxChars = 6000): Promise<RAGResult> {
  const detectedRegion = detectRegion(question);

  // Score all articles
  const scored = ARTICLES.map((a) => ({
    article: a,
    score: scoreArticle(a, question, detectedRegion),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxArticles);

  if (scored.length === 0) {
    // Fall back to ModulCA overview + most popular categories
    scored.push(
      { article: ARTICLES.find((a) => a.id === "modulca-platform")!, score: 1 },
      { article: ARTICLES.find((a) => a.id === "room-dimensions")!, score: 1 },
    );
  }

  // Load article content
  const sections: string[] = [];
  let totalChars = 0;
  for (const { article } of scored) {
    if (!article?.filePath) continue;
    const content = await loadArticleContent(article.filePath);
    if (!content) continue;
    // Trim to fit within budget
    const trimmed = content.slice(0, Math.min(content.length, maxChars - totalChars));
    if (trimmed.length < 100) break; // Not enough room for meaningful content
    sections.push(`## [${article.title}]\n${trimmed}`);
    totalChars += trimmed.length;
    if (totalChars >= maxChars) break;
  }

  const articleIds = scored.filter(s => s.article?.filePath).map(s => s.article.id);
  if (sections.length === 0) return { context: "", articlesUsed: [] };
  const regionNote = detectedRegion ? `\n\nDetected region context: ${detectedRegion}` : "";
  return {
    context: `\n\n# Reference Articles (from ModulCA Knowledge Library)${regionNote}\n\n${sections.join("\n\n---\n\n")}`,
    articlesUsed: articleIds,
  };
}

/* ------------------------------------------------------------------ */
/*  AI Provider Configuration                                          */
/* ------------------------------------------------------------------ */
/*
 * Provider quality tiers:
 *   Free users    → Groq (Llama 3.3 70B) → Together → Pollinations
 *   Premium users → OpenAI (GPT-4o-mini) → Groq → Together → Pollinations
 *   Architect     → Anthropic (Claude) → OpenAI → Groq → Together → Pollinations
 *
 * Platform accounts needed (create free accounts first):
 *   - Groq:         console.groq.com      — Free: 30 req/min, 14.4K tokens/min
 *   - Together:     api.together.xyz       — Free: $1 credit, then pay-as-you-go
 *   - OpenAI:       platform.openai.com    — Pay-as-you-go (~$0.15/1M input tokens for gpt-4o-mini)
 *   - Anthropic:    console.anthropic.com  — Pay-as-you-go (~$3/1M input tokens for claude-sonnet)
 *   - Pollinations: text.pollinations.ai   — Free, no key needed (fallback)
 *
 * Set API keys in .env.local:
 *   GROQ_API_KEY=gsk_...
 *   TOGETHER_API_KEY=...
 *   OPENAI_API_KEY=sk-...
 *   ANTHROPIC_API_KEY=sk-ant-...
 */

interface Provider {
  id: string;
  url: string;
  model: string;
  keyEnv?: string;
  /** Override key resolution (e.g. when system env shadows .env.local) */
  getKey?: () => string | undefined;
  buildHeaders: (apiKey?: string) => Record<string, string>;
  buildBody: (messages: { role: string; content: string }[], maxTokens: number) => object;
  extractReply: (data: unknown) => string | null;
}

const ALL_PROVIDERS: Record<string, Provider> = {
  anthropic: {
    id: "anthropic",
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    keyEnv: "ANTHROPIC_API_KEY",
    getKey: () => process.env.MODULCA_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || undefined,
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey!,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: (messages, maxTokens) => {
      // Anthropic uses a different format: system is separate, messages are user/assistant only
      const system = messages.find((m) => m.role === "system")?.content ?? "";
      const chatMsgs = messages.filter((m) => m.role !== "system").map((m) => ({
        role: m.role,
        content: m.content,
      }));
      return {
        model: "claude-sonnet-4-20250514",
        system,
        messages: chatMsgs,
        max_tokens: maxTokens,
        temperature: 0.7,
      };
    },
    extractReply: (data: any) => {
      // Anthropic response: { content: [{ type: "text", text: "..." }] }
      const blocks = data?.content;
      if (Array.isArray(blocks)) {
        return blocks.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || null;
      }
      return null;
    },
  },
  openai: {
    id: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    keyEnv: "OPENAI_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (messages, maxTokens) => ({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
    extractReply: (data: any) => data?.choices?.[0]?.message?.content || null,
  },
  groq: {
    id: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (messages, maxTokens) => ({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
    extractReply: (data: any) => data?.choices?.[0]?.message?.content || null,
  },
  together: {
    id: "together",
    url: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyEnv: "TOGETHER_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (messages, maxTokens) => ({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
    extractReply: (data: any) => data?.choices?.[0]?.message?.content || null,
  },
  pollinations: {
    id: "pollinations",
    url: "https://text.pollinations.ai/openai",
    model: "openai",
    buildHeaders: () => ({ "Content-Type": "application/json" }),
    buildBody: (messages, maxTokens) => ({
      messages,
      model: "openai",
      max_tokens: maxTokens,
    }),
    extractReply: (data: any) => {
      const msg = data?.choices?.[0]?.message;
      return msg?.content || msg?.reasoning_content || null;
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Local KB Fallback — uses full article index when AI is offline     */
/* ------------------------------------------------------------------ */

async function getLocalAnswer(question: string): Promise<string> {
  const detectedRegion = detectRegion(question);

  // Score articles using the same RAG scorer
  const scored = ARTICLES.map((a) => ({
    article: a,
    score: scoreArticle(a, question, detectedRegion),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (scored.length > 0 && scored[0].article.filePath) {
    const content = await loadArticleContent(scored[0].article.filePath);
    if (content) {
      // Return the first ~2000 chars of the best matching article
      const trimmed = content.length > 2000 ? content.slice(0, 2000) + "\n\n..." : content;
      return trimmed + "\n\n---\n*Answered from ModulCA Knowledge Library. For more detailed questions, please try again when AI providers are available.*";
    }
  }

  return "I'm your ModulCA architectural consultant. I can help with:\n\n" +
    "- **Room dimensions**: Bedrooms, kitchens, bathrooms, living rooms (Neufert standards)\n" +
    "- **Building regulations**: Romanian permits, Dutch Omgevingswet, EU Eurocodes\n" +
    "- **Modular construction**: Our 3×3m system, CLT, SIP panels, foundations\n" +
    "- **Sustainability**: Passive house, BENG, insulation, solar orientation\n" +
    "- **MEP systems**: Electrical, plumbing, HVAC sizing\n" +
    "- **Accessibility**: Universal design, Dutch/Romanian standards\n\n" +
    "Please ask about a specific topic for detailed standards and regulations.\n\n---\n*AI providers are temporarily busy. Using local knowledge base.*";
}

export async function POST(req: NextRequest) {
  try {
    const { messages, tier, quizProfile } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Tier-aware context depth
    const tierCfg = getTierConfig(tier || "free");

    // Extract the latest user question for RAG context retrieval
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
    const question = lastUserMsg?.content || "";

    // Build dynamic system prompt with relevant KB articles (depth varies by tier)
    const { context: ragContext, articlesUsed } = await buildRAGContext(question, tierCfg.maxArticles, tierCfg.maxChars);
    const tierNote = tierCfg.answerNote
      ? `\n\nNote to assistant: The user is on the free tier. Keep answers helpful but concise. End with: "${tierCfg.answerNote}"`
      : "";
    // Optional quiz profile context
    let quizContext = "";
    if (quizProfile && quizProfile.primaryStyle) {
      quizContext = `\n\n## User's Architectural Profile (from quiz)\n` +
        `- Style: ${quizProfile.primaryStyle}\n` +
        `- Household: ${quizProfile.householdSize} people\n` +
        `- Modules: ${quizProfile.totalModules} (${quizProfile.grossArea}m² gross)\n` +
        `- Layout: ${quizProfile.layout}\n` +
        `- Budget: ${quizProfile.budgetLevel}\n` +
        `- Sustainability: ${quizProfile.sustainability}/5\n` +
        `- Biophilic affinity: ${quizProfile.biophilic}/5\n` +
        `\nUse this profile to personalize recommendations. Reference their style preference and home size when relevant.`;
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + quizContext + ragContext + tierNote;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20),
    ];

    // Try each provider in tier-specific order
    const providerChain = tierCfg.providerChain
      .map((id) => ALL_PROVIDERS[id])
      .filter(Boolean);

    for (const provider of providerChain) {
      // Skip providers that need a missing API key
      const apiKey = provider.getKey ? provider.getKey() : provider.keyEnv ? process.env[provider.keyEnv] : undefined;
      if ((provider.keyEnv || provider.getKey) && !apiKey) {
        console.log(`[consultant] ${provider.id}: no API key, skipping`);
        continue;
      }

      try {
        console.log(`[consultant] Trying ${provider.id} (${tier || "free"} tier)...`);
        const response = await fetch(provider.url, {
          method: "POST",
          headers: provider.buildHeaders(apiKey),
          body: JSON.stringify(provider.buildBody(fullMessages, tierCfg.maxTokens)),
        });

        if (!response.ok) {
          const err = await response.text().catch(() => "");
          console.error(`[consultant] ${provider.id} error ${response.status}:`, err.slice(0, 200));
          continue;
        }

        // Pollinations returns plain text; others return JSON
        let reply: string | null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          reply = provider.extractReply(data);
        } else {
          reply = await response.text();
        }

        if (reply && reply.trim()) {
          console.log(`[consultant] ${provider.id} success (${reply.length} chars)`);
          return NextResponse.json({
            reply: reply.trim(),
            provider: provider.id,
            model: provider.model,
            tier: tier || "free",
            articlesUsed,
          });
        }
        console.warn(`[consultant] ${provider.id} returned empty reply`);
      } catch (err) {
        console.error(`[consultant] ${provider.id} exception:`, err);
      }
    }

    // All cloud providers failed — use local knowledge base (133 articles)
    const localReply = await getLocalAnswer(question);
    console.log("[consultant] All cloud providers failed, using local KB");
    return NextResponse.json({ reply: localReply, provider: "local-kb", model: "keyword-match", tier: tier || "free", articlesUsed });
  } catch (error) {
    console.error("Consultant API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
