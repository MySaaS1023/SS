import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { ApplicationRecords } from "@/components/admin/referral-records/applications";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ review?: string }>;
}) {
  await requirePrivateAdministrator();
  const { review } = await searchParams;
  return <ApplicationRecords standalone review={review} />;
}
