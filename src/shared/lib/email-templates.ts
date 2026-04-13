/**
 * ModulCA Transactional Email Templates
 *
 * Clean, branded HTML emails. All inline styles for maximum
 * email client compatibility (Gmail, Outlook, Apple Mail).
 *
 * Brand colors:
 *   Teal-800: #115e59
 *   Amber-500: #f59e0b
 *   Gray-50: #f9fafb
 */

const BRAND_TEAL = "#115e59";
const BRAND_AMBER = "#f59e0b";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.modulca.eu";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND_TEAL};padding:24px 32px;">
            <span style="font-size:22px;font-weight:bold;color:#ffffff;">Modul</span><span style="font-size:22px;font-weight:bold;color:${BRAND_AMBER};">CA</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <a href="${APP_URL}" style="color:${BRAND_TEAL};text-decoration:none;">modulca.eu</a>
              &nbsp;&middot;&nbsp; Modular Construction Platform
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
              &copy; ${new Date().getFullYear()} ModulCA. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_TEAL};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;margin:16px 0;">${text}</a>`;
}

/* ── Templates ── */

export function welcomeEmailHtml(displayName?: string): string {
  const name = displayName || "there";
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Welcome to ModulCA!</h2>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Hi ${name}, thanks for joining ModulCA — the platform that makes modular construction simple and accessible.
    </p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      You're all set with <strong>Premium access</strong> during our beta period. Here's what you can do:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      <li>Configure your land parcel and terrain</li>
      <li>Build modular layouts with drag & drop</li>
      <li>Generate AI renders of your design</li>
      <li>Export technical drawings and cost estimates</li>
    </ul>
    ${button("Go to Dashboard", `${APP_URL}/dashboard`)}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Questions? Reply to this email or visit our knowledge base.
    </p>
  `);
}

export function upgradeEmailHtml(tier: string, displayName?: string): string {
  const name = displayName || "there";
  const tierLabel = tier === "architect" ? "Architect" : "Premium";
  const features = tier === "architect"
    ? ["Up to 50 modules with custom sizes", "100 AI renders/month (4K)", "DWG/DXF export for CAD", "Team collaboration + client dashboard", "Priority support"]
    : ["Up to 12 modules per project", "30 AI renders/month (HD)", "All 6 drawing types + PDF export", "Product catalog with real pricing", "Email support"];

  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Your ${tierLabel} Plan is Active!</h2>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Hi ${name}, your upgrade to <strong>${tierLabel}</strong> is confirmed. Here's what's now unlocked:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      ${features.map(f => `<li>${f}</li>`).join("\n      ")}
    </ul>
    ${button("Explore Your New Features", `${APP_URL}/dashboard`)}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Manage your subscription anytime from your <a href="${APP_URL}/pricing" style="color:${BRAND_TEAL};">account settings</a>.
    </p>
  `);
}

export function paymentFailedEmailHtml(displayName?: string): string {
  const name = displayName || "there";
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#dc2626;">Payment Issue</h2>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Hi ${name}, we couldn't process your latest subscription payment. This can happen if your card expired or was declined.
    </p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Please update your payment method to keep your plan active. If we can't collect payment within 7 days, your account will be downgraded to the free plan.
    </p>
    ${button("Update Payment Method", `${APP_URL}/pricing`)}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Need help? Reply to this email and we'll assist you.
    </p>
  `);
}

export function subscriptionCancelledEmailHtml(displayName?: string): string {
  const name = displayName || "there";
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Subscription Cancelled</h2>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Hi ${name}, your ModulCA subscription has been cancelled. Your account has been moved to the free Explorer plan.
    </p>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      You'll still have access to your projects, but some features will be limited. You can upgrade again anytime.
    </p>
    ${button("View Plans", `${APP_URL}/pricing`)}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      We'd love to know why you left. Reply to this email with any feedback — it helps us improve.
    </p>
  `);
}

export function passwordResetConfirmHtml(): string {
  return layout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Password Updated</h2>
    <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
      Your ModulCA password has been successfully updated. You can now log in with your new password.
    </p>
    ${button("Go to Login", `${APP_URL}/login`)}
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      If you didn't make this change, please reset your password immediately or contact us.
    </p>
  `);
}
