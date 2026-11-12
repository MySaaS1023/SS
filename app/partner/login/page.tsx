import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { LoginForm } from "@/components/referrals/login-form";
import { RepresentativeAccessForm } from "@/components/referrals/representative-access-form";
import { passwordlessEnabled } from "@/lib/partner-auth/passwordless-core";
import { getUserReferralRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PartnerLoginPage() {
  const role = await getUserReferralRole();
  if (role === "admin") redirect("/admin");
  if (role === "partner") redirect("/partner");
  return (
    <section className="py-16">
      <PageContainer>
        {passwordlessEnabled() ? <><RepresentativeAccessForm /><details className="mx-auto max-w-lg"><summary className="mb-3 cursor-pointer text-sm font-semibold">Use existing email and password login</summary><LoginForm /></details></> : <LoginForm />}
      </PageContainer>
    </section>
  );
}
