import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { CommissionRecords } from "@/components/admin/referral-records/commissions";

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  await requirePrivateAdministrator();
  const { partner } = await searchParams;
  return <CommissionRecords standalone partnerId={partner} />;
}
