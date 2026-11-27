"use client";

import Link from "next/link";
import type { ProductLine } from "../../projectCost";

/** BUG-ST08: selected products on the Finalize summary (same lines as the cost total). */
export default function FinalizeProducts({
  lines,
  total,
  projectId,
}: {
  lines: ProductLine[];
  total: number;
  projectId: string;
}) {
  return (
    <section
      aria-labelledby="finalize-products-title"
      data-testid="finalize-products"
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 id="finalize-products-title" className="text-sm font-semibold text-brand-charcoal">
          Selected Products ({lines.length})
        </h2>
        <Link
          href={`/project/${projectId}/products`}
          className="text-xs text-brand-teal-700 hover:underline"
        >
          Edit
        </Link>
      </div>
      {lines.length === 0 ? (
        <p className="text-xs text-brand-gray">No products selected yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3 text-sm">
              <span className="truncate text-brand-charcoal">
                {l.name}
                <span className="ml-1 text-[11px] text-brand-gray">
                  {l.unit === "m2" ? `${l.quantity.toLocaleString()} m²` : `× ${l.quantity}`}
                </span>
              </span>
              <span className="font-medium text-brand-charcoal" suppressHydrationWarning>
                &euro;{Math.round(l.total).toLocaleString()}
              </span>
            </li>
          ))}
          <li className="flex justify-between border-t border-gray-100 pt-1.5 text-sm font-semibold">
            <span>Products total</span>
            <span suppressHydrationWarning>&euro;{Math.round(total).toLocaleString()}</span>
          </li>
        </ul>
      )}
    </section>
  );
}
