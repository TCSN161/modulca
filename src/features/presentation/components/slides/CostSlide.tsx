/**
 * CostSlide — module cost, discounts, upgrades, design fee, products, total.
 * BUG-ST31: reads computeProjectCost(), so the total includes the products and
 * matches Finalize and the dashboard card.
 */

import { SlideCard, SlideHeader, CostRow } from "./shared";
import type { SlideContext } from "./types";
import type { ProjectCost } from "@/features/design/projectCost";

export interface CostSlideProps extends SlideContext {
  slideNumber: number;
  cost: ProjectCost;
}

export default function CostSlide(props: CostSlideProps) {
  const { template: tmpl, slideNumber, cost: k, finishName, t } = props;
  const signed = (n: number) => `${n > 0 ? "+" : "-"}${t.eur(Math.abs(n))}`;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title={t("cost.title")}
      />

      <div className="mt-8 max-w-md mx-auto space-y-3">
        <CostRow
          label={t("cost.modules", { count: k.totalModules, finish: finishName })}
          value={t.eur(k.moduleCost)}
          text={tmpl.text}
        />
        {k.sharedWallDiscount > 0 && (
          <CostRow
            label={t("cost.sharedWall", { count: k.sharedWalls })}
            value={`-${t.eur(k.sharedWallDiscount)}`}
            text={tmpl.text}
            green
          />
        )}
        {k.wallUpgradeCost !== 0 && (
          <CostRow label={t("cost.wallUpgrades")} value={signed(k.wallUpgradeCost)} text={tmpl.text} />
        )}
        {k.thicknessUpgradeCost !== 0 && (
          <CostRow label={t("cost.thicknessUpgrades")} value={signed(k.thicknessUpgradeCost)} text={tmpl.text} />
        )}
        <CostRow label={t("cost.designFee")} value={t.eur(k.designFee)} text={tmpl.text} />
        {k.productCost > 0 && (
          <>
            <CostRow label={t("cost.designSubtotal")} value={t.eur(k.totalEstimate)} text={tmpl.text} />
            <CostRow label={t("cost.products")} value={t.eur(k.productCost)} text={tmpl.text} />
          </>
        )}
        <div className="border-t pt-3 mt-3" style={{ borderColor: tmpl.text + "20" }}>
          <div className="flex justify-between">
            <span className="text-lg font-bold" style={{ color: tmpl.text }}>
              {t("cost.total")}
            </span>
            <span className="text-lg font-bold" style={{ color: tmpl.accent }}>
              {t.eur(k.grandTotal)}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-center mt-4" style={{ color: tmpl.text, opacity: 0.3 }}>
          {t("cost.disclaimer", { finish: finishName })}
        </p>
      </div>
    </SlideCard>
  );
}
