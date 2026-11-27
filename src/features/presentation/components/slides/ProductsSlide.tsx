/**
 * ProductsSlide — selected products with quantity, unit price and totals.
 * BUG-ST31: lines come from computeProjectCost(): a per-m² product covers the
 * usable floor area, so quantity is in m² and the total matches Finalize.
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";
import type { ProductLine } from "@/features/design/projectCost";

export interface ProductsSlideProps extends SlideContext {
  slideNumber: number;
  lines: ProductLine[];
  productCost: number;
}

export default function ProductsSlide(props: ProductsSlideProps) {
  const { template: tmpl, slideNumber, lines, productCost, t } = props;

  const itemBg =
    tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8";
  const unit = (u: ProductLine["unit"]) => (u === "m2" ? t("products.unitM2") : t("products.unitPcs"));

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title={t("products.title")}
      />

      {lines.length > 0 ? (
        <div className="mt-6">
          <div className="space-y-2">
            {lines.map((l) => (
              <div
                key={l.productId}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ backgroundColor: itemBg }}
              >
                <div>
                  <span className="text-sm font-medium" style={{ color: tmpl.text }}>
                    {l.name}
                  </span>
                  <span className="block text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>
                    {t.num(l.quantity)} {unit(l.unit)} × {t("products.perUnit", { price: t.eurPrice(l.unitPrice), unit: unit(l.unit) })}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
                  {t.eur(l.total)}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-3 border-t flex justify-between"
            style={{ borderColor: tmpl.text + "20" }}
          >
            <span className="text-sm font-bold" style={{ color: tmpl.text }}>
              {t("products.total")}
            </span>
            <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
              {t.eur(productCost)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-12">
          <p className="text-sm" style={{ color: tmpl.text, opacity: 0.4 }}>
            {t("products.noneHint")}
          </p>
        </div>
      )}
    </SlideCard>
  );
}
