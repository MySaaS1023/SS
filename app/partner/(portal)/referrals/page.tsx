import { labelStatus } from "@/lib/referrals/config";
import { customerJourneyStatus } from "@/lib/referrals/customer-handoff";
import { CustomerInviteActions } from "@/components/referrals/customer-invite-actions";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

export default async function PartnerReferralsPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const { data: referrals } = await admin
    .from("referrals")
    .select(
      "id,business_name,customer_first_name,customer_last_name,service_interest,submitted_at,status,customer_invite_status,customer_invite_sent_at,customer_first_viewed_at,service_selected_at,payment_link_clicked_at,customer_access_token_encrypted",
    )
    .eq("partner_id", context.partner.id)
    .order("submitted_at", { ascending: false });
  const ids = (referrals ?? []).map((item) => item.id);
  const { data: commissions } = ids.length
    ? await admin
        .from("referral_commissions")
        .select("referral_id,status")
        .in("referral_id", ids)
    : { data: [] };
  const commissionMap = new Map(
    (commissions ?? []).map((item) => [item.referral_id, item.status]),
  );
  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">My Referrals</h1>
      <div className="mt-8 space-y-4">
        {(referrals ?? []).length ? (
          referrals!.map((referral) => (
            <article key={referral.id} className="glass-card p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Customer / Business
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {referral.business_name ||
                      `${referral.customer_first_name} ${referral.customer_last_name}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Service Interest
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {labelStatus(referral.service_interest)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Date Submitted</p>
                  <p className="mt-1 text-sm text-white">
                    {new Date(referral.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Referral Status</p>
                  <p className="mt-1 text-sm text-white">
                    {labelStatus(customerJourneyStatus(referral))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Customer Invite</p>
                  <p
                    className={`mt-1 text-sm ${referral.customer_invite_status === "failed" ? "text-red-200" : "text-white"}`}
                  >
                    {labelStatus(referral.customer_invite_status ?? "not_sent")}
                    {referral.customer_invite_sent_at
                      ? ` · ${new Date(referral.customer_invite_sent_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </div>
              <CustomerInviteActions
                referralId={referral.id}
                hasInvite={Boolean(referral.customer_access_token_encrypted)}
              />
              <p className="mt-3 text-xs text-[var(--muted)]">
                Commission:{" "}
                {labelStatus(commissionMap.get(referral.id) ?? "not_eligible")}
              </p>
            </article>
          ))
        ) : (
          <div className="glass-card p-8 text-center text-[var(--muted)]">
            No referrals yet.
          </div>
        )}
      </div>
    </div>
  );
}
