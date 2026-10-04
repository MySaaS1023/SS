import type { createAdminSupabaseClient } from "@/lib/supabase/server";

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

export type PartnerNotificationType =
  | "referral_link_visit"
  | "qualified_lead"
  | "customer_viewed"
  | "service_selected"
  | "payment_confirmed"
  | "commission_approved"
  | "commission_paid"
  | "referral_status_changed";

export async function createPartnerNotification(input: {
  admin: AdminClient;
  partnerId: string;
  type: PartnerNotificationType;
  title: string;
  message: string;
  eventKey: string;
  referralId?: string | null;
  commissionId?: string | null;
}) {
  const { error } = await input.admin.from("partner_notifications").upsert(
    {
      partner_id: input.partnerId,
      type: input.type,
      title: input.title,
      message: input.message,
      event_key: input.eventKey,
      referral_id: input.referralId ?? null,
      commission_id: input.commissionId ?? null,
    },
    { onConflict: "event_key", ignoreDuplicates: true },
  );
  if (error)
    console.error("PARTNER_NOTIFICATION_ERROR", {
      type: input.type,
      partnerId: input.partnerId,
      code: error.code,
    });
}

export function referralDisplayName(referral: {
  business_name?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
}) {
  return (
    referral.business_name?.trim() ||
    `${referral.customer_first_name ?? "Customer"} ${referral.customer_last_name ?? ""}`.trim()
  );
}
