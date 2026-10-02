import { updatePartner } from "../actions";
import { formatMoney } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function PartnersPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: partners }, { data: payouts }] = await Promise.all([
    admin
      .from("referral_partners")
      .select("*")
      .order("created_at", { ascending: false }),
    admin
      .from("referral_payouts")
      .select("partner_id,amount_cents,paid_at,payment_method,payout_reference")
      .order("paid_at", { ascending: false }),
  ]);
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Partners</h1>
      <div className="mt-8 space-y-5">
        {(partners ?? []).map((partner) => {
          const partnerPayouts = (payouts ?? []).filter(
            (payout) => payout.partner_id === partner.id,
          );
          return (
            <article key={partner.id} className="glass-card p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {partner.first_name} {partner.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {partner.email} · {partner.phone}
                  </p>
                  <p className="mt-1 text-sm text-[#93c5fd]">
                    {partner.referral_code}
                  </p>
                </div>
                <span className="h-fit w-fit rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white">
                  {partner.status}
                </span>
              </div>
              <div className="mt-5 rounded-xl bg-black/20 p-4">
                <p className="text-xs uppercase text-[var(--muted)]">
                  Payout history ·{" "}
                  {formatMoney(
                    partnerPayouts.reduce(
                      (sum, payout) => sum + payout.amount_cents,
                      0,
                    ),
                  )}
                </p>
                {partnerPayouts.slice(0, 3).map((payout) => (
                  <p
                    key={payout.payout_reference}
                    className="mt-2 text-sm text-white"
                  >
                    {new Date(payout.paid_at).toLocaleDateString()} ·{" "}
                    {formatMoney(payout.amount_cents)} · {payout.payment_method}{" "}
                    · {payout.payout_reference}
                  </p>
                ))}
              </div>
              <form action={updatePartner} className="mt-5">
                <input type="hidden" name="id" value={partner.id} />
                <textarea
                  name="notes"
                  defaultValue={partner.internal_notes ?? ""}
                  placeholder="Internal notes"
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white"
                />
                <div className="mt-3">
                  <button
                    name="status"
                    value={
                      partner.status === "suspended" ? "approved" : "suspended"
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold text-white ${partner.status === "suspended" ? "bg-green-600" : "bg-red-700"}`}
                  >
                    {partner.status === "suspended"
                      ? "Reactivate Partner"
                      : "Suspend Partner"}
                  </button>
                </div>
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
