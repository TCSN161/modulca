/**
 * CostSlide — breakdown of module cost + shared wall discount + design fee.
 */

import { SlideCard, SlideHeader, CostRow } from "./shared";
import type { SlideContext } from "./types";

export interface CostSlideProps extends SlideContext {
  slideNumber: number;
  moduleCost: number;
  sharedWallDiscount: number;
  designFee: number;
  totalEstimateEur: number;
}

export default function CostSlide(props: CostSlideProps) {
  const {
    template: tmpl,
    slideNumber,
    moduleCost,
    sharedWallDiscount,
    designFee,
    totalEstimateEur,
    finishName,
  } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Cost Summary"
      />

      <div className="mt-8 max-w-md mx-auto space-y-3">
        <CostRow
          label={`Module cost (${finishName})`}
          value={`EUR${moduleCost.toLocaleString()}`}
          text={tmpl.text}
        />
        {sharedWallDiscount > 0 && (
          <CostRow
            label="Shared wall discount"
            value={`-EUR${sharedWallDiscount.toLocaleString()}`}
            text={tmpl.text}
            green
          />
        )}
        <CostRow
          label="Design fee (8%)"
          value={`EUR${designFee.toLocaleString()}`}
          text={tmpl.text}
        />
        <div className="border-t pt-3 mt-3" style={{ borderColor: tmpl.text + "20" }}>
          <div className="flex justify-between">
            <span className="text-lg font-bold" style={{ color: tmpl.text }}>
              Total Estimate
            </span>
            <span className="text-lg font-bold" style={{ color: tmpl.accent }}>
              EUR{totalEstimateEur.toLocaleString()}
            </span>
          </div>
        </div>
        <p
          className="text-[10px] text-center mt-4"
          style={{ color: tmpl.text, opacity: 0.3 }}
        >
          * Estimate based on {finishName} finish level. Final price may vary based on local
          conditions and builder quotes.
        </p>
      </div>
    </SlideCard>
  );
}
