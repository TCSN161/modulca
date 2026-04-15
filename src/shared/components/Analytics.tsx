"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/* ─── env vars (set in .env.local) ──────────────────────── */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "";

/* ─── Cookie consent key ────────────────────────────────── */
const CONSENT_KEY = "modulca-analytics-consent";

type Consent = "granted" | "denied" | null;

function getStoredConsent(): Consent {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as Consent;
}

/* ─── Cookie Consent Banner ─────────────────────────────── */
function CookieConsent({ onConsent }: { onConsent: (c: "granted" | "denied") => void }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          We use cookies and analytics to understand how you use ModulCA and improve your experience.
          No personal data is sold.{" "}
          <a href="/privacy" className="underline text-brand-teal-700 hover:text-brand-teal-800">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onConsent("denied")}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onConsent("granted")}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-teal-700 hover:bg-brand-teal-800 rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Analytics Component ──────────────────────────── */
export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getStoredConsent());
  }, []);

  const handleConsent = (c: "granted" | "denied") => {
    localStorage.setItem(CONSENT_KEY, c);
    setConsent(c);

    // Update GA consent mode if GA is loaded
    if (GA_ID && typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (typeof w.gtag === "function") {
        w.gtag("consent", "update", {
          analytics_storage: c,
          ad_storage: "denied",
        });
      }
    }
  };

  if (!mounted) return null;

  const analyticsAllowed = consent === "granted";

  return (
    <>
      {/* ── Vercel Analytics (privacy-friendly, no cookies) ── */}
      <VercelAnalytics />
      <SpeedInsights />

      {/* ── Google Analytics 4 ── */}
      {GA_ID && analyticsAllowed && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied'
              });
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      )}

      {/* ── GA in consent-pending mode (loads but doesn't track until consent) ── */}
      {GA_ID && consent === null && (
        <Script id="ga4-consent-default" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
      )}

      {/* ── Microsoft Clarity ── */}
      {CLARITY_ID && analyticsAllowed && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}

      {/* ── Cookie Consent Banner ── */}
      {consent === null && <CookieConsent onConsent={handleConsent} />}
    </>
  );
}
