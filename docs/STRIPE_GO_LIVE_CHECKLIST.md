# Stripe Go-Live Checklist — ModulCA

**All data pre-filled below. When bank verification completes, this is a
15-minute click-through.**

---

## 📋 Business Data (ready to paste)

### Company info
```
Legal name:          ATELIER DE PROIECTARE MCA S.R.L.
Country:             Romania
Business type:       Limited liability company (SRL)
Registration #:      J40/14760/2015
Tax ID (CUI):        35294600
EUID:                ROANRC.J40/14760/2015
Founded:             2015-12-04
Industry:            Professional services → Architecture / Design software
```

### Registered address
```
Street:              Str. Lacul Plopului nr. 10
City:                București
State/Province:      Sector 5
Postal code:         051735
Country:             Romania
```

### VAT status
```
VAT-registered:      NO
VAT number:          —
Tax exempt note:     "Neplătitor TVA conform art. 310 Cod Fiscal"
```
⚠️ In Stripe Tax Settings → Romania → "Not registered for VAT".
Stripe will **not collect VAT** on your behalf. Prices are final.

### Bank account (RON payouts)
```
Account holder:      ATELIER DE PROIECTARE MCA S.R.L.
Bank name:           UniCredit Bank S.A.
IBAN:                RO02BACX0000004111280000
SWIFT/BIC:           BACXROBU
Currency:            RON
```

### Representative (person signing up)
```
First name:          PETRIA
Last name:           MURARU
Role:                Administrator / Legal Representative
Ownership:           > 25% (required Stripe disclosure)
Date of birth:       [user to fill]
Address:             [personal address — Stripe KYC]
Phone:               [0723-599-5___ — user to confirm full number]
Email:               petria@modulca.eu (once email routing is set up)
                      OR costin.telefon@gmail.com (fallback)
```

### Support info (customer-facing)
```
Support email:       support@modulca.eu  (or contact@modulca.eu)
Support phone:       [optional — your call]
Public website:      https://www.modulca.eu
Product description: "AI-powered modular home design platform. Subscription
                      SaaS with 4 tiers: Explorer (free), Premium (€19.99/mo),
                      Architect (€49.99/mo), Constructor (€149.90/mo).
                      Users design modular homes in 3D, get AI renders,
                      technical drawings, cost estimates, and export
                      deliverables for construction partners."
```

### Statement descriptor (shown on customer bank statement)
```
Full descriptor:     MODULCA*SUBSCRIPTION
Short (≤10 chars):   MODULCA
```

---

## 🎯 Step-by-step go-live sequence

### 1. Activate live mode in Stripe (2 min)
1. https://dashboard.stripe.com/ → top-left, flip **Test / Live** switch
2. Stripe will ask: "Activate payments on this account"
3. Fill the form with data above
4. Upload identity verification docs (CI + selfie for representative)

### 2. Get live API keys (1 min)
1. Developers → API keys
2. Copy **Publishable key** (`pk_live_...`)
3. Click "Reveal live secret key" → copy (`sk_live_...`)

### 3. Update Vercel environment variables (3 min)
Open Vercel dashboard → modulca project → Settings → Environment Variables → Production:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  = pk_live_...
STRIPE_SECRET_KEY                   = sk_live_...
NEXT_PUBLIC_STRIPE_MODE             = live
```
Click **Save**. Don't redeploy yet — we need the webhook secret first.

### 4. Create live webhook endpoint (3 min)
1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://www.modulca.eu/api/stripe/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Click **Create endpoint**
5. On endpoint detail page → **Signing secret** → Reveal → copy (`whsec_...`)

### 5. Add webhook secret to Vercel (1 min)
```
STRIPE_WEBHOOK_SECRET = whsec_...
```

### 6. Create live prices (2 min)
Stripe Dashboard → Products → clone from test:
- **Premium**:    €19.99 / month / EUR (recurring)
- **Architect**:  €49.99 / month / EUR (recurring)
- **Constructor**: €149.90 / month / EUR (recurring)

Copy each Price ID (format `price_xxxxx`) and add to Vercel:
```
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_LIVE     = price_...
NEXT_PUBLIC_STRIPE_PRICE_ARCHITECT_LIVE   = price_...
NEXT_PUBLIC_STRIPE_PRICE_CONSTRUCTOR_LIVE = price_...
```

### 7. Redeploy (1 min)
Vercel → Deployments → most recent → **Redeploy** (uses the new env vars).

### 8. Smoke test (3 min)
Hit https://www.modulca.eu/pricing → click **Premium** → should redirect to
Stripe Checkout in LIVE mode (not test). Use a REAL card with €0.50 test or
a family member's to verify full cycle. You can refund immediately.

### 9. Verify webhook received (1 min)
Stripe Dashboard → Webhooks → endpoint → **Events** tab — should show the
`checkout.session.completed` event. Log on production should show
`[stripe webhook] Received: checkout.session.completed`.

### 10. Run production ops check (1 min)
```bash
curl https://www.modulca.eu/api/health | jq
```
Should return `"stripe": "live"` with no warnings.

---

## 🚨 Post go-live critical items

- [ ] **VAT threshold monitor**: set up monthly email alert when
      `stripeRevenueYTD > 200,000 RON` (see `src/shared/lib/vatThresholdMonitor.ts`)
- [ ] **Customer portal**: test `/api/stripe/portal` returns a valid live URL
- [ ] **Receipts**: Stripe Customer email settings → enable emailing receipts
- [ ] **Recovery emails**: Dashboard → Settings → Email customers about
      failed payments = ON
- [ ] **Fraud prevention**: Radar → default rules are fine; review monthly
- [ ] **Terms of Service URL**: Dashboard → Settings → Business →
      "Terms of Service" = `https://www.modulca.eu/terms`
- [ ] **Privacy Policy URL**: = `https://www.modulca.eu/privacy`
- [ ] **Support URL**: = `https://www.modulca.eu/contact` (or email)

---

## 🔒 Safety checklist

- [ ] **Keys never committed**: `sk_live_*` and `whsec_*` only in Vercel env, never in git
- [ ] **Test mode still works**: keep test keys in `.env.local` for local dev
- [ ] **Failed payments handling**: `src/app/api/stripe/webhook/route.ts` logs + retries
- [ ] **Refund policy documented**: in Terms of Service
- [ ] **Dispute handling**: Stripe Radar auto-responds with order details
- [ ] **GDPR subject access**: Privacy Policy lists `petria@modulca.eu` as DPO

---

## ⚠️ Romania-specific legal requirements

### On every invoice Stripe generates
Must include per Romanian law (OMFP 2634/2015):
- Company name: ATELIER DE PROIECTARE MCA S.R.L. ✓ (Stripe auto)
- CUI: 35294600 ✓ (Stripe field)
- J40/14760/2015 ✓ (Stripe field)
- Sediul social ✓ (Stripe field)
- "Neplătitor TVA" mention ← **manual in Stripe → Settings → Invoicing → Footer**
- IBAN (RO02BACX...) ← **manual in Stripe → Settings → Invoicing → Footer**

Recommended invoice footer (paste into Stripe):
```
ATELIER DE PROIECTARE MCA S.R.L. — CUI 35294600 — J40/14760/2015
Sediu: Str. Lacul Plopului nr. 10, Sector 5, București, 051735
Cont: RO02BACX0000004111280000 • UniCredit Bank S.A.
Neplătitor TVA conform art. 310 din Codul Fiscal
```

### Refund period
Romania mandates 14-day cooling-off for consumers (OUG 34/2014). Already in ToS.

### Invoice numbering
Stripe auto-numbers (`ORD-2026-001...`). Must be consecutive — don't delete
invoices in Stripe. For archived bookkeeping, export monthly to PDF.

---

## 📊 Time estimate from banking confirmation → fully live

| Step | Duration |
|---|---|
| 1-9 (go-live sequence) | 15 min |
| First live transaction test | 3 min |
| Invoice footer + VAT settings | 5 min |
| Tests + health check | 5 min |
| **TOTAL** | **~30 min** |

When your bank confirms, message me "bank OK" and we can do this
together — I'll watch for any errors in your logs while you click.
