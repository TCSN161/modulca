# Vendor DPA Request Kit — ModulCA / MCA SRL

**Purpose:** Obtain signed Data Processing Agreements (DPAs) from all sub-processors before May 1, 2026 public beta launch. Required by GDPR Art. 28 for any vendor processing EU personal data on our behalf.

**Company of record for all DPAs:**
- Legal name: **ATELIER DE PROIECTARE MCA S.R.L.** (short: MCA SRL)
- VAT: **RO35294600**
- Registered address: **Str. Lacul Plopului nr. 10, Sector 5, București, România**
- Contact: Costin (founder), costin@modulca.ro
- Website: https://modulca.ro
- Data Protection point of contact: dpo@modulca.ro (alias → founder until DPO appointed)

**Where to save signed DPAs:**
`docs/legal/dpa/` (create subfolder if missing). Naming convention: `DPA-<vendor>-<YYYY-MM-DD>.pdf` — e.g., `DPA-supabase-2026-04-18.pdf`. Also log into `docs/legal/subprocessors.md` (vendor, date signed, contract expiry, scope).

---

## Completion tracker

Tick as you go. Target: all 6 complete by **April 24, 2026** (one week buffer before beta).

- [ ] 1. **Supabase** — email sent / dashboard DPA downloaded — date: __________
- [ ] 2. **Stripe** — dashboard DPA accepted electronically — date: __________
- [ ] 3. **Resend** — email sent — date: __________
- [ ] 4. **Sentry** — dashboard DPA accepted electronically — date: __________
- [ ] 5. **Vercel** — dashboard DPA accepted electronically — date: __________
- [ ] 6. **Microsoft Clarity** — dashboard DPA accepted electronically — date: __________

Legend: "self-serve" = click-through, no human needed. "Email" = manual exchange with vendor counsel.

---

## 1. Supabase

**Channel:** Self-serve first, email fallback.
- **Dashboard (try first):** https://supabase.com/dashboard/org/_/billing → Legal / Data Processing Addendum. On Pro plan and above, DPA can be auto-countersigned from the dashboard. Also check project Settings → "Data Privacy" tab.
- **Email fallback:** support@supabase.com (cc: privacy@supabase.com)
- **Public DPA template:** https://supabase.com/legal/dpa

**Subject line:**
`DPA request — MCA SRL (Supabase project [INSERT PROJECT REF])`

**Email body (copy-paste):**

```
Hi Supabase team,

I would like to execute the Supabase Data Processing Addendum for our
organization. Could you please send the countersigned DPA, or confirm
that the click-through DPA available in the dashboard is the final
binding version?

Company details for the DPA:
  - Legal name: ATELIER DE PROIECTARE MCA S.R.L. (trading as MCA SRL)
  - VAT / CUI: RO35294600
  - Registered office: Str. Lacul Plopului nr. 10, Sector 5,
    Bucuresti, Romania
  - Supabase organization / project ref: [INSERT ORG SLUG + PROJECT REF]
  - Plan: [Pro / Team]
  - Signatory: Costin [LAST NAME], Founder / Administrator
  - Email for contract: costin@modulca.ro
  - DPO / privacy contact: dpo@modulca.ro

We are launching public beta on 1 May 2026 and need the executed DPA
on file before that date for GDPR Article 28 compliance. Please also
confirm the current list of sub-processors and the data-transfer
mechanism for any processing outside the EEA (we understand SCCs apply).

Thank you,
Costin
Founder, MCA SRL
https://modulca.ro
```

**Expected back:** Countersigned PDF of the Supabase DPA + link to current sub-processor list. Some plans only require click-through acceptance — screenshot the confirmation.

**Save as:** `docs/legal/dpa/DPA-supabase-YYYY-MM-DD.pdf`

---

## 2. Stripe

**Channel:** 100% self-serve. No email needed.
- **Direct URL:** https://dashboard.stripe.com/settings/legal
- Scroll to **"Data Processing Agreement"** → click **"Sign DPA"**. Enter MCA SRL details exactly as below, click-sign, download PDF.

**Form values to enter in the Stripe DPA wizard:**

| Field | Value |
|---|---|
| Legal entity name | ATELIER DE PROIECTARE MCA S.R.L. |
| Country | Romania |
| VAT | RO35294600 |
| Address line 1 | Str. Lacul Plopului nr. 10 |
| City / Sector | București, Sector 5 |
| Postal code | [lookup — typically 051704 for that street] |
| Signatory full name | Costin [LAST NAME] |
| Signatory title | Founder / Administrator |
| Signatory email | costin@modulca.ro |
| DPA effective date | Today |

No email needed. If the wizard breaks: support@stripe.com with subject `DPA signing blocked — Stripe account acct_XXX`.

**Expected back:** Auto-generated PDF delivered to signatory email within ~60 seconds. Also mirrored in dashboard under Settings → Legal.

**Save as:** `docs/legal/dpa/DPA-stripe-YYYY-MM-DD.pdf`

---

## 3. Resend

**Channel:** Email (Resend does not yet have a dashboard DPA flow as of April 2026).
- **Primary:** support@resend.com
- **Also cc:** legal@resend.com if they reply

**Subject line:**
`DPA request — MCA SRL (Resend account costin@modulca.ro)`

**Email body (copy-paste):**

```
Hi Resend team,

We use Resend for transactional email from our SaaS product (ModulCA)
and would like to execute your Data Processing Agreement under
GDPR Article 28.

Company details for the DPA:
  - Legal name: ATELIER DE PROIECTARE MCA S.R.L.
  - Short name: MCA SRL
  - VAT / CUI: RO35294600
  - Registered office: Str. Lacul Plopului nr. 10, Sector 5,
    Bucuresti, Romania
  - Resend account email: costin@modulca.ro
  - Product / sending domain: modulca.ro
  - Signatory: Costin [LAST NAME], Founder / Administrator
  - DPO / privacy contact: dpo@modulca.ro

Could you please send:
  1. The countersigned DPA (or the standard DPA we can sign and
     return),
  2. Your current list of sub-processors,
  3. Confirmation of the lawful transfer mechanism for any
     processing outside the EEA (we expect SCCs).

We are launching public beta on 1 May 2026 and need this in place
before go-live.

Thank you,
Costin
Founder, MCA SRL
https://modulca.ro
```

**Expected back:** PDF DPA (either their template for you to sign, or a pre-countersigned version). Sub-processor list usually linked from https://resend.com/legal/dpa.

**Save as:** `docs/legal/dpa/DPA-resend-YYYY-MM-DD.pdf`

---

## 4. Sentry

**Channel:** 100% self-serve.
- **Direct URL:** https://sentry.io/settings/[ORG-SLUG]/legal/
  (Replace `[ORG-SLUG]` with your Sentry org — e.g., `mca-srl` or `modulca`.)
- On that page: **"Data Processing Addendum"** → click **"Accept"** or **"Sign"**. Some plans require Business tier; check first.

**Form values:**

| Field | Value |
|---|---|
| Company legal name | ATELIER DE PROIECTARE MCA S.R.L. |
| Address | Str. Lacul Plopului nr. 10, Sector 5, București, Romania |
| VAT | RO35294600 |
| Signatory | Costin [LAST NAME], Founder |
| Signatory email | costin@modulca.ro |

If not available on your current plan, email: compliance@sentry.io with subject `DPA request — MCA SRL (Sentry org [ORG-SLUG])` and reuse the Resend email body above, swapping "Resend" → "Sentry".

**Expected back:** PDF downloadable immediately from the Legal page after signing. Current sub-processor list at https://sentry.io/legal/subprocessors/.

**Save as:** `docs/legal/dpa/DPA-sentry-YYYY-MM-DD.pdf`

---

## 5. Vercel

**Channel:** 100% self-serve.
- **Direct URL:** https://vercel.com/teams/[TEAM-SLUG]/settings/billing
  → **"Legal"** tab (sometimes labeled "Contracts & Compliance")
  → **"Data Processing Addendum"** → **"Sign DPA"**.
- Alternative if not visible: https://vercel.com/legal/dpa (to view the template) and then email privacy@vercel.com.

**Form values:**

| Field | Value |
|---|---|
| Company legal name | ATELIER DE PROIECTARE MCA S.R.L. |
| Business address | Str. Lacul Plopului nr. 10, Sector 5, București, Romania |
| Country | Romania |
| VAT | RO35294600 |
| Signatory name | Costin [LAST NAME] |
| Signatory title | Founder / Administrator |
| Signatory email | costin@modulca.ro |

Notes on the Vercel DPA: it references Standard Contractual Clauses (SCCs) module 2 (controller → processor). You do not need to separately sign SCCs — they are incorporated by reference. Accept "Yes" when asked.

**Expected back:** PDF emailed to signatory + mirrored in Legal tab. Sub-processor list at https://vercel.com/legal/subprocessors.

**Save as:** `docs/legal/dpa/DPA-vercel-YYYY-MM-DD.pdf`

---

## 6. Microsoft Clarity

**Channel:** Self-serve (Clarity rides on the Microsoft Online Services DPA).
- **Direct URL:** https://clarity.microsoft.com → sign in → project **Settings** → **"Privacy & Cookies"** section → link to Microsoft Online Services Data Protection Addendum.
- The underlying document is the **Microsoft Products and Services Data Protection Addendum (DPA)** — public URL: https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-DPA
- By using Clarity under a Microsoft account, you are automatically bound by this DPA (it's incorporated into the Clarity Terms of Use). Download the PDF for your records.

**Action checklist in the dashboard:**

1. In Clarity → **Settings → Setup → Masking** → set masking to **"Strict"** for beta (mask all text + inputs).
2. In Clarity → **Settings → Privacy** → enable **"Cookie consent"** integration so Clarity only loads after our cookie banner grants analytics consent.
3. Download the current Microsoft DPA PDF from the link above.
4. Add Microsoft Clarity to our cookie banner vendor list and privacy policy.

**If you want explicit written confirmation** (some EU clients ask for this), email: msftprivacy@microsoft.com with:

**Subject:** `DPA confirmation request — Microsoft Clarity — MCA SRL (RO35294600)`

**Body:**

```
Hello,

We use Microsoft Clarity on our production SaaS (modulca.ro) and
would like written confirmation that our usage is covered by the
Microsoft Products and Services Data Protection Addendum
(https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-DPA).

Controller details:
  - Legal name: ATELIER DE PROIECTARE MCA S.R.L.
  - VAT: RO35294600
  - Address: Str. Lacul Plopului nr. 10, Sector 5, Bucuresti, Romania
  - Microsoft account / tenant email: costin@modulca.ro

Please confirm:
  1. The Microsoft Products and Services DPA applies to Clarity
     for our tenant,
  2. The data-transfer mechanism for any processing outside the
     EEA (SCCs),
  3. The location of the applicable sub-processor list.

Thank you,
Costin
Founder, MCA SRL
```

**Expected back:** Either a short confirmation email + link to the standing DPA PDF, or simply the PDF. For most EU controllers the standing DPA PDF is sufficient evidence.

**Save as:** `docs/legal/dpa/DPA-microsoft-clarity-YYYY-MM-DD.pdf`

---

## Post-signing checklist

Once all 6 DPAs are in hand:

- [ ] All PDFs saved to `docs/legal/dpa/` with correct filenames
- [ ] `docs/legal/subprocessors.md` updated with vendor, scope, location, transfer mechanism, DPA date
- [ ] Public-facing sub-processor list on `modulca.ro/subprocesori` kept in sync
- [ ] Privacy policy (`modulca.ro/privacy`) lists all 6 under "Sub-processors / Data recipients"
- [ ] Cookie banner vendor list reflects Clarity + Sentry + Stripe
- [ ] Added reminder to refresh list every 6 months (each vendor may add new sub-processors)
- [ ] Internal record-of-processing (ROPA) under GDPR Art. 30 updated

**Total realistic time for all 6:** ~90 minutes if you batch them in one sitting (Stripe/Sentry/Vercel/Clarity are all sub-5-min click-through; Supabase and Resend are email with ~24-72h turnaround).
