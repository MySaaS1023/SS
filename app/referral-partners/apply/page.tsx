import type { Metadata } from "next";

import { PageContainer } from "@/components/page-container";
import { ReferralApplicationForm } from "@/components/referrals/referral-application-form";

export const metadata: Metadata = {
  title: "Become a Referral Partner | Steady Start",
};

export default function ReferralPartnerApplyPage() {
  return (
    <section className="py-14 sm:py-18">
      <PageContainer>
        <ReferralApplicationForm />
      </PageContainer>
    </section>
  );
}
