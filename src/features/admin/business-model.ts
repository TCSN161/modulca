/**
 * ModulCA Business Model — Revenue projections, cost modeling, resilience flags.
 * Used by admin dashboard and investor presentations.
 * All prices in EUR unless noted.
 */

/* ─── Tier Pricing ─── */
export const TIER_PRICING = {
  free:        { monthly: 0,      yearly: 0 },
  premium:     { monthly: 19.99,  yearly: 290 },
  architect:   { monthly: 49.99,  yearly: 790 },
  constructor: { monthly: 149.90, yearly: 1490 },
} as const;

/* ─── Churn Rates (monthly) ─── */
export const CHURN_RATES = {
  premium: 0.05,
  architect: 0.03,
  constructor: 0.02,
} as const;

/* ─── Yearly Plan Adoption Rate ─── */
export const YEARLY_ADOPTION = 0.30;

/* ─── AI Cost per Render (blended average EUR) ─── */
export const AI_RENDER_COST = 0.003;

/* ─── Infrastructure Cost Tiers ─── */
export const INFRA_COSTS: { maxUsers: number; monthlyCost: number }[] = [
  { maxUsers: 1000,  monthlyCost: 1 },
  { maxUsers: 5000,  monthlyCost: 295 },
  { maxUsers: 15000, monthlyCost: 600 },
  { maxUsers: 25000, monthlyCost: 1135 },
  { maxUsers: 50000, monthlyCost: 2500 },
];

/* ─── Revenue Projection ─── */

export interface MonthProjection {
  month: number;                // months since launch (0-based)
  freeUsers: number;
  premiumUsers: number;
  architectUsers: number;
  constructorUsers: number;
  mrr: number;                  // monthly recurring revenue
  aiCost: number;               // estimated AI render costs
  infraCost: number;            // infrastructure costs
  grossProfit: number;
  grossMargin: number;          // percentage
}

export interface ProjectionParams {
  months: number;               // how many months to project
  initialFreeUsers: number;
  freeGrowthRate: number;       // monthly growth rate (e.g., 0.25 = 25%)
  freeToPremuimRate: number;    // conversion from free to premium
  premiumToArchitectRate: number;
  architectToConstructorRate: number;
  rendersPerUserPerMonth: number;
}

const DEFAULT_PARAMS: ProjectionParams = {
  months: 24,
  initialFreeUsers: 100,
  freeGrowthRate: 0.25,          // 25% monthly growth
  freeToPremuimRate: 0.04,       // 4% of free users convert to premium
  premiumToArchitectRate: 0.08,  // 8% of premium users upgrade to architect
  architectToConstructorRate: 0.05, // 5% of architects upgrade to constructor
  rendersPerUserPerMonth: 5,
};

function getInfraCost(totalUsers: number): number {
  for (const tier of INFRA_COSTS) {
    if (totalUsers <= tier.maxUsers) return tier.monthlyCost;
  }
  return INFRA_COSTS[INFRA_COSTS.length - 1].monthlyCost;
}

export function projectRevenue(params: Partial<ProjectionParams> = {}): MonthProjection[] {
  const p = { ...DEFAULT_PARAMS, ...params };
  const projections: MonthProjection[] = [];

  let free = p.initialFreeUsers;
  let premium = 0;
  let architect = 0;
  let constructor = 0;

  for (let m = 0; m < p.months; m++) {
    // Growth
    free = Math.round(free * (1 + p.freeGrowthRate));

    // Conversions (cumulative)
    const newPremium = Math.round(free * p.freeToPremuimRate);
    const newArchitect = Math.round(premium * p.premiumToArchitectRate);
    const newConstructor = Math.round(architect * p.architectToConstructorRate);

    premium = Math.round(premium * (1 - CHURN_RATES.premium) + newPremium);
    architect = Math.round(architect * (1 - CHURN_RATES.architect) + newArchitect);
    constructor = Math.round(constructor * (1 - CHURN_RATES.constructor) + newConstructor);

    // Revenue — blend monthly and yearly pricing
    const monthlyShare = 1 - YEARLY_ADOPTION;
    const yearlyMonthly = (portion: number, yearly: number) => (portion * yearly) / 12;

    const mrr =
      premium * (monthlyShare * TIER_PRICING.premium.monthly + yearlyMonthly(YEARLY_ADOPTION, TIER_PRICING.premium.yearly)) +
      architect * (monthlyShare * TIER_PRICING.architect.monthly + yearlyMonthly(YEARLY_ADOPTION, TIER_PRICING.architect.yearly)) +
      constructor * (monthlyShare * TIER_PRICING.constructor.monthly + yearlyMonthly(YEARLY_ADOPTION, TIER_PRICING.constructor.yearly));

    // Costs
    const totalUsers = free + premium + architect + constructor;
    const paidUsers = premium + architect + constructor;
    const totalRenders = paidUsers * p.rendersPerUserPerMonth + free * 2; // free users get fewer
    const aiCost = totalRenders * AI_RENDER_COST;
    const infraCost = getInfraCost(totalUsers);
    const grossProfit = mrr - aiCost - infraCost;
    const grossMargin = mrr > 0 ? (grossProfit / mrr) * 100 : 0;

    projections.push({
      month: m,
      freeUsers: free,
      premiumUsers: premium,
      architectUsers: architect,
      constructorUsers: constructor,
      mrr: Math.round(mrr * 100) / 100,
      aiCost: Math.round(aiCost * 100) / 100,
      infraCost,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: Math.round(grossMargin * 10) / 10,
    });
  }

  return projections;
}

/* ─── Five-Flag Resilience System ─── */

export type FlagStatus = "active" | "planned" | "not-started";

export interface ResilienceFlag {
  id: string;
  label: string;
  description: string;
  status: FlagStatus;
  jurisdiction: string;
  details: string[];
}

export const RESILIENCE_FLAGS: ResilienceFlag[] = [
  {
    id: "company",
    label: "Company Domicile",
    description: "Legal entity registration",
    status: "planned",
    jurisdiction: "Estonia (e-Residency) / Romania SRL",
    details: [
      "Estonia: 0% tax on reinvested profits",
      "Romania SRL: 16% flat tax, simpler setup",
      "EU-compliant from Day 1 (GDPR, eIDAS)",
    ],
  },
  {
    id: "banking",
    label: "Banking & Payments",
    description: "Multi-jurisdiction financial infrastructure",
    status: "active",
    jurisdiction: "Stripe (IE), Wise, Revolut",
    details: [
      "Stripe: Payment processing (test mode active)",
      "Wise Business: Multi-currency (EUR/RON/USD)",
      "Revolut Business: Instant FX, EU IBAN",
      "No single-bank dependency",
    ],
  },
  {
    id: "infrastructure",
    label: "Technical Infrastructure",
    description: "Distributed hosting and AI providers",
    status: "active",
    jurisdiction: "US + EU (Vercel, Supabase, Cloudflare)",
    details: [
      "12+ AI providers across US/EU/global",
      "Automatic fallback between providers",
      "Supabase: EU region available for GDPR",
      "Cloudflare: Global CDN + DDoS protection",
    ],
  },
  {
    id: "markets",
    label: "Market Presence",
    description: "Multi-country revenue diversification",
    status: "active",
    jurisdiction: "RO → NL → ES, IT → DE, PL",
    details: [
      "Phase 1: Romania (home market, H2 2026)",
      "Phase 2: Netherlands (modular-friendly, H2 2026)",
      "Phase 3: Spain, Italy (2027)",
      "Phase 4: Germany, Poland (2027-28)",
      "Knowledge Library: already multi-country",
    ],
  },
  {
    id: "personal",
    label: "Personal Residence",
    description: "Founder location flexibility",
    status: "active",
    jurisdiction: "Romania (EU citizenship)",
    details: [
      "EU freedom of movement",
      "Low cost of living during bootstrap phase",
      "Options: Portugal NHR, Estonia, Netherlands",
    ],
  },
];

/* ─── Summary Helpers ─── */

export function getYearEndProjection(year: 1 | 2 | 3 = 1): MonthProjection {
  const projections = projectRevenue({ months: year * 12 });
  return projections[projections.length - 1];
}

export function getARR(year: 1 | 2 | 3 = 1): number {
  return getYearEndProjection(year).mrr * 12;
}

export function getBreakEvenMonth(): number {
  const projections = projectRevenue({ months: 36 });
  const idx = projections.findIndex((p) => p.grossProfit > 500); // meaningful profit
  return idx >= 0 ? idx : -1;
}
