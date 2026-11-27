"use client";

/**
 * react-pdf presentation: document + download button.
 * Pages live in ./pdf/* (split 3.08, was 733 lines). Strings follow the locale
 * (BUG-ST32), costs come from computeProjectCost (BUG-ST31), captions are cut
 * at word boundaries (ST30), render captions show the fallback chain (ST29).
 */
import { useState } from "react";
import { Document, pdf } from "@react-pdf/renderer";
import { presentationFileName } from "../hooks/projectName";
import { curateRenders } from "../hooks/pdfPlan";
import { compressForPdf } from "../hooks/compressImage";
import { presentationT } from "../i18n";
import { registerPdfFonts } from "./pdf/fonts";
import { TMPL, makeStyles } from "./pdf/theme";
import { coverPages, descriptionPages, sitePages, floorplanPages, visionPages, modulePages } from "./pdf/overviewPages";
import { renderPages, materialPages, productPages, costPages, nextPages } from "./pdf/detailPages";
import type { PdfCtx, PdfDocumentProps } from "./pdf/types";

export type { PdfDocumentProps } from "./pdf/types";

const BUILDERS: Record<string, (c: PdfCtx) => React.ReactNode[]> = {
  cover: coverPages,
  description: descriptionPages,
  site: sitePages,
  floorplan: floorplanPages,
  vision: visionPages,
  modules: modulePages,
  renders: renderPages,
  materials: materialPages,
  products: productPages,
  cost: costPages,
  next: nextPages,
};

/** Call registerPdfFonts() first (the download button does; tests pass a folder). */
export function PresentationDocument(props: PdfDocumentProps) {
  const theme = TMPL[props.template] ?? TMPL.minimal;
  const t = presentationT(props.locale);
  const ctx: PdfCtx = {
    props,
    t,
    s: makeStyles(theme),
    theme,
    finishName: t.finish(props.finishLevel),
    label: (id) => t(`slide.${id}.label`),
  };
  const pages = props.slides
    .filter((sl) => sl.enabled && BUILDERS[sl.id])
    .flatMap((sl) => BUILDERS[sl.id](ctx));
  return <Document title={props.projectName} language={t.locale}>{pages}</Document>;
}

/* ------------------------------------------------------------------ */
/*  Export: PdfDownloadButton                                          */
/* ------------------------------------------------------------------ */

export default function PdfDownloadButton(props: PdfDocumentProps) {
  const [loading, setLoading] = useState(false);
  const t = presentationT(props.locale);

  const handleDownload = async () => {
    setLoading(true);
    try {
      registerPdfFonts();
      // BUG-ST25: embed only the curated renders, re-encoded as JPEG (was 29 PNGs → 14.9 MB)
      const pdfRenders = await Promise.all(
        curateRenders(props.savedRenders).map(async (r) => ({ ...r, imageUrl: await compressForPdf(r.imageUrl) })),
      );
      const blob = await pdf(<PresentationDocument {...props} savedRenders={pdfRenders} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = presentationFileName(props.projectName); // BUG-ST07
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(t("ui.pdfFailed"));
      window.print();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t("ui.generating")}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t("ui.downloadPdf")}
        </>
      )}
    </button>
  );
}
