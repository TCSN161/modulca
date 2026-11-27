/** PDF pages: cover, description, site, floor plan, vision, module details. */
import { Text, View } from "@react-pdf/renderer";
import { chunk, pageLabel, hasPlot, MODULES_PER_DETAILS_PAGE, ROWS_PER_TABLE_PAGE } from "../../hooks/pdfPlan";
import { SlidePage, ModuleFootprint } from "./SlidePage";
import { MODULE_COLORS } from "./theme";
import type { PdfCtx } from "./types";

type Pages = React.ReactNode[];

const wm = (c: PdfCtx) => (c.props.isFreeUser ? c.t("common.watermark") : undefined);

export function coverPages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  return [
    <SlidePage key="cover" slideLabel={c.label("cover")} s={s} watermark={wm(c)}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={s.accentBar} />
        <Text style={{ ...s.title, fontSize: 36 }}>{p.projectName}</Text>
        {p.clientName ? (
          <Text style={{ ...s.subtitle, fontSize: 16 }}>{t("cover.preparedFor", { name: p.clientName })}</Text>
        ) : null}
        <Text style={s.body}>{t.date()}</Text>
        <View style={{ flexDirection: "row", gap: 24, marginTop: 32 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.accent }}>{p.cost.totalModules}</Text>
            <Text style={{ fontSize: 8, color: theme.text, opacity: 0.5 }}>{t("cover.modulesLabel").toUpperCase()}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.accent }}>{p.cost.totalArea} m²</Text>
            <Text style={{ fontSize: 8, color: theme.text, opacity: 0.5 }}>{t("cover.totalArea").toUpperCase()}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.accent }}>{t.eur(p.cost.grandTotal)}</Text>
            <Text style={{ fontSize: 8, color: theme.text, opacity: 0.5 }}>{t("cover.estimate").toUpperCase()}</Text>
          </View>
        </View>
        <Text style={{ ...s.body, marginTop: 32, opacity: 0.4 }}>{t("cover.designedWith")}</Text>
      </View>
    </SlidePage>,
  ];
}

export function descriptionPages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  const roomList = t.rooms(p.modules.map((m) => m.moduleType));
  const styleName = p.style?.label || t("common.defaultStyle");
  const card = (k: string, value: string, sub: string) => (
    <View style={{ ...s.card, width: "46%" }}>
      <Text style={{ fontSize: 8, color: theme.accent, fontWeight: "bold" }}>{k.toUpperCase()}</Text>
      <Text style={{ fontSize: 18, color: theme.text, fontWeight: "bold", marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: 8, color: theme.text, opacity: 0.5, marginTop: 2 }}>{sub}</Text>
    </View>
  );
  return [
    <SlidePage key="description" slideLabel={c.label("description")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("description.title")}</Text>
      <Text style={{ ...s.body, marginTop: 16, lineHeight: 1.8 }}>
        {t("description.paragraph", {
          style: styleName.toLowerCase(), count: p.cost.totalModules, area: p.cost.totalArea,
          usable: p.cost.usableArea, rooms: roomList, finish: c.finishName.toLowerCase(),
        })}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        {card(t("description.configuration"), t("common.modules", { count: p.cost.totalModules }), roomList)}
        {card(t("description.totalArea"), `${p.cost.totalArea} m²`, t("description.usableInterior", { usable: p.cost.usableArea }))}
        {card(t("description.designStyle"), styleName, p.style?.tagline || t("description.styleFallback"))}
        {card(t("description.investment"), t.eur(p.cost.grandTotal), t("description.investmentSub", {
          finish: c.finishName, perM2: t.eur(p.cost.grandTotal / (p.cost.totalArea || 1)),
        }))}
      </View>
    </SlidePage>,
  ];
}

export function sitePages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  const row = (k: string, v: string | number) => (
    <View style={s.row}>
      <Text style={s.label}>{k}</Text>
      <Text style={s.value}>{v}</Text>
    </View>
  );
  return [
    <SlidePage key="site" slideLabel={c.label("site")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("site.title")}</Text>
      {hasPlot(p.polygon) ? (
        <>
          {row(t("site.location"), `${p.mapCenter.lat.toFixed(5)}, ${p.mapCenter.lng.toFixed(5)}`)}
          {row(t("site.plotCorners"), p.polygon.length)}
        </>
      ) : (
        // BUG-ST26: preset land has no plot → show the module footprint instead of "0 points, Bucharest"
        <ModuleFootprint modules={p.modules} s={s} theme={theme} t={t} />
      )}
      {row(t("site.totalModules"), p.cost.totalModules)}
      {row(t("site.totalArea"), `${p.cost.totalArea} m²`)}
      {row(t("site.usable"), `${p.cost.usableArea} m²`)}
    </SlidePage>,
  ];
}

export function floorplanPages(c: PdfCtx): Pages {
  const { props: p, t, s } = c;
  const fpPages = chunk(p.modules, ROWS_PER_TABLE_PAGE);
  const head = (k: string, w: string) => <Text style={{ ...s.label, fontWeight: "bold", width: w }}>{k}</Text>;
  return fpPages.map((rows, pi) => (
    <SlidePage key={`floorplan-${pi}`} slideLabel={pageLabel(c.label("floorplan"), pi, fpPages.length)} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{pageLabel(t("floorplan.titleLayout"), pi, fpPages.length)}</Text>
      <View style={{ ...s.row, borderBottomWidth: 1, marginBottom: 4 }}>
        {head(t("floorplan.colModule"), "20%")}
        {head(t("floorplan.colType"), "15%")}
        {head(t("floorplan.colPosition"), "15%")}
        {head(t("floorplan.colLayout"), "15%")}
        {head(t("floorplan.colFloor"), "15%")}
        {head(t("floorplan.colWalls"), "20%")}
      </View>
      {rows.map((m, i) => (
        <View key={i} style={s.row}>
          <Text style={{ ...s.body, width: "20%" }}>{m.label}</Text>
          <Text style={{ ...s.body, width: "15%" }}>{t.moduleType(m.moduleType)}</Text>
          <Text style={{ ...s.body, width: "15%" }}>R{m.row} C{m.col}</Text>
          <Text style={{ ...s.body, width: "15%" }}>{m.layoutPreset}</Text>
          <Text style={{ ...s.body, width: "15%" }}>{m.floorFinish}</Text>
          <Text style={{ ...s.body, width: "20%" }}>
            N:{m.wallConfigs.north[0]} S:{m.wallConfigs.south[0]} E:{m.wallConfigs.east[0]} W:{m.wallConfigs.west[0]}
          </Text>
        </View>
      ))}
    </SlidePage>
  ));
}

export function visionPages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  const swatches = (items: { color: string; label: string }[]) => (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
      {items.map((sw, i) => (
        <View key={i} style={{ alignItems: "center" }}>
          <View style={{ ...s.swatch, width: 36, height: 36, backgroundColor: sw.color }} />
          <Text style={{ fontSize: 7, color: theme.text, opacity: 0.5, marginTop: 3 }}>{sw.label}</Text>
        </View>
      ))}
    </View>
  );
  return [
    <SlidePage key="vision" slideLabel={c.label("vision")} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{t("vision.title")}</Text>
      {p.style ? (
        <>
          <Text style={{ ...s.title, fontSize: 22, marginBottom: 4 }}>{p.style.label}</Text>
          <Text style={{ ...s.subtitle, marginBottom: 16 }}>{p.style.tagline}</Text>
          <Text style={{ ...s.body, marginBottom: 20 }}>{p.style.description}</Text>
          <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 8 }}>{t("vision.palette")}</Text>
          {swatches(p.style.palette)}
          <Text style={{ ...s.body, fontWeight: "bold", marginBottom: 8 }}>{t("vision.materials")}</Text>
          {swatches(p.style.materials)}
        </>
      ) : (
        <Text style={s.body}>{t("vision.noStyle")}</Text>
      )}
    </SlidePage>,
  ];
}

export function modulePages(c: PdfCtx): Pages {
  const { props: p, t, s, theme } = c;
  // BUG-ST24: paginate (slice(0, 8) dropped the 9th module)
  const mdPages = chunk(p.modules, MODULES_PER_DETAILS_PAGE);
  const line = (txt: string) => <Text style={{ fontSize: 8, color: theme.text, opacity: 0.6 }}>{txt}</Text>;
  return mdPages.map((mods, pi) => (
    <SlidePage key={`modules-${pi}`} slideLabel={pageLabel(c.label("modules"), pi, mdPages.length)} s={s} watermark={wm(c)}>
      <View style={s.accentBar} />
      <Text style={s.sectionTitle}>{pageLabel(t("modules.title"), pi, mdPages.length)}</Text>
      <View style={s.grid}>
        {mods.map((m, i) => (
          <View key={i} style={s.card}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: MODULE_COLORS[m.moduleType] || "#888", marginRight: 6 }} />
              <Text style={{ fontSize: 11, fontWeight: "bold", color: theme.text }}>{m.label}</Text>
            </View>
            {line(`${t("modules.type")}: ${t.moduleType(m.moduleType)}`)}
            {line(`${t("modules.layout")}: ${m.layoutPreset}`)}
            {line(`${t("modules.floor")}: ${m.floorFinish} | ${t("modules.wall")}: ${m.wallColor}`)}
          </View>
        ))}
      </View>
    </SlidePage>
  ));
}
