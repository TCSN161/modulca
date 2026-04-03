import { NextResponse } from "next/server";
import type { EngineInfo } from "./types";

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
];

export async function GET() {
  return NextResponse.json(ENGINE_LIST);
}
