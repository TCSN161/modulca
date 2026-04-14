import { NextResponse } from "next/server";
import type { EngineInfo } from "./types";

/** Dynamic so engine list can reflect available keys at runtime. */
export const dynamic = "force-dynamic";

/**
 * GET /api/ai-render/engines
 * Returns the list of available AI render engines for the UI dropdown.
 */

const ENGINE_LIST: EngineInfo[] = [
  {
    id: "pollinations",
    label: "Pollinations AI",
    description: "Free, no auth, fast (~30-90s)",
    speed: "fast",
  },
  {
    id: "ai-horde",
    label: "AI Horde",
    description: "Free community GPUs, slower but reliable",
    speed: "slow",
  },
  {
    id: "stability",
    label: "Stability AI (img2img)",
    description: "Uses 3D scene as base. Requires API key.",
    speed: "medium",
  },
  {
    id: "together",
    label: "Together.ai FLUX",
    description: "Free unlimited 3 months. Fast FLUX model.",
    speed: "fast",
  },
  {
    id: "leonardo",
    label: "Leonardo.ai",
    description: "150 free/day. Photorealistic alchemy.",
    speed: "medium",
  },
];

export async function GET() {
  try {
    return NextResponse.json(ENGINE_LIST);
  } catch (error) {
    console.error("[api/ai-render/engines] GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve engine list" },
      { status: 500 },
    );
  }
}
