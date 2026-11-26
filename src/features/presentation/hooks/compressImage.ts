"use client";

/**
 * BUG-ST25: renders are stored as ~1024 px PNG data URLs (≈0.5 MB each).
 * Re-encode as JPEG before react-pdf embeds them. On any failure (CORS, decode)
 * the original src is returned, so the PDF never loses an image.
 */
export async function compressForPdf(src: string, maxSide = 1024, quality = 0.72): Promise<string> {
  if (typeof document === "undefined" || !src) return src;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode"));
      img.src = src;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL("image/jpeg", quality);
    return out.length < src.length ? out : src;
  } catch {
    return src;
  }
}
