import { NextResponse } from "next/server";

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
  if (!rateLimit(`admin-password-reset:${ip}`, 4, 15 * 60_000))
    return genericResponse();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return genericResponse();
  }
  const email = normalizeText(body.email, 254).toLowerCase();
  if (!validEmail(email) || !isAdminEmail(email)) return genericResponse();

  const supabase = await createServerSupabaseClient();
  const next = encodeURIComponent("/admin/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${next}`,
  });
  if (error)
    console.error("ADMIN_PASSWORD_RESET_ERROR", {
      message: error.message,
      status: error.status,
    });
  return genericResponse();
}
