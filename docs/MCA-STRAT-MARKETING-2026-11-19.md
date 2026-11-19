# MCA-STRAT-MARKETING-2026-11-19

**Status**: Draft v1 — NU include cod. Code scaffold va fi în Phase 4+ (ianuarie 2027).  
**Owner**: Costin Muraru  
**Scope**: Marketing, social media, sales, PR, content strategy pentru ModulCA 2.0  
**Phase sync**: Starts post public launch (1 feb 2027). Groundwork (handles, briefing) starts acum.  
**Related**: [[MCA-STRAT-2026-11-19-reboot]] · [[MCA-STRAT-AI-DELEGATION-2026-11-19]] · `docs/BUSINESS_STRATEGY.md`

---

## 1. Rule of Order — "Produs întâi, marketing după"

**Principle**: *Zero marketing înainte ca produsul să fie legal corect + verificat de un pilot real.*

De ce:
- CATUC content invalid = reputație distrusă instant la primul expert care îți citește blogul.
- Fără Cornetu case study → marketing message = vorbe goale pentru arhitecți.
- Fără arhitect semnatar (Vlad Ioniță) → nu putem face promisiuni de "avizare proiect".
- Buget limitat — orice euro pe ads înainte de product-market fit = waste.

**Timeline**:
```
Nov 2026 — Feb 2027  →  Zero marketing push. Doar groundwork invisible.
Feb 2027 (post-launch) →  Soft content phase — blog RO + 1-2 case studies.
Mar 2027+ →  Paid/organic push cu Cornetu case + arhitect testimonials.
```

---

## 2. Groundwork (NOW — azi până Feb 2027)

Lucruri gratuite care NU țin de cod, dar trebuie făcute acum ca să fim gata:

### A. Brand Protection (azi-mâine, ~1h user time)

| Task | Owner | Platform | Cost | Priority |
|---|---|---|---|---|
| Reserve @modulca_eu Instagram | User | Instagram | Free | P0 |
| Reserve @modulca_eu TikTok | User | TikTok | Free | P0 |
| Reserve Modulca linkedin.com/company page | User | LinkedIn | Free | P0 |
| Reserve @modulca_eu X/Twitter | User | X | Free | P1 |
| Reserve @modulca YouTube channel | User | YouTube | Free | P1 |
| Reserve ModulCA Facebook page | User | Facebook | Free | P1 |
| Reserve r/modulca subreddit | User | Reddit | Free | P2 |
| Reserve modulca Pinterest | User | Pinterest | Free | P2 (visual pentru case) |
| GitHub: @modulca org | User | GitHub | Free | P1 |
| Namecheap: audit domenii (modulca.eu, .ro, .com variations) | Claude + user | Namecheap | ~€95/yr dacă achiziționăm | P0 |

**Nota**: NU postăm nimic pe conturi până lansare. Doar "coming soon" / bio minimal.

### B. Tone & Brand Voice document (Dec 2026)

**Deliverable**: `docs/BRAND_VOICE.md` cu:
- Target personas (Arh. independent 30-50 ani, Dev 40-60, End-user DIY 30-45)
- Vocea mărcii: "Expert aproachable, nu arhitect-în-turn-de-fildeș"
- RO: tu/dumneavoastră? → Mix: tu în UI, dumneavoastră în email formal
- EN: casual direct, no jargon
- Taboo words (never use)
- Signature phrases ("Dă clic să-ți vezi modulul în 3D", "Casa ta în 3 ore de clicuri")

Scris de Claude + review Costin. 1 zi work.

### C. Press Kit skeleton (ian 2027)

**Deliverable**: `public/press-kit/` pe site + `docs/PRESS_KIT.md` cu:
- Logo variations (SVG, PNG light/dark, favicon)
- 1-paragraph pitch RO + EN
- 3-paragraph company overview RO + EN
- Founder bio (Costin — public version)
- 5 "fact sheets" (price range, CATUC compliance, module sizes, delivery time)
- 3 high-res Cornetu renders (pending Cornetu confirm)
- Contact: press@modulca.eu (needs setup — Resend-side email)

### D. Content Calendar skeleton (ian 2027)

**File**: `docs/CONTENT_CALENDAR.md` cu:
- Monthly pillar topic (jan=CATUC explained, feb=Cornetu story, mar=cost breakdown)
- Weekly post themes
- Platform mapping (LinkedIn=B2B arhitecți, Instagram=B2C visual, TikTok=viral quick wins, YouTube=long-form pentru DIY)

---

## 3. Channel Strategy — Who & How

### B2B — Arhitecți independenți RO (Primary audience)

**Why**: Ei sunt amplificatorii. Un arhitect = 10 clienți potențiali.

**Channel**: LinkedIn > Blog RO > Professional events (RUR, OAR meetings).

**Content**:
- Articole tehnice despre CATUC 169/2026 (unique selling point — arhitecții caută lămuriri)
- Case studies cu DfMA workflow
- Guest posts pe bloguri arhitecturale RO (RUR, MinervaUrban, UrbanIssue)
- LinkedIn posts 2x/săpt despre tool features

**KPI**: 50 arhitecți verificați creați cont Architect tier în primele 3 luni post-launch.

### B2C — End-users DIY (Secondary, dar scalable)

**Why**: Ei fac reach pe social. Cornetu-case-study = "my house in 60 days, €50k" = viral potential.

**Channel**: Instagram > TikTok > YouTube > Blog RO.

**Content**:
- Video case study Cornetu (TikTok 15-60s + YouTube long-form)
- Instagram reels process timelapse
- Blog posts "Casa mea modulară pas cu pas"
- Live Q&A monthly pe Instagram

**KPI**: 10k Instagram followers in 6 luni; 1k email leads prin lead-magnet.

### B3B2B — Investitori mici / Developeri 1-5 module (Tertiary)

**Why**: Volume play. 1 dev * 20 module/an = €200k revenue potential.

**Channel**: LinkedIn + direct outreach + startup events (Bucharest Tech Week, Startarium).

**Content**:
- ROI calculator (already în Step 14 pe modulca.eu — enhance)
- "Developer Starter Kit" ebook
- Case studies cu numbers

**KPI**: 3 developeri semnați pe Constructor tier în primele 6 luni.

---

## 4. Content Pipeline — Lean AI-assisted

Pentru buget mic, maximizăm output via AI.

```
Idea generation      →  Perplexity (trend scan RO) + Claude (strategic fit)
Blog draft RO        →  DeepSeek (first draft) + Claude (review + fact-check CATUC)
Translate EN         →  DeepSeek
SEO meta            →  ChatGPT or DeepSeek
Visuals (OG + reels) →  DALL-E 3 via OpenAI API (or Midjourney if we get budget)
Floor plan reels    →  Three.js renders + CapCut (user manual, 1h/video)
Social scheduling   →  Buffer free tier (3 channels) OR Later free
Analytics           →  Plausible free trial + GA4 free
```

**Rate**: 2 articole RO/săpt + 1 EN. 5 Instagram posts/săpt. 2 TikTok/săpt. Total ~5h/săpt user time dacă AI-assisted bine.

---

## 5. Automation Stack (Feb 2027 onwards)

### Phase 1 (€0 budget):
- **n8n** self-hosted (€0 on Oracle Cloud Free Tier VM) sau **make.com free** (1000 ops/mo)
- **Buffer free** — 3 social channels queued
- **Resend free** — 3k email/mo drip campaigns
- **Plausible** sau GA4 — analytics
- **CRM**: Google Sheets + simple Airtable (free 1000 records)

### Phase 2 (€30-50/mo budget future):
- Buffer Essentials €6/mo → 6 channels
- Resend Pro €20/mo → 50k emails
- Airtable Team €24/mo → better CRM
- Custom-built email funnel in app (code-side, nu SaaS)

### Automation workflows (to build Feb 2027):

1. **Lead capture → nurture email drip**:
   - User enters email at modulca.eu → Supabase `leads` table → Resend trigger "welcome + 7-day drip"
2. **Blog post → social cross-post**:
   - Publish article → n8n watches RSS → auto-formats → schedules on Buffer → Instagram/LinkedIn/X
3. **CATUC question → AI consultant → qualified lead**:
   - User asks NeufertAI → if 3+ questions → modal "want email update?" → email → lead
4. **Weekly digest to users**:
   - Cron → fetch new articles + new modules → Resend → bulk send
5. **Analytics digest to founder**:
   - Weekly cron → GA4 API + Plausible API + Supabase metrics → email cu numbers → Costin

---

## 6. PR & Partnership (Mar 2027+)

### Target publications RO
- Zeppelin.ro (architecture)
- UrbanIssue.ro
- Arh.OAR newsletter
- Startup.ro / Startupcafe.ro
- Mediafax Real Estate
- Wall-Street Immo

### Target publications EN (phase 3)
- ArchDaily (modular segment)
- Dezeen
- Fast Company / Dwell (long shot)

### Partnership ideas (free / barter)
- OAR București — tool demo pentru membri (barter: tool access gratuit)
- RUR (Registrul Urbaniștilor) — webinar CATUC (barter: logo exposure)
- Universități Arhitectură (București, Cluj, Timișoara) — student plan gratuit (seeding next gen)
- Module producers (TBD user discussion) — co-marketing landing page

---

## 7. Launch Playbook — Feb 1, 2027

**Day -14**: Press kit live pe modulca.eu/press. Email 15 journalists (embargoed).  
**Day -7**: Final Cornetu case study published. LinkedIn teaser.  
**Day -3**: Email all beta users "we're going live Mon 1 Feb".  
**Day -1**: Final technical checks (A1-A7 re-run).  
**Day 0 (Feb 1)**: Launch posts on all channels, press release, Costin's personal LinkedIn push.  
**Day +1 to +7**: Daily content push, respond to comments, monitor press.  
**Day +14**: Metrics review → iterate.

---

## 8. Metrics & Success Gates

### Pre-launch gates (must-have Feb 1)
- [ ] 500 Instagram followers (organic groundwork Dec 2026-Jan 2027)
- [ ] 100 email leads collected
- [ ] 10 arhitecți beta-signed cu testimonial
- [ ] Cornetu case study live cu fotos+timeline+cost
- [ ] Press kit live cu 3 high-res visuals
- [ ] 3 interviews booked cu publications RO

### Month 1 post-launch
- 1000 signups
- 50 paid subscribers (any tier)
- 5 contracts initiated

### Month 6 post-launch
- 10k signups
- 500 paid subscribers
- 20 contracts signed
- Break-even on monthly OpEx

---

## 9. Budget Allocation — Marketing €0-€100 Scenarios

### €0 budget (default this year)
- Organic content only (DeepSeek-assisted, Claude-reviewed)
- Buffer free tier
- GA4 + Plausible free
- Resend free
- **Only cost**: user time (~5h/week)

### €30/month marketing
- Buffer Essentials €6 → 6 channels
- Boosted LinkedIn post 1x/month €20
- DALL-E API ~€4 (visuals for ~20 posts)

### €100/month marketing  
- Add: Instagram sponsored posts €40
- Add: Google Ads RO keywords (CATUC, "casa modulară") €30/mo starter
- Add: Reddit RO-targeted ads €20

**Recommendation**: Start €0 Feb 2027. Scale to €30 if organic traction solid at month 2. €100 only after revenue covers it.

---

## 10. Proofs — "Cum verificăm că funcționează"

User a cerut explicit: "sa pregatim si probele si tot ce e nevoie ca sa vedem ca functioneaza."

### Proof pipeline

| Stage | Proof artifact | Validator |
|---|---|---|
| Groundwork done | Screenshots: 8 reserved handles | User |
| Brand voice ready | `docs/BRAND_VOICE.md` committed | Claude + user review |
| Content calendar | `docs/CONTENT_CALENDAR.md` with 3-month plan | Claude |
| Press kit live | `https://modulca.eu/press` URL works + visuals downloadable | External browse test |
| Email capture works | Test lead end-to-end Supabase→Resend | Playwright test + manual |
| Automation flow (n8n) | Test run of blog→social → verify 1 post landed | Manual check |
| Case study accurate | Cornetu numbers checked vs real invoices | User |
| Launch day no-bugs | Monitoring dashboard clean | Sentry + GA4 |
| KPI tracking | Google Sheet "ModulCA Metrics 2027" auto-populated weekly | Automation |

### Specific tests to prepare (Phase 4 — Jan 2027)

**Test 1**: Lead capture flow
- Playwright E2E: fill form → Supabase row → Resend welcome email received
- Expected: <3s roundtrip

**Test 2**: Social cross-post
- n8n trigger: publish blog post RO → verify Instagram + LinkedIn both got auto-post
- Expected: 2min delay max

**Test 3**: NeufertAI → lead conversion
- E2E: user asks 3 questions → modal appears → email captured → tagged as "AI-engaged" in CRM
- Expected: modal appears after exactly 3rd question

**Test 4**: Press kit downloadable
- Playwright: visit /press → click each asset → downloads work → file sizes >100KB each

**Test 5**: Analytics event tracking
- Click "subscribe" → verify GA4 + Plausible both logged event
- Browser DevTools network check

---

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Competitor copies our CATUC content advantage | High | Move fast; patent-able? Probably not but trademark ModulCA |
| Cornetu plot falls through | High | Have 2 backup pilots in mind (even virtual demo) |
| Arhitect semnatar unavailable at launch | Critical | Legal contract with Vlad Ioniță + 1 backup signatar pre-launch |
| No budget for paid ads | Medium | Pure organic Feb-Apr; revisit after month 3 |
| Social algorithm changes mid-launch | Low | Diversify channels; own-channel (email) priority |
| AI-generated content flagged as low-quality by Google | Medium | Always human-edited; add E-E-A-T (Expert + Experience) via Costin's architecture bio |

---

## 12. Open Questions

- [ ] Instagram handle: @modulca_eu, @modulca.eu, or @modulcadesign? → User decides based on availability.
- [ ] YouTube: launch with Costin's face on-camera or just screen captures? → Face = trust, but requires video setup.
- [ ] Should we buy Google Ads "casa modulară" keyword immediately on launch day? → Budget-dependent.
- [ ] Email domain: hello@modulca.eu or costin@modulca.eu or press@modulca.eu — all three? → Setup Resend aliases.
- [ ] Cornetu case study permission: does owner (Costin?) consent to publishing exact financials? → User confirms.

---

## 13. Dependencies Blocking Marketing Launch

Marketing nu poate porni până:
- [ ] CATUC content 100% corect în prod (blocker #1)
- [ ] Vlad Ioniță semnat formal ca arhitect semnatar (blocker #2 — legal)
- [ ] Cornetu plot status confirmat (pilot case) (blocker #3 — pilot)
- [ ] Beta închis funcționează 2 săpt fără bugs critice (blocker #4 — trust)
- [ ] Press kit cu 3 visuals de calitate (blocker #5 — content)
- [ ] Press kit disponibil online (blocker #6 — availability)

---

## 14. Review cadence

Monthly review:
- 1st Monday: Metrics review + content calendar adjustment
- 15th: Budget check + new channel experiments
- End of month: Retrospective in `docs/sessions/active/YYYY-Www-marketing.md`

---

*Marketing-ul la ModulCA = amplificator pentru produs, nu substitut. Dacă produsul nu e solid, marketing-ul doar accelerează descoperirea problemelor.*
