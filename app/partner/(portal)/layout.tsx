import { ReactNode } from "react";

import { PageContainer } from "@/components/page-container";
import { PartnerNav } from "@/components/referrals/partner-nav";
import { requirePartnerRecordAccess } from "@/lib/referrals/partner-record-access";

export const dynamic = "force-dynamic";

export default async function PartnerPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePartnerRecordAccess();
  return (
    <section className="py-10">
      <PageContainer>
        <PartnerNav />
        {children}
      </PageContainer>
    </section>
  );
}
