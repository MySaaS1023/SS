import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { PartnerChangePasswordForm } from "@/components/referrals/partner-change-password-form";
import { partnerMustChangePassword } from "@/lib/referrals/partner-access";
import { requireUser, getUserReferralRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PartnerChangePasswordPage() {
  const role = await getUserReferralRole();
  if (role === "admin") redirect("/admin");
  if (role !== "partner") redirect("/partner/login");
  const user = await requireUser();
  if (!user) redirect("/partner/login");
  if (!partnerMustChangePassword(user)) redirect("/partner");
  return (
    <section className="py-16">
      <PageContainer>
        <PartnerChangePasswordForm />
      </PageContainer>
    </section>
  );
}
