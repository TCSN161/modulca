# Schrems II Supplementary Measures

> **Legal basis**: CJEU judgment C-311/18 (*Schrems II*, 16 July 2020); GDPR Arts. 44–49; EDPB Recommendations 01/2020 on supplementary measures; EU-US Data Privacy Framework (DPF, 10 July 2023); Legea 190/2018 (RO).
> **Controller**: ATELIER DE PROIECTARE MCA S.R.L. (RO35294600).
> **Owner**: privacy@modulca.eu
> **Version**: 1.0
> **Date**: 2026-04-17
> **Review cadence**: Quarterly (next: 2026-07-17). Triggered review on any EDPB publication or US surveillance-law change.
> **Related docs**: [DPA_Status.md](./DPA_Status.md) · [DPIA_AIRender.md](./DPIA_AIRender.md) · [BreachNotification_Runbook.md](./BreachNotification_Runbook.md)

---

## 1. Context

The *Schrems II* ruling invalidated Privacy Shield and raised the bar for any transfer of EU personal data to the United States (and, by analogy, any third country whose surveillance regime does not match EU essentially-equivalent protection). Since the ruling:

- **Standard Contractual Clauses (SCCs)** remain valid but **are not, by themselves, sufficient** — the controller must perform a **Transfer Impact Assessment (TIA)** and implement **supplementary measures** where the third-country law undermines SCC protection.
- The **EU-US Data Privacy Framework (DPF)** was adopted on 10 July 2023 by Commission Decision (EU) 2023/1795. Transfers to DPF-certified US recipients are now covered by an **adequacy decision** — but adequacy can be challenged (a *Schrems III* case is plausible) so we treat DPF as **necessary but not sufficient** on its own and keep supplementary measures in place.

This document records, per US processor, the legal basis of the transfer, the TIA outcome, and the supplementary measures applied.

---

## 2. Methodology — 6 Steps per EDPB Rec. 01/2020

For every non-EU transfer we execute the following steps:

1. **Know the transfer** — what data, to whom, where, for what purpose.
2. **Identify the transfer tool** under Chapter V GDPR (adequacy decision, SCCs, BCRs, Art. 49 derogation).
3. **Assess effectiveness** — TIA of the third country's law and practice (surveillance, onward transfer).
4. **Adopt supplementary measures** (technical / contractual / organizational) where step 3 shows gaps.
5. **Formal procedural steps** — sign SCCs, update RoPA (Art. 30), update Privacy Policy.
6. **Re-evaluate at appropriate intervals** — quarterly, or on significant change.

---

## 3. Transfer Impact Assessment — per country

### 3.1 United States

| Element | Finding |
|---|---|
| Surveillance statutes of concern | FISA 702 (electronic surveillance of non-US persons), Executive Order 12333 (signals intelligence), CLOUD Act 2018 (extraterritorial access to data held by US providers). |
| Mitigation under US law | Executive Order 14086 (October 2022) introduced: (a) necessity & proportionality requirements for US signals intelligence; (b) two-tier redress mechanism (Civil Liberties Protection Officer + Data Protection Review Court). The EU Commission relied on EO 14086 to adopt the EU-US DPF adequacy decision. |
| Residual risk | CJEU may invalidate DPF (pending challenges). CLOUD Act still permits US authority orders to US providers for data held anywhere. |
| EDPB view (as of April 2026) | DPF adequacy stands; supplementary measures **recommended but not mandated** for DPF-certified recipients. For non-DPF US recipients, SCCs + supplementary measures remain mandatory. |
| Our position | Treat every US transfer as requiring supplementary measures, irrespective of DPF status — belt and braces. |

### 3.2 Distributed / volunteer infrastructure (AI Horde)

Community-operated nodes globally; cannot perform a TIA per-node. **Disabled by default** for authenticated users until opt-in UI with explicit consent ships.

### 3.3 EU-adequate + EU residency

No TIA required beyond DPA verification (Supabase Frankfurt, Resend Ireland, Plausible Germany, Nominatim OSM).

---

## 4. Per-processor register

Legend: L = Legal basis under Chapter V. T = Technical. C = Contractual. O = Organizational. TIA = Transfer Impact Assessment outcome.

### 4.1 Google Analytics 4 (Google LLC, US)

| Field | Value |
|---|---|
| Purpose | Opt-in aggregate analytics |
| Personal data | Anonymized IP, client ID cookie, page URL |
| L | EU-US DPF (Google certified) + SCCs as fallback |
| T | IP anonymization enabled (`anonymize_ip: true`); Google Signals disabled; Ads personalization disabled; data retention set to 14 months (minimum). Cookieless consent-gated — no cookie until consent. |
| C | Google Data Processing Terms (current version) executed; sub-processor list reviewed. |
| O | Consent UI (cookie banner) blocks script load until accepted. Quarterly review of Google's audit reports. |
| TIA | Acceptable — DPF + IP anonymization + consent gate. Residual risk Low. |
| Decision | **OK** — keep with consent gate. |

### 4.2 Microsoft Clarity (Microsoft Corp, US)

| Field | Value |
|---|---|
| Purpose | Opt-in session replay & heatmaps for UX research |
| Personal data | Hashed user ID, masked session recording (PII-scrubbed DOM) |
| L | EU-US DPF (Microsoft certified) + SCCs |
| T | PII masking rules configured to mask all `input`, `textarea`, and elements with `data-clarity-mask`; URL redaction for account pages. |
| C | Microsoft Online Services DPA applies (auto-executed for Azure/Clarity tenants). |
| O | Consent-gated; 30-day retention default. |
| TIA | Acceptable. Residual Low. |
| Decision | **OK** — keep with consent gate. |

### 4.3 OpenAI (OpenAI OpCo LLC, US)

| Field | Value |
|---|---|
| Purpose | AI render + AI consultant text |
| Personal data | Prompt text (sanitized) |
| L | SCCs (2021/914 Module 2, Controller-to-Processor) + OpenAI DPA; OpenAI is **DPF-certified as of 2024**. |
| T | No user email/UUID sent; prompt sanitizer; 0-day retention flag (`store: false` for API calls); TLS 1.3. |
| C | OpenAI API Data Usage Policy: no training on API data by default (since March 2023). |
| O | API keys rotated every 90 days; access limited to production runtime. |
| TIA | Acceptable given DPF + "no training" + minimization. Residual Low. |
| Decision | **OK**. |

### 4.4 Replicate (Replicate Inc, US)

| Field | Value |
|---|---|
| Purpose | AI image generation (broker of many open-source models) |
| Personal data | Prompt text (sanitized) |
| L | SCCs + Replicate DPA. DPF status: ⏳ verification pending (as of 2026-04-17). |
| T | Prompt sanitizer; pseudonymization; inference-only models; no img2img upload persisted post-render. |
| C | "Predictions" API: inputs/outputs retained for 1 hour for model reuse, then purged — documented in our vendor file. |
| O | Quota cap per tier. |
| TIA | Acceptable with SCCs + technical measures. Residual Low–Medium until DPF status confirmed. |
| Decision | **OK with verification pending** — confirm DPF or re-evaluate by 2026-05-15. |

### 4.5 Leonardo.ai (Leonardo Interactive Pty / US infra)

| Field | Value |
|---|---|
| Purpose | AI image generation (premium tier) |
| Personal data | Prompt text (sanitized) |
| L | SCCs. DPF: ⏳ verification pending. |
| T | Prompt sanitizer, pseudonymization. |
| C | Leonardo Enterprise DPA — ⏳ requested, reply pending. |
| O | Disabled at free tier; premium tier only; opt-in required in render settings. |
| TIA | Conditional — acceptable if signed DPA received. Residual Medium until DPA arrives. |
| Decision | **Conditional** — disable engine if no DPA by 2026-04-28. |

### 4.6 Stability AI (Stability AI Ltd, UK with US infra)

| Field | Value |
|---|---|
| Purpose | AI image generation |
| Personal data | Prompt text (sanitized) |
| L | UK adequacy decision (2021) covers UK HQ; US infra requires SCCs. |
| T | Prompt sanitizer; pseudonymization. |
| C | Stability AI DPA — ⏳ requested. |
| O | Premium tier only. |
| TIA | Acceptable with SCCs. Residual Low–Medium. |
| Decision | **OK with verification pending**. |

### 4.7 Together.ai (Together Computer Inc, US)

Prompt text, SCCs, DPF ⏳ pending, same mitigations as Replicate. **OK pending verification.**

### 4.8 HuggingFace (Hugging Face Inc, US)

Free-tier Inference API. Prompt text, SCCs. **HuggingFace DPF-certified as of 2024.** Configured with `wait_for_model: true`; no PII. **OK.**

### 4.9 Fireworks AI (Fireworks AI Inc, US)

Prompt text, SCCs, DPF ⏳. Premium tier. **Conditional** — disable if no DPA by 2026-04-28.

### 4.10 DeepInfra (DeepInfra Inc, US)

Prompt text, SCCs, DPF ⏳. **Conditional** — see §5.

### 4.11 Segmind (Segmind Inc, US)

Prompt text, SCCs, DPF ⏳. Limited usage (niche models). **Conditional — consider disabling** if traffic remains negligible.

### 4.12 Black Forest Labs (Germany HQ, mixed US infra for serving)

German entity (intra-EU for controller relationship); serving infra partially US. Verify infra claims; if serving is EU-only, **OK without supplementary measures**. If US serving confirmed, SCCs + standard technical measures apply.

### 4.13 fal.ai (Features & Labels Inc, US)

Prompt text, SCCs, DPF ⏳. Premium. **Conditional**.

### 4.14 Prodia (Prodia Labs Inc, US)

Prompt text, SCCs. DPF ⏳. **Conditional**.

### 4.15 Vercel (Vercel Inc, US with EU edge)

| Field | Value |
|---|---|
| Purpose | Hosting, edge CDN, serverless compute |
| Personal data | Access logs (IP, URL), function logs, incoming request bodies |
| L | EU-US DPF (Vercel certified April 2024) + SCCs |
| T | EU region forced for all serverless functions (`regions: ['fra1']`); CDN edge is global but serves only static assets; access logs configured with IP truncation. |
| C | Vercel DPA (Enterprise / Pro) — ⏳ verify signed copy in dashboard. |
| O | Environment variables encrypted; preview deployments limited to team members. |
| TIA | Acceptable. Residual Low. |
| Decision | **OK** — confirm signed DPA copy archived. |

### 4.16 GitHub (GitHub Inc, Microsoft subsidiary, US)

| Field | Value |
|---|---|
| Purpose | Source control, CI (GitHub Actions) |
| Personal data | Committer name/email (incidental), CI log output |
| L | EU-US DPF (Microsoft certified) + SCCs |
| T | No production user data in source code; secrets in GitHub Actions Secrets (encrypted at rest). |
| C | GitHub DPA via Microsoft DPA umbrella. |
| O | Branch protection + required reviews. |
| TIA | Acceptable. Residual Low. |
| Decision | **OK**. |

### 4.17 Stripe (Stripe Payments Europe Ltd, IE — with US processing)

Primary relationship intra-EU (Stripe Ireland). Some onward transfers to Stripe Inc (US). SCCs + DPF (Stripe certified). Payment data tokenized; only customer ID + email on our side. **OK.**

---

## 5. Supplementary Measures Matrix (summary)

| Measure | Applied to | Notes |
|---|---|---|
| **Encryption in transit (TLS 1.3)** | All transfers | Enforced; HSTS preload. |
| **Encryption at rest (AES-256)** | Supabase, Vercel blob, Resend | Provider-side; we do not hold decryption keys for provider stores. |
| **Pseudonymization** | AI render prompts | No user email / UUID / IP sent to the inference provider. Per-request random token only. |
| **Data minimization** | All providers | Prompt sanitizer; no account data in analytics events. |
| **Purpose limitation (contract)** | All processors | Art. 28 DPA clauses restrict processing to our instructions. |
| **"No training" clause** | AI providers | Documented per provider; verified quarterly. |
| **Audit rights** | SCC-bound providers | SCC Module 2 Clause 8.9 — exercised on demand. |
| **Onward transfer restrictions** | All processors | Sub-processor list required + consent to new sub-processors. |
| **Deletion SLA 30 days** | All processors | Propagated via deletion API calls on user erasure requests. |
| **API key rotation 90 days** | All providers with API keys | Automated via `scripts/ops/rotate-keys.ts`. |
| **Access controls + logging** | Internal | Supabase RLS, Vercel env vars, Sentry access limited to founder. |
| **Incident response plan** | All transfers | See [BreachNotification_Runbook.md](./BreachNotification_Runbook.md). |
| **EU-only toggle** | AI render | User opt-in restricts to EU providers (Pollinations, Cloudflare EU). |
| **Consent gating** | Analytics (GA4, Clarity) | No script load without accept. |

---

## 6. Decision Log

| Processor | Decision (2026-04-17) | Deadline | Owner |
|---|---|---|---|
| Google Analytics 4 | **Keep** with consent gate, IP anonymization, DPF reliance. | — | Costin |
| Microsoft Clarity | **Keep** with masking + consent gate + DPF. | — | Costin |
| OpenAI | **Keep** — DPF + no-training flag. | — | Costin |
| Replicate | Keep; **verify DPF** by 2026-05-15. | 2026-05-15 | Costin |
| Leonardo.ai | **Conditional** — disable if no DPA by 2026-04-28. | 2026-04-28 | Costin |
| Stability AI | **Keep**; verify DPA. | 2026-05-01 | Costin |
| Together.ai | **Keep** pending verification. | 2026-05-01 | Costin |
| HuggingFace | **Keep** — DPF. | — | Costin |
| Fireworks | **Conditional** — DPA deadline 2026-04-28. | 2026-04-28 | Costin |
| DeepInfra | **Conditional** — DPA deadline 2026-04-28. | 2026-04-28 | Costin |
| Segmind | **Review usage** — consider disabling if traffic negligible. | 2026-05-15 | Costin |
| Black Forest Labs | **Verify infra region** (DE-only or mixed US?). | 2026-05-01 | Costin |
| fal.ai | **Conditional** — DPA deadline 2026-04-28. | 2026-04-28 | Costin |
| Prodia | **Conditional** — DPA deadline 2026-04-28. | 2026-04-28 | Costin |
| Vercel | **Keep** — verify signed DPA archived. | 2026-04-25 | Costin |
| GitHub | **Keep** — DPF. | — | Costin |
| AI Horde | **Disabled** until opt-in UI ships. | Gate on UI | Costin |

**Conditional providers**: if the Apr 28 deadline for DPA arrival passes without a signed DPA, the engine is **disabled at the code level** (`NEXT_PUBLIC_RENDER_ENGINES` env var) before May 1 public launch.

---

## 7. Ongoing Monitoring

- **Quarterly review** of this document (next: 2026-07-17). Each review revisits the TIA for every US processor in light of:
  - New EDPB guidance.
  - Case law from CJEU (Schrems III watch).
  - US legislative changes (ADPPA, state laws, FISA 702 reauthorization).
  - Provider DPA changes.
- **Event-triggered review** on: new provider added, breach event, material TOS change from a provider, adequacy decision change.
- **EDPB / ANSPDCP newsletter subscription** — privacy@modulca.eu.

---

## 8. Record of Review History

| Date | Reviewer | Outcome |
|---|---|---|
| 2026-04-17 | Costin (acting DPO) | Initial version. Conditional providers identified; deadlines set. |
| _(next)_ 2026-07-17 | Costin | TBD — quarterly review. |

---

*End of Schrems II Supplementary Measures document.*
