import { PageContainer } from "@/components/page-container";
import { AdminForgotPasswordForm } from "@/components/referrals/admin-forgot-password-form";

export default function AdminForgotPasswordPage() {
  return (
    <section className="py-16">
      <PageContainer>
        <AdminForgotPasswordForm />
      </PageContainer>
    </section>
  );
}
