import { Page, Text, View } from "@react-pdf/renderer";
import type { ModuleConfig } from "@/features/design/store";
import { gridBounds } from "../../hooks/pdfPlan";
import { MODULE_COLORS, type PdfStyles, type PdfTheme } from "./theme";
import type { PresentationT } from "../../i18n";

export function SlidePage({
  children,
  slideLabel,
  s,
  watermark,
}: {
  children: React.ReactNode;
  slideLabel: string;
  s: PdfStyles;
  /** Free-tier watermark text, or undefined */
  watermark?: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      {children}
      <View style={s.footer}>
        <Text>{slideLabel}</Text>
        {/* BUG-ST23: real page numbers from react-pdf (the hand-counted total ignored extra pages) */}
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
      {watermark && (
        <Text style={{
          position: "absolute",
          top: "45%",
          left: "20%",
          fontSize: 48,
          color: "#000000",
          opacity: 0.04,
          transform: "rotate(-30deg)",
        }}>
          {watermark}
        </Text>
      )}
    </Page>
  );
}

/** ST26 fallback: module grid footprint (3 m cells) when no plot polygon exists. */
export function ModuleFootprint({ modules, s, theme, t }: {
  modules: ModuleConfig[];
  s: PdfStyles;
  theme: PdfTheme;
  t: PresentationT;
}) {
  const b = gridBounds(modules);
  const cell = Math.max(18, Math.min(48, Math.floor(Math.min(420 / Math.max(b.cols, 1), 260 / Math.max(b.rows, 1)))));
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ ...s.body, opacity: 0.6, marginBottom: 8 }}>{t("site.noPlot")}</Text>
      <View style={{ position: "relative", width: b.cols * cell, height: b.rows * cell }}>
        {modules.map((m, i) => (
          <View key={i} style={{
            position: "absolute",
            left: (m.col - b.minCol) * cell,
            top: (m.row - b.minRow) * cell,
            width: cell - 2,
            height: cell - 2,
            backgroundColor: MODULE_COLORS[m.moduleType] || "#888",
            borderRadius: 2,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 6, color: "#FFFFFF" }}>{t.moduleType(m.moduleType).slice(0, 4).toUpperCase()}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 7, color: theme.text, opacity: 0.4, marginTop: 6 }}>
        {t("site.overall", { w: b.cols * 3, h: b.rows * 3 })}
      </Text>
    </View>
  );
}
