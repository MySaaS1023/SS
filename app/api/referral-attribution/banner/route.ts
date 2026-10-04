import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { REFERRAL_COOKIE_NAME } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const code = (await cookies()).get(REFERRAL_COOKIE_NAME)?.value;
  if (!code) return new NextResponse(null, { status: 204 });
  const admin = createAdminSupabaseClient();
  const { data: partner } = await admin
    .from("referral_partners")
    .select("first_name,last_name,referral_code")
    .eq("referral_code", code)
    .eq("status", "approved")
    .maybeSingle();
  if (!partner) return new NextResponse(null, { status: 204 });
  return NextResponse.json({
    referralCode: partner.referral_code,
    partnerName: `${partner.first_name} ${partner.last_name}`.trim(),
  });
}
