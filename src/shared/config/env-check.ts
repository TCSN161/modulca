/**
 * Runtime environment variable validation.
 * Call once at app startup to surface missing config early.
 *
 * Three categories:
 *   REQUIRED — app won't function (Supabase, Stripe)
 *   RECOMMENDED — degraded experience (Resend, Sentry)
 *   OPTIONAL — nice-to-have (analytics, extra AI engines)
 */

interface EnvVar {
  key: string;
  label: string;
  required: boolean;
  /** true = server-only, not exposed to client */
  serverOnly?: boolean;
}

const ENV_VARS: EnvVar[] = [
  // ── Required: Core infrastructure ──
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase project URL", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase anon key", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service role (webhooks)", required: true, serverOnly: true },

  // ── Required: Billing ──
  { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", required: true, serverOnly: true },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe webhook secret", required: true, serverOnly: true },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Stripe publishable key", required: true },

  // ── Recommended: Transactional email ──
  { key: "RESEND_API_KEY", label: "Resend email API key", required: false, serverOnly: true },

  // ── Recommended: Error monitoring ──
  { key: "NEXT_PUBLIC_SENTRY_DSN", label: "Sentry DSN", required: false },

  // ── Optional: AI rendering engines ──
  { key: "POLLINATIONS_API_KEY", label: "Pollinations (free AI renders)", required: false, serverOnly: true },
  { key: "HUGGINGFACE_API_KEY", label: "Hugging Face inference", required: false, serverOnly: true },
  { key: "OPENAI_API_KEY", label: "OpenAI DALL-E", required: false, serverOnly: true },
];

export interface EnvCheckResult {
  ok: boolean;
  missing: { key: string; label: string; critical: boolean }[];
  warnings: string[];
}

/**
 * Validate environment variables at server startup.
 * Returns a structured result; caller decides whether to throw or warn.
 */
export function checkEnv(): EnvCheckResult {
  const missing: EnvCheckResult["missing"] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    const value = process.env[v.key];
    if (!value || value.trim() === "") {
      missing.push({ key: v.key, label: v.label, critical: v.required });
    }
  }

  // Check for common misconfigurations
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supaUrl && !supaUrl.startsWith("https://")) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL should start with https://");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey?.startsWith("sk_test_")) {
    warnings.push("Stripe is in TEST mode (sk_test_*). Switch to live keys for production.");
  }

  const resendFrom = process.env.RESEND_FROM_EMAIL;
  if (!resendFrom || resendFrom.includes("resend.dev")) {
    warnings.push("Email sender is onboarding@resend.dev. Verify custom domain for production.");
  }

  const criticalMissing = missing.filter((m) => m.critical);
  return {
    ok: criticalMissing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Log environment check results. Call from instrumentation.ts or server startup.
 */
export function logEnvCheck(): void {
  const result = checkEnv();

  if (result.ok && result.missing.length === 0 && result.warnings.length === 0) {
    console.log("[EnvCheck] All environment variables configured.");
    return;
  }

  const criticalMissing = result.missing.filter((m) => m.critical);
  const optionalMissing = result.missing.filter((m) => !m.critical);

  if (criticalMissing.length > 0) {
    console.error(`[EnvCheck] ${criticalMissing.length} REQUIRED env vars missing:`);
    for (const m of criticalMissing) {
      console.error(`  - ${m.key}: ${m.label}`);
    }
  }

  if (optionalMissing.length > 0) {
    console.warn(`[EnvCheck] ${optionalMissing.length} optional env vars not set:`);
    for (const m of optionalMissing) {
      console.warn(`  - ${m.key}: ${m.label}`);
    }
  }

  for (const w of result.warnings) {
    console.warn(`[EnvCheck] ${w}`);
  }
}
