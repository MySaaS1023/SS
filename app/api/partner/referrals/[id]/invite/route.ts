import { NextResponse } from "next/server";

import {
  canPartnerResendInvite,
  deliverCustomerInvite,
} from "@/lib/referrals/customer-handoff";
import { rateLimit, requirePartnerApi } from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartnerApi();
  if (auth instanceof NextResponse) return auth;
  if (!rateLimit(`customer-invite:${auth.partner.id}`, 6, 60 * 60_000))
    return NextResponse.json(
      { error: "Too many invitation attempts." },
      { status: 429 },
    );
  const { id } = await params;
  const admin = createAdminSupabaseClient();
  const { data: referral } = await admin
    .from("referrals")
    .select("*")
    .eq("id", id)
    .eq("partner_id", auth.partner.id)
    .maybeSingle();
  if (!referral)
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  if (!canPartnerResendInvite(referral.customer_invite_last_attempt_at))
    return NextResponse.json(
      { error: "Invitation already sent recently." },
      { status: 429 },
    );
  const result = await deliverCustomerInvite({
    admin,
    referral,
    partnerFirstName: auth.partner.first_name,
    isResend: referral.customer_invite_status !== "not_sent",
    actorUserId: auth.user.id,
  });
  return NextResponse.json(
    result.sent ? { success: true } : { error: "Customer Invite Failed" },
    { status: result.sent ? 200 : 502 },
  );
}
