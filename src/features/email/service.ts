/**
 * Feature-level email service — wraps core sendEmail with template dispatching.
 */

import { sendEmail, isEmailConfigured } from "@/shared/lib/email";
import {
  projectSavedEmail,
  quoteRequestEmail,
  consultationRequestEmail,
  type QuoteRequestData,
  type ConsultationRequestData,
} from "./templates";

export type EmailTemplate = "project_saved" | "quote_request" | "consultation_request";

export interface EmailPayload {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using a named template.
 * Falls back to console.log when RESEND_API_KEY is not set.
 */
export async function sendTemplateEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, template, data } = payload;

  let subject: string;
  let html: string;

  switch (template) {
    case "project_saved": {
      const result = projectSavedEmail(
        (data.userName as string) || "there",
        (data.projectName as string) || "Untitled Project",
      );
      subject = result.subject;
      html = result.html;
      break;
    }
    case "quote_request": {
      const result = quoteRequestEmail(data as unknown as QuoteRequestData);
      subject = result.subject;
      html = result.html;
      break;
    }
    case "consultation_request": {
      const result = consultationRequestEmail(data as unknown as ConsultationRequestData);
      subject = result.subject;
      html = result.html;
      break;
    }
    default:
      return { success: false, error: `Unknown template: ${template}` };
  }

  if (!isEmailConfigured) {
    console.log(`[Email Service] Would send "${template}" to ${to}`);
    console.log(`  Subject: ${subject}`);
    return { success: true, id: `dev-${Date.now()}` };
  }

  try {
    const result = await sendEmail({ to, subject, html, replyTo: (data.email as string) || undefined });
    return { success: true, id: result?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
