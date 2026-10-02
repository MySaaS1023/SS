import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { LoginForm } from "@/components/referrals/login-form";
import { getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminUser()) redirect("/admin/referral-program");
  return (
    <section className="py-16">
      <PageContainer>
        <LoginForm admin />
      </PageContainer>
    </section>
  );
}
