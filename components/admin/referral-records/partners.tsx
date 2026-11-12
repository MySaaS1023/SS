import Link from "next/link";
import { RecordSection, RecordDisclosure } from "./record-layout";
import { updatePartner, savePartnerNotes } from "@/app/admin/(protected)/referral-program/actions";
import { ConfirmSubmitButton } from "@/components/referrals/confirm-submit-button";
import { formatMoney } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { PartnerAccessForm } from "@/components/referrals/partner-access-form";
import { RecordArchiveControl } from "@/components/admin/record-archive-control";

export async function PartnerRecords({
  standalone = false,
}: { standalone?: boolean } = {}) {
  const admin = createAdminSupabaseClient();
  const [
    { data: partners, error: partnersError },
    { data: payouts, error: payoutsError },
    { data: linkVisits, error: visitsError },
    { data: linkReferrals, error: referralsError },
  ] = await Promise.all([
    admin
      .from("referral_partners")
      .select("*")
      .order("created_at", { ascending: false }),
    admin
      .from("referral_payouts")
      .select("partner_id,amount_cents,paid_at,payment_method,payout_reference")
      .order("paid_at", { ascending: false }),
    admin
      .from("referral_attributions")
      .select("partner_id")
      .eq("source", "referral_link"),
    admin
      .from("referrals")
      .select("partner_id,status")
      .eq("source", "referral_link"),
  ]);
  if (partnersError || payoutsError || visitsError || referralsError) {
    throw new Error("Partner records could not be loaded. Please try again.");
  }
  return (
    <RecordSection
      title="Partners"
      count={(partners ?? []).length}
      standalone={standalone}
    >
      <div className="mt-8 space-y-5">
        {(partners ?? []).map((partner) => {
          const partnerPayouts = (payouts ?? []).filter(
            (payout) => payout.partner_id === partner.id,
          );
          const visits = (linkVisits ?? []).filter(
            (item) => item.partner_id === partner.id,
          ).length;
          const qualified = (linkReferrals ?? []).filter(
            (item) =>
              item.partner_id === partner.id && item.status !== "partial",
          );
          const customers = qualified.filter((item) =>
            ["customer", "payment_pending", "payment_confirmed"].includes(
              item.status,
            ),
          ).length;
          return (
            <RecordDisclosure
              key={partner.id}
              title={`${partner.first_name} ${partner.last_name}`}
              status={partner.status}
              fields={[
                partner.email,
                partner.phone,
                `Rep ID: ${partner.referral_code}`,
              ]}
            >
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
                <p className="text-sm text-white">
                  Link Visits: {visits} · Qualified Leads: {qualified.length} ·
                  Customers: {customers} · Conversion:{" "}
                  {qualified.length
                    ? Math.round((customers / qualified.length) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs uppercase text-[var(--muted)]">
                  Payout history ·{" "}
                  {formatMoney(
                    partnerPayouts.reduce(
                      (sum, payout) => sum + payout.amount_cents,
                      0,
                    ),
                  )}
                </p>
                {partnerPayouts.map((payout) => (
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
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/admin/referral-program/referrals?partner=${encodeURIComponent(partner.id)}`}
                  className="underline underline-offset-4"
                >
                  View partner referrals
                </Link>
                <Link
                  href={`/admin/referral-program/commissions?partner=${encodeURIComponent(partner.id)}`}
                  className="underline underline-offset-4"
                >
                  View commissions
                </Link>
              </div>
              <form action={updatePartner} className="mt-5">
                <input type="hidden" name="id" value={partner.id} />
                <label className="block text-sm font-medium">Internal notes<textarea
                  name="notes"
                  maxLength={4000}
                  defaultValue={partner.internal_notes ?? ""}
                  placeholder="Internal notes"
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white"
                /></label>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="submit" formAction={savePartnerNotes} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">Save Notes</button>
                  <ConfirmSubmitButton
                    message={`${partner.status === "suspended" ? "Reactivate" : "Suspend"} ${partner.first_name} ${partner.last_name} (${partner.referral_code})? Existing referrals, commissions and payout history will be retained. This changes account access.`}
                    name="status"
                    value={
                      partner.status === "suspended" ? "approved" : "suspended"
                    }
                    className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-white ${partner.status === "suspended" ? "bg-green-600" : "bg-red-700"}`}
                  >
                    {partner.status === "suspended"
                      ? "Reactivate Partner"
                      : "Suspend Partner"}
                  </ConfirmSubmitButton>
                </div>
              </form>
              {["suspended", "rejected"].includes(partner.status) ? (
                <RecordArchiveControl
                  kind="partner"
                  recordId={partner.id}
                  label={`${partner.first_name} ${partner.last_name}`}
                />
              ) : null}
              {partner.status === "approved" && partner.user_id ? (
                <PartnerAccessForm partnerId={partner.id} />
              ) : null}
            </RecordDisclosure>
          );
        })}
      </div>
    </RecordSection>
  );
}
