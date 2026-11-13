import {
  RecordSection,
  RecordDisclosure,
  formatRecordDate,
} from "./record-layout";
import { ConfirmSubmitButton } from "@/components/referrals/confirm-submit-button";
import {
  confirmCustomerPayment,
  updateCommission,
} from "@/app/admin/(protected)/referral-program/actions";
import { formatMoney, labelStatus } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";

export async function CommissionRecords({
  standalone = false,
  partnerId,
}: { standalone?: boolean; partnerId?: string } = {}) {
  await requirePrivateAdministrator();
  const admin = createAdminSupabaseClient();
  const [
    { data: commissions, error: commissionsError },
    { data: referrals, error: referralsError },
    { data: partners, error: partnersError },
  ] = await Promise.all([
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
  if (commissionsError || referralsError || partnersError) {
    throw new Error(
      "Commission records could not be loaded. Please try again.",
    );
  }
  const referralMap = new Map((referrals ?? []).map((item) => [item.id, item]));
  const partnerMap = new Map((partners ?? []).map((item) => [item.id, item]));
  const visibleCommissions = (commissions ?? []).filter(
    (item) => !partnerId || item.partner_id === partnerId,
  );
  return (
    <RecordSection
      title="Commissions & Payouts"
      count={visibleCommissions.length}
      standalone={standalone}
    >
      <details className="referral-record">
        <summary className="referral-record-summary">
          Confirm verified customer payment
        </summary>
        <form
          action={confirmCustomerPayment}
          className="glass-card mt-8 grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-5"
        >
          <div className="md:col-span-2 lg:col-span-5">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
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
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
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
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
          />
          <input
            required
            name="paymentDate"
            type="date"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
          />
          <input
            required
            name="transactionId"
            placeholder="Transaction / reference"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Confirm Payment
          </button>
        </form>
      </details>
      <div className="mt-4 space-y-2">
        {visibleCommissions.map((commission) => {
          const referral = referralMap.get(commission.referral_id);
          const partner = partnerMap.get(commission.partner_id);
          const customer =
            referral?.business_name ||
            `${referral?.customer_first_name ?? "Customer"} ${referral?.customer_last_name ?? ""}`;
          return (
            <RecordDisclosure
              key={commission.id}
              recordId={`commission-${commission.id}`}
              editable={["eligible", "approved"].includes(commission.status)}
              title={
                partner
                  ? `${partner.first_name} ${partner.last_name}`
                  : "Partner unavailable"
              }
              status={labelStatus(commission.status)}
              fields={[
                customer,
                formatMoney(commission.commission_amount_cents),
                formatRecordDate(commission.created_at),
              ]}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-[var(--muted)]">Partner</p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {partner?.first_name} {partner?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Customer</p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">{customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Customer Payment
                  </p>
                  <p className="mt-1 text-[var(--foreground)]">
                    {formatMoney(commission.qualifying_payment_amount_cents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Commission / Status
                  </p>
                  <p className="mt-1 text-[var(--foreground)]">
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
                className="mt-5 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                <input type="hidden" name="id" value={commission.id} />
                <textarea
                  name="notes"
                  defaultValue={commission.admin_notes ?? ""}
                  placeholder="Admin notes"
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--foreground)] sm:col-span-2 lg:col-span-4"
                />
                {commission.status === "eligible" ? (
                  <button
                    type="submit"
                    name="action"
                    value="approve"
                    className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
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
                      className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
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
                      className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]"
                    />
                    <ConfirmSubmitButton
                      message="Confirm this commission has been paid? This records a payout."
                      className="rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
                    >
                      Mark as Paid
                    </ConfirmSubmitButton>
                  </>
                ) : null}
                {!["reversed", "disputed"].includes(commission.status) ? (
                  <ConfirmSubmitButton
                    name="action"
                    value="reverse"
                    message={`Reject or reverse commission ${commission.id}? This changes its status; the original transaction and payout history are retained.`}
                    className="rounded-xl border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-800"
                  >
                    Reject / Reverse
                  </ConfirmSubmitButton>
                ) : null}
              </form>
            </RecordDisclosure>
          );
        })}
      </div>
    </RecordSection>
  );
}
