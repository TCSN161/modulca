# ModulCA — API & AI Service Map

## Service Architecture (with Backup Strategy)

### 1. AI Image Generation (Step 7-8: Render)

| Priority | Service         | Type      | Cost        | Backup For    |
|----------|----------------|-----------|-------------|---------------|
| 1st      | Together.ai    | Text2Img  | Free 3 months | -           |
| 2nd      | Stability AI   | Img2Img   | 25 free credits | Together  |
| 3rd      | AI Horde       | Text2Img  | Free (community) | Stability |
| 4th      | Leonardo.ai    | Text2Img  | $5 credits  | AI Horde      |
| 5th      | Pollinations   | Text2Img  | Free (no key) | Leonardo   |

**Fallback chain**: Together -> AI Horde -> Leonardo -> Pollinations
**Img2img chain**: Stability -> Together -> AI Horde -> Pollinations

### 2. AI Text/Chat (Consultant)

| Priority | Service      | Model             | Cost           |
|----------|-------------|-------------------|----------------|
| 1st      | Together.ai | Llama-3-70b       | Free 3 months  |
| Backup   | Anthropic   | Claude (future)   | API credits     |
| Backup   | OpenAI      | GPT-4o (future)   | API credits     |

### 3. Maps & Geocoding (Step 1-2: Land)

| Service         | Purpose           | Cost  | Backup            |
|----------------|-------------------|-------|-------------------|
| OpenStreetMap   | Street map tiles  | Free  | Esri              |
| Esri ArcGIS    | Satellite imagery | Free  | Google (future)   |
| Nominatim      | Address geocoding | Free  | Mapbox (future)   |
| Stamen Design  | Label overlay     | Free  | CartoDB           |

### 4. Database & Auth

| Service    | Purpose        | Cost        | Backup          |
|-----------|---------------|-------------|-----------------|
| Supabase  | DB + Auth     | Free tier   | localStorage    |
| NextAuth  | Session mgmt  | Free        | -               |
| Prisma    | ORM           | Free        | -               |

### 5. Payments (Pricing page)

| Service | Purpose    | Cost          | Backup        |
|---------|-----------|---------------|---------------|
| Stripe  | Payments  | % per txn     | Paddle (future) |

### 6. Static Resources

| Resource   | Purpose           | Cost  |
|-----------|-------------------|-------|
| Unsplash  | Stock photos      | Free  |
| Google Fonts | Manrope + Inter | Free  |

## Environment Variables Required

```
# Required for core features
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=

# AI Rendering (at least one needed)
TOGETHER_API_KEY=       # Primary (free)
STABILITY_API_KEY=      # Img2img (25 credits)
LEONARDO_API_KEY=       # Optional backup

# Payments (optional for demo)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Modular Backup Principles

1. **Every external service has a fallback** — no single point of failure
2. **AI rendering has 5 providers** — if one fails, the next in chain handles it
3. **Maps use free open-source tiles** — no vendor lock-in
4. **Database falls back to localStorage** — works offline in demo mode
5. **Provider swap is config-only** — change env var, no code changes needed
