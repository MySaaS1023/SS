import { NextResponse } from "next/server";

import { hashCustomerAccessToken } from "@/lib/referrals/customer-handoff";
import { normalizeText, rateLimit } from "@/lib/referrals/server";
import {
  createPartnerNotification,
  referralDisplayName,
} from "@/lib/referrals/notifications";
import { serviceOfferings } from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const events = [
  "service_viewed",
  "service_selected",
  "payment_link_clicked",
  "consultation_clicked",
] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token))
    return NextResponse.json(
      { error: "Invalid customer link." },
      { status: 404 },
    );
  if (
    !rateLimit(
      `customer-activity:${hashCustomerAccessToken(token)}`,
      30,
      60_000,
    )
  )
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const body = (await request.json()) as Record<string, unknown>;
  const event = normalizeText(body.event, 40) as (typeof events)[number];
  const service = normalizeText(body.service, 100);
  if (!events.includes(event))
    return NextResponse.json({ error: "Invalid activity." }, { status: 400 });
  if (service && !serviceOfferings.some((item) => item.key === service))
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  const admin = createAdminSupabaseClient();
  const { data: referral } = await admin
    .from("referrals")
    .select(
      "id,partner_id,business_name,customer_first_name,customer_last_name,status,customer_access_token_expires_at",
    )
    .eq("customer_access_token_hash", hashCustomerAccessToken(token))
    .maybeSingle();
  if (
    !referral?.customer_access_token_expires_at ||
    new Date(referral.customer_access_token_expires_at) <= new Date()
  )
    return NextResponse.json(
      { error: "Customer link expired." },
      { status: 410 },
    );
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { customer_last_activity_at: now };
  if (event === "service_selected") {
    update.selected_service = service;
    update.selected_package = service;
    update.service_selected_at = now;
  }
  if (event === "payment_link_clicked") update.payment_link_clicked_at = now;
  if (event === "consultation_clicked") update.consultation_clicked_at = now;
  await admin.from("referrals").update(update).eq("id", referral.id);
  await admin.from("referral_audit_log").insert({
    action: event,
    entity_type: "referral",
    entity_id: referral.id,
    after_data: service ? { service } : {},
  });
  if (event === "service_selected" && service) {
    const offering = serviceOfferings.find((item) => item.key === service)!;
    await createPartnerNotification({
      admin,
      partnerId: referral.partner_id,
      type: "service_selected",
      title: "Customer Interested",
      message: `${referralDisplayName(referral)} selected ${offering.name}.`,
      eventKey: `service_selected:${referral.id}:${service}`,
      referralId: referral.id,
    });
  }
  return NextResponse.json({ success: true });
}
