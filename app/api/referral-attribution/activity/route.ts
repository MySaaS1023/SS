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
  const { error } = await admin
    .from("referral_attributions")
    .update({ services_viewed_at: new Date().toISOString() })
    .eq("visitor_key", visitorKey)
    .gt("expires_at", new Date().toISOString())
    .is("services_viewed_at", null);

  if (error) {
    console.error("REFERRAL_SERVICE_VIEW_ACTIVITY_ERROR", {
      code: error.code,
    });
    return NextResponse.json({ recorded: false }, { status: 500 });
  }

  return NextResponse.json({ recorded: true });
}
