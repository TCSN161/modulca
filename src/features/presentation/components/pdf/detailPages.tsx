/** PDF pages: AI renders, materials, products, cost summary, next steps. */
import { Image, Text, View } from "@react-pdf/renderer";
import { chunk, pageLabel, curateRenders, truncateWords, RENDERS_PER_PAGE } from "../../hooks/pdfPlan";
import { renderEngineCaption, renderModeLabel, defaultNextSteps } from "../../i18n";
import { SlidePage } from "./SlidePage";
import type { PdfCtx } from "./types";

type Pages = React.ReactNode[];

const wm = (c: PdfCtx) => (c.props.isFreeUser ? c.t("common.watermark") : undefined);

/** ST30: caption limits (word boundary + ellipsis) */
export const CAPTION_LABEL_MAX = 70;
export const CAPTION_DESC_MAX = 160;

export function renderPages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  // BUG-ST25: curated set (≤ 8, ≤ 2 per module first, no duplicates), 4 per page
  const renders = curateRenders(p.savedRenders);
  if (renders.length === 0) {
    return [
      <SlidePage key="renders" slideLabel={c.label("renders")} s={s} watermark={wm(c)}>
        <View style={s.accentBar} />
        <Text style={s.sectionTitle}>{t("renders.title")}</Text>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ ...s.body, opacity: 0.4, fontSize: 14 }}>{t("renders.emptyTitle")}</Text>
          <Text style={{ ...s.body, opacity: 0.3, marginTop: 8 }}>{t("renders.emptyHint")}</Text>
        </View>
      </SlidePage>,
    ];
  }
  const groups = chunk(renders, RENDERS_PER_PAGE);
  return groups.map((group, rp) => {
    const label = pageLabel(t("renders.title"), rp, groups.length);
    return (
      <SlidePage key={`renders-${rp}`} slideLabel={label} s={s} watermark={wm(c)}>
        <View style={s.accentBar} />
        <Text style={s.sectionTitle}>{label}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          {group.map((render, i) => {
            const cap = renderEngineCaption(t, render);
            const meta = [cap.engine, render.resolution, renderModeLabel(t, render)].filter(Boolean).join(" | ");
            return (
              <View key={i} style={{ width: "48%", marginBottom: 8 }}>
                <Image src={render.imageUrl} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }} />
                <Text style={{ fontSize: 8, fontWeight: "bold", color: theme.text, marginTop: 4 }}>
                  {truncateWords(render.label, CAPTION_LABEL_MAX)}
                </Text>
                {render.description ? (
                  <Text style={{ fontSize: 7, color: theme.text, opacity: 0.6, marginTop: 2, lineHeight: 1.4 }}>
                    {truncateWords(render.description, CAPTION_DESC_MAX)}
                  </Text>
                ) : null}
                <Text style={{ fontSize: 7, color: theme.text, opacity: 0.4, marginTop: 2 }}>
                  {meta}{cap.fallback ? ` ${cap.fallback}` : ""}
                </Text>
              </View>
            );
          })}
        </View>
      </SlidePage>
    );
  });
}

export function materialPages(c: PdfCtx): Pages {
  const { props: p, t, s } = c;
  const mtPages = chunk(p.modules, 12);
  return mtPages.map((rows, pi) => (
    <SlidePage key={`materials-${pi}`} slideLabel={pageLabel(c.label("materials"), pi, mtPages.length)} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{pageLabel(t("materials.title"), pi, mtPages.length)}</Text>
      <View style={s.row}>
        <Text style={s.label}>{t("materials.finishLevel")}</Text>
        <Text style={s.value}>{c.finishName}</Text>
      </View>
      <Text style={{ ...s.body, fontWeight: "bold", marginTop: 16, marginBottom: 8 }}>{t("materials.moduleFinishes")}</Text>
      {rows.map((m, i) => (
        <View key={i} style={s.row}>
          <Text style={{ ...s.body, width: "30%" }}>{m.label}</Text>
          <Text style={{ ...s.body, width: "35%" }}>{t("materials.floor")}: {m.floorFinish}</Text>
          <Text style={{ ...s.body, width: "35%" }}>{t("materials.wall")}: {m.wallColor}</Text>
        </View>
      ))}
    </SlidePage>
  ));
}

/** BUG-ST31: lines from computeProjectCost — per-m² items priced on the usable area */
export function productPages(c: PdfCtx): Pages {
  const { props: p, t, s } = c;
  const lines = p.cost.productLines;
  const unit = (u: "m2" | "pcs") => (u === "m2" ? t("products.unitM2") : t("products.unitPcs"));
  const head = (k: string, w: string, align: "left" | "center" | "right") => (
    <Text style={{ ...s.label, fontWeight: "bold", width: w, textAlign: align }}>{k}</Text>
  );
  return [
    <SlidePage key="products" slideLabel={c.label("products")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("products.title")}</Text>
      {lines.length > 0 ? (
        <>
          <View style={{ ...s.row, borderBottomWidth: 1, marginBottom: 4 }}>
            {head(t("products.colProduct"), "45%", "left")}
            {head(t("products.colQty"), "17%", "center")}
            {head(t("products.colUnit"), "18%", "right")}
            {head(t("products.colTotal"), "20%", "right")}
          </View>
          {lines.map((l) => (
            <View key={l.productId} style={s.row}>
              <Text style={{ ...s.body, width: "45%" }}>{l.name}</Text>
              <Text style={{ ...s.body, width: "17%", textAlign: "center" }}>{`${t.num(l.quantity)} ${unit(l.unit)}`}</Text>
              <Text style={{ ...s.body, width: "18%", textAlign: "right" }}>
                {t("products.perUnit", { price: t.eurPrice(l.unitPrice), unit: unit(l.unit) })}
              </Text>
              <Text style={{ ...s.body, width: "20%", textAlign: "right" }}>{t.eur(l.total)}</Text>
            </View>
          ))}
          <View style={{ ...s.row, marginTop: 8 }}>
            <Text style={{ ...s.label, fontWeight: "bold" }}>{t("products.total")}</Text>
            <Text style={s.value}>{t.eur(p.cost.productCost)}</Text>
          </View>
        </>
      ) : (
        <Text style={s.body}>{t("products.none")}</Text>
      )}
    </SlidePage>,
  ];
}

export function costPages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  const k = p.cost;
  const row = (label: string, value: string, green = false) => (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={green ? { ...s.value, color: "#10b981" } : s.value}>{value}</Text>
    </View>
  );
  const signed = (n: number) => `${n > 0 ? "+" : "-"}${t.eur(Math.abs(n))}`;
  return [
    <SlidePage key="cost" slideLabel={c.label("cost")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("cost.title")}</Text>
      <View style={{ marginTop: 12 }}>
        {row(t("cost.modules", { count: k.totalModules, finish: c.finishName }), t.eur(k.moduleCost))}
        {k.sharedWallDiscount > 0 && row(t("cost.sharedWall", { count: k.sharedWalls }), `-${t.eur(k.sharedWallDiscount)}`, true)}
        {k.wallUpgradeCost !== 0 && row(t("cost.wallUpgrades"), signed(k.wallUpgradeCost))}
        {k.thicknessUpgradeCost !== 0 && row(t("cost.thicknessUpgrades"), signed(k.thicknessUpgradeCost))}
        {row(t("cost.designFee"), t.eur(k.designFee))}
        {k.productCost > 0 && row(t("cost.designSubtotal"), t.eur(k.totalEstimate))}
        {k.productCost > 0 && row(t("cost.products"), t.eur(k.productCost))}
        <View style={{ ...s.row, borderBottomWidth: 2, borderBottomColor: theme.accent, paddingVertical: 8, marginTop: 8 }}>
          <Text style={{ ...s.label, fontSize: 14, fontWeight: "bold", opacity: 1 }}>{t("cost.total")}</Text>
          <Text style={{ ...s.value, fontSize: 14, color: theme.accent }}>{t.eur(k.grandTotal)}</Text>
        </View>
        <Text style={{ ...s.body, fontSize: 8, opacity: 0.4, marginTop: 12 }}>{t("cost.disclaimer", { finish: c.finishName })}</Text>
      </View>
    </SlidePage>,
  ];
}

export function nextPages(c: PdfCtx): Pages {
  const { props: p, t, s } = c;
  const steps = p.nextSteps?.length ? p.nextSteps : defaultNextSteps(t);
  return [
    <SlidePage key="next" slideLabel={c.label("next")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("next.title")}</Text>
      <View style={{ marginTop: 12, gap: 16 }}>
        {steps.map((st, i) => (
          <View key={i}>
            <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 4 }}>{i + 1}. {st.title}</Text>
            <Text style={s.body}>{st.desc}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 40 }}>
        <Text style={{ ...s.body, opacity: 0.4 }}>{t("common.platform")}</Text>
      </View>
    </SlidePage>,
  ];
}
