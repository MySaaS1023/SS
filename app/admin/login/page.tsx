import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminLoginForm } from "@/components/referrals/admin-login-form";
import { getUserReferralRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const role = await getUserReferralRole();
  if (role === "admin") redirect("/admin");
  if (role === "partner") redirect("/partner");
  return (
    <section className="py-16">
      <PageContainer>
        <AdminLoginForm />
      </PageContainer>
    </section>
  );
}
