import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { PartnerNav } from "@/components/referrals/partner-nav";
import { getApprovedPartner } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PartnerPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await getApprovedPartner();
  if (!context) redirect("/partner/login");
  return (
    <section className="py-10">
      <PageContainer>
        <PartnerNav />
        {children}
      </PageContainer>
    </section>
  );
}
