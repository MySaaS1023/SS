import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { PartnerRecords } from "@/components/admin/referral-records/partners";

export default async function PartnersPage() {
  await requirePrivateAdministrator();
  return <PartnerRecords standalone />;
}
