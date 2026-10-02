import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { LoginForm } from "@/components/referrals/login-form";
import { getApprovedPartner } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PartnerLoginPage() {
  if (await getApprovedPartner()) redirect("/partner");
  return (
    <section className="py-16">
      <PageContainer>
        <LoginForm />
      </PageContainer>
    </section>
  );
}
