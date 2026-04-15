# ModulCA — Business Strategy & Revenue Model

> Last updated: April 2026 | Pre-Beta Phase
> Target: Beta Launch May 1, 2026

---

## 1. Revenue Streams

### 1.1 SaaS Subscriptions (Primary)

| Tier | Monthly | Yearly | Target Segment |
|------|---------|--------|----------------|
| **Explorer** (Free) | €0 | €0 | Lead gen, beta users, hobbyists |
| **Premium** | €19.99 | €290 | Homeowners designing their home |
| **Architect** | €49.99 | €790 | Architects, designers, small firms |
| **Constructor** | €149.90 | €1,490 | Construction companies, developers |

**Beta Promotion**: Free users get Premium access for 3 months (until ~July 2026).

### 1.2 Marketplace Commission (Future)
- Land listings: 2-3% commission on matched transactions
- Builder directory: Featured placement fees (€49-199/mo)
- Material partner referrals: 1-5% affiliate revenue

### 1.3 AI Usage (Pay-per-use future option)
- Render credits beyond quota: €0.10-0.50 per render
- Premium consultant sessions: €2-5 per deep analysis
- Batch rendering for professionals: volume pricing

### 1.4 White-Label Licensing (Constructor tier)
- Remove ModulCA branding for client-facing presentations
- Custom domain support for construction firms
- API access for integration with existing workflows

---

## 2. Revenue Projections

### Assumptions
- Beta launch: May 2026 (Romania focus)
- Geographic expansion: NL, ES, IT by end 2026
- Organic growth + targeted marketing
- Annual churn: 5% monthly for Premium, 3% for Architect, 2% for Constructor
- Yearly plan adoption: 30% (saves ~2 months)

### Year 1 (May 2026 - April 2027)

| Quarter | Free Users | Premium | Architect | Constructor | MRR |
|---------|-----------|---------|-----------|-------------|-----|
| Q1 (Beta) | 500 | 20 | 5 | 1 | €700 |
| Q2 | 1,500 | 80 | 15 | 3 | €2,500 |
| Q3 | 3,000 | 200 | 40 | 8 | €6,000 |
| Q4 | 5,000 | 400 | 80 | 15 | €12,400 |

**Year 1 ARR (exit)**: ~€149,000

### Year 2 (May 2027 - April 2028)

| Quarter | Free Users | Premium | Architect | Constructor | MRR |
|---------|-----------|---------|-----------|-------------|-----|
| Q1 | 8,000 | 700 | 150 | 25 | €25,300 |
| Q2 | 12,000 | 1,200 | 250 | 40 | €43,400 |
| Q3 | 18,000 | 1,800 | 400 | 60 | €67,000 |
| Q4 | 25,000 | 2,500 | 600 | 90 | €96,400 |

**Year 2 ARR (exit)**: ~€1,157,000

### Year 3 Target: €3M+ ARR (5 countries, marketplace revenue added)

---

## 3. Cost Structure

### 3.1 Infrastructure (Monthly)

| Service | Current (Beta) | At 5K Users | At 25K Users |
|---------|---------------|-------------|--------------|
| Supabase (DB + Auth) | €0 (free tier) | €25 | €75 |
| Vercel (Hosting) | €0 (free tier) | €20 | €40 |
| AI Renders | €0 (free tiers) | €200 | €800 |
| AI Consultant (Groq/OpenAI/Anthropic) | €0 (free) | €50 | €200 |
| Resend (Email) | €0 (free tier) | €0 | €20 |
| Domain + SSL | €15/yr | €15/yr | €15/yr |
| **Total Infra** | **~€1/mo** | **~€295/mo** | **~€1,135/mo** |

### 3.2 AI Render Cost per Image

| Provider | Cost/Image | Status |
|----------|-----------|--------|
| Cloudflare AI | Free (10K/day) | Active |
| Hugging Face | Free (rate limited) | Active |
| fal.ai | €0.003 | Active |
| Together AI | €0.004 | Active |
| Stability AI | €0.006 | Active (25 credits) |
| Fireworks AI | €0.0014 | Active |
| DeepInfra | €0.003 | Active |

**Blended average**: ~€0.003/render (using free tiers first, paid as fallback)

### 3.3 Gross Margin Analysis

At 5,000 users (end Year 1):
- **Monthly Revenue**: €12,400
- **Infrastructure**: €295
- **AI Costs**: €450 (est. 150K renders/mo)
- **Gross Margin**: €11,655 (**94%**)

At 25,000 users (end Year 2):
- **Monthly Revenue**: €96,400
- **Infrastructure**: €1,135
- **AI Costs**: €2,400
- **Gross Margin**: €92,865 (**96%**)

---

## 4. Five-Flag Resilience System

ModulCA is designed to operate as a location-independent, resilient digital business across multiple jurisdictions.

### Flag 1: Company Domicile — Estonia (e-Residency)
- **Why**: 0% corporate tax on reinvested profits, EU-compliant, digital-first
- **Cost**: €100 e-Residency + €200/yr registered agent
- **Status**: Planned for post-revenue phase
- **Alternative**: Romania SRL (16% flat tax, simpler for initial phase)

### Flag 2: Banking — Multi-jurisdiction
- **Primary**: Wise Business (multi-currency, EUR/RON/USD)
- **Secondary**: Revolut Business (instant FX, EU IBAN)
- **Stripe**: Payment processing (already integrated, test mode live)
- **Why**: No single-bank dependency, instant cross-border transfers

### Flag 3: Infrastructure — Distributed
- **Hosting**: Vercel (US-based, EU edge nodes)
- **Database**: Supabase (EU region available)
- **AI Providers**: 12+ providers across US, EU, global
- **DNS/CDN**: Cloudflare (global, DDoS protection)
- **Why**: No single provider can take the platform down

### Flag 4: Market Presence — Multi-country
- **Phase 1** (2026): Romania (RO) — home market, regulatory knowledge
- **Phase 2** (2026-27): Netherlands (NL) — strong modular market, high purchasing power
- **Phase 3** (2027): Spain (ES), Italy (IT) — growing modular demand
- **Phase 4** (2027-28): Germany (DE), Poland (PL) — largest EU construction markets
- **Knowledge Library**: Already structured for multi-country regulations
- **Why**: Revenue diversification, no single-market dependency

### Flag 5: Personal Residence — Flexible
- **Current**: Romania (EU citizenship, low cost of living)
- **Options**: Portugal (NHR tax regime), Estonia (digital nomad), Netherlands (client proximity)
- **Why**: Tax optimization, quality of life, EU freedom of movement

### Resilience Benefits
1. **Regulatory**: EU-compliant from Day 1 (GDPR, eIDAS)
2. **Financial**: Multi-currency, multi-bank, no single-point-of-failure
3. **Technical**: 12+ AI providers, no vendor lock-in, open-source stack
4. **Market**: Multi-country expansion reduces single-market risk
5. **Legal**: Estonian e-Residency provides EU company with minimal bureaucracy

---

## 5. Competitive Moat

### 5.1 Technical Moat
- **13-step integrated flow**: No competitor offers land → design → render → technical → marketplace in one platform
- **Multi-engine AI rendering**: 12+ render providers, automatic fallback and quality optimization
- **Country-specific knowledge base**: Regulations, materials, builders per country
- **Real-time cost estimation**: Live material pricing from local suppliers

### 5.2 Network Effects
- **Marketplace**: More users → more land listings → more builders → more value for everyone
- **Knowledge Library**: User contributions + professional validation create growing content moat
- **Community**: Forum/feedback loop drives feature development

### 5.3 Switching Costs
- **Design data**: Users invest hours configuring their home — designs are portable only via ModulCA export
- **AI render history**: Accumulated renders, styles, moodboards are platform-locked
- **Builder relationships**: Marketplace connections and quote history

---

## 6. Go-To-Market Strategy

### Phase 1: Romania Beta (May-July 2026)
- **Target**: Homeowners considering modular construction
- **Channels**: Facebook groups (case modulare), YouTube tutorials, SEO
- **Pricing**: Free with Premium beta promo (3 months)
- **Goal**: 500 registered users, 20 Premium conversions, NPS > 40

### Phase 2: Paid Launch (Aug-Dec 2026)
- **Target**: Romanian + Dutch markets
- **Channels**: Google Ads, Instagram/Pinterest (visual platform), architect partnerships
- **Content**: Blog posts, comparison guides, real project showcases
- **Goal**: 5,000 users, €12K MRR

### Phase 3: EU Expansion (2027)
- **Target**: Spain, Italy, Germany, Poland
- **Channels**: Localized content, construction expo partnerships, B2B architect outreach
- **Goal**: 25,000 users, €96K MRR

---

## 7. Key Metrics to Track

| Metric | Target (Beta) | Target (Y1 End) | Target (Y2 End) |
|--------|--------------|-----------------|-----------------|
| Registered Users | 500 | 5,000 | 25,000 |
| Free→Premium Conversion | 4% | 8% | 10% |
| Monthly Churn (Premium) | - | 5% | 4% |
| AI Renders/User/Month | 3 | 8 | 12 |
| Avg. Session Duration | 5 min | 15 min | 20 min |
| NPS Score | 30 | 45 | 55 |
| MRR | €700 | €12,400 | €96,400 |
| Gross Margin | 90% | 94% | 96% |

---

## 8. Funding Strategy

### Current: Bootstrapped
- Infrastructure: €0-50/mo (free tiers)
- Development: Founder + AI-assisted development
- Runway: Indefinite at current burn rate

### Seed Round (When MRR > €5K)
- **Ask**: €150-300K
- **Use**: Marketing (60%), additional AI credits (20%), legal/accounting (10%), hiring first dev (10%)
- **Valuation**: 15-20x ARR

### Series A (When ARR > €500K)
- **Ask**: €1-2M
- **Use**: Team (5-8 people), EU expansion, marketplace development
- **Valuation**: 10-15x ARR

---

*This document is a living strategy — updated quarterly with actual metrics vs. projections.*
