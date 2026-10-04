import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminLoginForm } from "@/components/referrals/admin-login-form";
import {
  getAdminAccessState,
  getUserReferralRole,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const role = await getUserReferralRole();
  if (role === "admin") {
    const admin = await getAdminAccessState();
    redirect(admin?.mustChangePassword ? "/admin/change-password" : "/admin");
  }
  if (role === "partner") redirect("/partner");
  return (
    <section className="py-16">
      <PageContainer>
        <AdminLoginForm />
      </PageContainer>
    </section>
  );
}
