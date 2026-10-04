import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminChangePasswordForm } from "@/components/referrals/admin-change-password-form";
import { getAdminAccessState } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminChangePasswordPage() {
  const admin = await getAdminAccessState();
  if (!admin) redirect("/admin/login");
  if (!admin.mustChangePassword) redirect("/admin");

  return (
    <section className="py-16">
      <PageContainer>
        <AdminChangePasswordForm />
      </PageContainer>
    </section>
  );
}
