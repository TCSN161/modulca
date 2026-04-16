/**
 * Business Email Templates — Quote requests, consultations, project notifications.
 * Extends the core templates in shared/lib/email-templates.ts
 *
 * Brand: Teal #115e59, Amber #f59e0b
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
        <tr><td style="background:${BRAND_TEAL};padding:24px 32px;">
          <span style="font-size:22px;font-weight:bold;color:#ffffff;">Modul</span><span style="font-size:22px;font-weight:bold;color:${BRAND_AMBER};">CA</span>
        </td></tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            <a href="${APP_URL}" style="color:${BRAND_TEAL};text-decoration:none;">modulca.eu</a>
            &nbsp;&middot;&nbsp; Modular Construction Platform
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">&copy; ${new Date().getFullYear()} ModulCA. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_TEAL};color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;margin:16px 0;">${text}</a>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${label}</td><td style="padding:6px 0;font-size:13px;color:#111827;font-weight:500;text-align:right;border-bottom:1px solid #f3f4f6;">${value}</td></tr>`;
}

/* ── Template: Project Saved ── */

export function projectSavedEmail(userName: string, projectName: string): { subject: string; html: string; text: string } {
  return {
    subject: `Project "${projectName}" saved — ModulCA`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Project Saved!</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Hi ${userName}, your project <strong>"${projectName}"</strong> has been saved to the cloud.
        You can access it from any device at any time.
      </p>
      ${button("Open Project", `${APP_URL}/dashboard`)}
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
        Your design data is securely stored and synced across devices.
      </p>
    `),
    text: `Hi ${userName}, your project "${projectName}" has been saved. Open it at ${APP_URL}/dashboard`,
  };
}

/* ── Template: Quote Request (sent to ModulCA team) ── */

export interface QuoteRequestData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  modules: number;
  area: number;
  estimate: number;
  style?: string;
}

export function quoteRequestEmail(data: QuoteRequestData): { subject: string; html: string; text: string } {
  return {
    subject: `New Quote Request — ${data.name} (${data.modules} modules, ${data.area}m²)`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">New Quote Request</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        A user has requested a detailed quote for their modular home project.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        ${row("Name", data.name)}
        ${row("Email", data.email)}
        ${data.phone ? row("Phone", data.phone) : ""}
        ${row("Modules", `${data.modules} units`)}
        ${row("Total Area", `${data.area} m²`)}
        ${row("Estimated Cost", `€${Math.round(data.estimate).toLocaleString()}`)}
        ${data.style ? row("Design Style", data.style) : ""}
      </table>
      ${data.message ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 16px;"><p style="margin:0;font-size:13px;color:#6b7280;font-weight:600;">Message:</p><p style="margin:8px 0 0;font-size:14px;color:#374151;line-height:1.6;">${data.message}</p></div>` : ""}
      <p style="margin:0;font-size:12px;color:#9ca3af;">Reply directly to this email to contact the user.</p>
    `),
    text: `New quote request from ${data.name} (${data.email}). ${data.modules} modules, ${data.area}m², ~€${Math.round(data.estimate)}. ${data.message || ""}`,
  };
}

/* ── Template: Consultation Request (sent to ModulCA team) ── */

export interface ConsultationRequestData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  modules?: number;
  area?: number;
}

export function consultationRequestEmail(data: ConsultationRequestData): { subject: string; html: string; text: string } {
  return {
    subject: `Consultation Request — ${data.name}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_TEAL};">Consultation Booking</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        A user wants to schedule a consultation with a ModulCA architect.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        ${row("Name", data.name)}
        ${row("Email", data.email)}
        ${data.phone ? row("Phone", data.phone) : ""}
        ${data.modules ? row("Modules", `${data.modules} units`) : ""}
        ${data.area ? row("Total Area", `${data.area} m²`) : ""}
      </table>
      ${data.message ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 16px;"><p style="margin:0;font-size:13px;color:#6b7280;font-weight:600;">Preferred time / topics:</p><p style="margin:8px 0 0;font-size:14px;color:#374151;line-height:1.6;">${data.message}</p></div>` : ""}
      ${button("View Dashboard", `${APP_URL}/admin`)}
    `),
    text: `Consultation request from ${data.name} (${data.email}). ${data.message || "No message."}`,
  };
}
