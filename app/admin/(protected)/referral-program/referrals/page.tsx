import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { ReferralRecords } from "@/components/admin/referral-records/referrals";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; q?: string | string[] }>;
}) {
  await requirePrivateAdministrator();
  const { partner, q } = await searchParams;
  return <ReferralRecords standalone partnerId={partner} query={q} />;
}
