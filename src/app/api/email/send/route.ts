import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendPasswordResetConfirmEmail,
} from "@/shared/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/email/send
 * Sends transactional emails.
 *
 * Body: { type: "welcome" | "password_reset_confirm", to: string, displayName?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { type, to, displayName } = await req.json();

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
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Email API]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
