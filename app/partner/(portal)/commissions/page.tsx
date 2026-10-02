import { formatMoney, labelStatus } from "@/lib/referrals/config";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

export default async function PartnerCommissionsPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const { data: commissions } = await admin
    .from("referral_commissions")
    .select("id,referral_id,commission_amount_cents,status,eligible_at,paid_at")
    .eq("partner_id", context.partner.id)
    .order("created_at", { ascending: false });
  const ids = (commissions ?? []).map((item) => item.referral_id);
  const { data: referrals } = ids.length
    ? await admin
        .from("referrals")
        .select("id,business_name,customer_first_name,customer_last_name")
        .in("id", ids)
    : { data: [] };
  const referralMap = new Map((referrals ?? []).map((item) => [item.id, item]));
  const total = (statuses: string[]) =>
    (commissions ?? [])
      .filter((item) => statuses.includes(item.status))
      .reduce((sum, item) => sum + item.commission_amount_cents, 0);
  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Commissions</h1>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[
          ["Pending", total(["pending", "eligible"])],
          ["Approved", total(["approved"])],
          ["Total Paid", total(["paid"])],
        ].map(([label, value]) => (
          <div key={String(label)} className="glass-card p-5">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatMoney(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 space-y-4">
        {(commissions ?? []).length ? (
          commissions!.map((commission) => {
            const referral = referralMap.get(commission.referral_id);
            return (
              <article
                key={commission.id}
                className="glass-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5"
              >
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Customer / Business
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {referral?.business_name ||
                      `${referral?.customer_first_name ?? "Customer"} ${referral?.customer_last_name ?? ""}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Sale Date</p>
                  <p className="mt-1 text-sm text-white">
                    {commission.eligible_at
                      ? new Date(commission.eligible_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Commission</p>
                  <p className="mt-1 text-sm text-white">
                    {formatMoney(commission.commission_amount_cents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Status</p>
                  <p className="mt-1 text-sm text-white">
                    {labelStatus(commission.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Paid Date</p>
                  <p className="mt-1 text-sm text-white">
                    {commission.paid_at
                      ? new Date(commission.paid_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="glass-card p-8 text-center text-[var(--muted)]">
            No commissions yet.
          </div>
        )}
      </div>
    </div>
  );
}
