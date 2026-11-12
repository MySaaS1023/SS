import { PageContainer } from "@/components/page-container";
import { PartnerResetPasswordForm } from "@/components/referrals/partner-reset-password-form";
import { RecoveryPasswordForm } from "@/components/referrals/recovery-password-form";
import { recoveryEnabled } from "@/lib/partner-auth/recovery-core";

export const dynamic = "force-dynamic";
export default function PartnerResetPasswordPage() {
  return (
    <section className="py-16">
      <PageContainer>
        {recoveryEnabled() ? <RecoveryPasswordForm portal="partner" /> : <PartnerResetPasswordForm />}
      </PageContainer>
    </section>
  );
}
