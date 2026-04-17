# Email Setup Guide — @modulca.eu

**Goal:** Get `contact@modulca.eu`, `hello@modulca.eu`, `petria@modulca.eu` etc.
forwarding to your Gmail within 15 minutes, **for free**.

---

## Option 1 (RECOMMENDED): Cloudflare Email Routing — FREE

**Requires:** domain DNS pointed to Cloudflare (many registrars already use CF).

### Step-by-step

1. Go to **https://dash.cloudflare.com/** and log in
2. Select the domain **modulca.eu**
3. In left sidebar, click **Email** → **Email Routing**
4. Click **Enable Email Routing**
5. Cloudflare will auto-add 3 MX records and 1 TXT (SPF) record to DNS — accept them
6. Go to **Routing Rules** tab
7. Add these **custom addresses**:
   - `contact@modulca.eu` → forwards to `costin.telefon@gmail.com`
   - `hello@modulca.eu` → forwards to `costin.telefon@gmail.com`
   - `petria@modulca.eu` → forwards to `costin.telefon@gmail.com`
   - `billing@modulca.eu` → forwards to `costin.telefon@gmail.com`
   - `support@modulca.eu` → forwards to `costin.telefon@gmail.com`
   - `noreply@modulca.eu` → (do NOT forward, used for sending only)
8. Optional: enable **catch-all** so every `*@modulca.eu` goes to your Gmail
9. Verify your Gmail receives a "Verify this email" message from Cloudflare — click the link

**Done.** ~10 minutes total.

### Sending FROM these addresses

Resend is already configured to send FROM `@modulca.eu` (domain verified). The
transactional emails (welcome, notifications) already use it.

For **manual replies** from `contact@modulca.eu` via your Gmail:
1. In Gmail → Settings → Accounts → **Add another email address**
2. Email: `contact@modulca.eu`, Name: `ModulCA Support`
3. SMTP: Cloudflare doesn't offer SMTP for sending — instead use
   **Gmail's built-in send-as** with `smtp.resend.com` (port 587, STARTTLS,
   username `resend`, password = your RESEND_API_KEY)
4. Verify via code sent to the address
5. Now you can compose new emails "From: contact@modulca.eu"

---

## Option 2: Zoho Mail — FREE (5 custom mailboxes, web UI)

**Pros:** Real IMAP/SMTP/webmail (not just forwarding). Good if you want a
separate inbox for business mail.

**Cons:** More setup (DNS changes, mailbox migration if you switch later).

1. Go to **https://www.zoho.com/mail/zohomail-pricing.html**
2. Choose **Forever Free** plan (5 users, 5GB each, custom domain)
3. Sign up with your Gmail, domain = `modulca.eu`
4. Follow DNS verification (MX records)
5. Create `contact@modulca.eu`, `petria@modulca.eu`, etc.
6. Login at `mail.zoho.com` with these addresses

---

## Option 3: Google Workspace — Paid (~€6/user/month)

**Pros:** Best experience, Gmail UI, Meet, Drive, Calendar under your domain.

**Cons:** Pay per user. Worth it for a serious business.

1. https://workspace.google.com/ → Start free trial
2. Follow the setup wizard (DNS verification + user creation)

---

## Recommendation for MVP launch

**Cloudflare Email Routing** (Option 1). Zero cost, 10 minutes, forwards
everything to your existing Gmail. You can always upgrade to Zoho/Workspace
later without losing any mail.

---

## What I'll wire up once emails are working

1. Update `src/shared/config/company.ts` → `contact.email = "contact@modulca.eu"`
2. Update Resend FROM address to `hello@modulca.eu` (already registered as ModulCA)
3. Email templates already use ModulCA branding — no change needed
4. Contact form on website → sends to `contact@modulca.eu`
5. Footer: "Contact: contact@modulca.eu"
6. Privacy Policy: "Data controller contact: petria@modulca.eu" (DPO)
7. Terms of Service: "Legal inquiries: petria@modulca.eu"
8. Invoice footer: "billing@modulca.eu"

## Testing after setup

Once Cloudflare routing is active, run:

```bash
# Resend can confirm delivery (I did this at 12:08 today):
curl -X POST https://www.modulca.eu/api/email/send \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","to":"contact@modulca.eu","displayName":"Test"}'
```

You should see the welcome email in your Gmail via Cloudflare forwarding.
