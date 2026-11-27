/**
 * NextStepsEditSlide — the 4 editable "Next steps" (moved out of
 * PresentationPage, 3.08). Steps default to the translated texts; an edited
 * step is kept as typed. The same list goes into the react-pdf document.
 */
import type { SlideTemplate } from "./types";
import type { PresentationT } from "../../i18n";

export interface NextStep { title: string; desc: string }

export default function NextStepsEditSlide({ template: tmpl, t, number, steps, onChange }: {
  template: SlideTemplate;
  t: PresentationT;
  number: number;
  steps: NextStep[];
  onChange: (index: number, step: NextStep) => void;
}) {
  return (
    <div
      data-slide="true"
      className="rounded-2xl shadow-lg mb-6 p-4 md:p-8 print:shadow-none print:rounded-none print:mb-0 print:break-after-page"
      style={{ backgroundColor: tmpl.bg, color: tmpl.text, minHeight: 300, aspectRatio: "297/210" }}
    >
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: tmpl.accent }}>
          {number}
        </div>
        <h2 className="text-2xl font-bold" style={{ color: tmpl.text }}>{t("next.title")}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: tmpl.text + "15" }} />
      </div>
      <div className="mt-8 max-w-lg mx-auto space-y-6">
        {steps.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: tmpl.accent }}>
              {i + 1}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={item.title}
                onChange={(e) => onChange(i, { ...item, title: e.target.value })}
                className="w-full bg-transparent text-sm font-bold border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                style={{ color: tmpl.text }}
              />
              <input
                type="text"
                value={item.desc}
                onChange={(e) => onChange(i, { ...item, desc: e.target.value })}
                className="w-full bg-transparent text-xs mt-1 border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                style={{ color: tmpl.text, opacity: 0.5 }}
              />
            </div>
          </div>
        ))}
        <div className="text-center pt-6">
          <div className="h-1 w-16 rounded mx-auto mb-4" style={{ backgroundColor: tmpl.accent }} />
          <p className="text-xs" style={{ color: tmpl.text, opacity: 0.4 }}>
            {t("next.generatedWith")}
          </p>
        </div>
      </div>
    </div>
  );
}
