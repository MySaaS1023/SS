import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminResetPasswordForm } from "@/components/referrals/admin-reset-password-form";
import { getUserReferralRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminResetPasswordPage() {
  if ((await getUserReferralRole()) !== "admin")
    redirect("/admin/login?error=invalid-recovery-session");
  return (
    <section className="py-16">
      <PageContainer>
        <AdminResetPasswordForm />
      </PageContainer>
    </section>
  );
}
