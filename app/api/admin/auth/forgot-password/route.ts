import { NextResponse } from "next/server";

import {
  classifyPasswordResetError,
  getAdminPasswordResetRedirect,
  logPasswordResetEvent,
} from "@/lib/referrals/admin-password-reset";
import { getSiteUrl } from "@/lib/referrals/config";
import { normalizeText, rateLimit, validEmail } from "@/lib/referrals/server";
import {
  createServerSupabaseClient,
  isAdminEmail,
} from "@/lib/supabase/server";

const genericResponse = () => NextResponse.json({ success: true });

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-password-reset:${ip}`, 4, 15 * 60_000)) {
    logPasswordResetEvent("password_reset_rate_limited", {
      code: "application_rate_limit",
      status: 429,
    });
    return genericResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return genericResponse();
  }
  const email = normalizeText(body.email, 254).toLowerCase();
  if (!validEmail(email) || !isAdminEmail(email)) return genericResponse();

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAdminPasswordResetRedirect(getSiteUrl()),
    });
    if (error) {
      logPasswordResetEvent(classifyPasswordResetError(error), error);
      return genericResponse();
    }
    logPasswordResetEvent("password_reset_requested");
  } catch {
    logPasswordResetEvent("password_reset_configuration_error");
  }
  return genericResponse();
}
