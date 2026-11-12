import { PartnerSettingsForm } from "@/components/referrals/partner-settings-form";
import { requirePartnerRecordAccess } from "@/lib/referrals/partner-record-access";

export default async function PartnerSettingsPage() {
  const context = await requirePartnerRecordAccess();
  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Settings</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Keep contact and payout preferences current.
      </p>
      <PartnerSettingsForm partner={{
        first_name: context.partner.first_name,
        last_name: context.partner.last_name,
        email: context.partner.email,
        phone: context.partner.phone,
        mailing_address: context.partner.mailing_address,
        payout_method: context.partner.payout_method,
        hasPayoutDetails: Boolean(context.partner.payout_details_encrypted),
      }} />
    </div>
  );
}
