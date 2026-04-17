/**
 * Engine Billing Registry
 *
 * Single source of truth for commercial status of every AI render engine.
 * Drives the /admin/engines credit panel and the cost-conscious fallback
 * routing decisions.
 *
 * Philosophy:
 *   - Free engines FIRST. We don't burn money unless it directly converts
 *     to revenue (Architect / Constructor tier usage).
 *   - Paid engines only as backup or premium quality differentiator.
 *   - Track renewal cadence + top-up cost so we know when to budget.
 *
 * Update cadence: review monthly, or when a provider changes pricing.
 * Last reviewed: 2026-04-17
 */

export type BillingModel =
  | "free-forever"        // permanent $0 (no signup needed or unlimited forever)
  | "free-quota"           // $0 up to a quota that renews (daily/monthly/lifetime)
  | "free-trial"           // $0 credits that expire (one-time)
  | "pay-per-image"        // pay as you go, no commitment
  | "subscription"         // monthly/yearly flat fee
  | "credit-top-up";       // prepaid credit buckets

export type RenewalCadence =
  | "none"                 // never renews (free-forever or trial expired)
  | "daily"                // resets every 24h
  | "monthly"              // resets on calendar/signup date
  | "yearly"
  | "on-top-up";           // manual — user buys more when depleted

export interface BillingEntry {
  /** Matches the engine id in /api/ai-render/engines */
  id: string;
  /** Display name on the admin panel */
  label: string;
  /** Model */
  billingModel: BillingModel;
  renewalCadence: RenewalCadence;
  /** Human-readable current free allowance */
  freeQuotaLabel: string;
  /** Hard quota number if countable (e.g., 500/day) — null = unlimited */
  freeQuotaAmount: number | null;
  freeQuotaPeriod: "day" | "month" | "lifetime" | null;
  /**
   * When the free allowance ends or resets.
   * ISO date for fixed expiry (e.g. trial), or null for auto-renewing.
   */
  freeExpiresAt: string | null;
  /** Per-image cost after free quota */
  pricePerImageUsd: number;
  /** Minimum top-up to extend quota (0 if pay-as-you-go) */
  minTopUpUsd: number;
  /** Approximate images obtained per min-top-up */
  imagesPerTopUp: number | null;
  /** Short URL to billing page for manual renewal */
  billingUrl: string;
  /**
   * Strategic priority for our business:
   *   - "hero" — promote, counts toward monetization. Use freely.
   *   - "backup" — only if hero fails. Costs $0 or negligible.
   *   - "premium-only" — use only when the user's tier has paid for it
   *     (Architect / Constructor). Revenue covers the cost.
   *   - "do-not-use" — deprecated or net-negative margin. Kept for audit.
   */
  role: "hero" | "backup" | "premium-only" | "do-not-use";
  /**
   * Our real-world usage notes — keep it factual.
   */
  notes?: string;
}

/**
 * Ordered roughly by how we WANT to use them, not alphabetically.
 */
export const BILLING_REGISTRY: BillingEntry[] = [
  /* ═══════════ HERO tier — free, unlimited or very generous ═══════════ */
  {
    id: "cloudflare",
    label: "Cloudflare Workers AI",
    billingModel: "free-quota",
    renewalCadence: "daily",
    freeQuotaLabel: "10,000 neurons/day (forever)",
    freeQuotaAmount: 10_000,
    freeQuotaPeriod: "day",
    freeExpiresAt: null,
    pricePerImageUsd: 0.00011,
    minTopUpUsd: 0,
    imagesPerTopUp: null,
    billingUrl: "https://dash.cloudflare.com/",
    role: "hero",
    notes: "Fastest free engine (3s). Auto-resets every UTC midnight. Primary free tier workhorse.",
  },
  {
    id: "pollinations",
    label: "Pollinations AI",
    billingModel: "free-forever",
    renewalCadence: "none",
    freeQuotaLabel: "Unlimited forever",
    freeQuotaAmount: null,
    freeQuotaPeriod: null,
    freeExpiresAt: null,
    pricePerImageUsd: 0,
    minTopUpUsd: 0,
    imagesPerTopUp: null,
    billingUrl: "https://pollinations.ai/",
    role: "hero",
    notes: "No auth, truly unlimited. Lower image quality but reliable fallback.",
  },
  {
    id: "ai-horde",
    label: "AI Horde",
    billingModel: "free-forever",
    renewalCadence: "none",
    freeQuotaLabel: "Unlimited (community GPUs)",
    freeQuotaAmount: null,
    freeQuotaPeriod: null,
    freeExpiresAt: null,
    pricePerImageUsd: 0,
    minTopUpUsd: 0,
    imagesPerTopUp: null,
    billingUrl: "https://stablehorde.net/",
    role: "hero",
    notes: "Volunteer-run, slow but unlimited. Anonymous key 0000000000 works.",
  },
  {
    id: "gemini",
    label: "Google Gemini Flash Image",
    billingModel: "free-quota",
    renewalCadence: "daily",
    freeQuotaLabel: "~1,500 req/day (free tier)",
    freeQuotaAmount: 1500,
    freeQuotaPeriod: "day",
    freeExpiresAt: null,
    pricePerImageUsd: 0.0025,
    minTopUpUsd: 0,
    imagesPerTopUp: null,
    billingUrl: "https://aistudio.google.com/app/apikey",
    role: "hero",
    notes: "Google quality, 'Nano Banana'. Free tier resets daily UTC. Imagen 3 requires paid tier — we do not use it.",
  },
  {
    id: "huggingface",
    label: "Hugging Face Inference",
    billingModel: "free-quota",
    renewalCadence: "monthly",
    freeQuotaLabel: "Free credits monthly",
    freeQuotaAmount: null,
    freeQuotaPeriod: "month",
    freeExpiresAt: null,
    pricePerImageUsd: 0.001,
    minTopUpUsd: 9,
    imagesPerTopUp: 9000,
    billingUrl: "https://huggingface.co/settings/billing",
    role: "hero",
    notes: "Open-source SDXL/FLUX. $9/mo Pro plan gives richer quota if needed.",
  },
  {
    id: "together",
    label: "Together.ai (FLUX Schnell)",
    billingModel: "free-trial",
    renewalCadence: "none",
    freeQuotaLabel: "Free unlimited FLUX Schnell (limited-time)",
    freeQuotaAmount: null,
    freeQuotaPeriod: null,
    freeExpiresAt: "2026-07-01",
    pricePerImageUsd: 0.00003,
    minTopUpUsd: 25,
    imagesPerTopUp: 830_000,
    billingUrl: "https://api.together.xyz/billing",
    role: "hero",
    notes: "FLUX Schnell free endpoint — promo ends ~July 2026. Fall back to Cloudflare when gone.",
  },

  /* ═══════════ BACKUP tier — free now, paid at depletion ═══════════ */
  {
    id: "fal",
    label: "fal.ai",
    billingModel: "free-trial",
    renewalCadence: "none",
    freeQuotaLabel: "~$5 free credits (one-time)",
    freeQuotaAmount: 5,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.003,
    minTopUpUsd: 5,
    imagesPerTopUp: 1600,
    billingUrl: "https://fal.ai/dashboard/billing",
    role: "backup",
    notes: "Great for img2img (FLUX Kontext). Use only when hero engines fail.",
  },
  {
    id: "fireworks",
    label: "Fireworks AI",
    billingModel: "free-trial",
    renewalCadence: "none",
    freeQuotaLabel: "~$1 free credits (one-time)",
    freeQuotaAmount: 1,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.0014,
    minTopUpUsd: 5,
    imagesPerTopUp: 3570,
    billingUrl: "https://fireworks.ai/account/billing",
    role: "backup",
    notes: "EU representative + SOC 2. Good GDPR option for paid tier fallback.",
  },
  {
    id: "replicate",
    label: "Replicate",
    billingModel: "pay-per-image",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "Small monthly free allowance",
    freeQuotaAmount: null,
    freeQuotaPeriod: "month",
    freeExpiresAt: null,
    pricePerImageUsd: 0.003,
    minTopUpUsd: 10,
    imagesPerTopUp: 3300,
    billingUrl: "https://replicate.com/account/billing",
    role: "backup",
    notes: "Huge model catalog + ControlNet. Keep for specialist fallback only.",
  },
  {
    id: "novita",
    label: "NovitaAI",
    billingModel: "free-trial",
    renewalCadence: "none",
    freeQuotaLabel: "$0.50 trial (one-time)",
    freeQuotaAmount: 0.5,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.0015,
    minTopUpUsd: 5,
    imagesPerTopUp: 3300,
    billingUrl: "https://novita.ai/dashboard",
    role: "backup",
    notes: "No API key yet — placeholder. Activate only if we exceed free quotas on hero engines.",
  },
  {
    id: "wavespeed",
    label: "WaveSpeed (Seedream)",
    billingModel: "free-trial",
    renewalCadence: "none",
    freeQuotaLabel: "Free signup credits (one-time)",
    freeQuotaAmount: null,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.003,
    minTopUpUsd: 10,
    imagesPerTopUp: 3300,
    billingUrl: "https://wavespeed.ai/",
    role: "backup",
    notes: "China-based — Seedream img2img. Gated by allowChinaProviders flag. Key placeholder.",
  },

  /* ═══════════ PREMIUM-ONLY tier — cost only covered by user revenue ═══ */
  {
    id: "openai",
    label: "OpenAI GPT Image",
    billingModel: "pay-per-image",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "$5 credits for 3 months (one-time)",
    freeQuotaAmount: 5,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.02,
    minTopUpUsd: 5,
    imagesPerTopUp: 250,
    billingUrl: "https://platform.openai.com/account/billing/overview",
    role: "premium-only",
    notes: "Fastest premium (2s) + flagship quality. Architect tier +.",
  },
  {
    id: "stability",
    label: "Stability AI",
    billingModel: "credit-top-up",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "25 free credits (one-time)",
    freeQuotaAmount: 25,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.065,
    minTopUpUsd: 10,
    imagesPerTopUp: 150,
    billingUrl: "https://platform.stability.ai/account/credits",
    role: "premium-only",
    notes: "Best img2img with 3D base. Expensive per image — Architect tier exclusive.",
  },
  {
    id: "leonardo",
    label: "Leonardo.ai",
    billingModel: "subscription",
    renewalCadence: "monthly",
    freeQuotaLabel: "150 tokens/day (free plan)",
    freeQuotaAmount: 150,
    freeQuotaPeriod: "day",
    freeExpiresAt: null,
    pricePerImageUsd: 0.03,
    minTopUpUsd: 10,
    imagesPerTopUp: 330,
    billingUrl: "https://app.leonardo.ai/subscribe",
    role: "premium-only",
    notes: "Photorealistic alchemy. Free plan tokens decent for demos.",
  },
  {
    id: "blackforest",
    label: "Black Forest Labs (FLUX)",
    billingModel: "credit-top-up",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "Credit-based (varies)",
    freeQuotaAmount: null,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.003,
    minTopUpUsd: 10,
    imagesPerTopUp: 3300,
    billingUrl: "https://api.bfl.ml/auth/login",
    role: "premium-only",
    notes: "Original FLUX authors (German, EU/GDPR). FLUX Pro $0.04, Schnell $0.003.",
  },
  {
    id: "runway",
    label: "Runway Gen-3",
    billingModel: "subscription",
    renewalCadence: "monthly",
    freeQuotaLabel: "125 credits/month (Standard plan)",
    freeQuotaAmount: 125,
    freeQuotaPeriod: "month",
    freeExpiresAt: null,
    pricePerImageUsd: 0.02,
    minTopUpUsd: 15,
    imagesPerTopUp: 750,
    billingUrl: "https://app.runwayml.com/settings/plans",
    role: "premium-only",
    notes: "Video-native. Use only for cinematic Architect renders. Key placeholder.",
  },
  {
    id: "deepinfra",
    label: "DeepInfra",
    billingModel: "pay-per-image",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "DeepStart program (up to 1B tokens)",
    freeQuotaAmount: null,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.015,
    minTopUpUsd: 5,
    imagesPerTopUp: 333,
    billingUrl: "https://deepinfra.com/dash/billing",
    role: "premium-only",
    notes: "FLUX 2 Pro inference. Architect tier when blackforest depleted.",
  },
  {
    id: "segmind",
    label: "Segmind",
    billingModel: "credit-top-up",
    renewalCadence: "on-top-up",
    freeQuotaLabel: "Free signup credits",
    freeQuotaAmount: null,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.005,
    minTopUpUsd: 10,
    imagesPerTopUp: 2000,
    billingUrl: "https://www.segmind.com/billing",
    role: "premium-only",
    notes: "Cheapest upscaling ($0.005). Used for 4K architect exports, not primary text2img.",
  },

  /* ═══════════ DO-NOT-USE — avoid due to bad performance / margin ═════ */
  {
    id: "prodia",
    label: "Prodia",
    billingModel: "free-quota",
    renewalCadence: "monthly",
    freeQuotaLabel: "1,000 free calls",
    freeQuotaAmount: 1000,
    freeQuotaPeriod: "lifetime",
    freeExpiresAt: null,
    pricePerImageUsd: 0.002,
    minTopUpUsd: 5,
    imagesPerTopUp: 2500,
    billingUrl: "https://app.prodia.com/",
    role: "do-not-use",
    notes: "Live test showed 113s latency — worst of all engines. Kept registered, but removed from active fallback chains.",
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────── */

export function getBilling(engineId: string): BillingEntry | undefined {
  return BILLING_REGISTRY.find((b) => b.id === engineId);
}

/** Is the current allowance still usable at zero cost? */
export function isEngineCurrentlyFree(entry: BillingEntry): boolean {
  if (entry.billingModel === "free-forever") return true;
  if (entry.freeExpiresAt) {
    return new Date(entry.freeExpiresAt).getTime() > Date.now();
  }
  // free-quota / free-trial / subscription — we assume some quota remains
  // unless the budget tracker says otherwise (checked at runtime).
  return entry.billingModel !== "pay-per-image" && entry.billingModel !== "credit-top-up";
}

/** Color for the role chip on the admin UI */
export function roleColor(role: BillingEntry["role"]): { bg: string; fg: string; label: string } {
  switch (role) {
    case "hero":
      return { bg: "#14532d", fg: "#86efac", label: "HERO · Free" };
    case "backup":
      return { bg: "#1e3a8a", fg: "#93c5fd", label: "Backup" };
    case "premium-only":
      return { bg: "#78350f", fg: "#fcd34d", label: "Premium only" };
    case "do-not-use":
      return { bg: "#7f1d1d", fg: "#fca5a5", label: "Do not use" };
  }
}

/**
 * Next renewal date for display.
 * Daily = tomorrow UTC; monthly = 1st of next month; etc.
 */
export function nextRenewalIso(cadence: RenewalCadence, now = new Date()): string | null {
  const d = new Date(now);
  switch (cadence) {
    case "daily": {
      d.setUTCDate(d.getUTCDate() + 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "monthly": {
      d.setUTCMonth(d.getUTCMonth() + 1, 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "yearly": {
      d.setUTCFullYear(d.getUTCFullYear() + 1, 0, 1);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "on-top-up":
    case "none":
      return null;
  }
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return "—";
  const target = new Date(iso).getTime();
  const diff = target - Date.now();
  const days = Math.round(diff / 86_400_000);
  if (days < 0) return `expired ${-days}d ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days}d`;
  const months = Math.round(days / 30);
  return `in ${months}mo`;
}
