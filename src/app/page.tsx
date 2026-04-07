import Link from "next/link";

/**
 * ModulCA Landing Page
 * Investor-ready MVP with complete feature showcase.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal-800">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold text-brand-teal-800">
              Modul<span className="text-brand-amber-500">CA</span>
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brand-teal-800">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-brand-teal-800">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-brand-teal-800">Pricing</a>
            <a href="#for-builders" className="text-sm font-medium text-gray-600 hover:text-brand-teal-800">For Builders</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-teal-800"
            >
              Log in
            </Link>
            <Link href="/project/demo/land" className="btn-accent text-sm">
              Try Free Demo
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-teal-50/40 to-white px-4 pb-20 pt-16 sm:pt-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-brand-amber-200 bg-brand-amber-50 px-4 py-1.5 text-sm font-medium text-brand-amber-700">
              AI-Powered Modular Construction Platform
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-brand-teal-800 sm:text-5xl lg:text-6xl">
              Design Your Modular
              <br />
              <span className="text-brand-amber-500">Home in Minutes</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
              Place 3&times;3m modules on your land, visualize in 3D, get AI renders,
              technical drawings, cost estimates, and connect with certified builders.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/project/demo/land" className="btn-accent px-8 py-4 text-base shadow-lg shadow-brand-amber-500/20">
                Start Designing — Free
              </Link>
              <a href="#how-it-works" className="btn-outline px-8 py-4 text-base">
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400">No account needed for demo. Full 13-step design flow.</p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-gray-100 bg-white py-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 sm:gap-16">
            {[
              { value: "13", label: "Design Steps" },
              { value: "8", label: "Module Types" },
              { value: "5", label: "AI Engines" },
              { value: "6", label: "Technical Drawings" },
              { value: "9", label: "Building Presets" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-brand-teal-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-brand-teal-800 sm:text-3xl">
              Everything You Need to Design &amp; Build
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
              From land selection to building permits — a complete modular construction workflow in one platform.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "🗺️", title: "Interactive Land Designer", desc: "Draw your building area on a real map with Mapbox. Auto-generated 3x3m grid overlay." },
                { icon: "🧱", title: "Modular Layout System", desc: "8 room types, 9 building presets, drag-and-place modules with shared wall detection." },
                { icon: "🎨", title: "3D Preview & Visualization", desc: "Real-time Three.js preview with furniture, materials, lighting, and module inspection." },
                { icon: "🤖", title: "AI-Powered Renders", desc: "5 AI engines generate photorealistic interior renders. Multiple styles and templates." },
                { icon: "📐", title: "Technical Drawings", desc: "6 CAD-quality SVG drawings per module — floor plan, section, elevation, MEP, foundation." },
                { icon: "🚶", title: "3D Walkthrough", desc: "First-person walkthrough with WASD controls, minimap, auto-tour, and room navigation." },
                { icon: "📋", title: "Building Permits", desc: "12-step Romanian authorization tracker with document management and progress monitoring." },
                { icon: "📖", title: "Construction Manual", desc: "Neufert-based knowledge base with standards, dimensions, and regulatory guidance." },
                { icon: "🏪", title: "Land Marketplace", desc: "Browse available terrains or list your own. Filter by area, price, zoning, and suitability." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 text-2xl">{f.icon}</div>
                  <h3 className="mb-1.5 text-sm font-semibold text-brand-teal-800">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-gray-50 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-brand-teal-800 sm:text-3xl">
              How It Works
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Choose Your Land",
                  description: "Locate your plot on the map, draw your building area, and place modular room types on a 3x3m grid.",
                  icon: "📍",
                },
                {
                  step: "2",
                  title: "Design & Visualize",
                  description: "Configure materials, get AI renders, explore in 3D walkthrough, and download technical drawings.",
                  icon: "🏠",
                },
                {
                  step: "3",
                  title: "Build & Connect",
                  description: "Get your cost estimate, full PDF presentation, building permit checklist, and connect with builders.",
                  icon: "🔧",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal-50 text-2xl">
                    {item.icon}
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-amber-500">
                    Step {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-brand-teal-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/project/demo/land" className="btn-accent px-8 py-3 text-sm">
                Try the Full 13-Step Flow
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-brand-teal-800 sm:text-3xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-gray-500">
              Start free, upgrade when you need more. No hidden fees.
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  name: "Explorer",
                  price: "Free",
                  period: "",
                  description: "Discover modular construction. Design your first home for free.",
                  features: [
                    "Up to 4 modules per project",
                    "5 AI renders per month",
                    "Floor plan & section drawings",
                    "3D walkthrough",
                    "Knowledge base access",
                    "1 saved project",
                  ],
                  cta: "Start Free",
                  highlight: false,
                },
                {
                  name: "Premium",
                  price: "\u20AC19",
                  period: "/month",
                  description: "Full design experience with all tools and export options.",
                  features: [
                    "Up to 12 modules per project",
                    "30 AI renders per month (HD)",
                    "All 6 drawing types + PDF export",
                    "Auto-tour & building permits",
                    "Product catalog with real pricing",
                    "5 projects + sharable links",
                  ],
                  cta: "Get Premium",
                  highlight: true,
                },
                {
                  name: "Architect / Builder",
                  price: "\u20AC49",
                  period: "/month",
                  description: "Professional toolkit for managing clients and projects.",
                  features: [
                    "Up to 50 modules, custom sizes",
                    "100 AI renders per month (4K)",
                    "DWG/DXF export for CAD",
                    "Team collaboration & client dashboard",
                    "White-label branding",
                    "Unlimited projects + priority support",
                  ],
                  cta: "Go Professional",
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border-2 p-6 text-center shadow-sm transition-shadow hover:shadow-md ${
                    plan.highlight
                      ? "border-brand-amber-500 bg-brand-amber-50/30 relative"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber-500 px-3 py-0.5 text-xs font-bold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="mb-1 text-lg font-semibold text-brand-teal-800">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-brand-amber-500">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="mb-5 text-xs text-gray-500">{plan.description}</p>
                  <ul className="mb-6 space-y-2 text-left text-sm text-gray-600">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-teal-600">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.highlight ? "/pricing" : "/project/demo/land"}
                    className={`block w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-brand-amber-500 text-white hover:bg-brand-amber-600"
                        : "border border-gray-200 bg-white text-brand-teal-800 hover:bg-gray-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Builders */}
        <section id="for-builders" className="bg-brand-teal-800 px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              For Builders &amp; Architects
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-brand-teal-100">
              Join our network of certified modular builders. Receive qualified leads,
              manage client projects, and grow your business with our professional tools.
            </p>
            <div className="mx-auto mb-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
              {[
                "Client project dashboard",
                "White-label presentations",
                "Technical drawing export (DWG)",
                "Building permit management",
                "Team collaboration tools",
                "Priority support channel",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-brand-teal-100">
                  <span className="text-brand-amber-400">✓</span> {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/project/demo/land" className="rounded-lg bg-brand-amber-500 px-8 py-3 text-sm font-bold text-white hover:bg-brand-amber-600 transition-colors shadow-lg">
                See a Demo Project
              </Link>
              <Link href="/register" className="rounded-lg border border-white/30 px-8 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                Apply as Builder
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-teal-800">
                <span className="text-[10px] font-bold text-white">M</span>
              </div>
              <span className="text-sm font-bold text-brand-teal-800">
                Modul<span className="text-brand-amber-500">CA</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href="#features" className="hover:text-gray-600">Features</a>
              <a href="#pricing" className="hover:text-gray-600">Pricing</a>
              <a href="#for-builders" className="hover:text-gray-600">For Builders</a>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ModulCA. Built in Bucharest.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
