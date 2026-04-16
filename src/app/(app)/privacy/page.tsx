import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ModulCA privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-brand-gray">
          <Link href="/" className="hover:text-brand-olive-700 transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-brand-olive-700 transition-colors">Terms</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">Privacy Policy</h1>
        <p className="text-sm text-brand-gray mb-8">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm text-brand-gray leading-relaxed">
          <Section title="1. Who We Are">
            <p>
              ModulCA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a modular construction
              design platform operated from Romania, EU. Our website is{" "}
              <a href="https://www.modulca.eu" className="text-brand-olive-700 underline">www.modulca.eu</a>.
            </p>
            <p>Contact: <a href="mailto:contact@modulca.eu" className="text-brand-olive-700 underline">contact@modulca.eu</a></p>
          </Section>

          <Section title="2. Data We Collect">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data</strong> — email address, name (when you register or sign in with Google)</li>
              <li><strong>Project data</strong> — module layouts, configurations, style choices, and design preferences you create</li>
              <li><strong>Payment data</strong> — processed securely by Stripe; we never store card numbers</li>
              <li><strong>Usage analytics</strong> — anonymized page views and interactions (Google Analytics, Microsoft Clarity), only with your consent</li>
              <li><strong>Technical data</strong> — browser type, device type, IP address (anonymized)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and improve the ModulCA design platform</li>
              <li>Process subscriptions and payments via Stripe</li>
              <li>Send transactional emails (welcome, password reset, subscription updates)</li>
              <li>Analyze usage patterns to improve the product (only with consent)</li>
              <li>Respond to support requests</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell your personal data to third parties.</p>
          </Section>

          <Section title="4. Legal Basis (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contract</strong> — processing necessary to provide the service you signed up for</li>
              <li><strong>Consent</strong> — analytics cookies (you can accept or decline via our cookie banner)</li>
              <li><strong>Legitimate interest</strong> — security, fraud prevention, product improvement</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following services that may process your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> (EU region) — authentication and database</li>
              <li><strong>Stripe</strong> — payment processing (PCI DSS compliant)</li>
              <li><strong>Resend</strong> (EU region) — transactional emails</li>
              <li><strong>Google Analytics</strong> — usage analytics (consent required, IP anonymization enabled)</li>
              <li><strong>Microsoft Clarity</strong> — session recording and heatmaps (consent required)</li>
              <li><strong>Vercel</strong> — hosting and edge network</li>
              <li><strong>Google OAuth</strong> — optional sign-in (only email and name are accessed)</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use a cookie consent banner. Analytics cookies (Google Analytics, Microsoft Clarity)
              are only loaded after you click &quot;Accept&quot;. Essential cookies for authentication
              are always active. You can change your preference at any time by clearing your browser
              data.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account and project data for as long as your account is active.
              If you delete your account, we remove your personal data within 30 days.
              Anonymized analytics data may be retained indefinitely.
            </p>
          </Section>

          <Section title="8. Your Rights (GDPR)">
            <p>As an EU resident, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access</strong> — request a copy of your personal data</li>
              <li><strong>Rectification</strong> — correct inaccurate data</li>
              <li><strong>Erasure</strong> — request deletion of your data</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong>Object</strong> — object to processing based on legitimate interest</li>
              <li><strong>Withdraw consent</strong> — for analytics cookies at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, email us at{" "}
              <a href="mailto:contact@modulca.eu" className="text-brand-olive-700 underline">contact@modulca.eu</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS),
              secure authentication (Supabase Auth), and PCI-compliant payment processing (Stripe).
              Project data is stored in EU-region servers.
            </p>
          </Section>

          <Section title="10. Children">
            <p>
              ModulCA is not intended for users under 16 years of age.
              We do not knowingly collect data from children.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. Material changes will be
              communicated via email or a notice on the platform. The &quot;last updated&quot;
              date at the top reflects the most recent revision.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-brand-bone-300/60 bg-brand-bone-100 py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-xs text-brand-gray">
          <span>ModulCA Alfa 0.2</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-brand-olive-700 transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-brand-olive-700 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors font-semibold text-brand-olive-700">Privacy</Link>
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
