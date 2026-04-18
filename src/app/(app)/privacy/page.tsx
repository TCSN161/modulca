import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function PrivacyPage() {
  const t = useTranslations("legal.privacy");
  const tCommon = useTranslations("legal.common");
  const lastUpdated = tCommon("lastUpdatedDate");

  return (
    <div className="min-h-screen bg-brand-bone-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-bone-300/60 bg-white/95 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-brand-charcoal tracking-tight">
          Modul<span className="text-brand-olive-700">CA</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-brand-gray">
          <Link href="/" className="hover:text-brand-olive-700 transition-colors">{tCommon("home")}</Link>
          <Link href="/terms" className="hover:text-brand-olive-700 transition-colors">{tCommon("terms")}</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">{t("title")}</h1>
        <p className="text-sm text-brand-gray mb-8">{tCommon("lastUpdated")} {lastUpdated}</p>

        <div className="space-y-8 text-sm text-brand-gray leading-relaxed">
          <Section title={t("sections.controller.title")}>
            <p>
              ModulCA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a modular construction
              design platform operated by:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Legal entity:</strong> ATELIER DE PROIECTARE MCA S.R.L. </li>
              <li><strong>Registered address:</strong> Str. Lacul Plopului nr. 10, Sector 5, București, 051735, România</li>
              <li><strong>Registration (ONRC):</strong> J40/14760/2015</li>
              <li><strong>CUI / VAT:</strong> 35294600</li>
              <li><strong>Website:</strong> <a href="https://www.modulca.eu" className="text-brand-olive-700 underline">www.modulca.eu</a></li>
              <li><strong>Contact:</strong> <a href="mailto:contact@modulca.eu" className="text-brand-olive-700 underline">contact@modulca.eu</a></li>
              <li><strong>Data protection requests:</strong> <a href="mailto:privacy@modulca.eu" className="text-brand-olive-700 underline">privacy@modulca.eu</a></li>
            </ul>
          </Section>

          <Section title={t("sections.dataCollected.title")}>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data</strong> — email address, name (when you register or sign in with Google)</li>
              <li><strong>Project data</strong> — module layouts, configurations, style choices, and design preferences you create</li>
              <li><strong>Payment data</strong> — processed securely by Stripe; we never store card numbers</li>
              <li><strong>Usage analytics</strong> — anonymized page views and interactions (Google Analytics, Microsoft Clarity), only with your consent</li>
              <li><strong>Technical data</strong> — browser type, device type, IP address (anonymized)</li>
            </ul>
          </Section>

          <Section title={t("sections.dataUse.title")}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and improve the ModulCA design platform</li>
              <li>Process subscriptions and payments via Stripe</li>
              <li>Send transactional emails (welcome, password reset, subscription updates)</li>
              <li>Analyze usage patterns to improve the product (only with consent)</li>
              <li>Respond to support requests</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell your personal data to third parties.</p>
          </Section>

          <Section title={t("sections.legalBasis.title")}>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contract</strong> — processing necessary to provide the service you signed up for</li>
              <li><strong>Consent</strong> — analytics cookies (you can accept or decline via our cookie banner)</li>
              <li><strong>Legitimate interest</strong> — security, fraud prevention, product improvement</li>
            </ul>
          </Section>

          <Section title={t("sections.processors.title")}>
            <p>We use the following sub-processors that may process your data on our behalf:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> (EU — Frankfurt) — authentication and database</li>
              <li><strong>Stripe</strong> (EU &amp; US) — payment processing (PCI DSS compliant)</li>
              <li><strong>Resend</strong> (EU — Ireland) — transactional emails</li>
              <li><strong>Sentry</strong> (EU — Frankfurt) — error monitoring; error logs may contain your email address, IP and the URL you visited</li>
              <li><strong>Vercel</strong> (EU &amp; US) — hosting, edge network, and <strong>Vercel Analytics</strong> (cookieless aggregate page views)</li>
              <li><strong>Google Analytics 4</strong> (US) — usage analytics, <strong>consent required</strong>, IP anonymization enabled</li>
              <li><strong>Microsoft Clarity</strong> (US) — session recording and heatmaps, <strong>consent required</strong></li>
              <li><strong>Google OAuth</strong> (US) — optional sign-in (only email and name are accessed)</li>
              <li><strong>OpenRouter / Pollinations / other AI providers</strong> (US &amp; EU) — anonymized prompts for AI consultant and render generation; we do not send your account email</li>
            </ul>
            <p className="mt-2">
              <strong>International transfers:</strong> transfers to the United States (Google, Stripe, Microsoft, Vercel, AI providers) are
              protected by Standard Contractual Clauses (SCCs) under GDPR Article 46(2)(c), or by the
              EU–U.S. Data Privacy Framework where the provider is certified.
            </p>
          </Section>

          <Section title={t("sections.cookies.title")}>
            <p>
              We use a cookie consent banner. Analytics cookies (Google Analytics, Microsoft Clarity)
              are only loaded after you click &quot;Accept&quot;. Essential cookies for authentication
              are always active. To withdraw your consent at any time, visit the cookie banner that
              can be re-opened from the footer of our site (&quot;Cookie settings&quot;), or clear the
              <code className="bg-brand-bone-200 px-1 rounded">modulca-analytics-consent</code> key
              from your browser storage.
            </p>
          </Section>

          <Section title={t("sections.retention.title")}>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account &amp; project data</strong> — for as long as your account is active; deleted within 30 days of account deletion.</li>
              <li><strong>Inactive accounts</strong> — anonymized after 24 months of inactivity.</li>
              <li><strong>Backups</strong> — rolling 30-day backup retention; deletion requests are honored in the live database immediately and purged from backups within 30 days.</li>
              <li><strong>Billing records</strong> — retained for 10 years as required by Romanian tax law (Law 227/2015).</li>
              <li><strong>Error logs (Sentry)</strong> — 90 days.</li>
              <li><strong>Anonymized analytics</strong> — may be retained indefinitely (no personal data).</li>
            </ul>
          </Section>

          <Section title={t("sections.rights.title")}>
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
              <a href="mailto:privacy@modulca.eu" className="text-brand-olive-700 underline">privacy@modulca.eu</a>.
              We will respond within 30 days.
            </p>
            <p className="mt-2">
              <strong>Right to lodge a complaint:</strong> If you believe we have not handled your
              personal data properly, you have the right to file a complaint with the Romanian Data
              Protection Authority{" "}
              <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-brand-olive-700 underline">
                ANSPDCP (www.dataprotection.ro)
              </a>
              , or with the supervisory authority in your country of residence.
            </p>
          </Section>

          <Section title={t("sections.security.title")}>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS),
              secure authentication (Supabase Auth), and PCI-compliant payment processing (Stripe).
              Project data is stored in EU-region servers.
            </p>
          </Section>

          <Section title={t("sections.children.title")}>
            <p>
              ModulCA is not intended for users under 16 years of age.
              We do not knowingly collect data from children.
            </p>
          </Section>

          <Section title={t("sections.changes.title")}>
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
          <span>{tCommon("beta")}</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-brand-olive-700 transition-colors">{tCommon("home")}</Link>
            <Link href="/terms" className="hover:text-brand-olive-700 transition-colors">{tCommon("terms")}</Link>
            <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors font-semibold text-brand-olive-700">{tCommon("privacy")}</Link>
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
