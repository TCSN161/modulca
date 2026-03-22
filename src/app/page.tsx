import Link from "next/link";

/**
 * ModulCA Landing Page (MVP scaffolding version).
 * Full landing page with hero, features, CTAs comes in Task 04.
 * This version validates: Next.js rendering, Tailwind config, brand colors, Inter font.
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
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-teal-800"
            >
              Sign In
            </Link>
            <Link href="/register" className="btn-accent text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-brand-amber-200 bg-brand-amber-50 px-4 py-1.5 text-sm font-medium text-brand-amber-700">
            AI-Powered Modular Design
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-brand-teal-800 sm:text-5xl lg:text-6xl">
            Design Your Modular
            <br />
            <span className="text-brand-amber-500">Home in Minutes</span>
          </h1>
          <p className="mb-10 text-lg text-gray-600 sm:text-xl">
            Place 3x3m modules on your land, customize finishes, and get instant
            cost estimates. Connect with certified builders when you&apos;re ready.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-accent px-8 py-4 text-base">
              Start Designing — It&apos;s Free
            </Link>
            <Link href="#how-it-works" className="btn-outline px-8 py-4 text-base">
              See How It Works
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="mt-24 w-full max-w-5xl pb-20">
          <h2 className="mb-12 text-center text-2xl font-bold text-brand-teal-800 sm:text-3xl">
            Three Simple Steps
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose Your Land",
                description:
                  "Locate your plot on the map, draw your building area, and we overlay a 3x3m grid.",
                icon: "📍",
              },
              {
                step: "2",
                title: "Design Your Modules",
                description:
                  "Place bedrooms, kitchens, bathrooms — each module is 3x3m. Pick your finish level.",
                icon: "🏠",
              },
              {
                step: "3",
                title: "Get Your Estimate",
                description:
                  "See your floor plan, cost breakdown, and download a PDF. Connect with builders.",
                icon: "📄",
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
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} ModulCA. All rights reserved.</p>
        <p className="mt-1">Modular construction platform — Built in Bucharest</p>
      </footer>
    </div>
  );
}
