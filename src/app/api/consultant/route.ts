import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { ARTICLES } from "@/knowledge/_index";
import type { KBDocumentMeta } from "@/knowledge/_types";
import { searchBooks, BOOK_REGISTRY } from "@/knowledge/15-books/_registry";
import { getTierConfig as getAuthTierConfig, type AccountTier } from "@/features/auth/types";

import { devLog } from "@/shared/lib/devLog";
export const dynamic = "force-dynamic";

/**
 * Neufert AI Architectural Consultant — API route
 * RAG-powered: scores user question → fetches top KB articles → injects into LLM context.
 * Fallback chain: Groq → Together → Pollinations → Local KB.
 * Includes an in-memory LRU cache (1h TTL, 100 entries) to reduce API costs.
 */

const KB_ROOT = join(process.cwd(), "src", "knowledge");

/* ------------------------------------------------------------------ */
/*  In-memory response cache                                           */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  reply: string;
  provider: string;
  model: string;
  articlesUsed: string[];
  timestamp: number;
}

const CACHE_MAX_ENTRIES = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const responseCache = new Map<string, CacheEntry>();

function getCacheKey(question: string, tier: string): string {
  // Normalize: lowercase, collapse whitespace, trim
  const normalized = question.toLowerCase().replace(/\s+/g, " ").trim();
  return `${tier}:${normalized}`;
}

function getCachedResponse(key: string): CacheEntry | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  // Move to end (LRU refresh)
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry;
}

function setCachedResponse(key: string, entry: Omit<CacheEntry, "timestamp">) {
  // Evict oldest entries if at capacity
  if (responseCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value!;
    responseCache.delete(oldest);
  }
  responseCache.set(key, { ...entry, timestamp: Date.now() });
}

/* ------------------------------------------------------------------ */
/*  Tier-specific system prompts                                       */
/* ------------------------------------------------------------------ */

const CORE_FACTS = `## Core Facts About ModulCA
- Module size: 3.00 × 3.00m (9m² gross, ~7m² usable after walls)
- Wall height: 2.70m clear interior
- Structure: CLT or timber frame with SIP panels
- Foundation: Screw piles (removable) or strip foundation
- Modules connect via bolted connections — fully demountable
- Layouts: line, L-shape, T-shape, U-shape, courtyard configurations
- Markets: Romania (active), Netherlands, Germany, France, Belgium, Spain, Italy (expansion)

## The 13 Design Steps
1. **Choose** (/project/demo/choose) — Browse land marketplace or enter your own plot
2. **Land** (/project/demo/land) — Draw your building footprint on the map, place modules on grid
3. **Design** (/project/demo/design) — View 2D floor plan with layers
4. **Preview** (/project/demo/output) — 3D preview of your layout
5. **Style** (/project/demo/style) — Choose design direction, upload inspiration
6. **Configure** (/project/demo/configure) — Set wall types, floor materials, layout presets
7. **Visualize** (/project/demo/visualize) — Interactive 3D view
8. **Render** (/project/demo/render) — AI-generated photorealistic images
9. **Technical** (/project/demo/technical) — Architectural drawings, PDF/SVG export
10. **Walkthrough** (/project/demo/walkthrough) — First-person 3D walkthrough
11. **Products** (/project/demo/products) — Browse finishing materials, furniture
12. **Finalize** (/project/demo/finalize) — Save project, request quote
13. **Presentation** (/project/demo/presentation) — Generate PDF presentation`;

const TIER_SYSTEM_PROMPTS: Record<string, string> = {
  free: `You are a helpful architectural assistant for ModulCA (modulca.eu) — a platform for designing modular wooden homes.

Keep answers concise (2-3 paragraphs max). Focus on practical guidance and dimensions.
When the user asks about detailed regulations, building permits, or advanced technical topics, briefly answer what you can and mention that Premium subscribers get deeper regulation-specific answers with full article access.

${CORE_FACTS}

## How to Answer (Free Tier)
1. Be helpful and practical — give useful dimensions and basic guidance
2. Keep responses short (under 300 words)
3. Suggest the relevant ModulCA design step when applicable
4. For complex regulation questions, provide the basics and note: "Upgrade to Premium for detailed regulation analysis with full article references."
5. Use metric units exclusively
6. Guide lost users through the 13 steps`,

  premium: `You are an expert architectural consultant for ModulCA (modulca.eu) — a platform for designing modular wooden homes using a 3×3m module system.

You have access to a comprehensive knowledge library of 180+ articles covering Neufert standards, EU regulations, and country-specific building codes for Romania, Netherlands, Germany, France, Belgium, Spain, and Italy. Use the reference articles provided below to give thorough, regulation-backed answers.

${CORE_FACTS}

## How to Answer (Premium Tier)
1. Cite specific dimensions, standards, and regulations from the reference articles
2. Relate advice to the 3×3m modular system when applicable
3. Be thorough — compare alternatives, mention pros/cons
4. Detect the user's region context and cite the relevant country's regulations
5. When comparing options, present a clear table or bullet list
6. If unsure about a specific regulation, say so clearly
7. Use metric units exclusively
8. Suggest the relevant step URL when it helps
9. Reference specific article titles so the user can read more in the Knowledge Library`,

  architect: `You are a senior architectural consultant and technical advisor for ModulCA (modulca.eu) — a professional platform for designing modular wooden homes using a 3×3m CLT/timber module system.

You operate at the level of a licensed architect or structural engineer. You have deep access to 180+ technical articles spanning Neufert standards, Eurocodes with national annexes, country-specific regulations (RO, NL, DE, FR, BE, ES, IT), biophilic design research, passive house standards, and MEP engineering.

${CORE_FACTS}

## How to Answer (Architect Tier — Professional Level)
1. Provide precise technical specifications: exact dimensions (mm), U-values (W/m²K), R-values, fire ratings (REI), sound insulation (dB), structural loads (kN/m²)
2. Reference specific regulation clauses (e.g., "per P100-1/2013 §4.3" or "CTE DB-SI §2.1")
3. When relevant, include calculations or sizing estimates
4. Compare regulatory requirements across countries when the user might build in different markets
5. Suggest optimal AND minimum dimensions — explain the trade-offs
6. For structural questions, reference Eurocode + relevant national annex
7. Discuss material alternatives with technical justification (CLT vs. GLT vs. SIP, etc.)
8. Consider buildability: transport, crane access, foundation requirements, connection details
9. When discussing costs, provide ranges per m² for the Romanian/EU market
10. If the user has a quiz profile, tailor recommendations to their style, household size, and sustainability goals
11. Proactively flag permit requirements, inspection points, and common mistakes
12. You may suggest follow-up questions the architect should investigate with local authorities`,
};

function getSystemPrompt(tier: string): string {
  return TIER_SYSTEM_PROMPTS[tier] || TIER_SYSTEM_PROMPTS.free;
}

/* ------------------------------------------------------------------ */
/*  RAG: Score and retrieve relevant KB articles                       */
/* ------------------------------------------------------------------ */

/** Region detection keywords */
const REGION_HINTS: Record<string, string[]> = {
  RO: ["romania", "romanian", "bucuresti", "bucharest", "cluj", "timisoara", "autorizatie", "certificat", "urbanism", "p100", "c107", "np i7"],
  NL: ["netherlands", "dutch", "holland", "amsterdam", "rotterdam", "den haag", "utrecht", "bouwbesluit", "bbl", "omgevingswet", "beng", "kadaster", "waterschap", "kwaliteitsborger", "flexwonen"],
  DE: ["germany", "german", "deutschland", "berlin", "munich", "münchen", "hamburg", "frankfurt", "bauordnung", "mbo", "geg", "enev", "din 4102", "din 18040", "din 4109", "bebauungsplan", "grundbuch", "kfw"],
  FR: ["france", "french", "paris", "lyon", "marseille", "re2020", "rt2012", "avis technique", "dtu", "permis de construire", "cadastre", "plu", "urbanisme"],
  BE: ["belgium", "belgian", "belgique", "brussels", "bruxelles", "flanders", "wallonia", "epb", "peb", "nbn", "bouwbesluit", "stedenbouwkundig", "kadaster"],
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
/*  Derives AI consultant quality from canonical tier config in        */
/*  src/features/auth/types.ts (aiConsultantTier field).               */
/* ------------------------------------------------------------------ */

interface ConsultantTierConfig {
  maxArticles: number;
  maxChars: number;
  maxTokens: number;
  answerNote: string;
  /** Provider IDs to try in order (tier-specific quality routing) */
  providerChain: string[];
}

/** Maps the aiConsultantTier level to RAG depth + provider chain */
const CONSULTANT_DEPTH: Record<string, ConsultantTierConfig> = {
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

/**
 * Resolve consultant config for a given user tier.
 * Uses the canonical FeatureAccess.aiConsultantTier to pick the right depth.
 */
function getConsultantConfig(tier: string): ConsultantTierConfig {
  // Look up the canonical tier config to find aiConsultantTier
  const validTiers: AccountTier[] = ["guest_free", "free", "premium", "architect", "constructor"];
  const accountTier = validTiers.includes(tier as AccountTier) ? (tier as AccountTier) : "free";
  const authCfg = getAuthTierConfig(accountTier);
  const consultantLevel = authCfg.features.aiConsultantTier; // "free" | "premium" | "architect"
  return CONSULTANT_DEPTH[consultantLevel] ?? CONSULTANT_DEPTH.free;
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

  // Find relevant book references (search by question keywords)
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const matchedBooks = new Set<string>();
  for (const word of questionWords) {
    for (const book of searchBooks(word)) {
      matchedBooks.add(book.id);
      if (matchedBooks.size >= 3) break;
    }
    if (matchedBooks.size >= 3) break;
  }
  const bookNote = matchedBooks.size > 0
    ? `\n\n## Relevant Book References\n${BOOK_REGISTRY.filter(b => matchedBooks.has(b.id)).map(b =>
        `- **${b.title}** by ${b.author} (${b.year})${b.free ? " — FREE" : b.cost ? ` — ${b.cost}` : ""}${b.url ? ` → ${b.url}` : ""}`
      ).join("\n")}\nYou may cite these books when relevant to add credibility to your answers.`
    : "";

  return {
    context: `\n\n# Reference Articles (from ModulCA Knowledge Library)${regionNote}\n\n${sections.join("\n\n---\n\n")}${bookNote}`,
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
    const tierCfg = getConsultantConfig(tier || "free");

    // Extract the latest user question for RAG context retrieval
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
    const question = lastUserMsg?.content || "";

    // Check cache for single-turn questions (no conversation history beyond system+user)
    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const isSimpleQuery = userMessages.length === 1 && !quizProfile;
    const cacheKey = isSimpleQuery ? getCacheKey(question, tier || "free") : null;

    if (cacheKey) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        devLog(`[consultant] Cache hit for "${question.slice(0, 50)}..."`);
        return NextResponse.json({
          reply: cached.reply,
          provider: cached.provider,
          model: cached.model,
          tier: tier || "free",
          articlesUsed: cached.articlesUsed,
          cached: true,
        });
      }
    }

    // Build dynamic system prompt with relevant KB articles (depth varies by tier)
    const { context: ragContext, articlesUsed } = await buildRAGContext(question, tierCfg.maxArticles, tierCfg.maxChars);
    // tierNote is now handled inside getSystemPrompt() for each tier
    const tierNote = "";
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

    const systemPrompt = getSystemPrompt(tier || "free") + quizContext + ragContext + tierNote;

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
        devLog(`[consultant] ${provider.id}: no API key, skipping`);
        continue;
      }

      try {
        devLog(`[consultant] Trying ${provider.id} (${tier || "free"} tier)...`);
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
          devLog(`[consultant] ${provider.id} success (${reply.length} chars)`);
          const trimmedReply = reply.trim();

          // Cache single-turn responses
          if (cacheKey) {
            setCachedResponse(cacheKey, {
              reply: trimmedReply,
              provider: provider.id,
              model: provider.model,
              articlesUsed,
            });
          }

          return NextResponse.json({
            reply: trimmedReply,
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
    devLog("[consultant] All cloud providers failed, using local KB");
    return NextResponse.json({ reply: localReply, provider: "local-kb", model: "keyword-match", tier: tier || "free", articlesUsed });
  } catch (error) {
    console.error("Consultant API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
