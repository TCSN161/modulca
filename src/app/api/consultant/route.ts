import { NextRequest, NextResponse } from "next/server";

/**
 * Neufert AI Architectural Consultant — API route
 * Uses Together API (Llama/Mixtral) with a Neufert-based system prompt.
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

// Provider configuration — swap here to change AI backend
const PROVIDERS = {
  together: {
    url: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyEnv: "TOGETHER_API_KEY",
  },
  // Future: add openai, anthropic, etc.
};

const PROVIDER = PROVIDERS.together;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const apiKey = process.env[PROVIDER.keyEnv];
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured. Add API key to .env.local" },
        { status: 503 },
      );
    }

    const response = await fetch(PROVIDER.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PROVIDER.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20), // Keep context window manageable
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI API error:", err);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Consultant API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
