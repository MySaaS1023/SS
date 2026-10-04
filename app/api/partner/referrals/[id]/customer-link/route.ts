import { NextResponse } from "next/server";

import { customerAccessUrl } from "@/lib/referrals/customer-handoff";
import { requirePartnerApi } from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartnerApi();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const admin = createAdminSupabaseClient();
  const { data: referral } = await admin
    .from("referrals")
    .select("customer_access_token_encrypted,customer_access_token_expires_at")
    .eq("id", id)
    .eq("partner_id", auth.partner.id)
    .maybeSingle();
  if (
    !referral?.customer_access_token_encrypted ||
    !referral.customer_access_token_expires_at ||
    new Date(referral.customer_access_token_expires_at) <= new Date()
  )
    return NextResponse.json(
      { error: "No active customer link." },
      { status: 404 },
    );
  return NextResponse.json({
    url: customerAccessUrl(referral.customer_access_token_encrypted),
  });
}
