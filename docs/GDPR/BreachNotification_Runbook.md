# Data Breach Notification Runbook

> **Regulation basis**: GDPR Articles 33 (notification to authority) and 34 (notification to data subjects); Legea 190/2018 (RO); ANSPDCP procedural guidance.
> **Controller**: ATELIER DE PROIECTARE MCA S.R.L. (RO35294600), Str. Lacul Plopului nr. 10, Sector 5, București.
> **DPO contact**: privacy@modulca.eu
> **Incident commander (default)**: Costin (founder).
> **Version**: 1.0
> **Date**: 2026-04-17
> **Review cadence**: Annually + after each incident (lessons learned).
> **Related docs**: [DPA_Status.md](./DPA_Status.md) · [DPIA_AIRender.md](./DPIA_AIRender.md) · [SchremsII_Supplementary_Measures.md](./SchremsII_Supplementary_Measures.md)

---

## 0. TL;DR — the 72-hour clock

From the moment you **become aware** of a personal data breach (not the moment it occurred):

- **Hour 0–1**: Detect → contain → preserve evidence → alert the incident commander.
- **Hour 1–6**: Scope assessment → risk classification → decide if ANSPDCP notification is required.
- **Hour 6–72**: Notify ANSPDCP (if required). Notify users (if high risk). Log everything.
- **Day 3–7**: Full post-mortem, recovery actions, lessons learned.

The 72-hour deadline is a **statutory maximum** — Art. 33(1) says "where feasible, not later than 72 hours". Earlier is always better.

---

## 1. Detection Triggers

We rely on a layered detection stack. Any of the following signals **escalates to P1** immediately.

### 1.1 Automated signals

| Signal | Source | Threshold | Alert channel |
|---|---|---|---|
| Sentry auth failure spike | Sentry project `modulca-prod` | > 50 failures / 10 min from single IP, or > 500 / 10 min cluster | Email `privacy@modulca.eu` + Slack `#alerts` |
| Supabase RLS policy denial burst | Supabase logs | > 100 denials / 1 min on a single table | Email |
| Mass delete / update event | Supabase trigger `fn_audit_mass_change()` | > 200 rows deleted/updated in one transaction on `profiles` or `projects` | Email (PagerDuty-style high severity) |
| Data volume egress anomaly | Vercel / Supabase usage | Daily egress > 3× 7-day rolling average | Email |
| Stripe anomaly | Stripe Radar | Flagged payment or chargeback spike | Stripe dashboard |
| Unknown IP in admin login | Supabase auth log | Login from IP not in known-device list for admin role | Email |
| Secret-scanning hit | GitHub / gitleaks | Any new match | GitHub notification + email |
| Sentry `SecurityException` or `UnauthorizedAccess` error | Sentry | Any occurrence | Email |

### 1.2 Manual signals

- User report (email to `privacy@modulca.eu` or `contact@modulca.eu`) of suspicious account activity, visible data of another user, phishing received purporting to come from us.
- Security researcher report (responsible disclosure).
- Observation by founder/developer during routine work.
- Provider notification (Supabase, Vercel, Resend, Stripe, etc. — they have their own Art. 33 duty to inform us as controller).

### 1.3 Severity classification (use within the first hour)

| Level | Criteria | Examples |
|---|---|---|
| **P1 — Critical** | Confirmed unauthorized access to personal data at scale OR access to auth tokens/passwords OR loss of control of production database | Supabase service-role key leaked; admin account compromised; dump of `profiles` table observed |
| **P2 — High** | Confirmed or strongly suspected unauthorized access to a small number of records, OR a provider notifies us of their breach affecting our data | Single account takeover; Sentry logs contained PII that was visible to unauthorized Sentry team members |
| **P3 — Medium** | Theoretical exposure with low likelihood of materialization | Public URL of signed image link shared inadvertently; IP log retention overshoot |
| **P4 — Low / Near-miss** | Control failure detected before any data access occurred | RLS bug found in staging before production deploy |

Only P1 and P2 trigger the authority notification path by default; P3 is assessed on the merits.

---

## 2. First Hour — Containment & Preservation

Run in roughly this order. Time-box hard: 60 minutes total.

### 2.1 Identify (5–10 min)

1. What was accessed / modified / leaked? (Data category + approximate number of records + approximate number of individuals.)
2. When did it start? (Earliest log timestamp.)
3. Is it ongoing? (Is the attacker / faulty process still active?)
4. Who reported it and through what channel?

### 2.2 Contain (10–20 min)

Pick the minimum set of actions that stop the bleeding without destroying evidence.

| Scenario | Containment actions |
|---|---|
| Leaked secret / API key / service role | Rotate immediately via the provider dashboard. Use `scripts/ops/rotate-keys.ts`. Revoke old key. |
| Account takeover | Force sign-out for affected user(s): Supabase Auth → "Sign out user". Temporarily disable login until password reset. |
| Ongoing data exfiltration via API | Temporarily tighten rate limit + disable suspected route via feature flag. Block offending IPs at Vercel firewall. |
| Malicious insertion / mass deletion | Point-in-time recovery (PITR) readiness: identify the timestamp to restore to (do not restore yet). |
| Provider breach (Supabase, Resend, etc.) | Read provider's advisory carefully. Rotate any keys they recommend. Assess our exposure window. |
| Physical device loss (laptop with credentials) | Revoke all credentials from the device (Google, Supabase, Stripe, Vercel, GitHub). Remote wipe if possible. |

### 2.3 Preserve evidence (10 min)

- Export relevant Sentry events (right-click → export JSON).
- Export Supabase logs for the window (SQL against `auth.audit_log_entries` and access logs; save as CSV with SHA-256 hash of the file recorded).
- Export Vercel access logs for the relevant routes (dashboard → project → logs → download).
- Screenshot any relevant dashboards.
- Create an incident folder: `docs/GDPR/incidents/YYYY-MM-DD-<slug>/` (do **not** commit to git if it contains personal data — store in secured, encrypted private storage).
- Chain-of-custody note: who accessed what, when.

### 2.4 Alert (5 min)

Use the escalation chain in §3. Do not wait for full scope before alerting — initial notification can be partial.

---

## 3. Escalation Chain

```
┌──────────────────────────┐
│ Detector (human or bot)  │  — auto-alerts go here
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Technical lead: Costin   │  privacy@modulca.eu / +40 [phone on file]
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Acting DPO: Costin       │  (same person currently)
└────────────┬─────────────┘
             │     │
             │     └─────► ┌──────────────────────────┐
             │             │ External counsel (RO)    │  — for P1/P2, optional for P3
             │             └──────────────────────────┘
             ▼
┌──────────────────────────┐
│ MCA Administrator:       │  Muraru Petria (signs notifications on behalf of MCA SRL)
│ Muraru Petria            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ ANSPDCP (if triggered)   │  anspdcp@dataprotection.ro / +40 318 059 211
└──────────────────────────┘
```

**On-call expectation**: the founder carries a phone reachable 24/7. If the founder is incapacitated, Muraru Petria (MCA administrator) acts as backup authority to sign notifications and external communications.

---

## 4. Risk Classification & Art. 33 Decision

Within the first 6 hours, complete the risk-classification form below (template in §8).

| Question | If **yes** → |
|---|---|
| Are individuals identified or identifiable from the breached data? | Notify authority required (unless unlikely to result in risk). |
| Does the data include special categories (health, biometric, political) OR passwords/auth tokens OR financial account data? | Notify individuals (Art. 34) — high risk presumption. |
| Can the breach lead to identity theft, fraud, discrimination, or reputational harm? | Notify individuals. |
| Is the data encrypted with a key not accessible to the attacker, OR anonymized? | **May be** exempt from Art. 34 notification to individuals (Art. 34(3)(a)). |
| Is the breach confined to internal systems with no exfiltration? | Often Art. 33 only, not Art. 34. |

**Decision**:

- **Art. 33 notification to ANSPDCP**: required for all breaches likely to result in a risk to rights and freedoms, within 72h.
- **Art. 34 notification to affected individuals**: required when high risk to rights and freedoms.

When in doubt, **notify**. Under-notification is sanctioned under Art. 83(4)(a) (up to €10M or 2% global turnover).

---

## 5. ANSPDCP Notification (within 72 hours)

### 5.1 How

ANSPDCP online form: **https://www.dataprotection.ro/?page=Formulare&lang=ro** (section "Notificare breșă de securitate a datelor").

Alternative email channel (for confirmation copy or if form is down): **anspdcp@dataprotection.ro**.

Contact phone (for urgent clarifications): **+40 318 059 211**.

### 5.2 What to include (Art. 33(3))

1. **Nature of the breach** — what happened, when, how detected.
2. **Categories and approximate numbers** of data subjects concerned.
3. **Categories and approximate numbers** of personal data records concerned.
4. **Name and contact details of the DPO** (or other point of contact): privacy@modulca.eu / Costin.
5. **Likely consequences** for data subjects.
6. **Measures taken or proposed** to address the breach, including mitigation of adverse effects.

### 5.3 Template — cover message (RO)

```
Subiect: Notificare breșă de securitate conform Art. 33 GDPR — ATELIER DE PROIECTARE MCA S.R.L.

Stimate doamne/domni,

În conformitate cu obligația prevăzută la Art. 33 din Regulamentul (UE) 2016/679,
vă notificăm o breșă de securitate a datelor cu caracter personal survenită în
sistemele operate de ATELIER DE PROIECTARE MCA S.R.L. (CUI RO35294600).

1. Natura breșei: [descriere succintă]
2. Data/ora detectării: [YYYY-MM-DD HH:MM EEST]
3. Data/ora survenirii (estimare): [YYYY-MM-DD HH:MM EEST]
4. Categorii de date implicate: [ex. email, nume, ID proiect]
5. Număr aproximativ de persoane vizate: [N]
6. Număr aproximativ de înregistrări: [N]
7. Consecințe probabile: [evaluare]
8. Măsuri luate / propuse: [listă]
9. Responsabil cu protecția datelor (DPO): Costin, privacy@modulca.eu

Atașăm [formularul ANSPDCP completat] și rămânem la dispoziție pentru clarificări.

Cu stimă,
[Muraru Petria, Administrator]
ATELIER DE PROIECTARE MCA S.R.L.
privacy@modulca.eu
```

### 5.4 If information is not yet complete

Art. 33(4) allows **phased notification**: "Where, and in so far as, it is not possible to provide the information at the same time, the information may be provided in phases without undue further delay." Clearly mark the initial notification as "interim" and follow up with complete information as soon as available.

---

## 6. User Notification (Art. 34, when high risk)

### 6.1 Who to notify

Only individuals whose data is **materially implicated** — not the entire user base, unless the breach scope is unknown and it would be unreasonable to differentiate.

### 6.2 Channel

- Primary: direct email via Resend to the affected users' registered email addresses.
- Secondary: in-app banner on next login.
- Public statement on `https://www.modulca.eu/security` only when scale warrants (P1 and broad).

### 6.3 Content (Art. 34(2))

The notification must be in **clear and plain language** and include:

- Description of the breach.
- DPO contact (privacy@modulca.eu).
- Likely consequences.
- Measures taken / recommended (e.g. change your password, watch for phishing).

### 6.4 Template email — Romanian

```
Subiect: Informare importantă privind securitatea contului tău ModulCA

Dragă [prenume],

Îți scriem pentru a te informa despre un incident de securitate care poate
afecta contul tău ModulCA.

Ce s-a întâmplat:
[descriere în limbaj clar, fără jargon tehnic]

Ce date au fost implicate:
[listă concretă — ex: adresa ta de email și numele complet]

Ce date NU au fost implicate:
[ex: parola (hash-uită și nu s-a pierdut), datele de plată (procesate de Stripe)]

Ce am făcut:
- [acțiune 1, ex: am rotit cheile afectate în mai puțin de 1 oră]
- [acțiune 2]
- [acțiune 3]
- Am notificat ANSPDCP conform art. 33 GDPR în [X] ore de la detectare.

Ce te rugăm să faci:
- [acțiune recomandată — ex: schimbă parola, activează 2FA]
- Fii atent(ă) la email-uri de phishing ce imită ModulCA — noi NU îți vom cere niciodată parola.
- Dacă observi activitate suspectă, contactează-ne imediat la privacy@modulca.eu.

Drepturile tale conform GDPR:
Ai dreptul să ne ceri detalii suplimentare, să soliciți ștergerea contului,
sau să depui plângere la ANSPDCP (www.dataprotection.ro, +40 318 059 211).

Îți mulțumim pentru încredere și ne cerem scuze pentru disconfort.

Echipa ModulCA
ATELIER DE PROIECTARE MCA S.R.L.
privacy@modulca.eu
```

### 6.5 Template email — English

```
Subject: Important security notice about your ModulCA account

Hi [first name],

We are writing to let you know about a security incident that may affect your
ModulCA account.

What happened:
[plain-language description]

What data was involved:
[concrete list — e.g. your email and full name]

What data was NOT involved:
[e.g. your password (hashed, not exposed), your payment details (held by Stripe)]

What we did:
- [action 1, e.g. rotated affected keys within one hour]
- [action 2]
- [action 3]
- We notified the Romanian Data Protection Authority (ANSPDCP) within [X] hours
  of detection, as required by GDPR Article 33.

What we ask you to do:
- [recommended action — e.g. change your password, enable 2FA]
- Beware of phishing emails impersonating ModulCA — we will never ask for your password.
- If you notice suspicious activity, contact us immediately at privacy@modulca.eu.

Your rights under GDPR:
You may request further details, delete your account, or file a complaint with
the Romanian DPA ANSPDCP (www.dataprotection.ro, +40 318 059 211).

Thank you for your trust, and we apologise for the inconvenience.

The ModulCA team
ATELIER DE PROIECTARE MCA S.R.L.
privacy@modulca.eu
```

---

## 7. Recovery Actions Checklist

After containment and notification, work through:

- [ ] Rotate all potentially affected secrets (Supabase service role, Stripe restricted keys, Resend API, Sentry DSN if user-visible, all AI provider keys, GitHub PATs, Vercel tokens).
- [ ] Reset passwords / force re-auth for affected users.
- [ ] Revoke active sessions where relevant (Supabase → sign out all).
- [ ] Review all recent changes to production (Vercel deploy history, Supabase migrations, GitHub commits) for correlated anomalies.
- [ ] Audit the access log for the last 30 days: unfamiliar IPs, geographies, user agents.
- [ ] Apply any patch / config fix required.
- [ ] If customer-facing URL or public system was impacted: verify no stale cache serves the bad content (Vercel CDN purge).
- [ ] Update the detection threshold that caught (or missed) the signal — tune to reduce next MTTD.
- [ ] Record incident in `docs/GDPR/incidents/YYYY-MM-DD-<slug>/` (secured storage).
- [ ] Schedule post-mortem within 7 days.

---

## 8. Incident Log Template

Copy into `docs/GDPR/incidents/YYYY-MM-DD-<slug>/incident.md` (secured storage; not public git).

```markdown
# Incident YYYY-MM-DD — [short title]

## Classification
- Severity: P1 / P2 / P3 / P4
- Status: Open / Contained / Closed
- Incident commander: [name]
- Reported by: [channel / person]

## Timeline (all times Europe/Bucharest)
- YYYY-MM-DD HH:MM — Detection
- YYYY-MM-DD HH:MM — Containment started
- YYYY-MM-DD HH:MM — Containment complete
- YYYY-MM-DD HH:MM — Scope assessed
- YYYY-MM-DD HH:MM — ANSPDCP notified (if applicable)
- YYYY-MM-DD HH:MM — Users notified (if applicable)
- YYYY-MM-DD HH:MM — Post-mortem complete

## Facts
- What happened:
- Root cause (preliminary):
- Affected systems:
- Affected data categories:
- Approximate number of individuals:
- Approximate number of records:
- Likely consequences for individuals:
- Was encryption / pseudonymization in place?

## Actions taken
| Time | Action | By |
|------|--------|-----|
| | | |

## Notifications
- ANSPDCP: [sent YYYY-MM-DD HH:MM, reference number if assigned]
- Individuals: [sent YYYY-MM-DD HH:MM, count: N]
- Processors involved: [list]

## Evidence collected
- [ ] Sentry export: <path>
- [ ] Supabase logs: <path>
- [ ] Vercel logs: <path>
- [ ] Screenshots: <path>

## Risk assessment
- Likelihood of misuse: Low / Medium / High
- Severity of harm: Low / Medium / High
- High risk under Art. 34? Yes / No (justification)
```

---

## 9. Post-Mortem Template (within 7 days)

Copy into the same incident folder as `post-mortem.md`. This document **is shared**  internally (and with ANSPDCP if they request it) but contains no personal data — redact accordingly.

```markdown
# Post-Mortem — YYYY-MM-DD — [short title]

## Summary
One paragraph. What happened, impact, resolution.

## Impact
- Users affected: [N] (out of [total])
- Data categories: [list]
- Downtime: [duration]
- Reputational / legal impact: [assessment]

## Timeline
Reproduce the incident timeline at a higher level (no PII).

## Root cause
Technical cause + contributing factors (process, monitoring gap, human error).

## What went well
- …

## What went poorly
- …

## Action items (with owners and deadlines)
- [ ] [action] — owner — due YYYY-MM-DD
- [ ] [action] — owner — due YYYY-MM-DD

## Detection improvements
Specific changes to alerts, dashboards, runbooks, tests.

## Review date
Revisit status of action items on YYYY-MM-DD.
```

---

## 10. Records Retention for Incidents

Per Art. 33(5), we keep a full record of all breaches — **whether or not** they were notifiable.

- Location: secured private storage (not public git).
- Retention: **6 years** from incident closure (covers the 5-year ANSPDCP enforcement lookback + buffer).
- Access: founder + DPO + external counsel when engaged.

---

## 11. Quarterly Drill

Once per quarter, run a **tabletop exercise**: pick one of the scenarios below at random, walk through the runbook, record time-to-decision.

Scenario bank:
1. Supabase service-role key leaks in a GitHub public gist.
2. A user reports they can see another user's project from a shared link.
3. Sentry captures unmasked emails in a function error log.
4. An AI render provider notifies us of a breach affecting prompts from the last 30 days.
5. A former contractor still has a Supabase login active.
6. Stripe webhook signature verification silently fails and bogus events are processed.
7. Resend API leaks recent email subject lines in a status-page history.
8. A lost laptop with a signed-in Chrome profile that has access to Vercel.

Log drill results in `docs/GDPR/drills/YYYY-QN.md`.

---

## 12. External Resources

- **ANSPDCP (Romanian DPA)** — www.dataprotection.ro · anspdcp@dataprotection.ro · +40 318 059 211
- **ANSPDCP breach notification form** — https://www.dataprotection.ro/?page=Formulare&lang=ro
- **EDPB Guidelines 9/2022 on personal data breach notification** — https://www.edpb.europa.eu (check for current version).
- **Legea 190/2018** (RO implementation of GDPR) — https://legislatie.just.ro/
- **Reg. (UE) 2016/679** (GDPR consolidated text) — https://eur-lex.europa.eu/

---

*End of Breach Notification Runbook.*
