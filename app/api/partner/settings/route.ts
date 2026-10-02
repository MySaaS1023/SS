import { NextResponse } from "next/server";

import {
  normalizeText,
  requirePartnerApi,
  writeAudit,
} from "@/lib/referrals/server";
import { encryptPayoutDetails } from "@/lib/referrals/security";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const auth = await requirePartnerApi();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = normalizeText(body.firstName, 120);
    const lastName = normalizeText(body.lastName, 120);
    const phone = normalizeText(body.phone, 60);
    const payoutMethod = normalizeText(body.payoutMethod, 20);
    if (
      !firstName ||
      !lastName ||
      !phone ||
      (payoutMethod &&
        !["paypal", "zelle", "check", "other"].includes(payoutMethod))
    )
      return NextResponse.json(
        { error: "Enter valid settings." },
        { status: 400 },
      );
    const update: Record<string, string | null> = {
      first_name: firstName,
      last_name: lastName,
      phone,
      mailing_address: normalizeText(body.mailingAddress, 500) || null,
      payout_method: payoutMethod || null,
    };
    const payoutDetails = normalizeText(body.payoutDetails, 500);
    if (payoutDetails)
      update.payout_details_encrypted = encryptPayoutDetails(payoutDetails);
    const admin = createAdminSupabaseClient();
    const { error } = await admin
      .from("referral_partners")
      .update(update)
      .eq("id", auth.partner.id);
    if (error) throw error;
    await writeAudit({
      actorUserId: auth.user.id,
      action: "partner_settings_updated",
      entityType: "partner",
      entityId: auth.partner.id,
      after: {
        ...update,
        payout_details_encrypted: payoutDetails ? "[updated]" : undefined,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PARTNER_SETTINGS_ERROR", error);
    return NextResponse.json(
      { error: "Unable to save settings." },
      { status: 500 },
    );
  }
}
