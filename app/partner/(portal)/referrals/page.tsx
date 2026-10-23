import { labelStatus } from "@/lib/referrals/config";
import { customerJourneyStatus } from "@/lib/referrals/customer-handoff";
import { customerJourneyV2Enabled } from "@/lib/referrals/customer-journey";
import { CustomerInviteActions } from "@/components/referrals/customer-invite-actions";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

type PartnerReferral = {
  id: string;
  business_name: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  service_interest: string;
  submitted_at: string;
  status: string;
  customer_invite_status: string | null;
  customer_invite_sent_at: string | null;
  customer_first_viewed_at: string | null;
  service_selected_at: string | null;
  payment_link_clicked_at: string | null;
  customer_access_token_encrypted: string | null;
  selected_package?: string | null;
  customer_progress_stage?: string | null;
  customer_intake_step?: number;
  customer_autosaved_at?: string | null;
  service_preferences?: unknown;
};

const preferenceLabels: Record<string, string> = {
  websiteType: "Website type",
  pagesNeeded: "Pages",
  hasBranding: "Branding",
  needsBooking: "Booking",
  needsCommerce: "Shopping cart",
  integrations: "Integrations",
  seoPriority: "Search priority",
  needsAccounts: "Customer accounts",
  needsDashboard: "Dashboard",
  needsDatabase: "Database",
  needsCrm: "CRM",
  needsPayments: "Payments",
  needsScheduling: "Scheduling",
  needsAutomation: "Automation",
  needsChatbot: "Chatbot",
  needsNotifications: "Notifications",
  needsBusinessSetup: "Business setup",
};

function visiblePreferences(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item === true || (typeof item === "string" && item))
    .map(([key, item]) => ({
      label: preferenceLabels[key] ?? labelStatus(key),
      value: item === true ? "Needed" : String(item),
    }))
    .slice(0, 6);
}

export default async function PartnerReferralsPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const journeyV2 = customerJourneyV2Enabled();
  const referralResult = journeyV2
    ? await admin
        .from("referrals")
        .select(
          "id,business_name,customer_first_name,customer_last_name,customer_email,customer_phone,service_interest,submitted_at,status,customer_invite_status,customer_invite_sent_at,customer_first_viewed_at,service_selected_at,payment_link_clicked_at,customer_access_token_encrypted,selected_package,customer_progress_stage,customer_intake_step,customer_autosaved_at,service_preferences",
        )
        .eq("partner_id", context.partner.id)
        .order("submitted_at", { ascending: false })
    : await admin
        .from("referrals")
        .select(
          "id,business_name,customer_first_name,customer_last_name,customer_email,customer_phone,service_interest,submitted_at,status,customer_invite_status,customer_invite_sent_at,customer_first_viewed_at,service_selected_at,payment_link_clicked_at,customer_access_token_encrypted",
        )
        .eq("partner_id", context.partner.id)
        .order("submitted_at", { ascending: false });
  const referrals = referralResult.data as PartnerReferral[] | null;
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
          referrals!.map((referral) => {
            const preferences = visiblePreferences(
              referral.service_preferences,
            );
            return (
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
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {referral.customer_email} · {referral.customer_phone}
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
                    <p className="text-xs text-[var(--muted)]">
                      Date Submitted
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {new Date(referral.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">
                      Referral Status
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {labelStatus(customerJourneyStatus(referral))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">
                      Customer Invite
                    </p>
                    <p
                      className={`mt-1 text-sm ${referral.customer_invite_status === "failed" ? "text-red-200" : "text-white"}`}
                    >
                      {labelStatus(
                        referral.customer_invite_status ?? "not_sent",
                      )}
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
                  {labelStatus(
                    commissionMap.get(referral.id) ?? "not_eligible",
                  )}
                </p>
                {journeyV2 ? (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-[var(--muted)]">
                        Journey progress
                      </p>
                      <p className="mt-1 text-white">
                        {labelStatus(
                          referral.customer_progress_stage ?? "not_started",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">
                        Selected package
                      </p>
                      <p className="mt-1 text-white">
                        {referral.selected_package ?? "Not selected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">Last saved</p>
                      <p className="mt-1 text-white">
                        {referral.customer_autosaved_at
                          ? new Date(
                              referral.customer_autosaved_at,
                            ).toLocaleString()
                          : "Not yet"}
                      </p>
                    </div>
                  </div>
                ) : null}
                {journeyV2 && preferences.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {preferences.map((preference) => (
                      <span
                        key={preference.label}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--muted)]"
                      >
                        <strong className="text-white">
                          {preference.label}:
                        </strong>{" "}
                        {preference.value}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="glass-card p-8 text-center text-[var(--muted)]">
            No referrals yet.
          </div>
        )}
      </div>
    </div>
  );
}
