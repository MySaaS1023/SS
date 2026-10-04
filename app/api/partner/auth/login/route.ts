import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/referrals/config";
import { normalizeText, rateLimit, validEmail } from "@/lib/referrals/server";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000))
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  const body = (await request.json()) as Record<string, unknown>;
  const email = normalizeText(body.email, 254).toLowerCase();
  if (!validEmail(email))
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );

  const service = createAdminSupabaseClient();
  const { data } = await service
    .from("referral_partners")
    .select("id,status")
    .ilike("email", email)
    .maybeSingle();
  if (!data || data.status !== "approved")
    return NextResponse.json(
      { error: "An approved Partner account was not found for this email." },
      { status: 403 },
    );

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/partner")}`,
    },
  });
  if (error) {
    console.error("PARTNER_LOGIN_ERROR", error);
    return NextResponse.json(
      {
        error:
          "Unable to send a login link. Contact support if this continues.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
