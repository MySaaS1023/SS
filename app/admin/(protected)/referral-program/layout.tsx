import type { ReactNode } from "react";
import { ReferralSectionNavigation } from "@/components/admin/referral-section-navigation";
import { ReferralProgramHeading } from "@/components/admin/referral-program-heading";

export default function ReferralProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <ReferralProgramHeading />
      <ReferralSectionNavigation />
      {children}
    </div>
  );
}
