import { NextResponse } from "next/server";

import { partnerMustChangePassword } from "@/lib/referrals/partner-access";
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
  const password = typeof body.password === "string" ? body.password : "";
  if (!validEmail(email) || !password)
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );

  const service = createAdminSupabaseClient();
  const { data } = await service
    .from("referral_partners")
    .select("id,status,user_id")
    .ilike("email", email)
    .eq("status", "approved")
    .maybeSingle();
  if (!data)
    return NextResponse.json(
      { error: "An approved Partner account was not found for this email." },
      { status: 403 },
    );

  const supabase = await createServerSupabaseClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !authData.user || authData.user.id !== data.user_id) {
    if (authData.user) await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401 },
    );
  }
  return NextResponse.json({
    success: true,
    mustChangePassword: partnerMustChangePassword(authData.user),
  });
}
