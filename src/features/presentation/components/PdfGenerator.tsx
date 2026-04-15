"use client";

import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { ModuleConfig, SavedRender } from "@/features/design/store";
import type { StyleDirection } from "@/features/design/styles";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PdfGeneratorProps {
  template: "minimal" | "bold" | "classic" | "luxury" | "architect";
  slides: { id: string; label: string; enabled: boolean }[];
  projectName: string;
  clientName: string;
  /* Pre-read data — hooks cannot run inside react-pdf */
  modules: ModuleConfig[];
  stats: {
    totalModules: number;
    totalArea: number;
    usableArea: number;
    sharedWalls: number;
    moduleCost: number;
    sharedWallDiscount: number;
    wallUpgradeCost: number;
    designFee: number;
    totalEstimate: number;
  };
  style: StyleDirection | null;
  finishLabel: string;
  polygon: { lat: number; lng: number }[];
  mapCenter: { lat: number; lng: number };
  products: { name: string; quantity: number; price: number }[];
  savedRenders: SavedRender[];
  isFreeUser?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Template colors                                                    */
/* ------------------------------------------------------------------ */

const TMPL: Record<string, { accent: string; bg: string; text: string }> = {
  minimal: { accent: "#C8956C", bg: "#FFFFFF", text: "#1a1a1a" },
  bold: { accent: "#F59E0B", bg: "#111111", text: "#FFFFFF" },
  classic: { accent: "#1D6B6B", bg: "#F8F6F2", text: "#2A2A2A" },
  luxury: { accent: "#C5A572", bg: "#0A0A0A", text: "#FFFFFF" },
  architect: { accent: "#333333", bg: "#FFFFFF", text: "#1a1a1a" },
};

const MODULE_COLORS: Record<string, string> = {
  bedroom: "#4A90D9",
  kitchen: "#E8913A",
  bathroom: "#2ABFBF",
  living: "#6BBF59",
  office: "#8B6DB5",
  storage: "#8E99A4",
};

/* ------------------------------------------------------------------ */
/*  PDF styles                                                         */
/* ------------------------------------------------------------------ */

function makeStyles(t: { accent: string; bg: string; text: string }) {
  return StyleSheet.create({
    page: {
      backgroundColor: t.bg,
      paddingHorizontal: 48,
      paddingVertical: 40,
      fontFamily: "Helvetica",
    },
    accentBar: {
      width: 60,
      height: 4,
      backgroundColor: t.accent,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: t.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: t.text,
      opacity: 0.6,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: t.accent,
      marginBottom: 12,
    },
    body: {
      fontSize: 10,
      color: t.text,
      lineHeight: 1.6,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: t.text === "#FFFFFF" ? "#333" : "#ddd",
    },
    label: { fontSize: 10, color: t.text, opacity: 0.6, width: "50%" },
    value: { fontSize: 10, color: t.text, fontWeight: "bold", width: "50%", textAlign: "right" },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 6,
      marginBottom: 6,
    },
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

/* ------------------------------------------------------------------ */
/*  Slide page wrapper                                                 */
/* ------------------------------------------------------------------ */

function SlidePage({
  children,
  slideLabel,
  pageNum,
  total,
  s,
  isFreeUser,
}: {
  children: React.ReactNode;
  slideLabel: string;
  pageNum: number;
  total: number;
  s: ReturnType<typeof makeStyles>;
  isFreeUser?: boolean;
}) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      {children}
      <View style={s.footer}>
        <Text>{slideLabel}</Text>
        <Text>
          {pageNum} / {total}
        </Text>
      </View>
      {isFreeUser && (
        <Text style={{
          position: "absolute",
          top: "45%",
          left: "20%",
          fontSize: 48,
          color: "#000000",
          opacity: 0.04,
          transform: "rotate(-30deg)",
        }}>
          ModulCA Free — modulca.eu
        </Text>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  PDF Document                                                       */
/* ------------------------------------------------------------------ */

function PresentationDocument(props: PdfGeneratorProps) {
  const t = TMPL[props.template];
  const s = makeStyles(t);
  const enabled = props.slides.filter((sl) => sl.enabled);
  const total = enabled.length;
  const isFree = props.isFreeUser;
  let pageNum = 0;

  const pages: React.ReactNode[] = [];

  for (const slide of enabled) {
    pageNum++;
    const pn = pageNum;

    switch (slide.id) {
      case "cover":
        pages.push(
          <SlidePage key="cover" slideLabel="Cover" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={s.accentBar} />
              <Text style={{ ...s.title, fontSize: 36 }}>{props.projectName}</Text>
              {props.clientName ? (
                <Text style={{ ...s.subtitle, fontSize: 16 }}>Prepared for {props.clientName}</Text>
              ) : null}
              <Text style={s.body}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
              <View style={{ flexDirection: "row", gap: 24, marginTop: 32 }}>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: t.accent }}>{props.stats.totalModules}</Text>
                  <Text style={{ fontSize: 8, color: t.text, opacity: 0.5 }}>MODULES</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: t.accent }}>{props.stats.totalArea}m2</Text>
                  <Text style={{ fontSize: 8, color: t.text, opacity: 0.5 }}>TOTAL AREA</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: t.accent }}>EUR {Math.round(props.stats.totalEstimate).toLocaleString()}</Text>
                  <Text style={{ fontSize: 8, color: t.text, opacity: 0.5 }}>ESTIMATE</Text>
                </View>
              </View>
              <Text style={{ ...s.body, marginTop: 32, opacity: 0.4 }}>
                Designed with ModulCA — Modular Construction Platform
              </Text>
            </View>
          </SlidePage>
        );
        break;

      case "description": {
        const roomCounts = props.modules.reduce<Record<string, number>>((acc, m) => {
          acc[m.moduleType] = (acc[m.moduleType] || 0) + 1;
          return acc;
        }, {});
        const roomList = Object.entries(roomCounts).map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`).join(", ");
        const styleName = props.style?.label || "modern";
        pages.push(
          <SlidePage key="description" slideLabel="Project Description" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Project Description</Text>
            <Text style={{ ...s.body, marginTop: 16, lineHeight: 1.8 }}>
              This {styleName.toLowerCase()} modular residence comprises {props.stats.totalModules} modules totaling {props.stats.totalArea}m2 of built area ({props.stats.usableArea}m2 usable), featuring {roomList}. Designed with a {props.finishLabel.toLowerCase()} finish level, the project prioritizes efficient space utilization through modular construction techniques.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
              <View style={{ ...s.card, width: "46%" }}>
                <Text style={{ fontSize: 8, color: t.accent, fontWeight: "bold" }}>CONFIGURATION</Text>
                <Text style={{ fontSize: 18, color: t.text, fontWeight: "bold", marginTop: 4 }}>{props.stats.totalModules} Modules</Text>
                <Text style={{ fontSize: 8, color: t.text, opacity: 0.5, marginTop: 2 }}>{roomList}</Text>
              </View>
              <View style={{ ...s.card, width: "46%" }}>
                <Text style={{ fontSize: 8, color: t.accent, fontWeight: "bold" }}>TOTAL AREA</Text>
                <Text style={{ fontSize: 18, color: t.text, fontWeight: "bold", marginTop: 4 }}>{props.stats.totalArea}m2</Text>
                <Text style={{ fontSize: 8, color: t.text, opacity: 0.5, marginTop: 2 }}>{props.stats.usableArea}m2 usable interior</Text>
              </View>
              <View style={{ ...s.card, width: "46%" }}>
                <Text style={{ fontSize: 8, color: t.accent, fontWeight: "bold" }}>DESIGN STYLE</Text>
                <Text style={{ fontSize: 18, color: t.text, fontWeight: "bold", marginTop: 4 }}>{props.style?.label || "Modern"}</Text>
                <Text style={{ fontSize: 8, color: t.text, opacity: 0.5, marginTop: 2 }}>{props.style?.tagline || "Contemporary modular design"}</Text>
              </View>
              <View style={{ ...s.card, width: "46%" }}>
                <Text style={{ fontSize: 8, color: t.accent, fontWeight: "bold" }}>INVESTMENT</Text>
                <Text style={{ fontSize: 18, color: t.text, fontWeight: "bold", marginTop: 4 }}>EUR {Math.round(props.stats.totalEstimate).toLocaleString()}</Text>
                <Text style={{ fontSize: 8, color: t.text, opacity: 0.5, marginTop: 2 }}>{props.finishLabel} finish</Text>
              </View>
            </View>
          </SlidePage>
        );
        break;
      }

      case "site":
        pages.push(
          <SlidePage key="site" slideLabel="Site Plan" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Site Plan</Text>
            <View style={s.row}>
              <Text style={s.label}>Location</Text>
              <Text style={s.value}>{props.mapCenter.lat.toFixed(5)}, {props.mapCenter.lng.toFixed(5)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Polygon Points</Text>
              <Text style={s.value}>{props.polygon.length}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Total Modules</Text>
              <Text style={s.value}>{props.stats.totalModules}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Total Area</Text>
              <Text style={s.value}>{props.stats.totalArea} m2</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Usable Area</Text>
              <Text style={s.value}>{props.stats.usableArea} m2</Text>
            </View>
          </SlidePage>
        );
        break;

      case "floorplan":
        pages.push(
          <SlidePage key="floorplan" slideLabel="Floor Plan" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Floor Plan — Module Layout</Text>
            <View style={{ ...s.row, borderBottomWidth: 1, marginBottom: 4 }}>
              <Text style={{ ...s.label, fontWeight: "bold", width: "20%" }}>Module</Text>
              <Text style={{ ...s.label, fontWeight: "bold", width: "15%" }}>Type</Text>
              <Text style={{ ...s.label, fontWeight: "bold", width: "15%" }}>Position</Text>
              <Text style={{ ...s.label, fontWeight: "bold", width: "15%" }}>Layout</Text>
              <Text style={{ ...s.label, fontWeight: "bold", width: "15%" }}>Floor</Text>
              <Text style={{ ...s.label, fontWeight: "bold", width: "20%" }}>Walls</Text>
            </View>
            {props.modules.slice(0, 16).map((m, i) => (
              <View key={i} style={s.row}>
                <Text style={{ ...s.body, width: "20%" }}>{m.label}</Text>
                <Text style={{ ...s.body, width: "15%" }}>{m.moduleType}</Text>
                <Text style={{ ...s.body, width: "15%" }}>R{m.row} C{m.col}</Text>
                <Text style={{ ...s.body, width: "15%" }}>{m.layoutPreset}</Text>
                <Text style={{ ...s.body, width: "15%" }}>{m.floorFinish}</Text>
                <Text style={{ ...s.body, width: "20%" }}>
                  N:{m.wallConfigs.north[0]} S:{m.wallConfigs.south[0]} E:{m.wallConfigs.east[0]} W:{m.wallConfigs.west[0]}
                </Text>
              </View>
            ))}
          </SlidePage>
        );
        break;

      case "vision":
        pages.push(
          <SlidePage key="vision" slideLabel="Design Vision" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Design Vision</Text>
            {props.style ? (
              <>
                <Text style={{ ...s.title, fontSize: 22, marginBottom: 4 }}>{props.style.label}</Text>
                <Text style={{ ...s.subtitle, marginBottom: 16 }}>{props.style.tagline}</Text>
                <Text style={{ ...s.body, marginBottom: 20 }}>{props.style.description}</Text>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 8 }}>Color Palette</Text>
                <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                  {props.style.palette.map((sw, i) => (
                    <View key={i} style={{ alignItems: "center" }}>
                      <View style={{ ...s.swatch, width: 36, height: 36, backgroundColor: sw.color }} />
                      <Text style={{ fontSize: 7, color: t.text, opacity: 0.5, marginTop: 3 }}>{sw.label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 8 }}>Materials</Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {props.style.materials.map((m, i) => (
                    <View key={i} style={{ alignItems: "center" }}>
                      <View style={{ ...s.swatch, width: 36, height: 36, backgroundColor: m.color }} />
                      <Text style={{ fontSize: 7, color: t.text, opacity: 0.5, marginTop: 3 }}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={s.body}>No style direction selected.</Text>
            )}
          </SlidePage>
        );
        break;

      case "modules":
        pages.push(
          <SlidePage key="modules" slideLabel="Module Details" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Module Details</Text>
            <View style={s.grid}>
              {props.modules.slice(0, 8).map((m, i) => {
                const col = MODULE_COLORS[m.moduleType] || "#888";
                return (
                  <View key={i} style={s.card}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: col, marginRight: 6 }} />
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: t.text }}>{m.label}</Text>
                    </View>
                    <Text style={{ fontSize: 8, color: t.text, opacity: 0.6 }}>Type: {m.moduleType}</Text>
                    <Text style={{ fontSize: 8, color: t.text, opacity: 0.6 }}>Layout: {m.layoutPreset}</Text>
                    <Text style={{ fontSize: 8, color: t.text, opacity: 0.6 }}>Floor: {m.floorFinish} | Wall: {m.wallColor}</Text>
                  </View>
                );
              })}
            </View>
          </SlidePage>
        );
        break;

      case "renders": {
        // Show ALL saved renders — 4 per page, adding extra pages as needed
        const renders = props.savedRenders;
        if (renders.length === 0) {
          pages.push(
            <SlidePage key="renders" slideLabel="AI Renders" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
              <View style={s.accentBar} />
              <Text style={s.sectionTitle}>AI Renders</Text>
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ ...s.body, opacity: 0.4, fontSize: 14 }}>
                  No AI renders saved yet.
                </Text>
                <Text style={{ ...s.body, opacity: 0.3, marginTop: 8 }}>
                  Generate renders in Step 8 and click &quot;Save to Presentation&quot;.
                </Text>
              </View>
            </SlidePage>
          );
        } else {
          const RENDERS_PER_PAGE = 4;
          const renderPages = Math.ceil(renders.length / RENDERS_PER_PAGE);
          for (let rp = 0; rp < renderPages; rp++) {
            const chunk = renders.slice(rp * RENDERS_PER_PAGE, (rp + 1) * RENDERS_PER_PAGE);
            const label = renderPages > 1 ? `AI Renders (${rp + 1}/${renderPages})` : "AI Renders";
            pages.push(
              <SlidePage key={`renders-${rp}`} slideLabel={label} pageNum={pn + rp} total={total + renderPages - 1} s={s} isFreeUser={isFree}>
                <View style={s.accentBar} />
                <Text style={s.sectionTitle}>{label}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                  {chunk.map((render, i) => (
                    <View key={i} style={{ width: "48%", marginBottom: 8 }}>
                      <Image
                        src={render.imageUrl}
                        style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }}
                      />
                      <Text style={{ fontSize: 8, fontWeight: "bold", color: t.text, marginTop: 4 }}>
                        {render.label}
                      </Text>
                      {render.description ? (
                        <Text style={{ fontSize: 7, color: t.text, opacity: 0.6, marginTop: 2, lineHeight: 1.4 }}>
                          {render.description.slice(0, 150)}
                        </Text>
                      ) : null}
                      <Text style={{ fontSize: 7, color: t.text, opacity: 0.4, marginTop: 2 }}>
                        {render.engine}{render.resolution ? ` | ${render.resolution}` : ""}{render.mode ? ` | ${render.mode}` : ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </SlidePage>
            );
          }
          // Adjust pageNum for extra render pages
          if (renderPages > 1) pageNum += renderPages - 1;
        }
        break;
      }

      case "materials":
        pages.push(
          <SlidePage key="materials" slideLabel="Materials & Finishes" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Materials & Finishes</Text>
            <View style={s.row}>
              <Text style={s.label}>Finish Level</Text>
              <Text style={s.value}>{props.finishLabel}</Text>
            </View>
            <Text style={{ ...s.body, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>Module Finishes</Text>
            {props.modules.slice(0, 12).map((m, i) => (
              <View key={i} style={s.row}>
                <Text style={{ ...s.body, width: "30%" }}>{m.label}</Text>
                <Text style={{ ...s.body, width: "35%" }}>Floor: {m.floorFinish}</Text>
                <Text style={{ ...s.body, width: "35%" }}>Wall: {m.wallColor}</Text>
              </View>
            ))}
          </SlidePage>
        );
        break;

      case "products":
        pages.push(
          <SlidePage key="products" slideLabel="Products" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Selected Products</Text>
            {props.products.length > 0 ? (
              <>
                <View style={{ ...s.row, borderBottomWidth: 1, marginBottom: 4 }}>
                  <Text style={{ ...s.label, fontWeight: "bold", width: "50%" }}>Product</Text>
                  <Text style={{ ...s.label, fontWeight: "bold", width: "15%", textAlign: "center" }}>Qty</Text>
                  <Text style={{ ...s.label, fontWeight: "bold", width: "15%", textAlign: "right" }}>Unit</Text>
                  <Text style={{ ...s.label, fontWeight: "bold", width: "20%", textAlign: "right" }}>Total</Text>
                </View>
                {props.products.map((p, i) => (
                  <View key={i} style={s.row}>
                    <Text style={{ ...s.body, width: "50%" }}>{p.name}</Text>
                    <Text style={{ ...s.body, width: "15%", textAlign: "center" }}>{p.quantity}</Text>
                    <Text style={{ ...s.body, width: "15%", textAlign: "right" }}>EUR {p.price}</Text>
                    <Text style={{ ...s.body, width: "20%", textAlign: "right" }}>EUR {(p.price * p.quantity).toLocaleString()}</Text>
                  </View>
                ))}
                <View style={{ ...s.row, marginTop: 8 }}>
                  <Text style={{ ...s.label, fontWeight: "bold" }}>Products Total</Text>
                  <Text style={s.value}>
                    EUR {props.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={s.body}>No products selected.</Text>
            )}
          </SlidePage>
        );
        break;

      case "cost":
        pages.push(
          <SlidePage key="cost" slideLabel="Cost Summary" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Cost Summary</Text>
            <View style={{ marginTop: 12 }}>
              <View style={s.row}>
                <Text style={s.label}>{props.stats.totalModules} modules ({props.finishLabel})</Text>
                <Text style={s.value}>EUR {props.stats.moduleCost.toLocaleString()}</Text>
              </View>
              {props.stats.sharedWallDiscount > 0 && (
                <View style={s.row}>
                  <Text style={s.label}>Shared wall discount ({props.stats.sharedWalls} walls)</Text>
                  <Text style={{ ...s.value, color: "#10b981" }}>-EUR {props.stats.sharedWallDiscount.toLocaleString()}</Text>
                </View>
              )}
              {props.stats.wallUpgradeCost !== 0 && (
                <View style={s.row}>
                  <Text style={s.label}>Wall upgrades</Text>
                  <Text style={s.value}>{props.stats.wallUpgradeCost > 0 ? "+" : ""}EUR {props.stats.wallUpgradeCost.toLocaleString()}</Text>
                </View>
              )}
              <View style={s.row}>
                <Text style={s.label}>Design fee (8%)</Text>
                <Text style={s.value}>EUR {Math.round(props.stats.designFee).toLocaleString()}</Text>
              </View>
              <View style={{ ...s.row, borderBottomWidth: 2, borderBottomColor: t.accent, paddingVertical: 8, marginTop: 8 }}>
                <Text style={{ ...s.label, fontSize: 14, fontWeight: "bold", opacity: 1 }}>Total Estimate</Text>
                <Text style={{ ...s.value, fontSize: 14, color: t.accent }}>EUR {Math.round(props.stats.totalEstimate).toLocaleString()}</Text>
              </View>
            </View>
          </SlidePage>
        );
        break;

      case "next":
        pages.push(
          <SlidePage key="next" slideLabel="Next Steps" pageNum={pn} total={total} s={s} isFreeUser={isFree}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>Next Steps</Text>
            <View style={{ marginTop: 12, gap: 16 }}>
              <View>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 4 }}>1. Review & Approve</Text>
                <Text style={s.body}>Review this presentation and confirm your design choices. Make any adjustments through the ModulCA platform.</Text>
              </View>
              <View>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 4 }}>2. Request a Quote</Text>
                <Text style={s.body}>Contact our construction team for a detailed, binding quote based on your finalized design.</Text>
              </View>
              <View>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 4 }}>3. Book a Consultation</Text>
                <Text style={s.body}>Schedule a call with an architect to discuss your project, timeline, and site preparation.</Text>
              </View>
              <View>
                <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 4 }}>4. Begin Construction</Text>
                <Text style={s.body}>Once approved, modules are manufactured off-site and assembled on your land in days, not months.</Text>
              </View>
            </View>
            <View style={{ marginTop: 40 }}>
              <Text style={{ ...s.body, opacity: 0.4 }}>
                ModulCA — Modular Construction Platform | modulca.eu
              </Text>
            </View>
          </SlidePage>
        );
        break;
    }
  }

  return <Document>{pages}</Document>;
}

/* ------------------------------------------------------------------ */
/*  Product catalog (for matching localStorage IDs)                    */
/* ------------------------------------------------------------------ */

const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  // Finishing Materials
  "fin-01": { name: "Engineered Oak Flooring", price: 42 },
  "fin-02": { name: "Gypsum Wall Panels", price: 18 },
  "fin-03": { name: "XPS Underfloor Insulation", price: 12 },
  "fin-04": { name: "Triple-Glazed Window Unit", price: 385 },
  "fin-05": { name: "Interior Flush Door", price: 145 },
  "fin-06": { name: "Mineral Wool Insulation Roll", price: 8 },
  "fin-07": { name: "Interior Wall Paint", price: 35 },
  "fin-08": { name: "Porcelain Floor Tiles", price: 28 },
  // Furniture & Decor
  "fur-01": { name: "Modular Sofa 3-Seat", price: 1290 },
  "fur-02": { name: "Wool Area Rug 200\u00D7300", price: 420 },
  "fur-03": { name: "Blackout Curtain Pair", price: 95 },
  "fur-04": { name: "Ceramic Vase Collection", price: 65 },
  "fur-05": { name: "Wall-Mounted Shelving Unit", price: 280 },
  "fur-06": { name: "Pendant Light Fixture", price: 175 },
  "fur-07": { name: "Round Wall Mirror", price: 210 },
  "fur-08": { name: "Upholstered Dining Chair", price: 195 },
  // Plumbing & Electrical
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
/*  Export: PdfDownloadButton                                          */
/* ------------------------------------------------------------------ */

export default function PdfDownloadButton({
  template,
  slides,
  projectName,
  clientName,
  modules,
  stats,
  style,
  finishLabel,
  polygon,
  mapCenter,
  savedRenders,
  isFreeUser,
}: Omit<PdfGeneratorProps, "products">) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const products = loadProducts();
      const doc = (
        <PresentationDocument
          template={template}
          slides={slides}
          projectName={projectName}
          clientName={clientName}
          modules={modules}
          stats={stats}
          style={style}
          finishLabel={finishLabel}
          polygon={polygon}
          mapCenter={mapCenter}
          products={products}
          savedRenders={savedRenders}
          isFreeUser={isFreeUser}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "_")}_Presentation.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Falling back to print.");
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
          Generating...
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
