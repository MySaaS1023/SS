import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { REFERRAL_VISITOR_COOKIE_NAME } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const visitorKey = (await cookies()).get(REFERRAL_VISITOR_COOKIE_NAME)?.value;

  if (!visitorKey || !/^[0-9a-f-]{36}$/i.test(visitorKey)) {
    return NextResponse.json({ recorded: false });
  }

  const admin = createAdminSupabaseClient();
  const { data: attribution } = await admin
    .from("referral_attributions")
    .select("referral_id")
    .eq("visitor_key", visitorKey)
    .gt("expires_at", new Date().toISOString())
    .not("referral_id", "is", null)
    .maybeSingle();

  if (!attribution?.referral_id) {
    return NextResponse.json({ recorded: false });
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("referrals")
    .update({
      payment_link_clicked_at: now,
      customer_last_activity_at: now,
    })
    .eq("id", attribution.referral_id);

  if (error) {
    console.error("REFERRAL_PAYMENT_LINK_ACTIVITY_ERROR", {
      code: error.code,
    });
    return NextResponse.json({ recorded: false }, { status: 500 });
  }

  return NextResponse.json({ recorded: true });
}
