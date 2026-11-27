# DPA cu furnizorii — acțiuni și drafturi de e-mail

**Status**: `DRAFT — nimic trimis, nimic acceptat în dashboard-uri` · 2026-11-27, sesiunea 7.02
**Bază**: `docs/GDPR/DPA_Status.md` (18 apr 2026: niciun furnizor din listă nu are DPA ✅ semnat) + verificare web 27 nov 2026.
**Legendă**: ✅ citit pe pagina oficială a furnizorului · 🟡 doar din rezultate de căutare / documente interne · ❓ neverificat.
⚠️ Verificarea s-a făcut automat, pe fragmente; „acceptat automat” se confirmă de un jurist, iar pentru fiecare se salvează PDF-ul datat în afara repo-ului (`signed-dpas/`, necomis).

---

## 1. Rezumat

| Furnizor | Date prelucrate | Zonă | Cum se obține DPA | Acțiune |
|---|---|---|---|---|
| **Sentry** | ID utilizator, IP, URL-uri, stack trace (cu scrubbing) | UE (Frankfurt) 🟡; companie US | **Dashboard** (Owner/Billing); plata nu înseamnă acceptare 🟡 | 🖱️ **click** |
| **OpenAI** | întrebări consultant, prompt + capturi de randare | US + subprocesori; contract UE: OpenAI Ireland ✅ | Acceptat prin folosire ✅; există formular „Execute DPA” (Ironclad) ✅ | 🖱️ formular (recomandat) |
| **Vercel** | IP, loguri, trafic, tot ce trece prin API | US ✅ | DPA-ul acoperă **doar Enterprise și Pro**, **nu Hobby** ✅ | ✉️ **e-mail** sau Pro |
| **Stability AI** | prompt + captură 3D | în afara SEE, inclusiv US ✅ | Nu am găsit DPA public ✅/❓ | ✉️ **e-mail** |
| **Leonardo.ai** | prompt (+ imagine) | US/AU 🟡 | Pagină DPA publică, nu s-a putut citi (403) 🟡 | 👀 citit în browser, apoi ✉️ dacă e nevoie |
| **Pollinations** | prompt | ❓ („UE” în documentele noastre, neconfirmat) | Paginile de confidențialitate nu s-au putut citi ❓ | ✉️ **e-mail** |
| **AI Horde** | prompt + imagine (img2img) | voluntari, distribuit 🟡 | **Un DPA cu voluntarii nu e realist** 🟡 | ⚖️ **decizie** (§4) |
| Supabase | e-mail, nume, proiecte, hash parole | proiect UE; importator: Supabase Pte. Ltd (Singapore) ✅ | Parte din Terms; SCC acceptate odată cu ele ✅ | fără e-mail; salvezi PDF |
| Stripe | e-mail, ID client, plată tokenizată | UE (Irlanda) + US 🟡 | Parte din Stripe Services Agreement 🟡 | fără e-mail; salvezi PDF |
| Resend | adresă + conținut e-mail | **US** ✅ | Parte din Terms; copie semnată în dashboard; DPF + SCC ✅ | fără e-mail; descarci copia |
| Anthropic | întrebări consultant | US 🟡 | DPA + SCC incluse în Commercial Terms 🟡 | fără e-mail; salvezi PDF |
| Cloudflare Workers AI | prompt + captură | global; DPF + SCC ✅ | Parte din Self-Serve Subscription Agreement ✅ | fără e-mail; salvezi PDF (v6.4) |
| Mapbox | — | US ✅ | PDF la mapbox.com/dpa ✅ | **nimic**: codul folosește Leaflet + OSM, nu Mapbox |

## 2. Rutele self-serve (de preferat, ~20 min, le face Costin)

1. **Sentry** — Organization Settings → **Legal & Compliance** → Data Processing Addendum → accept, versiunea curentă. Notează data și verifică regiunea UE. Surse: [ajutor Sentry](https://sentry.zendesk.com/hc/en-us/articles/23856572755611-How-do-I-sign-your-Data-Processing-Addendum) 🟡, [DPA](https://sentry.io/legal/dpa/), [documente legale](https://docs.sentry.io/security-legal-pii/security/terms/).
2. **OpenAI** — [pagina DPA](https://openai.com/policies/data-processing-addendum/) → „Execute Data Processing Agreement”, pe organizația care deține cheia de producție (bugetul notează că poate fi alt cont decât „Personal”: de verificat întâi).
3. **Resend** — dashboard → descarcă DPA-ul semnat ([DPA](https://resend.com/legal/dpa), [PDF](https://resend.com/static/documents/resend-dpa-signed.pdf)).
4. Salvează PDF-urile datate: [Supabase](https://supabase.com/legal/dpa) (v. 1 aug 2026) · [Stripe](https://stripe.com/legal/dpa) · [Anthropic](https://www.anthropic.com/legal/data-processing-addendum) ([când se aplică](https://support.claude.com/en/articles/7996862-i-am-a-commercial-customer-how-do-i-view-your-data-processing-addendum-dpa)) · [Cloudflare](https://www.cloudflare.com/cloudflare-customer-dpa/).

Anthropic și OpenAI: DPA-ul se aplică în termenii comerciali / de business. Verifică în consolă că organizația este pe ei, pe numele MCA.

## 3. Drafturi de e-mail (EN, furnizori străini)

Expeditor: privacy@modulca.eu (verifică întâi că adresa **primește** mesaje). Completează `[...]` doar în e-mail, nu în repo.

### 3.1 Vercel — către privacy@vercel.com ✅

**Subject**: DPA coverage for a Hobby plan account — EU controller (ModulCA)

> Hello,
>
> ATELIER DE PROIECTARE MCA S.R.L. (Romania, VAT RO35294600) operates modulca.eu on your platform, currently on the Hobby plan (team: [TEAM SLUG]).
>
> Your Data Processing Addendum states that it applies to Enterprise and Pro customers. Before we open an invite-only beta on 15 December 2026, we need to understand:
>
> 1. Is there any Article 28 GDPR agreement available for a Hobby account? If not, please confirm that upgrading to Pro puts the DPA into effect immediately.
> 2. Which transfer mechanism applies (EU-US Data Privacy Framework, SCCs)?
> 3. Where are function logs and analytics data stored when functions run in an EU region?
>
> Could you reply by 8 December 2026?
>
> Kind regards,
> [NAME], [ROLE] — privacy@modulca.eu

**Notă pentru Costin**: Hobby nu permite nici uz comercial (bugetul §1). Cea mai simplă rezolvare este **Pro înainte de 15 dec** (≈ €18,5/lună). Cu ChatGPT Plus (€20) păstrat, decembrie ar trece la ≈ €60–74, peste plafonul de €50; fără el, ≈ €40–54. Verifică prețul și, pe Hobby, setarea de folosire a datelor pentru antrenarea modelelor AI (anunț Vercel din martie 2026 🟡, [changelog](https://vercel.com/changelog/updates-to-terms-of-service-march-2026)). Sursa DPA: [vercel.com/legal/dpa](https://vercel.com/legal/dpa) (actualizat 17 mar 2026, în vigoare 31 mar 2026).

### 3.2 Stability AI — către privacy@stability.ai ✅

**Subject**: Data Processing Agreement for API use — EU controller (ModulCA)

> Hello,
>
> ATELIER DE PROIECTARE MCA S.R.L. (Romania, VAT RO35294600) uses the Stability AI API in modulca.eu to render images of house designs. We send a text prompt and a screenshot of a 3D model. We do not intentionally send names, email addresses or account identifiers.
>
> Please send us, or point us to:
>
> 1. Your Data Processing Agreement (GDPR Art. 28) for API customers, and how to execute it.
> 2. The transfer mechanism for EU data (DPF certification or SCCs, module).
> 3. Retention period for API inputs and outputs, and whether they are used for training.
> 4. Your sub-processor list.
>
> Could you reply by 8 December 2026?
>
> Kind regards,
> [NAME], [ROLE] — privacy@modulca.eu

Sursa: [politica de confidențialitate](https://stability.ai/privacy-policy) (30 sep 2026): servere în afara SEE, inclusiv US; SCC; nu menționează DPA.

### 3.3 Leonardo.ai — întâi citește [pagina DPA](https://www.leonardo.ai/data-processing-addendum); adresa de contact ❓ (ia-o de pe acea pagină)

**Subject**: Execution of your Data Processing Addendum — EU controller (ModulCA)

> Hello,
>
> ATELIER DE PROIECTARE MCA S.R.L. (Romania, VAT RO35294600) uses the Leonardo.Ai API in modulca.eu (text prompts and, in some cases, a screenshot of a 3D model).
>
> Please confirm:
>
> 1. Whether your published Data Processing Addendum applies automatically to our API account, or how we execute it.
> 2. The transfer mechanism for EU data (SCCs / other) and the processing locations.
> 3. Retention of inputs and outputs, and whether they are used for training.
>
> Could you reply by 8 December 2026?
>
> Kind regards,
> [NAME], [ROLE] — privacy@modulca.eu

Dacă pagina arată că se aplică automat prin Terms → salvezi PDF-ul și nu mai trimiți nimic.

### 3.4 Pollinations — adresa ❓ (de pe [pollinations.ai/privacy](https://pollinations.ai/privacy), deschisă în browser)

**Subject**: GDPR data processing terms for API use — ModulCA

> Hello,
>
> ATELIER DE PROIECTARE MCA S.R.L. (Romania, VAT RO35294600) uses the Pollinations API in modulca.eu to generate images from short text prompts about house designs.
>
> Could you tell us:
>
> 1. The legal entity and country operating the service.
> 2. Whether you offer a Data Processing Agreement (GDPR Art. 28).
> 3. Where prompts are processed and stored, for how long, and whether they are made public or used for training.
> 4. Your sub-processors.
>
> Could you reply by 8 December 2026?
>
> Kind regards,
> [NAME], [ROLE] — privacy@modulca.eu

## 4. AI Horde — decizie, nu e-mail

- Prompturile (și capturile img2img) ajung la calculatoarele unor voluntari; API-ul le anonimizează, dar un voluntar le poate vedea 🟡 ([FAQ](https://aihorde.net/faq), [politica](https://aihorde.net/privacy), conținut necitit direct).
- **Contradicție**: `SchremsII_Supplementary_Measures.md` §6 și draftul de Privacy Policy spun „dezactivat până la opt-in”, dar `engines/chains.ts` îl folosește ca ultimă rezervă în toate lanțurile.
- Variante: **(a)** dezactivat în producție până există opt-in (recomandat) · **(b)** opt-in explicit cu avertisment (cod, Chat 3) · **(c)** păstrat, declarat în Privacy Policy, cu aviz de jurist.

## 5. Ce am găsit pe lângă (de rezolvat înainte de beta, în afara acestei sesiuni)

1. Pagina publică `/privacy` **nu numește** Anthropic, OpenAI, Cloudflare, AI Horde, Leonardo sau Stability (căutare după nume în `privacy/page.tsx`). Draftul v2 și `DPA_Status.md` **nu au Anthropic** deloc. → Chat 2 (text legal).
2. Draftul v2 spune Resend „UE — Irlanda”; DPA-ul Resend spune că prelucrarea principală este în **US**.
3. Draftul v2 spune Pollinations „UE” (neconfirmat) și menționează un comutator „doar UE” pe care nu l-am găsit în cod (căutare sumară).
4. `chains.ts` listează și alte motoare (Gemini, Together, Hugging Face, Fireworks, Black Forest Labs, fal, Replicate, DeepInfra, WaveSpeed, Segmind, Runway); codul mai cheamă DeepSeek și Groq. Cele cu **cheie în producție** sunt procesatori: fie DPA, fie cheia scoasă. De inventariat în Vercel (Chat 3).
5. Neacoperite aici: Google Analytics 4, Microsoft Clarity, Google OAuth, GitHub, Plausible. De verificat care sunt active în producție.

## 6. Actualizări propuse în `DPA_Status.md` (după acțiuni; nu l-am modificat)

Rând nou Anthropic · Mapbox → ⚪ (nefolosit) · Resend regiune → US · Supabase/Stripe/Resend/Cloudflare/Anthropic → „DPA prin termeni, PDF arhivat [data]” · Sentry/OpenAI → „acceptat în dashboard [data]” · Vercel → 🔴 până la Pro sau răspuns scris.
