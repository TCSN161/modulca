"use client";

import { useTranslations } from "next-intl";
import { AI_ENGINES, type AiEngine } from "./renderConstants";

/** Human label for an engine id from `X-AI-Engine` (ids not in AI_ENGINES show as-is). */
export function engineLabel(id: string): string {
  return AI_ENGINES[id as AiEngine]?.label ?? id;
}

interface Props {
  engine: string;
  fallbackFrom?: string[];
  baseNotKept?: boolean;
  className?: string;
}

/**
 * "Randat cu {engine}" under every render, plus "(alternativă: {failed}
 * indisponibil)" when the server fell back (BUG-ST29).
 */
export default function RenderEngineBadge({ engine, fallbackFrom = [], baseNotKept, className }: Props) {
  const t = useTranslations("render");
  return (
    <div className={className ?? "text-center text-[10px] text-gray-500"} data-testid="render-engine-badge">
      <p>
        <span className="font-semibold text-brand-teal-700">{t("engineUsed", { engine: engineLabel(engine) })}</span>
        {fallbackFrom.length > 0 && (
          <span className="ml-1 text-brand-amber-600">
            {t("fallback", { failed: fallbackFrom.map(engineLabel).join(", ") })}
          </span>
        )}
      </p>
      {baseNotKept && <p className="mt-0.5 text-brand-amber-600">{t("baseNotKept")}</p>}
    </div>
  );
}
