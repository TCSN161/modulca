# Privacy Policy — v2 DRAFT

> **STATUS: DRAFT — pending vendor DPA confirmations and lawyer review.**
> **This draft is NOT the live policy.** The live policy is at `src/app/(app)/privacy/page.tsx` until the lawyer signs off and the user publishes v2.
>
> **Placeholder convention**: `⏳` = verification pending (vendor reply outstanding). Replace with the concrete status once confirmed.
>
> **Effective date**: _{{EFFECTIVE_DATE — TBD, to be set when the lawyer signs off; target 2026-05-01 beta launch}}_
> **Version**: 2.0 (draft)
> **Author**: Costin (acting DPO), 2026-04-17
> **Reviewer**: _{{External Romanian data-protection counsel — TBD}}_
> **Related docs**: [DPA_Status.md](./DPA_Status.md) · [DPIA_AIRender.md](./DPIA_AIRender.md) · [SchremsII_Supplementary_Measures.md](./SchremsII_Supplementary_Measures.md) · [BreachNotification_Runbook.md](./BreachNotification_Runbook.md)

---

# Privacy Policy

_Last updated: {{EFFECTIVE_DATE}}_

## 1. Who We Are (Data Controller)

ModulCA ("we", "us", "our") is a modular construction design platform operated by:

- **Legal entity**: ATELIER DE PROIECTARE MCA S.R.L.
- **Registered address**: Str. Lacul Plopului nr. 10, Sector 5, București, 051735, România
- **Registration (ONRC)**: J40/14760/2015
- **CUI / VAT**: RO35294600
- **Website**: https://www.modulca.eu
- **General contact**: contact@modulca.eu
- **Data protection contact (acting DPO)**: privacy@modulca.eu

Our complementary non-profit, Urban Innovation Institute (UII ONG), does not process personal data of ModulCA users except where a user explicitly opts into a research programme or grant-funded initiative.

## 2. Data We Collect

- **Account data** — email address, display name (and profile picture if you sign in with Google).
- **Project data** — modular layouts, configurations, style choices, design preferences, text prompts you enter, and AI-generated images tied to your projects.
- **Payment data** — Stripe customer ID and last four digits of the payment method. We **never** store full card numbers; they are handled entirely by Stripe.
- **Usage analytics** — anonymised page views and interactions via Google Analytics 4 and Microsoft Clarity (**only with your consent**).
- **Technical data** — browser type, device type, approximate location (country level), IP address (truncated / anonymised at ingest).
- **Support correspondence** — emails you send us and our replies.

## 3. How We Use Your Data

- Provide and improve the ModulCA design platform.
- Generate AI renders of your designs using third-party inference engines (see §5.3).
- Process subscriptions and payments via Stripe.
- Send transactional emails (welcome, password reset, subscription updates, invoices).
- Analyse usage patterns to improve the product (**consent required**).
- Respond to support requests.
- Fulfil legal obligations (Romanian tax law, GDPR accountability).

We do **not** sell your personal data to third parties.

## 4. Legal Basis (GDPR Art. 6)

| Purpose | Legal basis |
|---|---|
| Provide the service you signed up for | **Contract** (Art. 6(1)(b)) |
| Process payments and issue invoices | **Contract** + **legal obligation** (Romanian Fiscal Code — Legea 227/2015) |
| Send transactional emails | **Contract** |
| Optional analytics cookies | **Consent** (Art. 6(1)(a)) — you can accept or decline via our cookie banner, and withdraw at any time |
| Error monitoring, fraud prevention, security | **Legitimate interest** (Art. 6(1)(f)) |
| Comply with supervisory authority requests | **Legal obligation** (Art. 6(1)(c)) |

We do not rely on legitimate interest for anything that would materially affect your rights; you can object at any time (§8).

## 5. Third-Party Services (Processors)

We rely on third-party service providers ("processors" under GDPR Art. 28) to operate ModulCA. We have or are finalising a Data Processing Agreement (DPA) with each one. The table below is the current status; a live master tracker is maintained internally at [docs/GDPR/DPA_Status.md](./DPA_Status.md) and reviewed quarterly.

### 5.1 Infrastructure & core services

| Processor | Purpose | Region | DPA status |
|---|---|---|---|
| **Supabase** | Database, authentication, file storage | EU — Frankfurt | ⏳ Verification pending (auto-DPA in account; signed copy being archived) |
| **Vercel** | Application hosting, CDN, serverless functions | EU (frankfurt) + global edge for static assets | ⏳ Verification pending |
| **Stripe Payments Europe Ltd** | Subscription billing, payment processing | EU — Ireland (with onward transfer to Stripe Inc, US) | ⏳ Verification pending (DPA available in Stripe Dashboard; signed copy being archived) |
| **Resend** | Transactional email delivery | EU — Ireland | ⏳ Verification pending |
| **Sentry** | Error monitoring (IP + user ID + stack trace; PII scrubbing active) | EU — Frankfurt | ⏳ Verification pending |
| **GitHub** (Microsoft) | Source control, CI | US | ⏳ DPF-certified + DPA via Microsoft |

### 5.2 Analytics (consent-gated)

| Processor | Purpose | Region | DPA status |
|---|---|---|---|
| **Plausible Analytics** | Cookieless aggregate analytics | EU — Germany | ✅ No personal data processed |
| **Google Analytics 4** | Anonymised usage analytics | US | ⏳ EU-US DPF + SCCs; consent required |
| **Microsoft Clarity** | Session replay with PII masking | US | ⏳ EU-US DPF + SCCs; consent required |

### 5.3 AI render engines

When you ask ModulCA to generate a visualisation of your design, your text prompt (and, optionally, any reference image you upload) is sent to a third-party AI inference provider. We do **not** send your email, name, or account ID to these providers. We apply a prompt sanitiser to strip common personal-data patterns (emails, phone numbers, Romanian CNP, street numbers) before transmission. For details of the processing, see our internal [DPIA — AI Render Processing](./DPIA_AIRender.md).

| Processor | Region | DPA status |
|---|---|---|
| **Pollinations** | EU | ⏳ Verification pending |
| **AI Horde** | Distributed community volunteers | **Disabled by default.** Requires explicit opt-in with a prominent warning. |
| **Cloudflare Workers AI** | EU + US edge | ⏳ DPF + SCCs |
| **OpenAI** | US | ⏳ DPF + SCCs; no-training flag enabled |
| **Stability AI** | UK + US | ⏳ UK adequacy + SCCs |
| **Together.ai** | US | ⏳ SCCs; DPF verification pending |
| **Leonardo.ai** | US | ⏳ DPA requested; **engine disabled if DPA not signed by 2026-04-28** |
| **Replicate** | US | ⏳ SCCs; DPF verification pending |
| **HuggingFace** | US | ⏳ DPF-certified |
| **Fireworks AI** | US | ⏳ DPA pending — conditional |
| **DeepInfra** | US | ⏳ DPA pending — conditional |
| **Segmind** | US | ⏳ DPA pending — conditional |
| **Black Forest Labs** | DE (HQ) + infra region under verification | ⏳ |
| **fal.ai** | US | ⏳ DPA pending — conditional |
| **Prodia** | US | ⏳ DPA pending — conditional |

You can restrict AI rendering to **EU providers only** in your account settings. You can also disable AI rendering entirely; the platform remains fully usable with placeholder visuals.

### 5.4 Other

| Processor | Purpose | Region | DPA status |
|---|---|---|---|
| **Google OAuth** | Optional sign-in (email + name accessed) | US | ⏳ DPF + Google Terms |
| **Nominatim (OpenStreetMap)** | Geocoding (address to coordinates) | EU (volunteer-run) | ✅ Public service; no DPA needed |
| **Mapbox** | Map tiles (if enabled) | US | ⏳ Being evaluated for replacement with Leaflet + OSM |
| **Google Fonts** | Web font delivery | US | ⏳ Being evaluated for self-hosting |

## 6. International Transfers

Where a processor is located outside the European Economic Area, we rely on one or more of the following safeguards under GDPR Chapter V:

1. **EU-US Data Privacy Framework** — Commission adequacy decision (EU) 2023/1795 for US recipients that are DPF-certified. We verify DPF certification on the official list before relying on it.
2. **Standard Contractual Clauses (SCCs)** — Commission Decision (EU) 2021/914, Module 2 (controller-to-processor), executed with every non-EU processor.
3. **Supplementary measures** pursuant to *Schrems II* (CJEU C-311/18) — including encryption in transit and at rest, pseudonymisation (no user email/UUID is sent to AI render providers), data minimisation, contractual "no training" and purpose-limitation clauses, and audit rights. The full catalogue of measures per processor is documented in our internal [Schrems II Supplementary Measures](./SchremsII_Supplementary_Measures.md) register, reviewed quarterly.

You may request a copy of the SCCs or a summary of the supplementary measures applied to any specific transfer by emailing privacy@modulca.eu.

## 7. Cookies

We use a cookie consent banner. Strictly necessary cookies (authentication, security, consent state) are always active — these cookies are exempt from prior consent under ePrivacy Directive Art. 5(3). All other cookies, including Google Analytics and Microsoft Clarity, are loaded only after you click "Accept" in the banner.

You can withdraw consent at any time:
- Re-open the banner from the **"Cookie settings"** link in the footer.
- Or clear the `modulca-analytics-consent` key from your browser storage.

We maintain a separate, detailed [Cookie Policy at /cookies](/cookies) listing each cookie, its purpose, and its lifetime.

## 8. Your Rights (GDPR) and How to Exercise Them

As a data subject in the EU/EEA, you have the rights listed below. We fulfil each one through concrete product features **and** through the privacy@modulca.eu mailbox.

| Right (GDPR Art.) | Plain meaning | How to exercise it |
|---|---|---|
| **Access** (Art. 15) | Get a copy of your data | `/api/user/export` from your account, or email privacy@modulca.eu |
| **Rectification** (Art. 16) | Correct inaccurate data | Edit your profile at `/dashboard/account`; or email us for anything you cannot edit yourself |
| **Erasure / "right to be forgotten"** (Art. 17) | Delete your account and data | `/dashboard/account` → "Delete account" button. 30-day grace period; then hard delete. Backups purged within a further 30 days |
| **Restriction** (Art. 18) | Pause processing | Email privacy@modulca.eu |
| **Portability** (Art. 20) | Receive your data in machine-readable format (JSON) | `/api/user/export` returns a JSON archive of your profile, projects, and preferences |
| **Object** (Art. 21) | Object to processing based on legitimate interest | Email privacy@modulca.eu; for direct marketing we comply immediately without need for justification |
| **Withdraw consent** (Art. 7(3)) | Withdraw analytics consent | Re-open the cookie banner via the footer link, set to "Decline" |
| **Automated decision-making** (Art. 22) | Not be subject to solely automated decisions with legal effect | We do **not** make solely automated decisions producing legal or similarly significant effects. AI render is assistive only |

We respond to rights requests within **30 days** (extendable once by 60 days where the request is complex, with reasoning).

### Right to lodge a complaint

If you believe we have mishandled your data, you have the right to complain to a supervisory authority — in particular, the Romanian Data Protection Authority **ANSPDCP**:

- Website: https://www.dataprotection.ro
- Email: anspdcp@dataprotection.ro
- Phone: +40 318 059 211

You may also complain to the supervisory authority in your own country of residence.

## 9. Data Retention

We keep your data only as long as necessary for the purposes above and no longer. The table below summarises retention per category.

| Data category | Retention | Rationale |
|---|---|---|
| **Profile** (email, name) | Until account deletion + 30-day grace period (then hard delete within a further 30 days from backups) | Contract |
| **Projects and designs** | Same as profile — deleted with the account | Contract |
| **Billing records** (invoices, Stripe customer ID, subscription history) | **10 years** from the invoice date | Romanian Fiscal Code — Legea 227/2015 + OMFP 2634/2015 require 10-year retention of fiscal documents |
| **Stripe-side payment data** | According to Stripe's own retention (they are a controller for their regulatory obligations) | Legal obligation on Stripe |
| **Transactional email logs** (Resend) | 12 months | Operational troubleshooting |
| **Error logs** (Sentry) | 90 days | Service reliability (legitimate interest) |
| **Analytics** (Google Analytics 4) | 14 months | Minimum available in GA4 |
| **Session replay** (Microsoft Clarity) | 30 days | Clarity default |
| **Access logs** (Vercel, Supabase) | 30 days | Security monitoring |
| **AI render prompts** (stored in our DB with your project) | Until project deletion | Lets you regenerate; deleted with project/account |
| **AI render images** (stored in Supabase EU) | Until project deletion | Same as above |
| **Provider-side logs of prompts** | ≤ 30 days per contract | Contractual SLA; verified per provider |
| **Backups** | Rolling 30-day retention | Disaster recovery |
| **Incident records** (under Art. 33(5)) | 6 years from incident closure | Accountability evidence |
| **Inactive accounts** | Anonymised or deleted after 24 months of inactivity | Data minimisation |

We never retain anonymised aggregate analytics indefinitely tied to an individual — aggregates contain no personal data by definition.

## 10. Data Security

Organisational and technical measures in place (non-exhaustive):

- HTTPS / TLS 1.3 enforced everywhere; HSTS preload.
- AES-256 encryption at rest for Supabase storage and database.
- Row-Level Security (RLS) policies on every user-owned table.
- PCI-DSS compliance via Stripe (we do not hold card data).
- Short-TTL signed URLs for generated images (1 hour).
- API keys scoped per provider, rotated every 90 days.
- Sentry PII scrubbing to strip emails and auth tokens from error reports.
- Least-privilege access: founder + administrator roles only in production.
- 2FA enforced on all infrastructure accounts.
- Quarterly review of our DPA inventory and Schrems II measures.
- Documented incident response — see our internal [Breach Notification Runbook](./BreachNotification_Runbook.md); ANSPDCP is notified within 72 hours of becoming aware of a qualifying breach.

## 11. Children

ModulCA is not intended for users under 16 years of age (Romanian implementation of Art. 8 GDPR via Legea 190/2018 Art. 8(1), which sets the digital-services age of consent at 16 in Romania). We do not knowingly collect data from children. If you believe a minor has registered, contact privacy@modulca.eu and we will delete the account promptly.

## 12. Changes to This Policy

We may update this policy from time to time. Material changes will be communicated via:
- an email to your registered address, and/or
- a prominent notice on the platform for at least 30 days.

The "Last updated" date at the top reflects the most recent revision.

## 13. Contact

| Role | Contact |
|---|---|
| General | contact@modulca.eu |
| Data protection / DPO | **privacy@modulca.eu** |
| Post | ATELIER DE PROIECTARE MCA S.R.L., Str. Lacul Plopului nr. 10, Sector 5, București, 051735, România |

---

## Draft Notes (NOT for publication)

- Resolve every ⏳ placeholder before publishing:
  - Archive signed DPA copies or dashboard URLs for: Supabase, Vercel, Stripe, Resend, Sentry.
  - Confirm DPF listings for Google, Microsoft, OpenAI, HuggingFace, Cloudflare, Vercel, GitHub (Microsoft).
  - Drive the 2026-04-28 deadline for: Leonardo, Fireworks, DeepInfra, fal.ai, Prodia. Disable at code level if no DPA.
  - Confirm Black Forest Labs serving region.
- Lawyer sign-off checklist:
  - Art. 13 disclosures complete (identities, purposes, legal bases, recipients, retention, rights, complaint pathway, transfers).
  - Language clarity (Romanian translation needed if we publish bilingual).
  - Cross-reference to Cookie Policy and Terms.
  - Child-age of consent confirmed: 16 in Romania per Legea 190/2018 Art. 8.
- Cross-references to internal docs (DPA_Status, DPIA_AIRender, SchremsII_Supplementary_Measures, BreachNotification_Runbook) are kept in this DRAFT for the lawyer's benefit. Before publishing on the public site, replace those internal links with shorter public-facing language (e.g. "internal register maintained by our DPO, available on request").
- Effective date must match either launch day or a later date; we should never publish a policy dated before it is actually in force.

*End of draft.*
