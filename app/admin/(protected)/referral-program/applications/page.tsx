import { ApplicationRecords } from "@/components/admin/referral-records/applications";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ review?: string }>;
}) {
  const { review } = await searchParams;
  return <ApplicationRecords standalone review={review} />;
}
