import { Resend } from "resend";

/**
 * ModulCA Email Service — powered by Resend.
 *
 * Free tier: 100 emails/day, 3000/month.
 * Set RESEND_API_KEY in .env.local to activate.
 *
 * Until a custom domain is verified in Resend, emails are sent
 * from "onboarding@resend.dev". After domain verification,
 * switch FROM_EMAIL to "noreply@modulca.eu".
 */

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not configured");
    resend = new Resend(key);
  }
  return resend;
}

// Switch to "noreply@modulca.eu" after verifying domain in Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ModulCA <onboarding@resend.dev>";

export const isEmailConfigured = !!process.env.RESEND_API_KEY;

/* ── Public API ── */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  if (!isEmailConfigured) {
    console.log("[Email] Not configured, skipping:", opts.subject, "→", opts.to);
    return { success: false, reason: "not_configured" };
  }

  try {
    const r = getResend();
    const { data, error } = await r.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.error("[Email] Send error:", error);
      return { success: false, reason: error.message };
    }

    console.log("[Email] Sent:", opts.subject, "→", opts.to, "id:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Exception:", err);
    return { success: false, reason: String(err) };
  }
}

/* ── Convenience Functions ── */

import {
  welcomeEmailHtml,
  upgradeEmailHtml,
  paymentFailedEmailHtml,
  subscriptionCancelledEmailHtml,
  passwordResetConfirmHtml,
} from "./email-templates";

/** Welcome email after signup */
export async function sendWelcomeEmail(to: string, displayName?: string) {
  return sendEmail({
    to,
    subject: "Welcome to ModulCA — Let's Build Something Amazing",
    html: welcomeEmailHtml(displayName),
  });
}

/** Upgrade confirmation */
export async function sendUpgradeEmail(to: string, tier: string, displayName?: string) {
  return sendEmail({
    to,
    subject: `ModulCA — Your ${tier === "architect" ? "Architect" : "Premium"} Plan is Active`,
    html: upgradeEmailHtml(tier, displayName),
  });
}

/** Payment failed warning */
export async function sendPaymentFailedEmail(to: string, displayName?: string) {
  return sendEmail({
    to,
    subject: "ModulCA — Payment Issue with Your Subscription",
    html: paymentFailedEmailHtml(displayName),
  });
}

/** Subscription cancelled confirmation */
export async function sendSubscriptionCancelledEmail(to: string, displayName?: string) {
  return sendEmail({
    to,
    subject: "ModulCA — Your Subscription Has Been Cancelled",
    html: subscriptionCancelledEmailHtml(displayName),
  });
}

/** Password reset confirmation */
export async function sendPasswordResetConfirmEmail(to: string) {
  return sendEmail({
    to,
    subject: "ModulCA — Your Password Has Been Updated",
    html: passwordResetConfirmHtml(),
  });
}
