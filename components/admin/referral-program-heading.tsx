"use client";

import { usePathname } from "next/navigation";

export function ReferralProgramHeading() {
  const pathname = usePathname();
  // Management sections retain their own existing page headings.
  if (pathname !== "/admin/referral-program") return null;
  return (
    <header className="mb-7">
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Referral Program
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300 sm:text-base">
        Manage your referral partners, applications, customer referrals,
        commissions, and resources.
      </p>
    </header>
  );
}
