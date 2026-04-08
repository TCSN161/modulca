import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Neufert AI Architectural Consultant — API route
 * Fallback chain: Together (Llama 3.3) → Pollinations (free, no key).
 * Modular: swap PROVIDER to switch AI backend without touching the frontend.
 */

const SYSTEM_PROMPT = `You are an expert architectural consultant specialized in residential design, based on Ernst Neufert's "Architects' Data" (Bauentwurfslehre) — the definitive reference for architectural planning standards.

Your role is to help clients and architects make informed decisions about modular home design. You provide precise, evidence-based answers about:

## Space Planning (Neufert Standards)
- **Minimum room dimensions**: Living room ≥16m², Bedroom ≥10m², Kitchen ≥6m², Bathroom ≥4m²
- **Corridor widths**: Min 0.90m (accessible: 1.20m), recommended 1.10m
- **Door widths**: Standard 0.80m, accessible 0.90m, main entry 1.00m
- **Ceiling heights**: Min 2.50m residential, recommended 2.60-2.80m
- **Stair dimensions**: Rise 170-190mm, tread 260-290mm, min width 0.90m
- **Kitchen work triangle**: Sink-stove-fridge, each leg 1.2-2.7m, total ≤6.6m
- **Kitchen counter heights**: Standard 85-90cm, bar height 100-110cm
- **Kitchen clearances**: Min 1.20m between facing counters

## Furniture Clearances
- **Bed**: 0.60m side clearance, 0.80m foot clearance
- **Dining table**: 0.75m per person, 0.90m chair pullback space
- **Desk workspace**: Min 1.20×0.80m surface, 1.00m depth for chair
- **Sofa**: 0.45m coffee table distance, 2.50m from TV (for 55")
- **Wardrobe**: 0.60m depth, 0.80m door swing clearance

## Modular Construction (3×3m modules)
- Each module = 9m² gross, ~7m² usable (walls deducted)
- Standard wall thickness: 0.15m exterior, 0.10m interior
- Shared walls between modules = open space (no wall)
- Module grid allows L-shapes, T-shapes, and rectangular layouts
- Max span without structural support: 3m (single module width)

## Romanian Building Regulations
- Building permit required for structures >50m²
- Max building coverage: typically 35-45% of lot area
- Min distance from boundaries: 1.0m from side, 2.0m from front
- Certificat de Urbanism (CU) required before design
- Fire resistance: min REI 30 for residential

## Sustainability & Materials
- CLT (Cross-Laminated Timber): excellent thermal mass, sustainable
- Passive house principles: orientation, insulation, air tightness
- Solar orientation: living areas south/south-east preferred
- Natural ventilation: cross-ventilation with windows on opposite walls

When answering:
1. Always cite specific Neufert dimensions when relevant
2. Relate advice to the 3×3m modular system when applicable
3. Be practical — suggest optimal and minimum dimensions
4. Consider Romanian building context when relevant
5. If unsure about a specific regulation, say so clearly
6. Use metric units exclusively (meters, square meters)
7. Keep answers concise but thorough — like a professional consultant`;

// Provider configuration — fallback chain: Together → Pollinations (free)
interface Provider {
  id: string;
  url: string;
  model: string;
  keyEnv?: string; // If set, requires this env var
  buildHeaders: (apiKey?: string) => Record<string, string>;
  buildBody: (messages: { role: string; content: string }[]) => object;
  extractReply: (data: unknown) => string | null;
}

const PROVIDERS: Provider[] = [
  {
    id: "together",
    url: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyEnv: "TOGETHER_API_KEY",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (messages) => ({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
    extractReply: (data: any) => data?.choices?.[0]?.message?.content || null,
  },
  {
    id: "pollinations",
    url: "https://text.pollinations.ai/openai",
    model: "openai",
    // No API key needed — free
    buildHeaders: () => ({ "Content-Type": "application/json" }),
    buildBody: (messages) => ({
      messages,
      model: "openai",
      max_tokens: 2048,
    }),
    extractReply: (data: any) => {
      const msg = data?.choices?.[0]?.message;
      // Pollinations may put answer in content or reasoning_content
      return msg?.content || msg?.reasoning_content || null;
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-20),
    ];

    // Try each provider in order
    for (const provider of PROVIDERS) {
      // Skip providers that need a missing API key
      const apiKey = provider.keyEnv ? process.env[provider.keyEnv] : undefined;
      if (provider.keyEnv && !apiKey) {
        console.log(`[consultant] ${provider.id}: no API key, skipping`);
        continue;
      }

      try {
        console.log(`[consultant] Trying ${provider.id}...`);
        const response = await fetch(provider.url, {
          method: "POST",
          headers: provider.buildHeaders(apiKey),
          body: JSON.stringify(provider.buildBody(fullMessages)),
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
          return NextResponse.json({ reply: reply.trim() });
        }
        console.warn(`[consultant] ${provider.id} returned empty reply`);
      } catch (err) {
        console.error(`[consultant] ${provider.id} exception:`, err);
      }
    }

    return NextResponse.json(
      { error: "All AI providers are temporarily unavailable. Please try again." },
      { status: 503 },
    );
  } catch (error) {
    console.error("Consultant API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
