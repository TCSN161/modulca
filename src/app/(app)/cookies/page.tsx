import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cookies");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function CookiesPage() {
  const t = useTranslations("legal.cookies");
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
          <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors">{tCommon("privacy")}</Link>
          <Link href="/terms" className="hover:text-brand-olive-700 transition-colors">{tCommon("terms")}</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-2xl font-bold text-brand-charcoal mb-2">{t("title")}</h1>
        <p className="text-sm text-brand-gray mb-8">{tCommon("lastUpdated")} {lastUpdated}</p>

        <div className="space-y-8 text-sm text-brand-gray leading-relaxed">
          <Section title={t("sections.whatAre.title")}>
            <p>
              Cookies are small text files stored on your device when you visit a website. They
              help websites remember your preferences, keep you signed in, and measure how the
              website is used. Some cookies are essential for the service to function; others are
              optional and only used with your consent.
            </p>
          </Section>

          <Section title={t("sections.choices.title")}>
            <p>
              On your first visit, a cookie banner asks for your consent to non-essential cookies
              (analytics, session replay). You can:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Accept</strong> — allows all categories</li>
              <li><strong>Reject</strong> — blocks all non-essential cookies (service still works fully)</li>
              <li><strong>Change later</strong> — clear localStorage key <code className="bg-white/60 px-1 py-0.5 rounded">modulca-analytics-consent</code> to re-prompt the banner, or contact <a href="mailto:privacy@modulca.eu" className="text-brand-olive-700 underline">privacy@modulca.eu</a></li>
            </ul>
          </Section>

          <Section title={t("sections.essential.title")}>
            <p>
              These cookies are required for core functionality. They do <strong>not</strong> require
              consent under GDPR / ePrivacy Directive.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-brand-bone-200">
                  <tr>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.cookie")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.source")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.purpose")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-brand-bone-300/60"><code>sb-&lt;project-id&gt;-auth-token</code></td>
                    <td className="p-2 border border-brand-bone-300/60">Supabase</td>
                    <td className="p-2 border border-brand-bone-300/60">Maintains your login session</td>
                    <td className="p-2 border border-brand-bone-300/60">Until logout or 1 hour inactivity</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-brand-bone-300/60"><code>modulca-auth</code></td>
                    <td className="p-2 border border-brand-bone-300/60">ModulCA</td>
                    <td className="p-2 border border-brand-bone-300/60">Middleware auth check for protected routes</td>
                    <td className="p-2 border border-brand-bone-300/60">Session</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-brand-bone-300/60"><code>__stripe_sid</code>, <code>__stripe_mid</code></td>
                    <td className="p-2 border border-brand-bone-300/60">Stripe (payment processor)</td>
                    <td className="p-2 border border-brand-bone-300/60">Fraud prevention during checkout</td>
                    <td className="p-2 border border-brand-bone-300/60">30 min — 1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={t("sections.analytics.title")}>
            <p>
              Loaded <strong>only</strong> after you accept the consent banner. Used to understand
              aggregate usage patterns and improve the platform. You can decline without losing any
              functionality.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-brand-bone-200">
                  <tr>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.cookie")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.source")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.purpose")}</th>
                    <th className="text-left p-2 border border-brand-bone-300/60">{t("table.duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-brand-bone-300/60"><code>_ga</code>, <code>_ga_&lt;ID&gt;</code></td>
                    <td className="p-2 border border-brand-bone-300/60">Google Analytics 4</td>
                    <td className="p-2 border border-brand-bone-300/60">Aggregate traffic analytics (IP anonymized)</td>
                    <td className="p-2 border border-brand-bone-300/60">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-brand-bone-300/60"><code>_clck</code>, <code>_clsk</code></td>
                    <td className="p-2 border border-brand-bone-300/60">Microsoft Clarity</td>
                    <td className="p-2 border border-brand-bone-300/60">Session recording + heatmaps for UX research</td>
                    <td className="p-2 border border-brand-bone-300/60">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={t("sections.cookieless.title")}>
            <p>
              We use privacy-friendly analytics that do <strong>not</strong> set cookies or track
              individuals. These are allowed under ePrivacy Directive without consent.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Plausible Analytics</strong> — aggregate page views, EU-hosted, no cookies, no cross-site tracking</li>
              <li><strong>Vercel Analytics</strong> — cookieless aggregate performance metrics</li>
            </ul>
          </Section>

          <Section title={t("sections.localStorage.title")}>
            <p>
              Some data is stored directly in your browser&apos;s localStorage instead of cookies.
              These do not leave your device except when syncing with the cloud (when authenticated).
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><code>modulca-analytics-consent</code> — your cookie banner choice</li>
              <li><code>modulca-projects</code> — your design projects (when not signed in / demo mode)</li>
              <li><code>modulca-active-project</code> — currently active project reference</li>
              <li><code>modulca-cloud-migrated</code> — flag that local projects have been migrated to the cloud</li>
            </ul>
            <p className="mt-2">
              You can clear localStorage any time via your browser settings (usually under
              &quot;Clear site data&quot;).
            </p>
          </Section>

          <Section title={t("sections.thirdParty.title")}>
            <p>
              Some cookies are set by our data processors (Stripe for payments, Supabase for auth).
              These processors have their own privacy and cookie policies:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Stripe — <a href="https://stripe.com/privacy" className="text-brand-olive-700 underline" target="_blank" rel="noreferrer">stripe.com/privacy</a></li>
              <li>Supabase — <a href="https://supabase.com/privacy" className="text-brand-olive-700 underline" target="_blank" rel="noreferrer">supabase.com/privacy</a></li>
              <li>Google Analytics — <a href="https://policies.google.com/privacy" className="text-brand-olive-700 underline" target="_blank" rel="noreferrer">policies.google.com/privacy</a></li>
              <li>Microsoft Clarity — <a href="https://privacy.microsoft.com/en-US/privacystatement" className="text-brand-olive-700 underline" target="_blank" rel="noreferrer">privacy.microsoft.com</a></li>
            </ul>
          </Section>

          <Section title={t("sections.dnt.title")}>
            <p>
              We respect browser-level &quot;Do Not Track&quot; signals. If your browser sends DNT,
              we automatically treat you as having declined non-essential cookies, regardless of
              your banner interaction.
            </p>
          </Section>

          <Section title={t("sections.questions.title")}>
            <p>
              Contact our privacy team at{" "}
              <a href="mailto:privacy@modulca.eu" className="text-brand-olive-700 underline">privacy@modulca.eu</a>.
              For full details on how we handle your data, see our{" "}
              <Link href="/privacy" className="text-brand-olive-700 underline">Privacy Policy</Link>.
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
            <Link href="/privacy" className="hover:text-brand-olive-700 transition-colors">{tCommon("privacy")}</Link>
            <Link href="/cookies" className="hover:text-brand-olive-700 transition-colors font-semibold text-brand-olive-700">{tCommon("cookies")}</Link>
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
