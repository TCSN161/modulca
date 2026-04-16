import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  sendWelcomeEmail,
  sendPasswordResetConfirmEmail,
} from "@/shared/lib/email";
import { sendTemplateEmail } from "@/features/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/email/send
 * Sends transactional emails.
 *
 * Body: { type: string, to: string, displayName?: string, data?: Record<string, unknown> }
 *
 * Supported types:
 *   - "welcome" — welcome email after signup
 *   - "password_reset_confirm" — password reset confirmation
 *   - "project_saved" — project saved notification (data: { userName, projectName })
 *   - "quote_request" — quote request to team (data: { name, email, phone?, message?, modules, area, estimate, style? })
 *   - "consultation_request" — consultation booking (data: { name, email, phone?, message?, modules?, area? })
 */
export async function POST(req: NextRequest) {
  try {
    const { type, to, displayName, data } = await req.json();

    if (!to || !type) {
      return NextResponse.json(
        { error: "Missing 'to' or 'type'" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(to, displayName);
        break;
      case "password_reset_confirm":
        result = await sendPasswordResetConfirmEmail(to);
        break;
      case "project_saved":
      case "quote_request":
      case "consultation_request":
        result = await sendTemplateEmail({ to, template: type, data: data || {} });
        break;
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Email API]", err);
    Sentry.captureException(err, { tags: { source: "email-api" } });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
