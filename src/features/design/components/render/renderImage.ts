/**
 * Image helpers for the render step (BUG-ST27, BUG-ST03).
 *
 * Saved renders live inside projects.data (JSONB) and localStorage, so they are
 * stored as JPEG data URIs, at most 1024 px on the long side, quality 0.82:
 * about 80–200 KB each instead of 1–3 MB for the raw PNG. The same helper makes
 * the img2img base image (contract: JPEG ≈0.85, ≤1024 px, body < 1 MB).
 */

export const STORED_RENDER_MAX_SIDE = 1024;
export const STORED_RENDER_QUALITY = 0.82;
export const BASE_IMAGE_QUALITY = 0.85;

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("image decode timeout")), 10_000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("image decode failed")); };
    img.src = src;
  });
}

/**
 * Re-encode any image (data URI, blob: URL or http URL) as a JPEG data URI that
 * fits `maxSide`. Falls back to the input as a data URI when canvas is not
 * available (tests, old browsers), so callers never lose the image.
 */
export async function toJpegDataUrl(
  src: string,
  maxSide = STORED_RENDER_MAX_SIDE,
  quality = STORED_RENDER_QUALITY,
): Promise<string> {
  let dataUrl = src;
  if (!src.startsWith("data:")) {
    const blob = await (await fetch(src)).blob();
    dataUrl = await blobToDataUrl(blob);
  }
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.fillStyle = "#ffffff"; // JPEG has no alpha: flatten on white
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL("image/jpeg", quality);
    return out.startsWith("data:image/jpeg") ? out : dataUrl;
  } catch {
    return dataUrl;
  }
}
