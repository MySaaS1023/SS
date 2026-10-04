import { PageContainer } from "@/components/page-container";
import { AdminResetPasswordForm } from "@/components/referrals/admin-reset-password-form";

export const dynamic = "force-dynamic";

export default function AdminResetPasswordPage() {
  return (
    <section className="py-16">
      <PageContainer>
        <AdminResetPasswordForm />
      </PageContainer>
    </section>
  );
}
