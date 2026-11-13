import { buildNoIndexMetadata } from "@/lib/seo";

import { PageContainer } from "@/components/page-container";
import { ReferralApplicationForm } from "@/components/referrals/referral-application-form";

export const metadata = buildNoIndexMetadata("Referral Partner Application | Steady Start LLC", "Apply to the Steady Start Referral Partner Program.");

export default function ReferralPartnerApplyPage() {
  return (
    <section className="py-14 sm:py-18">
      <PageContainer>
        <ReferralApplicationForm />
      </PageContainer>
    </section>
  );
}
