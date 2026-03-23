/**
 * Utility to export SVG technical drawings as PDF or SVG files.
 *
 * Uses a client-side approach:
 *   SVG -> serialise -> Canvas -> image data -> minimal PDF wrapper
 *
 * No server round-trip or heavy library required.
 */

// ── helpers ──────────────────────────────────────────────────────────

function serializeSvg(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  // Ensure xmlns is set for standalone serialisation
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  return new XMLSerializer().serializeToString(clone);
}

function svgToDataUrl(svgString: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Small delay before cleanup so the browser picks up the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ── Canvas rendering ─────────────────────────────────────────────────

function renderSvgToCanvas(
  svgString: string,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Use 2x resolution for sharp output
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas 2d context"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Failed to load SVG into image"));
    img.src = svgToDataUrl(svgString);
  });
}

// ── Minimal PDF builder ──────────────────────────────────────────────
// Builds a single-page PDF containing a JPEG image of the drawing.
// This avoids any dependency on heavy PDF libraries while producing a
// standards-compliant PDF that opens in every viewer.

function buildPdf(jpegBytes: Uint8Array, pageW: number, pageH: number): Uint8Array {
  const enc = new TextEncoder();

  // We'll build the PDF objects as strings, tracking byte offsets.
  const objects: string[] = [];
  const offsets: number[] = [];

  // Helper: object number (1-based) to string
  const obj = (n: number) => `${n} 0 obj`;

  // Object 1 – Catalog
  objects.push(`${obj(1)}\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Object 2 – Pages
  objects.push(
    `${obj(2)}\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`
  );

  // Object 3 – Page
  objects.push(
    `${obj(3)}\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>\nendobj\n`
  );

  // Object 4 – Content stream (draws the image full-page)
  const stream = `q ${pageW} 0 0 ${pageH} 0 0 cm /Img Do Q`;
  objects.push(
    `${obj(4)}\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
  );

  // Object 5 – Image XObject (JPEG)
  // We need to know pixel dimensions. We can parse JPEG SOF0 marker, but
  // since we control the generation we pass them through closure.
  // Actually we need w/h in pixels – we'll parse the JPEG header.
  const jpegDims = parseJpegDimensions(jpegBytes);

  const imgHeader =
    `${obj(5)}\n<< /Type /XObject /Subtype /Image /Width ${jpegDims.width} /Height ${jpegDims.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  const imgFooter = `\nendstream\nendobj\n`;

  // Assemble the full PDF
  const header = "%PDF-1.4\n";

  // Calculate byte offsets
  let pos = header.length;
  for (let i = 0; i < 4; i++) {
    offsets.push(pos);
    pos += objects[i].length;
  }
  // Object 5 is special – partially binary
  offsets.push(pos);
  pos += imgHeader.length + jpegBytes.length + imgFooter.length;

  // Cross-reference table
  const xrefOffset = pos;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (const o of offsets) {
    xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Combine everything into a single Uint8Array
  const headerBytes = enc.encode(header);
  const obj1to4Bytes = enc.encode(objects.slice(0, 4).join(""));
  const imgHeaderBytes = enc.encode(imgHeader);
  const imgFooterBytes = enc.encode(imgFooter);
  const xrefBytes = enc.encode(xref);
  const trailerBytes = enc.encode(trailer);

  const totalLength =
    headerBytes.length +
    obj1to4Bytes.length +
    imgHeaderBytes.length +
    jpegBytes.length +
    imgFooterBytes.length +
    xrefBytes.length +
    trailerBytes.length;

  const pdf = new Uint8Array(totalLength);
  let offset = 0;

  const write = (bytes: Uint8Array) => {
    pdf.set(bytes, offset);
    offset += bytes.length;
  };

  write(headerBytes);
  write(obj1to4Bytes);
  write(imgHeaderBytes);
  write(jpegBytes);
  write(imgFooterBytes);
  write(xrefBytes);
  write(trailerBytes);

  return pdf;
}

/** Parse width/height from a JPEG's SOF0 marker */
function parseJpegDimensions(data: Uint8Array): {
  width: number;
  height: number;
} {
  let i = 2; // skip SOI (FFD8)
  while (i < data.length - 1) {
    if (data[i] !== 0xff) break;
    const marker = data[i + 1];
    // SOF0 or SOF2
    if (marker === 0xc0 || marker === 0xc2) {
      const height = (data[i + 5] << 8) | data[i + 6];
      const width = (data[i + 7] << 8) | data[i + 8];
      return { width, height };
    }
    const len = (data[i + 2] << 8) | data[i + 3];
    i += 2 + len;
  }
  // Fallback – shouldn't happen with valid JPEG
  return { width: 800, height: 900 };
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Find the SVG element rendered by TechnicalDrawing inside a container.
 * Falls back to the first SVG on the page if no container ref is given.
 */
export function findDrawingSvg(
  container?: HTMLElement | null
): SVGSVGElement | null {
  if (container) {
    return container.querySelector("svg");
  }
  // Fallback: look for the drawing SVG (viewBox="0 0 800 900")
  const allSvgs = document.querySelectorAll('svg[viewBox="0 0 800 900"]');
  return (allSvgs[0] as SVGSVGElement) ?? null;
}

/**
 * Download the current technical drawing as a PDF file.
 */
export async function downloadPdf(
  svgElement: SVGSVGElement,
  filename = "technical-drawing.pdf"
) {
  const svgString = serializeSvg(svgElement);
  // A3 landscape-ish proportions matching our 800x900 viewBox
  const pxW = 800;
  const pxH = 900;
  const canvas = await renderSvgToCanvas(svgString, pxW, pxH);

  // Get JPEG bytes from canvas
  const jpegBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.95
    );
  });

  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

  // PDF page size in points (A3 portrait: 842 x 1191)
  const pageW = 842;
  const pageH = 1191;

  const pdfBytes = buildPdf(jpegBytes, pageW, pageH);
  const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  downloadBlob(pdfBlob, filename);
}

/**
 * Download the current technical drawing as a standalone SVG file.
 */
export function downloadSvg(
  svgElement: SVGSVGElement,
  filename = "technical-drawing.svg"
) {
  const svgString = serializeSvg(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * Open the browser print dialog scoped to the drawing.
 */
export function printDrawing(svgElement: SVGSVGElement) {
  const svgString = serializeSvg(svgElement);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Technical Drawing – Print</title>
        <style>
          @page { size: A3 portrait; margin: 10mm; }
          body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${svgString}</body>
    </html>
  `);
  printWindow.document.close();
  // Give the browser a moment to render before printing
  setTimeout(() => {
    printWindow.print();
  }, 300);
}
