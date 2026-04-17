/**
 * NextStepsSlide — closing CTA with process timeline & contact info.
 */

import { SlideCard, SlideHeader } from "./shared";
import type { SlideContext } from "./types";

interface Props extends SlideContext {
  slideNumber: number;
}

const TIMELINE = [
  { phase: "Review & Approve", days: "3-5 days", description: "Share this presentation, gather feedback, finalize design" },
  { phase: "Permit & Engineering", days: "2-3 weeks", description: "Structural review, permit submission" },
  { phase: "Factory Production", days: "4-6 weeks", description: "Modules manufactured off-site in climate-controlled facility" },
  { phase: "Foundation Prep", days: "1-2 weeks", description: "Site preparation, foundation pour, utilities hookup" },
  { phase: "Assembly & Finish", days: "2-4 weeks", description: "Crane delivery, assembly, interior finish, inspection" },
];

export default function NextStepsSlide(props: Props) {
  const { template: tmpl, slideNumber, clientName } = props;

  return (
    <SlideCard bg={tmpl.bg} text={tmpl.text}>
      <SlideHeader
        accent={tmpl.accent}
        text={tmpl.text}
        number={slideNumber}
        title="Next Steps"
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Timeline */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: tmpl.accent }}>
            Project Timeline
          </h3>
          <ol className="space-y-4">
            {TIMELINE.map((phase, i) => (
              <li key={phase.phase} className="flex gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs"
                  style={{
                    backgroundColor: tmpl.accent,
                    color: tmpl.bg,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-bold text-sm" style={{ color: tmpl.text }}>
                      {phase.phase}
                    </span>
                    <span className="text-xs" style={{ color: tmpl.text, opacity: 0.6 }}>
                      {phase.days}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: tmpl.text, opacity: 0.7 }}>
                    {phase.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            className="mt-6 p-4 rounded-lg border"
            style={{
              borderColor: `${tmpl.accent}40`,
              backgroundColor: `${tmpl.accent}10`,
            }}
          >
            <p className="text-xs" style={{ color: tmpl.text }}>
              <span className="font-bold">Total time from approval to move-in:</span>{" "}
              typically <strong>3–4 months</strong>, compared to 8–18 months for traditional construction.
            </p>
          </div>
        </div>

        {/* Contact & Next Action */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: tmpl.accent }}>
            Ready to Build?
          </h3>

          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: `${tmpl.accent}15` }}
          >
            <p className="text-sm mb-4" style={{ color: tmpl.text }}>
              {clientName ? `${clientName}, your` : "Your"} modular home is ready for the next step.
              Connect with certified ModulCA builders in your region to get firm quotes and start the
              engineering phase.
            </p>

            <div className="space-y-3 mt-6">
              <ContactRow
                tmpl={tmpl}
                label="Email"
                value="contact@modulca.eu"
              />
              <ContactRow
                tmpl={tmpl}
                label="Web"
                value="www.modulca.eu"
              />
              <ContactRow
                tmpl={tmpl}
                label="Project ID"
                value={`MC-${Date.now().toString().slice(-6)}`}
              />
            </div>
          </div>

          <div className="mt-6 text-[10px]" style={{ color: tmpl.text, opacity: 0.4 }}>
            This presentation is a conceptual design aid. Final engineering, structural analysis,
            and permit compliance require a licensed professional. All costs are indicative and
            may vary based on site conditions, material markets, and regional regulations.
          </div>
        </div>
      </div>
    </SlideCard>
  );
}

function ContactRow({
  tmpl,
  label,
  value,
}: {
  tmpl: { text: string; accent: string };
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: tmpl.accent }}
      >
        {label}
      </span>
      <span className="text-sm font-mono" style={{ color: tmpl.text }}>
        {value}
      </span>
    </div>
  );
}
