import { PartnerSettingsForm } from "@/components/referrals/partner-settings-form";
import { getApprovedPartner } from "@/lib/supabase/server";

export default async function PartnerSettingsPage() {
  const context = (await getApprovedPartner())!;
  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Settings</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Keep contact and payout preferences current.
      </p>
      <PartnerSettingsForm partner={context.partner} />
    </div>
  );
}
