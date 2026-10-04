import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/referrals/config";
import { normalizeText, rateLimit, validEmail } from "@/lib/referrals/server";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";

const genericResponse = () => NextResponse.json({ success: true });

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`partner-password-reset:${ip}`, 4, 15 * 60_000))
    return genericResponse();
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return genericResponse();
  }
  const email = normalizeText(body.email, 254).toLowerCase();
  if (!validEmail(email)) return genericResponse();
  const admin = createAdminSupabaseClient();
  const { data: partner } = await admin
    .from("referral_partners")
    .select("id")
    .ilike("email", email)
    .eq("status", "approved")
    .maybeSingle();
  if (!partner) return genericResponse();
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/partner/reset-password`,
    });
    if (error)
      console.error("PARTNER_PASSWORD_RESET_FAILED", {
        code: error.code,
        status: error.status,
      });
  } catch {
    console.error("PARTNER_PASSWORD_RESET_CONFIGURATION_ERROR");
  }
  return genericResponse();
}
