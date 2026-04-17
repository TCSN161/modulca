# DPIA — AI Render Processing

> **Regulation basis**: GDPR Article 35 (Data Protection Impact Assessment).
> **Romanian law basis**: Legea 190/2018 privind măsuri de punere în aplicare a GDPR.
> **Controller**: ATELIER DE PROIECTARE MCA S.R.L. (CUI RO35294600), Str. Lacul Plopului nr. 10, București.
> **DPO contact**: privacy@modulca.eu
> **Assessor**: Costin (founder, acting DPO).
> **Version**: 1.0
> **Date**: 2026-04-17
> **Review cadence**: Annually or upon addition/removal of an AI render engine.
> **Related docs**: [DPA_Status.md](./DPA_Status.md) · [SchremsII_Supplementary_Measures.md](./SchremsII_Supplementary_Measures.md) · [BreachNotification_Runbook.md](./BreachNotification_Runbook.md)

---

## 1. Trigger for DPIA

Per GDPR Art. 35(1) and the Romanian ANSPDCP blacklist (Decision 174/2018), a DPIA is **required** when processing is likely to result in a high risk. The following factors apply to ModulCA's AI render pipeline:

- **Systematic large-scale processing** of user-generated content (design prompts).
- **Transfers of personal data to third countries** (United States: several engines — see §5).
- **Use of new technologies** (generative AI with evolving legal status under EU AI Act).
- **Automated processing** producing outputs (images) that could be inferred back to the individual.

Conclusion: **DPIA mandatory**.

---

## 2. Systematic Description of Processing (Art. 35(7)(a))

### 2.1 Purpose

Transform a user-authored textual description of a home/space into one or more AI-generated images that illustrate the design. The output is a visualization tool, not a deterministic architectural document.

### 2.2 Scope & categories of data processed

| Field | Always present | Sometimes present | Personal data? |
|---|---|---|---|
| Room type (e.g. "living room") | ✅ | — | No (unless uniquely identifying) |
| Style / colors / materials | ✅ | — | No |
| Dimensions | ✅ | — | No |
| Free-text prompt | ✅ | — | **Potentially yes** — user may include location ("my house in Bucureşti, Sector 2"), family composition ("for me, my wife and two kids"), or health-adjacent notes ("wheelchair accessible") |
| Authenticated user ID (Supabase UUID) | Only server-side log, never sent to provider | — | Yes (pseudonymized) |
| Session / IP / user-agent | Logged at Vercel edge | — | Yes (short retention) |
| Uploaded image (img2img) | — | ✅ (optional) | Potentially — a personal photo |

Account email, real name, payment data are **never** sent to any AI render engine.

### 2.3 Data flow diagram (text)

```
 [User browser]
      │
      │ HTTPS (TLS 1.3)
      ▼
 [Vercel edge (EU + US edge cache)]     ← short-lived access log (≤30 days)
      │
      ▼
 [Next.js API route: /api/render]
      │
      │ 1. Auth check (Supabase JWT)
      │ 2. Tier/quota check
      │ 3. Prompt sanitization (PII scrubber: strip address regexes, phone, email)
      │ 4. Policy flag check (disallowed terms)
      │ 5. Engine selection (fallback chain, cost ceiling per tier)
      │
      ▼
 [AI render engine] — one of 15 providers (see §5)
      │    (prompt + optional img2img; NO user email, NO user UUID)
      │
      ▼
 [Generated image URL / bytes]
      │
      ▼
 [Supabase storage (EU — Frankfurt)]  ← persisted with owner UUID + project ID
      │
      ▼
 [User browser — render displayed]
```

### 2.4 Nature of processing

- Transmission of text (and optionally a reference image) from our servers to a third-party inference provider.
- Storage of returned image in EU-region Supabase Storage, bound to the authenticated user.
- No training of the provider's model on user prompts is permitted under our contractual configuration (see mitigation §6.2).

### 2.5 Context

- **Subjects**: Registered ModulCA users (adults 18+, EU residents predominantly RO/NL at beta launch).
- **Relationship**: Contractual (subscription or free tier) — users have signed up and agreed to ToS + Privacy Policy.
- **Reasonable expectations**: Users understand they are using an "AI design tool". The specific third-party engines are disclosed in the Privacy Policy and on the render page itself.

### 2.6 Legal basis (Art. 6 & Art. 9)

- **Art. 6(1)(b) Contract** — performance of the subscribed service (user requested a render).
- **Art. 6(1)(a) Consent** — separate consent captured for prompt telemetry (analytics of prompt length/language, never raw content).
- **No special categories (Art. 9)** are intentionally processed. Incidental special-category data in a free-text prompt (e.g. a user mentions a disability) is mitigated via prompt sanitization + explicit UI guidance ("don't include personal information").

---

## 3. Necessity and Proportionality (Art. 35(7)(b))

| Question | Answer |
|---|---|
| Is AI rendering necessary to the service? | Yes — it is a core feature advertised in the product. A non-AI path (placeholder image) is available for users who decline. |
| Could we achieve the purpose with less data? | Yes — and we do: only the prompt is sent, not the user identity. Prompt sanitization further reduces data volume. |
| Could we use a single EU-only provider? | Tested. Pollinations (EU) and Cloudflare Workers AI (EU edge) cover ~60% of quality requirements. US engines are used for higher-fidelity tiers. A **EU-only toggle** exists for users who require it (see §6.3). |
| Is the retention proportionate? | Generated images are retained **only while the project exists** and are deleted with the project / account. Prompt text is stored in our DB (not the provider's) for regeneration. Providers' server-side logs are contractually capped (see §6.2). |
| Is the processing limited to the stated purpose? | Yes — providers are contractually bound to purpose limitation (inference only, no training). |

Conclusion: processing is **necessary and proportionate**, with a documented less-invasive alternative (EU-only toggle, placeholder fallback).

---

## 4. Stakeholder Consultation (Art. 35(9))

| Stakeholder | Consulted? | Outcome |
|---|---|---|
| DPO (acting: Costin) | ✅ | DPIA authored. |
| External GDPR counsel | ⏳ Pending — scheduled pre-launch review by Romanian data protection lawyer. |
| Users (representative feedback) | ✅ Feedback collected during closed beta (March-April 2026). Users explicitly noted they want transparency on which engine is used → implemented as engine label on each render. |
| ANSPDCP (Romanian DPA) | ⚪ Not required unless residual high risk remains after mitigation (Art. 36). Current residual risk assessment: **medium — no prior consultation triggered**. |

---

## 5. Processors and International Transfers

Full per-processor detail lives in [DPA_Status.md](./DPA_Status.md). Summary of the 15 render engines:

| # | Engine | Region | Transfer mechanism | Status |
|---|---|---|---|---|
| 1 | Pollinations | EU | Intra-EU | 🟡 DPA verification pending |
| 2 | AI Horde | Distributed (volunteer) | Case-by-case; disabled for logged-in users until opt-in UI ships | 🟠 |
| 3 | Stability AI | US | SCCs + EU-US DPF check | 🟠 |
| 4 | Together.ai | US | SCCs | 🟠 |
| 5 | Leonardo.ai | US | SCCs | 🟠 |
| 6 | Replicate | US | SCCs | 🟠 |
| 7 | OpenAI | US | SCCs + DPF | 🟠 |
| 8 | Cloudflare Workers AI | EU + US edge | SCCs + DPF (Cloudflare certified) | 🟡 |
| 9 | HuggingFace (Inference) | US | SCCs | 🟠 |
| 10 | Fireworks | US | SCCs | 🟠 |
| 11 | DeepInfra | US | SCCs | 🟠 |
| 12 | Segmind | US | SCCs | 🟠 |
| 13 | Black Forest Labs | US/DE | SCCs (mixed infra — verify) | 🟠 |
| 14 | fal.ai | US | SCCs | 🟠 |
| 15 | Prodia | US | SCCs | 🟠 |

See [SchremsII_Supplementary_Measures.md](./SchremsII_Supplementary_Measures.md) for Transfer Impact Assessment.

---

## 6. Risk Assessment (Art. 35(7)(c))

We assess each risk on two axes: **Severity** (1 minor – 4 catastrophic) and **Likelihood** (1 rare – 4 frequent). Residual risk = after mitigations.

### 6.1 Risk register

| # | Risk | Who is affected | Severity | Likelihood | Inherent | Mitigation (see §7) | Residual |
|---|---|---|---|---|---|---|---|
| R1 | User includes PII (address, family names) in prompt → PII transits to US provider | User | 3 | 3 | High | Prompt sanitizer + UI guidance + provider DPA + SCCs | Low–Medium |
| R2 | Provider logs prompts indefinitely / uses them to train future models | User | 3 | 2 | Medium | Contractual "no training" clause, quarterly verification, fallback to EU-only if a provider's ToS changes | Low |
| R3 | Provider subpoena by foreign authority under surveillance law (FISA 702, CLOUD Act) | User | 4 | 1 | Medium | Schrems II supplementary measures (encryption in transit, data minimization, pseudonymization — no user UUID sent) | Low |
| R4 | Hallucinated / harmful image output (e.g. image includes real person's likeness) | User + third parties | 3 | 2 | Medium | Policy flag filter (disallowed terms), provider safety filters, user reporting, take-down workflow | Low |
| R5 | Unauthorized replay of another user's prompt via leaked URL | Other users | 3 | 1 | Low | Auth required for API route, signed URLs for storage (1 hour TTL), RLS policies | Low |
| R6 | Engine outage causes fallback to a less-preferred provider the user did not expect | User | 1 | 3 | Low | UI label shows which engine rendered the image; user can re-generate with explicit engine | Minimal |
| R7 | AI Horde exposes prompt to unvetted community volunteers | User | 3 | 2 (if enabled) | Medium | AI Horde disabled by default; requires explicit opt-in with warning copy | Low |
| R8 | Prompt containing a minor's photo (img2img) reaches a US provider | Minor (third party) | 4 | 1 | Medium | ToS forbids uploading images of minors; content scan on upload; legal take-down within 24h | Low |
| R9 | User withdraws consent but prompt was already cached at provider edge | User | 2 | 2 | Low | Contractual deletion SLA (30 days); internal audit trail of deletion requests | Low |
| R10 | Provider breach exposes our API key + recent prompts | Users | 3 | 2 | Medium | Provider-scoped keys, rotation every 90 days, alert on anomaly (Sentry) | Low |

### 6.2 Rights of data subjects affected

Potentially affected rights per GDPR:
- Art. 15 access, Art. 16 rectification, Art. 17 erasure, Art. 20 portability — fulfilled via `/api/user/export` and the account deletion flow.
- Art. 21 right to object — users can disable AI features per project.
- Art. 22 no solely-automated decision — AI render is assistive, not a decision affecting legal rights.

---

## 7. Mitigation Measures (Art. 35(7)(d))

### 7.1 Technical

- **Prompt sanitization** (`src/lib/privacy/promptScrubber.ts`): regex strip of emails, phone numbers, Romanian CNP, street-number patterns before sending to any provider.
- **Pseudonymization**: no user email or Supabase UUID is ever sent with a prompt. A per-request random token is used for idempotency.
- **Encryption in transit**: TLS 1.3 enforced; HSTS preload on modulca.eu.
- **Encryption at rest**: Supabase AES-256; generated images stored in EU bucket only.
- **Minimum data exposure**: no img2img upload is stored on our side after completion (deleted within 5 min); prompt kept for user's project regeneration only.
- **Rate limiting + anomaly detection**: Sentry triggers on abnormal request volume per user.
- **Provider-scoped API keys** with 90-day rotation policy (tracked in `scripts/ops/rotate-keys.ts`).
- **EU-only toggle** in user preferences — when enabled, only Pollinations and Cloudflare (EU region) are reachable; US providers are disabled at the route level.
- **Signed URLs** for storage (1-hour TTL) — no public image URLs.

### 7.2 Organizational

- Named DPO contact (privacy@modulca.eu).
- DPA inventory maintained in [DPA_Status.md](./DPA_Status.md), reviewed quarterly.
- Vendor onboarding checklist (see DPA_Status.md §"Template: New processor intake checklist") — no provider added without DPA sign-off.
- Incident response per [BreachNotification_Runbook.md](./BreachNotification_Runbook.md).
- Staff (currently founder-only) trained on GDPR Art. 28 processor selection criteria.
- Annual re-read of EDPB guidance on AI and international transfers (next: July 2026).

### 7.3 Contractual

- Written DPA with every processor (Art. 28(3)) — status tracked.
- "No training on customer data" clause enforced in provider ToS/DPA; documented per provider in DPA_Status.md.
- Sub-processor list disclosed by each provider and mirrored in our Privacy Policy.
- Deletion SLA: 30 days from a user erasure request, propagated to all providers via written deletion API call.

### 7.4 Transparency to users

- Privacy Policy §5 lists every AI engine.
- Render UI displays the engine label ("Rendered by Pollinations, EU").
- Cookie-free in-app notice on first render usage: "Prompts may be sent to third-party AI providers in the EU or US. Do not include personal information."
- Opt-out: user can disable AI features and continue with placeholder visuals.

---

## 8. Residual Risk & Decision

After applying the mitigations in §7:

- **Maximum residual risk**: Medium (R1 — user-authored PII leakage) before opt-in to EU-only mode; Low after.
- **No residual high risk** triggering prior consultation with ANSPDCP (Art. 36) is identified.
- Processing may **proceed**, subject to:
  1. Completion of DPA verification for the remaining 🟠 providers before May 1, 2026.
  2. Implementation of the EU-only toggle by May 1, 2026.
  3. AI Horde remains disabled until opt-in UI with warning copy is implemented.
  4. External counsel sign-off on this DPIA (scheduled).

Sign-off:

| Role | Name | Date | Signature |
|---|---|---|---|
| Acting DPO | Costin | 2026-04-17 | _(digital — commit hash in git)_ |
| MCA SRL Administrator | Muraru Petria | ⏳ | |
| External counsel | ⏳ | | |

---

## 9. Review Triggers

This DPIA is re-assessed when any of the following occurs:
- A new AI render engine is added.
- A provider changes its DPA, region, or "no training" policy.
- A data breach involves a render pipeline.
- EDPB or ANSPDCP publishes new guidance on generative AI.
- The EU AI Act imposes new obligations on providers or deployers (we are a deployer).
- Annual review (next: 2027-04-17).

---

*End of DPIA — AI Render Processing.*
