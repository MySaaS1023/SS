import { ConfirmSubmitButton } from "@/components/referrals/confirm-submit-button";
import { confirmCustomerPayment, updateCommission } from "../actions";
import { formatMoney, labelStatus } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function AdminCommissionsPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: commissions }, { data: referrals }, { data: partners }] =
    await Promise.all([
      admin
        .from("referral_commissions")
        .select("*")
        .order("created_at", { ascending: false }),
      admin
        .from("referrals")
        .select(
          "id,partner_id,business_name,customer_first_name,customer_last_name,status",
        )
        .order("created_at", { ascending: false }),
      admin.from("referral_partners").select("id,first_name,last_name"),
    ]);
  const referralMap = new Map((referrals ?? []).map((item) => [item.id, item]));
  const partnerMap = new Map((partners ?? []).map((item) => [item.id, item]));
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Commissions</h1>
      <form
        action={confirmCustomerPayment}
        className="glass-card mt-8 grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-5"
      >
        <div className="md:col-span-2 lg:col-span-5">
          <h2 className="text-xl font-semibold text-white">
            Confirm Customer Payment
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Creates exactly one eligible $100 commission for a unique
            transaction reference.
          </p>
        </div>
        <select
          required
          name="referralId"
          defaultValue=""
          className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
        >
          <option disabled value="">
            Select referral
          </option>
          {(referrals ?? [])
            .filter((item) => item.status !== "closed")
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.business_name ||
                  `${item.customer_first_name} ${item.customer_last_name}`}
              </option>
            ))}
        </select>
        <input
          required
          name="paymentAmount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Payment amount"
          className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
        />
        <input
          required
          name="paymentDate"
          type="date"
          className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
        />
        <input
          required
          name="transactionId"
          placeholder="Transaction / reference"
          className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
        />
        <button className="rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white">
          Confirm Payment
        </button>
      </form>
      <div className="mt-8 space-y-5">
        {(commissions ?? []).map((commission) => {
          const referral = referralMap.get(commission.referral_id);
          const partner = partnerMap.get(commission.partner_id);
          const customer =
            referral?.business_name ||
            `${referral?.customer_first_name ?? "Customer"} ${referral?.customer_last_name ?? ""}`;
          return (
            <article key={commission.id} className="glass-card p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-[var(--muted)]">Partner</p>
                  <p className="mt-1 font-semibold text-white">
                    {partner?.first_name} {partner?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Customer</p>
                  <p className="mt-1 font-semibold text-white">{customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Customer Payment
                  </p>
                  <p className="mt-1 text-white">
                    {formatMoney(commission.qualifying_payment_amount_cents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Commission / Status
                  </p>
                  <p className="mt-1 text-white">
                    {formatMoney(commission.commission_amount_cents)} ·{" "}
                    {labelStatus(commission.status)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">
                Eligible:{" "}
                {commission.eligible_at
                  ? new Date(commission.eligible_at).toLocaleDateString()
                  : "—"}{" "}
                · Paid:{" "}
                {commission.paid_at
                  ? new Date(commission.paid_at).toLocaleDateString()
                  : "—"}{" "}
                · Transaction: {commission.transaction_id}
              </p>
              <form
                action={updateCommission}
                className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                <input type="hidden" name="id" value={commission.id} />
                <textarea
                  name="notes"
                  defaultValue={commission.admin_notes ?? ""}
                  placeholder="Admin notes"
                  className="rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white sm:col-span-2 lg:col-span-4"
                />
                {commission.status === "eligible" ? (
                  <button
                    name="action"
                    value="approve"
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Approve Commission
                  </button>
                ) : null}
                {commission.status === "approved" ? (
                  <>
                    <select
                      name="paymentMethod"
                      required
                      defaultValue=""
                      className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
                    >
                      <option value="" disabled>
                        Payment method
                      </option>
                      <option value="PayPal">PayPal</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Check">Check</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      name="payoutReference"
                      required
                      placeholder="Payout reference"
                      className="rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3 text-sm text-white"
                    />
                    <ConfirmSubmitButton
                      message="Confirm this commission has been paid? This records a payout."
                      className="rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white"
                    >
                      Mark as Paid
                    </ConfirmSubmitButton>
                  </>
                ) : null}
                {!["reversed", "disputed"].includes(commission.status) ? (
                  <button
                    name="action"
                    value="reverse"
                    className="rounded-xl border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-200"
                  >
                    Reject / Reverse
                  </button>
                ) : null}
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
