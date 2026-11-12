import { CommissionRecords } from "@/components/admin/referral-records/commissions";

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string }>;
}) {
  const { partner } = await searchParams;
  return <CommissionRecords standalone partnerId={partner} />;
}
