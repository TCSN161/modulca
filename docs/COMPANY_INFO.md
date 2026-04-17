# ModulCA — Company & Legal Information

> **Single source of truth** for all business, legal, financial, and operational
> identifiers of the ModulCA entity. When any of these values changes, update
> this file first, then run `npm run fill:company` to propagate to Privacy + Terms.

**Status:** ✅ Company registered — all core fields populated
**Last updated:** 2026-04-17

---

## 1. 🏢 Legal Entity (Romania)

| Field | Value |
|---|---|
| Legal name | **ATELIER DE PROIECTARE MCA S.R.L.** |
| Short trade name | ModulCA |
| Registration type | SRL (Societate cu Răspundere Limitată) |
| ONRC number | **J40/14760/2015** |
| CUI / CIF | **35294600** |
| EUID | **ROANRC.J40/14760/2015** |
| Incorporation date | **2015-12-04** |
| Status | Activă |
| Share capital | **200 RON** (confirmed) |
| CAEN code | **7111** — Activități de arhitectură |
| VAT status | **Not VAT-registered** (art. 310 Cod Fiscal) |

### Registered Office (Sediu social)

| Field | Value |
|---|---|
| Street | **Str. Lacul Plopului nr. 10** |
| Sector / District | Sector 5 |
| City | **București** |
| Postal code | **051735** |
| Country | Romania |

### Administrator / Legal Representative

| Field | Value |
|---|---|
| Name | **MURARU PETRIA** |
| Role | Administrator / Reprezentant legal |

---

## 2. 📧 Communication Channels

| Purpose | Address | Notes |
|---|---|---|
| General contact | **contact@modulca.eu** | Forwards to uii.acgs.auto@gmail.com |
| Legal / DPO | **petria@modulca.eu** | Administrator |
| Billing / invoices | **billing@modulca.eu** | |
| Technical support | **support@modulca.eu** | |
| Transactional sender | noreply@modulca.eu | ✅ Active (Resend) |
| Phone | **+40 723 599 514** | |
| Website | **https://www.modulca.eu** | |

### DNS / Domain

| Record | Status |
|---|---|
| Domain | modulca.eu (Namecheap) |
| DKIM (Resend) | ✅ Verified |
| SPF (Resend) | ✅ Verified |
| MX (Resend) | ✅ Verified |
| DMARC | ✅ Active (p=none, monitoring mode) |

---

## 3. 🔐 Data Protection (GDPR)

| Field | Value |
|---|---|
| Data Protection Officer (DPO) | MURARU PETRIA (Administrator) |
| DPO contact | petria@modulca.eu |
| Data retention default | 30 days after account deletion |
| Billing records retention | 10 years (Romanian tax law 227/2015) |
| Breach notification | 72h to ANSPDCP |
| Primary supervisory authority | **ANSPDCP** (Romania) |
| ANSPDCP website | https://www.dataprotection.ro |

---

## 4. 💳 Financial Accounts

### Bank Account (Stripe payouts)

| Field | Value |
|---|---|
| Bank name | **UniCredit Bank S.A.** |
| IBAN (RON) | **RO02BACX0000004111280000** |
| SWIFT / BIC | **BACXROBU** |
| Account holder | ATELIER DE PROIECTARE MCA S.R.L. |

### Stripe

| Field | Value |
|---|---|
| Current mode | 🟡 **TEST** |
| Live mode target | Ready to switch — run `npm run stripe:go-live` |
| Business type | Company — SRL |
| Billing currency | EUR |
| VAT on invoices | **No** (non-VAT registered, art. 310) |

### Tax Notes

- Invoice mention required (Romanian): **"Neplătitor de TVA conform art. 310 Cod fiscal"**
- English equivalent: "Not registered for VAT pursuant to Article 310 of the Romanian Fiscal Code"
- Annual turnover threshold to monitor: **300,000 RON** — above this, VAT registration becomes mandatory
- If crossing B2B EU sales threshold: may need Intrastat filing

---

## 5. 🛠️ Platform Accounts

| Service | Owner | Plan | Notes |
|---|---|---|---|
| Vercel | uii.acgs.auto@gmail.com | Hobby | Upgrade to Pro before 100+ users |
| Supabase | uii.acgs.auto@gmail.com | Free | Upgrade to Pro at 500 MB DB |
| Stripe | TBD (business account) | Standard | TEST → LIVE pending company activation |
| Resend | uii.acgs.auto@gmail.com | Free | 3K emails/mo |
| Sentry | modulca org | Team | Error monitoring |
| Google Cloud | uii.acgs.auto@gmail.com | Free | OAuth + Gemini API |
| GitHub | TCSN161 | Free | Private repo |
| Namecheap | uii.acgs.auto@gmail.com | — | Domain registrar |

---

## 6. 📝 Operational Metadata

| Field | Value |
|---|---|
| Platform launch date (Beta) | Target: 2026-05-01 |
| Platform launch date (Public) | TBD |
| Primary business region | Romania |
| Supported markets | RO, NL, DE, FR, BE |
| Supported languages | English (RO i18n planned Q2 2026) |
| Working hours (support) | Mon–Fri, 9:00–18:00 EET |

---

## 7. 🔗 Public Legal Pages

- Privacy Policy: https://www.modulca.eu/privacy
- Terms of Service: https://www.modulca.eu/terms
- Cookie Policy: *Section within Privacy Policy*
- Acceptable Use: *Section 8 of Terms*

---

## 8. 📋 Automation — How to Update

Files that reference these values (kept in sync via `npm run fill:company`):

- `src/app/(app)/privacy/page.tsx`
- `src/app/(app)/terms/page.tsx`

### To propagate a change:

```bash
# Using env vars (non-interactive)
MODULCA_COMPANY_NAME="ATELIER DE PROIECTARE MCA S.R.L." \
MODULCA_COMPANY_ADDRESS="Str. Lacul Plopului nr. 10, Sector 5, București, 051735, România" \
MODULCA_ONRC="J40/14760/2015" \
MODULCA_CUI="35294600" \
node scripts/fill-company-info.mjs --non-interactive

# Or interactive prompts
npm run fill:company
```

---

## 9. 🆘 Still Open / Future Work

- [x] ~~Confirm share capital~~ — 200 RON (confirmed 2026-04-17)
- [ ] **Set up email forwards** for billing@, support@, petria@ → real mailbox
- [ ] **Stripe business account verification** — upload CUI certificate + ID
- [ ] **Update Stripe from TEST to LIVE mode** — after account verified
- [ ] **Invoice template** — include CUI, CAEN, non-VAT mention per Romanian law
- [ ] **Shareholders' agreement** — if accepting investment
- [ ] **Privacy Impact Assessment (DPIA)** — for AI render + consultant features
- [ ] **Terms of Use for AI outputs** — watermarking, user responsibility clause
- [ ] **Monitor turnover** — 300K RON/year = mandatory VAT registration trigger

---

*This document contains sensitive financial identifiers. Do not share publicly.*
*If this file is in a public repo, consider moving to a private vault / 1Password.*
