# Data Processing Agreement (DPA) Status Tracker

> **Purpose**: Track DPA status with all third-party processors per GDPR Article 28.
> **Owner**: Costin (privacy@modulca.eu)
> **Last updated**: 2026-04-18
> **Review cadence**: Quarterly

## Status Legend

| Icon | Meaning |
|---|---|
| ✅ | DPA signed, EU-adequate, confirmed |
| 🟡 | DPA present in ToS (standard clauses), not individually negotiated |
| 🟠 | Action needed — verify or re-sign |
| 🔴 | No DPA, active data flow — BLOCKER |
| ⚪ | Not applicable (not processing PII) |

---

## Master table

| # | Processor | Purpose | Data Processed | Region | DPA Status | Last Verified | Action |
|---|---|---|---|---|---|---|---|
| 1 | **Supabase** | Database, auth | Email, name, projects, hashed passwords | EU (Frankfurt) | 🟡 | 2026-04-18 | Verify tier plan DPA applies, signed addendum if needed |
| 2 | **Stripe** | Payments, subscriptions | Email, customer ID, payment method (tokenized) | EU (Ireland) + US processing | 🟡 | 2026-04-18 | Verify EU-US Data Privacy Framework + SCCs |
| 3 | **Resend** | Transactional email | Email address, email content | EU | 🟡 | 2026-04-18 | Confirm EU residency + signed DPA |
| 4 | **Sentry** | Error monitoring | User ID (no email post-scrubbing), URLs (redacted), stack traces | EU (Frankfurt) | 🟡 | 2026-04-18 | Confirm Frankfurt region + DPA |
| 5 | **Vercel** | Hosting, CDN, analytics | IP logs, aggregate traffic | EU + US edge network | 🟡 | 2026-04-18 | Verify EU region + Schrems II adequacy |
| 6 | **Google Analytics 4** | Anonymized usage analytics | Anonymized IP, page views | US | 🟠 | 2026-04-18 | SCCs active, need Schrems II supplementary measures doc |
| 7 | **Microsoft Clarity** | Session replay (PII-scrubbed) | Hashed user ID, redacted session data | US | 🟠 | 2026-04-18 | Same as GA4 |
| 8 | **Plausible Analytics** | Cookieless aggregate analytics | None (aggregated only) | EU (Germany) | ✅ | 2026-04-18 | No PII processed |
| 9 | **Pollinations** (AI render, free) | AI image generation | Design prompt text | EU | 🟡 | 2026-04-18 | Verify provider DPA |
| 10 | **AI Horde** (AI render, free community) | AI image generation | Design prompt text | Distributed community | 🟠 | 2026-04-18 | Community volunteers; consider opt-in disclosure + aggregated only |
| 11 | **Stability AI** | AI image generation | Design prompt text | US | 🟠 | 2026-04-18 | Schrems II — verify SCCs |
| 12 | **Together.ai** | AI image generation | Design prompt text | US | 🟠 | 2026-04-18 | Schrems II — verify SCCs |
| 13 | **Leonardo.ai** | AI image generation | Design prompt text | US | 🟠 | 2026-04-18 | Schrems II — verify SCCs, consider disabling if no DPA |
| 14 | **Cloudflare** (AI render, free) | AI image generation | Design prompt text | EU + US edge | 🟡 | 2026-04-18 | CF has SCC + DPF certification |
| 15 | **Mapbox** | Map tiles, geocoding | IP (for geocoding), lat/lng | US | 🟠 | 2026-04-18 | Evaluate replacing with Leaflet + OSM (EU-native) |
| 16 | **Nominatim (OSM)** | Geocoding | Address strings | EU (volunteer) | ✅ | 2026-04-18 | No DPA needed (public service) |
| 17 | **HuggingFace** | AI render (free tier) | Design prompt text | US | 🟠 | 2026-04-18 | Verify SCCs |
| 18 | **GitHub** (Actions, CI) | Build infrastructure | Source code, CI logs | US | 🟡 | 2026-04-18 | GitHub DPA via Microsoft — verify |
| 19 | **Google Fonts** | Font delivery | IP (when fetching fonts) | US | 🟡 | 2026-04-18 | Consider self-hosting fonts to eliminate |

---

## Action plan (ordered)

### 🔴 Must resolve before public launch (May 1)

1. **Contact Supabase support** — request signed DPA confirmation for EU project + confirm data residency is Frankfurt (`eu-west-1`). Expected reply: auto-DPA in account settings.
2. **Confirm Stripe DPA** — available in Stripe Dashboard → Settings → Legal & Compliance. Download signed copy.
3. **Confirm Resend DPA** — request from support@resend.com (automated DPA exists).
4. **Confirm Sentry DPA** — available in Sentry org settings. Confirm Frankfurt region.
5. **Vercel Pro EU compliance** — confirm EU Team settings, download DPA.
6. **Update Privacy Policy** with concrete DPA status for each processor (footnote per row).

Each of 1-5 = 15-30 min email/dashboard action. Replies within 1-3 business days (most self-serve via dashboard).

### 🟠 Can resolve within 30 days post-launch

7. Schrems II supplementary measures doc for Google Analytics, Microsoft Clarity, US AI providers.
8. Audit AI Horde — consider disabling or adding explicit opt-in consent ("Your design will be sent to a distributed community of volunteers").
9. Evaluate self-hosting Google Fonts (1 hour refactor eliminates a processor entirely).
10. Evaluate replacing Mapbox with Leaflet + OSM tiles (larger refactor, 1-2 days).

### Permanent monitoring

- Quarterly review of this table (next: 2026-07-18).
- Any new processor MUST have DPA status verified before integration.
- Retain signed DPAs in `/docs/GDPR/signed-dpas/` (not committed to git — use secured storage).

---

## Template: New processor intake checklist

When adding a new third-party processor (AI engine, analytics, etc.):

1. [ ] Business justification documented
2. [ ] Data processed listed (be specific: email? IP? prompt text?)
3. [ ] Data residency confirmed (EU preferred; US requires Schrems II measures)
4. [ ] DPA requested and signed (or ToS + SCC clauses confirmed)
5. [ ] Privacy Policy updated with new processor row
6. [ ] This tracker updated
7. [ ] Cookie Policy updated if cookies are set

---

## Template: DPA request email

```
To: [vendor-legal@example.com]
Subject: Data Processing Agreement — ModulCA / MCA SRL (EU Controller)

Hello,

We are ATELIER DE PROIECTARE MCA S.R.L. (VAT RO35294600), an EU-based
company (Romania) using your service to process personal data on behalf
of our users.

To comply with GDPR Article 28, we need:
1. A signed Data Processing Agreement (DPA) covering our use of [SERVICE].
2. Confirmation of data residency (EU? US with SCCs?).
3. A list of any sub-processors you use.
4. Your security certifications (ISO 27001, SOC 2, etc.).

Please send these at your earliest convenience, or point us to the
self-serve option in your account settings.

Our DPO contact: privacy@modulca.eu
Website: https://modulca.eu

Thank you,
[Name]
[Role]
ModulCA / MCA SRL
```

---

## Records of Processing Activities (RoPA) — inline summary

Per GDPR Article 30, we maintain:

| Processing Activity | Purpose | Data Categories | Retention | Legal Basis |
|---|---|---|---|---|
| Account management | Provide service | Email, name, tier | Until deletion + 30-day grace | Contract |
| Payment processing | Billing | Email, Stripe customer ID | Billing record 10 years (Stripe), linked data deleted on account deletion | Contract + legal obligation (tax) |
| Project storage | Service delivery | User-created design data | Until user deletion | Contract |
| Transactional emails | Service communication | Email, event metadata | 12 months in Resend logs | Contract |
| Error monitoring | Service reliability | Scrubbed stack traces, user ID | 90 days in Sentry | Legitimate interest |
| Analytics (opt-in) | Product improvement | Aggregated metrics, anonymized IP | 14 months (GA4 default) | Consent |
| Session replay (opt-in) | UX research | PII-masked session recordings | 30 days in Clarity | Consent |

---

## Breach notification quick-reference

If a data breach occurs:

1. **Detection** (Sentry/Supabase logs review): identify scope within 1 hour.
2. **Internal escalation**: email to privacy@modulca.eu + Costin.
3. **Assessment**: is it high-risk (many users? sensitive data? lost access?)?
4. **72-hour notification** to Romanian DPA (ANSPDCP) if high-risk:
   - Online form: https://www.dataprotection.ro/?page=Formulare&lang=ro
5. **User notification**: within reasonable time if individuals are at high risk.
6. **Document**: incident log in `docs/GDPR/incidents/YYYY-MM-DD.md` (NOT committed; secured).
7. **Post-mortem**: root-cause analysis within 7 days; mitigation plan.

ANSPDCP contact: anspdcp@dataprotection.ro / +40 318 059 211
