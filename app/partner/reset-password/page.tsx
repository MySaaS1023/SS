import { PageContainer } from "@/components/page-container";
import { PartnerResetPasswordForm } from "@/components/referrals/partner-reset-password-form";

export const dynamic = "force-dynamic";
export default function PartnerResetPasswordPage() {
  return (
    <section className="py-16">
      <PageContainer>
        <PartnerResetPasswordForm />
      </PageContainer>
    </section>
  );
}
