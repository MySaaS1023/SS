import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { partnerMustChangePassword } from "@/lib/referrals/partner-access";
import { createAdminSupabaseClient, hasAdministratorAccess, requireUser } from "@/lib/supabase/server";

// React cache is scoped to the current Server Component request. Never rely on
// an ancestor layout: Next may render child pages concurrently with that layout.
export const requirePartnerRecordAccess = cache(async () => {
  const user = await requireUser();
  if (!user) redirect("/partner/login");
  if (await hasAdministratorAccess(user)) redirect("/admin");
  if (partnerMustChangePassword(user)) redirect("/partner/change-password");
  const database = createAdminSupabaseClient();
  const { data: membership, error: membershipError } = await database.from("referral_partners")
    .select("id,user_id,status").eq("user_id", user.id).eq("status", "approved").maybeSingle();
  if (membershipError || !membership) redirect("/partner/login");
  const { data: partner, error } = await database.from("referral_partners")
    .select("id,user_id,first_name,last_name,email,phone,mailing_address,payout_method,payout_details_encrypted,referral_code,status")
    .eq("id", membership.id).eq("user_id", user.id).eq("status", "approved").maybeSingle();
  if (error || !partner) redirect("/partner/login");
  return { user, partner };
});
