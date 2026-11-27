/** react-pdf theme: template colours + the shared StyleSheet (split from PdfGenerator.tsx). */
import { StyleSheet } from "@react-pdf/renderer";
import { PDF_FONT } from "./fonts";

export interface PdfTheme { accent: string; bg: string; text: string }

export const TMPL: Record<string, PdfTheme> = {
  minimal: { accent: "#C8956C", bg: "#FFFFFF", text: "#1a1a1a" },
  bold: { accent: "#F59E0B", bg: "#111111", text: "#FFFFFF" },
  classic: { accent: "#1D6B6B", bg: "#F8F6F2", text: "#2A2A2A" },
  luxury: { accent: "#C5A572", bg: "#0A0A0A", text: "#FFFFFF" },
  architect: { accent: "#333333", bg: "#FFFFFF", text: "#1a1a1a" },
};

export const MODULE_COLORS: Record<string, string> = {
  bedroom: "#4A90D9",
  kitchen: "#E8913A",
  bathroom: "#2ABFBF",
  living: "#6BBF59",
  office: "#8B6DB5",
  storage: "#8E99A4",
};

export function makeStyles(t: PdfTheme) {
  return StyleSheet.create({
    page: {
      backgroundColor: t.bg,
      paddingHorizontal: 48,
      paddingVertical: 40,
      fontFamily: PDF_FONT,
    },
    accentBar: { width: 60, height: 4, backgroundColor: t.accent, marginBottom: 16 },
    title: { fontSize: 28, fontWeight: "bold", color: t.text, marginBottom: 6 },
    subtitle: { fontSize: 14, color: t.text, opacity: 0.6, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: t.accent, marginBottom: 12 },
    body: { fontSize: 10, color: t.text, lineHeight: 1.6 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: t.text === "#FFFFFF" ? "#333" : "#ddd",
    },
    label: { fontSize: 10, color: t.text, opacity: 0.6, width: "50%" },
    value: { fontSize: 10, color: t.text, fontWeight: "bold", width: "50%", textAlign: "right" },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 6, marginBottom: 6 },
    badgeText: { fontSize: 8, color: "#FFFFFF", fontWeight: "bold" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    card: {
      width: "48%",
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: t.text === "#FFFFFF" ? "#333" : "#e5e5e5",
      marginBottom: 8,
    },
    swatch: { width: 20, height: 20, borderRadius: 3, marginRight: 8 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 48,
      right: 48,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: t.text,
      opacity: 0.3,
    },
  });
}

export type PdfStyles = ReturnType<typeof makeStyles>;
