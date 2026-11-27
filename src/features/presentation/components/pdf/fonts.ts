/**
 * PDF font (BUG-ST32): react-pdf's built-in Helvetica has no ș ț ă, so the
 * presentation embeds Inter (OFL, same font as the site) from public/fonts/pdf.
 * 600 is registered as both 600 and bold (700): `fontWeight: "bold"` maps to it.
 */
import { Font } from "@react-pdf/renderer";

export const PDF_FONT = "Inter";

let registeredBase: string | null = null;

/**
 * @param base URL folder in the browser ("/fonts/pdf"), or an absolute folder
 *             path in Node (tests / offline render).
 */
export function registerPdfFonts(base = "/fonts/pdf"): void {
  if (registeredBase === base) return;
  const regular = `${base}/Inter-Regular.woff`;
  const semibold = `${base}/Inter-SemiBold.woff`;
  Font.register({
    family: PDF_FONT,
    fonts: [
      { src: regular, fontWeight: 400 },
      { src: semibold, fontWeight: 600 },
      { src: semibold, fontWeight: 700 },
    ],
  });
  // No English hyphenation inside words (ST30, and wrong for RO/NL anyway)
  Font.registerHyphenationCallback((word) => [word]);
  registeredBase = base;
}
