"use client";

import { useState } from "react";
import {
  Document, Page, Text, View, Image, StyleSheet, pdf,
} from "@react-pdf/renderer";
import type { ModuleConfig, SavedRender } from "@/features/design/store";
import type { StyleDirection } from "@/features/design/styles";
import type { PresentationStyle, SlideConfig } from "./PresentationPage";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PdfProps {
  presentationStyle: PresentationStyle;
  slides: SlideConfig[];
  projectName: string;
  clientName: string;
  modules: ModuleConfig[];
  stats: {
    totalModules: number; totalArea: number; usableArea: number;
    sharedWalls: number; moduleCost: number; sharedWallDiscount: number;
    wallUpgradeCost: number; designFee: number; totalEstimate: number;
  };
  style: StyleDirection | null;
  finishLabel: string;
  polygon: { lat: number; lng: number }[];
  mapCenter: { lat: number; lng: number };
  products: { name: string; quantity: number; price: number }[];
  savedRenders: SavedRender[];
  qrCodeDataUrl?: string;
  isFreeUser?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Style tokens per presentation style                               */
/* ------------------------------------------------------------------ */

interface TokenSet {
  accent: string;
  bg: string;
  text: string;
  surface: string;
  dark: string;
  label: (s: string) => string;
}

const TOKENS: Record<PresentationStyle, TokenSet> = {
  brochure: {
    accent: "#C8956C",
    bg: "#FFFFFF",
    text: "#1A1A1A",
    surface: "#F5F2EE",
    dark: "#1A1209",
    label: (s: string) => s.toUpperCase(),
  },
  portfolio: {
    accent: "#2D5A52",
    bg: "#F8F6F2",
    text: "#2A2A2A",
    surface: "#ECEAE4",
    dark: "#1C2B2A",
    label: (s: string) => s,
  },
};

const MODULE_COLORS: Record<string, string> = {
  bedroom: "#4A90D9", kitchen: "#E8913A", bathroom: "#2ABFBF",
  living: "#6BBF59", office: "#8B6DB5", storage: "#8E99A4",
  hallway: "#D4A76A", terrace: "#68B584",
};

/* ------------------------------------------------------------------ */
/*  Shared stylesheet factory                                          */
/* ------------------------------------------------------------------ */

function makeStyles(t: TokenSet) {
  return StyleSheet.create({
    page: { backgroundColor: t.bg, fontFamily: "Helvetica" },
    pagePad: { backgroundColor: t.bg, fontFamily: "Helvetica", paddingHorizontal: 52, paddingVertical: 44 },
    // Typography
    h1: { fontSize: 36, fontWeight: "bold", color: t.text },
    h2: { fontSize: 22, fontWeight: "bold", color: t.text },
    h3: { fontSize: 16, fontWeight: "bold", color: t.accent },
    body: { fontSize: 10, color: t.text, lineHeight: 1.6 },
    small: { fontSize: 8, color: t.text },
    label: { fontSize: 8, color: t.text, opacity: 0.45, letterSpacing: 0.8 },
    // Layout
    row: { flexDirection: "row" },
    col: { flex: 1 },
    spacer8: { height: 8 },
    spacer16: { height: 16 },
    spacer24: { height: 24 },
    // Components
    accentBar: { width: 48, height: 3, backgroundColor: t.accent, marginBottom: 20 },
    divider: { height: 0.75, backgroundColor: t.text, opacity: 0.1, marginVertical: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: t.accent },
    badgeText: { fontSize: 8, color: "#FFFFFF", fontWeight: "bold" },
    card: {
      padding: 12, borderRadius: 6, borderWidth: 1,
      borderColor: t.text === "#FFFFFF" ? "#333" : "#E0DDD7",
      marginBottom: 8, backgroundColor: t.surface,
    },
    swatch: { width: 28, height: 28, borderRadius: 4, marginRight: 6 },
    footer: {
      position: "absolute", bottom: 20, left: 52, right: 52,
      flexDirection: "row", justifyContent: "space-between",
    },
    footerText: { fontSize: 7, color: t.text, opacity: 0.25 },
    watermark: {
      position: "absolute", top: "45%", left: "20%",
      fontSize: 44, color: "#000000", opacity: 0.03,
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */

function Pg({
  children, label, pageNum, total, s, free, noPad,
}: {
  children: React.ReactNode; label: string; pageNum: number; total: number;
  s: ReturnType<typeof makeStyles>; t?: TokenSet;
  free?: boolean; noPad?: boolean;
}) {
  return (
    <Page size="A4" orientation="landscape" style={noPad ? s.page : s.pagePad}>
      {children}
      <View style={s.footer}>
        <Text style={s.footerText}>ModulCA · {label}</Text>
        <Text style={s.footerText}>{pageNum} / {total}</Text>
      </View>
      {free && (
        <Text style={s.watermark}>ModulCA Free — tcsn161.github.io/modulca</Text>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components for PDF                                      */
/* ------------------------------------------------------------------ */

function SectionHeader({ title, s }: { title: string; s: ReturnType<typeof makeStyles>; t?: TokenSet }) {
  return (
    <View>
      <View style={s.accentBar} />
      <Text style={s.h3}>{title}</Text>
      <View style={{ height: 16 }} />
    </View>
  );
}

function DataRow({ label, value, s, accent }: { label: string; value: string; s: ReturnType<typeof makeStyles>; t?: TokenSet; accent?: boolean }) {
  return (
    <View style={{ ...s.row, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#DDDDDD" }}>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 10, fontWeight: accent ? "bold" : "normal", color: accent ? "#C8956C" : "#1A1A1A" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Floor plan SVG-like drawing in react-pdf                          */
/* ------------------------------------------------------------------ */

function PdfFloorPlan({ modules, t }: { modules: ModuleConfig[]; t: TokenSet }) {
  if (modules.length === 0) return null;
  const minR = Math.min(...modules.map((m) => m.row));
  const maxR = Math.max(...modules.map((m) => m.row));
  const minC = Math.min(...modules.map((m) => m.col));
  const maxC = Math.max(...modules.map((m) => m.col));
  const CELL = 52;
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const planW = cols * CELL;
  const planH = rows * CELL;

  return (
    <View style={{ position: "relative", width: planW, height: planH }}>
      {modules.map((mod) => {
        const x = (mod.col - minC) * CELL;
        const y = (mod.row - minR) * CELL;
        const color = MODULE_COLORS[mod.moduleType] || "#999";
        return (
          <View
            key={`${mod.row}-${mod.col}`}
            style={{
              position: "absolute",
              left: x + 1, top: y + 1,
              width: CELL - 2, height: CELL - 2,
              backgroundColor: color,
              opacity: 0.22,
              borderWidth: 1.5,
              borderColor: color,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: "bold", color: t.text }}>{mod.label}</Text>
            <Text style={{ fontSize: 6, color: t.text, opacity: 0.5 }}>3×3m</Text>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Elevation drawing in react-pdf                                    */
/* ------------------------------------------------------------------ */

function PdfElevation({ modules, t }: { modules: ModuleConfig[]; t: TokenSet }) {
  const minRow = Math.min(...modules.map((m) => m.row));
  const front = modules.filter((m) => m.row === minRow).sort((a, b) => a.col - b.col);
  if (front.length === 0) return null;

  const CELL_W = 60;
  const CELL_H = 50;
  const totalW = front.length * CELL_W;

  return (
    <View style={{ width: totalW + 20, height: CELL_H + 20, position: "relative", marginTop: 8 }}>
      {/* Ground line */}
      <View style={{ position: "absolute", bottom: 10, left: 0, right: 0, height: 1.5, backgroundColor: t.text, opacity: 0.3 }} />
      {front.map((mod, i) => {
        const color = MODULE_COLORS[mod.moduleType] || "#999";
        const hasWindow = mod.wallConfigs.south === "window";
        const hasDoor = mod.wallConfigs.south === "door";
        return (
          <View key={i} style={{
            position: "absolute",
            left: i * CELL_W,
            bottom: 11,
            width: CELL_W,
            height: CELL_H,
            backgroundColor: color,
            opacity: 0.25,
            borderWidth: 1,
            borderColor: color,
          }}>
            {/* Label */}
            <Text style={{ fontSize: 7, fontWeight: "bold", color: t.text, textAlign: "center", marginTop: 4 }}>{mod.label}</Text>
            {/* Window indicator */}
            {hasWindow && (
              <View style={{
                position: "absolute", left: 8, right: 8, top: 16, height: CELL_H - 28,
                backgroundColor: "#BAE6FD", borderWidth: 1, borderColor: t.accent,
              }} />
            )}
            {/* Door indicator */}
            {hasDoor && (
              <View style={{
                position: "absolute", left: CELL_W / 2 - 8, bottom: 0, width: 16, height: 18,
                backgroundColor: t.accent, opacity: 0.5,
              }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  The PDF Document                                                   */
/* ------------------------------------------------------------------ */

function PresentationDocument(props: PdfProps) {
  const tk = TOKENS[props.presentationStyle];
  const s = makeStyles(tk);
  const enabled = props.slides.filter((sl) => sl.enabled);
  const free = props.isFreeUser;
  const heroRender = props.savedRenders[0] ?? null;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Count total pages (renders may generate extra pages)
  const renderPages = props.savedRenders.length > 0
    ? Math.ceil(props.savedRenders.length / (props.presentationStyle === "brochure" ? 1 : 2))
    : 1;
  const extraRenderPages = renderPages - 1;
  const total = enabled.length + extraRenderPages;

  let pageNum = 0;
  const pages: React.ReactNode[] = [];

  for (const slide of enabled) {
    pageNum++;
    const pn = pageNum;
    const pgProps = { s, free, label: slide.label, pageNum: pn, total };

    switch (slide.id) {

      /* ── COVER ──────────────────────────────────────────────────── */
      case "cover": {
        if (props.presentationStyle === "brochure" && heroRender) {
          pages.push(
            <Pg key="cover" {...pgProps} noPad>
              {/* Full-bleed hero image */}
              <Image src={heroRender.imageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
              {/* Gradient overlay */}
              <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.52)" }} />
              {/* Top bar */}
              <View style={{ position: "absolute", top: 32, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#FFFFFF" }}>
                  Modul<Text style={{ color: tk.accent }}>CA</Text>
                </Text>
                <Text style={{ fontSize: 8, color: "#FFFFFF", opacity: 0.5 }}>{date}</Text>
              </View>
              {/* Center: title */}
              <View style={{ position: "absolute", top: "28%", left: 52, right: 52 }}>
                <View style={{ width: 44, height: 3, backgroundColor: tk.accent, marginBottom: 20 }} />
                <Text style={{ fontSize: 42, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10 }}>
                  {props.projectName}
                </Text>
                {props.clientName ? (
                  <Text style={{ fontSize: 14, color: "#FFFFFF", opacity: 0.65, marginBottom: 6 }}>
                    Prepared for {props.clientName}
                  </Text>
                ) : null}
              </View>
              {/* Bottom stats */}
              <View style={{ position: "absolute", bottom: 48, left: 52, right: 52, flexDirection: "row", gap: 48 }}>
                {[
                  { v: `${props.stats.totalModules}`, l: "MODULES" },
                  { v: `${props.stats.totalArea}m²`, l: "BUILT AREA" },
                  { v: `EUR ${Math.round(props.stats.totalEstimate / 1000)}k`, l: "ESTIMATE" },
                  { v: props.style?.label ?? "Modern", l: "STYLE" },
                ].map((stat, i) => (
                  <View key={i}>
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#FFFFFF" }}>{stat.v}</Text>
                    <Text style={{ fontSize: 7, color: "#FFFFFF", opacity: 0.45, letterSpacing: 1.5 }}>{stat.l}</Text>
                  </View>
                ))}
              </View>
            </Pg>
          );
        } else {
          // Portfolio cover OR brochure without renders
          const darkBg = props.presentationStyle === "brochure" ? "#1A1209" : tk.dark;
          pages.push(
            <Pg key="cover" {...pgProps} noPad>
              <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: darkBg }} />
              {/* Decorative grid lines (portfolio) */}
              {props.presentationStyle === "portfolio" && (
                <>
                  <View style={{ position: "absolute", top: 0, left: 120, width: 0.5, height: "100%", backgroundColor: tk.accent, opacity: 0.15 }} />
                  <View style={{ position: "absolute", top: 0, left: 240, width: 0.5, height: "100%", backgroundColor: tk.accent, opacity: 0.08 }} />
                  <View style={{ position: "absolute", top: "33%", left: 0, width: "100%", height: 0.5, backgroundColor: tk.accent, opacity: 0.15 }} />
                </>
              )}
              <View style={{ position: "absolute", top: 32, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#FFFFFF" }}>
                  Modul<Text style={{ color: tk.accent }}>CA</Text>
                </Text>
                <Text style={{ fontSize: 8, color: "#FFFFFF", opacity: 0.5 }}>{date}</Text>
              </View>
              <View style={{ position: "absolute", top: "30%", left: 52, right: "35%" }}>
                <View style={{ width: 40, height: 3, backgroundColor: tk.accent, marginBottom: 20 }} />
                <Text style={{ fontSize: 40, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10 }}>{props.projectName}</Text>
                {props.clientName ? (
                  <Text style={{ fontSize: 13, color: "#FFFFFF", opacity: 0.6, marginBottom: 6 }}>Prepared for {props.clientName}</Text>
                ) : null}
                <Text style={{ fontSize: 9, color: "#FFFFFF", opacity: 0.35, marginTop: 8 }}>{date}</Text>
              </View>
              <View style={{ position: "absolute", bottom: 48, left: 52, right: 52, flexDirection: "row", gap: 40 }}>
                {[
                  { v: `${props.stats.totalModules}`, l: "MODULES" },
                  { v: `${props.stats.totalArea}m²`, l: "AREA" },
                  { v: `EUR ${Math.round(props.stats.totalEstimate / 1000)}k`, l: "ESTIMATE" },
                  { v: props.finishLabel, l: "FINISH" },
                ].map((stat, i) => (
                  <View key={i}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF" }}>{stat.v}</Text>
                    <Text style={{ fontSize: 7, color: "#FFFFFF", opacity: 0.4, letterSpacing: 1.5 }}>{stat.l}</Text>
                  </View>
                ))}
              </View>
            </Pg>
          );
        }
        break;
      }

      /* ── OVERVIEW ───────────────────────────────────────────────── */
      case "overview": {
        const moduleTypes = Array.from(new Set(props.modules.map((m) => m.moduleType)));
        pages.push(
          <Pg key="overview" {...pgProps}>
            <SectionHeader title="Project Overview" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 32 }}>
              {/* Left: description + key specs grid */}
              <View style={{ flex: 1 }}>
                <Text style={{ ...s.body, opacity: 0.65, marginBottom: 16 }}>
                  {props.style
                    ? `A ${props.style.label.toLowerCase()} residence designed around ${props.stats.totalModules} modular unit${props.stats.totalModules !== 1 ? "s" : ""} — ${props.stats.totalArea}m² total, ${props.stats.usableArea}m² usable living space. ${props.style.description.substring(0, 120)}…`
                    : `A modular residence of ${props.stats.totalModules} unit${props.stats.totalModules !== 1 ? "s" : ""} totalling ${props.stats.totalArea}m² gross area (${props.stats.usableArea}m² usable). Designed with ModulCA modular construction platform.`}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[
                    { label: "Total Modules", value: `${props.stats.totalModules}` },
                    { label: "Built Area", value: `${props.stats.totalArea} m²` },
                    { label: "Usable Area", value: `${props.stats.usableArea} m²` },
                    { label: "Finish Level", value: props.finishLabel },
                    { label: "Shared Walls", value: `${props.stats.sharedWalls}` },
                    { label: "AI Renders", value: `${props.savedRenders.length}` },
                  ].map(({ label, value }) => (
                    <View key={label} style={{ width: "31%", padding: 10, backgroundColor: tk.surface, borderRadius: 6, marginBottom: 4 }}>
                      <Text style={{ ...s.label, marginBottom: 3 }}>{label.toUpperCase()}</Text>
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: tk.accent }}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Right: module breakdown bars */}
              <View style={{ width: 180 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>MODULE BREAKDOWN</Text>
                {moduleTypes.map((type) => {
                  const count = props.modules.filter((m) => m.moduleType === type).length;
                  const pct = count / props.modules.length;
                  const color = MODULE_COLORS[type] || "#999";
                  return (
                    <View key={type} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                        <Text style={{ fontSize: 9, color: tk.text, textTransform: "capitalize" }}>{type}</Text>
                        <Text style={{ fontSize: 9, color: tk.text, fontWeight: "bold" }}>{count}</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: tk.surface, borderRadius: 3 }}>
                        <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: color, borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── SITE ───────────────────────────────────────────────────── */
      case "site": {
        pages.push(
          <Pg key="site" {...pgProps}>
            <SectionHeader title="Location & Site" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 32 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...s.label, marginBottom: 8 }}>SITE PLAN — BUILDING FOOTPRINT</Text>
                <View style={{ backgroundColor: tk.surface, borderRadius: 6, padding: 16, alignItems: "center", justifyContent: "center", minHeight: 180 }}>
                  <PdfFloorPlan modules={props.modules} t={tk} />
                  <Text style={{ fontSize: 7, color: tk.text, opacity: 0.4, marginTop: 8 }}>
                    Scale: each cell = 3m × 3m · North ↑
                  </Text>
                </View>
              </View>
              <View style={{ width: 240 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>SITE DATA</Text>
                {[
                  { label: "Coordinates", value: props.mapCenter.lat !== 44.4268 ? `${props.mapCenter.lat.toFixed(5)}°N, ${props.mapCenter.lng.toFixed(5)}°E` : "Romania (default)" },
                  { label: "Polygon Vertices", value: props.polygon.length > 0 ? `${props.polygon.length}` : "Auto-boundary" },
                  { label: "Built Area", value: `${props.stats.totalArea} m²` },
                  { label: "Usable Area", value: `${props.stats.usableArea} m²` },
                  { label: "Module Count", value: `${props.stats.totalModules}` },
                  { label: "Footprint Width", value: `${(Math.max(...props.modules.map(m => m.col)) - Math.min(...props.modules.map(m => m.col)) + 1) * 3}m` },
                  { label: "Footprint Depth", value: `${(Math.max(...props.modules.map(m => m.row)) - Math.min(...props.modules.map(m => m.row)) + 1) * 3}m` },
                ].map(({ label, value }) => (
                  <DataRow key={label} label={label} value={value} s={s} />
                ))}
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── FLOOR PLAN ─────────────────────────────────────────────── */
      case "floorplan": {
        const minC2 = Math.min(...props.modules.map(m => m.col));
        const maxC2 = Math.max(...props.modules.map(m => m.col));
        const minR2 = Math.min(...props.modules.map(m => m.row));
        const maxR2 = Math.max(...props.modules.map(m => m.row));
        const fpCols = maxC2 - minC2 + 1;
        const fpRows = maxR2 - minR2 + 1;

        pages.push(
          <Pg key="floorplan" {...pgProps}>
            <SectionHeader title="Floor Plan" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 32 }}>
              <View style={{ flex: 1, alignItems: "center" }}>
                <PdfFloorPlan modules={props.modules} t={tk} />
                <Text style={{ fontSize: 7, color: tk.text, opacity: 0.35, marginTop: 10 }}>
                  Scale 1:100 (indicative) · {fpCols * 3}m × {fpRows * 3}m footprint · ↑ North
                </Text>
              </View>
              <View style={{ width: 200 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>LEGEND</Text>
                {Array.from(new Set(props.modules.map((m) => m.moduleType))).map((type) => {
                  const count = props.modules.filter((m) => m.moduleType === type).length;
                  const color = MODULE_COLORS[type] || "#999";
                  return (
                    <View key={type} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View style={{ width: 16, height: 16, backgroundColor: color, opacity: 0.75, borderRadius: 3, marginRight: 8 }} />
                      <View>
                        <Text style={{ fontSize: 9, fontWeight: "bold", color: tk.text, textTransform: "capitalize" }}>{type}</Text>
                        <Text style={{ fontSize: 8, color: tk.text, opacity: 0.45 }}>{count} × 9m² · {count * 7}m² usable</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={{ marginTop: 16, padding: 10, backgroundColor: tk.surface, borderRadius: 6 }}>
                  <Text style={{ ...s.label, marginBottom: 4 }}>DIMENSIONS</Text>
                  <Text style={{ fontSize: 9, color: tk.text }}>Module: 3.00m × 3.00m ext.</Text>
                  <Text style={{ fontSize: 9, color: tk.text }}>Interior: 2.40m × 2.40m</Text>
                  <Text style={{ fontSize: 9, color: tk.text }}>Wall: 0.30m thick</Text>
                  <Text style={{ fontSize: 9, color: tk.text }}>Height: 2.70m clear</Text>
                </View>
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── AI RENDERS ─────────────────────────────────────────────── */
      case "renders": {
        if (props.savedRenders.length === 0) {
          pages.push(
            <Pg key="renders-empty" {...pgProps}>
              <SectionHeader title="AI Renders" s={s} t={tk} />
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ ...s.body, opacity: 0.35, fontSize: 13 }}>No AI renders saved yet.</Text>
                <Text style={{ ...s.small, opacity: 0.25, marginTop: 6 }}>
                  Generate renders in Step 8 and click &quot;Save to Presentation&quot;.
                </Text>
              </View>
            </Pg>
          );
        } else if (props.presentationStyle === "brochure") {
          // Brochure: one full-bleed render per page
          props.savedRenders.forEach((render, i) => {
            const lbl = `AI Renders${props.savedRenders.length > 1 ? ` (${i + 1}/${props.savedRenders.length})` : ""}`;
            pages.push(
              <Pg key={`render-${i}`} {...pgProps} pageNum={pn + i} total={total} label={lbl} noPad>
                <Image src={render.imageUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.55)" }} />
                <View style={{ position: "absolute", bottom: 28, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "bold", color: "#FFFFFF" }}>{render.label}</Text>
                    <Text style={{ fontSize: 9, color: "#FFFFFF", opacity: 0.5, marginTop: 2 }}>{render.moduleType}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: tk.accent, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: "bold", color: "#FFFFFF" }}>{render.engine}</Text>
                  </View>
                </View>
              </Pg>
            );
          });
          // Adjust page counter
          pageNum += props.savedRenders.length - 1;
        } else {
          // Portfolio: 2 per page
          const perPage = 2;
          const renderPageCount = Math.ceil(props.savedRenders.length / perPage);
          for (let rp = 0; rp < renderPageCount; rp++) {
            const chunk = props.savedRenders.slice(rp * perPage, (rp + 1) * perPage);
            const lbl = renderPageCount > 1 ? `AI Renders (${rp + 1}/${renderPageCount})` : "AI Renders";
            pages.push(
              <Pg key={`renders-${rp}`} {...pgProps} pageNum={pn + rp} total={total} label={lbl}>
                <SectionHeader title="AI Renders" s={s} t={tk} />
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {chunk.map((render, i) => (
                    <View key={i} style={{ flex: 1 }}>
                      <Image src={render.imageUrl} style={{ width: "100%", height: 200, borderRadius: 6 }} />
                      <View style={{ marginTop: 6, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 9, fontWeight: "bold", color: tk.text }}>{render.label}</Text>
                        <Text style={{ fontSize: 8, color: tk.accent }}>{render.engine}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: tk.text, opacity: 0.45 }}>{render.moduleType}</Text>
                    </View>
                  ))}
                </View>
              </Pg>
            );
          }
          pageNum += renderPageCount - 1;
        }
        break;
      }

      /* ── STYLE & MATERIALS ──────────────────────────────────────── */
      case "vision": {
        pages.push(
          <Pg key="vision" {...pgProps}>
            <SectionHeader title="Style & Materials" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 32 }}>
              <View style={{ flex: 1 }}>
                {props.style ? (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: tk.text, marginBottom: 3 }}>{props.style.label}</Text>
                    <Text style={{ fontSize: 10, color: tk.accent, marginBottom: 10, fontStyle: "italic" }}>{props.style.tagline}</Text>
                    <Text style={{ ...s.body, opacity: 0.65, marginBottom: 16 }}>{props.style.description}</Text>
                    <Text style={{ ...s.label, marginBottom: 8 }}>COLOR PALETTE</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                      {props.style.palette.map((sw, i) => (
                        <View key={i} style={{ alignItems: "center" }}>
                          <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: sw.color, marginBottom: 4 }} />
                          <Text style={{ fontSize: 7, color: tk.text, opacity: 0.45 }}>{sw.label}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ ...s.label, marginBottom: 8 }}>MATERIAL PALETTE</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {props.style.materials.map((m, i) => (
                        <View key={i} style={{ alignItems: "center" }}>
                          <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: m.color, marginBottom: 4 }} />
                          <Text style={{ fontSize: 7, color: tk.text, opacity: 0.45 }}>{m.label}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={s.body}>No style direction selected.</Text>
                )}
              </View>
              <View style={{ width: 200 }}>
                <Text style={{ ...s.label, marginBottom: 8 }}>FINISHES PER MODULE</Text>
                <Text style={{ ...s.label, marginBottom: 4 }}>FINISH LEVEL</Text>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: tk.accent, borderRadius: 4, marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: "#FFFFFF" }}>{props.finishLabel}</Text>
                </View>
                <Text style={{ ...s.label, marginBottom: 6 }}>FLOOR MATERIALS</Text>
                {Array.from(new Set(props.modules.map((m) => m.floorFinish))).map((id) => {
                  const count = props.modules.filter((m) => m.floorFinish === id).length;
                  return (
                    <View key={id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <View style={{ width: 16, height: 16, borderRadius: 3, marginRight: 8, backgroundColor: "#D4A76A" }} />
                      <View>
                        <Text style={{ fontSize: 9, fontWeight: "bold", color: tk.text, textTransform: "capitalize" }}>{id}</Text>
                        <Text style={{ fontSize: 8, color: tk.text, opacity: 0.45 }}>{count} module{count > 1 ? "s" : ""}</Text>
                      </View>
                    </View>
                  );
                })}
                <Text style={{ ...s.label, marginBottom: 6, marginTop: 8 }}>WALL FINISHES</Text>
                {Array.from(new Set(props.modules.map((m) => m.wallColor))).map((id) => {
                  const count = props.modules.filter((m) => m.wallColor === id).length;
                  return (
                    <View key={id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <View style={{ width: 16, height: 16, borderRadius: 3, marginRight: 8, backgroundColor: "#F0EDE5" }} />
                      <View>
                        <Text style={{ fontSize: 9, fontWeight: "bold", color: tk.text, textTransform: "capitalize" }}>{id}</Text>
                        <Text style={{ fontSize: 8, color: tk.text, opacity: 0.45 }}>{count} module{count > 1 ? "s" : ""}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── TECHNICAL DRAWING ──────────────────────────────────────── */
      case "technical": {
        pages.push(
          <Pg key="technical" {...pgProps}>
            <SectionHeader title="Technical Drawing" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 32 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...s.label, marginBottom: 8 }}>FRONT ELEVATION — SOUTH FACE</Text>
                <View style={{ backgroundColor: tk.surface, borderRadius: 6, padding: 16 }}>
                  <PdfElevation modules={props.modules} t={tk} />
                  <Text style={{ fontSize: 7, color: tk.text, opacity: 0.35, marginTop: 8 }}>
                    Scale 1:50 (indicative) · Module height: 2.70m · Wall thickness: 0.30m
                  </Text>
                </View>
                <View style={{ marginTop: 12, backgroundColor: tk.surface, borderRadius: 6, padding: 10 }}>
                  <Text style={{ ...s.label, marginBottom: 6 }}>MATERIAL LEGEND</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 14, height: 14, backgroundColor: "#BAE6FD", borderWidth: 1, borderColor: tk.accent, marginRight: 6 }} />
                      <Text style={{ fontSize: 8, color: tk.text }}>Window opening</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 14, height: 14, backgroundColor: tk.accent, opacity: 0.5, marginRight: 6 }} />
                      <Text style={{ fontSize: 8, color: tk.text }}>Door opening</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ width: 220 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>TECHNICAL SPECIFICATIONS</Text>
                {[
                  { label: "Module Size (ext.)", value: "3.00m × 3.00m × 3.00m" },
                  { label: "Interior Clear Height", value: "2.70m" },
                  { label: "Wall Thickness", value: "0.30m (insulated)" },
                  { label: "Floor Assembly", value: "0.15m (structure + finish)" },
                  { label: "Window Type", value: "Triple-glazed, low-E" },
                  { label: "Structure", value: "Light steel frame" },
                  { label: "Foundation", value: "Concrete slab or piles" },
                  { label: "U-Value Wall", value: "≤ 0.18 W/m²K" },
                  { label: "U-Value Window", value: "≤ 0.70 W/m²K" },
                  { label: "Assembly Time", value: "2–5 days on site" },
                ].map(({ label, value }) => (
                  <DataRow key={label} label={label} value={value} s={s} />
                ))}
                <View style={{ marginTop: 12, padding: 10, backgroundColor: tk.surface, borderRadius: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", color: tk.accent, marginBottom: 4 }}>Standards Compliance</Text>
                  <Text style={{ fontSize: 8, color: tk.text, opacity: 0.6 }}>EN 13501 · ISO 140 · EN 12831</Text>
                </View>
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── MODULE DETAILS ─────────────────────────────────────────── */
      case "modules": {
        pages.push(
          <Pg key="modules" {...pgProps}>
            <SectionHeader title="Module Details" s={s} t={tk} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {props.modules.slice(0, 10).map((m, i) => {
                const color = MODULE_COLORS[m.moduleType] || "#888";
                return (
                  <View key={i} style={{ width: "31%", ...s.card }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color, marginRight: 6 }} />
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: tk.text }}>{m.label}</Text>
                    </View>
                    <Text style={{ fontSize: 8, color: tk.text, opacity: 0.55 }}>Type: {m.moduleType}</Text>
                    <Text style={{ fontSize: 8, color: tk.text, opacity: 0.55 }}>Layout: {m.layoutPreset}</Text>
                    <Text style={{ fontSize: 8, color: tk.text, opacity: 0.55 }}>Floor: {m.floorFinish}</Text>
                    <Text style={{ fontSize: 8, color: tk.text, opacity: 0.55 }}>Wall: {m.wallColor}</Text>
                    <View style={{ flexDirection: "row", gap: 4, marginTop: 6 }}>
                      {(["N", "S", "E", "W"] as const).map((dir) => {
                        const side = { N: "north", S: "south", E: "east", W: "west" }[dir] as keyof typeof m.wallConfigs;
                        const wt = m.wallConfigs[side];
                        const wColor = wt === "window" ? "#BAE6FD" : wt === "door" ? tk.accent : wt === "shared" ? "#E0DDD7" : tk.text;
                        return (
                          <View key={dir} style={{ paddingHorizontal: 4, paddingVertical: 2, backgroundColor: wColor, borderRadius: 2, opacity: wt === "solid" ? 0.2 : 0.85 }}>
                            <Text style={{ fontSize: 6, color: "#fff", fontWeight: "bold" }}>{dir}:{wt[0].toUpperCase()}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </Pg>
        );
        break;
      }

      /* ── PRODUCTS ───────────────────────────────────────────────── */
      case "products": {
        pages.push(
          <Pg key="products" {...pgProps}>
            <SectionHeader title="Product Selections" s={s} t={tk} />
            {props.products.length > 0 ? (
              <>
                <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: tk.text, paddingBottom: 6, marginBottom: 8 }}>
                  {[["PRODUCT", "50%"], ["QTY", "12%"], ["UNIT", "18%"], ["TOTAL", "20%"]].map(([h, w]) => (
                    <View key={h} style={{ width: w as "50%", alignItems: h !== "PRODUCT" ? "flex-end" : "flex-start" }}>
                      <Text style={s.label}>{h}</Text>
                    </View>
                  ))}
                </View>
                {props.products.map((p, i) => (
                  <View key={i} style={{ ...s.row, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#EBEBEB" }}>
                    <Text style={{ ...s.body, width: "50%" }}>{p.name}</Text>
                    <Text style={{ ...s.body, width: "12%", textAlign: "right" }}>{p.quantity}</Text>
                    <Text style={{ ...s.body, width: "18%", textAlign: "right" }}>EUR {p.price}</Text>
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: tk.text, width: "20%", textAlign: "right" }}>
                      EUR {(p.price * p.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={{ ...s.row, marginTop: 12, paddingVertical: 8, borderTopWidth: 1.5, borderTopColor: tk.accent }}>
                  <Text style={{ flex: 1, fontSize: 12, fontWeight: "bold", color: tk.text }}>Products Total</Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: tk.accent }}>
                    EUR {props.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={{ ...s.body, opacity: 0.35 }}>No products selected.</Text>
            )}
          </Pg>
        );
        break;
      }

      /* ── COST & SPECS ───────────────────────────────────────────── */
      case "cost": {
        pages.push(
          <Pg key="cost" {...pgProps}>
            <SectionHeader title="Specifications & Cost" s={s} t={tk} />
            <View style={{ flexDirection: "row", gap: 40 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>COST BREAKDOWN</Text>
                <DataRow label={`${props.stats.totalModules} modules · ${props.finishLabel} finish`} value={`EUR ${props.stats.moduleCost.toLocaleString()}`} s={s} />
                {props.stats.sharedWallDiscount > 0 && (
                  <View style={{ ...s.row, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#EBEBEB" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.label}>Shared wall discount (×{props.stats.sharedWalls})</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: "#10B981", fontWeight: "bold" }}>
                      -EUR {props.stats.sharedWallDiscount.toLocaleString()}
                    </Text>
                  </View>
                )}
                {props.stats.wallUpgradeCost !== 0 && (
                  <DataRow label="Wall upgrades (windows/doors)" value={`${props.stats.wallUpgradeCost > 0 ? "+" : ""}EUR ${props.stats.wallUpgradeCost.toLocaleString()}`} s={s} />
                )}
                <DataRow label="Design fee (8%)" value={`EUR ${Math.round(props.stats.designFee).toLocaleString()}`} s={s} />
                {props.products.length > 0 && (
                  <DataRow label="Products" value={`EUR ${props.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}`} s={s} />
                )}
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: tk.accent, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: tk.text }}>Total Estimate</Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: tk.accent }}>
                    EUR {Math.round(props.stats.totalEstimate).toLocaleString()}
                  </Text>
                </View>
                <Text style={{ fontSize: 7, color: tk.text, opacity: 0.3, marginTop: 8 }}>
                  * Estimate based on {props.finishLabel} finish. Final price subject to site conditions and builder quotes.
                </Text>
              </View>
              <View style={{ width: 220 }}>
                <Text style={{ ...s.label, marginBottom: 10 }}>KEY SPECIFICATIONS</Text>
                {[
                  { label: "Total Modules", value: `${props.stats.totalModules} × 9m² units` },
                  { label: "Gross Built Area", value: `${props.stats.totalArea} m²` },
                  { label: "Net Usable Area", value: `${props.stats.usableArea} m²` },
                  { label: "Finish Level", value: props.finishLabel },
                  { label: "Design Style", value: props.style?.label || "Not selected" },
                  { label: "Construction Type", value: "Off-site modular" },
                  { label: "Build Time (total)", value: "8–14 weeks" },
                  { label: "On-site Assembly", value: "2–5 days" },
                ].map(({ label, value }) => (
                  <DataRow key={label} label={label} value={value} s={s} />
                ))}
              </View>
            </View>
          </Pg>
        );
        break;
      }

      /* ── CONTACT / BACK PAGE ────────────────────────────────────── */
      case "contact": {
        const darkBg = props.presentationStyle === "brochure" ? "#1A1209" : "#1C2B2A";
        pages.push(
          <Pg key="contact" {...pgProps} noPad>
            <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: darkBg }} />
            {/* Decorative lines */}
            <View style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 0.5, backgroundColor: tk.accent, opacity: 0.12 }} />
            <View style={{ position: "absolute", top: 0, left: "33%", width: 0.5, height: "100%", backgroundColor: tk.accent, opacity: 0.10 }} />
            <View style={{ position: "absolute", top: 0, right: "33%", width: 0.5, height: "100%", backgroundColor: tk.accent, opacity: 0.10 }} />

            {/* Main content: 3 columns */}
            <View style={{ position: "absolute", top: "22%", left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              {/* Left: branding */}
              <View style={{ width: 180 }}>
                <Text style={{ fontSize: 30, fontWeight: "bold", color: "#FFFFFF", marginBottom: 6 }}>
                  Modul<Text style={{ color: tk.accent }}>CA</Text>
                </Text>
                <Text style={{ fontSize: 9, color: "#FFFFFF", opacity: 0.45, marginBottom: 16, letterSpacing: 1 }}>
                  MODULAR CONSTRUCTION PLATFORM
                </Text>
                <View style={{ width: 36, height: 2, backgroundColor: tk.accent, marginBottom: 16 }} />
                <Text style={{ fontSize: 9, color: "#FFFFFF", opacity: 0.5, lineHeight: 1.7 }}>
                  Design, visualize and present{"\n"}your modular home — online,{"\n"}in minutes.
                </Text>
              </View>

              {/* Center: QR code */}
              <View style={{ alignItems: "center" }}>
                {props.qrCodeDataUrl ? (
                  <View style={{ padding: 10, backgroundColor: "#FFFFFF", borderRadius: 10, marginBottom: 10 }}>
                    <Image src={props.qrCodeDataUrl} style={{ width: 110, height: 110 }} />
                  </View>
                ) : (
                  <View style={{ width: 130, height: 130, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 10 }} />
                )}
                <Text style={{ fontSize: 8, color: "#FFFFFF", opacity: 0.55, textAlign: "center" }}>
                  tcsn161.github.io/modulca
                </Text>
                <Text style={{ fontSize: 7, color: "#FFFFFF", opacity: 0.3, textAlign: "center", marginTop: 3 }}>
                  Scan to explore ModulCA
                </Text>
              </View>

              {/* Right: social media icons */}
              <View style={{ width: 180, alignItems: "flex-end" }}>
                <Text style={{ fontSize: 8, color: "#FFFFFF", opacity: 0.35, marginBottom: 12, letterSpacing: 1 }}>
                  FOLLOW US
                </Text>
                <View style={{ gap: 8 }}>
                  {[
                    { icon: "in", color: "#0077B5", name: "LinkedIn", handle: "@modulca" },
                    { icon: "f",  color: "#1877F2", name: "Facebook", handle: "@modulca" },
                    { icon: "ig", color: "#E4405F", name: "Instagram", handle: "@modulca" },
                    { icon: "▶",  color: "#FF0000", name: "YouTube",  handle: "@modulca" },
                  ].map((social) => (
                    <View key={social.name} style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <Text style={{ fontSize: 8, color: "#FFFFFF", opacity: 0.45 }}>{social.handle}</Text>
                      <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: social.color, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 11, fontWeight: "bold", color: "#FFFFFF" }}>{social.icon}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Bottom strip */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: tk.accent }} />
            <View style={{ position: "absolute", bottom: 16, left: 52, right: 52 }}>
              <Text style={{ fontSize: 7, color: "#FFFFFF", opacity: 0.15, textAlign: "center" }}>
                © {new Date().getFullYear()} ModulCA — Designed with ModulCA Modular Construction Platform
              </Text>
            </View>
          </Pg>
        );
        break;
      }
    }
  }

  return <Document>{pages}</Document>;
}

/* ------------------------------------------------------------------ */
/*  Product loader from localStorage                                   */
/* ------------------------------------------------------------------ */

const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  "fin-01": { name: "Engineered Oak Flooring", price: 42 },
  "fin-02": { name: "Gypsum Wall Panels", price: 18 },
  "fin-03": { name: "XPS Underfloor Insulation", price: 12 },
  "fin-04": { name: "Triple-Glazed Window Unit", price: 385 },
  "fin-05": { name: "Interior Flush Door", price: 145 },
  "fin-06": { name: "Mineral Wool Insulation Roll", price: 8 },
  "fin-07": { name: "Interior Wall Paint", price: 35 },
  "fin-08": { name: "Porcelain Floor Tiles", price: 28 },
  "fur-01": { name: "Modular Sofa 3-Seat", price: 1290 },
  "fur-02": { name: "Wool Area Rug 200×300", price: 420 },
  "fur-03": { name: "Blackout Curtain Pair", price: 95 },
  "fur-04": { name: "Ceramic Vase Collection", price: 65 },
  "fur-05": { name: "Wall-Mounted Shelving Unit", price: 280 },
  "fur-06": { name: "Pendant Light Fixture", price: 175 },
  "fur-07": { name: "Round Wall Mirror", price: 210 },
  "fur-08": { name: "Upholstered Dining Chair", price: 195 },
  "plm-01": { name: "Freestanding Bathtub", price: 890 },
  "plm-02": { name: "Single-Lever Basin Faucet", price: 125 },
  "plm-03": { name: "Ceramic Countertop Sink", price: 185 },
  "plm-04": { name: "Wall-Hung Toilet", price: 320 },
  "plm-05": { name: "Thermostatic Shower Set", price: 295 },
  "plm-06": { name: "Flush-Mount Outlet Pack", price: 48 },
  "plm-07": { name: "Modular Light Switch Set", price: 36 },
  "plm-08": { name: "LED Ceiling Downlight Pack", price: 85 },
  "plm-09": { name: "Electric Water Heater 80 L", price: 340 },
};

function loadProducts(): { name: string; quantity: number; price: number }[] {
  try {
    const raw = localStorage.getItem("modulca-selected-products");
    if (!raw) return [];
    const items: { id: string; quantity: number }[] = JSON.parse(raw);
    return items
      .map((item) => {
        const p = PRODUCT_CATALOG[item.id];
        return p ? { name: p.name, quantity: item.quantity, price: p.price } : null;
      })
      .filter((x): x is { name: string; quantity: number; price: number } => x !== null);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Export: download button                                            */
/* ------------------------------------------------------------------ */

export default function PdfDownloadButton(props: Omit<PdfProps, "products">) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const products = loadProducts();
      const doc = <PresentationDocument {...props} products={products} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${props.projectName.replace(/\s+/g, "_")}_ModulCA_Presentation.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again or use print (Ctrl+P).");
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
          Generating PDF…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}
