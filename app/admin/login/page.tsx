import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminLoginForm } from "@/components/referrals/admin-login-form";
import { EmailLinkLoginForm } from "@/components/referrals/email-link-login-form";
import { emailLinksEnabled } from "@/lib/portal-auth/core";
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
        {emailLinksEnabled() ? <><EmailLinkLoginForm portal="admin" /><details className="mx-auto max-w-lg"><summary className="mb-3 cursor-pointer text-sm font-semibold">Use existing email and password login</summary><AdminLoginForm /></details></> : <AdminLoginForm />}
      </PageContainer>
    </section>
  );
}
