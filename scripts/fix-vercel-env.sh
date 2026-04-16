#!/bin/bash
# One-off script to fix Vercel production env vars that have trailing "\n" literal.
# For each affected var, re-set it with a clean value from .env.local (source of truth)
# or from .env.vercel-prod with the trailing \n stripped.

set -e

cd "$(dirname "$0")/.."

# List of vars to fix (omit already-fixed SENTRY_ORG and system-managed VERCEL_*)
AFFECTED=(
  ANTHROPIC_API_KEY
  BFL_API_KEY
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_API_TOKEN
  DEEPINFRA_API_KEY
  FAL_API_KEY
  FIREWORKS_API_KEY
  HUGGINGFACE_API_TOKEN
  LEONARDO_API_KEY
  MODULCA_ANTHROPIC_KEY
  NEXTAUTH_SECRET
  NEXT_PUBLIC_SENTRY_DSN
  NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_YEARLY
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  OPENAI_API_KEY
  PRODIA_API_KEY
  REPLICATE_API_TOKEN
  RESEND_FROM_EMAIL
  SEGMIND_API_KEY
  SENTRY_DSN
  SENTRY_PROJECT
)

# Helper: get clean value from .env.local, fallback to stripped .env.vercel-prod
get_value() {
  local var="$1"
  local val

  # Prefer .env.local
  val=$(grep "^${var}=" .env.local 2>/dev/null | head -1 | sed -E 's/^[A-Z_]+=//' | sed -E 's/^"(.*)"$/\1/')
  if [ -n "$val" ]; then
    printf "%s" "$val"
    return
  fi

  # Fallback: strip trailing \n literal from Vercel prod value
  val=$(grep "^${var}=" .env.vercel-prod 2>/dev/null | head -1 | sed -E 's/^[A-Z_]+=//' | sed -E 's/^"(.*)"$/\1/' | sed -E 's/\\n$//')
  printf "%s" "$val"
}

for VAR in "${AFFECTED[@]}"; do
  VALUE=$(get_value "$VAR")
  if [ -z "$VALUE" ]; then
    echo "⚠ Skipping $VAR (no value found)"
    continue
  fi

  echo "→ Fixing $VAR (${#VALUE} chars)"
  npx vercel env rm "$VAR" production --yes 2>&1 | tail -1
  printf "%s" "$VALUE" | npx vercel env add "$VAR" production 2>&1 | tail -1
done

echo ""
echo "✓ All done. Verifying with pull..."
npx vercel env pull .env.vercel-verify --environment=production --yes
echo ""
echo "Remaining vars with trailing \\n:"
grep -c '\\n"$' .env.vercel-verify || echo "0"
