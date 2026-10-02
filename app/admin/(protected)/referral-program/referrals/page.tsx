import { updateReferral } from "../actions";
import { labelStatus, referralStatuses } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function AdminReferralsPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: referrals }, { data: partners }] = await Promise.all([
    admin
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false }),
    admin
      .from("referral_partners")
      .select("id,first_name,last_name,referral_code")
      .eq("status", "approved"),
  ]);
  const partnerMap = new Map(
    (partners ?? []).map((partner) => [partner.id, partner]),
  );
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Referrals</h1>
      <div className="mt-8 space-y-5">
        {(referrals ?? []).map((referral) => {
          const owner = partnerMap.get(referral.partner_id);
          return (
            <article
              key={referral.id}
              className={`glass-card p-6 ${referral.duplicate_review ? "border-[#f59e0b]/50" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {referral.business_name ||
                      `${referral.customer_first_name} ${referral.customer_last_name}`}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {referral.customer_email} · {referral.customer_phone}
                  </p>
                  <p className="mt-1 text-sm text-[#93c5fd]">
                    Partner:{" "}
                    {owner
                      ? `${owner.first_name} ${owner.last_name} (${owner.referral_code})`
                      : "Unknown"}
                  </p>
                </div>
                {referral.duplicate_review ? (
                  <span className="h-fit rounded-full bg-[#f59e0b]/20 px-3 py-1 text-xs font-semibold text-[#fde68a]">
                    Duplicate review
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Service: {labelStatus(referral.service_interest)} · Source:{" "}
                {labelStatus(referral.source)} · Submitted:{" "}
                {new Date(referral.submitted_at).toLocaleString()}
              </p>
              {referral.notes ? (
                <p className="mt-3 rounded-xl bg-black/20 p-3 text-sm text-white">
                  {referral.notes}
                </p>
              ) : null}
              <form
                action={updateReferral}
                className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input type="hidden" name="id" value={referral.id} />
                <select
                  name="status"
                  defaultValue={referral.status}
                  className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
                >
                  {referralStatuses.map((status) => (
                    <option key={status} value={status}>
                      {labelStatus(status)}
                    </option>
                  ))}
                </select>
                <select
                  name="partnerId"
                  defaultValue=""
                  className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
                >
                  <option value="">Keep current attribution</option>
                  {(partners ?? []).map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.first_name} {partner.last_name} ·{" "}
                      {partner.referral_code}
                    </option>
                  ))}
                </select>
                <button className="rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white">
                  Save
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
