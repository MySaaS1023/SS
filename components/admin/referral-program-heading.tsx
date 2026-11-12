"use client";

import { usePathname } from "next/navigation";

export function ReferralProgramHeading() {
  const pathname = usePathname();
  // Management sections retain their own existing page headings.
  if (pathname !== "/admin/referral-program") return null;
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Referral Program
      </h1>
    </header>
  );
}
