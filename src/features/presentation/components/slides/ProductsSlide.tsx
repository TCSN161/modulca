/**
 * ProductsSlide — selected products list with quantity, unit price, and totals.
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

export interface ProductEntry {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ProductsSlideProps extends SlideContext {
  slideNumber: number;
  products: ProductEntry[];
}

export default function ProductsSlide(props: ProductsSlideProps) {
  const { template: tmpl, slideNumber, products } = props;

  const itemBg =
    tmpl.bg === "#FFFFFF" ? "#f8f8f8" : tmpl.bg === "#111111" ? "#1a1a1a" : "#f0ede8";

  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Selected Products"
      />

      {products.length > 0 ? (
        <div className="mt-6">
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ backgroundColor: itemBg }}
              >
                <div>
                  <span className="text-sm font-medium" style={{ color: tmpl.text }}>
                    {p.name}
                  </span>
                  <span
                    className="block text-[10px]"
                    style={{ color: tmpl.text, opacity: 0.4 }}
                  >
                    Qty: {p.quantity} × EUR{p.price}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
                  EUR{(p.quantity * p.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-3 border-t flex justify-between"
            style={{ borderColor: tmpl.text + "20" }}
          >
            <span className="text-sm font-bold" style={{ color: tmpl.text }}>
              Products Total
            </span>
            <span className="text-sm font-bold" style={{ color: tmpl.accent }}>
              EUR{total.toLocaleString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-12">
          <p className="text-sm" style={{ color: tmpl.text, opacity: 0.4 }}>
            No products selected yet. Add products in Step 11 (Products).
          </p>
        </div>
      )}
    </SlideCard>
  );
}
