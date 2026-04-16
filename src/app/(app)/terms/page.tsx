import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ModulCA terms of service — rules and conditions for using the platform.",
};

export default function TermsPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-brand-gray">
          <Link href="/" className="hover:text-brand-olive-700 transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors">Privacy</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Terms of Service</h1>
        <p className="text-sm text-brand-gray mb-8">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm text-brand-gray leading-relaxed">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using ModulCA (&quot;the Platform&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Platform.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              ModulCA is an AI-powered modular construction design platform that allows users to
              design modular homes using a 3x3m grid system, generate visualizations, technical
              drawings, cost estimates, and connect with certified builders.
            </p>
            <p className="mt-2">
              The Platform is currently in <strong>Beta</strong>. Features may change, and the
              service may experience downtime or bugs.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 16 years old to create an account</li>
              <li>One person may not maintain more than one free account</li>
            </ul>
          </Section>

          <Section title="4. Subscription Plans">
            <p>
              ModulCA offers free and paid subscription tiers (Explorer, Premium, Architect, Constructor).
              Paid plans are billed monthly or yearly via Stripe.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You may upgrade or downgrade your plan at any time</li>
              <li>Downgrades take effect at the end of the current billing period</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of purchase</li>
              <li>Prices are in EUR and exclude applicable taxes</li>
            </ul>
          </Section>

          <Section title="5. Beta Bonus">
            <p>
              During the beta phase, new free accounts receive 3 months of Premium-level features
              at no cost. After the beta bonus expires, you may upgrade to a paid plan or continue
              with the Explorer (free) tier.
            </p>
          </Section>

          <Section title="6. Your Content">
            <p>
              You retain ownership of all designs, configurations, and project data you create
              on ModulCA. By using the Platform, you grant us a limited license to store and
              process your content solely for providing the service.
            </p>
            <p className="mt-2">
              We do not claim ownership over your designs and will not use them for marketing
              without your explicit written consent.
            </p>
          </Section>

          <Section title="7. AI-Generated Content">
            <p>
              ModulCA uses AI services to generate renders, recommendations, and architectural
              analysis. AI-generated content is provided &quot;as is&quot; and should not be
              considered professional architectural or engineering advice.
            </p>
            <p className="mt-2">
              Always consult a licensed architect or structural engineer before making construction
              decisions based on ModulCA outputs.
            </p>
          </Section>

          <Section title="8. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, scrape, or copy the Platform</li>
              <li>Abuse AI generation features (excessive requests, harmful content)</li>
              <li>Share account credentials with unauthorized users</li>
              <li>Use automated tools to access the Platform without permission</li>
            </ul>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              ModulCA is a design tool, not a construction or engineering service. We are not
              responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Construction outcomes based on Platform designs</li>
              <li>Cost estimates accuracy (these are indicative, not quotes)</li>
              <li>Building permit approvals or regulatory compliance</li>
              <li>Third-party builder performance or quality</li>
            </ul>
            <p className="mt-2">
              To the maximum extent permitted by law, our total liability is limited to the
              amount you paid for the service in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              We may suspend or terminate your account if you violate these terms. You may
              delete your account at any time by contacting us. Upon termination, your
              project data will be deleted within 30 days.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These terms are governed by the laws of Romania and the European Union.
              Any disputes will be resolved in the courts of Romania.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:contact@modulca.eu" className="text-brand-olive-700 underline">contact@modulca.eu</a>.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-brand-bone-300/60 bg-brand-bone-100 py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-xs text-brand-gray">
          <span>ModulCA Alfa 0.2</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-brand-olive-700 transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-brand-olive-700 transition-colors font-semibold text-brand-olive-700">Terms</Link>
            <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-brand-charcoal mb-2">{title}</h2>
      {children}
    </section>
  );
}
