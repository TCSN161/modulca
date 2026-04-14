import { NextRequest, NextResponse } from "next/server";
import { prodiaUpscale, prodiaRemoveBackground } from "../engines/prodia";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai-render/upscale
 *
 * Upscale or enhance an existing render image.
 * Accepts base64 image in JSON body.
 *
 * Body: { image: string (base64), mode: "upscale" | "remove-bg" }
 * Returns: image/png
 *
 * Uses Prodia HypIR for upscaling, Prodia remove-background for bg removal.
 * Architect tier only (premium gets basic upscale).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mode = "upscale" } = body;

    if (!image) {
      return NextResponse.json({ error: "Missing 'image' field (base64)" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(image, "base64");
    if (imageBuffer.length < 500) {
      return NextResponse.json({ error: "Image too small" }, { status: 400 });
    }

    console.log(`[upscale] Processing ${mode}, input: ${imageBuffer.length} bytes`);

    let result: { buffer: Buffer; contentType: string } | null = null;

    if (mode === "remove-bg") {
      result = await prodiaRemoveBackground(imageBuffer);
    } else {
      result = await prodiaUpscale(imageBuffer);
    }

    if (!result) {
      return NextResponse.json(
        { error: `${mode} failed. Prodia may be unavailable.` },
        { status: 503 }
      );
    }

    console.log(`[upscale] Success: ${result.buffer.length} bytes`);

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": String(result.buffer.length),
        "X-AI-Engine": `prodia-${mode}`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[upscale] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
