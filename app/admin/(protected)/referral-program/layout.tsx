import type { ReactNode } from "react";
import { ReferralSectionNavigation } from "@/components/admin/referral-section-navigation";

export default function ReferralProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <ReferralSectionNavigation />
      {children}
    </div>
  );
}
