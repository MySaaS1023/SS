import Link from "next/link";
import { ApplicationRecords } from "@/components/admin/referral-records/applications";
import { PartnerRecords } from "@/components/admin/referral-records/partners";
import { ReferralRecords } from "@/components/admin/referral-records/referrals";
import { CommissionRecords } from "@/components/admin/referral-records/commissions";

export default async function ReferralProgramPage({
  searchParams,
}: { searchParams?: Promise<{ q?: string | string[] }> }) {
  const query = (await searchParams)?.q;
  return (
    <div className="referral-management-list space-y-3">
      <ApplicationRecords />
      <PartnerRecords />
      <ReferralRecords query={query} />
      <CommissionRecords />
      <Link
        href="/admin/referral-program/resources"
        className="referral-resources-link flex min-h-12 items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
      >
        Partner Resources <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
