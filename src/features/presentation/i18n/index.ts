/**
 * Presentation + PDF i18n (BUG-ST32).
 *
 * The slides and the react-pdf document follow the user's locale (next-intl
 * `useLocale()`: cookie → domain → Accept-Language), with a per-presentation
 * override in the sidebar. react-pdf renders outside the React tree (no
 * NextIntlClientProvider), so this uses next-intl's `createTranslator` with the
 * feature's own messages (en/ro/nl.ts, same ICU syntax as src/i18n/messages).
 */
import { createTranslator } from "next-intl";
import { LOCALES, type Locale } from "@/i18n/config";
import { AI_ENGINES, type AiEngine } from "@/features/design/components/render/renderConstants";
import { en, type PresentationMessages } from "./en";
import { ro } from "./ro";
import { nl } from "./nl";

export type { PresentationMessages };
export type PresentationLocale = Locale;
export const PRESENTATION_LOCALES = LOCALES;

const MESSAGES: Record<Locale, PresentationMessages> = { en, ro, nl };

/** BCP-47 tag for number / date formatting */
const INTL_TAG: Record<Locale, string> = { en: "en-GB", ro: "ro-RO", nl: "nl-NL" };

export function toPresentationLocale(value: string | null | undefined): Locale {
  return (LOCALES as readonly string[]).includes(value ?? "") ? (value as Locale) : "en";
}

type Values = Record<string, string | number>;

export interface PresentationT {
  (key: string, values?: Values): string;
  locale: Locale;
  /** € amount, no decimals ("40.272 €" in RO, "€40,272" in EN) */
  eur: (n: number) => string;
  /** € unit price, up to 2 decimals */
  eurPrice: (n: number) => string;
  /** Number with locale grouping, up to 2 decimals */
  num: (n: number) => string;
  /** Long date in Europe/Bucharest (same zone as the app, BUG-ST20) */
  date: (d?: Date) => string;
  moduleType: (id: string) => string;
  /** "3 dormitoare, 1 bucătărie" from module types */
  rooms: (types: string[], sep?: string) => string;
  finish: (id: string) => string;
  /** Engine id → human label */
  engine: (id: string) => string;
}

export function presentationT(localeInput: string | null | undefined): PresentationT {
  const locale = toPresentationLocale(localeInput);
  const messages = MESSAGES[locale];
  const raw = createTranslator({
    locale,
    messages: messages as unknown as Record<string, string>,
    onError: () => {},
    getMessageFallback: ({ key, namespace }) => {
      const full = namespace ? `${namespace}.${key}` : key;
      return lookup(en, full) ?? full;
    },
  }) as unknown as (key: string, values?: Values) => string;
  const tag = INTL_TAG[locale];
  const eurFmt = new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
  const priceFmt = new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const numFmt = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 });

  const t = ((key: string, values?: Values) => raw(key, values)) as PresentationT;
  t.locale = locale;
  t.eur = (n) => eurFmt.format(Math.round(n));
  t.eurPrice = (n) => priceFmt.format(n);
  t.num = (n) => numFmt.format(n);
  t.date = (d = new Date()) =>
    d.toLocaleDateString(tag, { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Bucharest" });
  t.moduleType = (id) => lookup(messages, `moduleType.${id}`) ?? id;
  t.rooms = (types, sep = ", ") => {
    const counts = new Map<string, number>();
    for (const ty of types) counts.set(ty, (counts.get(ty) ?? 0) + 1);
    return [...counts].map(([ty, count]) =>
      lookup(messages, `roomCount.${ty}`) ? raw(`roomCount.${ty}`, { count }) : `${count} ${ty}`,
    ).join(sep);
  };
  t.finish = (id) => lookup(messages, `finish.${id}`) ?? id;
  t.engine = (id) => AI_ENGINES[id.replace(/-img2img$/, "") as AiEngine]?.label ?? id;
  return t;
}

function lookup(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Engine caption for a render: "FLUX.2 klein (Cloudflare)" + "(alternativă: X indisponibil)" when fallbackFrom is not empty (BUG-ST29). */
export function renderEngineCaption(
  t: PresentationT,
  render: { engine?: string; fallbackFrom?: string[] },
): { engine: string; fallback: string | null } {
  const engine = render.engine ? t.engine(render.engine) : "";
  const canon = (render.engine ?? "").replace(/-img2img$/, "");
  const failed = (render.fallbackFrom ?? []).filter((e) => e && e.replace(/-img2img$/, "") !== canon);
  return { engine, fallback: failed.length > 0 ? t("renders.fallback", { failed: failed.map(t.engine).join(", ") }) : null };
}

/** Mode badge: 3D+AI, Photo+AI (img2img from an uploaded photo), Text-to-Image */
export function renderModeLabel(t: PresentationT, r: { mode?: string; baseSource?: string }): string | null {
  if (!r.mode) return null;
  if (r.mode === "img2img") return r.baseSource === "upload" ? t("renders.modePhoto") : t("renders.modeImg2img");
  return t("renders.modeText");
}

/** The 4 translated "Next steps" (slide + PDF default) */
export function defaultNextSteps(t: PresentationT): { title: string; desc: string }[] {
  return (["s1", "s2", "s3", "s4"] as const).map((k) => ({ title: t(`next.steps.${k}.title`), desc: t(`next.steps.${k}.desc`) }));
}
