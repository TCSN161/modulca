/**
 * Image processor — PNG/JPEG → WebP, with QR watermark + thumbnail.
 *
 * Runs on the Node server only (sharp is a native dependency).
 * Input: raw buffer from an engine. Output: 2 WebP buffers ready to upload.
 */

import sharp from "sharp";
import QRCode from "qrcode";

const FULL_MAX = 1600; // longest side for "full" preview
const THUMB_W = 400;
const THUMB_H = 300;
const WATERMARK_SIZE = 120; // QR size on full image, px

export interface ProcessedRender {
  fullBuffer: Buffer;
  fullContentType: "image/webp";
  thumbBuffer: Buffer;
  thumbContentType: "image/webp";
  fullSizeBytes: number;
  thumbSizeBytes: number;
  originalBytes: number;
  widthPx: number;
  heightPx: number;
}

export interface ProcessOptions {
  /** Embed this URL as a QR watermark in the bottom-right corner */
  watermarkUrl?: string;
  /** Opacity 0-1 for the QR watermark (default 0.65) */
  watermarkOpacity?: number;
}

export async function processRenderImage(
  input: Buffer,
  opts: ProcessOptions = {}
): Promise<ProcessedRender> {
  const originalBytes = input.length;

  // Decode + resize full version
  let fullImg = sharp(input, { limitInputPixels: 80_000_000 }).rotate();
  const metadata = await fullImg.metadata();
  fullImg = fullImg.resize({
    width: FULL_MAX,
    height: FULL_MAX,
    fit: "inside",
    withoutEnlargement: true,
  });

  // Apply QR watermark if requested
  if (opts.watermarkUrl) {
    const qrBuffer = await QRCode.toBuffer(opts.watermarkUrl, {
      type: "png",
      width: WATERMARK_SIZE,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    // Resize the QR slightly smaller + round-crop with soft alpha for elegance
    const qrProcessed = await sharp(qrBuffer)
      .resize(WATERMARK_SIZE, WATERMARK_SIZE)
      .composite([
        {
          input: Buffer.from(
            `<svg><rect x="0" y="0" width="${WATERMARK_SIZE}" height="${WATERMARK_SIZE}" rx="10" ry="10" fill="white" fill-opacity="${opts.watermarkOpacity ?? 0.65}"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    fullImg = fullImg.composite([
      {
        input: qrProcessed,
        gravity: "southeast",
        top: undefined,
        left: undefined,
      },
    ]);
  }

  const fullBuffer = await fullImg.webp({ quality: 85, effort: 4 }).toBuffer();

  // Separate pipeline for thumbnail — no watermark, tighter crop
  const thumbBuffer = await sharp(input, { limitInputPixels: 80_000_000 })
    .rotate()
    .resize({
      width: THUMB_W,
      height: THUMB_H,
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  return {
    fullBuffer,
    fullContentType: "image/webp",
    thumbBuffer,
    thumbContentType: "image/webp",
    fullSizeBytes: fullBuffer.length,
    thumbSizeBytes: thumbBuffer.length,
    originalBytes,
    widthPx: metadata.width || 0,
    heightPx: metadata.height || 0,
  };
}

/** Generate a URL-safe slug unique enough for galleries */
export function generateRenderSlug(engine: string, seed?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const rand = (seed || Math.random().toString(36)).slice(-6);
  return `${date}-${engine}-${rand}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}
