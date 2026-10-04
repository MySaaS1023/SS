import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { PartnerNav } from "@/components/referrals/partner-nav";
import {
  getApprovedPartner,
  getUserReferralRole,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PartnerPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await getUserReferralRole();
  if (role === "admin") redirect("/admin");
  if (role !== "partner") redirect("/partner/login");
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
