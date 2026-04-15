import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    links: [
      { label: "Design Your Home", href: "/project/demo/choose" },
      { label: "AI Consultant", href: "/project/demo/consultant" },
      { label: "Knowledge Library", href: "/library" },
      { label: "Architectural Quiz", href: "/quiz" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "mailto:contact@modulca.eu" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-bone-300/60 bg-brand-bone-100 py-10">
      <div className="mx-auto max-w-5xl px-4">
        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-sm font-bold tracking-heading text-brand-charcoal">
              Modul<span className="text-brand-amber-500">CA</span>
            </Link>
            <p className="mt-2 text-xs text-brand-gray leading-relaxed">
              Modular wooden homes designed with AI. 3x3m modules, infinite possibilities.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[10px] font-bold uppercase tracking-label text-brand-gray mb-3">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-xs text-brand-gray hover:text-brand-charcoal transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-brand-bone-300/40 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-brand-gray">
            &copy; {new Date().getFullYear()} ModulCA. Built for sustainability.
          </p>
          <p className="text-[10px] text-brand-gray/60">
            modulca.eu &mdash; Romania &amp; Europe
          </p>
        </div>
      </div>
    </footer>
  );
}
