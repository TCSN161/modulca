"use client";

import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { ModuleConfig } from "@/features/design/store";
import type { StyleDirection } from "@/features/design/styles";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PdfGeneratorProps {
  template: "minimal" | "bold" | "classic";
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
}

/* ------------------------------------------------------------------ */
/*  Template colors                                                    */
/* ------------------------------------------------------------------ */

const TMPL: Record<string, { accent: string; bg: string; text: string }> = {
  minimal: { accent: "#C8956C", bg: "#FFFFFF", text: "#1a1a1a" },
  bold: { accent: "#F59E0B", bg: "#111111", text: "#FFFFFF" },
  classic: { accent: "#1D6B6B", bg: "#F8F6F2", text: "#2A2A2A" },
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
}: {
  children: React.ReactNode;
  slideLabel: string;
  pageNum: number;
  total: number;
  s: ReturnType<typeof makeStyles>;
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
  let pageNum = 0;

  const pages: React.ReactNode[] = [];

  for (const slide of enabled) {
    pageNum++;
    const pn = pageNum;

    switch (slide.id) {
      case "cover":
        pages.push(
          <SlidePage key="cover" slideLabel="Cover" pageNum={pn} total={total} s={s}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={s.accentBar} />
              <Text style={{ ...s.title, fontSize: 36 }}>{props.projectName}</Text>
              {props.clientName ? (
                <Text style={{ ...s.subtitle, fontSize: 16 }}>Prepared for {props.clientName}</Text>
              ) : null}
              <Text style={s.body}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
              <Text style={{ ...s.body, marginTop: 40, opacity: 0.4 }}>
                Designed with ModulCA — Modular Construction Platform
              </Text>
            </View>
          </SlidePage>
        );
        break;

      case "site":
        pages.push(
          <SlidePage key="site" slideLabel="Site Plan" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="floorplan" slideLabel="Floor Plan" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="vision" slideLabel="Design Vision" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="modules" slideLabel="Module Details" pageNum={pn} total={total} s={s}>
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

      case "renders":
        pages.push(
          <SlidePage key="renders" slideLabel="AI Renders" pageNum={pn} total={total} s={s}>
            <View style={s.accentBar} />
            <Text style={s.sectionTitle}>AI Renders</Text>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ ...s.body, opacity: 0.4, fontSize: 14 }}>
                AI-generated renders are available in the web application.
              </Text>
              <Text style={{ ...s.body, opacity: 0.3, marginTop: 8 }}>
                Visit your project at modulca.com to view and download high-resolution renders.
              </Text>
            </View>
          </SlidePage>
        );
        break;

      case "materials":
        pages.push(
          <SlidePage key="materials" slideLabel="Materials & Finishes" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="products" slideLabel="Products" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="cost" slideLabel="Cost Summary" pageNum={pn} total={total} s={s}>
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
          <SlidePage key="next" slideLabel="Next Steps" pageNum={pn} total={total} s={s}>
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
                ModulCA — Modular Construction Platform | modulca.com
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
  "flooring-oak": { name: "Oak Flooring", price: 45 },
  "flooring-concrete": { name: "Polished Concrete", price: 35 },
  "wall-panels": { name: "Decorative Wall Panels", price: 28 },
  "insulation-premium": { name: "Premium Insulation", price: 22 },
  "windows-double": { name: "Double-Glazed Windows", price: 320 },
  "door-interior": { name: "Interior Doors", price: 180 },
  "paint-interior": { name: "Interior Paint", price: 35 },
  "tiles-bathroom": { name: "Bathroom Tiles", price: 42 },
  "sofa-modular": { name: "Modular Sofa", price: 890 },
  "rug-area": { name: "Area Rug", price: 220 },
  "curtains-blackout": { name: "Blackout Curtains", price: 85 },
  "shelving-unit": { name: "Shelving Unit", price: 340 },
  "pendant-light": { name: "Pendant Lights", price: 120 },
  "mirror-wall": { name: "Wall Mirror", price: 95 },
  "bathtub-freestanding": { name: "Freestanding Bathtub", price: 1200 },
  "faucet-set": { name: "Faucet Set", price: 180 },
  "sink-kitchen": { name: "Kitchen Sink", price: 280 },
  "toilet-modern": { name: "Modern Toilet", price: 450 },
  "shower-system": { name: "Rain Shower System", price: 380 },
  "outlet-smart": { name: "Smart Outlets", price: 25 },
  "switch-dimmer": { name: "Dimmer Switches", price: 35 },
  "light-recessed": { name: "Recessed Lighting", price: 45 },
  "heater-water": { name: "Tankless Water Heater", price: 680 },
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
      className="rounded-lg bg-brand-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-amber-600 disabled:opacity-50"
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}
